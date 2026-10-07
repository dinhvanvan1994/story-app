import { describe, expect, it } from "vitest";
import {
  isRoomIntentPayload,
  isRoomRejectedPayload,
  isRoomStatePayload,
} from "./messageGuards";

describe("room Broadcast message guards", () => {
  // TC-001-47
  it("US-001 TC-001-47 accepts valid payloads and rejects malformed ones", () => {
    const intentPayload = {
      intent: {
        type: "join",
        requestId: "request-1",
        participantId: "guest-1",
        displayName: "Noah Patel",
      },
    };
    const statePayload = {
      requestId: "request-1",
      view: {
        roomCode: "A7K9Q2",
        hostParticipantId: "host-1",
        participants: [
          { id: "host-1", displayName: "Maya Chen", role: "host" },
          { id: "guest-1", displayName: "Noah Patel", role: "guest" },
        ],
        revision: 2,
        phase: "waiting",
        story: null,
        votes: [
          { participantId: "host-1", hasVoted: false },
          { participantId: "guest-1", hasVoted: false },
        ],
      },
    };
    const rejectedPayload = {
      requestId: "request-2",
      code: "display-name-duplicate",
      message: "That display name is already used in this room.",
    };

    expect(isRoomIntentPayload(intentPayload)).toBe(true);
    expect(isRoomStatePayload(statePayload)).toBe(true);
    expect(isRoomRejectedPayload(rejectedPayload)).toBe(true);

    expect(isRoomIntentPayload({})).toBe(false);
    expect(
      isRoomIntentPayload({
        intent: { ...intentPayload.intent, displayName: 123 },
      }),
    ).toBe(false);
    expect(
      isRoomIntentPayload({
        intent: { ...intentPayload.intent, type: "vote" },
      }),
    ).toBe(false);
    expect(
      isRoomStatePayload({
        view: { ...statePayload.view, revision: 0 },
      }),
    ).toBe(false);
    expect(
      isRoomStatePayload({
        view: { ...statePayload.view, revision: 1.5 },
      }),
    ).toBe(false);
    expect(
      isRoomStatePayload({
        view: {
          ...statePayload.view,
          participants: [{ id: "host-1", displayName: 123, role: "host" }],
        },
      }),
    ).toBe(false);
    expect(
      isRoomRejectedPayload({ ...rejectedPayload, code: "unknown-code" }),
    ).toBe(false);
  });

  // TC-002-21
  it("US-002 TC-002-21 accepts valid Vote messages and rejects malformed or leaking payloads", () => {
    const voteIntent = {
      intent: {
        type: "VOTE_CAST",
        requestId: "vote-request-1",
        participantId: "guest-1",
        value: 5,
      },
    };
    const validView = {
      roomCode: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
        { id: "guest-1", displayName: "Noah Patel", role: "guest" },
      ],
      revision: 4,
      phase: "voting",
      story: { title: "Checkout flow" },
      votes: [
        { participantId: "host-1", hasVoted: false },
        { participantId: "guest-1", hasVoted: true },
      ],
    };

    expect(isRoomIntentPayload(voteIntent)).toBe(true);
    expect(isRoomIntentPayload({
      intent: { ...voteIntent.intent, participantId: "" },
    })).toBe(false);
    expect(isRoomIntentPayload({
      intent: { ...voteIntent.intent, value: 4 },
    })).toBe(false);
    expect(isRoomIntentPayload({
      intent: { ...voteIntent.intent, requestId: "" },
    })).toBe(false);
    expect(isRoomStatePayload({ view: validView })).toBe(true);
    expect(
      isRoomStatePayload({
        view: {
          ...validView,
          phase: "revealed",
          votes: [
            { participantId: "host-1", hasVoted: true, value: 8 },
            { participantId: "guest-1", hasVoted: true, value: "?" },
          ],
        },
      }),
    ).toBe(true);
    expect(
      isRoomStatePayload({
        view: {
          ...validView,
          votes: [
            { participantId: "host-1", hasVoted: false },
            { participantId: "guest-1", hasVoted: true, value: 5 },
          ],
        },
      }),
    ).toBe(false);
  });
});
