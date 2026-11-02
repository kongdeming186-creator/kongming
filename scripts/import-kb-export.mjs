#!/usr/bin/env node
// 把「办件查询」导出的 xlsx 合并进知识库 public/knowledge_base.json
//
// 用法: node scripts/import-kb-export.mjs "<xlsx 路径>"
//
// 该导出文件有两个坑，这里已处理：
//   1) 工作表 <dimension> 写的是 A1:R3（错的），SheetJS 会照着它只读 3 行 —— 需按真实单元格重算范围
//   2) 表头在第 2 行（第 1 行是标题「办件查询列表信息」）
// 合并规则：按「办件编号」去重（文件内重复、与知识库已重复的都跳过），新记录 序号 续接知识库最大值。
import fs from "fs";
import os from "os";
import path from "path";
import XLSX from "xlsx";

const KB_PATH = path.resolve(import.meta.dirname, "../public/knowledge_base.json");
const FIELDS = [
  "序号", "办件编号", "办件来源", "市级编号", "诉求主题", "诉求内容", "办理单位", "办理科室",
  "诉求人", "诉求人电话", "处理结果", "事项大类", "事项小类", "派发时间", "承诺完成时间",
  "办件状态", "派单员", "预警状态",
];

const src = process.argv[2];
if (!src) {
  console.error("用法: node scripts/import-kb-export.mjs \"<xlsx 路径>\"");
  process.exit(1);
}

/** 读取导出表：忽略错误的 dimension，跳过第 1 行标题 */
function readExport(file) {
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  let maxR = 0;
  let maxC = 0;
  for (const key of Object.keys(ws)) {
    if (key[0] === "!") continue;
    const c = XLSX.utils.decode_cell(key);
    if (c.r > maxR) maxR = c.r;
    if (c.c > maxC) maxC = c.c;
  }
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
  return XLSX.utils.sheet_to_json(ws, { raw: false, defval: "", range: 1 });
}

const rows = readExport(src);
const kb = JSON.parse(fs.readFileSync(KB_PATH, "utf8"));
const kbIds = new Set(kb.map((r) => String(r["办件编号"])));

// 备份（写到系统临时目录，避免污染仓库）
const backup = path.join(os.tmpdir(), `knowledge_base.backup-${Date.now()}.json`);
fs.copyFileSync(KB_PATH, backup);

let seq = kb.reduce((a, r) => Math.max(a, Number(r["序号"]) || 0), 0);
const seen = new Set();
const added = [];
let dupInFile = 0;
let dupWithKb = 0;
for (const r of rows) {
  const id = String(r["办件编号"] ?? "").trim();
  if (!id) continue;
  if (seen.has(id)) { dupInFile += 1; continue; }
  seen.add(id);
  if (kbIds.has(id)) { dupWithKb += 1; continue; }
  seq += 1;
  const rec = {};
  for (const k of FIELDS) rec[k] = k === "序号" ? seq : String(r[k] ?? "").trim();
  added.push(rec);
}

const merged = [...kb, ...added];
fs.writeFileSync(KB_PATH, JSON.stringify(merged));

const byMonth = {};
for (const r of added) {
  const m = String(r["派发时间"]).slice(0, 7) || "空";
  byMonth[m] = (byMonth[m] || 0) + 1;
}
const byStatus = {};
for (const r of added) {
  const s = r["办件状态"] || "空";
  byStatus[s] = (byStatus[s] || 0) + 1;
}
console.log("导出文件数据行:", rows.length);
console.log("文件内重复跳过:", dupInFile, "| 知识库已存在跳过:", dupWithKb);
console.log("新增写入:", added.length);
console.log("知识库:", kb.length, "→", merged.length, "| 序号", kb.length ? kb[0]["序号"] : "-", "~", seq);
console.log("新增按月:", JSON.stringify(Object.entries(byMonth).sort()));
console.log("新增按状态:", JSON.stringify(byStatus));
console.log("备份:", backup);
