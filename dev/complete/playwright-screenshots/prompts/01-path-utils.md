# Feature: path-utils - Windows to Docker Path Conversion

## Context
This is the first feature. No prior work has been completed.

## Objective
Add a utility function to `.claude/hooks/session-start.ts` that converts Windows file paths to Docker-compatible paths.

**It is unacceptable to implement features beyond the scope of this task.**

## Constraints
- Reference: See `constraints.md` for global rules
- Only add the `toDockerPath` function
- Do not modify `main()` or add other functions yet

## Files to Modify
- `.claude/hooks/session-start.ts` - Add the path conversion utility function

## Implementation Details

Add this function after the existing imports and before the `VIEWER_PORT` constant:

```typescript
/**
 * Convert Windows path to Docker-compatible path format.
 * Transforms drive letters and backslashes for Docker volume mounts.
 *
 * @example
 * toDockerPath("C:\\Users\\foo\\project") // "/C/Users/foo/project"
 * toDockerPath("D:\\work\\repo") // "/D/work/repo"
 *
 * @param windowsPath - Windows-style path with backslashes
 * @returns Docker-compatible path with forward slashes
 */
function toDockerPath(windowsPath: string): string {
  return windowsPath
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, "/$1");
}
```

## Acceptance Criteria
- [ ] `toDockerPath` function exists in session-start.ts
- [ ] Function converts `C:\Users\foo` to `/C/Users/foo`
- [ ] Function handles any drive letter (A-Z)
- [ ] Function includes JSDoc documentation
- [ ] TypeScript compiles without errors

## Verification
```bash
cd .claude/hooks && bun run tsc --noEmit
```

## Commit
```bash
git add .claude/hooks/session-start.ts
git commit -m "feat(hooks): add toDockerPath utility for Windows to Docker path conversion"
```

## Next
Proceed to: `02-playwright-config.md`
