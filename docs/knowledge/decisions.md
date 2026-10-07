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
| D-011 | Message ordering | Every public view carries a `revision` (starts at 1, +1 per accepted change on the host); a guest applies a view only if it holds none or the incoming revision is higher | Spike check C5: Broadcast does not guarantee order (received 1,2,3,4,5,6,9,7,8,10). | Rely on arrival order; sequence numbers per sender |
| D-012 | Connection readiness and timeouts | Host shows the room only after its channel is `SUBSCRIBED` and gives up after 10 s (AC-19); guest gives up after 5 s (AC-7) | Spike check C1: host first connection took 2669 ms, guests 427–568 ms; a room shown too early would miss a guest's first intent. | Show the room immediately; same 5 s timeout for the host |
| D-013 | Channel and event names | Channel `room:${roomCode}`; events `room:intent` (guest to host), `room:state` (host to all), `room:rejected` (host to guest) | One channel per room (D-003); event names state direction and purpose. | One generic event with a type field |

## Open questions
None.
