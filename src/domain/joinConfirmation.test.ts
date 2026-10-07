import { describe, expect, it } from "vitest";
import { isJoinConfirmedBy } from "./joinConfirmation";
import type { PublicView } from "../types/room";

describe("join confirmation", () => {
  // TC-001-49
  it("US-001 TC-001-49 confirms a join when the public view contains the participant", () => {
    const view: PublicView = {
      roomCode: "A7K9Q2",
      hostParticipantId: "host-1",
      participants: [
        { id: "host-1", displayName: "Maya Chen", role: "host" },
        { id: "guest-1", displayName: "Noah Patel", role: "guest" },
      ],
      revision: 3,
      phase: "voting",
      story: { title: "Checkout flow" },
      votes: [
        { participantId: "host-1", hasVoted: false },
        { participantId: "guest-1", hasVoted: false },
      ],
    };

    expect(isJoinConfirmedBy(view, "guest-1")).toBe(true);
    expect(isJoinConfirmedBy(view, "guest-2")).toBe(false);
  });
});
