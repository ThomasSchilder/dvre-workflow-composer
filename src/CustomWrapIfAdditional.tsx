import React, { useState, useCallback } from 'react';
import type { WrapIfAdditionalTemplateProps } from '@rjsf/utils';
import { ADDITIONAL_PROPERTY_FLAG } from '@rjsf/utils';

function CustomWrapIfAdditional({
  id,
  classNames,
  style,
  disabled,
  label,
  onKeyRenameBlur,
  onRemoveProperty,
  readonly,
  schema,
  uiSchema,
  registry,
  children
}: WrapIfAdditionalTemplateProps): JSX.Element {
  const { templates } = registry;
  const { RemoveButton } = templates.ButtonTemplates;
  const additional = ADDITIONAL_PROPERTY_FLAG in schema;

  const addLabel =
    (uiSchema &&
      uiSchema['ui:options'] &&
      (uiSchema['ui:options'] as any).addLabel) ||
    'item';

  const [keyValue, setKeyValue] = useState(
    label && label !== 'newKey' ? (label as string) : ''
  );
  const displayTitle = keyValue ? keyValue : `New ${addLabel}`;

  const handleKeyBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const newKey = event.target.value;
      if (newKey && newKey !== label) {
        setKeyValue(newKey);
        onKeyRenameBlur(event);
      }
    },
    [label, onKeyRenameBlur]
  );

  const handleKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyValue(event.target.value);
    },
    []
  );

  if (!additional) {
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    );
  }

  const classNamesList = ['form-group', classNames].filter(Boolean).join(' ');

  const schemaType = schema.type;
  const isSimpleType =
    schemaType === 'string' ||
    schemaType === 'integer' ||
    schemaType === 'number' ||
    schemaType === 'boolean';

  if (isSimpleType) {
    return (
      <div className={`${classNamesList} jp-wb-key-value-row`}>
        <div className="jp-wb-key-value-key">
          <input
            className="form-control jp-wb-key-input"
            type="text"
            id={`${id}-key`}
            onBlur={handleKeyBlur}
            onChange={handleKeyChange}
            placeholder={label && label !== 'newKey' ? label : 'Key'}
            disabled={disabled || readonly}
          />
        </div>
        <div className="jp-wb-key-value-value">{children}</div>
        <div className="jp-wb-key-value-remove">
          <RemoveButton
            id={`${id}-remove`}
            className="rjsf-object-property-remove"
            style={{ border: '0' }}
            disabled={disabled || readonly}
            onClick={onRemoveProperty}
            uiSchema={uiSchema}
            registry={registry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${classNamesList} jp-wb-additional-card`}>
      <div className="jp-wb-additional-card-header">
        <h4 className="jp-wb-additional-card-title">{displayTitle}</h4>
        <RemoveButton
          id={`${id}-remove`}
          className="rjsf-object-property-remove"
          style={{ border: '0' }}
          disabled={disabled || readonly}
          onClick={onRemoveProperty}
          uiSchema={uiSchema}
          registry={registry}
        />
      </div>
      <div className="jp-wb-additional-name-field">
        <label className="control-label" htmlFor={`${id}-key`}>
          Name
        </label>
        <input
          className="form-control jp-wb-name-input"
          type="text"
          id={`${id}-key`}
          onBlur={handleKeyBlur}
          onChange={handleKeyChange}
          placeholder={
            label && label !== 'newKey'
              ? `Enter ${addLabel} name...`
              : `New ${addLabel} name`
          }
          disabled={disabled || readonly}
        />
      </div>
      <div className="jp-wb-additional-content">{children}</div>
    </div>
  );
}

export default CustomWrapIfAdditional;
