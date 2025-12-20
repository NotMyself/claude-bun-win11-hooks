# TypeScript Patterns

## Types

### Basic Types

Core data structures that all other code depends on.

```typescript
// hooks/metrics/types.ts

/**
 * Core metric entry captured from any data source
 */
export interface MetricEntry {
  id: string;
  timestamp: string; // ISO 8601
  session_id: string;
  project_path: string;
  source: 'hook' | 'transcript' | 'telemetry' | 'custom';
  event_type: string; // e.g., 'session_started', 'tool_executed'
  event_category: 'tool' | 'api' | 'session' | 'user' | 'custom';
  model?: string;
  tokens?: TokenUsage;
  cost?: CostBreakdown;
  tool_name?: string;
  tool_duration_ms?: number;
  tool_success?: boolean;
  data: Record<string, unknown>; // Flexible additional data
  tags: string[];
}

/**
 * Token usage from Claude API responses
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

/**
 * Cost breakdown in USD
 */
export interface CostBreakdown {
  input_cost_usd: number;
  output_cost_usd: number;
  cache_read_cost_usd: number;
  cache_creation_cost_usd: number;
  total_cost_usd: number;
}

/**
 * Plan orchestration event
 */
export interface PlanEvent {
  id: string;
  timestamp: string;
  session_id: string;
  event_type: 'plan_created' | 'plan_optimized' | 'feature_created'
            | 'orchestration_started' | 'feature_started' | 'feature_completed'
            | 'feature_failed' | 'orchestration_completed' | 'pr_created';
  plan_name: string;
  plan_path: string;
  feature_id?: string;
  feature_description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  pr_url?: string;
  data: Record<string, unknown>;
}
```

### Configuration Types

```typescript
// hooks/metrics/config.ts

export interface MetricsConfig {
  databasePath: string;
  archiveDir: string;
  aggregationIntervalMs: number;
  archiveAfterDays: number;
  deleteArchivesAfterDays: number;
  transcript: TranscriptConfig;
  plans: PlansConfig;
}

export interface TranscriptConfig {
  useFsWatch: boolean;
  projectsDir: string;
  fallbackPollIntervalMs: number;
}

export interface PlansConfig {
  activeDir: string;
  completeDir: string;
  watchManifest: boolean;
}

export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  databasePath: 'hooks/data/metrics.db',
  archiveDir: 'hooks/data/archive',
  aggregationIntervalMs: 60_000,
  archiveAfterDays: 7,
  deleteArchivesAfterDays: 365,
  transcript: {
    useFsWatch: true,
    projectsDir: '~/.claude/projects',
    fallbackPollIntervalMs: 30_000,
  },
  plans: {
    activeDir: 'dev/active',
    completeDir: 'dev/complete',
    watchManifest: true,
  },
};
```

### Database Types

```typescript
// hooks/metrics/database.ts - Type definitions

export interface QueryOptions {
  session_id?: string;
  event_type?: string;
  event_category?: string;
  start_time?: string;
  end_time?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AggregationOptions {
  period: 'hour' | 'day' | 'week' | 'month';
  start_time: string;
  end_time: string;
  metric: 'count' | 'cost' | 'tokens';
  group_by?: 'model' | 'event_type' | 'session';
}

export interface AggregationResult {
  period_start: string;
  period_end: string;
  value: number;
  group?: string;
}
```

## Utilities

### ID Generation

```typescript
// hooks/metrics/utils.ts

import { randomBytes } from 'crypto';

/**
 * Generate a unique metric ID
 */
export function generateMetricId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');
  return `m_${timestamp}_${random}`;
}

/**
 * Generate a unique plan event ID
 */
export function generatePlanEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');
  return `pe_${timestamp}_${random}`;
}
```

### Timestamp Formatting

```typescript
/**
 * Get current timestamp in ISO 8601 format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse timestamp to Date object
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Format timestamp for SQL queries
 */
export function formatForSQL(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}
```

### Path Resolution

```typescript
import { resolve, join } from 'path';
import { homedir } from 'os';

/**
 * Resolve ~ to home directory
 */
export function resolvePath(filePath: string): string {
  if (filePath.startsWith('~/') || filePath === '~') {
    return join(homedir(), filePath.slice(1));
  }
  return resolve(filePath);
}

/**
 * Validate path is within allowed directory (security)
 */
export function isPathSafe(filePath: string, allowedDir: string): boolean {
  const resolvedPath = resolve(filePath);
  const resolvedAllowed = resolve(allowedDir);
  return resolvedPath.startsWith(resolvedAllowed);
}
```

## Core Classes

### Event Emitter

```typescript
// hooks/utils/event-emitter.ts

export type EventListener<T = any> = (data: T) => void | Promise<void>;

export class EventEmitter {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   */
  async emit<T = any>(event: string, data: T): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    // Execute all listeners (async or sync)
    const promises = Array.from(eventListeners).map(listener => {
      try {
        return Promise.resolve(listener(data));
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Clear all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
```

### Database Class

```typescript
// hooks/metrics/database.ts

import { Database as BunDatabase } from 'bun:sqlite';
import type { MetricEntry, QueryOptions, AggregationOptions, AggregationResult } from './types';

export class Database {
  private db: BunDatabase;

  constructor(path: string) {
    this.db = new BunDatabase(path);
    this.initialize();
  }

  private initialize(): void {
    // Read schema from schema.sql and execute
    const schema = Bun.file('hooks/metrics/schema.sql').text();
    this.db.exec(schema);
  }

  /**
   * Insert a metric entry
   */
  async insertMetric(metric: MetricEntry): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO metrics (
        id, timestamp, session_id, project_path, source, event_type,
        event_category, model, tokens_json, cost_json, tool_name,
        tool_duration_ms, tool_success, data_json, tags_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      metric.id,
      metric.timestamp,
      metric.session_id,
      metric.project_path,
      metric.source,
      metric.event_type,
      metric.event_category,
      metric.model || null,
      metric.tokens ? JSON.stringify(metric.tokens) : null,
      metric.cost ? JSON.stringify(metric.cost) : null,
      metric.tool_name || null,
      metric.tool_duration_ms || null,
      metric.tool_success !== undefined ? (metric.tool_success ? 1 : 0) : null,
      JSON.stringify(metric.data),
      JSON.stringify(metric.tags)
    );
  }

  /**
   * Batch insert metrics (for performance)
   */
  async insertBatch(metrics: MetricEntry[]): Promise<void> {
    const transaction = this.db.transaction((entries: MetricEntry[]) => {
      for (const metric of entries) {
        this.insertMetric(metric);
      }
    });

    transaction(metrics);
  }

  /**
   * Query metrics with filters
   */
  async query(options: QueryOptions): Promise<MetricEntry[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (options.session_id) {
      conditions.push('session_id = ?');
      params.push(options.session_id);
    }
    if (options.event_type) {
      conditions.push('event_type = ?');
      params.push(options.event_type);
    }
    // Add more filters...

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

    const query = `
      SELECT * FROM metrics
      ${whereClause}
      ORDER BY timestamp DESC
      ${limitClause} ${offsetClause}
    `;

    const rows = this.db.query(query).all(...params);
    return rows.map(this.rowToMetric);
  }

  private rowToMetric(row: any): MetricEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      session_id: row.session_id,
      project_path: row.project_path,
      source: row.source,
      event_type: row.event_type,
      event_category: row.event_category,
      model: row.model,
      tokens: row.tokens_json ? JSON.parse(row.tokens_json) : undefined,
      cost: row.cost_json ? JSON.parse(row.cost_json) : undefined,
      tool_name: row.tool_name,
      tool_duration_ms: row.tool_duration_ms,
      tool_success: row.tool_success !== null ? Boolean(row.tool_success) : undefined,
      data: JSON.parse(row.data_json),
      tags: JSON.parse(row.tags_json),
    };
  }

  close(): void {
    this.db.close();
  }
}
```

### MetricsCollector

```typescript
// hooks/metrics/collector.ts

import type { MetricEntry } from './types';
import type { Database } from './database';
import type { EventEmitter } from '../utils/event-emitter';
import { generateMetricId, getCurrentTimestamp } from './utils';

export class MetricsCollector {
  private buffer: MetricEntry[] = [];
  private flushTimer?: Timer;
  private readonly maxBufferSize = 100;
  private readonly flushIntervalMs = 5000;

  constructor(
    private db: Database,
    private emitter: EventEmitter
  ) {
    this.startFlushTimer();
  }

  /**
   * Collect a metric entry
   */
  async collect(metric: Partial<MetricEntry>): Promise<void> {
    const fullMetric: MetricEntry = {
      id: metric.id || generateMetricId(),
      timestamp: metric.timestamp || getCurrentTimestamp(),
      session_id: metric.session_id!,
      project_path: metric.project_path!,
      source: metric.source!,
      event_type: metric.event_type!,
      event_category: metric.event_category!,
      model: metric.model,
      tokens: metric.tokens,
      cost: metric.cost,
      tool_name: metric.tool_name,
      tool_duration_ms: metric.tool_duration_ms,
      tool_success: metric.tool_success,
      data: metric.data || {},
      tags: metric.tags || [],
    };

    // Add to buffer
    this.buffer.push(fullMetric);

    // Emit for realtime streaming
    await this.emitter.emit('metric:collected', fullMetric);

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  /**
   * Flush buffered metrics to database
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const toFlush = [...this.buffer];
    this.buffer = [];

    try {
      await this.db.insertBatch(toFlush);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add to buffer for retry
      this.buffer.unshift(...toFlush);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}
```

## Parser Logic

### Transcript Parser

```typescript
// hooks/metrics/transcript-parser.ts

import { watch, FSWatcher } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { MetricsCollector } from './collector';
import type { TokenUsage } from './types';
import { resolvePath } from './utils';

export class TranscriptParser {
  private watcher?: FSWatcher;
  private pollingInterval?: Timer;

  constructor(
    private config: { projectsDir: string; useFsWatch: boolean; fallbackPollIntervalMs: number },
    private collector: MetricsCollector
  ) {}

  async start(): Promise<void> {
    const projectsDir = resolvePath(this.config.projectsDir);

    if (this.config.useFsWatch) {
      try {
        this.watcher = watch(projectsDir, { recursive: true }, async (eventType, filename) => {
          if (filename && filename.endsWith('.jsonl')) {
            await this.parseFile(join(projectsDir, filename));
          }
        });
      } catch (error) {
        console.warn('fs.watch failed, falling back to polling:', error);
        this.startPolling(projectsDir);
      }
    } else {
      this.startPolling(projectsDir);
    }
  }

  private startPolling(projectsDir: string): void {
    this.pollingInterval = setInterval(async () => {
      await this.scanDirectory(projectsDir);
    }, this.config.fallbackPollIntervalMs);
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        await this.parseFile(join(dir, entry.name));
      }
    }
  }

  private async parseFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.usage) {
            await this.processTokenUsage(entry, filePath);
          }
        } catch (error) {
          console.warn(`Malformed JSON in ${filePath}:`, error);
          // Skip malformed entry (EC002)
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File deleted during parse (EC007)
        console.warn(`File disappeared: ${filePath}`);
      } else {
        console.error(`Error parsing ${filePath}:`, error);
      }
    }
  }

  private async processTokenUsage(entry: any, filePath: string): Promise<void> {
    const tokens: TokenUsage = {
      input_tokens: entry.usage.input_tokens || 0,
      output_tokens: entry.usage.output_tokens || 0,
      cache_read_input_tokens: entry.usage.cache_read_input_tokens || 0,
      cache_creation_input_tokens: entry.usage.cache_creation_input_tokens || 0,
    };

    await this.collector.collect({
      source: 'transcript',
      event_type: 'api_call',
      event_category: 'api',
      session_id: entry.session_id || 'unknown',
      project_path: filePath,
      model: entry.model,
      tokens,
      data: { raw: entry },
      tags: ['transcript'],
    });
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      this.watcher.close();
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
```

### File Watching

```typescript
// Pattern for watching files with fs.watch

import { watch, FSWatcher } from 'fs';

/**
 * Watch a file or directory for changes
 */
export function watchPath(
  path: string,
  onChange: (eventType: string, filename: string | null) => void
): FSWatcher {
  return watch(path, { recursive: true }, (eventType, filename) => {
    onChange(eventType, filename);
  });
}

/**
 * Watch with error handling and fallback
 */
export function watchWithFallback(
  path: string,
  onChange: (eventType: string, filename: string | null) => void,
  onError: () => void
): FSWatcher | null {
  try {
    return watch(path, { recursive: true }, onChange);
  } catch (error) {
    console.error('fs.watch failed:', error);
    onError();
    return null;
  }
}
```

## Calculation Logic

### Cost Calculator

```typescript
// hooks/metrics/cost-calculator.ts

import type { TokenUsage, CostBreakdown } from './types';
import { MODEL_PRICING } from './pricing';

export class CostCalculator {
  /**
   * Calculate cost from token usage
   */
  calculate(tokens: TokenUsage, model: string): CostBreakdown {
    const pricing = this.getPricing(model);

    const input_cost_usd = (tokens.input_tokens / 1_000_000) * pricing.input;
    const output_cost_usd = (tokens.output_tokens / 1_000_000) * pricing.output;
    const cache_read_cost_usd = (tokens.cache_read_input_tokens / 1_000_000) * pricing.cacheRead;
    const cache_creation_cost_usd = (tokens.cache_creation_input_tokens / 1_000_000) * pricing.cacheCreation;

    return {
      input_cost_usd,
      output_cost_usd,
      cache_read_cost_usd,
      cache_creation_cost_usd,
      total_cost_usd: input_cost_usd + output_cost_usd + cache_read_cost_usd + cache_creation_cost_usd,
    };
  }

  private getPricing(model: string): { input: number; output: number; cacheRead: number; cacheCreation: number } {
    // Try exact match
    if (MODEL_PRICING[model]) {
      return MODEL_PRICING[model];
    }

    // Fallback to tier-based heuristics (EC003)
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
}
```

## Hook Handlers

### Handler Pattern

```typescript
// Pattern for all hook handlers

import type { MetricsCollector } from '../metrics/collector';

export function createSessionStartHandler(collector: MetricsCollector) {
  return async (input: { sessionId: string; projectPath: string }) => {
    await collector.collect({
      source: 'hook',
      event_type: 'session_started',
      event_category: 'session',
      session_id: input.sessionId,
      project_path: input.projectPath,
      data: { startTime: new Date().toISOString() },
      tags: ['session', 'lifecycle'],
    });

    return { proceed: true };
  };
}
```

## HTTP Server

```typescript
// hooks/viewer/server.ts - Basic structure

export class ViewerServer {
  private server?: any;

  constructor(private config: { port: number; host: string }) {}

  async start(): Promise<void> {
    this.server = Bun.serve({
      port: this.config.port,
      hostname: this.config.host,
      fetch: this.handleRequest.bind(this),
    });

    console.log(`Viewer running at http://${this.config.host}:${this.config.port}`);
  }

  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Route to appropriate handler
    if (url.pathname.startsWith('/api/metrics')) {
      return this.handleMetricsAPI(req);
    } else if (url.pathname.startsWith('/events')) {
      return this.handleSSE(req);
    }

    return new Response('Not Found', { status: 404 });
  }

  private handleMetricsAPI(req: Request): Response {
    // Implementation in API handlers
    return new Response(JSON.stringify({ metrics: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private handleSSE(req: Request): Response {
    // SSE streaming implementation
    return new Response('Not implemented', { status: 501 });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.stop();
    }
  }
}
```

## Security Utilities

```typescript
// hooks/viewer/security.ts

/**
 * Validate session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9-]{1,64}$/.test(sessionId);
}

/**
 * Validate path to prevent traversal attacks
 */
export function validatePath(path: string, allowedBase: string): boolean {
  const resolved = require('path').resolve(allowedBase, path);
  return resolved.startsWith(allowedBase);
}

/**
 * Verify bearer token
 */
export function verifyBearerToken(req: Request, expectedToken: string): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return false;
  
  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' && token === expectedToken;
}
```

## API Handlers

```typescript
// hooks/viewer/api/metrics.ts

import type { Database } from '../../metrics/database';

export async function handleMetricsQuery(
  req: Request,
  db: Database
): Promise<Response> {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');
  const eventType = url.searchParams.get('event_type');

  const metrics = await db.query({
    session_id: sessionId || undefined,
    event_type: eventType || undefined,
    limit: 100,
  });

  return new Response(JSON.stringify({ metrics }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## SSE Handlers

```typescript
// hooks/viewer/sse/events.ts

import type { EventEmitter } from '../../utils/event-emitter';

export function handleMetricsSSE(emitter: EventEmitter): Response {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      // Subscribe to metric events
      const listener = (metric: any) => {
        controller.enqueue(`data: ${JSON.stringify(metric)}\n\n`);
      };

      emitter.on('metric:collected', listener);

      // Cleanup on close
      return () => {
        emitter.off('metric:collected', listener);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Testing Patterns

```typescript
// Example test patterns

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from '../database';
import { MetricsCollector } from '../collector';
import { EventEmitter } from '../../utils/event-emitter';

describe('MetricsCollector', () => {
  let db: Database;
  let emitter: EventEmitter;
  let collector: MetricsCollector;

  beforeEach(() => {
    db = new Database(':memory:');
    emitter = new EventEmitter();
    collector = new MetricsCollector(db, emitter);
  });

  afterEach(async () => {
    await collector.shutdown();
    db.close();
  });

  it('should collect and flush metrics', async () => {
    await collector.collect({
      source: 'hook',
      event_type: 'test',
      event_category: 'custom',
      session_id: 'test-session',
      project_path: '/test',
    });

    await collector.flush();

    const metrics = await db.query({ session_id: 'test-session' });
    expect(metrics).toHaveLength(1);
    expect(metrics[0].event_type).toBe('test');
  });

  it('should emit events for realtime streaming', async () => {
    let emittedMetric: any;
    emitter.on('metric:collected', (metric) => {
      emittedMetric = metric;
    });

    await collector.collect({
      source: 'hook',
      event_type: 'test',
      event_category: 'custom',
      session_id: 'test-session',
      project_path: '/test',
    });

    expect(emittedMetric).toBeDefined();
    expect(emittedMetric.event_type).toBe('test');
  });
});
```
