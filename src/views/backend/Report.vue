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

    <!-- 保障详情模块 -->
    <div class="content-card module-card">
      <div class="module-header">
        <div class="module-title">
          <span class="module-title-bar"></span>
          保障详情
        </div>
        <span class="module-desc">整合低保经办、残疾管理、公租房、社保等多套系统数据统一展示</span>
      </div>

      <!-- 详细筛选条件 -->
      <div class="detail-filter">
        <div class="filter-line">
          <el-input v-model="detailFilter.keyword" placeholder="搜索姓名或身份证号…" style="width: 220px" clearable />
          <el-select v-model="detailFilter.community" placeholder="选择社区" style="width: 130px" clearable>
            <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
          </el-select>
          <el-select v-model="detailFilter.grid" placeholder="选择网格" style="width: 120px" clearable>
            <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
          </el-select>
          <el-input v-model="detailFilter.estate" placeholder="小区" style="width: 120px" clearable />
          <el-select v-model="detailFilter.gender" placeholder="性别" style="width: 90px" clearable>
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
          <div class="age-range">
            <el-input v-model="detailFilter.minAge" placeholder="最小" style="width: 70px" clearable type="number" />
            <span class="age-sep">~</span>
            <el-input v-model="detailFilter.maxAge" placeholder="最大" style="width: 70px" clearable type="number" />
          </div>
          <el-select v-model="detailFilter.personType" placeholder="人员类别" style="width: 120px" clearable>
            <el-option v-for="p in personTypes" :key="p" :label="p" :value="p" />
          </el-select>
          <div class="expire-range">
            <span class="filter-label">到期时间：</span>
            <el-date-picker
              v-model="detailFilter.expireDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px"
              clearable
            />
          </div>
        </div>

        <div class="filter-line checkbox-line">
          <span class="checkbox-label">保障类型(多选)：</span>
          <el-checkbox
            v-model="selectAllBenefits"
            :indeterminate="isBenefitIndeterminate"
            @change="handleSelectAllBenefits"
          >全选</el-checkbox>
          <el-checkbox-group v-model="detailFilter.selectedBenefits" class="benefit-checkboxes">
            <el-checkbox
              v-for="b in benefitTagTypes"
              :key="b"
              :label="b"
              border
            >{{ b }}</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="filter-line checkbox-line">
          <span class="checkbox-label">特殊人群(多选)：</span>
          <el-checkbox
            v-model="selectAllSpecialGroups"
            :indeterminate="isSpecialGroupIndeterminate"
            @change="handleSelectAllSpecialGroups"
          >全选</el-checkbox>
          <el-checkbox-group v-model="detailFilter.selectedSpecialGroups" class="benefit-checkboxes">
            <el-checkbox
              v-for="s in specialGroupTags"
              :key="s"
              :label="s"
              border
            >{{ s }}</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="filter-line action-line">
          <el-button type="primary" @click="handleDetailQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetDetailFilter">重置</el-button>
        </div>
      </div>

      <!-- 统计摘要条 -->
      <div class="summary-bar" v-if="detailQueried">
        <div class="summary-item-bar">
          <span class="bar-label">时间段：</span>
          <span class="bar-value">{{ filterDateLabel }}</span>
        </div>
        <div class="summary-item-bar">
          <span class="bar-label">总人数：</span>
          <span class="bar-value highlight-blue">{{ filteredResidents.length }}</span>
          <span class="bar-unit">人</span>
        </div>
        <div class="summary-item-bar">
          <span class="bar-label">新增人口：</span>
          <span class="bar-value highlight-green">{{ summary.newPeople }}</span>
          <span class="bar-unit">人</span>
        </div>
        <div class="summary-item-bar">
          <span class="bar-label">取消人口：</span>
          <span class="bar-value highlight-red">{{ summary.cancelPeople }}</span>
          <span class="bar-unit">人</span>
        </div>
        <div class="summary-item-bar">
          <span class="bar-label">发放金额：</span>
          <span class="bar-value highlight-purple">¥{{ summary.totalAmount.toLocaleString() }}</span>
        </div>
        <div class="summary-item-bar">
          <span class="bar-label">当前享受中：</span>
          <span class="bar-value highlight-cyan">{{ summary.enjoyNow }}</span>
          <span class="bar-unit">人</span>
        </div>
      </div>

      <!-- 居民列表 -->
      <div class="resident-table-wrapper" v-if="detailQueried">
        <el-table :data="pagedResidents" border stripe style="width: 100%" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column prop="name" label="姓名" width="80" align="center" />
          <el-table-column label="身份证号" width="170" show-overflow-tooltip>
            <template #default="{ row }">{{ maskIdCard(row.idCard) }}</template>
          </el-table-column>
          <el-table-column prop="community" label="社区" width="80" align="center" />
          <el-table-column prop="estate" label="小区" width="80" show-overflow-tooltip />
          <el-table-column prop="grid" label="网格" width="80" align="center" />
          <el-table-column prop="personType" label="人员类别" width="80" align="center" />
          <el-table-column label="家庭人口" width="80" align="center">
            <template #default="{ row }">
              <el-tag type="primary" size="small" effect="plain" class="family-tag">{{ row.familyCount || 0 }}人</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="特殊人群" width="150">
            <template #default="{ row }">
              <div v-if="(row.specialGroups || []).length > 0" class="special-tags">
                <el-tag
                  v-for="s in row.specialGroups"
                  :key="s"
                  size="small"
                  effect="plain"
                  :type="getSpecialTagType(s)"
                  style="margin-right: 3px; margin-bottom: 2px;"
                >{{ s }}</el-tag>
              </div>
              <span v-else class="no-tag">--</span>
            </template>
          </el-table-column>
          <el-table-column label="保障信息" min-width="240">
            <template #default="{ row }">
              <div v-if="(row.tags || []).filter(t => benefitTagTypes.includes(t)).length > 0" class="guarantee-tags">
                <el-tag
                  v-for="t in (row.tags || []).filter(tag => benefitTagTypes.includes(tag))"
                  :key="t"
                  :type="getTagType(t)"
                  effect="light"
                  size="small"
                  class="guarantee-tag"
                >
                  {{ t }}<span class="guarantee-count">{{ getBenefitCount(row, t) }}项</span>
                </el-tag>
              </div>
              <span v-else class="no-tag">暂无</span>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" width="110" align="center">
            <template #default="{ row }">
              <span v-if="row.expireDate" :class="getExpireClass(row.expireDate)">{{ row.expireDate }}</span>
              <span v-else class="no-tag">--</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="200">
            <template #default="{ row }">
              <div class="remark-cell">
                <div v-for="(log, i) in (row.remarkLogs || []).slice(0, 2)" :key="i" class="remark-log">
                  <el-tag :type="log.type || 'info'" size="small" effect="light">{{ log.action }}</el-tag>
                  <span class="remark-time">{{ log.time }}</span>
                </div>
                <span v-if="!row.remarkLogs || row.remarkLogs.length === 0" class="no-tag">--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <span class="total-text">共 {{ filteredResidents.length }} 条</span>
          <el-pagination
            v-model:current-page="residentPage"
            v-model:page-size="residentPageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredResidents.length"
            layout="sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </div>
      <el-empty v-else description="请设置筛选条件并点击查询" />
    </div>

    <!-- 个人轨迹查询 -->
    <div class="content-card trace-card">
      <div class="card-header">
        <span class="card-title">
          <el-icon style="color: #1e40af"><Tickets /></el-icon>
          个人待遇轨迹
        </span>
        <span class="card-desc">查询某居民在时间段内每月享受的保障待遇变化</span>
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

      <!-- 轨迹内容：月度待遇列表 -->
      <div class="trace-content" v-if="traceResult.length > 0">
        <!-- 居民基本信息 -->
        <div class="trace-person">
          <div class="person-avatar">{{ traceResult[0].residentName?.charAt(0) || '?' }}</div>
          <div class="person-info">
            <div class="person-name">
              {{ traceResult[0].residentName }}
              <el-tag size="small" type="info">{{ traceResult[0].community }}</el-tag>
            </div>
            <div class="person-meta">
              身份证：{{ maskIdCard(traceResult[0].idCard) }}
              | 查询周期：{{ traceDateRange[0] }} 至 {{ traceDateRange[1] }}
            </div>
          </div>
          <div class="person-summary">
            <div class="summary-item">
              <span class="summary-value">{{ getTotalMonths() }}</span>
              <span class="summary-label">查询月数</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{{ getTotalEnjoyMonths() }}</span>
              <span class="summary-label">有待遇月数</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{{ getLatestMonth() }}</span>
              <span class="summary-label">最近享受</span>
            </div>
          </div>
        </div>

        <!-- 月度待遇变化表 -->
        <div class="benefit-table-wrapper">
          <div class="table-title">
            <span class="table-title-bar"></span>
            月度享受待遇明细
          </div>
          <el-table
            :data="traceResult"
            stripe
            border
            style="width: 100%"
            :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }"
            :cell-style="{ fontSize: '13px' }"
          >
            <el-table-column prop="month" label="月份" width="100" align="center">
              <template #default="{ row }">
                <span class="month-cell">{{ row.month }}</span>
              </template>
            </el-table-column>
            <el-table-column label="享受待遇" min-width="260">
              <template #default="{ row }">
                <div class="benefit-tags">
                  <el-tag
                    v-for="b in row.benefits"
                    :key="b.name"
                    :type="b.type"
                    effect="light"
                    size="default"
                    class="benefit-tag"
                  >
                    {{ b.name }}
                    <span v-if="b.amount" class="benefit-amount">¥{{ b.amount }}</span>
                  </el-tag>
                  <span v-if="row.benefits.length === 0" class="no-benefit">—</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="changeDesc" label="变动情况" min-width="200">
              <template #default="{ row }">
                <div class="change-cell" v-if="row.changeDesc">
                  <template v-for="(c, i) in row.changeDesc" :key="i">
                    <span :class="'change-' + c.type" v-if="c.text">{{ c.text }}</span>
                  </template>
                </div>
                <span v-else class="no-change">无变动</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="row.hasBenefit ? 'success' : 'info'"
                  effect="dark"
                  size="small"
                >
                  {{ row.hasBenefit ? '享受中' : '停发' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

      </div>

      <el-empty v-else description="请输入居民姓名或身份证号并点击查询轨迹" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, User, Plus, Close, Refresh, Money, CircleCheck, Search, InfoFilled, Tickets
} from '@element-plus/icons-vue'
import { residents as mockResidents, communities, grids, personTypes } from '../../data/mock'

// ============ 详细筛选 ============
const benefitTagTypes = ['低保', '残疾', '公租房', '老年', '计生', '社保', '重症', '涉军', '支农返汉', '困境儿童']

// 特殊人群标签
const specialGroupTags = ['涉毒', '信访', '社矫', '刑释', '精障（肇事）', '特扶', '高龄', '独居', '空巢', '孤寡', '孤儿', '事无', '涉军', '精障', '问题儿童']

const detailFilter = reactive({
  keyword: '',
  community: '',
  grid: '',
  estate: '',
  gender: '',
  minAge: '',
  maxAge: '',
  personType: '',
  selectedBenefits: [],
  selectedSpecialGroups: [],
  expireDateRange: []
})

const detailQueried = ref(false)
const residentPage = ref(1)
const residentPageSize = ref(10)

const selectAllBenefits = computed({
  get: () => detailFilter.selectedBenefits.length === benefitTagTypes.length,
  set: (v) => { if (v) detailFilter.selectedBenefits = [...benefitTagTypes] }
})
const isBenefitIndeterminate = computed(
  () => detailFilter.selectedBenefits.length > 0 && detailFilter.selectedBenefits.length < benefitTagTypes.length
)
const handleSelectAllBenefits = (val) => {
  detailFilter.selectedBenefits = val ? [...benefitTagTypes] : []
}

// 特殊人群全选
const selectAllSpecialGroups = computed({
  get: () => detailFilter.selectedSpecialGroups.length === specialGroupTags.length,
  set: (v) => { if (v) detailFilter.selectedSpecialGroups = [...specialGroupTags] }
})
const isSpecialGroupIndeterminate = computed(
  () => detailFilter.selectedSpecialGroups.length > 0 && detailFilter.selectedSpecialGroups.length < specialGroupTags.length
)
const handleSelectAllSpecialGroups = (val) => {
  detailFilter.selectedSpecialGroups = val ? [...specialGroupTags] : []
}

// 将 mock 居民数据映射 tags 字段（从 specialGroups 和属性推断）
const mapResidentTags = (r) => {
  const tags = [...(r.specialGroups || [])]
  // 根据属性推断保障类型
  if (r.disabilityLevel) tags.push('残疾')
  if (r.age >= 80 || (r.specialGroups || []).includes('高龄')) {
    if (!tags.includes('高龄')) tags.push('高龄')
  }
  if (r.age >= 60 && !tags.includes('老年')) tags.push('老年')
  if (r.idCard) {
    const year = new Date(r.birthDate || '').getFullYear()
    if (year && new Date().getFullYear() - year >= 80 && !tags.includes('老年')) {
      // 80岁以上算老年
    }
  }
  // 低保通过特殊标识推断
  if ((r.specialGroups || []).includes('低保')) tags.push('低保')
  // 困境儿童
  if ((r.specialGroups || []).includes('孤儿')) tags.push('困境儿童')
  return [...new Set(tags.filter(t => benefitTagTypes.includes(t)))]
}

// 生成到期日期（基于居民索引，生成不同月份的到期时间）
const generateExpireDate = (idx) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = ((idx * 3) % 12) + 1
  const day = 15 + (idx % 14)
  // 有些已过期，有些即将到期
  if (idx % 4 === 0) {
    // 已过期
    return `${year - 1}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else if (idx % 4 === 1) {
    // 即将到期（1个月内）
    const nextMonth = now.getMonth() + 2
    const realYear = nextMonth > 12 ? year + 1 : year
    const realMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth
    return `${realYear}-${String(realMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  } else {
    // 正常期限
    return `${year + 1}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
}

// 生成操作记录
const generateRemarkLogs = (idx) => {
  const allLogs = [
    [{ action: '新增低保', type: 'success', time: '2025-01-15' }, { action: '数据采集', type: 'info', time: '2025-01-10' }],
    [{ action: '低保复审', type: 'warning', time: '2025-03-20' }, { action: '信息变更', type: 'info', time: '2025-02-08' }],
    [{ action: '新增高龄津贴', type: 'success', time: '2025-02-05' }],
    [{ action: '停发低保', type: 'danger', time: '2025-06-01' }, { action: '数据核实', type: 'info', time: '2025-05-20' }],
    [{ action: '新增公租房', type: 'success', time: '2025-04-12' }, { action: '专项核查', type: 'warning', time: '2025-03-15' }],
    [{ action: '发放重疾救助', type: 'success', time: '2025-05-30' }],
    [{ action: '信息更新', type: 'info', time: '2025-06-10' }, { action: '走访登记', type: 'warning', time: '2025-05-22' }],
    [{ action: '新增社保', type: 'success', time: '2025-01-08' }]
  ]
  return allLogs[idx % allLogs.length] || []
}

const allResidents = mockResidents.map((r, idx) => ({
  ...r,
  tags: mapResidentTags(r),
  personType: r.personType || '户在人在',
  expireDate: generateExpireDate(idx),
  remarkLogs: generateRemarkLogs(idx)
}))

const filteredResidents = computed(() => {
  if (!detailQueried.value) return []
  let result = allResidents
  if (detailFilter.keyword) {
    const kw = detailFilter.keyword.toLowerCase()
    result = result.filter(r => r.name?.toLowerCase().includes(kw) || r.idCard?.includes(kw))
  }
  if (detailFilter.community) result = result.filter(r => r.community === detailFilter.community)
  if (detailFilter.grid) result = result.filter(r => r.grid === detailFilter.grid)
  if (detailFilter.estate) result = result.filter(r => r.estate?.includes(detailFilter.estate))
  if (detailFilter.gender) result = result.filter(r => r.gender === detailFilter.gender)
  if (detailFilter.personType) result = result.filter(r => r.personType === detailFilter.personType)
  if (detailFilter.minAge) result = result.filter(r => r.age >= Number(detailFilter.minAge))
  if (detailFilter.maxAge) result = result.filter(r => r.age <= Number(detailFilter.maxAge))
  if (detailFilter.selectedBenefits.length > 0) {
    result = result.filter(r => detailFilter.selectedBenefits.some(b => (r.tags || []).includes(b)))
  }
  // 特殊人群筛选：AND逻辑，所有选中的标签必须都命中
  if (detailFilter.selectedSpecialGroups.length > 0) {
    result = result.filter(r => {
      const groups = r.specialGroups || []
      return detailFilter.selectedSpecialGroups.every(s => groups.includes(s))
    })
  }
  if (detailFilter.expireDateRange && detailFilter.expireDateRange.length === 2) {
    const [start, end] = detailFilter.expireDateRange
    result = result.filter(r => r.expireDate && r.expireDate >= start && r.expireDate <= end)
  }
  return result
})

const pagedResidents = computed(() => {
  const start = (residentPage.value - 1) * residentPageSize.value
  return filteredResidents.value.slice(start, start + residentPageSize.value)
})

const getTagType = (tag) => {
  const danger = ['低保', '残疾']
  const warning = ['重症', '困境儿童']
  const success = ['公租房', '社保']
  if (danger.includes(tag)) return 'danger'
  if (warning.includes(tag)) return 'warning'
  if (success.includes(tag)) return 'success'
  return 'info'
}

const getExpireClass = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expire-expired'
  if (diffDays <= 30) return 'expire-soon'
  return 'expire-normal'
}

// 特殊人群标签颜色
const RED_SPECIAL_TAGS = ['涉毒', '信访', '社矫', '刑释', '精障（肇事）']
const YELLOW_SPECIAL_TAGS = ['特扶', '高龄', '独居', '空巢', '孤寡', '孤儿', '事无', '涉军', '精障']
const getSpecialTagType = (tag) => {
  if (RED_SPECIAL_TAGS.includes(tag)) return 'danger'
  if (YELLOW_SPECIAL_TAGS.includes(tag)) return 'warning'
  return 'info'
}

// 保障信息项数
const getBenefitCount = (row, tag) => {
  // 为每个保障类型生成1-5项不等的子项
  const seed = (row.id?.charCodeAt(0) || 0) + (tag?.charCodeAt(0) || 0)
  return (seed % 5) + 1
}

const handleDetailQuery = () => {
  detailQueried.value = true
  residentPage.value = 1
  ElMessage.success(`查询完成，共 ${filteredResidents.value.length} 条记录`)
}

const resetDetailFilter = () => {
  detailFilter.keyword = ''
  detailFilter.community = ''
  detailFilter.grid = ''
  detailFilter.estate = ''
  detailFilter.gender = ''
  detailFilter.minAge = ''
  detailFilter.maxAge = ''
  detailFilter.personType = ''
  detailFilter.selectedBenefits = []
  detailFilter.selectedSpecialGroups = []
  detailFilter.expireDateRange = []
  detailQueried.value = false
}

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

// 月度待遇数据：1-6月每月享受的保障类型
const monthlyBenefitsData = {
  '张三': [
    { month: '2025-01', benefits: [{ name: '低保', type: 'danger', amount: '980' }], changeDesc: [], hasBenefit: true },
    { month: '2025-02', benefits: [{ name: '低保', type: 'danger', amount: '980' }, { name: '高龄津贴', type: 'success', amount: '100' }], changeDesc: [{ text: '新增高龄津贴', type: 'new' }], hasBenefit: true },
    { month: '2025-03', benefits: [{ name: '低保', type: 'danger', amount: '980' }, { name: '高龄津贴', type: 'success', amount: '100' }], changeDesc: [], hasBenefit: true },
    { month: '2025-04', benefits: [{ name: '低保', type: 'danger', amount: '980' }, { name: '高龄津贴', type: 'success', amount: '100' }, { name: '公租房', type: 'warning', amount: '320' }], changeDesc: [{ text: '新增公租房', type: 'new' }], hasBenefit: true },
    { month: '2025-05', benefits: [{ name: '低保', type: 'danger', amount: '980' }, { name: '高龄津贴', type: 'success', amount: '150' }, { name: '公租房', type: 'warning', amount: '580' }], changeDesc: [{ text: '高龄津贴 100→150', type: 'change' }, { text: '公租房 320→580', type: 'change' }], hasBenefit: true },
    { month: '2025-06', benefits: [{ name: '高龄津贴', type: 'success', amount: '150' }, { name: '公租房', type: 'warning', amount: '580' }], changeDesc: [{ text: '停发低保', type: 'cancel' }], hasBenefit: true }
  ]
}

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

  // 生成月度待遇列表
  const rawData = monthlyBenefitsData[target.name] || monthlyBenefitsData['张三']
  traceResult.value = rawData.map(item => ({
    ...item,
    residentName: target.name,
    idCard: target.idCard,
    community: target.community
  }))

  ElMessage.success(`查询成功，共 ${rawData.length} 个月的待遇记录`)
}

const getTotalMonths = () => {
  if (!traceDateRange.value) return 0
  const start = new Date(traceDateRange.value[0])
  const end = new Date(traceDateRange.value[1])
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
}

const getTotalEnjoyMonths = () => traceResult.value.filter(r => r.hasBenefit).length

const getLatestMonth = () => {
  const enjoyMonths = traceResult.value.filter(r => r.hasBenefit)
  return enjoyMonths.length > 0 ? enjoyMonths[enjoyMonths.length - 1].month : '—'
}

const resetTrace = () => {
  traceName.value = ''
  traceIdCard.value = ''
  traceDateRange.value = ['2025-01-01', '2025-06-30']
  traceResult.value = []
}

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

/* 模块卡片 */
.module-card { padding: 20px 24px; }
.module-header {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 14px; margin-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}
.module-title {
  font-size: 16px; font-weight: 700; color: #1f2937;
  display: inline-flex; align-items: center; gap: 10px;
}
.module-title-bar {
  width: 4px; height: 16px; background: linear-gradient(180deg, #1e40af, #2563eb);
  border-radius: 2px;
}
.module-desc {
  font-size: 12px; color: #94a3b8;
}

/* 筛选器卡片 */
.filter-card { padding: 14px 0; }
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
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;
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

/* 搜索行 */
.trace-search-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 12px 14px; background: #f8fafc; border-radius: 6px; margin-bottom: 14px;
}

/* 人员信息卡片 */
.trace-person {
  display: flex; align-items: center; gap: 16px;
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
.person-summary {
  display: flex; gap: 20px;
  padding-left: 16px; border-left: 1px solid #e2e8f0;
}
.summary-item { text-align: center; }
.summary-value {
  display: block; font-size: 18px; font-weight: 700; color: #1e40af;
  font-variant-numeric: tabular-nums;
}
.summary-label { font-size: 11px; color: #64748b; }

/* 表格标题 */
.table-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: #1f2937;
  margin: 16px 0 10px;
}
.table-title-bar {
  width: 3px; height: 14px; background: #1e40af; border-radius: 2px;
}

/* 月度待遇表 */
.benefit-table-wrapper { margin-bottom: 20px; }
.month-cell { font-weight: 700; color: #1e3a8a; font-variant-numeric: tabular-nums; }
.benefit-tags {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
}
.benefit-tag {
  font-weight: 600; font-size: 12px;
  padding: 4px 10px; border-radius: 4px;
}
.benefit-amount {
  margin-left: 4px; font-weight: 700;
}
.no-benefit { color: #94a3b8; }

.change-cell { display: flex; flex-direction: column; gap: 3px; }
.change-new { color: #15803d; font-weight: 600; font-size: 12px; }
.change-cancel { color: #b91c1c; font-weight: 600; font-size: 12px; }
.change-change { color: #b45309; font-weight: 600; font-size: 12px; }
.no-change { color: #94a3b8; font-size: 12px; }

/* ============ 详细筛选 ============ */
.detail-filter {
  padding: 4px 0 16px;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 16px;
}
.filter-line {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 12px;
}
.checkbox-line { align-items: flex-start; }
.checkbox-label {
  font-size: 13px; color: #475569; font-weight: 600;
  white-space: nowrap; padding-top: 4px;
}
.benefit-checkboxes { gap: 4px; flex-wrap: wrap; }
.age-range { display: flex; align-items: center; gap: 4px; }
.age-sep { color: #94a3b8; }
.expire-range { display: flex; align-items: center; gap: 6px; }
.action-line { justify-content: flex-end; }

/* ============ 统计摘要条 ============ */
.summary-bar {
  display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #dbeafe;
  border-radius: 6px;
  margin-bottom: 14px;
}
.summary-item-bar {
  display: inline-flex; align-items: baseline; gap: 4px;
}
.bar-label { font-size: 12px; color: #64748b; }
.bar-value { font-size: 15px; font-weight: 700; color: #1f2937; }
.bar-unit { font-size: 12px; color: #94a3b8; }
.highlight-blue { color: #1e40af; }
.highlight-green { color: #15803d; }
.highlight-red { color: #b91c1c; }
.highlight-purple { color: #6d28d9; }
.highlight-cyan { color: #0891b2; }

/* ============ 居民列表 ============ */
.resident-table-wrapper { }
.pagination-bar {
  padding: 12px 0 0;
  display: flex; justify-content: space-between; align-items: center;
}
.total-text { font-size: 13px; color: #64748b; }
.no-benefit { color: #94a3b8; }

/* 到期时间样式 */
.expire-expired { color: #dc2626; font-weight: 600; }
.expire-soon { color: #d97706; font-weight: 600; }
.expire-normal { color: #15803d; font-weight: 500; }

/* 与居民列表一致的样式 */
.family-tag { cursor: pointer; }
.special-tags { display: flex; flex-wrap: wrap; }
.no-tag { color: #94a3b8; font-size: 12px; }
.guarantee-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.guarantee-tag { margin-right: 0; }
.guarantee-count { margin-left: 4px; opacity: 0.75; }

/* 备注列样式 */
.remark-cell { display: flex; flex-direction: column; gap: 3px; }
.remark-log { display: flex; align-items: center; gap: 5px; }
.remark-time { font-size: 11px; color: #94a3b8; }
</style>
