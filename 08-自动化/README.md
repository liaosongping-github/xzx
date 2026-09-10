# Raw 自动采集与知识消化

本目录实现统一入口：飞书妙记、Agent 聊天落盘和人工复制资料都会先进入 `01-原始文件（Raw）`，再进入同一个持久化消化队列。

采集自动化挂在 **Windows 本机**（登录自启 + Node 常驻进程）。消化责任由 `digest-engine.json` 的 `mode` 决定：默认由**当前会话 Agent**消化，流水线自动调用 Codex 仅为可选后备。

## 消化模式（digest-engine）

配置文件：[`digest-engine.json`](digest-engine.json)

| mode | 行为 |
|---|---|
| `session-agent`（默认） | 扫描、入队、索引照常；`processNext` **不调用 Codex**。待消化项状态为 `待Agent消化`，等待当前会话 Agent 按提示词消化。不会标成最终失败。 |
| `codex` | 保持原行为：流水线自动调用 Codex CLI 消化队列。 |

如何切换：

1. 编辑 `08-自动化/digest-engine.json`，将 `"mode"` 改为 `"session-agent"` 或 `"codex"`。
2. 保存后，下一次 `watch`/`once` 扫描会按新 mode 生效（无需改采集桥）。
3. 缺文件或非法 mode 时，流水线回退为 `session-agent`，不崩溃。

会话 Agent 如何消化：

1. 查看 `01-原始文件（Raw）/README.md` 中学习状态为「未学习 / 部分学习」的条目，或运行状态中的 `待Agent消化` / `待处理`。
2. 按资料类型使用 `知识消化提示词.md` 或 `聊天知识消化提示词.md`。
3. 消化完成后：更新提炼稿与知识落点；并将索引中「学习状态」设为「已学习」、「最后学习时间」设为上海时区精确到分钟（`YYYY-MM-DD HH:mm`）。流水线会据此把队列项同步为已完成。
4. 采集桥：妙记默认**仅登记 README**（见 `lark-minutes-bridge.json`）；agent-chat 仍落盘聊天 Raw。与消化引擎解耦——只旁路「调用 Codex 消化」。

## 组成

- `digest-engine.json`：消化引擎模式开关（`session-agent` / `codex`）。
- `raw-pipeline.mjs`：递归扫描 Raw、等待文件稳定、计算主文档及引用附件的组合哈希、维护学习状态和索引；仅在 `mode=codex` 时调用 Codex 消化。
- `lark-minutes-bridge.mjs`：监听妙记生成事件与每日补漏；默认**仅登记** Raw README 在线链接（不落本地源文件）。
- `lark-minutes-bridge.json`：`localSourceSync`（默认 `false`）。`true` 时恢复完整本地同步（须廖送平明示）。
- `agent-chat-bridge.mjs`：同步 Cursor / Codex 本工作空间会话为 Agent 聊天 Raw；稳定空闲后写入，避免进行中对话反复触发。
- `chat-sources.json`：聊天来源根目录、稳定窗口与扩展位配置。
- `worker-lock.mjs`：常驻进程单实例锁；异常退出后自动识别并清理陈旧锁，避免重复扫描和 RAW 编号竞争。
- `知识消化提示词.md`：普通 Raw 提炼的安全边界和输出约定（Codex 与会话 Agent 共用）。
- `聊天知识消化提示词.md`：Agent 聊天 Raw 专用，允许分流到协作偏好、工作档案、待确认问题等长期记忆。
- `start-raw-automation.ps1`：隐藏启动三个常驻进程（另保留中文入口文件）。
- `安装Windows任务.ps1`：安装登录自启动、每日妙记补漏与每日聊天补漏任务。
- [`工作日报定时任务-提示词.md`](工作日报定时任务-提示词.md)：Cursor Automations「大小周工作日日报」Instructions 权威副本（双轨日报 + 确认后落盘）。

## Cursor 18:00 工作日报自动化

- **产品**：Cursor Automations（云端 Agent），非本目录 Windows 任务。
- **任务名**：大小周工作日日报
- **Cron**：`0 18 * * 1-6`（上海时区；小周周六在 Instructions 内按 [大小周工作日规则](../06-长期记忆/大小周工作日规则.md) 跳过）
- **Instructions 权威源**：[`工作日报定时任务-提示词.md`](工作日报定时任务-提示词.md)
- **输出**：对内 + 对外两份草案 → 发廖送平确认（可补充线下工作）→ 确认后落盘；**不自动落盘**

若 Automations 里 Instructions 与上述文件不一致，以工作空间文件为准并更新 Automations。

## 可视化工作台

- 人类入口：[`工作台/我的工作台.html`](../工作台/我的工作台.html)
- Agent 权威：[`工作台/今日.md`](../工作台/今日.md)
- 待审草案：[`00-待确认区/`](../00-待确认区/README.md)
- 构建命令：`node .\08-自动化\build-workbench.mjs`（输出 `.runtime/workbench.json` 与 `工作台/workbench-data.js`）

## 常用命令

```powershell
# 刷新「我的工作台」数据
node .\08-自动化\build-workbench.mjs

# 本地规则自检
node .\08-自动化\raw-pipeline.mjs self-test
node .\08-自动化\agent-chat-bridge.mjs self-test

# 建立既有 Raw 基线（首次运行自动执行）
node .\08-自动化\raw-pipeline.mjs baseline

# Agent 聊天：历史会话标记为已见（不批量导出）+ 近 7 天增量导出
node .\08-自动化\agent-chat-bridge.mjs baseline
node .\08-自动化\agent-chat-bridge.mjs backfill

# 单次扫描并消化 / 单次同步聊天
node .\08-自动化\raw-pipeline.mjs once
node .\08-自动化\agent-chat-bridge.mjs once

# 修复后只重新处理一条失败资料
node .\08-自动化\raw-pipeline.mjs retry-failed "01-原始文件（Raw）/文件名.md"

# Raw 原文补全或修正后按最新内容重新消化
node .\08-自动化\raw-pipeline.mjs reprocess "01-原始文件（Raw）/文件名.md"

# 常驻运行（含 raw / 妙记 / agent-chat 三个 worker）
powershell -ExecutionPolicy Bypass -File .\08-自动化\启动Raw自动化.ps1

# 重新注册 Windows 任务（登录自启 + 09:00 妙记补漏 + 09:10 聊天补漏）
powershell -ExecutionPolicy Bypass -File .\08-自动化\安装Windows任务.ps1

# 飞书历史基线与补漏
node .\08-自动化\lark-minutes-bridge.mjs baseline
node .\08-自动化\lark-minutes-bridge.mjs backfill
```

## Agent 聊天同步说明

- Cursor：读取 `%USERPROFILE%\.cursor\projects\<本工作空间>\agent-transcripts\**\*.jsonl`
- Codex：读取 `%USERPROFILE%\.codex\sessions\**\rollout-*.jsonl`，仅保留 `cwd` 指向本工作空间的会话
- 正文只保留用户消息与助手回复文本，剥离工具调用、系统/开发者长提示；基础脱敏 token/密码/私钥
- 默认稳定空闲约 20 分钟后写入 Raw；`backfill` 忽略空闲窗口，导出近 7 天
- 状态保存在 `.runtime/chat-state.json`；其他无法自动抓取的 Agent 请放入 `01-原始文件（Raw）/Agent聊天手动导入/`

## 行为边界

- 不修改 Raw 原文件（聊天桥写入的是新的/覆盖的聊天 Raw，不改飞书等其他 Raw）。
- `附件/` 不独立建立索引；主文件引用的附件会进入组合哈希，引用附件修改、缺失或恢复都会触发主文件重新学习，未引用附件变化不会触发。
- 索引学习状态只展示“未学习、部分学习、已学习”。已学习文件内容变化后立即转为部分学习，重新消化成功后恢复为已学习；失败不会覆盖上次学习时间和知识库落点。
- “入 Raw 时间”取首次登记日期，文件后续修改不会改变；“最后学习时间”只在成功完成当前版本学习后更新。
- 未验证材料不会自动进入“已验证事实”；聊天类消化仅在用户明确确认时才可写入已验证事实。
- `.runtime/` 保存本机队列、去重状态和日志，不保存飞书或 Codex 凭据。
- lark-cli 登录态由其自身安全凭据存储管理。
- `mode=codex` 时，Codex 子进程会显式继承 Windows 用户主目录；失败重试采用延迟退避，不会在数百毫秒内耗尽全部重试次数。
- `mode=session-agent` 时不会因 Codex API 断连而空转失败；积压项保持 `待Agent消化`，由当前会话 Agent 消化。
- 补漏/监听会继续发现新妙记；默认 `localSourceSync=false` 时只往 Raw README 追加在线链接行，不落本地源文件、不下载逐字稿。
- 仅当 `lark-minutes-bridge.json` 中 `localSourceSync=true`（须明示）时，才同步完整产物到本地；此时逐字稿会递归读取 lark-cli 产物子目录，历史漏收可用 `repair-transcript <minute_token>` 回补后再运行 `reprocess`。

## 故障查看

运行日志位于 `08-自动化/.runtime/`：

- `raw-pipeline.log` / `raw-pipeline.stdout.log`
- `lark-bridge.log` / `lark-minutes.stdout.log`
- `agent-chat-bridge.log` / `agent-chat.stdout.log`

状态文件中的内部状态为：`待处理`、`待Agent消化`、`处理中`、`待稳定`、`已完成`、`失败`、`待人工处理`；它们会映射为索引中的三种学习状态。
