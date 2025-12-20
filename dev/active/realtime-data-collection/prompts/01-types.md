# Feature: F001 - Core Type Definitions

## Project Context

See `context.md` for feature rationale and architecture vision.

## Prior Work

- **F000**: Project structure created, old system removed

## Objective

Create the core TypeScript type definitions that serve as the foundation for the entire metrics collection system.

> **Scope Constraint**: It is unacceptable to implement features beyond this task's scope. Only create type definitions - no implementation logic.

## Relevant Decisions

From `decisions.md`:
- **D001**: Complete replacement - These types are designed from scratch for metrics-first architecture, not constrained by old logger structure.

## Code References

Read these sections before implementing:
- `code/typescript.md#basic-types` - Core interfaces to implement
- `code/typescript.md#extended-types` - Configuration and operational types

## Constraints

- See `constraints.md` for global rules
- Use TypeScript strict mode (no implicit any)
- Export all interfaces for use by other modules
- Include JSDoc comments for complex types
- Define exact string literal types for enums (not TypeScript enums)

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `hooks/metrics/types.ts` | All core type definitions |

## Implementation Details

Create `hooks/metrics/types.ts` with the following interfaces:

### Core Metric Types
- `MetricEntry`: Main metric record (see code reference)
- `TokenUsage`: Token counts for API calls
- `CostBreakdown`: USD cost breakdown by token type
- `PlanEvent`: Plan orchestration event record

### Configuration Types
- `MetricsConfig`: Configuration constants structure
- `ModelPricing`: Model pricing data structure

### Operational Types
- `AggregatedMetrics`: Time-window aggregation results
- `MetricSource`: Type guard for source values
- `EventCategory`: Type guard for event categories

Follow the exact structures from `code/typescript.md#basic-types` and `code/typescript.md#extended-types`.

## Acceptance Criteria

- [ ] `hooks/metrics/types.ts` created
- [ ] All core interfaces defined: `MetricEntry`, `TokenUsage`, `CostBreakdown`, `PlanEvent`
- [ ] Configuration interfaces defined: `MetricsConfig`, `ModelPricing`
- [ ] Operational interfaces defined: `AggregatedMetrics`
- [ ] All interfaces exported
- [ ] Type checking passes with no errors
- [ ] JSDoc comments added for complex types

## Verification

Reference `testing-strategy.md` for approach.

```bash
bun run tsc --noEmit hooks/metrics/types.ts
```

## Commit

```bash
git add hooks/metrics/types.ts
git commit -m "feat(metrics): add core type definitions

Implements: F001
Decisions: D001

- Define MetricEntry, TokenUsage, CostBreakdown, PlanEvent
- Add configuration types (MetricsConfig, ModelPricing)
- Add operational types (AggregatedMetrics)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

## Next

Proceed to: `prompts/02-schema.md` (F002)
