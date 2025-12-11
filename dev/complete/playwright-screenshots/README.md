# Auto-Configure Playwright MCP Screenshots per Project

Automatically save Playwright MCP screenshots to a `screenshots/` folder in the current project directory.

## Orchestration Guide

Execute prompts in order using `/orchestrate-plan dev/active/playwright-screenshots`:

| Order | Prompt | Feature | Status |
|-------|--------|---------|--------|
| 1 | `prompts/01-path-utils.md` | Windows to Docker path conversion | pending |
| 2 | `prompts/02-playwright-config.md` | Playwright MCP configuration function | pending |
| 3 | `prompts/03-session-start-integration.md` | SessionStart hook integration | pending |
| 4 | `prompts/04-e2e-validation.md` | End-to-end validation | pending |

## Quick Start

```bash
# Run all prompts sequentially
/orchestrate-plan dev/active/playwright-screenshots

# Or run manually one at a time
# Read each prompt file and execute its instructions
```

## Files

- `features.json` - Feature tracking with status
- `constraints.md` - Global rules for all prompts
- `prompts/` - Individual feature prompts

## File Modified
- `.claude/hooks/session-start.ts`

## Verification
After implementation, start a new session and take a screenshot - it should appear in `./screenshots/` in the current project.
