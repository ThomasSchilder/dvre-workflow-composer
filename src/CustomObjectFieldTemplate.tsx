import React from 'react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';
import { buttonId, canExpand, getTemplate, getUiOptions } from '@rjsf/utils';

function CustomObjectFieldTemplate(props: ObjectFieldTemplateProps): JSX.Element {
  const {
    className,
    description,
    disabled,
    formData,
    fieldPathId,
    onAddProperty,
    optionalDataControl,
    properties,
    readonly,
    registry,
    required,
    schema,
    title,
    uiSchema
  } = props;

  const options = getUiOptions(uiSchema);
  const TitleFieldTemplate = getTemplate('TitleFieldTemplate', registry, options);
  const DescriptionFieldTemplate = getTemplate(
    'DescriptionFieldTemplate',
    registry,
    options
  );

  const isPureUnionSchema =
    (schema.oneOf || schema.anyOf) &&
    !schema.properties &&
    properties.length === 0;
  if (isPureUnionSchema) {
    return <></>;
  }

  const showOptionalDataControlInTitle = !readonly && !disabled;
  const { ButtonTemplates: { AddButton } } = registry.templates;

  const rowGroups: string[][] = (options as any).rowGroups || [];

  const groupedNames = new Set(rowGroups.reduce((acc: string[], g: string[]) => acc.concat(g), []));
  const ungrouped = properties.filter(p => !groupedNames.has(p.name) && !p.hidden);
  const hiddenProps = properties.filter(p => p.hidden);

  const rowGroupElements = rowGroups.map((group, gi) => {
    const groupProps = group
      .map(name => properties.find(p => p.name === name))
      .filter(p => p && !p.hidden);
    if (groupProps.length === 0) return null;
    return (
      <div className="jp-wb-row-group" key={`rowgroup-${gi}`}>
        {groupProps.map(p => (
          <div className="jp-wb-row-group-item" key={p!.name}>
            {p!.content}
          </div>
        ))}
      </div>
    );
  });

  return (
    <fieldset className={className} id={fieldPathId.$id}>
      {title && (
        <TitleFieldTemplate
          id={titleId(fieldPathId)}
          title={title}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
          optionalDataControl={
            showOptionalDataControlInTitle ? optionalDataControl : undefined
          }
        />
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId(fieldPathId)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      {!showOptionalDataControlInTitle ? optionalDataControl : undefined}
      {hiddenProps.map(p => p.content)}
      {rowGroupElements}
      {ungrouped.map(p => p.content)}
      {canExpand(schema, uiSchema, formData) && (
        <AddButton
          id={buttonId(fieldPathId, 'add')}
          className="rjsf-object-property-expand"
          onClick={onAddProperty}
          disabled={disabled || readonly}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
    </fieldset>
  );
}

function titleId(fieldPathId: { $id: string }): string {
  return `${fieldPathId.$id}__title`;
}

function descriptionId(fieldPathId: { $id: string }): string {
  return `${fieldPathId.$id}__description`;
}

export default CustomObjectFieldTemplate;
