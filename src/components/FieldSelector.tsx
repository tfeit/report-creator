import { XMarkIcon } from "@heroicons/react/24/outline";
import { Field, FieldDataType, ReportConfig, ReportFieldConfig } from "../types";

type FieldType = string;

interface FieldConfig {
  available: ReportFieldConfig[];
  current: Field[];
  fieldName: string;
  title: string;
}

interface FieldSelectorProps {
  type: FieldType;
  reportType: string;
  displayFields: Field[];
  onDisplayFieldsChange: (newFields: Field[]) => void;
  placeholder?: string;
  config: ReportConfig;
}

export default function FieldSelector({
  type,
  reportType,
  displayFields,
  onDisplayFieldsChange,
  placeholder = "Felder auswählen",
  config
}: FieldSelectorProps) {
  const formatEntityLabel = (entityType: string) =>
    entityType
      .replace(/_/g, " ")
      .replace(/^[a-z]/, match => match.toUpperCase());

  const getFieldConfig = (fieldType: FieldType, reportTypeValue: string): FieldConfig => {
    const reportEntities = config.reportTypeEntities?.[reportTypeValue];
    const available = !reportEntities || reportEntities.length === 0
      ? config.fieldsByEntity?.[fieldType] ?? []
      : reportEntities.includes(fieldType)
        ? config.fieldsByEntity?.[fieldType] ?? []
        : [];
    return {
      available,
      current: Array.isArray(displayFields) ? displayFields.filter(f => f.type === fieldType) : [],
      fieldName: fieldType,
      title: `Felder für ${formatEntityLabel(fieldType)}`
    };
  };

  const fieldConfig = getFieldConfig(type, reportType);
  const filteredAvailableFields = fieldConfig.available.filter(
    field => !fieldConfig.current.some(selected => selected.field === field.value)
  );

  const handleFieldSelect = (field: ReportFieldConfig) => {
    const prevArray = Array.isArray(displayFields) ? displayFields : [];
    onDisplayFieldsChange([
      ...prevArray,
      {
        field: field.value,
        type: type,
        dataType: field.dataType as FieldDataType,
        visible: true,
        order: prevArray.length,
        grouping: false,
        aggregation: "none",
        width: undefined
      }
    ]);
  };

  const handleFieldDeselect = (fieldValue: string) => {
    onDisplayFieldsChange(displayFields.filter(f => !(f.type === type && f.field === fieldValue)));
  };

  if (fieldConfig.available.length === 0) {
    return null;
  }

  return (
    <div id="field-selector">
      <label className="text-sm font-medium mb-2" htmlFor="selectedFields">{fieldConfig.title}</label>
      <select
        name="selectedFields"
        value={""}
        onChange={e => {
          const selectedField = fieldConfig.available.find(field => field.value === e.target.value);
          if (selectedField) {
            handleFieldSelect(selectedField);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {filteredAvailableFields.map(field => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
      {fieldConfig.current.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Ausgewählte Felder:</h3>
          <div className="flex flex-wrap gap-2">
            {fieldConfig.current.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-100/10 rounded-full px-3 py-1"
              >
                <span>{fieldConfig.available.find(f => f.value === field.field)?.label}</span>
                <button
                  onClick={() => handleFieldDeselect(field.field)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
