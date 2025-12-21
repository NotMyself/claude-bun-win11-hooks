# Feature: F001, F002, F003 - Foundation Layer

## Project Context

See `context.md` for feature rationale and architecture vision.

**Summary**: Create the foundational types, database schema, and model pricing data. These are the building blocks that all other modules depend on.

## Prior Work

- **F000**: Project cleaned and prepared, directory structure created

## Objective

Define core TypeScript types, SQLite database schema, and model pricing data. These are pure data definitions with no logic.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope. Only create type definitions, schema, and pricing data.

## Relevant Decisions

From `decisions.md`:
- **D003**: SQLite for hot data storage — Schema will use SQLite-specific features and indexes
- **D004**: JSONL for long-term archives — Types support JSONL serialization

## Edge Cases to Handle

None for this feature (no logic yet).

## Code References

Read these sections before implementing:
- `code/typescript.md#basic-types` - MetricEntry, TokenUsage, CostBreakdown, PlanEvent
- `code/typescript.md#configuration-types` - MetricsConfig interfaces
- `code/sql.md#schema-definition` - Complete schema with indexes

## Constraints

- See `constraints.md` for global rules
- Use TypeScript strict mode
- All types must be exported
- Schema must include indexes for performance
- Pricing data must include all current Claude models

## Files to Create

| File | Purpose |
|------|---------|
| `hooks/metrics/types.ts` | Core type definitions |
| `hooks/metrics/schema.sql` | SQLite schema |
| `hooks/metrics/pricing.ts` | Model pricing data |

## Implementation Details

### hooks/metrics/types.ts

Create comprehensive type definitions. Use the exact types from `code/typescript.md#basic-types`:

```typescript
// Core types
export interface MetricEntry { ... }
export interface TokenUsage { ... }
export interface CostBreakdown { ... }
export interface PlanEvent { ... }

// Database types
export interface QueryOptions { ... }
export interface AggregationOptions { ... }
export interface AggregationResult { ... }

// Configuration types
export interface MetricsConfig { ... }
export interface TranscriptConfig { ... }
export interface PlansConfig { ... }

// Type guards
export function isMetricEntry(obj: unknown): obj is MetricEntry {
  // Implementation
}
```

### hooks/metrics/schema.sql

Use the complete schema from `code/sql.md#schema-definition`:

```sql
-- Metrics table with indexes
CREATE TABLE IF NOT EXISTS metrics (...);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON metrics(session_id);
-- ... more indexes

-- Plan events table
CREATE TABLE IF NOT EXISTS plan_events (...);
-- ... indexes

-- Aggregations table
CREATE TABLE IF NOT EXISTS metric_aggregations (...);
-- ... indexes

-- PRAGMA settings for performance
PRAGMA journal_mode = WAL;
PRAGMA cache_size = 10000;
PRAGMA synchronous = NORMAL;
```

### hooks/metrics/pricing.ts

Define pricing for all current Claude models (December 2024 pricing):

```typescript
/**
 * Model pricing in USD per million tokens
 * Updated: December 2024
 */
export interface ModelPricing {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Opus models
  'claude-opus-4-5': {
    input: 15.00,
    output: 75.00,
    cacheRead: 1.50,
    cacheCreation: 18.75,
  },
  'claude-opus-4': {
    input: 15.00,
    output: 75.00,
    cacheRead: 1.50,
    cacheCreation: 18.75,
  },
  
  // Sonnet models
  'claude-sonnet-4-5': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheCreation: 3.75,
  },
  'claude-sonnet-4': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheCreation: 3.75,
  },
  'claude-3-5-sonnet-20241022': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheCreation: 3.75,
  },
  
  // Haiku models
  'claude-haiku-3-5': {
    input: 0.80,
    output: 4.00,
    cacheRead: 0.08,
    cacheCreation: 1.00,
  },
  'claude-3-5-haiku-20241022': {
    input: 0.80,
    output: 4.00,
    cacheRead: 0.08,
    cacheCreation: 1.00,
  },
};

/**
 * Get pricing for a model, with tier-based fallback for unknown models
 */
export function getModelPricing(model: string): ModelPricing {
  if (MODEL_PRICING[model]) {
    return MODEL_PRICING[model];
  }
  
  // Tier-based fallback (EC003)
  if (model.includes('opus')) {
    return MODEL_PRICING['claude-opus-4-5'];
  } else if (model.includes('sonnet')) {
    return MODEL_PRICING['claude-sonnet-4-5'];
  } else if (model.includes('haiku')) {
    return MODEL_PRICING['claude-haiku-3-5'];
  }
  
  console.warn(`Unknown model pricing: ${model}, using sonnet fallback`);
  return MODEL_PRICING['claude-sonnet-4-5'];
}
```

## Acceptance Criteria

- [ ] `hooks/metrics/types.ts` exists with all required types exported
- [ ] `hooks/metrics/schema.sql` exists with complete schema and indexes
- [ ] `hooks/metrics/pricing.ts` exists with pricing for all current models
- [ ] TypeScript compilation succeeds with no errors
- [ ] All types follow strict TypeScript rules (no `any` without justification)
- [ ] Schema includes PRAGMA statements for performance
- [ ] Type guards implemented for runtime validation

## Verification

Reference `testing-strategy.md` for approach.

```bash
# Type check
bun run tsc --noEmit hooks/metrics/types.ts
bun run tsc --noEmit hooks/metrics/pricing.ts

# Verify SQL syntax (if sqlite3 available)
cat hooks/metrics/schema.sql | sqlite3 :memory: && echo "✓ schema.sql is valid"

# Verify files exist
test -f hooks/metrics/types.ts && echo "✓ types.ts exists"
test -f hooks/metrics/schema.sql && echo "✓ schema.sql exists"
test -f hooks/metrics/pricing.ts && echo "✓ pricing.ts exists"
```

## Commit

```bash
git add hooks/metrics/types.ts hooks/metrics/schema.sql hooks/metrics/pricing.ts
git commit -m "feat(metrics): add core types, schema, and pricing data

Implements: F001, F002, F003
Decisions: D003, D004

- Define MetricEntry, TokenUsage, CostBreakdown, PlanEvent interfaces
- Create SQLite schema with three tables and performance indexes
- Add model pricing data for all current Claude models with tier fallbacks
- Include type guards for runtime validation
- Add configuration types for metrics system"
```

## Next

Proceed to: `prompts/02-database.md` (F004)
