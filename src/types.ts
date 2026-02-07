export interface Filter {
  field: string;
  operator: string;
  value: string;
}

export interface Sorting {
  field: string;
  direction: "asc" | "desc";
  order: number;
}

export type FieldDataType = "number" | "string" | "boolean" | "date" | "array" | "float";

export interface Field {
  field: string;
  type: string;
  visible: boolean;
  order: number;
  width?: number;
  dataType?: FieldDataType;
  grouping?: boolean;
  aggregation?: "none" | "sum" | "average" | "count" | "min" | "max";
}


export interface MetaGrouping {
  field: string;
  entityType: string;
  order: number;
  aggregate?: {
    method: "sum" | "average" | "count" | "min" | "max";
    field: string;
  };
}

export interface Report {
  id?: string;
  type: string;
  title?: string;
  fields?: Field[];
  chart?: string;
  conditions?: string | unknown;
  meta?: {
    grouping?: MetaGrouping[];
  };
  [key: string]: unknown;
}

export interface ReportFieldConfig {
  value: string;
  label: string;
  dataType: FieldDataType;
}

export type ReportEntityType = string;

export interface ReportConfig {
  fieldsByEntity: Record<ReportEntityType, ReportFieldConfig[]>;
  reportTypeEntities: Record<string, ReportEntityType[]>;
}

export interface ReportDataSourceOption {
  value: string;
  label: string;
}

export type ReportDataSourceSelection = "single" | "multi";

export interface ReportDataSource {
  id: string;
  label: string;
  selection: ReportDataSourceSelection;
  conditionKey: string;
  options: ReportDataSourceOption[];
}

export interface ReportPageData {
  report?: Report | null;
  reportContent?: any[] | null;
  displayFields?: Field[];
  filters?: Filter[];
  sorting?: Sorting[];
  chart?: string;
  loading?: boolean;
  loadingContent?: boolean;
  dataSources?: ReportDataSource[];
  config: ReportConfig;
}

export interface ReportCallbacks {
  onRefetch?: () => void;
  onRefetchContent?: () => void;
  onUpdateTitle: (title: string) => Promise<boolean> | boolean;
  onUpdateConditions: (conditions: string) => Promise<boolean> | boolean;
  onUpdateFields: (fields: Field[]) => Promise<boolean> | boolean;
  onUpdateFilters: (filters: Filter[]) => Promise<boolean> | boolean;
  onUpdateSorting: (sorting: Sorting[]) => Promise<boolean> | boolean;
  onUpdateChart: (chart: string, fields: Field[]) => Promise<boolean> | boolean;
  onDelete: () => Promise<boolean> | boolean;
  onNavigateBack?: () => void;
}

export type ReportPageProps = ReportPageData & {
  callbacks: ReportCallbacks;
};
