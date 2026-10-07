import { createShareLink } from "../../domain/roomCode";
import type { Participant } from "../../types/room";

interface RoomViewProps {
  roomCode: string;
  participants: Participant[];
}

function RoomView({ roomCode, participants }: RoomViewProps) {
  const shareLink = createShareLink(roomCode, window.location.origin);

  return (
    <main
      className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      data-testid="room-view"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Room code
          </p>
          <p
            className="mt-1 font-mono text-3xl font-bold tracking-[0.2em] text-slate-900"
            data-testid="room-code-value"
          >
            {roomCode}
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
      </div>

      <section className="mt-8" aria-labelledby="participants-heading">
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
          {participants.map((participant) => (
            <li
              className="flex items-center justify-between px-4 py-3 text-slate-800"
              data-testid="participant-item"
              key={participant.id}
            >
              <span>{participant.displayName}</span>
              {participant.role === "host" && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  Host
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default RoomView;
