import { useReport } from "./useReport";

export const useReportOperations = () => {
  const { displayFields, setDisplayFields, refetch, callbacks } = useReport();

  const handleGroupByColumn = async (columnId: string) => {
    const firstUnderscoreIndex = columnId.indexOf("_");
    const field = columnId.substring(0, firstUnderscoreIndex);
    const type = columnId.substring(firstUnderscoreIndex + 1);

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

  const handleSortByColumn = async (columnId: string, sortDirection: "asc" | "desc") => {
    const firstUnderscoreIndex = columnId.indexOf("_");
    const field = columnId.substring(0, firstUnderscoreIndex);
    const type = columnId.substring(firstUnderscoreIndex + 1);

    const updatedDisplayFields = displayFields.map(displayField => {
      if (displayField.field === field && displayField.type === type) {
        return {
          ...displayField,
          sort: sortDirection
        };
      }
      return displayField;
    });

    try {
      const result = await callbacks.onUpdateFields(updatedDisplayFields);
      if (result) {
        setDisplayFields(updatedDisplayFields);
        refetch();
      }
    } catch (error) {
      console.error("Error updating fields:", error);
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
    handleSortByColumn,
    handleReorderColumns
  };
};
