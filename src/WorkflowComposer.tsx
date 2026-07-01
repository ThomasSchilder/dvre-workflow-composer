import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';

import { WorkflowSchema } from './WorkflowSchema';
import { IWorkflowSettings, SettingsProvider } from './SettingsContext';

interface IWorkflowComponentProps {
  settings: IWorkflowSettings;
}

const WorkflowComponent = ({
  settings
}: IWorkflowComponentProps): JSX.Element => {
  return (
    <SettingsProvider value={settings}>
      <div className="jp-wb-form-container">
        <WorkflowSchema></WorkflowSchema>
      </div>
    </SettingsProvider>
  );
};

export class WorkflowComposer extends ReactWidget {
  private _settings: IWorkflowSettings;

  constructor(settings: IWorkflowSettings) {
    super();
    this._settings = settings;
    this.addClass('jp-wb-base');
  }

  updateSettings(settings: IWorkflowSettings): void {
    this._settings = settings;
    this.update();
  }

  render(): JSX.Element {
    return <WorkflowComponent settings={this._settings} />;
  }
}
