import React, { useMemo } from 'react';
import type { WidgetProps } from '@rjsf/utils';

function extractContext(id: string): {
  sectionName: string | null;
  isSectionLevel: boolean;
} {
  const parts = id.split('_');
  const sectionsIdx = parts.indexOf('sections');
  if (sectionsIdx === -1 || sectionsIdx + 1 >= parts.length) {
    return { sectionName: null, isSectionLevel: false };
  }
  const sectionName = parts[sectionsIdx + 1];
  const afterSection = parts.slice(sectionsIdx + 2);
  const isSectionLevel =
    afterSection.length === 0 ||
    afterSection[0] === 'dependsOn' ||
    (afterSection.length >= 2 && afterSection[0] === 'dependsOn');
  return { sectionName, isSectionLevel };
}

function buildSectionOptions(
  rootFormData: Record<string, any>
): { value: string; label: string }[] {
  const sections = rootFormData.sections;
  if (!sections || typeof sections !== 'object') return [];
  return Object.keys(sections).map(name => ({
    value: name,
    label: name
  }));
}

function buildTaskServiceOptions(
  rootFormData: Record<string, any>,
  currentSection: string | null
): { value: string; label: string }[] {
  const sections = rootFormData.sections;
  if (!sections || typeof sections !== 'object') return [];

  const options: { value: string; label: string }[] = [];

  for (const sectionName of Object.keys(sections)) {
    const section = sections[sectionName];
    if (!section || typeof section !== 'object') continue;

    const isCurrent = sectionName === currentSection;

    const tasks = section.tasks || {};
    for (const taskName of Object.keys(tasks)) {
      if (isCurrent) {
        options.push({ value: taskName, label: taskName });
      } else {
        options.push({
          value: `${sectionName}.${taskName}`,
          label: `${sectionName}.${taskName}`
        });
      }
    }

    const services = section.services || {};
    for (const serviceName of Object.keys(services)) {
      if (isCurrent) {
        options.push({ value: serviceName, label: serviceName });
      } else {
        options.push({
          value: `${sectionName}.${serviceName}`,
          label: `${sectionName}.${serviceName}`
        });
      }
    }
  }

  return options;
}

function DependsOnItemWidget(props: WidgetProps): JSX.Element {
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

  const rootFormData = (registry.formContext as any)?.rootFormData || {};
  const { sectionName, isSectionLevel } = extractContext(id);

  const enumOptions = useMemo(() => {
    if (isSectionLevel) {
      return buildSectionOptions(rootFormData);
    }
    return buildTaskServiceOptions(rootFormData, sectionName);
  }, [rootFormData, sectionName, isSectionLevel]);

  const placeholder = isSectionLevel
    ? 'Select section...'
    : 'Select task/service...';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value || undefined);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    onBlur(id, e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    onFocus(id, e.target.value);
  };

  return (
    <select
      id={id}
      className="form-control jp-wb-dynamic-select"
      value={value || ''}
      required={required}
      disabled={disabled || readonly}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      <option value="">{placeholder}</option>
      {enumOptions.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default DependsOnItemWidget;
