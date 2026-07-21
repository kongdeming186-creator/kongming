<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">网格员管理</h2>
        <p class="page-desc">管理辖区内网格员信息，查看工作台账与考核情况</p>
      </div>
      <div class="header-actions">
        <el-button @click="showAddWorkerDialog = true">
          <el-icon><Plus /></el-icon>添加网格员
        </el-button>
      </div>
    </div>
    
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ gridWorkers.length }}</span>
          <span class="stat-label">网格员总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ qualifiedCount }}</span>
          <span class="stat-label">考核合格</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ unqualifiedCount }}</span>
          <span class="stat-label">考核不合格</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ excellentCount }}</span>
          <span class="stat-label">优秀网格员</span>
        </div>
      </div>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <span class="card-title">网格员列表</span>
        <div class="search-bar">
          <el-input placeholder="搜索网格员姓名、网格" v-model="searchKeyword" clearable style="width: 200px;" />
          <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 120px;">
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
      
      <el-table :data="filteredWorkers" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="gender" label="性别" width="60" align="center" />
        <el-table-column prop="age" label="年龄" width="60" align="center" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="grid" label="所属网格" width="100" />
        <el-table-column prop="community" label="社区" width="100" />
        <el-table-column prop="position" label="岗位" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.position === '委员顶岗' ? 'warning' : 'info'" size="small">{{ scope.row.position }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="abPost" label="A/B岗" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.abPost === 'A岗' ? 'primary' : scope.row.abPost === 'B岗' ? 'info' : 'warning'" size="small">
              {{ scope.row.abPost }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentStatus" label="考核状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.assessmentStatus === '优秀' ? 'success' : scope.row.assessmentStatus === '合格' ? 'primary' : 'danger'" size="small">
              {{ scope.row.assessmentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="monthlyScore" label="月度得分" width="100" align="center">
          <template #default="scope">
            <span :class="{ 'score-high': scope.row.monthlyScore >= 90, 'score-medium': scope.row.monthlyScore >= 70 && scope.row.monthlyScore < 90, 'score-low': scope.row.monthlyScore < 70 }">
              {{ scope.row.monthlyScore }}分
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本月指标" width="200">
          <template #default="scope">
            <div class="target-info">
              <div class="target-row">
                <span class="target-label">信息更新</span>
                <span class="target-value">{{ scope.row.monthlyActual.infoUpdates }}/{{ scope.row.monthlyTargets.infoUpdates }}</span>
              </div>
              <div class="target-row">
                <span class="target-label">隐患上报</span>
                <span class="target-value">{{ scope.row.monthlyActual.hiddenDangers }}/{{ scope.row.monthlyTargets.hiddenDangers }}</span>
              </div>
              <div class="target-row">
                <span class="target-label">走访记录</span>
                <span class="target-value">{{ scope.row.monthlyActual.visitRecords }}/{{ scope.row.monthlyTargets.visitRecords }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="editWorker(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteWorker(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog title="添加网格员" v-model="showAddWorkerDialog" width="500px">
      <el-form :model="workerForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="workerForm.name" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-select v-model="workerForm.gender">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" required>
          <el-input v-model.number="workerForm.age" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="workerForm.phone" />
        </el-form-item>
        <el-form-item label="所属网格" required>
          <el-select v-model="workerForm.grid">
            <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="社区" required>
          <el-select v-model="workerForm.community">
            <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="workerForm.position">
            <el-option label="网格员" value="网格员" />
            <el-option label="委员顶岗" value="委员顶岗" />
          </el-select>
        </el-form-item>
        <el-form-item label="A/B岗">
          <el-select v-model="workerForm.abPost">
            <el-option label="A岗" value="A岗" />
            <el-option label="B岗" value="B岗" />
            <el-option label="顶岗" value="顶岗" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期">
          <el-date-picker v-model="workerForm.hireDate" type="date" />
        </el-form-item>
        <el-form-item label="学历">
          <el-input v-model="workerForm.education" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddWorkerDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddWorker">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="网格员详情" v-model="showDetailDialog" width="600px">
      <div v-if="selectedWorker" class="detail-content">
        <div class="detail-header">
          <el-avatar :size="64" class="detail-avatar">
            {{ selectedWorker.name?.charAt(0) }}
          </el-avatar>
          <div class="detail-info">
            <h3 class="detail-name">{{ selectedWorker.name }}</h3>
            <div class="detail-meta">
              <span>{{ selectedWorker.gender }} · {{ selectedWorker.age }}岁</span>
              <span class="meta-divider">|</span>
              <span>{{ selectedWorker.grid }}</span>
              <span class="meta-divider">|</span>
              <span>{{ selectedWorker.position }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">联系电话</span>
              <span class="info-value">{{ selectedWorker.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属社区</span>
              <span class="info-value">{{ selectedWorker.community }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">A/B岗</span>
              <span class="info-value">{{ selectedWorker.abPost }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入职日期</span>
              <span class="info-value">{{ selectedWorker.hireDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">工作年限</span>
              <span class="info-value">{{ selectedWorker.workExperience }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学历</span>
              <span class="info-value">{{ selectedWorker.education }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">本月工作指标</h4>
          <div class="target-grid">
            <div class="target-card">
              <div class="target-header">信息更新</div>
              <div class="target-progress">
                <el-progress :percentage="getRate(selectedWorker.monthlyActual.infoUpdates, selectedWorker.monthlyTargets.infoUpdates)" :color="getProgressColor(selectedWorker.monthlyActual.infoUpdates, selectedWorker.monthlyTargets.infoUpdates)" />
              </div>
              <div class="target-footer">{{ selectedWorker.monthlyActual.infoUpdates }}/{{ selectedWorker.monthlyTargets.infoUpdates }}</div>
            </div>
            <div class="target-card">
              <div class="target-header">隐患上报</div>
              <div class="target-progress">
                <el-progress :percentage="getRate(selectedWorker.monthlyActual.hiddenDangers, selectedWorker.monthlyTargets.hiddenDangers)" :color="getProgressColor(selectedWorker.monthlyActual.hiddenDangers, selectedWorker.monthlyTargets.hiddenDangers)" />
              </div>
              <div class="target-footer">{{ selectedWorker.monthlyActual.hiddenDangers }}/{{ selectedWorker.monthlyTargets.hiddenDangers }}</div>
            </div>
            <div class="target-card">
              <div class="target-header">走访记录</div>
              <div class="target-progress">
                <el-progress :percentage="getRate(selectedWorker.monthlyActual.visitRecords, selectedWorker.monthlyTargets.visitRecords)" :color="getProgressColor(selectedWorker.monthlyActual.visitRecords, selectedWorker.monthlyTargets.visitRecords)" />
              </div>
              <div class="target-footer">{{ selectedWorker.monthlyActual.visitRecords }}/{{ selectedWorker.monthlyTargets.visitRecords }}</div>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">考核得分</h4>
          <div class="score-grid">
            <div class="score-card">
              <div class="score-value" :class="getScoreClass(selectedWorker.monthlyScore)">{{ selectedWorker.monthlyScore }}</div>
              <div class="score-label">月度得分</div>
            </div>
            <div class="score-card">
              <div class="score-value" :class="getScoreClass(selectedWorker.quarterlyScore)">{{ selectedWorker.quarterlyScore }}</div>
              <div class="score-label">季度得分</div>
            </div>
            <div class="score-card">
              <div class="score-value" :class="getScoreClass(selectedWorker.annualScore)">{{ selectedWorker.annualScore }}</div>
              <div class="score-label">年度得分</div>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">任务统计</h4>
          <div class="task-stats">
            <div class="task-stat-item">
              <span class="task-stat-value">{{ selectedWorker.totalTasks }}</span>
              <span class="task-stat-label">总任务</span>
            </div>
            <div class="task-stat-item">
              <span class="task-stat-value success">{{ selectedWorker.completedTasks }}</span>
              <span class="task-stat-label">已完成</span>
            </div>
            <div class="task-stat-item">
              <span class="task-stat-value warning">{{ selectedWorker.pendingTasks }}</span>
              <span class="task-stat-label">待处理</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, CircleCheck, Warning, Star } from '@element-plus/icons-vue'
import { gridWorkers, communities, grids } from '../../data/mock'

const showAddWorkerDialog = ref(false)
const showDetailDialog = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const selectedWorker = ref(null)

const workerForm = reactive({
  name: '',
  gender: '男',
  age: '',
  phone: '',
  grid: '',
  community: '',
  position: '网格员',
  abPost: 'A岗',
  hireDate: '',
  education: ''
})

const qualifiedCount = computed(() => gridWorkers.filter(w => w.assessmentStatus === '合格').length)
const unqualifiedCount = computed(() => gridWorkers.filter(w => w.assessmentStatus === '不合格').length)
const excellentCount = computed(() => gridWorkers.filter(w => w.assessmentStatus === '优秀').length)

const filteredWorkers = computed(() => {
  return gridWorkers.filter(worker => {
    const matchKeyword = !searchKeyword.value || 
      worker.name.includes(searchKeyword.value) || 
      worker.grid.includes(searchKeyword.value)
    const matchStatus = !filterStatus.value || worker.status === filterStatus.value
    return matchKeyword && matchStatus
  })
})

const handleSearch = () => {}

const viewDetail = (row) => {
  selectedWorker.value = row
  showDetailDialog.value = true
}

const editWorker = (row) => {
  Object.assign(workerForm, row)
  showAddWorkerDialog.value = true
}

const deleteWorker = (row) => {
  ElMessageBox.confirm('确定要删除该网格员吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleAddWorker = () => {
  showAddWorkerDialog.value = false
  ElMessage.success('添加成功')
}

const getRate = (actual, target) => {
  return Math.round((actual / target) * 100)
}

const getProgressColor = (actual, target) => {
  const rate = (actual / target) * 100
  if (rate >= 100) return '#67c23a'
  if (rate >= 80) return '#409eff'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.page-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 4px 0 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.blue {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.red {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.content-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.score-high {
  color: #67c23a;
  font-weight: 600;
}

.score-medium {
  color: #e6a23c;
  font-weight: 600;
}

.score-low {
  color: #f56c6c;
  font-weight: 600;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.target-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.target-label {
  color: #6b7280;
}

.target-value {
  color: #1f2937;
  font-weight: 500;
}

.detail-content {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 16px;
}

.detail-avatar {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.detail-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
}

.meta-divider {
  color: #d1d5db;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.info-item {
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.target-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.target-card {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.target-header {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.target-progress {
  margin-bottom: 8px;
}

.target-footer {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.score-card {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  display: block;
}

.score-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.task-stats {
  display: flex;
  gap: 24px;
}

.task-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.task-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.task-stat-value.success {
  color: #67c23a;
}

.task-stat-value.warning {
  color: #e6a23c;
}

.task-stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
</style>