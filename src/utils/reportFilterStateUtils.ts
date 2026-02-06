import { Filter } from "../types";

const cloneFilters = (filters: Filter[]) => filters.map(filter => ({ ...filter }));

export const addFilter = (filtersState: Filter[], filterToAdd: Filter) => {
  const updatedFilters = cloneFilters(filtersState);
  updatedFilters.push(filterToAdd);
  return updatedFilters;
};

export const removeFilter = (filtersState: Filter[], filterIndex: number) => {
  const updatedFilters = cloneFilters(filtersState);
  if (filterIndex < 0 || filterIndex >= updatedFilters.length) {
    return updatedFilters;
  }
  updatedFilters.splice(filterIndex, 1);
  return updatedFilters;
};

export const updateFilterOperator = (
  filtersState: Filter[],
  filterIndex: number,
  operator: string
) => {
  const updatedFilters = cloneFilters(filtersState);
  const currentFilter = updatedFilters[filterIndex];
  if (!currentFilter) {
    return updatedFilters;
  }
  updatedFilters[filterIndex] = {
    ...currentFilter,
    operator,
    value: operator === "between" ? "|" : ""
  };
  return updatedFilters;
};

export const updateFilterValue = (
  filtersState: Filter[],
  filterIndex: number,
  value: string
) => {
  const updatedFilters = cloneFilters(filtersState);
  const currentFilter = updatedFilters[filterIndex];
  if (!currentFilter) {
    return updatedFilters;
  }
  updatedFilters[filterIndex] = {
    ...currentFilter,
    value
  };
  return updatedFilters;
};

export const getSelectedFieldValues = (filtersState: Filter[]) =>
  new Set(filtersState.map(filter => filter.field));
