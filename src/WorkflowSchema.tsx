import React, { useState, useCallback } from 'react';
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import workflowSchema from './schemas/workflow-v1.json';
import uiSchema from './uiSchema';
import CustomAddButton from './CustomAddButton';
import CustomWrapIfAdditional from './CustomWrapIfAdditional';
import CustomObjectFieldTemplate from './CustomObjectFieldTemplate';
import CustomDescriptionField from './CustomDescriptionField';
import { cleanConditionalFormData } from './conditionalRules';

const WorkflowSchema = function () {
  const [formData, setFormData] = useState<Record<string, any>>({
    apiVersion: 'v1'
  });

  const handleChange = useCallback(
    (event: { formData?: Record<string, any> }) => {
      const cleaned = cleanConditionalFormData(
        event.formData || {},
        formData,
        workflowSchema as Record<string, any>
      );
      setFormData(cleaned);
    },
    [formData]
  );

  return (
    <Form
      schema={workflowSchema as RJSFSchema}
      uiSchema={uiSchema}
      validator={validator}
      formData={formData}
      onChange={handleChange}
      formContext={{ rawSchema: workflowSchema }}
      templates={{
        ButtonTemplates: { AddButton: CustomAddButton },
        WrapIfAdditionalTemplate: CustomWrapIfAdditional,
        ObjectFieldTemplate: CustomObjectFieldTemplate,
        DescriptionFieldTemplate: CustomDescriptionField
      }}
      onSubmit={() => {}}
      onError={() => {}}
    />
  );
};
export { WorkflowSchema };
export default {
  WorkflowSchema
};
