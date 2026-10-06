# Page Object Model (POM) Guidelines

## Purpose

This document defines the Page Object Model (POM) implementation standard for Playwright automation.

The objective is to produce automation that is:

- Readable
- Reusable
- Maintainable
- Scalable
- Easy to update when the UI changes

The AI shall follow these guidelines whenever generating or modifying Page Objects.

---

# Design Principles

Follow the Single Responsibility Principle (SRP).

Each Page Object represents **one web page**.

Each Component Object represents **one reusable UI component**.

Each class should expose **business actions**, not low-level implementation details.

---

# WorkFlow


```
Read Test Case
        │
        ▼
Identify Pages Involved
        │
        ▼
Locate Existing Page Objects
        │
        ▼
Page Object Exists?
        │
 ┌──────┴──────┐
 │             │
 │ Yes         │ No
 │             │
 ▼             ▼
Reuse      Create New
Page Object Page Object
 │             │
 └──────┬──────┘
        │
        ▼
Identify Required Business Actions
        │
        ▼
Business Method Exists?
        │
 ┌──────┴──────┐
 │             │
 │ Yes         │ No
 │             │
 ▼             ▼
Reuse       Add New Method
Method
        │
        ▼
Identify Required Locators
        │
        ▼
Locator Exists?
        │
 ┌──────┴──────┐
 │             │
 │ Yes         │ No
 │             │
 ▼             ▼
Reuse       Add Locator
Locator
        │
        ▼
Generate Test Script
        │
        ▼
Run Self Review
        │
        ▼
Output Automation Files
```

# Standard Architecture

```
tests/
    *.spec.ts

        │
        ▼

Page Objects
(LoginPage)

        │
        ▼

Component Objects
(HeaderComponent)

        │
        ▼

Playwright Locator API
```

Test scripts should interact only with Page Objects.

Page Objects interact with Playwright.

---
# Workflow Detail

## Step 1 – Identify Pages

Determine all application pages used by the test case.

Example

```
Home Page

↓

Login Page

↓

Customer Account Page
```

---

## Step 2 – Locate Existing Page Objects

Search the project for existing Page Objects.

Example

```
HomePage.ts

LoginPage.ts

CustomerAccountPage.ts
```

If found, reuse them.

Do NOT create duplicate Page Objects.

---

## Step 3 – Create Missing Page Objects

Only create a new Page Object when no suitable implementation exists.

Example

```
ForgotPasswordPage.ts
```

---

## Step 4 – Identify Business Actions

Determine the business actions required by the test case.

Examples

- login()
- logout()
- searchProduct()
- addToCart()
- checkout()

Prefer business-oriented methods over low-level UI actions.

---

## Step 5 – Reuse Existing Methods

Search the Page Object for existing methods.

Example

```
login(email, password)
```

If available:

Reuse it.

Do NOT generate another login method.

---

## Step 6 – Create Missing Methods

Only create methods that are required by the current test case.

Example

```
selectRememberMe()

clickForgotPassword()

changePassword()
```

Each method should represent one business action.

---

## Step 7 – Identify Locators

Determine all UI elements required by the methods.

Examples

- Email textbox
- Password textbox
- Login button
- Forgot Password link

---

## Step 8 – Reuse Existing Locators

Search the Page Object before adding new locators.

If the locator already exists:

Reuse it.

Never duplicate locators.

---

## Step 9 – Generate Test Script

Generate Playwright test scripts using:

- Existing Page Objects
- Existing methods
- Existing locators

Create only the missing automation artifacts.

---

## Step 10 – Self Review

Before completing, verify:

- Existing Page Objects were reused.
- Existing business methods were reused.
- Existing locators were reused.
- No duplicate methods were created.
- No duplicate locators were created.
- No assertions exist in Page Objects.
- One Page Object represents one page.
- Shared UI is extracted into Component Objects.
- Generated automation follows the project standards.

---

## AI Decision Rules

The AI shall follow these priorities:

### Priority 1

Reuse existing Page Objects.

### Priority 2

Reuse existing business methods.

### Priority 3

Reuse existing locators.

### Priority 4

Generate only the missing artifacts.

### Priority 5

Never duplicate implementation.

---
# Responsibilities

## Test Script

Responsible for:

- Test flow
- Test data
- Assertions
- Business validation

Must NOT contain:

- Locators
- Page implementation details

---

## Page Object

Responsible for:

- UI locators
- User interactions
- Navigation
- Business actions

Must NOT contain:

- Assertions
- Test scenarios
- Test data
- Business verification

---

## Component Object

Responsible for reusable UI components.

Examples

- Header
- Footer
- Navigation Menu
- Search Bar
- Product Card
- Modal Dialog

Components should be reused by multiple Page Objects.

---

# Folder Structure

```
src/

pages/
    BasePage.ts
    HomePage.ts
    LoginPage.ts
    RegisterPage.ts

components/
    HeaderComponent.ts
    FooterComponent.ts
```

---

# BasePage

All Page Objects should extend BasePage.

BasePage should contain reusable functionality such as:

- goto()
- waitForPage()
- getTitle()
- common utilities

Do NOT place feature-specific logic in BasePage.

---

# Constructor Pattern

Always inject Playwright Page.

Example

```typescript
export class LoginPage {

    constructor(private readonly page: Page) {}

}
```

Never create Playwright Page inside Page Objects.

---

# Locator Declaration

Declare locators as readonly properties.

Good

```typescript
readonly emailTextbox = this.page.getByLabel('Email');
```

Bad

```typescript
await this.page.getByLabel('Email').fill(email);
```

inside every method.

Locators should be declared once and reused.

---

# Naming Convention

Pages

```
LoginPage

RegisterPage

CheckoutPage
```

Components

```
HeaderComponent

SearchBarComponent

ShoppingCartComponent
```

Never use abbreviations.

---

# Method Design

Methods should represent business actions.

Good

```typescript
login(email, password)

logout()

searchProduct(name)

placeOrder()
```

Avoid low-level methods such as

```typescript
clickButton()

fillTextbox()

clickElement()
```

Business methods improve readability.

---

# Method Granularity

Good

```
login()

logout()

addProductToCart()

removeProduct()

checkout()
```

Avoid

```
clickLoginButton()

typeEmail()

typePassword()

pressSubmit()
```

The spec should not know implementation details.

---

# Return Values

Methods may return:

- void
- another Page Object
- data

Example

```typescript
async login(...)
    : Promise<CustomerAccountPage>
```

Navigation methods should return the destination Page Object whenever appropriate.

---

# Navigation

Navigation should be encapsulated.

Good

```typescript
await homePage.openLoginPage();
```

Bad

```typescript
await page.click(...)
```

inside spec.

---

# Assertions

Assertions belong ONLY in test scripts.

Correct

```
Spec

↓

expect(...)
```

Incorrect

```typescript
await expect(this.successMessage).toBeVisible();
```

inside LoginPage.

Page Objects should expose locators or helper methods, not perform assertions.

---

# Test Data

Do NOT hardcode data.

Bad

```typescript
fill("admin@test.com");
```

Good

```typescript
login(user.email, user.password);
```

---

# Reusability

Before creating:

- locator
- method
- Page Object

AI shall check whether an existing implementation already exists.

Never duplicate functionality.

---

# Component Extraction

Create Component Objects when:

- UI appears on multiple pages
- Same locators repeated
- Same actions repeated

Examples

Header

Footer

Navigation Menu

Breadcrumb

Product Card

Modal

---

# Page Boundaries

One Page Object should represent one page.

Avoid

```
LoginPage

contains

Checkout methods
```

Each page should own only its own functionality.

---

# Visibility

Expose only necessary methods.

Avoid exposing internal implementation.

Good

```typescript
login(...)
```

Avoid

```typescript
clickLoginButton()

fillEmail()

fillPassword()
```

unless required by multiple scenarios.

---

# Error Handling

Do not swallow Playwright exceptions.

Allow failures to propagate.

Avoid try/catch unless implementing recovery logic.

---

# Waiting Strategy

Use Playwright auto waiting.

Avoid

```typescript
waitForTimeout()
```

Use

- Locator API
- expect()
- waitForURL()
- waitForLoadState()

---

# Anti-patterns

Do NOT

❌ Assertions inside Page Objects

❌ Hardcoded waits

❌ XPath when unnecessary

❌ Duplicate locators

❌ Duplicate methods

❌ Static sleeps

❌ Business logic inside spec

❌ One Page Object controlling multiple pages

---

# AI Generation Rules

When generating Page Objects, the AI shall:

1. Search for an existing Page Object before creating a new one.
2. Reuse existing methods whenever possible.
3. Create new methods only when required.
4. Keep one responsibility per Page Object.
5. Keep locators private to the Page Object.
6. Expose meaningful business actions.
7. Return destination Page Objects after successful navigation.
8. Avoid duplicate locators and methods.
9. Follow project naming conventions.
10. Produce reusable and maintainable code.

---

# Self Review Checklist

Before completing, verify:

- ✓ One class represents one page.
- ✓ Shared UI extracted into Component Objects.
- ✓ BasePage reused.
- ✓ Locators declared once.
- ✓ No duplicated locators.
- ✓ No assertions inside Page Objects.
- ✓ No hardcoded test data.
- ✓ Business methods are exposed.
- ✓ Navigation encapsulated.
- ✓ Uses Playwright Locator API.
- ✓ No hard waits.
- ✓ Ready for reuse.

---

# Related Knowledge

- project-structure.md
- playwright-guidelines.md
- locator-strategy.md
- assertion-guidelines.md
- coding-standards.md