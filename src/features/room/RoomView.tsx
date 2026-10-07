import { createShareLink } from "../../domain/roomCode";
import VotingPanel from "../VotingPanel/VotingPanel";
import type { RoomViewState } from "./useRoomSession";
import type { VoteValue } from "../../types/room";

interface RoomViewProps {
  room: RoomViewState;
  revealError: string;
  onStartStory: (title: string) => void;
  onCastVote: (value: VoteValue) => void;
  onRevealVotes: () => void;
  onNextStory: () => void;
}

function RoomView({
  room,
  revealError,
  onStartStory,
  onCastVote,
  onRevealVotes,
  onNextStory,
}: RoomViewProps) {
  const shareLink = createShareLink(room.roomCode, window.location.origin);
  const phaseDotClass = {
    waiting: "bg-slate-400",
    voting: "bg-indigo-500",
    revealed: "bg-green-500",
  }[room.phase];

  return (
    <main
      className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      data-testid="room-view"
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Room code
          </p>
          <p
            className="mt-1 font-mono text-3xl font-bold tracking-[0.2em] text-slate-900"
            data-testid="room-code-value"
          >
            {room.roomCode}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Share link</p>
          <a
            className="mt-1 inline-block break-all text-sm text-indigo-700 underline underline-offset-2"
            data-testid="share-link"
            href={shareLink}
          >
            {shareLink}
          </a>
        </div>
      </header>

      <div className="mt-8 flex flex-col items-start gap-6 md:flex-row">
        <aside className="w-full md:w-56 md:shrink-0">
          <section aria-labelledby="participants-heading">
            <h2
              className="text-lg font-semibold text-slate-900"
              id="participants-heading"
            >
              Participants
            </h2>
            <ul
              className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200"
              data-testid="participant-list"
            >
              {room.participants.map((participant) => {
                const publicVote = room.votes.find(
                  ({ participantId }) => participantId === participant.id,
                );
                const isCurrentParticipant =
                  participant.id === room.participantId;
                const ownVote = isCurrentParticipant ? room.ownVote : null;
                const voteStatus =
                  room.phase === "revealed"
                    ? publicVote?.value === undefined
                      ? "--"
                      : String(publicVote.value)
                    : ownVote !== null
                      ? String(ownVote)
                      : publicVote?.hasVoted
                        ? "Voted"
                        : "Not voted";
                const hasVoted = publicVote?.hasVoted ?? ownVote !== null;

                return (
                  <li
                    className={`flex items-center justify-between gap-2 px-3 py-3 text-sm text-slate-800 sm:px-4 ${
                      isCurrentParticipant
                        ? "bg-indigo-50 font-semibold"
                        : "bg-white"
                    }`}
                    data-testid="participant-item"
                    key={participant.id}
                  >
                    <span className="min-w-0 truncate">
                      {participant.displayName}
                      {participant.role === "host" && (
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          Host
                        </span>
                      )}
                    </span>
                    {room.phase !== "waiting" && (
                      <span
                        aria-label={`${participant.displayName}: ${voteStatus}`}
                        className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                          room.phase === "revealed"
                            ? "bg-indigo-100 text-indigo-700"
                            : hasVoted
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                        data-testid="participant-vote-status"
                      >
                        {room.phase === "revealed"
                          ? voteStatus
                          : `${hasVoted ? "✓" : "—"} ${voteStatus}`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <p
            aria-label={`Phase: ${room.phase}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium capitalize text-slate-700"
            data-testid="room-phase"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${phaseDotClass}`}
            />
            {room.phase}
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <VotingPanel
            onCastVote={onCastVote}
            onNextStory={onNextStory}
            onRevealVotes={onRevealVotes}
            onStartStory={onStartStory}
            revealError={revealError}
            room={room}
          />
        </div>
      </div>
    </main>
  );
}

export default RoomView;
