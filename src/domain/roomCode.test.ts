import { describe, expect, it } from "vitest";
import {
  createShareLink,
  generateRoomCode,
  normalizeRoomCode,
  validateRoomCode,
} from "./roomCode";

describe("room code domain", () => {
  it("US-001 TC-001-02 generates six-character uppercase alphanumeric room codes", () => {
    for (let index = 0; index < 1_000; index += 1) {
      expect(generateRoomCode()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it("US-001 TC-001-08 includes the room code in the share link", () => {
    const shareLink = createShareLink("A7K9Q2", "https://app.test");
    const parsed = new URL(shareLink);

    expect(parsed.origin).toBe("https://app.test");
    expect(parsed.searchParams.get("room")).toBe("A7K9Q2");
  });

  it("US-001 TC-001-17 normalizes lowercase room codes to uppercase", () => {
    const normalized = normalizeRoomCode("a7k9q2");

    expect(normalized).toBe("A7K9Q2");
    expect(validateRoomCode(normalized)).toEqual({
      ok: true,
      value: "A7K9Q2",
    });
  });

  it("US-001 TC-001-39 rejects empty and wrong-length room codes", () => {
    for (const value of ["", "A7K9", "A7K9Q2X"]) {
      expect(validateRoomCode(value)).toEqual({
        ok: false,
        reason: "empty-or-wrong-length",
        error: "Enter a 6-character room code.",
      });
    }
  });

  it("US-001 TC-001-41 rejects invalid characters in a six-character room code", () => {
    expect(validateRoomCode("A7K9Q!")).toEqual({
      ok: false,
      reason: "invalid-characters",
      error: "Room code can only contain letters and digits.",
    });
    expect(validateRoomCode("😀😀😀😀😀😀")).toEqual({
      ok: false,
      reason: "invalid-characters",
      error: "Room code can only contain letters and digits.",
    });
  });
});
