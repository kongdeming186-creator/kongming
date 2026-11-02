// ECharts 统一封装：React Hook（自动 init / setOption / resize / dispose）+ 政务蓝主题
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

/** 政务蓝 ECharts 主题（蓝色同色系阶调 + #FFB300 金点睛） */
const govTheme: Record<string, unknown> = {
  color: ['#1E88E5', '#42A5F5', '#8FC7F0', '#AEF4FC', '#0D47A1', '#FFB300'],
  backgroundColor: 'transparent',
  textStyle: {
    color: 'rgba(174,244,252,0.7)',
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  },
  line: {
    lineStyle: { color: '#1E88E5', width: 2 },
    itemStyle: { color: '#1E88E5' }
  },
  bar: {
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#00B3FF' },
          { offset: 1, color: '#005BA8' }
        ]
      },
      borderRadius: [2, 2, 0, 0]
    }
  },
  pie: { itemStyle: { borderWidth: 2, borderColor: 'rgba(4,24,47,0.85)' } },
  tooltip: {
    backgroundColor: 'rgba(10,46,90,0.92)',
    borderColor: 'rgba(30,136,229,0.3)',
    textStyle: { color: '#ffffff' }
  }
};

// 注册政务蓝主题（模块加载时执行一次）
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
