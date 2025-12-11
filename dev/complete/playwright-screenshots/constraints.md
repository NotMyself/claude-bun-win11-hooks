# Global Constraints

## Scope
- Only modify `.claude/hooks/session-start.ts`
- Do not modify other hook files
- Do not change existing functionality

## Code Style
- Use TypeScript with full type annotations
- Follow existing code patterns in the hooks directory
- Use JSDoc comments for new functions
- Use Bun APIs (spawn from "bun", not child_process)

## Error Handling
- Fail silently for Playwright configuration (non-critical)
- Log errors to stderr, not stdout (stdout is for hook JSON output)
- Do not throw errors that would break the session start

## Path Handling
- Windows paths use backslashes: `C:\Users\...`
- Docker paths use forward slashes: `/C/Users/...`
- Always use `join` from "path" for path construction

## Testing
- Type check with: `cd .claude/hooks && bun run tsc --noEmit`
- Manual verification by taking a screenshot after session start

## MCP Tools Available
- **Playwright MCP**: `browser_take_screenshot` for testing
- **File system MCP**: `list_directory` to verify screenshots folder

## Git Commits
- Use conventional commits: `feat(hooks):`, `fix(hooks):`
- Reference the feature being implemented
