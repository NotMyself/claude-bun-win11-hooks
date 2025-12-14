# Feature: F010 - E2E Test Script

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000-F009**: Repository, structure, plugin config, and documentation complete
- **F004**: Handlers bundled to `dist/handlers/`
- **F005**: Viewer bundled to `dist/viewer/`

## Objective

Create an E2E test script that verifies all bundled handlers execute correctly and produce valid output.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope.

## Relevant Decisions

None specific to this feature.

## Edge Cases to Handle

From `edge-cases.md`:

- **EC002**: Bun runtime not installed — Tests require Bun
- **EC001**: Cross-platform path handling — Test script must work on all platforms

## Code References

- `code/typescript.md#handler-execution-test` - Handler execution test pattern
- `code/typescript.md#viewer-server-test` - Viewer server test pattern
- `testing-strategy.md` - Overall testing approach

## Constraints

- See `constraints.md` for global rules
- Test all 12 bundled handlers
- Test viewer server startup
- Use exit codes to indicate pass/fail
- Tests must be runnable with `bun run test-e2e.ts`

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `test-e2e.ts` | E2E test script for bundled output |
| `hooks/package.json` | Add test:e2e script |

## Implementation Details

### 1. Create test-e2e.ts

Create `test-e2e.ts` in repository root:

```typescript
import { spawn, sleep } from "bun";
import { join } from "node:path";
import { readdirSync, existsSync } from "node:fs";

const ROOT = import.meta.dir;
const DIST_HANDLERS = join(ROOT, "dist", "handlers");
const DIST_VIEWER = join(ROOT, "dist", "viewer");

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function log(msg: string): void {
  console.log(msg);
}

function logResult(name: string, passed: boolean, error?: string): void {
  results.push({ name, passed, error });
  const status = passed ? "✓" : "✗";
  console.log(`  ${status} ${name}${error ? `: ${error}` : ""}`);
}

async function testHandler(name: string, input: object): Promise<void> {
  const handlerPath = join(DIST_HANDLERS, `${name}.js`);

  if (!existsSync(handlerPath)) {
    logResult(name, false, "File not found");
    return;
  }

  try {
    const proc = spawn(["bun", "run", handlerPath], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      logResult(name, false, `Exit code ${exitCode}: ${stderr.slice(0, 100)}`);
      return;
    }

    // Verify output is valid JSON
    try {
      JSON.parse(stdout);
      logResult(name, true);
    } catch {
      logResult(name, false, "Invalid JSON output");
    }
  } catch (err) {
    logResult(name, false, err instanceof Error ? err.message : String(err));
  }
}

async function testViewerServer(): Promise<void> {
  const serverPath = join(DIST_VIEWER, "server.js");

  if (!existsSync(serverPath)) {
    logResult("viewer-server", false, "File not found");
    return;
  }

  try {
    const proc = spawn(["bun", "run", serverPath], {
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        HOOK_VIEWER_PORT: "3457", // Use different port for tests
      },
    });

    // Wait for server to start
    await sleep(2000);

    try {
      // Test health endpoint
      const healthResponse = await fetch("http://localhost:3457/health");
      if (!healthResponse.ok) {
        logResult("viewer-health", false, `Status ${healthResponse.status}`);
      } else {
        logResult("viewer-health", true);
      }

      // Test main page
      const mainResponse = await fetch("http://localhost:3457/");
      if (!mainResponse.ok) {
        logResult("viewer-main", false, `Status ${mainResponse.status}`);
      } else {
        logResult("viewer-main", true);
      }

      // Test SSE endpoint headers
      const eventsResponse = await fetch("http://localhost:3457/events");
      const contentType = eventsResponse.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        logResult("viewer-sse", true);
      } else {
        logResult("viewer-sse", false, `Wrong content-type: ${contentType}`);
      }
    } finally {
      proc.kill();
    }
  } catch (err) {
    logResult("viewer-server", false, err instanceof Error ? err.message : String(err));
  }
}

async function main(): Promise<void> {
  log("\n=== Claude Hall Monitor E2E Tests ===\n");

  // Check dist directory exists
  if (!existsSync(DIST_HANDLERS)) {
    log("ERROR: dist/handlers/ not found. Run 'bun run build.ts' first.");
    process.exit(1);
  }

  // Test all handlers
  log("Testing handlers:");

  const mockSession = { session_id: "e2e-test-session" };
  const mockTool = { ...mockSession, tool_name: "Bash", tool_input: { command: "echo test" } };

  const handlers = [
    { name: "session-start", input: mockSession },
    { name: "session-end", input: mockSession },
    { name: "user-prompt-submit", input: { ...mockSession, prompt: "test" } },
    { name: "pre-tool-use", input: mockTool },
    { name: "post-tool-use", input: { ...mockTool, tool_output: "success" } },
    { name: "post-tool-use-failure", input: { ...mockTool, error: "test error" } },
    { name: "notification", input: { ...mockSession, message: "test" } },
    { name: "stop", input: mockSession },
    { name: "subagent-start", input: { ...mockSession, subagent_id: "sub-1" } },
    { name: "subagent-stop", input: { ...mockSession, subagent_id: "sub-1" } },
    { name: "pre-compact", input: mockSession },
    { name: "permission-request", input: { ...mockSession, permission: "test" } },
  ];

  for (const { name, input } of handlers) {
    await testHandler(name, input);
  }

  // Test viewer server
  log("\nTesting viewer:");
  await testViewerServer();

  // Summary
  log("\n=== Summary ===\n");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  log(`Passed: ${passed}/${total}`);

  if (passed < total) {
    log("\nFailed tests:");
    for (const r of results.filter((r) => !r.passed)) {
      log(`  - ${r.name}: ${r.error}`);
    }
    process.exit(1);
  }

  log("\n✓ All tests passed!\n");
}

main().catch((err) => {
  console.error("E2E tests failed:", err);
  process.exit(1);
});
```

### 2. Update hooks/package.json

Add test:e2e script:

```json
{
  "scripts": {
    ...existing scripts...,
    "test:e2e": "bun run ../test-e2e.ts"
  }
}
```

## Acceptance Criteria

- [ ] `test-e2e.ts` exists in repository root
- [ ] Script tests all 12 bundled handlers
- [ ] Script tests viewer server startup
- [ ] Script outputs pass/fail for each test
- [ ] Script exits with code 0 on success, 1 on failure
- [ ] hooks/package.json has "test:e2e" script

## Verification

```bash
# Run E2E tests
bun run test-e2e.ts

# Or from hooks directory
cd hooks
bun run test:e2e
```

Expected output:
```
=== Claude Hall Monitor E2E Tests ===

Testing handlers:
  ✓ session-start
  ✓ session-end
  ✓ user-prompt-submit
  ...

Testing viewer:
  ✓ viewer-health
  ✓ viewer-main
  ✓ viewer-sse

=== Summary ===

Passed: 15/15

✓ All tests passed!
```

## Commit

```bash
git add test-e2e.ts hooks/package.json
git commit -m "test: add E2E test script for bundled output

Implements: F010

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/11-ci-workflow.md` (F011)
