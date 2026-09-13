import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { prototypeRegistry } from "../registry";
import { productInformationProjectSchema } from "../schema";
import type { PageSchema } from "../schema/types";
import { PageRenderer } from "./Renderer";

const page = productInformationProjectSchema.pages[0];

afterEach(() => {
  prototypeRegistry.components.removeComponent("test-renderer-component");
  prototypeRegistry.components.removeComponent("test-pagination-alias");
});

describe("Schema Renderer", () => {
  it("递归渲染产品资料页面的注册组件", () => {
    render(<PageRenderer schema={page} registry={prototypeRegistry} />);

    expect(screen.getByRole("heading", { name: "产品资料" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("请输入产品名称、编码")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "产品名称" })).toBeInTheDocument();
    expect(screen.getByText("共 6051 条记录")).toBeInTheDocument();
  });

  it("阻止非法 Schema 进入组件渲染", () => {
    const invalid = structuredClone(page) as PageSchema;
    invalid.components[0].registryId = "missing-component";

    render(<PageRenderer schema={invalid} registry={prototypeRegistry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Schema 校验失败");
    expect(screen.getByRole("alert")).toHaveTextContent("未知组件：missing-component");
  });

  it("对校验通过但没有实现的注册组件显示错误边界", () => {
    const partial = structuredClone(page) as PageSchema;
    prototypeRegistry.components.registerComponent({
      id: "test-renderer-component",
      name: "测试渲染组件",
      type: "test-renderer-component",
      category: "basic",
      version: "0.1.0",
      propsSchema: { allowedProperties: [] },
      defaultProps: {},
      childrenRules: { allowedRegistryIds: [] },
      description: "测试错误边界",
      schema: {}
    });
    partial.components[0].registryId = "test-renderer-component";
    partial.components[0].props = {};
    partial.components[0].children = [];

    render(<PageRenderer schema={partial} registry={prototypeRegistry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("未实现组件渲染器");
  });

  it("按已注册组件类型复用渲染器，而非依赖组件 ID", () => {
    const partial = structuredClone(page) as PageSchema;
    prototypeRegistry.components.registerComponent({
      id: "test-pagination-alias",
      name: "测试分页别名",
      type: "pagination",
      category: "common",
      version: "0.1.0",
      propsSchema: { allowedProperties: ["pageSize"] },
      defaultProps: {},
      childrenRules: { allowedRegistryIds: [] },
      description: "测试 Renderer 类型分派",
      schema: {}
    });
    partial.components[0].registryId = "test-pagination-alias";
    partial.components[0].props = { pageSize: 20 };
    partial.components[0].children = [];

    render(<PageRenderer schema={partial} registry={prototypeRegistry} />);

    expect(screen.getByText("共 0 条")).toBeInTheDocument();
  });

  it("不渲染 Schema 标记为不可见的组件", () => {
    const hidden = structuredClone(page) as PageSchema;
    hidden.components[0].children[1].visible = false;

    render(<PageRenderer schema={hidden} registry={prototypeRegistry} />);

    expect(screen.queryByRole("columnheader", { name: "产品名称" })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("请输入产品名称、编码")).toBeInTheDocument();
  });
});
