# Automation Coding Standards

## 1. Purpose

This document defines the coding standards for automation testing projects using **Playwright** and **TypeScript**. All team members and AI-generated code must comply with these standards to ensure maintainability, readability, reliability, and scalability.

---

# 2. General Principles

## DO


- Follow TypeScript best practices and enable strict mode.
- Follow SOLID, DRY (Don't Repeat Yourself), and Clean Code principles.
- Keep tests readable, maintainable, and business-focused.
- Design tests to be deterministic, stable, and independent.
- Reuse existing Page Objects, Components, Fixtures, Utilities, and API clients whenever possible.
- Prefer composition and reusable components over duplication.
- Implement the Page Object Model (POM) consistently.
- Use web-first assertions and Playwright recommended practices.
- Use resilient, user-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByTestId`).
- Store test data, configuration, and environment settings separately from test logic.
- Keep test scenarios focused on validating a single business behavior.
- Write self-documenting code with meaningful names for classes, methods, variables, and tests.
``

## DON'T


- Hardcode waits (`page.waitForTimeout()`, `setTimeout()`).
- Duplicate business logic, Page Objects, or utility functions.
- Use brittle locators such as absolute XPath, DOM-path CSS selectors, or nth-child selectors.
- Use `any` type without explicit justification.
- Implement dependencies between tests or rely on test execution order.
- Mix test logic with page interaction logic.
- Place assertions inside Page Objects.
- Hardcode test data, URLs, credentials, or environment-specific values.
- Commit temporary debugging code, `console.log()`, or commented-out code.
- Create unused variables, locators, methods, imports, or test data.
- Ignore existing reusable components, fixtures, or utilities.
- Catch and suppress errors without proper handling or logging.
- Write tests that validate multiple unrelated business scenarios.
- Use force actions (`force: true`) unless there is a documented justification.
- Implement custom waits when Playwright built-in waiting mechanisms can be used.
- Use magic numbers or hardcoded timeout values throughout the code.
- Modify production data unless explicitly required by the test design.
- Commit flaky tests or disable failing assertions without root cause analysis.

---

# 3. Project Structure

```text
src/
├── pages/
├── components/
├── fixtures/
├── test-data/
├── utils/
├── api/
├── constants/
└── types/
└── config/

tests/
├── smoke/
├── regression/
├── e2e/
└── api/
└── functional/
```

---

# 4. Naming Conventions

## Files

```text
login-page.ts
checkout-page.ts
user-api.ts
```

## Classes

```typescript
export class LoginPage {}
export class CheckoutPage {}
```

## Methods

```typescript
async login()
async searchProduct()
async submitOrder()
```

## Variables

```typescript
const username
const orderNumber
const searchResult
```

## Constants

```typescript
export const DEFAULT_TIMEOUT = 30000;
export const BASE_URL = 'https://example.com';
```

---

# 5. TypeScript Standards

## Strict Typing Required

### Good

```typescript
async getOrder(id: string): Promise<Order>
```

### Bad

```typescript
async getOrder(id: any): Promise<any>
```

## Rules

- Enable strict mode.
- Avoid `any`.
- Use interfaces and types.
- Define reusable DTOs.
- Explicitly type function parameters and return values.

---

# 6. Locator Standards

Priority order:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. CSS selectors (only when necessary)

## Preferred

```typescript
page.getByRole('button', { name: 'Login' })
```

## Avoid

```typescript
page.locator('div > div:nth-child(2) > button')
page.locator('/html/body/div[2]/button')
```

---

# 7. Page Object Model Standards

## Rules

- Encapsulate UI interactions.
- Keep assertions outside Page Objects.
- Keep business workflows within Pages or Components.
- Reuse common components.

### Good

```typescript
await loginPage.login(username, password);
```

### Avoid

```typescript
await page.fill('#username', username);
await page.fill('#password', password);
await page.click('#login');
```

---

# 8. Assertion Standards

Always use Web-First Assertions.

### Good

```typescript
await expect(page.getByText('Success')).toBeVisible();
```

```typescript
await expect(orderNumber).toHaveText('12345');
```

### Avoid

```typescript
expect(await locator.isVisible()).toBeTruthy();
```

```typescript
expect(flag).toBe(true);
```

---

# 9. Wait Strategy

## Allowed

```typescript
await expect(locator).toBeVisible();
await locator.waitFor();
```

## Forbidden

```typescript
await page.waitForTimeout(5000);
setTimeout(() => {}, 5000);
```

Hardcoded waits are not permitted.

---

# 10. Test Design Standards

Each test must:

- Be independent.
- Be executable in isolation.
- Validate one business scenario.
- Have clear Arrange / Act / Assert flow.

Example:

```typescript
test('User can login successfully', async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.login(user, password);
  await expect(loginPage.dashboard).toBeVisible();
});
```

---

# 11. Test Data Standards

## Rules

- Store test data separately.
- Avoid hardcoded values.
- Use factories or fixtures.
- Support environment-specific configurations.

Example:

```typescript
const user = testUsers.standardUser;
```

---

# 12. Code Reuse Standards

Before implementing new code, verify:

- Existing Page Object available.
- Existing Component available.
- Existing Utility available.
- Existing Fixture available.
- Existing API helper available.

Duplicate implementations are not allowed.

---

# 13. Error Handling

Use meaningful messages.

```typescript
throw new Error('Order number was not generated');
```

Avoid:

```typescript
throw new Error('Failed');
```

---

# 14. Logging Standards

Allowed:

```typescript
logger.info('Order created successfully');
```

Avoid excessive debug logging in committed code.

---

# 15. Pull Request Checklist

Before submitting code:

- [ ] No hardcoded waits
- [ ] No duplicate code
- [ ] Existing Page Objects reused
- [ ] Strict TypeScript applied
- [ ] Web-first assertions used
- [ ] Naming conventions followed
- [ ] No unused imports
- [ ] No unused locators
- [ ] Lint passes
- [ ] Tests compile successfully
- [ ] Tests execute successfully
- [ ] POM pattern followed
- [ ] Automation scope matches requirements

---

# 16. Definition of Done

Automation code is considered complete only when:

1. Coding standards are satisfied.
2. Self-evaluation checklist is passed.
3. Test execution passes.
4. Code review comments are resolved.
5. CI/CD pipeline passes successfully.
6. No critical automation quality violations remain.
