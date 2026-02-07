import { useReport } from "./useReport";

export const useReportOperations = () => {
  const { displayFields, setDisplayFields, sorting, setSorting, refetch, callbacks } = useReport();

  const resolveFieldFromColumnId = (columnId: string) => {
    const directMatch = displayFields.find(
      field => `${field.type}_${field.field}` === columnId
    );
    if (directMatch) return directMatch;
    return displayFields.find(
      field => `${field.field}_${field.type}` === columnId
    );
  };

  const handleGroupByColumn = async (columnId: string) => {
    const matchedField = resolveFieldFromColumnId(columnId);
    if (!matchedField) return;
    const { field, type } = matchedField;

    const updatedDisplayFields = displayFields.map(displayField => {
      if (displayField.field === field && displayField.type === type) {
        return {
          ...displayField,
          grouping: !displayField.grouping
        };
      }
      return displayField;
    });

    const sortedFields = updatedDisplayFields.sort((a, b) => {
      if (a.grouping && !b.grouping) return -1;
      if (!a.grouping && b.grouping) return 1;
      if (a.grouping && b.grouping) return a.order - b.order;
      return a.order - b.order;
    });

    const finalFields = sortedFields.map((fieldItem, index) => ({
      ...fieldItem,
      order: index
    }));

    try {
      const result = await callbacks.onUpdateFields(finalFields);
      if (result) {
        setDisplayFields(finalFields);
        refetch();
      }
    } catch (error) {
      console.error("Error updating fields:", error);
    }
  };

  const handleRemoveField = async (columnId: string) => {
    const matchedField = resolveFieldFromColumnId(columnId);
    if (!matchedField) return;
    const nextFields = displayFields
      .filter(field => !(field.field === matchedField.field && field.type === matchedField.type))
      .sort((a, b) => a.order - b.order)
      .map((fieldItem, index) => ({
        ...fieldItem,
        order: index
      }));

    try {
      const result = await callbacks.onUpdateFields(nextFields);
      if (result) {
        setDisplayFields(nextFields);
        refetch();
      }
    } catch (error) {
      console.error("Error removing field:", error);
    }
  };

  const handleSortByColumn = async (columnId: string, sortDirection: "asc" | "desc") => {
    const nextSorting = (() => {
      const existing = sorting.find(rule => rule.field === columnId);
      if (existing) {
        return sorting.map(rule =>
          rule.field === columnId ? { ...rule, direction: sortDirection } : rule
        );
      }
      const nextOrder = sorting.length;
      return [...sorting, { field: columnId, direction: sortDirection, order: nextOrder }];
    })().sort((a, b) => a.order - b.order)
      .map((rule, index) => ({ ...rule, order: index }));

    try {
      const result = await callbacks.onUpdateSorting(nextSorting);
      if (result) {
        setSorting(nextSorting);
        refetch();
      }
    } catch (error) {
      console.error("Error updating sorting:", error);
    }
  };

  const handleReorderColumns = async (
    newOrder: { field: string; type: string; order: number }[]
  ) => {
    const updatedDisplayFields = displayFields.map(displayField => {
      const newOrderItem = newOrder.find(
        item => item.field === displayField.field && item.type === displayField.type
      );
      if (newOrderItem) {
        return {
          ...displayField,
          order: newOrderItem.order
        };
      }
      return displayField;
    });

    const sortedFields = updatedDisplayFields.sort((a, b) => a.order - b.order);

    try {
      const result = await callbacks.onUpdateFields(sortedFields);
      if (result) {
        setDisplayFields(sortedFields);
        refetch();
      }
    } catch (error) {
      console.error("Error updating fields:", error);
    }
  };

  return {
    handleGroupByColumn,
    handleRemoveField,
    handleSortByColumn,
    handleReorderColumns
  };
};
