import React, { useState } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { useSettings } from './SettingsContext';
import AssetBrowserModal from './AssetBrowserModal';

function AssetSelectWidget(props: WidgetProps): JSX.Element {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    options
  } = props;

  const settings = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const assetType = (options as any).assetType as number;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === '' ? undefined : Number(val));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur(id, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus(id, e.target.value);
  };

  const handleSelect = (assetId: number) => {
    onChange(assetId);
  };

  return (
    <div className="jp-wb-asset-select-wrapper">
      <input
        id={id}
        type="number"
        className="form-control jp-wb-asset-select-input"
        value={value ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="Asset ID"
      />
      <button
        type="button"
        className="jp-wb-asset-select-btn"
        onClick={() => setModalOpen(true)}
        disabled={disabled || readonly}
        aria-label="Browse assets"
        title="Browse assets"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="7" cy="7" r="5" />
          <line x1="11" y1="11" x2="15" y2="15" />
        </svg>
      </button>
      {modalOpen && (
        <AssetBrowserModal
          assetIndexerUrl={settings.assetIndexerUrl}
          assetType={assetType}
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default AssetSelectWidget;
