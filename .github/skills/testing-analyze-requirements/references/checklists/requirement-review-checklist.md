# Requirement Review Checklist

Review each requirement and user story against the following quality gates.

## 1. Story Basics

- [ ] User story ID/title is present and unique.
- [ ] Story follows a clear format (role, need, value) where applicable.
- [ ] Story scope is focused and not overly broad.
- [ ] Story aligns with epic/feature context.
- [ ] Story status and ownership are defined.

## 2. Business Value and Objective

- [ ] Business objective is explicitly stated.
- [ ] User value/outcome is clear and testable.
- [ ] Success impact is defined (what improves if delivered).
- [ ] Priority/business criticality is documented.
- [ ] Story supports a measurable product goal or KPI when applicable.

## 3. Actors and Permissions

- [ ] Primary actor/persona is clearly identified.
- [ ] Secondary actors are documented when relevant.
- [ ] Role-based permissions and access constraints are defined.
- [ ] Preconditions for actor access are specified (auth, entitlement, status).
- [ ] Unauthorized behavior is defined.

## 4. Functional Scope and Behavior

- [ ] Functional behavior is complete and non-contradictory.
- [ ] In-scope behaviors are explicitly listed.
- [ ] Out-of-scope behaviors are explicitly listed.
- [ ] Main flow is clearly described.
- [ ] Alternate/exception flows are captured.
- [ ] State transitions are defined where relevant.

## 5. Acceptance Criteria Quality

- [ ] Acceptance criteria are specific and measurable.
- [ ] Each acceptance criterion has clear pass/fail conditions.
- [ ] Acceptance criteria are independently testable.
- [ ] Acceptance criteria are consistent with story objective.
- [ ] Negative and boundary expectations are included where applicable.
- [ ] Completion definition is explicit.

## 6. Business Rules and Constraints

- [ ] Business rules are explicitly stated.
- [ ] Rule precedence/conflict handling is defined.
- [ ] Validation criteria are explicit.
- [ ] Legal/compliance constraints are identified where relevant.
- [ ] Assumptions are explicit and reviewable.

## 7. Data and Validation

- [ ] Required data inputs are defined.
- [ ] Optional data inputs are defined.
- [ ] Input format and allowed values are defined.
- [ ] Boundary conditions are defined.
- [ ] Invalid/duplicate data handling is defined.
- [ ] Data lifecycle expectations are documented (create/update/delete/retention).

## 8. Error Handling and Recovery

- [ ] Error handling and negative behavior are defined.
- [ ] User-visible error messages/behavior are specified.
- [ ] Retry/recovery behavior is defined where applicable.
- [ ] Fallback behavior is defined when dependencies fail.
- [ ] Failure conditions are defined.

## 9. Dependencies and Integration

- [ ] Dependencies and external integrations are documented.
- [ ] Upstream/downstream systems are identified.
- [ ] API/event contract expectations are defined where relevant.
- [ ] Environment/configuration dependencies are documented.
- [ ] Dependency ownership/contact is known.

## 10. Non-Functional Requirements

- [ ] Non-functional expectations are identified where relevant.
- [ ] Time constraints are measurable.
- [ ] Performance expectations are measurable.
- [ ] Security requirements are defined (authn/authz/data protection).
- [ ] Accessibility expectations are specified where relevant.
- [ ] Compatibility/device/browser constraints are specified where relevant.

## 11. Traceability and Testability

- [ ] Requirement is traceable to feature or business goal.
- [ ] Traceability to epic/release objective is documented.
- [ ] Open questions and ambiguities are captured.
- [ ] Test scenarios can be derived from the story and acceptance criteria.
- [ ] Test data needs are clear for implementation.

## 12. Risk and Readiness

- [ ] Risks and impact of failure are documented.
- [ ] Unknowns/blockers are identified.
- [ ] Required clarifications are listed and assigned.
- [ ] Story has enough detail for test design.
- [ ] Readiness decision (Ready / Needs Clarification) is explicit.

## 13. Ambiguity Checks

Identify vague or subjective wording.

- [ ] No vague terminology.
- [ ] No subjective wording.
- [ ] No undefined business terms.
- [ ] Quantitative values are provided where needed.
- [ ] Time constraints are measurable.
- [ ] Performance expectations are measurable.
- [ ] Validation criteria are explicit.
- [ ] Success criteria are objective.
- [ ] Failure conditions are defined.

Examples of ambiguous words:

- quickly
- easily
- normally
- appropriate
- sufficient
- user-friendly
- recent
- valid
- optimized
- efficient
