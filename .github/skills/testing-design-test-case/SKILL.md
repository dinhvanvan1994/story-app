---
name: testing-design-test-case
description: "Use when: generating complete, maintainable, risk-based test cases from user stories, use cases, acceptance criteria, business rules, functional specifications, or API specifications."
---

# SKILL.md - Testing Design Test Case

## 1. Purpose
<!-- Why the skill exists, business objective, primary responsibility -->

Generate complete, maintainable, traceable, and risk-based test cases from software requirements to improve quality coverage, consistency, and delivery confidence.

---

## 2. When to Use
<!-- Situations where the skill should be executed -->

- When test cases must be generated from user stories, use cases, acceptance criteria, business rules, functional specifications, or API specifications.
- When the team needs standardized test case structure and traceability to requirements.
- When risk-based functional and/or non-functional test design is required before automation or execution.

---

## 3. Do Not Use When
<!-- What the skill is NOT responsible for -->

- When requirements are missing and cannot be clarified.
- When the task is to execute tests, debug failures, or implement automation scripts.
- When the task is a review-only request without generating or updating test case documents.

---

## 4. Inputs
<!-- Required and Optional inputs (no processing logic) -->

### Required
- Requirement Document Path: Path to one requirement file (user story, use case, functional spec, acceptance criteria, business rules, or API spec).
- Requirement Content: Complete requirement details needed for coverage and traceability.

### Optional
- Test Scope: `functional`, `non-functional`, or `both`.
- Output Format Override: Alternative format request if different from the default test case template.

---

## 5. Outputs
<!-- Files generated, reports, documents with naming conventions -->

| Output | Format | Naming Convention |
| ------ | ------ | ----------------- |
| Test Case Document | Markdown (`.md`) | `US-{id}-test-cases.md` |

Output location: `docs/test-cases/` (for example `docs/test-cases/US-001-test-cases.md`). One file per user story; every test case traces to an acceptance criterion ID.

---

## 6. Workflow
<!-- High-level workflow steps only -->

```text
1. Load Knowledge -> 2. Read Input -> 3. Determine Scope and Design Approach -> 4. Generate Output -> 5. Self Review
```

---

## 7. Knowledge Sources
<!-- Standards, Checklists, Templates, Examples to load -->

### Standards
- `references/standards/testing-standard.md`
- `references/standards/test-design-techniques.md`
- `references/standards/test-design-approach.md`

### Checklists
- `references/checklists/test-case-review-checklist.md`

### Templates
- `references/templates/test-case.template.md`

### Examples
- `references/examples/test-case-login-example.md`
- `references/examples/review-test-case-example.md`

---

## 8. Execution Rules
<!-- Execution sequence (read input, load knowledge, apply standards...) -->

1. Read input documents fully before generating test cases.
2. Load relevant knowledge sources from `references/`.
3. Determine requested test scope and do not assume non-functional scope unless requested.
4. Apply standards from the knowledge base with risk-based design techniques.
5. Execute applicable checklists to resolve ambiguities and review completeness.
6. Generate output using the template unless the user explicitly requests another format.
7. Perform self-validation and revise internally before final output.

---

## 9. Decision Rules
<!-- Deterministic branching logic -->

1. If scope is not specified, ask whether output should be functional, non-functional, or both.
2. If requirement details are ambiguous, request clarification before finalizing cases.
3. If business rules are missing for critical scenarios, mark output as draft with explicit assumptions.
4. If user requests a non-template format, follow user format while preserving traceability and measurable expected results.

---

## 10. Knowledge Priority
<!-- Rule precedence -->

1. User instructions
2. SKILL.md
3. Standards
4. Checklists
5. Templates
6. Examples

---

## 11. Quality Gates
<!-- Mandatory validation before output -->

- [ ] Standards applied
- [ ] Checklists executed
- [ ] Template followed
- [ ] Output complete

---

## 12. Self Review
<!-- Checklist-driven self review -->

Before completing, execute:

- `references/checklists/test-case-review-checklist.md`

Revise output if any applicable check fails.

---

## 13. Success Criteria
<!-- Measurable outcomes -->

- [ ] Test case document is created in `docs/test-cases/` as `US-{id}-test-cases.md`.
- [ ] Test cases are traceable to requirements and cover applicable positive, negative, boundary, and business-rule scenarios.
- [ ] Duplicate scenarios are removed and expected results are clear, verifiable, and measurable.

---

## 14. Next Skill
<!-- Downstream handoff -->

- `testing-review-test-case`

---

## 15. Related Skills
<!-- Upstream and downstream skills only -->

- `testing-analyze-requirements`
- `testing-review-test-case`
- `testing-generate-page-object`

---

## 16. Related Knowledge
<!-- Referenced knowledge files grouped by type -->

### Standards
- `references/standards/testing-standard.md`
- `references/standards/test-design-techniques.md`
- `references/standards/test-design-approach.md`

### Checklists
- `references/checklists/test-case-review-checklist.md`

### Templates
- `references/templates/test-case.template.md`

### Examples
- `references/examples/test-case-login-example.md`
- `references/examples/review-test-case-example.md`

### Shared Documents
- `references/project-knowledge/test-strategy.md`