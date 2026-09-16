// 全局时间筛选条（深色科技风）：本周 / 本月 / 自定义
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTimeFilter, type TimeRangeKey } from '@/contexts/TimeFilterContext';

const BTNS: { key: TimeRangeKey; label: string }[] = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'custom', label: '自定义' },
];

export default function TimeFilterBar() {
  const { timeRange, customStart, customEnd, setTimeRange, setCustomRange } = useTimeFilter();
  const [localStart, setLocalStart] = useState(customStart);
  const [localEnd, setLocalEnd] = useState(customEnd);
  const showCustom = timeRange === 'custom';

  const handleBtn = (key: TimeRangeKey) => {
    if (key !== 'custom') {
      setTimeRange(key);
    } else {
      setTimeRange('custom');
    }
  };

  const handleDateApply = () => {
    if (localStart && localEnd) setCustomRange(localStart, localEnd);
  };

  return (
    <div className="flex flex-col gap-1">
      {/* 筛选按钮行 */}
      <div className="flex items-center gap-1">
        <span className="title-vbar mr-1 h-3 shrink-0" />
        <span className="mr-2 shrink-0 text-[10px] font-semibold tracking-widest text-muted-foreground">统计周期</span>
        <div className="flex flex-1 gap-1">
          {BTNS.map(({ key, label }) => {
            const active = timeRange === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleBtn(key)}
                className={cn(
                  'h-6 flex-1 rounded text-[11px] font-medium transition-all duration-200',
                  active
                    ? 'text-[#1a0f0a] shadow-[0_0_8px_rgba(212,168,67,0.5)]'
                    : 'text-muted-foreground hover:text-primary/90 hover:border-primary/40 border border-transparent'
                )}
                style={
                  active
                    ? { background: '#d4a843' }
                    : { background: 'rgba(30,50,80,0.7)' }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 自定义日期展开区 */}
      {showCustom && (
        <div className="flex items-center gap-1.5 pl-[3.5rem]">
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="h-6 flex-1 rounded border border-primary/30 bg-[rgba(36,21,16,0.85)] px-1.5 text-[11px] text-foreground focus:border-primary focus:outline-none"
          />
          <span className="shrink-0 text-[10px] text-muted-foreground">—</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="h-6 flex-1 rounded border border-primary/30 bg-[rgba(36,21,16,0.85)] px-1.5 text-[11px] text-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleDateApply}
            disabled={!localStart || !localEnd}
            className="h-6 shrink-0 rounded border border-primary/50 bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
          >
            确定
          </button>
        </div>
      )}
    </div>
  );
}
