import {
  OFFERFIELDS,
  ORGANISATIONSTATISTICSFIELDS,
  ORGANSIATIONFIELDS,
  OUTPUTFIELDS,
  SCHOOLFIELDS
} from "../fieldConstants";
import { DisplayField, Filter, MetaDisplayFields, Report } from "../types";

const ALL_BASE_FIELDS = [
  ...ORGANSIATIONFIELDS,
  ...ORGANISATIONSTATISTICSFIELDS,
  ...SCHOOLFIELDS,
  ...OFFERFIELDS,
  ...OUTPUTFIELDS
];

const AVAILABLE_FIELDS = [
  ...ORGANSIATIONFIELDS.map(field => ({
    value: `organisation_${field.value}`,
    label: `${field.label} (Organisation)`,
    dataType: field.dataType
  })),
  ...ORGANISATIONSTATISTICSFIELDS.map(field => ({
    value: `organisation_statistics_${field.value}`,
    label: `${field.label} (Organisation Statistik)`,
    dataType: field.dataType
  })),
  ...SCHOOLFIELDS.map(field => ({
    value: `school_${field.value}`,
    label: `${field.label} (Schule)`,
    dataType: field.dataType
  })),
  ...OFFERFIELDS.map(field => ({
    value: `offer_${field.value}`,
    label: `${field.label} (Angebot)`,
    dataType: field.dataType
  })),
  ...OUTPUTFIELDS.map(field => ({
    value: `output_${field.value}`,
    label: `${field.label} (Kooperation)`,
    dataType: field.dataType
  }))
];

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

export const getFieldLabelForFilter = (fieldValue: string) => {
  const fieldName = fieldValue
    .replace(/^organisation_statistics_/, "")
    .replace(/^organisation_/, "")
    .replace(/^school_/, "")
    .replace(/^offer_/, "")
    .replace(/^output_/, "");
  const field = ALL_BASE_FIELDS.find(f => f.value === fieldName);
  return field ? field.label : fieldName;
};

export const getFieldOriginForFilter = (fieldValue: string) => {
  if (fieldValue.startsWith("organisation_statistics_")) return "Organisation Statistik";
  if (fieldValue.startsWith("organisation_")) return "Organisation";
  if (fieldValue.startsWith("school_")) return "Schule";
  if (fieldValue.startsWith("offer_")) return "Angebot";
  if (fieldValue.startsWith("output_")) return "Kooperation";
  return "";
};

export const getAvailableFieldsForReport = (
  displayFields?: DisplayField[] | MetaDisplayFields
) => {
  if (!displayFields || displayFields.length === 0) {
    return AVAILABLE_FIELDS;
  }
  const reportFieldValues = new Set(
    displayFields.map(field => `${field.type}_${field.field}`)
  );
  return AVAILABLE_FIELDS.filter(field => reportFieldValues.has(field.value));
};

export const getFieldDataType = (fieldValue: string) =>
  AVAILABLE_FIELDS.find(field => field.value === fieldValue)?.dataType;

export const getOperatorOptionsForField = (fieldValue: string) => {
  const dataType = getFieldDataType(fieldValue);
  if (dataType === "array") {
    return ARRAY_OPERATORS;
  }
  if (["date", "number", "float"].includes(String(dataType))) {
    return ALL_OPERATORS.filter(op => ["equals", "greater", "less", "between"].includes(op.value));
  }
  return BASE_OPERATORS;
};

export const buildEmptyFilter = (fieldValue: string): Filter => {
  const dataType = getFieldDataType(fieldValue);
  const defaultOperator = dataType === "array" ? "array_contains" : "equals";
  return {
    field: fieldValue,
    operator: defaultOperator,
    value: ""
  };
};

export const getInputTypeForField = (fieldValue: string) => {
  const dataType = getFieldDataType(fieldValue);
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
