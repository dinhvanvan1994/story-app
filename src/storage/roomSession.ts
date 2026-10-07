import type {
  Participant,
  ParticipantRole,
  RoomState,
  VoteValue,
} from "../types/room";

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
    Object.keys(value).every((key) =>
      ["id", "displayName", "role"].includes(key),
    ) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.displayName === "string" &&
    value.displayName.length > 0 &&
    isParticipantRole(value.role)
  );
}

function isStoredVote(
  value: unknown,
): value is RoomState["votes"][number] {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) =>
      ["participantId", "value"].includes(key),
    ) &&
    typeof value.participantId === "string" &&
    value.participantId.length > 0 &&
    isVoteValue(value.value)
  );
}

function isPhase(value: unknown): value is RoomState["phase"] {
  return value === "waiting" || value === "voting" || value === "revealed";
}

function isVoteValue(value: unknown): value is VoteValue {
  return (
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 5 ||
    value === 8 ||
    value === 13 ||
    value === 21 ||
    value === "?"
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

function isRoom(value: unknown): value is RoomState {
  if (
    isRecord(value) &&
    typeof value.code === "string" &&
    value.code.length > 0 &&
    typeof value.hostParticipantId === "string" &&
    value.hostParticipantId.length > 0 &&
    Array.isArray(value.participants) &&
    value.participants.every(isParticipant) &&
    typeof value.revision === "number" &&
    Number.isInteger(value.revision) &&
    value.revision >= 1 &&
    isPhase(value.phase) &&
    Array.isArray(value.votes) &&
    value.votes.every(isStoredVote) &&
    (value.story === null ||
      (isRecord(value.story) &&
        Object.keys(value.story).every((key) => key === "title") &&
        (value.story.title === null || typeof value.story.title === "string")))
  ) {
    const participantIds = value.participants.map(
      (participant) => participant.id,
    );
    const voteIds = value.votes.map((vote) => vote.participantId);
    const host = value.participants.find(
      (participant) => participant.id === value.hostParticipantId,
    );
    return (
      host?.role === "host" &&
      value.participants.filter(({ role }) => role === "host").length === 1 &&
      new Set(participantIds).size === participantIds.length &&
      new Set(voteIds).size === voteIds.length &&
      voteIds.every((id: string) => participantIds.includes(id)) &&
      (value.phase === "waiting"
        ? value.story === null && voteIds.length === 0
        : value.story !== null) &&
      (value.phase !== "revealed" || voteIds.length > 0)
    );
  }
  return false;
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

export function readHostRoom(storage?: Storage): RoomState | null {
  return readStoredValue(HOST_ROOM_STORAGE_KEY, isRoom, storage);
}

export function writeHostRoom(
  room: RoomState,
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
