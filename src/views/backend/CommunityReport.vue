<template>
  <div class="community-report-page">
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">社区工作统计报表</span>
        <span class="page-subtitle">按社区维度统计任务、数据操作、核查任务及走访任务完成情况</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" plain @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="content-card filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">时间查询：</span>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始时间"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
          <span class="filter-sep">至</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束时间"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
        </div>
        <el-button @click="resetFilter">重置</el-button>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询
        </el-button>
      </div>
    </div>

    <!-- 顶部 4 个统计卡 -->
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon"><el-icon><List /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ totals.totalTasks }}</span>
            <span class="stat-unit">条</span>
          </div>
          <span class="stat-label">任务总数</span>
          <span class="stat-sub">5社区汇总</span>
        </div>
      </div>
      <div class="stat-card stat-done">
        <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ totals.doneTasks }}</span>
            <span class="stat-unit">条</span>
          </div>
          <span class="stat-label">已完成总数</span>
          <span class="stat-sub">占比 {{ (totals.doneTasks / Math.max(totals.totalTasks,1) * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="stat-card stat-undone">
        <div class="stat-icon"><el-icon><Clock /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ totals.totalTasks - totals.doneTasks }}</span>
            <span class="stat-unit">条</span>
          </div>
          <span class="stat-label">未完成总数</span>
          <span class="stat-sub">占比 {{ ((totals.totalTasks - totals.doneTasks) / Math.max(totals.totalTasks,1) * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="stat-card stat-rate">
        <div class="stat-icon"><el-icon><Medal /></el-icon></div>
        <div class="stat-info">
          <div class="stat-top-row">
            <span class="stat-value">{{ finishRate }}%</span>
          </div>
          <span class="stat-label">办结率</span>
          <span class="stat-sub">已完成 / 任务总数</span>
        </div>
      </div>
    </div>

    <!-- 社区列表 + 明细表格 -->
    <div class="content-card main-card">
      <div class="card-header">
        <span class="card-title">
          <el-icon color="#1e40af"><OfficeBuilding /></el-icon>
          六角亭街道
        </span>
        <span class="card-desc">点击左侧社区查看网格级明细</span>
      </div>

      <div class="two-col-layout">
        <!-- 左侧社区列表 -->
        <div class="community-side">
          <div class="side-title">社区列表（{{ communities.length }}个）</div>
          <ul class="community-list">
            <li
              v-for="c in communities"
              :key="c.name"
              class="community-item"
              :class="{ active: activeCommunity === c.name }"
              @click="activeCommunity = c.name"
            >
              <div class="c-name">{{ c.name }}</div>
              <div class="c-rate">
                <el-progress
                  :percentage="c.taskFinishRate"
                  :stroke-width="6"
                  :show-text="false"
                  style="width: 80px"
                />
                <span class="rate-text">{{ c.taskFinishRate }}%</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- 右侧：当前社区汇总 + 网格明细 -->
        <div class="detail-main">
          <div class="current-summary">
            <div class="cs-item">
              <span class="cs-label">基础信息完整率</span>
              <span class="cs-value highlight">{{ current.infoCompleteness }}%</span>
            </div>
            <div class="cs-item">
              <span class="cs-label">新增数据数</span>
              <span class="cs-value">{{ current.newCount }}</span>
            </div>
            <div class="cs-item">
              <span class="cs-label">编辑数据数</span>
              <span class="cs-value">{{ current.editCount }}</span>
            </div>
            <div class="cs-item">
              <span class="cs-label">删除数据数</span>
              <span class="cs-value">{{ current.delCount }}</span>
            </div>
            <div class="cs-item">
              <span class="cs-label">核查任务 / 完成率</span>
              <span class="cs-value">
                {{ current.checkDone }}/{{ current.checkTotal }}
                <el-tag size="small" :type="getRateTag(current.checkRate)" effect="light">{{ current.checkRate }}%</el-tag>
              </span>
            </div>
            <div class="cs-item">
              <span class="cs-label">走访任务 / 完成率</span>
              <span class="cs-value">
                {{ current.visitDone }}/{{ current.visitTotal }}
                <el-tag size="small" :type="getRateTag(current.visitRate)" effect="light">{{ current.visitRate }}%</el-tag>
              </span>
            </div>
          </div>

          <div class="table-toolbar">
            <span class="table-title">
              <strong>{{ activeCommunity }}</strong>
              网格明细（{{ currentGrid.length }}个网格）
            </span>
          </div>

          <el-table :data="currentGrid" stripe border size="default" style="width: 100%" :header-cell-style="headerStyle">
            <el-table-column prop="gridName" label="网格名称" width="110" fixed />
            <el-table-column prop="gridder" label="网格员" width="110" />
            <el-table-column prop="newCount" label="新增数据数" width="100" align="center" />
            <el-table-column prop="editCount" label="编辑数据数" width="100" align="center" />
            <el-table-column prop="delCount" label="删除数据数" width="100" align="center" />

            <el-table-column label="走访任务" align="center" min-width="200">
              <el-table-column prop="visitTotal" label="总数" width="70" align="center" />
              <el-table-column prop="visitDone" label="已完成" width="70" align="center" />
              <el-table-column label="完成率" width="110" align="center">
                <template #default="{ row }">
                  <el-progress :percentage="row.visitRate" :stroke-width="8" />
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="核查任务" align="center" min-width="200">
              <el-table-column prop="checkTotal" label="总数" width="70" align="center" />
              <el-table-column prop="checkDone" label="已完成" width="70" align="center" />
              <el-table-column label="完成率" width="110" align="center">
                <template #default="{ row }">
                  <el-progress :percentage="row.checkRate" :stroke-width="8" :color="rateColor(row.checkRate)" />
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, Search, List, CircleCheckFilled, Clock, Medal, OfficeBuilding
} from '@element-plus/icons-vue'

// ============ 筛选 ============
const startDate = ref('2025-01-01')
const endDate = ref('2025-06-30')
const activeCommunity = ref('学堂社区')

const communityNames = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区']
const griddersPool = ['曹俊杰', '朱雅雯', '蒋艳玲', '陈博文', '潘岩', '陈思琪', '王雪莹', '刘志强', '赵宇航', '郑雨桐', '孙明杰', '徐晓晓', '何伟', '罗丽娜', '黄晓东', '周建峰', '吴佳怡', '冯立新', '邓佳欣', '彭博']

// 生成 5 社区数据（每个社区 4 个网格）
const genGrids = (seed) => {
  const grids = []
  for (let i = 1; i <= 4; i++) {
    const gridIdx = (seed - 1) * 4 + i - 1
    const newC = 5 + ((seed * 17 + i * 11) % 80)
    const editC = 20 + ((seed * 23 + i * 7) % 90)
    const delC = 2 + ((seed * 9 + i * 5) % 40)
    const visitTotal = 250 + ((seed * 13 + i * 19) % 300)
    const checkTotal = Math.round(visitTotal * (0.15 + (seed * 0.02))) + ((seed * i) % 12)
    const visitDone = Math.round(visitTotal * (0.88 + (seed * 0.01) - i * 0.015))
    const checkDone = Math.round(checkTotal * (0.85 + (seed * 0.015) - i * 0.02))
    grids.push({
      gridName: `第00${i}网格`,
      gridder: griddersPool[gridIdx % griddersPool.length],
      newCount: newC,
      editCount: editC,
      delCount: delC,
      visitTotal,
      visitDone: Math.min(visitDone, visitTotal),
      visitRate: 0,
      checkTotal,
      checkDone: Math.min(checkDone, checkTotal),
      checkRate: 0
    })
  }
  grids.forEach(g => {
    g.visitRate = Math.round(g.visitDone / g.visitTotal * 100)
    g.checkRate = Math.round(g.checkDone / g.checkTotal * 100)
  })
  return grids
}

const communities = computed(() => {
  return communityNames.map((name, idx) => {
    const seed = idx + 1
    const grids = genGrids(seed)
    const newCount = grids.reduce((s, g) => s + g.newCount, 0)
    const editCount = grids.reduce((s, g) => s + g.editCount, 0)
    const delCount = grids.reduce((s, g) => s + g.delCount, 0)
    const visitTotal = grids.reduce((s, g) => s + g.visitTotal, 0)
    const visitDone = grids.reduce((s, g) => s + g.visitDone, 0)
    const checkTotal = grids.reduce((s, g) => s + g.checkTotal, 0)
    const checkDone = grids.reduce((s, g) => s + g.checkDone, 0)
    const infoCompleteness = 88 + ((seed * 3) % 11)
    return {
      name,
      seed,
      infoCompleteness,
      newCount, editCount, delCount,
      visitTotal, visitDone, visitRate: Math.round(visitDone / visitTotal * 100),
      checkTotal, checkDone, checkRate: Math.round(checkDone / checkTotal * 100),
      totalTasks: visitTotal + checkTotal,
      doneTasks: visitDone + checkDone,
      taskFinishRate: Math.round((visitDone + checkDone) / (visitTotal + checkTotal) * 100),
      grids
    }
  })
})

const current = computed(() => {
  return communities.value.find(c => c.name === activeCommunity.value) || communities.value[0]
})

const currentGrid = computed(() => current.value.grids)

// 顶部总计
const totals = computed(() => ({
  totalTasks: communities.value.reduce((s, c) => s + c.totalTasks, 0),
  doneTasks: communities.value.reduce((s, c) => s + c.doneTasks, 0)
}))
const finishRate = computed(() => Math.round(totals.value.doneTasks / Math.max(totals.value.totalTasks, 1) * 100))

// ============ 工具函数 ============
const headerStyle = { background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }

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

const handleQuery = () => { ElMessage.success(`已查询 ${startDate.value} ~ ${endDate.value}`) }
const resetFilter = () => { startDate.value = '2025-01-01'; endDate.value = '2025-06-30'; ElMessage.info('已重置') }
const handleExport = () => { ElMessage.success('社区工作统计报表导出中...') }
</script>

<style scoped>
.community-report-page { padding: 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
}
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.page-subtitle { font-size: 13px; color: #94a3b8; }

.content-card {
  background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;
  padding: 16px 20px; margin-bottom: 16px;
}

.filter-card { padding: 14px 20px; }
.filter-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-label { font-size: 13px; color: #475569; font-weight: 600; }
.filter-sep { color: #94a3b8; }

/* 统计卡 */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;
  transition: transform .15s ease, box-shadow .15s ease;
  position: relative; overflow: hidden;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30, 64, 175, .08); }
.stat-card::after {
  content: ''; position: absolute; right: -24px; top: -24px; width: 96px; height: 96px;
  border-radius: 50%; opacity: .06;
}
.stat-total::after { background: #1e40af; }
.stat-done::after { background: #15803d; }
.stat-undone::after { background: #d97706; }
.stat-rate::after { background: #6d28d9; }

.stat-icon {
  width: 48px; height: 48px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: #fff; flex-shrink: 0;
}
.stat-total .stat-icon { background: linear-gradient(135deg, #1e40af, #3b82f6); }
.stat-done .stat-icon { background: linear-gradient(135deg, #15803d, #22c55e); }
.stat-undone .stat-icon { background: linear-gradient(135deg, #d97706, #f59e0b); }
.stat-rate .stat-icon { background: linear-gradient(135deg, #6d28d9, #a855f7); }

.stat-info { flex: 1; min-width: 0; }
.stat-top-row { display: flex; align-items: baseline; gap: 4px; }
.stat-value { font-size: 26px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-unit { font-size: 12px; color: #64748b; }
.stat-label { font-size: 13px; color: #64748b; margin-top: 3px; display: block; }
.stat-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* 主体卡片 */
.main-card { }
.card-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap;
}
.card-title {
  font-size: 15px; font-weight: 700; color: #1f2937;
  display: inline-flex; align-items: center; gap: 6px;
}
.card-desc { font-size: 12px; color: #94a3b8; }

.two-col-layout { display: flex; gap: 16px; align-items: flex-start; }

/* 左侧社区 */
.community-side {
  width: 240px; flex-shrink: 0;
  background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;
}
.side-title {
  font-size: 12px; font-weight: 600; color: #64748b;
  padding: 4px 8px 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 6px;
}
.community-list { list-style: none; padding: 0; margin: 0; }
.community-item {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 12px; border-radius: 6px; cursor: pointer;
  transition: background .15s ease;
}
.community-item:hover { background: #fff; }
.community-item.active {
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border: 1px solid #bfdbfe;
}
.c-name { font-size: 14px; font-weight: 600; color: #1f2937; }
.c-rate { display: flex; align-items: center; gap: 6px; }
.rate-text { font-size: 12px; color: #64748b; font-family: ui-monospace, Consolas, monospace; }

/* 右侧主体 */
.detail-main { flex: 1; min-width: 0; }

.current-summary {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 18px;
  padding: 12px 16px; background: linear-gradient(135deg, #f8fafc, #fff);
  border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 14px;
}
.cs-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; border-bottom: 1px dashed #e2e8f0;
}
.cs-item:nth-last-child(-n+3) { border-bottom: none; }
.cs-label { font-size: 12.5px; color: #64748b; }
.cs-value {
  font-size: 14px; font-weight: 600; color: #1f2937;
  display: inline-flex; align-items: center; gap: 8px;
}
.cs-value.highlight { color: #1e40af; font-size: 16px; }

.table-toolbar { margin-bottom: 10px; }
.table-title { font-size: 13px; color: #475569; }
.table-title strong { color: #1e40af; font-size: 15px; margin-right: 4px; }
</style>
