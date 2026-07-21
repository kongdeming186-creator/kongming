/**
 * AI服务层 - 处理政策问答、数据查询、智能推荐等逻辑
 */

import { residents, tags, warnings, tasks, tagSubTypes, communities, grids, personTypes } from '../data/mock'

/**
 * 模拟AI响应延迟
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 从标签中提取所有政策类型和子类型
 */
const getAllPolicies = () => {
  const policies = []
  
  const policyMappings = {
    '低保': {
      name: '最低生活保障',
      description: '为家庭人均收入低于当地最低生活保障标准的居民提供生活救助',
      conditions: ['家庭人均收入低于当地标准', '家庭财产状况符合规定', '具有本地户籍'],
      materials: ['身份证', '户口簿', '收入证明', '房产证明', '银行流水'],
      process: '个人申请 → 社区受理 → 街道审核 → 区县审批'
    },
    '残疾': {
      name: '残疾人补贴',
      description: '为残疾人提供生活补贴、护理补贴等社会保障',
      conditions: ['持有残疾人证', '残疾等级为1-4级', '本地户籍'],
      materials: ['身份证', '残疾人证', '户口簿', '银行账户'],
      process: '个人申请 → 社区受理 → 残联审核 → 民政审批'
    },
    '公租房': {
      name: '公共租赁住房',
      description: '为住房困难的居民提供保障性住房',
      conditions: ['住房困难家庭', '收入低于规定标准', '本地户籍一定年限'],
      materials: ['身份证', '户口簿', '婚姻状况证明', '住房证明', '收入证明'],
      process: '个人申请 → 街道初审 → 区县审核 → 轮候配租'
    },
    '老年': {
      name: '老年人补贴',
      description: '为高龄老人提供生活补贴和养老服务',
      conditions: ['年满80周岁', '本地户籍'],
      materials: ['身份证', '户口簿', '照片'],
      process: '个人申请 → 社区受理 → 街道审核 → 民政审批'
    },
    '计生': {
      name: '计划生育奖励扶助',
      description: '为独生子女家庭和计划生育家庭提供奖励和扶助',
      conditions: ['独生子女家庭', '年满一定年龄', '按政策生育'],
      materials: ['身份证', '户口簿', '独生子女父母光荣证', '结婚证'],
      process: '个人申请 → 社区受理 → 街道审核 → 卫健部门审批'
    },
    '社保': {
      name: '灵活就业社保补贴',
      description: '为灵活就业人员提供社会保险补贴（4050人员）',
      conditions: ['女性40周岁、男性50周岁以上', '灵活就业', '缴纳社保'],
      materials: ['身份证', '户口簿', '就业证明', '社保缴费凭证'],
      process: '个人申请 → 社区受理 → 街道审核 → 人社部门审批'
    },
    '涉军': {
      name: '优抚对象补贴',
      description: '为退役军人和其他优抚对象提供生活补贴',
      conditions: ['退役军人', '重点优抚对象', '本地户籍'],
      materials: ['身份证', '退役证', '户口簿', '银行账户'],
      process: '个人申请 → 街道受理 → 退役军人事务部门审核'
    }
  }
  
  // 遍历所有标签类型
  Object.keys(tagSubTypes).forEach(tagType => {
    const policy = policyMappings[tagType]
    if (policy) {
      policies.push({
        type: tagType,
        ...policy,
        subTypes: tagSubTypes[tagType]
      })
    }
  })
  
  return policies
}

/**
 * AI政策问答
 */
export const askPolicyQuestion = async (question) => {
  await delay(800 + Math.random() * 500) // 模拟网络延迟
  
  const q = question.toLowerCase()
  const policies = getAllPolicies()
  
  // 识别问题类型
  if (q.includes('高龄') || q.includes('80岁') || q.includes('老年')) {
    const elderly = policies.find(p => p.type === '老年')
    return {
      type: 'policy',
      title: '高龄老人补贴政策',
      answer: `${elderly.description}\n\n【申请条件】\n${elderly.conditions.map(c => `• ${c}`).join('\n')}\n\n【所需材料】\n${elderly.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${elderly.process}\n\n【补贴标准】\n• 80-89周岁：300-500元/月\n• 90-99周岁：500-800元/月\n• 100周岁以上：更高标准`,
      suggestions: ['高龄津贴如何申请？', '还有其他老年政策吗？']
    }
  }
  
  if (q.includes('低保') || q.includes('最低生活保障')) {
    const dibao = policies.find(p => p.type === '低保')
    return {
      type: 'policy',
      title: '最低生活保障政策',
      answer: `${dibao.description}\n\n【申请条件】\n${dibao.conditions.map(c => `• ${c}`).join('\n')}\n\n【所需材料】\n${dibao.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${dibao.process}`,
      suggestions: ['低保每月多少钱？', '低保户有什么其他政策？']
    }
  }
  
  if (q.includes('残疾') || q.includes('残疾人')) {
    const disability = policies.find(p => p.type === '残疾')
    return {
      type: 'policy',
      title: '残疾人补贴政策',
      answer: `${disability.description}\n\n【申请条件】\n${disability.conditions.map(c => `• ${c}`).join('\n')}\n\n【补贴类型】\n• 重度护理补贴：一级、二级残疾人\n• 困难生活补贴：低保家庭中的残疾人\n• 居家服务补贴：重度残疾人\n\n【所需材料】\n${disability.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${disability.process}`,
      suggestions: ['重度残疾有什么补贴？', '残疾证如何办理？']
    }
  }
  
  if (q.includes('公租房') || q.includes('保障房') || q.includes('租房')) {
    const gongzufang = policies.find(p => p.type === '公租房')
    return {
      type: 'policy',
      title: '公共租赁住房政策',
      answer: `${gongzufang.description}\n\n【申请条件】\n${gongzufang.conditions.map(c => `• ${c}`).join('\n')}\n\n【租金标准】\n• 根据家庭收入和住房面积确定\n• 低收入家庭享有更多优惠\n\n【所需材料】\n${gongzufang.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${gongzufang.process}`,
      suggestions: ['公租房租金多少？', '如何申请公租房？']
    }
  }
  
  if (q.includes('社保') || q.includes('4050') || q.includes('灵活就业')) {
    const shebao = policies.find(p => p.type === '社保')
    return {
      type: 'policy',
      title: '灵活就业社保补贴政策（4050人员）',
      answer: `${shebao.description}\n\n【申请条件】\n• 女性年满40周岁、男性年满50周岁\n• 从事灵活就业\n• 缴纳城镇职工基本养老保险和基本医疗保险\n\n【补贴标准】\n• 养老保险补贴：400-600元/月\n• 医疗保险补贴：200-400元/月\n• 补贴期限一般不超过3年\n\n【所需材料】\n${shebao.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${shebao.process}`,
      suggestions: ['4050补贴能领多久？', '灵活就业包括哪些？']
    }
  }
  
  if (q.includes('独生子') || q.includes('计生')) {
    const jisheng = policies.find(p => p.type === '计生')
    return {
      type: 'policy',
      title: '计划生育奖励扶助政策',
      answer: `${jisheng.description}\n\n【奖励类型】\n• 独生子女父母光荣证\n• 独生子女保健费（未满14周岁）\n• 独生子女父母奖励金（退休后）\n\n【申请条件】\n${jisheng.conditions.map(c => `• ${c}`).join('\n')}\n\n【所需材料】\n${jisheng.materials.map(m => `• ${m}`).join('\n')}`,
      suggestions: ['独生子女证怎么办理？', '保健费多少钱？']
    }
  }
  
  if (q.includes('军人') || q.includes('退役') || q.includes('优抚')) {
    const junren = policies.find(p => p.type === '涉军')
    return {
      type: 'policy',
      title: '优抚对象政策',
      answer: `${junren.description}\n\n【优抚对象】\n• 退役军人\n• 重点优抚对象（烈士遗属、因公牺牲军人遗属等）\n• 企业军转干部\n• "两参"人员\n\n【补贴类型】\n• 生活补贴\n• 医疗补贴\n• 住房补贴\n• 优先就业服务\n\n【所需材料】\n${junren.materials.map(m => `• ${m}`).join('\n')}\n\n【办理流程】\n${junren.process}`,
      suggestions: ['退役军人有什么优惠政策？', '优抚补贴标准是什么？']
    }
  }
  
  // 默认返回政策列表
  return {
    type: 'policy_list',
    title: '街道政策汇总',
    answer: `当前系统收录了以下政策类型：\n\n${policies.map(p => `【${p.type}】${p.name}`).join('\n\n')}\n\n您可以问我具体某项政策，比如：\n• "高龄老人有什么补贴？"\n• "低保怎么办理？"\n• "残疾人有什么优惠政策？"\n\n或者告诉我要查找的关键词，比如"租房"、"社保"等。`,
    suggestions: ['高龄老人补贴', '低保政策', '残疾人补贴', '公租房']
  }
}

/**
 * AI数据查询
 */
export const queryData = async (query) => {
  await delay(600 + Math.random() * 400)
  
  const q = query.toLowerCase()
  
  // 统计查询
  if (q.includes('居民') || q.includes('总人数')) {
    return {
      type: 'data',
      title: '居民统计',
      answer: `当前系统共有 **${residents.length}** 名居民。\n\n【按性别分布】\n• 男性：${residents.filter(r => r.gender === '男').length}人\n• 女性：${residents.filter(r => r.gender === '女').length}人\n\n【按人员类型】\n${personTypes.filter(pt => residents.filter(r => r.personType === pt).length > 0).map(pt => `• ${pt}：${residents.filter(r => r.personType === pt).length}人`).join('\n')}`,
      suggestions: ['各社区居民数', '本月新增居民']
    }
  }
  
  if (q.includes('预警') || q.includes('警告')) {
    const pendingWarnings = warnings.filter(w => w.status === '待处理')
    const urgentWarnings = pendingWarnings.filter(w => w.level === '紧急')
    return {
      type: 'data',
      title: '预警统计',
      answer: `当前系统共有 **${warnings.length}** 条预警。\n\n【按状态分布】\n• 待处理：${warnings.filter(w => w.status === '待处理').length}条\n• 处理中：${warnings.filter(w => w.status === '处理中').length}条\n• 已处理：${warnings.filter(w => w.status === '已处理').length}条\n\n【紧急预警】\n${urgentWarnings.length > 0 ? `⚠️ 有 ${urgentWarnings.length} 条紧急预警需要处理：\n${urgentWarnings.map(w => `• ${w.residentName}：${w.content}`).join('\n')}` : '暂无紧急预警'}`,
      suggestions: ['紧急预警有哪些？', '今天有哪些预警？']
    }
  }
  
  if (q.includes('任务') || q.includes('工单')) {
    const pendingTasks = tasks.filter(t => t.status === '待处理')
    return {
      type: 'data',
      title: '任务统计',
      answer: `当前系统共有 **${tasks.length}** 个任务。\n\n【按状态分布】\n• 待处理：${tasks.filter(t => t.status === '待处理').length}个\n• 处理中：${tasks.filter(t => t.status === '处理中').length}个\n• 已完成：${tasks.filter(t => t.status === '已完成').length}个\n\n【待处理任务】\n${pendingTasks.length > 0 ? pendingTasks.map(t => `• ${t.title}`).join('\n') : '暂无待处理任务'}`,
      suggestions: ['紧急任务有哪些？', '我的任务']
    }
  }
  
  if (q.includes('标签') || q.includes('补贴')) {
    const tagStats = {}
    tags.forEach(t => {
      tagStats[t.tagType] = (tagStats[t.tagType] || 0) + 1
    })
    
    return {
      type: 'data',
      title: '标签统计',
      answer: `当前系统共有 **${tags.length}** 个标签。\n\n【标签类型分布】\n${Object.entries(tagStats).map(([type, count]) => `• ${type}：${count}个`).join('\n')}\n\n【享受中的标签】\n• 享受中：${tags.filter(t => t.isEnjoy).length}个\n• 已停发：${tags.filter(t => !t.isEnjoy).length}个`,
      suggestions: ['低保标签有多少？', '本月新增标签']
    }
  }
  
  // 社区查询
  if (q.includes('社区')) {
    const communityStats = {}
    residents.forEach(r => {
      communityStats[r.community] = (communityStats[r.community] || 0) + 1
    })
    
    return {
      type: 'data',
      title: '社区统计',
      answer: `【各社区居民数】\n${Object.entries(communityStats).map(([community, count]) => `• ${community}：${count}人`).join('\n')}\n\n【系统收录社区】\n${communities.join('、')}`,
      suggestions: ['第一网格有多少人？', '六角社区详情']
    }
  }
  
  // 默认返回通用统计
  return {
    type: 'data',
    title: '系统数据概览',
    answer: `【六角亭街道民政系统数据概览】\n\n• 居民总数：${residents.length}人\n• 标签总数：${tags.length}个\n• 预警总数：${warnings.length}条（待处理${warnings.filter(w => w.status === '待处理').length}条）\n• 任务总数：${tasks.length}个（待处理${tasks.filter(t => t.status === '待处理').length}个）`,
    suggestions: ['查看居民列表', '查看预警列表', '查看任务列表']
  }
}

/**
 * AI智能搜索
 */
export const smartSearch = async (keyword) => {
  await delay(500 + Math.random() * 300)
  
  const k = keyword.toLowerCase()
  const results = {
    residents: [],
    tags: [],
    warnings: [],
    tasks: []
  }
  
  // 搜索居民
  residents.forEach(r => {
    if (r.name.toLowerCase().includes(k) || 
        r.idCard.includes(k) || 
        r.contact.includes(k) ||
        r.community.includes(k) ||
        r.estate.includes(k)) {
      results.residents.push({
        id: r.id,
        name: r.name,
        type: r.personType,
        community: r.community,
        contact: r.contact,
        survivalStatus: r.survivalStatus
      })
    }
  })
  
  // 搜索标签
  tags.forEach(t => {
    if (t.tagType.toLowerCase().includes(k) || 
        t.tagSubType.toLowerCase().includes(k)) {
      const resident = residents.find(r => r.id === t.residentId)
      results.tags.push({
        id: t.id,
        residentId: t.residentId,
        residentName: resident?.name,
        tagType: t.tagType,
        tagSubType: t.tagSubType,
        isEnjoy: t.isEnjoy
      })
    }
  })
  
  return {
    type: 'search',
    keyword,
    total: results.residents.length + results.tags.length,
    results,
    message: `找到 ${results.residents.length} 位居民和 ${results.tags.length} 个标签`
  }
}

/**
 * 智能标签推荐 - 根据居民信息推荐可能符合的政策
 */
export const recommendTags = async (resident) => {
  await delay(600 + Math.random() * 400)
  
  const recommendations = []
  const currentTags = tags.filter(t => t.residentId === resident.id).map(t => t.tagType)
  
  // 年龄分析
  const age = resident.age
  
  // 80岁以上 - 高龄津贴
  if (age >= 80 && !currentTags.includes('老年')) {
    recommendations.push({
      tagType: '老年',
      tagSubType: '高龄津贴',
      matchScore: age >= 90 ? 100 : 95,
      reason: `该居民年龄${age}周岁，符合80周岁以上高龄津贴申请条件`,
      benefits: '每月可享受300-500元高龄津贴',
      conditions: ['年满80周岁', '本地户籍'],
      materials: ['身份证', '户口簿', '近期照片']
    })
  }
  
  // 65-79岁 - 老年证
  if (age >= 65 && age < 80 && !currentTags.includes('老年')) {
    recommendations.push({
      tagType: '老年',
      tagSubType: '老年证',
      matchScore: 85,
      reason: `该居民年龄${age}周岁，可以办理老年证享受相关优待`,
      benefits: '可享受公交、公园等优待服务',
      conditions: ['年满65周岁', '本地户籍'],
      materials: ['身份证', '户口簿', '近期照片']
    })
  }
  
  // 40-50岁女性或50-60岁男性 - 4050灵活就业补贴
  if ((resident.gender === '女' && age >= 40 && age <= 50) || 
      (resident.gender === '男' && age >= 50 && age <= 60)) {
    if (!currentTags.includes('社保')) {
      recommendations.push({
        tagType: '社保',
        tagSubType: '4050灵活就业补贴',
        matchScore: 90,
        reason: `该居民${resident.gender === '女' ? '女性' : '男性'}年龄${age}周岁，符合4050灵活就业社保补贴申请条件`,
        benefits: '每月可获得600-1000元社保补贴（养老+医疗）',
        conditions: ['女性40周岁/男性50周岁以上', '从事灵活就业', '缴纳城镇职工社保'],
        materials: ['身份证', '户口簿', '灵活就业证明', '社保缴费凭证']
      })
    }
  }
  
  // 残疾人
  if (resident.disabilityLevel && !currentTags.includes('残疾')) {
    recommendations.push({
      tagType: '残疾',
      tagSubType: '困难补贴',
      matchScore: 95,
      reason: `该居民持有${resident.disabilityLevel}级残疾人证，可申请残疾人困难生活补贴`,
      benefits: '每月可享受50-200元困难生活补贴',
      conditions: ['持有有效残疾人证', '残疾等级1-4级', '家庭困难'],
      materials: ['身份证', '残疾人证', '户口簿', '银行账户']
    })
  }
  
  // 低保对象
  if (resident.personType === '低保对象' && !currentTags.includes('低保')) {
    recommendations.push({
      tagType: '低保',
      tagSubType: '低保',
      matchScore: 100,
      reason: '该居民已标记为低保对象，应享受最低生活保障待遇',
      benefits: '每月可领取850元低保金（按家庭人均收入补差）',
      conditions: ['家庭人均收入低于当地最低生活保障标准', '家庭财产符合规定'],
      materials: ['身份证', '户口簿', '收入证明', '财产证明', '银行流水']
    })
  }
  
  // 低保家庭中的残疾人 - 重度护理补贴
  if (resident.personType === '低保对象' && resident.disabilityLevel && 
      (resident.disabilityLevel === '一级' || resident.disabilityLevel === '二级')) {
    if (!currentTags.includes('残疾')) {
      recommendations.push({
        tagType: '残疾',
        tagSubType: '重度护理补贴',
        matchScore: 100,
        reason: `该居民既是低保对象又是${resident.disabilityLevel}级残疾人，可申请重度残疾人护理补贴`,
        benefits: '每月可享受100元重度护理补贴',
        conditions: ['持有有效残疾人证', '残疾等级为一级或二级'],
        materials: ['身份证', '残疾人证', '低保证明', '银行账户']
      })
    }
  }
  
  // 独生子女（14岁以下）
  if (resident.personType === '独生子女' && age < 14 && !currentTags.includes('计生')) {
    recommendations.push({
      tagType: '计生',
      tagSubType: '独生子女保健费',
      matchScore: 100,
      reason: `该儿童年龄${age}周岁，应享受独生子女保健费至14周岁`,
      benefits: '每月可领取30元独生子女保健费',
      conditions: ['持有独生子女父母光荣证', '未满14周岁'],
      materials: ['独生子女父母光荣证', '儿童出生证明', '户口簿']
    })
  }
  
  // 公租房需求
  if ((resident.personType === '困难群众' || resident.personType === '低保对象') && 
      !currentTags.includes('公租房')) {
    recommendations.push({
      tagType: '公租房',
      tagSubType: '租赁补贴',
      matchScore: 80,
      reason: '该居民属于困难群众，可申请公租房保障',
      benefits: '可获得公租房租赁补贴或实物配租',
      conditions: ['住房困难', '收入低于规定标准', '本地户籍一定年限'],
      materials: ['身份证', '户口簿', '住房证明', '收入证明']
    })
  }
  
  // 排序：优先推荐高匹配度的
  recommendations.sort((a, b) => b.matchScore - a.matchScore)
  
  return {
    resident: {
      id: resident.id,
      name: resident.name,
      age: resident.age,
      gender: resident.gender,
      personType: resident.personType
    },
    existingTags: currentTags,
    recommendations: recommendations.slice(0, 4), // 最多推荐4个
    summary: recommendations.length > 0 
      ? `根据分析，该居民可能符合 ${recommendations.length} 项政策，建议关注`
      : '该居民当前信息暂未匹配到其他可享受政策'
  }
}

/**
 * AI处置建议 - 预警处理
 */
export const getWarningSuggestion = async (warning) => {
  await delay(500 + Math.random() * 300)
  
  const suggestions = {
    '状态不一致': {
      title: '处置建议：生存状态核实',
      steps: [
        '联系居民或其家属确认生存状态',
        '如确认在世，获取最新证明材料',
        '如确认去世，收集死亡证明、户口注销证明等',
        '在系统中更新生存状态',
        '根据情况办理相关标签停发手续'
      ],
      materials: ['居民本人或家属确认', '死亡证明（如已去世）', '户口注销证明（如已去世）', '最新生活照片（如在世）'],
      relatedWarnings: warnings.filter(w => w.warningType === '状态不一致' && w.id !== warning.id).slice(0, 2)
    },
    '到龄提醒': {
      title: '处置建议：到龄业务处理',
      steps: [
        '核实居民实际年龄和户籍信息',
        '联系居民或其家属告知即将到龄',
        '指导准备相关申请材料',
        '协助办理到龄业务（如高龄津贴申请）',
        '在系统中更新标签信息'
      ],
      materials: ['身份证复印件', '户口簿复印件', '近期照片', '银行卡复印件'],
      relatedWarnings: warnings.filter(w => w.warningType === '到龄提醒' && w.id !== warning.id).slice(0, 2)
    },
    '政策符合通知': {
      title: '处置建议：政策主动告知',
      steps: [
        '核实居民是否符合政策条件',
        '通过电话或上门方式主动告知政策',
        '详细介绍政策内容和申请流程',
        '指导准备申请材料',
        '协助居民提交申请'
      ],
      materials: ['政策宣传材料', '申请表', '材料清单'],
      relatedWarnings: warnings.filter(w => w.warningType === '政策符合通知' && w.id !== warning.id).slice(0, 2)
    },
    '政策到期提醒': {
      title: '处置建议：到期业务年审',
      steps: [
        '核实标签有效期和到期时间',
        '提前联系居民或其家属',
        '告知年审所需材料和流程',
        '协助办理年审手续',
        '在系统中更新有效期'
      ],
      materials: ['居民身份证', '原有证件或证明', '最新收入证明（如需）', '年审申请表'],
      relatedWarnings: warnings.filter(w => w.warningType === '政策到期提醒' && w.id !== warning.id).slice(0, 2)
    },
    '政策互斥': {
      title: '处置建议：政策冲突处理',
      steps: [
        '核实同时享受的两种政策标签',
        '查阅相关政策规定，确认是否存在真正冲突',
        '联系相关部门确认政策适用性',
        '如确实存在冲突，按规定保留一项',
        '做好解释说明工作'
      ],
      materials: ['两种政策的相关文件', '社区/街道核实意见', '上级部门批复'],
      relatedWarnings: warnings.filter(w => w.warningType === '政策互斥' && w.id !== warning.id).slice(0, 2)
    }
  }
  
  const suggestion = suggestions[warning.warningType] || {
    title: '处置建议',
    steps: ['核实预警信息', '联系相关居民', '按政策规定处理', '在系统中更新状态'],
    materials: ['相关证明材料'],
    relatedWarnings: []
  }
  
  return {
    warning,
    ...suggestion,
    autoTask: {
      title: `处理${warning.warningType}预警 - ${warning.residentName}`,
      description: `根据预警"${warning.content}"，建议按以下步骤处理：\n${suggestion.steps.join('\n')}`,
      materials: suggestion.materials
    }
  }
}

/**
 * 通用AI对话处理
 */
export const processAIQuestion = async (question) => {
  await delay(1000 + Math.random() * 500)
  
  const q = question.toLowerCase()
  
  // 判断问题类型
  if (q.includes('怎么办') || q.includes('如何') || q.includes('怎么')) {
    // 操作指引类
    if (q.includes('导入')) {
      return {
        type: 'guide',
        title: '数据导入指引',
        answer: '【导入居民数据操作步骤】\n\n1. 进入"数据导入"页面\n2. 点击"下载模板"获取Excel模板\n3. 按模板格式整理数据（必填项：姓名、身份证号、联系电话）\n4. 点击"选择文件"上传Excel\n5. 点击"开始导入"\n6. 系统会自动校验数据，查看导入结果\n7. 对错误数据进行修正后重新导入',
        suggestions: ['导入模板怎么填？', '导入失败怎么办？']
      }
    }
    
    if (q.includes('添加') || q.includes('新增')) {
      return {
        type: 'guide',
        title: '添加居民指引',
        answer: '【添加新居民操作步骤】\n\n1. 进入"居民管理"页面\n2. 点击右上角"添加居民"按钮\n3. 填写居民基本信息（带*为必填）\n4. 选择所属社区、网格\n5. 点击"保存"完成添加\n\n注意：\n• 身份证号会自动校验格式\n• 手机号会自动校验格式\n• 保存后可继续完善其他信息',
        suggestions: ['居民信息怎么完善？', '如何批量添加？']
      }
    }
  }
  
  // 帮助类
  if (q.includes('帮助') || q.includes('功能') || q.includes('怎么用')) {
    return {
      type: 'help',
      title: '系统功能说明',
      answer: '【城运街道综合管理平台功能概览】\n\n📊 数据概览\n• 查看居民、预警、任务、标签的统计数据\n• 预警趋势分析\n• 标签分布统计\n\n👥 居民管理\n• 居民信息录入、编辑、查询\n• 居民标签管理\n• 居民详情查看\n\n⚠️ 预警管理\n• 预警规则配置\n• 预警信息处理\n• 历史预警查询\n\n📋 任务管理\n• 任务派发、接收\n• 任务处理、反馈\n• 历史任务查看\n\n📥 数据导入\n• Excel批量导入居民数据\n• 导入模板下载\n• 导入记录查看\n\n📈 报表统计\n• 多维度数据统计\n• 标签分析\n• 导出报表',
      suggestions: ['怎么添加居民？', '如何处理预警？', '怎么导入数据？']
    }
  }
  
  // 无法理解的问题
  return {
    type: 'unknown',
    title: '未能理解您的问题',
    answer: '抱歉，我没能理解您的问题。您可以尝试：\n\n• 询问具体政策（如"高龄老人有什么补贴"）\n• 查询系统数据（如"有多少居民"）\n• 了解操作方法（如"怎么导入数据"）\n• 搜索居民（如"找姓张的居民"）\n\n或者您可以换个方式描述您的问题？',
    suggestions: ['高龄老人有什么补贴？', '有多少居民？', '怎么添加居民？']
  }
}
