"use client";

import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useReport } from "../hooks/useReport";
import { getAvailableFieldsForReport } from "../utils/reportFiltersUtils";
import { MetaDisplayFields } from "../types";
import SettingButton from "./ui/SettingButton";

type SortDirection = "asc" | "desc";

type SortRule = {
  fieldValue: string;
  direction: SortDirection;
  sortOrder: number;
};

const DIRECTION_OPTIONS: Array<{ value: SortDirection; label: string }> = [
  { value: "asc", label: "Aufsteigend" },
  { value: "desc", label: "Absteigend" }
];

const buildSortRules = (fields: MetaDisplayFields): SortRule[] =>
  fields
    .filter(field => field.sort)
    .map((field, index) => ({
      fieldValue: `${field.type}_${field.field}`,
      direction: field.sort as SortDirection,
      sortOrder:
        typeof field.sortOrder === "number"
          ? field.sortOrder
          : typeof field.order === "number"
            ? field.order
            : index
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

const reindexSortOrders = (fields: MetaDisplayFields): MetaDisplayFields => {
  const sorted = fields
    .filter(field => field.sort)
    .slice()
    .sort(
      (a, b) =>
        (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0)
    );
  const orderMap = new Map(
    sorted.map((field, index) => [`${field.type}_${field.field}`, index])
  );

  return fields.map(field => {
    if (!field.sort) {
      return { ...field, sortOrder: undefined };
    }
    const key = `${field.type}_${field.field}`;
    const nextOrder = orderMap.get(key);
    return { ...field, sortOrder: nextOrder };
  });
};

export default function ReportSort() {
  const { displayFields, setDisplayFields, refetch, callbacks } = useReport();
  const [activeDropdown, setActiveDropdown] = useState(false);
  const availableFields = useMemo(
    () => getAvailableFieldsForReport(displayFields),
    [displayFields]
  );
  const sortRules = useMemo(
    () => buildSortRules(displayFields),
    [displayFields]
  );
  const fieldLabelMap = useMemo(
    () => new Map(availableFields.map(field => [field.value, field.label])),
    [availableFields]
  );

  const applySortUpdate = async (nextFields: MetaDisplayFields) => {
    const success = await callbacks.onUpdateFields(nextFields);
    if (success) {
      setDisplayFields(nextFields);
      refetch();
    }
  };

  const handleAddSort = async () => {
    const used = new Set(sortRules.map(rule => rule.fieldValue));
    const nextField = availableFields.find(field => !used.has(field.value));
    if (!nextField) return;

    const updatedFields = displayFields.map(field => {
      const fieldValue = `${field.type}_${field.field}`;
      if (fieldValue === nextField.value) {
        return {
          ...field,
          sort: "asc" as SortDirection,
          sortOrder: sortRules.length
        };
      }
      return field;
    });

    await applySortUpdate(reindexSortOrders(updatedFields));
  };

  const handleClearSort = async () => {
    const updatedFields = displayFields.map(field => ({
      ...field,
      sort: undefined,
      sortOrder: undefined
    }));
    await applySortUpdate(updatedFields);
  };

  const handleRemoveSort = async (fieldValue: string) => {
    const updatedFields = displayFields.map(field => {
      const currentValue = `${field.type}_${field.field}`;
      if (currentValue === fieldValue) {
        return { ...field, sort: undefined, sortOrder: undefined };
      }
      return field;
    });
    await applySortUpdate(reindexSortOrders(updatedFields));
  };

  const handleUpdateField = async (
    currentValue: string,
    nextValue: string
  ) => {
    if (currentValue === nextValue) return;
    const currentRule = sortRules.find(rule => rule.fieldValue === currentValue);
    if (!currentRule) return;

    const updatedFields = displayFields.map(field => {
      const fieldValue = `${field.type}_${field.field}`;
      if (fieldValue === currentValue) {
        return { ...field, sort: undefined, sortOrder: undefined };
      }
      if (fieldValue === nextValue) {
        return {
          ...field,
          sort: currentRule.direction,
          sortOrder: currentRule.sortOrder
        };
      }
      return field;
    });

    await applySortUpdate(reindexSortOrders(updatedFields));
  };

  const handleUpdateDirection = async (
    fieldValue: string,
    direction: SortDirection
  ) => {
    const updatedFields = displayFields.map(field => {
      const currentValue = `${field.type}_${field.field}`;
      if (currentValue === fieldValue) {
        return { ...field, sort: direction };
      }
      return field;
    });
    await applySortUpdate(updatedFields);
  };

  const dropdownLabel =
    sortRules.length === 0
      ? "Sortierung"
      : sortRules.length === 1
        ? fieldLabelMap.get(sortRules[0].fieldValue) ?? "Sortierung"
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
          <div className="absolute left-0 mt-2 w-[28rem] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-lg z-50">
            <div className="p-3 flex flex-col gap-3">
              {sortRules.map(rule => {
                const disabledValues = new Set(
                  sortRules
                    .filter(entry => entry.fieldValue !== rule.fieldValue)
                    .map(entry => entry.fieldValue)
                );
                return (
                  <div key={rule.fieldValue} className="flex items-center gap-2">
                    <select
                      value={rule.fieldValue}
                      onChange={event =>
                        handleUpdateField(rule.fieldValue, event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-500 bg-transparent text-sm px-3 py-2 max-w-60 h-7"
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
                          rule.fieldValue,
                          event.target.value as SortDirection
                        )
                      }
                      className="rounded-lg border border-gray-200 dark:border-gray-500 bg-transparent text-sm px-3 py-2 h-7"
                    >
                      {DIRECTION_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveSort(rule.fieldValue)}
                      className="text-red-500 hover:text-red-700 ml-auto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center gap-2">
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
