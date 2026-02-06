export interface WorkspaceCollection {
  uuid: string;
  title: string;
}

export interface WorkspaceListing {
  listingId: string;
  name: string;
}

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


export interface DisplayField {
  field: string;
  type: string;
  visible: boolean;
  order: number;
  width?: string;
  dataType?: "number" | "string" | "boolean" | "date" | "array";
  grouping?: boolean;
  aggregation?: "none" | "sum" | "average" | "count" | "min" | "max";
  sort?: "asc" | "desc";
  sortOrder?: number;
}

export type MetaDisplayFields = Array<{
  field: string;
  type: string;
  dataType: "number" | "string" | "boolean" | "date" | "array";
  visible: boolean;
  order: number;
  width?: number;
  grouping?: boolean;
  aggregation?: "none" | "sum" | "average" | "count" | "min" | "max";
  sort?: "asc" | "desc";
  sortOrder?: number;
}>;

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
  fields?: DisplayField[];
  chart?: string;
  conditions?: string | unknown;
  meta?: {
    grouping?: MetaGrouping[];
    listing_filters?: Filter[];
  };
  [key: string]: unknown;
}

export interface ReportPageData {
  report?: Report | null;
  reportContent?: any[] | null;
  displayFields?: MetaDisplayFields;
  filters?: Filter[];
  sorting?: Sorting[];
  chart?: string;
  loading?: boolean;
  loadingContent?: boolean;
  workspaceCollections?: WorkspaceCollection[];
  workspaceListings?: WorkspaceListing[];
}

export interface ReportCallbacks {
  onRefetch?: () => void;
  onRefetchContent?: () => void;
  onUpdateTitle: (title: string) => Promise<boolean> | boolean;
  onUpdateConditions: (conditions: string) => Promise<boolean> | boolean;
  onUpdateFields: (fields: MetaDisplayFields) => Promise<boolean> | boolean;
  onUpdateFilters: (filters: Filter[]) => Promise<boolean> | boolean;
  onUpdateSorting: (sorting: Sorting[]) => Promise<boolean> | boolean;
  onUpdateChart: (chart: string, fields: MetaDisplayFields) => Promise<boolean> | boolean;
  onDelete: () => Promise<boolean> | boolean;
  onNavigateBack?: () => void;
}

export type ReportPageProps = ReportPageData & {
  callbacks: ReportCallbacks;
};
