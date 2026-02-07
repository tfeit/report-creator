"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Filter,
  Field,
  Report,
  ReportCallbacks,
  ReportConfig,
  ReportPageData,
  ReportDataSource,
  Sorting
} from "./types";

export interface ReportContextType {
  report: Report | null | undefined;
  reportContent: any[] | null | undefined;
  displayFields: Field[];
  setDisplayFields: (fields: Field[]) => void;
  chart: string;
  setChart: (chart: string) => void;
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  sorting: Sorting[];
  setSorting: (sorting: Sorting[]) => void;
  loading: boolean;
  loadingContent: boolean;
  refetch: () => void;
  refetchContent: () => void;
  dataSources: ReportDataSource[];
  callbacks: ReportCallbacks;
  config: ReportConfig;
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

interface ReportProviderProps extends ReportPageData {
  callbacks: ReportCallbacks;
  children: ReactNode;
}

export const ReportProvider = ({
  report,
  reportContent,
  displayFields,
  filters,
  sorting,
  chart,
  loading = false,
  loadingContent = false,
  dataSources,
  config,
  callbacks,
  children
}: ReportProviderProps) => {
  const [currentDisplayFields, setCurrentDisplayFields] = useState<Field[]>(
    displayFields ?? []
  );
  const [currentFilters, setCurrentFilters] = useState<Filter[]>(filters ?? []);
  const [currentSorting, setCurrentSorting] = useState<Sorting[]>(sorting ?? []);
  const [currentChart, setCurrentChart] = useState<string>(chart ?? "bar");

  useEffect(() => {
    setCurrentDisplayFields(displayFields ?? []);
  }, [displayFields]);

  useEffect(() => {
    setCurrentFilters(filters ?? []);
  }, [filters]);

  useEffect(() => {
    setCurrentSorting(sorting ?? []);
  }, [sorting]);

  useEffect(() => {
    setCurrentChart(chart ?? "bar");
  }, [chart]);

  const refetch = useMemo(() => callbacks.onRefetch ?? (() => {}), [callbacks]);
  const refetchContent = useMemo(() => callbacks.onRefetchContent ?? (() => {}), [callbacks]);

  return (
    <ReportContext.Provider
      value={{
        report,
        reportContent,
        displayFields: currentDisplayFields,
        setDisplayFields: setCurrentDisplayFields,
        chart: currentChart,
        setChart: setCurrentChart,
        filters: currentFilters,
        setFilters: setCurrentFilters,
        sorting: currentSorting,
        setSorting: setCurrentSorting,
        loading,
        loadingContent,
        refetch,
        refetchContent,
        dataSources: dataSources ?? [],
        callbacks,
        config
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
