---
date: 2026-08-12
type: Agent聊天
agent: Cursor
session_id: 246d26b5-158c-4f69-a8bb-78e5dc306503
source_path: "C:\\Users\\liaosongping\\.cursor\\projects\\d-Apps-workspaces-xzx\\agent-transcripts\\246d26b5-158c-4f69-a8bb-78e5dc306503\\246d26b5-158c-4f69-a8bb-78e5dc306503.jsonl"
synced_at: 2026-08-12T02:32:06.739Z
status: Agent 聊天原始产物
---

# Agent聊天-Cursor-你把superpowers安装在哪里了，codex并未找到他，

> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。

## 用户

你把superpowers安装在哪里了，codex并未找到他，

## 助手

先查工作空间交接文档和本机里 `superpowers` 的安装位置，再对照 Codex 的查找路径说明原因。

## 助手

文档写明是 Cursor 插件；接着核对本机实际路径，以及 Codex 侧有没有对应安装。

## 助手

结论：**当时是按 Cursor 插件装的，不是 Codex 插件，也没进 `~/.agents/skills`；Codex 找不着是正常的。**

### 实际位置

| 端 | 状态 |
|---|---|
| **Cursor** | 文档记为「已装」；本机 `~/.cursor/plugins/cache/` 里目前只有 `browse`，**没有** `superpowers` 目录 |
| **Codex** | 有缓存：`C:\Users\liaosongping\.codex\plugins\cache\openai-curated-remote\superpowers\6.2.0\`，但 `~/.codex\config.toml` 里**未启用**（已启用的是 browser、chrome、documents 等，没有 `superpowers@...`） |
| **个人 Skill 同步目录** | `~/.agents/skills` 里也没有 |

### 为什么 Codex 找不到

Superpowers 是 **插件**，不是你们周报那种 Junction 同步的个人 Skill。Cursor / Codex **要各自安装并启用**；只在 Cursor 侧操作，Codex 不会自动出现。

### 若要在 Codex 用

在 Codex 插件市场安装/启用 **Superpowers**，确认 `config.toml` 出现类似：

```toml
[plugins."superpowers@openai-curated-remote"]
enabled = true
```

（具体 marketplace 后缀以 Codex 安装后写入为准。）

需要的话切到 Agent 模式，我可以按你确认后帮你在 Codex 侧启用并核对。

## 用户

为什么我在cursor中用/也无法搜索到呢

## 助手

先核对 Cursor 本机插件与技能目录，确认 Superpowers 是否真的装上、以及 `/` 能搜到什么。

## 助手

原因很直接：**本机 Cursor 里其实没有装上 Superpowers**，所以 `/` 搜不到。

本机核对结果：

- `~/.cursor/plugins/` 只有 `browse`，没有 `superpowers`
- `~/.agents/skills/` 也没有（只有飞书 `lark-*`、周报等）
- 文档里写的「本机已装」，来自上次说明草案的表述，**不是落盘安装证据**

`/` 只会列出已安装技能；没装就不会出现 `brainstorming`、`using-superpowers` 等。

要装的话，在 Agent 聊天输入：

```text
/add-plugin superpowers
```

或打开 Cursor 插件市场搜索 `superpowers` 安装。装好后重启/新开对话，再用 `/` 搜。

需要我现在帮你在 Cursor 里装上的话，直接说一声。

## 用户

Show me how the Superpowers plugin works

## 助手

Superpowers 装好后，是一套**会自动介入的工作流**：先想清楚 → 再计划 → 再实现 → 有证据再宣称完成。

## 怎么运作

1. **会话开始**  
   `sessionStart` hook 会自动加载约定；`using-superpowers` 提醒 Agent：动手前先找对技能。

2. **你怎么触发**  
   - 聊天输入 `/`，手动选技能  
   - 更常见：说出目标后，Agent **自动**选用对应技能  
   - Rules / Hooks **自动生效**，不用每次喊

3. **标准主链路（做功能时）**

```text
brainstorming → writing-plans →（可选 worktree）
→ 执行计划 + TDD → 评审 → 验证 → 收尾分支
```

## 技能一览

| 场景 | 技能 |
|---|---|
| 任何对话起步 | `using-superpowers` |
| 新功能 / 改行为前 | `brainstorming` |
| 多步骤动手前 | `writing-plans` |
| 按计划落地 | `executing-plans`、`subagent-driven-development` |
| 2+ 无依赖任务 | `dispatching-parallel-agents` |
| 写实现代码前 | `test-driven-development` |
| 遇到 bug / 失败 | `systematic-debugging` |
| 声称完成前 | `verification-before-completion` |
| 提审 / 收审 | `requesting-code-review`、`receiving-code-review` |
| 隔离开发 / 合入收尾 | `using-git-worktrees`、`finishing-a-development-branch` |
| 自造 Skill | `writing-skills` |

## 你可以怎么试

- 直接说目标，例如：「帮我设计一个需求池」→ 通常先走 `brainstorming`  
- 或手动：`/brainstorming`、`/writing-plans`、`/verification-before-completion`

对本工作空间：业务事实、待办、落库仍以 Markdown + 待确认区为准；不必每次都走完整工程流水线。产品文档类优先用 brainstorming → writing-plans → verification。
