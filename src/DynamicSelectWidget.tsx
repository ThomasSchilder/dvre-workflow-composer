import React, { useMemo } from 'react';
import type { WidgetProps } from '@rjsf/utils';

function DynamicSelectWidget(props: WidgetProps): JSX.Element {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    options,
    registry
  } = props;

  const sourcePath = (options as any).sourcePath || '';
  const placeholder = (options as any).placeholder || 'Select...';
  const rootFormData = (registry.formContext as any)?.rootFormData || {};
  const items: Record<string, any> = sourcePath
    ? rootFormData[sourcePath] || {}
    : {};

  const enumOptions = useMemo(
    () =>
      Object.keys(items).map(key => ({
        value: key,
        label: key
      })),
    [items]
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value || undefined);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    onBlur(id, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    onFocus(id, e.target.value);
  };

  return (
    <select
      id={id}
      className="form-control jp-wb-dynamic-select"
      value={value || ''}
      required={required}
      disabled={disabled || readonly}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      <option value="">{placeholder}</option>
      {enumOptions.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default DynamicSelectWidget;
