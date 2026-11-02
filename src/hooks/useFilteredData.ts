// 全局时间筛选联动数据：过滤原始工单后重建大屏全量统计
// timeRange='all' 或工单未加载时直接返回预聚合 data（零额外开销）
import { useMemo } from 'react';
import { buildPeriodSlices, buildDashboardData, type DashboardData, type PeriodSlices } from '@/services/dataService';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter } from '@/contexts/TimeFilterContext';
import { useWeeklyAnalysis } from '@/contexts/WeeklyAnalysisContext';

export function useFilteredData(): DashboardData | null {
  const { data, orders } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();

  return useMemo(() => {
    if (timeRange === 'all' || !orders.length) return data;
    return buildDashboardData(filterByTime(orders));
  }, [data, orders, timeRange, filterByTime]);
}

/**
 * 统计周期口径下的构成/结构切片（构成分析、问题结构分析共用）
 * - 「全部」：沿用预聚合台账，保证默认视图数值稳定
 * - 其他周期：按筛选后的工单现场重算
 */
export function usePeriodSlices(): PeriodSlices {
  const { orders } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();
  const { data: wa } = useWeeklyAnalysis();

  return useMemo(() => {
    const ledger: PeriodSlices = {
      high_freq_issues_pie: wa.high_freq_issues_pie,
      category_pie: wa.category_pie,
      city_mgmt_pie: wa.city_mgmt_pie,
      dept_pie: wa.dept_pie,
    };
    if (timeRange === 'all' || !orders.length) return ledger;
    return buildPeriodSlices(filterByTime(orders));
  }, [wa, orders, timeRange, filterByTime]);
}
