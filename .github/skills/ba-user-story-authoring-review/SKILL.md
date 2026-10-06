---
name: ba-user-story-authoring-review
description: "Create, split, or review Agile user stories and backlog items. Use when writing user story summaries, personas, epics, acceptance criteria, screen definitions, preconditions, workflows, out-of-scope notes, NFRs, INVEST checks, or sprint-ready requirements for Scrum outsourcing delivery."
---

# BA User Story Authoring Review

## Operating Approach

Use this skill for BA work in IT outsourcing where the output must be understandable by client stakeholders and actionable for delivery teams.

1. Clarify the business objective, artifact audience, delivery phase, and source evidence.
2. Extract confirmed facts from user-provided files, screenshots, URLs, spreadsheets, diagrams, or bundled reference extracts.
3. Build the artifact using the workflow below and the bundled checklist/template.
4. Separate confirmed requirements from assumptions, recommendations, risks, and open questions.
5. Review the result for traceable IDs, testability, ownership, dependencies, acceptance boundaries, and delivery handoff quality.

## Workflow

- Clarify epic, persona, business outcome, release/sprint context, and dependency constraints.
- Write the story as role, capability, and value; avoid implementation-only wording unless the story is technical by nature.
- Add assumptions, preconditions, workflow/activity diagram notes, current screens, proposed mockups, and screen definition.
- Write acceptance criteria in Given/When/Then or rule-based bullets; include positive, negative, boundary, permission, and state cases.
- Attach NFRs, analytics, audit, notification, data, API, and migration implications when they affect delivery.
- Apply INVEST and split stories by workflow step, business rule, data variation, user role, integration, or risk.

## Output Contract

Always include the following when producing an artifact:

- Context: project/domain/module, audience, source inputs, scope boundary, and confidence level.
- Main artifact: structured tables or sections appropriate to the request.
- Traceability: source reference, requirement/story/use case IDs, screen/API/data references, or decision links where available.
- Quality checks: ambiguity, missing rules, edge cases, NFR/security/privacy/data/test impact, and delivery risk.
- Open questions: grouped by stakeholder or decision area, prioritized by impact.
- Assumptions: clearly marked and ready for client validation.
- Saved artifact location: when asked to save this as a file, write it under `working-artifacts/user-stories/<topic-or-task-name>/` at the workspace root (per the BA Agent's Artifact Output Location rule) unless the user requests a different location.

## Resource Use

- Read `references/checklist.md` when creating a complete artifact, reviewing an existing artifact, or when source material is incomplete.
- Use `assets/output-template.md` as a starting structure when the user asks for a concrete deliverable.
- Prefer the user's provided documents over generic rules. Use bundled reference extracts as pattern memory, not as a substitute for project-specific evidence.
- For regulations, legal obligations, security standards, or current industry rules, verify against current official or authoritative sources before finalizing.

## Quality Bar

- Use business language first, with technical terms only where they affect scope, risk, integration, data, testing, or operations.
- Avoid vague requirements such as "fast", "secure", "user friendly", or "seamless"; convert them into measurable criteria or open questions.
- Do not invent client decisions. If a rule is missing, mark it as an assumption or question.
- Keep outputs tool-agnostic unless the user asks for a specific format such as Word, Excel, Jira, Confluence, Mermaid, BPMN, or Markdown.
