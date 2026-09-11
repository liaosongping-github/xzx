export interface RegistryEntity {
  id: string;
  name: string;
  version: string;
}

export type PageStatus = "draft" | "preview" | "published";

export interface PageRecord extends RegistryEntity {
  route: string;
  type: "dashboard" | "list" | "detail" | "form";
  module: string;
  schemaId: string;
  status: PageStatus;
  components: string[];
  metadata: Record<string, unknown>;
}

export interface ComponentRecord extends RegistryEntity {
  type: string;
  category: "basic" | "common" | "business" | "layout";
  propsSchema: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
  childrenRules: Record<string, unknown>;
  description: string;
  schema: Record<string, unknown>;
}

export type ActionType =
  | "navigate"
  | "openModal"
  | "closeModal"
  | "openDrawer"
  | "closeDrawer"
  | "openDialog"
  | "query"
  | "create"
  | "update"
  | "delete"
  | "refresh"
  | "download"
  | "back";

export interface ActionRecord extends RegistryEntity {
  type: ActionType;
  paramsSchema: Record<string, unknown>;
}

export type DataOperation =
  | "query"
  | "pagination"
  | "create"
  | "update"
  | "delete"
  | "sort"
  | "filter";

export interface DataRecord extends RegistryEntity {
  schema: Record<string, unknown>;
  mockData: unknown[];
  operations: DataOperation[];
}

export interface DesignRecord extends RegistryEntity {
  color: Record<string, string>;
  font: Record<string, string>;
  fontSize: Record<string, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  componentTokens: Record<string, Record<string, string>>;
}

export interface AssetRecord extends RegistryEntity {
  type: "icon" | "image" | "logo" | "file";
  src: string;
  metadata: Record<string, unknown>;
}

export interface Registry<T extends RegistryEntity> {
  register: (entry: T) => T;
  get: (id: string) => T | undefined;
  list: () => T[];
  update: (id: string, patch: Partial<Omit<T, "id">>) => T;
  remove: (id: string) => T | undefined;
}

export interface PrototypeRegistry {
  pages: {
    registerPage: (entry: PageRecord) => PageRecord;
    getPage: (id: string) => PageRecord | undefined;
    listPages: () => PageRecord[];
    updatePage: (id: string, patch: Partial<Omit<PageRecord, "id">>) => PageRecord;
    removePage: (id: string) => PageRecord | undefined;
  };
  components: {
    registerComponent: (entry: ComponentRecord) => ComponentRecord;
    getComponent: (id: string) => ComponentRecord | undefined;
    listComponents: () => ComponentRecord[];
    updateComponent: (id: string, patch: Partial<Omit<ComponentRecord, "id">>) => ComponentRecord;
    removeComponent: (id: string) => ComponentRecord | undefined;
  };
  actions: {
    registerAction: (entry: ActionRecord) => ActionRecord;
    getAction: (id: string) => ActionRecord | undefined;
    listActions: () => ActionRecord[];
    updateAction: (id: string, patch: Partial<Omit<ActionRecord, "id">>) => ActionRecord;
    removeAction: (id: string) => ActionRecord | undefined;
  };
  data: {
    registerData: (entry: DataRecord) => DataRecord;
    getData: (id: string) => DataRecord | undefined;
    listData: () => DataRecord[];
    updateData: (id: string, patch: Partial<Omit<DataRecord, "id">>) => DataRecord;
    removeData: (id: string) => DataRecord | undefined;
  };
  design: {
    registerDesign: (entry: DesignRecord) => DesignRecord;
    getDesign: (id: string) => DesignRecord | undefined;
    listDesign: () => DesignRecord[];
    updateDesign: (id: string, patch: Partial<Omit<DesignRecord, "id">>) => DesignRecord;
    removeDesign: (id: string) => DesignRecord | undefined;
  };
  assets: {
    registerAsset: (entry: AssetRecord) => AssetRecord;
    getAsset: (id: string) => AssetRecord | undefined;
    listAssets: () => AssetRecord[];
    updateAsset: (id: string, patch: Partial<Omit<AssetRecord, "id">>) => AssetRecord;
    removeAsset: (id: string) => AssetRecord | undefined;
  };
}
