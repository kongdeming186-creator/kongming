<template>
  <div class="report-page">
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

    <!-- 总览统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue"><el-icon><User /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ residents.length }}</span>
          <span class="stat-label">居民总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><el-icon><PriceTag /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ tags.length }}</span>
          <span class="stat-label">保障标签</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><el-icon><Warning /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ warnings.filter(w => w.status === '待处理').length }}</span>
          <span class="stat-label">待处理预警</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><PriceTag /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ tags.filter(t => t.isEnjoy).length }}</span>
          <span class="stat-label">享受中标签</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><el-icon><UserFilled /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ gridWorkers.length }}</span>
          <span class="stat-label">网格员</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon cyan"><el-icon><Money /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalSubsidy }}万</span>
          <span class="stat-label">月度补贴总额</span>
        </div>
      </div>
    </div>

    <!-- 业务系统数据汇总 -->
    <div class="systems-grid">
      <div class="system-card">
        <div class="system-header">
          <div class="system-icon red"><el-icon><PriceTag /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">低保经办系统</h3>
            <span class="system-count">{{ dibaoCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">享受中</span>
            <span class="stat-value">{{ dibaoEnjoying }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">待核实</span>
            <span class="stat-value warning">{{ dibaoPending }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ dibaoAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('低保')">查看详情</el-button>
        </div>
      </div>

      <div class="system-card">
        <div class="system-header">
          <div class="system-icon orange"><el-icon><User /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">残疾管理系统</h3>
            <span class="system-count">{{ canjiCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">享受中</span>
            <span class="stat-value">{{ canjiEnjoying }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">待年审</span>
            <span class="stat-value warning">{{ canjiPending }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ canjiAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('残疾')">查看详情</el-button>
        </div>
      </div>

      <div class="system-card">
        <div class="system-header">
          <div class="system-icon green"><el-icon><HomeFilled /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">公租房系统</h3>
            <span class="system-count">{{ gongzuCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">实物配租</span>
            <span class="stat-value">{{ gongzuShiwu }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">租赁补贴</span>
            <span class="stat-value">{{ gongzuButie }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ gongzuAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('公租房')">查看详情</el-button>
        </div>
      </div>

      <div class="system-card">
        <div class="system-header">
          <div class="system-icon purple"><el-icon><Calendar /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">高龄津贴系统</h3>
            <span class="system-count">{{ gaolingCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">80-89岁</span>
            <span class="stat-value">{{ gaoling8089 }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">90岁以上</span>
            <span class="stat-value">{{ gaoling90Plus }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ gaolingAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('老年')">查看详情</el-button>
        </div>
      </div>

      <div class="system-card">
        <div class="system-header">
          <div class="system-icon blue"><el-icon><Document /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">社保/4050系统</h3>
            <span class="system-count">{{ shebaoCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">享受中</span>
            <span class="stat-value">{{ shebaoEnjoying }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">待申报</span>
            <span class="stat-value warning">{{ shebaoPending }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ shebaoAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('社保')">查看详情</el-button>
        </div>
      </div>

      <div class="system-card">
        <div class="system-header">
          <div class="system-icon cyan"><el-icon><UserFilled /></el-icon></div>
          <div class="system-info">
            <h3 class="system-name">计生特扶系统</h3>
            <span class="system-count">{{ jishengCount }}人</span>
          </div>
        </div>
        <div class="system-body">
          <div class="system-stat">
            <span class="stat-label">享受中</span>
            <span class="stat-value">{{ jishengEnjoying }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">待核实</span>
            <span class="stat-value warning">{{ jishengPending }}人</span>
          </div>
          <div class="system-stat">
            <span class="stat-label">月补贴总额</span>
            <span class="stat-value">{{ jishengAmount }}元</span>
          </div>
        </div>
        <div class="system-footer">
          <el-button text size="small" @click="viewSystemDetail('计生')">查看详情</el-button>
        </div>
      </div>
    </div>

    <!-- 数据分布图表 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">保障标签分布</h3>
        </div>
        <div class="chart-body">
          <div class="tag-distribution">
            <div v-for="item in tagDistribution" :key="item.type" class="tag-bar-item">
              <div class="tag-bar-label">
                <el-tag :type="getTagType(item.type)" size="small">{{ item.type }}</el-tag>
                <span class="tag-bar-count">{{ item.count }}人</span>
              </div>
              <div class="tag-bar-track">
                <div class="tag-bar-fill" :style="{ width: item.percentage + '%', background: getTagColor(item.type) }"></div>
              </div>
              <span class="tag-bar-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">预警类型分布</h3>
        </div>
        <div class="chart-body">
          <div class="warning-distribution">
            <div v-for="item in warningDistribution" :key="item.type" class="warning-item">
              <div class="warning-dot" :style="{ background: item.color }"></div>
              <span class="warning-name">{{ item.type }}</span>
              <span class="warning-count">{{ item.count }}条</span>
              <div class="warning-bar-track">
                <div class="warning-bar-fill" :style="{ width: item.percentage + '%', background: item.color }"></div>
              </div>
              <span class="warning-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 近期动态 -->
    <div class="content-card">
      <div class="card-header">
        <span class="card-title">近期动态</span>
        <el-radio-group v-model="activityTab" size="small">
          <el-radio-button label="预警">预警</el-radio-button>
          <el-radio-button label="操作">操作</el-radio-button>
        </el-radio-group>
      </div>
      <el-timeline v-if="activityTab === '预警'">
        <el-timeline-item v-for="w in recentWarnings" :key="w.id" :type="w.level === '紧急' ? 'danger' : 'warning'" :timestamp="w.createTime">
          <div class="timeline-content">
            <span class="timeline-title">{{ w.residentName }} - {{ w.type }}</span>
            <p class="timeline-desc">{{ w.content }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-timeline v-else>
        <el-timeline-item v-for="(op, idx) in recentOperations" :key="idx" type="info" :timestamp="op.time">
          <div class="timeline-content">
            <span class="timeline-title">{{ op.operator }} - {{ op.action }}</span>
            <p class="timeline-desc">{{ op.content }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, User, PriceTag, Warning, CircleCheck, UserFilled, Money, HomeFilled, Calendar, Document } from '@element-plus/icons-vue'
import { residents, tags, warnings, gridWorkers } from '../../data/mock'

const activityTab = ref('预警')

// 低保统计
const dibaoTags = computed(() => tags.filter(t => t.tagType === '低保'))
const dibaoCount = computed(() => dibaoTags.value.length)
const dibaoEnjoying = computed(() => dibaoTags.value.filter(t => t.isEnjoy).length)
const dibaoPending = computed(() => dibaoTags.value.filter(t => !t.lastCheckDate).length)
const dibaoAmount = computed(() => dibaoTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

// 残疾统计
const canjiTags = computed(() => tags.filter(t => t.tagType === '残疾'))
const canjiCount = computed(() => canjiTags.value.length)
const canjiEnjoying = computed(() => canjiTags.value.filter(t => t.isEnjoy).length)
const canjiPending = computed(() => canjiTags.value.filter(t => !t.lastCheckDate).length)
const canjiAmount = computed(() => canjiTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

// 公租房统计
const gongzuTags = computed(() => tags.filter(t => t.tagType === '公租房'))
const gongzuCount = computed(() => gongzuTags.value.length)
const gongzuShiwu = computed(() => gongzuTags.value.filter(t => t.tagSubType === '实物配租').length)
const gongzuButie = computed(() => gongzuTags.value.filter(t => t.tagSubType === '租赁补贴').length)
const gongzuAmount = computed(() => gongzuTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

// 高龄统计
const gaolingTags = computed(() => tags.filter(t => t.tagType === '老年'))
const gaolingCount = computed(() => gaolingTags.value.length)
const gaoling8089 = computed(() => gaolingTags.value.filter(t => t.age >= 80 && t.age < 90).length)
const gaoling90Plus = computed(() => gaolingTags.value.filter(t => t.age >= 90).length)
const gaolingAmount = computed(() => gaolingTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

// 社保统计
const shebaoTags = computed(() => tags.filter(t => t.tagType === '社保'))
const shebaoCount = computed(() => shebaoTags.value.length)
const shebaoEnjoying = computed(() => shebaoTags.value.filter(t => t.isEnjoy).length)
const shebaoPending = computed(() => shebaoTags.value.filter(t => !t.lastCheckDate).length)
const shebaoAmount = computed(() => shebaoTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

// 计生统计
const jishengTags = computed(() => tags.filter(t => t.tagType === '计生'))
const jishengCount = computed(() => jishengTags.value.length)
const jishengEnjoying = computed(() => jishengTags.value.filter(t => t.isEnjoy).length)
const jishengPending = computed(() => jishengTags.value.filter(t => !t.lastCheckDate).length)
const jishengAmount = computed(() => jishengTags.value.reduce((sum, t) => sum + (t.subsidyAmount || 0), 0))

const totalSubsidy = computed(() => ((dibaoAmount.value + canjiAmount.value + gongzuAmount.value + gaolingAmount.value + shebaoAmount.value + jishengAmount.value) / 10000).toFixed(1))

const tagDistribution = computed(() => {
  const tagTypes = ['低保', '残疾', '公租房', '老年', '计生', '社保', '重症', '涉军', '支农返汉', '困境儿童']
  const total = tags.length
  return tagTypes.map(type => {
    const count = tags.filter(t => t.tagType === type).length
    return { type, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)
})

const warningDistribution = computed(() => {
  const typeMap = {}
  warnings.forEach(w => {
    typeMap[w.type] = (typeMap[w.type] || 0) + 1
  })
  const total = warnings.length
  const colors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#8b5cf6', '#06b6d4']
  return Object.entries(typeMap).map(([type, count], idx) => ({
    type, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[idx % colors.length]
  })).sort((a, b) => b.count - a.count)
})

const recentWarnings = computed(() => warnings.slice(0, 5))
const recentOperations = ref([
  { time: '2024-06-20 14:30', operator: '管理员', action: '处理预警', content: '李四死亡预警已核实' },
  { time: '2024-06-20 11:20', operator: '小王', action: '走访核实', content: '张三家庭走访已完成' },
  { time: '2024-06-19 16:00', operator: '小李', action: '更新信息', content: '更新赵六家庭人口信息' },
  { time: '2024-06-19 10:30', operator: '小张', action: '添加标签', content: '为王五添加高龄津贴标签' },
  { time: '2024-06-18 15:00', operator: '管理员', action: '年审提醒', content: '钱七残疾人年审提醒已处理' }
])

const getTagType = (type) => ({
  '低保': 'danger', '残疾': 'warning', '公租房': 'info', '老年': 'success', '计生': '',
  '社保': '', '重症': 'danger', '涉军': 'danger', '支农返汉': 'info', '困境儿童': 'warning'
}[type] || 'info')

const getTagColor = (type) => ({
  '低保': '#f56c6c', '残疾': '#e6a23c', '公租房': '#409eff', '老年': '#67c23a', '计生': '#8b5cf6',
  '社保': '#06b6d4', '重症': '#ef4444', '涉军': '#f97316', '支农返汉': '#3b82f6', '困境儿童': '#a855f7'
}[type] || '#6b7280')

const viewSystemDetail = (systemName) => {
  ElMessage.info(`查看${systemName}系统详情`)
}

const exportReport = () => {
  ElMessage.success('报表导出成功')
}
</script>

<style scoped>
.report-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; }
.stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
.stat-icon.blue { background: linear-gradient(135deg, #1890FF, #0ea5e9); }
.stat-icon.red { background: linear-gradient(135deg, #f56c6c, #f78989); }
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
.stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.stat-icon.cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.stat-value { font-size: 18px; font-weight: 700; color: #1f2937; display: block; }
.stat-label { font-size: 11px; color: #6b7280; }

.systems-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.system-card { background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; overflow: hidden; }
.system-header { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid #f3f4f6; }
.system-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
.system-icon.red { background: linear-gradient(135deg, #f56c6c, #f78989); }
.system-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.system-icon.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
.system-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.system-icon.blue { background: linear-gradient(135deg, #1890FF, #0ea5e9); }
.system-icon.cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.system-info { flex: 1; }
.system-name { font-size: 15px; font-weight: 600; margin: 0; }
.system-count { font-size: 12px; color: #6b7280; }
.system-body { padding: 12px 16px; }
.system-stat { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.system-stat .stat-label { font-size: 12px; color: #6b7280; }
.system-stat .stat-value { font-size: 13px; font-weight: 500; color: #1f2937; }
.system-stat .stat-value.warning { color: #e6a23c; }
.system-footer { padding: 8px 16px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; }

.charts-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
.chart-card { background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; padding: 16px; }
.chart-header { margin-bottom: 16px; }
.chart-title { font-size: 15px; font-weight: 600; color: #1f2937; margin: 0; }

.tag-distribution { display: flex; flex-direction: column; gap: 10px; }
.tag-bar-item { display: flex; align-items: center; gap: 10px; }
.tag-bar-label { display: flex; align-items: center; gap: 8px; min-width: 100px; }
.tag-bar-count { font-size: 12px; color: #6b7280; }
.tag-bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.tag-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.tag-bar-percent { font-size: 12px; color: #6b7280; min-width: 36px; text-align: right; }

.warning-distribution { display: flex; flex-direction: column; gap: 10px; }
.warning-item { display: flex; align-items: center; gap: 10px; }
.warning-dot { width: 8px; height: 8px; border-radius: 50%; }
.warning-name { font-size: 13px; color: #374151; min-width: 80px; }
.warning-count { font-size: 12px; color: #6b7280; min-width: 50px; }
.warning-bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.warning-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.warning-percent { font-size: 12px; color: #6b7280; min-width: 36px; text-align: right; }

.content-card { background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1f2937; }

.timeline-content { display: flex; flex-direction: column; gap: 4px; }
.timeline-title { font-size: 14px; font-weight: 500; color: #1f2937; }
.timeline-desc { font-size: 12px; color: #6b7280; margin: 0; }
</style>