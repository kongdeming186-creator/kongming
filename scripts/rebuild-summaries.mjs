#!/usr/bin/env node
// 由 public/knowledge_base.json + public/data.json(实时接口) 重算两个预聚合文件
//   public/merged_summary.json  —— 「全部」口径台账：事件概览 KPI + 趋势预测月度趋势
//   public/weekly_analysis.json —— 构成分析 / 问题结构分析的 4 个切片
//
// 合并规则与前端 mergeKbWithRealtime 完全一致：按「办件编号」去重，实时覆盖历史，
// 知识库行的「派发时间」映射为「受理时间」。这样预聚合口径与前端工单池口径一致。
//
// 用法: node scripts/rebuild-summaries.mjs
import fs from "fs";
import path from "path";

const PUBLIC = path.resolve(import.meta.dirname, "../public");
const read = (f) => JSON.parse(fs.readFileSync(path.join(PUBLIC, f), "utf8"));
/** 保持各文件原有排版：merged_summary 为 2 空格缩进，weekly_analysis 为单行紧凑 */
const write = (f, data, pretty = false) =>
  fs.writeFileSync(path.join(PUBLIC, f), pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));

const kb = read("knowledge_base.json");
const rt = read("data.json");

const kbIds = new Set(kb.map((r) => String(r["办件编号"])));
const rtIds = new Set(rt.map((r) => String(r["办件编号"])));
const merged = [
  ...rt.map((r) => ({ ...r, 受理时间: r["受理时间"] || "" })),
  ...kb.filter((r) => !rtIds.has(String(r["办件编号"]))).map((r) => ({ ...r, 受理时间: r["派发时间"] || "" })),
];

const isDone = (s) => String(s || "").includes("已办结");
const total = merged.length;
const completed = merged.filter((o) => isDone(o["办件状态"])).length;

/** 按字段分组取 TOP N（value 字段名可用 value/count/total） */
function topN(field, n, valueKey) {
  const map = new Map();
  for (const o of merged) {
    const k = String(o[field] ?? "").trim();
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, c]) => ({ name, [valueKey]: c }));
}

/** 科室名归一：'长丰街道,[长丰街]公管办' / '[长丰街]执法中队(非参评)' → '公管办' / '执法中队'
    与 dataService.buildPeriodSlices 保持一致；未填科室的工单按街道口径并入「公共管理办公室」 */
function normDept(o) {
  const raw = String(o["办理科室"] || o["办结单位"] || o["受理部门"] || "").trim();
  if (!raw) return "公共管理办公室";
  const seg = raw.split(",").filter(Boolean).pop() ?? "";
  const m = seg.match(/\]\s*(.+)$/);
  const name = (m ? m[1] : seg).replace(/\(非参评\)/g, "").replace(/_/g, "").trim();
  return !name || /^长丰街(道)?$/.test(name) ? "公共管理办公室" : name;
}

// ── 月度趋势 ──
const monthMap = new Map();
for (const o of merged) {
  const m = String(o["受理时间"]).slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(m)) continue;
  monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
}
const monthlyTrend = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, t]) => ({ month, total: t }));

// ── 区域分布：沿用 scripts/analyze_areas.py 的关键词口径，首个命中即计入 ──
const AREA_KEYWORDS = [
  "长风路", "长丰大道", "长丰村", "长丰城", "城华路", "华生南区", "华生北区", "丰美路", "丰竹园",
  "紫润", "紫华路", "东风村", "东风大道", "长天路", "天顺园", "园博园", "园博",
  "正康", "团结", "百泽", "永利", "长源", "天勤", "新墩", "长宜", "长宁", "荣荟",
  "古田", "汉口", "汉江湾", "解放大道", "南泥湾", "古田一路", "古田二路", "古田三路", "古田四路", "古田五路",
];
const areaMap = new Map();
for (const o of merged) {
  const text = `${o["诉求内容"] ?? ""} ${o["诉求主题"] ?? ""} ${o["办理单位"] ?? ""} ${o["诉求人"] ?? ""}`;
  const hit = AREA_KEYWORDS.find((kw) => text.includes(kw));
  if (hit) areaMap.set(hit, (areaMap.get(hit) ?? 0) + 1);
}
const areaDistribution = [...areaMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

// ── merged_summary.json ──
const prevMerged = read("merged_summary.json");
const mergedSummary = {
  total,
  completed,
  incomplete: total - completed,
  completion_rate: total ? Math.round((completed / total) * 10000) / 100 : 0,
  monthly_trend: monthlyTrend,
  top_issues: topN("事项小类", 10, "count"),
  top_categories: topN("事项大类", 5, "count"),
  area_distribution: areaDistribution,
  data_sources: {
    historical_dedup: kb.filter((r) => !rtIds.has(String(r["办件编号"]))).length,
    historical_nocode: kb.filter((r) => !String(r["市级编号"] || "").trim()).length,
    realtime_overlap: rt.filter((r) => kbIds.has(String(r["办件编号"]))).length,
    realtime_new: rt.filter((r) => !kbIds.has(String(r["办件编号"]))).length,
  },
  dedup_strategy: "办件编号去重，实时覆盖历史",
  generated_at: new Date().toISOString().slice(0, 16).replace("T", " "),
};
// 保留历史遗留但未被消费的字段，避免前端读取时缺键
for (const k of Object.keys(prevMerged)) if (!(k in mergedSummary)) mergedSummary[k] = prevMerged[k];
write("merged_summary.json", mergedSummary, true);

// ── weekly_analysis.json：只重算被消费的 4 个切片 + 周报摘要 ──
const wa = read("weekly_analysis.json");
wa.high_freq_issues_pie = topN("事项小类", 8, "value").map(({ name, value }) => ({ name, value }));
wa.category_pie = topN("事项大类", 5, "value").map(({ name, value }) => ({ name, value }));
const cityMgmt = merged.filter((o) => String(o["事项大类"] || "").trim() === "城市市容管理类").length;
const catKnown = merged.filter((o) => String(o["事项大类"] || "").trim()).length;
wa.city_mgmt_pie = [
  { name: "城市市容管理类", value: cityMgmt },
  { name: "其他类别", value: catKnown - cityMgmt },
];
const deptMap = new Map();
for (const o of merged) {
  const d = normDept(o);
  deptMap.set(d, (deptMap.get(d) ?? 0) + 1);
}
wa.dept_pie = [...deptMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

// 周报摘要：以数据最新受理时间向前 7 天为「本周」，再往前 7 天为「上周」
const DAY = 86_400_000;
const maxT = merged.reduce((a, o) => (String(o["受理时间"]) > a ? String(o["受理时间"]) : a), "");
if (maxT) {
  const end = new Date(maxT.replace(/-/g, "/"));
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const win = (fromOffset, toOffset) => {
    const from = fmt(new Date(end.getTime() - fromOffset * DAY));
    const to = fmt(new Date(end.getTime() - toOffset * DAY));
    const rows = merged.filter((o) => {
      const d = String(o["受理时间"]).slice(0, 10);
      return d >= from && d <= to;
    });
    const done = rows.filter((o) => isDone(o["办件状态"])).length;
    return { from, to, total: rows.length, completed: done, incomplete: rows.length - done, rows };
  };
  const cur = win(6, 0);
  const prev = win(13, 7);
  const issueMap = new Map();
  for (const o of cur.rows) {
    const k = String(o["事项小类"] ?? "").trim();
    if (!k) continue;
    issueMap.set(k, (issueMap.get(k) ?? 0) + 1);
  }
  wa.weekly_report = {
    week_of: cur.from,
    to: cur.to,
    this_week: { total: cur.total, completed: cur.completed, incomplete: cur.incomplete },
    last_week: { total: prev.total, completed: prev.completed, incomplete: prev.incomplete },
    change: { total: cur.total - prev.total, completed: cur.completed - prev.completed },
    top_issues_this_week: [...issueMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
  };
}
write("weekly_analysis.json", wa);

console.log("工单池:", kb.length, "KB +", rt.length, "实时 −", rt.length + kb.length - merged.length, "重复 =", merged.length);
console.log("merged_summary:", JSON.stringify({ total, completed, incomplete: total - completed, rate: mergedSummary.completion_rate, months: monthlyTrend.length }));
console.log("月度尾部:", JSON.stringify(monthlyTrend.slice(-4)));
console.log("weekly_analysis 切片:", JSON.stringify({
  高频问题: wa.high_freq_issues_pie.slice(0, 3),
  事项大类: wa.category_pie.slice(0, 3),
  大城管: wa.city_mgmt_pie,
  科室: wa.dept_pie.slice(0, 3),
}));
console.log("周报:", JSON.stringify(wa.weekly_report?.this_week), "week_of", wa.weekly_report?.week_of, "~", wa.weekly_report?.to);
