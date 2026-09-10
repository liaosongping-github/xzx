---
title: 工作台说明
type: workbench_readme
owner: 廖送平
updated: 2026-08-08
---

# 工作台

| 文件 | 给谁 | 用途 |
|---|---|---|
| [今日.md](今日.md) | Agent / 协作权威 | 三个重点、四象限、待办、阻塞、等待反馈等文本源 |
| [我的工作台.html](我的工作台.html) | 廖送平（日常入口） | 可视化聚合：待办（含审阅落库）+ 今日概览 + Raw 未消化计数 |
| [workbench-data.js](workbench-data.js) | HTML 数据源 | 由 `08-自动化/build-workbench.mjs` 生成，勿手改 |

## 使用方式

1. **你**：浏览器打开 `我的工作台.html`（数据过期时先运行下方构建命令）。
2. **Agent**：开工读 `今日.md`（及 `AGENTS.md` 规定的其他文件）。
3. **读文档**：点「预览」在右侧抽屉渲染 Markdown（构建时嵌入正文，不要用浏览器直接打开 `.md`）。点「Cursor」用编辑器打开原文。
4. 审阅类待办：在 HTML 点「确认落库 / 需要修改 / 驳回」→ 口令复制到剪贴板 → 粘贴到 Cursor。
5. Raw 索引较大，侧栏仅提供 Cursor 打开，不做站内全文预览。

## 刷新数据

```powershell
node .\08-自动化\build-workbench.mjs
```

成功后会更新 `08-自动化/.runtime/workbench.json` 与本目录 `workbench-data.js`。

## 相关目录

- [00-待确认区](../00-待确认区/README.md)：待审草案
- [协作偏好](../06-长期记忆/协作偏好.md)
