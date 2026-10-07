import type { PublicView } from "../types/room";

export function isJoinConfirmedBy(
  view: PublicView,
  participantId: string,
): boolean {
  return view.participants.some(
    (participant) => participant.id === participantId,
  );
}
