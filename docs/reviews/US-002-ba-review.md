# BA Review — US-002 Vote on Stories

## Artifact Header

| Field | Value |
|---|---|
| Project/Client | Story Pointing App |
| Module/Process/Domain | Planning poker — Vote on Stories |
| Artifact Purpose | Review requirements clarity, coverage, consistency, and readiness for development handoff |
| Audience | Product Owner, BA, Developer, Test, and delivery stakeholders |
| Source Inputs | [US-002 requirements](../requirements/US-002-vote-on-stories.md), [product brief](../product-brief.md), [glossary](../knowledge/glossary.md), [architecture decisions](../knowledge/decisions.md), and US-002 story context provided by the requester |
| Version/Date | 1.0 / 2026-10-08 |
| Author/Reviewer | BA review |
| Status | Review complete — **PASS with handoff notes** |

## 1. Overall Assessment

US-002 describes a coherent, demonstrable planning-poker Round from Story start through Reveal and Next story. It covers the supplied Host and Participant behaviors, uses the project vocabulary, and respects the Host-authoritative architecture and vote-privacy decision.

**Recommendation:** Ready for development specification and test-case design, with the handoff notes in this review carried forward. No blocking ambiguity was found for the required behaviors. Clarify the non-blocking observations below before implementation choices extend beyond this story.

## 2. Review Results

| Review area | Result | Evidence and notes |
|---|---|---|
| Business outcome and actors | PASS | The Host starts a Story and triggers Reveal; a Participant (including Host) casts and may change a Vote. The story explains the value of private estimation. |
| Scope and MVP alignment | PASS | Scope maps to product-brief MVP feature 2. Calculated Results are explicitly excluded and remain in feature 3. |
| Preconditions and workflow | PASS | Room membership, `waiting` start Phase, voting flow, privacy before Reveal, and late-joining Guest are described. |
| Acceptance-criteria coverage | PASS | AC-1–AC-10 cover optional Story title, valid Cards, vote replacement, privacy, Reveal, no-vote rejection, Host-only actions, post-Reveal vote blocking, Next story, and mid-Round Guest voting. |
| Testability | PASS | Outcomes are observable through Phase, current Story, participant Vote visibility, disabled/hidden controls, and the exact no-vote message. |
| Business rules and data | PASS | The fixed Fibonacci scale is explicit; one current Vote per Participant per Round is captured; `?` is identified as abstention and excluded from Average. Story title optionality and normalization are described. |
| Privacy and architecture | PASS | Vote values remain Host-side until Reveal, Guests send Intents, and the Host is authoritative, consistent with D-004 and D-005. |
| Dependencies and traceability | PASS | US-001 dependency and source documents/decisions are identified. |
| INVEST / story size | PASS with note | The single-Round outcome is cohesive and independently demonstrable. It has ten ACs and two actor perspectives, so estimation should verify it fits the delivery iteration; do not split by implementation layer. |
| Definition of Ready | PASS with notes | Actor, value, preconditions, assumptions, scope, NFRs, and testable ACs are present. Priority is TBD and no mockup is supplied; neither blocks domain behavior but should be resolved if required by sprint intake. |

## 3. Acceptance Criteria Review

| AC | Result | Review notes |
|---|---|---|
| AC-1 — Host starts a Story with optional title | PASS | The `waiting` precondition, whitespace trimming, empty/omitted behavior, title assignment, and Vote reset are measurable. The title field rules agree with this AC. |
| AC-2 — Participant casts a Card | PASS | Enumerates every allowed value and gives `?` its abstention meaning. The Average calculation itself correctly remains in the Results feature. |
| AC-3 — Participant changes Vote before Reveal | PASS | Specifies replacement and the one-current-Vote invariant. |
| AC-4 — Vote privacy | PASS | Distinguishes own value from others' “Voted” / “Not voted” and explicitly prohibits exposing other values in the Public view before Reveal. |
| AC-5 — Host Reveals | PASS | Requires `revealed` Phase and all Vote values, including `?`, visible to every Participant. |
| AC-6 — Reveal with zero Votes is blocked | PASS | The state remains `voting`, no values are shown, and the exact user message is supplied. |
| AC-7 — Host-only actions | PASS with note | Guest actions do not change Room state, and the Start story and Reveal controls are hidden. The implementation/test design should also verify host-side authorization, since hidden controls alone do not prevent a crafted Guest Intent. No exact authorization error is required. |
| AC-8 — Voting after Reveal is blocked | PASS | Requires unchanged Vote and `revealed` Phase; disabled Cards are observable. |
| AC-9 — Next story resets | PASS | Clears current Story and all Votes and returns to `waiting`, consistent with the glossary. |
| AC-10 — Late Guest joins current Round | PASS | Requires current Story/Phase visibility, voting eligibility, and normal privacy behavior. |

## 4. Quality Findings and Handoff Notes

### Required handoff notes (non-blocking)

1. **Host authorization must be enforced in the Host-side action processing.** AC-7 describes the required outcome, but the Test plan should test a Guest attempt at the state/Intent boundary in addition to hidden controls. This preserves D-004 even if a Guest bypasses the UI.
2. **Confirm current-state behavior for exceptional lifecycle cases during test design.** The story defines normal transitions (`waiting` → `voting` → `revealed` → `waiting`) but does not specify starting another Story while already `voting` or `revealed`, or revealing when the Room is not `voting`. Implement only the defined transitions; add cases only if the Product Owner confirms these scenarios are in scope.
3. **Preserve the secret/public data boundary in test design.** AC-4's Public-view requirement should be validated against the data received by a Guest before Reveal, not only against rendered text.
4. **Priority remains TBD.** Product brief lists this as MVP feature 2 but provides no story-level priority. Product Owner may assign one during refinement.
5. **Mockup is TBD.** No visual artifact was supplied; behavior requirements remain usable without it. Add design input if visual approval is required.

### Consistency checks

- The user-provided `?` exclusion rule matches accepted decision D-007.
- The Fibonacci scale matches accepted decision D-008 and the glossary.
- Host authority and privacy match D-004 and D-005.
- “Next story”, “Phase”, “Vote”, “Card”, “Reveal”, “Host”, “Guest”, and “Participant” follow glossary usage.
- AC-6 exact message and AC-7/AC-8 UI behavior are now reflected in the current requirements artifact and resolve the earlier open questions.

## 5. Open Questions

No open question blocks development-spec or test-case work.

| Priority | Area | Question | Owner | Disposition |
|---|---|---|---|---|
| P2 | Product/backlog | What is the story-level priority for US-002? | Product Owner | Resolve during refinement; not a behavior blocker. |
| P2 | UX | Is a mockup required for this story, or is the behavior-only screen definition sufficient? | Product Owner / Design | Current artifact correctly marks the mockup TBD. |
| P2 | Business behavior | Should attempts to start while not `waiting` or Reveal while not `voting` receive additional user-facing feedback? | Product Owner | Outside the defined ACs; do not invent behavior. |

## 6. Traceability Table

| ID | Source | Requirement/Rule/Decision | Artifact Link | Owner | Status | Notes |
|---|---|---|---|---|---|---|
| BR-1 | Product brief | MVP feature 2: Vote on Stories | [Product brief](../product-brief.md) | Product Owner | Covered | AC-1–AC-4 |
| BR-2 | Product brief success criterion 2 | Other Participants' Vote values remain hidden before Reveal | [Product brief](../product-brief.md) | Product Owner / Developer | Covered | AC-4; D-005 |
| BR-3 | Product brief success criterion 4 | Full Round works without reload | [Product brief](../product-brief.md) | Developer / Test | Covered | Workflow and AC-1–AC-10 |
| D-004 | Accepted architecture decision | Host-authoritative state and Guest Intents | [Decisions](../knowledge/decisions.md) | Developer | Covered | AC-7 needs Host-side authorization test coverage |
| D-005 | Accepted architecture decision | Vote values do not leave Host before Reveal | [Decisions](../knowledge/decisions.md) | Developer / Test | Covered | AC-4 and NFRs |
| D-007 | Accepted architecture decision | Exclude `?` from Average | [Decisions](../knowledge/decisions.md) | Developer | Covered | AC-2 captures abstention; calculation belongs to Results |
| D-008 | Accepted architecture decision | Fixed Fibonacci scale | [Decisions](../knowledge/decisions.md) | Developer / Test | Covered | AC-2 |
| US-001 | Existing story | Room creation, membership, and Host/Guest identity | [US-001 requirements](../requirements/US-001-create-and-join-room.md) | Developer / Test | Dependency | Preconditions |
| US-002 | Story under review | Vote on Stories | [US-002 requirements](../requirements/US-002-vote-on-stories.md) | BA / Product Owner | Reviewed | AC-1–AC-10 |

## 7. Risk, Assumption, Issue, Dependency Log

| Type | Description | Impact | Owner | Due Date | Status |
|---|---|---|---|---|---|
| Risk | If Guest Intent authorization is implemented only by hiding UI controls, a Guest could bypass the UI and alter Host-authoritative state. | Unauthorized Story/Reveal state changes; conflicts with D-004. | Developer / Test | Before acceptance | Mitigation noted |
| Risk | A test that checks only rendered Vote text may miss Vote values leaking through the Guest's received Public view. | Violation of D-005 despite apparently correct UI. | Test | Test design | Mitigation noted |
| Assumption | One current Vote per Participant per Round; changing it replaces the previous Vote. | Vote map and replacement semantics depend on it. | Product Owner | Refinement | Explicit in requirements |
| Dependency | US-001 Room membership and Host identity must be available. | US-002 cannot be used without a Room. | Developer | Before integration | Accepted |
| Issue | Priority and mockup are TBD. | Backlog ordering/design sign-off may be delayed. | Product Owner / Design | Refinement | Non-blocking |

## 8. Approval / Next Actions

| Action | Owner | Due Date | Expected Output |
|---|---|---|---|
| Confirm story priority and whether a mockup is required | Product Owner / Design | Backlog refinement | Prioritized, design disposition |
| Ensure Host-side action authorization and pre-Reveal Public-view privacy are included in test design | Developer / Test | Before implementation handoff | Verifiable authorization and privacy cases |
| Continue with US-002 development-spec authoring | Developer | Next workflow step | `docs/specs/US-002-dev-spec.md` |
| Continue with US-002 test-case design | Test | Before production implementation | `docs/test-cases/US-002-test-cases.md` |

## Saved Artifact

Review saved to `docs/reviews/US-002-ba-review.md`.
