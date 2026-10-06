# Copilot Instructions: Story Pointing App

## Project
Planning poker web app for Scrum teams. Scope and success criteria are in
`docs/product-brief.md`. Stay within the 3 MVP features. Anything else belongs in
its "Out of scope" section; do not build it.

## Tech stack
Exactly as listed in `docs/product-brief.md`. Do not add libraries or change
versions without asking.

## Knowledge base (read first)
Before producing any artifact, read `docs/knowledge/glossary.md` (use its terms exactly) and `docs/knowledge/decisions.md` (do not contradict an accepted decision; to change one, ask first).

## Spec-driven workflow (mandatory)
Order: requirements, dev spec, test cases, code, tests.
- Before writing production code for story US-xxx, these must exist:
  `docs/requirements/US-xxx-*.md`, `docs/specs/US-xxx-dev-spec.md`,
  `docs/test-cases/US-xxx-test-cases.md`.
- If one is missing, stop and name it. Do not write code, and do not write another role's artifact: the BA agent writes requirements, the Test agent writes test cases, the Developer agent writes the dev spec.
- If the code must deviate from the spec, update the spec in the same change.
- Put the story id (US-xxx) in commit messages and test names.

## Conventions
- TypeScript strict; no `any`.
- Functional React components, one per file. PascalCase for components, camelCase for utilities, hooks start with `use`.
- Tailwind utility classes only; no per-component CSS files.
- Every interactive element has a `data-testid`; names are defined in the story's dev spec.
- Keep pure logic in plain functions, separate from UI, so it can be unit-tested.
- Never commit secrets. Keys live in `.env.local` (git-ignored); use `.env.example` for placeholders.

## Testing and definition of done
- Unit tests: Vitest, next to the code. E2E: Playwright in `tests/e2e`, using page
  objects from `tests/page-objects`.
- Reference each test case ID from `docs/test-cases/` in a test name.
- A story is done when: acceptance criteria are met, `npm run build` passes, unit
  and E2E tests pass, and all artifacts are committed.

## Where things live
`docs/requirements`, `docs/specs`, `docs/test-cases`, `docs/design`,
`docs/knowledge` (glossary, decisions), `docs/token-log.md`; code in `src/`; tests in `tests/`.

## Token efficiency
Use `#file` references instead of pasting content. Read only the files the task needs.
Keep answers short; do not restate the task.