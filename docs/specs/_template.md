# US-{id} Dev Spec — {feature name}

> Template for `docs/specs/US-{id}-dev-spec.md`.
> Delete this line and all `{placeholder}` markers before committing.

## Overview

One paragraph: what this story delivers and how it fits the existing architecture.
Reference the user story (`docs/requirements/US-{id}-*.md`) and any relevant decisions.

## Flows

Numbered flows. Each flow: **user action → system reaction → final observable state**.
Reference the ACs each flow satisfies (e.g. "satisfies AC-3, AC-7").

1. …
2. …

## File Table

| File | Action | Purpose |
|------|--------|---------|
| `src/…` | create / modify | … |

Only files listed here may be created or modified during implementation.

## Data Shapes

TypeScript interfaces and types that are new or changed. Use the exact names from
`docs/knowledge/glossary.md`.

```ts
// example
```

## Edge Cases & Errors

| Scenario | Expected behaviour | AC |
|----------|-------------------|-----|
| … | … | AC-N |

## Test ID Map

Maps each test case to the function / component that covers it.

| TC | Covered by |
|----|-----------|
| TC-{id}-NN | `src/…` |
