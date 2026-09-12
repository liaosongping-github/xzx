import type { PrototypeRegistry } from "../registry/types";
import type {
  ActionBindingSchema,
  ComponentSchema,
  DataBindingSchema,
  PageSchema,
  ProjectSchema,
  SchemaValidationIssue,
  SchemaValidationResult
} from "./types";

function issue(path: string, reason: string, remediation: string): SchemaValidationIssue {
  return { path, reason, remediation };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBindings(
  bindings: DataBindingSchema[] | ActionBindingSchema[],
  path: string,
  registry: PrototypeRegistry,
  type: "data" | "action"
): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  bindings.forEach((binding, index) => {
    const bindingPath = `${path}[${index}]`;
    const known = type === "data"
      ? registry.data.getData(binding.registryId)
      : registry.actions.getAction(binding.registryId);
    if (!known) {
      issues.push(issue(
        `${bindingPath}.registryId`,
        `未注册的${type === "data" ? "数据源" : "动作"}：${binding.registryId}`,
        `先在对应 Registry 注册 ${binding.registryId}，或改为已注册的 ID。`
      ));
    }
  });
  return issues;
}

function validateComponent(
  component: ComponentSchema,
  path: string,
  registry: PrototypeRegistry,
  parentRegistryId?: string
): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  const registered = registry.components.getComponent(component.registryId);
  if (!component.componentId) {
    issues.push(issue(`${path}.componentId`, "组件 ID 不能为空", "为该节点指定唯一 componentId。"));
  }
  if (!registered) {
    issues.push(issue(`${path}.registryId`, `未知组件：${component.registryId}`, "在 Component Registry 注册组件，或改为已注册组件 ID。"));
  } else {
    const allowedProperties = registered.propsSchema.allowedProperties;
    if (Array.isArray(allowedProperties)) {
      Object.keys(component.props).forEach((property) => {
        if (!allowedProperties.includes(property)) {
          issues.push(issue(`${path}.props.${property}`, `${registered.name} 不支持属性 ${property}`, `仅使用已注册属性：${allowedProperties.join("、")}。`));
        }
      });
    }
  }
  if (!isRecord(component.props)) {
    issues.push(issue(`${path}.props`, "props 必须是对象", "将 props 改为键值对象。"));
  }
  if (!isRecord(component.layout) || typeof component.layout.area !== "string") {
    issues.push(issue(`${path}.layout`, "layout.area 必须存在", "指定组件在 header、main、footer 或 overlay 中的区域。"));
  }
  if (typeof component.visible !== "boolean" || typeof component.locked !== "boolean") {
    issues.push(issue(path, "visible 和 locked 必须为布尔值", "为组件明确设置 visible 与 locked。"));
  }
  if (parentRegistryId) {
    const parent = registry.components.getComponent(parentRegistryId);
    const allowedChildren = parent?.childrenRules.allowedRegistryIds;
    if (Array.isArray(allowedChildren) && !allowedChildren.includes(component.registryId)) {
      issues.push(issue(`${path}.registryId`, `${parent?.name ?? parentRegistryId} 不允许嵌套 ${component.registryId}`, "调整父子层级，或在父组件的 childrenRules 中显式允许该组件。"));
    }
  }
  issues.push(...validateBindings(component.dataBindings, `${path}.dataBindings`, registry, "data"));
  issues.push(...validateBindings(component.actions, `${path}.actions`, registry, "action"));
  if (!Array.isArray(component.children)) {
    issues.push(issue(`${path}.children`, "children 必须是数组", "将子组件放入 children 数组。"));
  } else {
    component.children.forEach((child, index) => {
      issues.push(...validateComponent(child, `${path}.children[${index}]`, registry, component.registryId));
    });
  }
  return issues;
}

export function validatePageSchema(schema: PageSchema, registry: PrototypeRegistry): SchemaValidationResult {
  const issues: SchemaValidationIssue[] = [];
  const page = registry.pages.getPage(schema.pageId);
  if (!page) {
    issues.push(issue("pageId", `未注册页面：${schema.pageId}`, "先注册页面，或改为已注册页面 ID。"));
  } else {
    if (schema.schemaId !== page.schemaId) {
      issues.push(issue("schemaId", "Schema ID 与页面注册记录不一致", `使用 ${page.schemaId}。`));
    }
    if (schema.route !== page.route) {
      issues.push(issue("route", "路由与页面注册记录不一致", `使用 ${page.route}。`));
    }
  }
  if (!isRecord(schema.layout) || typeof schema.layout.area !== "string") {
    issues.push(issue("layout", "页面 layout.area 必须存在", "指定页面主布局区域。"));
  }
  issues.push(...validateBindings(schema.dataBindings, "dataBindings", registry, "data"));
  issues.push(...validateBindings(schema.actions, "actions", registry, "action"));
  if (!Array.isArray(schema.components) || schema.components.length === 0) {
    issues.push(issue("components", "页面至少需要一个组件", "添加根组件到 components。"));
  } else {
    schema.components.forEach((component, index) => {
      issues.push(...validateComponent(component, `components[${index}]`, registry));
    });
  }
  return { valid: issues.length === 0, issues };
}

export function validateProjectSchema(schema: ProjectSchema, registry: PrototypeRegistry): SchemaValidationResult {
  const issues: SchemaValidationIssue[] = [];
  if (!schema.projectId) {
    issues.push(issue("projectId", "项目 ID 不能为空", "指定稳定的 projectId。"));
  }
  schema.pages.forEach((page, index) => {
    validatePageSchema(page, registry).issues.forEach((entry) => {
      issues.push({ ...entry, path: `pages[${index}].${entry.path}` });
    });
  });
  schema.actions.forEach((action, index) => {
    if (!registry.actions.getAction(action.registryId)) {
      issues.push(issue(`actions[${index}].registryId`, `未注册动作：${action.registryId}`, "注册动作或使用已注册动作 ID。"));
    }
  });
  schema.data.forEach((data, index) => {
    if (!registry.data.getData(data.registryId)) {
      issues.push(issue(`data[${index}].registryId`, `未注册数据源：${data.registryId}`, "注册数据源或使用已注册数据源 ID。"));
    }
  });
  schema.design.forEach((design, index) => {
    if (!registry.design.getDesign(design.registryId)) {
      issues.push(issue(`design[${index}].registryId`, `未注册设计令牌：${design.registryId}`, "注册设计令牌或使用已注册设计令牌 ID。"));
    }
  });
  return { valid: issues.length === 0, issues };
}
