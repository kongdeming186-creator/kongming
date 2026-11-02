// 左侧：市民热线概览（KPI + 重办件统计，时间范围由全局 TimeFilterContext 控制）
import { useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Building2,
  ClipboardList,
  Percent,
  Phone,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { REWORK_BREAKDOWN, REWORK_ORDERS } from '@/data/mockData';
import { CITY_OPS_EVENTS, JUWEI_EVENTS } from '@/data/eventData';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter } from '@/contexts/TimeFilterContext';
import { JUWEI_SUMMARY_FALLBACK, REWORK_COLORS, stripCode } from '@/services/dataService';
import CountUp from './CountUp';

/** 事件概览 KPI 项（compact 通栏条使用） */
interface KpiItem {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  /** 千分位 */
  group: boolean;
  icon: LucideIcon;
  /** 环形图标配色修饰类 */
  tone: string;
  /** 来源拆解（如「今日待办事件」按 城运 / 市民热线 / 聚微 分列） */
  breakdown?: { label: string; value: number; color: string }[];
}

export default function HotlineOverview({
  compact = false,
  className,
  headerExtra
}: {
  compact?: boolean;
  className?: string;
  /** 标题栏右侧插槽（如全局统计周期筛选） */
  headerExtra?: ReactNode;
}) {
  const { data, orders, mergedSummary, historyData, loading, summaryStatus, dataVersion, juweiSummary } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();

  // 数据口径：默认（all）使用 merged_summary.json（历史 Excel 与实时 API 市级编号去重合并，实时覆盖历史）
  // - 总量 = 14,822（历史去重 14,517 + 无编号 5 + 实时新增 300）
  // - 已办结 = 14,519 / 未办结 = 303 / 办结率 = 97.96%
  // - 非 all：统一跟随全局统计周期（本周/本月/自定义…），按受理时间现场过滤统计
  const { loadState, breakdown, reworkTotal } = useMemo(() => {
    const base = timeRange === 'all' || !orders.length ? orders : (filterByTime(orders) as unknown as typeof orders);
    // 数据状态：时间筛选实时统计 / merged_summary / history_summary / 纯实时 均视为就绪
    const hasData = base.length > 0 || !!mergedSummary || !!historyData;
    let loadState: 'ok' | 'loading' | 'error' = 'ok';
    if (!hasData) loadState = loading || summaryStatus === 'loading' ? 'loading' : 'error';

    // 重办件统计：按事项小类分组取 TOP6（跟随全局统计周期）
    let bkd = data?.rework.breakdown ?? REWORK_BREAKDOWN;
    let rwTotal = data?.rework.reworkTotal ?? REWORK_ORDERS.reworkTotal;
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
      loadState,
      breakdown: bkd,
      reworkTotal: rwTotal,
    };
  }, [timeRange, orders, data, mergedSummary, historyData, loading, summaryStatus, filterByTime]);

  // compact 模式：本期口径
  // - 事件总量 = 本期受理（含已办结 / 未办结全部状态）+ 当前未办结存量（未办理 / 办理中，与受理时间无关）
  // - 未办结存量不随统计周期变化（它是「当前待办」状态量，不是时间切片量）
  // - 「全部」直接取合并台账，保证默认视图数值稳定
  const period = useMemo(() => {
    if (!compact) return null;
    if (timeRange === 'all' && mergedSummary) {
      return {
        total: mergedSummary.total,
        completed: mergedSummary.completed,
        unfinished: mergedSummary.incomplete,
        resolveRate: mergedSummary.completion_rate,
        ready: mergedSummary.total > 0,
      };
    }
    const isPending = (o: (typeof orders)[0]) => !(o['办件状态'] ?? '').includes('已办结');
    // 当前未办结存量（待办基数）：优先取合并台账，台账未就绪时用实时工单现场统计
    const backlog = mergedSummary?.incomplete ?? orders.filter(isPending).length;
    const inPeriod = !orders.length ? orders : (filterByTime(orders) as unknown as typeof orders);
    const periodPending = inPeriod.filter(isPending).length;
    // 本期事件池 = 本期受理 ∪ 未办结存量（本期已含的未办结件不重复计入）
    const total = inPeriod.length + Math.max(backlog - periodPending, 0);
    return {
      total,
      completed: Math.max(total - backlog, 0),
      unfinished: backlog,
      resolveRate: total ? Math.round((Math.max(total - backlog, 0) / total) * 10000) / 100 : 0,
      ready: total > 0,
    };
  }, [compact, timeRange, orders, mergedSummary, filterByTime]);

  /** KPI 加载态：compact 以真实工单是否就绪为准 */
  const kpiState = compact ? (period?.ready ? 'ok' : loading ? 'loading' : 'error') : loadState;

  /** 今日待办（未办结）按来源拆解：城运取未结案数；聚微接口为历史数据，无「今日待办」语义，故保持 0 */
  const pendingCityOps = useMemo(
    () => CITY_OPS_EVENTS.filter((e) => e.dispatchStatus !== '已结案').length,
    []
  );

  /** 聚微事件总量：来自聚微事件接口（历史数据，2024-10-30 ~ 2025-10-11 累计口径，不随统计周期变动） */
  const juweiTotal = juweiSummary?.total ?? JUWEI_SUMMARY_FALLBACK.total;

  /** 事件概览 KPI 五项：三来源总量 + 今日待办（含来源拆解）+ 市民热线办结率
      市民热线三项跟随全局统计周期（「全部」即全量累计口径） */
  const kpiItems: KpiItem[] = useMemo(() => {
    const hotlineTotal = period?.total ?? mergedSummary?.total ?? 0;
    const hotlinePending = period?.unfinished ?? mergedSummary?.incomplete ?? 0;
    const hotlineRate = period?.resolveRate ?? mergedSummary?.completion_rate ?? 0;
    return [
      { label: '市民热线事件总量', value: hotlineTotal, suffix: '件', decimals: 0, group: true, icon: Phone, tone: '' },
      {
        label: '城运事件总量',
        value: CITY_OPS_EVENTS.length,
        suffix: '件',
        decimals: 0,
        group: false,
        icon: Building2,
        tone: 'kpi-ring-gold'
      },
      {
        label: '聚微事件总量',
        value: juweiTotal,
        suffix: '件',
        decimals: 0,
        group: true,
        icon: Smartphone,
        tone: ''
      },
      {
        label: '今日待办事件',
        value: hotlinePending + pendingCityOps + JUWEI_EVENTS.length,
        suffix: '件',
        decimals: 0,
        group: false,
        icon: ClipboardList,
        tone: 'kpi-ring-gold',
        breakdown: [
          { label: '城运', value: pendingCityOps, color: '#FFB300' },
          { label: '市民热线', value: hotlinePending, color: '#1E88E5' },
          { label: '聚微', value: JUWEI_EVENTS.length, color: '#AEF4FC' },
        ],
      },
      {
        label: '市民热线办结率',
        value: hotlineRate,
        suffix: '%',
        decimals: 2,
        group: false,
        icon: Percent,
        tone: 'kpi-ring-green'
      },
    ];
  }, [period, mergedSummary, pendingCityOps, juweiTotal]);

  const maxPercent = Math.max(...breakdown.map((r) => r.percent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className={`screen-panel flex flex-col overflow-hidden p-2 ${className ?? ''}`}
    >
      {/* 旗帜形标题条 */}
      <div className="flex shrink-0 items-center gap-2">
        <h3 className="panel-flag">
          <Activity className="h-3.5 w-3.5" />
          <span>{compact ? '事件概览' : '重办件概览'}</span>
        </h3>
        <span className="label-muted shrink-0">来源：12345 热线</span>
        {headerExtra && <div className="ml-auto flex shrink-0 items-center">{headerExtra}</div>}
      </div>
      <div className="panel-rule mt-1.5 shrink-0" />

      {/* compact：通栏 KPI 条（环形图标 + 指标名 + 大号数值），等分铺满一行 */}
      {compact ? (
        <div className="mt-2 flex min-h-0 flex-1 items-center">
          {kpiItems.map((k, i) => (
            <div
              key={k.label}
              className="flex min-w-0 items-center gap-2.5 border-r border-[#42A5F5]/20 px-3 last:border-r-0"
              /* 带来源拆解的指标（今日待办）加宽，避免拆解行横向溢出 */
              style={{ flex: k.breakdown ? '1.35 1 0%' : '1 1 0%' }}
            >
              <span className={cn('kpi-ring', k.tone)}>
                <k.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium tracking-[0.04em] text-[#AEF4FC]">{k.label}</p>
                <p className="flex items-center gap-0.5 leading-none">
                  {kpiState === 'ok' ? (
                    <>
                      <CountUp
                        key={`kpi-${dataVersion}`}
                        value={k.value}
                        decimals={k.decimals}
                        group={k.group}
                        delay={0.2 + i * 0.1}
                        className="kpi-num-lg whitespace-nowrap font-digital"
                      />
                      <span className="kpi-unit">{k.suffix}</span>
                    </>
                  ) : (
                    <span className="metric-num font-digital">
                      {kpiState === 'loading' ? '加载中…' : '获取失败'}
                    </span>
                  )}
                  {/* 今日待办的来源拆解：城运 / 市民热线 / 聚微 三个竖列（列头 + 件数） */}
                  {k.breakdown && kpiState === 'ok' && (
                    <span className="ml-3 flex items-stretch self-center">
                      {k.breakdown.map((b, bi) => (
                        <span
                          key={b.label}
                          className={
                            bi === 0
                              ? 'flex flex-col items-center gap-0.5 px-3'
                              : 'flex flex-col items-center gap-0.5 border-l border-[#42A5F5]/25 px-3'
                          }
                        >
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-[1px]" style={{ background: b.color }} />
                            <span className="text-[11px] text-[#AEF4FC]">{b.label}</span>
                          </span>
                          <span className="font-digital text-[14px] font-bold text-white">{b.value}件</span>
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
      {/* 左侧大模块：只展示重办件统计 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="mb-1.5 flex shrink-0 items-center gap-2 border-b bg-[rgba(16,69,127,0.95)] pb-1"
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
