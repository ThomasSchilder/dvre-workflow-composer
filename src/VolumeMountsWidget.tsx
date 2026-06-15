import React, { useCallback } from 'react';
import type { FieldProps } from '@rjsf/utils';

interface IMountEntry {
  volumeName: string;
  mountPath: string;
}

function VolumeMountsField(props: FieldProps): JSX.Element {
  const { formData, onChange, disabled, readonly, id, registry } = props;
  const rootFormData = (registry.formContext as any)?.rootFormData || {};
  const volumes: Record<string, any> = rootFormData.volumes || {};
  const volumeNames = Object.keys(volumes);

  const mounts: IMountEntry[] = Object.keys(formData || {}).map(key => ({
    volumeName: key,
    mountPath: (formData as Record<string, string>)[key] || ''
  }));

  const usedNames = new Set(mounts.map(m => m.volumeName));
  const availableNames = volumeNames.filter(n => !usedNames.has(n));

  const updateMounts = useCallback(
    (updated: IMountEntry[]) => {
      const newObj: Record<string, string> = {};
      for (const entry of updated) {
        if (entry.volumeName) {
          newObj[entry.volumeName] = entry.mountPath;
        }
      }
      onChange(newObj as any, []);
    },
    [onChange]
  );

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...mounts];
    updated[index] = { ...updated[index], volumeName: newName };
    updateMounts(updated);
  };

  const handlePathChange = (index: number, newPath: string) => {
    const updated = [...mounts];
    updated[index] = { ...updated[index], mountPath: newPath };
    updateMounts(updated);
  };

  const handleRemove = (index: number) => {
    const updated = mounts.filter((_, i) => i !== index);
    updateMounts(updated);
  };

  const handleAdd = () => {
    if (availableNames.length === 0) return;
    const updated = [
      ...mounts,
      { volumeName: availableNames[0], mountPath: '' }
    ];
    updateMounts(updated);
  };

  return (
    <div className="jp-wb-volume-mounts-field" id={id}>
      {mounts.map((entry, index) => {
        const nameOptions = volumeNames.filter(
          n => n === entry.volumeName || !usedNames.has(n)
        );
        return (
          <div className="jp-wb-volume-mount-row" key={index}>
            <div className="jp-wb-volume-mount-key">
              <select
                className="form-control jp-wb-dynamic-select"
                value={entry.volumeName}
                disabled={disabled || readonly}
                onChange={e => handleNameChange(index, e.target.value)}
              >
                <option value="">Select volume...</option>
                {nameOptions.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="jp-wb-volume-mount-value">
              <input
                className="form-control"
                type="text"
                value={entry.mountPath}
                placeholder="/mount/path"
                disabled={disabled || readonly}
                onChange={e => handlePathChange(index, e.target.value)}
              />
            </div>
            <div className="jp-wb-volume-mount-remove">
              <button
                type="button"
                className="jp-wb-array-remove-btn"
                disabled={disabled || readonly}
                onClick={() => handleRemove(index)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      {availableNames.length > 0 && (
        <button
          type="button"
          className="rjsf-object-property-expand"
          disabled={disabled || readonly}
          onClick={handleAdd}
        >
          + Add volume mount
        </button>
      )}
    </div>
  );
}

export default VolumeMountsField;
