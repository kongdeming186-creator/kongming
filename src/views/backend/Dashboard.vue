<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div class="page-eyebrow">首页 / 数据概览</div>
      <h2 class="page-title">
        数据概览
        <span class="page-title-sub">居民保障与核查工作台</span>
      </h2>
    </div>

    <!-- KPI 指标卡 -->
    <div class="stats-grid">
      <div class="stat-card tone-blue">
        <div class="stat-accent"></div>
        <div class="stat-main">
          <div class="stat-head">
            <span class="stat-label">居民总数</span>
            <span class="stat-trend tone-up"><el-icon><TrendCharts /></el-icon>本月+5</span>
          </div>
          <div class="stat-value-row">
            <span class="stat-value">{{ residentCount }}</span>
            <span class="stat-unit">人</span>
          </div>
          <div class="stat-foot">
            <div class="foot-chip"><b>{{ historyCount }}</b><span>历史居民人数</span></div>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
      </div>

      <div class="stat-card tone-orange">
        <div class="stat-accent"></div>
        <div class="stat-main">
          <div class="stat-head">
            <span class="stat-label">保障人口</span>
            <span class="stat-trend tone-up"><el-icon><TrendCharts /></el-icon>本月+12</span>
          </div>
          <div class="stat-value-row">
            <span class="stat-value">{{ insuredCount }}</span>
            <span class="stat-unit">人</span>
          </div>
          <div class="stat-foot">
            <div class="foot-chip foot-chip-wide"><b>{{ (insuredCount / (residentCount || 1) * 100).toFixed(1) }}%</b><span>覆盖率</span></div>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
      </div>

      <div class="stat-card tone-green">
        <div class="stat-accent"></div>
        <div class="stat-main">
          <div class="stat-head">
            <span class="stat-label">年度累计发放</span>
            <span class="stat-trend tone-flat">2026 年度</span>
          </div>
          <div class="stat-value-row">
            <span class="stat-currency">¥</span>
            <span class="stat-value">{{ formatMoney(yearAmount) }}</span>
          </div>
          <div class="stat-foot">
            <div class="foot-chip foot-chip-wide">
              <span>本月发放</span>
              <b>¥{{ formatMoney(monthAmount) }}</b>
            </div>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
      </div>

      <div class="stat-card tone-purple">
        <div class="stat-accent"></div>
        <div class="stat-main">
          <div class="stat-head">
            <span class="stat-label">待核查任务</span>
            <span class="stat-trend tone-warn">需尽快处理</span>
          </div>
          <div class="stat-value-row">
            <span class="stat-value">{{ pendingCheckCount }}</span>
            <span class="stat-unit">件</span>
          </div>
          <div class="stat-foot">
            <div class="foot-chip"><b>{{ checkRate }}%</b><span>核查完成率</span></div>
            <div class="foot-chip foot-chip-right"><b>{{ doneCheckCount }}</b><span>已完成</span></div>
          </div>
        </div>
        <div class="stat-icon">
          <el-icon><DataBoard /></el-icon>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <!-- 左：六角亭街道社区分布地图 -->
      <div class="content-card map-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <h3 class="card-title">六角亭街道社区分布</h3>
            <span class="card-subtitle">点击社区标签查看详情</span>
          </div>
          <div class="map-legend">
            <div class="legend-item" v-for="m in communityMarkers" :key="m.id" @click="openCommunityDialog(m)">
              <span class="legend-dot" :style="{ background: m.color }"></span>
              {{ m.name }}
            </div>
          </div>
        </div>
        <div class="map-wrapper">
          <div class="map-container" ref="mapContainer" @click.self="closeCommunityDialog">
            <img :src="mapImage" alt="六角亭街道地图" class="map-bg" draggable="false" />

            <!-- 社区名称标签（可点击） -->
            <div
              v-for="marker in communityMarkers"
              :key="'label-' + marker.id"
              class="community-label"
              :class="{ active: activeCommunity?.id === marker.id }"
              :style="{
                left: marker.x + '%',
                top: marker.y + '%',
                '--label-color': marker.color
              }"
              @click.stop="openCommunityDialog(marker)"
            >
              <div class="label-badge" :style="{ background: marker.color }">
                <span class="label-name">{{ marker.name }}</span>
              </div>
              <div class="label-pointer"></div>
              <div class="label-pulse" :style="{ borderColor: marker.color }"></div>
            </div>

            <!-- 社区详情弹窗 -->
            <transition name="dialog-fade">
              <div v-if="activeCommunity" class="community-dialog" :style="dialogStyle">
                <div class="dialog-header" :style="{ background: activeCommunity.color }">
                  <div class="dialog-header-left">
                    <span class="dialog-title">{{ activeCommunity.name }}</span>
                    <span class="dialog-subtitle">{{ activeCommunity.subtitle }}</span>
                  </div>
                  <el-icon class="dialog-close" @click="closeCommunityDialog"><Close /></el-icon>
                </div>
                <div class="dialog-body">
                  <!-- 核心指标 -->
                  <div class="dialog-kpi">
                    <div class="dialog-kpi-item">
                      <div class="dialog-kpi-value">{{ activeCommunity.resident }}</div>
                      <div class="dialog-kpi-label">居民人数</div>
                    </div>
                    <div class="dialog-kpi-item">
                      <div class="dialog-kpi-value">{{ activeCommunity.insured }}</div>
                      <div class="dialog-kpi-label">保障人数</div>
                    </div>
                    <div class="dialog-kpi-item warn">
                      <div class="dialog-kpi-value">{{ activeCommunity.warn }}</div>
                      <div class="dialog-kpi-label">预警数量</div>
                    </div>
                    <div class="dialog-kpi-item">
                      <div class="dialog-kpi-value">{{ activeCommunity.rate }}%</div>
                      <div class="dialog-kpi-label">核查完成率</div>
                    </div>
                  </div>

                  <!-- 网格分布 -->
                  <div class="dialog-section" v-if="activeCommunity.grids">
                    <div class="dialog-section-title">
                      <span class="section-bar" :style="{ background: activeCommunity.color }"></span>
                      下属网格
                    </div>
                    <div class="dialog-grid-list">
                      <div v-for="g in activeCommunity.grids" :key="g.name" class="grid-item">
                        <div class="grid-name">{{ g.name }}</div>
                        <div class="grid-meta">
                          <span>{{ g.resident }}人</span>
                          <span>{{ g.insured }}保障</span>
                          <span v-if="g.warn" class="grid-warn">{{ g.warn }}预警</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 主要保障类型 -->
                  <div class="dialog-section">
                    <div class="dialog-section-title">
                      <span class="section-bar" :style="{ background: activeCommunity.color }"></span>
                      主要保障类型
                    </div>
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

      <!-- 右：标签分布统计 -->
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

        <!-- 网格口径：按社区分组切换 -->
        <div v-if="tagDim === 'grid'" class="grid-community-tabs">
          <div
            v-for="c in gridCommunities"
            :key="c.id"
            class="grid-com-tab"
            :class="{ active: gridCommunity === c.id }"
            :style="{ color: gridCommunity === c.id ? c.color : undefined, borderColor: gridCommunity === c.id ? c.color : undefined }"
            @click="gridCommunity = c.id"
          >
            <span class="grid-com-dot" :style="{ background: c.color }"></span>
            {{ c.name }}
            <span class="grid-com-cnt">{{ c.gridCount }}个网格</span>
          </div>
        </div>

        <!-- 社区/网格口径：双图并排 -->
        <div v-show="tagDim === 'community' || tagDim === 'grid'" class="chart-dual">
          <div class="chart-dual-item">
            <div class="chart-subtitle">保障类别分布</div>
            <div ref="barChartRef" class="chart chart-tall chart-half" :class="{ 'chart-shorter': tagDim === 'grid' }"></div>
          </div>
          <div class="chart-dual-item">
            <div class="chart-subtitle">特殊人群标签分布</div>
            <div ref="specialChartRef" class="chart chart-tall chart-half" :class="{ 'chart-shorter': tagDim === 'grid' }"></div>
          </div>
        </div>

        <!-- 保障类别/特殊人群口径：单图 -->
        <div v-show="tagDim === 'category' || tagDim === 'special'" class="chart-single-wrap">
          <div ref="barChartSingleRef" class="chart chart-tall"></div>
        </div>
      </div>
    </div>

    <!-- 底部：社区数据快览 -->
    <div class="content-card community-overview">
      <div class="card-header">
        <div class="card-title-wrapper">
          <h3 class="card-title">社区数据快览</h3>
          <span class="card-subtitle">各社区核心指标对比</span>
        </div>
      </div>
      <div class="community-cards">
        <div
          v-for="m in communityMarkers"
          :key="'card-' + m.id"
          class="community-card"
          :style="{ '--card-color': m.color }"
          @click="openCommunityDialog(m)"
        >
          <div class="cc-header">
            <span class="cc-dot" :style="{ background: m.color }"></span>
            <span class="cc-name">{{ m.name }}</span>
          </div>
          <div class="cc-body">
            <div class="cc-row">
              <span class="cc-label">居民</span>
              <span class="cc-value">{{ m.resident }}</span>
            </div>
            <div class="cc-row">
              <span class="cc-label">保障</span>
              <span class="cc-value">{{ m.insured }}</span>
            </div>
            <div class="cc-row">
              <span class="cc-label">预警</span>
              <span class="cc-value" :class="{ warn: m.warn > 3 }">{{ m.warn }}条</span>
            </div>
          </div>
          <div class="cc-action">查看详情 →</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, CircleCheck, Money, DataBoard, Close
} from '@element-plus/icons-vue'
import { residents, tags, verifyTasks } from '../../data/mock'
import mapImage from '../../assets/images/liujiaoting-map-v4.png'

// 统计卡指标
const residentCount = computed(() => residents.filter(r => !r.isHistorical && r.survivalStatus !== '已去世').length)
const historyCount = computed(() => residents.filter(r => r.isHistorical || r.survivalStatus === '已去世').length)
const insuredCount = computed(() => {
  const set = new Set(tags.filter(t => t.isEnjoy).map(t => t.residentId))
  return set.size
})
const yearAmount = 18245680
const monthAmount = 2864320

const pendingCheckCount = computed(() => verifyTasks.filter(t => t.status !== '已完成').length)
const doneCheckCount = computed(() => verifyTasks.filter(t => t.status === '已完成').length)
const tagCount = computed(() => tags.filter(t => t.isEnjoy).length)
const checkRate = computed(() => {
  const total = verifyTasks.length || 1
  const done = verifyTasks.filter(t => t.status === '已完成').length
  return Math.round((done / total) * 100)
})

const formatMoney = (v) => {
  if (!v) return '0'
  return v.toLocaleString('zh-CN')
}

// 社区网格数据
const communityGridData = {
  0: [ // 学堂社区
    { name: '学堂01网格', resident: 1380, insured: 162, warn: 1 },
    { name: '学堂02网格', resident: 1342, insured: 158, warn: 2 },
    { name: '学堂03网格', resident: 1345, insured: 162, warn: 1 }
  ],
  1: [ // 荣东社区
    { name: '荣东01网格', resident: 1420, insured: 145, warn: 1 },
    { name: '荣东02网格', resident: 1436, insured: 142, warn: 1 },
    { name: '荣东03网格', resident: 1435, insured: 141, warn: 1 }
  ],
  2: [ // 六角社区
    { name: '六角01网格', resident: 2980, insured: 208, warn: 3 },
    { name: '六角02网格', resident: 2993, insured: 204, warn: 2 }
  ],
  3: [ // 由义社区
    { name: '由义01网格', resident: 2890, insured: 185, warn: 1 },
    { name: '由义02网格', resident: 2760, insured: 171, warn: 1 }
  ],
  4: [ // 民意社区
    { name: '民意01网格', resident: 2750, insured: 162, warn: 2 },
    { name: '民意02网格', resident: 2641, insured: 162, warn: 1 }
  ]
}

// 地图社区标记点
const communityMarkers = [
  {
    id: 0, name: '学堂社区', subtitle: '3个网格',
    x: 25, y: 85, color: '#1e40af',
    resident: '4,067', insured: '482', warn: 4, rate: 92,
    tags: ['低保', '高龄津贴', '残疾两项'],
    grids: communityGridData[0]
  },
  {
    id: 1, name: '荣东社区', subtitle: '3个网格',
    x: 18, y: 48, color: '#15803d',
    resident: '4,291', insured: '428', warn: 3, rate: 88,
    tags: ['低保', '高龄津贴', '公租房'],
    grids: communityGridData[1]
  },
  {
    id: 2, name: '六角社区', subtitle: '2个网格',
    x: 72, y: 35, color: '#b45309',
    resident: '5,973', insured: '412', warn: 5, rate: 90,
    tags: ['低保', '特困', '高龄津贴'],
    grids: communityGridData[2]
  },
  {
    id: 3, name: '由义社区', subtitle: '2个网格',
    x: 42, y: 62, color: '#6d28d9',
    resident: '5,650', insured: '356', warn: 2, rate: 95,
    tags: ['低保', '残疾两项', '社保'],
    grids: communityGridData[3]
  },
  {
    id: 4, name: '民意社区', subtitle: '2个网格',
    x: 58, y: 75, color: '#b91c1c',
    resident: '5,391', insured: '324', warn: 3, rate: 91,
    tags: ['低保', '高龄津贴', '困境儿童'],
    grids: communityGridData[4]
  }
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
  const dialogW = 340
  const dialogH = 400
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = 0
  let top = 0

  if (mapContainer.value) {
    const rect = mapContainer.value.getBoundingClientRect()
    const mx = rect.left + (marker.x / 100) * rect.width
    const my = rect.top + (marker.y / 100) * rect.height
    if (mx + dialogW + 24 < vw) {
      left = mx + 24
    } else {
      left = mx - dialogW - 24
    }
    top = my - dialogH / 2
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
const gridCommunity = ref(0)
const barChartRef = ref(null)
const specialChartRef = ref(null)
const barChartSingleRef = ref(null)
let barChart = null
let specialChart = null
let barChartSingle = null

const gridCommunities = [
  { id: 0, name: '学堂社区', color: '#1e40af', gridCount: 3 },
  { id: 1, name: '荣东社区', color: '#15803d', gridCount: 3 },
  { id: 2, name: '六角社区', color: '#b45309', gridCount: 2 },
  { id: 3, name: '由义社区', color: '#6d28d9', gridCount: 2 },
  { id: 4, name: '民意社区', color: '#b91c1c', gridCount: 2 }
]

const tagSeriesTemplate = (c) => ([
  { name: '低保', data: c.lowIncome, color: '#1e40af' },
  { name: '残疾', data: c.disabled, color: '#b45309' },
  { name: '公租房', data: c.publicHousing, color: '#3b82f6' },
  { name: '老年', data: c.elderly, color: '#15803d' },
  { name: '计生', data: c.familyPlan, color: '#64748b' },
  { name: '社保', data: c.socialIns, color: '#6d28d9' },
  { name: '困境儿童', data: c.children, color: '#d97706' }
])

const dimData = {
  community: {
    xData: ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区'],
    series: [
      { name: '低保', data: [156, 138, 130, 112, 104], color: '#1e40af' },
      { name: '残疾', data: [72, 64, 76, 56, 48], color: '#b45309' },
      { name: '公租房', data: [38, 32, 30, 26, 22], color: '#3b82f6' },
      { name: '老年', data: [226, 204, 188, 172, 158], color: '#15803d' },
      { name: '计生', data: [24, 20, 18, 16, 14], color: '#64748b' },
      { name: '社保', data: [58, 52, 48, 44, 40], color: '#6d28d9' },
      { name: '困境儿童', data: [18, 16, 14, 12, 10], color: '#d97706' }
    ]
  },
  0: { xData: ['学堂01网格', '学堂02网格', '学堂03网格'], series: tagSeriesTemplate({ lowIncome:[58, 54, 44], disabled:[26, 24, 22], publicHousing:[14, 12, 12], elderly:[82, 76, 68], familyPlan:[8, 8, 8], socialIns:[22, 18, 18], children:[6, 6, 6] }) },
  1: { xData: ['荣东01网格', '荣东02网格', '荣东03网格'], series: tagSeriesTemplate({ lowIncome:[50, 46, 42], disabled:[22, 22, 20], publicHousing:[12, 10, 10], elderly:[72, 68, 64], familyPlan:[6, 8, 6], socialIns:[18, 18, 16], children:[6, 6, 4] }) },
  2: { xData: ['六角01网格', '六角02网格'],         series: tagSeriesTemplate({ lowIncome:[68, 62],    disabled:[40, 36],    publicHousing:[16, 14],    elderly:[96, 92],    familyPlan:[10, 8],    socialIns:[26, 22],    children:[8, 6] }) },
  3: { xData: ['由义01网格', '由义02网格'],         series: tagSeriesTemplate({ lowIncome:[58, 54],    disabled:[30, 26],    publicHousing:[14, 12],    elderly:[88, 84],    familyPlan:[8, 8],     socialIns:[22, 22],    children:[6, 6] }) },
  4: { xData: ['民意01网格', '民意02网格'],         series: tagSeriesTemplate({ lowIncome:[54, 50],    disabled:[26, 22],    publicHousing:[12, 10],    elderly:[80, 78],    familyPlan:[8, 6],     socialIns:[22, 18],    children:[6, 4] }) },
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

const currentDimConf = computed(() => {
  if (tagDim.value === 'grid') return dimData[gridCommunity.value]
  return dimData[tagDim.value]
})

// 特殊人群图表数据
const specialGroupSeriesTemplate = (c) => ([
  { name: '高龄老人', data: c.elderly, color: '#f59e0b' },
  { name: '独居老人', data: c.livingAlone, color: '#3b82f6' },
  { name: '残疾人', data: c.disabled, color: '#8b5cf6' },
  { name: '涉毒人员', data: c.drug, color: '#ef4444' },
  { name: '孤儿', data: c.orphan, color: '#ec4899' },
  { name: '精神障碍', data: c.mental, color: '#6366f1' },
  { name: '困境儿童', data: c.children, color: '#d97706' },
  { name: '优抚对象', data: c.priority, color: '#10b981' }
])

const specialGroupData = {
  community: {
    xData: ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区'],
    series: [
      { name: '高龄老人', data: [82, 74, 88, 70, 76], color: '#f59e0b' },
      { name: '独居老人', data: [26, 22, 28, 20, 24], color: '#3b82f6' },
      { name: '残疾人', data: [52, 46, 58, 42, 48], color: '#8b5cf6' },
      { name: '涉毒人员', data: [8, 6, 10, 5, 7], color: '#ef4444' },
      { name: '孤儿', data: [4, 3, 5, 3, 4], color: '#ec4899' },
      { name: '精神障碍', data: [14, 12, 16, 10, 14], color: '#6366f1' },
      { name: '困境儿童', data: [12, 10, 14, 8, 12], color: '#d97706' },
      { name: '优抚对象', data: [18, 16, 20, 14, 16], color: '#10b981' }
    ]
  },
  0: { xData: ['学堂01网格', '学堂02网格', '学堂03网格'], series: specialGroupSeriesTemplate({ elderly:[32, 26, 24], livingAlone:[10, 8, 8], disabled:[20, 16, 16], drug:[3, 3, 2], orphan:[1, 2, 1], mental:[6, 4, 4], children:[5, 4, 3], priority:[8, 6, 4] }) },
  1: { xData: ['荣东01网格', '荣东02网格', '荣东03网格'], series: specialGroupSeriesTemplate({ elderly:[28, 24, 22], livingAlone:[8, 7, 7], disabled:[18, 14, 14], drug:[2, 2, 2], orphan:[1, 1, 1], mental:[5, 4, 3], children:[4, 3, 3], priority:[7, 5, 4] }) },
  2: { xData: ['六角01网格', '六角02网格'], series: specialGroupSeriesTemplate({ elderly:[48, 40], livingAlone:[16, 12], disabled:[28, 22], drug:[5, 3], orphan:[2, 3], mental:[8, 8], children:[6, 8], priority:[12, 8] }) },
  3: { xData: ['由义01网格', '由义02网格'], series: specialGroupSeriesTemplate({ elderly:[38, 32], livingAlone:[10, 10], disabled:[22, 20], drug:[3, 2], orphan:[2, 1], mental:[5, 5], children:[4, 4], priority:[8, 6] }) },
  4: { xData: ['民意01网格', '民意02网格'], series: specialGroupSeriesTemplate({ elderly:[42, 34], livingAlone:[12, 12], disabled:[24, 24], drug:[4, 3], orphan:[2, 2], mental:[7, 7], children:[5, 7], priority:[9, 7] }) }
}

const currentSpecialGroupConf = computed(() => {
  if (tagDim.value === 'grid') return specialGroupData[gridCommunity.value]
  return specialGroupData.community
})

const initBarChart = () => {
  if (!barChartRef.value) return
  // 始终重建实例以确保DOM切换后正确渲染
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
  barChart = echarts.init(barChartRef.value)
  const conf = currentDimConf.value
  const isStack = tagDim.value === 'community' || tagDim.value === 'grid'
  const series = conf.series.map((s, idx) => ({
    name: s.name,
    type: 'bar',
    stack: isStack ? 'total' : null,
    barMaxWidth: 32,
    itemStyle: {
      color: s.color,
      borderRadius: (idx === conf.series.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]
    },
    emphasis: { focus: 'series' },
    data: s.data
  }))
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: [8, 12],
      textStyle: { color: '#374151', fontSize: 12 }
    },
    legend: {
      show: conf.series.length > 1,
      top: 0,
      right: 0,
      itemWidth: 10, itemHeight: 10,
      itemGap: 14,
      textStyle: { color: '#64748b', fontSize: 11 }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: tagDim.value === 'community' ? '14%' : '8%',
      top: conf.series.length > 1 ? '14%' : '6%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: conf.xData,
      axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
      axisLabel: { color: '#64748b', fontSize: 11, interval: 0, rotate: tagDim.value === 'community' ? 16 : 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed', width: 1 } }
    },
    series
  }, true)
}

const initSpecialChart = () => {
  if (!specialChartRef.value) return
  if (tagDim.value !== 'community' && tagDim.value !== 'grid') {
    if (specialChart) { specialChart.dispose(); specialChart = null }
    return
  }
  if (specialChart) { specialChart.dispose(); specialChart = null }
  specialChart = echarts.init(specialChartRef.value)
  const conf = currentSpecialGroupConf.value
  const series = conf.series.map((s, idx) => ({
    name: s.name,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 28,
    itemStyle: {
      color: s.color,
      borderRadius: (idx === conf.series.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]
    },
    emphasis: { focus: 'series' },
    data: s.data
  }))
  specialChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: [8, 12],
      textStyle: { color: '#374151', fontSize: 12 }
    },
    legend: {
      show: true,
      top: 0,
      right: 0,
      itemWidth: 10, itemHeight: 10,
      itemGap: 10,
      textStyle: { color: '#64748b', fontSize: 10 },
      type: 'scroll'
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: tagDim.value === 'community' ? '14%' : '8%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: conf.xData,
      axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
      axisLabel: { color: '#64748b', fontSize: 10, interval: 0, rotate: tagDim.value === 'community' ? 16 : 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed', width: 1 } }
    },
    series
  }, true)
}

// 单图初始化（保障类别/特殊人群口径）
const initBarSingleChart = () => {
  if (!barChartSingleRef.value) return
  if (barChartSingle) { barChartSingle.dispose(); barChartSingle = null }
  barChartSingle = echarts.init(barChartSingleRef.value)
  const conf = currentDimConf.value
  const series = conf.series.map((s, idx) => ({
    name: s.name,
    type: 'bar',
    barMaxWidth: 40,
    itemStyle: {
      color: s.color,
      borderRadius: [4, 4, 0, 0]
    },
    emphasis: { focus: 'series' },
    data: s.data
  }))
  barChartSingle.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: [8, 12],
      textStyle: { color: '#374151', fontSize: 12 }
    },
    legend: {
      show: conf.series.length > 1,
      top: 0,
      right: 0,
      itemWidth: 10, itemHeight: 10,
      itemGap: 14,
      textStyle: { color: '#64748b', fontSize: 11 }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '8%',
      top: conf.series.length > 1 ? '14%' : '6%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: conf.xData,
      axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
      axisLabel: { color: '#64748b', fontSize: 11, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed', width: 1 } }
    },
    series
  }, true)
}

const initAllCharts = () => {
  const isDual = tagDim.value === 'community' || tagDim.value === 'grid'
  if (isDual) {
    // 销毁单图实例
    if (barChartSingle) { barChartSingle.dispose(); barChartSingle = null }
    initBarChart()
    initSpecialChart()
    // 延迟resize确保容器尺寸正确
    setTimeout(() => {
      barChart && barChart.resize()
      specialChart && specialChart.resize()
    }, 100)
  } else {
    // 销毁双图实例
    if (barChart) { barChart.dispose(); barChart = null }
    if (specialChart) { specialChart.dispose(); specialChart = null }
    initBarSingleChart()
    setTimeout(() => {
      barChartSingle && barChartSingle.resize()
    }, 100)
  }
}

watch([tagDim, gridCommunity], () => {
  setTimeout(() => {
    initAllCharts()
  }, 80)
})

onMounted(() => {
  initAllCharts()
  window.addEventListener('resize', () => {
    barChart && barChart.resize()
    specialChart && specialChart.resize()
    barChartSingle && barChartSingle.resize()
  })
})
</script>

<style scoped>
/* ============================================================
   Dashboard — 政务风统一视觉规范
   ============================================================ */
.dashboard-page {
  padding: 0 0 20px;
  color: #1e293b;
}

/* ---------- 页头 ---------- */
.page-header {
  padding: 14px 0 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.page-eyebrow {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 4px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  line-height: 1.3;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.page-title-sub {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding-left: 10px;
  border-left: 1px solid #cbd5e1;
}

/* ---------- KPI 四卡 ---------- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.stat-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px 14px 12px 16px;
  min-height: 120px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease;
}
.stat-card:hover {
  border-color: #cbd5e1;
}
.stat-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: currentColor;
  opacity: 0.9;
}
.stat-card.tone-blue   { color: #1e40af; }
.stat-card.tone-orange { color: #b45309; }
.stat-card.tone-green  { color: #15803d; }
.stat-card.tone-purple { color: #1e3a8a; }

.stat-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}
.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.4;
  white-space: nowrap;
}
.stat-trend.tone-up   { color: #15803d; background: rgba(21, 128, 61, 0.08); }
.stat-trend.tone-flat { color: #1e40af; background: rgba(30, 64, 175, 0.08); }
.stat-trend.tone-warn { color: #b45309; background: rgba(180, 83, 9, 0.08); }

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}
.stat-unit {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.stat-currency {
  font-size: 17px;
  font-weight: 700;
  color: inherit;
  margin-right: 2px;
}
.tone-blue   .stat-value { color: #1e40af; }
.tone-green  .stat-value { color: #15803d; }
.tone-orange .stat-value { color: #b45309; }
.tone-purple .stat-value { color: #1e3a8a; }

.stat-foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}
.foot-chip {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 4px;
}
.foot-chip b {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.foot-chip span { font-size: 11px; color: #64748b; }
.foot-chip-right { text-align: right; }
.foot-chip-right b, .foot-chip-right span { margin-left: auto; }
.foot-chip-wide {
  grid-column: 1 / -1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  align-self: flex-start;
  flex-shrink: 0;
}
.tone-blue   .stat-icon { background: #1e40af; }
.tone-orange .stat-icon { background: #b45309; }
.tone-green  .stat-icon { background: #15803d; }
.tone-purple .stat-icon { background: #1e3a8a; }

/* ---------- 图表双列 ---------- */
.chart-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 12px;
}
.content-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}
.map-card { min-height: 480px; }
.chart-card { min-height: 480px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.card-title-wrapper { flex: 1; min-width: 0; }
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 2px;
  line-height: 1.25;
}
.card-subtitle { font-size: 12px; color: #94a3b8; }

/* 地图图例 */
.map-legend {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #475569;
  padding: 2px 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.legend-item:hover {
  background: #e2e8f0;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 地图容器 */
.map-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  border-radius: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 4px;
}
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.map-bg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

/* ---------- 社区标签 ---------- */
.community-label {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  z-index: 3;
  white-space: nowrap;
}
.label-name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.label-pointer {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--label-color);
  margin-top: -1px;
  position: relative;
  z-index: 3;
}
.label-pulse {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid var(--label-color);
  animation: labelPulse 2s ease-out infinite;
  z-index: 2;
}
.community-label:hover .label-badge {
  transform: scale(1.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}
.community-label.active .label-badge {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
@keyframes labelPulse {
  0%   { transform: translateX(-50%) scale(0.6); opacity: 0.8; }
  100% { transform: translateX(-50%) scale(2.2); opacity: 0;   }
}

/* ---------- 社区详情弹窗 ---------- */
.community-dialog {
  position: fixed;
  width: 340px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.25);
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
.dialog-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dialog-title { font-size: 15px; font-weight: 700; }
.dialog-subtitle { font-size: 11px; opacity: 0.85; }
.dialog-close {
  cursor: pointer;
  font-size: 16px;
  opacity: 0.9;
  transition: opacity 0.15s;
}
.dialog-close:hover { opacity: 1; }
.dialog-body { padding: 14px; overflow-y: auto; flex: 1; }

/* KPI */
.dialog-kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 14px;
}
.dialog-kpi-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 6px;
  text-align: center;
}
.dialog-kpi-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e40af;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.dialog-kpi-item.warn .dialog-kpi-value { color: #b91c1c; }
.dialog-kpi-label { font-size: 11px; color: #64748b; margin-top: 2px; }

/* 分区 */
.dialog-section { margin-bottom: 12px; }
.dialog-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  margin-bottom: 8px;
}
.section-bar {
  width: 3px;
  height: 12px;
  border-radius: 2px;
}

/* 网格列表 */
.dialog-grid-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.grid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}
.grid-name {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}
.grid-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
}
.grid-meta .grid-warn { color: #b91c1c; font-weight: 600; }

/* 标签 */
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }

/* 弹窗动画 */
.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dialog-fade-enter-from, .dialog-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ---------- 图表 ---------- */
.chart { width: 100%; }
.chart-tall { height: 360px; flex: 1; min-height: 320px; }
.chart-shorter { height: 300px; min-height: 260px; }

/* 双图并排 */
.chart-dual {
  display: flex;
  gap: 12px;
  width: 100%;
}
.chart-single-wrap {
  width: 100%;
}
.chart-dual-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chart-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  padding-left: 4px;
  border-left: 3px solid #1e40af;
  line-height: 1;
}
.chart-half {
  height: 320px;
  min-height: 280px;
}
.chart-half.chart-shorter {
  height: 280px;
  min-height: 240px;
}

/* 口径切换 */
.dim-switcher :deep(.el-radio-button__inner) {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 0 !important;
  color: #64748b;
}
.dim-switcher :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #1e40af;
  border-color: #1e40af;
  color: #fff;
  box-shadow: none !important;
}
.dim-switcher :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6 !important;
  border-radius: 4px 0 0 4px !important;
}
.dim-switcher :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0 !important;
}

/* 网格口径 Tab */
.grid-community-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 4px;
}
.grid-com-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 12px;
  color: #64748b;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.4;
  user-select: none;
  font-weight: 500;
}
.grid-com-tab:hover {
  border-color: #cbd5e1;
}
.grid-com-tab.active {
  font-weight: 700;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
}
.grid-com-dot {
  width: 7px; height: 7px; border-radius: 4px; flex-shrink: 0;
}
.grid-com-cnt {
  font-size: 11px;
  opacity: 0.75;
  padding-left: 6px;
  margin-left: 2px;
  border-left: 1px solid #e2e8f0;
}
.grid-com-tab.active .grid-com-cnt {
  border-left-color: currentColor;
  opacity: 0.75;
}

/* ---------- 社区快览卡 ---------- */
.community-overview {
  padding: 14px 16px;
}
.community-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.community-card {
  position: relative;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: 3px solid var(--card-color);
  border-radius: 4px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
}
.community-card:hover {
  border-color: var(--card-color);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
}
.cc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}
.cc-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.cc-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.cc-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.cc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.cc-label {
  color: #64748b;
}
.cc-value {
  color: #1e293b;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.cc-value.warn { color: #b91c1c; }
.cc-action {
  font-size: 12px;
  font-weight: 600;
  color: var(--card-color);
  text-align: right;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

/* 响应式 */
@media (max-width: 1320px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-row { grid-template-columns: 1fr; }
  .community-cards { grid-template-columns: repeat(3, 1fr); }
}
</style>
