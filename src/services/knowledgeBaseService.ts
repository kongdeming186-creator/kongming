/**
 * 知识库服务 — 管理历史热线工单数据
 *
 * 数据来源：
 * 1. Excel 导入的历史工单（knowledge_base.json，14,779 条）
 * 2. 实时接口中已办结的工单（自动追加到知识库）
 *
 * 合并策略：
 * - 以「办件编号」去重，实时数据覆盖历史同编号记录
 * - 实时接口中已办结但知识库中没有的工单 → 自动追加
 */

import type { RealOrder } from '@/services/dataService';

const BASE_URL = (import.meta.env.BASE_URL as string) || '/';
const KB_API_URL = `${BASE_URL}knowledge_base.json`;

/** 知识库工单记录（Excel 18 字段 + 追加的来源标记） */
export interface KbOrder {
  '序号'?: number;
  '办件编号': string;
  '办件来源'?: string;
  '市级编号'?: string;
  '诉求主题'?: string;
  '诉求内容'?: string;
  '办理单位'?: string;
  '办理科室'?: string;
  '诉求人'?: string;
  '诉求人电话'?: string;
  '处理结果'?: string;
  '事项大类'?: string;
  '事项小类'?: string;
  '派发时间'?: string;
  '承诺完成时间'?: string;
  '办件状态'?: string;
  '派单员'?: string;
  '预警状态'?: string;
  /** 数据来源：history=Excel导入 / realtime=实时接口追加 */
  _source?: 'history' | 'realtime';
}

/** 知识库缓存（运行时内存） */
let kbCache: KbOrder[] | null = null;

/** 加载知识库全量数据 */
export async function loadKnowledgeBase(): Promise<KbOrder[]> {
  if (kbCache) return kbCache;
  try {
    const res = await fetch(KB_API_URL);
    if (!res.ok) {
      console.warn(`[KnowledgeBase] HTTP ${res.status}，知识库加载失败`);
      return [];
    }
    const data = (await res.json()) as KbOrder[];
    data.forEach((r) => { if (!r._source) r._source = 'history'; });
    kbCache = data;
    console.log(`[KnowledgeBase] 已加载 ${data.length} 条历史工单`);
    return data;
  } catch (e) {
    console.warn('[KnowledgeBase] 加载失败', e);
    return [];
  }
}

/**
 * 将实时工单中已办结但知识库没有的记录追加到知识库
 * @param realOrders 实时接口获取的工单数组
 * @returns 追加的记录数
 */
export function appendResolvedToKb(realOrders: KbOrder[]): number {
  if (!kbCache) return 0;
  const existingIds = new Set(kbCache.map((r) => r['办件编号']));
  const newResolved = realOrders.filter(
    (r) =>
      r['办件状态']?.includes('已办结') &&
      r['办件编号'] &&
      !existingIds.has(r['办件编号'])
  );
  if (newResolved.length === 0) return 0;
  newResolved.forEach((r) => { r._source = 'realtime'; });
  // 原地追加：保持 kbCache 与外部持有的引用（如 RealDataContext 的 kbRef）指向同一数组，避免陈旧引用
  kbCache.push(...newResolved);
  console.log(`[KnowledgeBase] 追加 ${newResolved.length} 条已办结工单，总计 ${kbCache.length} 条`);
  return newResolved.length;
}

/**
 * 获取知识库统计摘要
 */
export function getKbSummary(orders: KbOrder[]) {
  const total = orders.length;
  const resolved = orders.filter((o) => o['办件状态']?.includes('已办结')).length;
  const pending = total - resolved;

  // 事项大类分布
  const catMap = new Map<string, number>();
  for (const o of orders) {
    const c = (o['事项大类'] || '未知').trim();
    catMap.set(c, (catMap.get(c) ?? 0) + 1);
  }
  const categories = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // 月度趋势
  const monthMap = new Map<string, number>();
  for (const o of orders) {
    const t = o['派发时间'] || '';
    if (t.length >= 7) {
      const m = t.slice(0, 7); // YYYY-MM
      monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
    }
  }
  const monthlyTrend = [...monthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  // TOP 问题
  const issueMap = new Map<string, number>();
  for (const o of orders) {
    const s = (o['事项小类'] || '其他').replace(/^\d+\./, '').trim();
    issueMap.set(s, (issueMap.get(s) ?? 0) + 1);
  }
  const topIssues = [...issueMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // 办理单位分布
  const deptMap = new Map<string, number>();
  for (const o of orders) {
    const d = (o['办理单位'] || '未知').trim();
    deptMap.set(d, (deptMap.get(d) ?? 0) + 1);
  }
  const deptDist = [...deptMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const completionRate = total ? Math.round((resolved / total) * 10000) / 100 : 0;

  return {
    total,
    resolved,
    pending,
    completionRate,
    categories,
    monthlyTrend,
    topIssues,
    deptDist,
    dataSourceBreakdown: {
      history: orders.filter((o) => o._source === 'history').length,
      realtime: orders.filter((o) => o._source === 'realtime').length,
    },
  };
}

/**
 * 在知识库中搜索相似案例
 * @param keyword 搜索关键词（诉求内容/主题/小类）
 * @param limit 返回条数
 */
export function searchCases(orders: KbOrder[], keyword: string, limit = 5): KbOrder[] {
  const kw = keyword.trim();
  if (!kw) return [];
  const lower = kw.toLowerCase();
  return orders
    .filter((o) => o['办件状态']?.includes('已办结'))
    .filter((o) => {
      const text = `${o['诉求内容'] || ''}${o['诉求主题'] || ''}${o['事项小类'] || ''}`.toLowerCase();
      return text.includes(lower);
    })
    .slice(0, limit);
}

/**
 * 知识库工单字段标准化 → 转为 RealOrder 格式
 * Excel 字段 → 实时接口字段映射
 */
export function normalizeKbOrder(o: KbOrder): RealOrder {
  return {
    '办件编号': o['办件编号'] || '',
    '市级编号': o['市级编号'] || '',
    '事项大类': o['事项大类'] || '',
    '事项小类': o['事项小类'] || '',
    '诉求主题': o['诉求主题'] || '',
    '诉求内容': o['诉求内容'] || '',
    '事件来源': o['办件来源'] || '',
    '诉求人': o['诉求人'] || '',
    '诉求人手机号': o['诉求人电话'] || '',
    '受理时间': o['派发时间'] || '',
    '承诺时间': o['承诺完成时间'] || '',
    '完成时间': '',
    '标签': '',
    '受理部门': o['办理单位'] || '',
    '办结单位': o['办理单位'] || '',
    '处理结果': o['处理结果'] || '',
    '办件状态': o['办件状态'] || '',
    '用户评价': '',
  };
}

/**
 * 合并知识库 + 实时工单
 * 以「办件编号」去重，实时覆盖历史同编号
 * 返回标准 RealOrder 数组
 */
export function mergeKbWithRealtime(kbOrders: KbOrder[], realOrders: RealOrder[]): RealOrder[] {
  const realIdSet = new Set(realOrders.map((r) => r['办件编号']));
  const kbNormalized = kbOrders
    .filter((o) => !realIdSet.has(o['办件编号']))
    .map(normalizeKbOrder);
  return [...realOrders, ...kbNormalized];
}
