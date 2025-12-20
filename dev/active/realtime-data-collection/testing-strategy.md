# Testing Strategy

## Philosophy

Build comprehensive test coverage alongside implementation, not as an afterthought. Each module should have unit tests before integration. The data collection system is mission-critical infrastructure—test failures block deployment.

**Test-Driven Development**: Write tests that define expected behavior, then implement to pass tests. This is especially important for:
- Data integrity (SQLite writes, JSONL formatting)
- Edge case handling (malformed data, file system failures)
- Concurrent operations (multiple SSE clients, batch writes)

**Integration Over Mocking**: For infrastructure code (database, file system), prefer integration tests with real components over heavy mocking. Use in-memory SQLite databases and temporary file systems for fast, realistic tests.

## Test Types

### Unit Tests

**Scope**: Individual modules in isolation with minimal dependencies.

**Coverage**:
- `metrics/types.ts`: Type guards, validation functions
- `metrics/pricing.ts`: Model pricing lookup, tier fallbacks
- `metrics/database.ts`: CRUD operations, query builders, batch writes
- `metrics/collector.ts`: Event collection, metric enrichment, batching logic
- `metrics/transcript-parser.ts`: JSONL parsing, token extraction, error handling
- `metrics/cost-calculator.ts`: Token-to-USD conversion, breakdown calculations
- `metrics/plan-events.ts`: manifest.jsonl parsing, event detection
- `metrics/aggregation-service.ts`: Time window calculations, rollup logic
- `utils/event-emitter.ts`: Pub/sub mechanics, listener management
- `viewer/security.ts`: Path validation, session ID validation, auth token checks

**Tools**: Vitest for test runner, in-memory SQLite for database tests, mock file system where appropriate.

**Patterns**:
```typescript
// Example unit test pattern
import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../database';

describe('Database', () => {
  let db: Database;
  
  beforeEach(() => {
    db = new Database(':memory:'); // In-memory for speed
  });
  
  it('should insert and retrieve metrics', async () => {
    // Test implementation
  });
});
```

### Integration Tests

**Scope**: Data flow across multiple components.

**Coverage**:
- **Hook → Collector → Database**: Hook handlers emit metrics, collector processes, database stores
- **Transcript Watcher → Parser → Collector**: File watching triggers parse, metrics flow through
- **Plan Events → Database → API**: manifest.jsonl changes captured and queryable
- **Collector → EventEmitter → SSE**: Realtime streaming of newly collected metrics

**Tools**: Vitest, temporary directories, in-memory SQLite, real file watchers.

**Patterns**:
```typescript
// Example integration test
describe('Metrics Pipeline', () => {
  it('should flow from hook to database', async () => {
    const collector = new MetricsCollector(db, emitter);
    const handler = createSessionStartHandler(collector);
    
    await handler({ sessionId: 'test', ... });
    
    const metrics = await db.query({ sessionId: 'test' });
    expect(metrics).toHaveLength(1);
  });
});
```

### API Tests

**Scope**: HTTP endpoints and SSE streaming.

**Coverage**:
- `/api/metrics`: Query with filters, pagination, sorting
- `/api/metrics/aggregations`: Time window aggregations
- `/api/metrics/costs`: Cost breakdowns and analysis
- `/api/plans/events`: Plan event queries
- `/events/metrics`: SSE streaming, connection limits

**Tools**: Vitest, Bun's test utilities for HTTP, fetch API for requests.

**Patterns**:
```typescript
// Example API test
describe('GET /api/metrics', () => {
  it('should return filtered metrics', async () => {
    const response = await fetch('http://localhost:3456/api/metrics?session_id=test');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.metrics).toBeDefined();
  });
});
```

### Handler Tests

**Scope**: Hook handlers with MetricsCollector integration.

**Coverage**:
- All 12 hook handlers emit correct metric types
- Handlers enrich metrics with appropriate context
- Error cases handled gracefully
- Handlers respect hook return types (allow, deny, modify)

**Tools**: Vitest, mock hook inputs, real MetricsCollector with in-memory DB.

**Patterns**:
```typescript
// Example handler test
describe('session-start handler', () => {
  it('should emit session_started metric', async () => {
    const result = await handler({ 
      sessionId: 'test',
      projectPath: '/test' 
    });
    
    const metrics = await collector.getMetrics({ event_type: 'session_started' });
    expect(metrics).toHaveLength(1);
    expect(result.proceed).toBe(true);
  });
});
```

## Test Organization

```
hooks/
├── metrics/
│   ├── __tests__/
│   │   ├── database.test.ts
│   │   ├── collector.test.ts
│   │   ├── transcript-parser.test.ts
│   │   ├── cost-calculator.test.ts
│   │   ├── plan-events.test.ts
│   │   └── aggregation-service.test.ts
├── utils/
│   └── __tests__/
│       └── event-emitter.test.ts
├── handlers/
│   └── __tests__/
│       ├── integration.test.ts
│       ├── session-handlers.test.ts
│       ├── user-handlers.test.ts
│       └── tool-handlers.test.ts
└── viewer/
    └── __tests__/
        ├── security.test.ts
        ├── server.test.ts
        └── api/
            ├── metrics.test.ts
            ├── plans.test.ts
            └── sessions.test.ts
```

## Running Tests

```bash
# All tests
bun test

# Specific test file
bun test hooks/metrics/__tests__/database.test.ts

# Watch mode during development
bun test --watch

# Coverage report
bun test --coverage
```

## Quality Gates

Before marking any feature complete:
1. All unit tests pass
2. Integration tests cover happy path and error cases
3. Edge cases from edge-cases.md are tested
4. No regressions in existing tests
5. Coverage >80% for new code

## Continuous Testing

Tests run:
- Locally before commits
- In CI/CD pipeline (future)
- Before deployment of new system
