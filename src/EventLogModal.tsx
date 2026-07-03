import React, { useState } from 'react';
import type { IRun } from './useEventStream';

interface IEventLogModalProps {
  run: IRun;
  schedulerUrl: string;
  onClose: () => void;
}

interface ITreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: ITreeNode[];
}

const HARDCODED_OUTPUT_FILES = [
  'write.hello-world/result',
  'reverse.reverse-content/result',
  'analysis.compute/result',
  'analysis.compute/stats.json',
  'analysis.compute/subdir/extra.txt'
];

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return ts;
  }
}

function buildTree(paths: string[]): ITreeNode[] {
  const root: ITreeNode = { name: '', path: '', isFolder: true, children: [] };

  for (const p of paths) {
    const parts = p.split('/');
    let current = root;
    let accumulated = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFolder = i < parts.length - 1;

      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: accumulated,
          isFolder,
          children: []
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  function sortTree(node: ITreeNode) {
    node.children.sort((a, b) => {
      if (a.isFolder !== b.isFolder) {
        return a.isFolder ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (const child of node.children) {
      sortTree(child);
    }
  }

  sortTree(root);
  return root.children;
}

const FolderIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="jp-wb-feedback-tree-icon"
  >
    <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
  </svg>
);

const FileIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="jp-wb-feedback-tree-icon"
  >
    <path d="M9.5 1H3.75A1.75 1.75 0 002 2.75v10.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25V5.5L9.5 1z" />
    <path
      d="M9.5 1v4a.5.5 0 00.5.5h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

const ChevronIcon: React.FC<{ open: boolean }> = ({
  open
}: {
  open: boolean;
}) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`jp-wb-feedback-chevron${open ? ' jp-wb-feedback-chevron-open' : ''}`}
  >
    <polyline points="3,1 7,5 3,9" />
  </svg>
);

const TreeView: React.FC<{ nodes: ITreeNode[] }> = ({
  nodes
}: {
  nodes: ITreeNode[];
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: ITreeNode, depth: number): React.ReactNode => {
    const indent = depth * 20;
    if (node.isFolder) {
      const isOpen = expanded.has(node.path);
      return (
        <div key={node.path}>
          <div
            className="jp-wb-feedback-tree-folder"
            style={{ paddingLeft: `${indent + 4}px` }}
            onClick={() => toggle(node.path)}
          >
            <span className="jp-wb-feedback-chevron-wrap">
              <ChevronIcon open={isOpen} />
            </span>
            <FolderIcon />
            <span className="jp-wb-feedback-tree-label">{node.name}</span>
          </div>
          {isOpen && node.children.map(child => renderNode(child, depth + 1))}
        </div>
      );
    }
    return (
      <div
        key={node.path}
        className="jp-wb-feedback-tree-file"
        style={{ paddingLeft: `${indent + 18}px` }}
      >
        <FileIcon />
        <span className="jp-wb-feedback-tree-label">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="jp-wb-feedback-tree">
      {nodes.map(n => renderNode(n, 0))}
    </div>
  );
};

const EventLogModal: React.FC<IEventLogModalProps> = ({
  run,
  schedulerUrl,
  onClose
}: IEventLogModalProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'output'>('logs');

  const toggleRow = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleDownload = async () => {
    const token = localStorage.getItem('dvre-auth-token');
    setDownloading(true);
    try {
      const response = await fetch(
        `${schedulerUrl}/api/v1/workflows/${run.id}/outputs`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      if (!response.ok) {
        alert('Failed to download outputs');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${run.id}-outputs.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        'Download failed: ' + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setDownloading(false);
    }
  };

  const tree = buildTree(HARDCODED_OUTPUT_FILES);

  return (
    <div
      className="jp-wb-feedback-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="jp-wb-feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="jp-wb-feedback-modal-header">
          <h2>Event Log — {run.name}</h2>
          <span className="jp-wb-feedback-modal-id">{run.id}</span>
          <span
            className={`jp-wb-feedback-modal-status jp-wb-feedback-status-${run.status}`}
          >
            {run.status}
          </span>
          <button
            type="button"
            className="jp-wb-feedback-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="jp-wb-feedback-tab-toolbar">
          <button
            type="button"
            className={`jp-wb-feedback-tab${activeTab === 'logs' ? ' jp-wb-feedback-tab-active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
          <button
            type="button"
            className={`jp-wb-feedback-tab${activeTab === 'output' ? ' jp-wb-feedback-tab-active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
        </div>
        <div className="jp-wb-feedback-modal-body">
          {activeTab === 'logs' && (
            <>
              {run.events.length === 0 ? (
                <div className="jp-wb-feedback-modal-empty">
                  No events received yet.
                </div>
              ) : (
                <table className="jp-wb-feedback-event-table">
                  <thead>
                    <tr>
                      <th className="jp-wb-feedback-col-time">Time</th>
                      <th className="jp-wb-feedback-col-event">Event</th>
                      <th className="jp-wb-feedback-col-details">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.events.map((evt, i) => {
                      const expanded = expandedRows.has(i);
                      const detailsStr = JSON.stringify(evt.data, null, 2);
                      return (
                        <tr
                          key={i}
                          className={`jp-wb-feedback-event-row${expanded ? ' jp-wb-feedback-event-expanded' : ''}`}
                          onClick={() => toggleRow(i)}
                        >
                          <td className="jp-wb-feedback-cell-time">
                            {formatTimestamp(evt.timestamp)}
                          </td>
                          <td className="jp-wb-feedback-cell-event">
                            {evt.event}
                          </td>
                          <td
                            className={`jp-wb-feedback-cell-details${expanded ? ' jp-wb-feedback-cell-expanded' : ''}`}
                          >
                            {detailsStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
          {activeTab === 'output' && (
            <div className="jp-wb-feedback-output-panel">
              <div className="jp-wb-feedback-output-toolbar">
                <button
                  type="button"
                  className="jp-wb-feedback-download-btn"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? 'Downloading...' : 'Download .zip'}
                </button>
              </div>
              <div className="jp-wb-feedback-output-tree-wrap">
                <TreeView nodes={tree} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { EventLogModal };
export default EventLogModal;
