#!/usr/bin/env node
/**
 * 扫描工作台/今日.md、00-待确认区、Raw 索引，生成：
 * - 08-自动化/.runtime/workbench.json
 * - 工作台/workbench-data.js（供 file:// 打开的 HTML 读取；含正文供站内预览）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TODAY_MD = path.join(ROOT, "工作台", "今日.md");
const PENDING_DIR = path.join(ROOT, "00-待确认区");
const RAW_INDEX = path.join(ROOT, "01-原始文件（Raw）", "README.md");
const OUT_JSON = path.join(__dirname, ".runtime", "workbench.json");
const OUT_JS = path.join(ROOT, "工作台", "workbench-data.js");

/** 侧栏快捷入口：构建时嵌入正文，供 HTML 预览（过大则仅 Cursor 打开） */
const PREVIEW_DOCS = [
  { id: "today", title: "今日.md", rel: "工作台/今日.md" },
  { id: "pending-readme", title: "待确认区说明", rel: "00-待确认区/README.md" },
  { id: "questions", title: "待确认问题", rel: "06-长期记忆/待确认问题.md" },
  { id: "handoff", title: "交接文档", rel: "06-长期记忆/agent切换交接文档.md" },
  { id: "prefs", title: "协作偏好", rel: "06-长期记忆/协作偏好.md" },
  { id: "workspace-readme", title: "工作空间说明", rel: "README.md" },
];

const MAX_PREVIEW_CHARS = 400_000;

const CATEGORY_LABEL = {
  知识候选: "审阅落库",
  工作日报: "审阅归档",
  协作偏好: "审阅决策",
  决策: "审阅决策",
};

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function toPosix(rel) {
  return rel.split(path.sep).join("/");
}

function toCursorUri(absPath) {
  return `cursor://file/${absPath.replace(/\\/g, "/")}`;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_\u4e00-\u9fff]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^["'].*["']$/.test(val)) val = val.slice(1, -1);
    meta[kv[1]] = val;
  }
  return { meta, body: m[2] };
}

function section(text, heading) {
  const re = new RegExp(
    `## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`
  );
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function parseCheckboxes(block, source) {
  const items = [];
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^- \[([ xX])\]\s+(.+)$/);
    if (!m) continue;
    items.push({
      id: `todo-${items.length + 1}`,
      kind: "常规",
      done: m[1].toLowerCase() === "x",
      title: m[2].replace(/\*\*/g, "").trim(),
      source,
      path: "工作台/今日.md",
      previewId: "today",
    });
  }
  return items;
}

function parseBulletList(block) {
  return block
    .split(/\r?\n/)
    .map((l) => l.replace(/^- /, "").trim())
    .filter((l) => l && !l.startsWith("|") && !l.startsWith("完整清单"));
}

function walkMdFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walkMdFiles(full, acc);
    else if (name.isFile() && name.name.endsWith(".md") && name.name !== "README.md") {
      acc.push(full);
    }
  }
  return acc;
}

function loadPreviewDoc(spec) {
  const abs = path.join(ROOT, ...spec.rel.split("/"));
  const rel = toPosix(spec.rel);
  const cursorUri = toCursorUri(abs);
  if (!fs.existsSync(abs)) {
    return {
      id: spec.id,
      title: spec.title,
      path: rel,
      cursorUri,
      markdown: null,
      truncated: false,
      missing: true,
    };
  }
  const raw = readText(abs);
  const { body } = parseFrontmatter(raw);
  const markdown = body.length > MAX_PREVIEW_CHARS
    ? body.slice(0, MAX_PREVIEW_CHARS) + "\n\n…（内容过长，已截断；请用 Cursor 打开全文）"
    : body;
  return {
    id: spec.id,
    title: spec.title,
    path: rel,
    cursorUri,
    markdown,
    truncated: body.length > MAX_PREVIEW_CHARS,
    missing: false,
  };
}

function scanPendingDrafts() {
  const drafts = [];
  for (const file of walkMdFiles(PENDING_DIR)) {
    const text = readText(file);
    const { meta, body } = parseFrontmatter(text);
    if (meta.type && meta.type !== "draft") continue;
    const status = meta.status || "待确认";
    if (status !== "待确认") continue;
    const rel = toPosix(path.relative(ROOT, file));
    const category = meta.category || "其他";
    const kind = CATEGORY_LABEL[category] || "审阅";
    const title = meta.title || path.basename(file, ".md");
    const summary = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith(">")) || "";
    const markdown = body.length > MAX_PREVIEW_CHARS
      ? body.slice(0, MAX_PREVIEW_CHARS) + "\n\n…（内容过长，已截断）"
      : body;

    drafts.push({
      id: `draft-${drafts.length + 1}`,
      kind,
      category,
      done: false,
      title,
      summary: summary.slice(0, 160),
      path: rel,
      cursorUri: toCursorUri(file),
      markdown,
      demo: Boolean(meta.demo),
      raw_id: meta.raw_id || "",
      target_path: meta.target_path || "",
      commands: {
        confirm: `确认落库：${rel}`,
        revise: `修改草案：${rel}，意见：`,
        reject: `驳回草案：${rel}，原因：`,
      },
    });
  }
  return drafts;
}

function countUnlearnedRaw() {
  if (!fs.existsSync(RAW_INDEX)) return { unlearned: 0, partial: 0 };
  const text = readText(RAW_INDEX);
  let unlearned = 0;
  let partial = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("| RAW-")) continue;
    if (line.includes("| 未学习 |")) unlearned += 1;
    else if (line.includes("| 部分学习 |")) partial += 1;
  }
  return { unlearned, partial };
}

function parseToday() {
  const text = readText(TODAY_MD);
  const body = parseFrontmatter(text).body || text;
  const focuses = parseCheckboxes(section(body, "今日三个重点"), "今日三个重点");
  const todos = parseCheckboxes(section(body, "待办"), "待办");
  const cleanup = parseCheckboxes(section(body, "下班前清理"), "下班前清理");
  const blockers = parseBulletList(section(body, "阻塞事项"));
  const waiting = parseBulletList(section(body, "等待反馈")).filter(
    (l) => !l.startsWith("~~")
  );
  const openQuestions = parseBulletList(section(body, "待确认问题"));
  const learnFocus = parseBulletList(section(body, "本周学习重点"));
  const quadrant = section(body, "任务四象限");
  const activeReqs = section(body, "活跃需求");

  return {
    focuses,
    todos: [...todos, ...cleanup.filter((t) => !t.done)],
    blockers,
    waiting,
    openQuestions,
    learnFocus,
    quadrant,
    activeReqs,
  };
}

function build() {
  if (!fs.existsSync(TODAY_MD)) {
    console.error(`缺少 ${TODAY_MD}`);
    process.exit(1);
  }

  const today = parseToday();
  const drafts = scanPendingDrafts();
  const raw = countUnlearnedRaw();
  const previewDocs = Object.fromEntries(
    PREVIEW_DOCS.map((spec) => [spec.id, loadPreviewDoc(spec)])
  );

  const reviewTodos = drafts.map((d) => ({
    id: d.id,
    kind: d.kind,
    done: false,
    title: d.demo ? `[演示] ${d.title}` : d.title,
    source: d.category,
    path: d.path,
    cursorUri: d.cursorUri,
    demo: d.demo,
    commands: d.commands,
    summary: d.summary,
    previewKind: "draft",
    previewId: d.id,
  }));

  const regularOpen = today.todos.filter((t) => !t.done);
  const allTodos = [...reviewTodos, ...regularOpen];

  const data = {
    generatedAt: new Date().toISOString(),
    generatedAtLocal: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
    rootPath: ROOT,
    counts: {
      todos: allTodos.length,
      review: reviewTodos.length,
      regular: regularOpen.length,
      unlearnedRaw: raw.unlearned,
      partialRaw: raw.partial,
      blockers: today.blockers.length,
      waiting: today.waiting.length,
    },
    todos: allTodos,
    drafts,
    previewDocs,
    focuses: today.focuses,
    blockers: today.blockers,
    waiting: today.waiting,
    openQuestions: today.openQuestions,
    learnFocus: today.learnFocus,
    quadrantMarkdown: today.quadrant,
    activeReqsMarkdown: today.activeReqs,
    shortcuts: [
      { label: "今日.md", previewId: "today", cursorUri: previewDocs.today.cursorUri },
      { label: "待确认区", previewId: "pending-readme", cursorUri: previewDocs["pending-readme"].cursorUri },
      {
        label: "Raw 索引",
        previewId: null,
        cursorUri: toCursorUri(RAW_INDEX),
        note: "文件较大，请用 Cursor 打开",
      },
      { label: "待确认问题", previewId: "questions", cursorUri: previewDocs.questions.cursorUri },
      { label: "交接文档", previewId: "handoff", cursorUri: previewDocs.handoff.cursorUri },
      { label: "协作偏好", previewId: "prefs", cursorUri: previewDocs.prefs.cursorUri },
      { label: "工作空间说明", previewId: "workspace-readme", cursorUri: previewDocs["workspace-readme"].cursorUri },
    ],
    links: {
      todayMd: "今日.md",
      pendingDir: "../00-待确认区/README.md",
      rawIndex: "../01-原始文件（Raw）/README.md",
      questions: "../06-长期记忆/待确认问题.md",
      handoff: "../06-长期记忆/agent切换交接文档.md",
    },
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2), "utf8");
  fs.writeFileSync(
    OUT_JS,
    `/* 由 08-自动化/build-workbench.mjs 自动生成，勿手改 */\nwindow.WORKBENCH_DATA = ${JSON.stringify(data, null, 2)};\n`,
    "utf8"
  );

  console.log(
    `OK workbench: todos=${data.counts.todos} (审阅=${data.counts.review}, 常规=${data.counts.regular}), 未学习Raw=${data.counts.unlearnedRaw}, previewDocs=${Object.keys(previewDocs).length}`
  );
  console.log(`→ ${toPosix(path.relative(ROOT, OUT_JSON))}`);
  console.log(`→ ${toPosix(path.relative(ROOT, OUT_JS))}`);
}

build();
