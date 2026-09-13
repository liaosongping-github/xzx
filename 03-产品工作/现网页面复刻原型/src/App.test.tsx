import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Phase 3 应用入口", () => {
  it("在产品资料预览区域展示 Registry 统计、Schema 校验结果和页面预览", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Phase 3 Schema Renderer" })).toBeInTheDocument();
    const preview = screen.getByRole("region", { name: "产品资料页面预览" });
    expect(within(preview).getByRole("heading", { name: "产品资料" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Schema 校验通过" })).toBeInTheDocument();
    expect(screen.getByText("页面")).toBeInTheDocument();
    expect(screen.getByText("资源")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "产品名称" })).toBeInTheDocument();
  });
});
