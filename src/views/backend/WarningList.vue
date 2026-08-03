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

    <!-- 预警规则分类统计板块 -->
    <div class="content-card rules-card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-title">预警分类统计</span>
          <span class="card-desc">按财产、生存状态、户籍异动分类统计预警条数（全量累计）</span>
        </div>
        <div class="time-filter-bar">
          <el-radio-group v-model="timeRangeType" size="default" @change="onTimeRangeChange">
            <el-radio-button label="month">按月</el-radio-button>
            <el-radio-button label="quarter">按季度</el-radio-button>
            <el-radio-button label="year">按年度</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-if="timeRangeType === 'custom'"
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="default"
            style="margin-left: 10px"
            @change="onTimeRangeChange"
          />
        </div>
      </div>
      <div class="warning-category-row">
        <div class="warning-category-card property-card">
          <div class="wc-icon"><el-icon><Money /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ propertyWarningCount }}</span>
            <span class="wc-label">财产预警</span>
          </div>
        </div>
        <div class="warning-category-card survival-card">
          <div class="wc-icon"><el-icon><User /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ survivalWarningCount }}</span>
            <span class="wc-label">生存状态预警</span>
          </div>
        </div>
        <div class="warning-category-card household-card">
          <div class="wc-icon"><el-icon><Location /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ householdWarningCount }}</span>
            <span class="wc-label">户籍异动预警</span>
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
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 110px">
            <el-option label="待处理" value="待处理" />
            <el-option label="审批中" value="审批中" />
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
        <el-table-column prop="idCard" label="身份证号" width="170">
          <template #default="scope">
            <span v-if="scope.row.idCard">{{ scope.row.idCard.slice(0, 6) + '********' + scope.row.idCard.slice(-4) }}</span>
            <span v-else class="no-data">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="warningType" label="预警类型" width="120">
          <template #default="scope">
            <el-tag :type="getWarningType(scope.row.warningType)" size="small">{{ scope.row.warningType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警内容" min-width="200">
          <template #default="scope">
            <div class="warning-content">
              <span class="content-text">{{ scope.row.content }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ruleSource" label="比对来源" width="140">
          <template #default="scope">
            <el-tooltip :content="getSourceDesc(scope.row.ruleSource)" placement="top">
              <el-tag type="info" size="small" effect="plain">{{ scope.row.ruleSource }}</el-tag>
            </el-tooltip>
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
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button v-if="scope.row.status === '待处理'" type="success" link size="small" @click="handleResolve(scope.row)">处理</el-button>
              <el-button type="primary" link size="small" @click="viewDetail(scope.row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="filteredWarnings.length"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>

    <el-dialog title="预警详情" v-model="showDetailDialog" width="680px">
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
              <span class="info-label">涉及居民</span>
              <span class="info-value">{{ selectedWarning.residentName }}（{{ selectedWarning.idCard || '无身份证信息' }}）</span>
            </div>
            <div class="info-row">
              <span class="info-label">预警内容</span>
              <span class="info-value highlight">{{ selectedWarning.content }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">比对来源</span>
              <span class="info-value">{{ selectedWarning.ruleSource }}（{{ getSourceDesc(selectedWarning.ruleSource) }}）</span>
            </div>
            <div class="info-row">
              <span class="info-label">预警时间</span>
              <span class="info-value">{{ selectedWarning.createTime }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="section-title">所属标签</h4>
          <div v-if="warningResidentTags.length > 0" class="resident-tags-list">
            <div v-for="tag in warningResidentTags" :key="tag.id" class="resident-tag-item">
              <div class="tag-item-header">
                <el-tag :type="getTagType(tag.tagType)" size="small" effect="light">{{ tag.tagType }}</el-tag>
                <span class="tag-sub-name">{{ tag.tagSubType }}</span>
                <el-tag :type="tag.isEnjoy ? 'success' : 'info'" size="small" effect="plain">
                  {{ tag.isEnjoy ? '享受中' : '已停发' }}
                </el-tag>
              </div>
              <div class="tag-item-body">
                <span v-if="tag.subsidyAmount" class="tag-info-row"><strong>补贴金额：</strong>{{ tag.subsidyAmount }}元/月</span>
                <span class="tag-info-row"><strong>失效日期：</strong>{{ tag.expireDate || '目前在保' }}</span>
                <span v-if="tag.disabilityType && tag.disabilityLevel" class="tag-info-row">
                  <strong>残疾信息：</strong>{{ tag.disabilityType }} {{ tag.disabilityLevel }}
                </span>
                <span v-if="tag.houseAddress" class="tag-info-row"><strong>房屋地址：</strong>{{ tag.houseAddress }}</span>
                <span v-if="tag.rent" class="tag-info-row"><strong>租金：</strong>{{ tag.rent }}元/月</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-tags">
            <el-empty description="该居民暂无保障标签信息" :image-size="80" />
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
            <template v-if="selectedWarning.status === '审批中'">
              <div class="info-row">
                <span class="info-label">审批人</span>
                <span class="info-value">{{ selectedWarning.approver || '--' }}</span>
              </div>
              <div v-if="selectedWarning.approveRemark" class="info-row">
                <span class="info-label">审批意见</span>
                <span class="info-value">{{ selectedWarning.approveRemark }}</span>
              </div>
            </template>
            <div v-if="selectedWarning.imageUrls && selectedWarning.imageUrls.length > 0" class="info-row">
              <span class="info-label">佐证图片</span>
              <div class="info-value image-preview-list">
                <el-image
                  v-for="(url, idx) in selectedWarning.imageUrls"
                  :key="idx"
                  :src="url"
                  :preview-src-list="selectedWarning.imageUrls"
                  :initial-index="idx"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px; margin-right: 8px;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="处理预警" v-model="showResolveDialog" width="520px">
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="处理结果" required>
          <el-radio-group v-model="resolveForm.result">
            <el-radio label="确认属实">确认属实</el-radio>
            <el-radio label="信息有误">信息有误</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" required>
          <el-input v-model="resolveForm.remark" type="textarea" :rows="3" placeholder="请填写处理说明，信息有误需详细说明原因..." />
        </el-form-item>
        <el-form-item label="佐证图片" required v-if="resolveForm.result">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :limit="3"
            :on-exceed="handleExceed"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，单张不超过2MB，最多3张
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="审批人" required v-if="resolveForm.result === '信息有误'">
          <el-select v-model="resolveForm.approver" placeholder="请选择审批人" style="width: 100%">
            <el-option v-for="a in approvers" :key="a.value" :label="a.label" :value="a.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见" v-if="resolveForm.result === '信息有误'">
          <el-input v-model="resolveForm.approveRemark" type="textarea" :rows="2" placeholder="请填写提交审批的意见说明（选填）" />
        </el-form-item>
        <el-form-item v-if="resolveForm.result === '信息有误'">
          <div class="approve-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>信息有误需走审批流程，以街道/社区线下实地核查结果为最终判定依据</span>
          </div>
        </el-form-item>
        <el-form-item v-if="resolveForm.result === '确认属实'">
          <div class="confirm-tip">
            <el-icon><Warning /></el-icon>
            <span v-if="isDeathWarning">确认死亡属实后，该人员全部保障待遇将自动改为"不享受"，并移入历史居民库</span>
            <span v-else>确认后将更新该人员相关状态信息</span>
          </div>
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Warning, Bell, CircleCheck, Clock, Money, User, Location, InfoFilled } from '@element-plus/icons-vue'
import { warnings as mockWarnings, warningTypes, tags, residents } from '../../data/mock'

const warnings = ref([...mockWarnings])
const currentPage = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const filterStatus = ref('')
const showDetailDialog = ref(false)
const showResolveDialog = ref(false)
const showAddWarningDialog = ref(false)
const selectedWarning = ref(null)

const timeRangeType = ref('month')
const customDateRange = ref([])
const dateFilterRange = ref(null)

const ruleEnabled = reactive({
  houseArea: true, car: true, company: true, fund: true,
  death: true, migration: true, migrationAlert: true, duplicate4050: true, income: true
})

const totalCount = computed(() => warnings.value.length)
const pendingCount = computed(() => warnings.value.filter(w => w.status === '待处理').length)
const resolvedCount = computed(() => warnings.value.filter(w => w.status === '已处理').length)
const todayCount = computed(() => warnings.value.filter(w => w.createTime.startsWith('2024-06-20')).length)

const getWarningsInRange = (type) => {
  let list = warnings.value.filter(w => type.includes(w.warningType) || w.warningType.includes(type))
  if (dateFilterRange.value) {
    list = list.filter(w => {
      const wDate = new Date(w.createTime)
      return wDate >= dateFilterRange.value[0] && wDate <= dateFilterRange.value[1]
    })
  }
  return list.length
}

const propertyWarningCount = computed(() => {
  const types = ['不动产超标', '车辆登记', '工商注册', '公积金超标']
  let list = warnings.value.filter(w => types.some(t => w.warningType.includes(t) || t.includes(w.warningType)))
  if (dateFilterRange.value) {
    list = list.filter(w => {
      const wDate = new Date(w.createTime)
      return wDate >= dateFilterRange.value[0] && wDate <= dateFilterRange.value[1]
    })
  }
  return list.length
})

const survivalWarningCount = computed(() => {
  let list = warnings.value.filter(w => w.warningType.includes('死亡') || w.warningType.includes('状态不一致'))
  if (dateFilterRange.value) {
    list = list.filter(w => {
      const wDate = new Date(w.createTime)
      return wDate >= dateFilterRange.value[0] && wDate <= dateFilterRange.value[1]
    })
  }
  return list.length
})

const householdWarningCount = computed(() => {
  let list = warnings.value.filter(w => w.warningType.includes('户籍'))
  if (dateFilterRange.value) {
    list = list.filter(w => {
      const wDate = new Date(w.createTime)
      return wDate >= dateFilterRange.value[0] && wDate <= dateFilterRange.value[1]
    })
  }
  return list.length
})

const onTimeRangeChange = () => {
  const now = new Date()
  if (timeRangeType.value === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilterRange.value = [start, now]
  } else if (timeRangeType.value === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), q * 3, 1)
    dateFilterRange.value = [start, now]
  } else if (timeRangeType.value === 'year') {
    const start = new Date(now.getFullYear(), 0, 1)
    dateFilterRange.value = [start, now]
  } else if (timeRangeType.value === 'custom' && customDateRange.value && customDateRange.value.length === 2) {
    dateFilterRange.value = [new Date(customDateRange.value[0]), new Date(customDateRange.value[1])]
  } else {
    dateFilterRange.value = null
  }
}

const filteredWarnings = computed(() => {
  let result = warnings.value
  if (filterType.value) result = result.filter(w => w.warningType === filterType.value)
  if (filterStatus.value) result = result.filter(w => w.status === filterStatus.value)
  return result
})

const resolveForm = reactive({ result: '', remark: '', imageUrls: [], approver: '', approveRemark: '' })
const addForm = reactive({ residentName: '', warningType: '', content: '', level: '普通' })
const fileList = ref([])

const getWarningType = (type) => {
  if (type.includes('死亡') || type.includes('不动产') || type.includes('车辆') || type.includes('重复') || type.includes('状态')) return 'danger'
  if (type.includes('户籍') || type.includes('服刑') || type.includes('失联')) return 'warning'
  return 'info'
}
const getStatusType = (status) => ({ '待处理': 'danger', '审批中': 'warning', '已处理': 'success', '已忽略': 'info' }[status] || 'info')

const getTagType = (type) => {
  const map = {
    '低保': 'danger', '残疾': 'warning', '公租房': 'info',
    '老年': 'success', '计生': '', '社保': '', '重症': 'danger',
    '涉军': 'danger', '支农返汉': 'info', '困境儿童': 'warning'
  }
  return map[type] || 'info'
}

const getSourceDesc = (source) => {
  const map = {
    '生存状态校验': '民政死亡数据比对接口',
    '到龄提醒校验': '系统内部规则校验',
    '政策符合条件预警': '政策匹配引擎',
    '政策到期校验': '系统标签有效期校验',
    '政策互斥校验': '政策互斥规则引擎',
    '手动录入': '工作人员手动登记'
  }
  return map[source] || '系统自动比对'
}

const isDeathWarning = computed(() => {
  if (!selectedWarning.value) return false
  return selectedWarning.value.warningType.includes('死亡') || selectedWarning.value.warningType.includes('状态不一致')
})

const warningResidentTags = computed(() => {
  if (!selectedWarning.value) return []
  const rid = selectedWarning.value.residentId
  return tags.filter(t => t.residentId === rid)
})

const approvers = [
  { value: '张三', label: '张三（街道民政办主任）' },
  { value: '李四', label: '李四（社区书记）' },
  { value: '王五', label: '王五（民政专干）' }
]

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterType.value = ''; filterStatus.value = ''; currentPage.value = 1 }
const viewDetail = (row) => { selectedWarning.value = row; showDetailDialog.value = true }
const handleResolve = (row) => { 
  selectedWarning.value = row
  resolveForm.result = ''
  resolveForm.remark = ''
  resolveForm.imageUrls = []
  resolveForm.approver = ''
  resolveForm.approveRemark = ''
  fileList.value = []
  showResolveDialog.value = true 
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG格式的图片')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('单张图片大小不能超过2MB')
    return false
  }
  return true
}

const handleUploadSuccess = (response, file) => {
  const url = URL.createObjectURL(file.raw)
  resolveForm.imageUrls.push(url)
}

const handleRemove = (file) => {
  const url = URL.createObjectURL(file.raw)
  const index = resolveForm.imageUrls.indexOf(url)
  if (index > -1) {
    resolveForm.imageUrls.splice(index, 1)
  }
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传3张图片')
}

const confirmResolve = () => {
  if (!resolveForm.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  if (!resolveForm.remark || resolveForm.remark.trim() === '') {
    ElMessage.warning('请填写处理说明')
    return
  }
  if (resolveForm.imageUrls.length === 0) {
    ElMessage.warning('请上传佐证图片')
    return
  }
  if (resolveForm.result === '信息有误') {
    if (!resolveForm.approver) {
      ElMessage.warning('请选择审批人')
      return
    }
  }
  if (selectedWarning.value) {
    selectedWarning.value.imageUrls = [...resolveForm.imageUrls]
    if (resolveForm.result === '信息有误') {
      selectedWarning.value.status = '审批中'
      selectedWarning.value.approver = resolveForm.approver
      selectedWarning.value.approveRemark = resolveForm.approveRemark
      ElMessage.success('已提交审批，请等待审批人处理')
    } else {
      selectedWarning.value.status = '已处理'
      selectedWarning.value.operator = '管理员'
      selectedWarning.value.resolveTime = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5)
      
      if (isDeathWarning.value) {
        const rid = selectedWarning.value.residentId
        const res = residents.find(r => r.id === rid)
        if (res) {
          res.survivalStatus = '已去世'
          res.isHistorical = true
        }
        tags.filter(t => t.residentId === rid).forEach(t => {
          t.isEnjoy = false
        })
        ElMessage.success('处理成功，该人员保障待遇已停止，已移入历史居民库')
      } else {
        ElMessage.success('处理成功')
      }
    }
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

watch(timeRangeType, onTimeRangeChange, { immediate: true })
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
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.card-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.card-desc { font-size: 12px; color: #9ca3af; }

.time-filter-bar { display: flex; align-items: center; gap: 10px; }

.warning-category-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.warning-category-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 10px; color: #fff; }
.property-card { background: linear-gradient(135deg, #f56c6c, #e53e3e); }
.survival-card { background: linear-gradient(135deg, #e6a23c, #d97706); }
.household-card { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.wc-icon { width: 52px; height: 52px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; }
.wc-info { display: flex; flex-direction: column; gap: 4px; }
.wc-count { font-size: 28px; font-weight: 700; line-height: 1.2; }
.wc-label { font-size: 14px; opacity: 0.9; }

.search-bar { display: flex; gap: 10px; align-items: center; }
.warning-content { display: flex; align-items: center; gap: 8px; }
.content-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.action-buttons { display: flex; justify-content: center; gap: 4px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.no-data { color: #d1d5db; font-size: 12px; }

.detail-content { padding: 8px 0; }
.detail-section { margin-bottom: 20px; }
.detail-section:last-child { margin-bottom: 0; }
.section-title { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #409eff; }
.detail-info { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; align-items: center; gap: 12px; }
.info-label { font-size: 13px; color: #6b7280; min-width: 70px; }
.info-value { font-size: 13px; color: #1f2937; font-weight: 500; }
.info-value.highlight { color: #f56c6c; font-weight: 600; }

.resident-tags-list { display: flex; flex-direction: column; gap: 10px; }
.resident-tag-item { background: #f9fafb; border-radius: 8px; padding: 12px; border: 1px solid #f3f4f6; }
.tag-item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tag-sub-name { font-size: 14px; font-weight: 600; color: #1f2937; flex: 1; }
.tag-item-body { display: flex; flex-wrap: wrap; gap: 6px 16px; }
.tag-info-row { font-size: 12px; color: #4b5563; }
.tag-info-row strong { color: #6b7280; font-weight: 500; margin-right: 4px; }

.empty-tags { text-align: center; padding: 20px; }

.approve-tip, .confirm-tip { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: 6px; font-size: 12px; line-height: 1.5; }
.approve-tip { background: #eff6ff; color: #1d4ed8; }
.approve-tip .el-icon { margin-top: 1px; color: #3b82f6; }
.confirm-tip { background: #fef2f2; color: #b91c1c; }
.confirm-tip .el-icon { margin-top: 1px; color: #ef4444; }
</style>