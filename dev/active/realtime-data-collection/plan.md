# Realtime Data Collection System

## Summary

Build a new realtime data collection system that **replaces** the existing hooks logging system:
- New metrics collection architecture (replaces existing logger.ts/handlers)
- Parses Claude Code transcripts for token/cost data
- Captures plan orchestration events from /plan-* commands
- Stores data in SQLite for queries + JSONL for archival

**Note**: This is a complete replacement, not an extension of the current hooks system.

## Architecture

```
+-----------------------------------------------------------------------------------+
|                        Claude Hall Monitor Data Collection System                  |
+-----------------------------------------------------------------------------------+
|                                                                                    |
|  DATA SOURCES                         COLLECTION LAYER                             |
|  +------------------+                 +------------------+                         |
|  | 12 Hook Handlers |---------------->| MetricsCollector |                         |
|  +------------------+                 +--------+---------+                         |
|  +------------------+                          |                                   |
|  | Claude Transcripts|------------------------>|                                   |
|  | (~/.claude/projects)|                       |                                   |
|  +------------------+                          |                                   |
|  +------------------+                          |                                   |
|  | Plan Events      |------------------------->|                                   |
|  | (manifest.jsonl) |                          |                                   |
|  +------------------+                          v                                   |
|                                      +------------------+                          |
|  STORAGE LAYER                       |  EventEmitter    |---> SSE Streaming        |
|  +-------------+  +-------------+    +--------+---------+                          |
|  |   SQLite    |  |   JSONL     |             |                                    |
|  | (hot data)  |  | (archives)  |<------------+                                    |
|  +-------------+  +-------------+             |                                    |
|        |                                      v                                    |
|        v                             +------------------+                          |
|  +-------------+                     +------------------+                          |
|  | Aggregation |                     | Plan Orchestrator|---> /plan-* events       |
|  |   Service   |                     +------------------+                          |
|  +------+------+                                                                   |
|         |                                                                          |
|         v                                                                          |
|  API LAYER: /api/metrics, /api/costs, /api/aggregations, /events/metrics (SSE)    |
|                                                                                    |
|  UI: Extended Viewer with Metrics Tab, Cost Charts, Token Trends                  |
+-----------------------------------------------------------------------------------+
```

## Requirements

1. **Hook Event Collection**: Extend existing hooks to emit structured metrics
2. **Transcript Parsing**: Read Claude Code session files for token usage
3. **Cost Calculation**: Convert tokens to USD using model pricing
4. **Time-Window Aggregation**: Hourly/daily/weekly/monthly rollups
5. **Plan Orchestration Events**: Capture /plan-new, /plan-optimize, /plan-orchestrate events
6. **Long-term Archive**: JSONL files with tiered retention
7. **Realtime Streaming**: SSE for live metrics dashboard

## Files to Create

### Metrics Subsystem (`hooks/metrics/`)

| File | Purpose |
|------|---------|
| `hooks/metrics/types.ts` | Core type definitions (MetricEntry, TokenUsage, etc.) |
| `hooks/metrics/schema.sql` | SQLite schema for metrics storage |
| `hooks/metrics/pricing.ts` | Model pricing data for cost calculation |
| `hooks/metrics/database.ts` | SQLite wrapper using bun:sqlite |
| `hooks/metrics/collector.ts` | Central MetricsCollector class |
| `hooks/metrics/transcript-parser.ts` | Parse ~/.claude/projects/ JSONL |
| `hooks/metrics/aggregation-service.ts` | Time-window aggregation logic |
| `hooks/metrics/cost-calculator.ts` | Token -> cost conversion |
| `hooks/metrics/plan-events.ts` | Plan orchestration event capture |
| `hooks/metrics/index.ts` | Public exports |

### Hook Handlers (`hooks/handlers/`) - All New

| File | Purpose |
|------|---------|
| `hooks/handlers/user-prompt-submit.ts` | Log prompts with metrics |
| `hooks/handlers/pre-tool-use.ts` | Start timing, emit metric |
| `hooks/handlers/post-tool-use.ts` | End timing, emit tool metric |
| `hooks/handlers/post-tool-use-failure.ts` | Log failures with metrics |
| `hooks/handlers/notification.ts` | Log notifications |
| `hooks/handlers/session-start.ts` | Start metrics collector, viewer |
| `hooks/handlers/session-end.ts` | Stop collector, flush metrics |
| `hooks/handlers/stop.ts` | Log interrupts |
| `hooks/handlers/subagent-start.ts` | Log subagent spawn |
| `hooks/handlers/subagent-stop.ts` | Log subagent completion |
| `hooks/handlers/pre-compact.ts` | Log compaction events |
| `hooks/handlers/permission-request.ts` | Log permission decisions |

### Viewer (New, Metrics-First) (`hooks/viewer/`)

| File | Purpose |
|------|---------|
| `hooks/viewer/server.ts` | HTTP server with metrics API |
| `hooks/viewer/config.ts` | Configuration constants |
| `hooks/viewer/types.ts` | Viewer-specific types |
| `hooks/viewer/security.ts` | Auth, rate limiting, path validation |
| `hooks/viewer/api/metrics.ts` | Metrics query endpoints |
| `hooks/viewer/api/plans.ts` | Plan events endpoints |
| `hooks/viewer/api/sessions.ts` | Session summary endpoints |
| `hooks/viewer/sse/events.ts` | SSE streaming handlers |
| `hooks/viewer/index.html` | (Deferred) New metrics-first UI |

### Utilities (`hooks/utils/`)

| File | Purpose |
|------|---------|
| `hooks/utils/event-emitter.ts` | Lightweight pub/sub for realtime |

## Files to Delete (Existing System)

The following will be **completely removed** (big bang replacement):

| Path | Description |
|------|-------------|
| `hooks/utils/logger.ts` | Old JSONL logger |
| `hooks/handlers/*.ts` | All 12 existing hook handlers |
| `hooks/viewer/*` | Entire viewer directory (server, watcher, UI) |
| `hooks/logs/` | Old JSONL log files |
| `hooks/utils/__tests__/logger.test.ts` | Old logger tests |

## Files to Keep

| Path | Reason |
|------|--------|
| `.claude-plugin/` | Plugin manifest (update hooks.json) |
| `hooks/package.json` | Update with new deps |
| `hooks/build.ts` | May need updates for new structure |
| `commands/` | Slash commands unchanged |
| `rules/` | Rules unchanged |

## Files to Update

| File | Changes |
|------|---------|
| `.claude-plugin/hooks.json` | Point to new handler paths |
| `hooks/package.json` | Add bun:sqlite, update deps |
| `hooks/build.ts` | Update for new file structure |
| `CLAUDE.md` | Document new architecture |

## Data Models

### MetricEntry (Core)
```typescript
interface MetricEntry {
  id: string;
  timestamp: string;
  session_id: string;
  project_path: string;
  source: 'hook' | 'transcript' | 'telemetry' | 'custom';
  event_type: string;
  event_category: 'tool' | 'api' | 'session' | 'user' | 'custom';
  model?: string;
  tokens?: TokenUsage;
  cost?: CostBreakdown;
  tool_name?: string;
  tool_duration_ms?: number;
  tool_success?: boolean;
  data: Record<string, unknown>;
  tags: string[];
}
```

### TokenUsage
```typescript
interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}
```

### CostBreakdown
```typescript
interface CostBreakdown {
  input_cost_usd: number;
  output_cost_usd: number;
  cache_read_cost_usd: number;
  cache_creation_cost_usd: number;
  total_cost_usd: number;
}
```

### PlanEvent
```typescript
interface PlanEvent {
  id: string;
  timestamp: string;
  session_id: string;
  event_type: 'plan_created' | 'plan_optimized' | 'feature_created'
            | 'orchestration_started' | 'feature_started' | 'feature_completed'
            | 'feature_failed' | 'orchestration_completed' | 'pr_created';
  plan_name: string;
  plan_path: string;
  feature_id?: string;         // For feature-level events
  feature_description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  pr_url?: string;             // For pr_created events
  data: Record<string, unknown>;
}
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metrics` | GET | Query metrics with filters |
| `/api/metrics/aggregations` | GET | Get aggregated data by period |
| `/api/metrics/costs` | GET | Cost analysis and breakdown |
| `/api/metrics/export` | POST | Trigger data export |
| `/api/plans/events` | GET | Query plan orchestration events |
| `/api/plans/events/:plan` | GET | Events for a specific plan |
| `/events/metrics` | GET (SSE) | Realtime metric stream |
| `/events/plans` | GET (SSE) | Realtime plan event stream (extends existing) |

## Implementation Order

### Phase 0: Preparation
0. Delete existing hooks system files (clean slate)

### Phase 1: Core Infrastructure
1. Types & Schema (`metrics/types.ts`, `schema.sql`, `pricing.ts`)
2. Database Layer (`metrics/database.ts`)
3. Event Emitter (`utils/event-emitter.ts`)
4. Core Collector (`metrics/collector.ts`, `index.ts`)

### Phase 2: Hook Handlers (All New)
5. Write all 12 hook handlers with new MetricsCollector
6. Update `.claude-plugin/hooks.json` with new paths

### Phase 3: Data Sources
7. Transcript Parser with fs.watch (`metrics/transcript-parser.ts`)
8. Cost Calculator (`metrics/cost-calculator.ts`)
9. Plan Events Capture (`metrics/plan-events.ts`)

### Phase 4: Analytics
10. Aggregation Service (`metrics/aggregation-service.ts`)

### Phase 5: Viewer (New)
11. Security module (`viewer/security.ts`)
12. Config (`viewer/config.ts`)
13. HTTP Server (`viewer/server.ts`)
14. API endpoints (`viewer/api/*.ts`)
15. SSE handlers (`viewer/sse/events.ts`)

### Phase 6: Testing
16. Unit tests for all modules
17. Integration tests for data pipeline
18. API endpoint tests
19. Handler integration tests

### Phase 7: Documentation & Build
20. Update `hooks/build.ts` for new structure
21. Update `CLAUDE.md` with new architecture
22. Update `hooks/package.json`

**Note**: UI visualization (charts, dashboards) deferred to future phase. Focus on data collection and API first.

## Configuration

```typescript
METRICS_CONFIG = {
  DATABASE_PATH: 'hooks/data/metrics.db',
  ARCHIVE_DIR: 'hooks/data/archive',
  AGGREGATION_INTERVAL_MS: 60_000,
  ARCHIVE_AFTER_DAYS: 7,
  DELETE_ARCHIVES_AFTER_DAYS: 365,
  TRANSCRIPT: {
    USE_FS_WATCH: true,  // Event-driven file watching
    PROJECTS_DIR: '~/.claude/projects',
    // Fallback polling if fs.watch unavailable (Windows edge cases)
    FALLBACK_POLL_INTERVAL_MS: 30_000,
  },
  PLANS: {
    ACTIVE_DIR: 'dev/active',
    COMPLETE_DIR: 'dev/complete',
    WATCH_MANIFEST: true,  // Watch manifest.jsonl for orchestration events
  },
}
```

## Testing Strategy

- Unit tests for each new module (collector, parser, aggregation, cost calculator)
- Integration tests for hook -> collector -> database flow
- API tests for all new endpoints
- SSE streaming tests
- Use vitest (consistent with existing project)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Complete replacement | Clean slate, no legacy constraints, metrics-first design |
| Big bang deployment | Remove old system entirely, deploy new when complete |
| New viewer from scratch | Metrics-first UI design, not constrained by old patterns |
| SQLite for hot data | Fast queries, embedded, no external deps |
| JSONL for archives | Human-readable, append-only, easy to parse |
| Bun:sqlite | Native Bun integration, no npm package needed |
| Event emitter pattern | Decouples collection from storage/streaming |
| fs.watch for transcripts | Event-driven, no polling overhead, immediate updates |
| Watch manifest.jsonl | Capture /plan-orchestrate feature status updates |
| Start fresh (no migration) | Simpler, avoids schema version complexity |
| Defer UI visualization | Focus on data collection/API first, add charts later |

## Edge Cases

| Case | Handling |
|------|----------|
| SQLite file locked | Retry with exponential backoff |
| Malformed transcript entry | Skip and log warning |
| Missing model pricing | Use default/fallback pricing |
| High volume writes | Batch writes, async flush |
| Concurrent SSE connections | Rate limit per IP (existing) |
| fs.watch not reliable (Windows network drives) | Fallback to polling mode |
| Transcript file deleted mid-parse | Handle gracefully, skip entry |
| Session file renamed during watch | Re-scan directory on rename event |

## Platform Notes

**fs.watch on Windows:**
- Works well for local drives
- May need fallback polling for network/mapped drives
- Bun's fs.watch implementation is generally reliable
- Will use `recursive: true` for watching projects directory

## Plan Orchestration Events

The `/plan-*` commands create structured data that we'll capture:

### /plan-new Events
- `plan_created`: New plan created in `dev/active/<name>/plan.md`
- Data: plan name, created timestamp, session_id

### /plan-optimize Events
- `plan_optimized`: Plan transformed into feature prompts
- Data: plan name, feature count, manifest.jsonl path
- `feature_created`: Each feature prompt generated
- Data: feature_id, description, dependencies, edge_cases, decisions

### /plan-orchestrate Events (from manifest.jsonl)
- `orchestration_started`: Plan execution begins
- `feature_started`: Feature marked `in_progress` in manifest
- `feature_completed`: Feature marked `completed` in manifest
- `feature_failed`: Feature marked `failed` in manifest
- `orchestration_completed`: All features done, plan moved to `dev/complete/`
- `pr_created`: Pull request created for the plan

These events are captured by watching `manifest.jsonl` for status changes and detecting plan lifecycle transitions.
