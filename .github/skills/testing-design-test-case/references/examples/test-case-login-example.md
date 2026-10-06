# Test Case Generation Example

## Purpose

This example demonstrates how to transform a requirement into test cases using the standard **Test Case Template** and appropriate **Test Design Techniques**.

---

# Input

## Feature

**User Login**

### User Story

As a registered user,
I want to log in using my email and password,
So that I can access my account.

### Acceptance Criteria

| ID | Description |
|----|-------------|
| AC-1 | User can log in with a valid email and password. |
| AC-2 | Email is required. |
| AC-3 | Password is required. |
| AC-4 | Invalid credentials display the message **"Invalid email or password."** |
| AC-5 | Account is locked after five consecutive failed login attempts. |
| AC-6 | Locked accounts cannot log in. |
| AC-7 | Successful login redirects the user to the Dashboard. |

---

# Expected Output

- Generate the final test case table using  [Test case Template](../templates/test-case.template.md)

---

# AI Learning Points

From this example, AI should learn to:

- Analyze the user story and acceptance criteria before generating test cases.
- Generate one or more test cases for each acceptance criterion.
- Follow the **Test Case Template** for output structure.
- Generate sequential Test Case IDs using the defined naming convention.
- Select the most appropriate test design technique for each scenario.
- Assign priorities based on business impact.
- Use realistic and reusable test data.
- Write concise test steps that describe user actions.
- Write expected results that are observable and verifiable.
- Avoid duplicate or overlapping test cases.

This example is intended as a reference implementation for future test case generation.