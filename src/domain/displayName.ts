import type { Participant } from "../types/room";

export type DisplayNameError =
  | "Enter a display name."
  | "Display name must be 24 characters or fewer."
  | "Display name contains invalid characters."
  | "That display name is already used in this room.";

export type DisplayNameValidation =
  | { ok: true; value: string }
  | { ok: false; error: DisplayNameError };

const allowedDisplayName = /^[\p{L}\p{M}\p{Nd} '-]+$/u;

export function normalizeDisplayName(value: string): string {
  return value.normalize("NFC").replace(/^ +| +$/g, "");
}

export function validateDisplayName(
  value: string,
  participants: readonly Participant[],
  participantId?: string,
): DisplayNameValidation {
  const normalized = normalizeDisplayName(value);

  if (normalized.length === 0) {
    return { ok: false, error: "Enter a display name." };
  }

  if ([...normalized].length > 24) {
    return {
      ok: false,
      error: "Display name must be 24 characters or fewer.",
    };
  }

  if (!allowedDisplayName.test(normalized)) {
    return {
      ok: false,
      error: "Display name contains invalid characters.",
    };
  }

  const normalizedLowercase = normalized.toLowerCase();
  const isDuplicate = participants.some(
    (participant) =>
      participant.id !== participantId &&
      normalizeDisplayName(participant.displayName).toLowerCase() ===
        normalizedLowercase,
  );

  if (isDuplicate) {
    return {
      ok: false,
      error: "That display name is already used in this room.",
    };
  }

  return { ok: true, value: normalized };
}
