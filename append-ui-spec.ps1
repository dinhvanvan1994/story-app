$uiSection = @'


## UI Design Spec

### Design language

The existing codebase uses indigo-600 as the primary accent on a slate/white light base (Tailwind v4,
no custom config). All new components must extend this language -- do not introduce a new palette or
dark mode. The goal is a focused, low-noise layout within the existing light theme.

### Layout -- Room view

Replace the current single-column `max-w-2xl` card with a two-column layout at `md:` breakpoint and
above. Below `md:` it stacks vertically.

```
+--------------------------------------------------+
| Story Pointing           [room code]  [share]    |
+--------------------------------------------------+
| +------------------+  +------------------------+ |
| | Players          |  | Story title input      | |
| |                  |  | (waiting phase only)   | |
| | Alice  [8]       |  +------------------------+ |
| | Bob    Voted     |  | Card grid              | |
| | Carol  --        |  | [0][1][2][3][5][8]     | |
| |                  |  | [13][21][?]            | |
| | Phase: voting    |  |                        | |
| +------------------+  | [Reveal] or [Next]     | |
|                       | error message          | |
|                       +------------------------+ |
+--------------------------------------------------+
```

Outer wrapper: `flex gap-6 items-start`. Left sidebar: `w-56 shrink-0`.
Right panel: `flex-1 min-w-0`. At `< md`: `flex-col`.

### Component: Players sidebar

Show one row per Participant. `data-testid="participant-list"` on the `<ul>`.
Each `<li>` has `data-testid="participant-item"`.
`data-testid="participant-vote-status"` on the status indicator (rightmost cell).

Status indicator by phase:
- `waiting`: no indicator shown
- `voting`: checkmark icon if voted, dash if not. Never show vote value.
- `revealed`: actual vote value in badge (`bg-indigo-100 text-indigo-700 rounded px-2 text-xs font-semibold`).
  Show "--" for participants who did not vote.

Current user's own row: `bg-indigo-50 font-semibold`.

Phase badge below the list: `data-testid="room-phase"`. Colored dot prefix:
- `waiting` -> `bg-slate-400`
- `voting` -> `bg-indigo-500`
- `revealed` -> `bg-green-500`

### Component: VotingPanel card grid

9 cards in portrait ratio. Use `grid grid-cols-3 gap-3` (or `grid-cols-5` at `sm:` for wider screens).
Card values in order: 0, 1, 2, 3, 5, 8, 13, 21, ?

Each card size: `h-20 w-14` (portrait). States:
- Idle: `bg-white border-2 border-slate-200 rounded-xl text-slate-700 text-2xl font-bold`
- Hover (enabled only): `hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105 transition-transform`
- Selected: `bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105`
- Disabled (`revealed` phase): `opacity-40 cursor-not-allowed` -- suppress hover styles

`data-testid` values: `card-0`, `card-1`, `card-2`, `card-3`, `card-5`, `card-8`,
`card-13`, `card-21`, `card-question` for `?`.

### Component: Story title area

Visible only in `waiting` phase:
- Label "Story title (optional)" + input `data-testid="story-title"` (same border/rounded styles)
- Start story button below: `data-testid="start-story"`, full width, indigo-600

In `voting` or `revealed` phase: hide input. Show story title as heading above cards:
`data-testid="current-story-title"`, `text-lg font-semibold text-slate-800`.
Render nothing if `story.title` is null -- no placeholder.

### Component: Action buttons

Reveal votes (`data-testid="reveal-votes"`): Host only, `voting` phase.
Style: `bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 w-full`

Reveal error (`data-testid="reveal-error"`, `role="alert"`): between cards and button.
Exact text: "At least one vote is required to reveal". Style: `text-red-600 text-sm`.

Next story (`data-testid="next-story"`): Host only, `revealed` phase. Same style as Reveal button.

Guests: render card grid and sidebar only. Do not render Start story input, Reveal button,
or Next story button.

### Token conventions (inline Tailwind only -- no new CSS files)

| Purpose | Classes |
|---------|---------|
| Primary action button | `bg-indigo-600 hover:bg-indigo-700 text-white` |
| Selected card | `bg-indigo-600 border-indigo-600 text-white` |
| Voted badge (revealed) | `bg-indigo-100 text-indigo-700` |
| Own row highlight | `bg-indigo-50` |
| Disabled state | `opacity-40 cursor-not-allowed` |
| Error text | `text-red-600` |

### Files affected by UI spec

- `src/features/room/RoomView.tsx` -- switch to two-column layout, update participant sidebar
- `src/features/VotingPanel/VotingPanel.tsx` -- portrait card grid, story title area, action buttons
- `src/App.tsx` -- no changes needed (already `max-w-5xl`)
'@

$specPath = Join-Path $PSScriptRoot "docs\specs\US-002-dev-spec.md"

if (-not (Test-Path $specPath)) {
    Write-Error "File not found: $specPath"
    exit 1
}

Add-Content -Path $specPath -Value $uiSection -Encoding UTF8
Write-Host "Appended UI Design Spec to: $specPath"
