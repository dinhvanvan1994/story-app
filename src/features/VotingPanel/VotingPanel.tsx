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
  const hasStoryStarted = room.phase !== "waiting";

  function startStory(): void {
    onStartStory(storyTitle);
    setStoryTitle("");
  }

  return (
    <section aria-label="Voting round" className="w-full min-w-0">
      {room.isHost && room.phase === "waiting" && (
        <div>
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
            className="mt-4 w-full rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
            data-testid="start-story"
            onClick={startStory}
            type="button"
          >
            Start story
          </button>
        </div>
      )}

      {hasStoryStarted && room.story?.title != null && (
        <h2
          className="mb-5 text-lg font-semibold text-slate-800"
          data-testid="current-story-title"
        >
          {room.story.title}
        </h2>
      )}

      <div
        aria-label="Fibonacci scale"
        className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5"
        role="group"
      >
        {cards.map(({ value, testId, label }) => {
          const isSelected = room.ownVote === value;
          const isVoting = room.phase === "voting";
          return (
            <button
              aria-label={`Card ${label}`}
              aria-pressed={isSelected}
              className={`h-20 w-14 rounded-xl border-2 text-2xl font-bold ${
                isSelected
                  ? "scale-105 border-indigo-600 bg-indigo-600 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-700"
              } ${
                isVoting && !isSelected
                  ? "transition-transform hover:scale-105 hover:border-indigo-400 hover:bg-indigo-50"
                  : isVoting
                    ? "transition-transform"
                    : "opacity-40 cursor-not-allowed"
              }`}
              data-testid={testId}
              disabled={!isVoting}
              key={testId}
              onClick={() => onCastVote(value)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      {hasStoryStarted && (
        <>
          {room.isHost && room.phase === "voting" && (
            <div className="mt-5">
              {revealError.length > 0 && (
                <p
                  className="mb-3 text-sm text-red-600"
                  data-testid="reveal-error"
                  role="alert"
                >
                  {revealError}
                </p>
              )}
              <button
                className="w-full rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
                data-testid="reveal-votes"
                onClick={onRevealVotes}
                type="button"
              >
                Reveal votes
              </button>
            </div>
          )}

          {room.isHost && room.phase === "revealed" && (
            <button
              className="mt-5 w-full rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
              data-testid="next-story"
              onClick={onNextStory}
              type="button"
            >
              Next story
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default VotingPanel;
