import { XMarkIcon } from "@heroicons/react/24/outline";
import { MetaDisplayFields } from "../types";
import {
  OUTPUTFIELDS,
  ORGANSIATIONFIELDS,
  OFFERFIELDS,
  SCHOOLFIELDS,
  ORGANISATIONSTATISTICSFIELDS
} from "../fieldConstants";

interface Field {
  field: string;
  value: string;
  label: string;
  dataType: string;
}

type FieldType = "organisation" | "organisation_statistics" | "school" | "offer" | "output";

interface FieldConfig {
  available: Field[];
  current: Field[];
  fieldName: string;
  title: string;
}

interface FieldSelectorProps {
  type: FieldType;
  reportType: string;
  displayFields: MetaDisplayFields;
  onDisplayFieldsChange: (newFields: MetaDisplayFields) => void;
  placeholder?: string;
}

export default function FieldSelector({
  type,
  reportType,
  displayFields,
  onDisplayFieldsChange,
  placeholder = "Felder auswählen"
}: FieldSelectorProps) {
  const getFieldConfig = (fieldType: FieldType, reportTypeValue: string): FieldConfig => {
    const configs = {
      organisation: {
        available:
          reportTypeValue === "organisations" ||
          reportTypeValue === "organisations_statistics" ||
          reportTypeValue === "organisations_offers" ||
          reportTypeValue === "organisations_offers_statistics"
            ? ORGANSIATIONFIELDS
            : [],
        current: Array.isArray(displayFields) ? displayFields.filter(f => f.type === "organisation") : [],
        fieldName: "organisation",
        title: "Organisationsfelder auswählen"
      },
      organisation_statistics: {
        available: reportTypeValue === "organisations_statistics" ? ORGANISATIONSTATISTICSFIELDS : [],
        current: Array.isArray(displayFields)
          ? displayFields.filter(f => f.type === "organisation_statistics")
          : [],
        fieldName: "organisation_statistics",
        title: "Statistikfelder auswählen"
      },
      school: {
        available: reportTypeValue === "schools_statistics_offers" ? SCHOOLFIELDS : [],
        current: Array.isArray(displayFields) ? displayFields.filter(f => f.type === "school") : [],
        fieldName: "school",
        title: "Schulfelder auswählen"
      },
      offer: {
        available:
          reportTypeValue === "schools_statistics_offers" ||
          reportTypeValue === "organisations_offers" ||
          reportTypeValue === "organisations_offers_statistics" ||
          reportTypeValue === "offer_statistics_comparison"
            ? OFFERFIELDS
            : [],
        current: Array.isArray(displayFields) ? displayFields.filter(f => f.type === "offer") : [],
        fieldName: "offer",
        title: "Angebotsfelder auswählen"
      },
      output: {
        available:
          reportTypeValue === "schools_statistics_offers" ||
          reportTypeValue === "organisations_offers_statistics" ||
          reportTypeValue === "offer_statistics_comparison"
            ? OUTPUTFIELDS
            : [],
        current: Array.isArray(displayFields) ? displayFields.filter(f => f.type === "output") : [],
        fieldName: "output",
        title: "Kooperationenfelder auswählen"
      }
    };

    return configs[fieldType] as unknown as FieldConfig;
  };

  const config = getFieldConfig(type, reportType);
  const filteredAvailableFields = config.available.filter(
    field => !config.current.some(selected => selected.field === field.value)
  );

  const handleFieldSelect = (field: Field) => {
    const prevArray = Array.isArray(displayFields) ? displayFields : [];
    onDisplayFieldsChange([
      ...prevArray,
      {
        field: field.value,
        type: type,
        dataType: field.dataType as "number" | "string" | "boolean" | "date" | "array",
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

  const handleFieldOrderChange = (fieldValue: string, newOrder: number) => {
    const typeFields = displayFields.filter(f => f.type === type);
    const otherFields = displayFields.filter(f => f.type !== type);
    const oldIndex = typeFields.findIndex(f => f.field === fieldValue);
    const field = typeFields[oldIndex];
    typeFields.splice(oldIndex, 1);
    typeFields.splice(newOrder, 0, field);

    onDisplayFieldsChange([...otherFields, ...typeFields.map((f, index) => ({ ...f, order: index }))]);
  };

  if (config.available.length === 0) {
    return null;
  }

  return (
    <div id="field-selector">
      <label className="text-sm font-medium mb-2" htmlFor="selectedFields">{config.title}</label>
      <select
        name="selectedFields"
        value={""}
        onChange={e => {
          const selectedField = config.available.find(field => field.value === e.target.value);
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
      {config.current.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Ausgewählte Felder:</h3>
          <div className="flex flex-wrap gap-2">
            {config.current.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-100/10 rounded-full px-3 py-1"
              >
                <span>{config.available.find(f => f.value === field.field)?.label}</span>
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
