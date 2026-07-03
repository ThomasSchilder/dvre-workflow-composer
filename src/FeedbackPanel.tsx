import React, { useState, useMemo } from 'react';
import type { IRun } from './useEventStream';
import EventLogModal from './EventLogModal';

interface IFeedbackPanelProps {
  runs: Record<string, IRun>;
  onClear: () => void;
  schedulerUrl: string;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return ts;
  }
}

const MagnifierIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="7" cy="7" r="5" />
    <line x1="11" y1="11" x2="14" y2="14" />
  </svg>
);

const FeedbackPanel: React.FC<IFeedbackPanelProps> = ({
  runs,
  onClear,
  schedulerUrl
}: IFeedbackPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedRun, setSelectedRun] = useState<IRun | null>(null);

  const sortedRuns = useMemo(() => {
    return Object.values(runs).sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }, [runs]);

  const runningCount = sortedRuns.filter(r => r.status === 'running').length;

  return (
    <>
      <div
        className={`jp-wb-feedback-panel${collapsed ? ' jp-wb-feedback-collapsed' : ''}`}
      >
        <div className="jp-wb-feedback-panel-header">
          <button
            type="button"
            className="jp-wb-feedback-toggle"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '◀' : '▶'}
          </button>
          {!collapsed && (
            <>
              <span className="jp-wb-feedback-panel-title">
                Workflow Runs
                {runningCount > 0 && (
                  <span className="jp-wb-feedback-running-badge">
                    {runningCount} running
                  </span>
                )}
              </span>
              <button
                type="button"
                className="jp-wb-feedback-clear-btn"
                onClick={onClear}
                disabled={sortedRuns.length === 0}
              >
                Clear
              </button>
            </>
          )}
        </div>
        {!collapsed && (
          <div className="jp-wb-feedback-panel-body">
            {sortedRuns.length === 0 ? (
              <div className="jp-wb-feedback-panel-empty">
                No workflow runs yet. Deploy a workflow to see live events.
              </div>
            ) : (
              sortedRuns.map(run => (
                <div key={run.id} className="jp-wb-feedback-run-item">
                  <div className="jp-wb-feedback-run-info">
                    <span className="jp-wb-feedback-run-name">{run.name}</span>
                    <span className="jp-wb-feedback-run-time">
                      {formatTime(run.startedAt)}
                    </span>
                  </div>
                  <div className="jp-wb-feedback-run-actions">
                    <span
                      className={`jp-wb-feedback-run-status jp-wb-feedback-status-${run.status}`}
                    >
                      {run.status}
                    </span>
                    <button
                      type="button"
                      className="jp-wb-feedback-view-btn"
                      onClick={() => setSelectedRun(run)}
                      aria-label="View event log"
                    >
                      <MagnifierIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {selectedRun && (
        <EventLogModal
          run={selectedRun}
          schedulerUrl={schedulerUrl}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </>
  );
};

export { FeedbackPanel };
export default FeedbackPanel;
