<template>
  <div class="page-container">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">实时数据采集</h2>
        <p class="page-subtitle">配置数据源采集规则，实现多源数据自动同步与质量监控</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新状态
        </el-button>
        <el-button type="primary" @click="handleCreateTask">
          <el-icon><Plus /></el-icon>
          新建采集任务
        </el-button>
      </div>
    </div>

    <!-- 顶部Tab -->
    <el-tabs v-model="activeTab" class="page-tabs">
      <el-tab-pane label="数据采集" name="collect" />
      <el-tab-pane label="比对分析" name="compare" />
      <el-tab-pane label="异常监控" name="monitor" />
      <el-tab-pane label="采集日志" name="logs" />
    </el-tabs>

    <!-- 主内容区 -->
    <div class="content-card main-card">
      <!-- 步骤条 -->
      <div class="wizard-steps">
        <div 
          v-for="(step, idx) in steps" 
          :key="step.key" 
          class="wizard-step"
          :class="{ 
            active: currentStep === idx, 
            done: currentStep > idx,
            locked: currentStep < idx 
          }"
        >
          <div class="step-circle">
            <el-icon v-if="currentStep > idx"><Check /></el-icon>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
          <span v-if="currentStep < idx" class="step-lock">🔒</span>
          <div v-if="idx < steps.length - 1" class="step-line" :class="{ active: currentStep > idx }"></div>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- ① 协议配置 -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="panel-header">
            <h3>协议配置</h3>
            <span class="panel-desc">选择数据源对接协议，配置连接参数</span>
          </div>
          <div class="protocol-list">
            <div 
              v-for="proto in protocols" 
              :key="proto.key" 
              class="protocol-card"
              :class="{ selected: selectedProtocol === proto.key, disabled: !proto.enabled }"
              @click="selectProtocol(proto)"
            >
              <div class="proto-icon" :class="proto.color">
                <el-icon :size="24"><component :is="proto.icon" /></el-icon>
              </div>
              <div class="proto-info">
                <div class="proto-name">{{ proto.name }}</div>
                <div class="proto-desc">{{ proto.desc }}</div>
              </div>
              <el-radio :model-value="selectedProtocol" :label="proto.key" :disabled="!proto.enabled" />
            </div>
          </div>
          <div v-if="selectedProtocol" class="config-form">
            <div class="config-section-title">连接配置</div>
            <div class="config-grid">
              <div class="config-item">
                <span class="config-label">服务地址</span>
                <el-input v-model="config.serverUrl" placeholder="https://api.example.com/data" />
              </div>
              <div class="config-item">
                <span class="config-label">端口</span>
                <el-input v-model="config.port" placeholder="8080" />
              </div>
              <div class="config-item">
                <span class="config-label">用户名</span>
                <el-input v-model="config.username" placeholder="请输入用户名" />
              </div>
              <div class="config-item">
                <span class="config-label">密码 / Token</span>
                <el-input v-model="config.password" type="password" placeholder="请输入密码或Token" show-password />
              </div>
              <div class="config-item full">
                <span class="config-label">接口路径</span>
                <el-input v-model="config.apiPath" placeholder="/api/v1/resident/sync" />
              </div>
            </div>
          </div>
        </div>

        <!-- ② 字段映射 -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="panel-header">
            <h3>字段映射</h3>
            <span class="panel-desc">配置数据源字段与系统居民档案字段的对应关系</span>
          </div>

          <!-- 数据源进度卡片 -->
          <div class="source-cards">
            <div 
              v-for="source in dataSources" 
              :key="source.key" 
              class="source-card"
              :class="{ active: currentSource === source.key, done: source.progress === 100 }"
              @click="currentSource = source.key"
            >
              <div class="source-header">
                <div class="source-icon" :class="source.color">
                  <el-icon :size="18"><component :is="source.icon" /></el-icon>
                </div>
                <div class="source-info">
                  <div class="source-name">{{ source.name }}</div>
                  <div class="source-sub">{{ source.desc }}</div>
                </div>
                <el-tag 
                  v-if="source.progress === 100" 
                  type="success" 
                  size="small"
                  effect="light"
                >已完成</el-tag>
                <el-tag 
                  v-else 
                  type="primary" 
                  size="small"
                  effect="light"
                >进行中</el-tag>
              </div>
              <el-progress 
                :percentage="source.progress" 
                :color="source.progress === 100 ? '#67c23a' : '#409eff'"
                :stroke-width="4"
                :show-text="false"
              />
              <div class="source-progress-text">{{ source.progress }}%</div>
            </div>
          </div>

          <!-- 字段映射表格 -->
          <div class="mapping-table-wrapper">
            <div class="table-toolbar">
              <span class="table-title">{{ currentSourceName }} — 字段映射</span>
              <div class="table-actions">
                <el-button size="small" @click="autoMapping">
                  <el-icon><MagicStick /></el-icon>
                  AI自动映射
                </el-button>
                <el-button size="small" @click="addMapping">
                  <el-icon><Plus /></el-icon>
                  新增映射
                </el-button>
              </div>
            </div>
            <el-table :data="fieldMappings" border stripe :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600 }">
              <el-table-column label="源字段" width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.sourceField" size="small" placeholder="源字段名" />
                </template>
              </el-table-column>
              <el-table-column label="源字段说明" width="160">
                <template #default="scope">
                  <el-input v-model="scope.row.sourceDesc" size="small" placeholder="字段含义" />
                </template>
              </el-table-column>
              <el-table-column label="→" width="50" align="center">
                <template #default>
                  <el-icon color="#409eff"><Right /></el-icon>
                </template>
              </el-table-column>
              <el-table-column label="目标字段（系统）" width="200">
                <template #default="scope">
                  <el-select v-model="scope.row.targetField" size="small" placeholder="选择目标字段" style="width: 100%">
                    <el-option 
                      v-for="f in targetFields" 
                      :key="f.key" 
                      :label="f.label" 
                      :value="f.key" 
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="转换规则" width="160">
                <template #default="scope">
                  <el-select v-model="scope.row.transform" size="small" placeholder="无" clearable style="width: 100%">
                    <el-option label="无转换" value="" />
                    <el-option label="字符串转日期" value="date" />
                    <el-option label="枚举值映射" value="enum" />
                    <el-option label="加密传输" value="encrypt" />
                    <el-option label="身份证校验" value="idcard" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="必填" width="80" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.required" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="scope">
                  <el-button type="danger" link size="small" @click="removeMapping(scope.$index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- ③ 采样策略 -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="panel-header">
            <h3>采样策略</h3>
            <span class="panel-desc">配置数据采集频率、增量同步规则和异常处理机制</span>
          </div>
          <div class="strategy-grid">
            <div class="strategy-item">
              <span class="strategy-label">采集频率</span>
              <el-select v-model="strategy.frequency" placeholder="选择频率">
                <el-option label="每小时" value="hourly" />
                <el-option label="每6小时" value="6h" />
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="实时推送" value="realtime" />
              </el-select>
            </div>
            <div class="strategy-item">
              <span class="strategy-label">执行时间</span>
              <el-time-picker v-model="strategy.executeTime" format="HH:mm" placeholder="选择时间" />
            </div>
            <div class="strategy-item">
              <span class="strategy-label">同步方式</span>
              <el-radio-group v-model="strategy.syncMode">
                <el-radio-button label="incremental">增量同步</el-radio-button>
                <el-radio-button label="full">全量同步</el-radio-button>
              </el-radio-group>
            </div>
            <div class="strategy-item">
              <span class="strategy-label">增量字段</span>
              <el-select v-model="strategy.incrementalField" placeholder="选择增量标识字段" clearable>
                <el-option label="更新时间" value="updateTime" />
                <el-option label="版本号" value="version" />
                <el-option label="自增ID" value="id" />
              </el-select>
            </div>
            <div class="strategy-item">
              <span class="strategy-label">单次批量上限</span>
              <el-input-number v-model="strategy.batchSize" :min="100" :max="50000" :step="100" />
            </div>
            <div class="strategy-item">
              <span class="strategy-label">失败重试（次）</span>
              <el-input-number v-model="strategy.retryCount" :min="0" :max="10" />
            </div>
          </div>
          <div class="strategy-switch-row">
            <div class="switch-item">
              <span class="switch-label">数据校验</span>
              <el-switch v-model="strategy.enableValidate" />
            </div>
            <div class="switch-item">
              <span class="switch-label">异常自动告警</span>
              <el-switch v-model="strategy.enableAlert" />
            </div>
            <div class="switch-item">
              <span class="switch-label">冲突自动合并</span>
              <el-switch v-model="strategy.enableMerge" />
            </div>
            <div class="switch-item">
              <span class="switch-label">采集日志留存</span>
              <el-switch v-model="strategy.enableLog" />
            </div>
          </div>
        </div>

        <!-- ④ 任务预览 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="panel-header">
            <h3>任务预览</h3>
            <span class="panel-desc">确认配置信息，提交后创建采集任务</span>
          </div>
          <div class="preview-grid">
            <div class="preview-card">
              <div class="preview-label">数据源协议</div>
              <div class="preview-value">{{ currentProtocolName }}</div>
            </div>
            <div class="preview-card">
              <div class="preview-label">采集频率</div>
              <div class="preview-value">{{ frequencyLabel }}</div>
            </div>
            <div class="preview-card">
              <div class="preview-label">同步方式</div>
              <div class="preview-value">{{ strategy.syncMode === 'incremental' ? '增量同步' : '全量同步' }}</div>
            </div>
            <div class="preview-card">
              <div class="preview-label">映射字段数</div>
              <div class="preview-value">{{ fieldMappings.length }} 个</div>
            </div>
          </div>
          <div class="preview-mapping-summary">
            <div class="summary-title">字段映射汇总</div>
            <div class="summary-list">
              <div v-for="(m, idx) in fieldMappings" :key="idx" class="summary-item">
                <span class="src">{{ m.sourceField || '未填写' }}</span>
                <el-icon color="#409eff"><Right /></el-icon>
                <span class="tgt">{{ getTargetLabel(m.targetField) }}</span>
                <el-tag v-if="m.required" type="danger" size="small" effect="plain">必填</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="wizard-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <span v-else></span>
        <div class="action-right">
          <el-button @click="handleSaveDraft">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <el-button 
            type="primary" 
            :disabled="!canProceed"
            @click="nextStep"
          >
            {{ currentStep === steps.length - 1 ? '提交任务' : '下一步' }}
            <el-icon style="margin-left: 4px;"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, Plus, Check, Right, ArrowLeft, ArrowRight, 
  Document, Delete, MagicStick, Upload, Monitor, Connection, Link
} from '@element-plus/icons-vue'

const activeTab = ref('collect')
const currentStep = ref(1)
const currentSource = ref('household')
const selectedProtocol = ref('api')

const steps = [
  { key: 'protocol', label: '协议配置' },
  { key: 'mapping', label: '字段映射' },
  { key: 'strategy', label: '采样策略' },
  { key: 'preview', label: '任务预览' }
]

const protocols = [
  { key: 'api', name: 'REST API', desc: 'HTTP接口对接，支持JSON/XML格式', icon: 'Connection', color: 'blue', enabled: true },
  { key: 'database', name: '数据库直连', desc: 'MySQL/Oracle/SQL Server 直接查询', icon: 'Monitor', color: 'green', enabled: true },
  { key: 'file', name: '文件交换', desc: 'SFTP/FTP 文件下载，支持Excel/CSV', icon: 'Upload', color: 'orange', enabled: true },
  { key: 'kafka', name: '消息队列', desc: 'Kafka/RocketMQ 订阅推送', icon: 'Link', color: 'purple', enabled: false }
]

const config = reactive({
  serverUrl: 'https://api.wuhan.gov.cn/data',
  port: '443',
  username: 'admin',
  password: '********',
  apiPath: '/api/v1/resident/sync'
})

const dataSources = ref([
  { key: 'household', name: '户籍信息', desc: '公安户籍系统数据', progress: 100, color: 'blue', icon: 'Monitor' },
  { key: 'social', name: '社保数据', desc: '人社局社保缴费记录', progress: 100, color: 'green', icon: 'Connection' },
  { key: 'employment', name: '就业登记', desc: '就业局就业登记信息', progress: 80, color: 'orange', icon: 'Upload' },
  { key: 'subsidy', name: '低保记录', desc: '民政局低保发放记录', progress: 0, color: 'purple', icon: 'Link' }
])

const targetFields = [
  { key: 'name', label: '姓名' },
  { key: 'idCard', label: '身份证号' },
  { key: 'gender', label: '性别' },
  { key: 'birthday', label: '出生日期' },
  { key: 'householdAddress', label: '户籍地址' },
  { key: 'residenceAddress', label: '居住地址' },
  { key: 'contact', label: '联系方式' },
  { key: 'community', label: '所属社区' },
  { key: 'estate', label: '所在小区' },
  { key: 'grid', label: '所属网格' },
  { key: 'personType', label: '人员类别' },
  { key: 'specialGroup', label: '特殊人群' },
  { key: 'updateTime', label: '更新时间' }
]

const fieldMappings = reactive([
  { sourceField: 'XM', sourceDesc: '姓名', targetField: 'name', transform: '', required: true },
  { sourceField: 'SFZH', sourceDesc: '身份证号', targetField: 'idCard', transform: 'idcard', required: true },
  { sourceField: 'XB', sourceDesc: '性别', targetField: 'gender', transform: 'enum', required: true },
  { sourceField: 'CSRQ', sourceDesc: '出生日期', targetField: 'birthday', transform: 'date', required: false },
  { sourceField: 'DZ', sourceDesc: '地址', targetField: 'residenceAddress', transform: '', required: false },
  { sourceField: 'LXFS', sourceDesc: '联系方式', targetField: 'contact', transform: '', required: false },
  { sourceField: 'GX时间', sourceDesc: '更新时间', targetField: 'updateTime', transform: 'date', required: false }
])

const strategy = reactive({
  frequency: 'daily',
  executeTime: null,
  syncMode: 'incremental',
  incrementalField: 'updateTime',
  batchSize: 1000,
  retryCount: 3,
  enableValidate: true,
  enableAlert: true,
  enableMerge: false,
  enableLog: true
})

const currentSourceName = computed(() => {
  const s = dataSources.value.find(d => d.key === currentSource.value)
  return s ? s.name : ''
})

const currentProtocolName = computed(() => {
  const p = protocols.find(p => p.key === selectedProtocol.value)
  return p ? p.name : '未选择'
})

const frequencyLabel = computed(() => {
  const map = { hourly: '每小时', '6h': '每6小时', daily: '每天', weekly: '每周', realtime: '实时推送' }
  return map[strategy.frequency] || '未设置'
})

const canProceed = computed(() => {
  if (currentStep.value === 0) return !!selectedProtocol.value
  if (currentStep.value === 1) return fieldMappings.value.length > 0
  if (currentStep.value === 2) return !!strategy.frequency
  return true
})

const selectProtocol = (proto) => {
  if (!proto.enabled) return
  selectedProtocol.value = proto.key
}

const autoMapping = () => {
  ElMessage.success('AI 已自动识别并映射 7 个字段')
}

const addMapping = () => {
  fieldMappings.value.push({
    sourceField: '',
    sourceDesc: '',
    targetField: '',
    transform: '',
    required: false
  })
}

const removeMapping = (idx) => {
  fieldMappings.value.splice(idx, 1)
}

const getTargetLabel = (key) => {
  const f = targetFields.find(t => t.key === key)
  return f ? f.label : '未映射'
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    ElMessage.success('采集任务已创建！')
  }
}

const handleSaveDraft = () => {
  ElMessage.success('草稿已保存')
}

const handleRefresh = () => {
  ElMessage.success('状态已刷新')
}

const handleCreateTask = () => {
  currentStep.value = 0
  ElMessage.info('请按步骤配置采集任务')
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-tabs {
  margin-bottom: 16px;
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
  }
}

.main-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

/* 步骤条 */
.wizard-steps {
  display: flex;
  align-items: flex-start;
  padding: 16px 40px 32px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
  margin-bottom: 24px;
  position: relative;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.wizard-step.active .step-circle {
  background: #409eff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
}

.wizard-step.done .step-circle {
  background: #67c23a;
  color: #fff;
}

.step-label {
  margin-top: 8px;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.wizard-step.active .step-label {
  color: #409eff;
  font-weight: 600;
}

.wizard-step.done .step-label {
  color: #67c23a;
}

.step-line {
  position: absolute;
  top: 18px;
  left: calc(50% + 24px);
  right: calc(-50% + 24px);
  height: 2px;
  background: #e2e8f0;
  z-index: -1;
}

.step-line.active {
  background: #67c23a;
}

/* 步骤面板 */
.step-content {
  min-height: 420px;
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: inline-block;
}

.panel-desc {
  margin-left: 12px;
  font-size: 13px;
  color: #94a3b8;
}

/* 协议卡片 */
.protocol-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.protocol-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.protocol-card:hover {
  border-color: #93c5fd;
  background: #f8fafc;
}

.protocol-card.selected {
  border-color: #409eff;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
}

.protocol-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.proto-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &.blue { background: #409eff; }
  &.green { background: #67c23a; }
  &.orange { background: #e6a23c; }
  &.purple { background: #a855f7; }
}

.proto-info {
  flex: 1;
  min-width: 0;
}

.proto-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.proto-desc {
  font-size: 12px;
  color: #94a3b8;
}

/* 配置表单 */
.config-form {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.config-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full {
    grid-column: 1 / -1;
  }
}

.config-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 数据源卡片 */
.source-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.source-card {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  background: #fff;
}

.source-card:hover {
  border-color: #93c5fd;
}

.source-card.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.source-card.done {
  border-color: #67c23a;
  background: #f0fdf4;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.source-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &.blue { background: #409eff; }
  &.green { background: #67c23a; }
  &.orange { background: #e6a23c; }
  &.purple { background: #a855f7; }
}

.source-info {
  flex: 1;
  min-width: 0;
}

.source-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.source-sub {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-progress-text {
  text-align: right;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* 映射表格 */
.mapping-table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* 策略配置 */
.strategy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.strategy-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.strategy-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.strategy-switch-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-label {
  font-size: 13px;
  color: #475569;
}

/* 预览 */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.preview-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.preview-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.preview-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.preview-mapping-summary {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
}

.summary-item .src {
  color: #1e293b;
  font-weight: 500;
}

.summary-item .tgt {
  color: #409eff;
  font-weight: 500;
}

/* 底部操作栏 */
.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.action-right {
  display: flex;
  gap: 12px;
}
</style>
