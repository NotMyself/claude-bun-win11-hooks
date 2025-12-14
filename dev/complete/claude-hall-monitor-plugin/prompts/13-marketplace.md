# Feature: F013 - Marketplace Registration

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000-F012**: Complete plugin with CI/CD workflows

## Objective

Register the claude-hall-monitor plugin in the NotMyself/claude-dotnet-marketplace by adding an entry to the marketplace.json file.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D001**: Create new repo vs rename — Plugin is at NotMyself/claude-hall-monitor

## Edge Cases to Handle

None specific to this feature.

## Code References

None specific - this is marketplace configuration.

## Constraints

- See `constraints.md` for global rules
- Entry must be valid JSON
- Must reference the correct repository
- Must match plugin.json metadata

## Files to Create/Modify

This feature modifies a file in a **different repository**: `NotMyself/claude-dotnet-marketplace`

| File | Purpose |
|------|---------|
| `.claude-plugin/marketplace.json` | Add plugin entry |

## Implementation Details

### 1. Clone Marketplace Repository

```bash
git clone https://github.com/NotMyself/claude-dotnet-marketplace.git
cd claude-dotnet-marketplace
```

### 2. Add Plugin Entry

Edit `.claude-plugin/marketplace.json` to add the claude-hall-monitor plugin:

```json
{
  "plugins": [
    ...existing plugins...,
    {
      "name": "claude-hall-monitor",
      "repository": "NotMyself/claude-hall-monitor",
      "description": "Comprehensive hook monitoring with realtime viewer UI for Claude Code",
      "author": "NotMyself",
      "version": "1.0.0",
      "keywords": ["hooks", "monitoring", "viewer", "logging"],
      "license": "MIT",
      "homepage": "https://github.com/NotMyself/claude-hall-monitor",
      "features": [
        "12 hook handlers with JSONL logging",
        "Realtime log viewer UI with SSE streaming",
        "6 rules files for Claude Code conventions",
        "3 slash commands for planning and orchestration",
        "Cross-platform support (Windows, macOS, Linux)"
      ],
      "requirements": {
        "runtime": "bun>=1.0.0"
      }
    }
  ]
}
```

### 3. Create Pull Request

```bash
# Create branch
git checkout -b add-claude-hall-monitor

# Stage changes
git add .claude-plugin/marketplace.json

# Commit
git commit -m "feat: add claude-hall-monitor plugin

Adds comprehensive hook monitoring plugin with:
- 12 hook handlers with JSONL logging
- Realtime log viewer UI with SSE streaming
- 6 rules files for Claude Code conventions
- 3 slash commands for planning and orchestration

Repository: https://github.com/NotMyself/claude-hall-monitor

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push branch
git push origin add-claude-hall-monitor

# Create PR (using gh CLI)
gh pr create \
  --title "Add claude-hall-monitor plugin" \
  --body "## Summary

Adds the claude-hall-monitor plugin to the marketplace.

## Plugin Details

- **Name:** claude-hall-monitor
- **Repository:** NotMyself/claude-hall-monitor
- **Version:** 1.0.0
- **License:** MIT

## Features

- 12 hook handlers with JSONL logging
- Realtime log viewer UI with SSE streaming
- 6 rules files for Claude Code conventions
- 3 slash commands for planning and orchestration
- Cross-platform support (Windows, macOS, Linux)

## Checklist

- [x] Plugin repository exists and is public
- [x] Plugin has valid .claude-plugin/plugin.json
- [x] Plugin has valid .claude-plugin/hooks.json
- [x] Plugin has README with installation instructions
- [x] Plugin has at least one release" \
  --base main
```

## Acceptance Criteria

- [ ] Marketplace repository cloned
- [ ] Plugin entry added to marketplace.json
- [ ] Entry has correct repository reference
- [ ] Entry has correct version (1.0.0)
- [ ] Entry includes all key features
- [ ] PR created against marketplace main branch
- [ ] PR passes any marketplace validation checks

## Verification

```bash
# Validate marketplace.json is valid JSON
cat .claude-plugin/marketplace.json | jq .

# Check plugin entry exists
jq '.plugins[] | select(.name == "claude-hall-monitor")' .claude-plugin/marketplace.json

# Verify repository URL works
curl -sI https://github.com/NotMyself/claude-hall-monitor | head -1
```

## Commit

This feature creates commits in the **marketplace repository**, not the plugin repository.

```bash
# In claude-dotnet-marketplace repo
git add .claude-plugin/marketplace.json
git commit -m "feat: add claude-hall-monitor plugin

Repository: https://github.com/NotMyself/claude-hall-monitor

Implements: F013

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

This is the final feature. The plugin implementation is complete.

## Post-Implementation Checklist

After all features are complete:

1. [ ] Verify all tests pass locally
2. [ ] Create initial release (v1.0.0 tag)
3. [ ] Verify release workflow creates GitHub release
4. [ ] Merge marketplace PR
5. [ ] Test plugin installation via marketplace
6. [ ] Update any external documentation

## Installation Test

After marketplace registration, test installation:

```bash
# Install via marketplace
claude plugins install NotMyself/claude-hall-monitor

# Verify hooks are active
claude --version

# Start a new session and check viewer
# Should be accessible at http://localhost:3456
```
