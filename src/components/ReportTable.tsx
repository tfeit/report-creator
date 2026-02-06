import React, { Component, Suspense, useMemo, useState } from "react";
import Button from "./ui/Button";
import Popup from "./ui/Popup";
import TableWithGroups from "./ui/TableWithGroups";
import ReportChartWrapper from "./ReportChartWrapper";
import { getFieldLabelFromConfig, getTransformedReportContent } from "../utils/utils";
import { Filter, MetaDisplayFields, Report as ReportType } from "../types";
import { useReport } from "../hooks/useReport";

interface TableErrorBoundaryState {
  hasError: boolean;
}

interface TableErrorBoundaryProps {
  children: React.ReactNode;
}

interface ReportTableProps {
  showChart: boolean;
  handleGroupByColumn: (columnId: string) => void;
  handleSortByColumn: (columnId: string, sortDirection: "asc" | "desc") => Promise<void>;
}

class TableErrorBoundary extends Component<TableErrorBoundaryProps, TableErrorBoundaryState> {
  constructor(props: TableErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): TableErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Fehler in der Tabelle:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          Es gab ein Problem beim Laden der Tabelle. Bitte versuchen Sie es später erneut.
        </div>
      );
    }

    return this.props.children;
  }
}

const isDateLike = (value: unknown): boolean => {
  if (value instanceof Date) return true;
  if (typeof value !== "string") return false;
  return /[-/T]/.test(value);
};

const toDateMs = (value: unknown): number | null => {
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? null : parsed;
};

const toNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeSortValue = (
  value: unknown,
  dataType?: string
): string | number | null => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  if (dataType === "date") {
    return toDateMs(value);
  }
  if (dataType === "number") {
    return toNumber(value);
  }
  if (dataType === "boolean") {
    return value ? 1 : 0;
  }
  if (dataType === "array") {
    return Array.isArray(value)
      ? value.map(entry => String(entry)).join(", ").toLowerCase()
      : String(value).toLowerCase();
  }
  if (isDateLike(value)) {
    return toDateMs(value);
  }
  return typeof value === "number"
    ? value
    : String(value).toLowerCase();
};

function ReportTable({ handleGroupByColumn, handleSortByColumn, showChart }: ReportTableProps): React.ReactNode {
  const [selectedCooperations, setSelectedCooperations] = useState<any>(null);
  const { report, reportContent, loadingContent, displayFields, filters, config } = useReport();

  const hasGrouping = displayFields.some(field => field.grouping);
  const reportType = report?.type;

  const transformedData = useMemo(() => {
    if (!reportContent || reportContent.length === 0) {
      return [];
    }

    let data: any[] = getTransformedReportContent(
      reportContent,
      reportType ? ({ type: reportType } as ReportType) : undefined
    );

    if (filters && Array.isArray(filters) && filters.length > 0) {
      const isFilterApplied = (filter: Filter) => {
        if (!filter.operator) return false;
        if (filter.operator === "array_is_empty" || filter.operator === "array_is_not_empty") {
          return true;
        }
        if (filter.operator === "array_contains" || filter.operator === "array_not_contains") {
          const selectedValues = String(filter.value)
            .split("||")
            .filter(entry => entry.trim() !== "");
          return selectedValues.length > 0;
        }
        if (filter.operator === "between") {
          const [rawFrom, rawTo] = String(filter.value).split("|");
          return Boolean(rawFrom) && Boolean(rawTo);
        }
        return Boolean(String(filter.value).trim());
      };

      const matchesFilter = (item: any, filter: Filter) => {
        const value = item[filter.field];
        const filterValue = filter.value;
        let currentResult = true;
        switch (filter.operator) {
          case "equals":
            if (isDateLike(value) || isDateLike(filterValue)) {
              const left = toDateMs(value);
              const right = toDateMs(filterValue);
              currentResult = left !== null && right !== null && left === right;
            } else if (toNumber(value) !== null && toNumber(filterValue) !== null) {
              currentResult = Number(value) === Number(filterValue);
            } else {
              currentResult = String(value) === String(filterValue);
            }
            break;
          case "greater":
            if (isDateLike(value) || isDateLike(filterValue)) {
              const left = toDateMs(value);
              const right = toDateMs(filterValue);
              currentResult = left !== null && right !== null && left > right;
            } else {
              const left = toNumber(value);
              const right = toNumber(filterValue);
              currentResult = left !== null && right !== null && left > right;
            }
            break;
          case "less":
            if (isDateLike(value) || isDateLike(filterValue)) {
              const left = toDateMs(value);
              const right = toDateMs(filterValue);
              currentResult = left !== null && right !== null && left < right;
            } else {
              const left = toNumber(value);
              const right = toNumber(filterValue);
              currentResult = left !== null && right !== null && left < right;
            }
            break;
          case "contains":
            currentResult = String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            break;
          case "startsWith":
            currentResult = String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
            break;
          case "endsWith":
            currentResult = String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
            break;
          case "between": {
            const [rawFrom, rawTo] = String(filterValue).split("|");
            const hasFrom = Boolean(rawFrom);
            const hasTo = Boolean(rawTo);
            if (!hasFrom && !hasTo) {
              currentResult = true;
              break;
            }
            const useDate = isDateLike(value) || isDateLike(rawFrom) || isDateLike(rawTo);
            if (useDate) {
              const current = toDateMs(value);
              const from = hasFrom ? toDateMs(rawFrom) : null;
              const to = hasTo ? toDateMs(rawTo) : null;
              if (current === null || (hasFrom && from === null) || (hasTo && to === null)) {
                currentResult = false;
              } else if (hasFrom && hasTo) {
                currentResult = current >= (from as number) && current <= (to as number);
              } else if (hasFrom) {
                currentResult = current >= (from as number);
              } else {
                currentResult = current <= (to as number);
              }
            } else {
              const current = toNumber(value);
              const from = hasFrom ? toNumber(rawFrom) : null;
              const to = hasTo ? toNumber(rawTo) : null;
              if (current === null || (hasFrom && from === null) || (hasTo && to === null)) {
                currentResult = false;
              } else if (hasFrom && hasTo) {
                currentResult = current >= (from as number) && current <= (to as number);
              } else if (hasFrom) {
                currentResult = current >= (from as number);
              } else {
                currentResult = current <= (to as number);
              }
            }
            break;
          }
          case "array_contains": {
            if (!Array.isArray(value)) {
              currentResult = false;
              break;
            }
            const selectedValues = String(filterValue)
              .split("||")
              .filter(entry => entry.trim() !== "")
              .map(entry => entry.toLowerCase());
            const normalized = value
              .filter((entry: any) => entry !== null && entry !== undefined)
              .map((entry: string) => entry.toLowerCase());
            currentResult = selectedValues.every(entry => normalized.includes(entry));
            break;
          }
          case "array_not_contains": {
            if (!Array.isArray(value)) {
              currentResult = true;
              break;
            }
            const selectedValues = String(filterValue)
              .split("||")
              .filter(entry => entry.trim() !== "")
              .map(entry => entry.toLowerCase());
            const normalized = value
              .filter((entry: any) => entry !== null && entry !== undefined)
              .map((entry: string) => entry.toLowerCase());
            currentResult = selectedValues.some(entry => !normalized.includes(entry));
            break;
          }
          case "array_is_empty": {
            if (Array.isArray(value)) {
              currentResult = value.length === 0;
            } else {
              currentResult = value === null || value === undefined || String(value).trim() === "";
            }
            break;
          }
          case "array_is_not_empty": {
            if (Array.isArray(value)) {
              currentResult = value.length > 0;
            } else {
              currentResult = value !== null && value !== undefined && String(value).trim() !== "";
            }
            break;
          }
          default:
            currentResult = true;
        }
        return currentResult;
      };

      data = data.filter(item =>
        filters.every(filter => {
          if (!isFilterApplied(filter)) {
            return true;
          }
          return matchesFilter(item, filter);
        })
      );
    }

    const sortRules = displayFields
      .filter(field => field.sort)
      .map(field => ({
        accessorKey: `${field.type}_${field.field}`,
        direction: field.sort as "asc" | "desc",
        dataType: field.dataType,
        sortOrder: field.sortOrder ?? field.order ?? 0
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (sortRules.length > 0) {
      data = [...data].sort((left, right) => {
        for (const rule of sortRules) {
          const leftValue = normalizeSortValue(left[rule.accessorKey], rule.dataType);
          const rightValue = normalizeSortValue(right[rule.accessorKey], rule.dataType);

          let comparison = 0;
          if (leftValue === null && rightValue === null) {
            comparison = 0;
          } else if (leftValue === null) {
            comparison = 1;
          } else if (rightValue === null) {
            comparison = -1;
          } else if (leftValue < rightValue) {
            comparison = -1;
          } else if (leftValue > rightValue) {
            comparison = 1;
          }

          if (comparison !== 0) {
            return rule.direction === "desc" ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return data;
  }, [reportContent, reportType, filters, displayFields]);

  if (loadingContent || !reportContent || reportContent.length === 0) {
    return <div>Lade Daten...</div>;
  }

  if (!transformedData || transformedData.length === 0) {
    return <div>Keine Daten gefunden</div>;
  }

  const sortedDisplayFields = [...displayFields].filter(field => field.visible).sort((a, b) => a.order - b.order);

  const columns = sortedDisplayFields
    .map(displayField => {
      const key = `${displayField.type}_${displayField.field}`;
      const headerName = getFieldLabelFromConfig(config, displayField.type, displayField.field);
      const isArrayField = displayField.dataType === "array";

      return {
        accessorKey: key,
        header: headerName,
        enableColumnFilter: false,
        grouping: displayField.grouping,
        cell: ({ row }: { row: { original: any } }) => {
          const value = row.original[key];
          if (key === "cooperations") {
            return (
              <Button
                onClick={() => setSelectedCooperations(value)}
                size="square"
                variant="outlined"
                color="transparent"
              >
                Anzeigen
              </Button>
            );
          }
          if (isArrayField) {
            return (
              <div className="max-w-2xs truncate" title={Array.isArray(value) ? value.join(", ") : ""}>
                {Array.isArray(value) ? value.join(", ") : ""}
              </div>
            );
          }
          if (typeof value === "object" && value !== null) {
            return (
              <div className="max-w-2xs truncate" title={JSON.stringify(value)}>
                {JSON.stringify(value)}
              </div>
            );
          }
          return <div className="max-w-2xs truncate">{value || ""}</div>;
        }
      };
    })
    .filter(Boolean);

  return (
    <TableErrorBoundary>
      {hasGrouping && showChart && (
        <Suspense fallback={<></>}>
          <ReportChartWrapper data={transformedData} />
        </Suspense>
      )}

      <div className="max-w-full w-full overflow-x-auto mt-4">
        <TableWithGroups
          loading={loadingContent}
          data={transformedData}
          columns={columns}
          dense={true}
          noDataMessage={"Keine Einträge gefunden"}
          handleGroupByColumn={handleGroupByColumn}
          displayFields={displayFields as MetaDisplayFields}
          config={config}
        />
      </div>

      {selectedCooperations && (
        <Popup
          title="Kooperationen"
          onClose={() => setSelectedCooperations(null)}
        >
          <div className="space-y-4">
            {Array.isArray(selectedCooperations) ? (
              selectedCooperations.map((coop: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(coop, null, 2)}</pre>
                </div>
              ))
            ) : (
              <pre className="whitespace-pre-wrap">{JSON.stringify(selectedCooperations, null, 2)}</pre>
            )}
          </div>
        </Popup>
      )}
    </TableErrorBoundary>
  );
}

export default ReportTable;
