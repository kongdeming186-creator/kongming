// 顶部全局页签栏：3 个大屏页签（事件趋势分析 / 经济分析地图 / 街道人口分布）
import { cn } from '@/lib/utils';

export type GlobalTabKey = 'trend' | 'economy' | 'population';

const TABS: { key: GlobalTabKey; label: string }[] = [
  { key: 'trend', label: '事件趋势分析' },
  { key: 'economy', label: '经济分析地图' },
  { key: 'population', label: '街道人口分布' },
];

interface GlobalTabsProps {
  active: GlobalTabKey;
  onChange: (k: GlobalTabKey) => void;
}

export default function GlobalTabs({ active, onChange }: GlobalTabsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-3 pb-1.5">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'group relative rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary/15 text-foreground'
                : 'bg-secondary/30 text-muted-foreground hover:text-primary/80'
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-primary shadow-[0_0_8px_rgba(212,168,67,0.7)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}