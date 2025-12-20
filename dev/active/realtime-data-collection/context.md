# Project Context

## Summary

Build a new realtime data collection system that **completely replaces** the existing hooks logging system. This is not an incremental enhancement but a ground-up rebuild focused on metrics, analytics, and cost tracking.

**Why**: The current system only logs events to JSONL files. We need structured metrics storage, token/cost analysis, plan orchestration tracking, and queryable data for insights into Claude Code usage patterns.

**What we're replacing**:
- Old logger.ts and all 12 existing hook handlers
- Existing viewer directory with basic log streaming
- Simple JSONL append-only logging

**What we're building**:
- Metrics-first architecture with SQLite for hot data, JSONL for archives
- Comprehensive data collection from hooks, transcripts, and plan orchestration
- Token usage parsing and cost calculation
- Time-window aggregation (hourly/daily/weekly/monthly)
- Realtime streaming via SSE
- REST API for querying metrics, costs, and aggregations

## Architecture Vision

The system follows a layered event-driven architecture:

**Collection Layer**: Hook handlers emit structured MetricEntry events through a central MetricsCollector. Multiple data sources feed into this collector:
- 12 hook handlers capturing Claude Code lifecycle events
- Transcript parser watching ~/.claude/projects/ for token usage data
- Plan events watcher monitoring manifest.jsonl for orchestration status

**Storage Layer**: Dual storage strategy for different access patterns:
- SQLite database for recent data requiring fast queries and aggregations
- JSONL archive files for long-term storage with tiered retention
- EventEmitter pub/sub decouples collection from storage/streaming

**API Layer**: HTTP server provides:
- REST endpoints for querying metrics, costs, and aggregated data
- SSE endpoints for realtime streaming to dashboards
- Session and plan-specific queries

**Integration**: All components communicate through:
- MetricsCollector as central orchestrator
- EventEmitter for realtime event distribution
- Shared type system (MetricEntry, TokenUsage, CostBreakdown, PlanEvent)

## Goals

- **Complete Observability**: Capture every significant event in Claude Code usage
- **Cost Transparency**: Parse token usage and calculate USD costs per model
- **Trend Analysis**: Enable time-series queries for usage patterns
- **Plan Tracking**: Monitor /plan-* command execution and feature completion
- **Realtime Insights**: Stream metrics to UI for live monitoring
- **Clean Architecture**: Event-driven, testable, modular design
- **Big Bang Deployment**: Complete replacement when ready, no gradual migration
