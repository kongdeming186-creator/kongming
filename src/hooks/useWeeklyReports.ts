// 周报生成：从合并工单（实时接口 + 知识库历史）按自然周（周一~周日）统计
// 生成近 8 周周报（本周进行中 + 前 7 个完整周），数据随 RealDataContext 自动刷新，全部指标真实计算
import { useMemo } from 'react';
import { useRealData } from '@/contexts/RealDataContext';
import { stripCode, type RealOrder } from '@/services/dataService';

const DAY = 86_400_000;
/** 展示周数：本周 + 前 7 个完整周 = 近 8 周 */
export const WEEK_COUNT = 8;

/** 热点区域关键词（小区/片区/道路，按长度倒序优先匹配，短关键词被长关键词覆盖时去重） */
const AREA_KEYWORDS = [
  '天泽一方', '龙湖春江郦城', '华生城市广场', '紫润明园', '美好香域', '汉樾台',
  '长丰村', '长丰城', '长丰大道', '长风路', '城华路', '东风村', '天顺园', '园博园',
  '丰竹园', '正康', '团结', '百泽', '永利', '长源', '天勤', '荣荟', '新墩', '长宜', '紫润'
];

export interface WeeklyStatRow {
  name: string;
  count: number;
  pct: number;
}

export interface WeeklyKeyCase {
  id: string;
  content: string;
  category: string;
  status: string;
  acceptTime: string;
}

export interface WeeklyReportData {
  year: number;
  /** ISO 周号 */
  weekNo: number;
  /** 第36周 */
  weekLabel: string;
  /** 08.31-09.06 */
  rangeLabel: string;
  /** 2026年8月31日至9月6日 */
  fullRange: string;
  /** 报告落款日期（完整周=周日，本周=当日） */
  signDate: string;
  /** 本周进行中 */
  isCurrent: boolean;
  /** 统计天数（完整周=7，本周=已过天数） */
  days: number;
  total: number;
  completed: number;
  incomplete: number;
  resolveRate: number;
  /** 上周受理量（环比基数） */
  prevTotal: number;
  momPct: number | null;
  /** 去年同周（52 周前）受理量 */
  yoySameWeek: number;
  /** 去年同期前后 5 周（±2 周）均值 */
  yoyAvg: number;
  yoyPct: number | null;
  /** 日均受理 */
  avgPerDay: number;
  /** 事项大类分布（TOP7 + 其他/未标注合并） */
  categories: WeeklyStatRow[];
  top3Categories: string[];
  top3Pct: number;
  /** 事项小类 TOP5（+ 其他事项合并行） */
  topIssues: WeeklyStatRow[];
  top5Total: number;
  top5Pct: number;
  /** 同一诉求内容重复投诉（≥2 件）合计 */
  repeatTotal: number;
  repeatGroups: { name: string; count: number }[];
  hotAreas: { name: string; count: number }[];
  keyCases: WeeklyKeyCase[];
  /** 未办结按办理单位分布 */
  incompleteByUnit: { name: string; count: number }[];
  /** 近 WEEK_COUNT 周走势（旧→新，供趋势研判） */
  trendWeeks: { label: string; count: number }[];
}

/** 解析 'yyyy-MM-dd HH:mm:ss' */
function parseTime(s?: string): Date | null {
  if (!s || s.length < 10) return null;
  const d = new Date(s.replace(/-/g, '/'));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO 周号（周一为一周起点） */
function isoWeekNo(d: Date): number {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3); // 本周四
  const firstThu = new Date(t.getFullYear(), 0, 4);
  const fday = (firstThu.getDay() + 6) % 7;
  firstThu.setDate(firstThu.getDate() - fday + 3);
  return 1 + Math.round((t.getTime() - firstThu.getTime()) / (7 * DAY));
}

/** 所在自然周的周一 0 点 */
function weekMonday(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

const fmtMD = (t: number): string => {
  const d = new Date(t);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const fmtCN = (d: Date): string => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

const pct1 = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const changePct = (cur: number, prev: number): number | null =>
  prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;

/** 构建单周周报数据 */
function buildWeek(byWeek: Map<number, RealOrder[]>, mon: number, isCurrent: boolean, now: Date): WeeklyReportData {
  const ws = new Date(mon);
  const sun = new Date(mon + 6 * DAY);
  const days = isCurrent ? Math.max(1, Math.ceil((now.getTime() - mon) / DAY)) : 7;
  const weekOrders = byWeek.get(mon) ?? [];
  const total = weekOrders.length;
  const isDone = (o: RealOrder) => (o['办件状态'] ?? '').includes('已办结');
  const completed = weekOrders.filter(isDone).length;
  const incomplete = total - completed;

  // 环比：上周
  const prevTotal = (byWeek.get(mon - 7 * DAY) ?? []).length;
  const momPct = changePct(total, prevTotal);

  // 同比：去年同周（52 周前必为周一）+ 前后 5 周均值
  const lyMon = mon - 52 * 7 * DAY;
  const yoySameWeek = (byWeek.get(lyMon) ?? []).length;
  let yoyTotal5 = 0;
  for (let i = -2; i <= 2; i++) yoyTotal5 += (byWeek.get(lyMon + i * 7 * DAY) ?? []).length;
  const yoyAvg = Math.round(yoyTotal5 / 5);
  const yoyPct = changePct(total, yoySameWeek > 0 ? yoySameWeek : yoyAvg);

  // 事项大类分布（TOP7 + 其他合并）
  const catMap = new Map<string, number>();
  for (const o of weekOrders) {
    const c = (o['事项大类'] ?? '').trim() || '平台未标注';
    catMap.set(c, (catMap.get(c) ?? 0) + 1);
  }
  const catRows = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
  const catTop = catRows.slice(0, 7);
  const catRest = catRows.slice(7).reduce((s, [, c]) => s + c, 0);
  const categories: WeeklyStatRow[] = catTop.map(([name, count]) => ({ name, count, pct: pct1(count, total) }));
  if (catRest > 0) categories.push({ name: '其他类别', count: catRest, pct: pct1(catRest, total) });
  const top3Categories = catRows.slice(0, 3).map(([n]) => n);
  const top3Pct = total > 0 ? Math.round((catRows.slice(0, 3).reduce((s, [, c]) => s + c, 0) / total) * 1000) / 10 : 0;

  // 事项小类 TOP5 + 其他事项
  const issueMap = new Map<string, number>();
  for (const o of weekOrders) {
    const s = stripCode(o['事项小类']) || '其他';
    issueMap.set(s, (issueMap.get(s) ?? 0) + 1);
  }
  const issueRows = [...issueMap.entries()].sort((a, b) => b[1] - a[1]);
  const top5Rows = issueRows.slice(0, 5);
  const restCount = issueRows.slice(5).reduce((s, [, c]) => s + c, 0);
  const top5Total = top5Rows.reduce((s, [, c]) => s + c, 0);
  const topIssues: WeeklyStatRow[] = top5Rows.map(([name, count]) => ({ name, count, pct: pct1(count, total) }));
  if (restCount > 0) topIssues.push({ name: '其他事项', count: restCount, pct: pct1(restCount, total) });
  const top5Pct = pct1(top5Total, total);

  // 同一诉求内容重复投诉（前 40 字符分组，≥2 件）
  const repMap = new Map<string, { count: number; issue: string }>();
  for (const o of weekOrders) {
    const key = (o['诉求内容'] || o['诉求主题'] || '').trim().slice(0, 40);
    if (!key) continue;
    const cur = repMap.get(key);
    if (cur) cur.count += 1;
    else repMap.set(key, { count: 1, issue: stripCode(o['事项小类']) || '其他' });
  }
  const repEntries = [...repMap.entries()].filter(([, v]) => v.count >= 2).sort((a, b) => b[1].count - a[1].count);
  const repeatTotal = repEntries.reduce((s, [, v]) => s + v.count, 0);
  const repeatGroups = repEntries.slice(0, 3).map(([, v]) => ({ name: v.issue, count: v.count }));

  // 热点区域（长关键词优先，被覆盖的短关键词去重）
  const kwList = [...AREA_KEYWORDS].sort((a, b) => b.length - a.length);
  const areaMap = new Map<string, number>();
  for (const o of weekOrders) {
    const text = `${o['报案地址'] ?? ''}${o['诉求内容'] ?? ''}`;
    if (!text) continue;
    const seen: string[] = [];
    for (const kw of kwList) {
      if (text.includes(kw) && !seen.some((s) => s.includes(kw))) seen.push(kw);
    }
    for (const k of seen) areaMap.set(k, (areaMap.get(k) ?? 0) + 1);
  }
  const hotAreas = [...areaMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  // 重点案件：重复投诉代表件 + 未办结最新件 + 高频问题代表件
  const keyCases: WeeklyKeyCase[] = [];
  const mkCase = (o: RealOrder): WeeklyKeyCase => ({
    id: o['办件编号'] || o['市级编号'] || '—',
    content: (o['诉求内容'] || o['诉求主题'] || '').trim().slice(0, 60),
    category: stripCode(o['事项小类']) || '其他',
    status: o['办件状态'] || '未知',
    acceptTime: o['受理时间'] || ''
  });
  const repFirst = repEntries.length ? weekOrders.find((o) => (o['诉求内容'] || o['诉求主题'] || '').trim().slice(0, 40) === repEntries[0][0]) : undefined;
  if (repFirst) keyCases.push(mkCase(repFirst));
  for (const o of weekOrders.filter((x) => !isDone(x)).slice(0, 2)) {
    const c = mkCase(o);
    if (!keyCases.some((k) => k.id === c.id)) keyCases.push(c);
  }
  const topIssueFirst = weekOrders.find((o) => stripCode(o['事项小类']) === (top5Rows[0]?.[0] ?? ''));
  if (topIssueFirst) {
    const c = mkCase(topIssueFirst);
    if (!keyCases.some((k) => k.id === c.id)) keyCases.push(c);
  }

  // 未办结按办理单位
  const unitMap = new Map<string, number>();
  for (const o of weekOrders) {
    if (isDone(o)) continue;
    const u = (o['办结单位'] || o['受理部门'] || '').trim() || '未指派';
    unitMap.set(u, (unitMap.get(u) ?? 0) + 1);
  }
  const incompleteByUnit = [...unitMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  const weekNo = isoWeekNo(ws);
  return {
    year: ws.getFullYear(),
    weekNo,
    weekLabel: `第${weekNo}周`,
    rangeLabel: `${fmtMD(mon)}-${fmtMD(mon + 6 * DAY)}`,
    fullRange: `${fmtCN(ws)}至${fmtCN(sun)}`,
    signDate: isCurrent ? fmtCN(now) : fmtCN(sun),
    isCurrent,
    days,
    total,
    completed,
    incomplete,
    resolveRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
    prevTotal,
    momPct,
    yoySameWeek,
    yoyAvg,
    yoyPct,
    avgPerDay: Math.round((total / days) * 10) / 10,
    categories,
    top3Categories,
    top3Pct: top3Pct,
    topIssues,
    top5Total,
    top5Pct,
    repeatTotal,
    repeatGroups,
    hotAreas,
    keyCases,
    incompleteByUnit,
    trendWeeks: []
  };
}

/** 按自然周聚合全部工单，生成近 WEEK_COUNT 周周报（最新在前） */
function buildWeeklyReports(orders: RealOrder[]): WeeklyReportData[] {
  const byWeek = new Map<number, RealOrder[]>();
  for (const o of orders) {
    const d = parseTime(o['受理时间']);
    if (!d) continue;
    const mon = weekMonday(d).getTime();
    const arr = byWeek.get(mon);
    if (arr) arr.push(o);
    else byWeek.set(mon, [o]);
  }
  const now = new Date();
  const thisMon = weekMonday(now).getTime();
  const reports: WeeklyReportData[] = [];
  for (let i = 0; i < WEEK_COUNT; i++) {
    reports.push(buildWeek(byWeek, thisMon - i * 7 * DAY, i === 0, now));
  }
  // 走势（旧→新），挂在每份周报上
  const trendWeeks = reports
    .map((r) => ({ label: r.weekLabel, count: r.total }))
    .reverse();
  for (const r of reports) r.trendWeeks = trendWeeks;
  return reports;
}

/** 周报数据：数据就绪前返回空数组（组件显示加载态） */
export function useWeeklyReports(): { reports: WeeklyReportData[]; ready: boolean } {
  const { orders, loading } = useRealData();
  const reports = useMemo(() => (orders.length ? buildWeeklyReports(orders) : []), [orders]);
  return { reports, ready: reports.length > 0 && !loading };
}
