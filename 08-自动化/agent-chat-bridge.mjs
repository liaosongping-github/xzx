import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { acquireWorkerLock } from "./worker-lock.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const RAW_DIR = join(ROOT, "01-原始文件（Raw）");
const CONFIG_FILE = join(import.meta.dirname, "chat-sources.json");
const RUNTIME_DIR = join(import.meta.dirname, ".runtime");
const STATE_FILE = join(RUNTIME_DIR, "chat-state.json");
const LOG_FILE = join(RUNTIME_DIR, "agent-chat-bridge.log");
const LOCK_FILE = join(RUNTIME_DIR, "agent-chat-watch.lock");
const MODE = process.argv[2] ?? "watch";
const SCAN_INTERVAL_MS = 30_000;
const DEFAULT_STABLE_IDLE_MS = 20 * 60 * 1000;
const DEFAULT_BACKFILL_DAYS = 7;
const DEFAULT_MIN_USER_CHARS = 20;

mkdirSync(RUNTIME_DIR, { recursive: true });
mkdirSync(join(RAW_DIR, "Agent聊天手动导入"), { recursive: true });
if (MODE === "watch") acquireWorkerLock(LOCK_FILE, "Agent 聊天同步进程");

function now() { return new Date().toISOString(); }
function localDate(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(value instanceof Date ? value : new Date(value));
}
function log(message, data) {
  const line = `${now()} ${message}${data === undefined ? "" : ` ${JSON.stringify(data)}`}\n`;
  writeFileSync(LOG_FILE, line, { encoding: "utf8", flag: "a" });
  process.stdout.write(line);
}
function expandPath(value) {
  return String(value ?? "")
    .replace(/%USERPROFILE%/gi, process.env.USERPROFILE ?? "")
    .replace(/%HOME%/gi, process.env.HOME ?? process.env.USERPROFILE ?? "")
    .replace(/^~(?=[\\/]|$)/, process.env.USERPROFILE ?? process.env.HOME ?? "");
}
function normalizePath(value) {
  return resolve(expandPath(value)).replace(/[\\/]+/g, sep).toLowerCase();
}
function loadConfig() {
  const raw = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  return {
    workspaceRoot: resolve(expandPath(raw.workspaceRoot ?? ROOT)),
    stableIdleMs: Number(raw.stableIdleMs ?? DEFAULT_STABLE_IDLE_MS),
    backfillDays: Number(raw.backfillDays ?? DEFAULT_BACKFILL_DAYS),
    minUserChars: Number(raw.minUserChars ?? DEFAULT_MIN_USER_CHARS),
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    unknownSources: Array.isArray(raw.unknownSources) ? raw.unknownSources : []
  };
}
function emptyState() {
  return { version: 1, sessions: {}, baselineCreated: false, initializedAt: null };
}
function loadState() {
  if (!existsSync(STATE_FILE)) return emptyState();
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    state.sessions ??= {};
    return state;
  } catch {
    return emptyState();
  }
}
let state = loadState();
function saveState() {
  const temp = `${STATE_FILE}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  renameSync(temp, STATE_FILE);
}
function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}
function cleanName(value) {
  return String(value || "未命名")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40) || "未命名";
}
function redact(text) {
  return String(text ?? "")
    .replace(/(Bearer\s+)[A-Za-z0-9._\-+=\/]{8,}/gi, "$1[已脱敏]")
    .replace(/(api[_-]?key|access[_-]?token|secret|password|passwd|私钥)\s*[:=]\s*["']?[^\s"'\\]+/gi, "$1=[已脱敏]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[已脱敏私钥]")
    .replace(/\bsk-[A-Za-z0-9]{16,}\b/g, "[已脱敏]")
    .replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/g, "[已省略图片数据]");
}
function stripXmlTag(text, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = String(text ?? "").match(re);
  return match ? match[1].trim() : String(text ?? "").trim();
}
function extractTextParts(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      if (part.type === "tool_use" || part.type === "tool_result" || part.type === "input_image") return "";
      return part.text ?? part.input_text ?? part.output_text ?? "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}
function isNoiseUserText(text) {
  const value = String(text ?? "").trim();
  if (!value) return true;
  if (value.includes("<recommended_plugins>") || value.includes("<app-context>") || value.includes("<skills_instructions>")) return true;
  if (value.includes("<permissions instructions>") || value.includes("<collaboration_mode>")) return true;
  if (value.startsWith("# Files mentioned by the user:") && !value.includes("My request for Codex:")) {
    return value.length < 80;
  }
  return false;
}
function normalizeUserText(text) {
  let value = String(text ?? "");
  value = stripXmlTag(value, "user_query") || value;
  const requestMatch = value.match(/## My request for Codex:\s*([\s\S]*)$/i);
  if (requestMatch) value = requestMatch[1].trim();
  value = value.replace(/<timestamp>[\s\S]*?<\/timestamp>\s*/gi, "").trim();
  return redact(value);
}
function normalizeAssistantText(text) {
  return redact(String(text ?? "").trim());
}
function isNoiseAssistantText(text) {
  const value = String(text ?? "").trim();
  if (!value) return true;
  if (/^\[\d+\]\s*tool exec call/i.test(value)) return true;
  if (value.includes("<skills_instructions>") || value.includes("<app-context>")) return true;
  return false;
}
function filesRecursively(dir, predicate) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesRecursively(path, predicate));
    else if (entry.isFile() && (!predicate || predicate(path))) out.push(path);
  }
  return out;
}
function parseJsonl(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    try { rows.push(JSON.parse(line)); }
    catch { /* skip broken line */ }
  }
  return rows;
}
function parseCursorTranscript(path) {
  const rows = parseJsonl(path);
  const messages = [];
  for (const row of rows) {
    const role = row.role;
    if (role !== "user" && role !== "assistant") continue;
    const text = extractTextParts(row.message?.content);
    if (!text) continue;
    if (role === "user") {
      const cleaned = normalizeUserText(text);
      if (isNoiseUserText(cleaned)) continue;
      messages.push({ role: "user", text: cleaned });
    } else {
      const cleaned = normalizeAssistantText(text);
      if (!cleaned || isNoiseAssistantText(cleaned)) continue;
      messages.push({ role: "assistant", text: cleaned });
    }
  }
  const sessionId = basename(dirname(path)) || basename(path, ".jsonl");
  const firstUser = messages.find((m) => m.role === "user")?.text ?? "";
  const stats = statSync(path);
  return {
    agent: "Cursor",
    sessionId,
    sourcePath: path,
    title: cleanName(firstUser.slice(0, 40) || sessionId.slice(0, 8)),
    startedAt: stats.birthtime?.toISOString?.() ?? new Date(stats.mtimeMs).toISOString(),
    mtimeMs: stats.mtimeMs,
    messages
  };
}
function cwdMatchesWorkspace(cwd, workspaceRoot) {
  if (!cwd) return false;
  const normalizedCwd = normalizePath(cwd);
  const normalizedRoot = normalizePath(workspaceRoot);
  return normalizedCwd === normalizedRoot || normalizedCwd.startsWith(`${normalizedRoot}${sep}`);
}
function parseCodexSession(path, workspaceRoot) {
  const rows = parseJsonl(path);
  let sessionId = basename(path, ".jsonl").replace(/^rollout-/, "");
  let cwd = "";
  let startedAt = "";
  const eventMessages = [];
  const responseMessages = [];
  for (const row of rows) {
    if (row.type === "session_meta") {
      const payload = row.payload ?? {};
      sessionId = payload.session_id ?? payload.id ?? sessionId;
      cwd = payload.cwd ?? cwd;
      startedAt = payload.timestamp ?? row.timestamp ?? startedAt;
      continue;
    }
    if (row.type === "event_msg") {
      const payload = row.payload ?? {};
      if (payload.type === "user_message" && typeof payload.message === "string") {
        const cleaned = normalizeUserText(payload.message);
        if (!isNoiseUserText(cleaned)) eventMessages.push({ role: "user", text: cleaned });
      } else if (payload.type === "agent_message" && typeof payload.message === "string") {
        // Keep commentary + final; digest can see collaboration trail without tool noise.
        const cleaned = normalizeAssistantText(payload.message);
        if (cleaned && !isNoiseAssistantText(cleaned)) eventMessages.push({ role: "assistant", text: cleaned });
      }
      continue;
    }
    if (row.type === "response_item" && row.payload?.type === "message") {
      const role = row.payload.role;
      if (role !== "user" && role !== "assistant") continue;
      const text = extractTextParts(row.payload.content);
      if (!text) continue;
      if (role === "user") {
        const cleaned = normalizeUserText(text);
        if (!isNoiseUserText(cleaned)) responseMessages.push({ role: "user", text: cleaned });
      } else if (row.payload.phase === "final" || !row.payload.phase) {
        const cleaned = normalizeAssistantText(text);
        if (cleaned && !isNoiseAssistantText(cleaned)) responseMessages.push({ role: "assistant", text: cleaned });
      }
    }
  }
  const sourceMessages = eventMessages.length ? eventMessages : responseMessages;
  const collapsed = [];
  for (const message of sourceMessages) {
    const prev = collapsed[collapsed.length - 1];
    if (prev && prev.role === message.role && prev.text === message.text) continue;
    collapsed.push({ role: message.role, text: message.text });
  }
  const stats = statSync(path);
  const firstUser = collapsed.find((m) => m.role === "user")?.text ?? "";
  return {
    agent: "Codex",
    sessionId,
    sourcePath: path,
    cwd,
    matchesWorkspace: cwdMatchesWorkspace(cwd, workspaceRoot),
    title: cleanName(firstUser.slice(0, 40) || sessionId.slice(0, 8)),
    startedAt: startedAt || new Date(stats.mtimeMs).toISOString(),
    mtimeMs: stats.mtimeMs,
    messages: collapsed
  };
}
function discoverSessions(config) {
  const byKey = new Map();
  const consider = (session) => {
    const key = sessionKey(session);
    const previous = byKey.get(key);
    if (!previous || session.mtimeMs >= previous.mtimeMs) byKey.set(key, session);
  };
  for (const source of config.sources) {
    if (source.enabled === false) continue;
    const roots = (source.roots ?? []).map(expandPath).filter((root) => existsSync(root));
    if (source.kind === "cursor-transcripts") {
      for (const root of roots) {
        for (const path of filesRecursively(root, (file) => file.toLowerCase().endsWith(".jsonl"))) {
          try { consider(parseCursorTranscript(path)); }
          catch (error) { log("解析 Cursor 会话失败", { path, error: String(error) }); }
        }
      }
    } else if (source.kind === "codex-sessions") {
      for (const root of roots) {
        for (const path of filesRecursively(root, (file) => {
          const name = basename(file).toLowerCase();
          return name.endsWith(".jsonl") && (name.startsWith("rollout-") || root.toLowerCase().includes("archived"));
        })) {
          try {
            const session = parseCodexSession(path, config.workspaceRoot);
            if (source.cwdMustMatchWorkspace && !session.matchesWorkspace) continue;
            consider(session);
          } catch (error) {
            log("解析 Codex 会话失败", { path, error: String(error) });
          }
        }
      }
    }
  }
  return [...byKey.values()];
}
function renderMarkdown(session) {
  const date = localDate(session.startedAt);
  const body = session.messages.map((message) => {
    const speaker = message.role === "user" ? "用户" : "助手";
    return `## ${speaker}\n\n${message.text}\n`;
  }).join("\n");
  return [
    "---",
    `date: ${date}`,
    "type: Agent聊天",
    `agent: ${session.agent}`,
    `session_id: ${session.sessionId}`,
    `source_path: ${JSON.stringify(session.sourcePath)}`,
    `synced_at: ${now()}`,
    "status: Agent 聊天原始产物",
    "---",
    "",
    `# Agent聊天-${session.agent}-${session.title}`,
    "",
    "> 以下内容由本机 agent-chat-bridge 从会话落盘文件转换。已剥离工具调用与系统提示，并做基础脱敏。属于未验证原始材料。",
    "",
    body.trim(),
    ""
  ].join("\n");
}
function sessionKey(session) {
  return `${session.agent}:${session.sessionId}`;
}
function targetRawPath(session) {
  const date = localDate(session.startedAt);
  const shortId = String(session.sessionId).replace(/[^a-zA-Z0-9_-]/g, "").slice(-8) || "session";
  return join(RAW_DIR, `${date}-Agent聊天-${session.agent}-${cleanName(session.title)}-${shortId}.md`);
}
function userCharCount(session) {
  return session.messages.filter((m) => m.role === "user").reduce((sum, m) => sum + m.text.length, 0);
}
function shouldExport(session, config, options = {}) {
  if (!session.messages.length) return { ok: false, reason: "无消息" };
  if (userCharCount(session) < config.minUserChars) return { ok: false, reason: "用户内容过短" };
  const idleMs = Date.now() - session.mtimeMs;
  if (!options.ignoreIdle && idleMs < config.stableIdleMs) return { ok: false, reason: "尚未稳定", idleMs };
  if (options.sinceMs && session.mtimeMs < options.sinceMs && !options.force) return { ok: false, reason: "早于补漏窗口" };
  return { ok: true };
}
function exportSession(session, config, options = {}) {
  const decision = shouldExport(session, config, options);
  if (!decision.ok) return { status: "skipped", reason: decision.reason };
  const markdown = renderMarkdown(session);
  const contentHash = sha256(markdown.replace(/\nsynced_at:.*\n/, "\nsynced_at:\n"));
  const key = sessionKey(session);
  const existing = state.sessions[key];
  if (existing?.contentHash === contentHash && existing.rawPath && existsSync(join(ROOT, existing.rawPath))) {
    return { status: "unchanged" };
  }
  const absolutePath = existing?.rawPath ? join(ROOT, existing.rawPath) : targetRawPath(session);
  const finalPath = absolutePath.endsWith(".md") ? absolutePath : targetRawPath(session);
  mkdirSync(dirname(finalPath), { recursive: true });
  const temp = `${finalPath}.${process.pid}.tmp`;
  writeFileSync(temp, markdown, "utf8");
  renameSync(temp, finalPath);
  state.sessions[key] = {
    agent: session.agent,
    sessionId: session.sessionId,
    sourcePath: session.sourcePath,
    rawPath: relative(ROOT, finalPath).split(sep).join("/"),
    contentHash,
    title: session.title,
    syncedAt: now(),
    mtimeMs: session.mtimeMs
  };
  saveState();
  log("已同步 Agent 聊天到 Raw", { agent: session.agent, sessionId: session.sessionId, file: state.sessions[key].rawPath });
  return { status: "exported", rawPath: state.sessions[key].rawPath };
}
function baseline(config) {
  const sessions = discoverSessions(config);
  let marked = 0;
  for (const session of sessions) {
    const key = sessionKey(session);
    if (state.sessions[key]) continue;
    state.sessions[key] = {
      agent: session.agent,
      sessionId: session.sessionId,
      sourcePath: session.sourcePath,
      rawPath: null,
      contentHash: null,
      title: session.title,
      syncedAt: now(),
      mtimeMs: session.mtimeMs,
      baselineOnly: true
    };
    marked += 1;
  }
  state.baselineCreated = true;
  state.initializedAt = state.initializedAt ?? now();
  saveState();
  log("已建立 Agent 聊天基线（历史会话标记为已见，不批量导出）", { discovered: sessions.length, marked });
  return { discovered: sessions.length, marked };
}
function syncSessions(config, options = {}) {
  if (!state.baselineCreated && !options.skipBaselineGuard) baseline(config);
  const sessions = discoverSessions(config);
  const summary = { exported: 0, unchanged: 0, skipped: 0, reasons: {} };
  for (const session of sessions) {
    const key = sessionKey(session);
    const existing = state.sessions[key];
    // Baseline-only entries older than backfill window stay unmarked for export unless recently changed.
    if (existing?.baselineOnly && existing.contentHash == null && !options.includeBaseline) {
      const sinceMs = options.sinceMs ?? (Date.now() - config.backfillDays * 24 * 60 * 60 * 1000);
      if (session.mtimeMs < sinceMs) {
        summary.skipped += 1;
        summary.reasons.baseline = (summary.reasons.baseline ?? 0) + 1;
        continue;
      }
    }
    const result = exportSession(session, config, options);
    if (result.status === "exported") summary.exported += 1;
    else if (result.status === "unchanged") summary.unchanged += 1;
    else {
      summary.skipped += 1;
      summary.reasons[result.reason ?? "other"] = (summary.reasons[result.reason ?? "other"] ?? 0) + 1;
    }
  }
  log("Agent 聊天同步完成", summary);
  return summary;
}
function backfill(config) {
  const sinceMs = Date.now() - config.backfillDays * 24 * 60 * 60 * 1000;
  return syncSessions(config, { sinceMs, ignoreIdle: true, includeBaseline: true, skipBaselineGuard: false });
}
function once(config) {
  return syncSessions(config, {});
}
async function watch(config) {
  if (!state.baselineCreated) baseline(config);
  log("Agent 聊天同步已启动", {
    intervalMs: SCAN_INTERVAL_MS,
    stableIdleMs: config.stableIdleMs,
    backfillDays: config.backfillDays
  });
  const tick = () => {
    try { once(config); }
    catch (error) { log("扫描异常", { error: String(error), stack: error?.stack }); }
  };
  tick();
  setInterval(tick, SCAN_INTERVAL_MS);
}
function selfTest() {
  const config = {
    workspaceRoot: ROOT,
    stableIdleMs: 0,
    backfillDays: 7,
    minUserChars: 5,
    sources: [],
    unknownSources: []
  };
  const cursorFixture = [
    JSON.stringify({
      role: "user",
      message: { content: [{ type: "text", text: "<user_query>\n请帮我更新协作偏好\n</user_query>" }] }
    }),
    JSON.stringify({
      role: "assistant",
      message: {
        content: [
          { type: "text", text: "好的，我会更新协作偏好。" },
          { type: "tool_use", name: "Read", input: { path: "x.md" } }
        ]
      }
    })
  ].join("\n");
  const codexFixture = [
    JSON.stringify({
      timestamp: "2026-08-06T00:00:00.000Z",
      type: "session_meta",
      payload: { session_id: "test-session", cwd: ROOT, timestamp: "2026-08-06T00:00:00.000Z" }
    }),
    JSON.stringify({
      timestamp: "2026-08-06T00:00:01.000Z",
      type: "event_msg",
      payload: { type: "user_message", message: "请记录我喜欢简洁中文回复" }
    }),
    JSON.stringify({
      timestamp: "2026-08-06T00:00:02.000Z",
      type: "event_msg",
      payload: { type: "agent_message", phase: "final", message: "已记录你的偏好。" }
    }),
    JSON.stringify({
      timestamp: "2026-08-06T00:00:03.000Z",
      type: "response_item",
      payload: {
        type: "message",
        role: "developer",
        content: [{ type: "input_text", text: "<skills_instructions>secret</skills_instructions>" }]
      }
    })
  ].join("\n");

  const testRoot = mkdtempSync(join(tmpdir(), "agent-chat-bridge-"));
  try {
    const cursorPath = join(testRoot, "abc", "abc.jsonl");
    mkdirSync(dirname(cursorPath), { recursive: true });
    writeFileSync(cursorPath, `${cursorFixture}\n`, "utf8");
    const cursorSession = parseCursorTranscript(cursorPath);
    if (cursorSession.messages.length !== 2) throw new Error("Cursor 消息提取失败");
    if (cursorSession.messages[0].text !== "请帮我更新协作偏好") throw new Error("Cursor 用户消息清洗失败");
    if (cursorSession.messages[1].text.includes("tool_use")) throw new Error("Cursor 未剥离工具调用");

    const codexPath = join(testRoot, "rollout-test.jsonl");
    writeFileSync(codexPath, `${codexFixture}\n`, "utf8");
    const codexSession = parseCodexSession(codexPath, ROOT);
    if (!codexSession.matchesWorkspace) throw new Error("Codex cwd 过滤失败");
    if (codexSession.messages.some((m) => m.text.includes("skills_instructions"))) throw new Error("Codex 未过滤 developer 提示");
    if (codexSession.messages.length < 2) throw new Error("Codex 消息提取失败");

    const secret = redact("token=sk-abcdefghijklmnopqrstuvwxyz password=abc123");
    if (secret.includes("sk-abcdefghijklmnopqrstuvwxyz") || secret.includes("abc123")) throw new Error("脱敏自检失败");

    const decision = shouldExport(cursorSession, config, { ignoreIdle: true });
    if (!decision.ok) throw new Error(`导出判定失败：${decision.reason}`);
  } finally {
    rmSync(testRoot, { recursive: true, force: true });
  }
  log("自检通过", { configFile: existsSync(CONFIG_FILE), workspace: ROOT });
}

const config = loadConfig();
if (MODE === "self-test") selfTest();
else if (MODE === "baseline") baseline(config);
else if (MODE === "backfill") backfill(config);
else if (MODE === "once") once(config);
else if (MODE === "watch") await watch(config);
else throw new Error("用法：node agent-chat-bridge.mjs watch|once|baseline|backfill|self-test");
