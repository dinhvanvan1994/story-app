---
name: create-development-plan
description: Use when you create development plan for a user story.
---

# Planning and Clarifying

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

Don't go into too much detail about the implementation. Be less prescriptive about actual code, more focused on what needs to be done.

Announce at start: "I'm using the writing-plans skill to create the implementation plan."

## The Planning Process

**Do NOT write code during planning.**

### Step 1: Clarify the unclear points

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it — don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report — ask the rest of the frontier now. The _decisions_ are the user's — put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

Write the plan in a way that is **self-contained**: the engineer should be able to implement it without asking you any questions. If you find yourself writing "ask the user" in a task, that means you haven't clarified the design tree enough yet.

### Step 2: Enter Plan Mode

- Read the user story and relevant codebase sections
- Identify existing patterns and conventions
- Identify the tasks needed to implement the user story
- Note risks and unknowns

## Output Files

The output is a plan document saved to: `docs/development-plans/YYYY-MM-DD-<userstorynumber>.md`

Create the `docs/development-plans` directory if it does not exist.

## Plan Document Template

Use the template at [assets/plan-template.md](assets/plan-template.md).