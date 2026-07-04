import React, { useState, useCallback, useRef } from 'react';
import Form from '@rjsf/core';
import { RJSFSchema, TranslatableString, FormValidation } from '@rjsf/utils';
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
import OutputRefWidget from './OutputRefWidget';
import InputFileUploadWidget from './InputFileUploadWidget';
import VolumeMountsField from './VolumeMountsWidget';
import { cleanConditionalFormData } from './conditionalRules';
import { useSettings } from './SettingsContext';
import { useEventStream } from './useEventStream';
import { FeedbackPanel } from './FeedbackPanel';

const NoSubmitButton = () => <></>;

function extractInputLocationFromRefId(
  refId: string
): { section: string; task: string; input: string } | null {
  const parts = refId.split('_');
  const sectionsIdx = parts.indexOf('sections');
  if (sectionsIdx === -1 || sectionsIdx + 1 >= parts.length) return null;
  const section = parts[sectionsIdx + 1];
  const tasksIdx = parts.indexOf('tasks');
  if (tasksIdx === -1 || tasksIdx + 1 >= parts.length) return null;
  const task = parts[tasksIdx + 1];
  const inputsIdx = parts.indexOf('inputs');
  if (inputsIdx === -1 || inputsIdx + 1 >= parts.length) return null;
  const input = parts[inputsIdx + 1];
  return { section, task, input };
}

const WorkflowSchema = function () {
  const { schedulerUrl } = useSettings();
  const { runs, startListening, clearRuns } = useEventStream(schedulerUrl);
  const [formData, setFormData] = useState<Record<string, any>>({
    apiVersion: 'v1'
  });

  const fileUploads = useRef<Map<string, { name: string; content: string }>>(
    new Map()
  );

  const pendingInputPaths = useRef<Map<string, string>>(new Map());

  const registerFileUpload = useCallback(
    (key: string, entry: { name: string; content: string }) => {
      fileUploads.current.set(key, entry);
    },
    []
  );

  const onInputRefSelected = useCallback(
    (refWidgetId: string, outputPath: string) => {
      pendingInputPaths.current.set(refWidgetId, outputPath);
    },
    []
  );

  const customValidate = useCallback(
    (data: Record<string, any>, errors: FormValidation) => {
      const sections = data.sections;
      if (!sections || typeof sections !== 'object') {
        return errors;
      }

      for (const sectionName of Object.keys(sections)) {
        const section = sections[sectionName];
        if (!section || typeof section !== 'object') {
          continue;
        }
        const sectionMounts = section.volumeMounts || {};
        const tasks = section.tasks;
        if (!tasks || typeof tasks !== 'object') {
          continue;
        }

        for (const taskName of Object.keys(tasks)) {
          const task = tasks[taskName];
          if (!task || typeof task !== 'object') {
            continue;
          }
          const outputs = task.outputs;
          if (!outputs || typeof outputs !== 'object') {
            continue;
          }

          const mountPaths = [
            ...Object.values(sectionMounts),
            ...Object.values(task.volumeMounts || {})
          ].filter(p => typeof p === 'string') as string[];

          for (const outputName of Object.keys(outputs)) {
            const output = outputs[outputName];
            if (!output || !output.path) {
              continue;
            }
            const outputPath: string = output.path;
            const onVolume = mountPaths.some(
              mp => outputPath === mp || outputPath.startsWith(mp + '/')
            );
            if (!onVolume) {
              const taskErrors = (errors as any).sections?.[sectionName]
                ?.tasks?.[taskName];
              if (
                taskErrors &&
                taskErrors.outputs &&
                taskErrors.outputs[outputName]
              ) {
                taskErrors.outputs[outputName].addError(
                  `Path "${outputPath}" is not within any mounted volume. Add a volume mount or change the path.`
                );
              }
            }
          }

          const inputs = task.inputs;
          if (!inputs || typeof inputs !== 'object') {
            continue;
          }

          for (const inputName of Object.keys(inputs)) {
            const input = inputs[inputName];
            if (!input || !input.path) {
              continue;
            }
            const inputPath: string = input.path;
            const onVolume = mountPaths.some(
              mp => inputPath === mp || inputPath.startsWith(mp + '/')
            );
            if (!onVolume) {
              const taskErrors = (errors as any).sections?.[sectionName]
                ?.tasks?.[taskName];
              if (
                taskErrors &&
                taskErrors.inputs &&
                taskErrors.inputs[inputName]
              ) {
                taskErrors.inputs[inputName].addError(
                  `Path "${inputPath}" is not within any mounted volume. Add a volume mount or change the path.`
                );
              }
            }
          }
        }
      }
      return errors;
    },
    []
  );

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
      if (pendingInputPaths.current.size > 0) {
        for (const [refId, outputPath] of pendingInputPaths.current.entries()) {
          const loc = extractInputLocationFromRefId(refId);
          if (loc) {
            const inputObj =
              cleaned.sections?.[loc.section]?.tasks?.[loc.task]?.inputs?.[
                loc.input
              ];
            if (inputObj && typeof inputObj === 'object') {
              inputObj.path = outputPath;
            }
          }
        }
        pendingInputPaths.current.clear();
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

  const handleDeployClick = async () => {
    const result = validator.validateFormData(
      formData,
      workflowSchema as RJSFSchema
    );
    if (result.errors && result.errors.length > 0) {
      const summary = result.errors.map(e => `- ${e.stack}`).join('\n');
      alert(
        `Form has ${result.errors.length} validation error(s):\n${summary}\n\nPlease fix before deploying.`
      );
      return;
    }
    const token = localStorage.getItem('dvre-auth-token');
    if (!token) {
      alert('Not authenticated. Please sign in first.');
      return;
    }

    try {
      const createRes = await fetch(`${schedulerUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        alert(`Validation failed: ${createData.error || createRes.statusText}`);
        return;
      }

      const workflowId: string = createData.id;
      const wfName = formData.metadata?.name || workflowId;

      startListening(workflowId, wfName);

      fetch(`${schedulerUrl}/api/v1/workflows/${workflowId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }).catch(err => {
        console.error('Deploy request failed:', err);
      });

      for (const [key, file] of fileUploads.current.entries()) {
        fetch(`${schedulerUrl}/api/v1/workflows/${workflowId}/files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            key,
            name: file.name,
            content: file.content
          })
        }).catch(err => {
          console.error(`File upload failed for key "${key}":`, err);
        });
      }
    } catch (err) {
      alert(
        'Deploy failed: ' + (err instanceof Error ? err.message : String(err))
      );
    }
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
        <button
          type="button"
          className="jp-wb-toolbar-btn"
          onClick={handleDeployClick}
        >
          Deploy
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
        customValidate={customValidate}
        formContext={{
          rawSchema: workflowSchema,
          rootFormData: formData,
          registerFileUpload,
          onInputRefSelected
        }}
        widgets={{
          dynamicSelect: DynamicSelectWidget,
          dependsOnItem: DependsOnItemWidget,
          assetSelect: AssetSelectWidget,
          outputRef: OutputRefWidget,
          fileUpload: InputFileUploadWidget
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
            CopyButton: HiddenButton,
            SubmitButton: NoSubmitButton
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
      <FeedbackPanel
        runs={runs}
        onClear={clearRuns}
        schedulerUrl={schedulerUrl}
      />
    </>
  );
};
export { WorkflowSchema };
export default {
  WorkflowSchema
};
