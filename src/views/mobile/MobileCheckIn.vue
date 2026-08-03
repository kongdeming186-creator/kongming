<template>
  <div class="mobile-checkin">
    <header class="checkin-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <h1>工作打卡</h1>
      <span></span>
    </header>

    <div class="checkin-content">
      <!-- 当前状态 -->
      <div class="status-card">
        <div class="status-icon" :class="checkinStatus">
          <el-icon v-if="checkinStatus === 'checked-in'"><CircleCheck /></el-icon>
          <el-icon v-else-if="checkinStatus === 'checked-out'"><CircleCheck /></el-icon>
          <el-icon v-else><Clock /></el-icon>
        </div>
        <div class="status-info">
          <h3 v-if="checkinStatus === 'checked-in'">工作中</h3>
          <h3 v-else-if="checkinStatus === 'checked-out'">已下班</h3>
          <h3 v-else>未打卡</h3>
          <p v-if="checkinTime">上班时间 {{ checkinTime }}</p>
          <p v-if="checkoutTime">下班时间 {{ checkoutTime }}</p>
        </div>
      </div>

      <!-- 打卡按钮 -->
      <div class="checkin-action">
        <button class="checkin-btn" :class="checkinStatus" @click="handleCheckIn">
          <span class="btn-text" v-if="checkinStatus === 'unchecked'">上班打卡</span>
          <span class="btn-text" v-else-if="checkinStatus === 'checked-in'">下班打卡</span>
          <span class="btn-text" v-else>今日已完成</span>
          <span class="btn-time">{{ currentTime }}</span>
        </button>
      </div>

      <!-- 今日统计 -->
      <div class="today-stats">
        <h3>今日工作统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ todayTasks }}</span>
            <span class="stat-label">任务数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ todayVisits }}</span>
            <span class="stat-label">走访数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ todayUpdates }}</span>
            <span class="stat-label">信息更新</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ todayDangers }}</span>
            <span class="stat-label">隐患上报</span>
          </div>
        </div>
      </div>

      <!-- 打卡记录 -->
      <div class="record-section">
        <h3>本月打卡记录</h3>
        <div class="record-list">
          <div v-for="record in checkinRecords" :key="record.date" class="record-item">
            <div class="record-date">{{ record.date }}</div>
            <div class="record-times">
              <span class="record-in" v-if="record.checkIn">上班 {{ record.checkIn }}</span>
              <span class="record-out" v-if="record.checkOut">下班 {{ record.checkOut }}</span>
              <span class="record-miss" v-if="!record.checkIn && !record.checkOut">缺卡</span>
            </div>
            <div class="record-status">
              <el-tag :type="record.status === '正常' ? 'success' : 'danger'" size="small">{{ record.status }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const checkinStatus = ref('unchecked')
const checkinTime = ref('')
const checkoutTime = ref('')

const currentTime = computed(() => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

const todayTasks = ref(3)
const todayVisits = ref(2)
const todayUpdates = ref(5)
const todayDangers = ref(1)

const checkinRecords = ref([
  { date: '06-20', checkIn: '08:30', checkOut: '17:30', status: '正常' },
  { date: '06-19', checkIn: '08:45', checkOut: '17:15', status: '正常' },
  { date: '06-18', checkIn: '08:20', checkOut: '17:45', status: '正常' },
  { date: '06-17', checkIn: '09:00', checkOut: '17:30', status: '迟到' },
  { date: '06-16', checkIn: '08:35', checkOut: '', status: '缺卡' }
])

const handleCheckIn = () => {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  if (checkinStatus.value === 'unchecked') {
    checkinStatus.value = 'checked-in'
    checkinTime.value = timeStr
    ElMessage.success(`上班打卡成功 ${timeStr}`)
  } else if (checkinStatus.value === 'checked-in') {
    checkinStatus.value = 'checked-out'
    checkoutTime.value = timeStr
    ElMessage.success(`下班打卡成功 ${timeStr}`)
  }
}

const goBack = () => {
  router.push('/mobile/checkin')
}
</script>

<style scoped>
.mobile-checkin {
  min-height: 100vh;
  background: #f5f7fa;
}

.checkin-header {
  background: #1890FF;
  padding: 16px 20px;
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

.back-btn svg {
  width: 20px;
  height: 20px;
}

.checkin-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.checkin-content {
  padding: 16px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.status-icon.unchecked {
  background: #f5f7fa;
  color: #999;
}

.status-icon.checked-in {
  background: #e6f7ff;
  color: #1890FF;
}

.status-icon.checked-out {
  background: #f6ffed;
  color: #52c41a;
}

.status-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}

.status-info p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.checkin-action {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.checkin-btn {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.checkin-btn.unchecked {
  background: linear-gradient(135deg, #1890FF, #096dd9);
}

.checkin-btn.checked-in {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.checkin-btn.checked-out {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-text {
  font-size: 20px;
}

.btn-time {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.9;
}

.today-stats {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.today-stats h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1890FF;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.record-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.record-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-date {
  font-size: 13px;
  color: #666;
  min-width: 50px;
}

.record-times {
  flex: 1;
  display: flex;
  gap: 12px;
}

.record-in {
  font-size: 13px;
  color: #1890FF;
}

.record-out {
  font-size: 13px;
  color: #52c41a;
}

.record-miss {
  font-size: 13px;
  color: #f5222d;
}
</style>