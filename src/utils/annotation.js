/**
 * PRD原型标注系统
 * 全局统一编号：P1-登录, P2-首页, P3-居民列表, P4-居民详情, P5-预警, P6-其他
 */
(function () {
  'use strict';

  // ============== 配置 ==============
  const ANNOTATION_CONFIG = {
    badgeColor: 'rgb(250, 173, 20)',
    floatBg: '#f0efef',
    floatWidth: '450px',
    floatRadius: '4px',
    zIndexBase: 99999,
  };

  // ============== 标注数据（由annotation-map.json同步） ==============
  const ANNOTATIONS = {
    "P1-1": {
      id: "P1-1", page: "login", title: "登录表单-账号密码验证码",
      selector: ".login-container, .login-form, #app",
      content: "**P1-1 登录表单**\n\n**需求描述：**\n- 账号输入框：必填，支持回车提交\n- 密码输入框：必填，密文显示，支持回车提交\n- 验证码：输入框+图片，必填，点击图片可刷新\n- 登录按钮：校验通过后跳转首页仪表盘\n- 记住密码：复选框，可选，默认不勾选\n\n**业务规则：**\n- 密码连续错误5次锁定账号15分钟\n- 登录成功后记录登录日志（IP、时间、浏览器）\n- Session超时30分钟需重新登录\n- 默认测试账号：admin / admin\n\n**PRD章节：** 10.2.1 登录模块"
    },
    "P2-1": {
      id: "P2-1", page: "dashboard", title: "数据概览统计卡片",
      selector: ".stat-cards, .dashboard-page, #app",
      content: "**P2-1 数据概览统计卡片**\n\n**需求描述：**\n展示4个核心统计指标：\n- 🔴 预警总数：全量预警数量\n- 🟠 待处理：状态为待处理的预警数量\n- 🟢 已处理：状态为已处理的预警数量\n- 🟣 今日预警：当天新增的预警数量\n\n**业务规则：**\n- 数据页面加载时获取\n- 点击卡片可跳转到预警列表页并带上筛选条件\n\n**PRD章节：** 10.2.2 首页仪表盘"
    },
    "P2-2": {
      id: "P2-2", page: "dashboard", title: "预警分类统计",
      selector: ".warning-category, .category-stats, #app",
      content: "**P2-2 预警分类统计**\n\n**需求描述：**\n按预警类型分类展示统计数量，支持时间维度切换：\n- 🔴 财产预警：房产/车辆/存款/工商等超标\n- 🟠 生存状态预警：生存状态不一致\n- 🔵 户籍异动预警：户籍信息变动\n\n**时间维度切换：**\n- 按月（默认） / 按季度 / 按年度 / 自定义\n\n**PRD章节：** 10.2.2 首页仪表盘"
    },
    "P3-1": {
      id: "P3-1", page: "resident-list", title: "居民列表-搜索筛选",
      selector: ".resident-list, .search-bar, #app",
      content: "**P3-1 居民列表-搜索筛选**\n\n**需求描述：**\n- 搜索框：支持按姓名、身份证号、手机号模糊搜索\n- 筛选条件：社区、标签类型、人员类别等\n- 查询/重置按钮\n\n**业务规则：**\n- 分页展示，默认10条/页\n- 支持按更新时间排序（默认降序）\n\n**PRD章节：** 10.2.3 居民信息管理"
    },
    "P4-1": {
      id: "P4-1", page: "resident-detail", title: "居民详情-基本信息",
      selector: ".resident-detail, .basic-info, #app",
      content: "**P4-1 居民详情-基本信息**\n\n**需求描述：**\n展示居民全部基本信息字段：\n- 姓名、性别、出生日期、年龄\n- 身份证号（脱敏显示，仅前6后4）\n- 联系方式、政治面貌、文化程度\n- 婚姻状态、人员类别、残疾种类及等级\n- 家庭人口数、所属社区、所属小区、所属网格\n- 工作单位、户籍地址、居住地址\n\n**安全规则：**\n- 身份证号脱敏显示\n- 编辑需有对应权限\n\n**PRD章节：** 10.2.3 居民信息管理"
    },
    "P4-2": {
      id: "P4-2", page: "resident-detail", title: "居民详情-保障信息标签",
      selector: ".benefit-info, .tag-section, .section-card",
      content: "**P4-2 居民详情-保障信息标签**\n\n**需求描述：**\n展示该居民所有保障标签，支持折叠/展开：\n- 标签卡片：标签类型（低保/特困/残疾/老龄等）+ 子类型 + 享受状态\n- 点击标签可展开详情：补贴金额、生效日期、失效日期\n- 有预警的标签显示「核实处理」按钮\n- 顶部显示标签总数，支持「+添加标签」\n\n**交互规则：**\n- 收起时页面间距更紧凑\n- 有待处理预警的标签高亮显示（红色边框/背景）\n- 点击「核实处理」直接打开预警处理弹窗\n\n**PRD章节：** 10.2.3 居民信息管理"
    },
    "P4-3": {
      id: "P4-3", page: "resident-detail", title: "居民详情-AI智能政策推荐",
      selector: ".ai-recommend, .tag-recommendation, #app",
      content: "**P4-3 居民详情-AI智能政策推荐**\n\n**需求描述：**\n基于居民年龄、性别、健康状况、家庭情况等智能分析：\n- 推荐可享受的政策列表\n- 显示匹配度（≥90%高度推荐，70-89%推荐，50-69%可考虑）\n- 显示推荐理由（如「年龄≥80岁，符合高龄津贴条件」）\n- 支持「一键添加」为居民保障标签\n\n**业务规则：**\n- 先以规则引擎为主，机器学习模型逐步迭代\n- 提供「不推荐」反馈入口，用于模型优化\n\n**PRD章节：** 10.2.4 AI智能政策匹配"
    },
    "P4-4": {
      id: "P4-4", page: "resident-detail", title: "居民详情-操作记录",
      selector: ".operation-log, .record-section, #app",
      content: "**P4-4 居民详情-操作记录**\n\n**需求描述：**\n展示该居民信息的所有操作历史，时间倒序排列：\n- 操作时间\n- 操作人\n- 操作类型（创建/修改/添加标签/移除标签等）\n- 操作内容详情\n\n**审计规则：**\n- 所有增删改操作必须记录\n- 操作日志不可删除、不可修改\n- 仅管理员可查看完整操作日志\n\n**PRD章节：** 11.4 安全需求"
    },
    "P5-1": {
      id: "P5-1", page: "warning-list", title: "预警列表-视图切换",
      selector: ".view-switch, .view-toggle, #app",
      content: "**P5-1 预警列表-视图切换**\n\n**需求描述：**\n支持两种视图模式切换：\n- 🎴 卡片视图（默认）：一人一卡，信息丰富，适合深入查看\n- 📋 列表视图：一人一行，紧凑展示，适合快速扫描批量居民\n\n**业务规则：**\n- 切换时保留当前筛选条件\n- 用户偏好记忆（下次进入使用上次选择的视图）\n\n**PRD章节：** 10.2.2 预警管理模块"
    },
    "P5-2": {
      id: "P5-2", page: "warning-list", title: "预警列表-多维筛选",
      selector: ".filter-bar, .search-filters, #app",
      content: "**P5-2 预警列表-多维筛选**\n\n**需求描述：**\n支持多维度组合筛选预警：\n- 预警数量：全部 / 1条 / 2条 / 3条及以上\n- 预警类型：状态不一致 / 政策互斥 / 财产预警 / 到龄提醒 / 政策到期提醒 / 政策符合通知\n- 处理状态：待处理 / 审批中 / 已处理\n\n**操作按钮：**\n- 查询：按筛选条件刷新列表\n- 重置：清空所有筛选条件，恢复默认\n\n**PRD章节：** 10.2.2 预警管理模块"
    },
    "P5-3": {
      id: "P5-3", page: "warning-list", title: "预警列表-卡片视图（一人一卡）",
      selector: ".card-view, .warning-card, #app",
      content: "**P5-3 预警列表-卡片视图（一人一卡）**\n\n**需求描述：**\n每个居民一张卡片，包含以下区域：\n\n1. **顶部：居民信息**\n   - 姓名（预警数>1时显示预警数徽章）\n   - 社区/网格\n\n2. **享受政策标签**\n   - 展示该居民当前享受的所有保障政策\n   - 最多显示4个，超出显示「+N」\n\n3. **通铺比对列表**（3列网格）\n   - 所有比对指标全部铺开：户籍、生存、收入、房产、车辆、存款、工商、服刑、政策互斥\n   - 🟢绿点=正常，🔴红点=异常（带光晕动效）\n\n4. **预警明细**\n   - 每条预警独立展示，支持「处理」「详情」操作\n   - 多条待处理预警支持「批量处理」\n\n**排序规则：** 按待处理预警数量降序，相同按最新预警时间降序\n\n**PRD章节：** 10.2.2.1 预警列表-卡片视图"
    },
    "P5-4": {
      id: "P5-4", page: "warning-list", title: "预警列表-列表视图（一人一行）",
      selector: ".list-view, .warning-table, #app",
      content: "**P5-4 预警列表-列表视图（一人一行）**\n\n**表格列：**\n1. **序号**\n2. **居民信息**：圆形头像+姓名+身份证号+社区/网格\n3. **享受政策**：展示所有保障标签（最多4个）\n4. **比对结果**：所有比对项横向铺开，🟢绿点正常🔴红点异常\n5. **预警数**：预警数统计（≥3红色，=2橙色，=1黄色）\n6. **操作**：批量处理 / 详情\n\n**视觉标识：**\n- 有异常的行：左侧红色竖条标识\n\n**PRD章节：** 10.2.2.2 预警列表-列表视图"
    },
    "P5-5": {
      id: "P5-5", page: "warning-list", title: "预警详情弹窗-以标签为核心",
      selector: ".detail-dialog, .el-dialog, #app",
      content: "**P5-5 预警详情弹窗（以标签为核心组织）**\n\n**页面结构：**\n\n1. **顶部：居民信息卡**（渐变背景）\n   - 圆形头像（首字）\n   - 姓名 + 身份证号（脱敏）\n   - 社区/网格 + 预警统计\n\n2. **标签区块**（多个，按优先级排序）\n   每个标签独立卡片：\n   - **标签头部**：标签类型 + 子类型 + 享受状态 + 预警数量\n   - **标签元信息**：补贴金额、有效期、生效日期\n   - **该标签下的预警列表**：\n     - 状态圆点（🟠待处理/🟢已处理/🟣审批中）\n     - 预警类型标签 + 时间 + 状态\n     - 预警内容、比对来源\n     - 操作按钮：「核实处理」+「详情」\n\n**业务规则：**\n- 标签排序：有待处理预警的标签排最前\n- 有待处理预警的标签：浅红背景突出显示\n\n**PRD章节：** 10.2.2.3 预警详情弹窗"
    },
    "P5-6": {
      id: "P5-6", page: "warning-list", title: "预警核实处理弹窗",
      selector: ".resolve-dialog, .handle-dialog, #app",
      content: "**P5-6 预警核实处理弹窗**\n\n**字段：**\n- 预警类型（只读，标签展示）\n- 预警内容（只读）\n- 处理方式（单选）：\n  - ● 核实无误（继续享受）\n  - ● 有误需停发（启动停发流程）\n- 处理备注（必填，至少10个字）\n- 佐证图片（可选）：最多9张，单张≤5MB\n\n**业务规则：**\n- 无需审批的预警：提交后状态变为「已处理」\n- 需审批的预警：提交后状态变为「审批中」\n- 自动记录处理人、处理时间、操作日志\n\n**PRD章节：** 10.2.2.4 预警核实处理弹窗"
    },
    "P5-7": {
      id: "P5-7", page: "warning-list", title: "批量处理预警",
      selector: ".batch-resolve, .batch-handle, #app",
      content: "**P5-7 批量处理预警**\n\n**需求描述：**\n同一居民存在多条待处理预警时，支持批量操作：\n- 入口：卡片底部「批量处理待处理预警」按钮\n- 可勾选需要批量处理的预警（默认全选待处理）\n- 统一填写处理方式、处理备注\n- 支持批量上传佐证图片\n\n**业务规则：**\n- 仅可批量处理同一居民的待处理预警\n- 批量处理后每条预警独立记录处理日志\n\n**PRD章节：** 10.2.2 预警管理模块"
    },
    "P6-1": {
      id: "P6-1", page: "data-import", title: "数据导入-Excel批量导入",
      selector: ".import-page, .excel-import, #app",
      content: "**P6-1 数据导入-Excel批量导入**\n\n**需求描述：**\n- 模板下载：提供标准导入模板（Excel）\n- 文件上传：支持.xlsx/.xls格式，一次≤500条\n- 数据校验：身份证号格式、必填字段、重复数据\n- 导入结果：成功/失败数量，失败原因可下载\n\n**PRD章节：** 10.2 功能需求-数据导入"
    },
    "P6-2": {
      id: "P6-2", page: "warning-config", title: "预警规则配置",
      selector: ".config-page, .rule-config, #app",
      content: "**P6-2 预警规则配置**\n\n**需求描述：**\n预警规则的增删改查管理：\n- 规则列表：规则名称、规则类型、匹配条件、启用状态\n- 新增/编辑规则：规则名称、规则类型、匹配条件、是否需要审批\n- 启用/禁用：开关控制规则是否生效\n\n**PRD章节：** 10.2 功能需求-规则配置"
    },
    "P6-3": {
      id: "P6-3", page: "report", title: "统计报表",
      selector: ".report-page, .stats-page, #app",
      content: "**P6-3 统计报表**\n\n**需求描述：**\n多维度数据统计分析，支持图表展示和导出：\n1. **预警统计**：按社区/预警类型/处理状态/时间，柱状图折线图饼图\n2. **标签分布**：按社区/标签类型，堆叠柱状图饼图\n3. **居民画像**：年龄性别文化程度分布，直方图饼图\n- 支持时间范围筛选\n- 支持导出Excel/PDF\n\n**PRD章节：** 10.2 功能需求-统计报表"
    },
    "P6-4": {
      id: "P6-4", page: "mobile", title: "移动端-网格员端",
      selector: ".mobile-page, #app",
      content: "**P6-4 移动端-网格员端**\n\n**功能模块：**\n1. **居民信息**：查看本社区居民列表/详情、信息采集\n2. **签到打卡**：入户签到（GPS定位）、打卡记录查看\n3. **探访记录**：新增探访记录、探访历史、上传照片\n4. **预警查看**：查看本社区预警、现场核实上报\n\n**PRD章节：** 10.2 功能需求-移动端"
    },
    "P6-5": {
      id: "P6-5", page: "all", title: "AI智能助手（全局悬浮）",
      selector: ".ai-assistant, .float-btn, #app",
      content: "**P6-5 AI智能助手（右下角悬浮按钮）**\n\n**功能：**\n1. **政策问答**：询问各类政策条件、申请流程\n2. **数据查询**：快速获取系统统计数据\n3. **智能搜索**：自然语言搜索居民信息\n4. **操作指引**：系统功能使用帮助\n\n**PRD章节：** 10.2 AI功能"
    },
    "P6-6": {
      id: "P6-6", page: "all", title: "非功能性需求-安全与性能",
      selector: "body",
      content: "**P6-6 非功能性需求**\n\n**安全需求：**\n- 🔐 数据脱敏：身份证号仅显示前6后4\n- 🔐 权限控制：基于角色的访问控制（RBAC）\n- 🔐 操作日志：所有增删改操作留痕\n- 🔐 会话超时：30分钟无操作自动退出\n- 🔐 密码强度：≥8位，字母+数字\n- 🔐 传输安全：生产环境HTTPS\n\n**性能需求：**\n- ⚡ 页面首屏加载 ≤ 3秒\n- ⚡ 列表查询响应 ≤ 1秒\n- ⚡ 并发用户 ≥ 50\n\n**兼容性需求：**\n- 🖥️ Chrome 90+、Edge 90+、Firefox 88+\n- 📱 iOS Safari 13+、Android Chrome 80+\n\n**PRD章节：** 第11章 非功能性需求"
    },
    "P7-1": {
      id: "P7-1", page: "ai-match", title: "政策匹配-批量检索（上传文件+AI识别条件）",
      selector: ".batch-tools, .policy-desc-section, .content-card, #app",
      content: "**P7-1 批量检索**\n\n**功能模块：**\n1. **上传居民底册**：按钮上传 .xlsx/.xls/.csv，AI 自动解析条数\n2. **政策条件描述框**：手动输入自然语言条件（例如「查找60岁以上人均月收入低于1000元高龄老人」）\n3. **AI识别条件**：基于描述自动勾选对应政策类型标签\n4. **政策类型选择**：低保/特困人员/高龄津贴/重度残疾人护理补贴/公租房/4050灵活就业补贴 等标签\n5. **AI智能匹配按钮**：从全量底册筛选符合条件居民并展示匹配结果表格（姓名/性别/年龄/身份证/社区/网格/匹配政策/匹配度/操作）\n\n**跳转测试**：点击标签可跳转对应筛选。\n\n**PRD章节：** 10.2.4 AI政策匹配"
    },
    "P7-2": {
      id: "P7-2", page: "ai-match", title: "政策匹配-单人判定（库内联动+AI解析描述）",
      selector: ".single-tools, .form-section, .content-card, #app",
      content: "**P7-2 单人判定**\n\n**功能模块：**\n1. **手动描述居民信息 按钮**：打开对话框，内置 2 条示例（高龄老人 / 三级残疾离异妇女），点击即填，再点「AI解析并填充」自动填入表单\n2. **姓名 / 身份证号失焦自动填充**：只要输入库中存在的居民姓名或身份证号，失焦即联动填充其他 14 项字段（性别、年龄、婚姻、残疾、收入、存款、房产、车辆、联系方式等），并成功提示\n3. **AI一键判定**：输出匹配政策卡片列表（政策名、描述、补贴标准、匹配度、匹配原因、申请办理按钮）\n\n**跳转测试**：点击「手动描述居民信息」打开弹窗、示例标签、姓名输入张三后失焦验证。\n\n**PRD章节：** 10.2.4 AI政策匹配-单人判定"
    },
    "P7-3": {
      id: "P7-3", page: "ai-match", title: "政策匹配-服务场景（6大AI场景+感知日志）",
      selector: ".scene-grid, .scene-log-section, .content-card, #app",
      content: "**P7-3 服务场景**\n\n**功能模块：**\n1. **6个 AI 场景卡片**（可点击开关）：\n   - ☀️ 天气灾害预警：高温暴雨寒潮，推送重点关怀\n   - 🏠 独居老人关怀：用水用电轨迹异常感知\n   - 📅 重点节日走访：中秋春节自动生成走访任务\n   - 🔔 政策到期提醒：提前 30 天通知办理续期\n   - ⚠️ 涉毒人员管控：社会关系识别风险行为\n   - 👤 精神障碍监护：监护人复诊提醒 + 网格员上门\n2. **场景感知日志表格**：时间/场景/级别/内容/影响人群/操作（推送通知、详情）\n\n**跳转测试**：点击任意场景卡片切换开关状态，点击场景日志「推送通知」测试。\n\n**PRD章节：** 10.2.4 AI服务场景"
    }
  };

  // ============== 状态 ==============
  let state = {
    badgesVisible: true,
    openFloats: {}, // { annoId: floatEl }
    maxZ: ANNOTATION_CONFIG.zIndexBase,
    currentPage: detectPage(),
  };

  // ============== 工具函数 ==============
  function detectPage() {
    const hash = window.location.hash || '';
    if (hash.includes('login')) return 'login';
    if (hash.includes('dashboard') || hash === '#/' || hash === '') return 'dashboard';
    if (hash.includes('resident') && hash.includes('detail')) return 'resident-detail';
    if (hash.includes('resident')) return 'resident-list';
    if (hash.includes('warning') && hash.includes('config')) return 'warning-config';
    if (hash.includes('warning')) return 'warning-list';
    if (hash.includes('import')) return 'data-import';
    if (hash.includes('report') || hash.includes('statistics')) return 'report';
    if (hash.includes('ai-match') || hash.includes('policy')) return 'ai-match';
    if (hash.includes('task/visit')) return 'visit-task';
    if (hash.includes('task/check')) return 'check-history';
    return 'all';
  }

  function shouldShowAnnotation(anno) {
    if (anno.page === 'all') return true;
    return anno.page === state.currentPage;
  }

  function findTargetElement(selector) {
    const selectors = selector.split(',').map(s => s.trim());
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) {
        return el;
      }
    }
    return null;
  }

  function getMaxZIndex() {
    let max = ANNOTATION_CONFIG.zIndexBase;
    const els = document.querySelectorAll('*');
    for (const el of els) {
      const z = parseInt(window.getComputedStyle(el).zIndex, 10);
      if (z > max) max = z;
    }
    return max + 1;
  }

  // Markdown简单解析（加粗、列表、换行）
  function renderMarkdown(text) {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li style="margin-left:16px;">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-left:16px;">$2</li>')
      .replace(/\n/g, '<br/>');
    return html;
  }

  // ============== 样式注入 ==============
  function injectStyles() {
    const css = `
      .__anno_badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: top;
        background: linear-gradient(135deg, #faad14 0%, #ff8c00 100%);
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        padding: 4px 8px;
        border-radius: 10px;
        cursor: pointer;
        position: absolute;
        top: -12px;
        right: -8px;
        z-index: ${ANNOTATION_CONFIG.zIndexBase};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        user-select: none;
        white-space: nowrap;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(250, 173, 20, 0.5), 0 0 0 1px rgba(250, 173, 20, 0.2);
        animation: __anno_pulse 2s ease-in-out infinite;
        letter-spacing: 0.3px;
      }
      @keyframes __anno_pulse {
        0%, 100% { box-shadow: 0 2px 8px rgba(250, 173, 20, 0.5), 0 0 0 1px rgba(250, 173, 20, 0.2); }
        50% { box-shadow: 0 2px 16px rgba(250, 173, 20, 0.7), 0 0 0 3px rgba(250, 173, 20, 0.25); }
      }
      .__anno_badge:hover {
        filter: brightness(1.08);
        transform: scale(1.08);
        transition: transform 0.15s ease;
      }
      .__anno_float {
        position: fixed;
        background: ${ANNOTATION_CONFIG.floatBg};
        border-radius: ${ANNOTATION_CONFIG.floatRadius};
        width: ${ANNOTATION_CONFIG.floatWidth};
        max-height: 80vh;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: ${ANNOTATION_CONFIG.zIndexBase + 10};
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        line-height: 1.6;
        color: #1f2937;
      }
      .__anno_float_header {
        background: ${ANNOTATION_CONFIG.badgeColor};
        color: #fff;
        padding: 10px 14px;
        font-weight: 600;
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        position: sticky;
        top: 0;
      }
      .__anno_float_close {
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0 4px;
        opacity: 0.9;
      }
      .__anno_float_close:hover { opacity: 1; }
      .__anno_float_body {
        padding: 14px 16px;
        overflow-y: auto;
        flex: 1;
      }
      .__anno_float_body strong { color: #111827; font-weight: 600; }
      .__anno_float_body em { color: #6b7280; font-style: italic; }
      .__anno_float_body li { margin: 2px 0; }
      .__anno_control {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        padding: 8px 12px;
        z-index: ${ANNOTATION_CONFIG.zIndexBase + 5};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
      }
      .__anno_control_btn {
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #d1d5db;
        background: #f9fafb;
        color: #374151;
        font-size: 12px;
      }
      .__anno_control_btn:hover { background: #f3f4f6; }
      .__anno_control_count {
        color: ${ANNOTATION_CONFIG.badgeColor};
        font-weight: 600;
      }
    `;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-anno-style', 'true');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // ============== 角标渲染 ==============
  function renderBadges() {
    // 清除旧角标
    document.querySelectorAll('.__anno_badge').forEach(el => el.remove());

    if (!state.badgesVisible) return;

    state.maxZ = getMaxZIndex();

    Object.values(ANNOTATIONS).forEach(anno => {
      if (!shouldShowAnnotation(anno)) return;

      const target = findTargetElement(anno.selector);
      if (!target) return;

      // 确保目标元素有定位上下文
      const pos = window.getComputedStyle(target).position;
      if (pos === 'static') {
        target.style.position = 'relative';
      }

      const badge = document.createElement('span');
      badge.className = '__anno_badge';
      badge.setAttribute('data-anno-id', anno.id);
      badge.textContent = anno.id;
      badge.style.zIndex = state.maxZ;

      // 桌面端hover
      badge.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        openFloat(anno, badge);
      });

      // 移动端tap
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (state.openFloats[anno.id]) {
          closeFloat(anno.id);
        } else {
          openFloat(anno, badge);
        }
      });

      target.appendChild(badge);
    });

    updateControlPanel();
  }

  // ============== 浮窗渲染 ==============
  function openFloat(anno, anchorEl) {
    // 关闭其他同页面非全局浮窗（可选：保留全部打开）
    // 这里支持同时打开多个浮窗
    if (state.openFloats[anno.id]) {
      bringToFront(anno.id);
      return;
    }

    state.maxZ++;
    const z = state.maxZ;

    const floatEl = document.createElement('div');
    floatEl.className = '__anno_float';
    floatEl.setAttribute('data-anno-id', anno.id);
    floatEl.style.zIndex = z;

    // 计算位置
    let left = 20, top = 80;
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      left = rect.right + 8;
      top = rect.bottom + 8;
      // 防溢出
      if (left + 450 > window.innerWidth) left = rect.left - 458;
      if (top + 500 > window.innerHeight) top = window.innerHeight - 520;
      if (left < 8) left = 8;
      if (top < 8) top = 8;
    }
    // 错开已打开的浮窗
    const offset = Object.keys(state.openFloats).length * 24;
    left += offset; top += offset;

    floatEl.style.left = left + 'px';
    floatEl.style.top = top + 'px';

    floatEl.innerHTML = `
      <div class="__anno_float_header">
        <span>${anno.id} ${anno.title}</span>
        <span class="__anno_float_close">×</span>
      </div>
      <div class="__anno_float_body">${renderMarkdown(anno.content)}</div>
    `;

    // 关闭按钮
    floatEl.querySelector('.__anno_float_close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeFloat(anno.id);
    });

    // 拖拽
    enableDrag(floatEl, floatEl.querySelector('.__anno_float_header'));

    // 阻止事件冒泡
    floatEl.addEventListener('mousedown', (e) => e.stopPropagation());
    floatEl.addEventListener('click', (e) => e.stopPropagation());

    document.body.appendChild(floatEl);
    state.openFloats[anno.id] = floatEl;
    bringToFront(anno.id);

    // 鼠标移出浮窗后延迟自动关闭
    state.floatTimers = state.floatTimers || {};
    const startAutoClose = () => {
      if (state.floatTimers[anno.id] && state.floatTimers[anno.id].timer) {
        clearTimeout(state.floatTimers[anno.id].timer);
      }
      state.floatTimers[anno.id] = state.floatTimers[anno.id] || {};
      state.floatTimers[anno.id].timer = setTimeout(() => {
        closeFloat(anno.id);
      }, 300);
    };
    const cancelAutoClose = () => {
      if (state.floatTimers[anno.id] && state.floatTimers[anno.id].timer) {
        clearTimeout(state.floatTimers[anno.id].timer);
        state.floatTimers[anno.id].timer = null;
      }
    };

    floatEl.addEventListener('mouseenter', cancelAutoClose);
    floatEl.addEventListener('mouseleave', startAutoClose);
    if (anchorEl) {
      anchorEl.addEventListener('mouseenter', cancelAutoClose);
      anchorEl.addEventListener('mouseleave', startAutoClose);
    }
  }

  function closeFloat(annoId) {
    const el = state.openFloats[annoId];
    if (el) {
      el.remove();
      delete state.openFloats[annoId];
    }
    // 清理自动关闭计时器
    if (state.floatTimers && state.floatTimers[annoId]) {
      if (state.floatTimers[annoId].timer) {
        clearTimeout(state.floatTimers[annoId].timer);
      }
      delete state.floatTimers[annoId];
    }
  }

  function closeAllFloats() {
    Object.keys(state.openFloats).forEach(id => closeFloat(id));
  }

  function bringToFront(annoId) {
    state.maxZ++;
    const el = state.openFloats[annoId];
    if (el) el.style.zIndex = state.maxZ;
  }

  function enableDrag(floatEl, handleEl) {
    let isDragging = false, startX, startY, origLeft, origTop;

    handleEl.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('__anno_float_close')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(floatEl.style.left) || 0;
      origTop = parseFloat(floatEl.style.top) || 0;
      bringToFront(floatEl.getAttribute('data-anno-id'));
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let newLeft = origLeft + (e.clientX - startX);
      let newTop = origTop + (e.clientY - startY);
      const w = floatEl.offsetWidth, h = floatEl.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - w));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - h));
      floatEl.style.left = newLeft + 'px';
      floatEl.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  // ============== 控制面板 ==============
  function renderControlPanel() {
    // 移除旧的
    const old = document.querySelector('.__anno_control');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.className = '__anno_control';
    panel.innerHTML = `
      <span>📋 PRD标注</span>
      <span class="__anno_control_count" id="annoCount">0</span>
      <button class="__anno_control_btn" id="annoToggle">隐藏</button>
      <button class="__anno_control_btn" id="annoCloseAll">关闭浮窗</button>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#annoToggle').addEventListener('click', (e) => {
      e.stopPropagation();
      state.badgesVisible = !state.badgesVisible;
      renderBadges();
    });

    panel.querySelector('#annoCloseAll').addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllFloats();
    });

    updateControlPanel();
  }

  function updateControlPanel() {
    const countEl = document.getElementById('annoCount');
    const toggleEl = document.getElementById('annoToggle');
    if (countEl) {
      const visibleCount = Object.values(ANNOTATIONS).filter(a => shouldShowAnnotation(a)).length;
      countEl.textContent = visibleCount + ' 条';
    }
    if (toggleEl) {
      toggleEl.textContent = state.badgesVisible ? '隐藏' : '显示';
    }
  }

  // ============== 事件监听 ==============
  function bindGlobalEvents() {
    // ESC关闭所有浮窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllFloats();
      }
    });

    // 路由变化检测（SPA）
    let lastHash = window.location.hash;
    setInterval(() => {
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        state.currentPage = detectPage();
        closeAllFloats();
        renderBadges();
      }
    }, 500);

    // 监听DOM变化（Vue动态渲染）
    const observer = new MutationObserver(() => {
      // 防抖：通过requestAnimationFrame
      if (window.__anno_render_pending) return;
      window.__anno_render_pending = true;
      requestAnimationFrame(() => {
        window.__anno_render_pending = false;
        renderBadges();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ============== 初始化 ==============
  function init() {
    injectStyles();
    renderControlPanel();
    bindGlobalEvents();
    renderBadges();
    console.log('%c📋 PRD原型标注系统已启动', 'color:rgb(250,173,20);font-weight:bold;font-size:14px;');
    console.log('共加载 ' + Object.keys(ANNOTATIONS).length + ' 条需求标注');
  }

  // 页面加载完成后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
