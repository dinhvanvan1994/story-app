# Test Strategy

## Objective

Ensure software quality through risk-based, maintainable, and automated testing.

---

## Test Levels

- API Testing
- UI Testing
- End-to-End Testing

---

## Test Types

- Functional
- Regression
- Smoke
- Security
- Accessibility
- Performance (when applicable)

---

## Automation Scope

Automate:

- Smoke tests
- Regression tests
- Stable business flows
- Repetitive scenarios

Avoid automating:

- Frequently changing UI
- One-time validation
- Exploratory testing

---

## Risk-Based Testing

Prioritize testing based on:

- Business impact
- Customer usage
- Security risk
- Technical complexity

# Test Design Approach

## Purpose

Create a complete and consistent test design plan before generating test cases. It is to answer:

What scenario types are required?
Which test design techniques should be applied?
What level of coverage is appropriate?

The Test Design determines:
- Requirement complexity
- Required scenario types
- Applicable test design techniques
- Coverage completeness

---

# Step 1. Requirement Classification

Classify each requirement as:

| Complexity | Characteristics |
|------------|-----------------|
| Simple | Single validation or straightforward behavior |
| Medium | Multiple conditions or business rules |
| Complex | Workflow, state changes, integrations, or high-risk logic |

---

# Step 2. Identify Scenario Types

Determine which scenario types are applicable.

Possible scenario types:

- Positive
- Negative
- Boundary
- Business Rule
- Error Handling
- Workflow
- Integration
- Security
- Performance
- Accessibility

Only include applicable scenario types.

---

# Step 3. Select Test Design Techniques

Choose the most appropriate techniques.

| Requirement Type | Preferred Techniques |
|------------------|----------------------|
| Input Validation | Equivalence Partitioning, Boundary Value Analysis |
| Business Rules | Decision Table |
| Workflow | State Transition, Use Case Testing |
| API | Equivalence Partitioning, Error Guessing |
| Integration | End-to-End Testing |
| Security | Threat-based testing |
| Performance | Load or Stress Testing |

Multiple techniques may be combined when appropriate.

---
# Step 4 - Automation Assessment


For each planned test scenario, evaluate automation suitability. A test case is recommended for automation when most of the following conditions are true:

- Executed frequently (Smoke, Regression, CI/CD)
- High business impact
- Stable functionality
- Stable UI or API
- Expected result is deterministic
- Test data can be prepared automatically
- Environment is consistently available
- Execution is repetitive
- Manual execution is time-consuming
- Low maintenance cost

If most conditions are satisfied (>90%):

Automation  = Yes

Otherwise:

Automation  = No


If Automation = Yes, determine the Automation Type.

### UI

Use UI automation when:

- User interacts with the browser.
- Validation is visible in the UI.
- Backend verification is unnecessary.

Output:

Automation Type = UI

---

### API

Use API automation when:

- No browser interaction is required.
- API can verify the requirement faster.
- Business logic resides in backend services.

Output:

Automation Type = API

---

### UI + API

Use UI + API when:

- UI performs the action.
- API provides stronger verification.
- Database validation is not available.
- Backend state should be verified.

Output:

Automation Type = UI + API

### N/A
Use N/A for other cases and Automation = No


---

# Step 5. Coverage Validation

Before generating test cases, verify:

- Every Acceptance Criterion has at least one associated scenario.
- Every business rule is covered.
- Positive scenarios exist.
- Negative scenarios exist where applicable.
- Boundary scenarios exist where applicable.
- Non-functional scenarios are included only if requested or required.

---

# Output

Produce an internal Test Design Plan containing:

- Requirement classification
- Scenario list
- Selected test design techniques
- Coverage summary

This plan is used internally and is not included in the final test case document unless requested.