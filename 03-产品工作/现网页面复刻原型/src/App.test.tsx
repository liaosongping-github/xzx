import { render, screen, within } from "@testing-library/react";
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
    expect(screen.getByText("共 6051 条记录")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /MOCK-REMOTE-001/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查询" })).toBeInTheDocument();
  });
});
