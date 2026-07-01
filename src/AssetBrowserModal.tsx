import React, { useState, useEffect, useCallback, useRef } from 'react';

const ASSET_TYPE_MAP: Record<number, string> = {
  0: 'DATASET',
  1: 'MODEL',
  2: 'FUNCTION',
  3: 'VM',
  4: 'CLUSTER'
};

const PROTOCOL_MAP: Record<number, string> = {
  0: 'http',
  1: 'ftp',
  2: 's3'
};

export interface IAsset {
  asset_id: number;
  asset_type: number;
  owner: string;
  name: string;
  url: string;
  protocol: number;
  metadata: string;
  created_block: number;
  policy_address?: string | null;
  status?: number;
}

interface IAssetListResponse {
  total: number;
  limit: number;
  offset: number;
  data: IAsset[];
}

interface IAssetBrowserModalProps {
  assetIndexerUrl: string;
  assetType: number;
  onSelect: (assetId: number) => void;
  onClose: () => void;
}

const PAGE_SIZE = 50;
const MAX_PREVIEW_LINES = 20;

function truncate(str: string, maxLen: number): string {
  if (!str) return '—';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

function formatMetadata(metadata: string): string {
  if (!metadata) return '(no metadata)';
  try {
    const parsed = JSON.parse(metadata);
    const pretty = JSON.stringify(parsed, null, 2);
    const lines = pretty.split('\n');
    if (lines.length <= MAX_PREVIEW_LINES) {
      return pretty;
    }
    return lines.slice(0, MAX_PREVIEW_LINES).join('\n') + '\n…';
  } catch {
    return metadata;
  }
}

const AssetBrowserModal: React.FC<IAssetBrowserModalProps> = ({
  assetIndexerUrl,
  assetType,
  onSelect,
  onClose
}) => {
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAssets = useCallback(
    async (search: string, pageOffset: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('asset_type', String(assetType));
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String(pageOffset));
        if (search) {
          params.set('name', search);
        }
        const url = `${assetIndexerUrl}/api/assets?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const json: IAssetListResponse = await res.json();
        setAssets(json.data || []);
        setTotal(json.total || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch assets');
        setAssets([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [assetIndexerUrl, assetType]
  );

  useEffect(() => {
    fetchAssets('', 0);
  }, [fetchAssets]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      setOffset(0);
      fetchAssets(value, 0);
    }, 300);
  };

  const handlePrev = () => {
    const newOffset = Math.max(0, offset - PAGE_SIZE);
    setOffset(newOffset);
    fetchAssets(searchName, newOffset);
  };

  const handleNext = () => {
    const newOffset = offset + PAGE_SIZE;
    if (newOffset < total) {
      setOffset(newOffset);
      fetchAssets(searchName, newOffset);
    }
  };

  const handleRowClick = (asset: IAsset) => {
    setSelectedAsset(asset);
  };

  const handleSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.asset_id);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <div className="jp-wb-asset-modal-overlay" onClick={handleBackdropClick}>
      <div className="jp-wb-asset-modal">
        <div className="jp-wb-asset-modal-header">
          <h2>Asset Browser</h2>
          <span className="jp-wb-asset-modal-type">
            {ASSET_TYPE_MAP[assetType] || `Type ${assetType}`}
          </span>
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
                placeholder="Search by name..."
                value={searchName}
                onChange={handleSearchChange}
                className="jp-wb-asset-search-input"
              />
            </div>
            {loading && (
              <div className="jp-wb-asset-loading">Loading assets…</div>
            )}
            {error && <div className="jp-wb-asset-error">Error: {error}</div>}
            {!loading && !error && assets.length === 0 && (
              <div className="jp-wb-asset-empty">No assets found.</div>
            )}
            {!loading && !error && assets.length > 0 && (
              <>
                <div className="jp-wb-asset-table-wrap">
                  <table className="jp-wb-asset-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Owner</th>
                        <th>Protocol</th>
                        <th>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map(asset => (
                        <tr
                          key={asset.asset_id}
                          className={
                            selectedAsset?.asset_id === asset.asset_id
                              ? 'jp-wb-asset-row-selected'
                              : ''
                          }
                          onClick={() => handleRowClick(asset)}
                        >
                          <td>{asset.asset_id}</td>
                          <td>{asset.name}</td>
                          <td>
                            {ASSET_TYPE_MAP[asset.asset_type] ||
                              asset.asset_type}
                          </td>
                          <td>{truncate(asset.owner, 12)}</td>
                          <td>
                            {PROTOCOL_MAP[asset.protocol] || asset.protocol}
                          </td>
                          <td>{truncate(asset.url, 30)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="jp-wb-asset-pagination">
                  <button
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="jp-wb-asset-page-btn"
                  >
                    ← Prev
                  </button>
                  <span className="jp-wb-asset-page-info">
                    Page {currentPage} of {totalPages} ({total} assets)
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="jp-wb-asset-page-btn"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="jp-wb-asset-detail-panel">
            <div className="jp-wb-asset-detail-header">Metadata Preview</div>
            {selectedAsset ? (
              <>
                <div className="jp-wb-asset-detail-meta">
                  <div>
                    <span className="jp-wb-asset-detail-label">ID:</span>{' '}
                    {selectedAsset.asset_id}
                  </div>
                  <div>
                    <span className="jp-wb-asset-detail-label">Name:</span>{' '}
                    {selectedAsset.name}
                  </div>
                  <div>
                    <span className="jp-wb-asset-detail-label">Owner:</span>{' '}
                    {truncate(selectedAsset.owner, 20)}
                  </div>
                  <div>
                    <span className="jp-wb-asset-detail-label">URL:</span>{' '}
                    {selectedAsset.url}
                  </div>
                  <div>
                    <span className="jp-wb-asset-detail-label">Protocol:</span>{' '}
                    {PROTOCOL_MAP[selectedAsset.protocol] ||
                      selectedAsset.protocol}
                  </div>
                  {selectedAsset.policy_address && (
                    <div>
                      <span className="jp-wb-asset-detail-label">Policy:</span>{' '}
                      {truncate(selectedAsset.policy_address, 20)}
                    </div>
                  )}
                </div>
                <pre className="jp-wb-asset-metadata-preview">
                  {formatMetadata(selectedAsset.metadata)}
                </pre>
              </>
            ) : (
              <div className="jp-wb-asset-detail-empty">
                Select an asset to preview its metadata.
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
            disabled={!selectedAsset}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetBrowserModal;
