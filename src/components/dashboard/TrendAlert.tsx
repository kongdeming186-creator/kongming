// 底部右侧：趋势预警 + 复合场景模拟（严格参照截图样式，真实数据驱动）
import { useMemo, useState } from 'react';
import { Flame, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HIGH_RISK_TOP5, SEASON_ALERT, TREND_SCENARIOS, TREND_TAGS, type RiskLevel, type TrendScenario } from '@/data/mockData';
import { useRealData } from '@/contexts/RealDataContext';
import { historyHighRiskTop5, historyTrendTags, mergedDataRange, mergedHighRiskTop5, mergedTrendTags } from '@/services/dataService';

const LEVEL_META: Record<RiskLevel, { bar: string; tagBg: string; tagText: string; label: string }> = {
  high: { bar: '#ff4757', tagBg: '#ff4757', tagText: '#ffffff', label: '高风险' },
  mid: { bar: '#ffa502', tagBg: '#ffa502', tagText: '#ffffff', label: '中风险' },
  low: { bar: '#ffd32a', tagBg: '#ffd32a', tagText: '#0a1628', label: '低风险' }
};

const SCENARIO_LEVEL_LABEL: Record<RiskLevel, string> = {
  high: '红色预警',
  mid: '橙色预警',
  low: '黄色预警'
};

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, mid: 1, low: 2 };

function RiskTag({ level, size = 'sm' }: { level: RiskLevel; size?: 'sm' | 'xs' }) {
  const meta = LEVEL_META[level];
  return (
    <span
      className={cn('inline-flex shrink-0 items-center rounded font-medium', size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]')}
      style={{ backgroundColor: meta.tagBg, color: meta.tagText }}
    >
      {meta.label}
    </span>
  );
}

function ScenarioView({ scenario, trendTags, seasonAlert }: { scenario: TrendScenario; trendTags: { name: string; change: number; direction: 'up' | 'down' }[]; seasonAlert: typeof SEASON_ALERT }) {
  const items = useMemo(
    () => [...scenario.items].sort((a, b) => RISK_ORDER[a.level] - RISK_ORDER[b.level]),
    [scenario]
  );
  const growthText = scenario.growth >= 0 ? `增长约${scenario.growth}%` : `下降约${Math.abs(scenario.growth)}%`;

  return (
    <div className="space-y-2">
      {/* 预测说明（基于真实月度数据推算） */}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        基于2024-2026年同期历史数据，
        <span className="font-medium" style={{ color: '#ffa502' }}>
          下周诉求量预计较月均值{growthText}，
        </span>
        <span className="font-medium" style={{ color: '#ffa502' }}>
          主要受{scenario.factor}影响
        </span>
      </p>

      {/* 趋势警示标签（真实大类环比） */}
      {trendTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">大类环比：</span>
          {trendTags.map((t) => (
            <span
              key={t.name}
              className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                color: t.direction === 'up' ? '#ff4757' : '#2ed573',
                borderColor: t.direction === 'up' ? 'rgba(255,71,87,0.5)' : 'rgba(46,213,115,0.5)',
                backgroundColor: t.direction === 'up' ? 'rgba(255,71,87,0.12)' : 'rgba(46,213,115,0.12)'
              }}
            >
              {t.name} {t.change > 999 ? '999+' : t.direction === 'up' ? `+${t.change}%` : `${t.change}%`}
            </span>
          ))}
        </div>
      )}

      {/* 风险条目列表 */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-2 overflow-hidden rounded px-2 py-1.5"
            style={{ backgroundColor: 'rgba(36,21,16,0.6)' }}
          >
            <span className="h-6 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: LEVEL_META[item.level].bar }} />
            <div className="min-w-0 flex-1">
              <span className="text-[13px] font-bold" style={{ color: '#ff4757' }}>
                {item.category}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground">{item.desc}</span>
            </div>
            <RiskTag level={item.level} size="xs" />
          </div>
        ))}
      </div>

      {/* 季节预警（基于真实历史月度预测） */}
      <div className="rounded-md px-2 py-1.5" style={{ backgroundColor: 'rgba(10,22,40,0.8)' }}>
        <div className="flex items-start gap-1.5">
          <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-bold text-primary">{seasonAlert.period}（{seasonAlert.season}）预警：</span>
            预计工单约 <span className="font-digital font-bold text-warning" style={{ color: '#ffa502' }}>{seasonAlert.predictedOrders}</span> 件，重点关注
            {seasonAlert.focusIssues.map((f) => (
              <span key={f} className="mx-0.5 rounded bg-secondary/70 px-1 py-0.5 text-[10px] text-foreground">{f}</span>
            ))}
            等问题。{seasonAlert.reason}
          </p>
        </div>
      </div>

      {/* 建议区 */}
      <div className="rounded-md px-2 py-1.5" style={{ backgroundColor: 'rgba(10,22,40,0.8)' }}>
        <div className="flex items-start gap-1.5">
          <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="text-sm font-bold text-primary">建议：</span>
            {scenario.advice}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TrendAlert({ className }: { className?: string }) {
  const { mergedSummary, historyData } = useRealData();
  const scenarios = TREND_SCENARIOS;
  const highRiskTop5 = mergedSummary ? mergedHighRiskTop5(mergedSummary) : historyData ? historyHighRiskTop5(historyData) : HIGH_RISK_TOP5;
  const trendTags = mergedSummary ? mergedTrendTags(mergedSummary) : historyData ? historyTrendTags(historyData) : TREND_TAGS;
  const seasonAlert = SEASON_ALERT;
  const dataRange = mergedSummary ? mergedDataRange(mergedSummary) : historyData ? `${historyData.time_range.start} - ${historyData.time_range.end}` : '2024.11 - 2026.08';

  const [scenarioKey, setScenarioKey] = useState('current');
  const scenario = useMemo(
    () => scenarios.find((s) => s.key === scenarioKey) ?? scenarios[0],
    [scenarios, scenarioKey]
  );

  return (
    <div
      className={cn('tech-card-alert flex h-full min-h-0 flex-col px-3 py-2.5', className)}
      style={{ backgroundColor: 'rgba(36,21,16,0.92)' }}
    >
      {/* 顶部警告区域 */}
      <div className="mb-1.5 flex items-center gap-2">
        <TriangleAlert className="animate-warn-blink h-5 w-5 shrink-0 text-risk-high" />
        <h3 className="text-lg font-bold tracking-[1px]" style={{ color: '#ff4757' }}>
          趋势预警
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">基于真实历史数据</span>
        <span
          className="inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[11px] font-medium"
          style={{ color: '#ff4757', borderColor: '#ff4757' }}
        >
          {SCENARIO_LEVEL_LABEL[scenario.riskLevel]}
        </span>
      </div>

      {/* 时间监测行 */}
      <p className="mb-2 text-xs text-muted-foreground">下周趋势预警 · 监测中 · 数据周期 {dataRange}</p>

      {/* 高风险区域 TOP5 紧凑横条（真实关键词匹配统计） */}
      <div className="pulse-red-border mb-2 rounded border px-2 py-1.5" style={{ backgroundColor: 'rgba(36,21,16,0.6)', borderColor: 'rgba(255,71,87,0.35)' }}>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-3 w-[3px] rounded-full bg-primary" />
          <span className="text-xs font-bold text-foreground">高风险区域</span>
          <Flame className="h-3 w-3 text-risk-high" />
        </div>
        <div className="flex items-center gap-0">
          {highRiskTop5.map((r, i) => (
            <div key={r.region} className="flex min-w-0 flex-1 flex-col items-center px-1">
              <div className="flex w-full items-baseline justify-center gap-1">
                <span className="font-digital text-[10px] text-risk-high">NO.{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-center text-[11px] text-foreground">{r.region}</span>
                <span className="font-digital shrink-0 text-sm font-bold text-risk-high">{r.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 趋势预警内容（固定高度，超出由页面滚动） */}
      <div key={scenario.key} className="animate-tab-in space-y-2 overflow-hidden pr-1" style={{ height: '260px' }}>
        <ScenarioView scenario={scenario} trendTags={trendTags} seasonAlert={seasonAlert} />
      </div>

      {/* 复合场景模拟 */}
      <div className="mt-2 shrink-0">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-primary" />
          <span className="text-sm font-bold text-primary">复合场景模拟</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => {
            const isActive = s.key === scenarioKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setScenarioKey(s.key)}
                className={cn(
                  'h-8 rounded-md px-4 text-xs font-medium transition-colors',
                  isActive ? 'text-[#0a1628]' : 'text-muted-foreground hover:text-primary/90'
                )}
                style={isActive ? { backgroundColor: '#d4a843' } : { backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
