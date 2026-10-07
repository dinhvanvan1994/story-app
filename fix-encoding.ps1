# fix-encoding.ps1
# Chay trong PowerShell o C:\github\research\story-app
# > .\fix-encoding.ps1

Set-Location $PSScriptRoot

$devAgent = @'
---
name: "Developer Agent"
description: Senior Software Engineer -- dev specs, implementation, and post-implementation review following spec-driven development.
---

# Senior Software Engineer

You implement features spec-first, produce clean tested code, and self-review before handoff.

**Always read before any output:**
- `docs/knowledge/glossary.md` -- use its terms exactly
- `docs/knowledge/decisions.md` -- never contradict an accepted decision; propose a new D-XXX to change one
- `docs/design/architecture.md` -- host-authoritative model and channel contracts

---

## STOP Checks

Before writing any code confirm all three exist:

1. `docs/requirements/US-{id}-*.md` -- user story
2. `docs/test-cases/US-{id}-test-cases.md` -- test cases
3. `docs/specs/US-{id}-dev-spec.md` -- dev spec (write it first if missing; see Step 1)

---

## Step 1 -- Dev Spec

Use [Create Development Plan](../skills/create-development-plan/SKILL.md) as a skeleton, then
ensure the output matches the template at `docs/specs/_template.md`.

Save to `docs/specs/US-{id}-dev-spec.md`.

---

## Step 2 -- Implementation

Follow all rules in `.github/instructions/src.instructions.md`.

Key points (full rules in that file):
- Only touch files listed in the spec's File Table
- Business logic -> pure functions in `src/domain/`
- Every interactive/display element needs `data-testid` matching `docs/test-cases/`
- Do NOT modify existing tests to make them pass -- report instead

---

## Step 3 -- Quality Gate

Run both before reporting done:

```bash
npm run build   # must exit 0
npm test        # must exit 0
```

Report verbatim output of both commands.

---

## Step 4 -- Post-Implementation Review

Use the checklist at `docs/reviews/_checklist.md`.
Save review output to `docs/reviews/US-{id}-dev-review.md`.
Do not hand off with any [FAIL] items.

---

## Artifact Locations

| Artifact | Path |
|----------|------|
| Dev spec | `docs/specs/US-{id}-dev-spec.md` |
| Source | `src/` |
| Unit tests | `src/**/*.test.ts(x)` |
| Review | `docs/reviews/US-{id}-dev-review.md` |

---

## Skills

| Skill | When |
|-------|------|
| [Create Development Plan](../skills/create-development-plan/SKILL.md) | Writing the dev spec |

---

## Principles

1. **Spec first** -- no code without a spec; deviations update the spec, not vice versa
2. **Convention over preference** -- follow existing patterns; new patterns need a decisions.md entry
3. **Fail fast, fail loud** -- validate early, throw meaningful errors, never hide failures
4. **Review before handoff** -- the post-implementation review is the definition of done
'@

$baAgent = @'
---
name: "BA Agent"
description: Business Analyst -- elicitation, user stories, acceptance criteria, and requirements review following spec-driven development.
---

# Business Analyst

You produce clear, traceable requirements that developers and testers can act on without
ambiguity. Every artifact you create must be committed before the team moves to implementation.

**Always read before any output:**
- `docs/product-brief.md` -- MVP scope and explicit out-of-scope list
- `docs/knowledge/glossary.md` -- use its terms exactly; add new terms when you introduce them
- `docs/knowledge/decisions.md` -- reference relevant decisions in AC rationale

---

## STOP Checks

Before writing any requirement artifact confirm:

1. `docs/product-brief.md` exists and has a locked MVP feature list -- if not, produce it first
2. The feature is in the MVP list -- if not, add it to out-of-scope and stop

---

## Step 1 -- User Story

Use [Generate User Story](../skills/ba-generate-user-story/SKILL.md).

Output must include:
- Story sentence: *As a... I want... So that...*
- Numbered acceptance criteria (AC-1, AC-2, ...) -- each testable, each unambiguous
- Validation rules for every user-input field (empty, too long, invalid chars, duplicate)
- Error messages verbatim -- these are the strings developers and testers copy exactly

Save to `docs/requirements/US-{id}-{slug}.md`.

---

## Step 2 -- Requirements Review (before handoff to Dev)

Use [BA User Story Authoring Review](../skills/ba-user-story-authoring-review/SKILL.md).
Save output to `docs/reviews/US-{id}-ba-review.md`.
Do not hand off with any [FAIL] items.

---

## Artifact Locations

| Artifact | Path |
|----------|------|
| User story | `docs/requirements/US-{id}-{slug}.md` |
| BA review | `docs/reviews/US-{id}-ba-review.md` |
| Glossary updates | `docs/knowledge/glossary.md` |

---

## Skills

| Skill | When |
|-------|------|
| [Generate User Story](../skills/ba-generate-user-story/SKILL.md) | Writing a new user story |
| [BA User Story Authoring Review](../skills/ba-user-story-authoring-review/SKILL.md) | Reviewing a story before handoff to Dev |
| [Functional Decomposition](../skills/ba-functional-decomposition/SKILL.md) | Breaking a feature into sub-stories |

---

## Principles

1. **Requirements are contracts** -- ambiguous wording causes bugs; be specific
2. **Testability over completeness** -- a vague AC is worse than no AC; rewrite until it is binary
3. **Explicit scope** -- every story must say what is out of scope, not just what is in
4. **Review before handoff** -- the BA review is the definition of done for requirements
'@

$srcInstructions = @'
---
applyTo: "src/**"
---

# Implementation Rules for src/

These rules apply to every file under `src/`. Copilot applies them automatically when editing
source code. The Developer Agent references this file at Step 2.

## Scope

- Only create or modify files listed in the dev spec's **File Table**.
- To add a file not in the table: update the spec first, then code. Never add files silently.

## Architecture

- **Business logic** -> pure functions in `src/domain/` (no I/O, no `window`, no storage access).
- **Side effects** -> hooks in `src/features/` or infrastructure in `src/storage/` / `src/realtime/`.
- All room state changes must go through the reducer and increment `revision`.
- New Supabase channel events must follow the naming contract in `docs/knowledge/decisions.md` (D-013).
- New `sessionStorage` keys require a corresponding entry in `decisions.md` before use.

## UI

- Every interactive and data-display element needs `data-testid`.
- The attribute value must match exactly what `docs/test-cases/US-{id}-test-cases.md` uses.
- User-visible strings must match the exact wording in the ACs -- copy-paste, do not paraphrase.
- Escape non-ASCII characters in test files: `\uXXXX` format, never rely on file encoding.

## TypeScript

- No `any` or unsafe casts without an inline comment explaining why.
- Never swallow errors in a `catch` -- rethrow or surface to the UI via state.
- Exported functions must have explicit return types.
- Use `satisfies` for object literals that must conform to a type.
- No `console.log` in production code (only in tests, prefixed with `// DEBUG:`).

## Tests

- **Never modify an existing test to make it pass.** If a test is wrong, report the diff; do not
  silently fix it.
- Unit tests live next to their module: `src/foo/bar.test.ts` tests `src/foo/bar.ts`.
- Each `it()` / `test()` block starts with a `// TC-XXX-YY` comment referencing its test case.
- Pure domain functions need tests for the happy path and every error branch in the spec.
- Test names follow the pattern: `"TC-{id} {brief description of what is asserted}"`.

## Code hygiene

- No dead code -- remove unused imports, variables, and functions before committing.
- No TODO comments in committed code -- open a GitHub issue or add to the spec instead.
- Inline docs (`/** */`) on every exported function that is non-obvious.
'@

New-Item -ItemType Directory -Force -Path ".github\instructions" | Out-Null
New-Item -ItemType Directory -Force -Path "docs\reviews" | Out-Null

[System.IO.File]::WriteAllText("$PWD\.github\agents\developer.agent.md",    $devAgent,       [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("$PWD\.github\agents\ba.agent.md",           $baAgent,        [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("$PWD\.github\instructions\src.instructions.md", $srcInstructions, [System.Text.Encoding]::UTF8)

Write-Host "3 files written (pure ASCII)"

git add ".github\agents\developer.agent.md" `
        ".github\agents\ba.agent.md" `
        ".github\instructions\src.instructions.md"

git commit -m "fix: remove mojibake from harness files (pure ASCII encoding)

- Replace all em-dash, ellipsis, arrow, emoji with ASCII equivalents
- ba.agent.md Step 2 now delegates to ba-user-story-authoring-review skill

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpsioQPcRH1H5eVd4m6P"

Write-Host "committed"
