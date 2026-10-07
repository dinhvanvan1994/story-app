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
- User-visible strings must match the exact wording in the ACs â€” copy-paste, do not paraphrase.
- Escape non-ASCII characters in test files: `\uXXXX` format, never rely on file encoding.

## TypeScript

- No `any` or unsafe casts without an inline comment explaining why.
- Never swallow errors in a `catch` â€” rethrow or surface to the UI via state.
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

- No dead code â€” remove unused imports, variables, and functions before committing.
- No TODO comments in committed code â€” open a GitHub issue or add to the spec instead.
- Inline docs (`/** */`) on every exported function that is non-obvious.