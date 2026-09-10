/**
 * 有状态浏览器的全字段证据采集器。
 *
 * 仅在已由 Browser 插件接管且已登录的 tab 中调用；不包含登录能力。
 * 它将内部滚动区域的连续视图拼为一张纵向合图，并输出字段/覆盖校验 manifest。
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import sharp from "sharp";

const encoder = new TextEncoder();
const asText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const unique = (values) => [...new Set(values.map(asText).filter(Boolean))];
const now = () => new Date().toISOString();
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function positions(maximum, viewport, overlap = 96) {
  if (maximum <= 0 || viewport <= 0) return [0];
  const step = Math.max(1, viewport - overlap);
  const output = [0];
  for (let value = step; value < maximum; value += step) output.push(value);
  if (output.at(-1) !== maximum) output.push(maximum);
  return output;
}

async function writeBinary(path, buffer) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buffer);
}

async function imageInfo(buffer) {
  const meta = await sharp(buffer).metadata();
  return { width: meta.width, height: meta.height, sha256: sha256(buffer) };
}

/** Read one bounded, semantic page snapshot.  No body.innerText is used. */
export async function inspectVisiblePage(tab, { selector = "body" } = {}) {
  return tab.playwright.evaluate(({ selector }) => {
    const norm = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1;
    };
    const texts = (selectors, cap = 150) => {
      const found = [];
      for (const el of document.querySelectorAll(selectors)) {
        if (!visible(el)) continue;
        const text = norm(el.getAttribute("aria-label") || el.innerText || el.textContent);
        if (text && text.length <= 140) found.push(text);
        if (found.length >= cap) break;
      }
      return [...new Set(found)];
    };
    const root = document.querySelector(selector) || document.body;
    const scrollables = [...root.querySelectorAll("*")].filter((el) => {
      const style = getComputedStyle(el);
      return visible(el) && (/(auto|scroll)/.test(style.overflowX) || /(auto|scroll)/.test(style.overflowY)) &&
        (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    }).map((el, index) => {
      const r = el.getBoundingClientRect();
      return { index, tag: el.tagName, className: String(el.className || "").slice(0, 180), id: el.id || "", rect: { x: r.x, y: r.y, width: r.width, height: r.height }, scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight, clientWidth: el.clientWidth, clientHeight: el.clientHeight, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    }).sort((a, b) => (b.scrollWidth * b.scrollHeight) - (a.scrollWidth * a.scrollHeight)).slice(0, 30);
    const fields = texts("label, .el-form-item__label, th, [role='columnheader'], .vxe-header--column .vxe-cell", 400);
    const accountRects = [...document.querySelectorAll("body *")].filter((el) => visible(el) && /^\d{11}$/.test(norm(el.textContent))).map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }).slice(0, 5);
    return {
      title: document.title,
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight },
      menus: texts(".el-menu, nav, aside", 180),
      tabs: texts(".el-tabs__item, [role='tab']", 100),
      filters: texts(".el-form-item__label, .el-input__inner[placeholder], input[placeholder], .el-select__placeholder", 160),
      buttons: texts("button, .el-button, [role='button']", 180),
      fields,
      pagination: texts(".el-pagination, .vxe-pager", 80),
      scrollables,
      accountRects
    };
  }, { selector });
}

async function screenshotViewport(tab, sensitiveRects = []) {
  const buffer = Buffer.from(await tab.screenshot());
  if (!sensitiveRects.length) return buffer;
  const meta = await sharp(buffer).metadata();
  const masks = sensitiveRects.map((r) => ({
    input: { create: { width: Math.max(1, Math.ceil(r.width + 12)), height: Math.max(1, Math.ceil(r.height + 8)), channels: 4, background: "#2f3340" } },
    left: clamp(Math.floor(r.x - 6), 0, Math.max(0, meta.width - 1)),
    top: clamp(Math.floor(r.y - 4), 0, Math.max(0, meta.height - 1))
  }));
  return sharp(buffer).composite(masks).png().toBuffer();
}

async function crop(buffer, rect) {
  const meta = await sharp(buffer).metadata();
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > meta.width || rect.y + rect.height > meta.height) {
    throw new Error(`截图坐标与像素画布不一致，拒绝裁切以避免漏字段：请求 ${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)}x${Math.round(rect.height)}；画布 ${meta.width}x${meta.height}`);
  }
  const left = clamp(Math.floor(rect.x), 0, Math.max(0, meta.width - 1));
  const top = clamp(Math.floor(rect.y), 0, Math.max(0, meta.height - 1));
  const width = clamp(Math.ceil(rect.width), 1, meta.width - left);
  const height = clamp(Math.ceil(rect.height), 1, meta.height - top);
  return sharp(buffer).extract({ left, top, width, height }).png().toBuffer();
}

async function labelledStack(tiles, title) {
  const infos = await Promise.all(tiles.map(imageInfo));
  const width = Math.max(...infos.map((x) => x.width));
  const labelHeight = 42;
  const headerHeight = 58;
  const height = headerHeight + infos.reduce((sum, x) => sum + x.height + labelHeight, 0);
  const titleSvg = Buffer.from(`<svg width="${width}" height="${headerHeight}"><rect width="100%" height="100%" fill="#1f2937"/><text x="20" y="36" fill="#ffffff" font-size="24" font-family="Microsoft YaHei,Arial">${title.replace(/[<>&]/g, "")}</text></svg>`);
  const layers = [{ input: titleSvg, left: 0, top: 0 }];
  let y = headerHeight;
  for (let index = 0; index < tiles.length; index++) {
    const labelSvg = Buffer.from(`<svg width="${width}" height="${labelHeight}"><rect width="100%" height="100%" fill="#eef2f7"/><text x="16" y="28" fill="#334155" font-size="17" font-family="Microsoft YaHei,Arial">视图 ${index + 1}/${tiles.length}</text></svg>`);
    layers.push({ input: labelSvg, left: 0, top: y }); y += labelHeight;
    layers.push({ input: tiles[index], left: 0, top: y }); y += infos[index].height;
  }
  return sharp({ create: { width, height, channels: 4, background: "white" } }).composite(layers).png().toBuffer();
}

async function scrollAt(tab, point, x, y) {
  // Extension-backed Chromium may time out on a single very large gesture.
  // Split it into bounded gestures; coverage is still recorded at the target position.
  let remainingX = Math.round(x), remainingY = Math.round(y);
  while (remainingX !== 0 || remainingY !== 0) {
    const stepX = clamp(remainingX, -420, 420);
    const stepY = clamp(remainingY, -420, 420);
    await tab.cua.scroll({ x: Math.round(point.x), y: Math.round(point.y), scrollX: stepX, scrollY: stepY });
    remainingX -= stepX; remainingY -= stepY;
  }
  // Chromium occasionally paints the pre-scroll table for the first frame.
  await tab.screenshot();
}

/**
 * Capture one internal scroll container.  Tiles are retained only in memory and become one PNG.
 * The returned manifest records every requested/observed position for completeness validation.
 */
export async function captureScrollable(tab, options) {
  const { name, outputPath, rect, metrics, direction = "both", sensitiveRects = [], overlap = 96, title = name, readVisibleFields } = options;
  const horizontal = direction === "both" || direction === "horizontal";
  const vertical = direction === "both" || direction === "vertical";
  const maxX = horizontal ? Math.max(0, metrics.scrollWidth - metrics.clientWidth) : 0;
  const maxY = vertical ? Math.max(0, metrics.scrollHeight - metrics.clientHeight) : 0;
  const xPositions = positions(maxX, metrics.clientWidth, overlap);
  const yPositions = positions(maxY, metrics.clientHeight, overlap);
  const point = { x: rect.x + Math.min(40, rect.width / 2), y: rect.y + Math.min(40, rect.height / 2) };
  const startX = metrics.scrollLeft ?? 0, startY = metrics.scrollTop ?? 0;
  const tiles = [], observations = [];
  let currentX = startX, currentY = startY;
  for (const y of yPositions) {
    for (const x of xPositions) {
      await scrollAt(tab, point, x - currentX, y - currentY);
      currentX = x; currentY = y;
      // Callers select the safe mode after checking one same-page screenshot.
      // Native clips work for the in-app browser; viewport crops work for the
      // extension when its CSS coordinates equal screenshot pixels.
      const raw = await screenshotViewport(tab, sensitiveRects);
      const tile = await crop(raw, rect);
      tiles.push(tile);
      const visible = readVisibleFields ? await readVisibleFields() : [];
      observations.push({ x, y, fields: unique(visible) });
    }
  }
  // Restore the pre-capture state so the user is not left at an arbitrary list position.
  await scrollAt(tab, point, startX - currentX, startY - currentY);
  const combined = await labelledStack(tiles, title);
  await writeBinary(outputPath, combined);
  const info = await imageInfo(combined);
  const allFields = unique(observations.flatMap((item) => item.fields));
  return {
    name, type: "scrollable_stitched_png", outputPath, ...info,
    sourceTiles: tiles.length,
    coverage: {
      horizontal: { expectedMax: maxX, requestedPositions: xPositions, observedPositions: unique(observations.map((x) => x.x)).map(Number), complete: xPositions.every((x) => observations.some((item) => item.x === x)) },
      vertical: { expectedMax: maxY, requestedPositions: yPositions, observedPositions: unique(observations.map((x) => x.y)).map(Number), complete: yPositions.every((y) => observations.some((item) => item.y === y)) }
    },
    fields: allFields,
    observations
  };
}

export async function captureOverview(tab, { name, outputPath, sensitiveRects = [] }) {
  const snapshot = await inspectVisiblePage(tab);
  const raw = snapshot.viewport.scrollHeight > snapshot.viewport.height + 8
    ? Buffer.from(await tab.screenshot({ fullPage: true }))
    : await screenshotViewport(tab, sensitiveRects);
  // fullPage screenshot is normally already beyond the account area; mask the viewport variant.
  await writeBinary(outputPath, raw);
  return { name, type: snapshot.viewport.scrollHeight > snapshot.viewport.height + 8 ? "full_page_png" : "viewport_png", outputPath, ...(await imageInfo(raw)), fields: snapshot.fields, snapshot };
}

export async function writeManifest(outputPath, manifest) {
  const completed = { schemaVersion: "1.0", capturedAt: now(), ...manifest };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(completed, null, 2)}\n`, "utf8");
  return completed;
}

export async function validateManifest(manifest) {
  const captures = manifest.captures ?? [];
  const missing = captures.flatMap((capture) => {
    const failures = [];
    if (capture.coverage && (!capture.coverage.horizontal.complete || !capture.coverage.vertical.complete)) failures.push(`${capture.name}:滚动位置未全覆盖`);
    return failures;
  });
  return { passed: missing.length === 0, missing, allVisibleFields: unique(captures.flatMap((capture) => capture.fields ?? [])) };
}

export const captureContract = Object.freeze({
  method: "已登录会话 + 内部滚动采集 + 单张纵向合图",
  evidenceRule: "合图成功后不写入或保留临时分片",
  tokenRule: "只把 manifest 摘要交给模型；截图和分片不在过程中回传"
});
