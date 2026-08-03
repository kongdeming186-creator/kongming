<template>
  <div class="mobile-visit">
    <header class="visit-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <h1>走访记录</h1>
      <span></span>
    </header>

    <div class="visit-content">
      <!-- 新增走访 -->
      <div class="add-visit-card">
        <h3>新增走访记录</h3>
        <div class="form-item">
          <label>走访居民</label>
          <el-select v-model="visitForm.residentName" placeholder="选择居民" filterable style="width: 100%">
            <el-option v-for="r in residents" :key="r.id" :label="r.name" :value="r.name" />
          </el-select>
        </div>
        <div class="form-item">
          <label>走访类型</label>
          <el-select v-model="visitForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="高龄核查" value="高龄核查" />
            <el-option label="残疾人年审" value="残疾人年审" />
            <el-option label="定期走访" value="定期走访" />
            <el-option label="预警核实" value="预警核实" />
            <el-option label="民生诉求" value="民生诉求" />
          </el-select>
        </div>
        <div class="form-item">
          <label>走访内容</label>
          <el-input v-model="visitForm.content" type="textarea" :rows="3" placeholder="请填写走访情况..." />
        </div>
        <div class="form-item">
          <label>现场照片</label>
          <div class="photo-upload" @click="addPhoto">
            <el-icon><Plus /></el-icon>
            <span>添加照片</span>
          </div>
          <div class="photo-grid" v-if="visitForm.photos.length > 0">
            <div v-for="(photo, idx) in visitForm.photos" :key="idx" class="photo-item">
              <img :src="photo" alt="" />
              <button class="delete-btn" @click="removePhoto(idx)">×</button>
            </div>
          </div>
        </div>
        <el-button type="primary" style="width: 100%; margin-top: 12px" @click="submitVisit">
          提交走访记录
        </el-button>
      </div>

      <!-- 走访记录列表 -->
      <div class="visit-list">
        <h3>本月走访记录</h3>
        <div v-for="record in visitRecords" :key="record.id" class="visit-item">
          <div class="visit-item-header">
            <div class="visit-resident">
              <span class="resident-name">{{ record.residentName }}</span>
              <el-tag size="small" type="info">{{ record.type }}</el-tag>
            </div>
            <span class="visit-date">{{ record.date }}</span>
          </div>
          <p class="visit-content-text">{{ record.content }}</p>
          <div class="visit-photos" v-if="record.photos && record.photos.length > 0">
            <img v-for="(photo, idx) in record.photos" :key="idx" :src="photo" class="visit-photo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { residents } from '../../data/mock'

const router = useRouter()

const visitForm = reactive({
  residentName: '',
  type: '',
  content: '',
  photos: []
})

const visitRecords = ref([
  {
    id: 1,
    residentName: '张三',
    type: '定期走访',
    date: '06-20',
    content: '入户走访了解家庭生活状况，居民反映近期身体良好，无特殊困难。',
    photos: []
  },
  {
    id: 2,
    residentName: '王五',
    type: '高龄核查',
    date: '06-18',
    content: '上门核查高龄老人生存状态，确认老人身体健康，居住条件良好。',
    photos: []
  },
  {
    id: 3,
    residentName: '李四',
    type: '预警核实',
    date: '06-15',
    content: '核实残疾人补贴发放情况，确认补贴正常发放，居民满意。',
    photos: []
  }
])

const addPhoto = () => {
  visitForm.photos.push('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grid%20worker%20visiting%20resident%20home&image_size=square')
}

const removePhoto = (idx) => {
  visitForm.photos.splice(idx, 1)
}

const submitVisit = () => {
  if (!visitForm.residentName || !visitForm.type) {
    ElMessage.warning('请填写完整信息')
    return
  }
  visitRecords.value.unshift({
    id: Date.now(),
    residentName: visitForm.residentName,
    type: visitForm.type,
    date: new Date().toISOString().slice(5, 10).replace('-', '-'),
    content: visitForm.content,
    photos: [...visitForm.photos]
  })
  visitForm.residentName = ''
  visitForm.type = ''
  visitForm.content = ''
  visitForm.photos = []
  ElMessage.success('走访记录提交成功')
}

const goBack = () => {
  router.push('/mobile/checkin')
}
</script>

<style scoped>
.mobile-visit {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

.visit-header {
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

.visit-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.visit-content {
  padding: 16px;
}

.add-visit-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.add-visit-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}

.form-item {
  margin-bottom: 12px;
}

.form-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.photo-upload {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
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
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visit-list h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}

.visit-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.visit-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.visit-resident {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resident-name {
  font-size: 15px;
  font-weight: 600;
}

.visit-date {
  font-size: 12px;
  color: #999;
}

.visit-content-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.visit-photos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.visit-photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}
</style>