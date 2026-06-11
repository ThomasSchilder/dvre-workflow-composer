import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';

/**
 * Components
 */
import { WorkflowSchema } from './WorkflowSchema';

/**
 * React component for a counter.
 *
 * @returns The React component
 */
const WorkflowComponent = (): JSX.Element => {
  return (
    <div className="jp-wb-form-container">
      <WorkflowSchema></WorkflowSchema>
    </div>
  );
};

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class WorkflowComposer extends ReactWidget {
  constructor() {
    super();
    this.addClass('jp-wb-base');
  }

  render(): JSX.Element {
    return <WorkflowComponent />;
  }
}
