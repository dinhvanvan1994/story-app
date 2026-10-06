# Clarification Rules

Rules for handling missing or ambiguous information.

1. Never invent business behavior.
2. Ask clarification when ambiguity affects correctness.
3. Record explicit assumptions only when proceeding is still safe.
4. Stop execution when critical information is unavailable.
5. Separate confirmed facts from assumptions in outputs.

Critical ambiguity examples:

- Undefined acceptance criteria or success conditions.
- Missing expected result for key workflow steps.
- Unclear role permissions or access constraints.
- Missing integration dependency behavior.

Output expectations:

- Include unresolved questions in a dedicated list.
- Include impact of each unresolved question.
- Mark readiness as blocked when critical ambiguity remains.
