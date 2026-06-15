import React from 'react';
import type { IconButtonProps } from '@rjsf/utils';

function CustomRemoveButton(props: IconButtonProps): JSX.Element {
  const { id, className, onClick, disabled } = props;
  return (
    <button
      id={id}
      className={`${className || ''} jp-wb-array-remove-btn`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      Remove
    </button>
  );
}

export default CustomRemoveButton;
