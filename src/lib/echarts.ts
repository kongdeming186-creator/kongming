// ECharts 统一封装：React Hook（自动 init / setOption / resize / dispose）+ 红金政务主题
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

/** 红金政务风 ECharts 主题 */
const govTheme: Record<string, unknown> = {
  color: ['#c41e24', '#d4a843', '#e63c40', '#b8963f', '#a01820', '#f0c860'],
  backgroundColor: 'transparent',
  textStyle: {
    color: 'rgba(255,245,230,0.65)',
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  },
  line: {
    lineStyle: { color: '#d4a843', width: 2 },
    itemStyle: { color: '#d4a843' }
  },
  bar: {
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#c41e24' },
          { offset: 1, color: '#6b1014' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    }
  },
  pie: { itemStyle: { borderWidth: 2, borderColor: 'rgba(12,8,6,0.8)' } },
  tooltip: {
    backgroundColor: 'rgba(26,15,10,0.9)',
    borderColor: 'rgba(212,168,67,0.3)',
    textStyle: { color: '#fff5e6' }
  }
};

// 注册红金政务主题（模块加载时执行一次）
echarts.registerTheme('gov-red-gold', govTheme);

/**
 * ECharts React Hook：自动 init / setOption / resize / dispose
 * @param option useMemo 生成的 ECharts 配置
 */
export function useECharts(option: echarts.EChartsCoreOption | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, 'gov-red-gold', { renderer: 'canvas' });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (option) {
      chartRef.current?.setOption(option, true);
    }
  }, [option]);

  return { containerRef, chartRef };
}
