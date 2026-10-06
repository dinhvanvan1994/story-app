---
name: ba-generate-user-story
description: Generate, refine, split, or review Agile user stories from rough feature ideas, business requirements, meeting notes, screen descriptions, process flows, or backlog items. Use when the user asks to "generate user story", "write a user story", "create acceptance criteria", "turn this into a backlog item", "split this story", or prepare a sprint-ready story with business value, Gherkin acceptance criteria, assumptions, out-of-scope notes, NFRs, and traceability.
---

# BA Generate User Story

## Purpose

Use this skill to turn raw product or business input into a clear, testable Agile user story. Prefer business-facing language, vertical slices, and acceptance criteria that a delivery team can implement and QA can verify.

## Context First

1. Extract confirmed facts from the prompt and any provided files, links, screenshots, or existing stories.
2. If working inside a repository that has `.workspace/` or `.agents/`, read the local project/workflow context and relevant BA rules before creating or saving story artifacts.
3. Prefer local story templates and standards when they exist, especially `.agents/templates/user-story-template.md` and `.workspace/rules/ba/user-story/`.
4. Ask only for blocking gaps that materially change the story, usually primary user role, business goal, value, parent epic, or scope boundary. If the user wants a fast draft, proceed with explicit assumptions.

## Workflow

1. Identify the business outcome.
   - Name the actor, capability, value, target workflow, source evidence, and boundaries.
   - Separate confirmed requirements from assumptions, recommendations, and open questions.

2. Choose the story shape.
   - Generate vertical business slices that include the complete user outcome.
   - Do not split by implementation layer such as API, database, UI component, logging, or infrastructure.
   - Do not create micro-interaction stories for button clicks, loaders, popups, field validation, or modal display unless they represent a distinct business capability.
   - Split only when there is meaningful separation by business capability, workflow stage, user role, release priority, operational handling, complexity, or independent demonstrability.

3. Draft the story.
   - Use "As a / I want / So that" for the story statement.
   - Include preconditions, assumptions, main workflow notes, out-of-scope items, NFRs, traceability, and open questions when relevant.
   - Write acceptance criteria in Gherkin or clear Given/When/Then form unless the user requests another format.
   - Include at least one happy path and one negative, boundary, permission, state, or error scenario when applicable.
   - Keep NFRs traceable to source input; do not invent thresholds.

4. Handle UI stories.
   - If a mockup, screenshot, Figma URL, or wireframe is provided, reference it and extract visible business-relevant UI behavior.
   - If no visual exists, mark the mockup/wireframe as `TBD` unless the user asks to create one.
   - Put static labels, layout details, and visual specifications outside acceptance criteria unless they affect behavior or validation.

5. Quality check before finalizing.
   - Validate INVEST: independent, negotiable, valuable, estimable, small, testable.
   - Check Definition of Ready basics: role, goal, value, priority, assumptions/preconditions, testable AC, out-of-scope, NFR handling, and traceability.
   - Flag ambiguity, missing business rules, data/security/privacy impact, dependencies, and open decisions.

## Output Modes

- Inline story: Use when the user asks for a draft, rewrite, or review in chat.
- Saved artifact: Use only when the user asks to create files or the local workflow requires it. Default location: `working-artifacts/user-stories/<topic-or-task-name>/` at the workspace root (per the BA Agent's Artifact Output Location rule), unless the workspace follows the NashTech AI SDLC folder conventions below or the user requests a different location.
- Tool-specific format: Adapt fields for Azure DevOps, Jira, Confluence, or CSV only when requested.

For a complete story structure, read `references/story-output-contract.md`.

## Saving In A Workspace With BA Conventions

When saving a draft in a workspace that follows the NashTech AI SDLC folder conventions, use `.workspace/specs/...` instead of the default `working-artifacts/user-stories/` location:

1. Scan `.workspace/specs/user-stories/drafts/` and `.workspace/specs/user-stories/published/` for existing sequence numbers.
2. Use the next 5-digit sequence number and a short kebab-case description.
3. Create `.workspace/specs/user-stories/drafts/<00000-short-name>/<00000-short-name>.md`.
4. Use the local user story template if present.
5. Add a references table listing consulted workspace files.
6. Do not publish the story unless the user explicitly asks and the project workflow allows it.

## Final Response

When returning the result, keep the story first. Put assumptions, open questions, and quality notes after the story so the user can review the deliverable quickly.
