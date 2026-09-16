// 左侧：市民热线概览（KPI + 重办件统计，时间范围由全局 TimeFilterContext 控制）
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOTLINE_STATS, REWORK_BREAKDOWN, REWORK_ORDERS } from '@/data/mockData';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter } from '@/contexts/TimeFilterContext';
import { REWORK_COLORS, stripCode } from '@/services/dataService';
import CountUp from './CountUp';

export default function HotlineOverview({ compact = false }: { compact?: boolean }) {
  const { data, orders, mergedSummary, historyData, loading, summaryStatus, dataVersion } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();

  // 数据口径：默认（all）使用 merged_summary.json（历史 Excel 与实时 API 市级编号去重合并，实时覆盖历史）
  // - 总量 = 14,822（历史去重 14,517 + 无编号 5 + 实时新增 300）
  // - 已办结 = 14,519 / 未办结 = 303 / 办结率 = 97.96%
  // - 非 all：接入全局时间筛选（本周/本月/自定义…），按受理时间对实时工单现场过滤统计
  const { stats, loadState, trend, breakdown, reworkTotal } = useMemo(() => {
    const isUnfinished = (o: (typeof orders)[0]) => {
      const s = o['办件状态'] ?? '';
      return !s.includes('已办结');
    };
    const liveUnfinished = orders.filter(isUnfinished).length;
    // compact 模式默认展示上周数据；非 compact 跟随全局时间筛选
    const effectiveRange = compact ? 'week' : timeRange;
    const filteredOrders =
      effectiveRange !== 'all' && orders.length ? (filterByTime(orders) as unknown as typeof orders) : null;
    // 数据回退链：时间筛选实时统计 → merged_summary（合并口径）→ history_summary + 实时未办结 → 纯实时 → 加载中/失败
    let histStats: { total: number; unfinished: number; resolveRate: number } | null = null;
    let loadState: 'ok' | 'loading' | 'error' = 'ok';
    if (filteredOrders && filteredOrders.length > 0) {
      const undone = filteredOrders.filter(isUnfinished).length;
      histStats = {
        total: filteredOrders.length,
        unfinished: undone,
        resolveRate: Math.round(((filteredOrders.length - undone) / filteredOrders.length) * 10000) / 100,
      };
    } else if (mergedSummary) {
      histStats = { total: mergedSummary.total, unfinished: mergedSummary.incomplete, resolveRate: mergedSummary.completion_rate };
    } else if (historyData) {
      const total = historyData.resolved + liveUnfinished;
      histStats = {
        total,
        unfinished: liveUnfinished,
        resolveRate: total ? Math.round((historyData.resolved / total) * 10000) / 100 : 0,
      };
    } else if (orders.length > 0) {
      histStats = {
        total: orders.length,
        unfinished: liveUnfinished,
        resolveRate: Math.round(((orders.length - liveUnfinished) / orders.length) * 10000) / 100,
      };
    } else if (loading || summaryStatus === 'loading') {
      loadState = 'loading';
    } else {
      loadState = 'error';
    }

    // 重办件统计：基于实时 orders 按事项小类分组取 TOP6（全部时间亦用实时数据计算）
    let bkd = data?.rework.breakdown ?? REWORK_BREAKDOWN;
    let rwTotal = data?.rework.reworkTotal ?? REWORK_ORDERS.reworkTotal;
    const base = effectiveRange === 'all' || !orders.length ? orders : (filterByTime(orders) as unknown as typeof orders);
    if (base.length) {
      const smallMap = new Map<string, number>();
      for (const o of base) {
        const s = stripCode(o['事项小类']) || '其他';
        smallMap.set(s, (smallMap.get(s) ?? 0) + 1);
      }
      const top6 = [...smallMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      rwTotal = top6.reduce((s, [, v]) => s + v, 0);
      bkd = top6.map(([type, count], i) => ({
        type, count,
        percent: base.length ? Math.round((count / base.length) * 1000) / 10 : 0,
        color: REWORK_COLORS[i % REWORK_COLORS.length],
      }));
    }

    return {
      stats: histStats,
      loadState,
      trend: data?.kpiTrend ?? HOTLINE_STATS.kpiTrend,
      breakdown: bkd,
      reworkTotal: rwTotal,
    };
  }, [timeRange, compact, orders, data, mergedSummary, historyData, loading, summaryStatus, filterByTime]);

  // compact 模式：真实自然周统计（上周一~上周日，从合并工单现场计算；环比对比上上周）
  const compactWeek = useMemo(() => {
    if (!compact) return null;
    const DAY = 86_400_000;
    const parse = (s?: string) => (s ? new Date(s.replace(/-/g, '/')) : null);
    const now = new Date();
    const dayIdx = (now.getDay() + 6) % 7; // 周一=0
    const thisMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayIdx);
    const lastMonT = thisMon.getTime() - 7 * DAY;
    const lastSunT = thisMon.getTime() - 1;
    const prevMonT = thisMon.getTime() - 14 * DAY;
    let lt = 0, lu = 0, pt = 0, pu = 0;
    for (const o of orders) {
      const d = parse(o['受理时间']);
      if (!d || Number.isNaN(d.getTime())) continue;
      const t = d.getTime();
      if (t >= lastMonT && t <= lastSunT) {
        lt++;
        if (!(o['办件状态'] ?? '').includes('已办结')) lu++;
      } else if (t >= prevMonT && t < lastMonT) {
        pt++;
        if (!(o['办件状态'] ?? '').includes('已办结')) pu++;
      }
    }
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : cur > 0 ? 100 : 0;
    const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const lastRate = lt ? Math.round(((lt - lu) / lt) * 10000) / 100 : 0;
    const prevRate = pt ? Math.round(((pt - pu) / pt) * 10000) / 100 : 0;
    return {
      label: `市民热线事件概览（${fmt(new Date(lastMonT))}-${fmt(new Date(lastSunT))}）`,
      total: lt,
      unfinished: lu,
      resolveRate: lastRate,
      totalPct: pct(lt, pt),
      unfinishedPct: pct(lu, pu),
      resolvePct: Math.round((lastRate - prevRate) * 100) / 100,
      ready: orders.length > 0,
    };
  }, [compact, orders]);

  /** KPI 数据源：compact 用真实上周统计，非 compact 用全局口径 */
  const wk = compact ? compactWeek : null;
  const kpi = wk
    ? [
        {
          label: '市民热线事件总量',
          value: wk.total,
          suffix: '件',
          decimals: 0,
          group: true,
          trend: { dir: wk.totalPct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(wk.totalPct)}%`, good: wk.totalPct < 0 }
        },
        {
          label: '未办结',
          value: wk.unfinished,
          suffix: '件',
          decimals: 0,
          group: false,
          trend: { dir: wk.unfinishedPct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(wk.unfinishedPct)}%`, good: wk.unfinishedPct < 0 }
        },
        {
          label: '办结率',
          value: wk.resolveRate,
          suffix: '%',
          decimals: 2,
          group: false,
          trend: { dir: wk.resolvePct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(wk.resolvePct)}%`, good: wk.resolvePct > 0 }
        }
      ]
    : [
        {
          label: '市民热线事件总量',
          value: stats?.total ?? 0,
          suffix: '件',
          decimals: 0,
          group: true,
          trend: { dir: trend.totalPct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(trend.totalPct)}%`, good: trend.totalPct < 0 }
        },
        {
          label: '未办结',
          value: stats?.unfinished ?? 0,
          suffix: '件',
          decimals: 0,
          group: false,
          trend: { dir: trend.unfinishedPct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(trend.unfinishedPct)}%`, good: trend.unfinishedPct < 0 }
        },
        {
          label: '办结率',
          value: stats?.resolveRate ?? 0,
          suffix: '%',
          decimals: 2,
          group: false,
          trend: { dir: trend.resolvePct >= 0 ? ('up' as const) : ('down' as const), text: `${Math.abs(trend.resolvePct)}%`, good: trend.resolvePct > 0 }
        }
      ];

  /** KPI 加载态：compact 以真实工单是否就绪为准 */
  const kpiState = compact ? (wk?.ready ? 'ok' : loading ? 'loading' : 'error') : loadState;

  const maxPercent = Math.max(...breakdown.map((r) => r.percent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="tech-card flex flex-col overflow-hidden px-3 py-2"
      style={{ backgroundColor: 'rgba(36,21,16,0.9)' }}
    >
      {/* 标题：白色加粗 + 左侧渐变红金竖条 */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="title-vbar h-3.5 shrink-0" />
        <h3 className="text-sm font-bold text-foreground">{compact ? (wk?.label ?? '市民热线事件概览（上周）') : '重办件概览'}</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">来源：12345 热线</span>
      </div>

      {/* compact 模式：展示3个KPI */}
      {compact ? (
        <div className="grid grid-cols-3 gap-1.5">
          {kpi.map((k, i) => (
            <div key={k.label} className="flex min-w-0 flex-col items-center rounded border border-border/40 bg-secondary/20 px-2 py-2">
              <p className="flex w-full items-baseline justify-center gap-0.5 leading-none">
                {kpiState === 'ok' ? (
                  <>
                    <CountUp key={`kpi-${dataVersion}`} value={k.value} decimals={k.decimals} group={k.group} delay={0.2 + i * 0.15} className="kpi-num whitespace-nowrap font-digital text-primary" />
                    <span className="shrink-0 text-[10px] text-muted-foreground">{k.suffix}</span>
                    <span className={cn('flex shrink-0 items-center gap-0.5 text-[9px] font-semibold', k.trend.good ? 'text-success' : 'text-risk-high')}>
                      {k.trend.dir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {k.trend.text}
                    </span>
                  </>
                ) : (
                  <span className="kpi-num font-digital text-sm text-primary/70">
                    {kpiState === 'loading' ? '加载中…' : '获取失败'}
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-center text-[10px] leading-tight text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <>
      {/* 左侧大模块：只展示重办件统计 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="mb-1.5 flex shrink-0 items-center gap-2 border-b bg-[rgba(36,21,16,0.95)] pb-1"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span className="text-sm font-bold text-foreground">重办件</span>
          <CountUp key={`rw-${dataVersion}`} value={reworkTotal} group delay={0.4} className="num-glow font-digital text-base font-bold text-primary" />
          <span className="text-[11px] text-muted-foreground">件</span>
        </div>
        <div className="space-y-1.5 overflow-hidden pr-1" style={{ height: '220px' }}>
          {breakdown.map((r) => (
            <div key={r.type} className="flex items-center gap-2">
              <span className="w-14 shrink-0 truncate text-xs text-foreground">{r.type}</span>
              <span className="font-digital w-9 shrink-0 text-xs text-primary">{r.count}</span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded" style={{ width: `${(r.percent / maxPercent) * 100}%`, backgroundColor: r.color }} />
              </div>
              <span className="font-digital w-12 shrink-0 text-right text-[10px] text-muted-foreground">{r.percent}%</span>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </motion.div>
  );
}
