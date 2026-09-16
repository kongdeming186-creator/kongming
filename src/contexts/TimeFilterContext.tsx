// 全局时间筛选上下文：大屏统一统计周期（本周/本月/本季度/本年/全部/自定义）
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type TimeRangeKey = 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface TimeFilterState {
  timeRange: TimeRangeKey;
  /** yyyy-MM-dd */
  customStart: string;
  /** yyyy-MM-dd */
  customEnd: string;
  setTimeRange: (range: TimeRangeKey) => void;
  setCustomRange: (start: string, end: string) => void;
  /** 按当前时间范围过滤数据数组（week/month/quarter/year 以数据最新时间为基准，custom 为显式日期区间） */
  filterByTime: <T>(data: T[], timeField?: string) => T[];
}

const TimeFilterContext = createContext<TimeFilterState | null>(null);

const DAY_MS = 86_400_000;

/** 解析 'yyyy-MM-dd' 或 'yyyy-MM-dd HH:mm:ss' 时间字符串 */
function parseTime(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s.replace(/-/g, '/'));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function TimeFilterProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const setCustomRange = useCallback((start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setTimeRange('custom');
  }, []);

  const filterByTime = useCallback(
    <T,>(data: T[], timeField = '受理时间'): T[] => {
      if (timeRange === 'all') return data;

      let start: Date | null = null;
      let end: Date | null = null;

      const timeOf = (row: T): Date | null => parseTime(String((row as Record<string, unknown>)[timeField] ?? ''));

      if (timeRange === 'custom') {
        // 自定义区间：日期缺失或无效时暂不过滤（展示全部）
        if (!customStart || !customEnd) return data;
        const a = parseTime(customStart);
        const b = parseTime(customEnd);
        if (!a || !b) return data;
        start = a <= b ? a : b;
        end = a <= b ? b : a;
        end.setHours(23, 59, 59, 999); // 截止日含整天
      } else {
        // 相对区间：以数据中最新时间为基准（与接口统计口径一致，避免历史快照数据被真实日期过滤为空）
        const refTime = data.reduce<Date | null>((acc, d) => {
          const t = timeOf(d);
          return t && (!acc || t > acc) ? t : acc;
        }, null);
        if (!refTime) return data;
        if (timeRange === 'week') {
          start = new Date(refTime.getTime() - 7 * DAY_MS);
        } else if (timeRange === 'month') {
          start = new Date(refTime.getFullYear(), refTime.getMonth(), 1);
        } else if (timeRange === 'quarter') {
          start = new Date(refTime.getFullYear(), Math.floor(refTime.getMonth() / 3) * 3, 1);
        } else {
          start = new Date(refTime.getFullYear(), 0, 1);
        }
        end = refTime;
      }

      const from = start as Date;
      const to = end as Date;
      return data.filter((d) => {
        const t = timeOf(d);
        return t !== null && t >= from && t <= to;
      });
    },
    [timeRange, customStart, customEnd]
  );

  const value = useMemo(
    () => ({ timeRange, customStart, customEnd, setTimeRange, setCustomRange, filterByTime }),
    [timeRange, customStart, customEnd, setCustomRange, filterByTime]
  );

  return <TimeFilterContext.Provider value={value}>{children}</TimeFilterContext.Provider>;
}

/** 获取全局时间筛选状态；无 Provider 场景返回默认全量（不过滤） */
export function useTimeFilter(): TimeFilterState {
  const ctx = useContext(TimeFilterContext);
  if (ctx) return ctx;
  return {
    timeRange: 'all',
    customStart: '',
    customEnd: '',
    setTimeRange: () => {},
    setCustomRange: () => {},
    filterByTime: <T,>(data: T[]) => data
  };
}