# Testing Strategy

## Philosophy

Testing for the Claude Hall Monitor plugin follows a layered approach:

1. **Unit Tests**: Fast, isolated tests for individual components
2. **Integration Tests**: Tests for component interactions (viewer server, SSE streaming)
3. **E2E Tests**: Full hook execution verification with simulated Claude Code events
4. **Build Verification**: Ensure bundled output is valid and executable

All tests run with Vitest and use happy-dom for browser API mocking where needed.

## Test Types

### Unit Tests

Located in `hooks/viewer/__tests__/`:

- **`components.test.ts`**: Vue component unit tests
- **`server.test.ts`**: Server endpoint tests
- **`setup.ts`**: Test environment setup with happy-dom

Run with:
```bash
cd hooks
bun run test:run
```

### Integration Tests

Test component interactions:

- SSE streaming behavior
- Log file reading and parsing
- Security middleware (rate limiting, CORS, CSP)

### E2E Tests

New `test:e2e.ts` script verifies:

1. Each bundled handler can be executed
2. Handlers produce valid JSON output
3. Log entries are written correctly
4. Viewer server starts and serves content

Run with:
```bash
bun run test:e2e.ts
```

### Build Verification

Ensure the build process succeeds and output is valid:

```bash
# Type check
bun run tsc --noEmit

# Build all handlers and viewer
bun run build

# Verify output exists
ls dist/handlers/*.js
ls dist/viewer/server.js
```

## Test Patterns

### Mocking File System

Use `join()` for mock paths to ensure platform-correct separators:

```typescript
import { join } from "node:path";

const MOCK_DIR = join("/mock", "path");

mockExistsSync.mockImplementation((path: string) => {
  return path === MOCK_DIR || path === join(MOCK_DIR, "file.json");
});
```

### Testing Hook Handlers

Simulate stdin input and capture stdout output:

```typescript
import { spawn } from "bun";

const proc = spawn(["bun", "run", "dist/handlers/session-start.js"], {
  stdin: "pipe",
  stdout: "pipe",
});

proc.stdin.write(JSON.stringify(mockInput));
proc.stdin.end();

const output = await new Response(proc.stdout).text();
const result = JSON.parse(output);
```

### Testing SSE Streaming

Use EventSource or fetch with ReadableStream:

```typescript
const response = await fetch("http://localhost:3456/events");
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // Parse SSE events from text
}
```

## CI Integration

The `ci.yml` workflow runs:

1. `bun install` - Install dev dependencies
2. `bun run tsc --noEmit` - Type checking
3. `bun run test:run` - Unit tests
4. `bun run build` - Build verification
5. `bun run test:e2e.ts` - E2E tests

All tests must pass for PR to be mergeable.

## Coverage

Run tests with coverage:

```bash
cd hooks
bun run test:coverage
```

Coverage reports generated in `hooks/coverage/`.
