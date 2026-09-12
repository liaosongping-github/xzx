import { describe, expect, it } from "vitest";
import { createPrototypeRegistry, createRegistry } from "./registry";
import { seedPrototypeRegistry } from "./seed";
import type { PageRecord } from "./types";

const page: PageRecord = {
  id: "page-test",
  name: "测试页",
  route: "/test",
  type: "list",
  module: "测试",
  schemaId: "schema-test",
  status: "draft",
  version: "0.1.0",
  components: [],
  metadata: {}
};

describe("通用 Registry", () => {
  it("支持注册、查询、更新和删除", () => {
    const registry = createRegistry<PageRecord>();
    registry.register(page);

    expect(registry.get(page.id)).toEqual(page);
    expect(registry.update(page.id, { name: "已更新测试页" }).name).toBe("已更新测试页");
    expect(registry.remove(page.id)).toMatchObject({ id: page.id });
    expect(registry.get(page.id)).toBeUndefined();
  });

  it("拒绝重复注册和更新不存在的条目", () => {
    const registry = createRegistry<PageRecord>();
    registry.register(page);

    expect(() => registry.register(page)).toThrow("already exists");
    expect(() => registry.update("missing", { name: "不存在" })).toThrow("does not exist");
  });
});

describe("双引鲸 Registry 种子", () => {
  it("注册六类资产，并含产品资料试点", () => {
    const registry = seedPrototypeRegistry(createPrototypeRegistry());

    expect(registry.pages.getPage("page-product-information")?.route).toBe("/tsProductInformation");
    expect(registry.components.getComponent("app-shell")?.category).toBe("layout");
    expect(registry.actions.getAction("action-openModal")?.type).toBe("openModal");
    expect(registry.data.getData("data-product-information")?.operations).toContain("pagination");
    expect(registry.design.getDesign("design-dyj-base")?.color.primary).toBe("#009DFF");
    expect(registry.assets.getAsset("asset-dyj-logo")?.type).toBe("logo");
  });

  it("六类 Registry 都暴露独立的 CRUD 接口", () => {
    const registry = createPrototypeRegistry();

    expect(typeof registry.pages.registerPage).toBe("function");
    expect(typeof registry.components.updateComponent).toBe("function");
    expect(typeof registry.actions.removeAction).toBe("function");
    expect(typeof registry.data.listData).toBe("function");
    expect(typeof registry.design.getDesign).toBe("function");
    expect(typeof registry.assets.registerAsset).toBe("function");
  });
});
