# Feature: F004 - Database Layer

## Project Context

See `context.md`. Implement the SQLite database wrapper using bun:sqlite.

## Prior Work

- **F000**: Project prepared
- **F001-F003**: Types, schema, and pricing defined

## Objective

Create the Database class that wraps bun:sqlite and provides CRUD operations for metrics.

> **Scope Constraint**: Only implement the database layer. Do not implement MetricsCollector or other consumers.

## Relevant Decisions

- **D003**: SQLite for hot data
- **D005**: Use Bun's native bun:sqlite

## Edge Cases to Handle

- **EC001**: SQLite file locked → Retry with exponential backoff
- **EC004**: High volume writes → Support batch inserts with transactions

## Code References

- `code/typescript.md#database-classes`
- `code/sql.md#basic-queries`
- `code/sql.md#performance-optimization`

## Files to Create

| File | Purpose |
|------|---------|
| `hooks/metrics/database.ts` | Database class with CRUD methods |
| `hooks/metrics/__tests__/database.test.ts` | Unit tests |

## Implementation Details

Implement the Database class from `code/typescript.md#database-classes`:

- Constructor that creates database and runs schema
- `insertMetric(metric: MetricEntry): Promise<void>`
- `insertBatch(metrics: MetricEntry[]): Promise<void>` with transaction
- `query(options: QueryOptions): Promise<MetricEntry[]>`
- `aggregate(options: AggregationOptions): Promise<AggregationResult[]>`
- Retry logic for locked database (EC001)
- PRAGMA statements for performance

## Acceptance Criteria

- [ ] Database class creates SQLite file and initializes schema
- [ ] Insert and batch insert work correctly
- [ ] Query with filters returns correct results
- [ ] Retry logic handles locked database
- [ ] All tests pass

## Verification

```bash
bun test hooks/metrics/__tests__/database.test.ts
bun run tsc --noEmit hooks/metrics/database.ts
```

## Commit

```bash
git add hooks/metrics/database.ts hooks/metrics/__tests__/database.test.ts
git commit -m "feat(metrics): implement SQLite database layer

Implements: F004
Decisions: D003, D005
Edge Cases: EC001, EC004

- Create Database class using bun:sqlite
- Implement CRUD operations with query filtering
- Add batch insert with transactions for performance
- Include retry logic for locked database
- Add comprehensive unit tests with in-memory database"
```

## Next

Proceed to: `prompts/03-event-emitter.md` (F005)
