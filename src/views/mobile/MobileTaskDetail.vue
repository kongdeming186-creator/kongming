<template>
  <div class="mobile-task-detail">
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <h1>任务详情</h1>
      <span></span>
    </header>
    
    <div v-if="task" class="detail-content">
      <div class="task-card">
        <div class="task-header-row">
          <el-tag :type="getTaskType(task.taskType)" size="small">{{ task.taskType }}</el-tag>
          <el-tag :type="task.urgency === '紧急' ? 'danger' : 'warning'" size="small">{{ task.urgency }}</el-tag>
        </div>
        <h2 class="task-title">{{ task.title }}</h2>
        <div class="task-meta">
          <span>{{ task.gridName }}</span>
          <span>{{ task.assignee }}</span>
        </div>
      </div>
      
      <div class="info-card">
        <h3>居民信息</h3>
        <div class="info-row">
          <span class="info-label">姓名</span>
          <span class="info-value">{{ task.residentName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">地址</span>
          <span class="info-value">{{ task.residentAddress }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">联系方式</span>
          <span class="info-value">{{ task.residentContact }}</span>
        </div>
        <button class="contact-btn" @click="handleContact">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          联系居民
        </button>
      </div>
      
      <div class="info-card">
        <h3>任务要求</h3>
        <p class="requirement-text">{{ task.requirements }}</p>
      </div>
      
      <div class="info-card">
        <h3>需反馈材料</h3>
        <div class="materials">
          <el-tag v-for="m in task.feedbackMaterials" :key="m" size="small">{{ m }}</el-tag>
        </div>
      </div>
      
      <div class="info-card">
        <h3>系统已有数据</h3>
        <div class="data-row">
          <span>生存状态</span>
          <span class="value">在世</span>
        </div>
        <div class="data-row">
          <span>享受待遇</span>
          <span class="value">低保、重度护理补贴</span>
        </div>
        <div class="data-row">
          <span>最后更新</span>
          <span class="value">2024-06-15</span>
        </div>
      </div>
    </div>
    
    <div class="bottom-actions">
      <el-button type="primary" @click="goToProcess">开始处理</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { tasks } from '../../data/mock'

const router = useRouter()
const route = useRoute()

const taskId = route.params.id
const task = ref(tasks.find(t => t.id === taskId) || {})

const getTaskType = (type) => {
  const map = { '核实任务': 'danger', '办理任务': 'primary', '年审任务': 'warning' }
  return map[type] || 'info'
}

const goBack = () => {
  router.push('/mobile/tasks')
}

const handleContact = () => {
  ElMessage.info('拨号功能开发中')
}

const goToProcess = () => {
  router.push(`/mobile/task/process/${taskId}`)
}
</script>

<style scoped>
.mobile-task-detail {
  min-height: 100vh;
  padding-bottom: 80px;
}

.detail-header {
  background: #1890FF;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  padding: 8px;
}

.detail-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.detail-content {
  padding: 10px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.task-header-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.task-meta {
  font-size: 13px;
  color: #999;
  display: flex;
  gap: 16px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #999;
}

.info-value {
  font-size: 13px;
  color: #333;
}

.contact-btn {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #1890FF;
}

.requirement-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.data-row .value {
  color: #333;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid #e8e8e8;
}

.bottom-actions .el-button {
  width: 100%;
}
</style>
