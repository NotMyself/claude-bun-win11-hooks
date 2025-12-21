# SQL Patterns

## Schema Definition

### Metrics Table

```sql
-- hooks/metrics/schema.sql

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  session_id TEXT NOT NULL,
  project_path TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('hook', 'transcript', 'telemetry', 'custom')),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK(event_category IN ('tool', 'api', 'session', 'user', 'custom')),
  model TEXT,
  tokens_json TEXT, -- JSON serialized TokenUsage
  cost_json TEXT, -- JSON serialized CostBreakdown
  tool_name TEXT,
  tool_duration_ms INTEGER,
  tool_success INTEGER, -- 0 = false, 1 = true, NULL = not applicable
  data_json TEXT NOT NULL, -- JSON serialized additional data
  tags_json TEXT NOT NULL, -- JSON serialized array of strings
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_metrics_session ON metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_event_type ON metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_metrics_model ON metrics(model);
CREATE INDEX IF NOT EXISTS idx_metrics_session_timestamp ON metrics(session_id, timestamp);
```

### Plan Events Table

```sql
CREATE TABLE IF NOT EXISTS plan_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_path TEXT NOT NULL,
  feature_id TEXT,
  feature_description TEXT,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  pr_url TEXT,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plan_events_plan_name ON plan_events(plan_name);
CREATE INDEX IF NOT EXISTS idx_plan_events_timestamp ON plan_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_plan_events_session ON plan_events(session_id);
CREATE INDEX IF NOT EXISTS idx_plan_events_feature ON plan_events(feature_id);
```

### Aggregations Table (Materialized)

```sql
CREATE TABLE IF NOT EXISTS metric_aggregations (
  id TEXT PRIMARY KEY,
  period_type TEXT NOT NULL CHECK(period_type IN ('hour', 'day', 'week', 'month')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK(metric_type IN ('count', 'cost', 'tokens')),
  group_by TEXT, -- 'model', 'event_type', 'session', or NULL for overall
  group_value TEXT, -- Value of the group_by field
  value REAL NOT NULL,
  data_json TEXT, -- Additional aggregation details
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(period_type, period_start, metric_type, group_by, group_value)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agg_period ON metric_aggregations(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_agg_metric_type ON metric_aggregations(metric_type);
CREATE INDEX IF NOT EXISTS idx_agg_group ON metric_aggregations(group_by, group_value);
```

## Basic Queries

### Insert Queries

```sql
-- Insert a metric
INSERT INTO metrics (
  id, timestamp, session_id, project_path, source, event_type,
  event_category, model, tokens_json, cost_json, tool_name,
  tool_duration_ms, tool_success, data_json, tags_json
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Insert a plan event
INSERT INTO plan_events (
  id, timestamp, session_id, event_type, plan_name, plan_path,
  feature_id, feature_description, status, pr_url, data_json
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

### Select Queries

```sql
-- Get all metrics for a session
SELECT * FROM metrics
WHERE session_id = ?
ORDER BY timestamp DESC;

-- Get metrics by event type
SELECT * FROM metrics
WHERE event_type = ?
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;

-- Get recent metrics across all sessions
SELECT * FROM metrics
ORDER BY timestamp DESC
LIMIT 100;

-- Get metrics with cost data
SELECT * FROM metrics
WHERE cost_json IS NOT NULL
ORDER BY timestamp DESC;

-- Get plan events for a specific plan
SELECT * FROM plan_events
WHERE plan_name = ?
ORDER BY timestamp ASC;
```

### Filtering Queries

```sql
-- Time range filter
SELECT * FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
ORDER BY timestamp ASC;

-- Multiple filters combined
SELECT * FROM metrics
WHERE session_id = ?
  AND event_type = ?
  AND timestamp >= ?
ORDER BY timestamp DESC;

-- Filter by model
SELECT * FROM metrics
WHERE model = ?
  AND cost_json IS NOT NULL
ORDER BY timestamp DESC;
```

## Aggregation Queries

### Count Aggregations

```sql
-- Count metrics by event type
SELECT event_type, COUNT(*) as count
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY event_type
ORDER BY count DESC;

-- Count by session
SELECT session_id, COUNT(*) as count
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY session_id
ORDER BY count DESC;

-- Count by model
SELECT model, COUNT(*) as count
FROM metrics
WHERE model IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?
GROUP BY model
ORDER BY count DESC;
```

### Cost Aggregations

```sql
-- Total cost by model (requires JSON extraction)
-- Note: Bun SQLite supports JSON functions
SELECT 
  model,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost
FROM metrics
WHERE cost_json IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?
GROUP BY model
ORDER BY total_cost DESC;

-- Cost breakdown by session
SELECT 
  session_id,
  SUM(json_extract(cost_json, '$.input_cost_usd')) as input_cost,
  SUM(json_extract(cost_json, '$.output_cost_usd')) as output_cost,
  SUM(json_extract(cost_json, '$.cache_read_cost_usd')) as cache_read_cost,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost
FROM metrics
WHERE cost_json IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?
GROUP BY session_id;

-- Overall cost summary
SELECT 
  COUNT(*) as api_calls,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost,
  AVG(json_extract(cost_json, '$.total_cost_usd')) as avg_cost_per_call
FROM metrics
WHERE cost_json IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?;
```

### Token Aggregations

```sql
-- Total tokens by model
SELECT 
  model,
  SUM(json_extract(tokens_json, '$.input_tokens')) as input_tokens,
  SUM(json_extract(tokens_json, '$.output_tokens')) as output_tokens,
  SUM(json_extract(tokens_json, '$.cache_read_input_tokens')) as cache_read_tokens,
  SUM(json_extract(tokens_json, '$.cache_creation_input_tokens')) as cache_creation_tokens
FROM metrics
WHERE tokens_json IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?
GROUP BY model;

-- Token usage by session
SELECT 
  session_id,
  SUM(json_extract(tokens_json, '$.input_tokens') + json_extract(tokens_json, '$.output_tokens')) as total_tokens
FROM metrics
WHERE tokens_json IS NOT NULL
GROUP BY session_id
ORDER BY total_tokens DESC;
```

### Time-Window Aggregations

```sql
-- Hourly aggregation
SELECT 
  strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
  COUNT(*) as event_count,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY hour
ORDER BY hour ASC;

-- Daily aggregation
SELECT 
  strftime('%Y-%m-%d', timestamp) as day,
  COUNT(*) as event_count,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost,
  COUNT(DISTINCT session_id) as unique_sessions
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY day
ORDER BY day ASC;

-- Weekly aggregation (ISO week)
SELECT 
  strftime('%Y-W%W', timestamp) as week,
  COUNT(*) as event_count,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY week
ORDER BY week ASC;

-- Monthly aggregation
SELECT 
  strftime('%Y-%m', timestamp) as month,
  COUNT(*) as event_count,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost,
  COUNT(DISTINCT session_id) as unique_sessions
FROM metrics
WHERE timestamp >= ? AND timestamp <= ?
GROUP BY month
ORDER BY month ASC;
```

### Tool Usage Aggregations

```sql
-- Most used tools
SELECT 
  tool_name,
  COUNT(*) as usage_count,
  AVG(tool_duration_ms) as avg_duration_ms,
  SUM(CASE WHEN tool_success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
FROM metrics
WHERE tool_name IS NOT NULL
  AND timestamp >= ? AND timestamp <= ?
GROUP BY tool_name
ORDER BY usage_count DESC;

-- Tool performance over time
SELECT 
  tool_name,
  strftime('%Y-%m-%d', timestamp) as day,
  COUNT(*) as executions,
  AVG(tool_duration_ms) as avg_duration,
  MAX(tool_duration_ms) as max_duration
FROM metrics
WHERE tool_name IS NOT NULL
GROUP BY tool_name, day
ORDER BY day ASC, tool_name;
```

## Complex Queries

### Join Queries

```sql
-- Correlate metrics with plan events (by session)
SELECT 
  m.session_id,
  pe.plan_name,
  pe.feature_id,
  COUNT(m.id) as metric_count,
  SUM(json_extract(m.cost_json, '$.total_cost_usd')) as total_cost
FROM metrics m
INNER JOIN plan_events pe ON m.session_id = pe.session_id
WHERE pe.event_type = 'feature_started'
GROUP BY m.session_id, pe.plan_name, pe.feature_id;

-- Find expensive sessions
SELECT 
  m.session_id,
  m.project_path,
  COUNT(m.id) as api_calls,
  SUM(json_extract(m.cost_json, '$.total_cost_usd')) as total_cost,
  pe.plan_name
FROM metrics m
LEFT JOIN plan_events pe ON m.session_id = pe.session_id AND pe.event_type = 'orchestration_started'
WHERE m.cost_json IS NOT NULL
GROUP BY m.session_id
HAVING total_cost > ?
ORDER BY total_cost DESC;
```

### Subqueries

```sql
-- Sessions above average cost
SELECT 
  session_id,
  SUM(json_extract(cost_json, '$.total_cost_usd')) as total_cost
FROM metrics
WHERE cost_json IS NOT NULL
GROUP BY session_id
HAVING total_cost > (
  SELECT AVG(session_cost)
  FROM (
    SELECT SUM(json_extract(cost_json, '$.total_cost_usd')) as session_cost
    FROM metrics
    WHERE cost_json IS NOT NULL
    GROUP BY session_id
  )
);

-- Latest metric per session
SELECT m.*
FROM metrics m
INNER JOIN (
  SELECT session_id, MAX(timestamp) as latest
  FROM metrics
  GROUP BY session_id
) latest ON m.session_id = latest.session_id AND m.timestamp = latest.latest;
```

### Materialized Aggregation Inserts

```sql
-- Insert hourly aggregation
INSERT INTO metric_aggregations (
  id, period_type, period_start, period_end, metric_type, group_by, group_value, value, data_json
)
SELECT 
  'agg_' || strftime('%Y%m%d%H', timestamp) || '_' || metric_type || '_' || COALESCE(group_value, 'all'),
  'hour',
  strftime('%Y-%m-%d %H:00:00', timestamp),
  strftime('%Y-%m-%d %H:59:59', timestamp),
  'count',
  'event_type',
  event_type,
  COUNT(*),
  json_object('source', json_group_array(DISTINCT source))
FROM metrics
WHERE timestamp >= ? AND timestamp < ?
GROUP BY strftime('%Y-%m-%d %H:00:00', timestamp), event_type
ON CONFLICT DO UPDATE SET value = excluded.value, data_json = excluded.data_json;
```

## Performance Optimization

### PRAGMA Statements

```sql
-- Enable WAL mode for better concurrent access
PRAGMA journal_mode = WAL;

-- Increase cache size
PRAGMA cache_size = 10000;

-- Optimize for performance
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;

-- Foreign key enforcement (if needed)
PRAGMA foreign_keys = ON;
```

### Batch Inserts

```sql
-- Begin transaction
BEGIN TRANSACTION;

-- Multiple inserts
INSERT INTO metrics (...) VALUES (...);
INSERT INTO metrics (...) VALUES (...);
INSERT INTO metrics (...) VALUES (...);

-- Commit
COMMIT;
```

### Vacuum and Analyze

```sql
-- Reclaim space and optimize
VACUUM;

-- Update query planner statistics
ANALYZE;
```
