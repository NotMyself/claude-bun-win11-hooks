import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SessionList, SessionDetail } from '@/components/sessions';
import { useSessions } from '@/hooks/use-sessions';
import type { Session } from '@/types/sessions';

export function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');

  const { sessions, loading } = useSessions();

  // Get unique models for filter dropdown
  const models = useMemo(() => {
    const uniqueModels = new Set(sessions.map(s => s.model));
    return ['all', ...Array.from(uniqueModels)];
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.project_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModel = modelFilter === 'all' || session.model === modelFilter;
      return matchesSearch && matchesModel;
    });
  }, [sessions, searchQuery, modelFilter]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by model" />
          </SelectTrigger>
          <SelectContent>
            {models.map(model => (
              <SelectItem key={model} value={model}>
                {model === 'all' ? 'All Models' : model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Split panel */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        <div className="col-span-1">
          <SessionList
            sessions={filteredSessions}
            selectedSessionId={selectedSession?.session_id ?? null}
            onSelect={setSelectedSession}
            loading={loading}
          />
        </div>
        <div className="col-span-2">
          {selectedSession ? (
            <SessionDetail session={selectedSession} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a session to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
