<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">政策匹配</h2>
        <p class="page-desc">AI智能匹配民政政策，实现政策找人精准帮扶</p>
      </div>
    </div>
    
    <div class="tabs-row">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="批量检索" name="batch" />
        <el-tab-pane label="单人判定" name="single" />
      </el-tabs>
    </div>
    
    <div v-if="activeTab === 'batch'" class="content-card">
      <div class="batch-header">
        <span class="card-title">批量检索符合条件的居民</span>
        <p class="card-desc">根据政策条件，从全量居民底册中筛选符合条件的群众</p>
      </div>
      
      <div class="policy-select-section">
        <div class="section-title">选择政策类型</div>
        <div class="policy-tags">
          <el-tag 
            v-for="policy in policyMatchRules" 
            :key="policy.id" 
            :type="selectedPolicies.includes(policy.policyName) ? 'primary' : 'info'"
            effect="plain"
            :class="{ 'policy-tag-active': selectedPolicies.includes(policy.policyName) }"
            @click="togglePolicy(policy.policyName)"
          >
            {{ policy.policyName }}
          </el-tag>
        </div>
      </div>
      
      <div class="search-section">
        <el-button type="primary" size="large" @click="handleBatchSearch" :disabled="selectedPolicies.length === 0">
          <el-icon><Search /></el-icon>
          AI智能匹配
        </el-button>
        <span class="search-tip" v-if="selectedPolicies.length > 0">
          将根据所选政策条件，筛选符合条件的居民
        </span>
      </div>
      
      <div v-if="matchResults.length > 0" class="results-section">
        <div class="results-header">
          <span class="results-title">匹配结果</span>
          <span class="results-count">共 {{ matchResults.length }} 人符合条件</span>
          <el-button type="primary" size="small" @click="exportResults">
            <el-icon><Download /></el-icon>导出名单
          </el-button>
        </div>
        
        <el-table :data="matchResults" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="gender" label="性别" width="60" align="center" />
          <el-table-column prop="age" label="年龄" width="60" align="center" />
          <el-table-column prop="idCard" label="身份证号" width="170" />
          <el-table-column prop="community" label="社区" width="100" />
          <el-table-column prop="grid" label="网格" width="100" />
          <el-table-column prop="matchPolicies" label="匹配政策" width="200">
            <template #default="scope">
              <el-tag v-for="p in scope.row.matchPolicies" :key="p" type="success" size="small" effect="light">
                {{ p }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="matchScore" label="匹配度" width="100" align="center">
            <template #default="scope">
              <el-progress :percentage="scope.row.matchScore" :color="getScoreColor(scope.row.matchScore)" :stroke-width="8" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" @click="viewResident(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-else-if="searchTriggered" class="empty-section">
        <el-empty description="暂无符合条件的居民" />
      </div>
      
      <div v-else class="guide-section">
        <div class="guide-icon">
          <el-icon><Sparkles /></el-icon>
        </div>
        <h3 class="guide-title">AI政策匹配功能</h3>
        <p class="guide-desc">
          选择一个或多个政策类型，系统将自动检索符合条件的居民，<br>
          帮助您快速发现潜在的政策受益人群。
        </p>
        <div class="guide-features">
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>全量居民底册智能筛选</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>多政策组合匹配</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>匹配度评分排序</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>一键导出名单</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'single'" class="content-card">
      <div class="single-header">
        <span class="card-title">单人政策判定</span>
        <p class="card-desc">手动录入居民信息，AI一键判定可申报的福利类型与补贴标准</p>
      </div>
      
      <div class="form-section">
        <el-form :model="singleForm" label-width="120px">
          <div class="form-row">
            <el-form-item label="姓名" required>
              <el-input v-model="singleForm.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="性别" required>
              <el-select v-model="singleForm.gender" placeholder="请选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
            <el-form-item label="年龄" required>
              <el-input-number v-model="singleForm.age" :min="0" :max="150" placeholder="请输入年龄" />
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="身份证号">
              <el-input v-model="singleForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
            <el-form-item label="户籍地址">
              <el-input v-model="singleForm.householdRegister" placeholder="如：武昌区" />
            </el-form-item>
            <el-form-item label="婚姻状态">
              <el-select v-model="singleForm.maritalStatus" placeholder="请选择婚姻状态">
                <el-option label="未婚" value="未婚" />
                <el-option label="已婚" value="已婚" />
                <el-option label="离异" value="离异" />
                <el-option label="丧偶" value="丧偶" />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="人均月收入">
              <el-input-number v-model="singleForm.perCapitaIncome" :min="0" placeholder="单位：元" />
              <span style="margin-left: 8px; color: #9ca3af;">元/月</span>
            </el-form-item>
            <el-form-item label="存款金额">
              <el-input-number v-model="singleForm.depositAmount" :min="0" placeholder="单位：元" />
              <span style="margin-left: 8px; color: #9ca3af;">元</span>
            </el-form-item>
            <el-form-item label="房产面积">
              <el-input-number v-model="singleForm.houseArea" :min="0" placeholder="单位：㎡" />
              <span style="margin-left: 8px; color: #9ca3af;">㎡</span>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="车辆信息">
              <el-select v-model="singleForm.carPlate" placeholder="是否有车">
                <el-option label="无" value="无" />
                <el-option label="有" value="有" />
              </el-select>
            </el-form-item>
            <el-form-item label="残疾种类及等级">
              <el-select v-model="singleForm.disabilityLevel" placeholder="请选择残疾种类及等级">
                <el-option label="无" value="" />
                <el-option label="一级" value="一级" />
                <el-option label="二级" value="二级" />
                <el-option label="三级" value="三级" />
                <el-option label="四级" value="四级" />
              </el-select>
            </el-form-item>
            <el-form-item label="生存状态">
              <el-select v-model="singleForm.survivalStatus" placeholder="请选择生存状态">
                <el-option label="在世" value="在世" />
                <el-option label="已去世" value="已去世" />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="工作单位">
              <el-input v-model="singleForm.workUnit" placeholder="请输入工作单位" />
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="singleForm.contact" placeholder="请输入手机号码" />
            </el-form-item>
          </div>
          
          <div class="form-actions">
            <el-button type="primary" size="large" @click="handleSingleMatch">
              <el-icon><Star /></el-icon>
              AI一键判定
            </el-button>
            <el-button size="large" @click="resetForm">重置表单</el-button>
          </div>
        </el-form>
      </div>
      
      <div v-if="singleResults.length > 0" class="results-section">
        <div class="results-header">
          <span class="results-title">匹配结果</span>
          <span class="results-count">共匹配到 {{ singleResults.length }} 项政策</span>
        </div>
        
        <div class="policy-cards">
          <div v-for="result in singleResults" :key="result.policyName" class="policy-card">
            <div class="policy-card-header">
              <div class="policy-tag">
                <el-tag type="success" size="small">{{ result.policyName }}</el-tag>
              </div>
              <div class="match-score">
                匹配度 {{ result.matchScore }}%
              </div>
            </div>
            <div class="policy-card-body">
              <div class="policy-desc">{{ result.description }}</div>
              <div class="subsidy-info">
                <span class="info-label">补贴标准：</span>
                <span class="info-value">{{ result.subsidyStandard }}</span>
              </div>
              <div class="match-reason">
                <span class="info-label">匹配原因：</span>
                <span class="info-value">{{ result.matchReason }}</span>
              </div>
            </div>
            <div class="policy-card-footer">
              <el-button type="primary" size="small" @click="applyPolicy(result)">
                <el-icon><Plus /></el-icon>申请办理
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="searchTriggered" class="empty-section">
        <el-empty description="未匹配到符合条件的政策" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, Star, CircleCheck, Plus } from '@element-plus/icons-vue'
import { policyMatchRules, residents } from '../../data/mock'

const activeTab = ref('batch')
const selectedPolicies = ref([])
const searchTriggered = ref(false)

const matchResults = ref([
  { id: '3', name: '王五', gender: '男', age: 75, idCard: '420101195008203456', community: '六角社区', grid: '第三网格', matchPolicies: ['高龄津贴'], matchScore: 95 },
  { id: '2', name: '李四', gender: '男', age: 40, idCard: '420101198505152345', community: '六角社区', grid: '第二网格', matchPolicies: ['重度残疾人护理补贴', '4050灵活就业补贴'], matchScore: 88 },
  { id: '5', name: '钱七', gender: '女', age: 50, idCard: '420101197512125678', community: '六角社区', grid: '第二网格', matchPolicies: ['困难残疾人生活补贴'], matchScore: 85 }
])

const singleResults = ref([])

const singleForm = reactive({
  name: '',
  gender: '',
  age: '',
  idCard: '',
  householdRegister: '',
  maritalStatus: '',
  perCapitaIncome: '',
  depositAmount: '',
  houseArea: '',
  carPlate: '',
  disabilityLevel: '',
  survivalStatus: '',
  workUnit: '',
  contact: ''
})

const togglePolicy = (policyName) => {
  const index = selectedPolicies.value.indexOf(policyName)
  if (index > -1) {
    selectedPolicies.value.splice(index, 1)
  } else {
    selectedPolicies.value.push(policyName)
  }
}

const handleBatchSearch = () => {
  searchTriggered.value = true
  ElMessage.success(`已检索到 ${matchResults.value.length} 位符合条件的居民`)
}

const exportResults = () => {
  ElMessage.success('导出功能开发中')
}

const viewResident = (row) => {
  ElMessage.info(`查看居民详情：${row.name}`)
}

const handleSingleMatch = () => {
  searchTriggered.value = true
  singleResults.value = [
    {
      policyName: '低保',
      description: '城乡居民最低生活保障',
      subsidyStandard: '按家庭人口计算，每人每月不超过当地低保标准',
      matchScore: 85,
      matchReason: '人均收入低于500元/月，无房产、无车辆，存款在限额内'
    },
    {
      policyName: '困难残疾人生活补贴',
      description: '为困难残疾人提供生活补贴',
      subsidyStandard: '每人每月80元',
      matchScore: 90,
      matchReason: '持有残疾证，残疾等级为三级，符合困难残疾人认定条件'
    }
  ]
  ElMessage.success(`已匹配到 ${singleResults.value.length} 项政策`)
}

const resetForm = () => {
  Object.keys(singleForm).forEach(key => {
    singleForm[key] = ''
  })
  singleResults.value = []
  searchTriggered.value = false
}

const applyPolicy = (result) => {
  ElMessage.success(`开始办理 ${result.policyName} 申请`)
}

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#409eff'
  if (score >= 50) return '#e6a23c'
  return '#f56c6c'
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
  padding: 24px;
  border: 1px solid #f3f4f6;
}

.batch-header, .single-header {
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: block;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 6px 0 0;
}

.policy-select-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.policy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.policy-tag-active {
  background: #e6f7ff !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 10px;
}

.search-tip {
  font-size: 13px;
  color: #6b7280;
}

.results-section {
  margin-top: 24px;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.results-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.results-count {
  font-size: 13px;
  color: #6b7280;
}

.empty-section {
  padding: 40px 20px;
}

.guide-section {
  text-align: center;
  padding: 48px 20px;
}

.guide-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
}

.guide-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.guide-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px;
}

.guide-features {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.guide-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
}

.form-section {
  max-width: 800px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row .el-form-item {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.policy-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.policy-card {
  background: #f9fafb;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.policy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
}

.match-score {
  font-size: 13px;
  font-weight: 600;
  color: #67c23a;
}

.policy-card-body {
  padding: 16px;
}

.policy-desc {
  font-size: 14px;
  color: #374151;
  margin-bottom: 12px;
}

.subsidy-info, .match-reason {
  margin-bottom: 8px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.policy-card-footer {
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}
</style>