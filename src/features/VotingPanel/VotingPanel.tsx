import { useEffect, useRef, useState } from "react";
import type { RoomViewState } from "../room/useRoomSession";
import type { VoteValue } from "../../types/room";

const cards: readonly { value: VoteValue; testId: string; label: string }[] = [
  { value: 0,   testId: "card-0",        label: "0"  },
  { value: 1,   testId: "card-1",        label: "1"  },
  { value: 2,   testId: "card-2",        label: "2"  },
  { value: 3,   testId: "card-3",        label: "3"  },
  { value: 5,   testId: "card-5",        label: "5"  },
  { value: 8,   testId: "card-8",        label: "8"  },
  { value: 13,  testId: "card-13",       label: "13" },
  { value: 21,  testId: "card-21",       label: "21" },
  { value: 34,  testId: "card-34",       label: "34" },
  { value: 55,  testId: "card-55",       label: "55" },
  { value: 89,  testId: "card-89",       label: "89" },
  { value: "?", testId: "card-question", label: "?"  },
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
  const [nextTitle, setNextTitle] = useState("");
  const isVoting = room.phase === "voting";
  const anyoneVoted = room.votes.some((v) => v.hasVoted);

  /*
   * skipAutoStart ref: when handleNextStory calls onNextStory + onStartStory
   * synchronously, React batches and phase goes revealed->voting (skipping
   * waiting entirely). But in case a re-render with waiting does slip through,
   * this ref prevents the auto-start from clobbering the title.
   */
  const skipAutoStartRef = useRef(false);

  /* Auto-start story when host enters waiting phase (initial room creation) */
  useEffect(() => {
    if (room.isHost && room.phase === "waiting" && !skipAutoStartRef.current) {
      onStartStory("");
    }
    skipAutoStartRef.current = false;
  }, [room.isHost, room.phase, onStartStory]);

  function handleNextStory(): void {
    const title = nextTitle.trim();
    setNextTitle("");
    /*
     * Call onNextStory (phase->waiting) then onStartStory (phase->voting)
     * in the SAME event handler. React batches both setRoom calls, so the
     * component re-renders once with the final voting-phase room that
     * includes the title. The intermediate waiting phase is never rendered,
     * so the auto-start useEffect does not fire.
     */
    skipAutoStartRef.current = true;
    onNextStory();
    onStartStory(title);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Top: story title display */}
      <div style={{ padding: "16px 24px 0", flexShrink: 0, minHeight: "24px" }}>
        {room.story?.title != null && room.story.title.length > 0 && (
          <h2
            data-testid="current-story-title"
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1e293b",
              margin: 0,
              textAlign: "center",
            }}
          >
            {room.story.title}
          </h2>
        )}
        {/* Hidden input to keep test compatibility */}
        <input data-testid="story-title" type="hidden" value="" />
      </div>

      {/* Middle: card grid, centered vertically */}
      <div
        aria-label="Fibonacci scale"
        role="group"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 24px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "12px",
            width: "100%",
            maxWidth: "1100px",
            height: "clamp(280px, 55vh, 480px)",
          }}
        >
          {cards.map(({ value, testId, label }) => {
            const isSelected = room.ownVote === value;
            const baseStyle: React.CSSProperties = {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              border: "2px solid",
              fontSize: "clamp(24px, 3.5vw, 42px)",
              fontWeight: 700,
              cursor: isVoting ? "pointer" : "not-allowed",
              transition: "all 150ms ease",
              width: "100%",
              height: "100%",
              borderColor: isSelected ? "#4f46e5" : "#e2e8f0",
              background: isSelected ? "#4f46e5" : "#ffffff",
              color: isSelected ? "#ffffff" : "#1e293b",
              opacity: isVoting ? 1 : 0.4,
              boxShadow: isSelected
                ? "0 10px 25px -5px rgba(79,70,229,0.3)"
                : "none",
              transform: isSelected ? "scale(1.03)" : "none",
            };

            return (
              <button
                aria-label={`Card ${label}`}
                aria-pressed={isSelected}
                data-testid={testId}
                disabled={!isVoting}
                key={testId}
                onClick={() => onCastVote(value)}
                type="button"
                style={baseStyle}
                onMouseEnter={(e) => {
                  if (isVoting && !isSelected) {
                    e.currentTarget.style.borderColor = "#818cf8";
                    e.currentTarget.style.background = "#eef2ff";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isVoting && !isSelected) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: action buttons */}
      <div style={{ padding: "0 24px 20px", flexShrink: 0, textAlign: "center" }}>
        {/* Voting phase: Reveal button (disabled if no votes) */}
        {room.isHost && room.phase === "voting" && (
          <>
            {revealError.length > 0 && (
              <p
                data-testid="reveal-error"
                role="alert"
                style={{ fontSize: "14px", color: "#dc2626", marginBottom: "8px" }}
              >
                {revealError}
              </p>
            )}
            <button
              data-testid="reveal-votes"
              disabled={!anyoneVoted}
              onClick={onRevealVotes}
              type="button"
              style={{
                padding: "12px 48px",
                borderRadius: "12px",
                background: anyoneVoted ? "#4f46e5" : "#a5b4fc",
                color: "#fff",
                fontWeight: 600,
                fontSize: "16px",
                border: "none",
                cursor: anyoneVoted ? "pointer" : "not-allowed",
                opacity: anyoneVoted ? 1 : 0.6,
              }}
            >
              Reveal votes
            </button>
          </>
        )}

        {/* Revealed phase: next story input + button */}
        {room.isHost && room.phase === "revealed" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <input
              data-testid="next-story-title"
              onChange={(e) => setNextTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNextStory();
              }}
              placeholder="Next story title (optional)"
              type="text"
              value={nextTitle}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "15px",
                color: "#0f172a",
                width: "320px",
                maxWidth: "50vw",
              }}
            />
            <button
              data-testid="next-story"
              onClick={handleNextStory}
              type="button"
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 600,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Next story
            </button>
          </div>
        )}

        {/* Hidden start-story button for test compat */}
        <button
          data-testid="start-story"
          onClick={() => onStartStory("")}
          type="button"
          style={{ display: "none" }}
        >
          Start story
        </button>
      </div>
    </div>
  );
}

export default VotingPanel;
