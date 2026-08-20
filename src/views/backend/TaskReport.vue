<template>
  <div class="task-report-page">
    <div class="page-layout">
      <!-- 左侧任务列表 -->
      <div class="task-sidebar">
        <div class="sidebar-header">
          <el-input v-model="searchKeyword" placeholder="请输入任务名称" size="default" :prefix-icon="Search" clearable />
        </div>
        <div class="task-list">
          <div class="task-group">
            <div class="group-title" @click="toggleGroup('periodic')">
              <span class="group-arrow" :class="{ expanded: groupExpanded.periodic }">▶</span>
              <span>走访任务</span>
            </div>
            <div v-show="groupExpanded.periodic" class="group-items">
              <div
                v-for="task in filteredPeriodicTasks"
                :key="task.id"
                class="task-item"
                :class="{ active: selectedTask?.id === task.id }"
                @click="selectTask(task)"
              >
                {{ task.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主内容区 -->
      <div class="task-main">
        <div class="main-header">
          <div class="filter-bar">
            <span class="filter-label">所属社区</span>
            <el-select v-model="filterCommunity" placeholder="请选择所属社区" clearable style="width: 200px">
              <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
            </el-select>
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>
          <div class="export-bar">
            <el-button @click="handleExport('excel')">
              <el-icon><Download /></el-icon>
              导出EXCEL
            </el-button>
            <el-button @click="handleExport('pdf')">
              <el-icon><Download /></el-icon>
              导出PDF
            </el-button>
          </div>
        </div>

        <el-table :data="pagedData" border stripe class="task-table">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="period" label="任务周期" min-width="280" show-overflow-tooltip />
          <el-table-column prop="community" label="所属社区" width="140" />
          <el-table-column prop="totalCount" label="任务总数" width="100" align="center" />
          <el-table-column prop="completedCount" label="已完成任务总数" width="130" align="center" />
          <el-table-column prop="uncompletedCount" label="未完成任务总数" width="130" align="center" />
          <el-table-column prop="reviewer" label="审核人" width="120" align="center" />
          <el-table-column prop="completionRate" label="完成率" width="110" align="center">
            <template #default="{ row }">
              <span :class="{ 'rate-high': row.rate >= 90, 'rate-mid': row.rate >= 50 && row.rate < 90, 'rate-low': row.rate < 50 }">{{ row.rate }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openGridDialog(row)">网格任务完成情况</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-bar">
          <span class="total-text">共 {{ filteredData.length }} 条</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredData.length"
            layout="sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </div>
    </div>

    <!-- 网格任务完成情况弹窗 -->
    <el-dialog v-model="gridDialogVisible" :title="gridDialogTitle" width="680px" :close-on-click-modal="false">
      <div class="grid-dialog-content" v-if="currentRow">
        <div class="dialog-info">
          <div class="info-row">
            <span class="info-label">任务名称：</span>
            <span class="info-value">{{ currentRow.taskName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">任务周期：</span>
            <span class="info-value">{{ currentRow.period }}</span>
          </div>
        </div>
        <div class="dialog-actions-bar">
          <el-button @click="handleGridExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
        <el-table :data="gridData" border stripe class="grid-table">
          <el-table-column prop="gridName" label="网格名称" width="180" />
          <el-table-column prop="total" label="任务总数" width="120" align="center" />
          <el-table-column prop="completed" label="已完成任务总数" width="160" align="center" />
          <el-table-column prop="uncompleted" label="未完成任务总数" width="160" align="center" />
          <el-table-column prop="rate" label="完成率" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.rate }}%</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const communities = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区']

const groupExpanded = ref({ periodic: true })
const toggleGroup = (key) => {
  groupExpanded.value[key] = !groupExpanded.value[key]
}

const searchKeyword = ref('')

const periodicTasks = [
  { id: 'p1', name: '2026高龄老人走访任务' },
  { id: 'p2', name: '2026残疾人走访任务' },
  { id: 'p3', name: '2026刑满释放人员走访任务' },
  { id: 'p4', name: '2026在矫人员走访任务' },
  { id: 'p5', name: '2026涉毒人员走访任务' },
  { id: 'p6', name: '2026精神病人走访任务' },
  { id: 'p7', name: '2026低保走访任务' },
  { id: 'p8', name: '65岁以上独居老人走访' },
  { id: 'p9', name: '"留守儿童"走访' }
]

const filteredPeriodicTasks = computed(() =>
  periodicTasks.filter(t => t.name.includes(searchKeyword.value))
)

const filterCommunity = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const allData = ref([])

const reviewerNames = ['李某某', '王某某', '张某某', '刘某某', '陈某某']

const generateReportData = (task) => {
  if (!task) return
  const data = []
  const basePeriod = '2026-07-01 00:00:00~2026-09-30 00:00:00'
  communities.forEach((comm, idx) => {
    const total = Math.floor(Math.random() * 120) + 5
    const completed = Math.floor(total * Math.random())
    const uncompleted = total - completed
    const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00'
    data.push({
      id: task.id + '_' + comm,
      taskName: task.name,
      period: basePeriod,
      community: comm,
      totalCount: total,
      completedCount: completed,
      uncompletedCount: uncompleted,
      reviewer: reviewerNames[idx % reviewerNames.length],
      rate: parseFloat(rate)
    })
  })
  allData.value = data
  currentPage.value = 1
}

// 默认选中第一个走访任务
const selectedTask = ref(periodicTasks[0])
const selectTask = (task) => {
  selectedTask.value = task
  generateReportData(task)
}

// 初始化加载数据
generateReportData(periodicTasks[0])

const filteredData = computed(() => {
  if (!filterCommunity.value) return allData.value
  return allData.value.filter(d => d.community === filterCommunity.value)
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const handleQuery = () => {
  currentPage.value = 1
  ElMessage.success('查询完成')
}

const handleExport = (type) => {
  ElMessage.success(`${type === 'excel' ? 'EXCEL' : 'PDF'}导出功能触发（功能框架已完成）`)
}

// 网格弹窗
const gridDialogVisible = ref(false)
const currentRow = ref(null)
const gridData = ref([])

const gridDialogTitle = computed(() => {
  if (!currentRow.value) return ''
  return `【${currentRow.value.community}】网格任务完成情况`
})

const openGridDialog = (row) => {
  currentRow.value = row
  const grids = ['001网格', '002网格', '003网格']
  gridData.value = grids.map(g => {
    const total = Math.floor(Math.random() * 10) + 1
    const completed = Math.floor(total * Math.random())
    const uncompleted = total - completed
    const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00'
    return {
      gridName: g,
      total,
      completed,
      uncompleted,
      rate
    }
  })
  gridDialogVisible.value = true
}

const handleGridExport = () => {
  ElMessage.success('网格报表导出功能触发（功能框架已完成）')
}
</script>

<style scoped>
.task-report-page {
  padding: 0;
}
.page-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 100px);
}
.task-sidebar {
  width: 260px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.task-group {
  margin-bottom: 4px;
}
.group-title {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.group-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  color: #94a3b8;
}
.group-arrow.expanded {
  transform: rotate(90deg);
}
.group-items {
  padding: 0 8px;
}
.task-item {
  padding: 7px 10px;
  font-size: 13px;
  color: #334155;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-item:hover {
  background: #f1f5f9;
}
.task-item.active {
  background: #eff6ff;
  color: #1e40af;
  font-weight: 500;
}

.task-main {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.main-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}
.export-bar {
  display: flex;
  gap: 10px;
}

.task-table {
  flex: 1;
}
.task-table :deep(.el-table) {
  border-radius: 0;
}
.rate-high { color: #15803d; font-weight: 600; }
.rate-mid { color: #d97706; font-weight: 600; }
.rate-low { color: #dc2626; font-weight: 600; }

.pagination-bar {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
}
.total-text {
  font-size: 13px;
  color: #64748b;
}

/* 弹窗 */
.grid-dialog-content {
  padding: 0 8px;
}
.dialog-info {
  background: #f8fafc;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 12px;
}
.info-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
}
.info-label {
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
}
.info-value {
  color: #1f2937;
}
.dialog-actions-bar {
  margin-bottom: 12px;
}
.grid-table {
  width: 100%;
}
</style>
