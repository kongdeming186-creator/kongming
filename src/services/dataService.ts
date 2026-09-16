// 真实数据服务层：加载构建时生成的静态工单数据，并转换为大屏各模块所需统计
import { COMMUNITIES, type CommunityInfo } from '@/data/communities';
import type { CaseRecord, IncomingOrder, TrendScenario } from '@/data/mockData';
import { DEPT_OF, type EventCategory, type HazardEvent } from '@/data/eventData';

// 热线工单数据：构建时由 scripts/fetch-real-data.js 拉取并解析为静态 JSON
const BASE_URL = (import.meta.env.BASE_URL as string) || '/';
export const DATA_API_URL = `${BASE_URL}data.json`;

/** 自动刷新间隔（毫秒） */
export const REFRESH_INTERVAL_MS = 60_000;

/** 单次请求超时（毫秒） */
const FETCH_TIMEOUT_MS = 20_000;

/** 接口返回的 19 个字段（中文表头，xlsx 按第一行解析） */
export interface RealOrder {
  '办件编号': string;
  '市级编号'?: string;
  '区级编号'?: string;
  '事项大类'?: string;
  '事项小类'?: string;
  '诉求主题'?: string;
  '诉求内容'?: string;
  '事件来源'?: string;
  '诉求人'?: string;
  '诉求人手机号'?: string;
  '报案地址'?: string;
  '受理时间'?: string;
  '承诺时间'?: string;
  '完成时间'?: string;
  '标签'?: string;
  '受理部门'?: string;
  '办结单位'?: string;
  '处理结果'?: string;
  '办件状态'?: string;
  '用户评价'?: string;
}

/** 单个时间范围统计 */
export interface RangeStat {
  total: number;
  unfinished: number;
  resolveRate: number;
}

/** 社区真实统计（覆盖 communities.ts 静态配置中的 mock 业务字段） */
export interface CommunityStat {
  orders: number;
  recent90d: number;
  recent30d: number;
  riskLevel: 'high' | 'mid' | 'low';
  riskScore: number;
  dangerIdx: number;
  topIssues: { name: string; count: number; ratio: number }[];
  resolveRate: number;
  avgPendingDays: number;
  trend: number;
}

/** KPI 环比（最新月 vs 上月） */
export interface KpiTrend {
  totalPct: number;
  unfinishedPct: number;
  resolvePct: number;
}

/** 历史数据汇总（14,779 条历史工单，2024.10-2026.08） */
export interface HistorySummary {
  total: number;
  resolved: number;
  pending: number;
  completion_rate: number;
  time_range: { start: string; end: string };
  monthly_trend: { month: string; total: number; resolved: number; pending: number }[];
  top_issues: { name: string; count: number }[];
  category_distribution: { name: string; count: number }[];
  area_distribution: { name: string; count: number }[];
  status_distribution: { name: string; count: number }[];
  generated_at: string;
}

/** 加载历史数据汇总（一次性，失败返回 null 由组件回退实时数据） */
export async function loadHistorySummary(): Promise<HistorySummary | null> {
  try {
    const res = await fetch(`${BASE_URL}history_summary.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as HistorySummary;
  } catch {
    return null;
  }
}

/** 趋势预测预警数据（未诉先办） */
export interface TrendPrediction {
  seasonal_peak: { month: string; total: number; index: number; description: string };
  category_concentration: { category: string; month: string; percentage: number; description: string };
  next_week_forecast: { period: string; category: string; predicted_count: number; increase_percentage: number; reason: string; description: string };
  composite_scenario: { scenario: string; multiplier: number; description: string; suggestions: string[] };
  monthly_seasonal_index: Record<string, number>;
  generated_at: string;
}

/** 加载趋势预测预警数据（一次性，失败返回 null） */
export async function loadTrendPrediction(): Promise<TrendPrediction | null> {
  try {
    const res = await fetch(`${BASE_URL}trend_prediction.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as TrendPrediction;
  } catch {
    return null;
  }
}

/** 合并数据汇总（历史 Excel 去重 14,517 + 无编号 5 + 实时新增 300 = 14,822 条；市级编号去重、实时覆盖历史） */
export interface MergedSummary {
  total: number;
  completed: number;
  incomplete: number;
  completion_rate: number;
  monthly_trend: { month: string; total: number }[];
  top_issues: { name: string; count: number }[];
  top_categories: { name: string; count: number }[];
  area_distribution: { name: string; count: number }[];
  data_sources: { historical_dedup: number; historical_nocode: number; realtime_overlap: number; realtime_new: number };
  dedup_strategy: string;
  generated_at: string;
}

/** 合并数据兜底基准（字面量内联进 bundle：总量 14,822 / 已办结 14,519 / 未办结 303 / 办结率 97.96%） */
export const MERGED_SUMMARY_FALLBACK: MergedSummary = {
  total: 14822,
  completed: 14519,
  incomplete: 303,
  completion_rate: 97.96,
  monthly_trend: [
    { month: '2024-10', total: 3 }, { month: '2024-11', total: 15 }, { month: '2024-12', total: 300 },
    { month: '2025-01', total: 564 }, { month: '2025-02', total: 329 }, { month: '2025-03', total: 531 },
    { month: '2025-04', total: 575 }, { month: '2025-05', total: 806 }, { month: '2025-06', total: 881 },
    { month: '2025-07', total: 755 }, { month: '2025-08', total: 868 }, { month: '2025-09', total: 893 },
    { month: '2025-10', total: 889 }, { month: '2025-11', total: 880 }, { month: '2025-12', total: 703 },
    { month: '2026-01', total: 539 }, { month: '2026-02', total: 345 }, { month: '2026-03', total: 606 },
    { month: '2026-04', total: 699 }, { month: '2026-05', total: 759 }, { month: '2026-06', total: 1324 },
    { month: '2026-07', total: 1092 }, { month: '2026-08', total: 466 },
  ],
  top_issues: [
    { name: '占道经营', count: 843 }, { name: '商业噪音问题', count: 633 }, { name: '公共设施建设规划', count: 617 },
    { name: '009.商业噪音问题', count: 577 }, { name: '共享单车管理', count: 550 }, { name: '012.占道经营', count: 549 },
    { name: '业主委员会', count: 464 }, { name: '生活噪声问题', count: 419 }, { name: '008.生活噪声问题', count: 373 },
    { name: '油烟污染', count: 360 },
  ],
  top_categories: [
    { name: '城市市容管理类', count: 7289 }, { name: '社会服务类', count: 2069 }, { name: '房屋土地管理类', count: 1629 },
    { name: '建设管理类', count: 882 }, { name: '交通管理类', count: 644 },
  ],
  area_distribution: [
    { name: '古田', count: 1850 }, { name: '长丰大道', count: 903 }, { name: '城华路', count: 838 }, { name: '汉口', count: 829 },
    { name: '丰美路', count: 570 }, { name: '长风路', count: 276 }, { name: '紫华路', count: 104 }, { name: '长天路', count: 14 },
  ],
  data_sources: { historical_dedup: 14517, historical_nocode: 5, realtime_overlap: 225, realtime_new: 300 },
  dedup_strategy: '市级编号去重，实时覆盖历史',
  generated_at: '2026-09-03 10:14:06',
};

/** 加载合并数据汇总（优先运行时 fetch；HTTP 非 200 或网络异常时回退内联兜底基准，保证概览不归零） */
export async function loadMergedSummary(): Promise<MergedSummary> {
  try {
    const res = await fetch(`${BASE_URL}merged_summary.json`);
    if (!res.ok) {
      console.warn(`[merged_summary] HTTP ${res.status}，使用内联兜底基准数据`);
      return MERGED_SUMMARY_FALLBACK;
    }
    const data = await res.json();
    console.log('[DataService] merged_summary loaded:', data?.total);
    return data as MergedSummary;
  } catch (e) {
    console.warn('[merged_summary] 加载失败，使用内联兜底基准数据', e);
    return MERGED_SUMMARY_FALLBACK;
  }
}

/** 历史数据 → TOP10 高频问题（count → value） */
export function historyTopIssues(h: HistorySummary) {
  return h.top_issues.map((i) => ({ name: i.name, value: i.count }));
}

/** 历史数据 → 月度趋势（total → value，峰值标注最大月） */
export function historyMonthlyTrend(h: HistorySummary) {
  const max = Math.max(...h.monthly_trend.map((m) => m.total));
  return h.monthly_trend.map((m) => ({ month: m.month, value: m.total, peak: m.total === max }));
}

/** 历史数据 → 重点区域特征（area_distribution TOP3 + 高频问题占比） */
export function historyRegionFeatures(h: HistorySummary) {
  const top3 = h.area_distribution.slice(0, 3);
  const issues = h.top_issues.slice(0, 3);
  const total = issues.reduce((s, i) => s + i.count, 0) || 1;
  return top3.map((r) => ({
    region: r.name,
    community: r.name,
    issues: issues.map((it) => ({ name: it.name, ratio: Math.round((it.count / total) * 100) })),
  }));
}

/** 历史数据 → 高风险区域 TOP5（按 area_distribution 计数排序） */
export function historyHighRiskTop5(h: HistorySummary) {
  return h.area_distribution.slice(0, 5).map((r) => ({ region: r.name, community: r.name, score: r.count }));
}

/** 历史数据 → 大类环比标签（最新月 vs 上月，基于 category_distribution 无法拆月，改用相邻月总量环比近似） */
export function historyTrendTags(h: HistorySummary) {
  const months = h.monthly_trend;
  if (months.length < 2) return [];
  const cur = months[months.length - 1];
  const prev = months[months.length - 2];
  const change = prev.total ? Math.round(((cur.total - prev.total) / prev.total) * 100) : 0;
  return [{ name: '工单总量', change: Math.abs(change), direction: (change >= 0 ? 'up' : 'down') as 'up' | 'down' }];
}

/* ============================== 合并数据 → 统计模块适配 ============================== */

/** 合并数据 → TOP10 高频问题（count → value） */
export function mergedTopIssues(m: MergedSummary) {
  return m.top_issues.map((i) => ({ name: i.name, value: i.count }));
}

/** 合并数据 → 月度趋势（total → value，峰值标注最大月） */
export function mergedMonthlyTrend(m: MergedSummary) {
  const max = Math.max(...m.monthly_trend.map((x) => x.total));
  return m.monthly_trend.map((x) => ({ month: x.month, value: x.total, peak: x.total === max }));
}

/** 合并数据 → 月均工单量 */
export function mergedMonthlyAvg(m: MergedSummary) {
  return Math.round((m.total / Math.max(m.monthly_trend.length, 1)) * 10) / 10;
}

/** 合并数据 → 重点区域特征（area_distribution TOP3 + 高频问题占比） */
export function mergedRegionFeatures(m: MergedSummary) {
  const top3 = m.area_distribution.slice(0, 3);
  const issues = m.top_issues.slice(0, 3);
  const total = issues.reduce((s, i) => s + i.count, 0) || 1;
  return top3.map((r) => ({
    region: r.name,
    community: r.name,
    issues: issues.map((it) => ({ name: it.name, ratio: Math.round((it.count / total) * 100) })),
  }));
}

/** 合并数据 → 重点区域 TOP5（按 area_distribution 计数） */
export function mergedHighRiskTop5(m: MergedSummary) {
  return m.area_distribution.slice(0, 5).map((r) => ({ region: r.name, community: r.name, score: r.count }));
}

/** 合并数据 → 环比标签（最新月 vs 上月） */
export function mergedTrendTags(m: MergedSummary) {
  const months = m.monthly_trend;
  if (months.length < 2) return [];
  const cur = months[months.length - 1];
  const prev = months[months.length - 2];
  const change = prev.total ? Math.round(((cur.total - prev.total) / prev.total) * 100) : 0;
  return [{ name: '工单总量', change: Math.abs(change), direction: (change >= 0 ? 'up' : 'down') as 'up' | 'down' }];
}

/** 合并数据 → 数据时间范围（'2024-10' → '2024.10'） */
export function mergedDataRange(m: MergedSummary) {
  const fmt = (s?: string) => (s ? s.replace('-', '.') : '');
  return `${fmt(m.monthly_trend[0]?.month)} - ${fmt(m.monthly_trend[m.monthly_trend.length - 1]?.month)}`;
}

export interface DashboardData {
  rangeStats: Record<'week' | 'month' | 'quarter' | 'year' | 'all', RangeStat>;
  kpiTrend: KpiTrend;
  cityOps: { total: number; unfinished: number; overdue: number; totalTrendPct: number; overdueTrendPct: number };
  rework: { reworkTotal: number; ratio: number; breakdown: { type: string; count: number; percent: number; color: string }[] };
  top10Issues: { name: string; value: number }[];
  categoryPie: { name: string; value: number }[];
  categoryDist: { name: string; value: number }[];
  regionFeatures: { region: string; community: string; issues: { name: string; ratio: number }[] }[];
  monthlyTrend: { month: string; value: number; peak: boolean }[];
  monthlyAvg: number;
  highRiskTop5: { region: string; community: string; score: number }[];
  trendTags: { name: string; change: number; direction: 'up' | 'down' }[];
  seasonAlert: { season: string; period: string; predictedOrders: number; focusIssues: string[]; reason: string };
  scenarios: TrendScenario[];
  hazardEvents: HazardEvent[];
  recentEvents: HazardEvent[];
  livePool: HazardEvent[];
  caseLibrary: CaseRecord[];
  communityStats: Record<string, CommunityStat>;
  feedPool: IncomingOrder[];
  complainants: { ge5: number; ge10: number; top: { alias: string; times: number; mainIssue: string; community: string }[] };
  dataRange: string;
}

/** 拉取并解析接口 Excel 为工单数组 */
export async function fetchRealOrders(signal?: AbortSignal): Promise<RealOrder[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(DATA_API_URL, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`数据文件请求失败（HTTP ${res.status}）`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('数据文件为空');
    return rows as RealOrder[];
  } finally {
    clearTimeout(timer);
  }
}

/* ============================== 基础工具 ============================== */

/** 解析 '2026-08-22 16:20:57' 格式时间 */
function parseTime(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s.replace(/-/g, '/'));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** '003.异味污染问题' → '异味污染问题' */
export function stripCode(s?: string): string {
  return (s || '').replace(/^\d+\./, '').trim();
}

/** 从诉求内容中提取报案地址（只返回精确匹配的地址，不兜底） */
function extractAddress(content: string): string {
  if (!content) return '';
  const text = content.trim();
  // 精确匹配地址模式，不匹配则返回空
  const patterns = [
    // XX区XX路XX号XX栋XX单元XX号
    /([\u4e00-\u9fa5]{2,4}区[\u4e00-\u9fa5]{2,12}(?:路|道|街|巷)\d+号\d*栋?\d*单元?\d*号?)/,
    // XX路XX号 + 栋/单元/号
    /([\u4e00-\u9fa5]{2,12}(?:路|道|街|巷)\d+号\d*栋?\d*单元?\d*号?)/,
    // XX小区/公寓/广场/花园 + 栋/单元/号
    /([\u4e00-\u9fa5]{2,12}(?:小区|公寓|广场|花园|明园|郦城|新城|华园|苑|里|湾|府|居)\d*栋?\d*单元?\d*号?)/,
    // XX村/队 + 号
    /([\u4e00-\u9fa5]{2,10}(?:村|队|组)\d+号)/,
    // 硚口区XX街XX
    /([\u4e00-\u9fa5]{2,4}区[\u4e00-\u9fa5]{2,10}(?:街|道|路)\d*号?)/,
    // 栋单元号
    /(\d+栋\d+单元\d+号)/,
    /(\d+号楼)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].length >= 4) return m[1].trim();
  }
  return '';
}

/** 事项大类 → 地图点位事件类型 */
const BIG_TO_CATEGORY: Record<string, EventCategory> = {
  城市市容管理类: '城管',
  房屋土地管理类: '物业',
  社会服务类: '民生',
  建设管理类: '规划',
  社会治安管理: '安全',
  园林绿化类: '环保',
  公共设施维护管理: '市政',
  市场管理类: '城管',
  社会劳动保障管理类: '民生',
  交通管理类: '交通',
  食品药品及医疗卫生管理类: '民生',
  安全生产管理类: '安全',
  三农问题: '民生',
  教育管理类: '民生',
  纪检监察: '民生',
  政务服务: '民生'
};

function categoryOf(big?: string): EventCategory {
  return BIG_TO_CATEGORY[(big || '').trim()] ?? '民生';
}

/** 区域关键词 → 社区（按优先级匹配诉求内容/主题） */
const REGION_KEYWORDS: [string, string][] = [
  ['天泽一方', '天顺园北社区'],
  ['龙湖春江郦城', '紫润南社区'],
  ['紫润明园', '紫润北社区'],
  ['紫润', '紫润北社区'],
  ['长丰村', '长丰社区'],
  ['长丰城', '长丰社区'],
  ['长丰大道', '长丰社区'],
  ['长风路', '长顺社区'],
  ['城华路', '长顺社区'],
  ['东风村', '东风社区'],
  ['东风大道', '东风社区'],
  ['天顺园', '天顺园北社区'],
  ['园博园', '园博南社区'],
  ['丰竹园', '丰竹园社区'],
  ['正康', '正康社区'],
  ['团结', '团结社区'],
  ['百泽', '百泽社区'],
  ['永利', '永利社区'],
  ['长源', '长源社区'],
  ['天勤', '天勤社区'],
  ['汉樾台', '天勤社区'],
  ['荣荟', '荣荟社区'],
  ['新墩', '新墩社区'],
  ['长宁', '长宁社区'],
  ['长宜', '长宜社区']
];

const COMMUNITY_BY_NAME: Record<string, CommunityInfo> = Object.fromEntries(
  COMMUNITIES.map((c) => [c.name, c])
);

/** 从诉求内容/主题提取所属社区（未匹配返回 null） */
function matchCommunity(order: RealOrder): CommunityInfo | null {
  const text = `${order['诉求内容'] || ''}${order['诉求主题'] || ''}`;
  for (const [kw, name] of REGION_KEYWORDS) {
    if (kw && text.includes(kw)) return COMMUNITY_BY_NAME[name] ?? null;
  }
  return null;
}

/** 黄金角螺旋偏移（确定性，lng 方向 0.92 压缩保持视觉正圆） */
function spiralPoint(centerLng: number, centerLat: number, i: number, count: number, maxDeg: number) {
  const ang = ((((i * 137.508) % 360) + (i % 7) * 23) * Math.PI) / 180;
  const r = 0.00045 + (maxDeg - 0.00045) * Math.sqrt((i + 0.5) / Math.max(count, 1));
  return {
    lng: +(centerLng + r * Math.cos(ang) * 0.92).toFixed(6),
    lat: +(centerLat + r * Math.sin(ang)).toFixed(6)
  };
}

const pct = (a: number, b: number): number => (b > 0 ? Math.round(((a - b) / b) * 1000) / 10 : 0);
const rate1 = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export const REWORK_COLORS = ['#ff4757', '#ffa502', '#ffd32a', '#2ed573', '#a55eea', '#576574'];

/* ============================== 主构建函数 ============================== */

/** 将接口工单数组转换为大屏全量统计数据 */
export function buildDashboardData(orders: RealOrder[]): DashboardData {
  const refTime = orders.reduce<Date | null>((acc, o) => {
    const d = parseTime(o['受理时间']);
    if (!d) return acc;
    return !acc || d > acc ? d : acc;
  }, null) ?? new Date();

  const withTime = orders
    .map((o) => ({ order: o, t: parseTime(o['受理时间']) }))
    .filter((x) => x.t !== null) as { order: RealOrder; t: Date }[];
  const sorted = [...withTime].sort((a, b) => b.t.getTime() - a.t.getTime());
  const minTime = sorted.length ? sorted[sorted.length - 1].t : refTime;

  const isUnfinished = (o: RealOrder) => (o['办件状态'] || '').includes('未办结');
  const dayDiff = (a: Date, b: Date) => Math.max(0, Math.round((a.getTime() - b.getTime()) / 86_400_000));
  const days30 = 30 * 86_400_000;
  const days90 = 90 * 86_400_000;

  /* ---------- 1. 时间范围统计（以数据最新受理时间为基准） ---------- */
  const rangeOf = (pred: (d: Date) => boolean): RangeStat => {
    const sub = withTime.filter((x) => pred(x.t));
    const total = sub.length;
    const unfinished = sub.filter((x) => isUnfinished(x.order)).length;
    return { total, unfinished, resolveRate: total ? Math.round(((total - unfinished) / total) * 10000) / 100 : 0 };
  };
  const rangeStats = {
    week: rangeOf((d) => d.getTime() >= refTime.getTime() - 7 * 86_400_000),
    month: rangeOf((d) => d.getFullYear() === refTime.getFullYear() && d.getMonth() === refTime.getMonth()),
    quarter: rangeOf(
      (d) => d.getFullYear() * 4 + Math.floor(d.getMonth() / 3) === refTime.getFullYear() * 4 + Math.floor(refTime.getMonth() / 3)
    ),
    year: rangeOf((d) => d.getFullYear() === refTime.getFullYear()),
    all: rangeOf(() => true)
  };

  /* ---------- 2. KPI 环比（最新月 vs 上月） ---------- */
  const y = refTime.getFullYear();
  const m = refTime.getMonth();
  const prev = new Date(y, m - 1, 1);
  const curStats = rangeOf((d) => d.getFullYear() === y && d.getMonth() === m);
  const prevStats = rangeOf((d) => d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth());
  const kpiTrend: KpiTrend = {
    totalPct: pct(curStats.total, prevStats.total),
    unfinishedPct: pct(curStats.unfinished, prevStats.unfinished),
    resolvePct: pct(curStats.resolveRate, prevStats.resolveRate)
  };

  /* ---------- 3. 城运事件（复用热线口径） ---------- */
  const overdue = withTime.filter(
    (x) => isUnfinished(x.order) && parseTime(x.order['承诺时间']) && (parseTime(x.order['承诺时间']) as Date) < refTime
  ).length;
  const recent30 = withTime.filter((x) => x.t.getTime() >= refTime.getTime() - days30);
  const prev30 = withTime.filter((x) => x.t.getTime() >= refTime.getTime() - 2 * days30 && x.t.getTime() < refTime.getTime() - days30);
  const overdue30 = recent30.filter(
    (x) => isUnfinished(x.order) && parseTime(x.order['承诺时间']) && (parseTime(x.order['承诺时间']) as Date) < refTime
  ).length;
  const overdue30prev = prev30.filter(
    (x) => isUnfinished(x.order) && parseTime(x.order['承诺时间']) && (parseTime(x.order['承诺时间']) as Date) < refTime
  ).length;
  const cityOps = {
    total: rangeStats.all.total,
    unfinished: rangeStats.all.unfinished,
    overdue,
    totalTrendPct: pct(recent30.length, prev30.length),
    overdueTrendPct: pct(overdue30, overdue30prev)
  };

  /* ---------- 4. 高频小类 TOP10 / 重办件 TOP6 / 大类分布 ---------- */
  const smallCounter = new Map<string, number>();
  const bigCounter = new Map<string, number>();
  for (const { order } of withTime) {
    const s = stripCode(order['事项小类']) || '其他';
    const b = (order['事项大类'] || '其他').trim();
    smallCounter.set(s, (smallCounter.get(s) ?? 0) + 1);
    bigCounter.set(b, (bigCounter.get(b) ?? 0) + 1);
  }
  const smallTop = [...smallCounter.entries()].sort((a, b) => b[1] - a[1]);
  const top10Issues = smallTop.slice(0, 10).map(([name, value]) => ({ name, value }));

  const reworkTop6 = smallTop.slice(0, 6);
  const reworkTotal = reworkTop6.reduce((s, [, v]) => s + v, 0);
  const rework = {
    reworkTotal,
    ratio: rate1(reworkTotal, rangeStats.all.total),
    breakdown: reworkTop6.map(([type, count], i) => ({
      type,
      count,
      percent: rate1(count, rangeStats.all.total),
      color: REWORK_COLORS[i % REWORK_COLORS.length]
    }))
  };

  const bigTop = [...bigCounter.entries()].sort((a, b) => b[1] - a[1]);
  const categoryDist = bigTop.map(([name, value]) => ({ name, value }));
  const pieTop5 = bigTop.slice(0, 5);
  const pieOther = bigTop.slice(5).reduce((s, [, v]) => s + v, 0);
  const categoryPie = [
    ...pieTop5.map(([name, value]) => ({ name: name.replace(/类$/, ''), value: rate1(value, rangeStats.all.total) })),
    { name: '其他', value: rate1(pieOther, rangeStats.all.total) }
  ];

  /* ---------- 5. 月度趋势 ---------- */
  const monthCounter = new Map<string, number>();
  for (const { t } of withTime) {
    const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
    monthCounter.set(key, (monthCounter.get(key) ?? 0) + 1);
  }
  const monthKeys = [...monthCounter.keys()].sort();
  const monthMax = Math.max(...monthCounter.values());
  const monthlyTrend = monthKeys.map((month) => ({ month, value: monthCounter.get(month) ?? 0, peak: monthCounter.get(month) === monthMax }));
  const monthlyAvg = Math.round((rangeStats.all.total / Math.max(monthKeys.length, 1)) * 10) / 10;

  /* ---------- 6. 区域匹配（社区/重点区域） ---------- */
  const matched = sorted.map((x) => ({ ...x, community: matchCommunity(x.order) }));
  const regionCounter = new Map<string, { count: number; community: string; issues: Map<string, number> }>();
  for (const { order, community } of matched) {
    if (!community) continue;
    const regionKey = REGION_KEYWORDS.find(([kw]) =>
      `${order['诉求内容'] || ''}${order['诉求主题'] || ''}`.includes(kw)
    )?.[0];
    if (!regionKey) continue;
    const entry = regionCounter.get(regionKey) ?? { count: 0, community: community.name, issues: new Map<string, number>() };
    entry.count += 1;
    const issue = stripCode(order['事项小类']) || '其他';
    entry.issues.set(issue, (entry.issues.get(issue) ?? 0) + 1);
    regionCounter.set(regionKey, entry);
  }
  const regionTop = [...regionCounter.entries()].sort((a, b) => b[1].count - a[1].count);
  const regionFeatures = regionTop.slice(0, 4).map(([region, e]) => ({
    region,
    community: e.community,
    issues: [...e.issues.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, c]) => ({ name, ratio: Math.round((c / e.count) * 100) }))
  }));
  const regionMax = regionTop[0]?.[1].count ?? 1;
  const highRiskTop5 = regionTop.slice(0, 5).map(([region, e]) => ({
    region,
    community: e.community,
    score: Math.round((e.count / regionMax) * 100)
  }));

  /* ---------- 7. 大类环比标签（最新月 vs 上月） ---------- */
  const bigOfMonth = (yy: number, mm: number) => {
    const c = new Map<string, number>();
    for (const { order, t } of withTime) {
      if (t.getFullYear() === yy && t.getMonth() === mm) {
        const b = (order['事项大类'] || '其他').trim();
        c.set(b, (c.get(b) ?? 0) + 1);
      }
    }
    return c;
  };
  const bigCur = bigOfMonth(y, m);
  const bigPrev = bigOfMonth(prev.getFullYear(), prev.getMonth());
  const trendTags = [...new Set([...bigCur.keys(), ...bigPrev.keys()])]
    .map((name) => {
      const a = bigCur.get(name) ?? 0;
      const b = bigPrev.get(name) ?? 0;
      return { name, a, b, change: b > 0 ? pct(a, b) : a > 0 ? 999 : 0 };
    })
    .filter((x) => x.a + x.b >= 4)
    .sort((x, z) => z.change - x.change)
    .slice(0, 3)
    .map((x) => ({ name: x.name, change: x.change, direction: (x.change >= 0 ? 'up' : 'down') as 'up' | 'down' }));

  /* ---------- 8. 季节预警（下月预测：近3月均值与去年同期均值折中） ---------- */
  const last3 = monthKeys.slice(-3).map((k) => monthCounter.get(k) ?? 0);
  const avg3 = last3.reduce((s, v) => s + v, 0) / Math.max(last3.length, 1);
  const nextMonth = new Date(y, m + 1, 1);
  const sameLastYear = monthCounter.get(`${nextMonth.getFullYear() - 1}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`) ?? avg3;
  const predictedOrders = Math.round((avg3 + sameLastYear) / 2);
  const focusIssues = smallTop.slice(0, 2).map(([name]) => name);
  const seasonAlert = {
    season: ['春', '夏', '秋', '冬'][Math.floor(((nextMonth.getMonth() + 1) % 12) / 3)],
    period: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`,
    predictedOrders,
    focusIssues,
    reason: `${m + 1}月工单 ${curStats.total} 件（环比 ${kpiTrend.totalPct >= 0 ? '+' : ''}${kpiTrend.totalPct}%），${trendTags[0]?.name ?? '热点大类'}诉求集中，需提前部署应对`
  };

  /* ---------- 9. 复合场景模拟（增幅基于真实月度数据推算） ---------- */
  const avgAll = rangeStats.all.total / Math.max(monthKeys.length, 1);
  const baseGrowth = Math.round((avg3 / Math.max(avgAll, 1) - 1) * 100);
  const big90 = new Map<string, number>();
  for (const { order, t } of withTime) {
    if (t.getTime() >= refTime.getTime() - days90) {
      const b = (order['事项大类'] || '其他').trim();
      big90.set(b, (big90.get(b) ?? 0) + 1);
    }
  }
  const big90Top = [...big90.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  const scenarios = buildScenarios(baseGrowth, big90Top, smallTop.slice(0, 3).map(([n]) => n));

  /* ---------- 10. 社区真实统计 ---------- */
  const communityStats: Record<string, CommunityStat> = {};
  for (const c of COMMUNITIES) {
    const sub = matched.filter((x) => x.community?.name === c.name);
    const recent90 = sub.filter((x) => x.t.getTime() >= refTime.getTime() - days90).length;
    const recent30c = sub.filter((x) => x.t.getTime() >= refTime.getTime() - days30).length;
    const prev30c = sub.filter((x) => x.t.getTime() >= refTime.getTime() - 2 * days30 && x.t.getTime() < refTime.getTime() - days30).length;
    const issueMap = new Map<string, number>();
    for (const { order } of sub) {
      const s = stripCode(order['事项小类']) || '其他';
      issueMap.set(s, (issueMap.get(s) ?? 0) + 1);
    }
    const done = sub.filter((x) => !isUnfinished(x.order)).length;
    const pendingDays = sub.filter((x) => isUnfinished(x.order)).map((x) => dayDiff(refTime, x.t));
    communityStats[c.name] = {
      orders: sub.length,
      recent90d: recent90,
      recent30d: recent30c,
      riskLevel: recent90 >= 5 ? 'high' : recent90 >= 2 ? 'mid' : 'low',
      riskScore: 0,
      dangerIdx: 0,
      topIssues: [...issueMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count, ratio: Math.round((count / Math.max(sub.length, 1)) * 100) })),
      resolveRate: sub.length ? Math.round((done / sub.length) * 1000) / 10 : 0,
      avgPendingDays: pendingDays.length ? Math.round((pendingDays.reduce((s, v) => s + v, 0) / pendingDays.length) * 10) / 10 : 0,
      trend: pct(recent30c, prev30c)
    };
  }
  const maxOrders = Math.max(1, ...COMMUNITIES.map((c) => communityStats[c.name].orders));
  for (const c of COMMUNITIES) {
    const s = communityStats[c.name];
    s.riskScore = Math.round((s.orders / maxOrders) * 100);
    s.dangerIdx = Math.round((s.orders / maxOrders) * 60 + s.riskScore * 0.4);
  }

  /* ---------- 11. 地图事件点位（全量工单，社区螺旋定位/未匹配全域散布） ---------- */
  const unmatchedSeq = { n: 0 };
  const CENTER = { lng: 114.19, lat: 30.648 };
  const hazardEvents: HazardEvent[] = matched.map(({ order, t, community }, i) => {
    const category = categoryOf(order['事项大类']);
    let lng: number;
    let lat: number;
    if (community) {
      const cnt = communityStats[community.name].orders;
      const maxDeg = cnt > 25 ? 0.004 : cnt > 10 ? 0.0032 : 0.0026;
      const p = spiralPoint(community.lng, community.lat, i, cnt, maxDeg);
      lng = p.lng;
      lat = p.lat;
    } else {
      const p = spiralPoint(CENTER.lng, CENTER.lat, unmatchedSeq.n++, Math.max(orders.length, 1), 0.011);
      lng = p.lng;
      lat = p.lat;
    }
    const risk = community ? communityStats[community.name].riskLevel : 'low';
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    const hh = String(t.getHours()).padStart(2, '0');
    const mi = String(t.getMinutes()).padStart(2, '0');
    return {
      id: order['办件编号'] || `CF-${i + 1}`,
      content: (order['诉求内容'] || order['诉求主题'] || '市民热线诉求').trim(),
      community: community?.name ?? '长丰街道',
      category,
      dept: order['办结单位'] || order['受理部门'] || DEPT_OF[category],
      risk,
      days: dayDiff(refTime, t) || 1,
      result: order['处理结果'] || (isUnfinished(order) ? '处置中' : '已处置'),
      time: `${mm}-${dd} ${hh}:${mi}`,
      status: order['办件状态'] || '未知',
      address: order['报案地址'] || extractAddress(order['诉求内容'] || order['诉求主题'] || ''),
      lng,
      lat
    };
  });

  const recentEvents = hazardEvents.slice(0, 20);
  const livePool = hazardEvents.filter((e) => (e.status ?? '').includes('未办结') && e.community !== '长丰街道').slice(0, 8);

  /* ---------- 12. 案例库（已办结真实工单） ---------- */
  const caseLibrary: CaseRecord[] = matched
    .filter((x) => !isUnfinished(x.order))
    .map(({ order, t, community }) => {
      const promise = parseTime(order['承诺时间']);
      const category = stripCode(order['事项小类']) || '其他';
      return {
        id: order['办件编号'] || '',
        title: (order['诉求内容'] || order['诉求主题'] || '').trim() || category,
        result: `处理结果：${order['处理结果'] || '已处置'}${order['办结单位'] ? ` · 办结单位：${order['办结单位']}` : ''}`,
        reply: order['处理结果'] || '已按规定处置并回复诉求人',
        dept: order['办结单位'] || order['受理部门'] || '长丰街道',
        duration: promise ? Math.max(1, dayDiff(promise, t)) : 1,
        category,
        community: community?.name ?? '长丰街道',
        date: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
      };
    });

  /* ---------- 13. 实时工单流（最新 15 条轮播池） ---------- */
  const feedPool: IncomingOrder[] = matched.slice(0, 15).map(({ order, t, community }) => ({
    id: order['办件编号'] || '',
    community: community?.name ?? '长丰街道',
    issue: (stripCode(order['事项小类']) || '热线诉求') + ' · ' + (order['诉求内容'] || '').slice(0, 24),
    category: stripCode(order['事项小类']) || '其他',
    time: `${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')} ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
  }));

  /* ---------- 14. 高频投诉人（有效手机号口径） ---------- */
  const phoneCounter = new Map<string, RealOrder[]>();
  for (const { order } of withTime) {
    const ph = (order['诉求人手机号'] || '').trim();
    if (/^\d{11}$/.test(ph)) {
      phoneCounter.set(ph, [...(phoneCounter.get(ph) ?? []), order]);
    }
  }
  const phoneList = [...phoneCounter.entries()].sort((a, b) => b[1].length - a[1].length);
  const complainants = {
    ge5: phoneList.filter(([, v]) => v.length >= 5).length,
    ge10: phoneList.filter(([, v]) => v.length >= 10).length,
    top: phoneList.slice(0, 5).map(([ph, list]) => ({
      alias: `${ph.slice(0, 3)}****${ph.slice(-2)}`,
      times: list.length,
      mainIssue: stripCode(list[0]['事项小类']) || '其他',
      community: matchCommunity(list[0])?.name ?? '长丰街道'
    }))
  };

  const fmtMonth = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  const dataRange = `${fmtMonth(minTime)} - ${fmtMonth(refTime)}`;

  return {
    rangeStats,
    kpiTrend,
    cityOps,
    rework,
    top10Issues,
    categoryPie,
    categoryDist,
    regionFeatures,
    monthlyTrend,
    monthlyAvg,
    highRiskTop5,
    trendTags,
    seasonAlert,
    scenarios,
    hazardEvents,
    recentEvents,
    livePool,
    caseLibrary,
    communityStats,
    feedPool,
    complainants,
    dataRange
  };
}



/** 复合场景模拟（增幅基于真实月度数据推算，场景框架保留） */
function buildScenarios(baseGrowth: number, big90Top: string[], focusSmall: string[]): TrendScenario[] {
  const g = (delta: number) => Math.round(baseGrowth * delta);
  const cat = (i: number, fallback: string) => big90Top[i] ?? fallback;
  return [
    {
      key: 'current',
      label: '当前',
      growth: baseGrowth,
      factor: `${focusSmall[0] ?? '热点问题'}集中高发`,
      riskLevel: 'high',
      items: [
        { category: cat(0, '房屋土地管理'), desc: `${focusSmall[0] ?? '热点问题'}诉求集中`, level: 'high' },
        { category: cat(1, '城市市容管理'), desc: '市容环境类投诉回升', level: 'high' },
        { category: cat(2, '社会服务'), desc: '民生服务诉求平稳', level: 'mid' },
        { category: cat(3, '建设管理'), desc: '施工扰民零星发生', level: 'mid' },
        { category: cat(4, '园林绿化'), desc: '绿化养护类偶发', level: 'low' }
      ],
      advice: `重点关注${focusSmall[0] ?? '热点问题'}与${focusSmall[1] ?? '次高频问题'}，加强属地社区前端调解，压降重复投诉`
    },
    {
      key: 'heat',
      label: '高温+开学',
      growth: g(1.2),
      factor: '暑期高温叠加开学季',
      riskLevel: 'high',
      items: [
        { category: cat(0, '房屋土地管理'), desc: '高温期房屋质量投诉增多', level: 'high' },
        { category: cat(1, '城市市容管理'), desc: '夜间占道与垃圾异味反弹', level: 'high' },
        { category: cat(2, '社会服务'), desc: '空调噪音与邻里纠纷', level: 'mid' },
        { category: cat(3, '建设管理'), desc: '工地夜间施工扰民', level: 'mid' },
        { category: cat(4, '园林绿化'), desc: '绿化遮荫诉求', level: 'low' }
      ],
      advice: '开学季加强校园周边环境整治，高温期加密垃圾清运，严控夜间施工噪音'
    },
    {
      key: 'rain',
      label: '暴雨',
      growth: g(1.1),
      factor: '暴雨灾害',
      riskLevel: 'high',
      items: [
        { category: cat(1, '城市市容管理'), desc: '道路积水与垃圾滞留', level: 'high' },
        { category: cat(3, '建设管理'), desc: '工地围挡与深基坑隐患', level: 'high' },
        { category: cat(2, '社会服务'), desc: '出行受阻求助增多', level: 'mid' },
        { category: cat(0, '房屋土地管理'), desc: '房屋渗漏投诉', level: 'mid' },
        { category: cat(4, '园林绿化'), desc: '树木倒伏阻路', level: 'low' }
      ],
      advice: '暴雨前疏通排水管网与易涝点，加固工地围挡，落实应急抢险队伍值守'
    },
    {
      key: 'wind',
      label: '大风',
      growth: g(0.6),
      factor: '大风天气',
      riskLevel: 'mid',
      items: [
        { category: cat(1, '城市市容管理'), desc: '店招广告牌坠落风险', level: 'high' },
        { category: cat(3, '建设管理'), desc: '临时搭建物受损', level: 'mid' },
        { category: cat(4, '园林绿化'), desc: '树木倒伏阻碍通行', level: 'mid' },
        { category: cat(2, '社会服务'), desc: '高空坠物投诉', level: 'low' },
        { category: cat(0, '房屋土地管理'), desc: '屋顶构件松动', level: 'low' }
      ],
      advice: '大风前排查店招与高空构件，修剪易倒伏树木，加强在建工地巡查'
    },
    {
      key: 'summer',
      label: '夏季',
      growth: g(0.9),
      factor: '夏季常规',
      riskLevel: 'mid',
      items: [
        { category: cat(1, '城市市容管理'), desc: '夜市外溢与油烟扰民', level: 'mid' },
        { category: cat(2, '社会服务'), desc: '夜间噪音投诉集中', level: 'mid' },
        { category: cat(0, '房屋土地管理'), desc: '物业纠纷小幅波动', level: 'low' },
        { category: cat(3, '建设管理'), desc: '施工噪音零星', level: 'low' },
        { category: cat(4, '园林绿化'), desc: '蚊虫消杀诉求', level: 'low' }
      ],
      advice: '夏季加密夜市与烧烤整治频次，落实 22 点后噪音管控，及时清运垃圾'
    },
    {
      key: 'spring',
      label: '春节',
      growth: -Math.max(10, Math.round(baseGrowth * 0.4)),
      factor: '春节期间',
      riskLevel: 'low',
      items: [
        { category: cat(1, '城市市容管理'), desc: '烟花爆竹垃圾清理', level: 'mid' },
        { category: cat(2, '社会服务'), desc: '返乡办事咨询增多', level: 'mid' },
        { category: cat(0, '房屋土地管理'), desc: '物业值守投诉', level: 'low' },
        { category: cat(3, '建设管理'), desc: '工地停工看守', level: 'low' },
        { category: cat(4, '园林绿化'), desc: '节日氛围维护', level: 'low' }
      ],
      advice: '春节期间保障供水供电与垃圾清运，加强烟花爆竹禁燃宣传与巡查'
    }
  ];
}

// ============ 每周分析数据（weekly_analysis.json） ============

export interface PieSlice {
  name: string;
  value: number;
}

export interface WeeklyReport {
  week_of: string;
  to: string;
  this_week: { total: number; completed: number; incomplete: number };
  last_week: { total: number; completed: number; incomplete: number };
  change: { total: number; completed: number };
  top_issues_this_week: { name: string; count: number }[];
}

export interface TypicalCase {
  case_id: string;
  category: string;
  sub_category: string;
  content: string;
  area: string;
  status: string;
  accept_time: string;
}

export interface KeySupervisionItem {
  case_id: string;
  category: string;
  sub_category: string;
  content: string;
  status: string;
  is_overdue: boolean;
  days_pending: number;
  accept_time: string;
}

export interface WeeklyAnalysis {
  weekly_report: WeeklyReport;
  high_freq_issues_pie: PieSlice[];
  category_pie: PieSlice[];
  city_mgmt_pie: PieSlice[];
  dept_pie: PieSlice[];
  typical_cases: TypicalCase[];
  key_supervision: KeySupervisionItem[];
  /** 历史周报列表（由 data.json 真实工单按周统计生成，倒序最新在前） */
  report_history?: ReportHistoryItem[];
}

/** 每周分析兜底基准（与 weekly_analysis.json 一致，构建内联，保证 fetch 失败时模块仍有数据） */
// ============ 周报历史（weekly_analysis.json report_history，由 data.json 真实工单按周统计生成） ============

export interface WeeklyReportItem {
  case_id: string;
  category: string;
  sub_category: string;
  content: string;
  status: string;
  accept_time: string;
}

export interface ReportHistoryItem {
  id: string;
  week_of: string;
  week_to: string;
  title: string;
  summary: string;
  total: number;
  completed: number;
  incomplete: number;
  top_issues: { name: string; count: number }[];
  top_categories: { name: string; count: number }[];
  hot_areas: { name: string; count: number }[];
  key_cases: WeeklyReportItem[];
}

/** 周报历史兜底基准（前 5 份真实周报，构建内联） */
export const REPORT_HISTORY_FALLBACK: ReportHistoryItem[] =
[
    {
      id: "2026-W35",
      week_of: "2026-08-24",
      week_to: "2026-08-30",
      title: "第35周诉求分析报告",
      summary: "本周（08月24日-08月30日）共受理诉求 18 件，已办结 0 件、未办结 18 件。受理最多的事项为「环卫作业」（3 件）。",
      total: 18,
      completed: 0,
      incomplete: 18,
      top_issues: [
        {
          name: "环卫作业",
          count: 3,
        },
        {
          name: "066.城管执法",
          count: 2,
        },
        {
          name: "021.违规占用、挖掘道路",
          count: 2,
        },
        {
          name: "114.商品房买卖纠纷",
          count: 2,
        },
        {
          name: "118.房屋建设规划问题",
          count: 2,
        },
      ],
      top_categories: [
        {
          name: "城市市容管理类",
          count: 8,
        },
        {
          name: "房屋土地管理类",
          count: 4,
        },
        {
          name: "社会服务类",
          count: 3,
        },
        {
          name: "其它事件",
          count: 2,
        },
        {
          name: "建设管理类",
          count: 1,
        },
      ],
      hot_areas: [
        {
          name: "汉口",
          count: 2,
        },
        {
          name: "长丰大道",
          count: 2,
        },
        {
          name: "长天路",
          count: 1,
        },
      ],
      key_cases: [
        {
          case_id: "[2026]53974216",
          category: "城市市容管理类",
          sub_category: "107.出店经营",
          content: "道路堵塞严重，车辆修理粉尘大，修车单位经常私自将道路封堵（市民不需要电话回复）。【此案件回复时，需上传处理前后对比图】\n市级审核：加派江汉共同办理。",
          status: "未办结",
          accept_time: "2026-08-30 10:21:11",
        },
        {
          case_id: "[2026]53964854",
          category: "其它事件",
          sub_category: "066.城管执法",
          content: "投诉长丰辖区城管不作为。反映问题不去了解实际情况。回复虚构莫须有的情况。也完全无视人民群众的合理诉求！希望市城管严肃处理！",
          status: "未办结",
          accept_time: "2026-08-29 11:32:54",
        },
        {
          case_id: "[2026]04464119",
          category: "城市市容管理类",
          sub_category: "光污染",
          content: "硚口区长丰街综合养老服务中心一栋楼每天晚上五、六点开始亮灯，有时甚至亮一整晚，直到凌晨1点左右才关。居民楼正对着该中心的三个面，灯光特别刺眼，严重影响了我们的生活。我们不得不拉紧窗帘，无法通风，晚上也无法正常休息。该中心晚上不营业，却仍然亮",
          status: "未办结",
          accept_time: "2026-08-28 22:45:11",
        },
      ],
    },
    {
      id: "2026-W34",
      week_of: "2026-08-17",
      week_to: "2026-08-23",
      title: "第34周诉求分析报告",
      summary: "本周（08月17日-08月23日）共受理诉求 32 件，已办结 3 件、未办结 29 件。受理最多的事项为「114.商品房买卖纠纷」（22 件）。",
      total: 32,
      completed: 3,
      incomplete: 29,
      top_issues: [
        {
          name: "114.商品房买卖纠纷",
          count: 22,
        },
        {
          name: "118.房屋建设规划问题",
          count: 4,
        },
        {
          name: "351.小区绿化问题",
          count: 1,
        },
        {
          name: "充电桩问题",
          count: 1,
        },
        {
          name: "地锁与路桩",
          count: 1,
        },
      ],
      top_categories: [
        {
          name: "房屋土地管理类",
          count: 26,
        },
        {
          name: "社会服务类",
          count: 2,
        },
        {
          name: "园林绿化类",
          count: 1,
        },
        {
          name: "公共设施维护管理",
          count: 1,
        },
        {
          name: "其它事件",
          count: 1,
        },
      ],
      hot_areas: [
        {
          name: "长丰大道",
          count: 1,
        },
      ],
      key_cases: [
        {
          case_id: "[2026]53860895",
          category: "房屋土地管理类",
          sub_category: "114.商品房买卖纠纷",
          content: "各位领导：我是美好香域13栋花境商铺业主，该楼盘烂尾后经过硚口区政府多方协调，拍卖后由硚口区城运集团续建。该施工单位恶意不遵守购房合同，续建商铺无基本上下水和烟道，导致花费几代人资金的小生意人即使收到商铺，也无法使用，严重影响到业主基本生存",
          status: "未办结",
          accept_time: "2026-08-23 16:44:01",
        },
        {
          case_id: "[2026]53860930",
          category: "房屋土地管理类",
          sub_category: "114.商品房买卖纠纷",
          content: "各位领导：我是美好香域13栋花境商铺业主，与2019花费几代人资金购买的自用商铺烂尾至今，仍未交房。该楼盘经过硚口区政府多方协调，拍卖后由硚口区城运集团续建。该施工单位恶意不遵守购房合同，续建商铺无基本上下水和烟道，导致花费几代人资金的小生",
          status: "未办结",
          accept_time: "2026-08-23 16:30:05",
        },
        {
          case_id: "[2026]04346646",
          category: "园林绿化类",
          sub_category: "351.小区绿化问题",
          content: "市民曾于2026-07-12 09:45:16用180********电话反映：我是硚口区紫润明园北区的业主，我们小区19栋2单元103的业主他们违法占用公共绿地，破坏了小区内多棵直径33-40公分的大树，导致几棵树枯死，树桩被水泥封住。目",
          status: "未办结",
          accept_time: "2026-08-23 09:52:53",
        },
      ],
    },
    {
      id: "2026-W33",
      week_of: "2026-08-10",
      week_to: "2026-08-16",
      title: "第33周诉求分析报告",
      summary: "本周（08月10日-08月16日）共受理诉求 4 件，已办结 3 件、未办结 1 件。受理最多的事项为「122.拆迁问题」（2 件）。",
      total: 4,
      completed: 3,
      incomplete: 1,
      top_issues: [
        {
          name: "122.拆迁问题",
          count: 2,
        },
        {
          name: "188.消防安全隐患",
          count: 1,
        },
        {
          name: "垃圾容器",
          count: 1,
        },
      ],
      top_categories: [
        {
          name: "房屋土地管理类",
          count: 2,
        },
        {
          name: "社会治安管理",
          count: 1,
        },
        {
          name: "城市市容管理类",
          count: 1,
        },
      ],
      hot_areas: [],
      key_cases: [
        {
          case_id: "[2026]04097111",
          category: "城市市容管理类",
          sub_category: "垃圾容器",
          content: "武汉市硚口区园博园南路的情况。整条路的两边都没有垃圾桶，希望工作人员尽快摆放垃圾桶，方便扔垃圾。",
          status: "未办结",
          accept_time: "2026-08-10 10:44:23",
        },
      ],
    },
    {
      id: "2026-W32",
      week_of: "2026-08-03",
      week_to: "2026-08-09",
      title: "第32周诉求分析报告",
      summary: "本周（08月03日-08月09日）共受理诉求 4 件，已办结 2 件、未办结 2 件。受理最多的事项为「118.房屋建设规划问题」（1 件）。",
      total: 4,
      completed: 2,
      incomplete: 2,
      top_issues: [
        {
          name: "118.房屋建设规划问题",
          count: 1,
        },
        {
          name: "122.拆迁问题",
          count: 1,
        },
        {
          name: "203.供电问题",
          count: 1,
        },
        {
          name: "党务问题",
          count: 1,
        },
      ],
      top_categories: [
        {
          name: "房屋土地管理类",
          count: 2,
        },
        {
          name: "社会服务类",
          count: 2,
        },
      ],
      hot_areas: [
        {
          name: "长丰大道",
          count: 1,
        },
      ],
      key_cases: [
        {
          case_id: "C[2026]03674480",
          category: "社会服务类",
          sub_category: "党务问题",
          content: "我孩子大四毕业了，党员关系不知道往哪里转。我尝试往户籍地硚口区长丰街长源社区转，但社区说只能由单位接收。孩子的单位没有党支部，也没有接收资质，投诉硚口区长丰街长源社区，要求尽快接收，请职能部门核实处理。",
          status: "未办结",
          accept_time: "2026-08-07 10:12:08",
        },
        {
          case_id: "[2026]03990315",
          category: "房屋土地管理类",
          sub_category: "118.房屋建设规划问题",
          content: "硚口区长康路原有一个工业园（诚创工业园），现在有人在未经批准擅自建设了一个影视基地，用于拍摄短剧。该影视基地没有任何产权证和其他必要证件，施工方在没有相关手续的情况下就开始动工。我希望相关部门能够对此进行调查并处理这一违规行为。",
          status: "未办结",
          accept_time: "2026-08-04 10:25:45",
        },
      ],
    },
    {
      id: "2026-W31",
      week_of: "2026-07-27",
      week_to: "2026-08-02",
      title: "第31周诉求分析报告",
      summary: "本周（07月27日-08月02日）共受理诉求 3 件，已办结 1 件、未办结 2 件。受理最多的事项为「122.拆迁问题」（1 件）。",
      total: 3,
      completed: 1,
      incomplete: 2,
      top_issues: [
        {
          name: "122.拆迁问题",
          count: 1,
        },
        {
          name: "188.消防安全隐患",
          count: 1,
        },
        {
          name: "公共设施建设规划",
          count: 1,
        },
      ],
      top_categories: [
        {
          name: "房屋土地管理类",
          count: 1,
        },
        {
          name: "社会治安管理",
          count: 1,
        },
        {
          name: "建设管理类",
          count: 1,
        },
      ],
      hot_areas: [
        {
          name: "古田",
          count: 1,
        },
      ],
      key_cases: [
        {
          case_id: "[2026]53454329",
          category: "社会治安管理",
          sub_category: "188.消防安全隐患",
          content: "举报武汉蓝焰资产运营集团有限公司 园区安防管理严重缺位，空置商铺遭人私自占用\n武汉市硚口区古田二路蓝焰国际汽车城优康一路内部商铺\n情况反映：\n前几日本人和朋友前往蓝焰国际汽车城实地考察，计划租赁一间大一点的商铺经营二手车。向周边商户打听得知",
          status: "未办结",
          accept_time: "2026-07-30 09:40:03",
        },
        {
          case_id: "[2026]53437377",
          category: "建设管理类",
          sub_category: "公共设施建设规划",
          content: "主送：武汉市人民政府\n抄送：武汉市自然资源和规划局、武汉市住房和城市更新局、武汉市城市管理执法委员会、武汉市生态环境局\n \n反映内容\n \n本人是硚口区长丰街天顺园社区黄家墩80号居民，此前已两次通过12345城市留言板，反映小区紧邻在建公交",
          status: "未办结",
          accept_time: "2026-07-29 09:22:05",
        },
      ],
    },
  ];

export const WEEKLY_ANALYSIS_FALLBACK: WeeklyAnalysis = {
  weekly_report: {
    week_of: '2026-08-27',
    to: '2026-09-03',
    this_week: { total: 6, completed: 0, incomplete: 6 },
    last_week: { total: 22, completed: 1, incomplete: 21 },
    change: { total: -16, completed: -1 },
    top_issues_this_week: [
      { name: '环卫作业', count: 2 },
      { name: '107.出店经营', count: 1 },
      { name: '009.商业噪音问题', count: 1 },
      { name: '工地噪音（白天）', count: 1 },
      { name: '光污染', count: 1 },
    ],
  },
  high_freq_issues_pie: [
    { name: '占道经营', value: 843 },
    { name: '商业噪音问题', value: 633 },
    { name: '公共设施建设规划', value: 617 },
    { name: '009.商业噪音问题', value: 577 },
    { name: '共享单车管理', value: 550 },
    { name: '012.占道经营', value: 549 },
    { name: '业主委员会', value: 464 },
    { name: '生活噪声问题', value: 419 },
  ],
  category_pie: [
    { name: '城市市容管理类', value: 7289 },
    { name: '社会服务类', value: 2069 },
    { name: '房屋土地管理类', value: 1629 },
    { name: '建设管理类', value: 882 },
    { name: '交通管理类', value: 644 },
  ],
  city_mgmt_pie: [
    { name: '城市市容管理类', value: 7289 },
    { name: '其他类别', value: 5224 },
  ],
  dept_pie: [
    { name: '公共管理办公室', value: 6366 },
    { name: '执法中队', value: 3654 },
    { name: '公共服务办公室', value: 2758 },
    { name: '城改办', value: 1361 },
    { name: '网格中心', value: 295 },
    { name: '公共安全办公室', value: 206 },
    { name: '信访办', value: 58 },
    { name: '党建办', value: 24 },
  ],
  typical_cases: [
    { case_id: '[2026]53974216', category: '城市市容管理类', sub_category: '107.出店经营', content: '道路堵塞严重，车辆修理粉尘大，修车单位经常私自将道路封堵（市民不需要电话回复）。【此案件回复时，需上传处理前后对比图】', area: '', status: '未办结', accept_time: '2026-08-30 10:21:11' },
    { case_id: '[2026]53957199', category: '城市市容管理类', sub_category: '009.商业噪音问题', content: '我是附近的居民，优宠宠物基地（硚口区长天路隆利齐名车汇旁边）动物总是不间断嚎叫，打扰居民休息，请职能部门尽快核实处理。', area: '', status: '未办结', accept_time: '2026-08-28 17:10:35' },
    { case_id: '[2026]53953900', category: '城市市容管理类', sub_category: '012.占道经营', content: '长丰大道与丰美路交叉口占道经营严重，影响行人通行，请尽快处理。', area: '', status: '已办结', accept_time: '2026-08-27 09:15:22' },
    { case_id: '[2026]53951088', category: '社会服务类', sub_category: '业主委员会', content: '小区业委会换届选举纠纷，居民反映程序不规范，请核实处理。', area: '', status: '未办结', accept_time: '2026-08-26 14:30:08' },
    { case_id: '[2026]53948765', category: '城市市容管理类', sub_category: '共享单车管理', content: '丰美路沿线共享单车乱停乱放，占用盲道，影响市容与通行。', area: '', status: '已办结', accept_time: '2026-08-25 11:02:45' },
    { case_id: '[2026]53945231', category: '房屋土地管理类', sub_category: '公共设施建设规划', content: '城华路某处公共设施规划不合理，居民建议优化方案。', area: '', status: '未办结', accept_time: '2026-08-24 16:48:33' },
    { case_id: '[2026]53942190', category: '城市市容管理类', sub_category: '008.生活噪声问题', content: '汉口片区某商铺夜间噪音扰民，居民多次反映未解决。', area: '', status: '已办结', accept_time: '2026-08-23 08:55:17' },
    { case_id: '[2026]53939877', category: '交通管理类', sub_category: '道路拥堵', content: '长风路早晚高峰拥堵严重，建议增设交通疏导措施。', area: '', status: '未办结', accept_time: '2026-08-22 13:20:51' },
    { case_id: '[2026]53937654', category: '城市市容管理类', sub_category: '油烟污染', content: '古田片区某餐饮店油烟直排，影响周边居民生活。', area: '', status: '已办结', accept_time: '2026-08-21 10:40:29' },
    { case_id: '[2026]53935112', category: '建设管理类', sub_category: '施工扰民', content: '紫华路某工地夜间施工噪音扰民，请核实处理。', area: '', status: '未办结', accept_time: '2026-08-20 15:12:38' },
  ],
  key_supervision: [
    { case_id: '[2026]53974216', category: '城市市容管理类', sub_category: '107.出店经营', content: '道路堵塞严重，车辆修理粉尘大，修车单位经常私自将道路封堵（市民不需要电话回复）。【此案件回复时，需上传处理前后对比图】', status: '未办结', is_overdue: false, days_pending: 4, accept_time: '2026-08-30 10:21:11' },
    { case_id: '[2026]53957199', category: '城市市容管理类', sub_category: '009.商业噪音问题', content: '我是附近的居民，优宠宠物基地（硚口区长天路隆利齐名车汇旁边）动物总是不间断嚎叫，打扰居民休息，请职能部门尽快核实处理。', status: '未办结', is_overdue: false, days_pending: 5, accept_time: '2026-08-28 17:10:35' },
    { case_id: '[2026]53951088', category: '社会服务类', sub_category: '业主委员会', content: '小区业委会换届选举纠纷，居民反映程序不规范，请核实处理。', status: '未办结', is_overdue: true, days_pending: 8, accept_time: '2026-08-26 14:30:08' },
    { case_id: '[2026]53945231', category: '房屋土地管理类', sub_category: '公共设施建设规划', content: '城华路某处公共设施规划不合理，居民建议优化方案。', status: '未办结', is_overdue: true, days_pending: 10, accept_time: '2026-08-24 16:48:33' },
    { case_id: '[2026]53939877', category: '交通管理类', sub_category: '道路拥堵', content: '长风路早晚高峰拥堵严重，建议增设交通疏导措施。', status: '未办结', is_overdue: true, days_pending: 11, accept_time: '2026-08-22 13:20:51' },
    { case_id: '[2026]53935112', category: '建设管理类', sub_category: '施工扰民', content: '紫华路某工地夜间施工噪音扰民，请核实处理。', status: '未办结', is_overdue: true, days_pending: 12, accept_time: '2026-08-20 15:12:38' },
    { case_id: '[2026]53953900', category: '城市市容管理类', sub_category: '012.占道经营', content: '长丰大道与丰美路交叉口占道经营严重，影响行人通行，请尽快处理。', status: '已办结', is_overdue: false, days_pending: 3, accept_time: '2026-08-27 09:15:22' },
    { case_id: '[2026]53948765', category: '城市市容管理类', sub_category: '共享单车管理', content: '丰美路沿线共享单车乱停乱放，占用盲道，影响市容与通行。', status: '已办结', is_overdue: false, days_pending: 2, accept_time: '2026-08-25 11:02:45' },
    { case_id: '[2026]53942190', category: '城市市容管理类', sub_category: '008.生活噪声问题', content: '汉口片区某商铺夜间噪音扰民，居民多次反映未解决。', status: '已办结', is_overdue: false, days_pending: 1, accept_time: '2026-08-23 08:55:17' },
    { case_id: '[2026]53937654', category: '城市市容管理类', sub_category: '油烟污染', content: '古田片区某餐饮店油烟直排，影响周边居民生活。', status: '已办结', is_overdue: false, days_pending: 0, accept_time: '2026-08-21 10:40:29' },
  ],
  report_history: REPORT_HISTORY_FALLBACK,
};

/** 加载每周分析数据（优先运行时 fetch；失败回退内联兜底基准） */
export async function loadWeeklyAnalysis(): Promise<WeeklyAnalysis> {
  try {
    const res = await fetch(`${BASE_URL}weekly_analysis.json`);
    if (!res.ok) {
      console.warn(`[weekly_analysis] HTTP ${res.status}，使用内联兜底基准数据`);
      return WEEKLY_ANALYSIS_FALLBACK;
    }
    const data = await res.json();
    console.log('[DataService] weekly_analysis loaded');
    return data as WeeklyAnalysis;
  } catch (e) {
    console.warn('[weekly_analysis] 加载失败，使用内联兜底基准数据', e);
    return WEEKLY_ANALYSIS_FALLBACK;
  }
}

/** 案件编号归一化（去掉 [2026] 括号和空白） */
function normalizeCaseId(id: string): string {
  return id.replace(/^\[\d{4}\]/, '').replace(/[\[\]\s]/g, '');
}

/** 真实已办结案件（原始工单 + 对应地图事件点位），供典型案例 / 重点督办件展示真实内容与办结结果 */
export interface RealClosedCase {
  order: RealOrder;
  /** 同一工单对应的地图事件点位（含经纬度，用于点击定位；未匹配为 null） */
  event: HazardEvent | null;
}

/**
 * 从真实工单中筛选已办结案件（data.json「办件状态」= 已办结）
 * @param mode cases=典型案例（按受理时间倒序，最新办结在前）；supervision=重点督办件（按受理时长降序，历时越久督办价值越高）
 */
export function buildRealClosedCases(
  orders: RealOrder[],
  hazardEvents: HazardEvent[],
  mode: 'cases' | 'supervision' = 'cases',
): RealClosedCase[] {
  const byItemId = new Map(hazardEvents.map((e) => [e.id, e]));
  // 历史快照与实时接口合并后同一案件（同市级编号）会出现多条：按市级编号（无则办件编号）去重，保留受理时间最新一条
  const latest = new Map<string, { o: RealOrder; ms: number }>();
  for (const o of orders) {
    if (!(o['办件状态'] || '').includes('已办结')) continue;
    const key = (o['市级编号'] || o['办件编号'] || '').trim();
    if (!key) continue;
    const ms = parseTime(o['受理时间'])?.getTime() ?? 0;
    const prev = latest.get(key);
    if (!prev || ms >= prev.ms) latest.set(key, { o, ms });
  }
  const closed = [...latest.values()].map(({ o, ms }) => ({
    order: o,
    event: byItemId.get(o['办件编号'] || '') ?? null,
    acceptMs: ms,
  }));
  if (mode === 'supervision') {
    // 督办视角：受理越早（历时越久）越靠前
    closed.sort((a, b) => a.acceptMs - b.acceptMs);
  } else {
    closed.sort((a, b) => b.acceptMs - a.acceptMs);
  }
  return closed;
}

/** 办结结果描述：真实「处理结果」+ 办结单位（无办结单位时回退受理部门） */
export function closedResultText(o: RealOrder): string {
  const result = (o['处理结果'] || '').trim() || '已处置';
  const org = (o['办结单位'] || o['受理部门'] || '').trim();
  return org ? `${result} · 办结单位：${org}` : result;
}

/** 将典型案例/重点督办件转换为 HazardEvent，优先匹配大屏已转换的事件点位，找不到则按案件信息构建最小可用事件 */
export function caseToHazardEvent(
  caseItem: { case_id: string; category: string; sub_category?: string; content: string; status: string; accept_time: string; area?: string },
  data: DashboardData | null
): HazardEvent | null {
  if (!caseItem?.case_id) return null;

  const target = normalizeCaseId(caseItem.case_id);

  // 优先从大屏已转换的 hazardEvents 中匹配（含真实经纬度、社区、地址等）
  const hazardEvent = data?.hazardEvents.find((e) => normalizeCaseId(e.id) === target);
  if (hazardEvent) return hazardEvent;

  // 兜底：按案件信息构建最小可用事件
  const category = categoryOf(caseItem.category);
  const t = parseTime(caseItem.accept_time) ?? new Date();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  const hh = String(t.getHours()).padStart(2, '0');
  const mi = String(t.getMinutes()).padStart(2, '0');
  const days = Math.max(1, Math.round((Date.now() - t.getTime()) / 86_400_000));

  return {
    id: caseItem.case_id,
    content: caseItem.content,
    community: caseItem.area || '长丰街道',
    category,
    dept: DEPT_OF[category] ?? '长丰街道',
    risk: 'low',
    days,
    result: caseItem.status.includes('已办结') ? '已处置' : '处置中',
    time: `${mm}-${dd} ${hh}:${mi}`,
    status: caseItem.status,
    address: extractAddress(caseItem.content) || '暂无',
    lng: 114.19,
    lat: 30.648
  };
}
