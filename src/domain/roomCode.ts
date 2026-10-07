export type RoomCodeValidation =
  | { ok: true; value: string }
  | {
      ok: false;
      reason: "empty-or-wrong-length";
      error: "Enter a 6-character room code.";
    }
  | {
      ok: false;
      reason: "invalid-characters";
      error: "Room code can only contain letters and digits.";
    };

const roomCodeCharacters = /^[A-Z0-9]{6}$/;
const roomCodeLengthError = {
  ok: false,
  reason: "empty-or-wrong-length",
  error: "Enter a 6-character room code.",
} as const;

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomCode = "";

  for (let index = 0; index < 6; index += 1) {
    roomCode += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return roomCode;
}

export function normalizeRoomCode(value: string): string {
  return value.toUpperCase();
}

export function validateRoomCode(value: string): RoomCodeValidation {
  const normalized = normalizeRoomCode(value);

  if ([...normalized].length !== 6) {
    return roomCodeLengthError;
  }

  if (!roomCodeCharacters.test(normalized)) {
    return {
      ok: false,
      reason: "invalid-characters",
      error: "Room code can only contain letters and digits.",
    };
  }

  return { ok: true, value: normalized };
}

export function createShareLink(roomCode: string, origin: string): string {
  const shareLink = new URL(origin);
  shareLink.searchParams.set("room", roomCode);
  return shareLink.toString();
}
