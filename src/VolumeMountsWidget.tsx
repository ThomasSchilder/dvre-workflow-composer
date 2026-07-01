import React, { useCallback, useState, useEffect, useRef } from 'react';
import type { FieldProps } from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';
import CustomAddButton from './CustomAddButton';

interface IMountEntry {
  volumeName: string;
  mountPath: string;
}

function VolumeMountsField(props: FieldProps): JSX.Element {
  const {
    schema,
    formData,
    onChange,
    disabled,
    readonly,
    id,
    registry,
    uiSchema,
    fieldPathId
  } = props;
  const rootFormData = (registry.formContext as any)?.rootFormData || {};
  const volumes: Record<string, any> = rootFormData.volumes || {};
  const volumeNames = Object.keys(volumes);

  const [mounts, setMounts] = useState<IMountEntry[]>(() =>
    Object.keys(formData || {}).map(key => ({
      volumeName: key,
      mountPath: (formData as Record<string, string>)[key] || ''
    }))
  );

  const prevFormDataRef = useRef(formData);
  useEffect(() => {
    const prevStr = JSON.stringify(prevFormDataRef.current || {});
    const currStr = JSON.stringify(formData || {});
    if (prevStr !== currStr) {
      setMounts(
        Object.keys(formData || {}).map(key => ({
          volumeName: key,
          mountPath: (formData as Record<string, string>)[key] || ''
        }))
      );
      prevFormDataRef.current = formData;
    }
  }, [formData]);

  const usedNames = new Set(
    mounts.filter(m => m.volumeName).map(m => m.volumeName)
  );

  const syncToFormData = useCallback(
    (updated: IMountEntry[]) => {
      const newObj: Record<string, string> = {};
      for (const entry of updated) {
        if (entry.volumeName) {
          newObj[entry.volumeName] = entry.mountPath;
        }
      }
      prevFormDataRef.current = newObj as any;
      onChange(newObj as any, fieldPathId.path);
    },
    [onChange]
  );

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...mounts];
    updated[index] = { ...updated[index], volumeName: newName };
    setMounts(updated);
    syncToFormData(updated);
  };

  const handlePathChange = (index: number, newPath: string) => {
    const updated = [...mounts];
    updated[index] = { ...updated[index], mountPath: newPath };
    setMounts(updated);
    syncToFormData(updated);
  };

  const handleRemove = (index: number) => {
    const updated = mounts.filter((_, i) => i !== index);
    setMounts(updated);
    syncToFormData(updated);
  };

  const handleAdd = () => {
    const updated = [...mounts, { volumeName: '', mountPath: '' }];
    setMounts(updated);
    syncToFormData(updated);
  };

  const options = getUiOptions(uiSchema);
  const DescriptionFieldTemplate = getTemplate(
    'DescriptionFieldTemplate',
    registry,
    options
  );

  return (
    <div className="jp-wb-volume-mounts-field" id={id}>
      {schema.description && (
        <DescriptionFieldTemplate
          id={`${id}__description`}
          description={schema.description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
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
      <div className="array-item-add">
        <CustomAddButton
          className="rjsf-object-property-expand"
          onClick={handleAdd}
          disabled={disabled || readonly}
          uiSchema={uiSchema}
          registry={registry}
        />
      </div>
    </div>
  );
}

export default VolumeMountsField;
