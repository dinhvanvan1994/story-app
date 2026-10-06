# Test Case Review Checklist

## Purpose

This checklist helps reviewers evaluate the quality, completeness, consistency, and maintainability of generated test cases before they are finalized.

Use this checklist for both AI-generated and manually written test cases.

---

# Review Guidelines

During the review, verify that the test cases:

- Accurately reflect the requirements.
- Provide sufficient coverage.
- Follow the Test Case Template.
- Comply with the Testing Standard.
- Are executable and maintainable.
- Do not contain duplicate scenarios.

---

# 1. Requirement Coverage

| Check | Status |
|-------|--------|
| Every requirement is covered by one or more test cases. | ☐ |
| Every acceptance criterion is covered. | ☐ |
| Business rules are validated. | ☐ |
| Alternate flows are covered where applicable. | ☐ |
| Error scenarios are included. | ☐ |
| Regression impact has been considered. | ☐ |

---

# 2. Test Design

| Check | Status |
|-------|--------|
| Appropriate test design techniques have been applied. | ☐ |
| Positive scenarios are included. | ☐ |
| Negative scenarios are included. | ☐ |
| Boundary conditions are tested where applicable. | ☐ |
| Invalid input scenarios are covered. | ☐ |
| Duplicate scenarios have been removed. | ☐ |
| Test cases provide meaningful coverage without unnecessary overlap. | ☐ |

---

# 3. Test Case Quality

| Check | Status |
|-------|--------|
| Test Case ID follows the naming convention. | ☐ |
| Title clearly describes the expected behavior. | ☐ |
| Test title begins with **"Verify..."**. | ☐ |
| Requirement reference is correct. | ☐ |
| Testing technique is appropriate. | ☐ |
| Priority is assigned correctly. | ☐ |

---

# 4. Preconditions

| Check | Status |
|-------|--------|
| Preconditions are clearly defined. | ☐ |
| Preconditions contain only setup information. | ☐ |
| Preconditions do not duplicate execution steps. | ☐ |

---

# 5. Test Data

| Check | Status |
|-------|--------|
| Test data is realistic. | ☐ |
| Test data supports the scenario being tested. | ☐ |
| Invalid data is included where appropriate. | ☐ |
| Boundary values are included where applicable. | ☐ |
| Duplicate data scenarios are covered where applicable. | ☐ |

---

# 6. Test Steps

| Check | Status |
|-------|--------|
| Steps are clear and easy to execute. | ☐ |
| Steps are numbered sequentially. | ☐ |
| Each step represents a single user action. | ☐ |
| Steps are concise and unambiguous. | ☐ |
| Steps avoid unnecessary detail. | ☐ |

---

# 7. Expected Results

| Check | Status |
|-------|--------|
| Expected results are observable. | ☐ |
| Expected results are verifiable. | ☐ |
| Expected results are specific. | ☐ |
| Validation messages are included where applicable. | ☐ |
| System behavior is clearly described. | ☐ |
| Expected results do not contain vague statements (e.g., "System works correctly"). | ☐ |

---

# 8. Priority Review

| Check | Status |
|-------|--------|
| Critical business flows are marked as Critical. | ☐ |
| High-risk scenarios have appropriate priority. | ☐ |
| Low-risk scenarios are not over-prioritized. | ☐ |
| Priority aligns with business impact. | ☐ |

---

# 9. Test Design Technique Review

| Check | Status |
|-------|--------|
| Equivalence Partitioning is applied where appropriate. | ☐ |
| Boundary Value Analysis is applied where appropriate. | ☐ |
| Decision Table Testing is applied for business rules with multiple conditions. | ☐ |
| State Transition Testing is applied for workflow or status changes. | ☐ |
| Use Case Testing covers end-to-end user journeys. | ☐ |

---

# 10. Non-functional Considerations

Review whether additional test cases are needed for:

| Check | Status |
|-------|--------|
| Security | ☐ |
| Accessibility | ☐ |
| Performance | ☐ |
| Compatibility | ☐ |
| Localization | ☐ |
| Integration | ☐ |

If not applicable, document the reason.

---

# 11. Traceability

| Check | Status |
|-------|--------|
| Every test case is traceable to a requirement or acceptance criterion. | ☐ |
| No orphan test cases exist. | ☐ |
| Requirement references are correct. | ☐ |

---

# 12. Duplication Review

| Check | Status |
|-------|--------|
| Duplicate test cases have been removed. | ☐ |
| Similar scenarios have been consolidated where appropriate. | ☐ |
| Each test case validates a unique objective. | ☐ |

---

# 13. AI Quality Review

For AI-generated test cases, verify that the AI:

| Check | Status |
|-------|--------|
| Correctly interpreted the requirements. | ☐ |
| Did not invent unsupported business rules. | ☐ |
| Identified assumptions where requirements were incomplete. | ☐ |
| Selected appropriate test design techniques. | ☐ |
| Generated comprehensive but non-redundant test cases. | ☐ |


# 14 Coverage Validation

| Check | Status |
|-------|--------|
|Each AC is classified correctly (Simple / Medium / Complex) | ☐ |
|Test cases match AC complexity| ☐ |
|Test cases match AC complexity| ☐ |
|No missing scenario types:  - Positive   - Negative   - Boundary (if applicable)   - Business Rule (if  applicable)| ☐ |
|Coverage is complete at feature level| ☐ |
|Output is consistent for same input| ☐ |

# 15 Automation Assessment Checklist

| Criteria | Yes | No |
|----------|:---:|:--:|
| Frequently executed | □ | □ |
| Regression candidate | □ | □ |
| High business priority | □ | □ |
| Stable requirement | □ | □ |
| Stable UI/API | □ | □ |
| Deterministic expected result | □ | □ |
| Test data can be prepared automatically | □ | □ |
| Environment is available | □ | □ |
| Low maintenance cost | □ | □ |

If most conditions are satisfied (>90%)

Automation = Yes

Otherwise:

Automation = No
---

# AI Self-Validation Checklist

Before finalizing the output, AI should verify that:

- All requirements and acceptance criteria are covered.
- Appropriate test design techniques have been applied.
- Positive, negative, and boundary scenarios are included where applicable.
- Duplicate scenarios have been removed.
- Test Case IDs follow the naming convention.
- Test titles follow the required format.
- Test steps are complete and executable.
- Expected results are observable and verifiable.
- Priorities are assigned consistently.
- The output follows the standard Test Case Template.