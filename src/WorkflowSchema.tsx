import React, { useState, useCallback, useRef } from 'react';
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
import AssetSelectWidget from './AssetSelectWidget';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setFormData(parsed);
      } catch (err) {
        alert(
          'Invalid JSON file: ' +
            (err instanceof Error ? err.message : String(err))
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="jp-wb-form-toolbar">
        <button
          type="button"
          className="jp-wb-toolbar-btn"
          onClick={handleImportClick}
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <Form
        schema={workflowSchema as RJSFSchema}
        uiSchema={uiSchema}
        validator={validator}
        formData={formData}
        onChange={handleChange}
        formContext={{ rawSchema: workflowSchema, rootFormData: formData }}
        widgets={{
          dynamicSelect: DynamicSelectWidget,
          dependsOnItem: DependsOnItemWidget,
          assetSelect: AssetSelectWidget
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
    </>
  );
};
export { WorkflowSchema };
export default {
  WorkflowSchema
};
