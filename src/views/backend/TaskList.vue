<template>
  <div class="task-list-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">任务管理</h2>
        <p class="page-subtitle">共 {{ tasks.length }} 条任务，待处理 {{ pendingCount }} 条</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddTaskDialog = true">
          <el-icon><Plus /></el-icon>派发任务
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue"><el-icon><List /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">任务总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><el-icon><Clock /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待处理</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><el-icon><Calendar /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ todayCount }}</span>
          <span class="stat-label">今日任务</span>
        </div>
      </div>
    </div>

    <!-- 任务分类面板 -->
    <div class="content-card categories-card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-title">任务分类</span>
          <span class="card-desc">网格员日常业务全覆盖，工作留痕数字化</span>
        </div>
        <el-button text @click="showCategoryPanel = !showCategoryPanel">
          {{ showCategoryPanel ? '收起' : '展开' }}
        </el-button>
      </div>
      <div v-show="showCategoryPanel" class="categories-grid">
        <div class="category-item" :class="{ active: filterCategory === 'all' }" @click="filterCategory = 'all'">
          <div class="category-icon all"><el-icon><List /></el-icon></div>
          <span class="category-name">全部任务</span>
          <span class="category-count">{{ totalCount }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '高龄核查' }" @click="filterCategory = '高龄核查'">
          <div class="category-icon elderly"><el-icon><User /></el-icon></div>
          <span class="category-name">高龄核查</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '高龄核查').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '残疾人年审' }" @click="filterCategory = '残疾人年审'">
          <div class="category-icon disability"><el-icon><UserFilled /></el-icon></div>
          <span class="category-name">残疾人年审</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '残疾人年审').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '入户走访' }" @click="filterCategory = '入户走访'">
          <div class="category-icon visit"><el-icon><HomeFilled /></el-icon></div>
          <span class="category-name">入户走访</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '入户走访').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '安全隐患上报' }" @click="filterCategory = '安全隐患上报'">
          <div class="category-icon danger"><el-icon><Warning /></el-icon></div>
          <span class="category-name">隐患上报</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '安全隐患上报').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '民生诉求' }" @click="filterCategory = '民生诉求'">
          <div class="category-icon appeal"><el-icon><ChatDotRound /></el-icon></div>
          <span class="category-name">民生诉求</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '民生诉求').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '信息更新' }" @click="filterCategory = '信息更新'">
          <div class="category-icon info"><el-icon><EditPen /></el-icon></div>
          <span class="category-name">信息更新</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '信息更新').length }}</span>
        </div>
        <div class="category-item" :class="{ active: filterCategory === '预警核实' }" @click="filterCategory = '预警核实'">
          <div class="category-icon warning"><el-icon><Bell /></el-icon></div>
          <span class="category-name">预警核实</span>
          <span class="category-count">{{ tasks.filter(t => t.category === '预警核实').length }}</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <span class="card-title">任务列表</span>
        <div class="search-bar">
          <el-select v-model="filterType" placeholder="任务类型" clearable style="width: 120px">
            <el-option v-for="t in taskTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 110px">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
          <el-select v-model="filterGridWorker" placeholder="网格员" clearable style="width: 110px">
            <el-option v-for="g in gridWorkers" :key="g.id" :label="g.name" :value="g.name" />
          </el-select>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>
      <el-table :data="filteredTasks" border stripe
        :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="title" label="任务标题" min-width="180">
          <template #default="scope">
            <div class="task-title">
              <el-tag v-if="scope.row.category" type="info" size="small" effect="plain">{{ scope.row.category }}</el-tag>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="任务类型" width="110">
          <template #default="scope">
            <el-tag :type="getTaskType(scope.row.type)" size="small" effect="light">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="residentName" label="涉及居民" width="90" />
        <el-table-column prop="gridWorker" label="网格员" width="80" />
        <el-table-column prop="deadline" label="截止日期" width="110" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === '高' ? 'danger' : scope.row.priority === '中' ? 'warning' : 'info'" size="small">{{ scope.row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="任务来源" width="110">
          <template #default="scope">
            <el-tag type="info" size="small" effect="plain">{{ scope.row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="110" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="viewDetail(scope.row)">详情</el-button>
              <el-button v-if="scope.row.status !== '已完成'" type="success" link size="small" @click="handleProcess(scope.row)">处理</el-button>
              <el-button type="danger" link size="small" @click="deleteTask(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="filteredTasks.length"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>

    <el-dialog title="任务详情" v-model="showDetailDialog" width="560px">
      <div v-if="selectedTask" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">任务信息</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">任务标题</span>
              <span class="info-value">{{ selectedTask.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">任务类型</span>
              <span class="info-value"><el-tag :type="getTaskType(selectedTask.type)">{{ selectedTask.type }}</el-tag></span>
            </div>
            <div class="info-row">
              <span class="info-label">任务分类</span>
              <span class="info-value"><el-tag type="info">{{ selectedTask.category }}</el-tag></span>
            </div>
            <div class="info-row">
              <span class="info-label">涉及居民</span>
              <span class="info-value">{{ selectedTask.residentName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">负责网格员</span>
              <span class="info-value">{{ selectedTask.gridWorker }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">截止日期</span>
              <span class="info-value">{{ selectedTask.deadline }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">优先级</span>
              <span class="info-value"><el-tag :type="selectedTask.priority === '高' ? 'danger' : selectedTask.priority === '中' ? 'warning' : 'info'">{{ selectedTask.priority }}</el-tag></span>
            </div>
            <div class="info-row">
              <span class="info-label">任务来源</span>
              <span class="info-value">{{ selectedTask.source }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">任务描述</span>
              <span class="info-value">{{ selectedTask.description || '暂无描述' }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">处理记录</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">当前状态</span>
              <span class="info-value"><el-tag :type="getStatusType(selectedTask.status)">{{ selectedTask.status }}</el-tag></span>
            </div>
            <div class="info-row">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ selectedTask.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="派发任务" v-model="showAddTaskDialog" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input v-model="addForm.title" />
        </el-form-item>
        <el-form-item label="任务分类" required>
          <el-select v-model="addForm.category" style="width: 100%">
            <el-option label="高龄核查" value="高龄核查" />
            <el-option label="残疾人年审" value="残疾人年审" />
            <el-option label="入户走访" value="入户走访" />
            <el-option label="安全隐患上报" value="安全隐患上报" />
            <el-option label="民生诉求" value="民生诉求" />
            <el-option label="信息更新" value="信息更新" />
            <el-option label="预警核实" value="预警核实" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-select v-model="addForm.type" style="width: 100%">
            <el-option v-for="t in taskTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="涉及居民">
          <el-input v-model="addForm.residentName" />
        </el-form-item>
        <el-form-item label="网格员" required>
          <el-select v-model="addForm.gridWorker" style="width: 100%">
            <el-option v-for="g in gridWorkers" :key="g.id" :label="g.name" :value="g.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" required>
          <el-date-picker v-model="addForm.deadline" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-radio-group v-model="addForm.priority">
            <el-radio label="高">高</el-radio>
            <el-radio label="中">中</el-radio>
            <el-radio label="低">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="addForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, List, Clock, CircleCheck, Calendar, User, UserFilled, HomeFilled, Warning, ChatDotRound, EditPen, Bell } from '@element-plus/icons-vue'
import { tasks as mockTasks, taskTypes, gridWorkers } from '../../data/mock'

const tasks = ref([...mockTasks])
const currentPage = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const filterStatus = ref('')
const filterGridWorker = ref('')
const filterCategory = ref('all')
const showCategoryPanel = ref(true)
const showDetailDialog = ref(false)
const showAddTaskDialog = ref(false)
const selectedTask = ref(null)

const totalCount = computed(() => tasks.value.length)
const pendingCount = computed(() => tasks.value.filter(t => t.status === '待处理').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === '已完成').length)
const todayCount = computed(() => tasks.value.filter(t => t.createTime.includes('2024-06-20')).length)

const filteredTasks = computed(() => {
  let result = tasks.value
  if (filterCategory.value !== 'all') result = result.filter(t => t.category === filterCategory.value)
  if (filterType.value) result = result.filter(t => t.type === filterType.value)
  if (filterStatus.value) result = result.filter(t => t.status === filterStatus.value)
  if (filterGridWorker.value) result = result.filter(t => t.gridWorker === filterGridWorker.value)
  return result
})

const addForm = reactive({ title: '', category: '', type: '', residentName: '', gridWorker: '', deadline: '', priority: '中', description: '', source: '手动派发' })

const getTaskType = (type) => ({ '核实': 'warning', '走访': 'success', '年审': 'primary', '采集': 'info', '整改': 'danger' }[type] || 'info')
const getStatusType = (status) => ({ '待处理': 'danger', '处理中': 'warning', '已完成': 'success' }[status] || 'info')

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterType.value = ''; filterStatus.value = ''; filterGridWorker.value = ''; filterCategory.value = 'all'; currentPage.value = 1 }
const viewDetail = (row) => { selectedTask.value = row; showDetailDialog.value = true }
const handleProcess = (row) => {
  ElMessageBox.confirm('确认开始处理该任务？', '处理确认').then(() => {
    row.status = '处理中'; ElMessage.success('已开始处理')
  }).catch(() => {})
}
const deleteTask = (row) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '删除确认', { type: 'warning' }).then(() => {
    tasks.value = tasks.value.filter(t => t.id !== row.id); ElMessage.success('删除成功')
  }).catch(() => {})
}
const confirmAdd = () => {
  tasks.value.unshift({
    id: String(Date.now()), ...addForm,
    status: '待处理', createTime: new Date().toISOString().split('T')[0]
  })
  showAddTaskDialog.value = false
  ElMessage.success('任务派发成功')
}
</script>

<style scoped>
.task-list-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.stat-icon.blue { background: linear-gradient(135deg, #1890FF, #0ea5e9); }
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
.stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; display: block; }
.stat-label { font-size: 12px; color: #6b7280; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); }
.categories-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.card-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.card-desc { font-size: 12px; color: #9ca3af; }

.categories-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; }
.category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 10px; background: #f9fafb; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
.category-item:hover { background: #eff6ff; }
.category-item.active { background: #eff6ff; border-color: #1890FF; }
.category-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
.category-icon.all { background: #6b7280; }
.category-icon.elderly { background: #f59e0b; }
.category-icon.disability { background: #8b5cf6; }
.category-icon.visit { background: #10b981; }
.category-icon.danger { background: #ef4444; }
.category-icon.appeal { background: #3b82f6; }
.category-icon.info { background: #06b6d4; }
.category-icon.warning { background: #f97316; }
.category-name { font-size: 12px; color: #4b5563; font-weight: 500; }
.category-count { font-size: 16px; font-weight: 700; color: #1f2937; }

.search-bar { display: flex; gap: 10px; align-items: center; }
.task-title { display: flex; align-items: center; gap: 8px; }
.action-buttons { display: flex; justify-content: center; gap: 4px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.detail-content { padding: 8px 0; }
.detail-section { margin-bottom: 20px; }
.detail-section:last-child { margin-bottom: 0; }
.section-title { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #409eff; }
.detail-info { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; align-items: center; gap: 12px; }
.info-label { font-size: 13px; color: #6b7280; min-width: 70px; }
.info-value { font-size: 13px; color: #1f2937; font-weight: 500; }
</style>