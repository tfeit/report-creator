import { DisplayField, Filter, MetaDisplayFields, ReportConfig } from "../types";

const formatEntityLabel = (entityType: string) =>
  entityType
    .replace(/_/g, " ")
    .replace(/^[a-z]/, match => match.toUpperCase());

const getFieldDefinition = (config: ReportConfig, fieldValue: string) => {
  const entries = Object.entries(config.fieldsByEntity ?? {});
  for (const [entityType, fields] of entries) {
    const prefix = `${entityType}_`;
    if (fieldValue.startsWith(prefix)) {
      const rawField = fieldValue.slice(prefix.length);
      const field = fields.find(entry => entry.value === rawField);
      if (field) {
        return { entityType, field };
      }
    }
  }
  return null;
};

const buildAvailableFields = (config: ReportConfig) =>
  Object.entries(config.fieldsByEntity ?? {}).flatMap(([entityType, fields]) =>
    fields.map(field => ({
      value: `${entityType}_${field.value}`,
      label: `${field.label} (${formatEntityLabel(entityType)})`,
      dataType: field.dataType
    }))
  );

const BASE_OPERATORS = [
  { value: "equals", label: "ist gleich" },
  { value: "contains", label: "enthält" },
  { value: "greater", label: "ist größer als" },
  { value: "less", label: "ist kleiner als" },
  { value: "startsWith", label: "beginnt mit" },
  { value: "endsWith", label: "endet mit" }
];

const ALL_OPERATORS = [...BASE_OPERATORS, { value: "between", label: "ist zwischen" }];

const ARRAY_OPERATORS = [
  { value: "array_contains", label: "ist" },
  { value: "array_not_contains", label: "ist nicht" },
  { value: "array_is_empty", label: "ist leer" },
  { value: "array_is_not_empty", label: "ist nicht leer" }
];

export const getFieldLabelForFilter = (fieldValue: string, config: ReportConfig) => {
  const result = getFieldDefinition(config, fieldValue);
  if (result) {
    return result.field.label;
  }
  return fieldValue;
};

export const getFieldOriginForFilter = (fieldValue: string, config: ReportConfig) => {
  const result = getFieldDefinition(config, fieldValue);
  return result ? formatEntityLabel(result.entityType) : "";
};

export const getAvailableFieldsForReport = (
  displayFields: DisplayField[] | MetaDisplayFields | undefined,
  config: ReportConfig
) => {
  const availableFields = buildAvailableFields(config);
  if (!displayFields || displayFields.length === 0) {
    return availableFields;
  }
  const reportFieldValues = new Set(
    displayFields.map(field => `${field.type}_${field.field}`)
  );
  return availableFields.filter(field => reportFieldValues.has(field.value));
};

export const getFieldDataType = (fieldValue: string, config: ReportConfig) =>
  getFieldDefinition(config, fieldValue)?.field.dataType;

export const getOperatorOptionsForField = (fieldValue: string, config: ReportConfig) => {
  const dataType = getFieldDataType(fieldValue, config);
  if (dataType === "array") {
    return ARRAY_OPERATORS;
  }
  if (["date", "number", "float"].includes(String(dataType))) {
    return ALL_OPERATORS.filter(op => ["equals", "greater", "less", "between"].includes(op.value));
  }
  return BASE_OPERATORS;
};

export const buildEmptyFilter = (fieldValue: string, config: ReportConfig): Filter => {
  const dataType = getFieldDataType(fieldValue, config);
  const defaultOperator = dataType === "array" ? "array_contains" : "equals";
  return {
    field: fieldValue,
    operator: defaultOperator,
    value: ""
  };
};

export const getInputTypeForField = (fieldValue: string, config: ReportConfig) => {
  const dataType = getFieldDataType(fieldValue, config);
  if (dataType === "date") return "date";
  if (dataType === "number" || dataType === "float") return "number";
  return "text";
};

export const getArrayFilterOptions = (rows: any[] | null | undefined, fieldValue: string) => {
  if (!rows || rows.length === 0) {
    return [];
  }
  const options = new Set<string>();
  rows.forEach(row => {
    const value = row?.[fieldValue];
    if (Array.isArray(value)) {
      value.forEach(entry => {
        if (entry !== null && entry !== undefined && String(entry).trim() !== "") {
          options.add(String(entry));
        }
      });
    } else if (value !== null && value !== undefined && String(value).trim() !== "") {
      options.add(String(value));
    }
  });
  return Array.from(options).sort((a, b) => a.localeCompare(b, "de"));
};
