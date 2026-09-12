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
      props: { title: "产品资料", tabs: ["全部", "已上架", "已下架"] },
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
          props: { columns: ["产品编码", "产品名称", "状态"], rowKey: "id" },
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
