---
name: create-development-plan
description: Use when you create the dev spec (development plan) for a user story. Output goes to docs/specs/US-<id>-dev-spec.md.
---

# Planning and Clarifying

## Overview

Write a self-contained dev spec for one user story, assuming the engineer has zero context for this codebase. Document what they need: files to create or touch, data shapes, flows, UI test ids, edge cases, tests, and how each acceptance criterion is covered. Break the work into bite-sized, ordered tasks. DRY. YAGNI.

Assume a skilled developer who does not know our toolset or domain and does not know good test design. Be less prescriptive about actual code, more focused on what needs to be done.

Announce at start: "I'm using the create-development-plan skill to write the dev spec for <story id>."

## The Planning Process

**Do NOT write production code during planning.** Type and function signatures are allowed; implementations are not.

### Step 1: Read the context first

Before asking anything, read:
- the user story in `docs/requirements/US-<id>-*.md` (acceptance criteria, field definitions, assumptions)
- `docs/knowledge/decisions.md` (accepted decisions; cite them by ID, for example "per D-004", and never contradict them)
- `docs/knowledge/glossary.md` (use its terms exactly)

### Step 2: Clarify only what is still unclear

Ask only about decisions that the story, the decisions file and the glossary do not settle. Map them as a **design tree**: every decision branches into the decisions that hang off it. Ask the whole frontier (every question whose prerequisites are settled) in **one round**, numbered, each with your recommended answer:

```
❓ **Q1** - **<question title>**: <question body, may include multiple choices>

➡️ <your recommended answer>
```

Finding _facts_ (files, tools, versions) is your job, never the user's: look them up yourself. The _decisions_ are the user's.

If the user does not answer, proceed with your recommended answers and list each one under "Open questions" in the spec. Never decide silently. If a task would need "ask the user", the design tree is not clear enough yet.

### Step 3: Plan

- Identify existing patterns and conventions in the codebase
- Identify the tasks needed to implement the story, ordered by dependency
- Note risks and unknowns

## Output Files

The output is a dev spec saved to: `docs/specs/US-<id>-dev-spec.md` (for example `docs/specs/US-001-dev-spec.md`).

- Do NOT use `docs/development-plans/` and do NOT add a date to the file name.
- The `docs/specs/` directory already exists. Create no other file.

## Spec Template

Use the template at [assets/plan-template.md](assets/plan-template.md). Keep every section, in order. Keep the spec under about 250 lines. Every acceptance criterion of the story must appear in the traceability table.
