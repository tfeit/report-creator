import { RectangleStackIcon, Square3Stack3DIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import IconCheckbox from "./ui/IconCheckbox";
import Popup from "./ui/Popup";
import { useReport } from "../hooks/useReport";
import { ReportDataSource, ReportDataSourceOption } from "../types";

export default function PopupChangeData({ setShowPopup }: { setShowPopup: (show: boolean) => void }) {
  const { report, refetch, refetchContent, callbacks, dataSources } = useReport();

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const activeSource = (dataSources ?? []).find(source => source.id === selectedSourceId) || null;

  const handleSelectSource = (source: ReportDataSource) => {
    setSelectedSourceId(source.id);
    setSelectedValues([]);
  };

  const handleSelectValue = (value: string) => {
    if (!activeSource) return;
    if (activeSource.selection === "single") {
      setSelectedValues(value ? [value] : []);
      return;
    }
    if (value && !selectedValues.includes(value)) {
      setSelectedValues(prev => [...prev, value]);
    }
  };

  const removeSelectedValue = (value: string) => {
    setSelectedValues(prev => prev.filter(entry => entry !== value));
  };

  const renderSelect = (
    name: string,
    value: string,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
    options: { value: string; label: string }[]
  ) => (
    <select
    name={name} value={value} onChange={onChange}>
      <option value="">Auswählen</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const renderSelectedValues = (options: ReportDataSourceOption[]) => (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Ausgewählte Einträge:</h3>
      <div className="flex flex-wrap gap-2">
        {selectedValues.map(value => {
          const selected = options.find(option => option.value === value);
          if (!selected) return null;
          return (
            <div
              key={value}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-100/10 rounded-full px-3 py-1"
            >
              <span>{selected.label}</span>
              <button
                onClick={() => removeSelectedValue(value)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  let conditions = "";
  if (activeSource && selectedValues.length > 0) {
    if (activeSource.selection === "single") {
      conditions = JSON.stringify([
        { key: activeSource.conditionKey, value: selectedValues[0], operator: "=" }
      ]);
    } else {
      conditions = JSON.stringify(
        selectedValues.map(value => ({ key: activeSource.conditionKey, value, operator: "=" }))
      );
    }
  }

  const handleSubmit = async () => {
    const success = await callbacks.onUpdateConditions(conditions);
    if (success) {
      setShowPopup(false);
      refetch();
      refetchContent();
    }
  };

  useEffect(() => {
    if (report?.conditions) {
      try {
        const parsedConditions =
          typeof report.conditions === "string" ? JSON.parse(report.conditions) : report.conditions;

        if (Array.isArray(parsedConditions) && parsedConditions.length > 0 && dataSources?.length) {
          const matchedSource = dataSources.find(source =>
            parsedConditions.some((cond: any) => cond.key === source.conditionKey)
          );
          if (matchedSource) {
            const matchingValues = parsedConditions
              .filter((cond: any) => cond.key === matchedSource.conditionKey)
              .map((cond: any) => cond.value)
              .filter((value: string) => value !== null && value !== undefined);
            setSelectedSourceId(matchedSource.id);
            setSelectedValues(
              matchedSource.selection === "single"
                ? matchingValues.slice(0, 1)
                : matchingValues
            );
          }
        }
      } catch (error) {
        console.error("Fehler beim Parsen der Bedingungen:", error);
      }
    }
  }, [report?.conditions, dataSources]);

  return (
    <Popup
      title="Datenbasis"
      onClose={() => setShowPopup(false)}
      onClick={() => handleSubmit()}
      onClickTitle={"Aktualisieren"}
      onBack={() => setShowPopup(false)}
      onBackTitle={"Abbrechen"}
    >
      <div id="report-setup-step-1" className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 w-full justify-between flex-wrap">
            {(dataSources ?? []).map(source => {
              const icon =
                source.selection === "multi"
                  ? <Square3Stack3DIcon className="min-w-6 min-h-6" />
                  : <RectangleStackIcon className="min-w-6 min-h-6" />;
              return (
                <IconCheckbox
                  key={source.id}
                  icon={icon}
                  label={source.label}
                  isChecked={selectedSourceId === source.id}
                  iconPosition="left"
                  onChange={() => handleSelectSource(source)}
                  id={source.id}
                />
              );
            })}
          </div>
        </div>

        {!dataSources?.length && (
          <div className="text-sm text-gray-500">Keine Datenquellen vorhanden.</div>
        )}

        {activeSource && (
          <>
            {renderSelect(
              "selectedSourceValues",
              activeSource.selection === "single" ? (selectedValues[0] ?? "") : "",
              e => handleSelectValue(e.target.value),
              activeSource.selection === "multi"
                ? activeSource.options.filter(option => !selectedValues.includes(option.value))
                : activeSource.options
            )}
            {activeSource.selection === "multi" && selectedValues.length > 0 && (
              renderSelectedValues(activeSource.options)
            )}
          </>
        )}
      </div>
    </Popup>
  );
}
