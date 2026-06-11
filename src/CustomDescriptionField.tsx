import React, { useRef, useState, useEffect } from 'react';
import type { DescriptionFieldProps } from '@rjsf/utils';

function CustomDescriptionField({
  id,
  description
}: DescriptionFieldProps): JSX.Element | null {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
    }
  }, [description]);

  if (!description || typeof description !== 'string') {
    return null;
  }

  return (
    <div id={id} className="jp-wb-description">
      <span className="jp-wb-description-text" ref={textRef}>
        {description}
      </span>
      {isOverflowing && (
        <span className="jp-wb-description-tooltip-wrapper">
          <span className="jp-wb-description-icon">?</span>
          <span className="jp-wb-description-tooltip">{description}</span>
        </span>
      )}
    </div>
  );
}

export default CustomDescriptionField;
