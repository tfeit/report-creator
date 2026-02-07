"use client";

import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useReport } from "../hooks/useReport";
import { getAvailableFieldsForReport } from "../utils/reportFiltersUtils";
import { Sorting } from "../types";
import SettingButton from "./ui/SettingButton";

type SortDirection = "asc" | "desc";

const DIRECTION_OPTIONS: Array<{ value: SortDirection; label: string }> = [
  { value: "asc", label: "Aufsteigend" },
  { value: "desc", label: "Absteigend" }
];

const normalizeSorting = (rules: Sorting[]): Sorting[] =>
  rules
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((rule, index) => ({ ...rule, order: index }));

export default function ReportSort() {
  const { displayFields, sorting, setSorting, refetch, callbacks, config } = useReport();
  const [activeDropdown, setActiveDropdown] = useState(false);
  const availableFields = useMemo(
    () => getAvailableFieldsForReport(displayFields, config),
    [displayFields, config]
  );
  const sortRules = useMemo(
    () => sorting.slice().sort((a, b) => a.order - b.order),
    [sorting]
  );
  const fieldLabelMap = useMemo(
    () => new Map(availableFields.map(field => [field.value, field.label])),
    [availableFields]
  );

  const applySortUpdate = async (nextSorting: Sorting[]) => {
    const normalizedSorting = normalizeSorting(nextSorting);
    const sortingSuccess = await callbacks.onUpdateSorting(normalizedSorting);
    if (sortingSuccess) {
      setSorting(normalizedSorting);
      refetch();
    }
  };

  const handleAddSort = async () => {
    const used = new Set(sortRules.map(rule => rule.field));
    const nextField = availableFields.find(field => !used.has(field.value));
    if (!nextField) return;

    await applySortUpdate([
      ...sortRules,
      {
        field: nextField.value,
        direction: "asc",
        order: sortRules.length
      }
    ]);
  };

  const handleClearSort = async () => {
    await applySortUpdate([]);
  };

  const handleRemoveSort = async (fieldValue: string) => {
    await applySortUpdate(sortRules.filter(rule => rule.field !== fieldValue));
  };

  const handleUpdateField = async (
    currentValue: string,
    nextValue: string
  ) => {
    if (currentValue === nextValue) return;
    const currentRule = sortRules.find(rule => rule.field === currentValue);
    if (!currentRule) return;

    const updatedSorting = sortRules.map(rule =>
      rule.field === currentValue
        ? { ...rule, field: nextValue }
        : rule
    );
    await applySortUpdate(updatedSorting);
  };

  const handleUpdateDirection = async (
    fieldValue: string,
    direction: SortDirection
  ) => {
    const updatedSorting = sortRules.map(rule =>
      rule.field === fieldValue ? { ...rule, direction } : rule
    );
    await applySortUpdate(updatedSorting);
  };

  const dropdownLabel =
    sortRules.length === 0
      ? "Sortierung"
      : sortRules.length === 1
        ? fieldLabelMap.get(sortRules[0].field) ?? "Sortierung"
        : `${sortRules.length} Sortierungen`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SettingButton
          dropdownLabel={dropdownLabel}
          action={activeDropdown}
          setAction={setActiveDropdown}
          icon={activeDropdown ? ChevronUpIcon : ChevronDownIcon}
        />

        {activeDropdown && (
          <div className="setting-dropdown">
            <div className="p-3 flex flex-col gap-3">
              {sortRules.map(rule => {
                const disabledValues = new Set(
                  sortRules
                    .filter(entry => entry.field !== rule.field)
                    .map(entry => entry.field)
                );
                return (
                  <div key={rule.field} className="flex items-center gap-2">
                    <select
                      value={rule.field}
                      onChange={event =>
                        handleUpdateField(rule.field, event.target.value)
                      }
                    >
                      {availableFields.map(field => (
                        <option
                          key={field.value}
                          value={field.value}
                          disabled={disabledValues.has(field.value)}
                        >
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.direction}
                      onChange={event =>
                        handleUpdateDirection(
                          rule.field,
                          event.target.value as SortDirection
                        )
                      }
                    >
                      {DIRECTION_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveSort(rule.field)}
                      className="text-red-500 hover:text-red-700 ml-auto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAddSort}
                  className="flex items-center gap-2 rounded-full text-gray-600 dark:text-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
                >
                  <PlusIcon className="w-4 h-4" />
                  Sortierung hinzufügen
                </button>

                {sortRules.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSort}
                    className="flex items-center gap-2 rounded-full text-gray-600 dark:text-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Sortierung löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
