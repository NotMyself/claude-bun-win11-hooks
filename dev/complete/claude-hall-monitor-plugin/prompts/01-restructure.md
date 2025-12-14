# Feature: F001 - Project Restructure

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Repository initialized with README, .gitignore, LICENSE

## Objective

Move files from the source repository's `.claude/` directory structure to the new root-level plugin structure.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

From `decisions.md`:

- **D001**: Create new repo vs rename — We're copying files to a new repository, not renaming

## Edge Cases to Handle

None specific to this feature.

## Code References

- `code/bash.md#structure-verification` - Commands to verify the new structure

## Constraints

- See `constraints.md` for global rules
- Preserve file permissions
- Maintain directory structure within each folder
- Do not modify file contents (that's a separate feature)

## Files to Create/Modify

Copy from source repo `claude-bun-win11-hooks` to target `claude-hall-monitor`:

| Source | Destination |
|--------|-------------|
| `.claude/hooks/handlers/` | `hooks/handlers/` |
| `.claude/hooks/utils/` | `hooks/utils/` |
| `.claude/hooks/viewer/` | `hooks/viewer/` |
| `.claude/hooks/package.json` | `hooks/package.json` |
| `.claude/hooks/tsconfig.json` | `hooks/tsconfig.json` |
| `.claude/hooks/vitest.config.ts` | `hooks/vitest.config.ts` |
| `.claude/rules/` | `rules/` |
| `.claude/commands/` | `commands/` |

## Implementation Details

### 1. Copy Hook Files

```bash
# From the claude-hall-monitor repo root
# Assuming source repo is at ../claude-bun-win11-hooks

mkdir -p hooks/handlers hooks/utils hooks/viewer

cp ../claude-bun-win11-hooks/.claude/hooks/handlers/*.ts hooks/handlers/
cp ../claude-bun-win11-hooks/.claude/hooks/utils/*.ts hooks/utils/
cp -r ../claude-bun-win11-hooks/.claude/hooks/viewer/* hooks/viewer/
cp ../claude-bun-win11-hooks/.claude/hooks/package.json hooks/
cp ../claude-bun-win11-hooks/.claude/hooks/tsconfig.json hooks/
cp ../claude-bun-win11-hooks/.claude/hooks/vitest.config.ts hooks/
```

### 2. Copy Rules

```bash
mkdir -p rules
cp ../claude-bun-win11-hooks/.claude/rules/*.md rules/
```

### 3. Copy Commands

```bash
mkdir -p commands
cp ../claude-bun-win11-hooks/.claude/commands/*.md commands/
```

### 4. Verify Structure

```bash
# Should show 12 handler files
ls hooks/handlers/

# Should show logger.ts
ls hooks/utils/

# Should show viewer files
ls hooks/viewer/

# Should show 6 rule files
ls rules/

# Should show 3 command files
ls commands/
```

## Acceptance Criteria

- [ ] `hooks/handlers/` contains all 12 TypeScript handler files
- [ ] `hooks/utils/logger.ts` exists
- [ ] `hooks/viewer/` contains server.ts, security.ts, rate-limiter.ts, index.html
- [ ] `hooks/package.json` exists
- [ ] `hooks/tsconfig.json` exists
- [ ] `rules/` contains all 6 rule files
- [ ] `commands/` contains all 3 command files

## Verification

```bash
# Count handlers (should be 12)
ls hooks/handlers/*.ts | wc -l

# Verify key files exist
test -f hooks/utils/logger.ts && echo "Logger exists"
test -f hooks/viewer/server.ts && echo "Viewer exists"
test -f hooks/package.json && echo "package.json exists"

# Count rules (should be 6)
ls rules/*.md | wc -l

# Count commands (should be 3)
ls commands/*.md | wc -l
```

## Commit

```bash
git add hooks/ rules/ commands/
git commit -m "feat(structure): move files from .claude/ to root level

Implements: F001
Decisions: D001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/02-plugin-manifest.md` (F002)
