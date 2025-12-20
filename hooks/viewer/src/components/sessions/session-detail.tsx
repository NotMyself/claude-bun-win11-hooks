import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Session } from '@/types/sessions';
import { formatDuration, formatCost, formatTokens } from '@/lib/utils';
import { ToolUsageChart } from './tool-usage-chart';

interface SessionDetailProps {
  session: Session | null;
}

export function SessionDetail({ session }: SessionDetailProps) {
  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Select a session to view details
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Session Details</CardTitle>
            <Badge variant={session.ended_at ? "secondary" : "default"}>
              {session.ended_at ? "Completed" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Project Name</div>
              <div className="font-medium">{session.project_name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Model</div>
              <div className="font-medium">{session.model}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Project Path</div>
            <div className="text-sm font-mono truncate" title={session.project_path}>
              {session.project_path}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Session ID</div>
            <div className="text-sm font-mono truncate" title={session.session_id}>
              {session.session_id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Started</div>
              <div className="text-sm">{new Date(session.started_at).toLocaleString()}</div>
            </div>
            {session.ended_at && (
              <div>
                <div className="text-sm text-muted-foreground">Ended</div>
                <div className="text-sm">{new Date(session.ended_at).toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{formatDuration(session.duration)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Tokens</div>
              <div className="font-medium">{formatTokens(session.total_tokens)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cost</div>
              <div className="font-medium">{formatCost(session.cost_usd)}</div>
            </div>
          </div>

          {session.summary && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Summary</div>
              <div className="text-sm bg-muted p-3 rounded-md">
                {session.summary}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tool Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ToolUsageChart toolUsage={session.tool_usage} />
        </CardContent>
      </Card>
    </div>
  );
}
