<template>
  <div class="tag-recommendation">
    <div class="section-header">
      <div class="section-title-wrapper">
        <div class="section-title-row">
          <span class="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <h3 class="section-title">AI智能推荐</h3>
          <el-tag type="success" size="small" effect="light">AI推荐</el-tag>
        </div>
        <span class="section-desc">基于居民信息智能分析可享受的政策</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-animation">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <span class="loading-text">AI正在分析居民信息...</span>
    </div>

    <!-- 推荐结果 -->
    <div v-else-if="recommendations.length > 0" class="recommendation-list">
      <div 
        v-for="(rec, index) in recommendations" 
        :key="index" 
        class="recommendation-card"
        :class="{ 'high-priority': rec.matchScore >= 90 }"
      >
        <div class="card-header">
          <div class="tag-info">
            <el-tag :type="getTagType(rec.tagType)" size="small" effect="dark">
              {{ rec.tagType }}
            </el-tag>
            <span class="tag-subtype">{{ rec.tagSubType }}</span>
          </div>
          <div class="match-score" :class="getScoreClass(rec.matchScore)">
            <span class="score-value">{{ rec.matchScore }}</span>
            <span class="score-label">%匹配</span>
          </div>
        </div>

        <div class="card-body">
          <div class="reason">
            <div class="reason-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="reason-text">{{ rec.reason }}</div>
          </div>

          <div class="benefits" v-if="rec.benefits">
            <div class="benefits-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="benefits-text">{{ rec.benefits }}</div>
          </div>
        </div>

        <div class="card-footer">
          <el-button 
            size="small" 
            @click="showDetails(rec)"
            class="detail-btn"
          >
            查看详情
          </el-button>
          <el-button 
            type="primary" 
            size="small" 
            @click="applyTag(rec)"
            class="apply-btn"
          >
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </div>
      </div>
    </div>

    <!-- 无推荐 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div class="empty-text">{{ summary }}</div>
    </div>

    <!-- 推荐详情弹窗 -->
    <el-dialog
      v-model="detailsVisible"
      :title="selectedRec ? `政策详情：${selectedRec.tagSubType}` : '政策详情'"
      width="600px"
      class="details-dialog"
    >
      <div v-if="selectedRec" class="details-content">
        <div class="detail-section">
          <div class="detail-label">匹配原因</div>
          <div class="detail-value">{{ selectedRec.reason }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">可享受待遇</div>
          <div class="detail-value benefit-highlight">{{ selectedRec.benefits }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">申请条件</div>
          <ul class="condition-list">
            <li v-for="(condition, idx) in selectedRec.conditions" :key="idx">
              {{ condition }}
            </li>
          </ul>
        </div>

        <div class="detail-section">
          <div class="detail-label">所需材料</div>
          <ul class="material-list">
            <li v-for="(material, idx) in selectedRec.materials" :key="idx">
              {{ material }}
            </li>
          </ul>
        </div>

        <div class="detail-section">
          <div class="detail-label">匹配度</div>
          <div class="detail-value">
            <el-progress 
              :percentage="selectedRec.matchScore" 
              :color="getProgressColor(selectedRec.matchScore)"
              :stroke-width="10"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailsVisible = false">关闭</el-button>
          <el-button type="primary" @click="applyFromDialog">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { recommendTags } from '../services/aiService'

const props = defineProps({
  resident: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['apply-tag'])

const isLoading = ref(true)
const recommendations = ref([])
const summary = ref('')
const detailsVisible = ref(false)
const selectedRec = ref(null)

onMounted(async () => {
  await loadRecommendations()
})

const loadRecommendations = async () => {
  isLoading.value = true
  try {
    const result = await recommendTags(props.resident)
    recommendations.value = result.recommendations || []
    summary.value = result.summary || '暂无推荐'
  } catch (error) {
    console.error('加载推荐失败:', error)
    summary.value = '加载失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const getTagType = (tagType) => {
  const typeMap = {
    '低保': 'danger',
    '残疾': 'warning',
    '公租房': 'info',
    '老年': 'success',
    '计生': 'primary',
    '社保': '',
    '涉军': 'danger'
  }
  return typeMap[tagType] || 'primary'
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}

const getProgressColor = (score) => {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#f59e0b'
  return '#6b7280'
}

const showDetails = (rec) => {
  selectedRec.value = rec
  detailsVisible.value = true
}

const applyTag = (rec) => {
  emit('apply-tag', {
    tagType: rec.tagType,
    tagSubType: rec.tagSubType,
    ...rec
  })
}

const applyFromDialog = () => {
  if (selectedRec.value) {
    applyTag(selectedRec.value)
    detailsVisible.value = false
    ElMessage.success('已添加标签申请')
  }
}

// 暴露刷新方法
defineExpose({
  refresh: loadRecommendations
})
</script>

<style scoped>
.tag-recommendation {
  margin-top: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #8b5cf6;
}

.section-icon svg {
  width: 100%;
  height: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
  display: block;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.loading-animation {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.loading-dot {
  width: 10px;
  height: 10px;
  background: #8b5cf6;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-dot {
    animation: none;
    transform: scale(1);
  }
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
}

/* 推荐列表 */
.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .recommendation-card {
    transition: none;
  }
}

.recommendation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.recommendation-card.high-priority {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(16, 185, 129, 0.01) 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-subtype {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.match-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f3f4f6;
}

.match-score.score-high {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.match-score.score-high .score-value,
.match-score.score-high .score-label {
  color: white;
}

.match-score.score-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.match-score.score-medium .score-value,
.match-score.score-medium .score-label {
  color: white;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.score-label {
  font-size: 11px;
  color: #6b7280;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.reason,
.benefits {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.reason-icon,
.benefits-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.reason-icon {
  color: #3b82f6;
}

.benefits-icon {
  color: #10b981;
}

.reason-text,
.benefits-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.benefits-text {
  color: #059669;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.detail-btn {
  color: #6b7280;
}

.apply-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
}

.apply-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: #10b981;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
}

/* 详情弹窗 */
.details-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.benefit-highlight {
  color: #059669;
  font-weight: 500;
  padding: 12px;
  background: #ecfdf5;
  border-radius: 8px;
}

.condition-list,
.material-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.condition-list li,
.material-list li {
  position: relative;
  padding: 6px 0;
  font-size: 14px;
  color: #374151;
}

.condition-list li::before {
  content: '✓';
  position: absolute;
  left: -20px;
  color: #10b981;
  font-weight: bold;
}

.material-list li::before {
  content: '•';
  position: absolute;
  left: -12px;
  color: #8b5cf6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style>
.details-dialog .el-dialog__header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.details-dialog .el-dialog__title {
  font-weight: 600;
  color: #1f2937;
}
</style>
