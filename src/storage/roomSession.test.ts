import { describe, expect, it } from "vitest";
import {
  clearRoomSession,
  HOST_ROOM_STORAGE_KEY,
  PARTICIPANT_STORAGE_KEY,
  readHostRoom,
  readParticipantSession,
  writeHostRoom,
  writeParticipantSession,
  type ParticipantSession,
} from "./roomSession";
import type { Room } from "../types/room";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("room session storage", () => {
  // TC-001-48
  it("US-001 TC-001-48 returns null for unreadable records and round-trips valid values", () => {
    const storage = new MemoryStorage();

    expect(readParticipantSession(storage)).toBeNull();
    expect(readHostRoom(storage)).toBeNull();

    storage.setItem(PARTICIPANT_STORAGE_KEY, "{invalid json");
    storage.setItem(HOST_ROOM_STORAGE_KEY, "{invalid json");
    expect(readParticipantSession(storage)).toBeNull();
    expect(readHostRoom(storage)).toBeNull();

    storage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify({ role: "host" }));
    storage.setItem(
      HOST_ROOM_STORAGE_KEY,
      JSON.stringify({ code: "A7K9Q2", participants: "not-an-array" }),
    );
    expect(readParticipantSession(storage)).toBeNull();
    expect(readHostRoom(storage)).toBeNull();

    const participant: ParticipantSession = {
      participantId: "guest-1",
      displayName: "Noah Patel",
      roomCode: "A7K9Q2",
      role: "guest",
    };
    const room: Room = {
      code: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
      ],
      revision: 1,
      phase: "waiting",
      story: null,
      votes: [],
    };

    writeParticipantSession(participant, storage);
    writeHostRoom(room, storage);
    expect(readParticipantSession(storage)).toEqual(participant);
    expect(readHostRoom(storage)).toEqual(room);

    clearRoomSession(storage);
    expect(storage.getItem(PARTICIPANT_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(HOST_ROOM_STORAGE_KEY)).toBeNull();
    expect(readParticipantSession(storage)).toBeNull();
    expect(readHostRoom(storage)).toBeNull();
  });

  // TC-002-22
  it("US-002 TC-002-22 persists the complete Round in the Host snapshot", () => {
    const storage = new MemoryStorage();
    const room: Room = {
      code: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
        { id: "guest-1", displayName: "Noah Patel", role: "guest" },
      ],
      revision: 5,
      phase: "voting",
      story: { title: "Checkout flow" },
      votes: [{ participantId: "guest-1", value: "?" }],
    };

    writeHostRoom(room, storage);

    expect(readHostRoom(storage)).toEqual(room);
    expect(JSON.parse(storage.getItem(HOST_ROOM_STORAGE_KEY) ?? "null")).toEqual(
      room,
    );
  });
});
