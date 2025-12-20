# Global Constraints

## Project Context

See `context.md` for the feature summary and architectural vision. This is a complete replacement of the existing hooks system, not an enhancement.

## Architectural Decisions

See `decisions.md` before making implementation choices. Reference decision IDs in commit messages when relevant.

**Key decisions to remember**:
- **D001/D002**: Complete replacement, big bang deployment
- **D003/D004/D005**: SQLite + JSONL with Bun's native bun:sqlite
- **D006**: Event emitter pattern for pub/sub
- **D007/D008**: fs.watch for file monitoring (transcripts and plan events)
- **D010**: Defer UI visualization—focus on data collection and API

## Edge Cases

See `edge-cases.md` for cases that may span multiple features. Each prompt lists its relevant edge cases.

**Critical edge cases**:
- **EC001**: SQLite file locked → retry with exponential backoff
- **EC002**: Malformed transcript → skip with warning
- **EC004**: High volume writes → batch in memory, flush in transactions
- **EC006**: fs.watch unreliable → fallback to polling

## Code Patterns

See `code/` directory for reusable code samples organized by language. Each prompt references specific sections:
- Read the referenced code sections **before** implementing
- Follow the established patterns for consistency
- Code is organized by progressive disclosure (simple → complex)

**Code directory structure**:
- `code/typescript.md`: TypeScript patterns with hierarchical sections
- `code/sql.md`: SQL schema and query patterns
- `code/bash.md`: Shell commands for deletion, testing, building

## Testing Philosophy

See `testing-strategy.md` for the holistic testing approach.

**Core principles**:
- Write tests alongside implementation, not after
- Prefer integration tests with real components over heavy mocking
- Use in-memory SQLite and temporary directories for speed
- All features must pass verification before marking complete
- Coverage >80% for new code

## Runtime Environment

- **Platform**: Bun runtime (not Node.js)
- **TypeScript**: Strict mode enabled
- **Test Runner**: Vitest (existing project standard)
- **Database**: bun:sqlite (built-in, no npm package)
- **Build Tool**: Bun bundler for TypeScript → JavaScript

## Dependencies

**Existing** (from hooks/package.json):
- `@anthropic-ai/claude-agent-sdk`: Hook type definitions
- `@types/bun`: Bun runtime types
- `typescript`: Type checking
- `vitest`: Test runner
- `@vue/test-utils`: For viewer testing (if needed)
- `happy-dom`: Browser API mocking

**New** (to be added):
- None! Use Bun's built-in modules (bun:sqlite, bun:test, fs/promises)

## File Structure

New structure after Phase 0 deletion:

```
hooks/
├── metrics/                    # New metrics subsystem
│   ├── types.ts               # Core types
│   ├── schema.sql             # SQLite schema
│   ├── pricing.ts             # Model pricing data
│   ├── config.ts              # Configuration
│   ├── database.ts            # SQLite wrapper
│   ├── collector.ts           # MetricsCollector class
│   ├── transcript-parser.ts   # Parse ~/.claude/projects/
│   ├── cost-calculator.ts     # Token → USD
│   ├── plan-events.ts         # Plan orchestration events
│   ├── aggregation-service.ts # Time-window aggregation
│   ├── index.ts               # Public exports
│   └── __tests__/             # Unit tests
├── handlers/                   # All new hook handlers
│   ├── session-start.ts
│   ├── session-end.ts
│   ├── user-prompt-submit.ts
│   ├── pre-tool-use.ts
│   ├── post-tool-use.ts
│   ├── (... 7 more handlers)
│   └── __tests__/             # Handler tests
├── viewer/                     # New viewer (metrics-first)
│   ├── server.ts              # HTTP server
│   ├── config.ts              # Viewer config
│   ├── security.ts            # Security utilities
│   ├── api/                   # API endpoints
│   │   ├── metrics.ts
│   │   ├── plans.ts
│   │   └── sessions.ts
│   ├── sse/                   # SSE streaming
│   │   └── events.ts
│   └── __tests__/             # API tests
├── utils/
│   ├── event-emitter.ts       # Pub/sub
│   └── __tests__/
├── data/                       # Generated at runtime
│   ├── metrics.db             # SQLite database
│   └── archive/               # JSONL archives
├── package.json               # Updated dependencies
└── build.ts                   # Updated build script
```

## MCP Tools (Optional)

These tools may be available to assist implementation. Check availability before use.

- **Context7 MCP** (optional): `resolve-library-id`, `get-library-docs` for fetching up-to-date library documentation
- **Documentation MCP** (optional): Search Microsoft/Azure docs for official guidance
- **Sequential Thinking MCP** (optional): For complex problem decomposition

## Configuration Values

From the plan's configuration section:

```typescript
const METRICS_CONFIG = {
  DATABASE_PATH: 'hooks/data/metrics.db',
  ARCHIVE_DIR: 'hooks/data/archive',
  AGGREGATION_INTERVAL_MS: 60_000,
  ARCHIVE_AFTER_DAYS: 7,
  DELETE_ARCHIVES_AFTER_DAYS: 365,
  TRANSCRIPT: {
    USE_FS_WATCH: true,
    PROJECTS_DIR: '~/.claude/projects',
    FALLBACK_POLL_INTERVAL_MS: 30_000,
  },
  PLANS: {
    ACTIVE_DIR: 'dev/active',
    COMPLETE_DIR: 'dev/complete',
    WATCH_MANIFEST: true,
  },
};

const VIEWER_CONFIG = {
  PORT: 3456,
  HOST: 'localhost',
  RATE_LIMIT: {
    SSE_CONNECTIONS_PER_IP: 5,
    WINDOW_MS: 60_000,
  },
};
```

## Rules

1. **One feature per session** - Do not implement features beyond scope
2. **Commit after each feature** - Use conventional commit format
3. **Run verification before marking complete** - Tests must pass
4. **Reference decision IDs** when implementing related code (e.g., "Implements D003 SQLite storage")
5. **Follow code patterns** from the `code/` directory
6. **Handle edge cases** listed in edge-cases.md for your feature
7. **Write tests first** or alongside implementation
8. **Use TypeScript strict mode** - No `any` types without justification
9. **Bun-first APIs** - Prefer Bun built-ins over npm packages
10. **Document public APIs** - JSDoc comments for exported functions/classes
11. **Path safety** - Always validate and sanitize file paths
12. **Error handling** - Graceful degradation, detailed logging
13. **No blocking operations** - Use async/await for I/O
14. **Metrics are sacred** - Never lose data, batch for performance but ensure durability

## Security Considerations

The viewer includes security hardening (from existing system):
- Bind to localhost only (configurable via HOOK_VIEWER_HOST)
- CORS restricted to localhost origin
- Path traversal validation on all file endpoints
- Session ID validation (alphanumeric + hyphens, max 64 chars)
- Bearer token authentication for sensitive endpoints
- Rate limiting on SSE connections
- CSP headers on HTML responses
- Valid JSON error responses

Maintain these security practices in the new system.

## Platform Notes

**Windows Compatibility**:
- Use `path.resolve()` for cross-platform paths
- fs.watch works well on local drives, may need polling fallback for network drives (EC006)
- Bun's fs.watch uses native Windows APIs, generally reliable

**Transcript File Locations**:
- Default: `~/.claude/projects/<project-hash>/`
- Files: `<session-id>.jsonl` or `<session-id>-active.jsonl`
- Content: One JSON object per line with token usage

**Plan Orchestration Files**:
- Location: `dev/active/<plan-name>/manifest.jsonl`
- Updates: Status field changes (`pending` → `in_progress` → `completed`/`failed`)
- Watch for: File modifications, not just appends
