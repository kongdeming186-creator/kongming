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

    <!-- 统计卡片 (4张) -->
    <div class="stats-grid">
      <div class="stat-card icon-blue">
        <div class="stat-left">
          <div class="stat-value">{{ residentCount }}</div>
          <div class="stat-label">居民总数</div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>本月新增5人</span>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon :size="28"><User /></el-icon>
        </div>
      </div>

      <div class="stat-card icon-orange">
        <div class="stat-left">
          <div class="stat-value">{{ insuredCount }}</div>
          <div class="stat-label">保障人口</div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>本月新增12人</span>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon :size="28"><CircleCheck /></el-icon>
        </div>
      </div>

      <div class="stat-card card-multi icon-green">
        <div class="stat-left">
          <div class="stat-value multi-main">¥{{ formatMoney(yearAmount) }}</div>
          <div class="stat-label">本年度累计发放金额</div>
          <div class="stat-sub">
            <span class="sub-label">本月发放金额</span>
            <span class="sub-value">¥{{ formatMoney(monthAmount) }}</span>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon :size="28"><Money /></el-icon>
        </div>
      </div>

      <div class="stat-card card-multi icon-purple">
        <div class="stat-left">
          <div class="stat-value multi-main">{{ pendingCheckCount }}<span class="unit"> 件</span></div>
          <div class="stat-label">待核查数</div>
          <div class="stat-sub">
            <span class="sub-label">核查完成率</span>
            <span class="sub-value">{{ checkRate }}%</span>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon :size="28"><DataBoard /></el-icon>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <!-- 左：六角亭街道平面地图 -->
      <div class="content-card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">六角亭街道社区分布</h3>
            <span class="card-subtitle">街道平面地图 · 各社区保障指标一览</span>
          </div>
          <div class="map-legend">
            <div class="legend-item"><span class="dot dot-1"></span> 居民人数</div>
            <div class="legend-item"><span class="dot dot-2"></span> 保障人数</div>
            <div class="legend-item"><span class="dot dot-3"></span> 预警数量</div>
          </div>
        </div>
        <div class="map-wrapper">
          <div class="map-container" ref="mapContainer" @click.self="closeCommunityDialog">
            <img :src="mapImage" alt="六角亭街道地图" class="map-bg" draggable="false" />

            <!-- 地图文字覆盖：刘家亭街道 → 六角亭街道 -->
            <div class="map-label-overlay">六角亭街道 | 武汉市 湖北省</div>

            <!-- 社区标记点 -->
            <div
              v-for="marker in communityMarkers"
              :key="marker.id"
              class="community-marker"
              :style="{ left: marker.x + '%', top: marker.y + '%' }"
              @click.stop="openCommunityDialog(marker)"
            >
              <div class="marker-pin" :style="{ borderColor: marker.color }">
                <div class="marker-dot" :style="{ background: marker.color }"></div>
              </div>
              <div class="marker-pulse" :style="{ borderColor: marker.color }"></div>
              <span class="marker-label" :style="{ borderColor: marker.color, color: marker.color }">{{ marker.name }}</span>
            </div>

            <!-- 社区信息弹窗 -->
            <transition name="dialog-fade">
              <div v-if="activeCommunity" class="community-dialog" :style="dialogStyle">
                <div class="dialog-header" :style="{ background: activeCommunity.color }">
                  <span class="dialog-title">{{ activeCommunity.name }}</span>
                  <el-icon class="dialog-close" @click="closeCommunityDialog"><Close /></el-icon>
                </div>
                <div class="dialog-body">
                  <!-- 统计数据：横向2列 -->
                  <div class="stat-grid">
                    <div class="stat-item">
                      <div class="stat-num">{{ activeCommunity.resident }}</div>
                      <div class="stat-label">居民人数</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-num">{{ activeCommunity.insured }}</div>
                      <div class="stat-label">保障人数</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-num" :style="{ color: activeCommunity.warn > 3 ? '#dc2626' : '#d97706' }">{{ activeCommunity.warn }} 条</div>
                      <div class="stat-label">预警数量</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-num">{{ activeCommunity.rate }}%</div>
                      <div class="stat-label">核查完成率</div>
                    </div>
                  </div>
                  <div class="dialog-tags">
                    <div class="tag-title">主要保障类型</div>
                    <div class="tag-list">
                      <el-tag v-for="t in activeCommunity.tags" :key="t" size="small" :type="getTagType(t)" effect="light">{{ t }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 右：标签分布柱状图（多口径切换） -->
      <div class="content-card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">标签分布统计</h3>
            <span class="card-subtitle">按口径展示标签人数</span>
          </div>
          <el-radio-group v-model="tagDim" size="small" class="dim-switcher">
            <el-radio-button value="community">社区口径</el-radio-button>
            <el-radio-button value="grid">网格口径</el-radio-button>
            <el-radio-button value="category">保障类别</el-radio-button>
            <el-radio-button value="special">特殊人群</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="barChartRef" class="chart chart-tall"></div>
      </div>
    </div>

    <!-- 下方预警全宽 -->
    <div class="bottom-row full-width">
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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, ArrowRight, BellFilled, CircleCheck, Money, DataBoard, Close
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { residents, warnings, tags, verifyTasks } from '../../data/mock'
import mapImage from '../../assets/images/liujiaoting-map.jpg'

const router = useRouter()

const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
})

// 统计卡指标
const residentCount = computed(() => residents.length)
const insuredCount = computed(() => {
  const set = new Set(tags.filter(t => t.isEnjoy).map(t => t.residentId))
  return set.size
})
const yearAmount = 18245680
const monthAmount = 2864320

const pendingCheckCount = computed(() => verifyTasks.filter(t => t.status !== '已完成').length)
const checkRate = computed(() => {
  const total = verifyTasks.length || 1
  const done = verifyTasks.filter(t => t.status === '已完成').length
  return Math.round((done / total) * 100)
})

const formatMoney = (v) => {
  if (!v) return '0'
  return v.toLocaleString('zh-CN')
}

// 待处理预警
const pendingWarnings = computed(() => warnings.filter(w => w.status === '待处理').slice(0, 6))

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

const getWarningClass = (level) => level === '紧急' ? 'icon-danger' : 'icon-warning'
const formatTime = (time) => !time ? '' : (time.split(' ')[1]?.substring(0, 5) || time)

// 地图社区标记点（百分比定位）
const communityMarkers = [
  { id: 0, name: '学堂社区', x: 18, y: 28, color: '#1e40af', resident: '2,584', insured: '482', warn: 4, rate: 92, tags: ['低保', '高龄津贴', '残疾两项'] },
  { id: 1, name: '荣东社区', x: 72, y: 25, color: '#15803d', resident: '2,316', insured: '428', warn: 3, rate: 88, tags: ['低保', '高龄津贴', '公租房'] },
  { id: 2, name: '六角社区', x: 80, y: 58, color: '#b45309', resident: '2,148', insured: '412', warn: 5, rate: 90, tags: ['低保', '特困', '高龄津贴'] },
  { id: 3, name: '由义社区', x: 50, y: 75, color: '#6d28d9', resident: '1,956', insured: '356', warn: 2, rate: 95, tags: ['低保', '残疾两项', '社保'] },
  { id: 4, name: '民意社区', x: 75, y: 85, color: '#b91c1c', resident: '1,816', insured: '324', warn: 3, rate: 91, tags: ['低保', '高龄津贴', '困境儿童'] }
]

const activeCommunity = ref(null)
const mapContainer = ref(null)

const openCommunityDialog = (marker) => {
  activeCommunity.value = marker
}
const closeCommunityDialog = () => {
  activeCommunity.value = null
}

const dialogStyle = computed(() => {
  if (!activeCommunity.value) return {}
  const marker = activeCommunity.value
  const dialogW = 320
  const dialogH = 340
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 基于标记点位置 + 偏移计算弹窗位置（优先显示在标记点右侧或左侧）
  let left = 0
  let top = 0

  // 获取标记点在视口中的位置（根据容器和百分比估算）
  if (mapContainer.value) {
    const rect = mapContainer.value.getBoundingClientRect()
    const mx = rect.left + (marker.x / 100) * rect.width
    const my = rect.top + (marker.y / 100) * rect.height
    // 优先显示在标记点右侧，空间不够则左侧
    if (mx + dialogW + 24 < vw) {
      left = mx + 20
    } else {
      left = mx - dialogW - 20
    }
    // 垂直方向居中对齐标记点，并确保不越界
    top = my - 80
    if (top < 20) top = 20
    if (top + dialogH > vh - 20) top = vh - dialogH - 20
    if (left < 20) left = 20
    if (left + dialogW > vw - 20) left = vw - dialogW - 20
  }
  return { left: left + 'px', top: top + 'px' }
})

const getTagType = (tag) => {
  const map = { '低保': 'danger', '残疾': 'warning', '公租房': 'info', '老年': 'success', '计生': '', '社保': '', '重症': 'danger', '涉军': 'danger', '支农返汉': 'info', '困境儿童': 'warning', '特困': 'info', '高龄津贴': 'success', '残疾两项': 'warning' }
  return map[tag] || 'info'
}

// 柱状图
const tagDim = ref('community')
const barChartRef = ref(null)
let barChart = null

const dimData = {
  community: {
    xData: ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区'],
    series: [
      { name: '低保', data: [156, 138, 130, 112, 104], color: '#1e40af' },
      { name: '特困', data: [42, 36, 34, 28, 26], color: '#3b82f6' },
      { name: '高龄津贴', data: [226, 204, 188, 172, 158], color: '#15803d' },
      { name: '残疾两项', data: [58, 50, 60, 44, 36], color: '#b45309' }
    ]
  },
  grid: {
    xData: ['第001网格', '第002网格', '第003网格', '第004网格', '第005网格', '第006网格', '第007网格'],
    series: [
      { name: '低保', data: [86, 78, 72, 64, 56, 48, 42], color: '#1e40af' },
      { name: '特困', data: [24, 20, 18, 16, 14, 12, 10], color: '#3b82f6' },
      { name: '高龄津贴', data: [138, 126, 118, 104, 94, 86, 78], color: '#15803d' },
      { name: '残疾两项', data: [42, 36, 32, 28, 24, 20, 16], color: '#b45309' }
    ]
  },
  category: {
    xData: ['低保', '特困供养', '高龄津贴', '残疾护理', '残疾生活', '公租房', '4050就业', '计生特扶'],
    series: [
      { name: '在享人数', data: [670, 176, 1174, 184, 268, 132, 308, 56], color: '#1e40af' }
    ]
  },
  special: {
    xData: ['高龄老人', '独居老人', '残疾人', '涉毒人员', '孤儿', '精神障碍', '困境儿童', '优抚对象'],
    series: [
      { name: '特殊人群标签数', data: [1284, 342, 452, 68, 24, 126, 96, 148], color: '#15803d' }
    ]
  }
}

const initBarChart = () => {
  if (!barChartRef.value) return
  if (!barChart) barChart = echarts.init(barChartRef.value)
  const conf = dimData[tagDim.value]
  const series = conf.series.map(s => ({
    name: s.name,
    type: 'bar',
    stack: tagDim.value === 'community' || tagDim.value === 'grid' ? 'total' : null,
    barMaxWidth: 34,
    itemStyle: { color: s.color, borderRadius: conf.series.length === 1 ? [4, 4, 0, 0] : (s === conf.series[conf.series.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]) },
    emphasis: { focus: 'series' },
    data: s.data
  }))
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      show: conf.series.length > 1,
      top: 0,
      right: 0,
      itemWidth: 10, itemHeight: 10,
      textStyle: { color: '#64748b', fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: conf.series.length > 1 ? '18%' : '6%', containLabel: true },
    xAxis: {
      type: 'category',
      data: conf.xData,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 11, interval: 0, rotate: tagDim.value === 'community' ? 18 : 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series
  }, true)
}

watch(tagDim, () => nextTick(initBarChart))

onMounted(() => {
  initBarChart()
  window.addEventListener('resize', () => barChart && barChart.resize())
})
</script>

<style scoped>
.dashboard-page { padding: 0; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}
.page-title-wrapper { flex: 1; }
.page-title {
  font-size: 22px; font-weight: 600; color: #1f2937;
  margin: 0 0 4px 0;
}
.page-subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
.update-time { font-size: 12px; color: #94a3b8; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 108px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  right: -18px;
  top: -18px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: currentColor;
  opacity: .05;
  pointer-events: none;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
.stat-card.icon-blue { color: #1e40af; }
.stat-card.icon-orange { color: #d97706; }
.stat-card.icon-green { color: #15803d; }
.stat-card.icon-purple { color: #6d28d9; }

.stat-left { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; min-height: 72px; gap: 4px; }
.stat-value {
  font-size: 30px; font-weight: 700; color: #1e293b;
  line-height: 1.2; font-variant-numeric: tabular-nums;
  margin: 0;
}
.stat-value .unit { font-size: 14px; font-weight: 500; color: #64748b; margin-left: 2px; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }

.stat-trend {
  display: inline-flex; align-items: center; gap: 3px; align-self: flex-start;
  font-size: 12px; margin-top: 4px; font-weight: 600;
  padding: 2px 8px; border-radius: 20px;
  background: rgba(30, 64, 175, 0.08);
}
.stat-trend.up { color: #1e40af; background: rgba(30, 64, 175, 0.08); }
.stat-trend.down { color: #b91c1c; background: rgba(185, 28, 28, 0.08); }

.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0; margin-left: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.icon-blue .stat-icon { background: linear-gradient(135deg, #1e40af, #3b82f6); }
.icon-orange .stat-icon { background: linear-gradient(135deg, #d97706, #f59e0b); }
.icon-green .stat-icon { background: linear-gradient(135deg, #15803d, #22c55e); }
.icon-purple .stat-icon { background: linear-gradient(135deg, #6d28d9, #a855f7); }

.card-multi .stat-left { gap: 2px; }
.card-multi .stat-sub {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-multi .sub-label { font-size: 12px; color: #94a3b8; }
.card-multi .sub-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}
.card-multi .multi-main { color: #1e40af; }

.chart-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}
.content-card {
  background: #fff;
  border-radius: 4px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.card-title-wrapper { flex: 1; }
.card-title {
  font-size: 16px; font-weight: 600; color: #1f2937;
  margin: 0 0 2px 0;
}
.card-subtitle { font-size: 12px; color: #94a3b8; }

.view-all {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: #1e40af; text-decoration: none;
}

.chart-card { min-height: 340px; display: flex; flex-direction: column; }
.chart { width: 100%; height: 240px; }
.chart-tall { height: 300px; flex: 1; min-height: 260px; }

/* 地图 */
.map-wrapper {
  width: 100%;
  position: static;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f8fafc;
}
.street-map { width: 100%; height: auto; display: block; }

.map-container {
  width: 100%;
  position: relative;
  background: #f8fafc;
  overflow: visible;
}
.map-bg {
  width: 100%;
  display: block;
  border-radius: 4px;
  pointer-events: none;
}

/* 地图文字覆盖层 */
.map-label-overlay {
  position: absolute;
  top: 2%;
  left: 2%;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  z-index: 10;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 社区标记点 */
.community-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  z-index: 5;
}
.marker-pin {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.marker-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.community-marker:hover .marker-pin {
  transform: scale(1.3);
}
.marker-pulse {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid;
  animation: pulse 1.8s ease-out infinite;
  z-index: 1;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.8); opacity: 0; }
}
.marker-label {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  border: 1px solid;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

/* 社区弹窗 */
.community-dialog {
  position: fixed;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.22);
  z-index: 9999;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}
.dialog-header {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  flex-shrink: 0;
}
.dialog-title {
  font-size: 15px;
  font-weight: 700;
}
.dialog-close {
  cursor: pointer;
  font-size: 16px;
  opacity: 0.85;
  transition: opacity 0.2s, transform 0.2s;
}
.dialog-close:hover { opacity: 1; transform: scale(1.15); }
.dialog-body {
  padding: 14px;
  overflow-y: auto;
  flex: 1;
}
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.stat-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 8px;
  text-align: center;
}
.stat-item .stat-num {
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  line-height: 1.3;
}
.stat-item .stat-label {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
.dialog-tags {
  margin: 6px 0 10px;
}
.tag-title {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.map-legend {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #64748b;
  align-items: center;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-item .dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
}
.dot-1 { background: #1e40af; }
.dot-2 { background: #15803d; }
.dot-3 { background: #d97706; }

.dim-switcher :deep(.el-radio-button__inner) {
  padding: 6px 10px;
  font-size: 12px;
}

.bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bottom-row.full-width { grid-template-columns: 1fr; }

.warning-list { display: flex; flex-direction: column; gap: 10px; }
.warning-item {
  display: flex; gap: 12px; padding: 12px;
  background: #f8fafc; border-radius: 4px;
  border: 1px solid #f1f5f9;
}
.warning-icon {
  width: 36px; height: 36px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.icon-danger { background: #fef2f2; color: #b91c1c; }
.icon-warning { background: #fffbeb; color: #d97706; }
.warning-content { flex: 1; min-width: 0; }
.warning-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px;
}
.warning-time { font-size: 12px; color: #94a3b8; }
.warning-text {
  font-size: 13px; color: #374151;
  margin-bottom: 4px; line-height: 1.5;
}
.warning-footer {
  display: flex; justify-content: space-between;
  align-items: center; font-size: 12px; color: #64748b;
}
.warning-level { font-weight: 500; }
.warning-level.danger { color: #b91c1c; }
.warning-level.warning { color: #d97706; }

.warning-actions {
  display: flex; flex-direction: column; gap: 6px;
  flex-shrink: 0;
}
.empty-list {
  text-align: center; padding: 40px 20px;
  color: #94a3b8; font-size: 13px;
}
</style>
