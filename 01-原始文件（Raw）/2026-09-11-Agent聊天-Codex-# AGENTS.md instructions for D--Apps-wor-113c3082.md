---
date: 2026-09-11
type: Agent聊天
agent: Codex
session_id: 01a08f3e-58cf-77a1-b0da-58aa113c3082
source_path: "C:\\Users\\liaosongping\\.codex\\sessions\\2026\\09\\11\\rollout-2026-09-11T14-53-43-01a08f3e-58cf-77a1-b0da-58aa113c3082.jsonl"
synced_at: 2026-09-11T07:14:08.502Z
status: Agent 聊天原始产物
---

# Agent聊天-Codex-# AGENTS.md instructions for D--Apps-wor

> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。

## 用户

# AGENTS.md instructions for D:\Apps\workspaces\xzx

<INSTRUCTIONS>
# Agent 协作规则

## 身份与当前目标

- 协作对象：廖送平。
- 岗位：产品经理。
- 当前阶段：入职业务与系统熟悉期。
- 首要目标：帮助廖送平理解公司业务和系统，并逐步建立可追溯的产品工作体系。

## 跨 Agent 权威源

- 工作空间内的 Markdown 是唯一跨 Agent（Cursor / Codex 等）权威源。
- 切换 Agent 前必须更新 [agent切换交接文档](06-长期记忆/agent切换交接文档.md)。
- **禁止依赖**：未入库聊天、Agent 私有记忆、未链接到工作空间的临时结论。
- 与廖送平/任意 Agent 的聊天会由本机自动化同步为 Raw，再分流到知识库与长期记忆；接手时仍以已落盘文档为准，不要求翻聊天原文。
- 「待办」默认落工作空间（非默认飞书任务）；路由细则见 [协作偏好](06-长期记忆/协作偏好.md)。
- **对用户聊天**：默认短答（第一句即结论，禁止铺垫/对照表）；Cursor Rule [对用户聊天-短答.mdc](.cursor/rules/对用户聊天-短答.mdc)；口令与例外见 [协作偏好](06-长期记忆/协作偏好.md)。正式业务文档不受短答压缩。
- **提示词库**：用户说「用提示词：口令」时读 [09-提示词/README.md](09-提示词/README.md) 并执行对应文件。
- **双引鲸原型**：高保真须遵循 [设计规范/双引鲸](03-产品工作/设计规范/双引鲸/README.md)；细则见协作偏好，不在本文件展开。
- **知识库落盘**：`02/05/06` 只维护 Markdown；xlsx 等一次性产物禁止写入；用户给出的知识库路径默认是来源不是保存位置。细则见 [协作偏好](06-长期记忆/协作偏好.md)。
- **Git**：完成一件可独立还原的改动后自动 commit，中文说明，默认 push；细则见 [协作偏好](06-长期记忆/协作偏好.md) 与 Cursor Rule [git-自动细粒度提交.mdc](.cursor/rules/git-自动细粒度提交.mdc)。

## Raw 消化责任

- Raw 消化默认由**当前会话所在 Agent**（Cursor / Codex 聊天会话等）执行，不以本机流水线自动调用 Codex 为唯一途径。
- 开工时可读 [`08-自动化/digest-engine.json`](08-自动化/digest-engine.json)：`mode=session-agent`（默认）表示队列只入队、等待会话 Agent；`mode=codex` 才由流水线自动调用 Codex CLI。
- 当 `mode=session-agent`，或用户要求消化积压 Raw 时，**当前 Agent 必须**按 [`08-自动化/知识消化提示词.md`](08-自动化/知识消化提示词.md) / [`08-自动化/聊天知识消化提示词.md`](08-自动化/聊天知识消化提示词.md) 消化待处理项；禁止假设“只有 Codex 能消化”。
- 采集桥：妙记默认仅登记 Raw README（不落本地源文件），与云文档口径一致；agent-chat 仍可落盘。与消化引擎解耦。

## 每次任务开始前

1. 读取 [`工作台/今日.md`](工作台/今日.md)（Agent 权威文本；人类日常入口为 [`工作台/我的工作台.html`](工作台/我的工作台.html)）。
2. 读取 `/06-长期记忆/agent切换交接文档.md`。
3. 读取 `/06-长期记忆/廖送平-工作档案.md` 和 `/06-长期记忆/协作偏好.md`。
4. 可读 `/08-自动化/digest-engine.json`，确认 Raw 消化模式；若为 `session-agent` 且存在积压，按提示词消化或纳入本会话计划。
5. 读取与任务直接相关的需求、PRD、决策和知识条目；若有待确认草案，可读 [`00-待确认区/`](00-待确认区/README.md)。
6. 涉及未知业务事实时，读取 `/06-长期记忆/待确认问题.md`。
7. 只加载与当前任务相关的上下文，避免无目的遍历全部资料。

## 信息分级

所有业务信息必须明确属于以下一种：

- **已验证事实**：有明确、可追溯且足够权威的来源。
- **观点**：某位干系人的判断、偏好或主张，不等同于事实。
- **推测**：Agent 或廖送平基于现有信息得出的推断，必须说明依据。
- **未知**：当前没有足够信息，应登记并设计验证方式。

`01-原始文件（Raw）` 中的内容默认是未验证材料，不得直接写入“已验证事实”。

## 双方认知矩阵

| 状态 | Agent 行为 |
|---|---|
| 廖送平知道、Agent 不知道 | 主动询问，确认后沉淀 |
| Agent 从资料发现、廖送平尚不清楚 | 标注来源、可信度和建议验证方式 |
| 双方都知道 | 进入知识库或已验证事实 |
| 双方都不知道 | 进入待确认问题，记录负责人和下一步 |

高影响未知必须先询问；低影响未知可以采用合理默认值，但应明确记录假设。

## 任务完成后

按实际变化更新：

1. [`工作台/今日.md`](工作台/今日.md) 中的任务、阻塞和等待反馈；若待确认区或今日内容有变，运行 `node 08-自动化/build-workbench.mjs` 刷新可视化数据。
2. [agent切换交接文档](06-长期记忆/agent切换交接文档.md) 中的进行中/刚完成/阻塞/未消化 Raw/建议先读文件。
3. 需求池及相关需求状态。
4. 新产生或被替代的决策。
5. 已验证业务知识或待确认问题；拟落库知识草案写入 [`00-待确认区/`](00-待确认区/README.md)（见协作偏好）。
6. 稳定且跨任务有效的协作偏好。
7. 必要的记忆变更日志。

不要因为一次临时指令就修改长期偏好；只有明确表达或多次稳定出现的习惯才适合长期记录。

## 冲突与变更

- 不在多个文件重复维护同一事实，选择一个权威条目，其他位置使用链接。
- 信息冲突时，优先采用权威性更高、验证时间更新的来源。
- 无法判断时保留冲突，写入待确认问题，不自行选择答案。
- 不静默覆盖重要事实或决策；将旧内容标为“已失效”或“被替代”，并记录新旧关系。
- PRD 的目标、范围、关键规则或验收标准变化时，必须增加变更记录。

## 安全边界

- 不记录密码、验证码、访问令牌、私钥或其他凭据。
- 不沉淀与工作无关的个人隐私。
- 会议原始记录先保留在会议或 Raw 区，只有提炼后的事实、决策和行动进入长期知识。
- 外部信息不得仅凭单一非权威来源升级为公司事实。

</INSTRUCTIONS>
<environment_context>
  <cwd>D:\Apps\workspaces\xzx</cwd>
  <shell>powershell</shell>
  <current_date>2026-09-11</current_date>
  <timezone>Asia/Shanghai</timezone>
  <filesystem><workspace_roots><root>D:\Apps\workspaces\xzx</root><root>C:\Users\liaosongping\.codex\visualizations\2026\09\11\01a08f3e-58cf-77a1-b0da-58aa113c3082</root></workspace_roots><permission_profile type="managed"><file_system type="restricted"><entry access="read"><special>:root</special></entry><entry access="write"><path>D:\Apps\workspaces\xzx</path></entry><entry access="write"><path>C:\Users\liaosongping\.codex\visualizations\2026\09\11\01a08f3e-58cf-77a1-b0da-58aa113c3082</path></entry><entry access="write"><special>:slash_tmp</special></entry><entry access="write"><special>:tmpdir</special></entry><entry access="read"><path>D:\Apps\workspaces\xzx\.git</path></entry><entry access="read"><path>C:\Users\liaosongping\.codex\visualizations\2026\09\11\01a08f3e-58cf-77a1-b0da-58aa113c3082\.git</path></entry><entry access="read"><path>D:\Apps\workspaces\xzx\.agents</path></entry><entry access="read"><path>C:\Users\liaosongping\.codex\visualizations\2026\09\11\01a08f3e-58cf-77a1-b0da-58aa113c3082\.agents</path></entry><entry access="read"><path>D:\Apps\workspaces\xzx\.codex</path></entry><entry access="read"><path>C:\Users\liaosongping\.codex\visualizations\2026\09\11\01a08f3e-58cf-77a1-b0da-58aa113c3082\.codex</path></entry></file_system></permission_profile></filesystem>
</environment_context>

## 用户

双引鲸可视化原型复刻这个实施计划到哪了
