# Locator Standard

## Purpose

This document defines the standard for locating web elements in Playwright.

The objectives are to:

- Create stable and maintainable locators.
- Minimize flaky tests caused by UI changes.
- Promote reuse across Page Objects.
- Improve test readability.
- Follow Playwright recommended practices.

The AI shall follow this standard whenever generating or updating Page Objects.

---

# Principles

A good locator should be:

- Stable
- Unique
- Readable
- Maintainable
- Independent of UI layout

Prefer locating elements by their semantic meaning rather than visual appearance.

---

# Locator Priority

Always use the highest priority locator available.

| Priority | Locator | Recommendation |
|----------|----------|----------------|
| 1 | getByRole() | ⭐⭐⭐⭐⭐ Preferred |
| 2 | getByLabel() | ⭐⭐⭐⭐⭐ |
| 3 | getByPlaceholder() | ⭐⭐⭐⭐ |
| 4 | getByText() | ⭐⭐⭐⭐ |
| 5 | getByTestId() | ⭐⭐⭐⭐ |
| 6 | CSS Selector | ⭐⭐⭐ |
| 7 | XPath | ⭐ Avoid unless no alternative |

---

# Preferred Locator Types

## getByRole()

Use for accessible elements.

Examples

```typescript
page.getByRole('button', { name: 'Login' });

page.getByRole('link', { name: 'Register' });

page.getByRole('textbox', { name: 'Email' });
```

Recommended for:

- Buttons
- Links
- Textboxes
- Checkboxes
- Radio buttons
- Menus
- Dialogs

---

## getByLabel()

Preferred for form controls.

Example

```typescript
page.getByLabel('Email');

page.getByLabel('Password');
```

---

## getByPlaceholder()

Use when no accessible label exists.

Example

```typescript
page.getByPlaceholder('Search store');
```

---

## getByText()

Use for visible text.

Example

```typescript
page.getByText('Shopping cart');

page.getByText('Forgot password?');
```

Avoid if the text changes frequently.

---

## getByTestId()

Use when the application provides dedicated test IDs.

Example

```typescript
page.getByTestId('login-button');
```

Recommended for dynamic UI where accessible locators are insufficient.

---

## CSS Selector

Use only when semantic locators are unavailable.

Good

```typescript
page.locator('.login-button');
```

Avoid deeply nested selectors.

Bad

```typescript
page.locator('div > div > div:nth-child(3) > button');
```

---

## XPath

XPath should be the last option.

Use only when no other locator is feasible.

Example

```typescript
page.locator("//button[text()='Login']");
```

Avoid:

- Long XPath expressions
- Index-based XPath
- Absolute XPath

---

# Locator Declaration

Declare locators once as readonly properties.

Good

```typescript
readonly emailTextbox = this.page.getByLabel('Email');

readonly passwordTextbox = this.page.getByLabel('Password');

readonly loginButton = this.page.getByRole('button', { name: 'Log in' });
```

Bad

```typescript
await this.page.getByLabel('Email').fill(email);

await this.page.getByRole('button', { name: 'Log in' }).click();
```

Do not duplicate locator definitions.

---

# Dynamic Locators

Support parameterized locators.

Example

```typescript
productCard(productName: string) {
    return this.page.getByRole('link', { name: productName });
}
```

Avoid hardcoded values.

---

# Collections

Use locator collections when multiple elements exist.

Example

```typescript
readonly products = this.page.locator('.product-item');
```

Preferred

```typescript
await expect(products).toHaveCount(4);
```

Avoid

```typescript
locator.nth(3)
```

unless order is guaranteed.

---

# Parent-Child Locators

Use chained locators.

Example

```typescript
const product =
    page.getByRole('listitem')
        .filter({ hasText: 'Laptop' });

await product.getByRole('button', { name: 'Add to cart' }).click();
```

Avoid long CSS paths.

---

# Tables

Locate rows by business data.

Good

```typescript
page.getByRole('row', {
    name: /John Smith/
});
```

Avoid

```typescript
tbody tr:nth-child(5)
```

---

# Dialogs

Locate dialogs by role.

Example

```typescript
page.getByRole('dialog');
```

---

# Frames

Use frameLocator().

Example

```typescript
page.frameLocator('#payment-frame');
```

Avoid switching manually.

---

# Shadow DOM

Use Playwright built-in support.

Avoid JavaScript execution unless necessary.

---

# Waiting

Never use locators with fixed waits.

Bad

```typescript
await page.waitForTimeout(5000);
```

Preferred

```typescript
await expect(loginButton).toBeVisible();

await loginButton.click();
```

Rely on Playwright auto-waiting.

---

# Duplicate Locators

Never duplicate the same locator.

Incorrect

```typescript
emailTextbox

emailInput

txtEmail
```

Correct

```typescript
emailTextbox
```

One locator represents one UI element.

---

# Naming Convention

Use descriptive names.

Examples

```typescript
emailTextbox

passwordTextbox

rememberMeCheckbox

loginButton

searchTextbox

shoppingCartLink
```

Avoid

```typescript
btn1

txt

elm

obj

button
```

---

# Anti-Patterns

Avoid:

❌ Absolute XPath

❌ Index-based locators

❌ Deep CSS selectors

❌ Dynamic IDs

❌ Hardcoded waits

❌ Duplicate locators

❌ JavaScript DOM queries

❌ Locators inside test scripts

---

# AI Generation Rules

When generating automation, the AI shall:

1. Search for existing locators before creating new ones.
2. Reuse locator definitions whenever possible.
3. Prefer semantic locators.
4. Follow the locator priority order.
5. Keep locators inside Page Objects.
6. Generate dynamic locators when appropriate.
7. Avoid brittle selectors.
8. Avoid duplicate locators.
9. Use readable locator names.
10. Produce stable and maintainable locators.

---

# Self Review Checklist

Before completing, verify:

- ✓ Locator follows priority order.
- ✓ Locator is unique.
- ✓ Locator is readable.
- ✓ Locator is reusable.
- ✓ No duplicated locators.
- ✓ No XPath unless necessary.
- ✓ No index-based selectors.
- ✓ No hardcoded waits.
- ✓ Locator resides in a Page Object.
- ✓ Locator follows naming conventions.

---

# Related Standards

- project-structure.md
- playwright-standard.md
- pom-standard.md
- assertion-standard.md
- coding-standard.md