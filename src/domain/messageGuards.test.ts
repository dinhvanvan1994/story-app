import { describe, expect, it } from "vitest";
import {
  isRoomIntentPayload,
  isRoomRejectedPayload,
  isRoomStatePayload,
} from "./messageGuards";

describe("room Broadcast message guards", () => {
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
});
