import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { acquireWorkerLock } from "./worker-lock.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const RAW_DIR = join(ROOT, "01-原始文件（Raw）");
const INDEX_FILE = join(RAW_DIR, "README.md");
const RUNTIME_DIR = join(import.meta.dirname, ".runtime");
const LARK_DIR = join(RUNTIME_DIR, "lark");
const STATE_FILE = join(RUNTIME_DIR, "lark-state.json");
const CONFIG_FILE = join(import.meta.dirname, "lark-minutes-bridge.json");
const LOG_FILE = join(RUNTIME_DIR, "lark-bridge.log");
const WATCH_LOCK_FILE = join(RUNTIME_DIR, "lark-minutes-watch.lock");
const MODE = process.argv[2] ?? "watch";
const RECONNECT_DELAY_MS = 60_000;
const RETRY_BASE_MS = 5 * 60 * 1000;
const DONE_STATUSES = new Set(["已同步", "已登记", "基线"]);

function larkCommand() {
  if (process.env.LARK_CLI) return { executable: process.env.LARK_CLI, prefix: [] };
  const script = join(process.env.APPDATA ?? "", "npm", "node_modules", "@larksuite", "cli", "scripts", "run.js");
  return existsSync(script) ? { executable: process.execPath, prefix: [script] } : { executable: "lark-cli.cmd", prefix: [] };
}
mkdirSync(LARK_DIR, { recursive: true });
if (MODE === "watch") acquireWorkerLock(WATCH_LOCK_FILE, "飞书妙记监听进程");

function now() { return new Date().toISOString(); }
function localDate(value = new Date()) { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(value); }
function log(message, data) {
  const line = `${now()} ${message}${data ? ` ${JSON.stringify(data)}` : ""}\n`;
  writeFileSync(LOG_FILE, line, { encoding: "utf8", flag: "a" });
  process.stdout.write(line);
}
function loadConfig() {
  const defaults = { version: 1, localSourceSync: false };
  if (!existsSync(CONFIG_FILE)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(readFileSync(CONFIG_FILE, "utf8")) };
  } catch {
    return defaults;
  }
}
function loadState() {
  if (!existsSync(STATE_FILE)) return { version: 1, baselineCreated: false, tokens: {}, events: {} };
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")); } catch { return { version: 1, baselineCreated: false, tokens: {}, events: {} }; }
}
let state = loadState(); state.tokens ??= {}; state.events ??= {};
function refreshState() {
  const disk = loadState(); disk.tokens ??= {}; disk.events ??= {};
  state = { ...state, ...disk, tokens: { ...state.tokens, ...disk.tokens }, events: { ...state.events, ...disk.events } };
}
function saveState() {
  const disk = loadState(); disk.tokens ??= {}; disk.events ??= {};
  state = { ...disk, ...state, tokens: { ...disk.tokens, ...state.tokens }, events: { ...disk.events, ...state.events } };
  const temp = `${STATE_FILE}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, "utf8"); renameSync(temp, STATE_FILE);
}
function run(args, options = {}) {
  return new Promise((resolvePromise) => {
    const command = larkCommand();
    const child = spawn(command.executable, [...command.prefix, ...args], { cwd: options.cwd ?? ROOT, windowsHide: true, stdio: [options.keepStdin ? "pipe" : "ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; options.onStdout?.(d.toString()); });
    child.stderr.on("data", (d) => { stderr += d; options.onStderr?.(d.toString()); });
    child.on("error", (error) => resolvePromise({ code: -1, stdout, stderr: `${stderr}\n${error}` }));
    child.on("close", (code) => resolvePromise({ code: code ?? -1, stdout, stderr }));
  });
}
function jsonFrom(text) {
  const start = text.indexOf("{");
  if (start < 0) throw new Error(`命令未返回 JSON：${text.slice(0, 300)}`);
  return JSON.parse(text.slice(start));
}
function collectTokens(value, out = new Map()) {
  if (Array.isArray(value)) value.forEach((v) => collectTokens(v, out));
  else if (value && typeof value === "object") {
    const searchToken = typeof value.token === "string" && (value.meta_data || value.display_info) ? value.token : undefined;
    const token = value.minute_token ?? value.minuteToken ?? searchToken;
    if (typeof token === "string") {
      if (!value.title && typeof value.display_info === "string") value.title = value.display_info.split(/\r?\n/, 1)[0];
      out.set(token, value);
    }
    Object.values(value).forEach((v) => collectTokens(v, out));
  }
  return out;
}
function cleanName(value) {
  return String(value || "飞书妙记").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "飞书妙记";
}
function safeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}
function renderObject(value) {
  if (value === undefined || value === null || value === "") return "（无）";
  if (typeof value === "string") return value;
  return `\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
function filesRecursively(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...filesRecursively(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
function transcriptText(dir) {
  if (!existsSync(dir)) return "（未返回逐字稿文件）";
  const files = filesRecursively(dir).filter((path) => basename(path).toLowerCase().includes("transcript"));
  return files.map((path) => `### ${relative(dir, path).split("\\").join("/")}\n\n${readFileSync(path, "utf8")}`).join("\n\n") || "（未返回逐字稿文件）";
}
function indexHasToken(token) {
  if (!existsSync(INDEX_FILE)) return false;
  const text = readFileSync(INDEX_FILE, "utf8");
  return text.includes(token) || text.includes(`/minutes/${token}`);
}
function nextRawId(date) {
  const compact = date.replaceAll("-", "");
  const text = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, "utf8") : "";
  const used = new Set([...text.matchAll(/RAW-\d{8}-\d+/g)].map((m) => m[0]));
  for (const item of Object.values(state.tokens)) if (item.rawId) used.add(item.rawId);
  let sequence = 1;
  let candidate;
  do {
    candidate = `RAW-${compact}-${String(sequence).padStart(3, "0")}`;
    sequence++;
  } while (used.has(candidate));
  return candidate;
}
function appendIndexOnlyRow({ rawId, date, title, url, summary }) {
  if (!existsSync(INDEX_FILE)) throw new Error(`缺少 Raw 索引：${INDEX_FILE}`);
  let text = readFileSync(INDEX_FILE, "utf8");
  if (text.includes(url) || text.includes(rawId)) return false;
  const row = `| ${rawId} | ${date} | 飞书妙记（仅在线链接） | ${safeCell(title)} | ${safeCell(summary)} | 未学习 | 尚未形成业务知识库条目 | — | [在线妙记](${url}) |`;
  const lines = text.split(/\r?\n/);
  let insertAt = lines.findIndex((line, index) => index > 0 && line.startsWith("> ") && lines.slice(0, index).some((x) => x.startsWith("| RAW-")));
  if (insertAt < 0) insertAt = lines.findIndex((line) => line === "## 规则");
  if (insertAt < 0) insertAt = lines.length;
  while (insertAt > 0 && lines[insertAt - 1] === "") insertAt--;
  lines.splice(insertAt, 0, row, "");
  const temp = `${INDEX_FILE}.${process.pid}.tmp`;
  writeFileSync(temp, `${lines.join("\n")}\n`, "utf8");
  renameSync(temp, INDEX_FILE);
  return true;
}
function repairTranscript(token) {
  const config = loadConfig();
  if (!config.localSourceSync) {
    throw new Error("当前为仅索引模式（localSourceSync=false），无本地源文件可补逐字稿；请先在 lark-minutes-bridge.json 开启 localSourceSync 并明示拉本地。");
  }
  refreshState();
  const item = state.tokens[token];
  if (!item?.path || !existsSync(item.path)) throw new Error(`未找到妙记 Raw 文件：${token}`);
  const content = transcriptText(join(LARK_DIR, token));
  if (content === "（未返回逐字稿文件）") throw new Error(`未找到已下载的逐字稿：${token}`);
  const original = readFileSync(item.path, "utf8");
  if (!/^## 逐字稿\s*$/m.test(original)) throw new Error(`Raw 文件缺少逐字稿章节：${item.path}`);
  const updated = original.replace(/^## 逐字稿\s*$[\s\S]*$/m, `## 逐字稿\n\n${content}\n`);
  const temp = `${item.path}.part`;
  writeFileSync(temp, updated, "utf8");
  renameSync(temp, item.path);
  state.tokens[token] = { ...item, transcriptRepairedAt: now() };
  saveState();
  log("已将完整逐字稿补回 Raw", { token, path: item.path });
}
async function fetchMinuteIndexOnly(token, hint = {}) {
  refreshState();
  const previous = state.tokens[token];
  if (!token || DONE_STATUSES.has(previous?.status)) return;
  if (previous?.nextRetryAt && Date.parse(previous.nextRetryAt) > Date.now()) return;
  if (indexHasToken(token)) {
    state.tokens[token] = { ...previous, status: "已登记", registeredAt: previous?.registeredAt ?? now(), title: previous?.title ?? hint.title, updatedAt: now() };
    saveState();
    log("妙记已在索引中，跳过", { token });
    return;
  }
  state.tokens[token] = { ...previous, status: "登记中", updatedAt: now() };
  saveState();
  const title = cleanName(hint.title ?? `飞书妙记-${token.slice(-6)}`);
  const date = localDate(hint.timestamp ? new Date(Number(hint.timestamp)) : new Date());
  const url = hint.url ?? hint.minute_url ?? `https://www.feishu.cn/minutes/${token}`;
  const rawId = previous?.rawId ?? nextRawId(date);
  const summary = `飞书妙记在线登记（仅索引、未拉本地源文件）；minute_token=${token}；权威内容以飞书在线为准；全部口径待验证。`;
  try {
    appendIndexOnlyRow({ rawId, date, title, url, summary });
    state.tokens[token] = { status: "已登记", rawId, url, title, registeredAt: now(), hashHint: token };
    saveState();
    log("妙记已仅登记到 Raw README", { token, rawId, url });
  } catch (error) {
    refreshState();
    const attempts = (state.tokens[token]?.attempts ?? 0) + 1;
    const nextRetryAt = new Date(Date.now() + Math.min(60 * 60 * 1000, RETRY_BASE_MS * 2 ** (attempts - 1))).toISOString();
    state.tokens[token] = { ...state.tokens[token], status: "失败", attempts, nextRetryAt, error: String(error).slice(-2000), updatedAt: now() };
    saveState();
    log("妙记索引登记失败", { token, error: String(error) });
  }
}
async function fetchMinuteLocal(token, hint = {}) {
  refreshState();
  const previous = state.tokens[token];
  if (!token || DONE_STATUSES.has(previous?.status)) return;
  if (previous?.nextRetryAt && Date.parse(previous.nextRetryAt) > Date.now()) return;
  state.tokens[token] = { ...previous, status: "同步中", updatedAt: now() };
  saveState();
  const outputDir = join("lark", token);
  const absoluteOutputDir = join(RUNTIME_DIR, outputDir);
  mkdirSync(absoluteOutputDir, { recursive: true });
  const result = await run(["minutes", "+detail", "--minute-tokens", token, "--summary", "--todo", "--chapter", "--keyword", "--transcript", "--overwrite", "--output-dir", outputDir, "--format", "json", "--as", "user"], { cwd: RUNTIME_DIR });
  if (result.code !== 0) {
    refreshState();
    const attempts = (state.tokens[token]?.attempts ?? 0) + 1;
    const nextRetryAt = new Date(Date.now() + Math.min(60 * 60 * 1000, RETRY_BASE_MS * 2 ** (attempts - 1))).toISOString();
    state.tokens[token] = { ...state.tokens[token], status: "失败", attempts, nextRetryAt, error: result.stderr.slice(-2000), updatedAt: now() };
    saveState(); log("妙记读取失败", { token, code: result.code }); return;
  }
  const detail = jsonFrom(result.stdout);
  const minute = collectTokens(detail).get(token) ?? detail.data ?? detail;
  const title = cleanName(hint.title ?? minute.title ?? `飞书妙记-${token.slice(-6)}`);
  const date = localDate(hint.timestamp ? new Date(Number(hint.timestamp)) : new Date());
  let path = join(RAW_DIR, `${date}-${title}.md`);
  if (existsSync(path)) path = join(RAW_DIR, `${date}-${title}-${token.slice(-6)}.md`);
  const url = minute.url ?? minute.minute_url ?? `https://www.feishu.cn/minutes/${token}`;
  const markdown = `---\ndate: ${date}\ntype: 飞书妙记\nstatus: 飞书妙记原始产物\nsource: ${url}\nminute_token: ${token}\nsynced_at: ${now()}\n---\n\n# ${title}\n\n> 以下内容由 lark-cli 从飞书妙记原样同步。它属于未验证原始材料，不等同于公司正式事实。\n\n## 基础信息\n\n${renderObject(minute)}\n\n## 飞书 AI 摘要\n\n${renderObject(minute.summary ?? detail.summary)}\n\n## 飞书 AI 待办\n\n${renderObject(minute.todos ?? minute.todo ?? detail.todos)}\n\n## 章节\n\n${renderObject(minute.chapters ?? minute.chapter ?? detail.chapters)}\n\n## 关键词\n\n${renderObject(minute.keywords ?? minute.keyword ?? detail.keywords)}\n\n## 逐字稿\n\n${transcriptText(absoluteOutputDir)}\n`;
  const temp = `${path}.part`;
  writeFileSync(temp, markdown, "utf8"); renameSync(temp, path);
  state.tokens[token] = { status: "已同步", path, hashHint: token, syncedAt: now(), title };
  saveState(); log("妙记已同步到 Raw", { token, path });
}
async function fetchMinute(token, hint = {}) {
  const config = loadConfig();
  if (config.localSourceSync) return fetchMinuteLocal(token, hint);
  return fetchMinuteIndexOnly(token, hint);
}
async function searchRecent({ baseline = false } = {}) {
  const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const found = new Map();
  let successfulQueries = 0;
  for (const filter of [["--owner-ids", "me"], ["--participant-ids", "me"]]) {
    const result = await run(["minutes", "+search", "--start", start, ...filter, "--page-size", "30", "--format", "json", "--as", "user"]);
    if (result.code !== 0) { log("妙记补漏查询失败", { filter: filter[0], error: result.stderr.slice(-1000) }); continue; }
    successfulQueries++;
    for (const [token, value] of collectTokens(jsonFrom(result.stdout))) found.set(token, value);
  }
  if (successfulQueries === 0) throw new Error("妙记查询全部失败：用户登录或查询权限不可用");
  if (baseline) {
    for (const [token, value] of found) state.tokens[token] = { status: "基线", title: value.title, baselinedAt: now() };
    state.baselineCreated = true; state.baselineCreatedAt = now(); saveState();
    log("已建立妙记基线", { count: found.size }); return;
  }
  for (const [token, value] of found) await fetchMinute(token, value);
  log("妙记补漏完成", { found: found.size, localSourceSync: loadConfig().localSourceSync });
}
async function consumeOnce() {
  log("正在启动飞书妙记生成事件监听", { localSourceSync: loadConfig().localSourceSync });
  let buffer = "";
  let ready = false;
  const result = await run(["event", "consume", "minutes.minute.generated_v1", "--as", "user"], {
    keepStdin: true,
    onStderr(chunk) {
      if (!ready && chunk.includes("[event] ready event_key=minutes.minute.generated_v1")) {
        ready = true;
        log("飞书妙记生成事件监听已就绪");
      }
    },
    onStdout(chunk) {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/); buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim().startsWith("{")) continue;
        try {
          const event = JSON.parse(line); const id = event.event_id;
          if (id && state.events[id]) continue;
          if (id) state.events[id] = now(); saveState();
          setTimeout(() => fetchMinute(event.minute_token, event).catch((error) => log("事件处理失败", { error: String(error) })), 15_000);
        } catch (error) { log("无法解析飞书事件", { line: line.slice(0, 500), error: String(error) }); }
      }
    }
  });
  log("飞书事件监听退出", { code: result.code, error: result.stderr.slice(-1000) });
  return result.code;
}
function delay(ms) { return new Promise((resolvePromise) => setTimeout(resolvePromise, ms)); }
async function watchForever() {
  while (true) {
    try {
      refreshState();
      if (!state.baselineCreated) await searchRecent({ baseline: true });
      else await searchRecent();
      await consumeOnce();
    } catch (error) {
      log("飞书妙记监听异常", { error: String(error) });
    }
    log("将在延迟后重连飞书妙记监听", { delayMs: RECONNECT_DELAY_MS });
    await delay(RECONNECT_DELAY_MS);
  }
}

if (MODE === "watch") await watchForever();
else if (MODE === "baseline") await searchRecent({ baseline: true });
else if (MODE === "backfill") await searchRecent();
else if (MODE === "fetch" && process.argv[3]) await fetchMinute(process.argv[3]);
else if (MODE === "repair-transcript" && process.argv[3]) repairTranscript(process.argv[3]);
else throw new Error("用法：node lark-minutes-bridge.mjs watch|baseline|backfill|fetch|repair-transcript <minute_token>");
