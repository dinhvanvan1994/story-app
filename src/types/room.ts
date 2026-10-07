export type ParticipantRole = "host" | "guest";

export type Phase = "waiting" | "voting" | "revealed";

export type VoteValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | "?";

export interface Participant {
  id: string;
  displayName: string;
  role: ParticipantRole;
}

export interface Vote {
  participantId: string;
  value: VoteValue;
}

export interface Story {
  title: string | null;
}

export interface Room {
  code: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
  phase: Phase;
  story: Story | null;
  votes: Vote[];
}

export type RoomState = Room;

export interface PublicVote {
  participantId: string;
  hasVoted: boolean;
  value?: Vote["value"];
}

export interface PublicView {
  roomCode: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
  phase: Phase;
  story: Story | null;
  votes: PublicVote[];
}

export interface JoinIntent {
  type: "join";
  requestId: string;
  participantId: string;
  displayName: string;
}

export interface VoteCastIntent {
  type: "VOTE_CAST";
  requestId: string;
  participantId: string;
  value: VoteValue;
}

export type RoomIntent = JoinIntent | VoteCastIntent;

export type RoomAction =
  | {
      type: "STORY_STARTED";
      actorParticipantId: string;
      title: string | null;
    }
  | {
      type: "VOTE_CAST";
      actorParticipantId: string;
      requestId?: string;
      value: VoteValue;
    }
  | { type: "VOTES_REVEALED"; actorParticipantId: string }
  | { type: "NEXT_STORY"; actorParticipantId: string };

export interface RoomTransition {
  room: RoomState;
  changed: boolean;
  error?: "At least one vote is required to reveal";
}

export type RoomRejectionCode =
  | "display-name-empty"
  | "display-name-too-long"
  | "display-name-invalid-characters"
  | "display-name-duplicate";

export interface RoomIntentPayload {
  intent: RoomIntent;
}

export interface RoomStatePayload {
  requestId?: string;
  view: PublicView;
}

export interface RoomRejectedPayload {
  requestId: string;
  code: RoomRejectionCode;
  message: string;
}

export const HOST_CONNECTION_ERROR =
  "Could not connect to the realtime service. Try again." as const;
