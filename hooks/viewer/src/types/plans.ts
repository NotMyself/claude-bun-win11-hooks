export interface Feature {
  id: string;
  title: string;
  layer: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;  // seconds
  error?: string;
}

export interface Plan {
  name: string;
  path: string;
  status: 'active' | 'completed' | 'failed';
  features: Feature[];
  featureCount: number;
  completedCount: number;
  inProgressCount: number;
  failedCount: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  eta?: number;  // estimated minutes remaining
  prUrl?: string;
  sessionId: string;
}

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
