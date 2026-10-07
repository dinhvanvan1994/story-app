# Dev Spec: <US-ID> — <Short Title>

**Story:** `docs/requirements/<US-ID>-<slug>.md`  
**Date:** YYYY-MM-DD  
**Status:** Draft | In Review | Approved  
**Decisions referenced:** D-xxx, D-xxx

---

## 1. Approach

Short summary of the solution. Cite decisions by ID ("per D-004") instead of re-explaining them. State which layers are affected.

## 2. Data shapes

TypeScript types and message/event definitions this story needs. Name every event. Signatures only, no implementations.

## 3. Pure logic

For each pure function: signature, rules, order of checks, exact user-facing messages from the story.

## 4. Flows

Numbered steps for each flow in the story (happy path, refresh/restore, timeouts, rejections).

## 5. Files to create or change

Ordered by dependency. Each row is one bite-sized task.

| Order | Path | Purpose | AC served | Tests |
|---|---|---|---|---|
| 1 | `src/...` | one line | AC-x | unit: scenarios |

Keep logic in plain functions, separate from UI.

## 6. UI elements and data-testid

Binding names for page objects and tests.

| Element | Type | data-testid | Notes |
|---|---|---|---|
| e.g. display name input | input | `display-name-input` | |

## 7. Edge cases and error states

| Case | What the user sees | State change |
|---|---|---|

## 8. Unit test plan

| Function / unit | Scenarios | AC verified |
|---|---|---|

## 9. Traceability

Every AC of the story, none missing.

| AC | Spec section | Files |
|---|---|---|

## 10. Infrastructure needs

Short bullets: what this story needs from the environment (realtime channel use, browser storage, environment variables). Names and purposes only. Accounts, deployment and tooling belong to the architecture step.

## 11. Open questions

Anything the story does not settle, and any recommended answer you assumed. Write "None" if empty. Do not decide silently.

---

Definition of Done: as in `.github/copilot-instructions.md`.
