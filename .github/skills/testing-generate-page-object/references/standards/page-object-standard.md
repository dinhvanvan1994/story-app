# Page Object Standard

## Purpose

Define the design, implementation, and maintenance standards for Page Objects used in the Playwright automation framework.

The goal is to ensure:

- Reusability
- Maintainability
- Readability
- Scalability
- Consistency across the automation framework

---

# Scope

This standard applies to:

- Page Objects
- Page Components
- Shared UI Components

within the Playwright automation framework.

---

# Design Principles

Page Objects should:

- Represent user interactions with the application.
- Encapsulate UI implementation details.
- Hide locator complexity from test scripts.
- Expose meaningful business actions.
- Promote code reuse.
- Support test maintainability.

Page Objects should not:

- Contain test assertions.
- Contain test scenarios.
- Contain cross-page workflows.
- Contain duplicated logic.

---

# Page Object Responsibilities

A Page Object is responsible for:

## Element Management

- Defining page-specific locators.
- Managing page-specific interactions.
- Hiding implementation details.

## User Actions

Represent actions a real user can perform.

Examples:

```typescript
await loginPage.login(username, password);
await cartPage.removeItem(product);
await searchPage.search(keyword);
```

## Navigation

Provide navigation methods when the page owns navigation behavior.

Example:

```typescript
await loginPage.navigate();
```

---

# Page Object Structure

A page object should follow the structure below.

```typescript
export class LoginPage {
  constructor(private readonly page: Page) {}

  // Locators

  private readonly usernameTextbox =
    this.page.getByLabel('Username');

  private readonly passwordTextbox =
    this.page.getByLabel('Password');

  private readonly loginButton =
    this.page.getByRole('button', {
      name: 'Login'
    });

  // Actions

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(
    username: string,
    password: string
  ): Promise<void> {
    await this.usernameTextbox.fill(username);
    await this.passwordTextbox.fill(password);
    await this.loginButton.click();
  }
}
```

---

# Locator Standards

## Preferred Locator Priority

Use locators in the following order:

1. getByRole()
2. getByLabel()
3. getByPlaceholder()
4. getByText()
5. getByTestId()
6. CSS selectors (only when unavoidable)

---

## Allowed

```typescript
page.getByRole('button', {
  name: 'Submit'
});
```

```typescript
page.getByLabel('Username');
```

```typescript
page.getByTestId('save-button');
```

---

## Prohibited

```typescript
page.locator(
  'div > div > div > button'
);
```

```typescript
page.locator(
  '/html/body/div[2]/button'
);
```

```typescript
page.locator(
  '.container:nth-child(3)'
);
```

---

# Method Design Standards

Methods should represent:

- Business actions
- User actions
- User intent

---

## Good Examples

```typescript
await loginPage.login();
```

```typescript
await checkoutPage.placeOrder();
```

```typescript
await customerPage.createCustomer();
```

---

## Avoid

```typescript
await page1.clickButton1();
```

```typescript
await page1.clickButton2();
```

```typescript
await page1.fillField();
```

Method names should describe behavior, not implementation.

---

# Assertion Standards

## Must Not

Assertions are prohibited inside Page Objects.

### Incorrect

```typescript
async verifySuccessfulLogin() {
  await expect(
    this.dashboard
  ).toBeVisible();
}
```

---

## Correct

Page Object:

```typescript
get dashboard(): Locator {
  return this.page.getByRole('main');
}
```

Test:

```typescript
await expect(
  loginPage.dashboard
).toBeVisible();
```

---

# Waiting Standards

Page Objects must rely on Playwright's auto-waiting capabilities.

---

## Allowed

```typescript
await locator.click();
```

```typescript
await locator.fill('value');
```

```typescript
await locator.waitFor();
```

---

## Prohibited

```typescript
await page.waitForTimeout(5000);
```

```typescript
setTimeout(() => {}, 5000);
```

```typescript
await new Promise(resolve =>
  setTimeout(resolve, 3000)
);
```

Hardcoded waits are not permitted.

---

# Data Handling Standards

Page Objects should not own:

- Test data
- Environment data
- Credentials
- Mock data

---

## Avoid

```typescript
async login() {
  await this.username.fill(
    'admin'
  );
}
```

---

## Preferred

```typescript
async login(
  username: string,
  password: string
) {
  ...
}
```

---

# Component Pattern

Not every UI element should become a Page Object.

Reusable UI areas should become Components.

Examples:

- Header
- Footer
- Sidebar
- Navigation Menu
- Modal Dialog
- Notification Panel
- Search Component
- Data Table

---

## Example

```typescript
export class HeaderComponent {
  constructor(
    private readonly page: Page
  ) {}

  readonly profileMenu =
    this.page.getByRole('button');

  async logout(): Promise<void> {
    ...
  }
}
```

---

# Component Reuse

Page Objects should reuse components.

### Good

```typescript
export class DashboardPage {
  readonly header =
    new HeaderComponent(this.page);
}
```

### Avoid

Duplicating Header locators and methods in multiple Page Objects.

---

# Cross-Page Workflow Rule

Page Objects should manage their own page only.

---

## Avoid

```typescript
async createOrderAndApprove() {
  await this.submitOrder();
  await this.navigateToApproval();
  await this.approveOrder();
}
```

This mixes multiple pages and business processes.

---

## Preferred

```typescript
await orderPage.submitOrder();

await approvalPage.approveOrder();
```

Workflow orchestration belongs in:

- Tests
- Service Layers
- Business Flow Helpers

---

# Error Handling Standards

Error messages should be meaningful.

---

## Good

```typescript
throw new Error(
  'Customer record not found'
);
```

---

## Avoid

```typescript
throw new Error(
  'Failed'
);
```

---

# TypeScript Standards

Page Objects must:

- Use strict typing.
- Define return types.
- Avoid `any`.
- Use interfaces and DTOs where appropriate.

---

## Good

```typescript
async createCustomer(
  customer: Customer
): Promise<void>
```

---

## Avoid

```typescript
async createCustomer(
  customer: any
): Promise<any>
```

---

# Anti-Patterns

The following are prohibited.

## Assertions Inside Page Objects

❌ Not allowed

---

## Hardcoded Waits

❌ Not allowed

---

## Test Data Creation

❌ Not allowed

---

## Scenario Logic

❌ Not allowed

---

## Duplicate Locators

❌ Not allowed

---

## Duplicate UI Actions

❌ Not allowed

---

## God Page Objects

❌ Not allowed

Example:

```text
CustomerPage.ts
4000+ lines
200+ methods
```

Large page objects should be split into:

- Components
- Sub Pages
- Helper Classes

---

# Validation Checklist

Before submitting a Page Object:

- [ ] All locators belong to the page/component.
- [ ] No assertions exist in the Page Object.
- [ ] No hardcoded waits exist.
- [ ] No test data is hardcoded.
- [ ] Existing components are reused.
- [ ] Existing utilities are reused.
- [ ] Method names describe business actions.
- [ ] No duplicated locators.
- [ ] No duplicated logic.
- [ ] Strict TypeScript typing is used.
- [ ] No unused locators.
- [ ] No unused methods.
- [ ] Component pattern is applied where appropriate.

---

# Definition of Done

A Page Object is considered complete when:

1. It complies with this standard.
2. It passes code review.
3. It contains no hardcoded waits.
4. It contains no assertions.
5. It follows locator standards.
6. It follows TypeScript standards.
7. It reuses existing framework assets.
8. It passes the Page Object validation checklist.