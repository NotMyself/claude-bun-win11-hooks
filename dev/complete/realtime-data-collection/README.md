# Realtime Data Collection System - Implementation Plan

## Overview

Complete replacement of the existing hooks logging system with a metrics-first architecture. This plan implements a realtime data collection system that:

- Captures structured metrics from 12 hook handlers
- Parses Claude Code transcripts for token usage and cost analysis
- Tracks plan orchestration events from /plan-* commands
- Stores data in SQLite for queries and JSONL for archival
- Provides REST API and SSE streaming for realtime insights

**Approach**: Big bang deployment - complete replacement when ready, no gradual migration.

## Quick Start

1. Execute prompts in order from `manifest.jsonl`
2. Each prompt is self-contained with all necessary context
3. Verify after each feature before proceeding
4. All features must pass tests before marking complete

## Files

| File | Purpose |
|------|---------|
| `manifest.jsonl` | Feature metadata for orchestration (29 features: F000-F028) |
| `context.md` | Project rationale and architecture vision |
| `decisions.md` | Architectural decisions with rationale (D001-D010) |
| `edge-cases.md` | Edge cases mapped to features (EC001-EC008) |
| `testing-strategy.md` | Testing philosophy and patterns |
| `constraints.md` | Global rules for all prompts |
| `code/typescript.md` | TypeScript patterns organized by progressive disclosure |
| `code/sql.md` | SQL schema and query patterns |
| `code/bash.md` | Shell commands for deletion, testing, building |
| `prompts/*.md` | 26 individual feature prompts (00-25) |

## Code Samples

The `code/` directory contains reusable code patterns organized by language:

- **TypeScript** (`code/typescript.md`): Types, utilities, core classes, parsers, API handlers, testing patterns
- **SQL** (`code/sql.md`): Schema definition, queries, aggregations, performance optimization
- **Bash** (`code/bash.md`): File operations, testing commands, build commands

Each file uses hierarchical headings for progressive disclosure (simple → complex). Reference specific sections via anchors like `code/typescript.md#basic-types`.

## Feature Organization

The 29 features are grouped into 26 prompts:

| Prompt | Features | Description |
|--------|----------|-------------|
| 00-prep.md | F000 | Delete old system, prepare structure |
| 01-types-schema-pricing.md | F001, F002, F003 | Foundation types, schema, pricing |
| 02-database.md | F004 | SQLite database layer |
| 03-event-emitter.md | F005 | Event emitter for pub/sub |
| 04-config.md | F006 | Configuration module |
| 05-collector.md | F007 | MetricsCollector orchestrator |
| 06-transcript-parser.md | F008 | Transcript parsing with fs.watch |
| 07-cost-calculator.md | F009 | Token to USD conversion |
| 08-plan-events.md | F010 | Plan orchestration capture |
| 09-aggregation.md | F011 | Time-window aggregations |
| 10-session-handlers.md | F012 | Session lifecycle handlers |
| 11-user-handlers.md | F013 | User interaction handlers |
| 12-tool-handlers.md | F014 | Tool execution handlers |
| 13-subagent-handlers.md | F015 | Subagent lifecycle handlers |
| 14-system-handlers.md | F016 | System event handlers |
| 15-viewer-security-config.md | F017, F018 | Viewer security & config |
| 16-viewer-server.md | F019 | HTTP server base |
| 17-metrics-api.md | F020 | Metrics API endpoints |
| 18-plans-api.md | F021 | Plans API endpoints |
| 19-sessions-api.md | F022 | Sessions API endpoints |
| 20-sse-streaming.md | F023 | SSE streaming |
| 21-unit-tests.md | F024 | Core module unit tests |
| 22-integration-tests.md | F025 | Data pipeline integration tests |
| 23-api-tests.md | F026 | API endpoint tests |
| 24-handler-tests.md | F027 | Hook handler tests |
| 25-documentation.md | F028 | Update CLAUDE.md |

## Dependency Layers

Features are organized in dependency layers for optimal execution:

- **Layer 0**: F000 (preparation - must be first)
- **Layer 1**: F001, F002, F003 (foundation types)
- **Layer 2**: F004, F005, F006 (infrastructure)
- **Layer 3**: F007 (collector - central orchestrator)
- **Layer 4**: F008, F009, F010, F011 (data sources & analytics)
- **Layer 5**: F012-F016 (hook handlers - can be done in parallel)
- **Layer 6**: F017, F018 (viewer security & config)
- **Layer 7**: F019 (viewer server)
- **Layer 8**: F020, F021, F022, F023 (API endpoints - can be done in parallel)
- **Layer 9**: F024, F025, F026, F027 (tests)
- **Layer 10**: F028 (documentation - last)

## Orchestration

### Manual Execution

Execute prompts sequentially:

```bash
# Read and execute each prompt in order
cat prompts/00-prep.md
# ... implement ...
# ... verify ...
# ... commit ...

cat prompts/01-types-schema-pricing.md
# ... etc ...
```

### Programmatic Orchestration

Process `manifest.jsonl` line by line:

```bash
# Example: Parse manifest and execute prompts
while IFS= read -r line; do
  id=$(echo "$line" | jq -r '.id')
  file=$(echo "$line" | jq -r '.file')
  description=$(echo "$line" | jq -r '.description')
  
  echo "Executing $id: $description"
  echo "Prompt: $file"
  
  # Sub-agent would execute the prompt here
  # Update status in manifest after completion
done < manifest.jsonl
```

### Status Tracking

Track progress by updating the `status` field in `manifest.jsonl`:

- `pending` - Not started
- `in_progress` - Currently being implemented
- `completed` - Done and verified
- `failed` - Needs attention

## Feature Status

Check feature status:

```bash
# Count completed features
cat manifest.jsonl | jq -r 'select(.status == "completed") | .id' | wc -l

# List pending features
cat manifest.jsonl | jq -r 'select(.status == "pending") | .id + ": " + .description'

# Show current feature
cat manifest.jsonl | jq -r 'select(.status == "in_progress") | .id + ": " + .description'
```

## Decision Log

See `decisions.md` for all architectural choices and their rationale.

**Key decisions**:
- **D001/D002**: Complete replacement, big bang deployment
- **D003/D004/D005**: SQLite + JSONL with bun:sqlite
- **D006**: Event emitter pattern for pub/sub
- **D007/D008**: fs.watch for file monitoring
- **D010**: Defer UI visualization to focus on data collection

## Edge Cases

See `edge-cases.md` for detailed handling of edge cases.

**Critical edge cases**:
- **EC001**: SQLite file locked → retry with exponential backoff
- **EC002**: Malformed transcript entry → skip with warning
- **EC004**: High volume writes → batch in memory, flush in transactions
- **EC006**: fs.watch unreliable → fallback to polling

## Testing Strategy

See `testing-strategy.md` for comprehensive approach.

**Test types**:
- **Unit Tests**: Individual modules in isolation (vitest, in-memory SQLite)
- **Integration Tests**: Data flow across components
- **API Tests**: HTTP endpoints and SSE streaming
- **Handler Tests**: Hook handlers with MetricsCollector

**Quality gates**:
- All tests must pass before marking feature complete
- Coverage >80% for new code
- Edge cases from `edge-cases.md` tested

## Verification Commands

Each prompt includes a verification command. Example:

```bash
# F004 - Database layer
bun test hooks/metrics/__tests__/database.test.ts

# F007 - MetricsCollector
bun test hooks/metrics/__tests__/collector.test.ts

# F012-F016 - All handlers
bun run tsc --noEmit hooks/handlers/*.ts
```

Run all tests:

```bash
bun test
```

## Implementation Notes

### Phase 0: Preparation (F000)
**CRITICAL**: Destructive operation - deletes old hooks system.
Verify paths before executing deletions.

### Phase 1-3: Foundation & Core (F001-F007)
Build the data infrastructure:
- Type definitions
- Database layer with bun:sqlite
- Event emitter for pub/sub
- MetricsCollector orchestrator

### Phase 4: Data Sources (F008-F011)
Implement data collection from multiple sources:
- Transcript parsing (fs.watch)
- Cost calculation
- Plan orchestration events
- Time-window aggregations

### Phase 5: Handlers (F012-F016)
All 12 hook handlers emit metrics through MetricsCollector.
Can be implemented in parallel after F007.

### Phase 6-8: Viewer (F017-F023)
New viewer from scratch:
- Security hardening
- HTTP server with Bun.serve
- REST API endpoints
- SSE streaming

### Phase 9: Testing (F024-F027)
Comprehensive test coverage at all levels.

### Phase 10: Documentation (F028)
Update project documentation to reflect new architecture.

## Next Steps After Completion

Once all features (F000-F028) are completed:

1. **Build**: Run `bun run hooks/build.ts` to bundle TypeScript
2. **Deploy**: Plugin is ready for use
3. **Verify**: Start Claude Code session to test live
4. **Monitor**: Check viewer at http://localhost:3456
5. **Future Work**: Add UI visualization (charts, dashboards) - currently deferred per D010

## Support Files

- `context.md` - Why we're building this and architectural vision
- `constraints.md` - Global rules enforced across all prompts
- `testing-strategy.md` - Holistic testing approach
- `decisions.md` - Decision log with IDs referenced in commits
- `edge-cases.md` - Edge cases with IDs referenced in prompts

## Architecture Diagram

```
+--------------------------------------------------------------------------------+
|                   Claude Hall Monitor Data Collection System                   |
+--------------------------------------------------------------------------------+
|                                                                                |
|  DATA SOURCES              COLLECTION LAYER                                    |
|  +-----------------+       +------------------+                                |
|  | 12 Hooks        |------>| MetricsCollector |                                |
|  | (F012-F016)     |       +--------+---------+                                |
|  +-----------------+                |                                          |
|  | Transcripts     |--------------->|                                          |
|  | (F008)          |                |                                          |
|  +-----------------+                |                                          |
|  | Plan Events     |--------------->|                                          |
|  | (F010)          |                v                                          |
|  +-----------------+       +------------------+                                |
|                            |  EventEmitter    |---> SSE Streaming (F023)       |
|  STORAGE LAYER             +--------+---------+                                |
|  +------------+  +--------+         |                                          |
|  | SQLite     |  | JSONL  |<--------+                                          |
|  | (F004)     |  | Archive|                                                    |
|  +------------+  +--------+                                                    |
|        |                                                                       |
|        v                                                                       |
|  +------------+                                                                |
|  | Aggregation| (F011)                                                         |
|  +------+-----+                                                                |
|         |                                                                      |
|         v                                                                      |
|  API LAYER: /api/metrics, /api/costs, /api/aggregations (F020-F022)           |
|             /events/metrics, /events/plans (F023)                              |
|                                                                                |
+--------------------------------------------------------------------------------+
```

## Prompt Template Reference

Each prompt follows a consistent structure:
- **Project Context**: Link to context.md
- **Prior Work**: What's been completed
- **Objective**: Single, clear goal
- **Scope Constraint**: Explicitly what NOT to do
- **Relevant Decisions**: From decisions.md
- **Edge Cases to Handle**: From edge-cases.md
- **Code References**: Links to code samples
- **Constraints**: From constraints.md
- **Implementation Details**: Specific guidance
- **Acceptance Criteria**: Testable checklist
- **Verification**: Commands to verify success
- **Commit**: Git commit message format
- **Next**: What prompt comes next

This structure ensures each prompt is self-contained and executable by a sub-agent.
