// 长丰街道 20 个社区工单量与风险数据（来自热线诉求数据分析结果）
// 风险分级: high=红(高风险/高工单量) / mid=橙(中风险) / low=绿(低风险)
// lng/lat: 社区居委会位置（GCJ-02 坐标，地图渲染时转换为 BD-09 百度坐标）

export type RiskLevel = 'high' | 'mid' | 'low';

export interface CommunityIssue {
  name: string;
  count: number;
  ratio: number; // 占该社区工单量百分比
}

export interface CommunityInfo {
  id: string;
  name: string; // 简称，如「长丰社区」
  fullName: string; // 社区居委会全称
  lng: number; // 社区位置经度（GCJ-02）
  lat: number; // 社区位置纬度（GCJ-02）
  orders: number; // 累计工单量
  riskLevel: RiskLevel;
  riskScore: number; // 风险评分 0-100
  topIssues: CommunityIssue[]; // TOP3 问题特征
  keyAreas: string[]; // 辖区内重点区域/小区
  resolveRate: number; // 办结率 %
  avgDays: number; // 平均办理时长（天）
  trend: number; // 环比变化 %
}

export const RISK_LEVELS: Record<RiskLevel, { label: string; color: string; desc: string }> = {
  high: { label: '高风险', color: 'hsl(var(--risk-high))', desc: '工单量高位，需重点治理' },
  mid: { label: '中风险', color: 'hsl(var(--risk-mid))', desc: '工单量中等，保持关注' },
  low: { label: '低风险', color: 'hsl(var(--risk-low))', desc: '工单量低位，治理有效' }
};

// 风险评分规则: >=70 高风险, 50-69 中风险, <50 低风险
export const riskLevelOf = (score: number): RiskLevel =>
  score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';

export const COMMUNITIES: CommunityInfo[] = [
  // ===== 高风险（红）=====
  {
    id: 'changfeng',
    name: '长丰社区',
    fullName: '长丰社区居委会',
    lng: 114.21,
    lat: 30.61,
    orders: 1385,
    riskLevel: 'high',
    riskScore: 82,
    topIssues: [
      { name: '占道经营', count: 361, ratio: 26 },
      { name: '私搭乱建', count: 194, ratio: 14 },
      { name: '油烟污染', count: 158, ratio: 11.4 }
    ],
    keyAreas: ['长丰村', '长丰城', '长丰大道沿线'],
    resolveRate: 99.9,
    avgDays: 12.6,
    trend: 6.2
  },
  {
    id: 'dongfeng',
    name: '东风社区',
    fullName: '东风社区居委会',
    lng: 113.96,
    lat: 30.74,
    orders: 1247,
    riskLevel: 'high',
    riskScore: 75,
    topIssues: [
      { name: '拆迁问题', count: 486, ratio: 39 },
      { name: '房屋规划', count: 224, ratio: 18 },
      { name: '私搭乱建', count: 137, ratio: 11 }
    ],
    keyAreas: ['东风村', '东风大道片区'],
    resolveRate: 99.8,
    avgDays: 13.8,
    trend: -3.4
  },
  {
    id: 'tianshunyuanbei',
    name: '天顺园北社区',
    fullName: '天顺园北社区居委会',
    lng: 114.22,
    lat: 30.62,
    orders: 1102,
    riskLevel: 'high',
    riskScore: 74,
    topIssues: [
      { name: '业委会问题', count: 419, ratio: 38 },
      { name: '物业收费', count: 187, ratio: 17 },
      { name: '停车管理', count: 142, ratio: 12.9 }
    ],
    keyAreas: ['天泽一方', '天顺园小区（北片）'],
    resolveRate: 99.9,
    avgDays: 11.9,
    trend: 9.8
  },
  {
    id: 'changshun',
    name: '长顺社区',
    fullName: '长顺社区居委会',
    lng: 114.201,
    lat: 30.651,
    orders: 998,
    riskLevel: 'high',
    riskScore: 77,
    topIssues: [
      { name: '占道经营', count: 259, ratio: 26 },
      { name: '商业噪音', count: 220, ratio: 22 },
      { name: '共享单车', count: 130, ratio: 13 }
    ],
    keyAreas: ['长风路片区', '城华路西段'],
    resolveRate: 100,
    avgDays: 10.4,
    trend: 4.5
  },
  {
    id: 'tianqin',
    name: '天勤社区',
    fullName: '天勤社区居委会',
    lng: 114.20,
    lat: 30.61,
    orders: 876,
    riskLevel: 'high',
    riskScore: 72,
    topIssues: [
      { name: '施工噪音', count: 236, ratio: 27 },
      { name: '渣土车扰民', count: 158, ratio: 18 },
      { name: '建设管理', count: 114, ratio: 13 }
    ],
    keyAreas: ['汉樾台', '在建工地片区'],
    resolveRate: 99.7,
    avgDays: 12.1,
    trend: 40.2
  },
  {
    id: 'changyuan',
    name: '长源社区',
    fullName: '长源社区居委会',
    lng: 114.21,
    lat: 30.62,
    orders: 812,
    riskLevel: 'high',
    riskScore: 71,
    topIssues: [
      { name: '拆迁问题', count: 276, ratio: 34 },
      { name: '房屋规划', count: 138, ratio: 17 },
      { name: '环境卫生', count: 98, ratio: 12 }
    ],
    keyAreas: ['长源村', '长源路沿线'],
    resolveRate: 99.8,
    avgDays: 13.2,
    trend: -8.1
  },
  // ===== 中风险（橙）=====
  {
    id: 'tuanjie',
    name: '团结社区',
    fullName: '团结社区居委会',
    lng: 114.22,
    lat: 30.62,
    orders: 695,
    riskLevel: 'mid',
    riskScore: 66,
    topIssues: [
      { name: '占道经营', count: 181, ratio: 26 },
      { name: '商业噪音', count: 153, ratio: 22 },
      { name: '占道停车', count: 97, ratio: 14 }
    ],
    keyAreas: ['城华路片区', '团结村'],
    resolveRate: 100,
    avgDays: 10.8,
    trend: 2.3
  },
  {
    id: 'yuanbonan',
    name: '园博南社区',
    fullName: '园博南社区居委会',
    lng: 114.22,
    lat: 30.63,
    orders: 648,
    riskLevel: 'mid',
    riskScore: 63,
    topIssues: [
      { name: '共享单车', count: 168, ratio: 26 },
      { name: '占道经营', count: 123, ratio: 19 },
      { name: '环境卫生', count: 84, ratio: 13 }
    ],
    keyAreas: ['园博园南门', '华生汉口城市广场（西）'],
    resolveRate: 100,
    avgDays: 9.6,
    trend: 137.4
  },
  {
    id: 'fengzhuyuan',
    name: '丰竹园社区',
    fullName: '丰竹园社区居委会',
    lng: 114.24,
    lat: 30.62,
    orders: 603,
    riskLevel: 'mid',
    riskScore: 61,
    topIssues: [
      { name: '生活噪声', count: 169, ratio: 28 },
      { name: '油烟污染', count: 114, ratio: 19 },
      { name: '私搭乱建', count: 72, ratio: 12 }
    ],
    keyAreas: ['丰竹园小区', '古田四路北段'],
    resolveRate: 99.9,
    avgDays: 10.2,
    trend: -1.6
  },
  {
    id: 'zirunbei',
    name: '紫润北社区',
    fullName: '紫润北社区居委会',
    lng: 114.22,
    lat: 30.63,
    orders: 560,
    riskLevel: 'mid',
    riskScore: 59,
    topIssues: [
      { name: '占道经营', count: 146, ratio: 26 },
      { name: '共享单车', count: 118, ratio: 21 },
      { name: '环境卫生', count: 79, ratio: 14 }
    ],
    keyAreas: ['紫润家园（北区）', '城华路东段'],
    resolveRate: 99.9,
    avgDays: 10.9,
    trend: 5.2
  },
  {
    id: 'zirunnan',
    name: '紫润南社区',
    fullName: '紫润南社区居委会',
    lng: 114.22,
    lat: 30.63,
    orders: 540,
    riskLevel: 'mid',
    riskScore: 58,
    topIssues: [
      { name: '业委会问题', count: 156, ratio: 29 },
      { name: '社区建设', count: 106, ratio: 20 },
      { name: '公共设施规划', count: 78, ratio: 14 }
    ],
    keyAreas: ['紫润家园（南区）', '龙湖春江郦城'],
    resolveRate: 100,
    avgDays: 9.8,
    trend: 5.7
  },
  {
    id: 'zhengkang',
    name: '正康社区',
    fullName: '正康社区居委会',
    lng: 114.21,
    lat: 30.61,
    orders: 512,
    riskLevel: 'mid',
    riskScore: 57,
    topIssues: [
      { name: '商业噪音', count: 143, ratio: 28 },
      { name: '占道经营', count: 108, ratio: 21 },
      { name: '停车管理', count: 66, ratio: 12.9 }
    ],
    keyAreas: ['正康路商圈'],
    resolveRate: 99.9,
    avgDays: 11.1,
    trend: 3.9
  },
  {
    id: 'yongli',
    name: '永利社区',
    fullName: '永利社区居委会',
    lng: 114.22,
    lat: 30.61,
    orders: 445,
    riskLevel: 'mid',
    riskScore: 53,
    topIssues: [
      { name: '房屋管理', count: 120, ratio: 27 },
      { name: '拆迁问题', count: 85, ratio: 19 },
      { name: '环境卫生', count: 58, ratio: 13 }
    ],
    keyAreas: ['永利村', '沿河大道北'],
    resolveRate: 99.8,
    avgDays: 12.4,
    trend: -6.5
  },
  // ===== 低风险（绿）=====
  {
    id: 'changyi',
    name: '长宜社区',
    fullName: '长宜社区居委会',
    lng: 114.20,
    lat: 30.63,
    orders: 430,
    riskLevel: 'low',
    riskScore: 48,
    topIssues: [
      { name: '停车管理', count: 112, ratio: 26 },
      { name: '生活噪声', count: 91, ratio: 21 },
      { name: '物业收费', count: 58, ratio: 13.5 }
    ],
    keyAreas: ['长宜家园', '园博东路'],
    resolveRate: 100,
    avgDays: 9.2,
    trend: -2.4
  },
  {
    id: 'yuanbobei',
    name: '园博北社区',
    fullName: '园博北社区居委会',
    lng: 114.22,
    lat: 30.63,
    orders: 428,
    riskLevel: 'low',
    riskScore: 47,
    topIssues: [
      { name: '环境卫生', count: 109, ratio: 25 },
      { name: '共享单车', count: 86, ratio: 20 },
      { name: '公共设施规划', count: 55, ratio: 12.9 }
    ],
    keyAreas: ['园博园东门', '金南一路'],
    resolveRate: 100,
    avgDays: 8.9,
    trend: 7.6
  },
  {
    id: 'tianshunyuannan',
    name: '天顺园南社区',
    fullName: '天顺园南社区居委会',
    lng: 114.22,
    lat: 30.62,
    orders: 415,
    riskLevel: 'low',
    riskScore: 47,
    topIssues: [
      { name: '物业收费', count: 108, ratio: 26 },
      { name: '停车管理', count: 83, ratio: 20 },
      { name: '社区建设', count: 57, ratio: 13.7 }
    ],
    keyAreas: ['天顺园小区（南片）', '丰美路'],
    resolveRate: 99.9,
    avgDays: 9.6,
    trend: -3.1
  },
  {
    id: 'ronghui',
    name: '荣荟社区',
    fullName: '荣荟社区居委会',
    lng: 114.177,
    lat: 30.623,
    orders: 400,
    riskLevel: 'low',
    riskScore: 46,
    topIssues: [
      { name: '生活噪声', count: 104, ratio: 26 },
      { name: '油烟污染', count: 79, ratio: 19.8 },
      { name: '占道停车', count: 52, ratio: 13 }
    ],
    keyAreas: ['荣荟里', '长丰路南段'],
    resolveRate: 100,
    avgDays: 9.4,
    trend: 1.9
  },
  {
    id: 'xindun',
    name: '新墩社区',
    fullName: '新墩社区居委会',
    lng: 114.21,
    lat: 30.63,
    orders: 398,
    riskLevel: 'low',
    riskScore: 45,
    topIssues: [
      { name: '环境卫生', count: 101, ratio: 25 },
      { name: '垃圾清运', count: 78, ratio: 19.6 },
      { name: '生活噪声', count: 53, ratio: 13.3 }
    ],
    keyAreas: ['新墩铁路沿线', '解放大道北'],
    resolveRate: 99.8,
    avgDays: 11.3,
    trend: -3.2
  },
  {
    id: 'baize',
    name: '百泽社区',
    fullName: '百泽社区居委会',
    lng: 114.22,
    lat: 30.61,
    orders: 390,
    riskLevel: 'low',
    riskScore: 44,
    topIssues: [
      { name: '占道停车', count: 96, ratio: 24.6 },
      { name: '物业收费', count: 74, ratio: 19 },
      { name: '公共设施规划', count: 51, ratio: 13.1 }
    ],
    keyAreas: ['百泽公园', '长风路东段'],
    resolveRate: 100,
    avgDays: 8.7,
    trend: 2.1
  },
  {
    id: 'changning',
    name: '长宁社区',
    fullName: '长宁社区居委会',
    lng: 114.163,
    lat: 30.623,
    orders: 360,
    riskLevel: 'low',
    riskScore: 42,
    topIssues: [
      { name: '生活噪声', count: 93, ratio: 25.8 },
      { name: '油烟污染', count: 71, ratio: 19.7 },
      { name: '占道停车', count: 47, ratio: 13.1 }
    ],
    keyAreas: ['长宁嘉园', '长宁路集贸市场'],
    resolveRate: 99.9,
    avgDays: 9.1,
    trend: -1.8
  }
];
