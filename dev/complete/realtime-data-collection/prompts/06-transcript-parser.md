# Feature: F008 - Transcript Parser

## Context
See `context.md`. Parse Claude Code transcripts for token usage data.

## Prior Work
F000-F007 completed

## Objective
Watch ~/.claude/projects/ for transcript files and parse token usage.

## Decisions
- **D007**: fs.watch for event-driven monitoring

## Edge Cases
- **EC002**: Malformed JSON → skip with warning
- **EC006**: fs.watch unreliable → fallback to polling
- **EC007**: File deleted during parse → handle gracefully
- **EC008**: File renamed → re-scan directory

## Code References
- `code/typescript.md#parser-logic`
- `code/typescript.md#file-watching`

## Files
- `hooks/metrics/transcript-parser.ts`
- `hooks/metrics/__tests__/transcript-parser.test.ts`

## Implementation
TranscriptParser class with:
- fs.watch on projects directory (recursive)
- Fallback to polling if watch fails
- Parse JSONL entries for token usage
- Feed to MetricsCollector
- Handle all edge cases

## Acceptance Criteria
- [ ] Watches transcript directory with fs.watch
- [ ] Falls back to polling on watch failure
- [ ] Parses token usage correctly
- [ ] Handles malformed entries gracefully
- [ ] Handles file deletion/rename
- [ ] Tests pass

## Verification
```bash
bun test hooks/metrics/__tests__/transcript-parser.test.ts
```

## Commit
```bash
git add hooks/metrics/transcript-parser.ts hooks/metrics/__tests__/transcript-parser.test.ts
git commit -m "feat(metrics): add transcript parser with fs.watch

Implements: F008
Decisions: D007
Edge Cases: EC002, EC006, EC007, EC008"
```

## Next
Proceed to: `prompts/07-cost-calculator.md` (F009)
