<template>
  <div class="mobile-tasks">
    <header class="task-header">
      <h1>我的任务</h1>
      <div class="header-right">
        <button class="icon-btn" aria-label="通知">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
      </div>
    </header>
    
    <div class="filter-bar">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待处理" name="pending" />
        <el-tab-pane label="处理中" name="processing" />
        <el-tab-pane label="已完成" name="done" />
      </el-tabs>
    </div>
    
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索居民姓名…" autocomplete="off" />
    </div>
    
    <div class="task-list">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card" @click="goToDetail(task.id)" role="button" tabindex="0" @keydown.enter="goToDetail(task.id)" @keydown.space.prevent="goToDetail(task.id)">
        <div class="task-header-row">
          <el-tag :type="getTaskType(task.taskType)" size="small">{{ task.taskType }}</el-tag>
          <el-tag :type="task.urgency === '紧急' ? 'danger' : 'warning'" size="small">{{ task.urgency }}</el-tag>
        </div>
        <h3 class="task-title">{{ task.title }}</h3>
        <div class="task-info">
          <span>{{ task.residentName }}</span>
          <span>{{ task.residentAddress }}</span>
        </div>
        <div class="task-footer">
          <span class="task-status" :class="task.status">{{ task.status }}</span>
          <span class="task-time">{{ task.createTime }}</span>
        </div>
      </div>
    </div>
    
    <div class="bottom-nav">
      <button class="nav-item active" aria-label="任务">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>任务</span>
      </button>
      <button class="nav-item" aria-label="居民">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>居民</span>
      </button>
      <button class="nav-item" aria-label="我的">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
        <span>我的</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tasks } from '../../data/mock'

const router = useRouter()

const activeTab = ref('all')
const keyword = ref('')

const filteredTasks = computed(() => {
  let result = tasks
  if (keyword.value) {
    result = result.filter(t => t.residentName.includes(keyword.value))
  }
  if (activeTab.value === 'pending') {
    result = result.filter(t => t.status === '待处理')
  } else if (activeTab.value === 'processing') {
    result = result.filter(t => t.status === '处理中')
  } else if (activeTab.value === 'done') {
    result = result.filter(t => t.status === '已完成')
  }
  return result
})

const getTaskType = (type) => {
  const map = { '核实任务': 'danger', '办理任务': 'primary', '年审任务': 'warning' }
  return map[type] || 'info'
}

const goToDetail = (id) => {
  router.push(`/mobile/task/detail/${id}`)
}
</script>

<style scoped>
.mobile-tasks {
  min-height: 100vh;
  padding-bottom: 70px;
}

.task-header {
  background: #1890FF;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.task-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  padding: 8px;
}

.filter-bar {
  padding: 10px;
}

.search-bar {
  padding: 0 10px 10px;
}

.task-list {
  padding: 0 10px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-header-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.task-info {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
}

.task-status {
  padding: 2px 8px;
  border-radius: 4px;
}

.task-status.待处理 { background: #fff2f0; color: #ff4d4f; }
.task-status.处理中 { background: #fffbe6; color: #faad14; }
.task-status.已完成 { background: #f6ffed; color: #52c41a; }

.task-time {
  color: #999;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  border-top: 1px solid #e8e8e8;
  padding: 10px 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #999;
  font-size: 12px;
}

.nav-item.active {
  color: #1890FF;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}
</style>
