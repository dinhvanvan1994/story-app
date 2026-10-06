---
name: testing-implement-automation
description: "Use when: implementing Playwright automation scripts from approved test cases using existing project assets."
---

# SKILL.md - Testing Implement Automation

## 1. Purpose
<!-- Why the skill exists, business objective, primary responsibility -->

Implement maintainable Playwright automation scripts from approved test cases while maximizing reuse of existing project fixtures, page objects, components, and test data.

---

## 2. When to Use
<!-- Situations where the skill should be executed -->

- When approved and automation-ready test cases exist.
- When page objects/components are available or already generated.
- When new or updated spec files are required for regression, smoke, or functional coverage.

---

## 3. Do Not Use When
<!-- What the skill is NOT responsible for -->

- When test cases are not approved or lack clear expected outcomes.
- When the task is to generate page objects/components from scratch.
- When the task is only reviewing automation quality without implementation.

---

## 4. Inputs
<!-- Required and Optional inputs (no processing logic) -->

### Required
- Approved Test Case Document(s): Test cases selected for automation.
- Existing Automation Context: Relevant fixtures/page objects/components in the project.

### Optional
- Test Data Inputs: Dedicated datasets or environment-specific values.
- Execution Scope: Suite target (smoke, regression, functional, api, e2e).

---

## 5. Outputs
<!-- Files generated, reports, documents with naming conventions -->

| Output | Format | Naming Convention |
| ------ | ------ | ----------------- |
| UI Automation Spec | TypeScript (`.spec.ts`) | `<Requirement-or-Feature>-<Flow>.spec.ts` |
| API Automation Spec (if applicable) | TypeScript (`.spec.ts`) | `<Requirement-or-Feature>-api.spec.ts` |

Output location: `tests/`

---

## 6. Workflow
<!-- High-level workflow steps only -->

```text
1. Load Knowledge -> 2. Read Input -> 3. Map Approved Cases to Reusable Automation Design -> 4. Generate Output -> 5. Self Review
```

---

## 7. Knowledge Sources
<!-- Standards, Checklists, Templates, Examples to load -->

### Standards
- `references/standards/playwright-standard.md`
- `references/standards/assertion-standard.md`
- `references/standards/automation-coding-standard.md`
- `references/standards/automation-standard.md`

### Checklists
- `references/checklists/automation-review-checklist.md`

### Templates
- `references/templates/test.template.ts`
- `references/templates/api.template.ts`
- `references/templates/fixture.template.ts`

### Examples
- `references/examples/test-script-login-example.md`

---

## 8. Execution Rules
<!-- Execution sequence (read input, load knowledge, apply standards...) -->

1. Read approved test cases and identify automation-eligible scenarios.
2. Load Playwright, assertion, and automation coding standards.
3. Reuse existing page objects/components/fixtures/utilities before introducing new logic.
4. Implement traceable tests with clear arrange-act-assert flow.
5. Align assertions with expected results only; avoid unsupported checks.
6. Keep locators and page behavior encapsulated in page objects/components.
7. Validate generated specs with automation review checklist.

---

## 9. Decision Rules
<!-- Deterministic branching logic -->

1. If test case approval status is unclear, pause and request confirmation.
2. If required page objects/fixtures are missing, stop implementation and redirect to prerequisite skill.
3. If expected results are not measurable, request clarification before adding assertions.
4. If duplicated logic is detected, reuse existing utilities/components instead of new implementations.

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

- `references/checklists/automation-review-checklist.md`

Revise output if any applicable check fails.

---

## 13. Success Criteria
<!-- Measurable outcomes -->

- [ ] Spec files are generated in the correct suite location with consistent naming.
- [ ] Scripts are traceable to approved test cases and expected results.
- [ ] Reuse is maximized and no duplicate automation logic is introduced.

---

## 14. Next Skill
<!-- Downstream handoff -->

- `testing-review-automation`

---

## 15. Related Skills
<!-- Upstream and downstream skills only -->

- `testing-design-test-case`
- `testing-generate-page-object`
- `testing-review-automation`

---

## 16. Related Knowledge
<!-- Referenced knowledge files grouped by type -->

### Standards
- `references/standards/playwright-standard.md`
- `references/standards/assertion-standard.md`
- `references/standards/automation-coding-standard.md`
- `references/standards/automation-standard.md`

### Checklists
- `references/checklists/automation-review-checklist.md`

### Templates
- `references/templates/test.template.ts`
- `references/templates/api.template.ts`
- `references/templates/fixture.template.ts`

### Examples
- `references/examples/test-script-login-example.md`

### Shared Documents
- `references/project-knowledge/test-strategy.md`
