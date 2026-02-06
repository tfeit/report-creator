import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import Input from "./ui/Input";
import { Filter, ReportConfig } from "../types";
import FilterArrayField from "./FilterArrayField";
import FilterDateField from "./FilterDateField";
import FilterNumberField from "./FilterNumberField";
import FilterStringField from "./FilterStringField";
import {
  getFieldDataType,
  getFieldLabelForFilter,
  getFieldOriginForFilter,
  getInputTypeForField,
  getOperatorOptionsForField
} from "../utils/reportFilterFieldUtils";
import SettingButton from "./ui/SettingButton";

type FilterGroupDropdownsProps = {
  filters: Filter[];
  arrayFilterOptions: Map<string, string[]>;
  activeDropdown: string | null;
  toggleDropdown: (dropdownId: string) => void;
  onRemoveFilter: (filterIndex: number) => void;
  onUpdateFilterOperator: (filterIndex: number, operator: string) => void;
  onUpdateFilterValue: (filterIndex: number, value: string) => void;
  config: ReportConfig;
};

export default function FilterGroupDropdowns({
  filters,
  arrayFilterOptions,
  activeDropdown,
  toggleDropdown,
  onRemoveFilter,
  onUpdateFilterOperator,
  onUpdateFilterValue,
  config
}: FilterGroupDropdownsProps) {
  return (
    <>
      {filters.map((filter: Filter, filterIndex: number) => {
          const filterKey = `${filterIndex}`;
          const fieldDataType = getFieldDataType(filter.field, config);
          const isArrayField = fieldDataType === "array";
          const isArrayEmptyOperator =
            filter.operator === "array_is_empty" || filter.operator === "array_is_not_empty";
          const arrayOptions = arrayFilterOptions.get(filter.field) ?? [];
          const selectedArrayValues = String(filter.value)
            .split("||")
            .filter(entry => entry.trim() !== "");

          return (
            <div key={filterKey} className="relative">
              <SettingButton
                dropdownLabel={getFieldLabelForFilter(filter.field, config)}
                action={activeDropdown === filterKey}
                setAction={() => toggleDropdown(filterKey)}
                icon={activeDropdown === filterKey ? ChevronUpIcon : ChevronDownIcon}
              />
              {activeDropdown === filterKey && (
                <div className="setting-dropdown">
                  <div className="p-3 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-2 w-full">
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getFieldOriginForFilter(filter.field, config)}
                        </div>
                        <select
                          name={`filter_${filterIndex}_operator`}
                          value={filter.operator}
                          onChange={e =>
                            onUpdateFilterOperator(filterIndex, e.target.value)
                          }
                        >
                          {getOperatorOptionsForField(filter.field, config).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFilter(filterIndex)}
                        className="w-5 h-5 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {fieldDataType === "number" ? (
                      <FilterNumberField
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        operator={filter.operator}
                        onChange={nextValue =>
                            onUpdateFilterValue(filterIndex, nextValue)
                        }
                      />
                    ) : fieldDataType === "date" ? (
                      <FilterDateField
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        operator={filter.operator}
                        onChange={nextValue =>
                          onUpdateFilterValue(filterIndex, nextValue)
                        }
                      />
                    ) : fieldDataType === "string" ? (
                      <FilterStringField
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        onChange={nextValue =>
                          onUpdateFilterValue(filterIndex, nextValue)
                        }
                      />
                    ) : isArrayField ? (
                      !isArrayEmptyOperator && (
                        <FilterArrayField
                          selectedValues={selectedArrayValues}
                          options={arrayOptions}
                          onClear={() => onUpdateFilterValue(filterIndex, "")}
                          onChange={nextValues =>
                            onUpdateFilterValue(filterIndex, nextValues.join("||"))
                          }
                        />
                      )
                    ) : (
                      <Input
                        name={`filter_${filterIndex}_value`}
                        type={getInputTypeForField(filter.field, config)}
                        value={String(filter.value)}
                        onChange={e =>
                          onUpdateFilterValue(filterIndex, e.target.value)
                        }
                        placeholder="Wert eingeben"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}
