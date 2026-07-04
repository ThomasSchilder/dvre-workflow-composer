import React, { useState, useMemo } from 'react';

interface IOutputEntry {
  ref: string;
  outputName: string;
  path: string;
  section: string;
  task: string;
}

interface IOutputRefModalProps {
  outputs: IOutputEntry[];
  onSelect: (entry: IOutputEntry) => void;
  onClose: () => void;
}

const OutputRefModal: React.FC<IOutputRefModalProps> = ({
  outputs,
  onSelect,
  onClose
}: IOutputRefModalProps) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) {
      return outputs;
    }
    const lower = search.toLowerCase();
    return outputs.filter(
      e =>
        e.ref.toLowerCase().includes(lower) ||
        e.path.toLowerCase().includes(lower)
    );
  }, [outputs, search]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelect = () => {
    if (selected) {
      const entry = filtered.find(e => e.ref === selected);
      if (entry) {
        onSelect(entry);
        onClose();
      }
    }
  };

  return (
    <div className="jp-wb-asset-modal-overlay" onClick={handleBackdropClick}>
      <div className="jp-wb-asset-modal">
        <div className="jp-wb-asset-modal-header">
          <h2>Select Output</h2>
          <button
            className="jp-wb-asset-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="jp-wb-asset-modal-body">
          <div className="jp-wb-asset-list-panel">
            <div className="jp-wb-asset-search">
              <input
                type="text"
                placeholder="Search outputs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="jp-wb-asset-search-input"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="jp-wb-asset-empty">
                No outputs found. Define outputs on other tasks first.
              </div>
            ) : (
              <div className="jp-wb-asset-table-wrap">
                <table className="jp-wb-asset-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Output</th>
                      <th>Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(entry => (
                      <tr
                        key={entry.ref}
                        className={
                          selected === entry.ref
                            ? 'jp-wb-asset-row-selected'
                            : ''
                        }
                        onClick={() => setSelected(entry.ref)}
                      >
                        <td>{entry.ref}</td>
                        <td>{entry.outputName}</td>
                        <td>{entry.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="jp-wb-asset-modal-footer">
          <button className="jp-wb-asset-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="jp-wb-asset-select-btn-confirm"
            onClick={handleSelect}
            disabled={!selected}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutputRefModal;
export type { IOutputEntry };
