import { useCallback, useEffect, useRef, useState } from "react";
import { validateDisplayName } from "../../domain/displayName";
import { normalizeRoomCode, validateRoomCode } from "../../domain/roomCode";
import { shouldApplyView } from "../../domain/roomReducer";
import { openRoomChannel, type RoomChannel } from "../../realtime/roomChannel";
import {
  clearParticipantSession,
  createParticipantId,
  writeParticipantSession,
  type ParticipantSession,
} from "../../storage/roomSession";
import type { JoinIntent, PublicView, Room } from "../../types/room";

interface GuestChannelAttempt {
  intent: JoinIntent;
  displayName: string;
  roomCode: string;
  isRefresh: boolean;
}

interface GuestRoomSession {
  room: Pick<Room, "code" | "participants"> | null;
  joining: boolean;
  reconnecting: boolean;
  joinError: string;
  roomCodeInput: string;
  setRoomCodeInput: (value: string) => void;
  joinRoom: (roomCode: string, displayName: string) => void;
}

function getRoomCodeFromUrl(): string {
  return normalizeRoomCode(
    new URLSearchParams(window.location.search).get("room") ?? "",
  );
}

function removeRoomCodeFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("room");
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function toRoomView(
  view: PublicView,
): Pick<Room, "code" | "participants"> {
  return { code: view.roomCode, participants: view.participants };
}

export function useGuestRoomSession(
  initialParticipantSession: ParticipantSession | null,
): GuestRoomSession {
  const refreshSession =
    initialParticipantSession?.role === "guest"
      ? initialParticipantSession
      : null;
  const [room, setRoom] = useState<Pick<Room, "code" | "participants"> | null>(
    null,
  );
  const [joining, setJoining] = useState(refreshSession !== null);
  const [reconnecting, setReconnecting] = useState(refreshSession !== null);
  const [joinError, setJoinError] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState(() =>
    refreshSession === null
      ? getRoomCodeFromUrl()
      : refreshSession.roomCode,
  );
  const [attempt, setAttempt] = useState<GuestChannelAttempt | null>(null);
  const attemptRef = useRef<GuestChannelAttempt | null>(null);
  const channelRef = useRef<RoomChannel | null>(null);
  const currentViewRef = useRef<PublicView | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const confirmedRef = useRef(false);
  const intentSentRef = useRef(false);
  const participantIdRef = useRef(
    initialParticipantSession?.role === "guest"
      ? initialParticipantSession.participantId
      : null,
  );
  const refreshAttemptStartedRef = useRef(false);

  const setAttemptActive = useCallback(
    (nextAttempt: GuestChannelAttempt | null) => {
      attemptRef.current = nextAttempt;
      setAttempt(nextAttempt);
    },
    [],
  );

  const finishAttempt = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAttemptActive(null);
    setJoining(false);
    setReconnecting(false);
  }, [setAttemptActive]);

  const confirmAttempt = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setJoining(false);
    setReconnecting(false);
  }, []);

  const confirmView = useCallback(
    (incoming: PublicView, guestSession: ParticipantSession) => {
      currentViewRef.current = incoming;
      writeParticipantSession(guestSession);
      setRoom(toRoomView(incoming));
      confirmAttempt();
      removeRoomCodeFromUrl();
    },
    [confirmAttempt],
  );

  const joinRoom = useCallback(
    (roomCode: string, displayName: string) => {
      if (attemptRef.current !== null || room !== null) {
        return;
      }

      setJoinError("");
      const codeValidation = validateRoomCode(roomCode);
      if (!codeValidation.ok) {
        setJoinError(codeValidation.error);
        return;
      }

      const nameValidation = validateDisplayName(displayName, []);
      if (!nameValidation.ok) {
        setJoinError(nameValidation.error);
        return;
      }

      const participantId =
        participantIdRef.current ?? createParticipantId();
      participantIdRef.current = participantId;
      const intent: JoinIntent = {
        type: "join",
        requestId: createParticipantId(),
        participantId,
        displayName: nameValidation.value,
      };
      const nextAttempt: GuestChannelAttempt = {
        intent,
        displayName: nameValidation.value,
        roomCode: codeValidation.value,
        isRefresh: false,
      };

      confirmedRef.current = false;
      intentSentRef.current = false;
      currentViewRef.current = null;
      setJoining(true);
      setReconnecting(false);
      setAttemptActive(nextAttempt);
      timeoutRef.current = window.setTimeout(() => {
        if (attemptRef.current !== nextAttempt) {
          return;
        }
        finishAttempt();
        setJoinError("Room not found or host is not reachable.");
      }, 5_000);
    },
    [finishAttempt, initialParticipantSession, room, setAttemptActive],
  );

  useEffect(() => {
    if (refreshSession === null || refreshAttemptStartedRef.current) {
      return;
    }
    refreshAttemptStartedRef.current = true;
    const intent: JoinIntent = {
      type: "join",
      requestId: createParticipantId(),
      participantId: refreshSession.participantId,
      displayName: refreshSession.displayName,
    };
    const refreshAttempt: GuestChannelAttempt = {
      intent,
      displayName: refreshSession.displayName,
      roomCode: refreshSession.roomCode,
      isRefresh: true,
    };
    confirmedRef.current = false;
    setAttemptActive(refreshAttempt);
    timeoutRef.current = window.setTimeout(() => {
      if (attemptRef.current !== refreshAttempt) {
        return;
      }
      clearParticipantSession();
      participantIdRef.current = null;
      finishAttempt();
      setJoinError("Room not found or host is not reachable.");
    }, 5_000);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      refreshAttemptStartedRef.current = false;
    };
  }, [finishAttempt, refreshSession, setAttemptActive]);

  useEffect(() => {
    if (attempt === null) {
      return;
    }

    let channel: RoomChannel;
    channel = openRoomChannel(attempt.roomCode, {
      onIntent: () => {},
      onState: ({ requestId, view }) => {
        if (
          channelRef.current !== channel ||
          attemptRef.current !== attempt
        ) {
          return;
        }

        if (!confirmedRef.current) {
          if (requestId !== attempt.intent.requestId) {
            return;
          }
          const ownParticipant = view.participants.find(
            ({ id }) => id === attempt.intent.participantId,
          );
          if (ownParticipant === undefined) {
            return;
          }
          confirmedRef.current = true;
          const guestSession: ParticipantSession = {
            participantId: ownParticipant.id,
            displayName: ownParticipant.displayName,
            roomCode: view.roomCode,
            role: "guest",
          };
          confirmView(view, guestSession);
          return;
        }

        if (shouldApplyView(currentViewRef.current, view)) {
          currentViewRef.current = view;
          setRoom(toRoomView(view));
        }
      },
      onRejected: ({ requestId, message }) => {
        if (
          channelRef.current !== channel ||
          attemptRef.current !== attempt ||
          confirmedRef.current ||
          requestId !== attempt.intent.requestId
        ) {
          return;
        }
        finishAttempt();
        setJoinError(message);
      },
      onStatus: (status) => {
        if (
          status === "SUBSCRIBED" &&
          channelRef.current === channel &&
          attemptRef.current === attempt &&
          !confirmedRef.current &&
          !intentSentRef.current
        ) {
          intentSentRef.current = true;
          void channel.sendIntent(attempt.intent).catch((error: unknown) => {
            console.error("Failed to send the room join Intent.", error);
          });
        }
      },
    });
    channelRef.current = channel;

    return () => {
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
      void channel.close().catch((error: unknown) => {
        console.error("Failed to close the room channel.", error);
      });
    };
  }, [attempt, confirmView, finishAttempt]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return {
    room,
    joining,
    reconnecting,
    joinError,
    roomCodeInput,
    setRoomCodeInput,
    joinRoom,
  };
}
