"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import {
  FilterGroup,
  MetaDisplayFields,
  Report,
  ReportCallbacks,
  ReportPageData,
  WorkspaceCollection,
  WorkspaceListing
} from "./types";

export interface ReportContextType {
  reportId: string;
  report: Report | null | undefined;
  reportContent: any[] | null | undefined;
  displayFields: MetaDisplayFields;
  setDisplayFields: (fields: MetaDisplayFields) => void;
  chart: string;
  setChart: (chart: string) => void;
  filters: FilterGroup[];
  setFilters: (filters: FilterGroup[]) => void;
  loading: boolean;
  loadingContent: boolean;
  refetch: () => void;
  refetchContent: () => void;
  workspaceCollections: WorkspaceCollection[];
  workspaceListings: WorkspaceListing[];
  callbacks: ReportCallbacks;
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

interface ReportProviderProps extends ReportPageData {
  callbacks: ReportCallbacks;
  children: ReactNode;
}

export const ReportProvider = ({
  reportId,
  report,
  reportContent,
  displayFields,
  filters,
  chart,
  loading = false,
  loadingContent = false,
  workspaceCollections,
  workspaceListings,
  callbacks,
  children
}: ReportProviderProps) => {
  const [currentDisplayFields, setCurrentDisplayFields] = useState<MetaDisplayFields>(
    displayFields ?? []
  );
  const [currentFilters, setCurrentFilters] = useState<FilterGroup[]>(filters ?? []);
  const [currentChart, setCurrentChart] = useState<string>(chart ?? "bar");

  useEffect(() => {
    setCurrentDisplayFields(displayFields ?? []);
  }, [displayFields]);

  useEffect(() => {
    setCurrentFilters(filters ?? []);
  }, [filters]);

  useEffect(() => {
    setCurrentChart(chart ?? "bar");
  }, [chart]);

  const refetch = useMemo(() => callbacks.onRefetch ?? (() => {}), [callbacks]);
  const refetchContent = useMemo(() => callbacks.onRefetchContent ?? (() => {}), [callbacks]);

  return (
    <ReportContext.Provider
      value={{
        reportId,
        report,
        reportContent,
        displayFields: currentDisplayFields,
        setDisplayFields: setCurrentDisplayFields,
        chart: currentChart,
        setChart: setCurrentChart,
        filters: currentFilters,
        setFilters: setCurrentFilters,
        loading,
        loadingContent,
        refetch,
        refetchContent,
        workspaceCollections: workspaceCollections ?? [],
        workspaceListings: workspaceListings ?? [],
        callbacks
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
