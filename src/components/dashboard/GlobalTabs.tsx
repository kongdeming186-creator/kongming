// 顶部全局页签栏：3 个大屏页签（事件趋势分析 / 经济大屏 / 街道人口分布）
import { cn } from '@/lib/utils';

export type GlobalTabKey = 'trend' | 'economy' | 'population';

const TABS: { key: GlobalTabKey; label: string }[] = [
  { key: 'trend', label: '事件趋势分析' },
  { key: 'economy', label: '经济大屏' },
  { key: 'population', label: '街道人口分布' },
];

interface GlobalTabsProps {
  active: GlobalTabKey;
  onChange: (k: GlobalTabKey) => void;
}

export default function GlobalTabs({ active, onChange }: GlobalTabsProps) {
  return (
    <nav className="flex shrink-0 items-center">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn('top-nav-item', active === tab.key && 'top-nav-item-active')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}