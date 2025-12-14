# Feature: F004 - Handler Bundling

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured with handlers in `hooks/handlers/`
- **F002**: Plugin manifest created
- **F007**: Changelog created
- **F003**: Build script created

## Objective

Execute the build script to bundle all 12 hook handlers to standalone JavaScript files with inlined dependencies.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D002**: Bundle to JavaScript — All dependencies must be inlined; no external requires

## Edge Cases to Handle

From `edge-cases.md`:

- **EC001**: Cross-platform path handling — Bundled code must work on Windows, macOS, Linux
- **EC004**: Build output directory conflicts — Build script handles this (cleans first)
- **EC008**: Permission denied errors — Verify output files are executable

## Code References

- `code/typescript.md#build-script-core` - Build script (already created)
- `code/bash.md#build-output-verification` - Verification commands

## Constraints

- See `constraints.md` for global rules
- All 12 handlers must be bundled
- Dependencies must be inlined (check no external requires)
- Output files must be directly executable with `bun run`

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `dist/handlers/session-start.js` | Bundled SessionStart handler |
| `dist/handlers/session-end.js` | Bundled SessionEnd handler |
| `dist/handlers/user-prompt-submit.js` | Bundled UserPromptSubmit handler |
| `dist/handlers/pre-tool-use.js` | Bundled PreToolUse handler |
| `dist/handlers/post-tool-use.js` | Bundled PostToolUse handler |
| `dist/handlers/post-tool-use-failure.js` | Bundled PostToolUseFailure handler |
| `dist/handlers/notification.js` | Bundled Notification handler |
| `dist/handlers/stop.js` | Bundled Stop handler |
| `dist/handlers/subagent-start.js` | Bundled SubagentStart handler |
| `dist/handlers/subagent-stop.js` | Bundled SubagentStop handler |
| `dist/handlers/pre-compact.js` | Bundled PreCompact handler |
| `dist/handlers/permission-request.js` | Bundled PermissionRequest handler |

## Implementation Details

### 1. Install Development Dependencies

Before building, ensure dev dependencies are installed:

```bash
cd hooks
bun install
cd ..
```

### 2. Run Build Script

```bash
bun run build.ts
```

Expected output:
```
Building claude-hall-monitor...

Cleaning dist/...
Found 12 handlers to build

Building handlers...
Built 12 handlers

Building viewer...
Built viewer server

Copying viewer assets...
  Copied index.html

✓ Build complete!
  Handlers: dist/handlers/ (12 files)
  Viewer:   dist/viewer/
```

### 3. Verify Bundled Output

Check that all handlers are present:

```bash
ls dist/handlers/
```

Should show:
```
notification.js
permission-request.js
post-tool-use-failure.js
post-tool-use.js
pre-compact.js
pre-tool-use.js
session-end.js
session-start.js
stop.js
subagent-start.js
subagent-stop.js
user-prompt-submit.js
```

### 4. Test Handler Execution

Test that a bundled handler can execute:

```bash
echo '{"session_id":"test-123"}' | bun run dist/handlers/session-start.js
```

Should output valid JSON response.

## Acceptance Criteria

- [ ] All 12 handler .js files exist in `dist/handlers/`
- [ ] Each file is a standalone bundle (no external requires for project dependencies)
- [ ] Each handler can execute with `bun run dist/handlers/<name>.js`
- [ ] Each handler produces valid JSON output
- [ ] Total bundle size is reasonable (< 100KB per handler)

## Verification

```bash
# Count handlers (should be 12)
ls dist/handlers/*.js | wc -l

# Check file sizes
du -h dist/handlers/*.js

# Test session-start handler
echo '{"session_id":"test-verify"}' | bun run dist/handlers/session-start.js

# Test pre-tool-use handler
echo '{"session_id":"test-verify","tool_name":"Bash","tool_input":{}}' | bun run dist/handlers/pre-tool-use.js

# Verify no external requires for project files
grep -l "require.*\.\./" dist/handlers/*.js || echo "No external requires found"
```

## Commit

```bash
git add dist/handlers/
git commit -m "build: bundle all 12 hook handlers

Implements: F004
Decisions: D002

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/06-viewer-bundling.md` (F005)
