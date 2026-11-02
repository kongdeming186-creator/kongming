// 右侧：实时事件来源占比（市民热线 / 城运 / 聚微）+ 详情弹窗（三来源页签切换）
// 占比按现有数据自动统计：市民热线取真实 12345 工单，城运取区城运中心事件，聚微接入后自动生效
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Maximize2, Radio, X } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts';
import { useECharts } from '@/lib/echarts';
import { cn } from '@/lib/utils';
import PanelShell from './PanelShell';
import EventDetailCard from './EventDetailCard';
import { EventCard } from './HazardEventList';
import { CITY_OPS_EVENTS, JUWEI_EVENTS, type CityOpsEvent, type HazardEvent } from '@/data/eventData';

type SourceKey = 'hotline' | 'cityops' | 'juwei';

/** 三类事件来源配色 */
const SOURCE_COLORS: Record<SourceKey, string> = {
  hotline: '#1E88E5',
  cityops: '#FFB300',
  juwei: '#AEF4FC',
};

interface RealTimeEventTabsProps {
  events: HazardEvent[];
  liveEvents: HazardEvent[];
  onLocate: (e: HazardEvent) => void;
  className?: string;
  /** 点击城运事件明细行：关闭来源弹窗并打开城运事件详情 */
  onOpenCityOpsDetail?: (e: CityOpsEvent) => void;
}

/** 空状态提示 */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 px-4 text-center">
      <Activity className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

/** 城运事件明细行（整行可点，查看城运事件详情） */
function CityOpsRow({ e, onOpen }: { e: CityOpsEvent; onOpen?: (e: CityOpsEvent) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(e)}
      className="block w-full rounded border border-border/70 bg-secondary/25 px-3 py-2 text-left transition-colors hover:border-[#FFB300]/50 hover:bg-[#FFB300]/10"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 rounded-[2px] bg-[#FFB300] px-1.5 py-px text-[10px] font-semibold text-[#04182F]">{e.tag}</span>
        <span className="font-digital shrink-0 text-[11px] text-white">{e.reportTime}</span>
        <span
          className="ml-auto shrink-0 rounded-[2px] px-1.5 py-px text-[11px] leading-[14px] font-bold"
          style={
            e.dispatchStatus === '已结案'
              ? { backgroundColor: '#12B981', color: '#FFFFFF' }
              : { backgroundColor: '#FFB300', color: '#04182F' }
          }
        >
          {e.dispatchStatus}
        </span>
      </div>
      <p className="mt-1 text-xs leading-snug text-foreground">{e.title}</p>
      <p className="mt-1 truncate text-[11px] text-foreground">{e.address}</p>
    </button>
  );
}

export default function RealTimeEventTabs({ events, liveEvents, onLocate, className, onOpenCityOpsDetail }: RealTimeEventTabsProps) {
  const [active, setActive] = useState<SourceKey>('hotline');
  const [detailOpen, setDetailOpen] = useState(false);
  /** 弹窗内点开的事件详情（热线工单） */
  const [detailEvent, setDetailEvent] = useState<HazardEvent | null>(null);

  const isUnresolved = (e: HazardEvent) => !(e.status && e.status.includes('已办结'));
  const pendingEvents = useMemo(() => events.filter(isUnresolved), [events]);
  const pendingLive = useMemo(() => liveEvents.filter(isUnresolved), [liveEvents]);
  // 合并并按 id 去重，避免 React key 重复；按受理时间倒序（最新在前）
  const hotlineList = useMemo(() => {
    const map = new Map<string, HazardEvent>();
    for (const e of [...pendingLive, ...pendingEvents]) {
      if (e.id && !map.has(e.id)) map.set(e.id, e);
    }
    return Array.from(map.values()).sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  }, [pendingLive, pendingEvents]);

  // 三类来源占比（数据驱动，接入新来源后自动更新）
  const sourceStats = useMemo(() => {
    const raw: { key: SourceKey; label: string; count: number }[] = [
      { key: 'hotline', label: '市民热线事件', count: hotlineList.length },
      { key: 'cityops', label: '城运事件', count: CITY_OPS_EVENTS.length },
      { key: 'juwei', label: '聚微事件', count: JUWEI_EVENTS.length },
    ];
    const total = raw.reduce((s, it) => s + it.count, 0);
    return {
      total,
      items: raw.map((it) => ({
        ...it,
        color: SOURCE_COLORS[it.key],
        percent: total ? Math.round((it.count / total) * 1000) / 10 : 0,
      })),
    };
  }, [hotlineList.length]);

  // 环形图：粗环 + 极简配置（占比文字交给右侧图例，环上不画标签）
  const chartOption = useMemo<EChartsCoreOption>(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10,46,90,0.94)',
      borderColor: 'rgba(30,136,229,0.3)',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value} 件 · ${p.percent}%`,
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['52%', '92%'],
        startAngle: 90,
        itemStyle: { borderColor: 'rgba(4,24,47,0.9)', borderWidth: 2, borderRadius: 2 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 5, itemStyle: { shadowBlur: 18, shadowColor: 'rgba(30,136,229,0.55)' } },
        data: sourceStats.items.map((s) => ({ name: s.label, value: s.count, itemStyle: { color: s.color } })),
      },
    ],
  }), [sourceStats]);

  const { containerRef } = useECharts(sourceStats.total > 0 ? chartOption : null);

  /** 详情弹窗内容：按来源分发 */
  const renderDetail = () => {
    if (active === 'hotline') {
      if (!hotlineList.length) return <EmptyState text="暂无未办结的市民热线事件" />;
      return (
        <div className="hre-scroll grid h-full grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
          {hotlineList.map((e) => (
            <EventCard key={e.id} e={e} isNew={false} onLocate={setDetailEvent} />
          ))}
        </div>
      );
    }
    if (active === 'cityops') {
      if (!CITY_OPS_EVENTS.length) return <EmptyState text="暂无城运事件数据" />;
      return (
        <div className="hre-scroll h-full space-y-1.5 overflow-y-auto pr-1">
          {CITY_OPS_EVENTS.map((e) => (
            <CityOpsRow
              key={e.id}
              e={e}
              onOpen={(ev) => {
                setDetailOpen(false);
                onOpenCityOpsDetail?.(ev);
              }}
            />
          ))}
        </div>
      );
    }
    return <EmptyState text="聚微事件 · 暂无数据" />;
  };

  return (
    <>
      <PanelShell
        title="实时事件"
        subtitle={`三类来源 · 共 ${sourceStats.total} 件`}
        icon={<Activity className="h-4 w-4" />}
        className={className}
        actions={
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="flex items-center gap-1 rounded-[2px] border border-[#AEF4FC]/45 bg-[#AEF4FC]/10 px-2 py-0.5 text-[11px] text-[#AEF4FC] transition-colors hover:bg-[#AEF4FC]/20"
          >
            <Maximize2 className="h-3 w-3" />
            详情
          </button>
        }
      >
        {sourceStats.total === 0 ? (
          <EmptyState text="暂无事件来源数据" />
        ) : (
          <div className="flex h-full min-h-0 items-center gap-3">
            {/* 左：粗环形图，中心显示事件总量 */}
            <div className="relative h-full min-h-0 w-[46%] shrink-0">
              <div ref={containerRef} className="h-full w-full" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="font-digital text-[26px] leading-none font-bold text-white">{sourceStats.total}</p>
                  <p className="mt-1 text-[11px] tracking-[0.08em] text-[#AEF4FC]">事件总量</p>
                </div>
              </div>
            </div>

            {/* 右：图例列表（色块 + 来源名 + 件数 + 占比） */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
              {sourceStats.items.map((s) => (
                <div key={s.key} className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: s.color }} />
                  <span className="truncate text-[13px] text-white" title={s.label}>
                    {s.label}
                  </span>
                  <span className="font-digital ml-auto shrink-0 text-[11px] text-muted-foreground">
                    {s.count} 件
                  </span>
                  <span className="font-digital w-[52px] shrink-0 text-right text-[15px] font-bold text-white">
                    {s.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelShell>

      {/* 详情弹窗：三类来源页签切换
          用 Portal 挂到 body：大屏面板列含 transform 动画残留与 overflow-hidden，
          若就地渲染会被该列裁剪（与 CaseMatcherModal 的全屏弹窗做法一致） */}
      {detailOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="screen-panel animate-modal-in flex h-[76vh] max-h-[76vh] w-[1100px] max-w-[92vw] flex-col overflow-hidden rounded-[2px] border border-primary/40 shadow-[0_0_48px_rgba(30,136,229,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="panel-cut panel-cut-tl" />
            <span className="panel-cut panel-cut-tr" />
            <span className="panel-cut panel-cut-bl" />
            <span className="panel-cut panel-cut-br" />

            {/* 弹窗标题栏 */}
            <div className="relative flex shrink-0 items-center gap-2.5 px-5 pt-4 pb-2.5">
              <Radio className="h-5 w-5 shrink-0 text-primary" />
              <h3 className="panel-heading text-base tracking-[0.14em]">实时事件来源明细</h3>
              <span className="label-muted">三类来源 · 共 {sourceStats.total} 件</span>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-[2px] border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-risk-high/50 hover:text-risk-high"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="title-bar mx-5 h-px shrink-0 opacity-80" />

            {/* 来源页签 */}
            <div className="flex shrink-0 gap-5 border-b border-border/60 px-5 pt-3">
              {sourceStats.items.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={cn('subtab', active === s.key && 'subtab-active')}
                >
                  {s.label}
                  <span className={cn('font-digital text-[10px]', active === s.key ? 'text-[#42A5F5]' : 'text-foreground')}>
                    {s.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 来源明细列表 */}
            <div className="min-h-0 flex-1 overflow-hidden p-4">{renderDetail()}</div>
          </div>
        </div>,
        document.body
      )}

      {/* 事件详情：点来源明细里的任一条目查看完整信息
          同样用 Portal 挂 body，并置于来源弹窗之上（z-110 > z-100） */}
      {detailEvent && createPortal(
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          onClick={() => setDetailEvent(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <EventDetailCard
              event={detailEvent}
              layout="center"
              onClose={() => setDetailEvent(null)}
              onLocate={() => {
                // 定位：收起两层弹窗，回到地图并在地图上展示该事件详情
                setDetailEvent(null);
                setDetailOpen(false);
                onLocate(detailEvent);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
