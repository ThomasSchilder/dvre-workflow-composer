export interface IConditionalRule {
  controller: string;
  branches: Record<string, string[]>;
}

export function findMatchingRawDef(
  rawSchema: Record<string, any>,
  resolvedSchema: Record<string, any>
): Record<string, any> | null {
  const defs = rawSchema.$defs;
  if (!defs || typeof defs !== 'object') return null;

  const resolvedProps = new Set(Object.keys(resolvedSchema.properties || {}));
  if (resolvedProps.size === 0) return null;

  let bestMatch: Record<string, any> | null = null;
  let bestScore = -1;

  for (const defName of Object.keys(defs)) {
    const def = defs[defName];
    if (!def || !def.properties) continue;

    const defProps = Object.keys(def.properties);
    const allPresent = defProps.every(p => resolvedProps.has(p));
    if (!allPresent) continue;

    const score = defProps.length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = def;
    }
  }

  return bestMatch;
}

export function extractConditionalRules(
  schema: Record<string, any>
): IConditionalRule | null {
  const allOf = schema.allOf;
  if (!Array.isArray(allOf) || allOf.length === 0) {
    return null;
  }

  let controller: string | null = null;
  const branches: Record<string, string[]> = {};

  for (const entry of allOf) {
    const ifClause = entry.if;
    const thenClause = entry.then;
    if (!ifClause || !thenClause) continue;

    const ifProps = ifClause.properties;
    if (!ifProps) continue;

    const controllerKeys = Object.keys(ifProps);
    if (controllerKeys.length !== 1) continue;

    const ctrlKey = controllerKeys[0];
    const constValue = ifProps[ctrlKey] && ifProps[ctrlKey].const;
    if (constValue === undefined) continue;

    if (controller !== null && controller !== ctrlKey) continue;
    controller = ctrlKey;

    const branchFields: string[] = [];
    if (Array.isArray(thenClause.required)) {
      branchFields.push(...thenClause.required);
    }
    if (thenClause.properties && typeof thenClause.properties === 'object') {
      for (const propKey of Object.keys(thenClause.properties)) {
        if (branchFields.indexOf(propKey) === -1) {
          branchFields.push(propKey);
        }
      }
    }

    branches[String(constValue)] = branchFields;
  }

  if (controller === null || Object.keys(branches).length === 0) {
    return null;
  }

  return { controller, branches };
}

export function getVisibleFields(
  formData: Record<string, any>,
  rule: IConditionalRule,
  allPropertyNames: string[]
): Set<string> {
  const visible = new Set<string>();

  const allBranchFields: string[] = [];
  const branchValues = Object.values(rule.branches) as string[][];
  for (const fields of branchValues) {
    allBranchFields.push(...fields);
  }
  const branchFieldSet = new Set(allBranchFields);

  for (const name of allPropertyNames) {
    if (name === rule.controller) {
      visible.add(name);
    } else if (!branchFieldSet.has(name)) {
      visible.add(name);
    }
  }

  const controllerValue = formData[rule.controller];
  if (controllerValue !== undefined && controllerValue !== '') {
    const matchingFields = rule.branches[String(controllerValue)];
    if (matchingFields) {
      for (const f of matchingFields) {
        visible.add(f);
      }
    }
  }

  return visible;
}

export function cleanFormDataOnControllerChange(
  newFormData: Record<string, any>,
  prevFormData: Record<string, any>,
  rule: IConditionalRule
): Record<string, any> {
  const newController = newFormData[rule.controller];
  const prevController = prevFormData[rule.controller];

  if (newController === prevController) {
    return newFormData;
  }

  const allBranchFields: string[] = [];
  const branchValues = Object.values(rule.branches) as string[][];
  for (const fields of branchValues) {
    allBranchFields.push(...fields);
  }

  const matchingFields = rule.branches[String(newController)] || [];
  const matchingSet = new Set(matchingFields);

  const cleaned = { ...newFormData };
  for (const field of allBranchFields) {
    if (!matchingSet.has(field)) {
      delete cleaned[field];
    }
  }

  return cleaned;
}

export function cleanConditionalFormData(
  newFormData: Record<string, any>,
  prevFormData: Record<string, any>,
  rootSchema: Record<string, any>
): Record<string, any> {
  const cleaned = { ...newFormData };
  const defs = rootSchema.$defs || {};
  const rootProps = rootSchema.properties || {};

  for (const propName of Object.keys(rootProps)) {
    const propSchema = rootProps[propName];
    let itemSchema: Record<string, any> | null = null;

    if (
      propSchema.additionalProperties &&
      propSchema.additionalProperties.$ref
    ) {
      const refName = propSchema.additionalProperties.$ref.replace(
        '#/$defs/',
        ''
      );
      itemSchema = defs[refName] || null;
    } else if (
      propSchema.additionalProperties &&
      typeof propSchema.additionalProperties === 'object' &&
      !propSchema.additionalProperties.$ref
    ) {
      itemSchema = propSchema.additionalProperties;
    }

    if (!itemSchema) continue;

    const rule = extractConditionalRules(itemSchema);
    if (!rule) continue;

    const newItems = cleaned[propName];
    const prevItems = prevFormData[propName];
    if (!newItems || typeof newItems !== 'object') continue;

    const updatedItems: Record<string, any> = {};
    for (const key of Object.keys(newItems)) {
      const newItem = newItems[key];
      const prevItem = prevItems && prevItems[key] ? prevItems[key] : {};
      if (typeof newItem === 'object' && newItem !== null) {
        updatedItems[key] = cleanFormDataOnControllerChange(
          newItem,
          prevItem,
          rule
        );
      } else {
        updatedItems[key] = newItem;
      }
    }
    cleaned[propName] = updatedItems;
  }

  return cleaned;
}
