---
date: 2026-08-07
type: Agent聊天
agent: Cursor
session_id: 1f216298-6b5b-4e40-adf5-31fd725a3615
source_path: "C:\\Users\\liaosongping\\.cursor\\projects\\d-Apps-workspaces-xzx\\agent-transcripts\\1f216298-6b5b-4e40-adf5-31fd725a3615\\1f216298-6b5b-4e40-adf5-31fd725a3615.jsonl"
synced_at: 2026-08-07T03:57:11.593Z
status: Agent 聊天原始产物
---

# Agent聊天-Cursor-你看下你现在能识别到的skill有哪些

> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。

## 用户

你看下你现在能识别到的skill有哪些

## 助手

我先按工作区规则读取今日工作台与交接文档，同时整理当前会话里已挂载、可识别的 skill 清单。

## 助手

当前会话里，我能识别到的 skill 如下（按来源分组）：

### Cursor 本地 skill
| Skill | 用途摘要 |
|---|---|
| `automate` | 创建 Cursor Automations |
| `autopilot` | PR 保持可合并（评论、冲突、CI） |
| `canvas` | Cursor Canvas 可视化分析页 |
| `create-hook` | 创建 Cursor hooks |
| `create-rule` | 创建规则 / `RULE.md` / `.cursor/rules` |
| `create-skill` | 编写 Agent Skills |
| `loop` | 按间隔循环执行 prompt/skill |
| `review-bugbot` | Bugbot 代码审阅 |
| `review-security` | Security Review 审阅 |
| `sdk` | Cursor SDK 集成与编程调用 |
| `split-to-prs` | 把改动拆成可审 PR |
| `statusline` | CLI 状态栏配置 |
| `update-cursor-settings` | 改 `settings.json` |

### Codex / 系统 skill
| Skill | 用途摘要 |
|---|---|
| `review-agent` | 只读、缺陷优先的代码变更审阅 |
| `generate-daily-work-report` | 生成中文工作日报 |

### 飞书 / Lark skill（`lark-*`）
| Skill | 用途摘要 |
|---|---|
| `lark-shared` | 登录/授权/身份/权限域 |
| `lark-im` | 即时消息、群、卡片 |
| `lark-doc` | 云文档 Docx/Wiki |
| `lark-markdown` | Markdown 文件读写/对比 |
| `lark-drive` | 云盘文件与权限 |
| `lark-wiki` | 知识空间与节点 |
| `lark-sheets` | 电子表格 |
| `lark-base` | 多维表格 |
| `lark-slides` | 幻灯片 |
| `lark-whiteboard` | 画板 |
| `lark-calendar` | 日历与会议室 |
| `lark-task` | 任务/清单 |
| `lark-approval` | 审批 |
| `lark-mail` | 邮箱 |
| `lark-contact` | 通讯录 |
| `lark-minutes` | 妙记 |
| `lark-note` | 会议纪要 Note |
| `lark-vc` | 视频会议历史/纪要 |
| `lark-vc-agent` | 机器人入会与会中能力 |
| `lark-event` | 实时事件监听 |
| `lark-attendance` | 考勤打卡 |
| `lark-okr` | OKR |
| `lark-apps` | 妙搭应用开发与托管 |
| `lark-skill-maker` | 自定义 lark-cli Skill |
| `lark-openapi-explorer` | 原生 OpenAPI 探索 |
| `lark-workflow-meeting-summary` | 会议纪要汇总工作流 |
| `lark-workflow-standup-report` | 日程+待办摘要 |

### 浏览器
| Skill | 用途摘要 |
|---|---|
| `browser-automation` | 用 MCP 做网页浏览与交互自动化 |

---

合计约 **42** 个。说明：这是当前会话注入给我的可用 skill 列表；要用某个时，我会先读对应 `SKILL.md` 再按说明执行。

## 用户

hooks是什么，什么时候我可以使用它
browser-automation是playwright的某个技能还是它的全部技能呢？

## 助手

我先读一下 `create-hook` 和 `browser-automation` 的 skill 说明，再按文档准确回答。

## 助手

分两点说清楚：

## 1. Hooks 是什么？什么时候用？

这里的 **hooks** 指的是 **Cursor Agent Hooks**，不是 React Hooks，也不是 Git hooks。

本质是：在 Agent 生命周期的某些节点，自动跑一段**脚本**或**提示词检查**。钩子通过 stdin/stdout 交换 JSON，可以：

- **观察**：记日志、审计
- **拦截**：允许 / 拒绝 / 要求人工确认
- **改写**：改工具入参、注入额外上下文
- **跟进**：工具成功后追加提示、串起子 Agent

配置位置：

| 范围 | 路径 |
|---|---|
| 项目级（可进仓库） | `.cursor/hooks.json` + `.cursor/hooks/*` |
| 用户级（本机全局） | `~/.cursor/hooks.json` + `~/.cursor/hooks/*` |

常见触发点举例：

| 场景 | 事件 |
|---|---|
| 拦危险终端命令 | `beforeShellExecution` |
| 改完文件后自动格式化 | `afterFileEdit` |
| 发 prompt 前查密钥/违规 | `beforeSubmitPrompt` |
| 控 MCP 调用 | `beforeMCPExecution` |
| 控子 Agent | `subagentStart` / `subagentStop` |

**适合用 hooks 的时候**：你希望某类行为**稳定、自动、可复现**地发生，而不是每次靠聊天里口头提醒 Agent。例如：

- 禁止/`ask` 含 `curl|rm -rf` 的命令  
- Agent 改代码后自动跑 formatter  
- 提交 prompt 前扫描是否像在贴密码  
- 审计所有 shell / MCP 调用  

**不太适合用 hooks 的时候**：一次性临时任务、只靠自然语言就能说清的协作偏好（那种更适合写进规则 / 长期记忆）。

---

## 2. `browser-automation` 是不是 Playwright？

**不是 Playwright skill，也不是 Playwright 全家桶。**

`browser-automation` 是 Cursor **Browse 插件**里的一份使用说明 skill：教 Agent 怎么用浏览器 MCP 工具（`browser_navigate`、`browser_click`、`browser_fill` 等）去操作**真实 Chrome**。

对应关系可以这么理解：

| 概念 | 实际是什么 |
|---|---|
| `browser-automation` skill | 给 Agent 的操作手册（何时 snapshot、如何用 ref 点元素） |
| 底层能力 | Browse MCP：本机 Chrome daemon，或可选 Browserbase 云端 |
| Playwright | **不是**这个 skill；文档里也没把它定义成 Playwright API 封装 |

它覆盖的是**网页交互自动化的常用能力**：打开页面、点按钮、填表、截图、多标签、跑一点页面内 JS、看网络请求等。  
它**不是**：

- Playwright 完整 API / 测试框架  
- 本地写 `playwright.config.ts`、跑 E2E 测试套件  
- 完整的浏览器工程化测试栈  

一句话：`browser-automation` =「让 Agent 用 Cursor 浏览器工具帮你点网页」的 skill；不是「Playwright 的某个子集或全部」。

## 用户

那你帮我安装一下Playwright 工具，我后续要用，用他来帮我捕获网页信息，操作网页等

## 助手

先看一下工作区里有没有现成的 Node/Python 项目，再决定 Playwright 的安装方式与落点。

## 助手

工作区目前没有 Node/Python 项目骨架。接下来会在本机检查 Node/npm，并在 `08-自动化/playwright-tools` 下安装 Playwright（含 Chromium），方便你后续抓网页、操作页面。

**将执行的命令说明：**

1. **目的**：确认 Node/npm 是否可用；不可用则先说明缺口。  
2. **影响**：只读查版本与路径，不改文件。  
3. **动作**：`node -v`、`npm -v`、`where node/npm`。  
4. **预期**：看到版本号；若失败则改安装路径或改用 Python 方案。

若 Node 可用，接着会：

1. **目的**：在 `08-自动化/playwright-tools` 初始化项目并安装 Playwright + 浏览器。  
2. **影响**：新建该目录与 `package.json`/`node_modules`；下载 Chromium（体积较大）。  
3. **动作**：`npm init -y` → `npm i -D playwright` → `npx playwright install chromium`。  
4. **预期**：安装成功；可用一小段脚本打开页面验证。  

开始执行前请在弹窗里点同意/Run。

## 助手

Node/npm 已就绪（v24.18.1 / 11.16.0）。接下来在工作区安装 Playwright 工具包。

**命令说明：**

1. **目的**：创建 `08-自动化/playwright-tools`，安装 Playwright 与 Chromium，并加一份可运行的抓取示例。  
2. **影响**：新建该目录及 `package.json`、`node_modules`、示例脚本；下载 Chromium 浏览器文件（约数百 MB）。  
3. **动作**：建目录 → `npm init -y` → `npm i -D playwright` → `npx playwright install chromium` → 写入示例脚本。  
4. **预期**：安装完成；示例能打开网页并打印标题。失败时可能报网络/磁盘权限问题。  

请在弹窗中同意执行。

## 助手

Chromium 正在下载（约 192MB），我继续等安装结束。

## 助手

安装已成功。接下来会写入示例脚本、补上 npm scripts，并跑一次打开网页的冒烟验证。

## 助手

接下来做冒烟验证：用示例脚本打开 `https://example.com`，确认 Chromium 能真正启动。

**命令说明：**
1. **目的**：验证 Playwright + Chromium 可用。  
2. **影响**：在 `08-自动化/playwright-tools/output/` 写入截图与 JSON；短暂启动无界面浏览器。  
3. **动作**：在该目录执行 `npm run capture`。  
4. **预期**：终端打印标题/URL；`output/` 有文件。若报浏览器未找到，再把浏览器装到用户目录并重试。

## 助手

Playwright 已装好，并完成冒烟验证。

### 安装位置
`08-自动化/playwright-tools/`

- **Playwright** `^1.62.1`（Node）
- **Chromium**（含 headless shell）
- 示例脚本：
  - `examples/capture-page.js`：抓标题 / 正文摘要 / 全页截图
  - `examples/interact-page.js`：填搜索、回车、取结果标题

### 已验证
对 `https://example.com` 捕获成功，输出在 `output/`。

### 常用命令
在 `08-自动化/playwright-tools` 下：

```bash
# 捕获网页信息（无界面）
npm run capture -- https://你的网址

# 有界面看浏览器怎么操作
npm run capture -- https://你的网址 --headed

# 交互示例（DuckDuckGo 搜索）
npm run interact -- "关键词" --headed
```

### 和 Cursor `browser-automation` 的区别
| | Playwright（刚装的） | browser-automation |
|---|---|---|
| 用途 | 你自己写脚本、批量抓取、稳定自动化 | 聊天里让 Agent 点网页 |
| 运行方式 | `node` / `npm run` | Cursor Browse MCP |

后续你要抓哪个系统页面、或要我按业务流程写脚本，直接说 URL 和步骤即可。
