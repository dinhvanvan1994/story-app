# Automation Review Checklist

Use this checklist during **Self-Validation** to ensure every AI-generated or manually written Playwright test meets the team's quality, maintainability, and reliability standards.


---

## Mandatory Quality Gates

| Category | Requirement | Fail Condition |
|-----------|-------------|----------------|
| **Flakiness** | Avoid hardcoded delays and timing dependencies. | **FAIL** if `page.waitForTimeout()`, `setTimeout()`, or any fixed sleep/wait mechanism is used. |
| **Locators** | Use resilient, user-centric selectors. | **FAIL** if absolute XPath, brittle CSS paths, or DOM-structure-dependent selectors are used instead of Playwright locators such as `getByRole()`, `getByText()`, `getByLabel()`, or `getByTestId()`. |
| **Assertions** | Apply Playwright web-first assertions. | **FAIL** if assertions rely on boolean checks (e.g., `expect(flag).toBe(true)`) when a web-first assertion such as `toBeVisible()`, `toHaveText()`, or `toBeEnabled()` should be used. |
| **Isolation** | Ensure tests are independent and repeatable. | **FAIL** if a test depends on data, state, or execution order from another test case or spec file. |
| **Type Safety** | Follow strict TypeScript standards. | **FAIL** if `any` is used without explicit justification and approval. |

---

## Self-Validation Checklist

### Core Automation Standards

- [ ] No hardcoded wait timeouts are used.
- [ ] Test execution is deterministic and resistant to flakiness.
- [ ] Web-first assertions are used throughout the test.
- [ ] Strict TypeScript typing is maintained.
- [ ] Test implementation follows the configured metadata and test workflow.

### Reusability & Maintainability

- [ ] Existing Page Objects are reused whenever applicable.
- [ ] Reusable Page Objects, fixtures, or API context controllers are maintained.
- [ ] No duplicate logic or unnecessary code exists.
- [ ] No unused variables, locators, imports, or helper methods remain.
- [ ] Naming conventions follow project standards.

### Test Coverage Validation

- [ ] All **Automation = Yes** test cases are implemented.
- [ ] No **Automation = No** test cases are implemented.
- [ ] Positive and negative paths are covered where required.
- [ ] Assertions sufficiently validate expected outcomes.

### Code Quality Validation

- [ ] No hardcoded test data unless explicitly required.
- [ ] Error handling and cleanup are implemented where applicable.
- [ ] Test code is readable, maintainable, and self-explanatory.
- [ ] Logging and debugging statements are removed unless required.

### Build & Execution Validation

- [ ] Test scripts compile successfully.
- [ ] Linting passes successfully.
- [ ] Tests execute successfully in supported environments.
- [ ] No unstable or flaky test behavior is observed.

---

## Final Review Confirmation

Before submitting the automation script, confirm the following:

- [ ] Existing Page Objects reused.
- [ ] Naming conventions followed.
- [ ] Assertions implemented correctly.
- [ ] No duplicated code.
- [ ] No hardcoded waits.
- [ ] No unused locators.
- [ ] Test scripts compile successfully.
- [ ] Quality gates passed.

---

## Approval Statement

> I have reviewed this Playwright automation implementation and confirm that it satisfies all mandatory quality gates, coding standards, maintainability requirements, and self-validation criteria defined in this checklist.
