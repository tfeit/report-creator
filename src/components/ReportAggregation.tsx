"use client";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useReport } from "../hooks/useReport";
import { getAvailableFieldsForReport } from "../utils/reportFiltersUtils";
import { MetaDisplayFields } from "../types";
import SettingButton from "./ui/SettingButton";

const getFieldKey = (field: { type: string; field: string }) =>
  `${field.type}_${field.field}`;

const sortAndReindexFields = (
  fields: MetaDisplayFields,
  groupedOrder?: string[]
): MetaDisplayFields => {
  const grouped = fields.filter(field => field.grouping);
  const ungrouped = fields.filter(field => !field.grouping);

  const groupedSorted = groupedOrder
    ? grouped
        .slice()
        .sort(
          (a, b) =>
            (groupedOrder.indexOf(getFieldKey(a)) ?? 0) -
            (groupedOrder.indexOf(getFieldKey(b)) ?? 0)
        )
    : grouped.slice().sort((a, b) => a.order - b.order);

  const ungroupedSorted = ungrouped.slice().sort((a, b) => a.order - b.order);
  const combined = [...groupedSorted, ...ungroupedSorted];

  return combined.map((field, index) => ({
    ...field,
    order: index
  }));
};

export default function ReportAggregation() {
  const { displayFields, setDisplayFields, refetch, callbacks } = useReport();
  const [activeDropdown, setActiveDropdown] = useState(false);

  const availableFields = useMemo(
    () => getAvailableFieldsForReport(displayFields),
    [displayFields]
  );
  const groupedFields = useMemo(
    () => displayFields.filter(field => field.grouping).sort((a, b) => a.order - b.order),
    [displayFields]
  );
  const groupedKeys = useMemo(
    () => new Set(groupedFields.map(field => getFieldKey(field))),
    [groupedFields]
  );
  const addableFields = useMemo(
    () => availableFields.filter(field => !groupedKeys.has(field.value)),
    [availableFields, groupedKeys]
  );
  const fieldLabelMap = useMemo(
    () => new Map(availableFields.map(field => [field.value, field.label])),
    [availableFields]
  );

  const applyGroupingUpdate = async (nextFields: MetaDisplayFields) => {
    const success = await callbacks.onUpdateFields(nextFields);
    if (success) {
      setDisplayFields(nextFields);
      refetch();
    }
  };

  const handleAddGrouping = async (fieldValue: string) => {
    if (!fieldValue) return;
    const updatedFields = displayFields.map(field => {
      if (getFieldKey(field) === fieldValue) {
        return { ...field, grouping: true };
      }
      return field;
    });
    await applyGroupingUpdate(sortAndReindexFields(updatedFields));
  };

  const handleRemoveGrouping = async (fieldValue: string) => {
    const updatedFields = displayFields.map(field => {
      if (getFieldKey(field) === fieldValue) {
        return { ...field, grouping: false };
      }
      return field;
    });
    await applyGroupingUpdate(sortAndReindexFields(updatedFields));
  };

  const handleClearGrouping = async () => {
    const updatedFields = displayFields.map(field => ({
      ...field,
      grouping: false
    }));
    await applyGroupingUpdate(sortAndReindexFields(updatedFields));
  };

  const handleMoveGrouping = async (fieldValue: string, direction: "up" | "down") => {
    const currentIndex = groupedFields.findIndex(field => getFieldKey(field) === fieldValue);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= groupedFields.length) return;

    const nextOrder = groupedFields.map(field => getFieldKey(field));
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex]
    ];

    await applyGroupingUpdate(sortAndReindexFields(displayFields, nextOrder));
  };

  const dropdownLabel =
    groupedFields.length === 0
      ? "Gruppierung"
      : groupedFields.length === 1
        ? fieldLabelMap.get(getFieldKey(groupedFields[0])) ?? "Gruppierung"
        : `${groupedFields.length} Gruppierungen`;

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
            <div className="p-3 flex flex-col gap-4">
              {groupedFields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {groupedFields.map((field, index) => {
                    const fieldValue = getFieldKey(field);
                    return (
                      <div
                        key={fieldValue}
                        className="flex items-center justify-between p-2 rounded"
                      >
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                          {fieldLabelMap.get(fieldValue) ?? fieldValue}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveGrouping(fieldValue, "up")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 disabled:opacity-50"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveGrouping(fieldValue, "down")}
                            disabled={index === groupedFields.length - 1}
                            className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 disabled:opacity-50"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGrouping(fieldValue)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <select
                  value=""
                  onChange={event => handleAddGrouping(event.target.value)}
                >
                  <option value="" disabled>
                    Gruppierung hinzufügen
                  </option>
                  {addableFields.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {groupedFields.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearGrouping}
                    className="flex items-center gap-2 rounded-full text-gray-600 dark:text-gray-200 py-1.5 text-sm font-medium hover:bg-white/10"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Gruppierung löschen
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
