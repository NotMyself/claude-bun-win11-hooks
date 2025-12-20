interface ToolUsageChartProps {
  toolUsage: Record<string, number>;
}

export function ToolUsageChart({ toolUsage }: ToolUsageChartProps) {
  const sortedTools = Object.entries(toolUsage)
    .sort(([, a], [, b]) => b - a);

  if (sortedTools.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No tool usage data
      </div>
    );
  }

  const maxCount = Math.max(...sortedTools.map(([, count]) => count));

  return (
    <div className="space-y-2">
      {sortedTools.map(([tool, count]) => (
        <div key={tool} className="flex items-center gap-2">
          <div className="w-32 text-sm text-muted-foreground truncate" title={tool}>
            {tool}
          </div>
          <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-[#D4A27F] transition-all duration-300"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm text-right font-medium">
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}
