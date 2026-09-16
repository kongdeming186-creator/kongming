// 每周分析数据上下文：一次性加载 weekly_analysis.json，失败回退内联兜底基准
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadWeeklyAnalysis, WEEKLY_ANALYSIS_FALLBACK, type WeeklyAnalysis } from '@/services/dataService';

interface WeeklyAnalysisContextValue {
  data: WeeklyAnalysis;
  loading: boolean;
}

const WeeklyAnalysisContext = createContext<WeeklyAnalysisContextValue | null>(null);

export function WeeklyAnalysisProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeeklyAnalysis>(WEEKLY_ANALYSIS_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void loadWeeklyAnalysis().then((d) => {
      if (!mounted) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return <WeeklyAnalysisContext.Provider value={{ data, loading }}>{children}</WeeklyAnalysisContext.Provider>;
}

export function useWeeklyAnalysis(): WeeklyAnalysisContextValue {
  const ctx = useContext(WeeklyAnalysisContext);
  if (ctx) return ctx;
  return { data: WEEKLY_ANALYSIS_FALLBACK, loading: false };
}