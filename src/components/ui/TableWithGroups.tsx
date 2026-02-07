import clsx from "clsx";
import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef
} from "@tanstack/react-table";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import DropdownMenu from "./DropdownMenu";
import Button from "./Button";
import { Field, ReportConfig } from "../../types";
import { getFieldLabelFromConfig } from "../../utils/utils";
import {
  TableBody,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
  TablePagination
} from "./Table/TableComponents";
import { groupDataRecursive } from "../../helpers/tableGrouping";

export type GroupableColumnDef<T> = ColumnDef<T> & {
  grouping?: boolean;
  accessorKey?: string;
  cell?: (props: { row: { original: any } }) => React.ReactNode;
};

interface TableNewProps {
  loading: boolean;
  data: any[];
  columns: GroupableColumnDef<any>[];
  actions?: { onClick: (row: any) => void }[];
  noDataMessage?: string;
  bleed?: boolean;
  dense?: boolean;
  grid?: boolean;
  striped?: boolean;
  addButton?: boolean;
  onClickAddButton?: () => void;
  enableSearch?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  enableTabs?: boolean;
  tabKey?: string;
  setCurrentTab?: (tab: string) => void;
  displayFields: Field[];
  handleGroupByColumn: (columnId: string) => void;
  handleRemoveField: (columnId: string) => void;
  config: ReportConfig;
}

const TableWithGroups: React.FC<TableNewProps> = ({
  loading,
  data,
  columns,
  noDataMessage,
  bleed = false,
  dense = false,
  grid = true,
  striped = false,
  addButton = false,
  onClickAddButton = () => {},
  enablePagination = false,
  pageSize = 10,
  enableTabs = false,
  tabKey = "status",
  setCurrentTab,
  displayFields,
  handleGroupByColumn,
  handleRemoveField,
  config
}) => {
  const [sorting, setSorting] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(enableTabs ? "active" : null);

  const dataTypeByKey = React.useMemo(() => {
    const entries: Array<[string, Field["dataType"]]> = [];
    displayFields.forEach(field => {
      entries.push([`${field.field}_${field.type}`, field.dataType]);
      entries.push([`${field.type}_${field.field}`, field.dataType]);
    });
    return new Map(entries);
  }, [displayFields]);

  const isArrayField = (fieldKey: string | undefined) =>
    fieldKey ? dataTypeByKey.get(fieldKey) === "array" : false;

  useEffect(() => {
    if (setCurrentTab && activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab, setCurrentTab]);

  const filteredData = React.useMemo(() => {
    if (!activeTab) return data;
    if (activeTab === "active") {
      return data.filter(item => item[tabKey] === "draft" || item[tabKey] === "publish");
    }
    return data.filter(item => item[tabKey] === activeTab);
  }, [data, activeTab, tabKey]);

  const generateColumns = React.useMemo(() => {
    const displayFieldsArray = Array.isArray(displayFields) ? displayFields : [];

    return displayFieldsArray
      .filter(field => field?.visible)
      .sort((a, b) => a.order - b.order)
      .map(field => ({
        accessorKey: `${field.field}_${field.type}`,
        header: getFieldLabelFromConfig(config, field.type, field.field),
        size: field.width ? field.width : undefined,
        cell: ({ row }: { row: any }) => {
          const value = row.original[field.field];

          if (Array.isArray(value)) {
            return (
              <div className="max-w-2xs truncate" title={value.join(", ")}>
                {value.join(", ")}
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

          return (
            <div className="max-w-2xs truncate">
              {value || ""}
            </div>
          );
        }
      }));
  }, [displayFields, config]);

  const groupedData = React.useMemo(() => {
    const groupingColumns = columns.filter(col => col.grouping);
    if (groupingColumns.length === 0) return data;

    const hasAggregation = displayFields.some(
      field => field.aggregation === "sum" || field.aggregation === "count"
    );
    const grouped = groupDataRecursive(data, groupingColumns as any, 0, hasAggregation);
    return grouped;
  }, [data, columns, displayFields]);

  const table = useReactTable({
    data: filteredData,
    columns: generateColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize
      }
    }
  });

  const handleColumnAction = (header: any, action: string) => {
    if (action === "sort") {
      header.column.toggleSorting();
    } else if (action === "group") {
      const columnId = header.column.id;
      handleGroupByColumn(columnId);
    } else if (action === "remove") {
      const columnId = header.column.id;
      handleRemoveField(columnId);
    }
  };

  const resolveDisplayField = (columnId: string) =>
    displayFields.find(field => `${field.type}_${field.field}` === columnId) ||
    displayFields.find(field => `${field.field}_${field.type}` === columnId);

  return (
    <div className="max-w-full">
      {enableTabs && (
        <div className="flex gap-4 mb-4">
          <Button
            variant={activeTab === "active" ? "filled" : "outlined"}
            size="regular"
            onClick={() => setActiveTab("active")}
          >
            Aktiv
          </Button>
          <Button
            variant={activeTab === "archive" ? "filled" : "outlined"}
            size="regular"
            onClick={() => setActiveTab("archive")}
          >
            Archiviert
          </Button>
          <Button
            variant={activeTab === "delete" ? "filled" : "outlined"}
            size="regular"
            onClick={() => setActiveTab("delete")}
          >
            Papierkorb
          </Button>
        </div>
      )}

      {enablePagination && (
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
        />
      )}

      <Table bleed={bleed} dense={dense} grid={grid} striped={striped}>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHeader key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div className="flex justify-between w-full items-center">
                      <div className="flex-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      <DropdownMenu
                        outline={false}
                        icon={ChevronDownIcon}
                        actions={[
                          {
                            type: "button",
                            label: "Sortieren",
                            onClick: () => handleColumnAction(header, "sort")
                          },
                          {
                            type: "button",
                            label: resolveDisplayField(header.column.id)?.grouping
                              ? "Gruppierung aufheben"
                              : "Nach Spalte gruppieren",
                            onClick: () => handleColumnAction(header, "group")
                          },
                          {
                            type: "button",
                            label: "Feld entfernen",
                            onClick: () => handleColumnAction(header, "remove")
                          }
                        ]}
                        className="ml-2"
                      />
                    </div>
                  )}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                {generateColumns.map((col, colIndex) => {
                  const cellStructure = col.cell ? (
                    <div className="flex items-center gap-4">
                      {col.cell.toString().includes("cover") && (
                        <div className="bg-gray-200 dark:bg-gray-700 h-14 aspect-video rounded-lg animate-pulse"></div>
                      )}
                      <div className="space-y-2">
                        {col.cell.toString().includes("name") && (
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                        )}
                        {col.cell.toString().includes("Tag") && (
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  );

                  return (
                    <TableCell key={`loading-cell-${colIndex}`}>
                      {cellStructure}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={generateColumns.length}>
                <div className="w-full text-center py-4 px-4">
                  {activeTab === "archive"
                    ? "Keine archivierten Inhalte."
                    : activeTab === "delete"
                      ? "Keine gelöschten Inhalte."
                      : noDataMessage
                        ? noDataMessage
                        : "Keine Daten verfügbar."}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            groupedData.map((item, index) => {
              if ((item as any)._isSubtotal) {
                const subtotalLevel = (item as any)._subtotalLevel ?? 0;
                const groupedColumns = columns.filter(col => col.grouping);
                const ungroupedColumns = columns.filter(col => !col.grouping);
                const colSpan = groupedColumns.length - subtotalLevel;

                const aggregationColumn = displayFields.find(
                  field => field.aggregation === "sum" || field.aggregation === "count"
                );

                if (!aggregationColumn) {
                  return null;
                }

                const aggregationAccessorKey = `${aggregationColumn.type}_${aggregationColumn.field}`;
                const aggregationColumnIndex = ungroupedColumns.findIndex(
                  col => col.accessorKey === aggregationAccessorKey
                );

                return (
                  <TableRow key={`subtotal-${index}`} className="bg-gray-100 dark:bg-gray-800">
                    <TableCell
                      key="subtotal-cell-label"
                      colSpan={colSpan}
                      className="font-semibold h-5 text-right text-xs"
                    >
                      Zwischensumme
                    </TableCell>
                    {ungroupedColumns.map((column, colIndex) => {
                      if (colIndex === aggregationColumnIndex) {
                        const value = (item as any)[column.accessorKey ?? ""];
                        return (
                          <TableCell key={`subtotal-cell-value-${colIndex}`} className="font-semibold h-5 text-sm">
                            {typeof value === "number" ? value.toLocaleString("de-DE") : value}
                          </TableCell>
                        );
                      }
                      if (column.accessorKey && typeof (item as any)[column.accessorKey] === "number") {
                        return (
                          <TableCell key={`subtotal-cell-value-${colIndex}`} className="font-semibold h-5 text-sm">
                            {(item as any)[column.accessorKey].toLocaleString("de-DE")}
                          </TableCell>
                        );
                      }
                      return <TableCell key={`subtotal-cell-empty-${colIndex}`}>&nbsp;</TableCell>;
                    })}
                  </TableRow>
                );
              }

              return (
                <TableRow key={`row-${index}`}>
                  {columns.map((column, colIndex) => {
                    if (column.grouping) {
                      const groupKey = column.accessorKey;
                      if (!(item as any)[`_isFirstInGroup_${groupKey}`]) {
                        return null;
                      }

                      const groupValue = (item as any)[`_groupValue_${groupKey}`];

                      return (
                        <TableCell
                          key={`cell-${colIndex}`}
                          rowSpan={(item as any)[`_groupSize_${groupKey}`]}
                          className={clsx("bg-gray-50 dark:bg-white/5")}
                        >
                          {groupValue ?? flexRender(column.cell, { row: { original: item } })}
                        </TableCell>
                      );
                    }

                    const isFirstInPrimary = (item as any)._isFirstInPrimaryGroup === true;

                    if (isFirstInPrimary) {
                      return <TableCell key={`cell-${colIndex}`}>&nbsp;</TableCell>;
                    }

                    return (
                      <TableCell key={`cell-${colIndex}`}>
                        {flexRender(column.cell, { row: { original: item } })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
          {addButton && (
            <TableRow>
              <TableCell colSpan={generateColumns.length} className="hover:bg-black/5 dark:hover:bg-white/5">
                <div
                  className="flex items-center gap-2 text-[var(--lrr-text-color)] hover:text-[var(--lrr-heading-color)] cursor-pointer"
                  onClick={onClickAddButton}
                >
                  <PlusIcon className="w-6 h-6" /> Neu
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableWithGroups;
