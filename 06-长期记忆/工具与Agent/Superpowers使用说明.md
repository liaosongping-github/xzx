---
title: Superpowers 使用说明
type: tool_guide
owner: 廖送平
created: 2026-08-11
updated: 2026-08-11
sources:
  - https://github.com/obra/superpowers
  - Cursor 插件 Superpowers（本机已装）
info_grade: 已验证事实（插件能力）+ 观点（产品侧用法）
---

# Superpowers 使用说明

给编码 Agent 用的技能包：先澄清 → 再计划 → 再实现 → 先验证再宣称完成。  
业务事实、待办、落库仍以本工作空间 Markdown 与待确认区规则为准；不必每次走完整工程链路。

## 怎么用

- **自动**：直接说目标，Agent 按场景选用技能
- **手动**：聊天输入 `/`，选技能名
- **口令示例**：「先 brainstorming，先别写正文」「设计确认后 writing-plans」「完成前先 verification-before-completion」

## 技能速查

| 技能 | 何时用 |
|---|---|
| `using-superpowers` | 会话起步，先选对技能 |
| `brainstorming` | 新功能/改行为/方案设计前 |
| `writing-plans` | 多步骤任务动手前拆计划 |
| `executing-plans` | 按计划分批执行（另开会话+检查点） |
| `subagent-driven-development` | 本会话按计划派子代理执行 |
| `dispatching-parallel-agents` | 2+ 无依赖任务才并行 |
| `test-driven-development` | 写实现代码前 |
| `systematic-debugging` | 异常/失败，提出修复前 |
| `verification-before-completion` | 声称完成前必须有证据 |
| `requesting-code-review` / `receiving-code-review` | 提审 / 收审后先核实再改 |
| `using-git-worktrees` / `finishing-a-development-branch` | 隔离开发 / 测通后合入收尾 |
| `writing-skills` | 自造或修改 Skill 时 |

## 推荐流程

**改代码/脚本：**  
`brainstorming` → `writing-plans` →（可选 worktree）→ 执行计划 + TDD → 验证 → 收尾分支

**产品文档/梳理（默认）：**  
`brainstorming` → `writing-plans` → 出草案 → `verification-before-completion` → 进待确认区

**你优先用这 4 个：** `brainstorming`、`writing-plans`、`verification-before-completion`、`systematic-debugging`

有代码改动再开 TDD / 计划执行 / 评审 / worktree。并行子代理、写 Skill 一般不急。

## 和本仓库的边界

- 不替代日报/周报 Skill、飞书 `lark-*`、待办默认写工作空间等既有约定
- 产出默认是草案；写入 `02/`、`05/`、`06/` 相关正式区仍须经 `00-待确认区/` 确认
- 无证据不说「已完成」；纯业务阅读不必强上完整工程流水线

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-08-11 | 精简初稿确认落库 |
