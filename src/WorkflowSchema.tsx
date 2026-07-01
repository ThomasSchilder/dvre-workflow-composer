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
      const sections = cleaned.sections;
      if (sections) {
        for (const sectionName of Object.keys(sections)) {
          const section = sections[sectionName];
          if (section && typeof section === 'object') {
            const mountKeys = Object.keys(section.volumeMounts || {});
            section.volumes = mountKeys;

            for (const taskCol of ['tasks', 'services'] as const) {
              const items = section[taskCol];
              if (items && typeof items === 'object') {
                for (const itemName of Object.keys(items)) {
                  const item = items[itemName];
                  if (item && typeof item === 'object') {
                    item.volumes = Object.keys(item.volumeMounts || {});
                  }
                }
              }
            }
          }
        }
      }
      setFormData(cleaned);
    },
    [formData]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = () => {
    const result = validator.validateFormData(
      formData,
      workflowSchema as RJSFSchema
    );
    if (result.errors && result.errors.length > 0) {
      const summary = result.errors.map(e => `- ${e.stack}`).join('\n');
      alert(
        `Form has ${result.errors.length} validation error(s):\n${summary}\n\nExporting anyway.`
      );
    }
    const name = formData?.metadata?.name;
    const filename = name ? `${name}.json` : 'untitled.json';
    const blob = new Blob([JSON.stringify(formData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
        <button
          type="button"
          className="jp-wb-toolbar-btn"
          onClick={handleExportClick}
        >
          Export
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
