# Dev Review Checklist

Used by the Developer Agent at Step 4. Copy this structure into
`docs/reviews/US-{id}-dev-review.md` and fill in each item.

```markdown
## Dev Review — US-{id}

### Correctness  ✅ / ❌
<!-- Trace each AC to the code that satisfies it -->
- AC-1: <file:line> ✅
- AC-2: <file:line> ✅

### Architecture compliance  ✅ / ❌
- [ ] No business logic in hooks, components, or storage modules
- [ ] No new sessionStorage keys without a decisions.md entry
- [ ] All room state changes go through the reducer

### Code quality  ✅ / ❌
- [ ] No `any`, no swallowed errors, no `console.log` in production code
- [ ] All new exported functions have explicit return types
- [ ] No dead code (unused imports, variables, functions)

### Test coverage  ✅ / ❌
- [ ] Every new pure function has at least a happy-path test
- [ ] Each test block has a `// TC-XXX-YY` comment
- [ ] `npm test` output: all pass, none skipped

### Traceability  ✅ / ❌
- [ ] Dev spec updated if implementation deviated from it
- [ ] `data-testid` values match `docs/test-cases/US-{id}-test-cases.md` exactly
- [ ] Review saved to `docs/reviews/US-{id}-dev-review.md`

### Build & test output

\`\`\`
npm run build output:
...

npm test output:
...
\`\`\`

### Summary
Ready for handoff / Blocked on: <list any ❌ items here>
```
