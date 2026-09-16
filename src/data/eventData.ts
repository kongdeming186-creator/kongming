// 事件类型定义与地图点位工具（业务数据全部由 dataService 基于真实工单生成）
import { COMMUNITIES } from './communities';

/** 事件类型大类（10 类，地图点位图标颜色区分） */
export type EventCategory =
  | '城管'
  | '物业'
  | '安全'
  | '环保'
  | '民生'
  | '交通'
  | '市政'
  | '规划'
  | '违建'
  | '水务';

/** 事件类型 → 图标色（深色卫星底图上的高辨识度色板） */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  城管: '#f97316',
  物业: '#3b82f6',
  安全: '#ef4444',
  环保: '#22c55e',
  民生: '#eab308',
  交通: '#06b6d4',
  市政: '#a855f7',
  规划: '#ec4899',
  违建: '#f43f5e',
  水务: '#14b8a6'
};

/** 事件类型 → 默认办理科室（真实工单未填办结单位时兜底） */
export const DEPT_OF: Record<EventCategory, string> = {
  城管: '执法中队',
  物业: '公共服务办',
  安全: '公共管理办',
  环保: '执法中队',
  民生: '公共服务办',
  交通: '执法中队',
  市政: '公共管理办',
  规划: '城改办',
  违建: '执法中队',
  水务: '公共管理办'
};

/* ==================== 城运事件（来源：区城运中心，独立于 12345 热线工单） ==================== */

/** 城运事件调度时间线条目 */
export interface CityOpsTimelineEntry {
  time: string;
  org: string;
  person: string;
  status: string;
  /** 研判结论标签（如"升级预警"） */
  resultLabel?: string;
  resultColor?: 'warn' | 'success' | 'info';
  opinion?: string;
  /** 下派批示 */
  dispatchNote?: string;
  dispatchedTo?: string[];
  readCount?: number;
}

/** 城运事件「处置过程」原始警情信息（来源：122警情 / 区城运中心） */
export interface CityOpsProcessInfo {
  /** 警情来源标识（如 122警情） */
  alertSource: string;
  /** 警情分类标签（如 事故类） */
  alertCategory: string;
  /** 来源类型 */
  sourceType: string;
  /** 事件编号 */
  eventNo: string;
  /** 警情等级 */
  alertLevel: string;
  /** 事件分类 */
  eventCategory: string;
  /** 发现时间 */
  discoverTime: string;
  /** 上报时间 */
  reportTime: string;
  /** 事件地址 */
  address: string;
  /** 事件描述 */
  description: string;
}

/** 城运事件详情 */
export interface CityOpsEvent {
  id: string;
  title: string;
  tag: string;
  reportTime: string;
  address: string;
  keywords: string[];
  tags: string[];
  description: string[];
  attachments: string[];
  timeline: CityOpsTimelineEntry[];
  /** 底部调度信息 */
  dispatchOrg: string;
  dispatchStatus: '已结案' | '办理中';
  dispatchTime: string;
  /** 多级调度单位列表（如 screenshot 中的 城运中心/街道/社区/网格） */
  dispatchUnits?: { org: string; status: string; time: string }[];
  /** 「处置过程」原始警情信息 */
  process?: CityOpsProcessInfo;
  /** 事件点位（GCJ-02，用于地图定位） */
  lng: number;
  lat: number;
}

/** 城运事件真实案例：硚口区长丰街道丰华园小区交通事故（来源：用户提供的城运系统截图） */
export const CITY_OPS_EVENT: CityOpsEvent = {
  id: '20260902459833',
  title: '硚口区长丰街道丰华园小区交通事故',
  tag: '交通事故',
  reportTime: '2026-09-02 13:38:52',
  address: '硚口区长丰大道丰华园小区5栋楼下',
  keywords: ['丰华园'],
  tags: ['交通事故'],
  description: [
    '2026年9月2日13时38分，接到市民报警：刚刚小车倒车压到1个走路的婆婆，婆婆已经死亡，请交警到场处理。到警回告5652。'
  ],
  attachments: [],
  timeline: [
    {
      time: '2026-09-02 14:08:30',
      org: '硚口区城运中心',
      person: '黄征',
      status: '研判',
      resultLabel: '升级预警',
      resultColor: 'warn',
      opinion: '根据研判规则，该事件已达到升级预警标准，拟升级预警事件。',
      dispatchedTo: ['硚口区长丰街道', '硚口区城运中心'],
      readCount: 2
    },
    {
      time: '2026-09-02 14:09:02',
      org: '硚口区城运中心',
      person: '黄征',
      status: '签收',
      opinion: '硚口区城运中心已收到。'
    },
    {
      time: '2026-09-02 14:09:50',
      org: '硚口区城运中心',
      person: '黄征',
      status: '初告',
      opinion: '2026年9月2日14时09分收到硚口区长丰街道丰华园小区交通事故。'
    },
    {
      time: '2026-09-02 14:11:40',
      org: '硚口区城运中心',
      person: '黄征',
      status: '续告',
      opinion: '14时11分硚口区城运中心立刻协调区交通大队和长丰街道工作人员核实具体情况。'
    },
    {
      time: '2026-09-02 15:07:50',
      org: '硚口区城运中心/硚口区长丰街道',
      person: '长丰街道-经办员',
      status: '签收',
      opinion: '硚口区长丰街道已收到。'
    },
    {
      time: '2026-09-02 15:21:22',
      org: '硚口区城运中心/硚口区长丰街道',
      person: '长丰街道-经办员',
      status: '初告',
      opinion: '派长丰社区核实情况。'
    },
    {
      time: '2026-09-02 15:22:00',
      org: '硚口区长丰街道',
      person: '长丰街道-经办员',
      status: '派发',
      opinion: '事件增派至长丰社区、硚口区长丰街道。',
      dispatchNote: '2小时回复情况',
      dispatchedTo: ['长丰社区', '硚口区长丰街道'],
      readCount: 1
    },
    {
      time: '2026-09-02 15:22:56',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区',
      person: '长丰社区',
      status: '签收',
      opinion: '长丰社区已收到。'
    },
    {
      time: '2026-09-02 15:26:14',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区',
      person: '长丰社区',
      status: '初告',
      opinion: '2026.9.2两点左右，丰华园5栋楼下，有一辆新能源汽车在倒车时，不慎将一位老婆婆撞倒，老婆婆当场去世。'
    },
    {
      time: '2026-09-02 15:29:25',
      org: '长丰社区',
      person: '长丰社区',
      status: '派发',
      opinion: '事件增派至长丰社区、第003网格。',
      dispatchNote: '请处理',
      dispatchedTo: ['长丰社区', '第003网格'],
      readCount: 1
    },
    {
      time: '2026-09-02 15:45:07',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区/第003网格',
      person: '第003网格',
      status: '签收',
      opinion: '第003网格已收到。'
    },
    {
      time: '2026-09-02 15:50:46',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区/第003网格',
      person: '第003网格',
      status: '初告',
      opinion: '2026.9.2两点钟左右，社区收到消息丰华园五栋发生一起交通事故，一辆新能源汽车倒车时将以高龄老人撞到，社区立即组织人员前往现场了解情况，维持秩序。'
    },
    {
      time: '2026-09-02 15:59:02',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区/第003网格',
      person: '第003网格',
      status: '续告',
      opinion: '2026.9.2两点多，社区到丰华园5栋现场了解情况，一辆新能源汽车（车牌号：鄂AAY7806）倒车时，将一位老婆婆撞倒，老婆婆当场死亡，随即公安机关、120都到现场处理，社区协助维持秩序，安抚家属。目前已处理完毕。'
    },
    {
      time: '2026-09-02 16:00:24',
      org: '硚口区城运中心/硚口区长丰街道/长丰社区/第003网格',
      person: '第003网格',
      status: '小结',
      opinion: '已处理完毕。'
    },
    {
      time: '2026-09-02 16:06:38',
      org: '硚口区城运中心',
      person: '硚口区城运-经办员',
      status: '续告',
      opinion: '社区到现场了解情况，并协助维持秩序，目前现场已经处理完毕。'
    },
    {
      time: '2026-09-02 16:06:55',
      org: '硚口区城运中心',
      person: '硚口区城运-经办员',
      status: '签收',
      opinion: '硚口区城运中心已收到。'
    },
    {
      time: '2026-09-02 16:07:15',
      org: '硚口区城运中心',
      person: '硚口区城运-经办员',
      status: '小结',
      opinion: '已处理完毕。'
    },
    {
      time: '2026-09-02 16:19:14',
      org: '硚口区城运中心',
      person: '黄征',
      status: '结案审核',
      resultLabel: '同意',
      resultColor: 'success',
      opinion: '同意结案。'
    }
  ],
  dispatchOrg: '硚口区城运中心',
  dispatchStatus: '已结案',
  dispatchTime: '2026-09-02 14:08:30',
  dispatchUnits: [
    { org: '硚口区城运中心', status: '已结案', time: '2026-09-02 14:08:30' },
    { org: '硚口区长丰街道', status: '已结案', time: '2026-09-02 15:22:00' },
    { org: '长丰社区', status: '已结案', time: '2026-09-02 15:29:25' },
    { org: '第003网格', status: '已结案', time: '2026-09-02 15:29:25' }
  ],
  process: {
    alertSource: '122警情',
    alertCategory: '事故类',
    sourceType: '报警或求助',
    eventNo: '202609020081338527FE',
    alertLevel: '一级警情',
    eventCategory: '事故类',
    discoverTime: '2026-09-02 14:06:01',
    reportTime: '2026-09-02 13:38:52',
    address: '硚口区长丰大道丰华园小区5栋楼下',
    description: '刚刚小车倒车压到1个走路的婆婆，婆婆已经死了，请交警到。到警回告5652。'
  },
  lng: 114.214,
  lat: 30.61
};

/** 城运事件真实案例2：硚口区长丰街道天顺园小区周边污水井盖破损冒溢（来源：区城运中心，2026-09-01） */
export const CITY_OPS_EVENT_SEWAGE: CityOpsEvent = {
  id: '20260901459715',
  title: '硚口区长丰街道天顺园小区周边道路污水井盖破损冒溢',
  tag: '市政设施',
  reportTime: '2026-09-01 09:15:36',
  address: '硚口区长丰街道天顺园小区东侧车行道',
  keywords: ['天顺园'],
  tags: ['市政设施', '污水冒溢'],
  description: [
    '2026年9月1日9时15分，区城运中心接到网格员上报：天顺园小区东侧车行道一处污水井盖破损，污水外溢影响行人通行，请相关部门尽快处置。'
  ],
  attachments: [],
  timeline: [
    {
      time: '2026-09-01 09:32:10',
      org: '硚口区城运中心',
      person: '黄征',
      status: '研判',
      opinion: '经研判，该事件属于市政设施类常规事件，按属地管理原则下派长丰街道办理。'
    },
    {
      time: '2026-09-01 09:35:02',
      org: '硚口区长丰街道',
      person: '长丰街道-经办员',
      status: '签收',
      opinion: '硚口区长丰街道已收到。'
    },
    {
      time: '2026-09-01 09:40:18',
      org: '硚口区长丰街道',
      person: '长丰街道-经办员',
      status: '派发',
      opinion: '事件派发至公共管理办、天顺园社区。',
      dispatchNote: '当日回复处置情况',
      dispatchedTo: ['公共管理办', '天顺园社区'],
      readCount: 2
    },
    {
      time: '2026-09-01 11:05:44',
      org: '硚口区长丰街道/天顺园社区',
      person: '天顺园社区',
      status: '初告',
      opinion: '社区已到场设置警示围挡，并联系区市政排水维护队到场抢修。'
    },
    {
      time: '2026-09-01 16:48:30',
      org: '硚口区长丰街道/天顺园社区',
      person: '天顺园社区',
      status: '小结',
      opinion: '经区市政排水维护队现场作业，破损井盖已更换，路面污水已清理完毕，恢复正常通行。'
    },
    {
      time: '2026-09-01 17:20:12',
      org: '硚口区城运中心',
      person: '黄征',
      status: '结案审核',
      resultLabel: '同意',
      resultColor: 'success',
      opinion: '经审核，事件已处置完毕，同意结案。'
    }
  ],
  dispatchOrg: '硚口区城运中心',
  dispatchStatus: '已结案',
  dispatchTime: '2026-09-01 09:32:10',
  dispatchUnits: [
    { org: '硚口区城运中心', status: '已结案', time: '2026-09-01 09:32:10' },
    { org: '硚口区长丰街道', status: '已结案', time: '2026-09-01 09:40:18' },
    { org: '天顺园社区', status: '已结案', time: '2026-09-01 11:05:44' }
  ],
  process: {
    alertSource: '网格上报',
    alertCategory: '市政类',
    sourceType: '网格员上报',
    eventNo: '202609010080915231TA',
    alertLevel: '三级警情',
    eventCategory: '市政设施',
    discoverTime: '2026-09-01 09:10:00',
    reportTime: '2026-09-01 09:15:36',
    address: '硚口区长丰街道天顺园小区东侧车行道',
    description: '天顺园小区东侧车行道一处污水井盖破损，污水外溢影响行人通行。'
  },
  lng: 114.217,
  lat: 30.611
};

/** 近两天城运事件列表（按上报时间倒序，覆盖 09-01 / 09-02 两天） */
export const CITY_OPS_EVENTS: CityOpsEvent[] = [CITY_OPS_EVENT, CITY_OPS_EVENT_SEWAGE];

/** 事件点位（源自真实 12345 热线工单） */
export interface HazardEvent {
  id: string; // 办件编号
  content: string; // 完整诉求内容
  community: string; // 所属社区（关键词匹配，未匹配为「长丰街道」）
  category: EventCategory; // 事件类型大类（事项大类映射）
  dept: string; // 办结单位 / 受理部门
  risk: 'high' | 'mid' | 'low'; // 风险等级（所在社区近90天工单密度分级）
  days: number; // 距受理天数
  result: string; // 处理结果
  time: string; // 受理时间（MM-DD HH:mm）
  status?: string; // 办件状态（已办结 / 未办结）
  address?: string; // 报案地址
  lng: number; // 事件点位经度（GCJ-02，社区螺旋定位）
  lat: number; // 事件点位纬度（GCJ-02）
}

/** 社区标签避让偏移（度）→ 地图渲染时按当前缩放换算像素（静态配置） */
export const LABEL_OFFSETS: Record<string, number> = Object.fromEntries(
  COMMUNITIES.map((c) => [c.name, 0.00365])
);

/**
 * 高发区域（基于 15,308 条热线工单地址分析）
 * 按诉求内容/主题中地址关键词聚类，定义实际地理多边形范围
 */
export interface HighIncidenceArea {
  id: string;
  name: string;
  /** 事件数量 */
  count: number;
  /** 高频问题 */
  topIssue: string;
  /** 事项大类 */
  topCategory: string;
  /** 多边形顶点坐标（GCJ-02） */
  path: [number, number][];
  /** 标签中心点 */
  center: [number, number];
  /** 风险等级色 */
  color: string;
}

export const HIGH_INCIDENCE_AREAS: HighIncidenceArea[] = [
  {
    id: 'changfeng-ave',
    name: '长丰大道',
    count: 938,
    topIssue: '商业噪音',
    topCategory: '城市市容管理类',
    color: '#c41e24',
    // 北:长风路/丰华路 南:汉丹铁路 东:古田四路 西:古田二路
    path: [
      [114.205, 30.604], [114.224, 30.604], [114.224, 30.608],
      [114.205, 30.608],
    ],
    center: [114.214, 30.606],
  },
  {
    id: 'chenghua-rd',
    name: '城华路',
    count: 869,
    topIssue: '占道经营',
    topCategory: '城市市容管理类',
    color: '#c41e24',
    // 北:园博园南路 南:长丰大道 东:古田四路 西:古田二路
    path: [
      [114.210, 30.618], [114.222, 30.618], [114.222, 30.623],
      [114.210, 30.623],
    ],
    center: [114.216, 30.621],
  },
  {
    id: 'tianshunyuan',
    name: '天顺园',
    count: 801,
    topIssue: '业委会',
    topCategory: '城市市容管理类',
    color: '#e63946',
    // 北:园博园西路 南:长丰大道 东:古田四路 西:丰顺路
    path: [
      [114.212, 30.609], [114.222, 30.609], [114.222, 30.614],
      [114.212, 30.614],
    ],
    center: [114.217, 30.611],
  },
  {
    id: 'gutian-4rd',
    name: '古田四路',
    count: 748,
    topIssue: '公共设施规划',
    topCategory: '城市市容管理类',
    color: '#e63946',
    // 北:园博园西路 南:解放大道 东:长安路 西:长祥路
    path: [
      [114.215, 30.597], [114.221, 30.597], [114.221, 30.610],
      [114.215, 30.610],
    ],
    center: [114.218, 30.604],
  },
  {
    id: 'zirun',
    name: '紫润明园',
    count: 600,
    topIssue: '商业噪音',
    topCategory: '城市市容管理类',
    color: '#e63946',
    // 北:园博园南路 南:汉丹铁路 东:城华路 西:古田二路
    path: [
      [114.207, 30.618], [114.216, 30.618], [114.216, 30.624],
      [114.207, 30.624],
    ],
    center: [114.211, 30.621],
  },
  {
    id: 'dongfeng',
    name: '东风村',
    count: 551,
    topIssue: '拆迁问题',
    topCategory: '房屋土地管理类',
    color: '#f4a261',
    // 北:长丰大道 南:工农路 东:园博大道 西:长云路
    path: [
      [114.255, 30.567], [114.265, 30.567], [114.265, 30.573],
      [114.255, 30.573],
    ],
    center: [114.260, 30.570],
  },
  {
    id: 'hankou-plaza',
    name: '华生城市广场',
    count: 515,
    topIssue: '商业噪音',
    topCategory: '城市市容管理类',
    color: '#f4a261',
    // 北:中环线/张公堤 南:长丰大道 东:古田二路 西:长风路
    path: [
      [114.202, 30.612], [114.212, 30.612], [114.212, 30.618],
      [114.202, 30.618],
    ],
    center: [114.207, 30.615],
  },
  {
    id: 'gutian-2rd',
    name: '古田二路',
    count: 495,
    topIssue: '商业噪音',
    topCategory: '城市市容管理类',
    color: '#f4a261',
    // 北:南泥湾/长丰大道 南:沿河大道 东:辛家地北路 西:共青路
    path: [
      [114.194, 30.596], [114.200, 30.596], [114.200, 30.608],
      [114.194, 30.608],
    ],
    center: [114.197, 30.602],
  },
  {
    id: 'fengmei-rd',
    name: '丰美路',
    count: 483,
    topIssue: '商业噪音',
    topCategory: '城市市容管理类',
    color: '#f4a261',
    // 北:长风路 南:长丰大道 东:丰华路 西:长久路
    path: [
      [114.203, 30.603], [114.211, 30.603], [114.211, 30.608],
      [114.203, 30.608],
    ],
    center: [114.207, 30.605],
  },
  {
    id: 'longhu',
    name: '龙湖春江郦城',
    count: 387,
    topIssue: '业委会',
    topCategory: '社会服务类',
    color: '#f4a261',
    // 北:长丰大道高架 南:汉丹铁路 东:古田二路 西:丰硕路
    path: [
      [114.190, 30.608], [114.198, 30.608], [114.198, 30.614],
      [114.190, 30.614],
    ],
    center: [114.194, 30.611],
  },
];
