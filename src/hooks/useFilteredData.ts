// 全局时间筛选联动数据：过滤原始工单后重建大屏全量统计
// timeRange='all' 或工单未加载时直接返回预聚合 data（零额外开销）
import { useMemo } from 'react';
import { buildDashboardData, type DashboardData } from '@/services/dataService';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter } from '@/contexts/TimeFilterContext';

export function useFilteredData(): DashboardData | null {
  const { data, orders } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();

  return useMemo(() => {
    if (timeRange === 'all' || !orders.length) return data;
    return buildDashboardData(filterByTime(orders));
  }, [data, orders, timeRange, filterByTime]);
}
