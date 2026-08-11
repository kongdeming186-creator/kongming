<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">数据概览</h2>
        <p class="page-subtitle">欢迎使用智汇亭</p>
      </div>
      <div class="header-info">
        <span class="update-time">数据更新时间：{{ currentTime }}</span>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in statCards" :key="index">
        <div class="stat-left">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trendType">
            <el-icon><TrendCharts v-if="stat.trendType === 'up'" /><Bottom v-else /></el-icon>
            <span>{{ stat.trendText }}</span>
          </div>
        </div>
        <div class="stat-icon" :class="stat.iconClass">
          <el-icon :size="30"><component :is="stat.icon" /></el-icon>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-row">
      <div class="content-card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">预警趋势</h3>
            <span class="card-subtitle">近7天预警数据变化</span>
          </div>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="chartRef" class="chart"></div>
      </div>
      
      <div class="content-card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">标签分布</h3>
            <span class="card-subtitle">居民标签类型统计</span>
          </div>
        </div>
        <div ref="pieChartRef" class="chart"></div>
      </div>
    </div>
    
    <!-- 下方预警全宽 -->
    <div class="bottom-row full-width">
      <!-- 最新预警 -->
      <div class="content-card warning-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">待处理预警</h3>
            <span class="card-subtitle">共 {{ pendingWarnings.length }} 条待处理</span>
          </div>
          <router-link to="/warning" class="view-all">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="warning-list">
          <div v-for="warning in pendingWarnings" :key="warning.id" class="warning-item">
            <div class="warning-icon" :class="getWarningClass(warning.level)">
              <el-icon><BellFilled /></el-icon>
            </div>
            <div class="warning-content">
              <div class="warning-top">
                <el-tag :type="getWarningType(warning.warningType)" size="small" effect="light">
                  {{ warning.warningType }}
                </el-tag>
                <span class="warning-time">{{ formatTime(warning.createTime) }}</span>
              </div>
              <div class="warning-text">{{ warning.content }}</div>
              <div class="warning-footer">
                <span>涉及居民：{{ warning.residentName }}</span>
                <span class="warning-level" :class="warning.level === '紧急' ? 'danger' : 'warning'">
                  {{ warning.level }}
                </span>
              </div>
            </div>
            <div class="warning-actions">
              <el-button type="primary" size="small">处理</el-button>
              <el-button size="small">忽略</el-button>
            </div>
          </div>
          <div v-if="pendingWarnings.length === 0" class="empty-list">
            暂无待处理预警
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  User, Warning, PieChart, TrendCharts, Bottom, 
  ArrowRight, Place, BellFilled, Plus 
} from '@element-plus/icons-vue'
import { residents, warnings, tags, gridWorkers } from '../../data/mock'

const router = useRouter()
const chartPeriod = ref('week')

const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const statCards = computed(() => [
  {
    label: '居民总数',
    value: residents.length,
    icon: User,
    iconClass: 'icon-blue',
    trendType: 'up',
    trendText: '本月新增5人'
  },
  {
    label: '待处理预警',
    value: warnings.filter(w => w.status === '待处理').length,
    icon: Warning,
    iconClass: 'icon-orange',
    trendType: 'up',
    trendText: '较昨日+2'
  },
  {
    label: '享受中标签',
    value: tags.filter(t => t.isEnjoy).length,
    icon: BellFilled,
    iconClass: 'icon-green',
    trendType: 'up',
    trendText: '本月新增3个'
  },
  {
    label: '标签总数',
    value: tags.length,
    icon: PieChart,
    iconClass: 'icon-purple',
    trendType: 'up',
    trendText: '本月新增8个'
  },
  {
    label: '网格员总数',
    value: gridWorkers.length,
    icon: User,
    iconClass: 'icon-cyan',
    trendType: 'up',
    trendText: '本月新增1人'
  },
  {
    label: '考核合格率',
    value: `${Math.round((gridWorkers.filter(g => g.assessmentStatus !== '不合格').length / gridWorkers.length) * 100)}%`,
    icon: PieChart,
    iconClass: 'icon-teal',
    trendType: 'up',
    trendText: '较上月+5%'
  }
])

const pendingWarnings = computed(() => warnings.filter(w => w.status === '待处理').slice(0, 6))

const chartRef = ref(null)
const pieChartRef = ref(null)

const getWarningType = (type) => {
  const map = {
    '状态不一致': 'danger',
    '到龄提醒': 'warning',
    '政策符合通知': 'success',
    '政策到期提醒': 'warning',
    '政策互斥': 'danger'
  }
  return map[type] || 'info'
}

const getWarningClass = (level) => {
  return level === '紧急' ? 'icon-danger' : 'icon-warning'
}

const formatTime = (time) => {
  if (!time) return ''
  return time.split(' ')[1]?.substring(0, 5) || time
}

const initLineChart = () => {
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['6/18', '6/19', '6/20', '6/21', '6/22', '6/23', '6/24'],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [{
      name: '预警数量',
      type: 'line',
      data: [3, 5, 2, 4, 6, 5, 4],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(30, 64, 175, 0.15)' },
          { offset: 1, color: 'rgba(30, 64, 175, 0.02)' }
        ])
      },
      lineStyle: { color: '#1e40af', width: 2.5 },
      itemStyle: { color: '#1e40af', borderWidth: 2, borderColor: '#fff' }
    }]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  
  const tagStats = {}
  tags.forEach(t => {
    tagStats[t.tagType] = (tagStats[t.tagType] || 0) + 1
  })
  const pieData = Object.entries(tagStats).map(([name, value]) => ({ name, value }))
  
  chart.setOption({
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#64748b', fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 2,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: false }
      },
      labelLine: { show: false },
      data: pieData,
      color: ['#1e40af', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
    }]
  })
}

onMounted(() => {
  initLineChart()
  initPieChart()
})
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.page-title-wrapper {
  flex: 1;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.update-time {
  font-size: 12px;
  color: #94a3b8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
}

.stat-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.stat-left {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  margin-top: 8px;
  font-weight: 500;
}

.stat-trend.up {
  color: #1e40af;
}

.stat-trend.down {
  color: #b91c1c;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.icon-blue { background: #1e40af; }
.icon-orange { background: #d97706; }
.icon-green { background: #1e3a8a; }
.icon-purple { background: #1e40af; }
.icon-cyan { background: #1e3a8a; }
.icon-teal { background: #1e40af; }

.chart-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.content-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title-wrapper {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.card-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #1e40af;
  text-decoration: none;
  transition: all 0.2s;
}

.view-all:hover {
  color: #1e3a8a;
}

.chart-card {
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 240px;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #f1f5f9;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
}

.task-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.task-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.avatar-danger { background: #b91c1c; }
.avatar-warning { background: #d97706; }

.task-content {
  flex: 1;
  min-width: 0;
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}

.task-item:hover .task-arrow {
  color: #1e40af;
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 13px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.warning-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid #f1f5f9;
}

.warning-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.warning-icon {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.icon-danger {
  background: #fef2f2;
  color: #b91c1c;
}

.icon-warning {
  background: #fffbeb;
  color: #d97706;
}

.warning-content {
  flex: 1;
  min-width: 0;
}

.warning-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.warning-time {
  font-size: 12px;
  color: #94a3b8;
}

.warning-text {
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
  line-height: 1.5;
}

.warning-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
}

.warning-level {
  font-weight: 500;
}

.warning-level.danger { color: #b91c1c; }
.warning-level.warning { color: #d97706; }

.bottom-row.full-width {
  grid-template-columns: 1fr;
}

.warning-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
</style>
