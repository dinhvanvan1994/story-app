import { describe, expect, it } from "vitest";
import { normalizeDisplayName, validateDisplayName } from "./displayName";
import type { Participant } from "../types/room";

describe("display name domain", () => {
  it("US-001 TC-001-09 rejects empty and spaces-only names", () => {
    expect(validateDisplayName("", [])).toEqual({
      ok: false,
      error: "Enter a display name.",
    });
    expect(validateDisplayName("   ", [])).toEqual({
      ok: false,
      error: "Enter a display name.",
    });
    expect(normalizeDisplayName("   ")).toBe("");
  });

  it("US-001 TC-001-13 rejects a guest using the host's name", () => {
    const participants: Participant[] = [
      { id: "host-1", displayName: "Maya Chen", role: "host" },
    ];

    expect(validateDisplayName("Maya Chen", participants)).toEqual({
      ok: false,
      error: "That display name is already used in this room.",
    });
  });

  it("US-001 TC-001-19 accepts names at the 24-code-point limit after NFC normalization", () => {
    expect(validateDisplayName("abcdefghijklmnopqrstuvwx", [])).toEqual({
      ok: true,
      value: "abcdefghijklmnopqrstuvwx",
    });

    // Decomposed e with circumflex-plus-tilde combining marks.
    const normalized = validateDisplayName("e\u0302\u0303".repeat(24), []);
    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect([...normalized.value]).toHaveLength(24);
    }

    // Astral-plane CJK Extension B character (U+20BB7).
    const astral = validateDisplayName("\u{20BB7}".repeat(24), []);
    expect(astral.ok).toBe(true);
    if (astral.ok) {
      expect([...astral.value]).toHaveLength(24);
    }
  });

  it("US-001 TC-001-20 rejects names over the 24-code-point limit", () => {
    expect(validateDisplayName("abcdefghijklmnopqrstuvwxy", [])).toEqual({
      ok: false,
      error: "Display name must be 24 characters or fewer.",
    });
    // Decomposed e with circumflex-plus-tilde combining marks.
    expect(validateDisplayName("e\u0302\u0303".repeat(25), [])).toEqual({
      ok: false,
      error: "Display name must be 24 characters or fewer.",
    });
    // Astral-plane CJK Extension B character (U+20BB7).
    expect(validateDisplayName("\u{20BB7}".repeat(25), [])).toEqual({
      ok: false,
      error: "Display name must be 24 characters or fewer.",
    });
  });

  it("US-001 TC-001-22 normalizes precomposed and combining-mark names equally", () => {
    // Precomposed Unicode NFC form.
    const precomposed = normalizeDisplayName("Nguyễn Văn");
    // Decomposed form with circumflex, tilde, and breve combining marks.
    const decomposed = normalizeDisplayName("Nguye\u0302\u0303n Va\u0306n");

    expect(precomposed).toBe("Nguyễn Văn");
    expect(decomposed).toBe(precomposed);
    expect(validateDisplayName(precomposed, []).ok).toBe(true);
    expect(validateDisplayName(decomposed, []).ok).toBe(true);
  });

  it("US-001 TC-001-24 rejects markup in a display name", () => {
    expect(validateDisplayName("<script>x</script>", [])).toEqual({
      ok: false,
      error: "Display name contains invalid characters.",
    });
    expect(validateDisplayName("<b>Noah</b>", [])).toEqual({
      ok: false,
      error: "Display name contains invalid characters.",
    });
  });

  it("US-001 TC-001-25 rejects whitespace other than ordinary spaces", () => {
    // NBSP is distinct from the ordinary space.
    // Tab is also disallowed whitespace.
    for (const value of [
      "Noah\u00A0Patel",
      "\u00A0Noah",
      "Noah\t",
      "Noah\tPatel",
    ]) {
      expect(validateDisplayName(value, [])).toEqual({
        ok: false,
        error: "Display name contains invalid characters.",
      });
    }
  });

  it("US-001 TC-001-26 accepts letters, digits, hyphens, apostrophes, and ordinary spaces", () => {
    for (const value of ["Anne-Marie", "O'Neil", "Player 1"]) {
      expect(validateDisplayName(value, [])).toEqual({ ok: true, value });
    }
  });

  it("US-001 TC-001-27 checks empty and too-long errors before invalid characters", () => {
    expect(validateDisplayName("   ", [])).toEqual({
      ok: false,
      error: "Enter a display name.",
    });
    expect(validateDisplayName("<script>alert(1)</script>", [])).toEqual({
      ok: false,
      error: "Display name must be 24 characters or fewer.",
    });
  });

  it("US-001 TC-001-28 trims leading and trailing ordinary spaces", () => {
    expect(normalizeDisplayName("  Noah Patel  ")).toBe("Noah Patel");
    expect(validateDisplayName("  Noah Patel  ", [])).toEqual({
      ok: true,
      value: "Noah Patel",
    });
  });

  it("US-001 TC-001-30 compares duplicates without case or normalization-form differences", () => {
    const participants: Participant[] = [
      { id: "guest-1", displayName: "Noah Patel", role: "guest" },
      { id: "guest-2", displayName: "Nguyễn Văn", role: "guest" },
    ];

    // Lowercase decomposed form with circumflex, tilde, and breve marks.
    for (const value of [
      "noah patel",
      "nguye\u0302\u0303n va\u0306n",
    ]) {
      expect(validateDisplayName(value, participants)).toEqual({
        ok: false,
        error: "That display name is already used in this room.",
      });
    }
  });
});
