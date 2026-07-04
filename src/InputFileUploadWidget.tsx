import React, { useState, useRef } from 'react';
import type { WidgetProps } from '@rjsf/utils';

interface IFileUploadEntry {
  name: string;
  content: string;
}

function extractInputKey(id: string): string | null {
  const parts = id.split('_');
  const inputsIdx = parts.indexOf('inputs');
  if (inputsIdx === -1 || inputsIdx + 1 >= parts.length) {
    return null;
  }
  return parts[inputsIdx + 1];
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

function InputFileUploadWidget(props: WidgetProps): JSX.Element {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    registry
  } = props;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const registerFileUpload = (registry.formContext as any)
    ?.registerFileUpload as
    | ((key: string, entry: IFileUploadEntry) => void)
    | undefined;

  const inputKey = extractInputKey(id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      if (inputKey && registerFileUpload) {
        registerFileUpload(inputKey, { name: file.name, content: base64 });
      }
      onChange(file.name);
      onBlur(id, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange(undefined);
    onBlur(id, '');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur(id, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus(id, e.target.value);
  };

  return (
    <div className="jp-wb-file-upload-wrapper">
      <input
        id={id}
        type="text"
        className="form-control jp-wb-file-upload-input"
        value={value ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={e => {
          onChange(e.target.value === '' ? undefined : e.target.value);
        }}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="No file selected"
        readOnly
      />
      <input
        ref={fileInputRef}
        type="file"
        className="jp-wb-file-upload-hidden"
        onChange={handleFileChange}
        disabled={disabled || readonly || uploading}
      />
      <button
        type="button"
        className="jp-wb-asset-select-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || readonly || uploading}
        aria-label="Upload file"
        title="Upload file"
      >
        {uploading ? (
          '…'
        ) : (
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
            <path d="M8 11V3" />
            <path d="M5 6l3-3 3 3" />
            <path d="M3 13h10" />
          </svg>
        )}
      </button>
      {value && !disabled && !readonly && (
        <button
          type="button"
          className="jp-wb-file-upload-clear"
          onClick={handleClear}
          aria-label="Remove file"
          title="Remove file"
        >
          ×
        </button>
      )}
      {error && <div className="jp-wb-file-upload-error">{error}</div>}
    </div>
  );
}

export default InputFileUploadWidget;
