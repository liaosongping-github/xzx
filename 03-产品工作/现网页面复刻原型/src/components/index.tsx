import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`dyj-button ${props.className ?? ""}`} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`dyj-input ${props.className ?? ""}`} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`dyj-select ${props.className ?? ""}`} {...props} />;
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={`dyj-checkbox ${props.className ?? ""}`} {...props} />;
}

export function Radio(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className={`dyj-radio ${props.className ?? ""}`} {...props} />;
}

export function DatePicker(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" className={`dyj-date-picker ${props.className ?? ""}`} {...props} />;
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`dyj-tag ${className}`}>{children}</span>;
}

export function Icon({ name }: { name: string }) {
  return <span role="img" aria-label={name} className="dyj-icon">⌕</span>;
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const navigation = [
    ["⌂", "首页"], ["♟", "小竹熊选品"], ["⌂", "展厅管理"], ["◈", "产品管理"], ["♟", "厂商管理"], ["♟", "客户管理"], ["▣", "销售管理"], ["▤", "采购管理"], ["▥", "跟单管理"], ["⌑", "仓库管理"], ["●", "财务管理"], ["▦", "综合设置"], ["♟", "系统管理"], ["▥", "数据分析"]
  ] as const;
  const pageTabs = ["首页", title, "导入产品", "客户账号", "CP00001506", "客户应收", "客户应收明细-AR000254"];

  return (
    <div className="dyj-app-shell">
      <aside className="dyj-sidebar" aria-label="主导航">
        <div className="dyj-logo"><span className="dyj-logo-mark">◒</span><span>双引鲸<small>SHUANGYINJING</small></span></div>
        <nav aria-label="主导航">{navigation.map(([icon, label]) => <a key={label} className={label === "产品管理" ? "is-active" : ""} href={"#" + label}><i aria-hidden="true">{icon}</i><span>{label}</span>{label !== "首页" && <b aria-hidden="true">⌄</b>}</a>)}</nav>
      </aside>
      <div className="dyj-workspace">
        <header className="dyj-topbar"><button className="dyj-menu-toggle" aria-label="收起菜单">☰</button><label className="dyj-menu-search">⌕<input aria-label="菜单查询" placeholder="菜单查询" /></label><div className="dyj-topbar-right"><span>2026年09月　模拟天气</span><span aria-label="通知">🛒<sup>4</sup></span><span>●</span><span>⚙</span><span>文</span><span className="dyj-user-avatar">演</span><span>演示用户01　⌄</span></div></header>
        <div className="dyj-tabs" aria-label="业务页签">{pageTabs.map((tab, index) => <span key={tab + index} className={"dyj-tab " + (tab === title ? "is-active" : "")}>{tab}</span>)}</div>
        <main className="dyj-content">{children}</main>
      </div>
    </div>
  );
}
