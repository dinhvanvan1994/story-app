---
name: testing-generate-page-object
description: "Use when: generating or updating Playwright page objects and reusable components from approved requirements and test assets."
---

# SKILL.md - Testing Generate Page Object

## 1. Purpose
<!-- Why the skill exists, business objective, primary responsibility -->

Generate and maintain reusable Playwright page objects and UI components that follow project standards, reduce duplication, and support stable automation development.

---

## 2. When to Use
<!-- Situations where the skill should be executed -->

- When new pages or user flows require automation support.
- When existing page objects/components must be updated for new functionality.
- When approved test scope exists and automation artifacts must be prepared.

---

## 3. Do Not Use When
<!-- What the skill is NOT responsible for -->

- When the task is to design or review test cases.
- When the task is to generate complete spec test scripts.
- When the task is to execute tests or perform runtime debugging.

---

## 4. Inputs
<!-- Required and Optional inputs (no processing logic) -->

### Required
- UI Target Scope: Feature pages/flows to model in page objects.
- Source Context: Requirement/test case details defining expected interactions.

### Optional
- Existing Automation Code: Current page objects/components to reuse or extend.
- UI Evidence: URL, mockups, DOM snapshots, or design references.

---

## 5. Outputs
<!-- Files generated, reports, documents with naming conventions -->

| Output | Format | Naming Convention |
| ------ | ------ | ----------------- |
| Page Object Class | TypeScript (`.ts`) | `<FeatureOrPage>NamePage.ts` |
| Reusable Component Class | TypeScript (`.ts`) | `<ComponentName>.ts` |

Output locations: `src/pages/`, `src/components/`

---

## 6. Workflow
<!-- High-level workflow steps only -->

```text
1. Load Knowledge -> 2. Read Input -> 3. Reuse Existing Artifacts and Model Page/Component Structure -> 4. Generate Output -> 5. Self Review
```

---

## 7. Knowledge Sources
<!-- Standards, Checklists, Templates, Examples to load -->

### Standards
- `references/standards/pom-standard.md`
- `references/standards/locator-standard.md`
- `references/standards/page-object-standard.md`
- `references/standards/playwright-standard.md`

### Checklists
- `references/checklists/page-object-review-checklist.md`

### Templates
- `references/templates/page-object.template.ts`
- `references/templates/component.template.ts`

### Examples
- `references/examples/test-script-login-example.md`

---

## 8. Execution Rules
<!-- Execution sequence (read input, load knowledge, apply standards...) -->

1. Read input scope and identify pages/components required.
2. Load POM, locator, and Playwright standards.
3. Search and reuse existing page objects/components before creating new files.
4. Generate business-oriented methods and stable locators according to standards.
5. Keep assertions/test orchestration out of page object/component files.
6. Update existing files carefully to avoid duplicate methods and locators.
7. Validate output against checklist before finalizing.

---

## 9. Decision Rules
<!-- Deterministic branching logic -->

1. If required page context is missing, request clarification before generating classes.
2. If existing page object/component already satisfies the need, reuse and extend instead of duplicating.
3. If locator stability is uncertain, prioritize resilient selectors and flag high-risk locators.
4. If requested changes require assertions/test logic in page object files, reject and redirect to automation skill.

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

- `references/checklists/page-object-review-checklist.md`

Revise output if any applicable check fails.

---

## 13. Success Criteria
<!-- Measurable outcomes -->

- [ ] Generated page objects/components are reusable, cohesive, and follow naming/location conventions.
- [ ] No duplicate locators or duplicate business methods are introduced.
- [ ] Artifacts are ready for downstream automation script generation.

---

## 14. Next Skill
<!-- Downstream handoff -->

- `testing-implement-automation`

---

## 15. Related Skills
<!-- Upstream and downstream skills only -->

- `testing-design-test-case`
- `testing-review-page-object`
- `testing-implement-automation`

---

## 16. Related Knowledge
<!-- Referenced knowledge files grouped by type -->

### Standards
- `references/standards/pom-standard.md`
- `references/standards/locator-standard.md`
- `references/standards/page-object-standard.md`
- `references/standards/playwright-standard.md`

### Checklists
- `references/checklists/page-object-review-checklist.md`

### Templates
- `references/templates/page-object.template.ts`
- `references/templates/component.template.ts`

### Examples
- `references/examples/test-script-login-example.md`

### Shared Documents
- `references/project-knowledge/test-strategy.md`
