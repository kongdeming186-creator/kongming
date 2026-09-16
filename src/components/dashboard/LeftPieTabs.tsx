// 左侧饼图合并模块：高频问题 / 事项大类（内部 Tab 切换）
import { useMemo, useState } from 'react';
import { Layers, PieChart } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts';
import { useECharts } from '@/lib/echarts';
import { useWeeklyAnalysis } from '@/contexts/WeeklyAnalysisContext';
import PanelShell from './PanelShell';

const CAT_COLORS = ['#c41e24', '#d4a843', '#e63c40', '#b8963f', '#a01820', '#f0c860', '#8b1014', '#e8b94a'];

type TabKey = 'highfreq' | 'category';

export default function LeftPieTabs({ className }: { className?: string }) {
  const { data } = useWeeklyAnalysis();
  const [active, setActive] = useState<TabKey>('highfreq');

  const highFreq = data.high_freq_issues_pie;
  const category = data.category_pie;
  const cityMgmt = data.city_mgmt_pie;
  const mgmtTotal = cityMgmt.reduce((s, c) => s + c.value, 0);
  const mgmtRatio = mgmtTotal ? Math.round((cityMgmt[0]?.value / mgmtTotal) * 10000) / 100 : 0;

  const option = useMemo<EChartsCoreOption>(() => {
    const baseTooltip = {
      trigger: 'item' as const,
      backgroundColor: 'rgba(26,15,10,0.92)',
      borderColor: 'rgba(212,168,67,0.3)',
      textStyle: { color: '#fff5e6', fontSize: 13 },
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value} 件 · ${p.percent}%`,
    };
    const labelStyle = {
      formatter: '{b}\n{c} 件 · {d}%',
      fontSize: 11,
      color: 'rgba(255,245,230,0.85)',
      lineHeight: 14,
    };

    if (active === 'highfreq') {
      return {
        tooltip: baseTooltip,
        series: [
          {
            type: 'pie',
            center: ['50%', '52%'],
            radius: ['40%', '66%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: 'rgba(12,8,6,0.85)', borderWidth: 2 },
            label: { show: true, ...labelStyle },
            labelLine: { length: 8, length2: 8, smooth: true },
            labelLayout: { hideOverlap: true },
            emphasis: {
              label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#fff5e6' },
              itemStyle: { shadowBlur: 16, shadowColor: 'rgba(212,168,67,0.5)' },
            },
            data: highFreq.map((s, i) => ({
              name: s.name,
              value: s.value,
              itemStyle: { color: CAT_COLORS[i % CAT_COLORS.length] },
            })),
          },
        ],
      };
    }
    // 事项大类 + 大城管占比双环
    return {
      tooltip: baseTooltip,
      series: [
        {
          type: 'pie',
          center: ['50%', '52%'],
          radius: ['44%', '66%'],
          itemStyle: { borderColor: 'rgba(12,8,6,0.85)', borderWidth: 2 },
          label: { show: true, ...labelStyle },
          labelLine: { length: 8, length2: 8, smooth: true },
          labelLayout: { hideOverlap: true },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#fff5e6' },
            itemStyle: { shadowBlur: 16, shadowColor: 'rgba(212,168,67,0.5)' },
          },
          data: category.map((s, i) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: CAT_COLORS[i % CAT_COLORS.length] },
          })),
        },
      ],
    };
  }, [active, highFreq, category]);

  const { containerRef } = useECharts(option);

  return (
    <PanelShell
      title="问题结构分析"
      icon={<PieChart className="h-4 w-4" />}
      className={className}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        {/* Tab 切换栏 */}
        <div className="flex shrink-0 gap-4 border-b border-border/60">
          {[
            { key: 'highfreq' as TabKey, label: '高频问题', icon: PieChart },
            { key: 'category' as TabKey, label: '事项大类', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className="flex items-center gap-1.5 border-b-2 pb-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: isActive ? '#d4a843' : 'transparent',
                  color: isActive ? '#d4a843' : 'rgba(255,245,230,0.55)',
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: isActive ? '#d4a843' : 'rgba(255,245,230,0.55)' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div ref={containerRef} className="h-[220px] w-full shrink-0" />
        {active === 'category' && (
          <p className="shrink-0 text-center text-[10px] text-muted-foreground">
            大城管（城市市容管理类）占比 <span className="font-digital font-bold text-primary">{mgmtRatio}%</span>
          </p>
        )}
      </div>
    </PanelShell>
  );
}