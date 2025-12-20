import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Plan } from '@/types/plans';

interface PlanCardCompactProps {
  plan: Plan;
  onClick?: () => void;
}

export function PlanCardCompact({ plan, onClick }: PlanCardCompactProps) {
  const progress = (plan.completedCount / plan.featureCount) * 100;

  return (
    <div
      className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <Badge
        variant={plan.status === 'active' ? 'default' :
                 plan.status === 'completed' ? 'secondary' : 'destructive'}
        className="w-20 justify-center"
      >
        {plan.status}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{plan.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {plan.completedCount}/{plan.featureCount}
          </span>
        </div>
      </div>
    </div>
  );
}
