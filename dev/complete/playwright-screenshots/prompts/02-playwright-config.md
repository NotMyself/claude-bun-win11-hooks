# Feature: playwright-config - Playwright MCP Configuration Function

## Context
Completed in prior steps:
- `toDockerPath` function added to session-start.ts for path conversion

## Objective
Add a function to configure Playwright MCP's output directory via the Docker CLI.

**It is unacceptable to implement features beyond the scope of this task.**

## Constraints
- Reference: See `constraints.md` for global rules
- Only add the `configurePlaywrightScreenshots` function and required import
- Do not integrate into `main()` yet
- Fail silently on errors (non-critical feature)

## Files to Modify
- `.claude/hooks/session-start.ts` - Add the Playwright configuration function

## Implementation Details

### 1. Add Import
Add `mkdir` import at the top with other imports:

```typescript
import { mkdir } from "fs/promises";
```

### 2. Add Function
Add this function after `toDockerPath`:

```typescript
/**
 * Configure Playwright MCP to save screenshots to the current project's
 * screenshots directory. Creates the directory if it doesn't exist.
 *
 * This runs the Docker MCP CLI to set the outputDir configuration.
 * Fails silently since screenshot location is non-critical.
 *
 * @param cwd - Current working directory (Windows path)
 */
async function configurePlaywrightScreenshots(cwd: string): Promise<void> {
  const screenshotsDir = join(cwd, "screenshots");
  const dockerPath = toDockerPath(screenshotsDir);

  try {
    // Create screenshots directory if it doesn't exist
    await mkdir(screenshotsDir, { recursive: true });

    // Configure Playwright MCP via Docker CLI
    const proc = spawn([
      "docker", "mcp", "config", "set",
      "playwright", "outputDir", dockerPath
    ], {
      stdout: "ignore",
      stderr: "ignore",
    });

    await proc.exited;
  } catch {
    // Fail silently - screenshot location is non-critical
    console.error("Failed to configure Playwright screenshots directory");
  }
}
```

## Acceptance Criteria
- [ ] `mkdir` is imported from "fs/promises"
- [ ] `configurePlaywrightScreenshots` function exists
- [ ] Function creates screenshots directory with `recursive: true`
- [ ] Function calls `docker mcp config set` with correct arguments
- [ ] Function catches and handles errors silently
- [ ] TypeScript compiles without errors

## Verification
```bash
cd .claude/hooks && bun run tsc --noEmit
```

## Commit
```bash
git add .claude/hooks/session-start.ts
git commit -m "feat(hooks): add configurePlaywrightScreenshots function"
```

## Next
Proceed to: `03-session-start-integration.md`
