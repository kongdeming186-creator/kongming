// 实时工单流：基于真实最新工单池，静态取最新一条（不自动轮动），加载前以真实快照兜底
import { useEffect, useState } from 'react';
import { useRealData } from '@/contexts/RealDataContext';
import { useFilteredData } from '@/hooks/useFilteredData';
import { INCOMING_ORDER_POOL, type IncomingOrder } from '@/data/mockData';

const MAX_FEED = 20;

/** 初始兜底池（真实最新工单快照，接口加载后立即被覆盖） */
const FALLBACK_FEED: IncomingOrder[] = INCOMING_ORDER_POOL.map((o, i) => ({
  id: `CF-INIT-${i + 1}`,
  time: '08-30 10:21',
  ...o
}));

export function useRealtimeFeed() {
  const { dataVersion } = useRealData();
  // 数据池跟随全局时间筛选（未加载前用真实快照兜底）
  const pool = useFilteredData()?.feedPool ?? FALLBACK_FEED;
  const [feed, setFeed] = useState<IncomingOrder[]>([]);
  const [lastOrder, setLastOrder] = useState<IncomingOrder | null>(null);

  useEffect(() => {
    if (pool.length === 0) return;
    // 一次性填充静态列表，不做定时轮播
    setFeed(pool.slice(0, MAX_FEED));
    setLastOrder(pool[0] ?? null);
  }, [pool, dataVersion]);

  return { feed, lastOrder, online: true };
}

/** 顶部时钟（1s 走秒） */
export function useNowClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
