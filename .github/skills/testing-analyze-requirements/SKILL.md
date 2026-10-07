---
name: testing-analyze-requirements
description: "Use when: analyzing requirements for completeness, consistency, clarity, and testability before test design."
---

# SKILL.md - Testing Analyze Requirements

## 1. Purpose
<!-- Why the skill exists, business objective, primary responsibility -->

Analyze software requirements to identify gaps, ambiguities, conflicts, assumptions, dependencies, and testability risks before downstream testing activities begin.

---

## 2. When to Use
<!-- Situations where the skill should be executed -->

- When a new user story, use case, or specification is ready for test analysis.
- When backlog refinement or sprint planning needs requirement readiness checks.
- When test design should start only after requirement quality is confirmed.

---

## 3. Do Not Use When
<!-- What the skill is NOT responsible for -->

- When the task is to rewrite or modify business requirements.
- When the task is to generate test scripts or execute tests.
- When there is no requirement input to analyze.

---

## 4. Inputs
<!-- Required and Optional inputs (no processing logic) -->

### Required
- Requirement Document(s): User story, acceptance criteria, BRD/FRD, API spec, or equivalent source.
- Business Context: Feature objective and scope context needed for readiness assessment.

### Optional
- Linked Artifacts: Mockups, API contracts, dependency docs, or related tickets.
- Priority and Risk Context: Severity/business impact to support recommendations.

---

## 5. Outputs
<!-- Files generated, reports, documents with naming conventions -->

| Output | Format | Naming Convention |
| ------ | ------ | ----------------- |
| Requirement Analysis Report | Markdown (`.md`) | `US-{id}-requirements-analysis.md` |
| Requirements Findings Log | Markdown (`.md`) | `US-{id}-requirements-findings.md` |

Output location: `docs/test-strategy/` (for example `docs/test-strategy/US-001-requirements-analysis.md`).

---

## 6. Workflow
<!-- High-level workflow steps only -->

```text
1. Load Knowledge -> 2. Read Input -> 3. Analyze Quality and Testability -> 4. Generate Output -> 5. Self Review
```

---

## 7. Knowledge Sources
<!-- Standards, Checklists, Templates, Examples to load -->

### Standards
- `references/standards/test-design-techniques.md`
- `references/standards/requirement-clarification-rules.md`

### Checklists
- `references/checklists/requirement-review-checklist.md`

### Templates
- `references/templates/requirement-analysis-report-template.md`

### Examples
- `references/examples/review-test-case-example.md`

---

## 8. Execution Rules
<!-- Execution sequence (read input, load knowledge, apply standards...) -->

1. Read all provided requirement inputs fully.
2. Load requirement checklist and report template before analysis.
3. Assess completeness, consistency, ambiguity, assumptions, and dependencies.
4. Evaluate testability and identify blocking gaps with clear evidence.
5. Generate clarification questions for unresolved items.
6. Produce the report using the template structure.
7. Perform self-validation before final output.

---

## 9. Decision Rules
<!-- Deterministic branching logic -->

1. If requirement source is incomplete, request missing artifacts before final analysis.
2. If ambiguous statements block testability, record them and produce clarification questions.
3. If critical business rules are undefined, mark readiness as Needs Clarification.
4. If dependencies are unknown, report dependency risk and defer readiness approval.

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

- `references/checklists/requirement-review-checklist.md`

Revise output if any applicable check fails.

---

## 13. Success Criteria
<!-- Measurable outcomes -->

- [ ] All provided requirements are analyzed and findings are evidence-based.
- [ ] Missing information, ambiguity, dependencies, and risks are clearly documented.
- [ ] Clarification questions and readiness recommendation are actionable.

---

## 14. Next Skill
<!-- Downstream handoff -->

- `testing-design-test-case`

---

## 15. Related Skills
<!-- Upstream and downstream skills only -->

- `testing-design-test-case`
- `testing-review-test-case`
- `testing-analyze-bug`

---

## 16. Related Knowledge
<!-- Referenced knowledge files grouped by type -->

### Standards
- `references/standards/test-design-techniques.md`
- `references/standards/requirement-clarification-rules.md`

### Checklists
- `references/checklists/requirement-review-checklist.md`

### Templates
- `references/templates/requirement-analysis-report-template.md`

### Examples
- `references/examples/review-test-case-example.md`

### Shared Documents
- `references/checklists/clarification-rules.md`
