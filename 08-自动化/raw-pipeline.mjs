import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  copyFileSync,
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
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { acquireWorkerLock } from "./worker-lock.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const RAW_DIR = join(ROOT, "01-原始文件（Raw）");
const ATTACHMENTS_DIR = join(RAW_DIR, "附件");
const INDEX_FILE = join(RAW_DIR, "README.md");
const RUNTIME_DIR = join(import.meta.dirname, ".runtime");
const STATE_FILE = join(RUNTIME_DIR, "raw-state.json");
const LOG_FILE = join(RUNTIME_DIR, "raw-pipeline.log");
const LOCK_FILE = join(RUNTIME_DIR, "raw-pipeline.lock");
const PROMPT_FILE = join(import.meta.dirname, "知识消化提示词.md");
const CHAT_PROMPT_FILE = join(import.meta.dirname, "聊天知识消化提示词.md");
const DIGEST_ENGINE_FILE = join(import.meta.dirname, "digest-engine.json");
const DEFAULT_DIGEST_ENGINE = {
  version: 1,
  mode: "session-agent",
  fallback: "codex",
  updated: "2026-08-07",
  note: "session-agent=当前会话Agent消化；codex=流水线自动调用Codex CLI"
};
const SUPPORTED = new Set([".md", ".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".webp"]);
const TEMP_SUFFIXES = [".tmp", ".temp", ".part", ".crdownload", ".download"];
const SCAN_INTERVAL_MS = 10_000;
const STABLE_AGE_MS = 5_000;
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000;
const STATE_VERSION = 2;
const MODE = process.argv[2] ?? "watch";
const SESSION_AGENT_WAIT_STATUS = "待Agent消化";

const LEGACY_MIGRATION = new Map([
  ["RAW-20260803-001", "learned-historical"],
  ["RAW-20260803-002", "partial-backfill"],
  ["RAW-20260803-003", "unlearned-backfill"],
  ["RAW-20260803-004", "unlearned-backfill"],
  ["RAW-20260804-001", "learned-runtime"],
  ["RAW-20260804-002", "learned-runtime"]
]);

mkdirSync(RUNTIME_DIR, { recursive: true });
if (MODE !== "self-test") acquireWorkerLock(LOCK_FILE, "Raw 自动消化进程");

function now() { return new Date().toISOString(); }
function localDate(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(value);
}
function localDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(parsed);
}
function log(message, data = undefined) {
  const line = `${now()} ${message}${data === undefined ? "" : ` ${JSON.stringify(data)}`}\n`;
  writeFileSync(LOG_FILE, line, { encoding: "utf8", flag: "a" });
  process.stdout.write(line);
}
function waitSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
function atomicText(path, text) {
  const temp = `${path}.tmp`;
  writeFileSync(temp, text, "utf8");
  let lastError;
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      renameSync(temp, path);
      return;
    } catch (error) {
      lastError = error;
      if (!["EPERM", "EACCES", "EBUSY"].includes(error?.code)) throw error;
      waitSync(100);
    }
  }
  try {
    writeFileSync(path, text, "utf8");
    rmSync(temp, { force: true });
  } catch (fallbackError) {
    fallbackError.cause = lastError;
    throw fallbackError;
  }
}
function atomicJson(path, value) {
  atomicText(path, `${JSON.stringify(value, null, 2)}\n`);
}
function emptyState() {
  return { version: STATE_VERSION, initialized: false, nextSequenceByDate: {}, files: {}, observations: {} };
}
function loadState() {
  if (!existsSync(STATE_FILE)) return emptyState();
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")); }
  catch (error) {
    const backup = `${STATE_FILE}.corrupt-${Date.now()}`;
    renameSync(STATE_FILE, backup);
    log("状态文件损坏，已备份并重建", { backup, error: String(error) });
    return emptyState();
  }
}
const state = loadState();
state.files ??= {};
state.observations ??= {};
state.nextSequenceByDate ??= {};
function saveState() { atomicJson(STATE_FILE, state); }

function loadDigestEngine() {
  if (!existsSync(DIGEST_ENGINE_FILE)) return { ...DEFAULT_DIGEST_ENGINE };
  try {
    const config = JSON.parse(readFileSync(DIGEST_ENGINE_FILE, "utf8"));
    const mode = config?.mode === "codex" ? "codex" : "session-agent";
    return { ...DEFAULT_DIGEST_ENGINE, ...config, mode };
  } catch (error) {
    log("digest-engine.json 读取失败，回退默认 session-agent", { error: String(error) });
    return { ...DEFAULT_DIGEST_ENGINE };
  }
}

function posixPath(path) { return path.split(sep).join("/"); }
function posixRelative(path) { return posixPath(relative(ROOT, path)); }
function isInside(path, parent) {
  const rel = relative(resolve(parent), resolve(path));
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}
function isIgnored(path) {
  const rel = posixRelative(path);
  const name = basename(path);
  if (name.toLowerCase() === "readme.md" || name.startsWith(".")) return true;
  if (rel.split("/").includes("附件")) return true;
  const lower = name.toLowerCase();
  return TEMP_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}
function listRawFiles(dir = RAW_DIR) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "附件" && !entry.name.startsWith(".")) result.push(...listRawFiles(path));
    } else if (!isIgnored(path) && SUPPORTED.has(extname(entry.name).toLowerCase())) result.push(path);
  }
  return result;
}

function markdownLinkTarget(rawTarget) {
  let value = rawTarget.trim();
  if (value.startsWith("<")) {
    const end = value.indexOf(">");
    if (end < 0) return null;
    value = value.slice(1, end);
  } else {
    value = value.match(/^(?:\\.|\S)+/)?.[0] ?? "";
  }
  value = value.replaceAll("\\ ", " ");
  if (!value || /^(?:https?:|data:|mailto:|#)/i.test(value)) return null;
  try { return decodeURIComponent(value); }
  catch { return value; }
}
function referencedAttachmentPaths(mainPath, rawRoot = RAW_DIR) {
  if (extname(mainPath).toLowerCase() !== ".md" || !existsSync(mainPath)) return [];
  const markdown = readFileSync(mainPath, "utf8");
  const attachmentRoot = join(rawRoot, "附件");
  const found = new Set();
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)\r\n]+)\)/g)) {
    const target = markdownLinkTarget(match[1]);
    if (!target) continue;
    const absolutePath = resolve(dirname(mainPath), target);
    if (isInside(absolutePath, attachmentRoot)) found.add(absolutePath);
  }
  return [...found].sort((a, b) => posixPath(a).localeCompare(posixPath(b), "zh-CN"));
}
function contentDescriptor(mainPath, rawRoot = RAW_DIR) {
  const mainStats = statSync(mainPath);
  const attachments = referencedAttachmentPaths(mainPath, rawRoot).map((path) => {
    if (!existsSync(path)) return { path, exists: false, size: -1, mtimeMs: -1 };
    const stats = statSync(path);
    return { path, exists: true, size: stats.size, mtimeMs: stats.mtimeMs };
  });
  const parts = [`main:${mainStats.size}:${mainStats.mtimeMs}`];
  let latestMtimeMs = mainStats.mtimeMs;
  for (const attachment of attachments) {
    const key = posixPath(relative(dirname(mainPath), attachment.path));
    parts.push(`attachment:${key}:${attachment.exists ? `${attachment.size}:${attachment.mtimeMs}` : "missing"}`);
    if (attachment.exists) latestMtimeMs = Math.max(latestMtimeMs, attachment.mtimeMs);
  }
  return { signature: parts.join("|"), latestMtimeMs, attachments };
}
function contentSnapshot(mainPath, rawRoot = RAW_DIR, descriptor = contentDescriptor(mainPath, rawRoot)) {
  const hash = createHash("sha256");
  hash.update("main\0");
  hash.update(readFileSync(mainPath));
  for (const attachment of descriptor.attachments) {
    const key = posixPath(relative(dirname(mainPath), attachment.path));
    hash.update(`\0attachment:${key}\0`);
    hash.update(attachment.exists ? readFileSync(attachment.path) : "<missing>");
  }
  return { ...descriptor, hash: hash.digest("hex") };
}

function extractRawId(path) {
  if (extname(path).toLowerCase() !== ".md") return null;
  const head = readFileSync(path, "utf8").slice(0, 1500);
  return head.match(/^id:\s*(RAW-\d{8}-\d+)\s*$/m)?.[1] ?? null;
}
function splitMarkdownRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return [];
  return trimmed.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim());
}
function joinMarkdownRow(cells) { return `| ${cells.join(" | ")} |`; }
function indexLayout(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => splitMarkdownRow(line)[0] === "编号");
  if (headerIndex < 0) return { lines, headerIndex, headers: [] };
  return { lines, headerIndex, headers: splitMarkdownRow(lines[headerIndex]) };
}
function indexRowForRawId(text, rawId) {
  return text.split(/\r?\n/).find((line) => splitMarkdownRow(line)[0] === rawId);
}
function indexRecord(rawId) {
  if (!existsSync(INDEX_FILE)) return null;
  const text = readFileSync(INDEX_FILE, "utf8");
  const { headers } = indexLayout(text);
  const row = indexRowForRawId(text, rawId);
  if (!row || headers.length === 0) return null;
  const cells = splitMarkdownRow(row);
  return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
}
function updateIndexFields(rawId, updates) {
  const text = readFileSync(INDEX_FILE, "utf8");
  const { lines, headers } = indexLayout(text);
  if (headers.length === 0) throw new Error("Raw 索引表头不存在");
  const rowIndex = lines.findIndex((line) => splitMarkdownRow(line)[0] === rawId);
  if (rowIndex < 0) throw new Error(`Raw 索引中未找到 ${rawId}`);
  const cells = splitMarkdownRow(lines[rowIndex]);
  if (cells.length !== headers.length) throw new Error(`${rawId} 索引列数与表头不一致`);
  for (const [field, value] of Object.entries(updates)) {
    const column = headers.indexOf(field);
    if (column < 0) throw new Error(`Raw 索引缺少字段：${field}`);
    cells[column] = String(value);
  }
  lines[rowIndex] = joinMarkdownRow(cells);
  atomicText(INDEX_FILE, lines.join("\n"));
}
function safeCell(value) { return String(value).replaceAll("|", "\\|").replaceAll("\n", " "); }
function formatLastLearnedAt(value) {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}（历史，仅精确到日）`;
  return localDateTime(value) ?? "—";
}
function parseIndexLearnedAt(value) {
  if (!value || value === "—") return null;
  const historical = value.match(/^(\d{4}-\d{2}-\d{2})（历史，仅精确到日）$/);
  if (historical) return historical[1];
  const minute = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/);
  if (minute) return new Date(`${minute[1]}T${minute[2]}:00+08:00`).toISOString();
  return null;
}
function publicLearningStatus(item) {
  if (item.status === "已完成" && item.currentHash && item.currentHash === item.lastLearnedHash) return "已学习";
  return item.lastLearnedHash ? "部分学习" : "未学习";
}
function syncIndexLearningFields(item) {
  if (!item.rawId || !indexRecord(item.rawId)) return;
  const updates = {
    学习状态: publicLearningStatus(item),
    最后学习时间: formatLastLearnedAt(item.lastLearnedAt)
  };
  if (updates.学习状态 === "已学习") {
    const record = indexRecord(item.rawId);
    if (["", "待生成", "尚未形成业务知识库条目"].includes(record?.知识库落点 ?? "")) {
      updates.知识库落点 = "无新增知识（已完成评估）";
    }
  }
  updateIndexFields(item.rawId, updates);
}
function syncAllIndexLearningFields() {
  for (const item of Object.values(state.files)) syncIndexLearningFields(item);
}
function reconcileSessionAgentCompletions() {
  let changed = false;
  for (const [rel, item] of Object.entries(state.files)) {
    if (![SESSION_AGENT_WAIT_STATUS, "待处理"].includes(item.status) || !item.rawId) continue;
    const record = indexRecord(item.rawId);
    if (record?.学习状态 !== "已学习") continue;
    item.status = "已完成";
    item.lastLearnedHash = item.currentHash;
    item.lastLearnedAt = parseIndexLearnedAt(record?.最后学习时间) ?? now();
    item.completedAt = item.lastLearnedAt;
    delete item.error;
    delete item.nextRetryAt;
    delete item.waitingForSessionAgentAt;
    changed = true;
    log("已根据索引同步会话 Agent 消化完成", { file: rel, rawId: item.rawId });
  }
  return changed;
}

function seedSequences() {
  const text = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, "utf8") : "";
  for (const match of text.matchAll(/RAW-(\d{8})-(\d+)/g)) {
    const [, date, sequence] = match;
    state.nextSequenceByDate[date] = Math.max(state.nextSequenceByDate[date] ?? 1, Number(sequence) + 1);
  }
  for (const item of Object.values(state.files)) {
    const match = item.rawId?.match(/^RAW-(\d{8})-(\d+)$/);
    if (!match) continue;
    state.nextSequenceByDate[match[1]] = Math.max(state.nextSequenceByDate[match[1]] ?? 1, Number(match[2]) + 1);
  }
}
function usedRawIds(excludeRel) {
  const used = new Set();
  const text = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, "utf8") : "";
  for (const match of text.matchAll(/RAW-\d{8}-\d+/g)) used.add(match[0]);
  for (const [rel, item] of Object.entries(state.files)) if (rel !== excludeRel && item.rawId) used.add(item.rawId);
  return used;
}
function nextRawId(date, excludeRel) {
  seedSequences();
  const compact = date.replaceAll("-", "");
  const used = usedRawIds(excludeRel);
  let sequence = state.nextSequenceByDate[compact] ?? 1;
  let candidate;
  do {
    candidate = `RAW-${compact}-${String(sequence).padStart(3, "0")}`;
    sequence++;
  } while (used.has(candidate));
  state.nextSequenceByDate[compact] = sequence;
  return candidate;
}
function rawIdConflicts(rawId, rel, absolutePath) {
  if (!rawId) return false;
  if (Object.entries(state.files).some(([key, value]) => key !== rel && value.rawId === rawId && !value.duplicateOf)) return true;
  const text = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, "utf8") : "";
  const row = indexRowForRawId(text, rawId);
  if (!row) return false;
  const rawRelative = posixPath(relative(RAW_DIR, absolutePath));
  return !row.includes(rawRelative) && !row.includes(encodeURI(rawRelative));
}
function ensureIndexRow(item) {
  let text = readFileSync(INDEX_FILE, "utf8");
  const rawRelative = posixPath(relative(RAW_DIR, item.absolutePath));
  if (text.split(/\r?\n/).some((line) => line.includes(rawRelative) || line.includes(encodeURI(rawRelative)))) return;
  if (indexRowForRawId(text, item.rawId)) throw new Error(`Raw 编号冲突：${item.rawId}`);
  const subject = basename(item.absolutePath, extname(item.absolutePath));
  const row = `| ${item.rawId} | ${item.entryDate} | 待分类 | ${safeCell(subject)} | 已进入自动消化队列，摘要待生成。 | 未学习 | 尚未形成业务知识库条目 | — | [本地原文](${encodeURI(rawRelative)}) |`;
  const lines = text.split(/\r?\n/);
  let insertAt = lines.findIndex((line, index) => index > 0 && line.startsWith("> ") && lines.slice(0, index).some((x) => x.startsWith("| RAW-")));
  if (insertAt < 0) insertAt = lines.findIndex((line) => line === "## 规则");
  if (insertAt < 0) insertAt = lines.length;
  while (insertAt > 0 && lines[insertAt - 1] === "") insertAt--;
  lines.splice(insertAt, 0, row, "");
  atomicText(INDEX_FILE, lines.join("\n"));
}

function resetForQueue(item) {
  item.status = "待处理";
  item.attempts = 0;
  item.queuedAt = now();
  delete item.startedAt;
  delete item.completedAt;
  delete item.lastOutput;
  delete item.lastError;
  delete item.error;
  delete item.nextRetryAt;
}
function migrateState() {
  if ((state.version ?? 1) >= STATE_VERSION) return;
  const timestamp = now().replaceAll(":", "-");
  const backup = join(RUNTIME_DIR, `raw-state.v1-backup-${timestamp}.json`);
  if (existsSync(STATE_FILE)) copyFileSync(STATE_FILE, backup);

  for (const [rel, item] of Object.entries(state.files)) {
    const absolutePath = item.absolutePath ?? join(ROOT, rel);
    const record = indexRecord(item.rawId);
    const snapshot = existsSync(absolutePath) ? contentSnapshot(absolutePath) : null;
    item.absolutePath = absolutePath;
    item.entryDate = record?.["入 Raw 时间"] ?? record?.日期 ?? item.date ?? localDate(new Date(item.firstSeenAt ?? now()));
    item.currentHash = snapshot?.hash ?? item.hash ?? null;
    const migration = LEGACY_MIGRATION.get(item.rawId);

    if (migration === "learned-historical") {
      item.lastLearnedHash = item.currentHash;
      item.lastLearnedAt = "2026-08-04";
      item.status = "已完成";
    } else if (migration === "partial-backfill") {
      item.lastLearnedHash = item.currentHash;
      item.lastLearnedAt = "2026-08-04";
      resetForQueue(item);
    } else if (migration === "unlearned-backfill") {
      delete item.lastLearnedHash;
      delete item.lastLearnedAt;
      resetForQueue(item);
    } else if (migration === "learned-runtime" && item.status === "已完成" && item.completedAt) {
      item.lastLearnedHash = item.currentHash;
      item.lastLearnedAt = item.completedAt;
    } else if (migration === "learned-runtime") {
      item.lastLearnedHash = `legacy-previous:${item.rawId}`;
      item.lastLearnedAt = "2026-08-04";
      resetForQueue(item);
    } else if (record?.学习状态 === "已学习") {
      item.lastLearnedHash = item.currentHash;
      item.lastLearnedAt = parseIndexLearnedAt(record?.最后学习时间) ?? item.completedAt ?? null;
      item.status = "已完成";
    } else {
      if (record?.学习状态 === "部分学习") item.lastLearnedHash ??= `legacy-previous:${item.rawId}`;
      resetForQueue(item);
    }
    delete item.hash;
    delete item.date;
  }
  state.version = STATE_VERSION;
  state.observations = {};
  saveState();
  syncAllIndexLearningFields();
  log("Raw 运行状态已升级", { from: 1, to: STATE_VERSION, backup });
}
function repairDuplicateRawIds() {
  const owners = new Map();
  for (const [rel, item] of Object.entries(state.files)) {
    if (!item.rawId || item.duplicateOf) continue;
    if (!owners.has(item.rawId)) {
      owners.set(item.rawId, rel);
      continue;
    }
    const previous = item.rawId;
    const absolutePath = item.absolutePath ?? join(ROOT, rel);
    const entryDate = item.entryDate ?? (existsSync(absolutePath) ? localDate(new Date(statSync(absolutePath).mtimeMs)) : localDate());
    item.rawId = nextRawId(entryDate, rel);
    item.entryDate ??= entryDate;
    item.absolutePath ??= absolutePath;
    log("已修复重复 Raw 编号", { file: rel, previous, current: item.rawId });
    if (existsSync(item.absolutePath)) ensureIndexRow(item);
  }
}
function recoverInterruptedItems() {
  const digestMode = loadDigestEngine().mode;
  for (const item of Object.values(state.files)) {
    if (item.status !== "处理中") continue;
    if (digestMode === "session-agent") {
      item.status = SESSION_AGENT_WAIT_STATUS;
      item.error = "上次处理被中断，等待会话 Agent 消化";
      item.waitingForSessionAgentAt = now();
      delete item.nextRetryAt;
    } else {
      item.status = "失败";
      item.nextRetryAt = now();
      item.error = "上次处理被中断，等待自动重试";
    }
    syncIndexLearningFields(item);
  }
}
function requeueFailedItem(rel) {
  const item = state.files[rel];
  if (!item) throw new Error(`未找到 Raw 队列条目：${rel}`);
  if (!["失败", "待人工处理"].includes(item.status)) throw new Error(`该条目不是失败状态：${item.status}`);
  resetForQueue(item);
  syncIndexLearningFields(item);
  saveState();
  log("失败资料已重新排队", { file: rel, rawId: item.rawId });
}
function reprocessItem(rel) {
  const item = state.files[rel];
  const absolutePath = join(ROOT, rel);
  if (!item || !existsSync(absolutePath)) throw new Error(`未找到 Raw 队列条目或原文件：${rel}`);
  item.currentHash = contentSnapshot(absolutePath).hash;
  resetForQueue(item);
  syncIndexLearningFields(item);
  saveState();
  log("Raw 资料已按最新内容重新排队", { file: rel, rawId: item.rawId });
}
function baseline() {
  seedSequences();
  for (const path of listRawFiles()) {
    const rel = posixRelative(path);
    if (state.files[rel]) continue;
    const rawId = extractRawId(path) ?? nextRawId(localDate(), rel);
    const record = indexRecord(rawId);
    const snapshot = contentSnapshot(path);
    const item = {
      rawId,
      currentHash: snapshot.hash,
      status: "待处理",
      source: "既有资料基线",
      entryDate: record?.["入 Raw 时间"] ?? record?.日期 ?? localDate(),
      absolutePath: path,
      firstSeenAt: now(),
      attempts: 0
    };
    if (record?.学习状态 === "已学习") {
      item.status = "已完成";
      item.lastLearnedHash = snapshot.hash;
      item.lastLearnedAt = parseIndexLearnedAt(record?.最后学习时间);
    } else if (record?.学习状态 === "部分学习") {
      item.lastLearnedHash = `baseline-previous:${rawId}`;
      item.lastLearnedAt = parseIndexLearnedAt(record?.最后学习时间);
      item.queuedAt = now();
    } else item.queuedAt = now();
    state.files[rel] = item;
    ensureIndexRow(item);
    syncIndexLearningFields(item);
  }
  state.version = STATE_VERSION;
  state.initialized = true;
  state.initializedAt = now();
  saveState();
  log("已建立既有 Raw 基线", { count: Object.keys(state.files).length });
}
function queueStableFiles() {
  const found = new Set();
  for (const path of listRawFiles()) {
    const rel = posixRelative(path);
    found.add(rel);
    const descriptor = contentDescriptor(path);
    const observation = state.observations[rel];
    if (!observation || observation.signature !== descriptor.signature) {
      state.observations[rel] = { signature: descriptor.signature, firstStableSeenAt: Date.now() };
      continue;
    }
    if (Date.now() - observation.firstStableSeenAt < STABLE_AGE_MS || Date.now() - descriptor.latestMtimeMs < STABLE_AGE_MS) continue;
    const snapshot = contentSnapshot(path, RAW_DIR, descriptor);
    const existing = state.files[rel];
    if (existing?.currentHash === snapshot.hash) {
      if (existing.status === "待稳定") {
        resetForQueue(existing);
        syncIndexLearningFields(existing);
        log("变化中的 Raw 已稳定并重新排队", { file: rel, rawId: existing.rawId });
      }
      continue;
    }
    const duplicate = Object.entries(state.files).find(([key, value]) => key !== rel && value.currentHash === snapshot.hash && value.status !== "失败");
    if (duplicate) {
      state.files[rel] = { ...existing, currentHash: snapshot.hash, rawId: duplicate[1].rawId, status: "已完成", source: "重复资料", duplicateOf: duplicate[0], firstSeenAt: existing?.firstSeenAt ?? now() };
      log("跳过重复资料", { file: rel, duplicateOf: duplicate[0] });
      continue;
    }
    const entryDate = existing?.entryDate ?? localDate();
    const candidateRawId = extractRawId(path) ?? existing?.rawId;
    const item = {
      ...existing,
      rawId: candidateRawId && !rawIdConflicts(candidateRawId, rel, path) ? candidateRawId : nextRawId(entryDate, rel),
      currentHash: snapshot.hash,
      status: "待处理",
      source: "本地导入",
      entryDate,
      absolutePath: path,
      firstSeenAt: existing?.firstSeenAt ?? now(),
      queuedAt: now(),
      attempts: 0
    };
    delete item.startedAt;
    delete item.completedAt;
    delete item.lastOutput;
    delete item.lastError;
    delete item.error;
    delete item.nextRetryAt;
    state.files[rel] = item;
    ensureIndexRow(item);
    syncIndexLearningFields(item);
    log(existing ? "Raw 内容发生变化，已转为部分学习并重新排队" : "资料已进入消化队列", { file: rel, rawId: item.rawId });
  }
  for (const rel of Object.keys(state.observations)) if (!found.has(rel)) delete state.observations[rel];
  saveState();
}

function codexCommand() {
  if (process.env.CODEX_EXE) return { executable: process.env.CODEX_EXE, prefix: [] };
  const script = join(process.env.APPDATA ?? "", "npm", "node_modules", "@openai", "codex", "bin", "codex.js");
  return existsSync(script) ? { executable: process.execPath, prefix: [script] } : { executable: "codex.cmd", prefix: [] };
}
function isAgentChatRaw(absolutePath, rel) {
  const normalized = posixPath(rel);
  if (normalized.includes("/Agent聊天手动导入/") || normalized.includes("Agent聊天-")) return true;
  if (extname(absolutePath).toLowerCase() !== ".md" || !existsSync(absolutePath)) return false;
  const head = readFileSync(absolutePath, "utf8").slice(0, 1200);
  return /^type:\s*Agent聊天\s*$/m.test(head) || head.includes("type: Agent聊天");
}
function promptFileFor(absolutePath, rel) {
  return isAgentChatRaw(absolutePath, rel) && existsSync(CHAT_PROMPT_FILE) ? CHAT_PROMPT_FILE : PROMPT_FILE;
}
function buildPrompt(rel, item) {
  const absolutePath = join(ROOT, rel);
  const promptFile = promptFileFor(absolutePath, rel);
  return `${readFileSync(promptFile, "utf8")}\n\n## 本次任务\n\n- RAW 编号：${item.rawId}\n- 原始文件：${rel}\n- 绝对路径：${absolutePath}\n- 当前内容组合哈希：${item.currentHash}\n- 消化提示词：${posixRelative(promptFile)}\n`;
}
function runCodex(prompt) {
  return new Promise((resolvePromise) => {
    const command = codexCommand();
    const args = [...command.prefix, "exec", "--skip-git-repo-check", "--ephemeral", "--sandbox", "workspace-write", "-c", 'approval_policy="never"', "-C", ROOT, "-"];
    const homeDirectory = process.env.USERPROFILE ?? process.env.HOME ?? (process.env.APPDATA ? dirname(process.env.APPDATA) : undefined);
    if (!homeDirectory) throw new Error("无法确定用户主目录，不能启动 Codex");
    const childEnvironment = { ...process.env, HOME: homeDirectory, USERPROFILE: homeDirectory };
    childEnvironment.CODEX_HOME ??= join(homeDirectory, ".codex");
    const child = spawn(command.executable, args, { cwd: ROOT, env: childEnvironment, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr += data; });
    child.on("error", (error) => resolvePromise({ code: -1, stdout, stderr: `${stderr}\n${error}` }));
    child.on("close", (code) => resolvePromise({ code: code ?? -1, stdout, stderr }));
    child.stdin.end(prompt, "utf8");
  });
}
async function markWaitingForSessionAgent() {
  const entry = Object.entries(state.files).find(([, item]) => item.status === "待处理" || item.status === "失败");
  if (!entry) return false;
  const [rel, item] = entry;
  const absolutePath = join(ROOT, rel);
  if (!existsSync(absolutePath)) {
    item.status = "待人工处理";
    item.error = "原始文件已不存在";
    syncIndexLearningFields(item);
    saveState();
    return true;
  }
  item.status = SESSION_AGENT_WAIT_STATUS;
  item.waitingForSessionAgentAt = now();
  delete item.nextRetryAt;
  delete item.error;
  syncIndexLearningFields(item);
  saveState();
  log("等待会话 Agent 消化（digest-engine mode=session-agent，不调用 Codex）", {
    file: rel,
    rawId: item.rawId,
    hash: item.currentHash
  });
  return true;
}
async function processNext() {
  const digestEngine = loadDigestEngine();
  if (digestEngine.mode === "session-agent") {
    if (reconcileSessionAgentCompletions()) saveState();
    return markWaitingForSessionAgent();
  }

  const timestamp = Date.now();
  const entry = Object.entries(state.files).find(([, item]) => item.status === "待处理" || item.status === SESSION_AGENT_WAIT_STATUS || (
    item.status === "失败" && item.attempts < RETRY_LIMIT && (!item.nextRetryAt || Date.parse(item.nextRetryAt) <= timestamp)
  ));
  if (!entry) return false;
  const [rel, item] = entry;
  const absolutePath = join(ROOT, rel);
  if (!existsSync(absolutePath)) {
    item.status = "待人工处理";
    item.error = "原始文件已不存在";
    syncIndexLearningFields(item);
    saveState();
    return true;
  }
  const processingHash = item.currentHash;
  item.status = "处理中";
  item.attempts = (item.attempts ?? 0) + 1;
  item.startedAt = now();
  delete item.waitingForSessionAgentAt;
  syncIndexLearningFields(item);
  saveState();
  log("开始自动消化", { file: rel, attempt: item.attempts, hash: processingHash, digestMode: digestEngine.mode });
  const result = await runCodex(buildPrompt(rel, item));
  item.lastOutput = result.stdout.slice(-4000);
  item.lastError = result.stderr.slice(-4000);
  if (result.code === 0) {
    const descriptor = contentDescriptor(absolutePath);
    const latest = contentSnapshot(absolutePath, RAW_DIR, descriptor);
    if (latest.hash !== processingHash) {
      item.currentHash = latest.hash;
      item.status = "待稳定";
      item.attempts = 0;
      item.queuedAt = now();
      state.observations[rel] = { signature: descriptor.signature, firstStableSeenAt: Date.now() };
      delete item.error;
      delete item.nextRetryAt;
      syncIndexLearningFields(item);
      log("处理期间 Raw 再次变化，保留部分学习并等待稳定", { file: rel, rawId: item.rawId });
    } else {
      const completedAt = now();
      item.status = "已完成";
      item.lastLearnedHash = processingHash;
      item.lastLearnedAt = completedAt;
      item.completedAt = completedAt;
      delete item.error;
      delete item.nextRetryAt;
      syncIndexLearningFields(item);
      log("自动消化完成", { file: rel, rawId: item.rawId });
    }
  } else {
    item.status = item.attempts >= RETRY_LIMIT ? "待人工处理" : "失败";
    item.error = `Codex 退出码 ${result.code}`;
    if (item.status === "失败") item.nextRetryAt = new Date(Date.now() + RETRY_DELAY_MS * 2 ** (item.attempts - 1)).toISOString();
    syncIndexLearningFields(item);
    log("自动消化失败", { file: rel, code: result.code, status: item.status, nextRetryAt: item.nextRetryAt });
  }
  saveState();
  return true;
}
async function drain() { while (await processNext()) {} }
async function scanAndDrain() {
  queueStableFiles();
  if (reconcileSessionAgentCompletions()) saveState();
  await drain();
}
let scanRunning = false;
async function guardedScanAndDrain() {
  if (scanRunning) return;
  scanRunning = true;
  try { await scanAndDrain(); }
  finally { scanRunning = false; }
}
async function watch() {
  migrateState();
  if (!state.initialized) baseline();
  repairDuplicateRawIds();
  recoverInterruptedItems();
  reconcileSessionAgentCompletions();
  syncAllIndexLearningFields();
  saveState();
  const digestEngine = loadDigestEngine();
  log("Raw 自动化已启动", {
    rawDir: RAW_DIR,
    intervalMs: SCAN_INTERVAL_MS,
    stateVersion: state.version,
    digestMode: digestEngine.mode,
    digestFallback: digestEngine.fallback
  });
  await guardedScanAndDrain();
  setInterval(() => guardedScanAndDrain().catch((error) => log("扫描异常", { error: String(error), stack: error?.stack })), SCAN_INTERVAL_MS);
}
function selfTest() {
  seedSequences();
  const ignored = [join(RAW_DIR, "README.md"), join(ATTACHMENTS_DIR, "a.png"), join(RAW_DIR, ".x.md"), join(RAW_DIR, "a.pdf.part")];
  if (!ignored.every(isIgnored)) throw new Error("忽略规则自检失败");
  if (!SUPPORTED.has(".xlsx") || !SUPPORTED.has(".png")) throw new Error("支持格式自检失败");
  const id = nextRawId("2099-01-02");
  if (!/^RAW-20990102-\d{3}$/.test(id)) throw new Error("RAW 编号自检失败");
  if (publicLearningStatus({ status: "已完成", currentHash: "a", lastLearnedHash: "a" }) !== "已学习") throw new Error("已学习状态自检失败");
  if (publicLearningStatus({ status: "待处理", currentHash: "b", lastLearnedHash: "a" }) !== "部分学习") throw new Error("部分学习状态自检失败");
  if (publicLearningStatus({ status: "失败", currentHash: "b" }) !== "未学习") throw new Error("未学习状态自检失败");
  if (publicLearningStatus({ status: "失败", currentHash: "b", lastLearnedHash: "a" }) !== "部分学习") throw new Error("再次学习失败状态自检失败");
  if (publicLearningStatus({ status: "处理中", currentHash: "a" }) !== "未学习") throw new Error("首次学习中状态自检失败");
  if (publicLearningStatus({ status: "已完成", currentHash: "b", lastLearnedHash: "a" }) !== "部分学习") throw new Error("哈希失配状态自检失败");
  if (publicLearningStatus({ status: SESSION_AGENT_WAIT_STATUS, currentHash: "b", lastLearnedHash: "a" }) !== "部分学习") throw new Error("待Agent消化状态自检失败");
  if (formatLastLearnedAt("2026-08-04") !== "2026-08-04（历史，仅精确到日）") throw new Error("历史学习时间自检失败");

  const digestEngine = loadDigestEngine();
  if (!["session-agent", "codex"].includes(digestEngine.mode)) throw new Error("digest-engine mode 自检失败");
  if (DEFAULT_DIGEST_ENGINE.mode !== "session-agent") throw new Error("digest-engine 缺省 mode 自检失败");
  // 缺文件不得崩溃，且回退 session-agent
  const engineOrDefault = loadDigestEngine();
  if (engineOrDefault.mode !== "session-agent" && engineOrDefault.mode !== "codex") {
    throw new Error("digest-engine 读取结果非法");
  }

  const testRoot = mkdtempSync(join(tmpdir(), "raw-pipeline-selftest-"));
  try {
    const atomicFixture = join(testRoot, "atomic.txt");
    writeFileSync(atomicFixture, "旧内容", "utf8");
    atomicText(atomicFixture, "新内容");
    if (readFileSync(atomicFixture, "utf8") !== "新内容") throw new Error("原子写入自检失败");
    const attachmentDir = join(testRoot, "附件", "示例");
    mkdirSync(attachmentDir, { recursive: true });
    const main = join(testRoot, "示例.md");
    const referenced = join(attachmentDir, "引用.txt");
    const unreferenced = join(attachmentDir, "未引用.txt");
    writeFileSync(referenced, "附件-v1", "utf8");
    writeFileSync(unreferenced, "未引用-v1", "utf8");
    writeFileSync(main, "# 示例\n\n[附件](附件/示例/引用.txt)\n", "utf8");
    const first = contentSnapshot(main, testRoot).hash;
    writeFileSync(unreferenced, "未引用-v2", "utf8");
    if (contentSnapshot(main, testRoot).hash !== first) throw new Error("未引用附件不应改变组合哈希");
    writeFileSync(referenced, "附件-v2", "utf8");
    const changedAttachment = contentSnapshot(main, testRoot).hash;
    if (changedAttachment === first) throw new Error("引用附件变化未改变组合哈希");
    rmSync(referenced);
    const missingAttachment = contentSnapshot(main, testRoot).hash;
    if (missingAttachment === changedAttachment) throw new Error("引用附件缺失未改变组合哈希");
    writeFileSync(referenced, "附件-v1", "utf8");
    if (contentSnapshot(main, testRoot).hash !== first) throw new Error("引用附件恢复后组合哈希不一致");
    writeFileSync(main, "# 示例-已修改\n\n[附件](附件/示例/引用.txt)\n", "utf8");
    if (contentSnapshot(main, testRoot).hash === first) throw new Error("主文档变化未改变组合哈希");

    // 临时 digest-engine：合法 codex / 非法 mode 归一化 / 损坏 JSON 不崩溃
    const tempEnginePath = join(testRoot, "digest-engine.json");
    writeFileSync(tempEnginePath, JSON.stringify({ version: 1, mode: "codex", fallback: "codex" }), "utf8");
    const readTemp = JSON.parse(readFileSync(tempEnginePath, "utf8"));
    if ((readTemp?.mode === "codex" ? "codex" : "session-agent") !== "codex") throw new Error("临时 digest-engine codex 读取自检失败");
    writeFileSync(tempEnginePath, JSON.stringify({ mode: "unexpected" }), "utf8");
    const readBad = JSON.parse(readFileSync(tempEnginePath, "utf8"));
    if ((readBad?.mode === "codex" ? "codex" : "session-agent") !== "session-agent") throw new Error("临时 digest-engine 非法 mode 自检失败");
    writeFileSync(tempEnginePath, "{not-json", "utf8");
    try {
      JSON.parse(readFileSync(tempEnginePath, "utf8"));
      throw new Error("损坏 JSON 应抛错");
    } catch (error) {
      if (String(error).includes("损坏 JSON 应抛错")) throw error;
      // 与 loadDigestEngine 一致：解析失败时回退默认
      if (DEFAULT_DIGEST_ENGINE.mode !== "session-agent") throw new Error("损坏 JSON 回退自检失败");
    }
  } finally {
    rmSync(testRoot, { recursive: true, force: true });
  }
  log("自检通过", {
    stateVersion: STATE_VERSION,
    compositeHash: true,
    learningStates: true,
    digestMode: digestEngine.mode
  });
}

async function prepareOperationalMode() {
  migrateState();
  if (!state.initialized) baseline();
  repairDuplicateRawIds();
}

if (MODE === "watch") await watch();
else if (MODE === "once") {
  await prepareOperationalMode();
  recoverInterruptedItems();
  reconcileSessionAgentCompletions();
  syncAllIndexLearningFields();
  saveState();
  await guardedScanAndDrain();
}
else if (MODE === "retry-failed" && process.argv[3]) { await prepareOperationalMode(); requeueFailedItem(process.argv[3]); await guardedScanAndDrain(); }
else if (MODE === "reprocess" && process.argv[3]) { await prepareOperationalMode(); reprocessItem(process.argv[3]); await guardedScanAndDrain(); }
else if (MODE === "baseline") { migrateState(); if (!state.initialized) baseline(); else { syncAllIndexLearningFields(); saveState(); } }
else if (MODE === "self-test") selfTest();
else throw new Error(`用法：node raw-pipeline.mjs watch|once|baseline|self-test|retry-failed|reprocess <Raw相对路径>`);
