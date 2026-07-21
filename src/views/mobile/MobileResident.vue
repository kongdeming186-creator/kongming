<template>
  <div class="mobile-resident">
    <header class="resident-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <h1>居民信息</h1>
      <span></span>
    </header>
    
    <div v-if="resident" class="resident-content">
      <div class="profile-card">
        <div class="avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="profile-info">
          <h2>{{ resident.name }}</h2>
          <p>{{ resident.community }} · {{ resident.grid }}</p>
        </div>
      </div>
      
      <div class="info-card">
        <h3>基础信息</h3>
        <div class="info-row">
          <span class="info-label">身份证号</span>
          <span class="info-value">{{ maskIdCard(resident.idCard) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">联系方式</span>
          <span class="info-value">{{ resident.contact }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">户籍地址</span>
          <span class="info-value">{{ resident.householdAddress }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">居住地</span>
          <span class="info-value">{{ resident.residenceAddress }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">人员类别</span>
          <span class="info-value">{{ resident.personType }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">生存状态</span>
          <el-tag :type="getSurvivalType(resident.survivalStatus)">{{ resident.survivalStatus }}</el-tag>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-header">
          <h3>已享受标签</h3>
          <span class="count">{{ residentTags.length }}个</span>
        </div>
        <div class="tags-grid">
          <div v-for="tag in residentTags" :key="tag.id" class="tag-card" @click="showTagDetail(tag)">
            <div class="tag-header">
              <el-tag :type="getTagType(tag.tagType)" size="small">{{ tag.tagType }}</el-tag>
              <span>{{ tag.tagSubType }}</span>
            </div>
            <div class="tag-info">
              <span>生效：{{ tag.effectiveDate }}</span>
              <span>金额：{{ tag.subsidyAmount || 0 }}元</span>
            </div>
          </div>
        </div>
        <div v-if="residentTags.length === 0" class="empty-tags">
          <p>暂无标签信息</p>
        </div>
      </div>
    </div>
    
    <div class="bottom-nav">
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>任务</span>
      </button>
      <button class="nav-item active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>居民</span>
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
        <span>我的</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { residents, tags } from '../../data/mock'

const router = useRouter()
const route = useRoute()

const residentId = route.params.id
const resident = ref(residents.find(r => r.id === residentId) || {})

const residentTags = computed(() => tags.filter(t => t.residentId === residentId))

const maskIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.slice(0, 6) + '**********' + idCard.slice(-4)
}

const getSurvivalType = (status) => {
  const map = { '在世': 'success', '已去世': 'danger', '待核实': 'warning' }
  return map[status] || 'info'
}

const getTagType = (type) => {
  const map = {
    '低保': 'danger', '残疾': 'warning', '公租房': 'info',
    '老年': 'success', '计生': 'primary', '社保': 'primary',
    '重症': 'danger', '涉军': 'success', '支农返汉': 'info', '困境儿童': 'warning'
  }
  return map[type] || 'info'
}

const goBack = () => {
  router.push('/mobile/tasks')
}

const showTagDetail = (tag) => {
  ElMessage.info(`标签详情：${tag.tagType} - ${tag.tagSubType}`)
}
</script>

<style scoped>
.mobile-resident {
  min-height: 100vh;
  padding-bottom: 70px;
}

.resident-header {
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

.resident-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.resident-content {
  padding: 10px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.avatar {
  width: 64px;
  height: 64px;
  background: #1890FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar svg {
  width: 32px;
  height: 32px;
}

.profile-info h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}

.profile-info p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.count {
  font-size: 12px;
  color: #999;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
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

.tags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tag-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.tag-header span {
  font-size: 13px;
  font-weight: 500;
}

.tag-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

.empty-tags {
  text-align: center;
  padding: 20px;
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
