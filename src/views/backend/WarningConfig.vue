<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">预警规则配置</h2>
        <p class="page-subtitle">配置预警触发规则，实现自动化监控</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddRuleDialog = true">
          <el-icon><Plus /></el-icon>
          新增规则
        </el-button>
      </div>
    </div>

    <!-- 规则统计 -->
    <div class="config-stats">
      <div class="stat-item">
        <span class="stat-num">{{ rules.length }}</span>
        <span class="stat-label">规则总数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ enabledRuleCount }}</span>
        <span class="stat-label">已启用规则</span>
      </div>
    </div>
    
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">预警规则列表</h3>
          <span class="section-desc">系统自动触发预警的规则配置</span>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table 
          :data="rules" 
          border 
          stripe
          :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 500 }"
        >
          <el-table-column prop="category" label="规则类别" width="120" align="center">
            <template #default="scope">
              <el-tag 
                size="small" 
                :type="getCategoryTagType(scope.row.category)"
                effect="light"
              >
                {{ scope.row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="规则名称" width="160" />
          <el-table-column prop="description" label="规则描述" min-width="180" show-overflow-tooltip />
          <el-table-column prop="enabled" label="状态" width="80" align="center">
            <template #default="scope">
              <el-switch 
                v-model="scope.row.enabled" 
                @change="toggleRule(scope.row)"
                active-text="启用"
                inactive-text="停用"
              />
            </template>
          </el-table-column>
          <el-table-column prop="triggerCondition" label="触发条件" min-width="180" show-overflow-tooltip />
          <el-table-column prop="advanceDays" label="提前天数" width="100" align="center">
            <template #default="scope">
              <span v-if="scope.row.advanceDays">{{ scope.row.advanceDays }}天</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="frequency" label="执行频率" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.frequency" size="small" effect="light" type="info">
                {{ scope.row.frequency }}
              </el-tag>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button type="primary" link size="small" @click="editRule(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deleteRule(scope.row.id)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">互斥规则管理</h3>
          <span class="section-desc">配置不能同时享受的政策标签组</span>
        </div>
        <el-button type="primary" size="small" @click="showAddMutexDialog = true">
          <el-icon><Plus /></el-icon>
          新增互斥规则
        </el-button>
      </div>
      <div class="mutex-rules">
        <div v-for="(rule, index) in mutexRules" :key="index" class="mutex-card">
          <div class="mutex-card-header">
            <div class="mutex-title-row">
              <span class="mutex-icon">
                <el-icon><Warning /></el-icon>
              </span>
              <span class="mutex-title">互斥规则 {{ index + 1 }}</span>
            </div>
            <el-switch v-model="rule.enabled" @change="toggleMutexRule(rule)" />
          </div>
          <div class="mutex-card-body">
            <div class="mutex-group">
              <span class="mutex-label">标签组 A</span>
              <div class="mutex-tags">
                <el-tag v-for="tag in rule.groupA" :key="tag" type="danger" effect="light" size="small">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="mutex-vs">
              <span class="vs-badge">VS</span>
            </div>
            <div class="mutex-group">
              <span class="mutex-label">标签组 B</span>
              <div class="mutex-tags">
                <el-tag v-for="tag in rule.groupB" :key="tag" type="warning" effect="light" size="small">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="mutex-card-footer">
            <el-button size="small" @click="editMutexRule(rule)">编辑规则</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog title="编辑规则" v-model="showAddRuleDialog" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="规则类别" prop="category">
          <el-select v-model="ruleForm.category" placeholder="请选择规则类别">
            <el-option label="政策不符" value="政策不符" />
            <el-option label="到期取消" value="到期取消" />
            <el-option label="政策互斥" value="政策互斥" />
            <el-option label="状态变化" value="状态变化" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则描述" prop="description">
          <el-input v-model="ruleForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="ruleForm.triggerCondition" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="提前天数">
          <el-input v-model.number="ruleForm.advanceDays" placeholder="不填则不生效" />
        </el-form-item>
        <el-form-item label="执行频率">
          <el-select v-model="ruleForm.frequency">
            <el-option label="每天" value="每天" />
            <el-option label="每周" value="每周" />
            <el-option label="每月" value="每月" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRule">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="新增互斥规则" v-model="showAddMutexDialog" width="500px">
      <div class="mutex-form">
        <div class="form-group">
          <label>互斥标签组A</label>
          <el-select v-model="mutexForm.groupA" multiple placeholder="选择标签">
            <el-option v-for="t in tagTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <div class="form-group">
          <label>互斥标签组B</label>
          <el-select v-model="mutexForm.groupB" multiple placeholder="选择标签">
            <el-option v-for="t in tagTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <div class="form-group">
          <label>启用状态</label>
          <el-switch v-model="mutexForm.enabled" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showAddMutexDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMutex">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Warning } from '@element-plus/icons-vue'
import { warningRules as mockRules, tagTypes } from '../../data/mock'

const rules = ref([...mockRules])

const showAddRuleDialog = ref(false)
const showAddMutexDialog = ref(false)

const enabledRuleCount = computed(() => rules.value.filter(r => r.enabled).length)

const getCategoryTagType = (category) => {
  const map = {
    '政策不符': 'danger',
    '到期取消': 'warning',
    '政策互斥': 'info',
    '状态变化': ''
  }
  return map[category] || 'info'
}

const toggleMutexRule = (rule) => {
  ElMessage.success(`互斥规则已${rule.enabled ? '启用' : '停用'}`)
}

const editMutexRule = (rule) => {
  ElMessage.info('编辑互斥规则功能开发中')
}

const ruleForm = reactive({
  name: '',
  category: '',
  description: '',
  triggerCondition: '',
  advanceDays: '',
  frequency: '',
  enabled: true
})

const mutexForm = reactive({
  groupA: [],
  groupB: [],
  enabled: true
})

const mutexRules = ref([
  {
    id: 1,
    enabled: true,
    groupA: ['失独家庭'],
    groupB: ['特困人员']
  },
  {
    id: 2,
    enabled: true,
    groupA: ['特殊困难老人居家服务'],
    groupB: ['残疾人居家服务', '计生特扶居家服务']
  }
])

const toggleRule = (row) => {
  ElMessage.success(`${row.name}已${row.enabled ? '启用' : '停用'}`)
}

const editRule = (row) => {
  ruleForm.name = row.name
  ruleForm.category = row.category || ''
  ruleForm.description = row.description
  ruleForm.triggerCondition = row.triggerCondition
  ruleForm.advanceDays = row.advanceDays
  ruleForm.frequency = row.frequency
  ruleForm.enabled = row.enabled
  showAddRuleDialog.value = true
}

const deleteRule = (id) => {
  ElMessage.confirm('确定要删除该规则吗？', '提示', { type: 'warning' })
    .then(() => {
      rules.value = rules.value.filter(r => r.id !== id)
      ElMessage.success('删除成功')
    })
}

const handleSaveRule = () => {
  showAddRuleDialog.value = false
  ElMessage.success('保存成功')
}

const handleSaveMutex = () => {
  showAddMutexDialog.value = false
  ElMessage.success('互斥规则保存成功')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.page-title-wrapper {
  flex: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 配置统计 */
.config-stats {
  background: #fff;
  border-radius: 8px;
  padding: 20px 32px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.config-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.config-stats .stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #1890FF;
  line-height: 1.2;
}

.config-stats .stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #1890FF, #0ea5e9);
  border-radius: 2px;
}

.section-desc {
  font-size: 12px;
  color: #9ca3af;
  padding-left: 12px;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.table-wrapper {
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.text-muted {
  color: #d1d5db;
}

/* 互斥规则卡片 */
.mutex-rules {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mutex-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.mutex-card:hover {
  border-color: #1890FF;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.mutex-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}

.mutex-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mutex-icon {
  color: #f59e0b;
  display: flex;
  align-items: center;
}

.mutex-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.mutex-card-body {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.mutex-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mutex-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.mutex-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mutex-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0 12px;
}

.vs-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.mutex-card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}
</style>
