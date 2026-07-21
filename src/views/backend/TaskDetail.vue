<template>
  <div class="page-container">
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回
      </div>
      <h2 class="page-title">{{ task.title }}</h2>
    </div>
    
    <div class="content-card">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="任务信息" name="info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">任务类型</span>
              <el-tag :type="getTaskType(task.taskType)">{{ task.taskType }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">紧急程度</span>
              <el-tag :type="task.urgency === '紧急' ? 'danger' : 'warning'">{{ task.urgency }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">处理状态</span>
              <el-tag :type="getStatusType(task.status)">{{ task.status }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">网格</span>
              <span class="info-value">{{ task.gridName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">网格员</span>
              <span class="info-value">{{ task.assignee }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ task.createTime }}</span>
            </div>
          </div>
          
          <div class="section">
            <h4>居民信息</h4>
            <div class="resident-info">
              <div class="resident-item">
                <span>姓名：</span>
                <span class="value">{{ task.residentName }}</span>
              </div>
              <div class="resident-item">
                <span>地址：</span>
                <span class="value">{{ task.residentAddress }}</span>
              </div>
              <div class="resident-item">
                <span>联系方式：</span>
                <span class="value">{{ task.residentContact }}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h4>任务要求</h4>
            <p class="requirement-text">{{ task.requirements }}</p>
          </div>
          
          <div class="section">
            <h4>需反馈材料</h4>
            <div class="materials">
              <el-tag v-for="m in task.feedbackMaterials" :key="m" size="small">{{ m }}</el-tag>
            </div>
          </div>
          
          <div class="section">
            <h4>任务来源预警</h4>
            <div class="warning-link" @click="goToWarning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>查看预警详情</span>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="处理记录" name="history">
          <div class="timeline">
            <div class="timeline-item" v-for="(record, index) in processHistory" :key="index">
              <div class="timeline-dot" :class="record.type"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">{{ record.title }}</span>
                  <span class="timeline-time">{{ record.time }}</span>
                </div>
                <p class="timeline-desc">{{ record.description }}</p>
                <div v-if="record.operator" class="timeline-operator">操作人：{{ record.operator }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="content-card action-card">
      <div class="action-buttons">
        <el-button @click="handleReassign">重新指派</el-button>
        <el-button type="warning" @click="handleUrgent">加急标记</el-button>
        <el-button type="primary" @click="handleExtend">延期申请</el-button>
        <el-button type="success" @click="handleComplete">标记完成</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { tasks } from '../../data/mock'

const router = useRouter()
const route = useRoute()

const taskId = route.params.id
const task = ref(tasks.find(t => t.id === taskId) || {})
const activeTab = ref('info')

const processHistory = ref([
  { type: 'create', title: '任务创建', time: '2024-06-20 10:35', description: '系统根据预警消息自动创建任务', operator: '系统' },
  { type: 'assign', title: '任务指派', time: '2024-06-20 10:36', description: '指派给网格员小王', operator: '管理员' },
  { type: 'process', title: '开始处理', time: '2024-06-20 14:00', description: '网格员已开始处理该任务', operator: '网格员小王' }
])

const getTaskType = (type) => {
  const map = { '核实任务': 'danger', '办理任务': 'primary', '年审任务': 'warning' }
  return map[type] || 'info'
}

const getStatusType = (status) => {
  const map = { '待处理': 'danger', '处理中': 'warning', '已完成': 'success', '转办': 'info', '挂起': 'info' }
  return map[status] || 'info'
}

const goBack = () => {
  router.push('/task')
}

const goToWarning = () => {
  router.push('/warning')
}

const handleReassign = () => {
  ElMessage.info('重新指派功能开发中')
}

const handleUrgent = () => {
  ElMessage.success('已标记为加急')
}

const handleExtend = () => {
  ElMessage.info('延期申请功能开发中')
}

const handleComplete = () => {
  task.value.status = '已完成'
  processHistory.value.push({
    type: 'complete',
    title: '任务完成',
    time: new Date().toLocaleString(),
    description: '管理员标记任务已完成',
    operator: '管理员'
  })
  ElMessage.success('任务已标记完成')
}
</script>

<style scoped>
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.section {
  margin-bottom: 24px;
}

.section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.resident-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
}

.resident-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.resident-item .value {
  color: #333;
  font-weight: 500;
}

.requirement-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin: 0;
  line-height: 1.6;
}

.materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.warning-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1890FF;
  cursor: pointer;
}

.warning-link svg {
  width: 18px;
  height: 18px;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e8e8e8;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -16px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1890FF;
}

.timeline-dot.create { background: #1890FF; }
.timeline-dot.assign { background: #FAAD14; }
.timeline-dot.process { background: #52C41A; }
.timeline-dot.complete { background: #52C41A; }

.timeline-content {
  padding-left: 12px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
}

.timeline-time {
  font-size: 12px;
  color: #999;
}

.timeline-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.timeline-operator {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.action-card {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
