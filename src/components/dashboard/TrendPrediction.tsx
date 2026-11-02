// 趋势预测预警模块：以可视化方式呈现街道《群众诉求特点分析》材料结论
// - 材料属「本期」固定口径快照，不是从工单库实算，因此不随顶部统计周期变化
// - 顶部保留「场景模拟」按钮：点击后联动地图标红风险区域
import { useMemo } from 'react';
import { AlertTriangle, Calendar, CloudRain, Flame, Sun, TrendingUp, Volume2, Wind } from 'lucide-react';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter, PERIOD_LABELS } from '@/contexts/TimeFilterContext';

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
    color: '#1E88E5',
    riskTypes: ['道路积水', '环卫清运', '下水道堵塞', '井盖缺失'],
    riskAreas: ['天顺园', '华生城市广场', '丰美路', '长丰大道'],
    multiplier: '2.1倍',
    suggestion: '提前疏通天顺园、华生片区排水管网，增备抽水设备，巡查窨井盖',
  },
  {
    id: 'hightemp',
    name: '高温',
    icon: <Sun className="h-4 w-4" />,
    color: '#FF5A5F',
    riskTypes: ['异味污染', '占道夜市', '油烟扰民', '垃圾堆积'],
    riskAreas: ['城华路', '华生城市广场', '天顺园', '古田四路'],
    multiplier: '1.8倍',
    suggestion: '加强城华路、华生片区夜间巡查，清理占道烧烤摊，加大垃圾清运频次',
  },
  {
    id: 'gale',
    name: '大风',
    icon: <Wind className="h-4 w-4" />,
    color: '#42A5F5',
    riskTypes: ['高空坠物', '私搭乱建', '树枝断落', '外墙脱落'],
    riskAreas: ['东风村', '华生城市广场', '天顺园', '丰竹园'],
    multiplier: '1.6倍',
    suggestion: '排查东风村违建及老旧小区外墙，修剪行道树枝，加固临时构筑物',
  },
  {
    id: 'summer',
    name: '夏季',
    icon: <Flame className="h-4 w-4" />,
    color: '#FFB300',
    riskTypes: ['占道经营', '共享单车', '商业噪音', '夜市扰民'],
    riskAreas: ['城华路', '紫润明园', '长丰大道', '华生城市广场'],
    multiplier: '2.0倍',
    suggestion: '联合城管加强城华路、紫润明园占道整治，规范共享单车停放点位',
  },
  {
    id: 'spring',
    name: '春节',
    icon: <Calendar className="h-4 w-4" />,
    color: '#E69500',
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

/** 本期统计区间：该模块按周更新（材料为当周固定口径快照），需随周次更新此值 */
const PERIOD = '9.14-9.20';

/** 本期诉求特点（来源：街道《群众诉求特点分析》材料原文，固定口径快照，不随统计周期变化） */
const FEATURE = {
  /** 特点一：市容管理类诉求占比高 */
  cityMgmt: {
    count: 184,
    percent: 72.7,
    others: 27.3,
    /** 问题构成（材料原文表述） */
    issues: ['街头散发小广告', '占道经营', '商业噪音'],
    /** 定性研判（材料原文表述） */
    notes: ['量大面广', '反复出现', '管理难度相对较低'],
    /** 治理方向（材料原文表述） */
    advice: '常态化管控仍需加强'
  },
  /** 特点二：商业噪音重复投诉突出 */
  noise: {
    count: 22,
    redo: 8,
    redoPercent: 36.4,
    /** 定性研判（材料原文表述） */
    notes: ['群众关注度高', '处置效果与群众预期存在差距'],
    /** 治理方向（材料原文表述） */
    advices: ['多部门联合执法', '长效治理机制']
  }
};

/** 结论卡统一样式 */
const CARD = 'flex min-w-0 flex-1 flex-col rounded border border-[rgba(30,136,229,0.25)] bg-[rgba(16,69,127,0.5)] px-2.5 py-2';

/** 标签胶囊（图形旁的文字一律做成胶囊，不写成句子） */
const CHIP = 'inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-px text-[11px] leading-[16px] whitespace-nowrap';

/** 研判类标签（灰） */
const CHIP_NOTE = { borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.72)' };
/** 治理方向标签（琥珀，重点） */
const CHIP_ADVICE = { borderColor: 'rgba(255,179,0,0.5)', color: '#FFD34D' };
/** 问题构成标签（青） */
const CHIP_ISSUE = { borderColor: 'rgba(174,244,252,0.35)', color: '#AEF4FC' };

/** 小标题行（研判 / 治理方向） */
function ChipRow({ label, items, tone }: { label: string; items: string[]; tone: Record<string, string> }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="shrink-0 text-[11px] text-[#8FC7F0]">{label}</span>
      {items.map((t) => (
        <span key={t} className={CHIP} style={tone}>
          {t}
        </span>
      ))}
    </div>
  );
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
  const { orders } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();
  const periodLabel = PERIOD_LABELS[timeRange];

  /** 当前统计周期口径下的工单（用于场景关联量统计） */
  const periodOrders = useMemo(
    () => (timeRange === 'all' || !orders.length ? orders : (filterByTime(orders) as typeof orders)),
    [orders, timeRange, filterByTime]
  );

  /** 各场景关联诉求件数（按当前统计周期口径统计，从工单内容关键词提取） */
  const scenarioStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const id in SCENARIO_KEYWORDS) stats[id] = 0;
    for (const o of periodOrders) {
      const text = `${o['诉求内容'] ?? ''} ${o['诉求主题'] ?? ''} ${o['事项大类'] ?? ''} ${o['事项小类'] ?? ''}`;
      for (const [id, kws] of Object.entries(SCENARIO_KEYWORDS)) {
        if (kws.some((kw) => text.includes(kw))) stats[id] += 1;
      }
    }
    return stats;
  }, [periodOrders]);

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

  const scenarioCount = currentScenario ? (scenarioStats[currentScenario.id] ?? 0) : 0;

  return (
    <div
      className={`prediction-panel relative flex flex-col overflow-hidden rounded-[2px] px-3 py-2 ${className ?? ''}`}
      title="数据来源：街道《群众诉求特点分析》材料"
    >
      {/* 行1：标题 + 场景模拟（点击联动地图标红风险区域） */}
      <div className="flex shrink-0 items-center gap-2">
        <h3 className="panel-flag">
          <AlertTriangle className="h-4 w-4 animate-pulse" />
          <span>趋势预测预警</span>
        </h3>
        <span className="table-head ml-1 shrink-0 text-[12px]">场景模拟</span>
        {SCENARIOS.map((s) => {
          const active = (activeScenario ?? autoSeason?.id) === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScenarioClick(s.id)}
              className={`flex shrink-0 items-center gap-1 rounded border px-2 py-1 text-[12px] font-medium transition-all duration-150 ${
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
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {currentScenario && (
            <span className={CHIP} style={{ borderColor: `${currentScenario.color}66`, color: currentScenario.color }}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-[1px]" style={{ background: currentScenario.color }} />
              {currentScenario.name} · 关联 <span className="font-digital font-bold">{scenarioCount}</span> 件（
              {periodLabel}）
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">来源：群众诉求特点分析</span>
        </span>
      </div>

      {/* 行2：本期群众诉求两大特点（材料口径可视化） */}
      <div className="mt-2 flex min-h-0 flex-1 gap-2">
        {/* 特点一：市容管理类诉求占比高 —— 占比环 + 件数 + 占比条 + 文字标签 */}
        <div className={CARD}>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="chip-head">
              <TrendingUp className="h-3 w-3 shrink-0" />
              市容管理类诉求占比高
            </span>
            <span className="font-digital ml-auto shrink-0 text-[11px] text-[#8FC7F0]" title="本模块统计区间">
              {PERIOD}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {/* 占比环：72.7% */}
            <span
              className="scenario-ring shrink-0"
              style={{
                width: 58,
                height: 58,
                background: `conic-gradient(#00E5FF 0 ${FEATURE.cityMgmt.percent}%, rgba(255,255,255,0.12) ${FEATURE.cityMgmt.percent}% 100%)`
              }}
            >
              <span className="scenario-ring-inner" style={{ width: 44, height: 44 }}>
                <span className="font-digital text-[13px] font-bold text-[#4FF0FF]">{FEATURE.cityMgmt.percent}%</span>
              </span>
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-1">
                <span className="gold-num text-[26px] leading-none">{FEATURE.cityMgmt.count}</span>
                <span className="text-[12px] font-semibold text-[#FFD34D]">件</span>
                <span className="ml-1 truncate text-[11px] text-[#AEF4FC]">城市市容管理类办件</span>
              </p>
              {/* 占比条：市容管理类 / 其他 */}
              <div className="mt-1.5 flex h-3 overflow-hidden rounded-[2px] bg-white/10">
                <span
                  className="bar-grow h-full"
                  style={{
                    width: `${FEATURE.cityMgmt.percent}%`,
                    background: 'linear-gradient(90deg,#0D47A1,#42A5F5)'
                  }}
                />
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#AEF4FC]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-[#42A5F5]" />
                  市容管理类 {FEATURE.cityMgmt.percent}%
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-white/30" />
                  其他 {FEATURE.cityMgmt.others}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 pt-1.5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="shrink-0 text-[11px] text-[#8FC7F0]">问题构成</span>
              {FEATURE.cityMgmt.issues.map((t) => (
                <span key={t} className={CHIP} style={CHIP_ISSUE}>
                  {t}
                </span>
              ))}
            </div>
            <ChipRow label="研判" items={FEATURE.cityMgmt.notes} tone={CHIP_NOTE} />
            <ChipRow label="治理方向" items={[FEATURE.cityMgmt.advice]} tone={CHIP_ADVICE} />
          </div>
        </div>

        {/* 特点二：商业噪音重复投诉突出 —— 22 格点阵（8 格重办标红）+ 件数 + 文字标签 */}
        <div className={CARD}>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="chip-head">
              <Volume2 className="h-3 w-3 shrink-0" />
              商业噪音重复投诉突出
            </span>
            <span className="font-digital ml-auto shrink-0 text-[11px] text-[#8FC7F0]" title="本模块统计区间">
              {PERIOD}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {/* 点阵：每格 1 件，前 8 格为不满意重办（标红） */}
            <div className="grid w-[75px] shrink-0 grid-cols-6 gap-[3px]">
              {Array.from({ length: FEATURE.noise.count }).map((_, i) => (
                <span
                  key={i}
                  className="list-stagger h-2.5 w-2.5 rounded-[1px]"
                  style={{
                    background: i < FEATURE.noise.redo ? '#FF5A5F' : 'rgba(174,244,252,0.22)',
                    animationDelay: `${i * 22}ms`
                  }}
                  title={i < FEATURE.noise.redo ? '不满意重办' : '已处置'}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-1">
                <span className="gold-num text-[26px] leading-none">{FEATURE.noise.count}</span>
                <span className="text-[12px] font-semibold text-[#FFD34D]">件</span>
                <span className="ml-1 truncate text-[11px] text-[#AEF4FC]">商业噪音投诉</span>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="flex items-baseline gap-1">
                  <span className="font-digital text-[20px] leading-none font-bold text-[#FF5A5F]">
                    {FEATURE.noise.redo}
                  </span>
                  <span className="text-[11px] text-[#FF8A8F]">件不满意重办</span>
                </span>
                <span className="font-digital rounded-[2px] border border-[#FF5A5F]/50 bg-[#FF5A5F]/15 px-1.5 py-px text-[11px] font-bold text-[#FF8A8F]">
                  重办率 {FEATURE.noise.redoPercent}%
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#FF8A8F]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-[#FF5A5F]" />
                  不满意重办 {FEATURE.noise.redo}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-[#AEF4FC]/30" />
                  其他 {FEATURE.noise.count - FEATURE.noise.redo}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 pt-1.5">
            <ChipRow label="研判" items={FEATURE.noise.notes} tone={CHIP_NOTE} />
            <ChipRow label="治理方向" items={FEATURE.noise.advices} tone={CHIP_ADVICE} />
          </div>
        </div>
      </div>
    </div>
  );
}
