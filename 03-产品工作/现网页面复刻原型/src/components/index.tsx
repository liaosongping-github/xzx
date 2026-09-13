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

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dyj-app-shell">
      <aside className="dyj-sidebar" aria-label="主导航">
        <div className="dyj-logo">双引鲸</div>
        <nav><a href="#home">首页</a><a className="is-active" href="#product">产品管理</a><a href="#orders">订单管理</a></nav>
      </aside>
      <div className="dyj-workspace">
        <header className="dyj-topbar"><span>贸易管理系统</span><span>廖送平 ▾</span></header>
        <div className="dyj-tabs"><span className="dyj-tab is-active">{title}</span></div>
        <main className="dyj-content">{children}</main>
      </div>
    </div>
  );
}
