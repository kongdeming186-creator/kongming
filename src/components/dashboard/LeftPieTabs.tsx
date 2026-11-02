// 左侧「问题结构分析」模块：高频问题 / 事项大类（内部 Tab 切换）
// 呈现方式：横向排行柱状图（左侧分类名 + 横向条形 + 底部数值轴与虚线网格），条形末端标注占比
// 数据口径：跟随顶部全局统计周期（「全部」走预聚合台账，其余周期按筛选后工单现场重算）
import { useMemo, useState } from 'react';
import { Layers, PieChart } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts';
import { useECharts } from '@/lib/echarts';
import { usePeriodSlices } from '@/hooks/useFilteredData';
import { useTimeFilter, PERIOD_LABELS } from '@/contexts/TimeFilterContext';
import { cn } from '@/lib/utils';
import PanelShell from './PanelShell';

type TabKey = 'highfreq' | 'category';

export default function LeftPieTabs({ className }: { className?: string }) {
  const { high_freq_issues_pie: highFreq, category_pie: category } = usePeriodSlices();
  const { timeRange } = useTimeFilter();
  const [active, setActive] = useState<TabKey>('highfreq');

  // 当前口径的排行数据（按件数倒序，补占比）
  const ranking = useMemo(() => {
    const src = active === 'highfreq' ? highFreq : category;
    const list = [...src].sort((a, b) => b.value - a.value);
    const total = list.reduce((s, it) => s + it.value, 0);
    return {
      total,
      items: list.map((it) => ({
        name: it.name,
        value: it.value,
        percent: total ? Math.round((it.value / total) * 1000) / 10 : 0,
      })),
    };
  }, [active, highFreq, category]);

  const option = useMemo<EChartsCoreOption>(() => ({
    grid: { left: 4, right: 44, top: 6, bottom: 2, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(30,136,229,0.14)' } },
      backgroundColor: 'rgba(10,46,90,0.94)',
      borderColor: 'rgba(30,136,229,0.3)',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (ps: { name: string; value: number; dataIndex: number }[]) => {
        const p = ps[0];
        if (!p) return '';
        return `${p.name}<br/>${p.value} 件 · ${ranking.items[p.dataIndex]?.percent ?? 0}%`;
      },
    },
    xAxis: {
      type: 'value',
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(143,199,240,0.85)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(88,178,255,0.16)', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      inverse: true, // 件数最多的排最上
      data: ranking.items.map((it) => it.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#ffffff', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 11,
        itemStyle: {
          borderRadius: [0, 3, 3, 0],
          // 自左向右由深宝蓝渐隐到亮青，呼应大屏整体蓝色阶调
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#0D47A1' },
              { offset: 0.55, color: '#1E88E5' },
              { offset: 1, color: '#5AD8FF' },
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          distance: 6,
          color: '#4FF0FF',
          fontSize: 10,
          fontWeight: 'bold',
          formatter: (p: { dataIndex: number }) => `${ranking.items[p.dataIndex]?.percent ?? 0}%`,
        },
        data: ranking.items.map((it) => it.value),
      },
    ],
  }), [ranking]);

  const { containerRef } = useECharts(option);

  return (
    <PanelShell
      title="问题结构分析"
      subtitle={`${PERIOD_LABELS[timeRange]}口径 · 总计 ${ranking.total.toLocaleString()} 件 · ${ranking.items.length} 类`}
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
                className={cn('subtab', isActive && 'subtab-active')}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 排行柱状图（汇总口径已并入标题栏，此处高度全部留给图表） */}
        <div ref={containerRef} className="min-h-0 w-full flex-1" />
      </div>
    </PanelShell>
  );
}
