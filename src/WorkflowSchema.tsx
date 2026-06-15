import React, { useState, useCallback } from 'react';
import Form from '@rjsf/core';
import { RJSFSchema, TranslatableString } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import workflowSchema from './schemas/workflow-v1.json';
import uiSchema from './uiSchema';
import CustomAddButton from './CustomAddButton';
import CustomRemoveButton from './CustomRemoveButton';
import HiddenButton from './HiddenButton';
import CustomWrapIfAdditional from './CustomWrapIfAdditional';
import CustomObjectFieldTemplate from './CustomObjectFieldTemplate';
import CustomDescriptionField from './CustomDescriptionField';
import DynamicSelectWidget from './DynamicSelectWidget';
import DependsOnItemWidget from './DependsOnItemWidget';
import VolumeMountsField from './VolumeMountsWidget';
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
      formContext={{ rawSchema: workflowSchema, rootFormData: formData }}
      widgets={{
        dynamicSelect: DynamicSelectWidget,
        dependsOnItem: DependsOnItemWidget
      }}
      fields={{
        volumeMounts: VolumeMountsField
      }}
      templates={{
        ButtonTemplates: {
          AddButton: CustomAddButton,
          RemoveButton: CustomRemoveButton,
          MoveUpButton: HiddenButton,
          MoveDownButton: HiddenButton,
          CopyButton: HiddenButton
        },
        WrapIfAdditionalTemplate: CustomWrapIfAdditional,
        ObjectFieldTemplate: CustomObjectFieldTemplate,
        DescriptionFieldTemplate: CustomDescriptionField
      }}
      onSubmit={() => {}}
      onError={() => {}}
      experimental_defaultFormStateBehavior={{
        emptyObjectFields: 'skipDefaults',
        arrayMinItems: { populate: 'never' },
        constAsDefaults: 'never'
      }}
      translateString={s =>
        s === TranslatableString.NewStringDefault ? '' : s.toString()
      }
    />
  );
};
export { WorkflowSchema };
export default {
  WorkflowSchema
};
