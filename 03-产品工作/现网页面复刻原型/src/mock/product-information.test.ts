import { describe, expect, it } from "vitest";
import { filterProducts, paginateProducts, type ProductRecord } from "./product-information";

const records: ProductRecord[] = [
  { id: "1", tab: "单个产品", productCode: "MOCK-REMOTE-001", name: "遥控演示器", hasImage: true, discontinued: false, status: "上架" },
  { id: "2", tab: "单个产品", productCode: "MOCK-NOIMAGE-001", name: "无图演示器", hasImage: false, discontinued: false, status: "上架" },
  { id: "3", tab: "草稿产品", productCode: "MOCK-DRAFT-001", name: "遥控草稿", hasImage: true, discontinued: false, status: "下架" }
];

describe("产品资料 Mock 列表", () => {
  it("按关键词、是否有图、是否停产和产品状态过滤产品", () => {
    const result = filterProducts(records, { keyword: "遥控", hasImage: "是", discontinued: "否", status: "上架", tab: "单个产品" });
    expect(result.map((item) => item.productCode)).toEqual(["MOCK-REMOTE-001"]);
  });

  it("全部页签不限制产品类型，空关键词保留匹配记录", () => {
    const result = filterProducts(records, { keyword: "", hasImage: "全部", discontinued: "全部", status: "全部", tab: "全部" });
    expect(result).toHaveLength(3);
  });

  it("分页返回边界页的空记录与总量", () => {
    expect(paginateProducts(records, 1, 2)).toMatchObject({ total: 3, records: records.slice(0, 2) });
    expect(paginateProducts(records, 3, 2)).toMatchObject({ total: 3, records: [] });
  });
});
