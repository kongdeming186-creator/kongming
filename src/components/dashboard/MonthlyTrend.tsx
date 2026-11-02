// 右侧：市民热线事件月度趋势（按年查看 12 个月受理量）+ 右上角「详情」弹窗入口
// 版面分配：上部折线图固定高度（保持约 1.6:1 的宽高比，避免被拉伸成陡线），
//          下部「月度明细」按 12 行等分填满剩余空间，图表与数据互为印证
// 数据口径：月度趋势基于全量历史工单（跨统计周期），年份可切换，默认取数据内最新年份
import { useMemo, useState } from 'react';
import { Maximize2, TrendingUp } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts';
import { useECharts } from '@/lib/echarts';
import { useRealData } from '@/contexts/RealDataContext';
import { cn } from '@/lib/utils';
import type { HazardEvent } from '@/data/eventData';
import PanelShell from './PanelShell';
import ReportDetailModal from './ReportDetailModal';

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
/** 折线图区固定高度：保证图形比例稳定，不被容器高度拉伸 */
const CHART_H = 296;

export default function MonthlyTrend({
  className,
  onLocate,
}: {
  className?: string;
  onLocate?: (e: HazardEvent) => void;
}) {
  const { orders } = useRealData();
  const [detailOpen, setDetailOpen] = useState(false);
  const [year, setYear] = useState('');

  /** 按「受理时间」聚合各年 12 个月的受理量 */
  const byYear = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const o of orders) {
      const t = String(o['受理时间'] ?? '');
      const y = t.slice(0, 4);
      const m = Number(t.slice(5, 7));
      if (!/^\d{4}$/.test(y) || !(m >= 1 && m <= 12)) continue;
      const arr = map.get(y) ?? new Array(12).fill(0);
      arr[m - 1] += 1;
      map.set(y, arr);
    }
    return map;
  }, [orders]);

  const years = useMemo(() => [...byYear.keys()].sort(), [byYear]);
  const activeYear = year || years[years.length - 1] || '';
  const data = byYear.get(activeYear) ?? new Array(12).fill(0);
  const total = data.reduce((a, b) => a + b, 0);
  const peak = Math.max(...data, 0);
  const peakIdx = peak > 0 ? data.indexOf(peak) : -1;
  const peakMonth = peakIdx >= 0 ? `${peakIdx + 1}月` : '—';
  const activeMonths = data.filter((v) => v > 0).length;
  const avg = activeMonths ? Math.round(total / activeMonths) : 0;

  /** 月度明细：占比 + 环比（环比为正表示受理量上升，用暖色提示） */
  const rows = useMemo(
    () =>
      data.map((v, i) => {
        const prev = i > 0 ? data[i - 1] : null;
        const mom = prev && prev > 0 ? Math.round(((v - prev) / prev) * 1000) / 10 : null;
        return {
          label: MONTH_LABELS[i],
          value: v,
          percent: total ? Math.round((v / total) * 1000) / 10 : 0,
          mom,
          width: peak ? Math.round((v / peak) * 100) : 0,
          /** 峰值月：全表唯一的金色高亮项（本模块第二配色） */
          isPeak: i === peakIdx,
        };
      }),
    [data, total, peak, peakIdx]
  );

  const option = useMemo<EChartsCoreOption>(() => ({
    grid: { left: 6, right: 14, top: 30, bottom: 2, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      icon: 'circle',
      data: ['市民热线数量'],
      textStyle: { color: '#AEF4FC', fontSize: 12 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,33,68,0.95)',
      borderColor: 'rgba(79,240,255,0.35)',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (ps: { axisValue: string; value: number }[]) => {
        const p = ps[0];
        if (!p) return '';
        return `${p.axisValue}<br/>受理 ${p.value.toLocaleString()} 件`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: MONTH_LABELS,
      axisLine: { lineStyle: { color: 'rgba(120,196,255,0.35)' } },
      axisTick: { show: false },
      axisLabel: { color: '#AEF4FC', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#AEF4FC',
        fontSize: 12,
        formatter: (v: number) => v.toLocaleString(),
      },
      splitLine: { lineStyle: { color: 'rgba(120,196,255,0.14)', type: 'dashed' } },
    },
    /** 配色规则（本模块只用两色）：主数据 = 亮青，峰值 = 金。
        全模块原先一律蓝，与蓝色面板底色同色系，图形和底分不开 */
    series: [
      {
        name: '市民热线数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: data.map((v) => ({
          value: v,
          symbolSize: v === peak && peak > 0 ? 10 : 6,
          itemStyle:
            v === peak && peak > 0
              ? { color: '#FFB300', borderColor: '#0B1E38', borderWidth: 2 }
              : { color: '#0B1E38', borderColor: '#4FF0FF', borderWidth: 2 },
        })),
        lineStyle: { width: 2.6, color: '#4FF0FF', shadowBlur: 10, shadowColor: 'rgba(0,229,255,0.5)' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79,240,255,0.3)' },
              { offset: 1, color: 'rgba(79,240,255,0.01)' },
            ],
          },
        },
      },
    ],
  }), [data, peak]);

  const { containerRef } = useECharts(option);

  return (
    <>
      <PanelShell
        title="市民热线事件月度趋势"
        subtitle={activeYear ? `累计 ${total.toLocaleString()} 件` : undefined}
        icon={<TrendingUp className="h-4 w-4" />}
        className={className}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={activeYear}
              onChange={(e) => setYear(e.target.value)}
              aria-label="选择年份"
              title={`${activeYear} 年累计 ${total.toLocaleString()} 件 · 月均 ${avg.toLocaleString()} 件 · 峰值 ${peakMonth}`}
              className="h-[22px] shrink-0 rounded-[2px] border border-[#42A5F5]/50 bg-[#10457f]/80 px-1.5 text-[12px] text-white focus:border-[#00E5FF] focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#04182F]">
                  {y} 年
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="flex items-center gap-1 rounded-[2px] border border-[#AEF4FC]/45 bg-[#AEF4FC]/10 px-2 py-0.5 text-[11px] text-[#AEF4FC] transition-colors hover:bg-[#AEF4FC]/20"
            >
              <Maximize2 className="h-3 w-3" />
              详情
            </button>
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* 上部：折线图（固定高度，保证比例） */}
          <div ref={containerRef} className="shrink-0" style={{ height: CHART_H }} />

          {/* 下部：月度明细（12 行等分填满） */}
          <div className="mt-1.5 flex min-h-0 flex-1 flex-col rounded border border-[rgba(79,240,255,0.22)] bg-[rgba(7,34,66,0.6)] px-2 py-1">
            <div className="grid shrink-0 grid-cols-[32px_1fr_62px_48px_54px] items-center gap-1.5 border-b border-[rgba(79,240,255,0.25)] pb-0.5 text-[11px] text-[#AEF4FC]/85">
              <span>月份</span>
              <span>受理量分布</span>
              <span className="text-right">受理量</span>
              <span className="text-right">占比</span>
              <span className="text-right">环比</span>
            </div>
            {/* key 绑定年份：切换年份时明细行重挂载，播放生长与逐条入场动画 */}
            <div key={activeYear} className="flex min-h-0 flex-1 flex-col">
              {rows.map((r, i) => (
                <div
                  key={r.label}
                  className="list-stagger grid min-h-0 flex-1 grid-cols-[32px_1fr_62px_48px_54px] items-center gap-1.5"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span
                    className={cn(
                      'text-[11px]',
                      r.isPeak ? 'font-bold text-[#FFD34D]' : 'text-[#AEF4FC]'
                    )}
                  >
                    {r.label}
                  </span>
                  <span className="relative h-1.5 overflow-hidden rounded-[1px] bg-white/10">
                    <span
                      className={cn(
                        'bar-grow absolute inset-y-0 left-0 rounded-[1px] bg-gradient-to-r',
                        r.isPeak
                          ? 'from-[#8A5A00] via-[#E69500] to-[#FFD34D]'
                          : 'from-[#0C5B7A] via-[#1E9BC4] to-[#4FF0FF]'
                      )}
                      style={{ width: `${r.width}%`, animationDelay: `${i * 40}ms` }}
                    />
                  </span>
                  <span
                    className={cn(
                      'text-right font-digital text-[12px] font-bold',
                      r.isPeak ? 'text-[#FFD34D]' : 'text-white'
                    )}
                  >
                    {r.value.toLocaleString()}
                  </span>
                  <span className="text-right font-digital text-[11px] text-[#C6DDF0]">{r.percent}%</span>
                  <span
                    className={cn(
                      'text-right font-digital text-[11px]',
                      r.mom === null ? 'text-[#8FA9BF]' : r.mom > 0 ? 'text-risk-mid' : 'text-success'
                    )}
                  >
                    {r.mom === null ? '—' : `${r.mom > 0 ? '+' : ''}${r.mom}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanelShell>

      <ReportDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} onLocate={onLocate} />
    </>
  );
}
