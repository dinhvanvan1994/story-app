import type {
  JoinIntent,
  Participant,
  PublicView,
  RoomIntentPayload,
  RoomRejectedPayload,
  RoomRejectionCode,
  RoomStatePayload,
} from "../types/room";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isParticipantRole(value: unknown): value is Participant["role"] {
  return value === "host" || value === "guest";
}

function isParticipant(value: unknown): value is Participant {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.displayName) &&
    isParticipantRole(value.role)
  );
}

function isJoinIntent(value: unknown): value is JoinIntent {
  return (
    isRecord(value) &&
    value.type === "join" &&
    isNonEmptyString(value.requestId) &&
    isNonEmptyString(value.participantId) &&
    isNonEmptyString(value.displayName)
  );
}

function isPublicView(value: unknown): value is PublicView {
  return (
    isRecord(value) &&
    isNonEmptyString(value.roomCode) &&
    isNonEmptyString(value.hostParticipantId) &&
    Array.isArray(value.participants) &&
    value.participants.every(isParticipant) &&
    typeof value.revision === "number" &&
    Number.isInteger(value.revision) &&
    value.revision >= 1
  );
}

function isRoomRejectionCode(value: unknown): value is RoomRejectionCode {
  return (
    value === "display-name-empty" ||
    value === "display-name-too-long" ||
    value === "display-name-invalid-characters" ||
    value === "display-name-duplicate"
  );
}

export function isRoomIntentPayload(
  value: unknown,
): value is RoomIntentPayload {
  return isRecord(value) && isJoinIntent(value.intent);
}

export function isRoomStatePayload(value: unknown): value is RoomStatePayload {
  return (
    isRecord(value) &&
    (value.requestId === undefined || isNonEmptyString(value.requestId)) &&
    isPublicView(value.view)
  );
}

export function isRoomRejectedPayload(
  value: unknown,
): value is RoomRejectedPayload {
  return (
    isRecord(value) &&
    isNonEmptyString(value.requestId) &&
    isRoomRejectionCode(value.code) &&
    isNonEmptyString(value.message)
  );
}
