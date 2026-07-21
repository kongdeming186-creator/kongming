<template>
  <div class="mobile-task-process">
    <header class="process-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <h1>现场处理</h1>
      <span></span>
    </header>
    
    <div class="process-content">
      <div class="section">
        <h3>上传证明材料</h3>
        <div class="upload-area" @click="triggerUpload">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>拍照或上传图片</span>
        </div>
        <div class="photo-grid" v-if="photos.length > 0">
          <div v-for="(photo, index) in photos" :key="index" class="photo-item">
            <img :src="photo" alt="" />
            <button class="delete-btn" @click="deletePhoto(index)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>核实备注</h3>
        <el-input v-model="remark" type="textarea" :rows="4" placeholder="请填写现场核实情况..." />
      </div>
      
      <div class="section">
        <h3>更新居民状态</h3>
        
        <div class="form-item">
          <label>生存状态</label>
          <el-radio-group v-model="survivalStatus">
            <el-radio label="正常">正常</el-radio>
            <el-radio label="已去世">已去世</el-radio>
            <el-radio label="待核实">待核实</el-radio>
          </el-radio-group>
        </div>
        
        <div class="form-item">
          <label>标签状态更新</label>
          <div class="tag-list">
            <div v-for="tag in tagList" :key="tag.id" class="tag-item">
              <span>{{ tag.name }}</span>
              <el-switch v-model="tag.enabled" />
            </div>
          </div>
        </div>
        
        <div class="form-item">
          <label>补贴发放时间</label>
          <el-date-picker v-model="subsidyDate" type="date" placeholder="选择日期" />
        </div>
      </div>
      
      <div class="section">
        <h3>修改/补充标签</h3>
        <el-select v-model="newTag" placeholder="选择要添加的标签">
          <el-option label="低保" value="低保" />
          <el-option label="高龄津贴" value="高龄津贴" />
          <el-option label="残疾人补贴" value="残疾人补贴" />
          <el-option label="独生子女保健费" value="独生子女保健费" />
        </el-select>
        <el-button type="primary" size="small" @click="addTag" style="margin-top: 8px">添加标签</el-button>
      </div>
    </div>
    
    <div class="bottom-actions">
      <el-button @click="handleTransfer">需转办</el-button>
      <el-button @click="handleSuspend">无法核实</el-button>
      <el-button type="primary" @click="handleSubmit">提交处理结果</el-button>
    </div>
    
    <el-dialog title="转办原因" v-model="showTransferDialog" width="320px">
      <el-input v-model="transferReason" type="textarea" :rows="3" placeholder="请填写转办原因..." />
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认转办</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const photos = ref([])
const remark = ref('')
const survivalStatus = ref('正常')
const subsidyDate = ref('')
const newTag = ref('')

const showTransferDialog = ref(false)
const transferReason = ref('')

const tagList = ref([
  { id: 1, name: '低保', enabled: true },
  { id: 2, name: '重度护理补贴', enabled: true },
  { id: 3, name: '高龄津贴', enabled: false }
])

const goBack = () => {
  router.push(`/mobile/task/detail/${route.params.id}`)
}

const triggerUpload = () => {
  photos.value.push('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=proof%20document%20photo&image_size=square')
}

const deletePhoto = (index) => {
  photos.value.splice(index, 1)
}

const addTag = () => {
  if (newTag.value) {
    tagList.value.push({
      id: Date.now(),
      name: newTag.value,
      enabled: true
    })
    newTag.value = ''
    ElMessage.success('标签已添加')
  }
}

const handleTransfer = () => {
  showTransferDialog.value = true
}

const confirmTransfer = () => {
  showTransferDialog.value = false
  router.push('/mobile/tasks')
  ElMessage.success('任务已转办')
}

const handleSuspend = () => {
  router.push('/mobile/tasks')
  ElMessage.info('任务已挂起')
}

const handleSubmit = () => {
  router.push('/mobile/tasks')
  ElMessage.success('处理结果已提交')
}
</script>

<style scoped>
.mobile-task-process {
  min-height: 100vh;
  padding-bottom: 100px;
}

.process-header {
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

.process-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.process-content {
  padding: 10px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.upload-area svg {
  width: 32px;
  height: 32px;
  color: #999;
}

.upload-area span {
  font-size: 13px;
  color: #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 8px;
}

.bottom-actions .el-button {
  flex: 1;
}
</style>
