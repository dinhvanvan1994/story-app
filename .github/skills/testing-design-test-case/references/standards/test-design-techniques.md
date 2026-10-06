# Test Design Techniques

## Purpose

This document provides guidance on selecting and applying test design techniques when creating test cases.

AI should choose one or more techniques based on the feature, business rules, and risk level. The goal is to maximize test coverage while minimizing redundant test cases.

---

# Selection Guidelines

Use the following decision guide to determine which techniques to apply.

| Situation | Recommended Technique(s) |
|------------|--------------------------|
| Input validation | Equivalence Partitioning, Boundary Value Analysis |
| Numeric or length limits | Boundary Value Analysis |
| Business rules with multiple conditions | Decision Table Testing |
| Workflow or lifecycle changes | State Transition Testing |
| User journeys | Use Case Testing |
| Multiple configuration combinations | Pairwise Testing |
| Known defect-prone areas | Error Guessing |
| Complex business logic | Decision Table + Use Case Testing |
| CRUD operations | Equivalence Partitioning + Boundary Value Analysis |
| API validation | Equivalence Partitioning + Boundary Value Analysis + Negative Testing |

---

# Equivalence Partitioning (EP)

## Purpose

Reduce the number of test cases by grouping inputs into valid and invalid partitions.

Assume that values within the same partition behave similarly.

## When to Use

- Input fields
- Form validation
- API parameters
- Numeric ranges
- Text fields

## Example

Age must be between 18 and 60.

Partitions:

Valid
- 18–60

Invalid
- Less than 18
- Greater than 60

Representative tests:

- 25
- 17
- 61

---

# Boundary Value Analysis (BVA)

## Purpose

Validate behavior at the edges of input ranges.

Defects frequently occur at boundaries.

## When to Use

- Minimum values
- Maximum values
- Length restrictions
- Date ranges
- File sizes
- Numeric limits

## Example

Password length:

Minimum: 8

Maximum: 20

Recommended tests:

- 7
- 8
- 20
- 21

---

# Decision Table Testing

## Purpose

Validate business rules involving multiple conditions and outcomes.

## When to Use

- Pricing rules
- Discounts
- Permissions
- Approval workflows
- Tax calculations
- Validation logic

## Example

| Member | Coupon | Result |
|----------|---------|--------|
| Yes | Yes | Discount |
| Yes | No | Member Discount |
| No | Yes | Coupon Discount |
| No | No | No Discount |

Generate at least one test for each rule.

---

# State Transition Testing

## Purpose

Verify system behavior as it moves between different states.

## When to Use

- Order lifecycle
- User account status
- Workflow engines
- Booking systems
- Approval processes

## Example

Order:

Draft

↓

Submitted

↓

Approved

↓

Completed

↓

Cancelled

Verify:

- Valid transitions
- Invalid transitions
- Repeated transitions
- Recovery scenarios

---

# Use Case Testing

## Purpose

Validate complete business workflows from the user's perspective.

## When to Use

- End-to-end scenarios
- Business processes
- User journeys

## Example

Online Purchase

1. Login
2. Search product
3. Add to cart
4. Checkout
5. Payment
6. Confirmation

Create tests covering:

- Happy path
- Alternative flows
- Failure paths

---

# Pairwise Testing

## Purpose

Reduce the number of test cases when multiple combinations exist.

Ensure every pair of parameter values is tested at least once.

## When to Use

- Browser compatibility
- Device compatibility
- Operating systems
- Configuration testing
- Feature flags

Example:

Browser

- Chrome
- Edge
- Firefox

Operating System

- Windows
- macOS

Language

- English


Rather than testing every combination, generate an optimized pairwise set.

---

# Error Guessing

## Purpose

Leverage experience to identify likely failure scenarios.

## When to Use

- Regression testing
- Complex features
- Legacy systems
- Areas with previous defects

Typical scenarios include:

- Empty input
- Duplicate data
- Invalid formats
- Session timeout
- Refresh during submission
- Browser back button
- Double-click actions
- Network interruption

---

# Cause-Effect Graphing

## Purpose

Model relationships between multiple input conditions and expected outcomes.

## When to Use

- Complex validation rules
- Multiple dependent conditions
- Business logic with many combinations

---

# Exploratory Testing

## Purpose

Discover defects through investigation rather than predefined scripts.

## When to Use

- New features
- Poorly documented functionality
- High-risk areas
- User experience evaluation

Focus on:

- Unexpected behavior
- Edge cases
- Workflow interruptions
- Usability concerns

---

# Checklist-Based Testing

## Purpose

Ensure consistent verification using predefined checklists.

## When to Use

- UI reviews
- Accessibility
- Security
- Regression
- Release validation

Typical checklist categories:

- Functional
- UI
- Accessibility
- Security
- Performance
- Compatibility

---

# Risk-Based Testing

## Purpose

Allocate testing effort based on business and technical risk.

## High Risk

Apply:

- Functional Testing
- Negative Testing
- Boundary Testing
- Security Testing
- Integration Testing
- Regression Testing

## Medium Risk

Apply:

- Functional Testing
- Boundary Testing
- Negative Testing
- Regression Testing

## Low Risk

Apply:

- Functional Testing
- Smoke Testing
- Basic UI Validation

---

# Technique Selection Rules

AI should select techniques according to the feature.

| Feature | Preferred Techniques |
|----------|----------------------|
| Login | EP, BVA, Error Guessing |
| Registration | EP, BVA, Decision Table |
| Search | EP, BVA, Error Guessing |
| Payment | Decision Table, State Transition, Use Case |
| Shopping Cart | State Transition, Use Case |
| File Upload | EP, BVA, Error Guessing |
| User Permissions | Decision Table |
| Workflow Approval | State Transition, Decision Table |
| API Endpoint | EP, BVA, Negative Testing |
| Reports | Use Case, EP |

Multiple techniques may be combined when appropriate.

---

# AI Guidance

When generating test cases, AI should:

- Analyze the feature before selecting techniques.
- Prefer the smallest set of test cases that provides effective coverage.
- Combine complementary techniques where beneficial.
- Avoid duplicate scenarios generated by different techniques.
- Prioritize techniques based on business risk.
- Clearly document assumptions if requirements are incomplete.

Do not apply every technique indiscriminately. Choose those that best fit the feature and risk profile.

---

# Success Criteria

A well-designed test suite should:

- Cover functional requirements.
- Include positive and negative scenarios.
- Validate boundary conditions.
- Exercise business rules.
- Verify critical workflows.
- Minimize redundant test cases.
- Balance thoroughness with efficiency.