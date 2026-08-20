<template>
  <div class="community-report-page">
    <!-- 左侧树状导航 -->
    <div class="sidebar-panel">
      <div class="sidebar-header">社区导航</div>
      <div class="sidebar-tree">
        <el-tree
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          node-key="id"
          :default-expanded-keys="['district']"
          :current-node-key="currentNodeKey"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon v-if="data.type === 'district'" class="tree-icon tree-icon-district"><OfficeBuilding /></el-icon>
              <el-icon v-else-if="data.type === 'street'" class="tree-icon tree-icon-street"><MapLocation /></el-icon>
              <el-icon v-else class="tree-icon tree-icon-community"><House /></el-icon>
              <span class="tree-label">{{ node.label }}</span>
              <el-tag v-if="data.type === 'community'" size="small" effect="plain" class="tree-tag" type="primary">查看</el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 右侧主内容 -->
    <div class="main-panel">
      <!-- 顶部头部 -->
      <div class="page-header">
        <div class="header-left">
          <span class="breadcrumb">
            <span>硚口区</span>
            <el-icon><ArrowRight /></el-icon>
            <span class="breadcrumb-current">{{ currentStreet }}</span>
            <template v-if="currentCommunity">
              <el-icon><ArrowRight /></el-icon>
              <span class="breadcrumb-current">{{ currentCommunity }}</span>
            </template>
          </span>
          <span class="page-subtitle">{{ currentView === 'community' ? '社区工作统计' : '网格工作统计' }}</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <span class="filter-label">时间查询：</span>
        <el-date-picker v-model="startDate" type="date" placeholder="开始时间" value-format="YYYY-MM-DD" style="width: 150px" />
        <span class="filter-sep">至</span>
        <el-date-picker v-model="endDate" type="date" placeholder="结束时间" value-format="YYYY-MM-DD" style="width: 150px" />
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="resetFilter">重置</el-button>
        <el-button class="back-btn" v-if="currentView === 'grid'" @click="backToCommunity">
          <el-icon><ArrowLeft /></el-icon>返回社区统计
        </el-button>
      </div>

      <!-- 4个统计卡 -->
      <div class="stats-row">
        <div class="stat-card stat-total">
          <div class="stat-icon"><el-icon><List /></el-icon></div>
          <div class="stat-info">
            <div class="stat-top-row">
              <span class="stat-value">{{ viewTotals.total }}</span>
              <span class="stat-unit">条</span>
            </div>
            <span class="stat-label">任务总数</span>
          </div>
        </div>
        <div class="stat-card stat-done">
          <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
          <div class="stat-info">
            <div class="stat-top-row">
              <span class="stat-value">{{ viewTotals.onTimeCount }}</span>
              <span class="stat-unit">({{ viewTotals.onTimeRate }}%)</span>
            </div>
            <span class="stat-label">按期完成</span>
          </div>
        </div>
        <div class="stat-card stat-overdue">
          <div class="stat-icon"><el-icon><Warning /></el-icon></div>
          <div class="stat-info">
            <div class="stat-top-row">
              <span class="stat-value">{{ viewTotals.overdueCount }}</span>
              <span class="stat-unit">({{ viewTotals.overdueRate }}%)</span>
            </div>
            <span class="stat-label">超期完成</span>
          </div>
        </div>
        <div class="stat-card stat-undone">
          <div class="stat-icon"><el-icon><Clock /></el-icon></div>
          <div class="stat-info">
            <div class="stat-top-row">
              <span class="stat-value">{{ viewTotals.undoneCount }}</span>
              <span class="stat-unit">({{ viewTotals.undoneRate }}%)</span>
            </div>
            <span class="stat-label">未完成</span>
          </div>
        </div>
      </div>

      <!-- 社区列表视图 -->
      <div class="content-card main-card" v-if="currentView === 'community'">
        <div class="card-header">
          <span class="card-title">
            <el-icon color="#1e40af"><OfficeBuilding /></el-icon>
            {{ currentStreet }} · 社区工作统计
          </span>
          <span class="card-desc">点击社区查看网格工作统计</span>
        </div>
        <el-table :data="communityStats" border stripe style="width: 100%"
          :header-cell-style="headerStyle">
          <el-table-column prop="name" label="社区名称" width="130" fixed>
            <template #default="{ row }">
              <span class="community-tag-inline" :style="{ background: getCommunityColor(row.name) }">
                {{ row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="infoCompleteness" label="基础信息完整率" width="130" align="center">
            <template #default="{ row }">
              <span :class="rateClass(row.infoCompleteness)">{{ row.infoCompleteness }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="newCount" label="新增数据数" width="100" align="center" />
          <el-table-column prop="editCount" label="编辑数据数" width="100" align="center" />
          <el-table-column prop="delCount" label="删除数据数" width="100" align="center" />
          <el-table-column label="核查任务" align="center" min-width="260">
            <el-table-column prop="checkTotal" label="总数" width="70" align="center" />
            <el-table-column label="按期完成" width="120" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.checkOnTimeCount }}</span>
                  <span :class="['rate-pct', row.checkOnTimeRate < 80 ? 'rate-bad' : '']">({{ row.checkOnTimeRate }}%)</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="超期完成" width="120" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.checkOverdueCount }}</span>
                  <span class="rate-pct rate-warn">({{ row.checkOverdueRate }}%)</span>
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="走访任务" align="center" min-width="200">
            <el-table-column prop="visitTotal" label="总数" width="70" align="center" />
            <el-table-column label="已完成" width="140" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.visitDoneCount }}</span>
                  <span :class="['rate-pct', row.visitDoneRate < 80 ? 'rate-bad' : '']">({{ row.visitDoneRate }}%)</span>
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="enterCommunity(row)">查看网格</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 网格列表视图 -->
      <div class="content-card main-card" v-else>
        <div class="card-header">
          <span class="card-title">
            <el-icon color="#1e40af"><Grid /></el-icon>
            {{ currentCommunity }} · 网格工作统计
          </span>
          <span class="card-desc">共 {{ currentGrids.length }} 个网格</span>
        </div>
        <el-table :data="currentGrids" border stripe style="width: 100%"
          :header-cell-style="headerStyle">
          <el-table-column prop="gridName" label="网格名称" width="100" fixed>
            <template #default="{ row }">
              <span class="grid-name-tag">{{ row.gridName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="gridder" label="网格员" width="90" />
          <el-table-column prop="newCount" label="新增数据数" width="100" align="center" />
          <el-table-column prop="editCount" label="编辑数据数" width="100" align="center" />
          <el-table-column prop="delCount" label="删除数据数" width="100" align="center" />
          <el-table-column label="核查任务" align="center" min-width="260">
            <el-table-column prop="checkTotal" label="任务总数" width="80" align="center" />
            <el-table-column label="按期完成" width="120" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.checkOnTimeCount }}</span>
                  <span :class="['rate-pct', row.checkOnTimeRate < 80 ? 'rate-bad' : '']">({{ row.checkOnTimeRate }}%)</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="超期完成" width="120" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.checkOverdueCount }}</span>
                  <span class="rate-pct rate-warn">({{ row.checkOverdueRate }}%)</span>
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="走访任务" align="center" min-width="200">
            <el-table-column prop="visitTotal" label="任务总数" width="80" align="center" />
            <el-table-column label="已完成" width="140" align="center">
              <template #default="{ row }">
                <div class="rate-cell-inline">
                  <span class="rate-num">{{ row.visitDoneCount }}</span>
                  <span :class="['rate-pct', row.visitDoneRate < 80 ? 'rate-bad' : '']">({{ row.visitDoneRate }}%)</span>
                </div>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, Search, List, CircleCheckFilled, Clock, Warning,
  OfficeBuilding, Grid, House, MapLocation, ArrowRight, ArrowLeft
} from '@element-plus/icons-vue'

// ============ 基础数据 ============
const startDate = ref('2025-01-01')
const endDate = ref('2025-06-30')

const districtName = '硚口区'
const streetName = '六角亭街道'
const communityNames = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区']
const griddersPool = ['曹俊杰', '朱雅雯', '蒋艳玲', '陈博文', '潘岩', '陈思琪', '王雪莹', '刘志强', '赵宇航', '郑雨桐', '孙明杰', '徐晓晓', '何伟', '罗丽娜', '黄晓东', '周建峰', '吴佳怡', '冯立新', '邓佳欣', '彭博']

// ============ 树状导航 ============
const treeData = [
  {
    id: 'district',
    label: districtName,
    type: 'district',
    children: [
      {
        id: 'street',
        label: streetName,
        type: 'street',
        children: communityNames.map(name => ({
          id: 'c_' + name,
          label: name,
          type: 'community'
        }))
      }
    ]
  }
]

const currentView = ref('community') // 'community' | 'grid'
const currentCommunity = ref('')
const currentNodeKey = ref('street')

const handleNodeClick = (data) => {
  if (data.type === 'community') {
    currentCommunity.value = data.label
    currentView.value = 'grid'
    currentNodeKey.value = data.id
  } else if (data.type === 'street') {
    currentCommunity.value = ''
    currentView.value = 'community'
    currentNodeKey.value = data.id
  } else if (data.type === 'district') {
    currentCommunity.value = ''
    currentView.value = 'community'
    currentNodeKey.value = data.id
  }
}

const backToCommunity = () => {
  currentCommunity.value = ''
  currentView.value = 'community'
  currentNodeKey.value = 'street'
}

// ============ 数据生成 ============
const communityColors = {
  '学堂社区': '#1e40af',
  '荣东社区': '#15803d',
  '六角社区': '#d97706',
  '由义社区': '#7c3aed',
  '民意社区': '#0891b2'
}
const getCommunityColor = (name) => communityColors[name] || '#64748b'

const genGrids = (seed) => {
  const grids = []
  for (let i = 1; i <= 4; i++) {
    const gridIdx = (seed - 1) * 4 + i - 1
    const newC = 5 + ((seed * 17 + i * 11) % 80)
    const editC = 20 + ((seed * 23 + i * 7) % 90)
    const delC = 2 + ((seed * 9 + i * 5) % 40)
    const visitTotal = 250 + ((seed * 13 + i * 19) % 300)
    const visitOverdueRate = 2 + ((seed + i) % 5) // 2-6
    const visitOnTimeRate = Math.max(75 + ((seed * 3 + i * 2) % 12) - visitOverdueRate, 60)
    const checkTotal = 40 + ((seed * 7 + i * 13) % 60)
    const checkOverdueRate = 2 + ((seed * 2 + i) % 5) // 2-6
    const checkOnTimeRate = Math.max(78 + ((seed * 2 + i * 3) % 12) - checkOverdueRate, 62)
    const checkOnTimeCount = Math.round(checkTotal * checkOnTimeRate / 100)
    const checkOverdueCount = Math.round(checkTotal * checkOverdueRate / 100)
    const visitOnTimeCount = Math.round(visitTotal * visitOnTimeRate / 100)
    const visitOverdueCount = Math.round(visitTotal * visitOverdueRate / 100)
    const visitDoneCount = visitOnTimeCount + visitOverdueCount
    const visitDoneRate = Math.round(visitDoneCount / visitTotal * 100)
    grids.push({
      gridName: `第00${i}网格`,
      gridder: griddersPool[gridIdx % griddersPool.length],
      newCount: newC,
      editCount: editC,
      delCount: delC,
      visitTotal,
      visitOnTimeRate: Math.min(visitOnTimeRate, 100),
      visitOnTimeCount,
      visitOverdueRate: Math.min(visitOverdueRate, 100),
      visitOverdueCount,
      visitDoneCount,
      visitDoneRate: Math.min(visitDoneRate, 100),
      checkTotal,
      checkOnTimeRate: Math.min(checkOnTimeRate, 100),
      checkOnTimeCount,
      checkOverdueRate: Math.min(checkOverdueRate, 100),
      checkOverdueCount
    })
  }
  return grids
}

const communityStats = computed(() => {
  return communityNames.map((name, idx) => {
    const seed = idx + 1
    const grids = genGrids(seed)
    const newCount = grids.reduce((s, g) => s + g.newCount, 0)
    const editCount = grids.reduce((s, g) => s + g.editCount, 0)
    const delCount = grids.reduce((s, g) => s + g.delCount, 0)
    const visitTotal = grids.reduce((s, g) => s + g.visitTotal, 0)
    const checkTotal = grids.reduce((s, g) => s + g.checkTotal, 0)
    const checkOnTimeCount = grids.reduce((s, g) => s + g.checkOnTimeCount, 0)
    const checkOverdueCount = grids.reduce((s, g) => s + g.checkOverdueCount, 0)
    const visitDoneCount = grids.reduce((s, g) => s + g.visitDoneCount, 0)
    const checkOnTimeRate = Math.round(grids.reduce((s, g) => s + g.checkOnTimeRate * g.checkTotal, 0) / checkTotal)
    const checkOverdueRate = Math.round(grids.reduce((s, g) => s + g.checkOverdueRate * g.checkTotal, 0) / checkTotal)
    const visitDoneRate = Math.round(visitDoneCount / visitTotal * 100)
    const infoCompleteness = 85 + ((seed * 3) % 12)
    return {
      name,
      infoCompleteness,
      newCount, editCount, delCount,
      visitTotal, visitDoneCount, visitDoneRate,
      checkTotal, checkOnTimeRate, checkOnTimeCount, checkOverdueRate, checkOverdueCount,
      grids
    }
  })
})

const currentGrids = computed(() => {
  if (!currentCommunity.value) return []
  const comm = communityStats.value.find(c => c.name === currentCommunity.value)
  return comm ? comm.grids : []
})

const viewTotals = computed(() => {
  if (currentView.value === 'community') {
    const total = communityStats.value.reduce((s, c) => s + c.visitTotal + c.checkTotal, 0)
    const onTimeCount = communityStats.value.reduce((s, c) => s + c.visitDoneCount + c.checkOnTimeCount, 0)
    const overdueCount = communityStats.value.reduce((s, c) => s + c.checkOverdueCount, 0)
    const undone = total - onTimeCount - overdueCount
    return {
      total,
      onTimeCount,
      overdueCount,
      undoneCount: undone,
      onTimeRate: total > 0 ? Math.round(onTimeCount / total * 100) : 0,
      overdueRate: total > 0 ? Math.round(overdueCount / total * 100) : 0,
      undoneRate: total > 0 ? Math.round(undone / total * 100) : 0
    }
  } else {
    const total = currentGrids.value.reduce((s, g) => s + g.visitTotal + g.checkTotal, 0)
    const onTimeCount = currentGrids.value.reduce((s, g) => s + g.visitDoneCount + g.checkOnTimeCount, 0)
    const overdueCount = currentGrids.value.reduce((s, g) => s + g.checkOverdueCount, 0)
    const undone = total - onTimeCount - overdueCount
    return {
      total,
      onTimeCount,
      overdueCount,
      undoneCount: undone,
      onTimeRate: total > 0 ? Math.round(onTimeCount / total * 100) : 0,
      overdueRate: total > 0 ? Math.round(overdueCount / total * 100) : 0,
      undoneRate: total > 0 ? Math.round(undone / total * 100) : 0
    }
  }
})

const getRateTag = (r) => {
  if (r >= 95) return 'success'
  if (r >= 85) return 'warning'
  return 'danger'
}
const rateColor = (r) => {
  if (r >= 95) return '#16a34a'
  if (r >= 85) return '#d97706'
  return '#dc2626'
}
const rateClass = (r) => {
  if (r >= 90) return 'rate-good'
  if (r >= 80) return 'rate-warn'
  return 'rate-bad'
}

const enterCommunity = (row) => {
  currentCommunity.value = row.name
  currentView.value = 'grid'
  currentNodeKey.value = 'c_' + row.name
}

const currentStreet = computed(() => streetName)

const headerStyle = { background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }

const handleQuery = () => { ElMessage.success(`已查询 ${startDate.value} ~ ${endDate.value}`) }
const resetFilter = () => { startDate.value = '2025-01-01'; endDate.value = '2025-06-30'; ElMessage.info('已重置') }
const handleExport = () => { ElMessage.success('社区工作统计报表导出中...') }
</script>

<style scoped>
.community-report-page {
  display: flex; gap: 16px; padding: 0; height: calc(100vh - 120px);
}

/* 左侧导航 */
.sidebar-panel {
  width: 220px; flex-shrink: 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  display: flex; flex-direction: column; overflow: hidden;
}
.sidebar-header {
  padding: 12px 14px; font-size: 14px; font-weight: 700; color: #1f2937;
  border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
}
.sidebar-tree { flex: 1; overflow-y: auto; padding: 8px 4px; }
.tree-node {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; color: #334155;
  width: 100%;
}
.tree-icon { font-size: 15px; flex-shrink: 0; }
.tree-icon-district { color: #64748b; }
.tree-icon-street { color: #2563eb; }
.tree-icon-community { color: #0d9488; }
.tree-label { font-weight: 500; flex: 1; }
.tree-tag { margin-left: 4px; }

/* 主面板 */
.main-panel {
  flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-y: auto;
}
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
}
.header-left { display: flex; flex-direction: column; gap: 4px; }
.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; color: #64748b;
}
.breadcrumb-current { color: #1f2937; font-weight: 600; }
.page-subtitle { font-size: 12px; color: #94a3b8; }

/* 筛选栏 */
.filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 12px 16px; background: #fff; border: 1px solid #e2e8f0;
  border-radius: 8px; margin-bottom: 12px;
}
.filter-label { font-size: 13px; color: #475569; font-weight: 600; }
.filter-sep { color: #94a3b8; }
.back-btn { margin-left: auto; }

/* 统计卡 */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
.stat-card {
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;
  transition: transform .15s ease, box-shadow .15s ease;
  position: relative; overflow: hidden;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30, 64, 175, .08); }
.stat-card::after {
  content: ''; position: absolute; right: -20px; top: -20px; width: 80px; height: 80px;
  border-radius: 50%; opacity: .06;
}
.stat-total::after { background: #1e40af; }
.stat-done::after { background: #15803d; }
.stat-overdue::after { background: #dc2626; }
.stat-undone::after { background: #d97706; }

.stat-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #fff; flex-shrink: 0;
}
.stat-total .stat-icon { background: linear-gradient(135deg, #1e40af, #3b82f6); }
.stat-done .stat-icon { background: linear-gradient(135deg, #15803d, #22c55e); }
.stat-overdue .stat-icon { background: linear-gradient(135deg, #dc2626, #ef4444); }
.stat-undone .stat-icon { background: linear-gradient(135deg, #d97706, #f59e0b); }

.stat-info { flex: 1; min-width: 0; }
.stat-top-row { display: flex; align-items: baseline; gap: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-unit { font-size: 12px; color: #64748b; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 3px; display: block; }

/* 内容卡片 */
.content-card {
  background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;
  padding: 16px 20px; flex: 1;
}
.card-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;
}
.card-title {
  font-size: 15px; font-weight: 700; color: #1f2937;
  display: inline-flex; align-items: center; gap: 6px;
}
.card-desc { font-size: 12px; color: #94a3b8; margin-left: auto; }

/* 社区/网格标签 */
.community-tag-inline {
  display: inline-block; padding: 3px 10px; border-radius: 4px;
  font-size: 12px; color: #fff; font-weight: 600;
}
.grid-name-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 600; color: #1e40af;
  background: #eff6ff; border: 1px solid #bfdbfe;
}

/* 进度条颜色 */
:deep(.el-progress-bar__outer) { background: #f1f5f9; }

.rate-good { color: #16a34a; font-weight: 600; }
.rate-warn { color: #d97706; font-weight: 600; }
.rate-bad { color: #dc2626; font-weight: 600; }

.rate-cell-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  line-height: 1.4;
}
.rate-cell-inline .rate-num {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}
.rate-cell-inline .rate-pct {
  font-size: 11px;
  color: #64748b;
}
.rate-cell-inline .rate-pct.rate-warn {
  color: #d97706;
}
.rate-cell-inline .rate-pct.rate-bad {
  color: #dc2626;
}
</style>
