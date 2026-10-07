# update-ui-spec-v2.ps1
# Replaces the UI Design Spec section in US-002-dev-spec.md with v2 layout
# Pure ASCII -- verified before commit

$specPath = Join-Path $PSScriptRoot "docs\specs\US-002-dev-spec.md"

if (-not (Test-Path $specPath)) {
    Write-Error "File not found: $specPath"
    exit 1
}

$content = Get-Content $specPath -Raw -Encoding UTF8

# Remove existing UI Design Spec section if present (from append-ui-spec.ps1)
$sectionPattern = '(?s)\r?\n\r?\n## UI Design Spec.*$'
$content = [regex]::Replace($content, $sectionPattern, '')

$uiSection = @'


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
'@

$content = $content.TrimEnd() + $uiSection

Set-Content -Path $specPath -Value $content -Encoding UTF8 -NoNewline
Write-Host "Updated UI Design Spec v2 in: $specPath"
