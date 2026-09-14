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
});
