# Feature: F000 - Project Preparation

## Project Context

See `context.md` for feature rationale and architecture vision.

**Summary**: This is a complete replacement of the existing hooks system. We're deleting the old implementation and preparing the project for the new metrics-focused architecture.

## Prior Work

None - this is the first step.

## Objective

Delete all files from the old hooks system and update project configuration files to prepare for the new architecture.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope. Only perform deletions and configuration updates.

## Relevant Decisions

From `decisions.md`:
- **D001**: Complete replacement over incremental enhancement — We're removing the old system entirely for a clean slate
- **D002**: Big bang deployment — No gradual migration, complete replacement when ready
- **D009**: No migration from old system — Old JSONL logs won't be preserved

## Edge Cases to Handle

None for this feature.

## Code References

Read these sections before implementing:
- `code/bash.md#deletion-commands` - Commands for safely deleting old files
- `code/bash.md#file-inspection` - Verification commands

## Constraints

- See `constraints.md` for global rules
- **CRITICAL**: This is a destructive operation - verify paths before deletion
- Do not delete: `.claude-plugin/`, `hooks/package.json`, `hooks/build.ts`, `commands/`, `rules/`
- Create backup if uncertain (optional safety measure)

## Files to Delete

| File/Directory | Reason |
|----------------|--------|
| `hooks/utils/logger.ts` | Old JSONL logger being replaced |
| `hooks/handlers/*.ts` | All 12 existing hook handlers being rewritten |
| `hooks/viewer/*` | Entire viewer directory being rebuilt |
| `hooks/logs/` | Old log directory no longer needed |
| `hooks/utils/__tests__/logger.test.ts` | Old logger tests |

## Files to Update

| File | Changes |
|------|---------|
| `.claude-plugin/hooks.json` | Update handler paths (will point to new handlers) |
| `hooks/package.json` | Prepare for new structure (no dependency changes yet) |
| `hooks/build.ts` | Note that updates will be needed for new structure |

## Implementation Details

### Step 1: Verify Current State

Before deletion, verify what exists:

```bash
ls -la hooks/handlers/
ls -la hooks/viewer/
ls -la hooks/utils/
```

### Step 2: Delete Old Files

Execute deletions carefully:

```bash
rm -rf hooks/utils/logger.ts
rm -rf hooks/handlers/*.ts
rm -rf hooks/viewer/*
rm -rf hooks/logs/
rm -rf hooks/utils/__tests__/logger.test.ts
```

### Step 3: Update .claude-plugin/hooks.json

Clear out the old handler mappings temporarily (new handlers will be added in later features):

```json
{
  "UserPromptSubmit": "dist/handlers/user-prompt-submit.js",
  "PreToolUse": "dist/handlers/pre-tool-use.js",
  "PostToolUse": "dist/handlers/post-tool-use.js",
  "PostToolUseFailure": "dist/handlers/post-tool-use-failure.js",
  "Notification": "dist/handlers/notification.js",
  "SessionStart": "dist/handlers/session-start.js",
  "SessionEnd": "dist/handlers/session-end.js",
  "Stop": "dist/handlers/stop.js",
  "SubagentStart": "dist/handlers/subagent-start.js",
  "SubagentStop": "dist/handlers/subagent-stop.js",
  "PreCompact": "dist/handlers/pre-compact.js",
  "PermissionRequest": "dist/handlers/permission-request.js"
}
```

**Note**: These paths point to handlers that don't exist yet. That's expected - they'll be created in later features.

### Step 4: Create New Directory Structure

```bash
mkdir -p hooks/metrics/__tests__
mkdir -p hooks/handlers/__tests__
mkdir -p hooks/viewer/api
mkdir -p hooks/viewer/sse
mkdir -p hooks/viewer/__tests__/api
mkdir -p hooks/data/archive
```

### Step 5: Verify Clean State

```bash
# Should be empty or not exist
ls hooks/handlers/
ls hooks/viewer/

# Should exist
ls hooks/metrics/
ls hooks/data/
```

## Acceptance Criteria

- [ ] All old handler files deleted from `hooks/handlers/`
- [ ] Old viewer directory cleared `hooks/viewer/`
- [ ] Old logger.ts and tests removed from `hooks/utils/`
- [ ] Old logs directory removed
- [ ] `.claude-plugin/hooks.json` updated with new paths (even though handlers don't exist yet)
- [ ] New directory structure created (`hooks/metrics/`, `hooks/data/`, etc.)
- [ ] No build errors (build will fail until handlers are created, but config should be valid)

## Verification

```bash
# Verify deletions
ls hooks/handlers/ # Should be empty or have only __tests__ dir
ls hooks/viewer/ # Should be empty or have only api/, sse/, __tests__ dirs
test ! -f hooks/utils/logger.ts && echo "✓ logger.ts deleted"

# Verify new directories exist
test -d hooks/metrics && echo "✓ metrics/ exists"
test -d hooks/data && echo "✓ data/ exists"
test -d hooks/handlers/__tests__ && echo "✓ handlers/__tests__/ exists"

# Verify hooks.json is valid JSON
cat .claude-plugin/hooks.json | jq . > /dev/null && echo "✓ hooks.json is valid"
```

## Commit

```bash
git add -A
git commit -m "feat(metrics): prepare project for new metrics system

Implements: F000
Decisions: D001, D002, D009

- Delete old hooks system (logger, handlers, viewer)
- Update .claude-plugin/hooks.json with new handler paths
- Create new directory structure for metrics subsystem
- This is a complete replacement, not an incremental update

BREAKING CHANGE: Removes all existing hook handlers and logging system"
```

## Next

Proceed to: `prompts/01-types-schema-pricing.md` (F001, F002, F003)
