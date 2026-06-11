import { UiSchema } from '@rjsf/utils';

const uiSchema: UiSchema = {
  apiVersion: {
    'ui:widget': 'hidden'
  },
  metadata: {
    labels: {
      'ui:options': { addLabel: 'label' },
      additionalProperties: {
        'ui:options': { addLabel: 'label' },
        'ui:placeholder': 'Value'
      }
    }
  },
  infrastructure: {
    'ui:options': { addLabel: 'infrastructure target' },
    additionalProperties: {
      'ui:options': {
        addLabel: 'infrastructure target',
        rowGroups: [['source'], ['type', 'endpoint'], ['assetId']]
      }
    }
  },
  volumes: {
    'ui:options': { addLabel: 'volume' },
    additionalProperties: {
      'ui:options': {
        addLabel: 'volume',
        rowGroups: [['size', 'storageClass', 'accessMode']]
      }
    }
  },
  sections: {
    'ui:options': { addLabel: 'section' },
    additionalProperties: {
      'ui:options': {
        addLabel: 'section',
        rowGroups: [['executionMode', 'binding']]
      },
      tasks: {
        'ui:options': { addLabel: 'task' },
        additionalProperties: {
          'ui:options': {
            addLabel: 'task',
            rowGroups: [
              ['image', 'binding'],
              ['command', 'args']
            ]
          }
        }
      },
      services: {
        'ui:options': { addLabel: 'service' },
        additionalProperties: {
          'ui:options': {
            addLabel: 'service',
            rowGroups: [
              ['image', 'binding', 'port'],
              ['command', 'args']
            ]
          }
        }
      },
      volumeMounts: {
        'ui:options': { addLabel: 'volume mount' },
        additionalProperties: {
          'ui:options': { addLabel: 'volume mount' },
          'ui:placeholder': 'Value'
        }
      }
    }
  },
  externalRefs: {
    'ui:options': { addLabel: 'external ref' },
    additionalProperties: {
      'ui:options': {
        addLabel: 'external ref',
        rowGroups: [['source'], ['assetId'], ['protocol', 'uri']]
      },
      credentials: {
        'ui:widget': 'hidden'
      }
    }
  }
};

export default uiSchema;
