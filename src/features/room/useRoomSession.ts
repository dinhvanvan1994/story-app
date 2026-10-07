import { useState } from "react";
import { useGuestRoomSession } from "./useGuestRoomSession";
import {
  readInitialHostSession,
  useHostRoomSession,
} from "./useHostRoomSession";
import type { ParticipantSession } from "../../storage/roomSession";
import type { Participant } from "../../types/room";

interface RoomViewState {
  roomCode: string;
  participants: Participant[];
}

export interface RoomSession {
  room: RoomViewState | null;
  connecting: boolean;
  createError: string;
  createRoom: (displayName: string) => void;
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

  const room: RoomViewState | null =
    hostSession.room === null
      ? guestSession.room === null
        ? null
        : {
            roomCode: guestSession.room.code,
            participants: guestSession.room.participants,
          }
      : {
          roomCode: hostSession.room.code,
          participants: hostSession.room.participants,
        };

  return {
    room,
    connecting: hostSession.connecting,
    createError: hostSession.createError,
    createRoom: hostSession.createRoom,
    joining: guestSession.joining,
    reconnecting: guestSession.reconnecting,
    joinError: guestSession.joinError,
    roomCodeInput: guestSession.roomCodeInput,
    setRoomCodeInput: guestSession.setRoomCodeInput,
    joinRoom: guestSession.joinRoom,
  };
}
