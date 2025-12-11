# Feature: e2e-validation - End-to-End Screenshot Validation

## Context
Completed in prior steps:
- `toDockerPath` function for path conversion
- `configurePlaywrightScreenshots` function for Docker MCP configuration
- Integration into SessionStart hook's main() function

## Objective
Validate that the implementation works end-to-end by verifying screenshots are saved to the project's `screenshots/` directory.

**It is unacceptable to implement features beyond the scope of this task.**

## Constraints
- Reference: See `constraints.md` for global rules
- This is a validation task - no code changes
- Use Playwright MCP to take a test screenshot
- Verify the file exists in the correct location

## Validation Steps

### 1. Verify Type Checking Passes
```bash
cd .claude/hooks && bun run tsc --noEmit
```

### 2. Verify Screenshots Directory Exists
Check that the `screenshots` folder was created in the project root.

Use MCP tool: `list_directory` with path `/C/Users/BobbyJohnson/src/claude/claude-bun-win11-hooks`

### 3. Take a Test Screenshot
Use Playwright MCP to navigate to a page and take a screenshot:

1. Navigate to a test URL (e.g., `https://example.com`)
2. Take a screenshot with filename `test-validation.png`

### 4. Verify Screenshot Location
Check that the screenshot appears in `./screenshots/`:

Use MCP tool: `list_directory` with path `/C/Users/BobbyJohnson/src/claude/claude-bun-win11-hooks/screenshots`

Expected: `test-validation.png` should be listed.

## Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] `screenshots/` directory exists in project root
- [ ] Taking a screenshot saves file to `./screenshots/`
- [ ] Screenshot file is visible via MCP file listing

## Cleanup
After validation, optionally remove the test screenshot:

```bash
rm ./screenshots/test-validation.png
```

Or keep it as proof of successful implementation.

## Commit
```bash
git add .claude/hooks/session-start.ts screenshots/
git commit -m "feat(hooks): auto-configure Playwright screenshots per project

- Add toDockerPath utility for Windows to Docker path conversion
- Add configurePlaywrightScreenshots function
- Integrate into SessionStart hook on startup
- Screenshots now save to ./screenshots/ in current project"
```

## Done
Implementation complete. Screenshots will now automatically save to the current project's `screenshots/` folder on every session startup.
