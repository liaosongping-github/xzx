import type { PrototypeRegistry } from "./types";

const version = "0.1.0";

export function seedPrototypeRegistry(registry: PrototypeRegistry): PrototypeRegistry {
  registry.pages.registerPage({
    id: "page-home",
    name: "首页",
    route: "/tsHome",
    type: "dashboard",
    module: "首页",
    schemaId: "schema-page-home",
    status: "draft",
    version,
    components: ["app-shell", "dashboard-workbench"],
    metadata: { implementationScope: "扩展批次 1" }
  });
  registry.pages.registerPage({
    id: "page-product-information",
    name: "产品资料",
    route: "/tsProductInformation",
    type: "list",
    module: "产品管理",
    schemaId: "schema-page-product-information",
    status: "draft",
    version,
    components: ["app-shell", "list-page", "quick-search-bar", "data-table", "pagination"],
    metadata: { implementationScope: "试点" }
  });

  [
    { id: "app-shell", name: "全局壳", category: "layout" as const, properties: ["title"], children: ["list-page"] },
    { id: "list-page", name: "列表页骨架", category: "layout" as const, properties: ["title", "tabs"], children: ["quick-search-bar", "data-table", "pagination"] },
    { id: "quick-search-bar", name: "快捷查询条", category: "common" as const, properties: ["placeholder", "fields"], children: [] },
    { id: "data-table", name: "数据表", category: "common" as const, properties: ["columns", "rowKey"], children: [] },
    { id: "pagination", name: "分页", category: "common" as const, properties: ["pageSize"], children: [] },
    { id: "drawer", name: "抽屉", category: "common" as const, properties: ["title", "width"], children: [] },
    { id: "form-modal", name: "表单弹窗", category: "common" as const, properties: ["title", "fields"], children: [] },
    { id: "confirm-dialog", name: "确认框", category: "common" as const, properties: ["title", "message"], children: [] }
    ,{ id: "checkbox", name: "复选框", category: "basic" as const, properties: ["checked", "label"], children: [] }
    ,{ id: "radio", name: "单选框", category: "basic" as const, properties: ["checked", "label"], children: [] }
    ,{ id: "date-picker", name: "日期选择", category: "basic" as const, properties: ["value", "placeholder"], children: [] }
    ,{ id: "tag", name: "标签", category: "basic" as const, properties: ["text", "type"], children: [] }
    ,{ id: "icon", name: "图标", category: "basic" as const, properties: ["name"], children: [] }
  ].forEach(({ id, name, category, properties, children }) => {
    registry.components.registerComponent({
      id,
      name,
      type: id,
      category,
      version,
      propsSchema: { allowedProperties: properties },
      defaultProps: {},
      childrenRules: { allowedRegistryIds: children },
      description: `${name}的注册契约`,
      schema: {}
    });
  });

  [
    ["navigate", "页面跳转"],
    ["openModal", "打开弹窗"],
    ["closeModal", "关闭弹窗"],
    ["openDrawer", "打开抽屉"],
    ["closeDrawer", "关闭抽屉"],
    ["openDialog", "打开确认框"],
    ["query", "查询"],
    ["create", "新增"],
    ["update", "编辑"],
    ["delete", "删除"],
    ["refresh", "刷新"],
    ["download", "下载"],
    ["back", "返回"]
  ].forEach(([type, name]) => {
    registry.actions.registerAction({
      id: `action-${type}`,
      name,
      type: type as Parameters<typeof registry.actions.registerAction>[0]["type"],
      version,
      paramsSchema: {}
    });
  });

  registry.data.registerData({
    id: "data-product-information",
    name: "产品资料演示数据",
    version,
    schema: { type: "array", item: "product" },
    mockData: [
      { id: "1", "产品编码": "DYJ-001", "产品名称": "积木工程车", "状态": "已上架" },
      { id: "2", "产品编码": "DYJ-002", "产品名称": "益智拼图套装", "状态": "已上架" },
      { id: "3", "产品编码": "DYJ-003", "产品名称": "毛绒玩偶礼盒", "状态": "已下架" }
    ],
    operations: ["query", "pagination", "create", "update", "delete", "sort", "filter"]
  });
  registry.design.registerDesign({
    id: "design-dyj-base",
    name: "双引鲸基础设计令牌",
    version,
    color: { primary: "#009DFF", text: "#303133" },
    font: { base: "Arial, Microsoft YaHei, sans-serif" },
    fontSize: { base: "14px" },
    spacing: { md: "16px" },
    radius: { base: "4px" },
    shadow: { base: "0 2px 12px rgba(0, 0, 0, 0.08)" },
    componentTokens: { button: { primary: "#009DFF" } }
  });
  registry.assets.registerAsset({
    id: "asset-dyj-logo",
    name: "双引鲸标识",
    version,
    type: "logo",
    src: "design-system/logo",
    metadata: { status: "placeholder" }
  });

  return registry;
}
