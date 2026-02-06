"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReport } from "../hooks/useReport";
import { getTransformedReportContent } from "../utils/utils";
import FilterGroupDropdowns from "./FilterGroupDropdowns";
import {
  addFilter,
  buildEmptyFilter,
  getAvailableFieldsForReport,
  getArrayFilterOptions,
  getSelectedFieldValues,
  removeFilter,
  updateFilterOperator,
  updateFilterValue
} from "../utils/reportFiltersUtils";
import SettingButton from "./ui/SettingButton";

export default function ReportFilters() {
  const {
    filters,
    setFilters,
    report,
    displayFields,
    reportContent,
    callbacks,
    refetchContent,
    config
  } = useReport();
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFiltersRef = useRef(filters);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const availableFieldsForReport = getAvailableFieldsForReport(displayFields, config);
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

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const toggleDropdown = (dropdownId: string) => {
    setActiveDropdown(current => (current === dropdownId ? null : dropdownId));
  };

  const applyFilters = (nextFilters: typeof filters) => {
    setFilters(nextFilters);
    latestFiltersRef.current = nextFilters;
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        const success = await callbacks.onUpdateFilters(latestFiltersRef.current);
        if (success) {
          refetchContent();
        }
      } catch (error) {
        console.error("Error updating filters:", error);
      }
    }, 300);
  };

  const handleAddFilter = (fieldValue: string) => {
    if (!fieldValue) return;
    const filterToAdd = buildEmptyFilter(fieldValue, config);
    applyFilters(addFilter(filters, filterToAdd));
    setActiveDropdown(null);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    applyFilters(removeFilter(filters, filterIndex));
  };

  const handleUpdateFilterOperator = (filterIndex: number, operator: string) => {
    applyFilters(updateFilterOperator(filters, filterIndex, operator));
  };

  const handleUpdateFilterValue = (filterIndex: number, value: string) => {
    applyFilters(updateFilterValue(filters, filterIndex, value));
  };

  const selectedFieldValues = getSelectedFieldValues(filters);
  const handleRemoveFilterAndClose = (filterIndex: number) => {
    handleRemoveFilter(filterIndex);
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" ref={dropdownContainerRef}>

      <FilterGroupDropdowns
        filters={filters}
        arrayFilterOptions={arrayFilterOptions}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        onRemoveFilter={handleRemoveFilterAndClose}
        onUpdateFilterOperator={handleUpdateFilterOperator}
        onUpdateFilterValue={handleUpdateFilterValue}
        config={config}
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
