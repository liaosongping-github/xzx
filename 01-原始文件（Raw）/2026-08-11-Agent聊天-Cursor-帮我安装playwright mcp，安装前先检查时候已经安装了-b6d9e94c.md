---
date: 2026-08-11
type: Agent聊天
agent: Cursor
session_id: 0e6f3e2a-932b-40c0-ba36-c69eb6d9e94c
source_path: "C:\\Users\\liaosongping\\.cursor\\projects\\d-Apps-workspaces-xzx\\agent-transcripts\\0e6f3e2a-932b-40c0-ba36-c69eb6d9e94c\\0e6f3e2a-932b-40c0-ba36-c69eb6d9e94c.jsonl"
synced_at: 2026-08-11T02:28:43.992Z
status: Agent 聊天原始产物
---

# Agent聊天-Cursor-帮我安装playwright mcp，安装前先检查时候已经安装了

> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。

## 用户

帮我安装playwright mcp，安装前先检查时候已经安装了

## 助手

按协作规则，先读取工作台与交接文档，并在本地配置里查找是否已有 Playwright MCP。

## 助手

继续查 Cursor 的 MCP 配置文件，确认是否已注册 Playwright MCP。

## 助手

检查结果：当前会话未加载 Playwright MCP（仅有内置浏览器与 browse 插件）。接着核对用户级与项目级 `mcp.json` 是否存在。

## 助手

检查结论：**尚未安装官方 Playwright MCP**（`@playwright/mcp`）。

| 检查项 | 结果 |
|---|---|
| 用户级 `C:\Users\liaosongping\.cursor\mcp.json` | 不存在 |
| 项目级 `.cursor/mcp.json` | 不存在 |
| 当前会话已加载的 MCP | 仅有 `cursor-ide-browser`、`plugin-browse-browser`（browse 插件自带 Playwright 库，不是 Playwright MCP） |

接下来按官方方式写入用户级 MCP 配置，并确认 Node/`npx` 可用。

**将执行的操作（需你授权时请点同意）：**

1. **目的**：确认本机 Node.js 与 `npx` 可用（Playwright MCP 依赖它们）  
   **影响**：只读，不改文件  
   **动作**：`node -v`、`where.exe npx`  
   **预期**：看到版本号与 `npx` 路径；失败则提示未安装 Node

2. **目的**：写入用户级 MCP 配置，注册 Playwright MCP  
   **影响**：新建 `C:\Users\liaosongping\.cursor\mcp.json`（仅添加 `playwright` 服务）  
   **动作**：写入配置：`npx -y @playwright/mcp@latest`  
   **预期**：文件存在且含 `playwright` 条目

3. **目的**：预拉取 `@playwright/mcp`，避免 Cursor 首次启动时卡住  
   **影响**：通过 npm 下载包到本机缓存；可能触发浏览器二进制下载  
   **动作**：`npx -y @playwright/mcp@latest --help`  
   **预期**：输出帮助信息；失败可能是网络/权限问题

开始执行。

## 助手

终端因沙箱限制未能启动。接下来用关闭沙箱的方式重试检查，并写入 MCP 配置。

**将执行的操作：**

1. **目的**：在无沙箱环境下确认 Node/`npx` 可用  
   **影响**：只读系统命令，不改业务文件  
   **动作**：`node -v`、`where.exe npx`  
   **预期**：输出版本与路径

2. **目的**：创建用户级 Playwright MCP 配置  
   **影响**：新建 `C:\Users\liaosongping\.cursor\mcp.json`  
   **动作**：写入官方推荐的 `npx -y @playwright/mcp@latest` 配置  
   **预期**：文件可读且含 `playwright` 服务

3. **目的**：预拉取 `@playwright/mcp` 包  
   **影响**：npm 缓存下载；可能拉浏览器依赖  
   **动作**：`npx -y @playwright/mcp@latest --help`  
   **预期**：打印帮助信息

## 助手

**安装完成。** 安装前已确认：用户级与项目级均无 Playwright MCP 配置，当前会话也未加载该服务。

### 检查结果
- `C:\Users\liaosongping\.cursor\mcp.json`：原先不存在
- 项目 `.cursor/mcp.json`：不存在
- 已有浏览器能力：`cursor-ide-browser`、`plugin-browse-browser`（不是官方 Playwright MCP）

### 已完成
- Node.js `v24.18.1`，`npx` 可用
- 已写入用户级配置：`C:\Users\liaosongping\.cursor\mcp.json`
- 已预拉取 `@playwright/mcp@latest`（`--help` 正常）

### 你需要做的一步
在 Cursor 中让 MCP 重新加载：
1. 打开 **Settings → MCP**，确认出现 `playwright` 并显示为已连接；或  
2. **重启 Cursor**

生效后，Agent 应能使用 Playwright MCP 的浏览器自动化工具（与现有内置 browser 并存）。若 MCP 面板报错，把错误信息发我即可排查。

## 用户

安装完mcp后，我后续如何使用playwright

## 助手

先确认当前会话是否已加载 Playwright MCP，再说明具体用法。

## 助手

Playwright MCP 已就绪（服务名 `user-playwright`）。你这边**不用自己写 Playwright 脚本**，在 Cursor 对话里用自然语言下指令即可，Agent 会调用 MCP 工具操作真实浏览器。

### 日常怎么用

在 Agent 聊天里直接说目标，例如：

- 「打开 https://demo.playwright.dev/todomvc，加 3 条待办」
- 「打开双引鲸登录页，截一张首页图」
- 「点提交按钮，等页面出现成功提示」
- 「把当前页面填表：邮箱 xxx，密码 ***，然后登录」

典型流程是：打开页面 → `browser_snapshot` 看可点元素 → 点击/输入 → 再 snapshot 确认结果。默认会弹出**有界面的浏览器**，你能跟着看。

### 和现有浏览器能力怎么选

| 工具 | 适合 |
|---|---|
| **Playwright MCP**（刚装的） | 独立浏览器窗口、复杂页面操作、填表、多标签、看网络请求 |
| **Cursor 内置 browser** | 编辑器内嵌浏览、轻量点选截图 |

需要「真浏览器自动化」时，说一句「用 Playwright」即可。

### 常用能力（用说话触发）

- 打开/后退、点击、输入、填表、下拉选择
- 截图、等待某段文字出现
- 多标签页
- 查看控制台、网络请求
- 复杂操作可让 Agent 跑一小段 Playwright 代码

### 登录态

默认会**记住 Cookie**（同一项目大致共用一个浏览器配置），下次开同站可能还在登录状态。若要每次干净环境，可在 MCP 配置里加 `--isolated`。

### 注意

1. Settings → MCP 里确认 `playwright` 为已连接（当前已是 ready）。
2. 不要把密码写进长期文档；临时登录可当面输入，或让 Agent 操作时你自己填敏感项。
3. 这是**对话里驱动浏览器**，不是写自动化测试用例；若要正式测试项目，需另装 `@playwright/test`。

想立刻试一把的话，可以直接回我：  
「用 Playwright 打开 https://demo.playwright.dev/todomvc 并加两条待办」。

## 用户

我的浏览器是否需要安装插件什么的吗

## 助手

**一般不需要装插件。**

你现在的配置是默认模式：Playwright MCP 会自己拉起一个浏览器窗口（通常是 Chromium），Agent 直接控制它。本机 Chrome/Edge 不用装扩展也能用。

### 什么时候才需要插件？

只有当你想改成「接到你正在用的 Chrome/Edge」时，才需要官方的 Playwright 浏览器扩展，并在 MCP 配置里加上 `--extension`。那是可选能力，不是安装 MCP 的必需步骤。

### 和你机器上已有浏览器的关系

| 方式 | 要不要插件 |
|---|---|
| 默认：MCP 自己开浏览器 | 不需要 |
| 可选：连到你已打开的 Chrome/Edge（`--extension`） | 需要装 Playwright Extension |

另外：首次跑某些浏览器时，Playwright 可能会自动下载对应浏览器内核，这是正常的，也不是装“插件”。

结论：按你当前用法，打开 Cursor 对话里让 Agent「用 Playwright 打开某某网址」即可，不用额外装浏览器插件。

## 用户

怎么下载Playwright Extension插件

## 助手

查一下官方 Playwright Extension 的安装入口与用法。

## 助手

官方推荐从 **Chrome 应用商店** 安装，扩展名是 **Playwright MCP Bridge**。

### 下载 / 安装入口

打开这个链接（Chrome / Edge 都能用）：

https://chromewebstore.google.com/detail/playwright-mcp-bridge/mmlmfjhmonkocbjadbfplnigmagldckm

### Chrome

1. 打开上面的链接  
2. 点「添加至 Chrome」  
3. 确认安装  

### Edge

1. 用 Edge 打开同一商店链接  
2. 若提示允许来自其他商店的扩展，按提示开启  
3. 点「获取」/「添加扩展」  

### 装完后还要改 MCP 配置（可选模式才需要）

插件 alone 不够，还要把 Playwright MCP 改成扩展连接模式，例如在 `mcp.json` 里加上 `--extension`：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--extension"]
    }
  }
}
```

改完后重启 Cursor，或在 Settings → MCP 里刷新该服务。

### 提醒

- **默认模式不需要这个插件**；只有想控制「你本机已打开、已登录的 Chrome/Edge 标签页」时才需要。  
- 我当前是 Ask 模式，不能替你改配置；若要我帮你改 `mcp.json`，请切到 Agent 模式。
