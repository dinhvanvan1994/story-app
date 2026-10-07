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
  const phaseDotColor = {
    waiting: "#94a3b8",
    voting: "#6366f1",
    revealed: "#22c55e",
  }[room.phase];

  return (
    <main
      data-testid="room-view"
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* Left sidebar - 3 parts */}
      <aside
        style={{
          width: "22%",
          minWidth: "180px",
          maxWidth: "280px",
          flexShrink: 0,
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          overflowY: "auto",
        }}
      >
        {/* Room code */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", margin: 0 }}>
            Room code
          </p>
          <p
            data-testid="room-code-value"
            style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, letterSpacing: "0.15em", color: "#0f172a", margin: "4px 0 0" }}
          >
            {room.roomCode}
          </p>
        </div>

        {/* Share link */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", margin: 0 }}>Share link</p>
          <a
            data-testid="share-link"
            href={shareLink}
            style={{ fontSize: "12px", color: "#4f46e5", wordBreak: "break-all", textDecoration: "underline" }}
          >
            {shareLink}
          </a>
        </div>

        {/* Participants */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }} id="participants-heading">
            Participants
          </h2>
          <ul
            data-testid="participant-list"
            style={{ listStyle: "none", margin: 0, padding: 0, border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}
          >
            {room.participants.map((participant) => {
              const publicVote = room.votes.find(
                ({ participantId }) => participantId === participant.id,
              );
              const isCurrentParticipant = participant.id === room.participantId;
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
                  data-testid="participant-item"
                  key={participant.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "#1e293b",
                    background: isCurrentParticipant ? "#eef2ff" : "#ffffff",
                    fontWeight: isCurrentParticipant ? 600 : 400,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {participant.displayName}
                    {participant.role === "host" && (
                      <span style={{ marginLeft: "4px", fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>
                        Host
                      </span>
                    )}
                  </span>
                  {room.phase !== "waiting" && (
                    <span
                      aria-label={`${participant.displayName}: ${voteStatus}`}
                      data-testid="participant-vote-status"
                      style={{
                        flexShrink: 0,
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: hasVoted ? "#e0e7ff" : "#f1f5f9",
                        color: hasVoted ? "#4338ca" : "#94a3b8",
                      }}
                    >
                      {room.phase === "revealed" ? voteStatus : (hasVoted ? "v" : "--")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Phase badge */}
        <div style={{ marginTop: "16px" }}>
          <p
            aria-label={`Phase: ${room.phase}`}
            data-testid="room-phase"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "999px",
              background: "#f1f5f9",
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#475569",
              textTransform: "capitalize",
              margin: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: phaseDotColor,
              }}
            />
            {room.phase}
          </p>
        </div>
      </aside>

      {/* Right panel - 7 parts */}
      <div
        style={{
          flex: 1,
          height: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <VotingPanel
          onCastVote={onCastVote}
          onNextStory={onNextStory}
          onRevealVotes={onRevealVotes}
          onStartStory={onStartStory}
          revealError={revealError}
          room={room}
        />
      </div>
    </main>
  );
}

export default RoomView;
