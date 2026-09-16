// 右侧：实时事件 Tab（市民热线事件 / 城运事件 / 聚微事件）
// 数据按 data.json 事件来源字段区分；市民热线为未办结事件，城运/聚微当前数据源无对应来源时展示空状态
import { useMemo, useState } from 'react';
import { Activity, Building2, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import PanelShell from './PanelShell';
import { EventCard } from './HazardEventList';
import type { HazardEvent } from '@/data/eventData';

type TabKey = 'hotline' | 'cityops' | 'juwei';

const TABS: { key: TabKey; label: string; icon: typeof Activity }[] = [
  { key: 'hotline', label: '市民热线事件', icon: Radio },
  { key: 'cityops', label: '城运事件', icon: Building2 },
  { key: 'juwei', label: '聚微事件', icon: Activity },
];

interface RealTimeEventTabsProps {
  events: HazardEvent[];
  liveEvents: HazardEvent[];
  onLocate: (e: HazardEvent) => void;
  className?: string;
}

/** 空状态提示 */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 text-center">
      <Activity className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export default function RealTimeEventTabs({ events, liveEvents, onLocate, className }: RealTimeEventTabsProps) {
  const [active, setActive] = useState<TabKey>('hotline');

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

  const counts: Record<TabKey, number> = {
    hotline: hotlineList.length,
    cityops: 0,
    juwei: 0,
  };

  const renderContent = () => {
    if (active === 'hotline') {
      if (!hotlineList.length) return <EmptyState text="暂无未办结的市民热线事件" />;
      return (
        <div className="space-y-1.5 overflow-y-auto pr-1" style={{ height: '320px' }}>
          {hotlineList.map((e) => (
            <EventCard key={e.id} e={e} isNew={false} onLocate={onLocate} />
          ))}
        </div>
      );
    }
    if (active === 'cityops') return <EmptyState text="暂无城运事件数据" />;
    return <EmptyState text="聚微事件 · 暂无数据" />;
  };

  return (
    <PanelShell
      title="实时事件"
      subtitle={`待处理 ${counts.hotline} 件`}
      icon={<Activity className="h-4 w-4" />}
      className={className}
    >
      <div className="flex flex-col gap-2">
        {/* Tab 切换栏（固定不动） */}
        <div className="flex shrink-0 gap-4 border-b border-border/60">
          {TABS.map((tab) => {
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
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: isActive ? '#d4a843' : 'rgba(255,245,230,0.55)' }}
                />
                {tab.label}
                <span className={cn('font-digital text-[10px]', isActive ? 'text-primary' : 'text-muted-foreground')}>
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {renderContent()}
      </div>
    </PanelShell>
  );
}