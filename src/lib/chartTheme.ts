// 大屏图表统一配色（与 CSS 主题变量保持一致，canvas 渲染需直接 hex）
export const C = {
  primary: '#d4a843', // 主色 金（红金政务风）
  accent: '#e63c40', // 亮红
  purple: '#b8963f', // 暗金
  orange: '#f0c860', // 亮金
  red: '#c41e24', // 中国红
  green: '#2dbd7a',
  yellow: '#f0c860',
  pink: '#e63c40',
  text: '#fff5e6', // 常规文字（暖白）
  textDim: 'rgba(255, 245, 230, 0.55)', // 弱化文字
  axis: 'rgba(212, 168, 67, 0.3)', // 轴线（金）
  split: 'rgba(212, 168, 67, 0.12)', // 分隔线（金）
  bg: '#0c0806'
};

/** 风险等级 → 颜色 */
export const RISK_COLORS = {
  high: '#e63c40',
  mid: '#d4a843',
  low: '#2dbd7a'
} as const;

/** 分类色板（饼图等） */
export const PIE_PALETTE = ['#c41e24', '#d4a843', '#e63c40', '#b8963f', '#f0c860', '#a01820'];

/** 通用 ECharts 基础配置（深色大屏） */
export const BASE_TEXT = {
  color: C.text,
  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
};
