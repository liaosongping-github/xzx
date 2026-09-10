---
title: 双引鲸复刻组件清单
type: component_inventory
status: 可复用资产盘点完成
updated: 2026-09-10
---

# 组件清单

## 已有静态资产（需迁移，不直接复制页面）

| 资产 | 当前位置 | 阶段 1 运行时对应物 |
|---|---|---|
| 全局壳（侧栏、顶栏、页签） | `设计规范/双引鲸/shell.css`、`shell.js`、`组件/snippets/全局壳.html` | `AppShell` |
| 查询条件 | `组件/snippets/查询条件.html` | `QuickSearchBar` |
| 列表与列设置 | `组件/snippets/列表.html`、`列设置抽屉.html` | `DataTable`、`ColumnSettingsDrawer` |
| 产品选择器/产品查询 | `组件/snippets/产品选择器.html`、`产品查询抽屉.html` | 阶段 1 先定义注册契约；产品资料只实现已证实的必要入口 |
| 页面模式与样式 token | `tokens.css`、`components.css`、`页面模式/` | `design` Registry 与 CSS 变量 |

## 阶段 1 首批注册组件

- `app-shell`：导航、菜单查询、多页签与内容槽位。
- `dashboard-workbench`：首页统计、待办、排名和页签统计区。
- `list-page`：状态页签、搜索、工具栏、表格和分页组合。
- `quick-search-bar`：关键词、下拉项、查询/重置及辅助入口。
- `data-table`：列定义、排序标记、行操作、空态。
- `pagination`：当前页、页大小、总数和跳页。
- `drawer`：综合查询和列设置的通用容器。
- `form-modal`、`confirm-dialog`：产品新建/编辑与删除确认容器。

新增组件必须先进入 Component Registry；仅产品资料专属的图搜、导入和业务“更多”项以 Action Schema 描述，不提前抽象成全局组件。
