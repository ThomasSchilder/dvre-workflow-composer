import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the dvre-workflow-composer extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'dvre-workflow-composer:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension dvre-workflow-composer is activated!');
  }
};

export default plugin;
