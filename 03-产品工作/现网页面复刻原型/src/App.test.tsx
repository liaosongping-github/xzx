import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Phase 3 应用入口", () => {
  it("在产品资料预览区域展示 Registry 统计、Schema 校验结果和页面预览", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "+ 新建产品" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导入产品" })).toBeInTheDocument();
    const preview = screen.getByRole("region", { name: "产品资料页面预览" });
    expect(within(preview).getByRole("heading", { name: "产品资料" })).toBeInTheDocument();
    expect(screen.getByText("Schema 校验通过")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "产品名称" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "产品图片" })).toBeInTheDocument();
    expect(screen.getByText("是否有图：")).toBeInTheDocument();
    expect(screen.getByText("共 12 条记录")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /MOCK-REMOTE-001/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查询" })).toBeInTheDocument();
  });

  it("产品管理展开时保留正式页已见的六个二级入口", () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    expect(within(navigation).getAllByRole("link").filter((link) => ["产品资料", "下架产品", "物料资料", "客户专属", "组合资料", "客户产品"].includes(link.textContent ?? "")).map((link) => link.textContent)).toEqual(["产品资料", "下架产品", "物料资料", "客户专属", "组合资料", "客户产品"]);
  });

  it("展开更多操作时展示与现网一致的批量操作菜单", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "更多操作 >" }));

    const menu = screen.getByRole("menu", { name: "更多操作菜单" });
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(11);
    expect(within(menu).getByRole("menuitem", { name: /批量导出.*[>›]/ })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "恢复误删数据" })).toBeInTheDocument();
  });

  it("展开首行更多时展示行级操作菜单", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "更多操作 >" }));
    fireEvent.click(screen.getAllByRole("button", { name: "更多" })[0]);

    const menu = screen.getByRole("menu", { name: "行更多操作菜单" });
    expect(screen.queryByRole("menu", { name: "更多操作菜单" })).not.toBeInTheDocument();
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(4);
    expect(within(menu).getByRole("menuitem", { name: "客户产品" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "货柜箱/只计算" })).toBeInTheDocument();
  });

  it("切换草稿产品时收缩为草稿列表工具栏", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "草稿产品" }));

    expect(screen.getByText("MOCK-DRAFT-001")).toBeInTheDocument();
    expect(screen.queryByText("产品状态：")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打印条码" })).not.toBeInTheDocument();
  });

  it("切换组合产品时展示分类列并隐藏左侧业务工具栏", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "组合产品" }));

    expect(screen.getByText("MOCK-COMBO-001")).toBeInTheDocument();
    expect(screen.getByText("共 3 条记录")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "分类编号" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "分类名称" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新建产品" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("列表工具")).getAllByRole("button")).toHaveLength(6);
  });

  it("切换客户专属时保留扩展列并隐藏左侧业务工具栏", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "客户专属" }));

    expect(screen.getByText("MOCK-CUSTOMER-001")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "分类名称" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新建产品" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("列表工具")).getAllByRole("button")).toHaveLength(6);
  });

  it("切换全部时保留扩展列并隐藏左侧业务工具栏", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "全部" }));

    expect(screen.getByText("MOCK-REMOTE-001")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "分类编号" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新建产品" })).not.toBeInTheDocument();
  });

  it("切换页签时关闭遗留的行级菜单", () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "更多" })[0]);
    expect(screen.getByRole("menu", { name: "行更多操作菜单" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "全部" }));
    expect(screen.queryByRole("menu", { name: "行更多操作菜单" })).not.toBeInTheDocument();
  });
});
