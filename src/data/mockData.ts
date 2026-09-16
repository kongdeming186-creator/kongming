// 大屏全局业务数据 —— 真实接口统计快照（2024.11 - 2026.08，525 条工单）
// 用途：接口加载完成前的初始展示（避免白屏）与失败降级兜底；运行时由 RealDataContext 覆盖

/* ========== 模块一：市民热线概览 ========== */

export const OVERVIEW = {
  totalOrders: 525, // 累计办件（真实）
  resolveRate: 43.05, // 办结率 %
  warnRate: 57.0, // 未办结占比 %
  avgDays: 0 // 真实数据无完成时间，不做平均时长统计
};

/** 城运事件统计（口径：12345 热线工单，已超时 = 承诺时间已过且未办结） */
export const CITY_OPS_EVENTS = {
  total: 525,
  unfinished: 299,
  overdue: 253,
  totalTrendPct: 314.3, // 近30天 vs 前30天
  overdueTrendPct: -57.1,
  note: '口径：12345 热线工单'
};

/** 市民热线概览（各时间范围统计，以数据最新受理时间 2026-08-30 为基准） */
export const HOTLINE_STATS = {
  ranges: {
    week: { total: 19, unfinished: 19, resolveRate: 0 },
    month: { total: 58, unfinished: 49, resolveRate: 15.52 },
    quarter: { total: 72, unfinished: 56, resolveRate: 22.22 },
    year: { total: 218, unfinished: 146, resolveRate: 33.03 },
    all: { total: 525, unfinished: 299, resolveRate: 43.05 }
  },
  kpiTrend: {
    totalPct: 314.3, // 2026-08(58) vs 2026-07(14)
    unfinishedPct: 600.0, // 49 vs 7
    resolvePct: -69.0 // 15.52 vs 50.0
  }
};

/** 高频问题小类 TOP6（占总量百分比） */
export const REWORK_BREAKDOWN = [
  { type: '异味污染问题', count: 53, percent: 10.1, color: '#ff4757' },
  { type: '商品房买卖纠纷', count: 26, percent: 5.0, color: '#ffa502' },
  { type: '物业纠纷', count: 25, percent: 4.8, color: '#ffd32a' },
  { type: '社区建设', count: 23, percent: 4.4, color: '#2ed573' },
  { type: '拆迁问题', count: 22, percent: 4.2, color: '#a55eea' },
  { type: '生活噪声问题', count: 18, percent: 3.4, color: '#576574' }
];

/** 重办件统计（高频小类 TOP6 合计） */
export const REWORK_ORDERS = {
  total: 525,
  reworkTotal: 167,
  ratio: 31.8,
  top3: [
    { type: '异味污染问题', count: 53, percent: 31.7 },
    { type: '商品房买卖纠纷', count: 26, percent: 15.6 },
    { type: '物业纠纷', count: 25, percent: 15.0 }
  ],
  note: '高频小类 TOP6 合计'
};

/* ========== 趋势预警 ========== */

export type RiskLevel = 'high' | 'mid' | 'low';

export interface TrendRiskItem {
  category: string;
  desc: string;
  level: RiskLevel;
}

export interface TrendScenario {
  key: string;
  label: string;
  growth: number; // 诉求量较全期月均增长百分比（负值表示下降）
  factor: string;
  riskLevel: RiskLevel;
  items: TrendRiskItem[];
  advice: string;
}

/** 复合场景模拟（增幅基于真实月度数据推算：近3月均值 41 vs 全期月均 23.9 = +72%） */
export const TREND_SCENARIOS: TrendScenario[] = [
  {
    key: 'current',
    label: '当前',
    growth: 72,
    factor: '商品房买卖纠纷集中高发',
    riskLevel: 'high',
    items: [
      { category: '房屋土地管理类', desc: '商品房买卖纠纷诉求集中', level: 'high' },
      { category: '城市市容管理类', desc: '市容环境类投诉回升', level: 'high' },
      { category: '社会服务类', desc: '民生服务诉求平稳', level: 'mid' },
      { category: '建设管理类', desc: '施工扰民零星发生', level: 'mid' },
      { category: '园林绿化类', desc: '绿化养护类偶发', level: 'low' }
    ],
    advice: '重点关注商品房买卖纠纷与异味污染问题，加强属地社区前端调解，压降重复投诉'
  },
  {
    key: 'heat',
    label: '高温+开学',
    growth: 86,
    factor: '暑期高温叠加开学季',
    riskLevel: 'high',
    items: [
      { category: '房屋土地管理类', desc: '高温期房屋质量投诉增多', level: 'high' },
      { category: '城市市容管理类', desc: '夜间占道与垃圾异味反弹', level: 'high' },
      { category: '社会服务类', desc: '空调噪音与邻里纠纷', level: 'mid' },
      { category: '建设管理类', desc: '工地夜间施工扰民', level: 'mid' },
      { category: '园林绿化类', desc: '绿化遮荫诉求', level: 'low' }
    ],
    advice: '开学季加强校园周边环境整治，高温期加密垃圾清运，严控夜间施工噪音'
  },
  {
    key: 'rain',
    label: '暴雨',
    growth: 79,
    factor: '暴雨灾害',
    riskLevel: 'high',
    items: [
      { category: '城市市容管理类', desc: '道路积水与垃圾滞留', level: 'high' },
      { category: '建设管理类', desc: '工地围挡与深基坑隐患', level: 'high' },
      { category: '社会服务类', desc: '出行受阻求助增多', level: 'mid' },
      { category: '房屋土地管理类', desc: '房屋渗漏投诉', level: 'mid' },
      { category: '园林绿化类', desc: '树木倒伏阻路', level: 'low' }
    ],
    advice: '暴雨前疏通排水管网与易涝点，加固工地围挡，落实应急抢险队伍值守'
  },
  {
    key: 'wind',
    label: '大风',
    growth: 43,
    factor: '大风天气',
    riskLevel: 'mid',
    items: [
      { category: '城市市容管理类', desc: '店招广告牌坠落风险', level: 'high' },
      { category: '建设管理类', desc: '临时搭建物受损', level: 'mid' },
      { category: '园林绿化类', desc: '树木倒伏阻碍通行', level: 'mid' },
      { category: '社会服务类', desc: '高空坠物投诉', level: 'low' },
      { category: '房屋土地管理类', desc: '屋顶构件松动', level: 'low' }
    ],
    advice: '大风前排查店招与高空构件，修剪易倒伏树木，加强在建工地巡查'
  },
  {
    key: 'summer',
    label: '夏季',
    growth: 65,
    factor: '夏季常规',
    riskLevel: 'mid',
    items: [
      { category: '城市市容管理类', desc: '夜市外溢与油烟扰民', level: 'mid' },
      { category: '社会服务类', desc: '夜间噪音投诉集中', level: 'mid' },
      { category: '房屋土地管理类', desc: '物业纠纷小幅波动', level: 'low' },
      { category: '建设管理类', desc: '施工噪音零星', level: 'low' },
      { category: '园林绿化类', desc: '蚊虫消杀诉求', level: 'low' }
    ],
    advice: '夏季加密夜市与烧烤整治频次，落实 22 点后噪音管控，及时清运垃圾'
  },
  {
    key: 'spring',
    label: '春节',
    growth: -29,
    factor: '春节期间',
    riskLevel: 'low',
    items: [
      { category: '城市市容管理类', desc: '烟花爆竹垃圾清理', level: 'mid' },
      { category: '社会服务类', desc: '返乡办事咨询增多', level: 'mid' },
      { category: '房屋土地管理类', desc: '物业值守投诉', level: 'low' },
      { category: '建设管理类', desc: '工地停工看守', level: 'low' },
      { category: '园林绿化类', desc: '节日氛围维护', level: 'low' }
    ],
    advice: '春节期间保障供水供电与垃圾清运，加强烟花爆竹禁燃宣传与巡查'
  }
];

/** 集中投诉事件预警（近30天小类投诉密度，实时计算覆盖） */
export interface ConcentratedAlert {
  id: string;
  level: 'red' | 'yellow';
  name: string;
  count: number;
  threshold: number;
  cases: string[];
}

export const CONCENTRATED_ALERTS = {
  note: '基于近30天真实工单密度',
  region: [] as ConcentratedAlert[],
  type: [
    { id: 't-1', level: 'yellow' as const, name: '商品房买卖纠纷', count: 4, threshold: 20, cases: ['商品房交付与办证问题集中反映', '延期交付违约金争议', '购房退款纠纷'] },
    { id: 't-2', level: 'yellow' as const, name: '环卫作业', count: 3, threshold: 20, cases: ['垃圾清运车污水滴漏', '清运频次不足异味扰民', '垃圾桶满溢未及时清理'] }
  ]
};

/** 高频问题小类 TOP10（真实统计） */
export const TOP10_ISSUES = [
  { name: '异味污染问题', value: 53 },
  { name: '商品房买卖纠纷', value: 26 },
  { name: '物业纠纷', value: 25 },
  { name: '社区建设', value: 23 },
  { name: '拆迁问题', value: 22 },
  { name: '生活噪声问题', value: 18 },
  { name: '房屋建设规划问题', value: 17 },
  { name: '消防安全隐患', value: 15 },
  { name: '占道经营', value: 14 },
  { name: '商业噪音问题', value: 12 }
];

/** 事项大类占比（%） */
export const CATEGORY_PIE = [
  { name: '城市市容管理', value: 36.8 },
  { name: '房屋土地管理', value: 21.1 },
  { name: '社会服务', value: 13.1 },
  { name: '建设管理', value: 8.0 },
  { name: '社会治安管理', value: 4.2 },
  { name: '其他', value: 16.8 }
];

/** 重点区域问题特征（诉求内容关键词匹配统计） */
export const REGION_FEATURES = [
  {
    region: '东风村',
    community: '东风社区',
    issues: [
      { name: '违法占地', ratio: 24 },
      { name: '拆迁问题', ratio: 19 },
      { name: '工地周边问题', ratio: 19 }
    ]
  },
  {
    region: '永利',
    community: '永利社区',
    issues: [
      { name: '物业纠纷', ratio: 35 },
      { name: '房屋产权问题', ratio: 15 },
      { name: '违规办学', ratio: 10 }
    ]
  },
  {
    region: '天顺园',
    community: '天顺园北社区',
    issues: [
      { name: '社区建设', ratio: 17 },
      { name: '公共设施建设规划', ratio: 11 },
      { name: '业主委员会', ratio: 11 }
    ]
  }
];

/** 高风险区域 TOP5（关键词匹配工单量，评分=件数/最大值×100） */
export const HIGH_RISK_TOP5 = [
  { region: '东风村', community: '东风社区', score: 100 },
  { region: '永利', community: '永利社区', score: 95 },
  { region: '天顺园', community: '天顺园北社区', score: 86 },
  { region: '丰竹园', community: '丰竹园社区', score: 62 },
  { region: '长风路', community: '长顺社区', score: 43 }
];

/** 大类环比标签（2026-08 vs 2026-07） */
export const TREND_TAGS = [
  { name: '房屋土地管理类', change: 1033, direction: 'up' as const },
  { name: '城市市容管理类', change: 900, direction: 'up' as const },
  { name: '建设管理类', change: -50, direction: 'down' as const }
];

/** 季节预警（下月预测：近3月均值41与去年同期10折中） */
export const SEASON_ALERT = {
  season: '秋季',
  period: '2026-09',
  predictedOrders: 26,
  focusIssues: ['异味污染问题', '商品房买卖纠纷'],
  reason: '8月工单 58 件环比激增 314%，房屋土地管理类诉求集中，秋季需重点防范'
};

/** 月度工单趋势（2024-11 ~ 2026-08 真实统计，峰值=2025-01 75件） */
export const MONTHLY_TREND = [
  { month: '2024-11', value: 2, peak: false },
  { month: '2024-12', value: 57, peak: false },
  { month: '2025-01', value: 75, peak: true },
  { month: '2025-02', value: 12, peak: false },
  { month: '2025-03', value: 24, peak: false },
  { month: '2025-04', value: 10, peak: false },
  { month: '2025-05', value: 28, peak: false },
  { month: '2025-06', value: 22, peak: false },
  { month: '2025-07', value: 10, peak: false },
  { month: '2025-08', value: 18, peak: false },
  { month: '2025-09', value: 10, peak: false },
  { month: '2025-10', value: 4, peak: false },
  { month: '2025-11', value: 21, peak: false },
  { month: '2025-12', value: 14, peak: false },
  { month: '2026-01', value: 15, peak: false },
  { month: '2026-02', value: 6, peak: false },
  { month: '2026-03', value: 22, peak: false },
  { month: '2026-04', value: 22, peak: false },
  { month: '2026-05', value: 30, peak: false },
  { month: '2026-06', value: 51, peak: false },
  { month: '2026-07', value: 14, peak: false },
  { month: '2026-08', value: 58, peak: false }
];

/** 事项大类分布（真实统计，导出报表用；原科室负荷无真实来源，改用同口径数据） */
export const DEPT_LOAD = [
  { name: '城市市容管理类', value: 193 },
  { name: '房屋土地管理类', value: 111 },
  { name: '社会服务类', value: 69 },
  { name: '建设管理类', value: 42 },
  { name: '社会治安管理', value: 22 },
  { name: '园林绿化类', value: 18 },
  { name: '公共设施维护管理', value: 15 },
  { name: '市场管理类', value: 14 },
  { name: '社会劳动保障管理类', value: 10 },
  { name: '其他', value: 31 }
];

/* ========== 新事件处置参考（真实已办结工单样本） ========== */

export interface CaseRecord {
  id: string;
  title: string;
  result: string;
  reply?: string; // 回复内容
  dept: string;
  duration: number;
  category: string;
  community: string;
  date: string;
}

export const CASE_LIBRARY: CaseRecord[] = [
  {
    id: '2094980111248044032',
    title: '硚口区紫华路园博园南门公交场站下坡处院子门口的沥青路被压出很深的坑，车辆经过容易刮伤底盘，要求尽快修补',
    result: '处理结果：处置中 · 已转市政部门核实修补',
    dept: '长丰街道',
    duration: 12,
    category: '路面破损',
    community: '园博南社区',
    date: '2026-08-22'
  },
  {
    id: '2086733976414892032',
    title: '关于硚口区政府授意长丰街道答非所问、拒不履职的实名投诉，反映拆迁补偿相关问题',
    result: '处理结果：已处置 · 已按规定答复并跟进督办',
    dept: '长丰街道',
    duration: 10,
    category: '拆迁问题',
    community: '东风社区',
    date: '2026-07-15'
  },
  {
    id: '2086734063786438656',
    title: '关于请求对硚口区政府授意长丰街道拒不履行权属更名职责进行督办的投诉',
    result: '处理结果：已处置 · 权属更名事项已协调办理',
    dept: '长丰街道',
    duration: 10,
    category: '房屋产权问题',
    community: '永利社区',
    date: '2026-07-15'
  }
];

/* ========== 高频投诉人监控（有效手机号口径） ========== */

export const FREQUENT_COMPLAINANTS = {
  ge5: 1,
  ge10: 0,
  top: [
    { alias: '189****46', times: 5, mainIssue: '商品房买卖纠纷', community: '长丰街道' }
  ]
};

/* ========== 实时工单流（真实最新工单样本，接口加载后由数据池轮播覆盖） ========== */

export interface IncomingOrder {
  id: string;
  community: string;
  issue: string;
  category: string;
  time: string;
}

export const INCOMING_ORDER_POOL: Omit<IncomingOrder, 'id' | 'time'>[] = [
  { community: '长丰街道', issue: '出店经营 · 道路堵塞严重，车辆修理粉尘大，修车单位经常私自将道路封堵', category: '出店经营' },
  { community: '长丰街道', issue: '光污染 · 综合养老服务中心一栋楼每天晚上五、六点开始亮灯至深夜', category: '光污染' },
  { community: '长丰街道', issue: '商业噪音问题 · 优宠宠物基地动物叫声持续扰民', category: '商业噪音问题' },
  { community: '正康社区', issue: '环卫作业 · 垃圾清运车清运垃圾时污水从清运车流出污染路面', category: '环卫作业' }
];
