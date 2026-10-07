import { useState, type FormEvent } from "react";
import { normalizeRoomCode } from "../../domain/roomCode";

interface JoinRoomFormProps {
  initialRoomCode: string;
  joining: boolean;
  joinError: string;
  onJoinRoom: (roomCode: string, displayName: string) => void;
  onRoomCodeChange: (roomCode: string) => void;
}

function JoinRoomForm({
  initialRoomCode,
  joining,
  joinError,
  onJoinRoom,
  onRoomCodeChange,
}: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onJoinRoom(roomCode, displayName);
  }

  function handleRoomCodeChange(value: string) {
    const normalized = normalizeRoomCode(value);
    setRoomCode(normalized);
    onRoomCodeChange(normalized);
  }

  return (
    <form
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold text-slate-900">Join a Room</h2>
      <p className="mt-2 text-sm text-slate-600">
        Enter a Room code and your Display name.
      </p>
      <label
        className="mt-6 block text-sm font-medium text-slate-700"
        htmlFor="room-code"
      >
        Room code
      </label>
      <input
        autoComplete="off"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase tracking-wider text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        data-testid="room-code"
        id="room-code"
        onChange={(event) => handleRoomCodeChange(event.currentTarget.value)}
        type="text"
        value={roomCode}
      />
      <label
        className="mt-4 block text-sm font-medium text-slate-700"
        htmlFor="guest-display-name"
      >
        Display name
      </label>
      <input
        autoComplete="name"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        data-testid="guest-display-name"
        id="guest-display-name"
        onChange={(event) => setDisplayName(event.currentTarget.value)}
        type="text"
        value={displayName}
      />
      {joinError.length > 0 && (
        <p
          className="mt-3 text-sm text-red-700"
          data-testid="join-error"
          role="alert"
        >
          {joinError}
        </p>
      )}
      <button
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        data-testid="join-room"
        disabled={joining}
        type="submit"
      >
        {joining ? "Joining..." : "Join Room"}
      </button>
    </form>
  );
}

export default JoinRoomForm;
