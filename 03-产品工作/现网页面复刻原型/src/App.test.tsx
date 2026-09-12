import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Phase 2 应用入口", () => {
  it("展示产品资料试点、Registry 统计和 Schema 校验结果", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Phase 2 Schema 校验" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "产品资料" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Schema 校验通过" })).toBeInTheDocument();
    expect(screen.getByText("页面")).toBeInTheDocument();
    expect(screen.getByText("资源")).toBeInTheDocument();
  });
});
