// 大屏图表统一配色（与 CSS 主题变量保持一致，canvas 渲染需直接 hex）
// 政务蓝：蓝色同色系阶调为主（深墨蓝 → 宝蓝 → 亮蓝 → 浅蓝），#FFB300 金仅作点睛与预警
export const C = {
  primary: '#1E88E5', // 主色 宝蓝
  accent: '#FFB300', // 强调 金（唯一点睛色）
  blueDeep: '#0A2E5A', // 深墨蓝
  blueDark: '#0D47A1',
  blueMid: '#42A5F5',
  blueLight: '#8FC7F0',
  bluePale: '#AEF4FC', // 浅蓝
  // 兼容旧键名（统一指向蓝色系阶调，避免引入杂色）
  mint: '#4FF0FF',
  purple: '#8FC7F0',
  orange: '#42A5F5',
  gold: '#FFB300',
  amber: '#FFB300',
  cyan: '#42A5F5',
  cyanBright: '#4FF0FF',
  coral: '#FF5A5F',
  red: '#FF5A5F',
  green: '#4FF0FF',
  yellow: '#FFB300',
  pink: '#FF5A5F',
  text: '#ffffff', // 常规文字
  textDim: 'rgba(255, 255, 255, 0.62)', // 弱化文字
  axis: 'rgba(30, 136, 229, 0.3)', // 轴线
  split: 'rgba(30, 136, 229, 0.12)', // 分隔线
  bg: '#04182f'
};

/** 风险等级 → 颜色（高=警示红，中=金，低=宝蓝） */
export const RISK_COLORS = {
  high: '#FF5A5F',
  mid: '#FFB300',
  low: '#4FF0FF'
} as const;

/** 分类色板（饼图 / 柱图，蓝色同色系阶调 + 单点金） */
export const PIE_PALETTE = ['#1E88E5', '#42A5F5', '#8FC7F0', '#AEF4FC', '#0D47A1', '#FFB300'];

/** 通用 ECharts 基础配置（深色大屏） */
export const BASE_TEXT = {
  color: C.text,
  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
};
