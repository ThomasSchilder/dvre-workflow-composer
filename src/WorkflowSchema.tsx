import React from 'react';
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import workflowSchema from './schemas/workflow-v1.json';

const WorkflowSchema = function () {
  const log = (type: string) => console.log.bind(console, type);
  return (
    <Form
      schema={workflowSchema as RJSFSchema}
      validator={validator}
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
