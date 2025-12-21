# Feature: F009 - Cost Calculator

## Context
See `context.md`. Convert token usage to USD costs.

## Prior Work
F000-F008 completed

## Objective
Calculate USD costs from token usage using model pricing.

## Edge Cases
- **EC003**: Missing pricing → tier-based fallback

## Code References
- `code/typescript.md#calculation-logic`

## Files
- `hooks/metrics/cost-calculator.ts`
- `hooks/metrics/__tests__/cost-calculator.test.ts`

## Implementation
CostCalculator class:
- `calculate(tokens, model)` returns CostBreakdown
- Uses MODEL_PRICING from pricing.ts
- Tier-based fallback for unknown models
- Calculation: (tokens / 1M) * price_per_1M

## Acceptance Criteria
- [ ] Calculates input, output, cache costs correctly
- [ ] Returns total_cost_usd
- [ ] Handles unknown models with fallback
- [ ] Tests verify calculations

## Verification
```bash
bun test hooks/metrics/__tests__/cost-calculator.test.ts
```

## Commit
```bash
git add hooks/metrics/cost-calculator.ts hooks/metrics/__tests__/cost-calculator.test.ts
git commit -m "feat(metrics): add cost calculator

Implements: F009
Edge Cases: EC003"
```

## Next
Proceed to: `prompts/08-plan-events.md` (F010)
