import type { Participant, ParticipantRole, Room } from "../types/room";

export const PARTICIPANT_STORAGE_KEY = "story-app:participant";
export const HOST_ROOM_STORAGE_KEY = "story-app:host-room";

export interface ParticipantSession {
  participantId: string;
  displayName: string;
  roomCode: string;
  role: ParticipantRole;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isParticipantRole(value: unknown): value is ParticipantRole {
  return value === "host" || value === "guest";
}

function isParticipant(value: unknown): value is Participant {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.displayName === "string" &&
    value.displayName.length > 0 &&
    isParticipantRole(value.role)
  );
}

function isParticipantSession(value: unknown): value is ParticipantSession {
  return (
    isRecord(value) &&
    typeof value.participantId === "string" &&
    value.participantId.length > 0 &&
    typeof value.displayName === "string" &&
    value.displayName.length > 0 &&
    typeof value.roomCode === "string" &&
    value.roomCode.length > 0 &&
    isParticipantRole(value.role)
  );
}

function isRoom(value: unknown): value is Room {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    value.code.length > 0 &&
    typeof value.hostParticipantId === "string" &&
    value.hostParticipantId.length > 0 &&
    Array.isArray(value.participants) &&
    value.participants.every(isParticipant) &&
    typeof value.revision === "number" &&
    Number.isInteger(value.revision) &&
    value.revision >= 1
  );
}

function readStoredValue<T>(
  key: string,
  isExpectedShape: (value: unknown) => value is T,
  storage?: Storage,
): T | null {
  try {
    const storedValue = (storage ?? sessionStorage).getItem(key);
    if (storedValue === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(storedValue);
    return isExpectedShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readParticipantSession(
  storage?: Storage,
): ParticipantSession | null {
  return readStoredValue(
    PARTICIPANT_STORAGE_KEY,
    isParticipantSession,
    storage,
  );
}

export function writeParticipantSession(
  participant: ParticipantSession,
  storage: Storage = sessionStorage,
): void {
  storage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(participant));
}

export function readHostRoom(storage?: Storage): Room | null {
  return readStoredValue(HOST_ROOM_STORAGE_KEY, isRoom, storage);
}

export function writeHostRoom(
  room: Room,
  storage: Storage = sessionStorage,
): void {
  storage.setItem(HOST_ROOM_STORAGE_KEY, JSON.stringify(room));
}

export function clearRoomSession(storage: Storage = sessionStorage): void {
  storage.removeItem(PARTICIPANT_STORAGE_KEY);
  storage.removeItem(HOST_ROOM_STORAGE_KEY);
}

export function clearParticipantSession(storage: Storage = sessionStorage): void {
  storage.removeItem(PARTICIPANT_STORAGE_KEY);
}

export function createParticipantId(): string {
  return crypto.randomUUID();
}
