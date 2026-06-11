import React from 'react';
import type { IconButtonProps } from '@rjsf/utils';

function CustomAddButton({
  id,
  className,
  onClick,
  disabled,
  uiSchema
}: IconButtonProps): JSX.Element {
  const addLabel =
    (uiSchema && uiSchema['ui:options'] && uiSchema['ui:options']!.addLabel) ||
    'item';
  return (
    <button
      id={id}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      + Add {addLabel as string}
    </button>
  );
}

export default CustomAddButton;
