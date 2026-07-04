import { useState, useCallback, useEffect, useRef } from 'react';

interface IWorkflowEvent {
  event: string;
  data: any;
  timestamp: string;
}

interface IRun {
  id: string;
  name: string;
  startedAt: string;
  status: 'deploying' | 'running' | 'completed';
  events: IWorkflowEvent[];
}

const STORAGE_KEY = 'dvre-workflow-runs';
const MAX_RUNS = 50;

const TERMINAL_EVENTS = new Set(['workflow.succeeded', 'workflow.failed']);

const RUNNING_EVENTS = new Set([
  'workflow.running',
  'task.running',
  'volume.bound'
]);

const ALL_EVENT_TYPES = [
  'connected',
  'workflow.deploying',
  'workflow.running',
  'task.succeeded',
  'task.failed',
  'task.running',
  'task.inputs.pushed',
  'service.running',
  'service.failed',
  'service.stopped',
  'volume.bound',
  'volume.failed',
  'workflow.succeeded',
  'workflow.failed',
  'tier.advanced',
  'task.outputs.collected',
  'workflow.outputs.ready'
];

function loadRuns(): Record<string, IRun> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Record<string, IRun>;
  } catch {
    return {};
  }
}

function saveRuns(runs: Record<string, IRun>): void {
  try {
    const ids = Object.keys(runs).sort(
      (a, b) =>
        new Date(runs[b].startedAt).getTime() -
        new Date(runs[a].startedAt).getTime()
    );
    const trimmed: Record<string, IRun> = {};
    for (const id of ids.slice(0, MAX_RUNS)) {
      trimmed[id] = runs[id];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function useEventStream(schedulerUrl: string): {
  runs: Record<string, IRun>;
  startListening: (workflowId: string, name: string) => void;
  clearRuns: () => void;
} {
  const [runs, setRuns] = useState<Record<string, IRun>>({});
  const eventSourceRef = useRef<Record<string, EventSource>>({});

  useEffect(() => {
    setRuns(loadRuns());
  }, []);

  const updateRun = useCallback((id: string, updater: (run: IRun) => IRun) => {
    setRuns(prev => {
      const current = prev[id];
      if (!current) {
        return prev;
      }
      const updated = updater(current);
      const next = { ...prev, [id]: updated };
      saveRuns(next);
      return next;
    });
  }, []);

  const startListening = useCallback(
    (workflowId: string, name: string) => {
      const nowIso = new Date().toISOString();
      const run: IRun = {
        id: workflowId,
        name,
        startedAt: nowIso,
        status: 'deploying',
        events: []
      };

      setRuns(prev => {
        const next = { ...prev, [workflowId]: run };
        saveRuns(next);
        return next;
      });

      const url = `${schedulerUrl}/api/v1/workflows/${workflowId}/events/stream`;
      const es = new EventSource(url);
      eventSourceRef.current[workflowId] = es;

      const handleEvent = (eventType: string) => {
        return (e: MessageEvent) => {
          let data: any = {};
          try {
            data = JSON.parse(e.data);
          } catch {
            data = { raw: e.data };
          }

          const event: IWorkflowEvent = {
            event: eventType,
            data,
            timestamp: data.timestamp || new Date().toISOString()
          };

          updateRun(workflowId, run => ({
            ...run,
            events: [...run.events, event]
          }));

          if (RUNNING_EVENTS.has(eventType)) {
            updateRun(workflowId, run => ({
              ...run,
              status: run.status === 'deploying' ? 'running' : run.status
            }));
          }

          if (TERMINAL_EVENTS.has(eventType)) {
            updateRun(workflowId, run => ({
              ...run,
              status: 'completed'
            }));
            es.close();
            delete eventSourceRef.current[workflowId];
          }
        };
      };

      for (const eventType of ALL_EVENT_TYPES) {
        es.addEventListener(eventType, handleEvent(eventType) as EventListener);
      }

      es.onerror = () => {
        updateRun(workflowId, run => {
          if (run.status === 'running') {
            return { ...run, status: 'completed' };
          }
          return run;
        });
        es.close();
        delete eventSourceRef.current[workflowId];
      };
    },
    [schedulerUrl, updateRun]
  );

  const clearRuns = useCallback(() => {
    for (const id of Object.keys(eventSourceRef.current)) {
      eventSourceRef.current[id].close();
      delete eventSourceRef.current[id];
    }
    setRuns({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const id of Object.keys(eventSourceRef.current)) {
        eventSourceRef.current[id].close();
        delete eventSourceRef.current[id];
      }
    };
  }, []);

  return { runs, startListening, clearRuns };
}

export { useEventStream };
export type { IRun, IWorkflowEvent };
