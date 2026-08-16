<template>
  <div class="report-page">
    <!-- 页面标题 + 导出 -->
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">数据汇总</h2>
        <p class="page-subtitle">整合低保经办、残疾管理、公租房、社保等多套系统数据统一展示</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>导出报表
        </el-button>
      </div>
    </div>

    <!-- 全局筛选器 -->
    <div class="content-card filter-card">
      <div class="filter-row">
        <span class="filter-title">筛选条件：</span>
        <div class="filter-item">
          <span class="filter-label">保障类别：</span>
          <el-select v-model="filterCategory" placeholder="全部类别" clearable style="width: 160px">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">时间段：</span>
          <el-date-picker
            v-model="filterDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
          />
        </div>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      <div class="filter-tip">
        <el-icon color="#94a3b8"><InfoFilled /></el-icon>
        <span>总人数、发放金额按所选时间段统计（人数去重、金额累计）；新增/取消/异动人口统计时间段内的变化情况</span>
      </div>
    </div>

    <!-- 汇总统计卡 -->
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon" style="background: #1e40af"><el-icon><User /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.totalPeople }}</span>
            <span class="stat-unit">人</span>
          </div>
          <span class="stat-label">总人数(去重)</span>
          <span class="stat-sub">{{ filterCategoryLabel }} | {{ filterDateLabel }}</span>
        </div>
      </div>
      <div class="stat-card stat-new">
        <div class="stat-icon" style="background: #15803d"><el-icon><Plus /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.newPeople }}</span>
            <span class="stat-unit">人</span>
          </div>
          <span class="stat-label">新增人口</span>
          <span class="stat-sub up">较上期 +{{ (summary.newPeople * 0.08).toFixed(0) }}</span>
        </div>
      </div>
      <div class="stat-card stat-cancel">
        <div class="stat-icon" style="background: #b91c1c"><el-icon><Close /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.cancelPeople }}</span>
            <span class="stat-unit">人</span>
          </div>
          <span class="stat-label">取消人口</span>
          <span class="stat-sub down">较上期 -{{ (summary.cancelPeople * 0.05).toFixed(0) }}</span>
        </div>
      </div>
      <div class="stat-card stat-change">
        <div class="stat-icon" style="background: #d97706"><el-icon><Refresh /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.changePeople }}</span>
            <span class="stat-unit">人</span>
          </div>
          <span class="stat-label">异动人口</span>
          <span class="stat-sub">类别转换 / 信息变更</span>
        </div>
      </div>
      <div class="stat-card stat-amount">
        <div class="stat-icon" style="background: #6d28d9"><el-icon><Money /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.totalAmount }}</span>
            <span class="stat-unit">元</span>
          </div>
          <span class="stat-label">发放金额(累计)</span>
          <span class="stat-sub">约 {{ (summary.totalAmount / 10000).toFixed(1) }} 万元</span>
        </div>
      </div>
      <div class="stat-card stat-enjoy">
        <div class="stat-icon" style="background: #0891b2"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ summary.enjoyNow }}</span>
            <span class="stat-unit">人</span>
          </div>
          <span class="stat-label">当前享受中</span>
          <span class="stat-sub">覆盖率 {{ (summary.enjoyNow / Math.max(summary.totalPeople,1) * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- 个人轨迹查询 -->
    <div class="content-card trace-card">
      <div class="card-header">
        <span class="card-title">
          <el-icon style="color: #1e40af"><Tickets /></el-icon>
          个人轨迹查询
        </span>
        <span class="card-desc">查询某居民的数据采集时间点、预警触发时间点及预警处理完成情况</span>
      </div>

      <div class="trace-search-row">
        <el-input v-model="traceName" placeholder="输入居民姓名" style="width: 180px" clearable />
        <el-input v-model="traceIdCard" placeholder="输入身份证号" style="width: 260px" clearable />
        <el-date-picker
          v-model="traceDateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
        <el-button type="primary" @click="queryTrace">
          <el-icon><Search /></el-icon>查询轨迹
        </el-button>
        <el-button @click="resetTrace">重置</el-button>
      </div>

      <!-- 轨迹类型图例 -->
      <div class="trace-legend" v-if="traceResult.length > 0">
        <div class="legend-item"><span class="dot dot-capture"></span>数据采集</div>
        <div class="legend-item"><span class="dot dot-warning"></span>预警触发</div>
        <div class="legend-item"><span class="dot dot-resolved"></span>预警处理完成</div>
      </div>

      <!-- 轨迹列表 -->
      <div class="trace-content" v-if="traceResult.length > 0">
        <div class="trace-person">
          <div class="person-avatar">{{ traceResult[0].residentName?.charAt(0) || '?' }}</div>
          <div class="person-info">
            <div class="person-name">
              {{ traceResult[0].residentName }}
              <el-tag size="small" type="info">{{ traceResult[0].community }}</el-tag>
            </div>
            <div class="person-meta">
              身份证：{{ maskIdCard(traceResult[0].idCard) }}
              | 共 {{ traceResult.length }} 条轨迹
              （采集 {{ countByType('capture') }} 条 · 预警 {{ countByType('warning') }} 条 · 已处理 {{ countByType('resolved') }} 条）
            </div>
          </div>
        </div>
        <el-timeline class="trace-timeline">
          <el-timeline-item
            v-for="(t, idx) in traceResult"
            :key="idx"
            :type="getTraceTypeClass(t.type)"
            :timestamp="t.time"
            :icon="getTraceIcon(t.type)"
            size="large"
          >
            <div class="trace-item" :class="'trace-item-' + t.type">
              <div class="trace-header">
                <span class="trace-type-tag" :class="'tag-' + t.type">{{ getTraceTypeLabel(t.type) }}</span>
                <span class="trace-title">{{ t.title }}</span>
                <el-tag v-if="t.warningLevel" size="small" :type="getLevelType(t.warningLevel)" effect="light" class="level-tag">{{ t.warningLevel }}</el-tag>
              </div>

              <!-- 数据采集内容 -->
              <template v-if="t.type === 'capture'">
                <div class="trace-section">
                  <div class="section-title">📡 数据来源</div>
                  <div class="section-content">{{ t.source }}</div>
                </div>
                <div class="trace-section">
                  <div class="section-title">📋 采集信息</div>
                  <div class="capture-grid">
                    <div class="capture-item" v-for="(v, k) in t.capturedData" :key="k">
                      <span class="capture-key">{{ k }}</span>
                      <span class="capture-val">{{ v }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 预警触发内容 -->
              <template v-else-if="t.type === 'warning'">
                <div class="trace-section">
                  <div class="section-title">⚠️ 触发原因</div>
                  <div class="section-content warning-reason">{{ t.triggerReason }}</div>
                </div>
                <div class="trace-section">
                  <div class="section-title">📐 匹配规则</div>
                  <div class="section-content">{{ t.matchRule }}</div>
                </div>
                <div class="trace-meta meta-2col">
                  <div><span class="meta-k">预警类型：</span><span class="meta-v">{{ t.warningType }}</span></div>
                  <div><span class="meta-k">预警编号：</span><span class="meta-v mono">{{ t.warningId }}</span></div>
                </div>
              </template>

              <!-- 预警处理完成内容 -->
              <template v-else-if="t.type === 'resolved'">
                <div class="trace-section">
                  <div class="section-title">✅ 核查结论</div>
                  <div class="section-content resolved-result">
                    <el-tag size="small" :type="t.checkResult === '停发取消' ? 'danger' : 'success'" effect="dark">{{ t.checkResult }}</el-tag>
                    <span class="resolved-text">{{ t.checkConclusion }}</span>
                  </div>
                </div>
                <div class="trace-section">
                  <div class="section-title">📝 处理说明</div>
                  <div class="section-content">{{ t.processNote }}</div>
                </div>
                <div class="trace-meta meta-3col">
                  <div><span class="meta-k">关联预警：</span><span class="meta-v mono">{{ t.linkWarningId }}</span></div>
                  <div><span class="meta-k">核查人：</span><span class="meta-v">{{ t.operator }}</span></div>
                  <div><span class="meta-k">处理用时：</span><span class="meta-v">{{ t.duration }}</span></div>
                </div>
              </template>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <el-empty v-else description="请输入居民姓名或身份证号并点击查询轨迹" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, User, Plus, Close, Refresh, Money, CircleCheck, Search, InfoFilled, Tickets
} from '@element-plus/icons-vue'

// ============ 全局筛选 ============
const categoryOptions = ['低保', '特困', '残疾两项', '高龄津贴', '公租房', '4050灵活就业', '计生特扶', '重症', '困境儿童']
const filterCategory = ref('')
const filterDateRange = ref(['2025-06-01', '2025-06-30'])

const filterCategoryLabel = computed(() => filterCategory.value || '全部类别')
const filterDateLabel = computed(() => filterDateRange.value && filterDateRange.value.length === 2
  ? `${filterDateRange.value[0]} ~ ${filterDateRange.value[1]}`
  : '全部时间')

// ============ 顶部汇总 ============
const summary = computed(() => {
  const base = { totalPeople: 8820, newPeople: 126, cancelPeople: 48, changePeople: 87, totalAmount: 2486320, enjoyNow: 2002 }
  if (!filterCategory.value) return base
  const scales = { '低保': 0.25, '特困': 0.12, '残疾两项': 0.18, '高龄津贴': 0.15, '公租房': 0.1, '4050灵活就业': 0.1, '计生特扶': 0.05, '重症': 0.03, '困境儿童': 0.02 }
  const s = scales[filterCategory.value] || 1
  return {
    totalPeople: Math.round(base.totalPeople * s),
    newPeople: Math.round(base.newPeople * s),
    cancelPeople: Math.round(base.cancelPeople * s),
    changePeople: Math.round(base.changePeople * s),
    totalAmount: Math.round(base.totalAmount * s),
    enjoyNow: Math.round(base.enjoyNow * s)
  }
})

// ============ 个人轨迹查询 ============
const traceName = ref('')
const traceIdCard = ref('')
const traceDateRange = ref(['2025-01-01', '2025-06-30'])
const traceResult = ref([])

const residentPool = [
  { name: '张三', idCard: '420106194506152341', community: '学堂社区' },
  { name: '李四', idCard: '420106195208284567', community: '荣东社区' },
  { name: '王五', idCard: '420106196301206789', community: '六角社区' },
  { name: '赵六', idCard: '420106197210058901', community: '由义社区' }
]

const traceTemplates = [
  // ===== 数据采集 =====
  {
    type: 'capture',
    title: '社保系统数据同步',
    source: '武汉市人力资源和社会保障局 - 数据共享接口（每日自动同步）',
    capturedData: {
      '养老待遇发放': '4,120元/月',
      '医疗参保状态': '在职职工医保',
      '社保缴费基数': '6,850元',
      '最近缴费月份': '2025-04'
    }
  },
  {
    type: 'capture',
    title: '不动产登记信息抓取',
    source: '武汉市自然资源和规划局 - 不动产登记信息平台',
    capturedData: {
      '名下房产数量': '1套',
      '房屋坐落': '江汉区解放大道XX号XX栋XX单元XX室',
      '建筑面积': '87.52㎡',
      '登记时间': '2010-06-15',
      '房屋用途': '住宅'
    }
  },
  {
    type: 'capture',
    title: '民政死亡人员信息比对',
    source: '武汉市民政局 - 人口死亡信息库（月度批量比对）',
    capturedData: {
      '比对结果': '未匹配',
      '最近比对日期': '2025-05-10',
      '户籍状态': '在籍'
    }
  },
  {
    type: 'capture',
    title: '工商登记信息抓取',
    source: '武汉市市场监督管理局 - 企业登记信息共享库',
    capturedData: {
      '是否担任股东/法人': '是',
      '企业名称': '武汉XX便民超市有限公司',
      '注册资本': '50万元',
      '持股比例': '30%',
      '登记状态': '存续（在营）'
    }
  },
  {
    type: 'capture',
    title: '网格员入户信息采集',
    source: '六角亭街道网格员上门采集',
    capturedData: {
      '采集方式': '入户走访',
      '采集人': '网格员小刘',
      '家庭人口': '3人',
      '月总收入': '约3,200元',
      '住房情况': '自购商品房',
      '生活状况': '一般'
    }
  },
  {
    type: 'capture',
    title: '残联残疾人证信息同步',
    source: '武汉市残疾人联合会 - 残疾人证管理系统',
    capturedData: {
      '残疾证号': '42010619XXXXXXXXXX43',
      '残疾类别': '肢体残疾',
      '残疾等级': '二级',
      '发证日期': '2023-03-20',
      '有效期至': '2033-03-19'
    }
  },

  // ===== 预警触发 =====
  {
    type: 'warning',
    title: '工商登记异常预警',
    warningLevel: '红色预警',
    warningType: '政策不符',
    warningId: 'YJ20250512-0087',
    triggerReason: '居民名下登记有注册资本50万元企业，持股30%，不符合低保家庭金融资产条件（家庭人均金融资产需低于当地低保标准24倍）',
    matchRule: '规则ID: R003-工商登记资产核查 | 条件: 名下企业注册资本≥20万或持股比例≥20% | 判定: 触发预警'
  },
  {
    type: 'warning',
    title: '收入超标预警',
    warningLevel: '橙色预警',
    warningType: '政策不符',
    warningId: 'YJ20250515-0124',
    triggerReason: '社保养老待遇4120元/月 + 退休金 + 家庭其他收入，推算人均月收入超过武汉市低保标准（980元/人·月）3倍以上',
    matchRule: '规则ID: R001-低保人均收入核查 | 公式: 家庭月总收入÷家庭人口 > 980×3 | 当前值: ~1,067元/人 | 判定: 触发预警'
  },
  {
    type: 'warning',
    title: '生存状态不一致预警',
    warningLevel: '红色预警',
    warningType: '状态变化',
    warningId: 'YJ20250520-0156',
    triggerReason: '本系统居民状态为"在世"，民政局死亡人口库显示该身份证已于2025-04-28注销；高龄津贴及低保仍在按月发放',
    matchRule: '规则ID: R012-跨系统生存状态比对 | 条件: 本系统状态=在世 AND 民政局状态=已死亡 AND 存在享受中标签 | 判定: 触发预警'
  },
  {
    type: 'warning',
    title: '高龄津贴到期提醒',
    warningLevel: '黄色预警',
    warningType: '到期提醒',
    warningId: 'YJ20250525-0203',
    triggerReason: '高龄津贴年度资格认证将于2025-06-30到期，到期后将自动暂停发放；居民已满82周岁，需完成年度生存认证续期',
    matchRule: '规则ID: R021-津贴到期提醒 | 条件: 距认证到期≤30天 AND 未完成本年度认证 | 判定: 触发预警'
  },
  {
    type: 'warning',
    title: '低保与公租房政策互斥',
    warningLevel: '橙色预警',
    warningType: '政策互斥',
    warningId: 'YJ20250528-0234',
    triggerReason: '同时享受低保A类（980元/月）及公租房实物配租，根据武政规[2022]8号文，住房保障与低保补助享受标准存在冲突，需重新核定',
    matchRule: '规则ID: R032-低保+公租房互斥核查 | 条件: 低保享受中 AND 公租房实物配租享受中 AND 家庭人均面积≥15㎡ | 判定: 触发预警'
  },

  // ===== 预警处理完成 =====
  {
    type: 'resolved',
    title: '预警处理完成 - 工商登记异常',
    linkWarningId: 'YJ20250512-0087',
    checkResult: '停发取消',
    checkConclusion: '核查属实，居民持股30%，经社区和街道两级审批后，自2025-06起停发低保待遇',
    processNote: '2025-05-13 网格员入户核实并收集佐证材料；2025-05-16 社区低保评议小组讨论通过；2025-05-22 街道民政办审批完成，出具停发告知书',
    operator: '张某某(街道民政办)',
    duration: '10天12小时'
  },
  {
    type: 'resolved',
    title: '预警处理完成 - 收入超标',
    linkWarningId: 'YJ20250515-0124',
    checkResult: '停发取消',
    checkConclusion: '经核查家庭收入属实，人均月收入超过低保标准，低保予以退保；保留高龄津贴（不冲突）',
    processNote: '2025-05-16 电话通知居民本人；2025-05-18 居民到社区签字确认；2025-05-25 完成停发手续',
    operator: '李某某(社区民政干事)',
    duration: '10天6小时'
  },
  {
    type: 'resolved',
    title: '预警处理完成 - 生存状态不一致',
    linkWarningId: 'YJ20250520-0156',
    checkResult: '停发取消',
    checkConclusion: '已确认死亡，追回2025-05月多发放低保及高龄津贴合计1,380元，家属已全额退回',
    processNote: '2025-05-21 网格员上门核实，家属提供死亡证明（2025-04-28）；2025-05-27 核算多发金额并通知家属退款；2025-06-01 家属到社区银行专户缴款，系统核销',
    operator: '王某某(社区+街道联合)',
    duration: '12天4小时'
  },
  {
    type: 'resolved',
    title: '预警处理完成 - 高龄津贴到期提醒',
    linkWarningId: 'YJ20250525-0203',
    checkResult: '继续享受',
    checkConclusion: '已完成年度生存认证（人脸识别），认证通过，高龄津贴继续发放',
    processNote: '2025-05-26 发送短信提醒；2025-05-28 家属协助通过"鄂汇办"APP完成人脸识别；2025-05-29 系统自动续期',
    operator: '系统自动+社区跟进',
    duration: '4天'
  }
]

const queryTrace = () => {
  if (!traceName.value && !traceIdCard.value) {
    ElMessage.warning('请输入居民姓名或身份证号')
    return
  }
  // 匹配居民
  let target = residentPool.find(r =>
    (traceName.value && r.name.includes(traceName.value)) ||
    (traceIdCard.value && r.idCard.includes(traceIdCard.value))
  )
  if (!target) target = residentPool[0] // 默认取第一个做演示

  // 生成时间序列轨迹（按时间正序：采集→触发→处理）
  const start = new Date(traceDateRange.value?.[0] || '2025-01-01')
  const end = new Date(traceDateRange.value?.[1] || '2025-06-30')
  const totalDays = Math.max(1, Math.floor((end - start) / 86400000))
  const dayStep = Math.floor(totalDays / (traceTemplates.length + 1)) + 1

  traceResult.value = traceTemplates
    .map((tpl, idx) => {
      // 保证采集在前面，预警在中间，处理在后面
      let dayOffset = 0
      if (tpl.type === 'capture') dayOffset = Math.floor(idx * dayStep * 0.6)
      else if (tpl.type === 'warning') dayOffset = Math.floor(totalDays * 0.4 + (idx - 6) * dayStep)
      else dayOffset = Math.floor(totalDays * 0.6 + (idx - 11) * dayStep * 1.2)

      const dt = new Date(start.getTime() + Math.min(dayOffset, totalDays - 1) * 86400000 + Math.floor(Math.random() * 86400000))
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const d = String(dt.getDate()).padStart(2, '0')
      const h = String(dt.getHours()).padStart(2, '0')
      const min = String(dt.getMinutes()).padStart(2, '0')
      return {
        residentName: target.name,
        idCard: target.idCard,
        community: target.community,
        ...tpl,
        time: `${y}-${m}-${d} ${h}:${min}`
      }
    })
    .sort((a, b) => b.time.localeCompare(a.time))

  ElMessage.success(`查询成功，共找到 ${traceResult.value.length} 条轨迹记录`)
}

const resetTrace = () => {
  traceName.value = ''
  traceIdCard.value = ''
  traceDateRange.value = ['2025-01-01', '2025-06-30']
  traceResult.value = []
}

const countByType = (type) => traceResult.value.filter(t => t.type === type).length

const getLevelType = (level) => {
  if (level.includes('红色')) return 'danger'
  if (level.includes('橙色')) return 'warning'
  if (level.includes('黄色')) return 'warning'
  return 'info'
}

const getTraceTypeLabel = (t) => ({
  'capture': '📡 数据采集',
  'warning': '⚠️ 预警触发',
  'resolved': '✅ 预警处理完成'
})[t] || t

const getTraceTypeClass = (t) => ({
  'capture': 'primary',
  'warning': 'danger',
  'resolved': 'success'
})[t] || ''

const getTraceIcon = (t) => ({
  'capture': Tickets,
  'warning': InfoFilled,
  'resolved': CircleCheck
})[t] || Tickets

// ============ 工具 & 事件 ============
const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 10) return idCard
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

const handleQuery = () => {
  ElMessage.success(`查询完成：${filterCategoryLabel.value} / ${filterDateLabel.value}`)
}

const resetFilter = () => {
  filterCategory.value = ''
  filterDateRange.value = ['2025-06-01', '2025-06-30']
  ElMessage.info('已重置筛选条件')
}

const exportReport = () => {
  ElMessage.success(`报表导出中：${filterCategoryLabel.value} / ${filterDateLabel.value}`)
}
</script>

<style scoped>
.report-page { padding: 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
}
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.content-card {
  background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px 20px;
  margin-bottom: 16px;
}

/* 筛选器卡片 */
.filter-card { padding: 14px 20px; }
.filter-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.filter-title { font-size: 13px; font-weight: 600; color: #475569; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-label { font-size: 13px; color: #64748b; white-space: nowrap; }
.filter-tip {
  margin-top: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 4px;
  display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b;
}

/* 统计卡 */
.stats-row {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px;
}
.stat-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff;
  border-radius: 8px; border: 1px solid #e2e8f0; position: relative; overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.08);
}
.stat-card::after {
  content: ''; position: absolute; right: -20px; top: -20px; width: 80px; height: 80px;
  border-radius: 50%; opacity: 0.06;
}
.stat-total::after { background: #1e40af; }
.stat-new::after { background: #15803d; }
.stat-cancel::after { background: #b91c1c; }
.stat-change::after { background: #d97706; }
.stat-amount::after { background: #6d28d9; }
.stat-enjoy::after { background: #0891b2; }

.stat-icon {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #fff; flex-shrink: 0;
}
.stat-info { flex: 1; min-width: 0; }
.stat-top-row { display: flex; align-items: baseline; gap: 4px; }
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-unit { font-size: 12px; color: #64748b; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 2px; display: block; }
.stat-sub {
  font-size: 11px; color: #94a3b8; margin-top: 3px; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.stat-sub.up { color: #15803d; }
.stat-sub.down { color: #b91c1c; }

/* 轨迹卡片 */
.trace-card { }
.card-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap;
}
.card-title {
  font-size: 15px; font-weight: 600; color: #1f2937;
  display: inline-flex; align-items: center; gap: 6px;
}
.card-desc { font-size: 12px; color: #94a3b8; }

.trace-search-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 12px 14px; background: #f8fafc; border-radius: 6px; margin-bottom: 14px;
}

/* 轨迹类型图例 */
.trace-legend {
  display: flex; gap: 22px; margin-bottom: 16px; padding: 10px 14px;
  background: #fafbfc; border: 1px dashed #e2e8f0; border-radius: 6px;
}
.legend-item {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #475569;
}
.legend-item .dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
}
.dot-capture { background: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,.12); }
.dot-warning { background: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.12); }
.dot-resolved { background: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }

.trace-person {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%);
  border-radius: 8px; margin-bottom: 14px; border: 1px solid #dbeafe;
}
.person-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #1e40af, #6d28d9);
  color: #fff; font-size: 22px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.person-info { flex: 1; }
.person-name {
  font-size: 16px; font-weight: 700; color: #1f2937;
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.person-meta { font-size: 12px; color: #64748b; line-height: 1.6; }

.trace-timeline { padding: 4px 10px 4px 2px; }
.trace-item {
  background: #fff; border-radius: 8px;
  padding: 12px 16px;
  transition: box-shadow 0.15s ease;
}
.trace-item:hover { box-shadow: 0 4px 12px rgba(15,23,42,.06); }

.trace-item-capture { border: 1px solid #bfdbfe; background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 40%); }
.trace-item-warning { border: 1px solid #fecaca; background: linear-gradient(180deg, #fff1f2 0%, #ffffff 40%); }
.trace-item-resolved { border: 1px solid #bbf7d0; background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%); }

.trace-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;
}
.trace-type-tag {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
  color: #fff; letter-spacing: 0.2px;
}
.tag-capture { background: linear-gradient(135deg, #1e40af, #2563eb); }
.tag-warning { background: linear-gradient(135deg, #b91c1c, #dc2626); }
.tag-resolved { background: linear-gradient(135deg, #15803d, #16a34a); }

.trace-title { font-size: 14px; font-weight: 700; color: #1f2937; flex: 1; }
.level-tag { margin-left: auto; font-weight: 600; }

.trace-section { margin-bottom: 8px; }
.trace-section:last-child { margin-bottom: 0; }
.section-title {
  font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px;
  display: flex; align-items: center; gap: 4px;
}
.section-content {
  font-size: 13px; color: #334155; line-height: 1.6;
  padding: 8px 10px; background: #f8fafc; border-radius: 6px;
}
.warning-reason {
  color: #991b1b; background: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px 6px 6px 4px;
  font-weight: 500;
}
.resolved-result {
  background: #f0fdf4; border-left: 3px solid #16a34a; border-radius: 4px 6px 6px 4px;
  display: flex; align-items: center; gap: 10px;
}
.resolved-text { font-size: 13px; color: #14532d; font-weight: 500; }

/* 数据采集信息网格 */
.capture-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px;
  padding: 8px 10px; background: #f8fafc; border-radius: 6px;
}
.capture-item { display: flex; justify-content: space-between; gap: 10px; font-size: 12.5px; }
.capture-key { color: #64748b; flex-shrink: 0; }
.capture-val { color: #1f2937; font-weight: 500; text-align: right; word-break: break-all; }

/* 通用meta */
.trace-meta {
  display: flex; gap: 14px 24px; flex-wrap: wrap;
  font-size: 12px; color: #475569;
  padding-top: 8px; margin-top: 8px; border-top: 1px dashed #e2e8f0;
}
.meta-2col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 20px; }
.meta-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 16px; }
.meta-k { color: #94a3b8; }
.meta-v { color: #1f2937; font-weight: 500; }
.meta-v.mono { font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; color: #475569; }
</style>
