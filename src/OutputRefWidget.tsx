import React, { useState, useMemo } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import OutputRefModal from './OutputRefModal';
import type { IOutputEntry } from './OutputRefModal';

function extractCurrentTask(
  id: string
): { section: string; task: string } | null {
  const parts = id.split('_');
  const sectionsIdx = parts.indexOf('sections');
  if (sectionsIdx === -1 || sectionsIdx + 1 >= parts.length) {
    return null;
  }
  const section = parts[sectionsIdx + 1];
  const tasksIdx = parts.indexOf('tasks');
  if (tasksIdx === -1 || tasksIdx + 1 >= parts.length) {
    return null;
  }
  const task = parts[tasksIdx + 1];
  return { section, task };
}

function buildAvailableOutputs(
  rootFormData: Record<string, any>,
  currentSection: string | null,
  currentTask: string | null
): IOutputEntry[] {
  const sections = rootFormData.sections;
  if (!sections || typeof sections !== 'object') {
    return [];
  }

  const entries: IOutputEntry[] = [];

  for (const sectionName of Object.keys(sections)) {
    const section = sections[sectionName];
    if (!section || typeof section !== 'object') continue;
    const tasks = section.tasks;
    if (!tasks || typeof tasks !== 'object') continue;

    for (const taskName of Object.keys(tasks)) {
      if (currentSection === sectionName && currentTask === taskName) {
        continue;
      }
      const task = tasks[taskName];
      if (!task || typeof task !== 'object') continue;
      const outputs = task.outputs;
      if (!outputs || typeof outputs !== 'object') continue;

      for (const outputName of Object.keys(outputs)) {
        const output = outputs[outputName];
        if (!output || !output.path) continue;
        entries.push({
          ref: `${sectionName}.${taskName}.${outputName}`,
          outputName,
          path: output.path,
          section: sectionName,
          task: taskName
        });
      }
    }
  }

  return entries;
}

function OutputRefWidget(props: WidgetProps): JSX.Element {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    registry
  } = props;

  const [modalOpen, setModalOpen] = useState(false);

  const rootFormData = (registry.formContext as any)?.rootFormData || {};
  const current = extractCurrentTask(id);

  const availableOutputs = useMemo(
    () =>
      buildAvailableOutputs(
        rootFormData,
        current?.section ?? null,
        current?.task ?? null
      ),
    [rootFormData, current?.section, current?.task]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === '' ? undefined : val);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur(id, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus(id, e.target.value);
  };

  const handleSelect = (entry: IOutputEntry) => {
    onChange(entry.ref);
    const onInputRefSelected = (registry.formContext as any)
      ?.onInputRefSelected;
    if (typeof onInputRefSelected === 'function') {
      onInputRefSelected(id, entry.path);
    }
  };

  return (
    <div className="jp-wb-asset-select-wrapper">
      <input
        id={id}
        type="text"
        className="form-control jp-wb-asset-select-input"
        value={value ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="section.task.output"
      />
      <button
        type="button"
        className="jp-wb-asset-select-btn"
        onClick={() => setModalOpen(true)}
        disabled={disabled || readonly}
        aria-label="Browse outputs"
        title="Browse available outputs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="7" cy="7" r="5" />
          <line x1="11" y1="11" x2="15" y2="15" />
        </svg>
      </button>
      {modalOpen && (
        <OutputRefModal
          outputs={availableOutputs}
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default OutputRefWidget;
