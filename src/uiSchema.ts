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
      dependsOn: {
        'ui:options': { orderable: false, addLabel: 'dependency' },
        items: {
          'ui:widget': 'dependsOnItem'
        }
      },
      binding: {
        'ui:widget': 'dynamicSelect',
        'ui:options': { sourcePath: 'infrastructure' }
      },
      volumes: {
        'ui:options': { orderable: false, addLabel: 'volume' },
        items: {
          'ui:widget': 'dynamicSelect',
          'ui:options': {
            sourcePath: 'volumes',
            placeholder: 'Select volume...'
          }
        }
      },
      volumeMounts: {
        'ui:field': 'volumeMounts'
      },
      tasks: {
        'ui:options': { addLabel: 'task' },
        additionalProperties: {
          'ui:options': {
            addLabel: 'task',
            rowGroups: [
              ['source', 'binding'],
              ['assetId'],
              ['image'],
              ['command', 'args']
            ]
          },
          dependsOn: {
            'ui:options': { orderable: false, addLabel: 'dependency' },
            items: {
              'ui:widget': 'dependsOnItem'
            }
          },
          binding: {
            'ui:widget': 'dynamicSelect',
            'ui:options': { sourcePath: 'infrastructure' }
          },
          externalRefs: {
            'ui:options': { orderable: false, addLabel: 'external ref' },
            items: {
              'ui:widget': 'dynamicSelect',
              'ui:options': {
                sourcePath: 'externalRefs',
                placeholder: 'Select external ref...'
              }
            }
          },
          volumes: {
            'ui:options': { orderable: false, addLabel: 'volume' },
            items: {
              'ui:widget': 'dynamicSelect',
              'ui:options': {
                sourcePath: 'volumes',
                placeholder: 'Select volume...'
              }
            }
          },
          volumeMounts: {
            'ui:field': 'volumeMounts'
          },
          env: {
            'ui:options': { addLabel: 'variable' },
            additionalProperties: {
              'ui:options': { addLabel: 'variable' },
              'ui:placeholder': 'Value'
            }
          },
          command: {
            'ui:options': { orderable: false }
          },
          args: {
            'ui:options': { orderable: false }
          }
        }
      },
      services: {
        'ui:options': { addLabel: 'service' },
        additionalProperties: {
          'ui:options': {
            addLabel: 'service',
            rowGroups: [
              ['source', 'binding', 'port'],
              ['assetId'],
              ['image'],
              ['command', 'args']
            ]
          },
          dependsOn: {
            'ui:options': { orderable: false, addLabel: 'dependency' },
            items: {
              'ui:widget': 'dependsOnItem'
            }
          },
          binding: {
            'ui:widget': 'dynamicSelect',
            'ui:options': { sourcePath: 'infrastructure' }
          },
          externalRefs: {
            'ui:options': { orderable: false, addLabel: 'external ref' },
            items: {
              'ui:widget': 'dynamicSelect',
              'ui:options': {
                sourcePath: 'externalRefs',
                placeholder: 'Select external ref...'
              }
            }
          },
          volumes: {
            'ui:options': { orderable: false, addLabel: 'volume' },
            items: {
              'ui:widget': 'dynamicSelect',
              'ui:options': {
                sourcePath: 'volumes',
                placeholder: 'Select volume...'
              }
            }
          },
          volumeMounts: {
            'ui:field': 'volumeMounts'
          },
          env: {
            'ui:options': { addLabel: 'variable' },
            additionalProperties: {
              'ui:options': { addLabel: 'variable' },
              'ui:placeholder': 'Value'
            }
          },
          command: {
            'ui:options': { orderable: false }
          },
          args: {
            'ui:options': { orderable: false }
          }
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
