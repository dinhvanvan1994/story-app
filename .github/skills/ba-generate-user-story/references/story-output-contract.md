# Story Output Contract

Use this reference when creating a complete user story artifact or reviewing a story for readiness.

## Minimum Inputs

- Primary user or actor
- Business capability or goal
- Business value
- Parent epic, feature, or scope area when available
- Source evidence, such as requirement notes, meeting notes, screenshots, process descriptions, or existing backlog items

If one of these is missing, continue only when the missing information can be marked as an assumption or open question.

## Recommended Sections

1. Story metadata
   - Story ID or placeholder
   - Story name
   - Epic or feature
   - Priority and rationale when known
   - Status
   - Source references

2. User story statement
   - As a [role]
   - I want to [capability]
   - So that [business value]

3. Preconditions
   - Conditions that must be true before the workflow starts
   - Use "None identified." when no preconditions are known

4. Assumptions
   - Assumption ID
   - Assumption text
   - Impact if wrong

5. Workflow or behavior notes
   - Main flow summary
   - Alternate or exception flow summary
   - UI/mockup reference when applicable

6. Acceptance criteria
   - Use Gherkin scenarios by default
   - Include happy path coverage
   - Include negative, boundary, permission, state, or error coverage when applicable
   - Make every expected result observable to a user, system actor, audit trail, notification, or integration consumer

7. Out of scope
   - Explicit exclusions
   - Deferred behavior
   - Related capabilities that need separate stories

8. Non-functional requirements
   - Include only NFRs stated or clearly traceable from inputs
   - Use measurable thresholds when provided
   - Mark unknown metrics as TBD with an owner or question

9. Traceability
   - Requirement ID, source document, meeting note, epic, screen, API, or decision link

10. Open questions
   - Group by business, UX, data, integration, security, or operations when useful
   - Prioritize questions that block implementation or testing

## Gherkin Rules

- Each scenario should test one behavior.
- Each scenario should have one clear trigger using `When`.
- `Then` outcomes must be observable.
- Avoid acceptance criteria that describe implementation internals only.
- Do not use ACs for static labels, styling, or layout unless they affect validation, accessibility, permissions, or business behavior.

Example:

```gherkin
AC1: Submit a complete request
  Given the user is authenticated and has completed all mandatory fields
  When the user submits the request
  Then the request is accepted
  And the user sees a confirmation with the submitted reference number

AC2: Block submission when a mandatory field is missing
  Given the user is completing the request form
  And a mandatory field is empty
  When the user submits the request
  Then the system highlights the missing field
  And the request is not submitted
```

## Story Slicing Checklist

Keep the capability as one story when it represents a cohesive business outcome. Split only when at least one of these is true:

- Different user roles have meaningfully different goals or rules
- Workflow stages can be prioritized, demonstrated, and released independently
- Business rules differ enough to require separate validation and acceptance
- Operational handling or approvals differ
- The story is too large to complete in one iteration
- Splitting reduces delivery risk without fragmenting the business outcome

Avoid standalone stories for:

- Database tables
- API endpoints
- UI components
- Button clicks
- Loading indicators
- Field-level validations
- Logging or monitoring setup

## Readiness Checklist

Before finalizing, verify:

- The story has a clear role, goal, and business value
- The story is business-facing and vertically sliced
- Preconditions and assumptions are present or explicitly marked as none
- Acceptance criteria are independently testable
- Happy path and relevant edge/error paths are covered
- Out-of-scope items are explicit
- NFRs are traceable or explicitly absent
- Dependencies and open questions are visible
- The story can be demonstrated meaningfully to stakeholders
