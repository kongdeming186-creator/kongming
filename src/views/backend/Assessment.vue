<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">考核管理</h2>
        <p class="page-desc">网格员工作量化考核，设置月度指标与评分标准</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleBatchAssess">
          <el-icon><Check /></el-icon>批量考核
        </el-button>
      </div>
    </div>
    
    <div class="tabs-row">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="月度考核" name="monthly" />
        <el-tab-pane label="考核指标设置" name="settings" />
        <el-tab-pane label="考核记录" name="history" />
      </el-tabs>
    </div>
    
    <div v-if="activeTab === 'monthly'" class="content-card">
      <div class="card-header">
        <span class="card-title">2024年6月考核</span>
        <div class="month-select">
          <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" />
          <el-button type="primary" @click="loadMonthData">查询</el-button>
        </div>
      </div>
      
      <el-table :data="assessmentRecords" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column prop="workerName" label="网格员" width="80" />
        <el-table-column label="信息更新" width="140">
          <template #default="scope">
            <div class="target-cell">
              <div class="target-text">{{ scope.row.infoUpdates.actual }}/{{ scope.row.infoUpdates.target }}</div>
              <el-progress :percentage="scope.row.infoUpdates.rate" :color="getProgressColor(scope.row.infoUpdates.rate)" :stroke-width="6" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="隐患上报" width="140">
          <template #default="scope">
            <div class="target-cell">
              <div class="target-text">{{ scope.row.hiddenDangers.actual }}/{{ scope.row.hiddenDangers.target }}</div>
              <el-progress :percentage="scope.row.hiddenDangers.rate" :color="getProgressColor(scope.row.hiddenDangers.rate)" :stroke-width="6" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="走访记录" width="140">
          <template #default="scope">
            <div class="target-cell">
              <div class="target-text">{{ scope.row.visitRecords.actual }}/{{ scope.row.visitRecords.target }}</div>
              <el-progress :percentage="scope.row.visitRecords.rate" :color="getProgressColor(scope.row.visitRecords.rate)" :stroke-width="6" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合得分" width="100" align="center">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.totalScore)" style="font-weight: 600; font-size: 15px;">
              {{ scope.row.totalScore }}分
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="考核结果" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '优秀' ? 'success' : scope.row.status === '合格' ? 'primary' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="评语" width="200" />
        <el-table-column prop="assessor" label="考核人" width="80" />
        <el-table-column prop="assessTime" label="考核时间" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="editAssessment(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-if="activeTab === 'settings'" class="content-card">
      <div class="settings-header">
        <span class="card-title">考核指标设置</span>
        <el-button type="primary" @click="showAddTargetDialog = true">
          <el-icon><Plus /></el-icon>添加指标
        </el-button>
      </div>
      
      <div class="settings-content">
        <div class="target-group">
          <div class="group-header">
            <span class="group-title">月度工作指标</span>
            <span class="group-desc">所有网格员默认月度工作目标</span>
          </div>
          <div class="target-items">
            <div class="target-item">
              <div class="target-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="target-info">
                <span class="target-name">居民信息更新</span>
                <span class="target-desc">每月完成居民信息更新数量</span>
              </div>
              <div class="target-value-edit">
                <el-input-number v-model="defaultTargets.infoUpdates" :min="0" :max="200" size="small" />
                <span class="unit">条/月</span>
              </div>
            </div>
            <div class="target-item">
              <div class="target-icon orange">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="target-info">
                <span class="target-name">安全隐患上报</span>
                <span class="target-desc">每月发现并上报安全隐患数量</span>
              </div>
              <div class="target-value-edit">
                <el-input-number v-model="defaultTargets.hiddenDangers" :min="0" :max="100" size="small" />
                <span class="unit">条/月</span>
              </div>
            </div>
            <div class="target-item">
              <div class="target-icon green">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="target-info">
                <span class="target-name">入户走访记录</span>
                <span class="target-desc">每月完成入户走访数量</span>
              </div>
              <div class="target-value-edit">
                <el-input-number v-model="defaultTargets.visitRecords" :min="0" :max="200" size="small" />
                <span class="unit">户/月</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="target-group">
          <div class="group-header">
            <span class="group-title">评分标准</span>
            <span class="group-desc">根据完成率计算得分</span>
          </div>
          <div class="score-rules">
            <div class="score-rule-item">
              <div class="score-range">
                <el-tag type="success" size="small">≥100%</el-tag>
              </div>
              <div class="score-desc">超额完成任务</div>
              <div class="score-value">100分</div>
            </div>
            <div class="score-rule-item">
              <div class="score-range">
                <el-tag type="primary" size="small">80%-99%</el-tag>
              </div>
              <div class="score-desc">基本完成任务</div>
              <div class="score-value">80-99分</div>
            </div>
            <div class="score-rule-item">
              <div class="score-range">
                <el-tag type="warning" size="small">60%-79%</el-tag>
              </div>
              <div class="score-desc">未达标</div>
              <div class="score-value">60-79分</div>
            </div>
            <div class="score-rule-item">
              <div class="score-range">
                <el-tag type="danger" size="small">&lt;60%</el-tag>
              </div>
              <div class="score-desc">严重未达标</div>
              <div class="score-value">&lt;60分</div>
            </div>
          </div>
        </div>
        
        <div class="target-group">
          <div class="group-header">
            <span class="group-title">考核等级</span>
          </div>
          <div class="level-rules">
            <div class="level-rule-item">
              <div class="level-badge excellent">优秀</div>
              <div class="level-condition">综合得分 ≥ 90分</div>
              <div class="level-desc">超额完成所有指标，工作表现突出</div>
            </div>
            <div class="level-rule-item">
              <div class="level-badge qualified">合格</div>
              <div class="level-condition">综合得分 ≥ 70分</div>
              <div class="level-desc">达到基本工作要求</div>
            </div>
            <div class="level-rule-item">
              <div class="level-badge unqualified">不合格</div>
              <div class="level-condition">综合得分 &lt; 70分</div>
              <div class="level-desc">未达到最低工作指标要求</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-footer">
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </div>
    
    <div v-if="activeTab === 'history'" class="content-card">
      <div class="card-header">
        <span class="card-title">考核记录</span>
        <div class="search-bar">
          <el-input placeholder="搜索网格员姓名" v-model="historyKeyword" clearable style="width: 180px;" />
          <el-date-picker v-model="historyMonth" type="month" placeholder="选择月份" style="width: 150px;" />
          <el-button type="primary" @click="searchHistory">搜索</el-button>
        </div>
      </div>
      
      <el-table :data="assessmentRecords" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column prop="month" label="考核月份" width="100" />
        <el-table-column prop="workerName" label="网格员" width="80" />
        <el-table-column prop="totalScore" label="综合得分" width="100" align="center">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.totalScore)" style="font-weight: 600;">{{ scope.row.totalScore }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="考核结果" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '优秀' ? 'success' : scope.row.status === '合格' ? 'primary' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="评语" width="200" />
        <el-table-column prop="assessor" label="考核人" width="80" />
        <el-table-column prop="assessTime" label="考核时间" width="120" />
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog title="考核详情" v-model="showDetailDialog" width="500px">
      <div v-if="selectedRecord" class="detail-content">
        <div class="detail-header">
          <h3 class="detail-title">{{ selectedRecord.workerName }} - {{ selectedRecord.month }}考核</h3>
          <el-tag :type="selectedRecord.status === '优秀' ? 'success' : selectedRecord.status === '合格' ? 'primary' : 'danger'" size="small">
            {{ selectedRecord.status }}
          </el-tag>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4 class="section-title">各项指标完成情况</h4>
            <div class="indicator-list">
              <div class="indicator-item">
                <span class="indicator-name">信息更新</span>
                <span class="indicator-value">{{ selectedRecord.infoUpdates.actual }}/{{ selectedRecord.infoUpdates.target }}</span>
                <el-progress :percentage="selectedRecord.infoUpdates.rate" :color="getProgressColor(selectedRecord.infoUpdates.rate)" :stroke-width="8" />
              </div>
              <div class="indicator-item">
                <span class="indicator-name">隐患上报</span>
                <span class="indicator-value">{{ selectedRecord.hiddenDangers.actual }}/{{ selectedRecord.hiddenDangers.target }}</span>
                <el-progress :percentage="selectedRecord.hiddenDangers.rate" :color="getProgressColor(selectedRecord.hiddenDangers.rate)" :stroke-width="8" />
              </div>
              <div class="indicator-item">
                <span class="indicator-name">走访记录</span>
                <span class="indicator-value">{{ selectedRecord.visitRecords.actual }}/{{ selectedRecord.visitRecords.target }}</span>
                <el-progress :percentage="selectedRecord.visitRecords.rate" :color="getProgressColor(selectedRecord.visitRecords.rate)" :stroke-width="8" />
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="section-title">考核得分</h4>
            <div class="score-display">
              <span class="score-number" :class="getScoreClass(selectedRecord.totalScore)">{{ selectedRecord.totalScore }}</span>
              <span class="score-unit">分</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="section-title">考核评语</h4>
            <p class="remark-text">{{ selectedRecord.remark }}</p>
          </div>
          <div class="detail-footer">
            <span class="footer-item">考核人：{{ selectedRecord.assessor }}</span>
            <span class="footer-item">考核时间：{{ selectedRecord.assessTime }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <el-dialog title="添加考核指标" v-model="showAddTargetDialog" width="400px">
      <el-form :model="newTargetForm" label-width="100px">
        <el-form-item label="指标名称" required>
          <el-input v-model="newTargetForm.name" />
        </el-form-item>
        <el-form-item label="指标描述">
          <el-input v-model="newTargetForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="目标值" required>
          <el-input-number v-model="newTargetForm.targetValue" :min="0" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="newTargetForm.unit" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddTargetDialog = false">取消</el-button>
        <el-button type="primary" @click="addTarget">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Plus, EditPen, Warning, UserFilled } from '@element-plus/icons-vue'
import { assessmentRecords } from '../../data/mock'

const activeTab = ref('monthly')
const currentMonth = ref('2024-06')
const historyKeyword = ref('')
const historyMonth = ref('')
const showDetailDialog = ref(false)
const showAddTargetDialog = ref(false)
const selectedRecord = ref(null)

const defaultTargets = reactive({
  infoUpdates: 50,
  hiddenDangers: 10,
  visitRecords: 30
})

const newTargetForm = reactive({
  name: '',
  description: '',
  targetValue: 0,
  unit: ''
})

const handleTabChange = () => {}

const loadMonthData = () => {}

const handleBatchAssess = () => {
  ElMessage.info('批量考核功能开发中')
}

const editAssessment = (row) => {
  ElMessage.info('编辑考核功能开发中')
}

const viewDetail = (row) => {
  selectedRecord.value = row
  showDetailDialog.value = true
}

const searchHistory = () => {}

const saveSettings = () => {
  ElMessage.success('设置保存成功')
}

const addTarget = () => {
  showAddTargetDialog.value = false
  ElMessage.success('添加成功')
}

const getProgressColor = (rate) => {
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

.tabs-row {
  margin-bottom: 20px;
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

.month-select {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.target-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.target-text {
  font-size: 12px;
  color: #6b7280;
}

.score-high {
  color: #67c23a;
}

.score-medium {
  color: #e6a23c;
}

.score-low {
  color: #f56c6c;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.target-group {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.group-desc {
  font-size: 12px;
  color: #9ca3af;
}

.target-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.target-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #fff;
  border-radius: 8px;
}

.target-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.target-icon.orange {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.target-icon.green {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.target-info {
  flex: 1;
}

.target-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  display: block;
}

.target-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.target-value-edit {
  display: flex;
  align-items: center;
  gap: 6px;
}

.unit {
  font-size: 13px;
  color: #6b7280;
}

.score-rules {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.score-rule-item {
  background: #fff;
  padding: 14px;
  border-radius: 8px;
  text-align: center;
}

.score-range {
  margin-bottom: 8px;
}

.score-desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.score-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.level-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-rule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: #fff;
  border-radius: 8px;
}

.level-badge {
  width: 60px;
  text-align: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.level-badge.excellent {
  background: #67c23a;
}

.level-badge.qualified {
  background: #409eff;
}

.level-badge.unqualified {
  background: #f56c6c;
}

.level-condition {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.level-desc {
  font-size: 12px;
  color: #6b7280;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px;
}

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.indicator-name {
  font-size: 13px;
  color: #6b7280;
}

.indicator-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-number {
  font-size: 48px;
  font-weight: 700;
}

.score-unit {
  font-size: 16px;
  color: #6b7280;
}

.remark-text {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.detail-footer {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.footer-item {
  font-size: 13px;
  color: #6b7280;
}
</style>