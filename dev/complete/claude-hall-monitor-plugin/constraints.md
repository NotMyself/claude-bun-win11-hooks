# Global Constraints

## Project Context

See `context.md` for the feature summary and architectural vision.

## Architectural Decisions

See `decisions.md` before making implementation choices. Reference decision IDs in commit messages when relevant.

## Edge Cases

See `edge-cases.md` for cases that may span multiple features. Each prompt lists its relevant edge cases.

## Code Patterns

See `code/` directory for reusable code samples organized by language. Each prompt references specific sections:

- Read the referenced code sections before implementing
- Follow the established patterns for consistency
- Code is organized by progressive disclosure (simple → complex)

Available code references:

- `code/typescript.md` - Build scripts, handler patterns, testing utilities
- `code/json.md` - Plugin configuration, hooks.json, package.json
- `code/yaml.md` - GitHub Actions workflows
- `code/bash.md` - Build and verification commands

## Testing Philosophy

See `testing-strategy.md` for the holistic testing approach.

## Source Repository

The source code is in the `claude-bun-win11-hooks` repository. Key directories:

- `.claude/hooks/handlers/` - TypeScript hook handlers (12 files)
- `.claude/hooks/utils/` - Shared utilities (logger.ts)
- `.claude/hooks/viewer/` - Realtime log viewer
- `.claude/rules/` - 6 rule files
- `.claude/commands/` - 3 slash commands

## Target Repository

Create a new repository `NotMyself/claude-hall-monitor` with restructured layout:

- `hooks/handlers/` - TypeScript source
- `hooks/utils/` - Shared utilities
- `hooks/viewer/` - Viewer source
- `dist/handlers/` - Bundled JS handlers
- `dist/viewer/` - Bundled viewer
- `rules/` - Rule files
- `commands/` - Slash commands
- `.claude-plugin/` - Plugin metadata

## Rules

1. **One feature per session** - Do not implement beyond the scope of the current prompt
2. **Commit after each feature** - Create a commit with the specified message format
3. **Run verification before marking complete** - Execute the verification command
4. **Reference decision IDs** - When implementing code related to a decision
5. **Follow code patterns** - Use patterns from the `code/` directory
6. **Cross-platform paths** - Use `path.join()` and normalize for shell commands
7. **No dependencies in dist/** - All dependencies must be inlined during bundling
8. **Version consistency** - Keep versions in sync across plugin.json, package.json, CHANGELOG.md

## Commit Message Format

```
feat(scope): description

Implements: F00X
Decisions: D00X, D00Y (if applicable)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Prerequisites

- Bun runtime (v1.0.0 or later)
- Git
- GitHub account with access to NotMyself organization

## Environment Variables

The viewer supports these environment variables:

- `HOOK_VIEWER_HOST` - Bind address (default: localhost)
- `HOOK_VIEWER_PORT` - Port number (default: 3456)
