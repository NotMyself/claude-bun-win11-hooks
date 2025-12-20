# Architectural Decisions

| ID | Decision | Rationale | Affected Features |
|----|----------|-----------|-------------------|
| D001 | Complete replacement over incremental enhancement | Clean slate eliminates legacy constraints, enables metrics-first design without backward compatibility burden | F000 |
| D002 | Big bang deployment (not gradual migration) | Simpler than maintaining two systems in parallel, removes migration complexity, old system has no critical data requiring preservation | F000, F028 |
| D003 | SQLite for hot data storage | Embedded database with no external dependencies, fast queries for aggregations, excellent Bun integration via bun:sqlite, ACID compliance for data integrity | F002, F004, F011 |
| D004 | JSONL for long-term archives | Human-readable format for debugging, append-only simplicity, easy parsing with standard tools, industry standard for log archival | F004, F011 |
| D005 | Use Bun's native bun:sqlite | Zero npm dependencies for database, native performance, consistent with Bun runtime philosophy, simpler than external SQLite packages | F004 |
| D006 | Event emitter pattern for pub/sub | Decouples metric collection from storage and streaming, enables multiple consumers without tight coupling, supports realtime SSE without blocking writes | F005, F007, F023 |
| D007 | fs.watch for transcript monitoring | Event-driven approach eliminates polling overhead, immediate updates when transcripts change, Bun's fs.watch is reliable on modern systems | F008 |
| D008 | Watch manifest.jsonl for plan orchestration events | Captures feature status changes in realtime, no need for explicit event emission from /plan-orchestrate command, file-based state is source of truth | F010 |
| D009 | No migration from old system | Old JSONL logs have limited value, fresh start simplifies implementation, no schema versioning complexity, deployment happens when complete | F000 |
| D010 | Defer UI visualization to future phase | Focus engineering effort on data collection and API first, charts and dashboards can be added once data foundation is solid, progressive disclosure principle | F028 |
