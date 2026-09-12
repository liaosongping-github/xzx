export interface ComponentLayoutSchema {
  area: "header" | "main" | "footer" | "overlay";
  width?: "full" | "content";
}

export interface DataBindingSchema {
  bindingId: string;
  registryId: string;
  field?: string;
}

export interface ActionBindingSchema {
  actionId: string;
  registryId: string;
  params: Record<string, unknown>;
}

export interface ComponentSchema {
  componentId: string;
  registryId: string;
  props: Record<string, unknown>;
  children: ComponentSchema[];
  layout: ComponentLayoutSchema;
  dataBindings: DataBindingSchema[];
  actions: ActionBindingSchema[];
  visible: boolean;
  locked: boolean;
}

export interface PageSchema {
  schemaId: string;
  pageId: string;
  name: string;
  route: string;
  layout: ComponentLayoutSchema;
  components: ComponentSchema[];
  dataBindings: DataBindingSchema[];
  actions: ActionBindingSchema[];
  metadata: Record<string, unknown>;
}

export interface ActionSchema {
  actionId: string;
  registryId: string;
  params: Record<string, unknown>;
}

export interface DataSchema {
  dataId: string;
  registryId: string;
  metadata: Record<string, unknown>;
}

export interface DesignSchema {
  designId: string;
  registryId: string;
  metadata: Record<string, unknown>;
}

export interface ProjectSchema {
  projectId: string;
  version: string;
  pages: PageSchema[];
  actions: ActionSchema[];
  data: DataSchema[];
  design: DesignSchema[];
}

export interface SchemaValidationIssue {
  path: string;
  reason: string;
  remediation: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  issues: SchemaValidationIssue[];
}
