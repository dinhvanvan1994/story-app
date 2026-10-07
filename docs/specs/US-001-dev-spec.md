# US-001 Development Spec — Create & Join Room

**Story:** `docs/requirements/US-001-create-and-join-room.md`  
**Date:** 2026-10-07  
**Status:** In Review  
**Decisions referenced:** D-001, D-002, D-003, D-004, D-005, D-006, D-009, D-011, D-012, D-013

## 1. Approach

Implement room creation and joining as one client-side vertical slice. The host owns room state and applies guest intents through a pure reducer; guests receive only the public view, per D-003, D-004, and D-005. Use per-tab identity and restore the host's saved room after refresh per D-006. Use React 19, TypeScript, and Vite per D-001; Tailwind CSS v4 per D-002. Keep validation and state transitions as plain functions and test them with Vitest per D-009.

## 2. Data shapes

**Channel name:** `room:${roomCode}` (for example `room:A7K9Q2`). One Supabase Realtime Broadcast channel per room, per D-003.

```ts
export type ParticipantRole = "host" | "guest";

export interface Participant {
  id: string;
  displayName: string;
  role: ParticipantRole;
}

export interface Room {
  code: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number; // starts at 1; +1 for every accepted change
}

// PublicView has the same fields as Room for US-001 because this story
// has no vote state. The two types will diverge in US-002 when Room
// gains a votes map that PublicView must hide before reveal. Keep them
// separate now so US-002 does not require a type refactor.
export interface PublicView {
  roomCode: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
}

export interface JoinIntent {
  type: "join";
  requestId: string;
  participantId: string;
  displayName: string;
}

export type RoomRejectionCode =
  | "display-name-empty"
  | "display-name-too-long"
  | "display-name-invalid-characters"
  | "display-name-duplicate";
```

**Broadcast events and payloads.** The table below maps Supabase Broadcast event names to their payload shapes. Use `channel.send({ type: 'broadcast', event, payload })` to send; receive with `channel.on('broadcast', { event }, ({ payload }) => …)`. The types above describe the **payload** only; the event name is not a field inside the payload.

| Broadcast event | Direction | Payload shape | Purpose |
|---|---|---|---|
| `room:intent` | guest → host | `{ intent: JoinIntent }` | Guest requests to join. |
| `room:state` | host → all | `{ requestId?: string; view: PublicView }` | Host broadcasts the current public view after a state change. |
| `room:rejected` | host → guest | `{ requestId: string; code: RoomRejectionCode; message: string }` | Host rejects a join intent with an error code and exact message. |

**sessionStorage keys** (read and written only by `src/storage/roomSession.ts`; the names are binding for tests):

| Key | Value | Written by |
|---|---|---|
| `story-app:participant` | JSON `{ participantId, displayName, roomCode, role }` | host and guest |
| `story-app:host-room` | JSON `Room` snapshot | host only |

- `room:intent`: for a refresh, the guest sends `join` with the existing per-tab `participantId`; it is an idempotent rejoin, not a second participant.
- `room:state`: contains only `PublicView`. It never includes private vote data; this feature has no vote state. Broadcast does not guarantee message order (spike check C5 received 1,2,3,4,5,6,9,7,8,10), so a guest applies a view only when its `revision` is newer than the one it holds (see `shouldApplyView`).
- `room:rejected`: carries `requestId` so the guest can associate the rejection with the pending join.
- Local room-code format errors are displayed locally and are not sent as Broadcast messages.
- Host creation is a local operation; it does not require a guest intent.

## 3. Pure logic

```ts
export type DisplayNameError =
  | "Enter a display name."
  | "Display name must be 24 characters or fewer."
  | "Display name contains invalid characters."
  | "That display name is already used in this room.";

export type DisplayNameValidation =
  | { ok: true; value: string }
  | { ok: false; error: DisplayNameError };

export function normalizeDisplayName(value: string): string;

export function validateDisplayName(
  value: string,
  participants: readonly Participant[],
  participantId?: string
): DisplayNameValidation;

export function generateRoomCode(): string;

export type RoomCodeValidation =
  | { ok: true; value: string }
  | {
      ok: false;
      reason: "empty-or-wrong-length";
      error: "Enter a 6-character room code.";
    }
  | {
      ok: false;
      reason: "invalid-characters";
      error: "Room code can only contain letters and digits.";
    };

export function normalizeRoomCode(value: string): string;
export function validateRoomCode(value: string): RoomCodeValidation;
export function createShareLink(roomCode: string, origin: string): string;

export function createRoom(
  roomCode: string,
  hostParticipantId: string,
  displayName: string
): Room;
export function createPublicView(room: Room): PublicView;
export function applyJoinIntent(room: Room, intent: JoinIntent):
  | { accepted: true; room: Room }
  | { accepted: false; code: RoomRejectionCode; message: string };
export function shouldApplyView(
  current: PublicView | null,
  incoming: PublicView
): boolean;

export const HOST_CONNECTION_ERROR =
  "Could not connect to the realtime service. Try again." as const;
```

Rules:
- Normalize a display name to Unicode NFC, then trim leading and trailing spaces. Validate in this deterministic order: empty after normalization/trimming; too long (over 24 Unicode code points, counted after normalization and trimming); invalid characters; duplicate display name. Use the exact messages in `DisplayNameError`.
- Allowed display-name characters are Unicode letters, combining marks, digits, the ordinary space (U+0020) only, hyphens, and apostrophes; any other whitespace character (for example U+00A0) is an invalid character. Compare duplicate names with `toLowerCase()` after normalization and trimming. Exclude the same `participantId` from duplicate detection for a refresh/rejoin.
- Normalize room codes to uppercase. Accept exactly six characters from `A–Z` and `0–9`; a missing or wrong-length code fails locally with exactly “Enter a 6-character room code.” Do not start the 5-second host wait for this error.
- Reject a six-character code containing characters outside `A–Z` and `0–9` locally as `invalid-characters` with exactly “Room code can only contain letters and digits.” immediately, with no 5-second wait (story AC-18).
- Generate a random six-character code from `A–Z` and `0–9`. There is no room registry or collision lookup; collisions are treated as negligible, per US-001 assumption A-2.
- `applyJoinIntent` validates the name in the order above, then adds a new guest or returns the existing participant unchanged for the same `participantId`. A duplicate name belonging to another participant is rejected. For an existing `participantId` with a different submitted name, keep the stored display name and accept without error (idempotent; there is no rename in the MVP).
- Revision: `createRoom` returns `revision: 1`. `applyJoinIntent` adds 1 to `revision` when it adds a new participant. A rejected intent and an idempotent rejoin leave the room, including `revision`, unchanged. `createPublicView` copies `revision`.
- `shouldApplyView(current, incoming)` returns `true` when `current` is `null` (first view, including after a guest refresh) or `incoming.revision > current.revision`; otherwise `false` (stale or repeated view).

## 4. Flows

1. **Create room:** Validate the host's display name. Generate a room code and participant ID; create a `Room` with the host as its first participant. Open the room's Realtime Broadcast channel and keep the create form in a "connecting" state until the channel reports `SUBSCRIBED` (the first connection took about 2.7 seconds in the spike). Only then save host identity and the room snapshot in this tab's `sessionStorage` and show `room-view` with the room code, share link, and participant list; this way a guest who joins right after the code appears reaches a subscribed host (story A-13). If `SUBSCRIBED` is not reached within 10,000 ms, remove the channel, save nothing, create no room, and show exactly `HOST_CONNECTION_ERROR` in `create-error` (story AC-19).
2. **Join with code:** Normalize and validate room-code syntax locally. Normalize and pre-validate the guest display name **format only** (empty, too long, invalid characters) — the guest does **not** check for duplicate names because it has no participant list before joining; duplicate detection happens only on the host, which repeats all validation in the specified order against its room. If local validation fails, show the error immediately and do not send a join intent. Otherwise, restore or create the tab's participant ID, subscribe to that room's channel (`room:${roomCode}`), then send `room:intent` with a unique request ID. The host validates/applies the intent, saves the updated room, and broadcasts `room:state`; on validation failure it sends `room:rejected`. The guest applies each received `room:state` view only if `shouldApplyView(currentView, view)` is true. The guest sends the intent only after the room channel reports `SUBSCRIBED`; the host processes intents one at a time in arrival order.
3. **Join from share link (`?room=CODE`):** Read the `room` query parameter, prefill the room code field, and normalize its case. The guest enters only a display name and submits the join. After a successful join or on any navigation away from the home screen, remove the `?room=` query parameter from the browser URL (using `replaceState`) so that a later refresh follows the guest-refresh flow (flow 4), not this prefill flow again.
4. **Guest refresh:** On load, read `story-app:participant`; `role: "guest"` means this flow, `role: "host"` means flow 5, no record means the home screen. Restore the same participant ID, display name, and room code from it. If a stored session exists, use it — ignore a `?room=` query parameter that may still be in the URL. Rejoin with the same participant ID. The host treats it as the existing participant and broadcasts the current public view; do not add a second list entry or reject the guest as a duplicate.
   On guest refresh the guest sees a reconnecting state until the host replies. If no matching reply arrives within 5,000 ms, the app shows the home screen with the AC-7 message in join-error and deletes the guest session.
5. **Host refresh:** Restore the host identity and complete saved `Room` snapshot, including the room code and participant list, from per-tab `sessionStorage`. Reopen the same room channel and rebroadcast the restored public view. Do not create a new room or duplicate the host. If `story-app:host-room` is missing or unreadable, delete both storage keys and show the home screen (create and join forms) with no error and no join attempt; the room is gone (story A-11).
6. **Five-second join timeout:** Start a 5,000 ms timeout when a well-formed join is submitted, covering channel subscription and the host reply. Clear it when a matching `room:state` or `room:rejected` response arrives. If no matching host response arrives before expiry, show exactly “Room not found or host is not reachable.” and do not add the guest locally. If the channel never reaches `SUBSCRIBED`, the same timeout message applies (story A-12).
7. **Malformed room code:** Reject an empty or non-six-character code immediately, show exactly “Enter a 6-character room code.”, and send no join intent. A six-character code with characters outside `A–Z` and `0–9` is also rejected immediately, with exactly “Room code can only contain letters and digits.” and no join intent.
8. **Synchronization guarantee (AC-3):** After the host broadcasts `room:state`, all subscribed tabs must show the same participant list within 2 seconds. The spike measured a guest-host round trip of 178 to 238 ms; the E2E test asserts the 2-second limit. Because messages can arrive out of order, guests apply views by `revision` (flow 2), so two quick joins never leave a guest on an older list.
9. **Channel cleanup:** Unsubscribe from the Broadcast channel when the React component that owns the subscription unmounts (effect cleanup). This prevents the host from receiving stale intents from an abandoned channel and avoids connection leaks toward the Supabase free-tier limit of 200 concurrent connections.

## 5. Files to create

Ordered by dependency. Owner says which agent writes the file.

| Order | Path | Owner | Purpose | ACs served |
|---|---|---|---|---|
| 1 | `src/types/room.ts` | Developer | Define participant, room, public-view, intent, state, and rejection message types. | AC-1–AC-19 |
| 2 | `src/domain/displayName.ts` | Developer | Normalize and validate host and guest display names. | AC-1, AC-5–AC-6, AC-9–AC-14 |
| 3 | `src/domain/displayName.test.ts` | Developer | Unit tests for display-name rules and deterministic errors. | AC-1, AC-5–AC-6, AC-9–AC-14 |
| 4 | `src/domain/roomCode.ts` | Developer | Generate, normalize, and validate room codes and build the share link. | AC-1, AC-4, AC-7–AC-8, AC-17–AC-18 |
| 5 | `src/domain/roomCode.test.ts` | Developer | Unit tests for code generation format, normalization, and local validation. | AC-1, AC-4, AC-7–AC-8, AC-17–AC-18 |
| 6 | `src/domain/roomReducer.ts` | Developer | Purely create room state, apply join intents, enforce duplicate identity and name rules, derive `PublicView`, and decide with `shouldApplyView` whether a received view is newer. | AC-1–AC-3, AC-5–AC-6, AC-14–AC-16 |
| 7 | `src/domain/roomReducer.test.ts` | Developer | Unit tests for room creation, join and rejoin, duplicate rejection, public view, revision counting, and `shouldApplyView`. | AC-1–AC-3, AC-5–AC-6, AC-14–AC-16 |
| 8 | `src/domain/messageGuards.ts` | Developer | Validate incoming room Broadcast payloads before they reach handlers. | AC-2–AC-3 |
| 9 | `src/domain/messageGuards.test.ts` | Developer | Unit tests for valid and malformed room Broadcast payloads. | AC-2–AC-3 |
| 10 | `src/storage/roomSession.ts` | Developer | Read and write the host room snapshot and per-tab participant identity using `sessionStorage`. | AC-15–AC-16 |
| 11 | `src/storage/roomSession.test.ts` | Developer | Unit tests for storage reads, shape validation, round trips, and clearing session keys. | AC-15–AC-16 |
| 12 | `src/vite-env.d.ts` | Developer | Declare Vite environment variables used to configure Supabase. | AC-2–AC-4, AC-7, AC-15–AC-16 |
| 13 | `src/lib/supabaseClient.ts` | Developer | Create the single Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. | AC-2–AC-4, AC-7, AC-15–AC-16 |
| 14 | `src/realtime/roomChannel.ts` | Developer | Exchange the named Broadcast messages on one channel per room, per D-003, validate received payloads, and report when the channel is `SUBSCRIBED`. | AC-1–AC-4, AC-7, AC-15–AC-16, AC-19 |
| 15 | `src/features/room/useRoomSession.ts` | Developer | Coordinate create and join flows, per-tab restore, correlated replies, the 5-second join timeout, the 10-second host connection timeout, and applying views by revision. | AC-1–AC-8, AC-15–AC-19 |
| 16 | `src/features/room/CreateRoomForm.tsx` | Developer | Collect the host display name, show the connecting state, and show the create error. | AC-1, AC-5, AC-19 |
| 17 | `src/features/room/JoinRoomForm.tsx` | Developer | Collect a guest display name and room code, including share-link prefill. | AC-2, AC-4–AC-14, AC-17–AC-18 |
| 18 | `src/features/room/RoomView.tsx` | Developer | Show the room code, share link, and live participant list. | AC-1–AC-3, AC-7, AC-15–AC-16 |
| 19 | `src/App.tsx` | Developer | Compose the home screen (create and join forms side by side) and the room view. | AC-1–AC-19 |
| 20 | `tests/page-objects/RoomPage.ts` | Test agent | Page-object interactions using the binding test IDs below. | AC-1–AC-19 |
| 21 | `tests/e2e/US-001-create-and-join-room.spec.ts` | Test agent | Cross-browser room creation, joining, refresh, validation, and synchronization. | AC-1–AC-19 |

Keep validation and state transitions in the plain functions under `src/domain/`; components and session orchestration call those functions rather than duplicating business rules.

## 6. UI elements and data-testid

These names are binding for page objects and tests. The home screen shows the create form and the join form side by side; each form has its own error element. Once a room is created or joined, `room-view` replaces the home screen.

| UI element | data-testid |
|---|---|
| Host display-name input | `host-display-name` |
| Create room button | `create-room` |
| Create form error message (exact text from the applicable AC) | `create-error` |
| Guest room-code input | `room-code` |
| Guest display-name input | `guest-display-name` |
| Join room button | `join-room` |
| Join form error message (exact text from the applicable AC) | `join-error` |
| Room container (shown after a room is created or joined) | `room-view` |
| Room-code output | `room-code-value` |
| Share-link output | `share-link` |
| Participant list | `participant-list` |
| Each participant list item (one per participant) | `participant-item` |

## 7. Edge cases and error states

| Condition | What the user sees | State change |
|---|---|---|
| Host or guest display name is empty or whitespace-only | “Enter a display name.” | Do not create the room or add a guest. |
| Display name exceeds 24 characters | “Display name must be 24 characters or fewer.” | Do not create the room or add a guest. |
| Display name contains a disallowed character, including `<script>x</script>` or any whitespace other than the ordinary space | “Display name contains invalid characters.” | Do not create the room or add a guest. |
| Display name duplicates another participant after normalization/case-insensitive comparison | “That display name is already used in this room.” | Reject join; leave room and participant list unchanged. |
| Same tab identity rejoins after refresh | No duplicate-name error; show the existing display name once in the participant list. | Preserve participant ID and list entry. |
| Empty or wrong-length room code | “Enter a 6-character room code.” immediately. | No join intent; no timeout. |
| Well-formed code receives no host reply within 5 seconds | “Room not found or host is not reachable.” | Do not add the guest locally. No room registry lookup. |
| Lowercase room code | Field is normalized to uppercase. | Continue join using the uppercase code. |
| Host refresh | Restored room code and participant list. | Restore saved host `Room` and rebroadcast its public view. |
| Guest closes the tab | No removal behavior is specified or shown by this story. | Do not send a leave intent; host list entry remains in the MVP. |
| Six-character room code with characters outside `A–Z` and `0–9` (for example `A7K9Q!`) | “Room code can only contain letters and digits.” immediately. | No join intent; no timeout. |
| Host refresh and the saved room is missing or unreadable | Home screen (create and join forms), no error. | The room is gone; nothing is rebroadcast. |
| Realtime connection cannot be established | “Room not found or host is not reachable.” after 5 seconds. | Do not add the guest locally. |
| Same `participantId` rejoins with a different submitted name | No error; the stored display name stays. | Idempotent; participant list unchanged. |
| Guest joins, then refreshes while `?room=CODE` is still in URL | sessionStorage identity takes priority; guest rejoins with stored participant ID, not as a new guest. | Restore flow (4) wins over prefill flow (3). |
| Guest joins and participant list updates | Both host and guest tabs show the same participant list within 2 seconds (AC-3). | Supabase Broadcast delivery; E2E test asserts timing. |
| Host cannot reach the realtime service (no `SUBSCRIBED` within 10 seconds) | “Could not connect to the realtime service. Try again.” in `create-error` (AC-19). | No room created; nothing saved to `sessionStorage`; channel removed. |
| Guest receives an older or repeated `room:state` (out-of-order delivery) | The list does not go back to an older state. | The view is ignored when `revision` is not greater than the current one. |
| Guest joins right after the host's room appears | Join succeeds; no timeout error. | The host shows the room only after its channel is `SUBSCRIBED` (flow 1). |

## 8. Unit test plan

| Pure function | Scenarios | ACs |
|---|---|---|
| `normalizeDisplayName` | NFC composition (precomposed and base-plus-marks inputs give the same value) and trimming of leading and trailing spaces; preserve valid internal spaces. | AC-11, AC-13 |
| `validateDisplayName` | Empty or whitespace-only; 24 code points accepted; 25 rejected; Unicode and combining marks accepted; other whitespace (for example U+00A0, tab) rejected as invalid, including at the start or end; invalid markup rejected; a 25-character name containing markup returns the too-long error (length is checked before characters); exact-case and case-only duplicate; same-ID rejoin; assert validation-order messages. | AC-1, AC-5–AC-6, AC-9–AC-14 |
| `generateRoomCode` | Output has exactly six characters, all from `A–Z` and `0–9`. | AC-1 |
| `normalizeRoomCode` / `validateRoomCode` / `createShareLink` | Lowercase becomes uppercase; six valid characters accepted; empty, short, and long values rejected with “Enter a 6-character room code.”; six characters with an invalid character (`A7K9Q!`) rejected with “Room code can only contain letters and digits.”; share link contains the code as `?room=CODE`. | AC-4, AC-7–AC-8, AC-17–AC-18 |
| `createRoom` / `applyJoinIntent` / `createPublicView` | Host creation with `revision` 1; guest addition adds 1 to `revision`; duplicate rejection leaves the room (and `revision`) unchanged; same-ID rejoin without duplicate and without a `revision` change; same-ID rejoin with a different submitted name keeps the stored name; public view contains participant list and `revision`, and no vote fields. | AC-1–AC-3, AC-5–AC-6, AC-14–AC-16 |
| `shouldApplyView` | `null` current view accepts any view; revision 3 over 2 accepted; revision 2 over 3 rejected; same revision rejected. | AC-3 |
| `isRoomIntentPayload` / `isRoomStatePayload` / `isRoomRejectedPayload` | Valid payloads pass; missing or empty required strings, invalid field types, invalid participant shapes, non-integer or sub-1 revisions, invalid intent type, and unknown rejection codes fail. | AC-2–AC-3 |
| `readParticipantSession` / `readHostRoom` / write and clear helpers | Missing keys, invalid JSON, and wrong shapes return `null`; valid values round-trip; clearing removes both storage keys. | AC-15–AC-16 |

Use test names that include `US-001` and the matching test-case IDs once the Test agent creates `docs/test-cases/US-001-test-cases.md`.

## 9. Traceability

| AC | Spec section | Implementing files |
|---|---|---|
| AC-1 | 3, 4.1, 5, 6, 8 | `src/domain/roomCode.ts`, `src/domain/roomReducer.ts`, `src/domain/displayName.ts`, `src/storage/roomSession.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/CreateRoomForm.tsx`, `src/features/room/RoomView.tsx`, `src/App.tsx` |
| AC-2 | 2, 4.2, 5, 6 | `src/types/room.ts`, `src/domain/roomReducer.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx`, `src/features/room/RoomView.tsx` |
| AC-3 | 2, 3, 4.2, 4.8, 5, 8 | `src/domain/roomReducer.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/RoomView.tsx`, `tests/e2e/US-001-create-and-join-room.spec.ts` |
| AC-4 | 4.3, 5, 6, 8 | `src/domain/roomCode.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx`, `src/features/room/RoomView.tsx` |
| AC-5 | 3, 4.1–4.2, 7–8 | `src/domain/displayName.ts`, `src/domain/roomReducer.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/CreateRoomForm.tsx`, `src/features/room/JoinRoomForm.tsx` |
| AC-6 | 3, 4.2, 7–8 | `src/domain/displayName.ts`, `src/domain/roomReducer.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-7 | 2, 4.6, 7–8 | `src/types/room.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-8 | 3, 4.2, 7–8 | `src/domain/roomCode.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-9 | 3, 7–8 | `src/domain/displayName.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-10 | 3, 7–8 | `src/domain/displayName.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-11 | 3, 7–8 | `src/domain/displayName.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-12 | 3, 7–8 | `src/domain/displayName.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-13 | 3, 7–8 | `src/domain/displayName.ts`, `src/features/room/JoinRoomForm.tsx`, `src/features/room/RoomView.tsx` |
| AC-14 | 3, 7–8 | `src/domain/displayName.ts`, `src/domain/roomReducer.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-15 | 2, 4.4, 5, 7–8 | `src/storage/roomSession.ts`, `src/domain/roomReducer.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts` |
| AC-16 | 2, 4.5, 5, 7–8 | `src/storage/roomSession.ts`, `src/domain/roomReducer.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/RoomView.tsx` |
| AC-17 | 3, 4.7, 7–8 | `src/domain/roomCode.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-18 | 3, 4.7, 7–8 | `src/domain/roomCode.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/JoinRoomForm.tsx` |
| AC-19 | 3, 4.1, 5, 7 | `src/types/room.ts`, `src/realtime/roomChannel.ts`, `src/features/room/useRoomSession.ts`, `src/features/room/CreateRoomForm.tsx` |

## 10. Infrastructure needs

- Supabase Realtime Broadcast channel per room, named `room:${roomCode}` (for example `room:A7K9Q2`) — carry `room:intent`, `room:state`, and `room:rejected` events.
- `VITE_SUPABASE_URL` — Supabase project URL used by `src/lib/supabaseClient.ts` to connect to Realtime.
- `VITE_SUPABASE_ANON_KEY` — public client key used for the Realtime connection; no secret service-role key is required in the browser.
- Browser `sessionStorage` — keys `story-app:participant` and `story-app:host-room` (section 2) retain per-tab identity and the host room snapshot across refreshes.
- Current page origin — form the share link with the `?room=CODE` query parameter.

## 11. Open questions

None. The questions raised while drafting are resolved in the story (decisions on code-point counting, ordinary-space-only, `toLowerCase()` comparison, AC-18, A-11, A-12) and applied in sections 3, 4 and 7.
