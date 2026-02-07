type Grouped = {
  group: string;
  items: any[];
  groupAggregate: number | null;
  isPrimaryGroup: boolean;
  parent?: string;
};

function extractFieldValues(
  item: any,
  fieldName: string,
  isArrayField: boolean,
  fallbackFieldName?: string | null
): string[] {
  let value = item[fieldName];
  if (value === undefined && fallbackFieldName) {
    value = item[fallbackFieldName];
  }

  if (isArrayField || Array.isArray(value)) {
    if (!Array.isArray(value)) {
      value = value === undefined || value === null ? [] : [value];
    }
    return value.map(v => {
      if (typeof v === "object" && v !== null) {
        return v.label || v.name || v.id || String(v);
      }
      return String(v || "Ohne Gruppe");
    });
  }

  if (value === null || value === undefined) {
    return ["Ohne Gruppe"];
  }

  if (typeof value === "object") {
    return [value.label || value.name || value.id || String(value)];
  }

  return [String(value)];
}

export function groupData(data: any[], displayFields: any[]): Grouped[] {
  const groupingFields = displayFields.filter((field: any) => field.grouping).sort((a: any, b: any) => a.order - b.order);

  if (!groupingFields.length) {
    return [{ group: "Ohne Gruppe", items: data, groupAggregate: null, isPrimaryGroup: true }];
  }

  const arrayFieldKeys = new Set(
    displayFields
      .filter((field: any) => field.dataType === "array")
      .flatMap((field: any) => [
        `${field.type}_${field.field}`,
        field.field
      ])
  );

  const primaryField = groupingFields[0];
  const secondaryField = groupingFields[1];

  const primaryFieldName = `${primaryField.type}_${primaryField.field}`;
  const secondaryFieldName = secondaryField ? `${secondaryField.type}_${secondaryField.field}` : null;
  const primaryFallbackName = primaryFieldName.split("_").slice(1).join("_");
  const secondaryFallbackName = secondaryFieldName
    ? secondaryFieldName.split("_").slice(1).join("_")
    : null;
  const isPrimaryArray = arrayFieldKeys.has(primaryFieldName) || arrayFieldKeys.has(primaryFallbackName);
  const isSecondaryArray = secondaryFieldName
    ? arrayFieldKeys.has(secondaryFieldName) || arrayFieldKeys.has(secondaryFallbackName || "")
    : false;

  const groups: { [key: string]: { [key: string]: any[] } } = {};

  data.forEach(item => {
    const primaryValues = extractFieldValues(item, primaryFieldName, isPrimaryArray, primaryFallbackName);
    const secondaryValues = secondaryFieldName
      ? extractFieldValues(item, secondaryFieldName, isSecondaryArray, secondaryFallbackName)
      : [null];

    primaryValues.forEach(primary => {
      if (!groups[primary]) groups[primary] = {};

      if (secondaryFieldName) {
        secondaryValues.forEach(secondary => {
          const secondaryKey = secondary || "Ohne Untergruppe";
          if (!groups[primary][secondaryKey]) groups[primary][secondaryKey] = [];
          groups[primary][secondaryKey].push(item);
        });
      } else {
        if (!groups[primary]["default"]) groups[primary]["default"] = [];
        groups[primary]["default"].push(item);
      }
    });
  });

  const calculateAggregate = (items: any[], aggregationMethod: string) => {
    const sumField = displayFields.find((f: any) => f.aggregation === "sum");
    const values = items.map(item => {
      if (!sumField) return 1;
      const fieldName = `${sumField.type}_${sumField.field}`;
      const value = item[fieldName];
      return typeof value === "number" ? value : Number(value) || 0;
    });

    switch (aggregationMethod) {
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "average":
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case "count":
        return values.length;
      case "min":
        return values.length ? Math.min(...values) : 0;
      case "max":
        return values.length ? Math.max(...values) : 0;
      default:
        return 0;
    }
  };

  return Object.entries(groups).flatMap(([primary, secondaryGroups]) => {
    const allPrimaryItems = Object.values(secondaryGroups).flat();
    const sumField = displayFields.find((f: any) => f.aggregation === "sum");
    const aggregationMethod = sumField?.aggregation || "count";

    const primaryGroupAggregate = calculateAggregate(allPrimaryItems, aggregationMethod);

    const result: Grouped[] = [
      {
        group: primary,
        items: [],
        groupAggregate: primaryGroupAggregate,
        isPrimaryGroup: true
      }
    ];

    if (secondaryField) {
      Object.entries(secondaryGroups).forEach(([secondary, items]) => {
        const secondaryGroupAggregate = calculateAggregate(items, aggregationMethod);

        result.push({
          group: secondary,
          items,
          groupAggregate: secondaryGroupAggregate,
          isPrimaryGroup: false,
          parent: primary
        });
      });
    } else {
      result[0].items = allPrimaryItems;
    }
    return result;
  });
}
