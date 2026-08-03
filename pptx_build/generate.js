const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();

// ========== 全局配置 ==========
pptx.layout = 'LAYOUT_WIDE'; // 16:9
pptx.author = '六角亭街道办事处';
pptx.company = '六角亭智慧街道';
pptx.subject = '项目立项评审报告';
pptx.title = '六角亭智慧街道民政综合管理系统 - 项目立项评审报告';

// ========== 主题色板 ==========
const COLORS = {
  navy: '0B1D3A',
  navyLight: '132744',
  gold: 'C9A961',
  goldSoft: 'E8D5A8',
  white: 'FFFFFF',
  offWhite: 'FAFBFC',
  text: '0B1D3A',
  textSub: '6B7280',
  textLight: '9CA3AF',
  border: 'E5E7EB',
  green: '10B981',
  amber: 'F59E0B',
  red: 'EF4444'
};

// ========== 通用字体 ==========
const FONT = { fontFace: 'Microsoft YaHei', fontFile: null };

// ========== 通用辅助函数 ==========
function addNavyHeader(slide, num, title, subtitle, badge) {
  // 左侧大号序号
  slide.addText(num, {
    x: 0.5, y: 0.45, w: 0.8, h: 0.8,
    fontSize: 36, fontFace: FONT.fontFace,
    color: COLORS.gold, bold: false
  });
  // 标题
  slide.addText(title, {
    x: 1.3, y: 0.5, w: 8, h: 0.45,
    fontSize: 20, fontFace: FONT.fontFace,
    color: COLORS.navy, bold: true
  });
  // 副标题
  slide.addText(subtitle, {
    x: 1.3, y: 0.95, w: 8, h: 0.3,
    fontSize: 10, fontFace: FONT.fontFace,
    color: COLORS.textLight, charSpacing: 2
  });
  // 右侧徽章
  if (badge) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 11.5, y: 0.6, w: 1.2, h: 0.35,
      fill: { color: 'FFFFFF' }, line: { color: COLORS.gold, width: 0.5 },
      rectRadius: 0.05
    });
    slide.addText(badge, {
      x: 11.5, y: 0.6, w: 1.2, h: 0.35,
      fontSize: 9, fontFace: FONT.fontFace,
      color: COLORS.gold, align: 'center', valign: 'middle',
      charSpacing: 2, bold: true
    });
  }
  // 分隔线
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 1.35, w: 12.2, h: 0,
    line: { color: COLORS.border, width: 0.5 }
  });
}

function addFooter(slide, pageNum, total = 9) {
  slide.addShape(pptx.ShapeType.line, {
    x: 0, y: 6.95, w: 13.333, h: 0,
    line: { color: COLORS.border, width: 0.5 }
  });
  slide.addText('六角亭智慧街道民政系统', {
    x: 0.5, y: 7.0, w: 4, h: 0.3,
    fontSize: 9, fontFace: FONT.fontFace,
    color: COLORS.textLight
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: 12, y: 7.0, w: 0.8, h: 0.3,
    fontSize: 9, fontFace: FONT.fontFace,
    color: COLORS.textLight, align: 'right'
  });
}

// ========== Slide 1: 封面 ==========
{
  const slide = pptx.addSlide();
  // 深蓝色背景
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: COLORS.navy }
  });
  // 金色左边线
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 1.5, w: 0.04, h: 4.5,
    fill: { color: COLORS.gold }
  });
  // 英文装饰
  slide.addText('PROJECT EVALUATION REPORT', {
    x: 1.0, y: 1.8, w: 10, h: 0.4,
    fontSize: 12, fontFace: 'Arial',
    color: COLORS.gold, charSpacing: 8, bold: false
  });
  // 主标题
  slide.addText('六角亭智慧街道', {
    x: 1.0, y: 2.4, w: 10, h: 0.9,
    fontSize: 44, fontFace: FONT.fontFace,
    color: COLORS.white, bold: true
  });
  slide.addText('民政综合管理系统', {
    x: 1.0, y: 3.3, w: 10, h: 0.9,
    fontSize: 44, fontFace: FONT.fontFace,
    color: COLORS.gold, bold: true
  });
  // 金色分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 4.5, w: 1.5, h: 0.05,
    fill: { color: COLORS.gold }
  });
  // 副标题
  slide.addText('项 目 立 项 评 审 报 告', {
    x: 1.0, y: 4.75, w: 10, h: 0.5,
    fontSize: 18, fontFace: FONT.fontFace,
    color: 'D1D5DB', charSpacing: 6, bold: false
  });
  // 底部信息
  slide.addShape(pptx.ShapeType.line, {
    x: 1.0, y: 6.5, w: 11.3, h: 0,
    line: { color: '1F3A5F', width: 0.5 }
  });
  slide.addText('◆ 六角亭街道办事处', {
    x: 1.0, y: 6.6, w: 5, h: 0.4,
    fontSize: 11, fontFace: FONT.fontFace,
    color: COLORS.gold, bold: true
  });
  slide.addText('政务信息化建设  ·  2024年7月', {
    x: 8, y: 6.6, w: 4.5, h: 0.4,
    fontSize: 11, fontFace: FONT.fontFace,
    color: '6B7280', align: 'right'
  });
}

// ========== Slide 2: 目录 ==========
{
  const slide = pptx.addSlide();
  // 左侧深蓝色区
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 4.5, h: 7.5,
    fill: { color: COLORS.navy }
  });
  // 左侧内容
  slide.addText('CONTENTS', {
    x: 0.6, y: 2.5, w: 3.5, h: 0.4,
    fontSize: 12, fontFace: 'Arial',
    color: COLORS.gold, charSpacing: 6
  });
  slide.addText('目录', {
    x: 0.6, y: 3.0, w: 3.5, h: 1.5,
    fontSize: 72, fontFace: FONT.fontFace,
    color: COLORS.white, bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 4.6, w: 0.8, h: 0.04,
    fill: { color: COLORS.gold }
  });
  slide.addText('聚焦民政业务数字化转型\n打造智慧街道治理新范式', {
    x: 0.6, y: 4.8, w: 3.5, h: 1.2,
    fontSize: 11, fontFace: FONT.fontFace,
    color: '6B7280', lineSpacingMultiple: 1.8
  });

  // 右侧目录项
  const items = [
    { num: '01', title: '项目提案', en: 'PROJECT PROPOSAL' },
    { num: '02', title: '评审会意见', en: 'REVIEW COMMENTS' },
    { num: '03', title: '决策事项', en: 'DECISION MATTERS' }
  ];
  items.forEach((item, i) => {
    const y = 2.0 + i * 1.2;
    // 序号
    slide.addText(item.num, {
      x: 5.2, y, w: 0.8, h: 0.8,
      fontSize: 30, fontFace: 'Georgia',
      color: COLORS.gold
    });
    // 标题
    slide.addText(item.title, {
      x: 6.2, y: y + 0.05, w: 6, h: 0.5,
      fontSize: 22, fontFace: FONT.fontFace,
      color: COLORS.navy, bold: true
    });
    // 英文
    slide.addText(item.en, {
      x: 6.2, y: y + 0.55, w: 6, h: 0.3,
      fontSize: 9, fontFace: 'Arial',
      color: COLORS.textLight, charSpacing: 1
    });
    // 分隔线
    if (i < items.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: 5.2, y: y + 1.1, w: 7.5, h: 0,
        line: { color: COLORS.border, width: 0.5 }
      });
    }
  });

  addFooter(slide, 2);
}

// ========== Slide 3: 章节页 ==========
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: COLORS.navy }
  });
  slide.addText('PART 01', {
    x: 1.0, y: 2.8, w: 10, h: 0.4,
    fontSize: 14, fontFace: 'Arial',
    color: COLORS.gold, charSpacing: 8
  });
  slide.addText('项目提案', {
    x: 1.0, y: 3.3, w: 10, h: 1.5,
    fontSize: 60, fontFace: FONT.fontFace,
    color: COLORS.white, bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 5.0, w: 1.8, h: 0.05,
    fill: { color: COLORS.gold }
  });
}

// ========== Slide 4: 项目背景与现状 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '01', '项目背景与现状分析', 'PROJECT BACKGROUND & CURRENT SITUATION', '现状洞察');

  // 左卡片
  const leftCardX = 0.5, cardY = 1.6, cardW = 6.0, cardH = 5.2;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: leftCardX, y: cardY, w: cardW, h: cardH,
    fill: { color: COLORS.offWhite }, line: { color: 'EEF0F3', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: leftCardX, y: cardY, w: 0.05, h: cardH,
    fill: { color: COLORS.gold }
  });
  slide.addText('◆ 项目背景', {
    x: leftCardX + 0.3, y: cardY + 0.25, w: cardW - 0.5, h: 0.45,
    fontSize: 14, fontFace: FONT.fontFace,
    color: COLORS.navy, bold: true
  });
  slide.addShape(pptx.ShapeType.line, {
    x: leftCardX + 0.3, y: cardY + 0.75, w: cardW - 0.6, h: 0,
    line: { color: COLORS.border, width: 0.5 }
  });
  const bgItems = [
    '民政业务数据分散在低保、残疾、公租房等多个系统，数据不互通',
    '人工核实居民资格效率低，错保漏保风险高，缺乏智能预警手段',
    '网格员走访、信息采集依赖纸质记录，信息更新不及时',
    '街道管理层缺乏统一的数据视图，决策支撑不足',
    '上级民政部门对基层治理数字化转型提出明确要求'
  ];
  bgItems.forEach((t, i) => {
    slide.addText('—  ' + t, {
      x: leftCardX + 0.35, y: cardY + 0.95 + i * 0.82, w: cardW - 0.6, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
  });

  // 右卡片
  const rightCardX = 6.8;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: rightCardX, y: cardY, w: cardW, h: cardH,
    fill: { color: COLORS.offWhite }, line: { color: 'EEF0F3', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: rightCardX, y: cardY, w: 0.05, h: cardH,
    fill: { color: COLORS.gold }
  });
  slide.addText('◆ 现状问题与对策', {
    x: rightCardX + 0.3, y: cardY + 0.25, w: cardW - 0.5, h: 0.45,
    fontSize: 14, fontFace: FONT.fontFace,
    color: COLORS.navy, bold: true
  });
  slide.addShape(pptx.ShapeType.line, {
    x: rightCardX + 0.3, y: cardY + 0.75, w: cardW - 0.6, h: 0,
    line: { color: COLORS.border, width: 0.5 }
  });
  const probItems = [
    { t: '信息孤岛', d: '各业务系统独立 → 建设统一居民信息库，一窗式展示' },
    { t: '人工效率低', d: '资格核查依赖人工 → 引入AI智能匹配和自动比对' },
    { t: '预警滞后', d: '问题发现靠举报 → 建立多维度预警规则引擎' },
    { t: '走访困难', d: '网格员管理难 → 配套移动端，支持走访打卡记录' },
    { t: '数据难用', d: '统计报表靠汇总 → 提供多维度统计报表和可视化' }
  ];
  probItems.forEach((item, i) => {
    const y = cardY + 0.95 + i * 0.82;
    slide.addText(item.t + '：', {
      x: rightCardX + 0.35, y, w: 1.3, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.navy, bold: true
    });
    slide.addText(item.d, {
      x: rightCardX + 1.65, y, w: cardW - 1.9, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
  });

  addFooter(slide, 4);
}

// ========== Slide 5: 项目目标与边界 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '02', '项目目标、边界与核心方案', 'OBJECTIVES, SCOPE & CORE SOLUTION', '战略定位');

  // 左卡片（绿色）
  const leftCardX = 0.5, cardY = 1.6, cardW = 6.0, cardH = 5.2;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: leftCardX, y: cardY, w: cardW, h: cardH,
    fill: { color: 'F0FDF4' }, line: { color: 'D1FAE5', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: leftCardX, y: cardY, w: 0.05, h: cardH,
    fill: { color: COLORS.green }
  });
  slide.addText('◆ 项目目标', {
    x: leftCardX + 0.3, y: cardY + 0.25, w: cardW - 0.5, h: 0.45,
    fontSize: 14, fontFace: FONT.fontFace,
    color: COLORS.green, bold: true
  });
  slide.addShape(pptx.ShapeType.line, {
    x: leftCardX + 0.3, y: cardY + 0.75, w: cardW - 0.6, h: 0,
    line: { color: 'D1FAE5', width: 0.5 }
  });
  const goalItems = [
    '建成街道级统一居民信息库，实现全量数据汇聚',
    '实现低保、残疾、公租房等10类保障标签统一管理',
    '建立智能预警体系，预警响应时效提升50%以上',
    '网格员移动端全覆盖，走访记录电子化',
    'AI政策匹配覆盖率达90%，减少人工遗漏'
  ];
  goalItems.forEach((t, i) => {
    slide.addText('—  ' + t, {
      x: leftCardX + 0.35, y: cardY + 0.95 + i * 0.82, w: cardW - 0.6, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
  });

  // 右卡片（琥珀色）
  const rightCardX = 6.8;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: rightCardX, y: cardY, w: cardW, h: cardH,
    fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: rightCardX, y: cardY, w: 0.05, h: cardH,
    fill: { color: COLORS.amber }
  });
  slide.addText('◆ 项目边界', {
    x: rightCardX + 0.3, y: cardY + 0.25, w: cardW - 0.5, h: 0.45,
    fontSize: 14, fontFace: FONT.fontFace,
    color: COLORS.amber, bold: true
  });
  slide.addShape(pptx.ShapeType.line, {
    x: rightCardX + 0.3, y: cardY + 0.75, w: cardW - 0.6, h: 0,
    line: { color: 'FDE68A', width: 0.5 }
  });
  const scopeItems = [
    { t: '覆盖范围', d: '六角亭街道全部社区、小区、网格' },
    { t: '服务对象', d: '街道民政办、社区工作者、网格员、居民' },
    { t: '系统边界', d: '对接上级民政系统数据，不替代原有业务系统' },
    { t: '暂不涉及', d: '资金发放审批、财务结算等需政务专网业务' },
    { t: '网格员管理', d: '已暂缓，后续根据实际需求再建设' }
  ];
  scopeItems.forEach((item, i) => {
    const y = cardY + 0.95 + i * 0.82;
    slide.addText(item.t + '：', {
      x: rightCardX + 0.35, y, w: 1.3, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.amber, bold: true
    });
    slide.addText(item.d, {
      x: rightCardX + 1.65, y, w: cardW - 1.9, h: 0.7,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
  });

  addFooter(slide, 5);
}

// ========== Slide 6: 核心功能模块 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '03', '核心功能模块', 'CORE FUNCTION MODULES', '能力矩阵');

  const modules = [
    { icon: '居', title: '居民信息管理', desc: '全量居民底册、基础信息、保障标签、历史档案一体化管理' },
    { icon: '警', title: '智能预警管理', desc: '到龄/到期/财产/死亡等多维度规则预警与闭环处理' },
    { icon: 'AI', title: 'AI政策匹配', desc: '基于居民条件智能推荐可享受政策，减少人工遗漏' },
    { icon: '报', title: '统计报表', desc: '多维度数据统计、可视化图表、一键导出分析报告' },
    { icon: '导', title: '数据导入', desc: '居民基础信息、政策待遇标签批量模板化导入' },
    { icon: '移', title: '网格员移动端', desc: '居民查询、走访打卡、走访记录、现场信息采集' }
  ];

  const startX = 0.5, startY = 1.65;
  const cardW = 4.0, cardH = 2.45;
  const gapX = 0.3, gapY = 0.3;

  modules.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH,
      fill: { color: COLORS.white }, line: { color: 'EEF0F3', width: 0.5 },
      rectRadius: 0.05
    });

    // 图标方块
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.25, y: y + 0.25, w: 0.65, h: 0.65,
      fill: { color: COLORS.navy }, rectRadius: 0.05
    });
    slide.addText(m.icon, {
      x: x + 0.25, y: y + 0.25, w: 0.65, h: 0.65,
      fontSize: 18, fontFace: FONT.fontFace,
      color: COLORS.gold, align: 'center', valign: 'middle', bold: true
    });

    // 标题
    slide.addText(m.title, {
      x: x + 1.05, y: y + 0.3, w: cardW - 1.3, h: 0.45,
      fontSize: 14, fontFace: FONT.fontFace,
      color: COLORS.navy, bold: true
    });

    // 描述
    slide.addText(m.desc, {
      x: x + 0.3, y: y + 1.1, w: cardW - 0.5, h: 1.2,
      fontSize: 10.5, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.6
    });
  });

  addFooter(slide, 6);
}

// ========== Slide 7: 实施计划与预算 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '04', '实施计划与投资预算', 'IMPLEMENTATION PLAN & BUDGET', '落地路径');

  // 时间线
  const tlY = 1.7;
  const tlItems = [
    { m: 'M1', t: '需求调研', d: '业务梳理 / 需求确认 / 方案设计' },
    { m: 'M2', t: '系统开发', d: '后台管理端 / 核心功能开发' },
    { m: 'M3', t: '移动端开发', d: '网格员移动端 / 接口联调' },
    { m: 'M4', t: '测试上线', d: '测试培训 / 试运行验收' }
  ];
  const tlStartX = 1.2, tlEndX = 12.1;
  const tlWidth = tlEndX - tlStartX;
  const step = tlWidth / (tlItems.length - 1);

  // 连接线
  slide.addShape(pptx.ShapeType.line, {
    x: tlStartX, y: tlY + 0.5, w: tlWidth, h: 0,
    line: { color: COLORS.goldSoft, width: 1 }
  });

  tlItems.forEach((item, i) => {
    const x = tlStartX + i * step;
    // 圆点
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x - 0.18, y: tlY + 0.32, w: 0.36, h: 0.36,
      fill: { color: i === 0 ? COLORS.gold : COLORS.white },
      line: { color: COLORS.gold, width: 1.5 }
    });
    slide.addText(item.m, {
      x: x - 0.3, y: tlY + 0.32, w: 0.6, h: 0.36,
      fontSize: 10, fontFace: FONT.fontFace,
      color: i === 0 ? COLORS.white : COLORS.gold,
      align: 'center', valign: 'middle', bold: true
    });
    // 标题
    slide.addText(item.t, {
      x: x - 1, y: tlY - 0.05, w: 2, h: 0.35,
      fontSize: 13, fontFace: FONT.fontFace,
      color: COLORS.navy, align: 'center', bold: true
    });
    // 描述
    slide.addText(item.d, {
      x: x - 1, y: tlY + 0.78, w: 2, h: 0.6,
      fontSize: 9, fontFace: FONT.fontFace,
      color: COLORS.textLight, align: 'center', lineSpacingMultiple: 1.5
    });
  });

  // 预算表格
  const tableY = 3.5;
  const tableX = 0.5;
  const tableW = 12.3;

  // 表头
  slide.addShape(pptx.ShapeType.rect, {
    x: tableX, y: tableY, w: tableW, h: 0.55,
    fill: { color: COLORS.navy }
  });
  const headers = ['序号', '费用类别', '内容说明', '预算（万元）'];
  const colWidths = [0.8, 3.2, 6.3, 2.0];
  let colX = tableX;
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: colX, y: tableY, w: colWidths[i], h: 0.55,
      fontSize: 11, fontFace: FONT.fontFace,
      color: COLORS.white, align: i === 3 ? 'right' : 'left', valign: 'middle',
      margin: [0, 0.2, 0, 0.2], bold: false
    });
    colX += colWidths[i];
  });

  // 数据行
  const rows = [
    ['01', '需求调研与设计', '业务梳理、原型设计、方案输出', '8.0'],
    ['02', '后台管理系统开发', '居民、预警、报表、AI匹配等模块', '28.0'],
    ['03', '网格员移动端开发', '移动H5、走访打卡、居民查询', '12.0'],
    ['04', '系统部署与集成', '云资源、部署配置、接口对接', '6.0'],
    ['05', '培训与运维', '操作培训、1年运维支持', '6.0']
  ];
  const rowH = 0.48;
  rows.forEach((row, i) => {
    const ry = tableY + 0.55 + i * rowH;
    let cx = tableX;
    row.forEach((cell, j) => {
      slide.addText(cell, {
        x: cx, y: ry, w: colWidths[j], h: rowH,
        fontSize: 10.5, fontFace: FONT.fontFace,
        color: COLORS.textSub,
        align: j === 3 ? 'right' : 'left', valign: 'middle',
        margin: [0, 0.2, 0, 0.2]
      });
      cx += colWidths[j];
    });
    if (i < rows.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: tableX, y: ry + rowH, w: tableW, h: 0,
        line: { color: 'F3F4F6', width: 0.5 }
      });
    }
  });

  // 合计行
  const totalY = tableY + 0.55 + rows.length * rowH;
  slide.addShape(pptx.ShapeType.rect, {
    x: tableX, y: totalY, w: tableW, h: 0.55,
    fill: { color: 'FEF3C7' }
  });
  slide.addText('合计总投资', {
    x: tableX, y: totalY, w: colWidths[0] + colWidths[1] + colWidths[2], h: 0.55,
    fontSize: 12, fontFace: FONT.fontFace,
    color: COLORS.navy, align: 'right', valign: 'middle',
    margin: [0, 0.3, 0, 0.2], bold: true
  });
  slide.addText('60.0 万元', {
    x: tableX + colWidths[0] + colWidths[1] + colWidths[2], y: totalY,
    w: colWidths[3], h: 0.55,
    fontSize: 13, fontFace: FONT.fontFace,
    color: COLORS.navy, align: 'right', valign: 'middle',
    margin: [0, 0.2, 0, 0.2], bold: true
  });

  addFooter(slide, 7);
}

// ========== Slide 8: 风险与控制 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '05', '风险分析与控制措施', 'RISK ANALYSIS & CONTROL MEASURES', '风险管控');

  const risks = [
    { level: '高风险', color: COLORS.red, bgColor: 'FEF2F2', border: 'FECACA', title: '数据迁移风险', desc: '历史数据多系统分散、格式不统一。控制：详细映射方案 + 三轮核对 + 原始数据可追溯。' },
    { level: '高风险', color: COLORS.red, bgColor: 'FEF2F2', border: 'FECACA', title: '需求变更风险', desc: '民政业务政策调整频繁。控制：敏捷迭代，每2周版本交付，建立变更评审机制。' },
    { level: '中风险', color: COLORS.amber, bgColor: 'FFFBEB', border: 'FDE68A', title: '用户接受度风险', desc: '社区工作者年龄跨度大。控制：界面简洁易用，图文操作手册，分批面对面培训。' },
    { level: '中风险', color: COLORS.amber, bgColor: 'FFFBEB', border: 'FDE68A', title: '数据安全风险', desc: '居民敏感信息泄露风险。控制：加密存储，操作留痕，严格权限分级，符合等保要求。' },
    { level: '低风险', color: COLORS.green, bgColor: 'F0FDF4', border: 'D1FAE5', title: '进度延期风险', desc: '4个月周期功能较多。控制：关键路径管理，预留2周缓冲期，核心功能优先交付。' },
    { level: '低风险', color: COLORS.green, bgColor: 'F0FDF4', border: 'D1FAE5', title: '预算超支风险', desc: '需求变更可能推高成本。控制：严格变更管理，超预算需求走追加审批流程。' }
  ];

  const startX = 0.5, startY = 1.65;
  const cardW = 6.05, cardH = 1.6;
  const gapX = 0.2, gapY = 0.2;

  risks.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH,
      fill: { color: r.bgColor }, line: { color: r.border, width: 0.5 },
      rectRadius: 0.05
    });
    // 左边条
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.06, h: cardH,
      fill: { color: r.color }
    });

    // 风险等级标签
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.25, y: y + 0.2, w: 0.9, h: 0.3,
      fill: { color: r.bgColor }, line: { color: r.color, width: 0.5 },
      rectRadius: 0.03
    });
    slide.addText(r.level, {
      x: x + 0.25, y: y + 0.2, w: 0.9, h: 0.3,
      fontSize: 9, fontFace: FONT.fontFace,
      color: r.color, align: 'center', valign: 'middle', bold: true
    });

    // 标题
    slide.addText(r.title, {
      x: x + 1.25, y: y + 0.18, w: cardW - 1.5, h: 0.35,
      fontSize: 13, fontFace: FONT.fontFace,
      color: COLORS.navy, bold: true
    });

    // 描述
    slide.addText(r.desc, {
      x: x + 0.25, y: y + 0.6, w: cardW - 0.5, h: 0.9,
      fontSize: 10, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.6
    });
  });

  addFooter(slide, 8);
}

// ========== Slide 9: 评审与决策 ==========
{
  const slide = pptx.addSlide();
  addNavyHeader(slide, '06', '评审会意见 & 决策事项', 'REVIEW OPINIONS & DECISION MATTERS', '结论输出');

  // 左：评审意见
  const leftX = 0.5, topY = 1.65, blockW = 6.05, blockH = 5.15;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: leftX, y: topY, w: blockW, h: blockH,
    fill: { color: COLORS.offWhite }, line: { color: 'EEF0F3', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addText('评审会意见', {
    x: leftX + 0.3, y: topY + 0.25, w: blockW - 0.6, h: 0.5,
    fontSize: 17, fontFace: FONT.fontFace,
    color: COLORS.navy, bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: leftX + 0.3, y: topY + 0.78, w: 1, h: 0.04,
    fill: { color: COLORS.gold }
  });

  const reviews = [
    { label: '业务部门 · 民政办', value: '确认需求覆盖全面，预警规则和标签体系符合街道实际业务场景，建议加快推进。' },
    { label: '技术部门 · 党政办', value: '技术方案可行，采用Vue3+Element Plus主流技术栈，云部署成本可控。' },
    { label: '财务部门', value: '60万预算在政务信息化项目合理区间内，建议按季度分期拨付。' },
    { label: '法务部门', value: '需明确数据安全保密条款，居民个人信息保护须符合《个人信息保护法》。' }
  ];
  reviews.forEach((r, i) => {
    const y = topY + 1.05 + i * 1.0;
    slide.addText(r.label, {
      x: leftX + 0.35, y, w: blockW - 0.7, h: 0.3,
      fontSize: 10, fontFace: FONT.fontFace,
      color: COLORS.gold, bold: true
    });
    slide.addText(r.value, {
      x: leftX + 0.35, y: y + 0.3, w: blockW - 0.7, h: 0.6,
      fontSize: 10.5, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
    if (i < reviews.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: leftX + 0.35, y: y + 0.95, w: blockW - 0.7, h: 0,
        line: { color: 'E5E7EB', width: 0.5, dashType: 'dash' }
      });
    }
  });

  // 右：决策事项
  const rightX = 6.75;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: rightX, y: topY, w: blockW, h: blockH,
    fill: { color: COLORS.offWhite }, line: { color: 'EEF0F3', width: 0.5 },
    rectRadius: 0.05
  });
  slide.addText('决策事项', {
    x: rightX + 0.3, y: topY + 0.25, w: blockW - 0.6, h: 0.5,
    fontSize: 17, fontFace: FONT.fontFace,
    color: COLORS.navy, bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX + 0.3, y: topY + 0.78, w: 1, h: 0.04,
    fill: { color: COLORS.gold }
  });

  const decisions = [
    { label: '决策一 · 项目立项', value: '同意"六角亭智慧街道民政综合管理系统"项目正式立项。' },
    { label: '决策二 · 投资预算', value: '总投资预算控制在60万元以内，从街道政务信息化专项经费列支。' },
    { label: '决策三 · 建设模式', value: '街道自建+云部署，民政办牵头、党政办配合，公开招标确定承建单位。' },
    { label: '决策四 · 项目周期', value: '总工期4个月（M1调研 → M4上线验收），2024年Q3完成全部建设。' }
  ];
  decisions.forEach((d, i) => {
    const y = topY + 1.05 + i * 1.0;
    slide.addText(d.label, {
      x: rightX + 0.35, y, w: blockW - 0.7, h: 0.3,
      fontSize: 10, fontFace: FONT.fontFace,
      color: COLORS.gold, bold: true
    });
    slide.addText(d.value, {
      x: rightX + 0.35, y: y + 0.3, w: blockW - 0.7, h: 0.6,
      fontSize: 10.5, fontFace: FONT.fontFace,
      color: COLORS.textSub, lineSpacingMultiple: 1.5
    });
    if (i < decisions.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: rightX + 0.35, y: y + 0.95, w: blockW - 0.7, h: 0,
        line: { color: 'E5E7EB', width: 0.5, dashType: 'dash' }
      });
    }
  });

  addFooter(slide, 9);
}

// ========== 输出文件 ==========
const outputPath = '../六角亭智慧街道民政系统-项目立项评审.pptx';
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log('✅ PPT生成成功：' + outputPath);
  })
  .catch(err => {
    console.error('❌ 生成失败：', err);
  });
