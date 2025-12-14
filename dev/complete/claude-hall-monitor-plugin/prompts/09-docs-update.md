# Feature: F009 - Documentation Updates

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured from `.claude/` to root
- **F002-F008**: Plugin configuration and versioning complete

## Objective

Update README.md with plugin installation instructions and update all rule files with corrected paths.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D001**: Create new repo vs rename — README should document the new repository

## Edge Cases to Handle

From `edge-cases.md`:

- **EC002**: Bun runtime not installed — Document Bun as prerequisite
- **EC005**: Viewer port conflicts — Document default port and configuration

## Code References

- `code/bash.md#path-cleanup` - Commands to find old path references

## Constraints

- See `constraints.md` for global rules
- Update all references from `.claude/hooks/` to `hooks/`
- Update all references from `.claude/rules/` to `rules/`
- Update all references from `.claude/commands/` to `commands/`

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `README.md` | Complete plugin documentation |
| `rules/commands.md` | Update path references |
| `rules/hook-handlers.md` | Update path references |
| `rules/testing.md` | Update path references |

## Implementation Details

### 1. Update README.md

Replace the placeholder README with full documentation:

```markdown
# Claude Hall Monitor

Comprehensive hook monitoring with realtime viewer UI for Claude Code.

## Features

- **12 Hook Handlers**: Full coverage of all Claude Code hook events
- **Realtime Viewer**: Web UI with SSE streaming for live monitoring
- **6 Rules Files**: Actionable conventions auto-loaded by Claude Code
- **3 Slash Commands**: Custom commands for planning and orchestration
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or later
- Claude Code CLI

## Installation

### Via Marketplace (Recommended)

```bash
claude plugins install NotMyself/claude-hall-monitor
```

### Manual Installation

1. Download the latest release from [Releases](https://github.com/NotMyself/claude-hall-monitor/releases)
2. Extract to your Claude Code plugins directory
3. Restart Claude Code

## Usage

Once installed, the plugin automatically:

- Logs all hook events to `hooks-log.txt` in JSONL format
- Starts the realtime viewer on session start (http://localhost:3456)
- Shuts down the viewer on session end

### Viewing Logs

Open http://localhost:3456 in your browser to see realtime hook events.

### Hook Handlers

| Hook | Purpose |
|------|---------|
| UserPromptSubmit | Log prompts, inject context |
| PreToolUse | Allow/deny/modify tool inputs |
| PostToolUse | Log results, modify MCP output |
| PostToolUseFailure | Log failures, recovery context |
| Notification | Log system notifications |
| SessionStart | Log start, auto-start viewer |
| SessionEnd | Log end, shutdown viewer |
| Stop | Log user interrupts |
| SubagentStart | Log subagent spawn |
| SubagentStop | Log subagent completion |
| PreCompact | Log context compaction |
| PermissionRequest | Auto-approve/deny permissions |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOOK_VIEWER_HOST` | `localhost` | Viewer bind address |
| `HOOK_VIEWER_PORT` | `3456` | Viewer port |

## Development

```bash
# Install dependencies
cd hooks
bun install

# Run tests
bun run test:run

# Build distribution
cd ..
bun run build.ts
```

## Security

The viewer includes comprehensive security hardening:

- Network binding restricted to localhost only
- CORS restricted to localhost origin
- Path traversal protection on all file endpoints
- Session ID validation
- Bearer token authentication for shutdown endpoint
- Rate limiting on SSE connections
- Content Security Policy headers

## License

MIT License - see [LICENSE](LICENSE) for details.
```

### 2. Update rules/commands.md

Change path references:

```markdown
# Project Commands

All commands run from `hooks` directory unless otherwise specified.

## Development

```bash
# Install dependencies
bun install

# Type check
bun run tsc --noEmit

# Start realtime log viewer
bun run viewer

# Start viewer with hot reload
bun run viewer:dev
```

## Testing

```bash
# Run tests (watch mode)
bun run test

# Run tests once
bun run test:run

# Run tests with coverage
bun run test:coverage
```

## Debugging

```bash
# View structured logs
cat hooks-log.txt

# Run a hook directly
bun run handlers/<hook-name>.ts
```
```

### 3. Update rules/hook-handlers.md

Change `.claude/hooks/handlers/` to `hooks/handlers/`:

```markdown
When creating or modifying hook handlers in `hooks/handlers/`:
```

### 4. Update rules/testing.md

Change `.claude/hooks/` references:

```markdown
Tests live in `hooks/viewer/__tests__/`
```

And:

```bash
cd hooks
```

## Acceptance Criteria

- [ ] README.md has complete installation and usage documentation
- [ ] README.md documents all 12 hooks
- [ ] README.md documents environment variables
- [ ] rules/commands.md has updated paths
- [ ] rules/hook-handlers.md has updated paths
- [ ] rules/testing.md has updated paths
- [ ] No references to `.claude/hooks/` remain

## Verification

```bash
# Check for old path references
grep -r "\.claude/hooks" --include="*.md" && echo "Old paths found!" || echo "✓ No old paths"
grep -r "\.claude/rules" --include="*.md" && echo "Old paths found!" || echo "✓ No old paths"

# Verify README has key sections
grep -q "## Installation" README.md && echo "✓ Installation section"
grep -q "## Usage" README.md && echo "✓ Usage section"
grep -q "## Security" README.md && echo "✓ Security section"
```

## Commit

```bash
git add README.md rules/
git commit -m "docs: update documentation with plugin structure

- Add complete README with installation instructions
- Update rules files with new directory paths

Implements: F009

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/10-e2e-tests.md` (F010)
