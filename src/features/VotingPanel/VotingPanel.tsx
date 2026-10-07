import { useState } from "react";
import type { RoomViewState } from "../room/useRoomSession";
import type { VoteValue } from "../../types/room";

const cards: readonly { value: VoteValue; testId: string; label: string }[] = [
  { value: 0, testId: "card-0", label: "0" },
  { value: 1, testId: "card-1", label: "1" },
  { value: 2, testId: "card-2", label: "2" },
  { value: 3, testId: "card-3", label: "3" },
  { value: 5, testId: "card-5", label: "5" },
  { value: 8, testId: "card-8", label: "8" },
  { value: 13, testId: "card-13", label: "13" },
  { value: 21, testId: "card-21", label: "21" },
  { value: "?", testId: "card-question", label: "?" },
];

interface VotingPanelProps {
  room: RoomViewState;
  revealError: string;
  onStartStory: (title: string) => void;
  onCastVote: (value: VoteValue) => void;
  onRevealVotes: () => void;
  onNextStory: () => void;
}

function VotingPanel({
  room,
  revealError,
  onStartStory,
  onCastVote,
  onRevealVotes,
  onNextStory,
}: VotingPanelProps) {
  const [storyTitle, setStoryTitle] = useState("");

  function startStory(): void {
    onStartStory(storyTitle);
    setStoryTitle("");
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <p
        className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        data-testid="room-phase"
      >
        {room.phase}
      </p>
      {room.story !== null && room.story.title !== null && (
        <h2
          className="mt-2 text-xl font-semibold text-slate-900"
          data-testid="current-story-title"
        >
          {room.story.title}
        </h2>
      )}

      {room.isHost && room.phase === "waiting" && (
        <div className="mt-5">
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="story-title"
          >
            Story title (optional)
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            data-testid="story-title"
            id="story-title"
            onChange={(event) => setStoryTitle(event.currentTarget.value)}
            type="text"
            value={storyTitle}
          />
          <button
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
            data-testid="start-story"
            onClick={startStory}
            type="button"
          >
            Start story
          </button>
        </div>
      )}

      {room.phase === "voting" && (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {cards.map(({ value, testId, label }) => (
              <button
                aria-pressed={room.ownVote === value}
                className={`rounded-lg border px-4 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-100 ${
                  room.ownVote === value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                    : "border-slate-300 bg-white text-slate-900 hover:border-indigo-500"
                }`}
                data-testid={testId}
                disabled={room.phase !== "voting"}
                key={testId}
                onClick={() => onCastVote(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          {room.isHost && (
            <div className="mt-5">
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
                data-testid="reveal-votes"
                onClick={onRevealVotes}
                type="button"
              >
                Reveal votes
              </button>
              {revealError.length > 0 && (
                <p
                  className="mt-3 text-sm text-red-700"
                  data-testid="reveal-error"
                  role="alert"
                >
                  {revealError}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {room.phase === "revealed" && room.isHost && (
        <button
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
          data-testid="next-story"
          onClick={onNextStory}
          type="button"
        >
          Next story
        </button>
      )}

      <ul className="mt-6 space-y-2">
        {room.participants.map((participant) => {
          const publicVote = room.votes.find(
            ({ participantId }) => participantId === participant.id,
          );
          const ownVote = participant.id === room.participantId
            ? room.ownVote
            : null;
          const visibleValue =
            room.phase === "revealed"
              ? publicVote?.value
              : ownVote;
          const status =
            visibleValue !== undefined && visibleValue !== null
              ? String(visibleValue)
              : publicVote?.hasVoted
                ? "Voted"
                : "Not voted";
          return (
            <li
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              data-testid="participant-vote-status"
              key={participant.id}
            >
              <span>{participant.displayName}</span>
              <span>{status}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default VotingPanel;
