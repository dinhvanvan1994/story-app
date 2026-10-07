import { useState } from "react";
import { createPublicView } from "../../domain/room";
import { useGuestRoomSession } from "./useGuestRoomSession";
import {
  readInitialHostSession,
  useHostRoomSession,
} from "./useHostRoomSession";
import type { ParticipantSession } from "../../storage/roomSession";
import type {
  Participant,
  PublicVote,
  Room,
  Story,
  VoteValue,
} from "../../types/room";

export interface RoomViewState {
  roomCode: string;
  participants: Participant[];
  phase: Room["phase"];
  story: Story | null;
  votes: PublicVote[];
  ownVote: VoteValue | null;
  participantId: string;
  isHost: boolean;
}

export interface RoomSession {
  room: RoomViewState | null;
  connecting: boolean;
  createError: string;
  createRoom: (displayName: string) => void;
  startStory: (title: string) => void;
  castVote: (value: VoteValue) => void;
  revealVotes: () => void;
  nextStory: () => void;
  revealError: string;
  joining: boolean;
  reconnecting: boolean;
  joinError: string;
  roomCodeInput: string;
  setRoomCodeInput: (value: string) => void;
  joinRoom: (roomCode: string, displayName: string) => void;
}

export function useRoomSession(): RoomSession {
  const [initialHostSession] = useState(readInitialHostSession);
  const [initialParticipantSession] = useState<ParticipantSession | null>(
    () => initialHostSession.participantSession,
  );
  const hostSession = useHostRoomSession(initialHostSession);
  const guestSession = useGuestRoomSession(initialParticipantSession);

  const room: RoomViewState | null = hostSession.room !== null
    ? (() => {
        const publicView = createPublicView(hostSession.room);
        const ownVote =
          hostSession.room.votes.find(
            ({ participantId }) =>
              participantId === hostSession.room?.hostParticipantId,
          )?.value ?? null;
        return {
          roomCode: hostSession.room.code,
          participants: publicView.participants,
          phase: publicView.phase,
          story: publicView.story,
          votes: publicView.votes,
          ownVote,
          participantId: hostSession.room.hostParticipantId,
          isHost: true,
        };
      })()
    : guestSession.room === null
      ? null
      : {
          roomCode: guestSession.room.roomCode,
          participants: guestSession.room.participants,
          phase: guestSession.room.phase,
          story: guestSession.room.story,
          votes: guestSession.room.votes,
          ownVote: guestSession.ownVote,
          participantId: guestSession.participantId ?? "",
          isHost: false,
        };

  return {
    room,
    connecting: hostSession.connecting,
    createError: hostSession.createError,
    createRoom: hostSession.createRoom,
    startStory: hostSession.startStory,
    castVote: hostSession.room === null
      ? guestSession.castVote
      : hostSession.castVote,
    revealVotes: hostSession.revealVotes,
    nextStory: hostSession.nextStory,
    revealError: hostSession.revealError,
    joining: guestSession.joining,
    reconnecting: guestSession.reconnecting,
    joinError: guestSession.joinError,
    roomCodeInput: guestSession.roomCodeInput,
    setRoomCodeInput: guestSession.setRoomCodeInput,
    joinRoom: guestSession.joinRoom,
  };
}
