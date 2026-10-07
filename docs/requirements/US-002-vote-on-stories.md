# US-002 — Vote on Stories

## 1. Story metadata

| Field | Value |
|---|---|
| Story ID | US-002 |
| Feature | MVP feature 2 — Vote on Stories |
| Status | Ready for dev spec |
| Priority | TBD |
| Depends on | US-001 — Create & Join Room |
| Source | Product brief, architecture decisions, glossary, and story context provided for US-002 |

## 2. User story

**Host:** As a Host, I want to start a Story and reveal the Participants' Votes, so that the team can estimate the Story together without seeing one another's Votes beforehand.

**Participant:** As a Participant, I want to choose or change one Card during a Round, so that I can contribute my estimate while my Vote remains private until Reveal.

## 3. Preconditions

- A Room exists and the Host and any participating Guests have joined it, as specified in US-001.
- The Room is in the `waiting` Phase before the Host starts a Story.
- The Participant is a member of the Room to cast a Vote. A Guest may join while the Room is in the `voting` Phase and vote in that Round.

## 4. Assumptions

| ID | Assumption | Impact if wrong |
|---|---|---|
| A-1 | Each Participant has at most one current Vote in a Round. Choosing another Card before Reveal replaces that Participant's current Vote. | Changes the vote model and the behavior of changing a Vote. |
| A-2 | When the optional Story title is omitted, the Host can start the Round without a title; no placeholder title is implied. | Changes how a title-less Round is presented. |
| A-3 | A Room's current Story, Phase, and Votes are authoritative in the Host tab and saved with its session snapshot; Guests send Intents, and only the Host applies state changes and broadcasts the Public view, per D-004 and D-005. | Changes state authority, refresh behavior, and privacy guarantees. |
| A-4 | Next story is a Host action and clears the current Story as well as all Votes when returning the Room to `waiting`, consistent with the glossary definition. | Changes who can advance the Round or what state remains after advancing. |
| A-5 | A Guest who joins during `voting` receives the current Story and Phase and can cast a Vote in the current Round. | Changes whether mid-Round participation is supported. |

## 5. Workflow notes

1. In the `waiting` Phase, the Host starts a Story, optionally providing a title. This begins a Round and moves the Room to `voting`.
2. While the Room is `voting`, each Participant, including the Host, may cast one current Vote using a Card from the fixed Fibonacci scale. A Participant may change that Vote before Reveal.
3. Before Reveal, a Participant sees their own Vote value. Other Participants' values remain private; each is shown only as “Voted” or “Not voted”.
4. The Host may Reveal once at least one Vote has been cast. After Reveal, every Participant can see every Vote value. No Participant may vote after Reveal.
5. The Host selects Next story to clear the current Story and Votes and return the Room to `waiting`.
6. A Guest joining during `voting` sees the current Story and may vote in the active Round.

**UI or mockup reference:** TBD; no mockup or wireframe was provided.

## 6. Acceptance criteria

### AC-1 — Host starts a Story with an optional title

**Given** the Room is in the `waiting` Phase  
**And** the Host may enter a Story title or leave it omitted  
**When** the Host starts the Story  
**Then** the Room enters the `voting` Phase and a Round begins  
**And** the title input is trimmed of leading and trailing whitespace before use  
**And** if the trimmed title is empty or was omitted, the current Story has no title  
**And** if the trimmed title is non-empty, it becomes the current Story title  
**And** all Votes for the new Round are empty.

### AC-2 — Participant casts one Vote from the Fibonacci scale

**Given** the Room is in the `voting` Phase  
**When** a Participant chooses a Card  
**Then** the Participant has one current Vote for the Round with exactly that Card's value  
**And** the value is one of `0`, `1`, `2`, `3`, `5`, `8`, `13`, `21`, or `?`  
**And** choosing `?` records an abstention, which is excluded from the Average per D-007.

### AC-3 — Participant changes a Vote before Reveal

**Given** the Room is in the `voting` Phase  
**And** a Participant already has a Vote  
**When** that Participant chooses a different Card  
**Then** the current Vote is replaced with the newly chosen value  
**And** the Participant still has only one current Vote in the Round.

### AC-4 — Votes remain private before Reveal

**Given** the Room is in the `voting` Phase  
**And** at least one Participant has voted  
**When** a Participant views the Room before Reveal  
**Then** that Participant sees their own Vote value  
**And** for every other Participant, sees only “Voted” or “Not voted”  
**And** no other Participant's Vote value is exposed in the Public view before Reveal, per D-005.

### AC-5 — Host Reveals Votes

**Given** the Room is in the `voting` Phase  
**And** at least one Vote has been cast  
**When** the Host triggers Reveal  
**Then** the Room enters the `revealed` Phase  
**And** every Participant can see all Participants' Vote values, including `?`.

### AC-6 — Host cannot Reveal when there are no Votes

**Given** the Room is in the `voting` Phase  
**And** no Participant has voted  
**When** the Host attempts to Reveal  
**Then** the Room remains in the `voting` Phase  
**And** no Vote values are revealed  
**And** the UI displays the message "At least one vote is required to reveal".

### AC-7 — Only the Host can start a Story or trigger Reveal

**Given** a Guest is in the Room  
**When** the Guest attempts to start a Story or trigger Reveal  
**Then** the requested action is not applied  
**And** the Room's Story, Phase, and Votes remain unchanged  
**And** the Start story button and Reveal button are not visible to Guests.

### AC-8 — Participant cannot Vote after Reveal

**Given** the Room is in the `revealed` Phase  
**When** any Participant attempts to choose or change a Card  
**Then** the Vote is not changed  
**And** the Room remains in the `revealed` Phase  
**And** all Card buttons are disabled.

### AC-9 — Next story resets the Round

**Given** the Room is in the `revealed` Phase  
**When** the Host selects Next story  
**Then** the current Story and all Votes are cleared  
**And** the Room returns to the `waiting` Phase.

### AC-10 — Guest joining during voting can vote in the active Round

**Given** the Room is in the `voting` Phase with a current Story  
**When** a Guest joins the Room  
**Then** the Guest sees the current Story and `voting` Phase  
**And** the Guest can cast a Vote in that Round  
**And** the Guest's Vote follows the same pre-Reveal visibility rules as other Participants' Votes.

## 7. Story title field

| Field | Type | Rules | Error message |
|---|---|---|---|
| Story title | Optional text | Trimmed before use. Whitespace-only treated as empty (no title). No maximum length or character restrictions. | None -- empty/whitespace is silently treated as no title. |

## 8. Out of scope

- Displaying calculated Results such as Average, most common, highest, lowest, and Consensus; these belong to MVP feature 3, View Results.
- Story descriptions, custom Fibonacci scales, voting timers, and past-Round history.
- Accounts, a database, or persistence of Room state beyond the active Room/Host session.
- Host migration or changing the Host.
- Removing a Participant or Vote when a tab closes.

## 9. Non-functional requirements

- Vote privacy: before Reveal, Vote values must not leave the Host; Guests receive only the Public view with other Participants' values hidden, per D-005.
- State authority: the Host holds the Room state, applies Intents through the Reducer, and broadcasts the Public view, per D-004.
- Transport and storage: use Supabase Realtime Broadcast and the existing per-tab session model; do not add a database or custom backend, per D-003 and D-006.
- Realtime delivery is required for Participants in the Room to observe state changes. No additional timing threshold for Vote updates or Reveal was supplied.

## 10. Traceability

| Source | Relevant content |
|---|---|
| [Product brief](../product-brief.md) | MVP feature 2, target users, success criteria 2 and 4, and out-of-scope list. |
| [US-001 requirements](./US-001-create-and-join-room.md) | Room membership, Host and Guest identity, and supported Room lifecycle. |
| [Architecture decisions](../knowledge/decisions.md) | D-003 Realtime transport; D-004 Host authority; D-005 Vote privacy; D-006 per-tab identity; D-007 Average excludes `?`; D-008 fixed point scale; D-011 revision ordering; D-013 event names. |
| [Glossary](../knowledge/glossary.md) | Host, Guest, Participant, Intent, Card, Fibonacci scale, Vote, Reveal, Round, Phase, Public view, Next story, and Results terminology. |
| User-provided US-002 story context | Required AC coverage, Host/Participant behavior, vote visibility, late joining, and ephemeral state constraints. |

## 11. Open questions

1. ~~What validation rules apply to Story title?~~ **RESOLVED** -- see Section 7 and AC-1: trim whitespace, treat empty as no title, no max length.
2. ~~What user-visible feedback for blocked actions?~~ **RESOLVED** -- see AC-6 (error message), AC-7 (buttons hidden), AC-8 (buttons disabled).
3. Should Reveal be a one-way transition until Next story? The phases imply this, but no separate un-reveal behavior was specified. **DECISION: yes, one-way** -- no un-reveal; only Next story exits `revealed`.
4. Should a Participant be able to change their Vote after another Participant has voted but before Reveal? **DECISION: yes** -- changing a Vote is allowed throughout the `voting` Phase (AC-3).
