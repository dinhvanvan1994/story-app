# Automation Standard

## Purpose

This document defines the automation engineering standards for generating and maintaining automated test scripts.

The objectives are to:

- Produce reliable and maintainable automation.
- Reduce flaky tests.
- Maximize code reuse.
- Improve execution speed.
- Support continuous integration and continuous delivery (CI/CD).
- Ensure generated automation follows engineering best practices.

The AI shall follow this standard whenever generating or updating automated tests.

---

# Automation Principles

Automated tests shall be:

- Reliable
- Repeatable
- Independent
- Maintainable
- Readable
- Reusable
- Deterministic
- Fast

---

# Test Independence

Every automated test shall execute independently.

Requirements

- No dependency on execution order.
- No dependency on previous tests.
- No shared mutable state.
- No prerequisite test execution.

Good

```
TC001

can execute alone
```

Bad

```
TC002

requires TC001 to execute first
```

---

# One Test = One Objective

Each automated test should validate one business scenario.

Good

```
Login with valid credentials
```

Avoid

```
Login

Search

Checkout

Logout

in one test
```

---

# Atomic Tests

Each test should

- Prepare its own data
- Execute independently
- Verify independently
- Clean up if necessary

---

# Idempotent Tests

Repeated execution should produce the same result.

Good

```
Create unique customer

Delete customer
```

Avoid

```
Always create customer John
```

which fails on the second execution.

---

# Stable Test Data

Use predictable test data.

Preferred

- Generated data
- Dedicated test accounts
- Seeded data

Avoid

- Production data
- Random shared accounts
- Expired accounts

---

# Data Isolation

Each test should use its own data.

Example

```
user_001

user_002

user_003
```

Avoid sharing mutable records.

---

# Environment Independence

Automation should run in

- Local
- SIT
- UAT
- Production-like environments

Avoid environment-specific assumptions.

---

# Reusability

Always reuse

- Page Objects
- Components
- Fixtures
- Utilities
- Test data
- API clients

Avoid duplicate implementations.

---

# Maintainability

Automation should be easy to modify.

Prefer

- POM
- Components
- Shared utilities
- Shared fixtures

Avoid duplicated logic.

---

# Readability

Generated automation should be understandable without additional documentation.

Good

```typescript
await loginPage.login(user);
```

Avoid

```typescript
await page.locator(...).click();
```

inside test scripts.

---

# Execution Speed

Prefer

- API setup
- Fixtures
- Parallel execution
- Playwright auto waiting

Avoid

- Hard waits
- Unnecessary navigation
- Duplicate setup

---

# Flaky Test Prevention

Avoid

- waitForTimeout()
- Dynamic locators
- Index-based locators
- Timing assumptions

Prefer

- Stable locators
- Auto waiting
- Explicit assertions

---

# Error Recovery

Tests should fail immediately when a critical step fails.

Avoid retrying business actions inside the test.

Use Playwright retry configuration instead.

---

# Logging

Log meaningful business actions.

Example

```
Login

Search Product

Checkout

Verify Order
```

Avoid logging every click.

---

# Screenshots

Capture screenshots only

- On failure
- When debugging
- When required by CI

Do not capture screenshots after every step.

---

# Trace Collection

Enable traces

- On first retry
- On failure

Avoid generating traces for every successful execution.

---

# Parallel Execution

Automation should support parallel execution.

Requirements

- Independent data
- No shared state
- Thread-safe implementation

---

# Cleanup

Remove test-created data whenever practical.

Examples

- Delete created customer
- Remove shopping cart
- Cancel test order

If cleanup is impossible, use isolated test data.

---

# Automation Scope

Automate

- Smoke tests
- Regression tests
- Stable UI flows
- Business-critical scenarios
- Frequently executed scenarios
- Repetitive manual tests

---

# Manual Candidates

Do NOT automate

- Exploratory testing
- UX evaluation
- Visual comparison
- One-time verification
- Performance testing
- Penetration testing
- CAPTCHA
- Hardware validation

unless specifically requested.

---

# Automation Priority

Preferred order

1. Smoke
2. Critical business flow
3. Regression
4. High-risk functionality
5. Medium priority
6. Low priority

---

# Test Organization

One feature per folder.

One User Story per directory.

One test per Test Case.

Example

```
tests/

authentication/

US-001-Customer-Login/

login-basic.spec.ts

remember-me.spec.ts
```

---

# AI Automation Workflow

```
Read Test Cases
        │
        ▼
Select Automation = Yes
        │
        ▼
Determine Implementation Type
        │
        ▼
Reuse Existing Framework
        │
        ▼
Generate Missing Artifacts
        │
        ▼
Generate Automation
        │
        ▼
Run Self Review
        │
        ▼
Output Files
```

---

# AI Generation Rules

The AI shall

1. Read approved test cases.
2. Ignore Automation = No.
3. Reuse existing project structure.
4. Reuse existing Page Objects.
5. Reuse existing Components.
6. Reuse existing fixtures.
7. Reuse existing utilities.
8. Generate only missing artifacts.
9. Keep tests independent.
10. Produce executable automation.

The AI shall NOT

- Design new test cases.
- Modify business requirements.
- Duplicate Page Objects.
- Duplicate locators.
- Duplicate methods.
- Duplicate test data.

---

# Self Review Checklist

Before completing, verify:

- ✓ Test is independent.
- ✓ One business objective per test.
- ✓ Stable test data.
- ✓ Reused existing Page Objects.
- ✓ Reused existing Components.
- ✓ Reused existing fixtures.
- ✓ No duplicate code.
- ✓ No hard waits.
- ✓ Supports parallel execution.
- ✓ Ready for CI/CD execution.

---

# Related Standards

- project-structure.md
- playwright-standard.md
- pom-standard.md
- locator-standard.md
- assertion-standard.md
- coding-standard.md