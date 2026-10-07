import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyJoinIntent,
  createRoom as createRoomState,
} from "../../domain/roomReducer";
import { createPublicView, reduceRoom } from "../../domain/room";
import { validateDisplayName } from "../../domain/displayName";
import { generateRoomCode } from "../../domain/roomCode";
import { openRoomChannel, type RoomChannel } from "../../realtime/roomChannel";
import {
  clearRoomSession,
  createParticipantId,
  readHostRoom,
  readParticipantSession,
  writeHostRoom,
  writeParticipantSession,
  type ParticipantSession,
} from "../../storage/roomSession";
import {
  HOST_CONNECTION_ERROR,
  type RoomAction,
  type Room,
  type RoomIntentPayload,
  type RoomRejectedPayload,
  type VoteCastIntent,
  type VoteValue,
} from "../../types/room";

export interface InitialHostSession {
  participantSession: ParticipantSession | null;
  hostRoom: Room | null;
}

interface HostChannelRequest {
  room: Room;
  participantSession: ParticipantSession;
  restore: boolean;
}

interface HostRoomSession {
  room: Room | null;
  connecting: boolean;
  createError: string;
  revealError: string;
  createRoom: (displayName: string) => void;
  startStory: (title: string) => void;
  castVote: (value: VoteValue) => void;
  revealVotes: () => void;
  nextStory: () => void;
}

export function readInitialHostSession(): InitialHostSession {
  const participantSession = readParticipantSession();
  return {
    participantSession,
    hostRoom:
      participantSession?.role === "host" ? readHostRoom() : null,
  };
}

export function useHostRoomSession(
  initialSession: InitialHostSession,
): HostRoomSession {
  const isStoredHost = initialSession.participantSession?.role === "host";
  const hasInvalidHostRoom = isStoredHost && initialSession.hostRoom === null;
  const [room, setRoom] = useState<Room | null>(
    () => initialSession.hostRoom,
  );
  const [channelRequest, setChannelRequest] =
    useState<HostChannelRequest | null>(() => {
      const participantSession = initialSession.participantSession;
      const hostRoom = initialSession.hostRoom;
      if (participantSession?.role !== "host" || hostRoom === null) {
        return null;
      }
      return {
        room: hostRoom,
        participantSession,
        restore: true,
      };
    });
  const [connecting, setConnecting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [revealError, setRevealError] = useState("");
  const roomRef = useRef(room);
  const channelRef = useRef<RoomChannel | null>(null);
  const channelRequestRef = useRef(channelRequest);
  const createTimeoutRef = useRef<number | null>(null);
  const connectingRef = useRef(false);

  const updateRoom = useCallback((nextRoom: Room | null) => {
    roomRef.current = nextRoom;
    setRoom(nextRoom);
  }, []);

  const dispatchAction = useCallback((action: RoomAction) => {
    const currentRoom = roomRef.current;
    if (currentRoom === null) {
      return;
    }
    const result = reduceRoom(currentRoom, action);
    if (!result.changed) {
      setRevealError(result.error ?? "");
      return;
    }
    setRevealError("");
    updateRoom(result.room);
    writeHostRoom(result.room);
    const channel = channelRef.current;
    if (channel !== null) {
      void channel.sendState(createPublicView(result.room)).catch(
        (error: unknown) => {
          console.error("Failed to broadcast the updated Room view.", error);
        },
      );
    }
  }, [updateRoom]);

  const startStory = useCallback(
    (title: string) => {
      const hostParticipantId = roomRef.current?.hostParticipantId;
      if (hostParticipantId !== undefined) {
        dispatchAction({
          type: "STORY_STARTED",
          actorParticipantId: hostParticipantId,
          title,
        });
      }
    },
    [dispatchAction],
  );

  const castVote = useCallback(
    (value: VoteValue) => {
      const hostParticipantId = roomRef.current?.hostParticipantId;
      if (hostParticipantId !== undefined) {
        dispatchAction({
          type: "VOTE_CAST",
          actorParticipantId: hostParticipantId,
          value,
        });
      }
    },
    [dispatchAction],
  );

  const revealVotes = useCallback(() => {
    const hostParticipantId = roomRef.current?.hostParticipantId;
    if (hostParticipantId !== undefined) {
      dispatchAction({
        type: "VOTES_REVEALED",
        actorParticipantId: hostParticipantId,
      });
    }
  }, [dispatchAction]);

  const nextStory = useCallback(() => {
    const hostParticipantId = roomRef.current?.hostParticipantId;
    if (hostParticipantId !== undefined) {
      dispatchAction({
        type: "NEXT_STORY",
        actorParticipantId: hostParticipantId,
      });
    }
  }, [dispatchAction]);

  const createRoom = useCallback((displayName: string) => {
    if (connectingRef.current || roomRef.current !== null) {
      return;
    }

    setCreateError("");
    const validation = validateDisplayName(displayName, []);
    if (!validation.ok) {
      setCreateError(validation.error);
      return;
    }

    const participantId = createParticipantId();
    const roomCode = generateRoomCode();
    const newRoom = createRoomState(roomCode, participantId, validation.value);
    const participantSession: ParticipantSession = {
      participantId,
      displayName: validation.value,
      roomCode,
      role: "host",
    };
    const request: HostChannelRequest = {
      room: newRoom,
      participantSession,
      restore: false,
    };

    connectingRef.current = true;
    setConnecting(true);
    channelRequestRef.current = request;
    setChannelRequest(request);
    createTimeoutRef.current = window.setTimeout(() => {
      if (channelRequestRef.current !== request || roomRef.current !== null) {
        return;
      }
      channelRequestRef.current = null;
      setChannelRequest(null);
      connectingRef.current = false;
      setConnecting(false);
      setCreateError(HOST_CONNECTION_ERROR);
    }, 10_000);
  }, []);

  useEffect(() => {
    if (hasInvalidHostRoom) {
      clearRoomSession();
    }
  }, [hasInvalidHostRoom]);

  useEffect(() => {
    if (channelRequest === null) {
      return;
    }

    let channel: RoomChannel;
    let subscribed = false;
    let sentRestoredView = false;
    const isCurrent = () =>
      channelRef.current === channel &&
      channelRequestRef.current === channelRequest;
    const enqueueHostIntent = createIntentProcessor(
      () => channel,
      channelRef,
      roomRef,
      updateRoom,
    );

    channel = openRoomChannel(channelRequest.room.code, {
      onIntent: enqueueHostIntent,
      onState: () => {},
      onRejected: () => {},
      onStatus: (status) => {
        if (status !== "SUBSCRIBED" || !isCurrent()) {
          return;
        }
        subscribed = true;

        if (channelRequest.restore) {
          if (!sentRestoredView) {
            sentRestoredView = true;
            void channel.sendState(createPublicView(channelRequest.room)).catch(
              (error: unknown) => {
                console.error("Failed to broadcast the restored Room view.", error);
              },
            );
          }
          return;
        }

        if (roomRef.current !== null) {
          return;
        }
        if (createTimeoutRef.current !== null) {
          window.clearTimeout(createTimeoutRef.current);
          createTimeoutRef.current = null;
        }
        writeParticipantSession(channelRequest.participantSession);
        writeHostRoom(channelRequest.room);
        updateRoom(channelRequest.room);
        connectingRef.current = false;
        setConnecting(false);
      },
    });
    channelRef.current = channel;

    if (subscribed && channelRequest.restore && !sentRestoredView) {
      sentRestoredView = true;
      void channel.sendState(createPublicView(channelRequest.room)).catch(
        (error: unknown) => {
          console.error("Failed to broadcast the restored Room view.", error);
        },
      );
    }

    return () => {
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
      void channel.close().catch((error: unknown) => {
        console.error("Failed to close the room channel.", error);
      });
    };
  }, [channelRequest, updateRoom]);

  useEffect(
    () => () => {
      if (createTimeoutRef.current !== null) {
        window.clearTimeout(createTimeoutRef.current);
      }
      connectingRef.current = false;
    },
    [],
  );

  return {
    room,
    connecting,
    createError,
    revealError,
    createRoom,
    startStory,
    castVote,
    revealVotes,
    nextStory,
  };
}

function createIntentProcessor(
  getChannel: () => RoomChannel,
  channelRef: React.RefObject<RoomChannel | null>,
  roomRef: React.RefObject<Room | null>,
  updateRoom: (room: Room) => void,
): (payload: RoomIntentPayload) => void {
  let intentQueue = Promise.resolve();

  return (payload) => {
    intentQueue = intentQueue
      .then(async () => {
        const channel = getChannel();
        if (channelRef.current !== channel || roomRef.current === null) {
          return;
        }

        const currentRoom = roomRef.current;
        const intent = payload.intent;
        if (intent.type === "join") {
          const result = applyJoinIntent(currentRoom, intent);
          if (!result.accepted) {
            const rejection: RoomRejectedPayload = {
              requestId: intent.requestId,
              code: result.code,
              message: result.message,
            };
            await channel.sendRejected(rejection);
            return;
          }

          if (result.room !== currentRoom) {
            updateRoom(result.room);
            writeHostRoom(result.room);
          }
          await channel.sendState(
            createPublicView(result.room),
            intent.requestId,
          );
          return;
        }

        const voteIntent = intent satisfies VoteCastIntent;
        const result = reduceRoom(currentRoom, {
          type: "VOTE_CAST",
          actorParticipantId: voteIntent.participantId,
          requestId: voteIntent.requestId,
          value: voteIntent.value,
        });
        if (!result.changed) {
          return;
        }
        updateRoom(result.room);
        writeHostRoom(result.room);
        await channel.sendState(
          createPublicView(result.room),
          voteIntent.requestId,
        );
      })
      .catch((error: unknown) => {
        console.error("Failed to process a room Intent.", error);
      });
  };
}
