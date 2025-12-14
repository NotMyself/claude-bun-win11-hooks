# Feature: F007 - Changelog Setup

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured
- **F002**: Plugin manifest created with version 1.0.0

## Objective

Create CHANGELOG.md following the Keep a Changelog format with the initial 1.0.0 release entry.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D003**: Semantic versioning starting at 1.0.0 — Document 1.0.0 as initial release
- **D004**: Keep a Changelog format — Follow https://keepachangelog.com/en/1.1.0/

## Edge Cases to Handle

From `edge-cases.md`:

- **EC006**: Version drift — This establishes the changelog version that must stay in sync

## Code References

- `code/json.md#changelog-md-structure` - Keep a Changelog format

## Constraints

- See `constraints.md` for global rules
- Follow Keep a Changelog format exactly
- Version must match plugin.json (1.0.0)
- Include all features in the Added section

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `CHANGELOG.md` | Version history following Keep a Changelog format |

## Implementation Details

Create `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-14

### Added

- Initial release of claude-hall-monitor plugin
- 12 hook handlers with JSONL logging:
  - UserPromptSubmit: Log prompts, inject context
  - PreToolUse: Allow/deny/modify tool inputs
  - PostToolUse: Log results, modify MCP output
  - PostToolUseFailure: Log failures, recovery context
  - Notification: Log system notifications
  - SessionStart: Log start, auto-start viewer
  - SessionEnd: Log end, shutdown viewer
  - Stop: Log user interrupts
  - SubagentStart: Log subagent spawn
  - SubagentStop: Log subagent completion
  - PreCompact: Log context compaction
  - PermissionRequest: Auto-approve/deny permissions
- Realtime log viewer UI with SSE streaming (port 3456)
- 6 rules files for Claude Code conventions
- 3 slash commands for planning and orchestration
- Cross-platform support (Windows, macOS, Linux)
- Bundled JavaScript distribution (no bun install needed)

### Security

- Network binding restricted to localhost only
- CORS restricted to localhost origin
- Path traversal protection on all file endpoints
- Session ID validation (alphanumeric + hyphens, max 64 chars)
- Bearer token authentication for shutdown endpoint
- Rate limiting on SSE connections (5 per IP per 60s)
- Content Security Policy headers on HTML responses

[Unreleased]: https://github.com/NotMyself/claude-hall-monitor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/NotMyself/claude-hall-monitor/releases/tag/v1.0.0
```

## Acceptance Criteria

- [ ] CHANGELOG.md exists in repository root
- [ ] Format follows Keep a Changelog specification
- [ ] Version 1.0.0 section is present with correct date
- [ ] All 12 hook handlers listed in Added section
- [ ] Security features documented
- [ ] Footer links point to correct GitHub URLs

## Verification

```bash
# Check file exists
test -f CHANGELOG.md && echo "CHANGELOG exists"

# Check version matches plugin.json
CHANGELOG_VERSION=$(grep -m1 '## \[' CHANGELOG.md | sed 's/.*\[\(.*\)\].*/\1/')
PLUGIN_VERSION=$(jq -r '.version' .claude-plugin/plugin.json)
echo "CHANGELOG: $CHANGELOG_VERSION"
echo "plugin.json: $PLUGIN_VERSION"
test "$CHANGELOG_VERSION" = "$PLUGIN_VERSION" && echo "Versions match"
```

## Commit

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG.md with 1.0.0 release

Implements: F007
Decisions: D003, D004

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/04-build-script.md` (F003)
