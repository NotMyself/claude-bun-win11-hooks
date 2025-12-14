# Feature: F006 - Hooks Configuration

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured
- **F002**: Plugin manifest created with `.claude-plugin/` directory
- **F007**: Changelog created
- **F003**: Build script created
- **F004**: Handlers bundled to `dist/handlers/`
- **F005**: Viewer bundled to `dist/viewer/`

## Objective

Create `.claude-plugin/hooks.json` with all 12 hook configurations using `${CLAUDE_PLUGIN_ROOT}` variable for paths.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D002**: Bundle to JavaScript — Reference dist/*.js files
- **D007**: Use ${CLAUDE_PLUGIN_ROOT} in hook commands — Standard pattern expanded at runtime

## Edge Cases to Handle

From `edge-cases.md`:

- **EC003**: Plugin variable expansion — `${CLAUDE_PLUGIN_ROOT}` must be correctly expanded by Claude Code

## Code References

- `code/json.md#hooks-json-schema` - Full hooks.json structure

## Constraints

- See `constraints.md` for global rules
- All 12 hooks must be configured
- Use `${CLAUDE_PLUGIN_ROOT}` for all paths
- Timeout of 10000ms for each hook
- Commands must use `bun run` to execute

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `.claude-plugin/hooks.json` | Hook configurations for all 12 event types |

## Implementation Details

Create `.claude-plugin/hooks.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/user-prompt-submit.js",
        "timeout": 10000
      }
    ],
    "PreToolUse": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/pre-tool-use.js",
        "timeout": 10000
      }
    ],
    "PostToolUse": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/post-tool-use.js",
        "timeout": 10000
      }
    ],
    "PostToolUseFailure": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/post-tool-use-failure.js",
        "timeout": 10000
      }
    ],
    "Notification": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/notification.js",
        "timeout": 10000
      }
    ],
    "SessionStart": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/session-start.js",
        "timeout": 10000
      }
    ],
    "SessionEnd": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/session-end.js",
        "timeout": 10000
      }
    ],
    "Stop": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/stop.js",
        "timeout": 10000
      }
    ],
    "SubagentStart": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/subagent-start.js",
        "timeout": 10000
      }
    ],
    "SubagentStop": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/subagent-stop.js",
        "timeout": 10000
      }
    ],
    "PreCompact": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/pre-compact.js",
        "timeout": 10000
      }
    ],
    "PermissionRequest": [
      {
        "command": "bun run ${CLAUDE_PLUGIN_ROOT}/dist/handlers/permission-request.js",
        "timeout": 10000
      }
    ]
  }
}
```

### Hook Event Types

| Hook | When Triggered |
|------|----------------|
| UserPromptSubmit | User submits a prompt |
| PreToolUse | Before a tool is executed |
| PostToolUse | After a tool completes successfully |
| PostToolUseFailure | After a tool fails |
| Notification | System notification is sent |
| SessionStart | Claude Code session begins |
| SessionEnd | Claude Code session ends |
| Stop | User interrupts execution |
| SubagentStart | Sub-agent is spawned |
| SubagentStop | Sub-agent completes |
| PreCompact | Before context is compacted |
| PermissionRequest | Permission is requested |

## Acceptance Criteria

- [ ] `.claude-plugin/hooks.json` exists and is valid JSON
- [ ] All 12 hook types are configured
- [ ] Each hook uses `${CLAUDE_PLUGIN_ROOT}` for the path
- [ ] Each hook has a 10000ms timeout
- [ ] Handler filenames match the bundled files in `dist/handlers/`

## Verification

```bash
# Validate JSON
cat .claude-plugin/hooks.json | jq .

# Count hook types (should be 12)
jq '.hooks | keys | length' .claude-plugin/hooks.json

# List all hook types
jq '.hooks | keys[]' .claude-plugin/hooks.json

# Verify all use CLAUDE_PLUGIN_ROOT
grep -c 'CLAUDE_PLUGIN_ROOT' .claude-plugin/hooks.json

# Cross-reference with dist/handlers/
for handler in dist/handlers/*.js; do
  name=$(basename "$handler" .js)
  grep -q "$name" .claude-plugin/hooks.json && echo "✓ $name" || echo "✗ $name missing"
done
```

## Commit

```bash
git add .claude-plugin/hooks.json
git commit -m "feat(plugin): add hooks.json with all 12 hook configurations

Implements: F006
Decisions: D002, D007

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/08-version-sync.md` (F008)
