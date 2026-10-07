import type {
  JoinIntent,
  Participant,
  Phase,
  PublicView,
  PublicVote,
  RoomIntentPayload,
  RoomRejectedPayload,
  RoomRejectionCode,
  RoomStatePayload,
  Story,
  VoteCastIntent,
  VoteValue,
} from "../types/room";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isParticipantRole(value: unknown): value is Participant["role"] {
  return value === "host" || value === "guest";
}

function isParticipant(value: unknown): value is Participant {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["id", "displayName", "role"]) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.displayName) &&
    isParticipantRole(value.role)
  );
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isJoinIntent(value: unknown): value is JoinIntent {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["type", "requestId", "participantId", "displayName"]) &&
    value.type === "join" &&
    isNonEmptyString(value.requestId) &&
    isNonEmptyString(value.participantId) &&
    isNonEmptyString(value.displayName)
  );
}

function isVoteValue(value: unknown): value is VoteValue {
  return (
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 5 ||
    value === 8 ||
    value === 13 ||
    value === 21 ||
    value === "?"
  );
}

function isVoteCastIntent(value: unknown): value is VoteCastIntent {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["type", "requestId", "participantId", "value"]) &&
    value.type === "VOTE_CAST" &&
    isNonEmptyString(value.requestId) &&
    isNonEmptyString(value.participantId) &&
    isVoteValue(value.value)
  );
}

function isPhase(value: unknown): value is Phase {
  return value === "waiting" || value === "voting" || value === "revealed";
}

function isStory(value: unknown): value is Story | null {
  return (
    value === null ||
    (isRecord(value) &&
      hasOnlyKeys(value, ["title"]) &&
      (value.title === null || typeof value.title === "string"))
  );
}

function isPublicVote(value: unknown, phase: Phase): value is PublicVote {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.participantId) ||
    typeof value.hasVoted !== "boolean"
  ) {
    return false;
  }

  if (phase !== "revealed") {
    return !("value" in value) &&
      hasOnlyKeys(value, ["participantId", "hasVoted"]);
  }
  if (!value.hasVoted) {
    return !("value" in value) &&
      hasOnlyKeys(value, ["participantId", "hasVoted"]);
  }
  return (
    isVoteValue(value.value) &&
    hasOnlyKeys(value, ["participantId", "hasVoted", "value"])
  );
}

function isPublicView(value: unknown): value is PublicView {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      "roomCode",
      "hostParticipantId",
      "participants",
      "revision",
      "phase",
      "story",
      "votes",
    ]) ||
    !isNonEmptyString(value.roomCode) ||
    !isNonEmptyString(value.hostParticipantId) ||
    !Array.isArray(value.participants) ||
    !value.participants.every(isParticipant) ||
    typeof value.revision !== "number" ||
    !Number.isInteger(value.revision) ||
    value.revision < 1 ||
    !isPhase(value.phase) ||
    !isStory(value.story) ||
    !Array.isArray(value.votes)
  ) {
    return false;
  }

  const phase = value.phase;
  const story = value.story;
  const votes = value.votes;
  if (
    !votes.every((vote) => isPublicVote(vote, phase)) ||
    (phase === "waiting"
      ? story !== null || votes.some((vote) => isPublicVote(vote, phase) && vote.hasVoted)
      : story === null) ||
    (phase === "revealed" &&
      !votes.some((vote) => isPublicVote(vote, phase) && vote.hasVoted))
  ) {
    return false;
  }

  const participants = value.participants;
  const participantIds = participants.map((participant) => participant.id);
  const voteIds = votes.map((vote) => vote.participantId);
  const host = participants.find(
    (participant) => participant.id === value.hostParticipantId,
  );
  return (
    host?.role === "host" &&
    participants.filter((participant) => participant.role === "host")
      .length === 1 &&
    new Set(participantIds).size === participantIds.length &&
    voteIds.length === participantIds.length &&
    new Set(voteIds).size === voteIds.length &&
    participantIds.every((id) => voteIds.includes(id)) &&
    (value.phase === "waiting"
      ? value.story === null && votes.every((vote) => !vote.hasVoted)
      : value.story !== null) &&
    (value.phase !== "revealed" || votes.some((vote) => vote.hasVoted))
  );
}

function isRoomRejectionCode(value: unknown): value is RoomRejectionCode {
  return (
    value === "display-name-empty" ||
    value === "display-name-too-long" ||
    value === "display-name-invalid-characters" ||
    value === "display-name-duplicate"
  );
}

/** Validates a join or Vote Intent received over Broadcast. */
export function isRoomIntentPayload(
  value: unknown,
): value is RoomIntentPayload {
  return (
    isRecord(value) &&
    (isJoinIntent(value.intent) || isVoteCastIntent(value.intent))
  );
}

/** Rejects malformed Public views, including pre-Reveal Vote-value leaks. */
export function isRoomStatePayload(value: unknown): value is RoomStatePayload {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["requestId", "view"]) &&
    (value.requestId === undefined || isNonEmptyString(value.requestId)) &&
    isPublicView(value.view)
  );
}

/** Validates a host rejection message before the Guest handles it. */
export function isRoomRejectedPayload(
  value: unknown,
): value is RoomRejectedPayload {
  return (
    isRecord(value) &&
    isNonEmptyString(value.requestId) &&
    isRoomRejectionCode(value.code) &&
    isNonEmptyString(value.message)
  );
}
