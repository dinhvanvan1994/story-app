import { useState, type FormEvent } from "react";

interface CreateRoomFormProps {
  connecting: boolean;
  createError: string;
  onCreateRoom: (displayName: string) => void;
}

function CreateRoomForm({
  connecting,
  createError,
  onCreateRoom,
}: CreateRoomFormProps) {
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateRoom(displayName);
  }

  return (
    <form
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold text-slate-900">Create a Room</h2>
      <p className="mt-2 text-sm text-slate-600">
        Enter your Display name to start a room.
      </p>
      <label
        className="mt-6 block text-sm font-medium text-slate-700"
        htmlFor="host-display-name"
      >
        Display name
      </label>
      <input
        autoComplete="name"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        data-testid="host-display-name"
        id="host-display-name"
        onChange={(event) => setDisplayName(event.currentTarget.value)}
        type="text"
        value={displayName}
      />
      {createError.length > 0 && (
        <p
          className="mt-3 text-sm text-red-700"
          data-testid="create-error"
          role="alert"
        >
          {createError}
        </p>
      )}
      <button
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        data-testid="create-room"
        disabled={connecting}
        type="submit"
      >
        {connecting ? "Connecting..." : "Create Room"}
      </button>
    </form>
  );
}

export default CreateRoomForm;
