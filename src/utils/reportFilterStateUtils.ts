import { Filter, FilterGroup } from "../types";

const cloneFilterGroups = (filters: FilterGroup[]) =>
  filters.map(group => ({
    ...group,
    filters: group.filters.map(filter => ({ ...filter })),
    connectors: [...group.connectors]
  }));

export const ensureAndConnectors = (filtersState: FilterGroup[]) =>
  filtersState.map(group => ({
    ...group,
    connectors: group.connectors.map(() => "AND" as const)
  }));

export const addFilterToGroups = (
  filtersState: FilterGroup[],
  filterToAdd: Filter,
  isDefaultRangeFilter: (filter: Filter) => boolean
) => {
  const updatedFilters = cloneFilterGroups(filtersState);

  if (updatedFilters.length === 0) {
    updatedFilters.push({ filters: [filterToAdd], connectors: [] });
    return ensureAndConnectors(updatedFilters);
  }

  const lastGroupIndex = updatedFilters.length - 1;
  const lastGroup = updatedFilters[lastGroupIndex];
  const lastGroupHasOnlyDefault =
    lastGroup.filters.length === 1 && isDefaultRangeFilter(lastGroup.filters[0]);

  if (lastGroupHasOnlyDefault) {
    updatedFilters.push({ filters: [filterToAdd], connectors: [] });
    return ensureAndConnectors(updatedFilters);
  }

  if (lastGroup.filters.length > 0) {
    lastGroup.connectors.push("AND");
  }
  lastGroup.filters.push(filterToAdd);
  return ensureAndConnectors(updatedFilters);
};

export const removeFilterFromGroups = (
  filtersState: FilterGroup[],
  groupIndex: number,
  filterIndex: number
) => {
  const updatedFilters = cloneFilterGroups(filtersState);
  const group = updatedFilters[groupIndex];
  if (!group) {
    return ensureAndConnectors(updatedFilters);
  }

  group.filters.splice(filterIndex, 1);

  if (filterIndex > 0) {
    group.connectors.splice(filterIndex - 1, 1);
  } else if (group.filters.length > 0) {
    group.connectors.splice(0, 1);
  }

  if (group.filters.length === 0) {
    updatedFilters.splice(groupIndex, 1);
  }

  return ensureAndConnectors(updatedFilters);
};

export const updateFilterOperatorInGroups = (
  filtersState: FilterGroup[],
  groupIndex: number,
  filterIndex: number,
  operator: string
) => {
  const updatedFilters = cloneFilterGroups(filtersState);
  const group = updatedFilters[groupIndex];
  const currentFilter = group?.filters[filterIndex];
  if (!currentFilter) {
    return ensureAndConnectors(updatedFilters);
  }

  group.filters[filterIndex] = {
    ...currentFilter,
    operator,
    value: operator === "between" ? "|" : ""
  };

  return ensureAndConnectors(updatedFilters);
};

export const updateFilterValueInGroups = (
  filtersState: FilterGroup[],
  groupIndex: number,
  filterIndex: number,
  value: string
) => {
  const updatedFilters = cloneFilterGroups(filtersState);
  const group = updatedFilters[groupIndex];
  const currentFilter = group?.filters[filterIndex];
  if (!currentFilter) {
    return ensureAndConnectors(updatedFilters);
  }

  group.filters[filterIndex] = {
    ...currentFilter,
    value
  };

  return ensureAndConnectors(updatedFilters);
};

export const getSelectedFieldValues = (filtersState: FilterGroup[]) =>
  new Set(filtersState.flatMap(group => group.filters.map(filter => filter.field)));
