// 真实数据上下文：拉取接口 Excel → 60s 自动静默刷新 → 失败保留缓存数据
// 知识库集成：实时数据 + 历史知识库合并展示，已办结工单自动追加到知识库
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { buildDashboardData, fetchRealOrders, loadHistorySummary, loadMergedSummary, loadTrendPrediction, REFRESH_INTERVAL_MS, type DashboardData, type HistorySummary, type MergedSummary, type RealOrder, type TrendPrediction } from '@/services/dataService';
import { appendResolvedToKb, loadKnowledgeBase, mergeKbWithRealtime, type KbOrder } from '@/services/knowledgeBaseService';

export interface RealDataState {
  data: DashboardData | null;
  /** 原始工单数组（实时+知识库历史合并，供全局时间筛选现场过滤计算） */
  orders: RealOrder[];
  /** 实时接口工单（data.json，未合并知识库历史）——典型案例/重点督办件等仅针对实时数据的模块使用 */
  realtimeOrders: RealOrder[];
  /** 历史数据汇总（14,779 条历史工单统计，一次性加载） */
  historyData: HistorySummary | null;
  /** 合并数据汇总（历史+实时去重合并 14,822 条，统计类模块优先使用，一次性加载） */
  mergedSummary: MergedSummary | null;
  /** 趋势预测预警数据（未诉先办，一次性加载） */
  trendPrediction: TrendPrediction | null;
  /** 知识库工单（历史 Excel 数据，一次性加载） */
  kbOrders: KbOrder[];
  /** 合并数据加载状态（loading 加载中 / ok 成功 / error 失败） */
  summaryStatus: 'loading' | 'ok' | 'error';
  /** 首次加载中（大屏遮罩） */
  loading: boolean;
  /** 静默刷新中（顶部旋转指示器） */
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  /** 数据版本号（每次成功刷新 +1，用于触发数字滚动动效重播） */
  dataVersion: number;
  refresh: () => void;
}

const RealDataContext = createContext<RealDataState | null>(null);

export function RealDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [realtimeOrders, setRealtimeOrders] = useState<RealOrder[]>([]);
  const [historyData, setHistoryData] = useState<HistorySummary | null>(null);
  const [mergedSummary, setMergedSummary] = useState<MergedSummary | null>(null);
  const [trendPrediction, setTrendPrediction] = useState<TrendPrediction | null>(null);
  const [kbOrders, setKbOrders] = useState<KbOrder[]>([]);
  const kbRef = useRef<KbOrder[]>([]);
  const [summaryStatus, setSummaryStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const errToastedRef = useRef(0);
  const inFlightRef = useRef(false);
  const dataSigRef = useRef<number>(Number.NaN);

  const load = useCallback(async (silent: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (silent) setRefreshing(true);
    try {
      const realOrders = await fetchRealOrders();
      // 将实时数据中已办结的工单追加到知识库（去重）
      const appended = appendResolvedToKb(realOrders as unknown as KbOrder[]);
      if (appended > 0) {
        console.log(`[RealData] 知识库新增 ${appended} 条已办结工单`);
      }
      // 合并知识库 + 实时数据（去重，实时覆盖历史）
      const kb = kbRef.current;
      const merged = kb.length > 0 ? mergeKbWithRealtime(kb, realOrders) : realOrders;
      // 内容签名（编号/状态/结果任一变化才算新数据）：60s 轮询若数据未变则跳过全量统计重建，避免周期性 CPU 峰值
      let sig = 0;
      for (const o of merged) {
        const s = `${o['办件编号']}|${o['办件状态']}|${o['处理结果']}`;
        for (let i = 0; i < s.length; i++) sig = (sig * 31 + s.charCodeAt(i)) | 0;
      }
      if (sig !== dataSigRef.current) {
        dataSigRef.current = sig;
        setData(buildDashboardData(merged));
        setOrders(merged);
        setRealtimeOrders(realOrders);
        setDataVersion((v) => v + 1);
      }
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '数据接口异常');
      // 失败降级：保留最后一次成功数据（或 mock 初始快照），2 分钟内仅提示一次
      if (Date.now() - errToastedRef.current > 120_000) {
        errToastedRef.current = Date.now();
        toast.error('实时数据刷新失败，正在展示缓存数据');
      }
    } finally {
      inFlightRef.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 知识库一次性加载（14,779 条历史工单，加载后触发首次数据合并）
    void loadKnowledgeBase().then((kb) => {
      kbRef.current = kb;
      setKbOrders(kb);
      console.log(`[RealData] 知识库加载完成：${kb.length} 条历史工单`);
      // 知识库就绪后首次加载实时数据并合并
      void load(false);
    });
    // 历史数据与趋势预测一次性加载（不随实时刷新变动）
    void loadHistorySummary().then((h) => setHistoryData(h));
    void loadTrendPrediction().then((t) => setTrendPrediction(t));
    // 合并数据优先加载（统计类模块使用，不随实时刷新变动）
    void loadMergedSummary().then((m) => {
      console.log('[RealData] mergedSummary:', m?.total, 'completed:', m?.completed);
      setMergedSummary(m);
      setSummaryStatus(m ? 'ok' : 'error');
    });
    const timer = window.setInterval(() => void load(true), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  return (
    <RealDataContext.Provider value={{ data, orders, realtimeOrders, historyData, mergedSummary, summaryStatus, trendPrediction, kbOrders, loading, refreshing, error, lastUpdated, dataVersion, refresh }}>
      {children}
    </RealDataContext.Provider>
  );
}

/** 获取真实数据状态；无 Provider 场景返回空态（组件自动回退 mock 初始值） */
export function useRealData(): RealDataState {
  const ctx = useContext(RealDataContext);
  if (ctx) return ctx;
  return { data: null, orders: [], realtimeOrders: [], historyData: null, mergedSummary: null, summaryStatus: 'error', trendPrediction: null, kbOrders: [], loading: false, refreshing: false, error: null, lastUpdated: null, dataVersion: 0, refresh: () => {} };
}
