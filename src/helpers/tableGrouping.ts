import { GroupableColumnDef } from "../components/ui/TableWithGroups";

interface GroupingOptions {
  accessorKey: string;
  subtotalLabel?: string;
  formatValue?: (value: any) => string | number;
}

export function groupDataRecursive<T extends Record<string, any>>(
  data: T[],
  groupingColumns: GroupingOptions[],
  level = 0,
  includeSubtotals = true
): T[] {
  if (level >= groupingColumns.length) return data;

  const col = groupingColumns[level];
  const groups: Record<string, T[]> = {};

  data.forEach(item => {
    const key = item[col.accessorKey];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  let result: T[] = [];
  Object.entries(groups).forEach(([key, items]) => {
    const groupedItems = groupDataRecursive(items, groupingColumns, level + 1, includeSubtotals);

    const subtotalCount = includeSubtotals
      ? groupedItems.filter(item => (item as any)._isSubtotal).length
      : 0;

    groupedItems.forEach((item, idx) => {
      (item as any)[`_isFirstInGroup_${col.accessorKey}`] = idx === 0;
      (item as any)[`_groupSize_${col.accessorKey}`] = items.length + subtotalCount;
    });
    result = result.concat(groupedItems);

    if (includeSubtotals) {
      const subtotalRow = {
        [`_isSubtotal_${col.accessorKey}`]: true,
        [`_groupKey_${col.accessorKey}`]: key,
        [`_groupSize_${col.accessorKey}`]: items.length + subtotalCount,
        _isSubtotal: true,
        _subtotalLevel: level,
        [col.accessorKey]: key
      } as unknown as T;

      items.forEach(item => {
        Object.entries(item).forEach(([field, value]) => {
          if (field.startsWith("_")) return;
          const numericValue = Number(value);
          if (!isNaN(numericValue)) {
            if (!(subtotalRow as any)[field]) {
              (subtotalRow as any)[field] = 0;
            }
            (subtotalRow as any)[field] = ((subtotalRow as any)[field] as number) + numericValue;

            if (col.formatValue) {
              (subtotalRow as any)[field] = col.formatValue((subtotalRow as any)[field]);
            }
          }
        });
      });
      result.push(subtotalRow);
    }
  });

  return result;
}

export function convertToGroupingOptions(columns: GroupableColumnDef<any>[]): GroupingOptions[] {
  return columns
    .filter(col => col.grouping)
    .map(col => ({
      accessorKey: col.accessorKey || "",
      subtotalLabel: "Zwischensumme",
      formatValue: (value: any) => value
    }));
}
