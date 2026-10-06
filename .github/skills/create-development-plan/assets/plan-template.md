# Development Plan: <User Story ID> — <Short Title>

**Date:** YYYY-MM-DD  
**Author:** <name>  
**Status:** Draft | In Review | Approved

---

## 1. Background & Context

Brief explanation of why this work exists, what problem it solves, and any relevant business or technical context the engineer needs before diving in.

---

## 2. Design Decisions

Key decisions made during clarification (from the design tree process):

| Decision | Choice | Rationale |
|----------|--------|-----------|
| e.g. API approach | REST endpoint | Aligns with existing patterns |

---

## 3. Architecture / Approach

High-level description of the solution approach. Include:
- Which layers are affected (UI, API, DB, etc.)
- Any new dependencies or third-party integrations
- Data flow or sequence if non-trivial (link to diagram if available)

---

## 4. Task Breakdown

Each task should be independently completable. Order them by dependency.

### Task 1: <Title>
**Files to change:**
- `src/path/to/file.ts` — describe what changes

**What to do:**
- Step-by-step description (no code unless essential)

**Tests to write/update:**
- Unit: describe scenarios
- Integration: describe scenarios

---

### Task 2: <Title>
...

---

## 5. Files & References

Existing files the engineer should read before starting:

| File | Why it's relevant |
|------|--------------------|
| `src/services/foo.ts` | Contains the pattern to follow |
| `docs/api-conventions.md` | API naming rules |

---

## 6. Risks & Unknowns

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| e.g. Third-party API rate limits | Medium | Add retry logic |

---

## 7. How to Test Locally

Step-by-step instructions to verify the feature works end-to-end in a local environment.

1. Run `<command>`
2. Navigate to `<url>`
3. Expect `<outcome>`

---

## 8. Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit and integration tests written and passing
- [ ] No linting / type errors
- [ ] PR description links to this plan
- [ ] Reviewed and approved by at least one peer
- [ ] Documentation updated (if applicable)
