export const productTabs = ["草稿产品", "单个产品", "组合产品", "客户专属", "全部"] as const;

export type ProductTab = (typeof productTabs)[number];

export type ProductRecord = {
  id: string;
  tab: Exclude<ProductTab, "全部">;
  productCode: string;
  name: string;
  hasImage: boolean;
  discontinued: boolean;
  status: "上架" | "下架";
  [column: string]: string | boolean;
};

export type ProductFilters = {
  keyword: string;
  hasImage: "全部" | "是" | "否";
  discontinued: "全部" | "是" | "否";
  status: "全部" | "上架" | "下架";
  tab: ProductTab;
};

export const defaultProductFilters: ProductFilters = {
  keyword: "",
  hasImage: "全部",
  discontinued: "全部",
  status: "上架",
  tab: "单个产品"
};

export const productInformationMockData: ProductRecord[] = [
  { id: "mock-1", tab: "单个产品", productCode: "MOCK-REMOTE-001", name: "遥控演示器", hasImage: true, discontinued: false, status: "上架", "序号": "1", "产品图片": "▣", "产品编号": "MOCK-REMOTE-001", "辅助编号": "DEMO-01", "产品名称": "遥控演示器", "英文名称": "Remote Demo", "出厂货号": "DEMO-REMOTE", "产品类型": "单个产品", "出厂价": "10", "进货价": "8", "自定义价格": "0", "第三方价格": "0", "采购折扣": "0", "标贴费": "0", "起订量": "1", "产品状态": "上架" },
  { id: "mock-2", tab: "单个产品", productCode: "MOCK-NOIMAGE-001", name: "无图演示器", hasImage: false, discontinued: false, status: "上架", "序号": "2", "产品图片": "", "产品编号": "MOCK-NOIMAGE-001", "辅助编号": "DEMO-02", "产品名称": "无图演示器", "英文名称": "No Image Demo", "出厂货号": "DEMO-NOIMAGE", "产品类型": "单个产品", "出厂价": "12", "进货价": "9", "自定义价格": "0", "第三方价格": "0", "采购折扣": "0", "标贴费": "0", "起订量": "1", "产品状态": "上架" },
  { id: "mock-3", tab: "草稿产品", productCode: "MOCK-DRAFT-001", name: "遥控草稿", hasImage: true, discontinued: false, status: "下架", "序号": "3", "产品图片": "▣", "产品编号": "MOCK-DRAFT-001", "辅助编号": "DRAFT-01", "产品名称": "遥控草稿", "英文名称": "Remote Draft", "出厂货号": "DEMO-DRAFT", "产品类型": "草稿产品", "出厂价": "0", "进货价": "0", "自定义价格": "0", "第三方价格": "0", "采购折扣": "0", "标贴费": "0", "起订量": "1", "产品状态": "下架" }
];

function matchesYesNo(value: boolean, filter: "全部" | "是" | "否") {
  return filter === "全部" || value === (filter === "是");
}

export function filterProducts(records: ProductRecord[], filters: ProductFilters) {
  const keyword = filters.keyword.trim();
  return records.filter((record) =>
    (filters.tab === "全部" || record.tab === filters.tab)
    && (!keyword || `${record.productCode} ${record.name}`.includes(keyword))
    && matchesYesNo(record.hasImage, filters.hasImage)
    && matchesYesNo(record.discontinued, filters.discontinued)
    && (filters.status === "全部" || record.status === filters.status)
  );
}

export function paginateProducts(records: ProductRecord[], page: number, pageSize: number) {
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const start = (normalizedPage - 1) * normalizedPageSize;
  return { records: records.slice(start, start + normalizedPageSize), total: records.length };
}
