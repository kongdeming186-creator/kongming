// 构成分析模块：大城管占比 / 科室划分（内部 Tab 切换）
// 采用横向排行条呈现构成占比：比饼图更易横向比较各类别量级差异
// 数据口径：「大城管占比」可由事项大类现场重算，跟随全局统计周期；
//          「科室划分」仅历史台账含办理科室字段（实时接口未回填），保持台账口径并在标题标注
import { useMemo, useState } from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { usePeriodSlices } from '@/hooks/useFilteredData';
import { useTimeFilter, PERIOD_LABELS } from '@/contexts/TimeFilterContext';
import { useWeeklyAnalysis } from '@/contexts/WeeklyAnalysisContext';
import { cn } from '@/lib/utils';
import PanelShell from './PanelShell';

type TabKey = 'citymgmt' | 'dept';

export default function RightPieTabs({ className }: { className?: string }) {
  const { city_mgmt_pie: cityMgmt } = usePeriodSlices();
  const { dept_pie: dept } = useWeeklyAnalysis().data;
  const { timeRange } = useTimeFilter();
  const [active, setActive] = useState<TabKey>('dept');

  // 当前口径的排行数据（按件数倒序，补占比）
  const ranking = useMemo(() => {
    const src = active === 'citymgmt' ? cityMgmt : dept;
    const list = [...src].sort((a, b) => b.value - a.value);
    const max = list[0]?.value ?? 1;
    const total = list.reduce((s, it) => s + it.value, 0);
    return {
      total,
      items: list.map((it) => ({
        name: it.name,
        value: it.value,
        // 条形长度按最大值归一，占比按总量计算
        width: Math.max(2, (it.value / max) * 100),
        percent: total ? Math.round((it.value / total) * 1000) / 10 : 0,
      })),
    };
  }, [active, cityMgmt, dept]);

  /** 当前 Tab 的数据口径（科室划分仅有台账来源，明示避免误读为周期筛选结果） */
  const scopeLabel = active === 'citymgmt' ? `${PERIOD_LABELS[timeRange]}口径` : '历史台账口径';

  return (
    <PanelShell
      title="构成分析"
      subtitle={scopeLabel}
      icon={<ShieldCheck className="h-4 w-4" />}
      className={className}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        {/* Tab 切换栏 */}
        <div className="flex shrink-0 gap-4 border-b border-border/60">
          {[
            { key: 'dept' as TabKey, label: '科室划分', icon: Building2 },
            { key: 'citymgmt' as TabKey, label: '大城管占比', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn('subtab', isActive && 'subtab-active')}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 口径汇总 */}
        <div className="flex shrink-0 items-baseline gap-1.5">
          <span className="label-muted">总计</span>
          <span className="font-digital text-[18px] font-bold leading-none text-white">
            {ranking.total.toLocaleString()}
          </span>
          <span className="kpi-unit">件</span>
          <span className="label-muted ml-auto">{ranking.items.length} 类</span>
        </div>

        {/* 排行条列表 */}
        <div className="hre-scroll min-h-0 flex-1 space-y-1 overflow-y-auto">
          {ranking.items.map((it, i) => (
            <div key={it.name} className="bar-row">
              <span
                className={cn('bar-row-fill', i === 0 && 'bar-row-fill-top')}
                style={{ width: `${it.width}%` }}
              />
              <span className={cn('rank-badge', i === 0 && 'rank-badge-top')}>{i + 1}</span>
              <span className="truncate text-[13px] text-white" title={it.name}>
                {it.name}
              </span>
              <span className="ml-auto shrink-0 font-digital text-[13px] font-bold text-white">
                {it.value.toLocaleString()}
                <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">件</span>
              </span>
              <span className="w-[42px] shrink-0 text-right font-digital text-[12px] font-semibold text-[#4FF0FF]">
                {it.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}
