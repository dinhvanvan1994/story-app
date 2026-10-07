import {
  type DisplayNameError,
  validateDisplayName,
} from "./displayName";
import type {
  JoinIntent,
  Participant,
  PublicView,
  Room,
  RoomRejectionCode,
} from "../types/room";

type JoinIntentResult =
  | { accepted: true; room: Room }
  | { accepted: false; code: RoomRejectionCode; message: DisplayNameError };

const rejectionCodes: Record<DisplayNameError, RoomRejectionCode> = {
  "Enter a display name.": "display-name-empty",
  "Display name must be 24 characters or fewer.": "display-name-too-long",
  "Display name contains invalid characters.": "display-name-invalid-characters",
  "That display name is already used in this room.": "display-name-duplicate",
};

export function createRoom(
  roomCode: string,
  hostParticipantId: string,
  displayName: string,
): Room {
  const host: Participant = {
    id: hostParticipantId,
    displayName,
    role: "host",
  };

  return {
    code: roomCode,
    hostParticipantId,
    participants: [host],
    revision: 1,
  };
}

export function createPublicView(room: Room): PublicView {
  return {
    roomCode: room.code,
    hostParticipantId: room.hostParticipantId,
    participants: room.participants.map((participant) => ({ ...participant })),
    revision: room.revision,
  };
}

export function applyJoinIntent(room: Room, intent: JoinIntent): JoinIntentResult {
  const validation = validateDisplayName(
    intent.displayName,
    room.participants,
    intent.participantId,
  );

  if (!validation.ok) {
    return {
      accepted: false,
      code: rejectionCodes[validation.error],
      message: validation.error,
    };
  }

  if (room.participants.some(({ id }) => id === intent.participantId)) {
    return { accepted: true, room };
  }

  const guest: Participant = {
    id: intent.participantId,
    displayName: validation.value,
    role: "guest",
  };

  return {
    accepted: true,
    room: {
      ...room,
      participants: [...room.participants, guest],
      revision: room.revision + 1,
    },
  };
}

export function shouldApplyView(
  current: PublicView | null,
  incoming: PublicView,
): boolean {
  return current === null || incoming.revision > current.revision;
}
