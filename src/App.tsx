import CreateRoomForm from "./features/room/CreateRoomForm";
import JoinRoomForm from "./features/room/JoinRoomForm";
import RoomView from "./features/room/RoomView";
import { useRoomSession } from "./features/room/useRoomSession";

function App() {
  const {
    room,
    connecting,
    createError,
    createRoom,
    joining,
    reconnecting,
    joinError,
    roomCodeInput,
    setRoomCodeInput,
    joinRoom,
  } = useRoomSession();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Planning poker
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Story Pointing
        </h1>
      </header>
      <div className="mx-auto flex max-w-5xl justify-center">
        {reconnecting ? (
          <p
            aria-live="polite"
            className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-slate-700 shadow-sm"
          >
            Reconnecting to Room...
          </p>
        ) : room !== null ? (
          <RoomView
            participants={room.participants}
            roomCode={room.roomCode}
          />
        ) : (
          <div className="grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2">
            <CreateRoomForm
              connecting={connecting}
              createError={createError}
              onCreateRoom={createRoom}
            />
            <JoinRoomForm
              initialRoomCode={roomCodeInput}
              joining={joining}
              joinError={joinError}
              onJoinRoom={joinRoom}
              onRoomCodeChange={setRoomCodeInput}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
