# Feature: session-start-integration - SessionStart Hook Integration

## Context
Completed in prior steps:
- `toDockerPath` function for path conversion
- `configurePlaywrightScreenshots` function for Docker MCP configuration

## Objective
Integrate the Playwright configuration into the SessionStart hook's `main()` function so it runs automatically on session startup.

**It is unacceptable to implement features beyond the scope of this task.**

## Constraints
- Reference: See `constraints.md` for global rules
- Only modify the `main()` function
- Only run configuration on `startup` source (not resume/clear/compact)
- Preserve all existing functionality

## Files to Modify
- `.claude/hooks/session-start.ts` - Integrate into main() function

## Implementation Details

In the `main()` function, find this block:

```typescript
// === Start viewer on fresh startup ===
if (input.source === "startup") {
  const viewerRunning = await isViewerRunning();
  // ...
}
```

Add the Playwright configuration call at the beginning of this block:

```typescript
// === Start viewer on fresh startup ===
if (input.source === "startup") {
  // Configure Playwright MCP to save screenshots to project directory
  await configurePlaywrightScreenshots(input.cwd);

  const viewerRunning = await isViewerRunning();
  // ... rest of existing code
}
```

## Acceptance Criteria
- [ ] `configurePlaywrightScreenshots` is called in the startup block
- [ ] Configuration runs BEFORE viewer startup check
- [ ] Configuration only runs when `input.source === "startup"`
- [ ] Configuration does NOT run on resume, clear, or compact
- [ ] All existing viewer functionality preserved
- [ ] TypeScript compiles without errors

## Verification
```bash
cd .claude/hooks && bun run tsc --noEmit
```

## Commit
```bash
git add .claude/hooks/session-start.ts
git commit -m "feat(hooks): integrate Playwright screenshot config into session startup"
```

## Next
Proceed to: `04-e2e-validation.md`
