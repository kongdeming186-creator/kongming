// 全局时间筛选：本周 / 本月 / 全部 / 自定义
// compact = 嵌入「事件概览」标题栏的紧凑版；默认版用于独立一行
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTimeFilter, type TimeRangeKey } from '@/contexts/TimeFilterContext';

const BTNS: { key: TimeRangeKey; label: string }[] = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '全部' },
  { key: 'custom', label: '自定义' },
];

export default function TimeFilterBar({ compact = false }: { compact?: boolean }) {
  const { timeRange, customStart, customEnd, setTimeRange, setCustomRange } = useTimeFilter();
  const [localStart, setLocalStart] = useState(customStart);
  const [localEnd, setLocalEnd] = useState(customEnd);
  const showCustom = timeRange === 'custom';
  const inputCls = cn(
    'rounded-[2px] border border-[#42A5F5]/50 bg-[#10457f]/80 px-1.5 text-white focus:border-[#00E5FF] focus:outline-none',
    compact ? 'h-[22px] text-[11px]' : 'h-[30px] text-[12px]'
  );

  const handleDateApply = () => {
    if (localStart && localEnd) setCustomRange(localStart, localEnd);
  };

  return (
    <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
      <span className="seg-label">统计周期</span>

      <div className={cn('seg-group', compact && 'seg-group-sm')}>
        {BTNS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTimeRange(key)}
            className={cn('seg-item', compact && 'seg-item-sm', timeRange === key && 'seg-item-active')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 自定义日期区间 */}
      {showCustom && (
        <div className="flex shrink-0 items-center gap-1.5">
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className={inputCls}
          />
          <span className="shrink-0 text-[11px] text-muted-foreground">—</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleDateApply}
            disabled={!localStart || !localEnd}
            className={cn(
              'shrink-0 rounded-[2px] border border-[#00E5FF]/70 bg-[#00E5FF]/15 font-semibold text-[#4FF0FF] transition-colors hover:bg-[#00E5FF]/25 disabled:opacity-40',
              compact ? 'h-[22px] px-2 text-[11px]' : 'h-[30px] px-2.5 text-[12px]'
            )}
          >
            确定
          </button>
        </div>
      )}
    </div>
  );
}
