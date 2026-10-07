import { describe, expect, it } from "vitest";
import {
  applyJoinIntent,
  createPublicView,
  createRoom,
  shouldApplyView,
} from "./roomReducer";
import { validateDisplayName } from "./displayName";
import type { JoinIntent, Participant, PublicView } from "../types/room";

const joinIntent = (
  participantId: string,
  displayName: string,
  requestId = "r1",
): JoinIntent => ({
  type: "join",
  requestId,
  participantId,
  displayName,
});

const roomWithHost = () => createRoom("A7K9Q2", "host-1", "Maya Chen");

describe("room reducer domain", () => {
  it("US-001 TC-001-03 creates a room and its public view", () => {
    const room = createRoom("A7K9Q2", "host-1", "Maya Chen");
    const view = createPublicView(room);

    expect(room).toEqual({
      code: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
      ],
      revision: 1,
    });
    expect(Object.keys(view)).toEqual([
      "roomCode",
      "hostParticipantId",
      "participants",
      "revision",
    ]);
    expect(view).toEqual({
      roomCode: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
      ],
      revision: 1,
    });
  });

  it("US-001 TC-001-05 accepts a new guest and appends the participant", () => {
    const room = roomWithHost();
    const result = applyJoinIntent(room, joinIntent("guest-1", "Noah Patel"));

    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.room.participants).toEqual([
        { id: "host-1", displayName: "Maya Chen", role: "host" },
        { id: "guest-1", displayName: "Noah Patel", role: "guest" },
      ]);
    }
  });

  it("US-001 TC-001-12 rejects a duplicate name without changing the room", () => {
    const room = createRoom("A7K9Q2", "host-1", "Maya Chen");
    const guest = applyJoinIntent(room, joinIntent("guest-1", "Noah Patel"));
    expect(guest.accepted).toBe(true);
    if (!guest.accepted) {
      return;
    }

    const originalRoom = guest.room;
    expect(
      validateDisplayName("Noah Patel", originalRoom.participants),
    ).toEqual({
      ok: false,
      error: "That display name is already used in this room.",
    });
    const result = applyJoinIntent(
      originalRoom,
      joinIntent("guest-2", "Noah Patel", "r2"),
    );

    expect(result).toEqual({
      accepted: false,
      code: "display-name-duplicate",
      message: "That display name is already used in this room.",
    });
    expect(originalRoom.participants).toHaveLength(2);
  });

  it("US-001 TC-001-33 treats rejoining with the same ID as idempotent", () => {
    const room = roomWithHost();
    const joined = applyJoinIntent(room, joinIntent("guest-1", "Noah Patel"));
    expect(joined.accepted).toBe(true);
    if (!joined.accepted) {
      return;
    }

    const rejoined = applyJoinIntent(
      joined.room,
      joinIntent("guest-1", "Noah Patel", "r2"),
    );
    const rejoinedWithDifferentName = applyJoinIntent(
      joined.room,
      joinIntent("guest-1", "Other Name", "r3"),
    );

    expect(rejoined).toEqual({ accepted: true, room: joined.room });
    expect(rejoinedWithDifferentName).toEqual({
      accepted: true,
      room: joined.room,
    });
    expect(joined.room.participants).toHaveLength(2);
    expect(
      joined.room.participants.find(({ id }) => id === "guest-1")?.displayName,
    ).toBe("Noah Patel");
  });

  it("US-001 TC-001-43 increments revisions only for accepted changes", () => {
    const room = roomWithHost();
    expect(room.revision).toBe(1);

    const added = applyJoinIntent(room, joinIntent("guest-1", "Noah Patel"));
    expect(added.accepted).toBe(true);
    if (!added.accepted) {
      return;
    }
    expect(added.room.revision).toBe(2);

    const rejoined = applyJoinIntent(
      added.room,
      joinIntent("guest-1", "Other Name", "r2"),
    );
    expect(rejoined).toEqual({ accepted: true, room: added.room });

    const duplicate = applyJoinIntent(
      added.room,
      joinIntent("guest-2", "Noah Patel", "r3"),
    );
    expect(duplicate.accepted).toBe(false);
    expect(added.room.revision).toBe(2);
    expect(added.room.participants).toHaveLength(2);
    expect(createPublicView(added.room).revision).toBe(2);
  });

  it("US-001 TC-001-44 applies only first or strictly newer public views", () => {
    const participants: Participant[] = [
      { id: "host-1", displayName: "Maya Chen", role: "host" },
    ];
    const view = (revision: number): PublicView => ({
      roomCode: "A7K9Q2",
      hostParticipantId: "host-1",
      participants,
      revision,
    });

    expect(shouldApplyView(null, view(1))).toBe(true);
    expect(shouldApplyView(view(2), view(3))).toBe(true);
    expect(shouldApplyView(view(3), view(2))).toBe(false);
    expect(shouldApplyView(view(3), view(3))).toBe(false);
  });
});
