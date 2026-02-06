import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useReport } from "../hooks/useReport";

export default function ChartType() {
  const { refetch, chart, setChart, displayFields, setDisplayFields, callbacks } = useReport();

  const [aggregation, setAggregation] = useState<string>(
    displayFields.find((field: any) => field.aggregation === "sum")?.field || ""
  );

  const numberFields = useMemo(
    () => displayFields.filter((field: any) => field.dataType === "number"),
    [displayFields]
  );

  const buildDisplayFieldsForAggregation = useCallback(
    (value: string) =>
      displayFields.map((field: any) => {
        if (field.field === value) {
          return {
            ...field,
            aggregation: "sum"
          };
        }
        return {
          ...field,
          aggregation: "none"
        };
      }),
    [displayFields]
  );

  const persistChartSettings = useCallback(
    async (nextChart: string, nextDisplayFields: typeof displayFields) => {
      const success = await callbacks.onUpdateChart(nextChart, nextDisplayFields);
      if (success) {
        refetch();
      }
    },
    [callbacks, refetch]
  );

  const handleChartChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextChart = event.target.value;
    setChart(nextChart);
    await persistChartSettings(nextChart, displayFields);
  };

  const handleAggregationChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextAggregation = event.target.value;
    setAggregation(nextAggregation);
    const nextDisplayFields = buildDisplayFieldsForAggregation(nextAggregation);
    setDisplayFields(nextDisplayFields);
    await persistChartSettings(chart, nextDisplayFields);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Diagrammtyp</label>
        <select
          name="chart"
          value={chart}
          onChange={handleChartChange}
        >
          <option value="">Auswählen</option>
          <option value="bar">Balkendiagramm</option>
          <option value="pie">Kreisdiagramm</option>
          <option value="treemap">Baumdiagramm</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Wert</label>
        <select
          name="aggregation"
          value={aggregation}
          onChange={handleAggregationChange}
        >
          <option value="dataset">Datensatz</option>
          {numberFields.map((field: any) => (
            <option key={field.field} value={field.field}>
              {`Summe von ${field.field}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
