import type {
  PublicView,
  PublicVote,
  RoomAction,
  RoomState,
  RoomTransition,
  Vote,
} from "../types/room";

const NO_VOTES_TO_REVEAL = "At least one vote is required to reveal" as const;

/** Trims a Story title and represents an omitted or blank title as null. */
export function normalizeStoryTitle(title: string | null): string | null {
  const normalized = title?.trim() ?? "";
  return normalized.length === 0 ? null : normalized;
}

/**
 * Applies one authorized Room action. Invalid actors, phases, and idempotent
 * Votes preserve the original Room and its revision.
 */
export function reduceRoom(
  room: RoomState,
  action: RoomAction,
): RoomTransition {
  const participant = room.participants.find(
    ({ id }) => id === action.actorParticipantId,
  );
  if (participant === undefined) {
    return { room, changed: false };
  }

  const isHost =
    participant.role === "host" &&
    action.actorParticipantId === room.hostParticipantId;

  switch (action.type) {
    case "STORY_STARTED": {
      if (!isHost || room.phase !== "waiting") {
        return { room, changed: false };
      }
      return {
        room: {
          ...room,
          phase: "voting",
          story: { title: normalizeStoryTitle(action.title) },
          votes: [],
          revision: room.revision + 1,
        },
        changed: true,
      };
    }
    case "VOTE_CAST": {
      if (room.phase !== "voting") {
        return { room, changed: false };
      }
      const previousVote = room.votes.find(
        ({ participantId }) => participantId === action.actorParticipantId,
      );
      if (previousVote?.value === action.value) {
        return { room, changed: false };
      }
      const vote: Vote = {
        participantId: action.actorParticipantId,
        value: action.value,
      };
      const votes =
        previousVote === undefined
          ? [...room.votes, vote]
          : room.votes.map((existing) =>
              existing.participantId === action.actorParticipantId
                ? vote
                : existing,
            );
      return {
        room: { ...room, votes, revision: room.revision + 1 },
        changed: true,
      };
    }
    case "VOTES_REVEALED": {
      if (!isHost || room.phase !== "voting") {
        return { room, changed: false };
      }
      if (room.votes.length === 0) {
        return { room, changed: false, error: NO_VOTES_TO_REVEAL };
      }
      return {
        room: { ...room, phase: "revealed", revision: room.revision + 1 },
        changed: true,
      };
    }
    case "NEXT_STORY": {
      if (!isHost || room.phase !== "revealed") {
        return { room, changed: false };
      }
      return {
        room: {
          ...room,
          phase: "waiting",
          story: null,
          votes: [],
          revision: room.revision + 1,
        },
        changed: true,
      };
    }
  }
}

/** Projects private Room state into the value-safe Public view. */
export function createPublicView(room: RoomState): PublicView {
  const votes: PublicVote[] = room.participants.map((participant) => {
    const vote = room.votes.find(
      ({ participantId }) => participantId === participant.id,
    );
    if (vote === undefined) {
      return { participantId: participant.id, hasVoted: false };
    }
    if (room.phase !== "revealed") {
      return { participantId: participant.id, hasVoted: true };
    }
    return {
      participantId: participant.id,
      hasVoted: true,
      value: vote.value,
    };
  });

  return {
    roomCode: room.code,
    hostParticipantId: room.hostParticipantId,
    participants: room.participants.map((participant) => ({ ...participant })),
    revision: room.revision,
    phase: room.phase,
    story: room.story === null ? null : { ...room.story },
    votes,
  };
}

/** Returns true only for a first or strictly newer Public view. */
export function shouldApplyView(
  current: PublicView | null,
  incoming: PublicView,
): boolean {
  return current === null || incoming.revision > current.revision;
}
