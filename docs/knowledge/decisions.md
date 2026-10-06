# Architecture Decisions

All entries are accepted. Specs and code must follow them. To change one, add a new row that supersedes it (and mark the old row "Superseded by D-xxx"); do not edit a decision silently. Reference decisions in specs as "per D-004".

| ID | Decision | Choice | Why | Rejected alternative |
|---|---|---|---|---|
| D-001 | UI framework | React 19, TypeScript, Vite | Current Vite template installs React 19; one toolchain also serves Vitest. | React 18 (pinning older version adds friction, no feature we need) |
| D-002 | Styling | Tailwind CSS v4 | Official Vite plugin, no config file, fast to build a UI in one day. | Hand-written CSS or a component library (more setup time) |
| D-003 | Realtime transport | Supabase Realtime Broadcast, one channel per room, no database tables | Brief requires no custom backend, no database, free tiers only; rooms are ephemeral. | Custom WebSocket server; database-backed rooms |
| D-004 | State authority | Host-authoritative: host tab holds room state, applies actions through a pure reducer, broadcasts the public view; guests only send intents | Broadcast has no server logic; a single owner avoids conflicting writes; reducer is easy to unit test. Consequence: room ends if host closes the tab (out of scope: host migration). | Every client keeps and merges its own state |
| D-005 | Vote privacy | Vote values never leave the host before reveal; only the public view is broadcast | Success criterion 2. Hiding values only in the UI would leak them in network messages. | Broadcast all votes and hide them in the UI |
| D-006 | Identity per tab | `sessionStorage` | Two tabs of one browser must act as two participants (demo and E2E); `localStorage` would merge them into one. A refresh keeps the identity. | `localStorage` |
| D-007 | Average calculation | Exclude `?` votes | `?` is not a number; success criterion 3. | Count `?` as 0 |
| D-008 | Point scale | Fixed: 0, 1, 2, 3, 5, 8, 13, 21, `?` | Brief; custom scales are out of scope. | Configurable scale |
| D-009 | Testing | Vitest (unit), Playwright (E2E) | Vitest shares the Vite config; Playwright runs Chrome and Firefox, needed for success criteria 1 and 5. | Jest; Cypress |
| D-010 | Hosting | Vercel | Free tier, public URL for criterion 5, deploys from Git. | Self-hosting |

## Open questions
None.
