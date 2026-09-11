import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Phase 1 应用入口", () => {
  it("展示产品资料试点和六类 Registry 统计", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Phase 1 Registry 基座" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "产品资料" })).toBeInTheDocument();
    expect(screen.getByText("页面")).toBeInTheDocument();
    expect(screen.getByText("资源")).toBeInTheDocument();
  });
});
