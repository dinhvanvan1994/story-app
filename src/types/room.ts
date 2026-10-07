export type ParticipantRole = "host" | "guest";

export interface Participant {
  id: string;
  displayName: string;
  role: ParticipantRole;
}

export interface Room {
  code: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
}

export interface PublicView {
  roomCode: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
}

export interface JoinIntent {
  type: "join";
  requestId: string;
  participantId: string;
  displayName: string;
}

export type RoomRejectionCode =
  | "display-name-empty"
  | "display-name-too-long"
  | "display-name-invalid-characters"
  | "display-name-duplicate";

export interface RoomIntentPayload {
  intent: JoinIntent;
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
