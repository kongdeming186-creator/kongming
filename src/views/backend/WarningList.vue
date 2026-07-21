<template>
  <div class="warning-list-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">预警管理</h2>
        <p class="page-subtitle">共 {{ warnings.length }} 条预警，待处理 {{ pendingCount }} 条</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddWarningDialog = true">
          <el-icon><Plus /></el-icon>新增预警
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon red"><el-icon><Warning /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">预警总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><el-icon><Bell /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待处理</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ resolvedCount }}</span>
          <span class="stat-label">已处理</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><el-icon><Clock /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ todayCount }}</span>
          <span class="stat-label">今日预警</span>
        </div>
      </div>
    </div>

    <!-- 预警规则分类面板 -->
    <div class="content-card rules-card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-title">预警规则分类</span>
          <span class="card-desc">系统预置自动比对规则，实时监控异常</span>
        </div>
        <el-button text @click="showRulesPanel = !showRulesPanel">
          {{ showRulesPanel ? '收起' : '展开' }}
        </el-button>
      </div>
      <div v-show="showRulesPanel" class="rules-grid">
        <div class="rule-category">
          <div class="category-header">
            <el-icon><Money /></el-icon>
            <span class="category-title">财产预警</span>
            <el-tag type="danger" size="small">{{ propertyWarningCount }}条</el-tag>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <span class="rule-name">不动产超标</span>
              <el-switch v-model="ruleEnabled.houseArea" size="small" />
            </div>
            <div class="rule-item">
              <span class="rule-name">车辆登记</span>
              <el-switch v-model="ruleEnabled.car" size="small" />
            </div>
            <div class="rule-item">
              <span class="rule-name">工商注册</span>
              <el-switch v-model="ruleEnabled.company" size="small" />
            </div>
            <div class="rule-item">
              <span class="rule-name">公积金超标</span>
              <el-switch v-model="ruleEnabled.fund" size="small" />
            </div>
          </div>
        </div>
        <div class="rule-category">
          <div class="category-header">
            <el-icon><User /></el-icon>
            <span class="category-title">生存状态预警</span>
            <el-tag type="danger" size="small">{{ survivalWarningCount }}条</el-tag>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <span class="rule-name">死亡信息推送</span>
              <el-switch v-model="ruleEnabled.death" size="small" />
            </div>
          </div>
        </div>
        <div class="rule-category">
          <div class="category-header">
            <el-icon><Location /></el-icon>
            <span class="category-title">户籍异动预警</span>
            <el-tag type="warning" size="small">{{ householdWarningCount }}条</el-tag>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <span class="rule-name">户籍迁出检测</span>
              <el-switch v-model="ruleEnabled.migration" size="small" />
            </div>
            <div class="rule-item">
              <span class="rule-name">户籍迁移提醒</span>
              <el-switch v-model="ruleEnabled.migrationAlert" size="small" />
            </div>
          </div>
        </div>
        <div class="rule-category">
          <div class="category-header">
            <el-icon><Document /></el-icon>
            <span class="category-title">补贴防重复</span>
            <el-tag type="warning" size="small">{{ duplicateWarningCount }}条</el-tag>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <span class="rule-name">4050重复申报</span>
              <el-switch v-model="ruleEnabled.duplicate4050" size="small" />
            </div>
          </div>
        </div>
        <div class="rule-category">
          <div class="category-header">
            <el-icon><TrendCharts /></el-icon>
            <span class="category-title">收入预警</span>
            <el-tag type="warning" size="small">{{ incomeWarningCount }}条</el-tag>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <span class="rule-name">收入超标准预警</span>
              <el-switch v-model="ruleEnabled.income" size="small" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <span class="card-title">预警列表</span>
        <div class="search-bar">
          <el-select v-model="filterType" placeholder="预警类型" clearable style="width: 120px">
            <el-option v-for="t in warningTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterLevel" placeholder="预警等级" clearable style="width: 110px">
            <el-option label="紧急" value="紧急" />
            <el-option label="普通" value="普通" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 110px">
            <el-option label="待处理" value="待处理" />
            <el-option label="已处理" value="已处理" />
            <el-option label="已忽略" value="已忽略" />
          </el-select>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>
      <el-table :data="filteredWarnings" border stripe
        :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="residentName" label="姓名" width="80" />
        <el-table-column prop="warningType" label="预警类型" width="120">
          <template #default="scope">
            <el-tag :type="getWarningType(scope.row.warningType)" size="small">{{ scope.row.warningType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警内容" min-width="200">
          <template #default="scope">
            <div class="warning-content">
              <span class="content-text">{{ scope.row.content }}</span>
              <el-tag v-if="scope.row.level === '紧急'" type="danger" size="small">紧急</el-tag>
              <el-tag v-else type="warning" size="small">普通</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ruleSource" label="比对来源" width="120">
          <template #default="scope">
            <el-tag type="info" size="small" effect="plain">{{ scope.row.ruleSource }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预警时间" width="120" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="处理人" width="80" />
        <el-table-column prop="resolveTime" label="处理时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button v-if="scope.row.status === '待处理'" type="success" link size="small" @click="handleResolve(scope.row)">处理</el-button>
              <el-button type="primary" link size="small" @click="viewDetail(scope.row)">详情</el-button>
              <el-button type="info" link size="small" @click="handleIgnore(scope.row)">忽略</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="filteredWarnings.length"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>

    <el-dialog title="预警详情" v-model="showDetailDialog" width="560px">
      <div v-if="selectedWarning" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">预警信息</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">预警类型</span>
              <span class="info-value">
                <el-tag :type="getWarningType(selectedWarning.warningType)">{{ selectedWarning.warningType }}</el-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">预警等级</span>
              <span class="info-value">
                <el-tag :type="selectedWarning.level === '紧急' ? 'danger' : 'warning'">{{ selectedWarning.level }}</el-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">涉及居民</span>
              <span class="info-value">{{ selectedWarning.residentName }}（{{ selectedWarning.idCard }}）</span>
            </div>
            <div class="info-row">
              <span class="info-label">预警内容</span>
              <span class="info-value highlight">{{ selectedWarning.content }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">比对来源</span>
              <span class="info-value">{{ selectedWarning.ruleSource }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预警时间</span>
              <span class="info-value">{{ selectedWarning.createTime }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">处理记录</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">当前状态</span>
              <span class="info-value"><el-tag :type="getStatusType(selectedWarning.status)">{{ selectedWarning.status }}</el-tag></span>
            </div>
            <div class="info-row">
              <span class="info-label">处理人</span>
              <span class="info-value">{{ selectedWarning.operator || '--' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">处理时间</span>
              <span class="info-value">{{ selectedWarning.resolveTime || '--' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="处理预警" v-model="showResolveDialog" width="500px">
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="resolveForm.result">
            <el-radio label="确认属实">确认属实</el-radio>
            <el-radio label="信息有误">信息有误</el-radio>
            <el-radio label="需进一步核实">需进一步核实</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="resolveForm.remark" type="textarea" :rows="4" placeholder="请填写处理说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResolveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确认处理</el-button>
      </template>
    </el-dialog>

    <el-dialog title="新增预警" v-model="showAddWarningDialog" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="居民姓名">
          <el-input v-model="addForm.residentName" />
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select v-model="addForm.warningType" style="width: 100%">
            <el-option v-for="t in warningTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警内容">
          <el-input v-model="addForm.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="预警等级">
          <el-radio-group v-model="addForm.level">
            <el-radio label="紧急">紧急</el-radio>
            <el-radio label="普通">普通</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddWarningDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Warning, Bell, CircleCheck, Clock, Money, User, Location, Document, TrendCharts } from '@element-plus/icons-vue'
import { warnings as mockWarnings, warningTypes } from '../../data/mock'

const warnings = ref([...mockWarnings])
const currentPage = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const filterLevel = ref('')
const filterStatus = ref('')
const showRulesPanel = ref(true)
const showDetailDialog = ref(false)
const showResolveDialog = ref(false)
const showAddWarningDialog = ref(false)
const selectedWarning = ref(null)

const ruleEnabled = reactive({
  houseArea: true, car: true, company: true, fund: true,
  death: true, migration: true, migrationAlert: true, duplicate4050: true, income: true
})

const totalCount = computed(() => warnings.value.length)
const pendingCount = computed(() => warnings.value.filter(w => w.status === '待处理').length)
const resolvedCount = computed(() => warnings.value.filter(w => w.status === '已处理').length)
const todayCount = computed(() => warnings.value.filter(w => w.createTime.startsWith('2024-06-20')).length)

const propertyWarningCount = computed(() => warnings.value.filter(w => ['不动产超标', '车辆登记', '工商注册', '公积金超标'].some(t => w.warningType.includes(t))).length)
const survivalWarningCount = computed(() => warnings.value.filter(w => w.warningType.includes('死亡')).length)
const householdWarningCount = computed(() => warnings.value.filter(w => w.warningType.includes('户籍')).length)
const duplicateWarningCount = computed(() => warnings.value.filter(w => w.warningType.includes('重复')).length)
const incomeWarningCount = computed(() => warnings.value.filter(w => w.warningType.includes('收入')).length)

const filteredWarnings = computed(() => {
  let result = warnings.value
  if (filterType.value) result = result.filter(w => w.warningType === filterType.value)
  if (filterLevel.value) result = result.filter(w => w.level === filterLevel.value)
  if (filterStatus.value) result = result.filter(w => w.status === filterStatus.value)
  return result
})

const resolveForm = reactive({ result: '', remark: '' })
const addForm = reactive({ residentName: '', warningType: '', content: '', level: '普通' })

const getWarningType = (type) => {
  if (type.includes('死亡') || type.includes('不动产') || type.includes('车辆') || type.includes('重复')) return 'danger'
  if (type.includes('户籍') || type.includes('服刑') || type.includes('失联')) return 'warning'
  return 'info'
}
const getStatusType = (status) => ({ '待处理': 'danger', '已处理': 'success', '已忽略': 'info' }[status] || 'info')

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterType.value = ''; filterLevel.value = ''; filterStatus.value = ''; currentPage.value = 1 }
const viewDetail = (row) => { selectedWarning.value = row; showDetailDialog.value = true }
const handleResolve = (row) => { selectedWarning.value = row; showResolveDialog.value = true }
const handleIgnore = (row) => {
  ElMessageBox.confirm('确定要忽略该预警吗？', '忽略确认').then(() => {
    row.status = '已忽略'; ElMessage.success('已忽略')
  }).catch(() => {})
}
const confirmResolve = () => {
  if (selectedWarning.value) {
    selectedWarning.value.status = '已处理'
    selectedWarning.value.operator = '管理员'
    selectedWarning.value.resolveTime = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5)
    ElMessage.success('处理成功')
  }
  showResolveDialog.value = false
}
const confirmAdd = () => {
  warnings.value.unshift({
    id: String(Date.now()),
    residentId: 'new',
    residentName: addForm.residentName,
    idCard: '',
    warningType: addForm.warningType,
    content: addForm.content,
    level: addForm.level,
    ruleSource: '手动录入',
    status: '待处理',
    createTime: new Date().toISOString().split('T')[0],
    operator: ''
  })
  showAddWarningDialog.value = false
  ElMessage.success('新增预警成功')
}
</script>

<style scoped>
.warning-list-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.stat-icon.red { background: linear-gradient(135deg, #f56c6c, #f78989); }
.stat-icon.orange { background: linear-gradient(135deg, #e6a23c, #ebb563); }
.stat-icon.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
.stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; display: block; }
.stat-label { font-size: 12px; color: #6b7280; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); }
.rules-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.card-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.card-desc { font-size: 12px; color: #9ca3af; }

.rules-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.rule-category { background: #f9fafb; border-radius: 8px; padding: 14px; }
.category-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.category-header .el-icon { font-size: 18px; color: #409eff; }
.category-title { font-size: 14px; font-weight: 600; color: #1f2937; flex: 1; }
.rule-list { display: flex; flex-direction: column; gap: 10px; }
.rule-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.rule-name { font-size: 13px; color: #4b5563; }

.search-bar { display: flex; gap: 10px; align-items: center; }
.warning-content { display: flex; align-items: center; gap: 8px; }
.content-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.action-buttons { display: flex; justify-content: center; gap: 4px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.detail-content { padding: 8px 0; }
.detail-section { margin-bottom: 20px; }
.detail-section:last-child { margin-bottom: 0; }
.section-title { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #409eff; }
.detail-info { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; align-items: center; gap: 12px; }
.info-label { font-size: 13px; color: #6b7280; min-width: 70px; }
.info-value { font-size: 13px; color: #1f2937; font-weight: 500; }
.info-value.highlight { color: #f56c6c; font-weight: 600; }
</style>