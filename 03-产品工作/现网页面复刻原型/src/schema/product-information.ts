import type { ProjectSchema } from "./types";

export const productInformationProjectSchema: ProjectSchema = {
  projectId: "project-dyj-prototype",
  version: "0.1.0",
  pages: [{
    schemaId: "schema-page-product-information",
    pageId: "page-product-information",
    name: "产品资料",
    route: "/tsProductInformation",
    layout: { area: "main", width: "full" },
    dataBindings: [{ bindingId: "products", registryId: "data-product-information" }],
    actions: [{ actionId: "query-products", registryId: "action-query", params: {} }],
    metadata: { implementationScope: "试点" },
    components: [{
      componentId: "product-information-page",
      registryId: "list-page",
      props: { title: "产品资料", tabs: ["草稿产品", "单个产品", "组合产品", "客户专属", "全部"] },
      layout: { area: "main", width: "full" },
      dataBindings: [{ bindingId: "products", registryId: "data-product-information" }],
      actions: [{ actionId: "query-products", registryId: "action-query", params: {} }],
      visible: true,
      locked: false,
      children: [
        {
          componentId: "product-quick-search", registryId: "quick-search-bar",
          props: { placeholder: "请输入产品名称、编码", fields: ["keyword", "status"] },
          layout: { area: "main", width: "full" }, dataBindings: [],
          actions: [{ actionId: "query-products", registryId: "action-query", params: {} }], visible: true, locked: false, children: []
        },
        {
          componentId: "product-table", registryId: "data-table",
          props: { columns: ["序号", "产品图片", "产品编号", "辅助编号", "产品名称", "英文名称", "出厂货号", "产品类型", "出厂价", "进货价", "自定义价格", "第三方价格", "采购折扣", "操作"], rowKey: "id" },
          layout: { area: "main", width: "full" }, dataBindings: [{ bindingId: "products", registryId: "data-product-information" }],
          actions: [], visible: true, locked: false, children: []
        },
        {
          componentId: "product-pagination", registryId: "pagination", props: { pageSize: 20 },
          layout: { area: "footer", width: "full" }, dataBindings: [{ bindingId: "products", registryId: "data-product-information" }],
          actions: [{ actionId: "query-products", registryId: "action-query", params: {} }], visible: true, locked: false, children: []
        }
      ]
    }]
  }],
  actions: [{ actionId: "query-products", registryId: "action-query", params: {} }],
  data: [{ dataId: "products", registryId: "data-product-information", metadata: { source: "mock" } }],
  design: [{ designId: "dyj-base", registryId: "design-dyj-base", metadata: { scope: "pilot" } }]
};
