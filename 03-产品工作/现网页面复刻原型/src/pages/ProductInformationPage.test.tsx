import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { prototypeRegistry } from "../registry";
import { productInformationProjectSchema } from "../schema";
import { ProductInformationPage } from "./ProductInformationPage";

const page = productInformationProjectSchema.pages[0];

describe("产品资料页面", () => {
  it("点击查询后按现网四项条件更新可见记录", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);

    fireEvent.change(screen.getByRole("textbox", { name: "关键词" }), { target: { value: "遥控" } });
    fireEvent.change(screen.getByRole("combobox", { name: "是否有图：" }), { target: { value: "是" } });
    fireEvent.click(screen.getByRole("button", { name: "查询" }));

    expect(screen.getByText("MOCK-REMOTE-001")).toBeInTheDocument();
    expect(screen.queryByText("MOCK-NOIMAGE-001")).not.toBeInTheDocument();
  });

  it("切换页签后以该页签过滤并重置分页", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);

    fireEvent.click(screen.getByRole("button", { name: "草稿产品" }));

    expect(screen.getByText("MOCK-DRAFT-001")).toBeInTheDocument();
    expect(screen.queryByText("MOCK-REMOTE-001")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toHaveClass("is-active");
  });
});
