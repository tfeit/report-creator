"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter } from "../types";
import { useReport } from "../hooks/useReport";
import { getTransformedReportContent } from "../utils/utils";
import FilterGroupDropdowns from "./FilterGroupDropdowns";
import {
  addFilterToGroups,
  buildEmptyFilter,
  getAvailableFieldsForReport,
  getArrayFilterOptions,
  getDefaultRangeFieldForReport,
  getSelectedFieldValues,
  removeFilterFromGroups,
  updateFilterOperatorInGroups,
  updateFilterValueInGroups
} from "../utils/reportFiltersUtils";
import SettingButton from "./ui/SettingButton";

export default function ReportFilters() {
  const { filters, setFilters, report, displayFields, reportContent } = useReport();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const availableFieldsForReport = getAvailableFieldsForReport(displayFields);
  const defaultRangeField = getDefaultRangeFieldForReport(displayFields, report?.type);
  const transformedData = useMemo(
    () => getTransformedReportContent(reportContent, report),
    [reportContent, report?.type]
  );
  const arrayFilterOptions = useMemo(() => {
    const optionsByField = new Map<string, string[]>();
    availableFieldsForReport.forEach(field => {
      if (field.dataType === "array") {
        optionsByField.set(field.value, getArrayFilterOptions(transformedData, field.value));
      }
    });
    return optionsByField;
  }, [availableFieldsForReport, transformedData]);

  useEffect(() => {
    if (filters.length === 0 && defaultRangeField) {
      setFilters([
        {
          filters: [{ field: defaultRangeField, operator: "between", value: "|" }],
          connectors: []
        }
      ]);
    }
  }, [filters.length, defaultRangeField, setFilters]);

  useEffect(() => {
    if (!activeDropdown) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (dropdownContainerRef.current && target && !dropdownContainerRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activeDropdown]);

  const toggleDropdown = (dropdownId: string) => {
    setActiveDropdown(current => (current === dropdownId ? null : dropdownId));
  };

  const handleAddFilter = (fieldValue: string) => {
    if (!fieldValue) return;
    const filterToAdd = buildEmptyFilter(fieldValue);
    setFilters(addFilterToGroups(filters, filterToAdd, isDefaultRangeFilter));
    setActiveDropdown(null);
  };

  const handleRemoveFilter = (groupIndex: number, filterIndex: number) => {
    setFilters(removeFilterFromGroups(filters, groupIndex, filterIndex));
  };

  const handleUpdateFilterOperator = (groupIndex: number, filterIndex: number, operator: string) => {
    setFilters(updateFilterOperatorInGroups(filters, groupIndex, filterIndex, operator));
  };

  const handleUpdateFilterValue = (groupIndex: number, filterIndex: number, value: string) => {
    setFilters(updateFilterValueInGroups(filters, groupIndex, filterIndex, value));
  };

  const isDefaultRangeFilter = (filter: Filter) =>
    Boolean(defaultRangeField) && filter.field === defaultRangeField && filter.operator === "between";
  const selectedFieldValues = getSelectedFieldValues(filters);
  const handleRemoveFilterAndClose = (groupIndex: number, filterIndex: number) => {
    handleRemoveFilter(groupIndex, filterIndex);
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" ref={dropdownContainerRef}>

      <FilterGroupDropdowns
        filters={filters as Array<{ filters: Filter[]; connectors: string[] }>}
        arrayFilterOptions={arrayFilterOptions}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        onRemoveFilter={handleRemoveFilterAndClose}
        onUpdateFilterOperator={handleUpdateFilterOperator}
        onUpdateFilterValue={handleUpdateFilterValue}
        isDefaultRangeFilter={isDefaultRangeFilter}
      />

      <div className="relative">
        <SettingButton
          dropdownLabel="Filter"
          action={activeDropdown === "add"}
          setAction={() => setActiveDropdown("add")}
          icon={PlusIcon}
        />
        {activeDropdown === "add" && (
          <div className="setting-dropdown">
            <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
              {availableFieldsForReport.map(field => {
                const isSelected = selectedFieldValues.has(field.value);
                return (
                  <button
                    key={field.value}
                    type="button"
                    onClick={() => handleAddFilter(field.value)}
                    disabled={isSelected}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                      isSelected
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80"
                    }`}
                  >
                    {field.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
