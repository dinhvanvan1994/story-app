# US-002 Development Spec — Vote on Stories

**Story:** `docs/requirements/US-002-vote-on-stories.md`  
**Date:** 2026-10-08  
**Status:** Draft  
**Decisions referenced:** D-003, D-004, D-005, D-006, D-007, D-008, D-011, D-013

## Overview

Implement a complete Round within the existing Room: the Host starts a Story, Participants cast and may change Votes, the Host Reveals, and the Host advances with Next story. Preserve the Host-authoritative model: the Host runs the Reducer and broadcasts only a Public view over the existing Supabase channel, per D-003, D-004, D-005, and D-013. Extend the Room snapshot and view types without adding persistence beyond the existing Host session storage. Calculated Results remain in US-003.

## Flows

1. **Start a Story:** In `waiting`, the Host enters an optional title and starts a Story. Normalize the title by trimming whitespace; store `null` when empty. The Host Reducer sets `phase` to `voting`, starts the Round with no Votes, increments `revision`, persists the Host Room, and broadcasts the Public view. Satisfies AC-1.
2. **Cast or change a Vote:** In `voting`, a Participant chooses a Card. A Guest sends `VOTE_CAST` using `room:intent`; the Host maps the Intent's `participantId` to the Reducer's `actorParticipantId`, validates the actor against the Room roster, and applies the action. The Host Participant dispatches through the same Reducer locally. A valid new or changed Vote updates the Host Room, increments `revision`, and broadcasts the Public view with the Intent's `requestId`. A repeated identical Vote is idempotent and does not increment `revision`. Satisfies AC-2, AC-3.
3. **Display Votes before Reveal:** The Host's authoritative Room retains all Vote values. The Host broadcasts a Public view containing only `participantId` and `hasVoted` for each Vote; omit every `value`. A Participant sees their own current value from local/Host-private state and other Participants only as “Voted” or “Not voted”. Satisfies AC-4.
4. **Reveal:** In `voting`, the Host triggers Reveal. The Reducer rejects non-Host actors and leaves state unchanged if no Vote exists; the Host displays exactly “At least one vote is required to reveal”. Otherwise set `phase` to `revealed`, increment `revision`, and broadcast a Public view containing each Vote value. Reveal is one-way until Next story. Satisfies AC-5, AC-6, AC-7.
5. **Block Votes after Reveal:** Any `VOTE_CAST` outside `voting`, including in `revealed`, is ignored by the Reducer. In `revealed`, disable the Card controls. Satisfies AC-8.
6. **Next story:** In `revealed`, only the Host may select Next story. The Reducer clears Story and Votes, returns to `waiting`, increments `revision`, persists the Host Room, and broadcasts the Public view. Satisfies AC-9.
7. **Guest joins during a Round:** The existing join Intent and `room:state` response deliver the current Story, Phase, Participants, and Public Votes to a newly joined Guest. The Guest may Vote in `voting`; its Vote value is local to that Guest and is not included in the pre-Reveal Public view. Satisfies AC-10.

## File Table

Only files listed here may be created or modified during implementation.

| File | Action | Purpose |
|---|---|---|
| `src/types/room.ts` | modify | Extend existing `Room` with `Phase`, `Story`, and private `Vote[]`; export `RoomState` as its authoritative-state alias, add `Vote`, `VoteValue`, `PublicVote`, and the expanded `PublicView`; extend room intent types for `VOTE_CAST`. |
| `src/domain/room.ts` | create | Pure Story title normalization, Room reducer transitions, Host/Participant authorization by Room roster, and safe Public view creation. |
| `src/domain/room.test.ts` | create | Unit coverage for every action, Phase transition, authorization, Vote replacement, title normalization, and privacy projection. |
| `src/domain/joinConfirmation.test.ts` | modify | Extend the Public view fixture to include the required Phase, Story, and Vote status fields. |
| `src/domain/roomReducer.ts` | modify | Keep existing join Intent processing compatible with the expanded RoomState and preserve Round fields when Participants join. |
| `src/domain/roomReducer.test.ts` | modify | Verify existing join behavior preserves Phase, Story, and Votes while retaining US-001 behavior. |
| `src/domain/messageGuards.ts` | modify | Validate the discriminated vote Intent and expanded Public view payloads before handlers run. |
| `src/domain/messageGuards.test.ts` | modify | Cover valid and malformed US-002 Intent and Public view payloads. |
| `src/storage/roomSession.ts` | modify | Read and write the expanded Host `RoomState` snapshot under the existing key; retain the existing Participant key and per-tab behavior. |
| `src/storage/roomSession.test.ts` | modify | Verify a Room snapshot including Phase, Story, Votes, and revision round-trips and malformed snapshots return `null`. |
| `src/realtime/roomChannel.ts` | modify | Carry the vote Intent on `room:intent`; broadcast the expanded Public view on `room:state`; retain `room:rejected` and existing channel cleanup. |
| `src/features/room/useHostRoomSession.ts` | modify | Dispatch Host actions through the Reducer, apply Guest Vote Intents serially, persist accepted state, and broadcast only accepted state changes. |
| `src/features/room/useGuestRoomSession.ts` | modify | Send Guest Vote Intents, apply newer Public views, and retain only the Guest's own chosen value locally before Reveal. |
| `src/features/room/useRoomSession.ts` | modify | Expose current Phase, Story, own Vote, Participant Vote statuses, and Host/Guest actions to the view layer. |
| `src/features/room/RoomView.tsx` | modify | Compose the current Story, Phase, Participant list, and Voting panel within the joined Room. |
| `src/features/VotingPanel/VotingPanel.tsx` | create | Render the Card grid, own Vote/status information, Host-only start/Reveal/Next story actions, and the AC-6 error. |
| `src/App.tsx` | modify | Wire Room session callbacks and state to the Room view without placing business rules in the component. |
| `tests/page-objects/RoomPage.ts` | modify | Add locators and user actions for Story, Cards, Vote status, Reveal, and Next story. |
| `tests/e2e/US-002-vote-on-stories.spec.ts` | create | Automate acceptance scenarios using separate browser contexts for Host and Guests. |

## Data Shapes

`RoomState` is the Host-authoritative snapshot. Extend the existing `Room` with `phase`, `story`, and private `votes`, and export `RoomState` as an alias of `Room` so existing US-001 call sites keep the same shape. Preserve `code`, `hostParticipantId`, `participants`, and `revision`. The existing `story-app:host-room` key remains the only Host snapshot key.

```ts
export type Phase = "waiting" | "voting" | "revealed";

export type VoteValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | "?";

export interface Vote {
  participantId: string;
  value: VoteValue;
}

export interface Story {
  title: string | null;
}

export interface Room {
  code: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
  phase: Phase;
  story: Story | null;
  votes: Vote[];
}

export type RoomState = Room;

export interface PublicVote {
  participantId: string;
  hasVoted: boolean;
  value?: Vote["value"];
}

export interface PublicView {
  roomCode: string;
  hostParticipantId: string;
  participants: Participant[];
  revision: number;
  phase: Phase;
  story: Story | null;
  votes: PublicVote[];
}

export type RoomAction =
  | {
      type: "STORY_STARTED";
      actorParticipantId: string;
      title: string | null;
    }
  | {
      type: "VOTE_CAST";
      actorParticipantId: string;
      requestId?: string;
      value: VoteValue;
    }
  | { type: "VOTES_REVEALED"; actorParticipantId: string }
  | { type: "NEXT_STORY"; actorParticipantId: string };

export type RoomIntent =
  | JoinIntent
  | VoteCastIntent;

export interface VoteCastIntent {
  type: "VOTE_CAST";
  requestId: string;
  participantId: string;
  value: VoteValue;
}

export interface RoomTransition {
  room: RoomState;
  changed: boolean;
  error?: "At least one vote is required to reveal";
}
```

Broadcast event names remain those defined per D-013:

| Event | Direction | Payload |
|---|---|---|
| `room:intent` | Guest → Host | `{ intent: JoinIntent \| VoteCastIntent }` |
| `room:state` | Host → all | `{ requestId?: string; view: PublicView }` |
| `room:rejected` | Host → Guest | Existing rejection payload; no new user-facing message is specified for ignored actions. |

`PublicView.votes` always contains one `PublicVote` entry per Participant. When `phase !== "revealed"`, each entry contains only `participantId` and `hasVoted`; `value` must be absent, not `null`. When `phase === "revealed"`, include each cast Vote's value, including `?`. Participants who have not voted have `hasVoted: false` and no `value`.

## Pure Logic

```ts
export function normalizeStoryTitle(title: string | null): string | null;
export function reduceRoom(room: RoomState, action: RoomAction): RoomTransition;
export function createPublicView(room: RoomState): PublicView;
export function shouldApplyView(current: PublicView | null, incoming: PublicView): boolean;
```

- `normalizeStoryTitle`: trim leading/trailing whitespace; return `null` for omitted, empty, or whitespace-only title. No maximum length or character restrictions.
- `reduceRoom`: determine actor role from the Room's `participants` roster and `hostParticipantId`; do not trust a role asserted by an Intent. `VOTE_CAST` requires a registered Participant and `phase === "voting"`; replace that Participant's prior Vote. `STORY_STARTED` requires the Host and `waiting`; `VOTES_REVEALED` requires the Host and `voting`; `NEXT_STORY` requires the Host and `revealed`. Other unauthorized or out-of-Phase actions leave the exact Room unchanged. Reveal with no Votes leaves it unchanged and returns the exact AC-6 message.
- Increment `revision` once for each accepted state change, per D-011. Identical re-votes and rejected actions do not change it.
- `createPublicView`: project the Room snapshot without leaking any Vote value unless `phase === "revealed"`. Do not serialize or broadcast the private `RoomState.votes` array directly.
- `shouldApplyView`: apply an incoming view only when no current view exists or its `revision` is strictly higher.

## UI elements and data-testid

| Element | Type | data-testid | Notes |
|---|---|---|---|
| Story title | input | `story-title` | Optional; no `maxLength`; Host only. |
| Start story | button | `start-story` | Host only; available in `waiting`. |
| Current Story title | text | `current-story-title` | Omit or show no title when `Story.title` is `null`. |
| Room Phase | text | `room-phase` | Values `waiting`, `voting`, `revealed`. |
| Card 0 | button | `card-0` | Disabled unless `phase === "voting"`. |
| Card 1 | button | `card-1` | Disabled unless `phase === "voting"`. |
| Card 2 | button | `card-2` | Disabled unless `phase === "voting"`. |
| Card 3 | button | `card-3` | Disabled unless `phase === "voting"`. |
| Card 5 | button | `card-5` | Disabled unless `phase === "voting"`. |
| Card 8 | button | `card-8` | Disabled unless `phase === "voting"`. |
| Card 13 | button | `card-13` | Disabled unless `phase === "voting"`. |
| Card 21 | button | `card-21` | Disabled unless `phase === "voting"`. |
| Card `?` | button | `card-question` | Disabled unless `phase === "voting"`. |
| Reveal | button | `reveal-votes` | Host only; visible in `voting`. |
| Reveal error | alert | `reveal-error` | AC-6 exact text. |
| Next story | button | `next-story` | Host only; available in `revealed`. |
| Participant Vote status | text | `participant-vote-status` | One per Participant; before Reveal show only own local value or “Voted” / “Not voted” for others. |

## Edge Cases & Errors

| Scenario | Expected behaviour | AC |
|---|---|---|
| Story title is omitted, empty, or whitespace-only | Store `story: null`; start the Round with no title. | AC-1 |
| Story title has surrounding whitespace | Trim before storing. | AC-1 |
| Participant casts `?` | Store `?` as the Participant's Vote; it is an abstention. Average is calculated in US-003 and excludes it per D-007. | AC-2 |
| Participant changes a Vote in `voting` | Replace the prior Vote; keep only one current Vote for that Participant. | AC-3 |
| Public view sent before Reveal | Include `hasVoted` but omit all `value` fields; keep values Host-private. | AC-4 |
| Host Reveals with no Votes | Ignore transition; remain in `voting`; show “At least one vote is required to reveal”. | AC-6 |
| Guest attempts `STORY_STARTED`, `VOTES_REVEALED`, or `NEXT_STORY` | Reducer checks roster role and ignores; Room remains unchanged. Host-only controls are not rendered to Guests. | AC-7 |
| Guest sends `VOTE_CAST` outside `voting` | Ignore; do not modify Vote or Phase. | AC-8 |
| Any Participant sends `VOTE_CAST` in `revealed` | Ignore; disable all Card controls. | AC-8 |
| Host attempts Reveal outside `voting` | Ignore; Room remains unchanged. | AC-7 |
| Host selects Next story outside `revealed` | Ignore; Room remains unchanged. | AC-9 |
| Host selects Next story in `revealed` | Clear Story and Votes; set `waiting`. | AC-9 |
| Guest joins during `voting` | Send current Story, Phase, and masked Vote statuses; Guest may cast a Vote in the same Round. | AC-10 |
| Public views arrive out of order | Ignore a repeated or lower-revision view per D-011. | AC-3–AC-5, AC-9–AC-10 |

## Unit Test Plan

| Function / unit | Scenarios | AC verified |
|---|---|---|
| `normalizeStoryTitle` | Omitted/null, empty, whitespace-only, leading/trailing whitespace, and non-empty title. | AC-1 |
| `reduceRoom` — `STORY_STARTED` | Host allowed in `waiting`; title normalized; new Round has no Votes and `voting`; Guest rejected. | AC-1, AC-7 |
| `reduceRoom` — `VOTE_CAST` | Host and Guest can vote in `voting`; only allowed Vote values; one Vote per Participant; changing replaces; out-of-Phase and unregistered Participant ignored. | AC-2, AC-3, AC-8, AC-10 |
| `createPublicView` | Pre-Reveal views omit values for every Vote; revealed views contain all cast values, including `?`; no private Vote field is present. | AC-4, AC-5 |
| `reduceRoom` — `VOTES_REVEALED` | Host reveals with ≥1 Vote; zero Votes returns exact error and unchanged Room; Guest and wrong Phase ignored. | AC-5–AC-7 |
| `reduceRoom` — `NEXT_STORY` | Host clears Story and Votes and returns to `waiting`; Guest or wrong Phase ignored. | AC-7, AC-9 |
| `shouldApplyView` | First view accepted; strictly higher revision accepted; repeated and lower revision ignored. | AC-3–AC-5, AC-9–AC-10 |
| Message guards | Accept valid vote Intent and expanded Public view; reject invalid `VoteValue`, missing IDs, and any pre-Reveal PublicVote containing `value`. | AC-2–AC-5 |
| Host room storage | RoomState with Story, Phase, Votes, and revision round-trips through existing Host snapshot; invalid snapshots return `null`. | AC-1–AC-10 |

## Traceability

| AC | Spec section | Files |
|---|---|---|
| AC-1 | Data Shapes, Pure Logic, Flow 1 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/types/room.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-2 | Data Shapes, Pure Logic, Flow 2 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/types/room.ts`, `src/realtime/roomChannel.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-3 | Pure Logic, Flow 2 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/room/useHostRoomSession.ts`, `src/features/room/useGuestRoomSession.ts` |
| AC-4 | Data Shapes, Flow 3 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/room/useGuestRoomSession.ts`, `src/realtime/roomChannel.ts` |
| AC-5 | Data Shapes, Flow 4 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/realtime/roomChannel.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-6 | Flow 4, Edge Cases | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-7 | Pure Logic, Edge Cases | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-8 | Flow 5, Edge Cases | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/VotingPanel/VotingPanel.tsx` |
| AC-9 | Flow 6, Edge Cases | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/room/useHostRoomSession.ts`, `src/realtime/roomChannel.ts` |
| AC-10 | Flow 7 | `src/domain/room.ts`, `src/domain/room.test.ts`, `src/features/room/useGuestRoomSession.ts`, `src/realtime/roomChannel.ts`, `tests/e2e/US-002-vote-on-stories.spec.ts` |

## Test ID Map

Unit test names must include `US-002` and their test-case IDs after `docs/test-cases/US-002-test-cases.md` is authored. E2E coverage must use separate browser contexts for Host and Guests and verify the Public view payload itself contains no Vote values before Reveal, not only the rendered text. Page objects and E2E cases use the `data-testid` names defined above.

| AC | Test coverage |
|---|---|
| AC-1–AC-3 | Vitest Reducer and title-normalization cases; Playwright Host/Participant Round flow. |
| AC-4 | Vitest Public view projection and E2E inspection of Guest-received `room:state` before Reveal. |
| AC-5–AC-9 | Vitest Reducer state/authorization cases and Playwright Reveal, blocked-action, and Next story flows. |
| AC-10 | Playwright Guest joins during `voting`, observes current Story, then casts a Vote. |

## Infrastructure needs

- Existing Supabase Realtime channel `room:${roomCode}` and existing events `room:intent`, `room:state`, and `room:rejected`; no new channel or database.
- Existing Host snapshot storage key `story-app:host-room`, expanded to contain RoomState; existing per-tab Participant identity remains under `story-app:participant`.
- No new environment variables, dependencies, database tables, or backend service.

## Open questions

1. **Transport identity limitation:** The existing Broadcast contract carries a `participantId`, but does not cryptographically authenticate the sender. The Reducer must derive role from the Room roster and reject a declared Guest actor for Host-only actions; however, a sender could attempt to claim the Host's known ID. Confirm whether this limitation is acceptable for US-002 or whether stronger Host authentication is required; the latter would require an architecture decision and is outside this spec's current scope.
2. **Priority:** The requirements mark story priority TBD; Product Owner to assign during refinement. This does not change implementation behavior.
3. **Mockup:** No visual is provided; use the simple functional layout implied by the test IDs unless Design supplies an approved mockup.

Definition of Done: as in `.github/copilot-instructions.md`.

## UI Design Spec

### Design language

Keep the existing light theme: indigo-600 accent, slate/white base, Tailwind v4 inline classes only.
No dark mode. No new CSS files.

### Layout -- full viewport card area

The room view fills the viewport height. The card grid is the hero: it must feel large and
immediate, like a physical card on a table.

```
+--------+------------------------------------------+
|        |  ROOM CODE: TZHDSS      [share link]     |
|        +------------------------------------------+
|Players |                                           |
|        |  [Story title if set]                    |
| van    |                                           |
| Host   |  +------+ +------+ +------+              |
| Voted  |  |  0   | |  1   | |  2   |              |
|        |  |      | |      | |      |              |
| Bob    |  +------+ +------+ +------+              |
| -- nv  |  +------+ +------+ +------+              |
|        |  |  3   | |  5   | |  8   |              |
| Voting |  |      | |      | |      |              |
|        |  +------+ +------+ +------+              |
|        |  +------+ +------+ +------+              |
|        |  |  13  | |  21  | |  ?   |              |
|        |  |      | |      | |      |              |
|        |  +------+ +------+ +------+              |
|        |                                           |
|        |  [        Reveal votes         ]         |
+--------+------------------------------------------+
```

Outer wrapper: `flex h-screen overflow-hidden bg-slate-50`.
Left sidebar: `w-52 shrink-0 border-r border-slate-200 bg-white flex flex-col p-4 gap-3`.
Right panel: `flex-1 flex flex-col gap-4 p-6 overflow-auto`.

Below `md:` breakpoint: `flex-col` (sidebar on top, cards below).

### Header row (inside right panel)

`flex items-center justify-between` at top of right panel.
Room code: `font-mono text-xl font-bold tracking-widest text-slate-900`,
`data-testid="room-code-value"`.
Share link: small `text-indigo-600 underline text-sm`, `data-testid="share-link"`.

### Component: Players sidebar

Title: `text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2`.
List `data-testid="participant-list"`. Each `<li>` `data-testid="participant-item"`:
`flex items-center justify-between py-2 text-sm`.

Name col: `font-medium text-slate-800`. Role badge inline: `text-xs text-slate-400 ml-1`.
Own row: `bg-indigo-50 rounded-lg px-2`.

Status indicator `data-testid="participant-vote-status"`:
- `waiting`: nothing
- `voting`: checkmark svg if voted (`text-indigo-500`), dash text if not (`text-slate-400`)
- `revealed`: vote value in `bg-indigo-100 text-indigo-700 rounded px-1.5 text-xs font-semibold`,
  or `--` if no vote

Phase badge `data-testid="room-phase"` at bottom of sidebar:
`flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-auto`.
Dot `w-2 h-2 rounded-full`: waiting=`bg-slate-400`, voting=`bg-indigo-500`, revealed=`bg-green-500`.

### Component: Card grid (hero)

Grid fills available height: `flex-1 grid grid-cols-3 gap-4 content-center`.
At `sm:` and above use `grid-cols-3` always (3 rows of 3 = 9 cards total).
Card values in order: 0, 1, 2, 3, 5, 8, 13, 21, ?

Each card: `flex items-center justify-center rounded-2xl border-2 cursor-pointer
select-none text-3xl font-bold transition-all duration-150`.
Minimum size: `min-h-[96px]` (grows with grid, portrait feel from aspect-[3/4] if needed).

States:
- Idle: `bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:scale-[1.04]`
- Selected: `bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.06]`
- Disabled (revealed phase or not your turn): `opacity-40 cursor-not-allowed pointer-events-none`

`data-testid` values: `card-0`, `card-1`, `card-2`, `card-3`, `card-5`, `card-8`,
`card-13`, `card-21`, `card-question`.

### Component: Story title area

`waiting` phase only: above card grid.
Label `text-sm text-slate-500` + input `data-testid="story-title"` same border/rounded style.
Start story button `data-testid="start-story"` below input, full width indigo-600.

`voting` or `revealed` phase: hide input, show title as
`text-lg font-semibold text-slate-800 mb-2`, `data-testid="current-story-title"`.
Skip entirely if `story.title` is null.

### Component: Action buttons

Below card grid, full width.

Reveal votes `data-testid="reveal-votes"`: host only, voting phase.
`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-base`

Reveal error `data-testid="reveal-error"` `role="alert"` above button:
`text-red-600 text-sm text-center`. Text: "At least one vote is required to reveal".

Next story `data-testid="next-story"`: host only, revealed phase. Same style.

Guests: no Start story input, no Reveal button, no Next story button.

### Token conventions

| Purpose | Classes |
|---------|---------|
| Primary action | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl` |
| Selected card | `bg-indigo-600 border-indigo-600 text-white shadow-xl` |
| Voted badge | `bg-indigo-100 text-indigo-700` |
| Own row | `bg-indigo-50` |
| Disabled | `opacity-40 cursor-not-allowed pointer-events-none` |
| Error | `text-red-600` |

### Files affected

- `src/features/room/RoomView.tsx` -- full viewport flex layout, sidebar component
- `src/features/VotingPanel/VotingPanel.tsx` -- hero card grid (flex-1), action buttons
- `src/App.tsx` -- change `max-w-5xl mx-auto` to `w-full` so layout fills viewport