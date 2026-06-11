import React from 'react';
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import workflowSchema from './schemas/workflow-v1.json';
import uiSchema from './uiSchema';
import CustomAddButton from './CustomAddButton';
import CustomWrapIfAdditional from './CustomWrapIfAdditional';
import CustomObjectFieldTemplate from './CustomObjectFieldTemplate';
import CustomDescriptionField from './CustomDescriptionField';

const WorkflowSchema = function () {
  const log = (type: string) => console.log.bind(console, type);
  return (
    <Form
      schema={workflowSchema as RJSFSchema}
      uiSchema={uiSchema}
      validator={validator}
      templates={{
        ButtonTemplates: { AddButton: CustomAddButton },
        WrapIfAdditionalTemplate: CustomWrapIfAdditional,
        ObjectFieldTemplate: CustomObjectFieldTemplate,
        DescriptionFieldTemplate: CustomDescriptionField
      }}
      onChange={log('changed')}
      onSubmit={log('submitted')}
      onError={log('errors')}
    />
  );
};
export { WorkflowSchema };
export default {
  WorkflowSchema
};
