// 趋势预测预警模块：基于历史数据规律预判区域风险（以周为维度做同期数据分析）
// 当前月自动显示季节风险 + 场景模拟（暴雨/高温/大风/夏季/春节）+ 下周预测 + 周维度波动分析
import { useMemo } from 'react';
import { AlertTriangle, BarChart3, CloudRain, Flame, Sun, Wind, Calendar } from 'lucide-react';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter } from '@/contexts/TimeFilterContext';
import type { TrendPrediction as TP } from '@/services/dataService';

const FALLBACK: TP = {
  seasonal_peak: { month: '', total: 0, index: 0, description: '' },
  category_concentration: { category: '', month: '', percentage: 0, description: '' },
  next_week_forecast: { period: '', category: '', predicted_count: 0, increase_percentage: 0, reason: '', description: '' },
  composite_scenario: { scenario: '', multiplier: 0, description: '', suggestions: [] },
  monthly_seasonal_index: {},
  generated_at: '',
};

/** 场景 → 关键词（从真实历史工单内容中提取相关诉求，用于统计真实风险量） */
const SCENARIO_KEYWORDS: Record<string, string[]> = {
  rainstorm: ['暴雨', '大雨', '积水', '淹水', '内涝', '排水', '井盖', '下水道', '雨污', '水浸', '雨涝'],
  hightemp: ['高温', '异味', '臭味', '臭气', '油烟', '夜市', '烧烤', '垃圾', '炎热'],
  gale: ['大风', '狂风', '台风', '坠物', '掉落', '吹落', '树枝', '外墙', '搭建', '违建'],
  summer: ['占道', '单车', '共享', '噪音', '夜市', '烧烤', '油烟'],
  spring: ['噪音', '油烟', '占道', '鞭炮', '烟花', '春节'],
};

/** 场景定义：基于15,308条历史数据分析 */
interface ScenarioDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  riskTypes: string[];
  riskAreas: string[];
  multiplier: string;
  suggestion: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'rainstorm',
    name: '暴雨',
    icon: <CloudRain className="h-4 w-4" />,
    color: '#3b82f6',
    riskTypes: ['道路积水', '环卫清运', '下水道堵塞', '井盖缺失'],
    riskAreas: ['天顺园', '华生城市广场', '丰美路', '长丰大道'],
    multiplier: '2.1倍',
    suggestion: '提前疏通天顺园、华生片区排水管网，增备抽水设备，巡查窨井盖',
  },
  {
    id: 'hightemp',
    name: '高温',
    icon: <Sun className="h-4 w-4" />,
    color: '#ef4444',
    riskTypes: ['异味污染', '占道夜市', '油烟扰民', '垃圾堆积'],
    riskAreas: ['城华路', '华生城市广场', '天顺园', '古田四路'],
    multiplier: '1.8倍',
    suggestion: '加强城华路、华生片区夜间巡查，清理占道烧烤摊，加大垃圾清运频次',
  },
  {
    id: 'gale',
    name: '大风',
    icon: <Wind className="h-4 w-4" />,
    color: '#8b5cf6',
    riskTypes: ['高空坠物', '私搭乱建', '树枝断落', '外墙脱落'],
    riskAreas: ['东风村', '华生城市广场', '天顺园', '丰竹园'],
    multiplier: '1.6倍',
    suggestion: '排查东风村违建及老旧小区外墙，修剪行道树枝，加固临时构筑物',
  },
  {
    id: 'summer',
    name: '夏季',
    icon: <Flame className="h-4 w-4" />,
    color: '#f59e0b',
    riskTypes: ['占道经营', '共享单车', '商业噪音', '夜市扰民'],
    riskAreas: ['城华路', '紫润明园', '长丰大道', '华生城市广场'],
    multiplier: '2.0倍',
    suggestion: '联合城管加强城华路、紫润明园占道整治，规范共享单车停放点位',
  },
  {
    id: 'spring',
    name: '春节',
    icon: <Calendar className="h-4 w-4" />,
    color: '#dc2626',
    riskTypes: ['商业噪音', '油烟污染', '占道经营', '异味扰民'],
    riskAreas: ['城华路', '紫润明园', '华生城市广场', '长丰大道'],
    multiplier: '1.9倍',
    suggestion: '春节前重点管控城华路、紫润明园商业噪音和油烟排放，加大巡查力度',
  },
];

/** 当前月份自动匹配季节 */
function getCurrentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 8) return 'summer';
  if (m === 1 || m === 2) return 'spring';
  return '';
}

export default function TrendPrediction({
  className,
  activeScenario,
  onScenarioChange,
}: {
  className?: string;
  activeScenario: string | null;
  onScenarioChange: (s: string | null) => void;
}) {
  const { trendPrediction, mergedSummary, orders } = useRealData();
  useTimeFilter();

  const tp = useMemo(() => {
    const base = trendPrediction ?? FALLBACK;
    const mt = mergedSummary?.monthly_trend;
    if (!mt?.length) return base;
    const totals = mt.map((x) => x.total);
    const maxV = Math.max(...totals);
    const maxM = mt[totals.indexOf(maxV)];
    const avg = totals.reduce((s, v) => s + v, 0) / totals.length;
    const index = +(maxV / avg).toFixed(2);
    return {
      ...base,
      seasonal_peak: { ...base.seasonal_peak, month: maxM.month, total: maxV, index, description: `${maxM.month.slice(5)}月为历史峰值（月均 ${Math.round(avg)} 件）` },
    };
  }, [trendPrediction, mergedSummary]);

  const sp = tp.seasonal_peak;

  /** 真实下周预测：基于历史工单按周聚合，下周工单量 = 去年同期同周工单量（缺失回退近8周均值） */
  const forecast = useMemo(() => {
    const DAY = 86_400_000;
    const weekMonday = (d: Date) => {
      const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      dd.setDate(dd.getDate() - ((dd.getDay() + 6) % 7));
      return dd;
    };
    const map = new Map<number, { count: number; cats: Map<string, number> }>();
    for (const o of orders) {
      const s = o['受理时间'] ?? '';
      if (s.length < 10) continue;
      const d = new Date(s.replace(/-/g, '/'));
      if (Number.isNaN(d.getTime())) continue;
      const ws = weekMonday(d).getTime();
      const rec = map.get(ws) ?? { count: 0, cats: new Map() };
      rec.count += 1;
      const cat = (o['事项大类'] || o['事项小类'] || '其他').trim();
      if (cat) rec.cats.set(cat, (rec.cats.get(cat) ?? 0) + 1);
      map.set(ws, rec);
    }
    const now = new Date();
    const thisMon = weekMonday(now).getTime();
    const nextMon = thisMon + 7 * DAY;
    const lyMon = nextMon - 52 * 7 * DAY; // 去年同期同周（约 52 周前）
    const fmt = (t: number) => {
      const d = new Date(t);
      return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`;
    };
    let sum8 = 0;
    let cnt8 = 0;
    for (let i = 1; i <= 8; i++) {
      const c = map.get(thisMon - i * 7 * DAY)?.count;
      if (c != null) { sum8 += c; cnt8 += 1; }
    }
    const avg8 = cnt8 ? Math.round(sum8 / cnt8) : 0;
    const lyRec = map.get(lyMon);
    const lyCount = lyRec?.count ?? 0;
    const predicted = lyCount > 0 ? lyCount : avg8;
    const base = avg8 > 0 ? avg8 : 1;
    const pct = Math.round(((predicted - base) / base) * 1000) / 10;
    let topCat = '';
    if (lyRec && lyRec.cats.size) {
      topCat = [...lyRec.cats.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    }
    return {
      ready: orders.length > 0,
      predicted,
      pct,
      topCat,
      avg8,
      lyCount,
      nextLabel: `${fmt(nextMon)}-${fmt(nextMon + 6 * DAY)}`,
      lyLabel: `${fmt(lyMon)}-${fmt(lyMon + 6 * DAY)}`,
    };
  }, [orders]);

  /** 各场景历史真实关联诉求件数（从工单内容关键词提取，保证关联性） */
  const scenarioStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const id in SCENARIO_KEYWORDS) stats[id] = 0;
    for (const o of orders) {
      const text = `${o['诉求内容'] ?? ''} ${o['诉求主题'] ?? ''} ${o['事项大类'] ?? ''} ${o['事项小类'] ?? ''}`;
      for (const [id, kws] of Object.entries(SCENARIO_KEYWORDS)) {
        if (kws.some((kw) => text.includes(kw))) stats[id] += 1;
      }
    }
    return stats;
  }, [orders]);

  /** 周维度波动分析：只对比本周（截至目前）与上周 */
  const weekly = useMemo(() => {
    const DAY = 86_400_000;
    const counts = new Map<number, number>();
    for (const o of orders) {
      const s = o['受理时间'] ?? '';
      if (s.length < 10) continue;
      const d = new Date(s.replace(/-/g, '/'));
      if (Number.isNaN(d.getTime())) continue;
      const dayIdx = (d.getDay() + 6) % 7; // 周一=0
      const ws = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayIdx).getTime();
      counts.set(ws, (counts.get(ws) ?? 0) + 1);
    }
    const now = new Date();
    const dayIdx = (now.getDay() + 6) % 7;
    const thisMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayIdx).getTime();
    const lastMon = thisMon - 7 * DAY;
    const fmt = (t: number) => {
      const d = new Date(t);
      return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`;
    };
    const thisWeekCount = counts.get(thisMon) ?? 0;
    const lastWeekCount = counts.get(lastMon) ?? 0;
    const weeks = [
      { label: `上周 ${fmt(lastMon)}-${fmt(lastMon + 6 * DAY)}`, count: lastWeekCount },
      { label: `本周 ${fmt(thisMon)}-${fmt(thisMon + 6 * DAY)}`, count: thisWeekCount },
    ];
    const change = thisWeekCount - lastWeekCount;
    const momPct = lastWeekCount > 0 ? Math.round((change / lastWeekCount) * 1000) / 10 : thisWeekCount > 0 ? 100 : 0;
    const max = Math.max(thisWeekCount, lastWeekCount, 1);
    return { weeks, thisWeek: thisWeekCount, lastWeek: lastWeekCount, change, momPct, max, ready: orders.length > 0 };
  }, [orders]);

  /** 波动分析结论：只对比本周与上周 */
  const analyzeText = useMemo(() => {
    if (!weekly.ready) return '正在接入历史数据，稍后展示本周与上周对比分析…';
    const w = weekly;
    const dir = w.momPct >= 0 ? '上升' : '下降';
    return `本周（${w.weeks[1].label}）已受理工单 ${w.thisWeek} 件，较上周（${w.weeks[0].label}，${w.lastWeek} 件）${dir} ${Math.abs(w.momPct)}%，变化量 ${Math.abs(w.change)} 件。`;
  }, [weekly]);

  // 当前月份自动匹配季节
  const autoSeason = useMemo(() => {
    const sid = getCurrentSeason();
    return sid ? SCENARIOS.find((s) => s.id === sid) : null;
  }, []);

  // 当前激活的场景（手动选优先，否则自动）
  const currentScenario = activeScenario
    ? SCENARIOS.find((s) => s.id === activeScenario) ?? null
    : autoSeason;

  const handleScenarioClick = (id: string) => {
    onScenarioChange(activeScenario === id ? null : id);
  };

  return (
    <div className={`prediction-panel relative overflow-hidden rounded-md p-3 ${className ?? ''}`}>
      {/* 标题栏 */}
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 animate-pulse text-risk-high" />
        <h3 className="font-serif-gov text-base font-semibold tracking-wide text-[#d4a843]">趋势预测预警</h3>
        <span className="rounded-[2px] bg-[#c41e24] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_8px_rgba(230,60,64,0.45)]">周维度分析</span>
        <span className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          {mergedSummary && <span className="font-digital">基数 {mergedSummary.total.toLocaleString()} 件</span>}
        </span>
      </div>

      {/* 场景模拟按钮栏 */}
      <div className="mb-2">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground">场景模拟</span>
          {autoSeason && !activeScenario && (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">
              当前季节：{autoSeason.name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => {
            const active = (activeScenario ?? autoSeason?.id) === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleScenarioClick(s.id)}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? 'border-transparent text-white shadow-md'
                    : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                style={active ? { backgroundColor: s.color, borderColor: s.color } : undefined}
              >
                {s.icon}
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 场景预警详情 + 下周预测 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 左：场景预警 */}
        <div className="flex min-w-0 flex-col rounded border border-[rgba(212,168,67,0.2)] bg-[rgba(36,21,16,0.55)] p-2">
          {currentScenario ? (
            <>
              <div className="mb-1 flex items-center gap-1.5">
                <span style={{ color: currentScenario.color }}>{currentScenario.icon}</span>
                <span className="text-xs font-semibold text-foreground">{currentScenario.name}风险预警</span>
                <span className="ml-auto gold-num text-sm font-bold">历史 {scenarioStats[currentScenario.id] ?? 0} 件</span>
              </div>
              <div className="space-y-1">
                <div>
                  <p className="text-[9px] text-muted-foreground">高发问题</p>
                  <div className="flex flex-wrap gap-1">
                    {currentScenario.riskTypes.map((t) => (
                      <span key={t} className="rounded bg-risk-high/15 px-1 py-0.5 text-[9px] text-risk-high">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">高发区域（地图已标红）</p>
                  <p className="text-[10px] leading-relaxed text-foreground/90">
                    {currentScenario.riskAreas.join('、')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-1 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-risk-high" />
                <span className="text-xs font-semibold text-foreground">季节性峰值</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="gold-num text-lg">{sp.index}倍</span>
                <span className="text-[10px] text-muted-foreground">{sp.month.slice(5)}月</span>
              </div>
              <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground">
                <span className="gold-num">{sp.total}</span> 件 · {sp.description}
              </p>
            </>
          )}
        </div>

        {/* 右：下周预测 */}
        <div className="flex min-w-0 flex-col rounded border border-[rgba(212,168,67,0.2)] bg-[rgba(36,21,16,0.55)] p-2">
          <div className="mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-risk-high" />
            <span className="text-xs font-semibold text-foreground">下周预测</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="gold-num text-lg">{forecast.ready ? forecast.predicted : '—'}件</span>
            {forecast.ready && forecast.pct !== 0 && (
              <span className={`gold-num text-xs ${forecast.pct >= 0 ? '' : 'text-success'}`}>
                {forecast.pct >= 0 ? '+' : ''}{forecast.pct}%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {forecast.ready ? `${forecast.nextLabel} · ${forecast.topCat || '—'}` : '历史数据接入中…'}
          </p>
          <p className="mt-0.5 text-[9px] leading-snug text-foreground/80">
            {forecast.ready
              ? `历史同期（${forecast.lyLabel}）受理 ${forecast.lyCount} 件 · 近8周均值 ${forecast.avg8} 件`
              : '基于历史同期事件分析'}
          </p>
          {/* 历史同期规律（真实季节性峰值） */}
          <div className="mt-1.5 rounded border border-[rgba(196,30,36,0.3)] bg-[rgba(196,30,36,0.06)] px-1.5 py-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] font-semibold text-foreground">历史季节性峰值</span>
              <span className="gold-num text-xs font-bold">{sp.index}倍</span>
            </div>
            <p className="text-[9px] text-muted-foreground">{sp.month.slice(5)}月为全年峰值 · {sp.description}</p>
          </div>
        </div>
      </div>

      {/* 事件波动分析和趋势预测：只做本周与上周对比（紧凑数字呈现，不占地图空间） */}
      <div className="mt-2">
        <div className="mb-1 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-xs font-semibold text-primary">事件波动分析和趋势预测</span>
          <span className="ml-auto text-[9px] text-muted-foreground">本周 vs 上周</span>
        </div>
        <div className="rounded border border-[rgba(212,168,67,0.3)] border-l-[3px] border-l-[#d4a843] bg-[rgba(196,30,36,0.06)] px-2 py-1.5">
          {/* 本周/上周关键指标（紧凑一行） */}
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="rounded bg-secondary/30 px-1 py-0.5">
              <p className="font-digital text-xs font-semibold text-foreground">{weekly.ready ? weekly.lastWeek : '—'}</p>
              <p className="text-[9px] text-muted-foreground">上周（件）</p>
            </div>
            <div className="rounded bg-secondary/30 px-1 py-0.5">
              <p className="font-digital text-xs font-semibold text-foreground">{weekly.ready ? weekly.thisWeek : '—'}</p>
              <p className="text-[9px] text-muted-foreground">本周（件）</p>
            </div>
            <div className="rounded bg-secondary/30 px-1 py-0.5">
              <p className={`font-digital text-xs font-semibold ${weekly.momPct >= 0 ? 'text-risk-high' : 'text-success'}`}>
                {weekly.ready ? `${weekly.momPct >= 0 ? '+' : ''}${weekly.momPct}%` : '—'}
              </p>
              <p className="text-[9px] text-muted-foreground">周环比</p>
            </div>
            <div className="rounded bg-secondary/30 px-1 py-0.5">
              <p className={`font-digital text-xs font-semibold ${weekly.change >= 0 ? 'text-risk-high' : 'text-success'}`}>
                {weekly.ready ? `${weekly.change >= 0 ? '+' : ''}${weekly.change}` : '—'}
              </p>
              <p className="text-[9px] text-muted-foreground">变化量（件）</p>
            </div>
          </div>
          {/* 自动生成的波动分析结论 */}
          <p className="mt-1 border-t border-border/40 pt-1 text-[10px] leading-relaxed text-foreground/90">
            {analyzeText}
          </p>
        </div>
      </div>
    </div>
  );
}
