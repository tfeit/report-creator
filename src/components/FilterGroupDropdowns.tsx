import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import Input from "./ui/Input";
import { Filter } from "../types";
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
  filters: Array<{ filters: Filter[]; connectors: string[] }>;
  arrayFilterOptions: Map<string, string[]>;
  activeDropdown: string | null;
  toggleDropdown: (dropdownId: string) => void;
  onRemoveFilter: (groupIndex: number, filterIndex: number) => void;
  onUpdateFilterOperator: (groupIndex: number, filterIndex: number, operator: string) => void;
  onUpdateFilterValue: (groupIndex: number, filterIndex: number, value: string) => void;
  isDefaultRangeFilter: (filter: Filter) => boolean;
};

export default function FilterGroupDropdowns({
  filters,
  arrayFilterOptions,
  activeDropdown,
  toggleDropdown,
  onRemoveFilter,
  onUpdateFilterOperator,
  onUpdateFilterValue,
  isDefaultRangeFilter
}: FilterGroupDropdownsProps) {
  return (
    <>
      {filters.map((group, groupIndex) => {
        const groupFilters = (group as any).filters as Filter[];
        const hasOnlyDefault = groupFilters.length === 1 && isDefaultRangeFilter(groupFilters[0]);
        if (hasOnlyDefault) {
          return null;
        }
        return groupFilters.map((filter: Filter, filterIndex: number) => {
          if (isDefaultRangeFilter(filter)) {
            return null;
          }
          const filterKey = `${groupIndex}-${filterIndex}`;
          const fieldDataType = getFieldDataType(filter.field);
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
                dropdownLabel={getFieldLabelForFilter(filter.field)}
                action={activeDropdown === filterKey}
                setAction={() => toggleDropdown(filterKey)}
                icon={activeDropdown === filterKey ? ChevronUpIcon : ChevronDownIcon}
              />
              {activeDropdown === filterKey && (
                <div className="absolute left-0 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-lg z-50">
                  <div className="p-3 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-2 w-full">
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getFieldOriginForFilter(filter.field)}
                        </div>
                        {filterIndex > 0 && (
                          <input
                            type="hidden"
                            name={`filter_${groupIndex}_${filterIndex}_connector`}
                            value="AND"
                          />
                        )}
                        <select
                          name={`filter_${groupIndex}_${filterIndex}_operator`}
                          value={filter.operator}
                          className="w-full h-8 text-sm border border-gray-200 dark:border-gray-500 rounded-md bg-transparent"
                          onChange={e =>
                            onUpdateFilterOperator(groupIndex, filterIndex, e.target.value)
                          }
                        >
                          {getOperatorOptionsForField(filter.field).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFilter(groupIndex, filterIndex)}
                        className="w-5 h-5 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {fieldDataType === "number" ? (
                      <FilterNumberField
                        groupIndex={groupIndex}
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        operator={filter.operator}
                        onChange={nextValue =>
                          onUpdateFilterValue(groupIndex, filterIndex, nextValue)
                        }
                      />
                    ) : fieldDataType === "date" ? (
                      <FilterDateField
                        groupIndex={groupIndex}
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        operator={filter.operator}
                        onChange={nextValue =>
                          onUpdateFilterValue(groupIndex, filterIndex, nextValue)
                        }
                      />
                    ) : fieldDataType === "string" ? (
                      <FilterStringField
                        groupIndex={groupIndex}
                        filterIndex={filterIndex}
                        value={String(filter.value)}
                        onChange={nextValue =>
                          onUpdateFilterValue(groupIndex, filterIndex, nextValue)
                        }
                      />
                    ) : isArrayField ? (
                      !isArrayEmptyOperator && (
                        <FilterArrayField
                          selectedValues={selectedArrayValues}
                          options={arrayOptions}
                          onClear={() => onUpdateFilterValue(groupIndex, filterIndex, "")}
                          onChange={nextValues =>
                            onUpdateFilterValue(groupIndex, filterIndex, nextValues.join("||"))
                          }
                        />
                      )
                    ) : (
                      <Input
                        name={`filter_${groupIndex}_${filterIndex}_value`}
                        type={getInputTypeForField(filter.field)}
                        value={String(filter.value)}
                        onChange={e =>
                          onUpdateFilterValue(groupIndex, filterIndex, e.target.value)
                        }
                        placeholder="Wert eingeben"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        });
      })}
    </>
  );
}
