# Assertion Standard

## Purpose

This document defines the standard for implementing assertions in Playwright automation.

The objectives are to:

- Verify application behavior accurately.
- Produce deterministic and reliable automated tests.
- Reduce flaky tests.
- Improve readability and maintainability.
- Ensure consistent assertion practices across the project.

The AI shall follow this standard whenever generating Playwright test scripts.

---

# Principles

Assertions should verify:

- Business behavior
- User-visible outcomes
- System state
- Navigation
- Data integrity

Avoid asserting implementation details whenever possible.

---

# Assertion Ownership

Assertions belong ONLY in the test script.

```
Spec File
    │
    ▼
Assertion
```

Page Objects shall NOT contain assertions.

Incorrect

```typescript
await expect(this.loginButton).toBeVisible();
```

inside LoginPage.

Correct

```typescript
await loginPage.login(user);

await expect(accountPage.myAccountHeading).toBeVisible();
```

---

# Assertion Strategy

Each test should verify:

1. Primary business outcome
2. Critical UI state
3. Navigation (if applicable)
4. Data consistency (if applicable)

Avoid asserting every UI element unnecessarily.

---

# Assertion Priority

Always verify the most important business outcome first.

Example

Login

Priority

1. User authenticated
2. Redirected correctly
3. Dashboard displayed

Not

- Logo displayed
- Footer displayed
- Copyright

---

# Assertion Types

## Visibility

Verify an element is visible.

Example

```typescript
await expect(loginButton).toBeVisible();
```

---

## Hidden

Verify an element is hidden.

Example

```typescript
await expect(errorMessage).toBeHidden();
```

---

## Enabled

Verify controls are enabled.

Example

```typescript
await expect(loginButton).toBeEnabled();
```

---

## Disabled

Example

```typescript
await expect(loginButton).toBeDisabled();
```

---

## Text

Verify displayed text.

Example

```typescript
await expect(errorMessage)
    .toHaveText("Invalid email or password.");
```

Avoid partial text unless required.

---

## URL

Verify navigation.

Example

```typescript
await expect(page)
    .toHaveURL(/customer\/info/);
```

Prefer pattern matching instead of hardcoded URLs.

---

## Title

Example

```typescript
await expect(page)
    .toHaveTitle(/My Account/);
```

---

## Value

Example

```typescript
await expect(emailTextbox)
    .toHaveValue(user.email);
```

---

## Attribute

Example

```typescript
await expect(checkbox)
    .toHaveAttribute("checked", "");
```

---

## Count

Example

```typescript
await expect(products)
    .toHaveCount(4);
```

---

## Checked

Example

```typescript
await expect(rememberMeCheckbox)
    .toBeChecked();
```

---

## Focus

Example

```typescript
await expect(emailTextbox)
    .toBeFocused();
```

Useful for accessibility validation.

---

## API Response

Example

```typescript
await expect(response.status())
    .toBe(200);
```

---

## JSON Response

Example

```typescript
expect(responseBody.success)
    .toBeTruthy();
```

---

# Multiple Assertions

A test may contain multiple assertions.

Recommended order

1. Business outcome
2. Navigation
3. UI state
4. Data validation

Avoid excessive assertions that do not increase confidence.

---

# Negative Assertions

Validate failure scenarios.

Example

```typescript
await expect(errorMessage)
    .toBeVisible();
```

Example

```typescript
await expect(page)
    .not.toHaveURL(/dashboard/);
```

---

# Soft Assertions

Use soft assertions only when collecting multiple independent failures.

Example

```typescript
await expect.soft(header).toBeVisible();

await expect.soft(footer).toBeVisible();
```

Do not overuse soft assertions.

Critical validations should use standard assertions.

---

# Retry Behavior

Use Playwright's built-in retry mechanism.

Avoid custom retry loops.

Incorrect

```typescript
while (...) {

}
```

---

# Waiting

Do NOT use waits before assertions.

Incorrect

```typescript
await page.waitForTimeout(3000);

await expect(...);
```

Correct

```typescript
await expect(loginButton)
    .toBeVisible();
```

Playwright automatically waits.

---

# Business Validation

Prefer business assertions.

Good

```typescript
await expect(orderConfirmation)
    .toBeVisible();
```

Poor

```typescript
await expect(div)
    .toBeVisible();
```

Assert meaningful outcomes.

---

# Assertions to Avoid

Avoid asserting:

- CSS color
- Font
- Pixel position
- HTML structure
- Internal IDs
- Dynamic timestamps
- Random values
- Animation timing

Unless explicitly required.

---

# Common Anti-Patterns

Do NOT

❌ Assert implementation details

❌ Duplicate assertions

❌ Assert every UI element

❌ Assert static content repeatedly

❌ Assert after fixed waits

❌ Use unnecessary Boolean assertions

Example

Bad

```typescript
expect(true).toBeTruthy();
```

---

# Traceability

Every assertion should trace back to:

- Acceptance Criteria
- Expected Result
- Business Rule

Avoid assertions without business value.

---

# AI Assertion Workflow

```
Read Expected Result
        │
        ▼
Identify Business Outcome
        │
        ▼
Determine Assertion Type
        │
        ▼
Can Playwright verify it?
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
Generate   Skip
Assertion  Explain Limitation
        │
        ▼
Review Against Expected Result
```

---

# AI Generation Rules

When generating assertions, the AI shall:

1. Read the Expected Result.
2. Generate assertions only for expected behavior.
3. Prioritize business outcome assertions.
4. Use Playwright built-in assertions.
5. Avoid duplicate assertions.
6. Avoid unnecessary assertions.
7. Do not use assertions inside Page Objects.
8. Do not use hard waits.
9. Ensure every assertion maps to an Expected Result.
10. Generate deterministic assertions.

---

# Self Review Checklist

Before completing, verify:

- ✓ Assertions are in spec files only.
- ✓ Every assertion verifies an Expected Result.
- ✓ Business outcomes are verified.
- ✓ Navigation is verified when applicable.
- ✓ No duplicate assertions.
- ✓ No implementation-detail assertions.
- ✓ No hard waits.
- ✓ Uses Playwright expect().
- ✓ Assertions are deterministic.
- ✓ Test remains readable.

---

# Related Standards

- project-structure.md
- playwright-standard.md
- pom-standard.md
- locator-standard.md
- coding-standard.md
- automation-standard.md