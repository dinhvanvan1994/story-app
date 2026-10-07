import { describe, expect, it } from "vitest";
import {
  createPublicView,
  normalizeStoryTitle,
  reduceRoom,
  shouldApplyView,
} from "./room";
import { createRoom } from "./roomReducer";
import type { Room, VoteValue } from "../types/room";

const votingRoom = (votes: Room["votes"] = []): Room => ({
  ...createRoom("A7K9Q2", "host-1", "Maya Chen"),
  participants: [
    { id: "host-1", displayName: "Maya Chen", role: "host" },
    { id: "guest-1", displayName: "Noah Patel", role: "guest" },
  ],
  revision: 4,
  phase: "voting",
  story: { title: "Checkout flow" },
  votes,
});

describe("US-002 Room rules", () => {
  // TC-002-02
  it("US-002 TC-002-02 normalizes omitted, empty, and whitespace-only Story titles", () => {
    expect(normalizeStoryTitle(null)).toBeNull();
    expect(normalizeStoryTitle("")).toBeNull();
    expect(normalizeStoryTitle("   ")).toBeNull();
    expect(normalizeStoryTitle("  Checkout flow  ")).toBe("Checkout flow");
  });

  // TC-002-03
  it("US-002 TC-002-03 accepts every value on the fixed Fibonacci scale", () => {
    const values: VoteValue[] = [0, 1, 2, 3, 5, 8, 13, 21, "?"];
    for (const value of values) {
      const result = reduceRoom(votingRoom(), {
        type: "VOTE_CAST",
        actorParticipantId: "guest-1",
        value,
      });
      expect(result.changed).toBe(true);
      expect(result.room.votes).toEqual([{ participantId: "guest-1", value }]);
    }
  });

  // TC-002-05
  it("US-002 TC-002-05 replaces a Participant's Vote and increments revision", () => {
    const room = votingRoom([{ participantId: "guest-1", value: 3 }]);
    const result = reduceRoom(room, {
      type: "VOTE_CAST",
      actorParticipantId: "guest-1",
      value: 8,
    });
    expect(result.room.votes).toEqual([
      { participantId: "guest-1", value: 8 },
    ]);
    expect(result.room.revision).toBe(room.revision + 1);

    const repeated = reduceRoom(result.room, {
      type: "VOTE_CAST",
      actorParticipantId: "guest-1",
      value: 8,
    });
    expect(repeated).toEqual({ room: result.room, changed: false });
  });

  // TC-002-07
  it("US-002 TC-002-07 hides every Vote value from the Public view before Reveal", () => {
    const view = createPublicView(
      votingRoom([
        { participantId: "host-1", value: 5 },
        { participantId: "guest-1", value: "?" },
      ]),
    );
    expect(view.votes).toEqual([
      { participantId: "host-1", hasVoted: true },
      { participantId: "guest-1", hasVoted: true },
    ]);
    expect(JSON.stringify(view)).not.toContain('"value"');
    expect(JSON.stringify(view)).not.toContain('"?"');
  });

  // TC-002-10
  it("US-002 TC-002-10 lets the Host Reveal when a Vote exists", () => {
    const room = votingRoom([{ participantId: "guest-1", value: 8 }]);
    const result = reduceRoom(room, {
      type: "VOTES_REVEALED",
      actorParticipantId: "host-1",
    });
    expect(result.changed).toBe(true);
    expect(result.room.phase).toBe("revealed");
    expect(result.room.revision).toBe(room.revision + 1);
    expect(createPublicView(result.room).votes).toContainEqual({
      participantId: "guest-1",
      hasVoted: true,
      value: 8,
    });
  });

  // TC-002-11
  it("US-002 TC-002-11 rejects Reveal when there are no Votes", () => {
    const room = votingRoom();
    const result = reduceRoom(room, {
      type: "VOTES_REVEALED",
      actorParticipantId: "host-1",
    });
    expect(result).toEqual({
      room,
      changed: false,
      error: "At least one vote is required to reveal",
    });
  });

  // TC-002-13
  it("US-002 TC-002-13 rejects Guest Host-only actions and preserves Room state", () => {
    const waitingRoom = { ...votingRoom(), phase: "waiting" as const, story: null };
    const voting = votingRoom([{ participantId: "guest-1", value: 2 }]);
    const revealed = { ...voting, phase: "revealed" as const };
    const start = reduceRoom(waitingRoom, {
      type: "STORY_STARTED",
      actorParticipantId: "guest-1",
      title: "New story",
    });
    const reveal = reduceRoom(voting, {
      type: "VOTES_REVEALED",
      actorParticipantId: "guest-1",
    });
    const next = reduceRoom(revealed, {
      type: "NEXT_STORY",
      actorParticipantId: "guest-1",
    });
    expect(start).toEqual({ room: waitingRoom, changed: false });
    expect(reveal).toEqual({ room: voting, changed: false });
    expect(next).toEqual({ room: revealed, changed: false });
  });

  // TC-002-15
  it("US-002 TC-002-15 ignores a Vote cast after Reveal", () => {
    const room = {
      ...votingRoom([{ participantId: "guest-1", value: 5 }]),
      phase: "revealed" as const,
    };
    expect(
      reduceRoom(room, {
        type: "VOTE_CAST",
        actorParticipantId: "guest-1",
        value: 13,
      }),
    ).toEqual({ room, changed: false });
  });

  // TC-002-17
  it("US-002 TC-002-17 clears Story and Votes when the Host selects Next story", () => {
    const room = {
      ...votingRoom([{ participantId: "guest-1", value: 5 }]),
      phase: "revealed" as const,
    };
    const result = reduceRoom(room, {
      type: "NEXT_STORY",
      actorParticipantId: "host-1",
    });
    expect(result.room).toMatchObject({
      phase: "waiting",
      story: null,
      votes: [],
      revision: room.revision + 1,
    });
  });

  // TC-002-20
  it("US-002 TC-002-20 applies only absent or strictly newer Public views", () => {
    const current = createPublicView(votingRoom());
    expect(shouldApplyView(null, current)).toBe(true);
    expect(
      shouldApplyView(current, { ...current, revision: current.revision }),
    ).toBe(false);
    expect(
      shouldApplyView(current, { ...current, revision: current.revision - 1 }),
    ).toBe(false);
    expect(
      shouldApplyView(current, { ...current, revision: current.revision + 1 }),
    ).toBe(true);
  });
});
