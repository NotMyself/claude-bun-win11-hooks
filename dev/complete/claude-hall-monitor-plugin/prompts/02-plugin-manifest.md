# Feature: F002 - Plugin Manifest

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized
- **F001**: Files restructured to root level

## Objective

Create the `.claude-plugin/plugin.json` manifest file with plugin metadata.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D003**: Semantic versioning starting at 1.0.0 — Use version "1.0.0" in the manifest

## Edge Cases to Handle

From `edge-cases.md`:

- **EC010**: Missing .claude-plugin directory — Ensure directory and file are created correctly

## Code References

- `code/json.md#plugin-json-schema` - Exact structure for plugin.json

## Constraints

- See `constraints.md` for global rules
- Version must be "1.0.0"
- Name must be "claude-hall-monitor"
- All required fields must be present

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `.claude-plugin/plugin.json` | Plugin metadata and configuration |

## Implementation Details

### 1. Create Plugin Directory

```bash
mkdir -p .claude-plugin
```

### 2. Create plugin.json

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "claude-hall-monitor",
  "version": "1.0.0",
  "description": "Comprehensive hook monitoring with realtime viewer UI for Claude Code",
  "author": "NotMyself",
  "license": "MIT",
  "repository": "https://github.com/NotMyself/claude-hall-monitor",
  "keywords": [
    "claude-code",
    "hooks",
    "monitoring",
    "viewer",
    "logging"
  ],
  "engines": {
    "bun": ">=1.0.0"
  },
  "files": [
    "dist/**/*",
    "hooks/**/*",
    "rules/**/*",
    "commands/**/*",
    "CHANGELOG.md",
    "README.md"
  ]
}
```

### Field Descriptions

| Field | Purpose |
|-------|---------|
| `name` | Plugin identifier, used for installation |
| `version` | Semantic version, starting at 1.0.0 |
| `description` | Brief description shown in marketplace |
| `author` | GitHub username of maintainer |
| `license` | License type (MIT) |
| `repository` | GitHub repository URL |
| `keywords` | Search terms for discovery |
| `engines.bun` | Minimum Bun version required |
| `files` | Files included in distribution |

## Acceptance Criteria

- [ ] `.claude-plugin/` directory exists
- [ ] `.claude-plugin/plugin.json` exists and is valid JSON
- [ ] `name` is "claude-hall-monitor"
- [ ] `version` is "1.0.0"
- [ ] All required fields are present
- [ ] `files` array includes dist, hooks, rules, commands

## Verification

```bash
# Verify directory exists
test -d .claude-plugin && echo "Directory exists"

# Validate JSON
cat .claude-plugin/plugin.json | jq .

# Check specific fields
jq '.name' .claude-plugin/plugin.json
jq '.version' .claude-plugin/plugin.json
```

## Commit

```bash
git add .claude-plugin/
git commit -m "feat(plugin): add plugin manifest

Implements: F002
Decisions: D003

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/03-changelog.md` (F007)
