---
date: 2026-08-11
type: Agent聊天
agent: Cursor
session_id: 4c8cd97c-8734-46d0-97d2-b6e4b53ee866
source_path: "C:\\Users\\liaosongping\\.cursor\\projects\\d-Apps-workspaces-xzx\\agent-transcripts\\4c8cd97c-8734-46d0-97d2-b6e4b53ee866\\4c8cd97c-8734-46d0-97d2-b6e4b53ee866.jsonl"
synced_at: 2026-08-11T03:18:14.760Z
status: Agent 聊天原始产物
---

# Agent聊天-Cursor-https---github.com-obra-superpowers 告诉我s

> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。

## 用户

https://github.com/obra/superpowers
告诉我superpowers有哪些技能，哪些可以推荐我使用

## 助手

先查官方仓库说明，并对照你当前的产品经理协作场景，再给出可落地的技能清单与推荐。

## 助手

下面按官方仓库整理技能清单，并结合你当前岗位给出推荐。接着我会把本会话标题改成中文「Superpowers技能推荐」。

## 助手

[obra/superpowers](https://github.com/obra/superpowers) 是一套给编码 Agent 用的「方法论 + 可组合技能」。安装后，Agent 在动手写代码前会先澄清目标、出设计、再拆计划并按 TDD/评审推进。

## 技能清单（官方 Skills Library）

| 分类 | 技能 | 作用一句话 |
|---|---|---|
| Meta | `using-superpowers` | 技能体系入口与使用约定 |
| Meta | `writing-skills` | 按规范编写新技能 |
| Collaboration | `brainstorming` | 动手前用问答澄清想法、分段确认设计 |
| Collaboration | `writing-plans` | 把设计拆成可执行的小任务计划 |
| Collaboration | `executing-plans` | 按计划分批执行，中间设人工检查点 |
| Collaboration | `subagent-driven-development` | 每任务派子代理，两阶段评审（规格符合度 → 代码质量） |
| Collaboration | `dispatching-parallel-agents` | 并行派多个子代理 |
| Collaboration | `using-git-worktrees` | 用 git worktree 做隔离分支开发 |
| Collaboration | `finishing-a-development-branch` | 收尾：测通、选 merge/PR/保留/丢弃 |
| Collaboration | `requesting-code-review` | 任务间发起评审、按严重度报告 |
| Collaboration | `receiving-code-review` | 如何响应评审意见 |
| Testing | `test-driven-development` | 强制红-绿-重构 |
| Debugging | `systematic-debugging` | 四阶段根因排查 |
| Debugging | `verification-before-completion` | 宣称完成前必须验证 |

标准主流程大致是：

`brainstorming` → `using-git-worktrees` → `writing-plans` → `subagent-driven-development` / `executing-plans`（实现中穿插 `test-driven-development`、`requesting-code-review`）→ `finishing-a-development-branch`

## 结合你现状的推荐

你是产品经理、入职熟悉期，主战场是业务理解、需求/PRD/知识沉淀，不是天天写业务代码。和你工作空间里已有的协作体系（认知矩阵、待确认区、日报 Skill）相比，Superpowers 更偏「软件工程交付流水线」。

### 很值得用

1. **`brainstorming`** — 和你「先厘清已知/未知再动手」高度一致；写 PRD、梳主链路、定方案前最有用。  
2. **`writing-plans`** — 把模糊目标拆成可检查步骤；做流程图梳理、需求拆解、原型分阶段都很合适。  
3. **`verification-before-completion`** — 防止「以为做完了」；适合验收、对照领导口径、日报前自检。  
4. **`systematic-debugging`** — 不限于代码：流程对不上、系统行为异常、资料冲突时，比瞎猜更稳。

### 有编码/自动化任务时再用

5. **`test-driven-development`**  
6. **`executing-plans` / `subagent-driven-development`**  
7. **`requesting-code-review` / `receiving-code-review`**  
8. **`using-git-worktrees` / `finishing-a-development-branch`**  

例如改工作台脚本、自动化、本地小工具时再开；日常业务学习不必强行走完整工程流水线。

### 一般先不急

- **`dispatching-parallel-agents`**：成本高，适合明确可并行的工程任务。  
- **`writing-skills`**：只有你要自己造 Skill 时才需要；你已有日报/周报等 Skill 管线。  
- **整包「必须按 Superpowers 工程流程走」**：和当前「知识库 + 待确认 + 飞书业务」主路径叠床架屋，容易过重。

## 实用结论

- **优先装/用**：`brainstorming`、`writing-plans`、`verification-before-completion`、`systematic-debugging`。  
- **写代码再开**：TDD、计划执行、评审、worktree 收尾那一套。  
- Cursor 安装方式（官方）：聊天里 `/add-plugin superpowers`，或插件市场搜 `superpowers`。

如果你愿意，我可以下一步按「只做产品文档」和「偶尔改自动化脚本」两套场景，分别写一套更短的触发口令（何时说什么让 Agent 走哪几个 skill）。当前是 Ask 模式，我只能给建议，不能直接帮你安装。

## 用户

Show me how the Superpowers plugin works

## 助手

Superpowers 装好后，本质是一套**会自动介入的工作流**：先想清楚，再计划，再实现，边做边验证，而不是一上来就写代码。

## 它怎么运作

1. **会话开始**  
   `sessionStart` hook 会自动加载约定；`using-superpowers` 提醒 Agent：动手前先找对技能。

2. **命令与技能**  
   - 用 `/` 可手动点技能或子代理  
   - 更常见：Agent 识别到场景后**自动**选用对应技能  
   - Rules / Hooks **自动生效**，不用你每次喊

3. **标准主链路（做功能时）**

```text
brainstorming          → 澄清意图与设计（创意/改行为前必做）
writing-plans          → 拆成可执行小任务
using-git-worktrees    → 隔离分支再开工（需要时）
subagent-driven-development / executing-plans
                       → 按计划执行（本会话子代理 或 另开会话+检查点）
test-driven-development → 实现前先红-绿-重构
requesting-code-review → 大块完成或合并前复核
finishing-a-development-branch → 测通后选 merge / PR / 清理
verification-before-completion → 宣称“完成”前必须有跑通证据
```

## 技能一览（按用途）

| 场景 | 技能 |
|---|---|
| 任何对话起步 | `using-superpowers` |
| 新功能 / 改行为前 | `brainstorming` |
| 多步骤实现前 | `writing-plans` |
| 按计划落地 | `executing-plans`、`subagent-driven-development` |
| 可并行的独立任务 | `dispatching-parallel-agents` |
| 写功能/修 bug 前 | `test-driven-development` |
| 遇 bug / 异常表现 | `systematic-debugging` |
| 声称完成前 | `verification-before-completion` |
| 提审 / 收审 | `requesting-code-review`、`receiving-code-review` |
| 分支隔离与收尾 | `using-git-worktrees`、`finishing-a-development-branch` |
| 写/改技能本身 | `writing-skills` |

## 你怎么用

- **自动**：直接说目标即可，例如「帮我加一个导出功能」——应先走 brainstorming，而不是立刻改代码。  
- **手动**：在聊天输入 `/`，选对应技能名强制触发。  
- **原则**：证据先于结论（尤其 `verification-before-completion`）；修 bug 先 `systematic-debugging`，再改代码。

结合你当前以产品/业务为主的工作：日常澄清需求、拆步骤、验收自检，多用 `brainstorming`、`writing-plans`、`verification-before-completion`；真正写脚本或改仓库时，再让整条工程链路自动跟上即可。

## 用户

好的，可以帮我落一份使用说明书吗，先写内容，然后在告诉我准备落到哪里，由我确认后在落

## 助手

先起草说明书正文，并对照你工作空间里类似文档的落点习惯，再给出建议路径供你确认（Ask 模式不会直接写入）。

## 助手

下面是说明书**正文草案**（尚未写入任何文件）。你确认内容和落点后，切到 Agent 模式再说一声，我再落盘。

---

```markdown
---
title: Superpowers 使用说明
type: draft
category: 知识候选
status: 待确认
owner: 廖送平
created: 2026-08-11
updated: 2026-08-11
targets:
  - 06-长期记忆/工具与Agent/Superpowers使用说明.md
sources:
  - https://github.com/obra/superpowers
  - Cursor 插件 Superpowers 安装说明（本机已装）
info_grade: 已验证事实（插件能力与官方流程）+ 观点（结合产品工作的使用建议）
---

# Superpowers 使用说明

面向：廖送平（产品经理）与协作 Agent（Cursor / 其他已安装端）。  
目的：说清 Superpowers 做什么、何时用、怎么触发，以及和本工作空间现有协作习惯如何配合。

## 1. 它是什么

Superpowers 是一套给编码 Agent 用的**可组合技能 + 强制工作流约定**，不是单独的业务系统。

核心理念：

- 先澄清再动手（设计先于实现）
- 先计划再编码（小步可验证）
- 先测试/验证再宣称完成（证据先于结论）
- 系统排查优先于凭感觉改

安装后通常会：

- **Hooks**（如 `sessionStart`）自动生效
- **Skills** 可被 Agent 自动选用，也可用 `/` 手动调用
- 规则按插件约定自动应用

> 说明：Superpowers 偏「软件交付流水线」。本工作空间日常主路径仍是：业务熟悉 → Raw/知识库 → 需求/PRD → 待确认区。两者可叠加，不必每次都走完整工程链路。

## 2. 怎么触发

| 方式 | 做法 | 适用 |
|---|---|---|
| 自动 | 直接描述目标，例如「帮我设计导出方案」 | 大多数情况；Agent 应按场景选技能 |
| 手动 | 聊天输入 `/`，选择对应技能名 | 想强制走某一步时 |
| 会话起步 | `using-superpowers`（通常由 hook/约定带动） | 提醒 Agent 先找对技能再回答 |

建议口令示例（可复制改写）：

- 「先用 brainstorming：我想梳理双引鲸采购入库主链路，先别写文档正文。」
- 「设计已确认，用 writing-plans 拆成可执行步骤。」
- 「按这份计划执行，中间每完成 2 个任务停下来给我看。」
- 「不要先改代码，先 systematic-debugging：现象是……」
- 「准备说完成前，先 verification-before-completion，把验证证据列出来。」

## 3. 技能清单与何时用

### 3.1 Meta（元技能）

| 技能 | 何时用 |
|---|---|
| `using-superpowers` | 任何会话开始：建立「先选技能再行动」的约定 |
| `writing-skills` | 新建/修改 Skill、上线前自测 Skill 行为 |

### 3.2 协作与交付主链路

| 技能 | 何时用 | 对你（产品）的典型场景 |
|---|---|---|
| `brainstorming` | 任何创意/新功能/改行为之前 | 需求澄清、方案对比、PRD 范围边界、流程设计 |
| `writing-plans` | 已有规格/需求、多步骤任务、动手前 | 把调研/改造/原型拆成可检查任务 |
| `executing-plans` | 已有书面计划，另开会话分批执行并设检查点 | 较长改造（如工作台脚本）分段推进 |
| `subagent-driven-development` | 本会话内按计划派子代理执行，带两阶段评审 | 明确可拆的实现任务 |
| `dispatching-parallel-agents` | 2 个以上无共享状态、无先后依赖的任务 | 并行调研两块独立资料/两段无耦合改动 |
| `using-git-worktrees` | 需要与当前工作区隔离的功能开发 | 改仓库代码前隔离分支 |
| `finishing-a-development-branch` | 实现完成且测试通过，决定如何合入 | merge / PR / 保留 / 丢弃的结构化收尾 |
| `requesting-code-review` | 大块完成、合并前 | 对照计划与需求做自检式评审 |
| `receiving-code-review` | 收到评审意见后、改代码前 | 先核实再改，避免盲从 |

### 3.3 测试与排错

| 技能 | 何时用 | 对你的典型场景 |
|---|---|---|
| `test-driven-development` | 写功能或修 bug 的实现代码之前 | 自动化脚本、工作台构建逻辑等 |
| `systematic-debugging` | 任何异常、失败、非预期行为，提出修复前 | 流程对不上、脚本报错、结果与预期不符 |
| `verification-before-completion` | 声称「完成/已修好/已通过」之前 | 日报前自检、验收、合入前证据核对 |

## 4. 推荐标准流程（做功能/改行为时）

```text
1. brainstorming
   → 澄清目标、约束、方案；分段给你确认设计
2. writing-plans
   → 拆成 2–5 分钟级可执行任务（路径、步骤、验证点）
3. （如需隔离）using-git-worktrees
4. subagent-driven-development 或 executing-plans
   → 实现中穿插 test-driven-development
   → 任务间可用 requesting-code-review
5. verification-before-completion
6. finishing-a-development-branch
```

**产品文档类工作的精简版（推荐默认）：**

```text
brainstorming → writing-plans →（产出草案）→ verification-before-completion
→ 进入 00-待确认区 → 你确认后再落正式路径
```

不必为写一篇 PRD 或知识条目强行开启 worktree / TDD / 子代理全链路。

## 5. 与本工作空间的配合规则

1. **权威源仍是工作空间 Markdown**  
   Superpowers 管的是「Agent 怎么做事」；业务事实、决策、待办仍以仓库文档为准。

2. **信息分级不变**  
   技能产出默认仍是草案/观点/推测；不得未经确认写成「已验证事实」。

3. **落库仍走待确认**  
   拟写入 `02-业务知识库/`、`05-决策记录/`、`06-长期记忆/`（协作偏好/工作档案/待确认问题等）的内容，先入 `00-待确认区/`，你确认后再正式落盘。

4. **待办路由不变**  
   「待办」默认写工作空间；仅明确说飞书任务时才走飞书。

5. **与已有 Skill 的关系**  
   - 日报/周报：继续用既有 `generate-daily-work-report` / `generate-weekly-work-report`  
   - 飞书能力：继续用 `lark-*`  
   - Superpowers：补「澄清—计划—实现—验证」的工程协作骨架，不替代上述业务 Skill

6. **MVP**  
   真实需要出现再启用重流程（并行子代理、完整 TDD 流水线等）。

## 6. 推荐给你的默认组合

**高频（建议默认打开心态）：**

1. `brainstorming`
2. `writing-plans`
3. `verification-before-completion`
4. `systematic-debugging`

**有代码/自动化改动时再开：**

5. `test-driven-development`
6. `executing-plans` / `subagent-driven-development`
7. `requesting-code-review` / `receiving-code-review`
8. `using-git-worktrees` / `finishing-a-development-branch`

**一般不急：**

- `dispatching-parallel-agents`（成本高，任务真独立时再用）
- `writing-skills`（要自造 Skill 时再用）

## 7. 反模式（避免）

- 一上来就改代码/改正式知识库，跳过澄清与确认
- 没有验证证据就说「已完成」「已修好」
- 用完整工程流水线处理纯业务阅读/入职熟悉任务（过重）
- 把 Superpowers 会话结论当成已验证公司事实，却不落盘、不分级
- 同时开很多并行 Agent 处理有依赖的任务

## 8. 安装与更新（Cursor）

- 安装：Agent 聊天执行 `/add-plugin superpowers`，或在插件市场搜索 `superpowers`
- 更新：以 Cursor 插件市场/插件页的更新机制为准
- 多端（Cursor / Codex 等）需分别安装；本说明以当前 Cursor 已安装为前提

## 9. 快速自检清单

开始前：

- [ ] 目标一句话能否说清？
- [ ] 已知 / 未知是否分开？
- [ ] 是否需要 brainstorming？

执行中：

- [ ] 是否有书面计划或明确步骤？
- [ ] 异常是否先 systematic-debugging？
- [ ] 实现是否需要 TDD？

结束前：

- [ ] 是否跑过 verification-before-completion？
- [ ] 产出是正式落盘还是先进待确认区？
- [ ] 是否需要更新 `工作台/今日.md` / 交接文档？

## 10. 变更记录

| 日期 | 变更 |
|---|---|
| 2026-08-11 | 初稿：基于官方技能库与本工作空间协作偏好整理 |
```

---

## 建议落点（请你确认）

| 阶段 | 路径 | 说明 |
|---|---|---|
| 确认前（草案） | `00-待确认区/知识候选/Superpowers使用说明.md` | 符合「先确认再落库」习惯 |
| 确认后（正式） | `06-长期记忆/工具与Agent/Superpowers使用说明.md` | 属协作/工具长期记忆，不是业务知识库条目；`工具与Agent/` 目录若尚无则一并新建 |

可选备选（若你更想放别处）：

- `06-长期记忆/Superpowers使用说明.md`（不建子目录，更扁平）
- 仅在交接文档里加链接，正文仍放上述正式路径

请直接回复例如：

1. **内容**：通过 / 要改哪几节  
2. **落点**：用建议路径，或改用备选  
3. 确认后请**切换到 Agent 模式**，并说「确认落库」——当前是 Ask 模式，我无法写文件。

## 用户

说明书能精简一点吗

## 助手

可以。下面是精简版正文（仍未落盘）。

---

```markdown
---
title: Superpowers 使用说明
type: draft
category: 知识候选
status: 待确认
owner: 廖送平
created: 2026-08-11
updated: 2026-08-11
targets:
  - 06-长期记忆/工具与Agent/Superpowers使用说明.md
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
| 2026-08-11 | 精简初稿 |
```

---

## 拟落点（同前，待你确认）

| 阶段 | 路径 |
|---|---|
| 确认前 | `00-待确认区/知识候选/Superpowers使用说明.md` |
| 确认后 | `06-长期记忆/工具与Agent/Superpowers使用说明.md` |

回复「内容通过 + 落点确认」后，请切到 **Agent 模式** 再说一声，我再写入。若要再短（只留「怎么用 + 四件套」半页），也可以说。

## 用户

确认

## 助手

内容与落点已确认。当前仍是 **Ask 模式**，我不能写入文件。

请切换到 **Agent 模式**，再发一句「确认落库」或「写入」，我会按精简版写入：

1. 草案：`00-待确认区/知识候选/Superpowers使用说明.md`
2. 正式：`06-长期记忆/工具与Agent/Superpowers使用说明.md`（目录若无则新建）

若你希望「确认后只写正式路径、不经过待确认区中转」，也可以在 Agent 模式里一并说明。

## 用户

确认

## 助手

按你确认的精简版写入正式路径；先查看交接文档与目标目录是否已存在。

## 助手

已更新 `工作台/今日.md`。接下来刷新可视化工作台数据。

**目的**：让 HTML 工作台与今日完成项同步。  
**影响**：只读写 `08-自动化/build-workbench.mjs` 生成的 `workbench-data.js` 等构建产物，不改业务正文。  
**动作**：`node 08-自动化/build-workbench.mjs`  
**预期**：命令成功结束；失败时可能报路径或 Node 错误。

## 助手

已落库。

**正式路径：** [`06-长期记忆/工具与Agent/Superpowers使用说明.md`](06-长期记忆/工具与Agent/Superpowers使用说明.md)

同步更新了：`工作台/今日.md`、`agent切换交接文档.md`、`记忆变更日志.md`，并已刷新工作台数据。内容已在聊天里确认，故未再写待确认区中转稿。

## 用户

你看下还有哪些工具可以落使用说明

## 助手

对照工作空间里已有工具与现有说明文档，梳理还能落使用说明的候选。

## 助手

对照仓库后：`06-长期记忆/工具与Agent/` 里目前只有 Superpowers。不少能力已有技术 README，但缺「给你日常怎么用」的精简说明。建议如下。

## 已有说明（不必再写一份重复的）

| 工具 | 现有文档 | 建议 |
|---|---|---|
| Raw 流水线 / 妙记桥 / 聊天桥 | [`08-自动化/README.md`](08-自动化/README.md) | 已较全；可另做**给人看的精简版** |
| 工作台 | [`工作台/README.md`](工作台/README.md) | 够用；可与待确认区合并成一篇日常入口说明 |
| 待确认区 | [`00-待确认区/README.md`](00-待确认区/README.md) | 同上 |
| 全字段截图 | [`08-自动化/系统浏览截图/README.md`](08-自动化/系统浏览截图/README.md) | 有 Agent 向说明；可补「何时用/口令」 |
| 飞书 `lark-*` | 各自 `SKILL.md` | **不要**逐个再写说明书；做一张路由表即可 |
| Superpowers | 已落库 | 完成 |

## 建议优先落「使用说明」的（按价值）

### P0 · 你几乎每天会碰到

1. **工作台 + 待确认落库**  
   - 打开 HTML、刷新数据、确认/修改/驳回口令、和 `今日.md` 的分工  
   - 现有两篇 README 偏分散，适合合成一篇给人看的精简说明  

2. **Raw 采集与消化（会话 Agent）**  
   - 什么会自动进 Raw、`session-agent` 下你说什么让 Agent 消化、索引状态含义、妙记「仅索引」  
   - 技术细节仍链到 `08-自动化/README.md`，这里只写操作面  

3. **工作日报 / 周报**  
   - 口令触发、`generate-daily-work-report` / `generate-weekly-work-report`、18:00 Automations、先确认再落盘、对内/对外边界  
   - 规则已在协作偏好里，缺一篇「怎么用」速查  

### P1 · 近期实操会用到

4. **双引鲸系统浏览（Playwright / 全字段截图）**  
   - 登录边界、凭据只放 `.runtime`、菜单树采集 vs 全字段合图、结果进 Raw/待确认区  
   - 你刚做过菜单树采集，说明书能减少下次口头交代  

5. **飞书能力路由速查**（一张表，不是全套文档）  
   - 例如：云文档→`lark-doc`，云盘→`lark-drive`，妙记→`lark-minutes`，任务→`lark-task`，日历→`lark-calendar`…  
   - 并写清：待办默认写工作空间，只有明示才走飞书任务  

### P2 · 维护向，需要时再写

6. **个人 Skill 跨 Agent 同步（Junction）** — 协作偏好已有步骤，可抽成半页操作卡  
7. **Windows Raw 自动化启停 / 任务安装** — 故障排查用，链到 `08-自动化/README` 即可  
8. **Cursor Automations 装日报/周报** — 交接里还有「待创建周报 Automations」，可写成安装检查清单  

## 不建议单独落说明书的

- 每个 `lark-*` Skill（已有 SKILL.md）  
- `worker-lock`、队列内部状态等实现细节（放自动化 README 即可）  
- Codex/Cursor 通用产品手册（非你们定制工具）  

## 建议目录（与 Superpowers 同级）

全部放：`06-长期记忆/工具与Agent/`

| 文件名（草案） | 覆盖 |
|---|---|
| `工作台与待确认区使用说明.md` | P0-1 |
| `Raw采集与消化使用说明.md` | P0-2 |
| `工作日报与周报使用说明.md` | P0-3 |
| `双引鲸系统浏览使用说明.md` | P1-4 |
| `飞书Skill路由速查.md` | P1-5 |
| （可选）`个人Skill同步说明.md` | P2-6 |

也可先做一篇 **`工具与Agent/README.md` 索引页**，链到上述说明 + 现有技术 README，避免散落。

---

若只选 **1～2 篇先写**，建议先做：**工作台与待确认区** + **Raw 采集与消化**（和你每天协作最相关）。  

当前是 Ask 模式，我只能给清单。你定优先级后切到 Agent 模式，我可以按 Superpowers 同款「先出精简正文 → 你确认再落盘」来写。
