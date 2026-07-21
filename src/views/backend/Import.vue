<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">数据导入</h2>
        <p class="page-subtitle">批量导入居民基础信息和政策待遇标签数据</p>
      </div>
    </div>
    
    <div class="content-row">
      <div class="content-card import-card">
        <div class="card-header-row">
          <div class="import-icon icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="card-title-info">
            <h3 class="card-title">居民基础信息导入</h3>
            <p class="card-desc">按模板批量导入居民基础信息，支持身份证号去重校验、必填项校验</p>
          </div>
        </div>
        
        <div class="import-steps">
          <div class="step-item active">
            <div class="step-circle">1</div>
            <span class="step-text">下载模板</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <div class="step-circle">2</div>
            <span class="step-text">填写数据</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <div class="step-circle">3</div>
            <span class="step-text">上传文件</span>
          </div>
        </div>
        
        <el-button type="primary" size="large" class="download-btn" @click="downloadBasicTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        
        <div class="upload-area" @click="triggerBasicUpload" role="button" tabindex="0" @keydown.enter="triggerBasicUpload" @keydown.space.prevent="triggerBasicUpload">
          <div class="upload-icon" aria-hidden="true">
            <el-icon :size="32"><UploadFilled /></el-icon>
          </div>
          <div class="upload-text">
            <span class="upload-title">点击上传文件</span>
            <span class="upload-hint">支持 .xlsx / .xls 格式，最大 10MB</span>
          </div>
        </div>
        
        <div class="preview-section">
          <div class="preview-header">
            <span class="preview-title">模板字段预览</span>
            <span class="preview-count">共 8 个字段</span>
          </div>
          <div class="field-list">
            <span class="field-tag">社区</span>
            <span class="field-tag">小区</span>
            <span class="field-tag">网格</span>
            <span class="field-tag">姓名</span>
            <span class="field-tag">身份证号</span>
            <span class="field-tag">户籍地址</span>
            <span class="field-tag">居住地</span>
            <span class="field-tag">联系方式</span>
          </div>
        </div>
      </div>
      
      <div class="content-card import-card">
        <div class="card-header-row">
          <div class="import-icon icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="card-title-info">
            <h3 class="card-title">政策待遇标签导入</h3>
            <p class="card-desc">按模板批量导入居民已享受的政策待遇标签，每条标签关联居民唯一标识</p>
          </div>
        </div>
        
        <div class="import-steps">
          <div class="step-item active">
            <div class="step-circle">1</div>
            <span class="step-text">选择标签类型</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <div class="step-circle">2</div>
            <span class="step-text">下载对应模板</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <div class="step-circle">3</div>
            <span class="step-text">上传文件</span>
          </div>
        </div>
        
        <div class="tag-select-row">
          <el-select v-model="selectedTagType" placeholder="请选择标签类型" class="tag-select">
            <el-option v-for="t in tagTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-button type="primary" size="large" @click="downloadTagTemplate" :disabled="!selectedTagType">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
        </div>
        
        <div class="upload-area" @click="triggerTagUpload" role="button" tabindex="0" @keydown.enter="triggerTagUpload" @keydown.space.prevent="triggerTagUpload">
          <div class="upload-icon" aria-hidden="true">
            <el-icon :size="32"><UploadFilled /></el-icon>
          </div>
          <div class="upload-text">
            <span class="upload-title">点击上传文件</span>
            <span class="upload-hint">支持 .xlsx / .xls 格式，最大 10MB</span>
          </div>
        </div>
        
        <div class="preview-section">
          <div class="preview-header">
            <span class="preview-title">标签类型列表</span>
            <span class="preview-count">共 {{ tagTypes.length }} 种</span>
          </div>
          <div class="tag-grid">
            <el-tag v-for="t in tagTypes" :key="t" :type="getTagType(t)" effect="light" size="small">
              {{ t }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-card history-card">
      <div class="card-header">
        <div class="card-title-wrapper">
          <h3 class="section-title">导入记录</h3>
          <span class="section-desc">历史导入操作记录及结果详情</span>
        </div>
      </div>
      <el-table :data="importHistory" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column prop="id" label="序号" width="60" align="center" />
        <el-table-column prop="type" label="导入类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === '居民信息' ? 'primary' : 'success'" effect="light" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="total" label="总条数" width="80" align="center" />
        <el-table-column prop="success" label="成功数" width="80" align="center">
          <template #default="scope">
            <span class="text-success">{{ scope.row.success }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fail" label="失败数" width="80" align="center">
          <template #default="scope">
            <span class="text-danger">{{ scope.row.fail }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="导入时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="80" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewResult(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog title="导入结果详情" v-model="showResultDialog" width="600px">
      <div v-if="currentResult">
        <div class="result-summary">
          <div class="result-item success">
            <span class="result-value">{{ currentResult.success }}</span>
            <span class="result-label">成功</span>
          </div>
          <div class="result-item danger">
            <span class="result-value">{{ currentResult.fail }}</span>
            <span class="result-label">失败</span>
          </div>
          <div class="result-item">
            <span class="result-value">{{ currentResult.total }}</span>
            <span class="result-label">总计</span>
          </div>
        </div>
        
        <div v-if="currentResult.fail > 0" class="fail-section">
          <div class="fail-title">失败记录</div>
          <el-table :data="currentResult.failRecords" border size="small">
            <el-table-column prop="rowNum" label="行号" width="60" align="center" />
            <el-table-column prop="idCard" label="身份证号" width="180" />
            <el-table-column prop="name" label="姓名" width="80" />
            <el-table-column prop="reason" label="失败原因" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import { tagTypes } from '../../data/mock'

const selectedTagType = ref('')
const showResultDialog = ref(false)
const currentResult = ref(null)

const importHistory = ref([
  { id: '1', type: '居民信息', fileName: '居民信息导入_20240620.xlsx', total: 100, success: 98, fail: 2, time: '2024-06-20 10:30', operator: 'admin' },
  { id: '2', type: '标签导入', fileName: '低保标签_20240619.xlsx', total: 50, success: 50, fail: 0, time: '2024-06-19 14:20', operator: 'admin' },
  { id: '3', type: '居民信息', fileName: '居民信息导入_20240615.xlsx', total: 80, success: 75, fail: 5, time: '2024-06-15 09:00', operator: 'admin' }
])

const getTagType = (type) => {
  const map = {
    '低保': 'danger', '残疾': 'warning', '公租房': 'info',
    '老年': 'success', '计生': 'primary', '社保': 'primary',
    '重症': 'danger', '涉军': 'success', '支农返汉': 'info', '困境儿童': 'warning'
  }
  return map[type] || 'info'
}

const downloadBasicTemplate = () => {
  ElMessage.info('居民基础信息模板下载中...')
}

const downloadTagTemplate = () => {
  ElMessage.info(`${selectedTagType.value}标签模板下载中...`)
}

const triggerBasicUpload = () => {
  ElMessage.info('居民信息文件上传功能开发中')
}

const triggerTagUpload = () => {
  ElMessage.info('标签文件上传功能开发中')
}

const viewResult = (row) => {
  currentResult.value = {
    ...row,
    failRecords: [
      { rowNum: 15, idCard: '420101199001011234', name: '张三', reason: '身份证号重复' },
      { rowNum: 28, idCard: '420101198505152345', name: '李四', reason: '必填项缺失' }
    ]
  }
  showResultDialog.value = true
}
</script>

<style scoped>
.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.import-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.import-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.import-icon svg {
  width: 28px;
  height: 28px;
}

.icon-blue { 
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.icon-green { 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.card-title-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #111827;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.import-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
}

.step-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.step-item.active .step-text {
  color: #3b82f6;
}

.step-line {
  flex: 0 0 40px;
  height: 2px;
  background: #e5e7eb;
  margin-top: -14px;
}

.download-btn {
  width: 100%;
}

.tag-select-row {
  display: flex;
  gap: 10px;
}

.tag-select {
  flex: 1;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  background: #fafafa;
}

@media (prefers-reduced-motion: reduce) {
  .upload-area {
    transition: none;
  }
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.preview-section {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.preview-count {
  font-size: 12px;
  color: #9ca3af;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-tag {
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-card {
  .card-header {
    margin-bottom: 16px;
  }
}

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.result-summary {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.result-item {
  text-align: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-radius: 10px;
  min-width: 80px;
}

.result-value {
  font-size: 30px;
  font-weight: 700;
  display: block;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 4px;
}

.result-item.success .result-value {
  color: #10b981;
}

.result-item.danger .result-value {
  color: #ef4444;
}

.result-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.fail-section {
  margin-top: 8px;
}

.fail-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}
</style>
