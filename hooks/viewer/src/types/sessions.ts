export interface Session {
  session_id: string;
  project_path: string;
  project_name: string;
  started_at: string;
  ended_at?: string;
  duration: number;
  cost_usd: number;
  total_tokens: number;
  model: string;
  tool_usage: Record<string, number>;
  summary?: string;
}

export interface DashboardStats {
  total_cost_usd: number;
  cost_change_percent: number;
  total_tokens: number;
  token_change_percent: number;
  active_sessions: number;
  plans_completed_today: number;
}
