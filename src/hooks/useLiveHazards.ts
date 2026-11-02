// 实时高危事件流：基于真实未办结（可定位社区）工单，静态展示最多 5 条（不自动轮动）
// 数据池跟随全局时间筛选
import { useEffect, useState } from 'react';
import { useFilteredData } from '@/hooks/useFilteredData';
import type { HazardEvent } from '@/data/eventData';

const MAX_LIVE = 5;

// 稳定的空数组兜底：避免每次渲染新建 [] 导致 useEffect 反复触发（Maximum update depth exceeded）
const EMPTY_POOL: HazardEvent[] = [];

export function useLiveHazards(): HazardEvent[] {
  const fd = useFilteredData();
  const pool = fd?.livePool ?? EMPTY_POOL;
  const [live, setLive] = useState<HazardEvent[]>([]);

  useEffect(() => {
    // 一次性填充静态列表，不做定时轮播
    setLive(pool.slice(0, MAX_LIVE));
  }, [pool]);

  return live;
}
