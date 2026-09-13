import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell, Button, Input, Select } from "./index";

describe("Phase 4 基础组件", () => {
  it("AppShell 提供双引鲸全局壳和页面内容插槽", () => {
    render(<AppShell title="产品资料"><div>页面内容</div></AppShell>);
    expect(screen.getByText("双引鲸")).toBeInTheDocument();
    expect(screen.getByText("产品资料")).toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });

  it("基础表单组件暴露可访问名称和受控属性", () => {
    render(<><Button>查询</Button><Input aria-label="关键词" value="玩具" readOnly /><Select aria-label="状态" value="启用" onChange={() => undefined}><option>启用</option></Select></>);
    expect(screen.getByRole("button", { name: "查询" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "关键词" })).toHaveValue("玩具");
    expect(screen.getByRole("combobox", { name: "状态" })).toHaveValue("启用");
  });
});
