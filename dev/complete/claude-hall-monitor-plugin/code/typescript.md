# TypeScript Patterns

## Build System

### Build Script Core

The main build script using Bun.build API:

```typescript
import { join } from "node:path";
import { existsSync, rmSync, readdirSync } from "node:fs";

const ROOT = import.meta.dir;
const HANDLERS_DIR = join(ROOT, "hooks", "handlers");
const VIEWER_DIR = join(ROOT, "hooks", "viewer");
const DIST_DIR = join(ROOT, "dist");

// Clean dist directory
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true });
}

// Build all handlers
const handlerFiles = readdirSync(HANDLERS_DIR)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => join(HANDLERS_DIR, f));

await Bun.build({
  entrypoints: handlerFiles,
  outdir: join(DIST_DIR, "handlers"),
  target: "bun",
  minify: false,
  sourcemap: "none",
});

// Build viewer server
await Bun.build({
  entrypoints: [join(VIEWER_DIR, "server.ts")],
  outdir: join(DIST_DIR, "viewer"),
  target: "bun",
  minify: false,
  sourcemap: "none",
});

console.log("Build complete!");
```

### Path Normalization

Cross-platform path handling for shell commands:

```typescript
/**
 * Normalize path for shell commands on Windows.
 * Windows cmd.exe has issues with backslashes in quoted paths.
 */
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

// Usage in spawn commands
const safePath = normalizePath(join(dir, "file.ts"));
```

## E2E Testing

### Handler Execution Test

Test that bundled handlers execute correctly:

```typescript
import { spawn } from "bun";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const DIST_HANDLERS = join(import.meta.dir, "..", "dist", "handlers");

interface HookInput {
  session_id: string;
  [key: string]: unknown;
}

async function executeHandler(
  handlerName: string,
  input: HookInput
): Promise<unknown> {
  const handlerPath = join(DIST_HANDLERS, `${handlerName}.js`);

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
    throw new Error(`Handler failed: ${stderr}`);
  }

  return JSON.parse(stdout);
}

describe("Handler E2E Tests", () => {
  it("session-start handler produces valid output", async () => {
    const result = await executeHandler("session-start", {
      session_id: "test-session-123",
    });

    expect(result).toHaveProperty("additionalContext");
  });
});
```

### Viewer Server Test

Test that the viewer server starts and serves content:

```typescript
import { spawn, sleep } from "bun";
import { join } from "node:path";

async function testViewerServer(): Promise<void> {
  const serverPath = join(import.meta.dir, "..", "dist", "viewer", "server.js");

  const proc = spawn(["bun", "run", serverPath], {
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      HOOK_VIEWER_PORT: "3457", // Use different port for tests
    },
  });

  // Wait for server to start
  await sleep(1000);

  try {
    // Test health endpoint
    const response = await fetch("http://localhost:3457/health");
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    // Test SSE endpoint
    const eventsResponse = await fetch("http://localhost:3457/events");
    if (eventsResponse.headers.get("content-type") !== "text/event-stream") {
      throw new Error("SSE endpoint not returning event-stream");
    }

    console.log("Viewer server tests passed!");
  } finally {
    proc.kill();
  }
}
```

## Hook Handlers

### Standard Handler Pattern

All handlers follow this structure:

```typescript
import { log, readInput, writeOutput } from "../utils/logger";
import type { SessionStartHookInput } from "@anthropic-ai/claude-agent-sdk";

async function main(): Promise<void> {
  try {
    const input = await readInput<SessionStartHookInput>();

    await log("SessionStart", input.session_id, {
      cwd: input.cwd,
      timestamp: new Date().toISOString(),
    });

    writeOutput({
      additionalContext: "Session started and logged.",
    });
  } catch (error) {
    // Always output valid JSON even on error
    writeOutput({
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();
```

### Logger Utility

Shared logging utilities:

```typescript
import { appendFile } from "node:fs/promises";
import { join } from "node:path";

const LOG_FILE = join(import.meta.dir, "..", "hooks-log.txt");

interface LogEntry {
  timestamp: string;
  event: string;
  session_id: string;
  data: Record<string, unknown>;
}

export async function log(
  event: string,
  session_id: string,
  data: Record<string, unknown>
): Promise<void> {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    event,
    session_id,
    data,
  };

  await appendFile(LOG_FILE, JSON.stringify(entry) + "\n");
}

export async function readInput<T>(): Promise<T> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(text) as T;
}

export function writeOutput(output: Record<string, unknown>): void {
  console.log(JSON.stringify(output));
}
```
