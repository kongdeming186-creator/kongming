<template>
  <div class="warning-list-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">核查管理</h2>
        <p class="page-subtitle">共 {{ totalCount }} 条待核查，待处理 {{ pendingCount }} 条 · 涉及 {{ filteredGroupedWarnings.length }} 位居民</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddWarningDialog = true">
          <el-icon><Plus /></el-icon>新增核查
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon red"><el-icon><Warning /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">核查总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><el-icon><Bell /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待核查</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ resolvedCount }}</span>
          <span class="stat-label">已核查</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><el-icon><Clock /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ todayCount }}</span>
          <span class="stat-label">今日待核查</span>
        </div>
      </div>
    </div>

    <!-- 预警分类统计 -->
    <div class="content-card rules-card">
      <div class="card-header">
        <div class="header-left">
          <span class="card-title">核查分类统计</span>
          <span class="card-desc">按政策不符、到期取消、政策互斥、状态变化分类统计核查条数（全量累计）</span>
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
          <div class="wc-icon"><el-icon><Warning /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ mismatchWarningCount }}</span>
            <span class="wc-label">政策不符</span>
          </div>
        </div>
        <div class="warning-category-card survival-card">
          <div class="wc-icon"><el-icon><Clock /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ expireWarningCount }}</span>
            <span class="wc-label">到期取消</span>
          </div>
        </div>
        <div class="warning-category-card household-card">
          <div class="wc-icon"><el-icon><Connection /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ mutexWarningCount }}</span>
            <span class="wc-label">政策互斥</span>
          </div>
        </div>
        <div class="warning-category-card status-card">
          <div class="wc-icon"><el-icon><CircleClose /></el-icon></div>
          <div class="wc-info">
            <span class="wc-count">{{ statusWarningCount }}</span>
            <span class="wc-label">状态变化</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 + 核查列表 -->
    <div class="content-card">
      <div class="card-header filter-header">
      <div class="card-title">核查列表</div>
        <div class="filter-bar">
          <el-select v-model="filterCategoryType" placeholder="核查类型" clearable style="width: 130px">
            <el-option v-for="t in warningCategoryTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="核查状态" clearable style="width: 120px">
            <el-option label="待核查" value="待处理" />
            <el-option label="已处理" value="已处理" />
            <el-option label="审批中" value="审批中" />
          </el-select>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>

      <!-- 核查列表视图 -->
      <div class="warning-list-table">
        <el-table :data="pagedGroupedWarnings" stripe style="width: 100%" size="small" :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 600 }">
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column label="姓名" width="80">
            <template #default="scope">
              <span class="resident-name-cell">{{ scope.row.residentName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="性别" width="55" align="center">
            <template #default="scope">
              <span>{{ getResidentGender(scope.row.residentId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="年龄" width="55" align="center">
            <template #default="scope">
              <span>{{ getResidentAge(scope.row.residentId) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="idCard" label="身份证号" width="150">
            <template #default="scope">
              <span>{{ formatIdCard(scope.row.idCard) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="社区" width="90" align="center">
            <template #default="scope">
              <span>{{ getResidentCommunity(scope.row.residentId).split(' · ')[0] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="网格" width="85" align="center">
            <template #default="scope">
              <span>{{ getResidentGrid(scope.row.residentId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="核查类型" width="150">
            <template #default="scope">
              <div class="category-tags-cell">
                <el-tag
                  v-for="ct in getWarningCategory(scope.row)"
                  :key="ct"
                  size="small"
                  effect="plain"
                  type="info"
                  style="margin-right: 4px; margin-bottom: 2px;"
                >{{ ct }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="享受政策" min-width="220">
            <template #default="scope">
              <div class="benefit-tags-cell">
                <el-tag
                  v-for="tag in scope.row.residentTags"
                  :key="tag.id"
                  size="small"
                  effect="plain"
                  type="info"
                  class="benefit-tag"
                >
                  {{ tag.tagType }}·{{ tag.tagSubType }}
                </el-tag>
                <span v-if="scope.row.residentTags.length === 0" class="no-benefit">无</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="比对结果" min-width="260">
            <template #default="scope">
              <div class="check-cell">
                <div
                  v-for="(item, idx) in scope.row.checkItems"
                  :key="idx"
                  class="check-tag"
                  :class="[getCheckTagClass(item)]"
                  :title="item.remark || item.name + ': ' + item.value"
                >
                  <span class="check-dot" :class="getCheckDotClass(item)"></span>
                  {{ item.name }}
                </div>
                <span v-if="scope.row.checkItems.filter(c => c.status === 'abnormal').length > 0" class="abnormal-count-txt">
                  · {{ scope.row.checkItems.filter(c => c.status === 'abnormal').length }}项异常
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="viewDetail(getLatestWarning(scope.row), 'view')">详情</el-button>
              <el-button type="warning" size="small" link @click="viewDetail(getLatestWarning(scope.row), 'resolve')">核实</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="filteredGroupedWarnings.length === 0" class="empty-state" style="padding:40px 0">
          <el-empty description="暂无符合条件的核查" :image-size="80" />
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage" v-model:page-size="pageSize"
          :total="filteredGroupedWarnings.length"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>

    <!-- ============ 弹窗 ============ -->

    <!-- 预警详情弹窗 -->
    <el-dialog :title="(detailMode === 'view' ? '居民详情' : '居民预警核实') + (currentResident ? ' · ' + currentResident.name : '')" v-model="showDetailDialog" width="780px">
      <div v-if="currentResident" class="detail-content">
        <!-- 比对信息表格（仅详情模式显示） -->
        <div v-if="detailMode === 'view'" class="detail-section">
          <h4 class="detail-section-title">比对信息 <span class="detail-section-desc">多源数据全量核查结果</span></h4>
          <el-table :data="comparisonTableData" stripe size="small" style="width: 100%" :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 600 }">
            <el-table-column prop="name" label="核查项" width="110">
              <template #default="scope">
                <span style="font-weight: 500;">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="数据内容" min-width="280">
              <template #default="scope">
                <span :class="{ 'text-danger': scope.row.status === 'abnormal', 'text-bold': scope.row.status === 'abnormal' }">{{ scope.row.value }}</span>
                <span v-if="scope.row.extra" :class="scope.row.status === 'abnormal' ? 'text-danger' : 'text-muted'">{{ scope.row.extra }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="匹配结果" width="100" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.status === 'normal'" type="success" size="small" effect="light">符合</el-tag>
                <el-tag v-else-if="scope.row.status === 'abnormal'" type="danger" size="small" effect="light">异常</el-tag>
                <el-tag v-else type="info" size="small" effect="light">待核实</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 标签及预警列表（仅核实模式显示） -->
        <div v-if="detailMode === 'resolve'" class="detail-section">
          <h4 class="detail-section-title">预警列表 <span class="detail-section-desc">共 {{ residentWarnings.length }} 条预警</span></h4>
          <div class="tags-with-warnings">
            <div v-for="tag in warningResidentTags" :key="tag.id" class="tag-warnings-block"
                 :class="{ 'has-pending': getTagWarnings(tag).some(w => w.status === '待处理') }">
              <!-- 标签头部 -->
              <div class="tag-header">
                <div class="tag-info">
                  <el-tag :type="getTagType(tag.tagType)" size="default" effect="light">{{ tag.tagType }}</el-tag>
                  <span class="tag-sub">{{ tag.tagSubType }}</span>
                  <el-tag :type="tag.isEnjoy ? 'success' : 'info'" size="small" effect="plain">
                    {{ tag.isEnjoy ? '享受中' : '已停发' }}
                  </el-tag>
                </div>
                <div class="tag-stats">
                  <el-button
                    v-if="getTagWarnings(tag).length > 0 && getTagWarnings(tag).some(w => w.status === '待处理')"
                    type="primary"
                    size="small"
                    @click="openResolveForTag(tag)">
                    <el-icon><Edit /></el-icon>核实
                  </el-button>
                  <span v-if="getTagWarnings(tag).length > 0" class="warn-count">
                    <el-icon><WarningFilled /></el-icon>
                    {{ getTagWarnings(tag).length }} 条预警
                  </span>
                  <span v-if="getTagWarnings(tag).filter(w => w.status === '待处理').length > 0" class="pending-count">
                    {{ getTagWarnings(tag).filter(w => w.status === '待处理').length }} 条待处理
                  </span>
                </div>
              </div>

              <!-- 标签信息 -->
              <div class="tag-meta">
                <span v-if="tag.subsidyAmount"><strong>补贴：</strong>{{ tag.subsidyAmount }}元/月</span>
                <span><strong>有效期：</strong>{{ tag.expireDate || '目前在保' }}</span>
                <span v-if="tag.effectiveDate"><strong>生效日期：</strong>{{ tag.effectiveDate }}</span>
              </div>

              <!-- 该标签下的预警列表 -->
              <div v-if="getTagWarnings(tag).length > 0" class="tag-warning-list">
                <div v-for="(w, wIdx) in getTagWarnings(tag)" :key="w.id" class="tag-warning-item"
                     :class="{ 'is-pending': w.status === '待处理' }">
                  <div class="tw-left">
                    <div class="tw-status-dot" :class="getStatusDotClass(w.status)"></div>
                    <div class="tw-content">
                      <div class="tw-header">
                        <el-tag :type="getWarningTagType(w.warningType)" size="small" effect="dark">{{ w.warningType }}</el-tag>
                        <span class="tw-time">{{ w.createTime }}</span>
                        <el-tag v-if="w.status === '审批中'" type="warning" size="small" effect="plain">审批中</el-tag>
                        <el-tag v-else-if="w.status === '已处理'" type="success" size="small" effect="plain">已处理</el-tag>
                      </div>
                      <div class="tw-body">{{ w.content }}</div>
                      <div class="tw-source">
                        <el-icon><Connection /></el-icon>
                        <span>比对来源：{{ w.ruleSource }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-warning-tip">
                <el-icon><CircleCheck /></el-icon>
                <span>该标签暂无预警信息</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无标签提示 -->
        <div v-if="detailMode === 'resolve' && warningResidentTags.length === 0" class="empty-tags">
          <el-empty description="该居民暂无保障标签信息" :image-size="80" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 核实标签状态弹窗 -->
    <el-dialog :title="resolveTitle" v-model="showResolveDialog" width="540px">
      <div v-if="tagPendingCount > 1" style="margin-bottom: 12px; padding: 8px 12px; background: #fff7ed; border-radius: 6px; font-size: 13px; color: #b45309; display: flex; align-items: center; gap: 6px;">
        <el-icon><InfoFilled /></el-icon>
        <span>本次核实将同步处理该标签下 <strong style="color: #dc2626;">{{ tagPendingCount }}</strong> 条待处理预警</span>
      </div>
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="核实结果" required>
          <el-radio-group v-model="resolveForm.result">
            <el-radio label="继续享受">继续享受</el-radio>
            <el-radio label="停发取消">停发取消</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="核实说明" required>
          <el-input v-model="resolveForm.remark" type="textarea" :rows="3" placeholder="请填写核实说明..." />
        </el-form-item>
        <el-form-item label="佐证材料" required v-if="resolveForm.result">
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
        <el-form-item label="审批人" required>
          <el-select v-model="resolveForm.approver" placeholder="请选择审批人" style="width: 100%">
            <el-option v-for="a in approvers" :key="a.value" :label="a.label" :value="a.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="resolveForm.approveRemark" type="textarea" :rows="2" placeholder="请填写审批意见（选填）" />
        </el-form-item>
        <el-form-item>
          <div class="approve-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>核实结果需走审批流程，以街道/社区线下实地核查结果为最终判定依据</span>
          </div>
        </el-form-item>
        <el-form-item v-if="resolveForm.result === '停发取消' && isDeathWarning">
          <div class="confirm-tip">
            <el-icon><Warning /></el-icon>
            <span>涉及生存状态异常，审批通过后该人员全部保障待遇将自动改为"不享受"，并移入历史居民库</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResolveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 新增预警弹窗 -->
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
import { ElMessage } from 'element-plus'
import {
  Search, Refresh, Plus, Warning, Bell, CircleCheck, CircleClose, Clock, Money, User, Location, InfoFilled, DocumentChecked, Grid, List, Connection, View, Edit, WarningFilled
} from '@element-plus/icons-vue'
import { warnings as mockWarnings, warningTypes, residents, tags as mockTags } from '../../data/mock'

const warnings = ref([...mockWarnings])
const currentPage = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const filterStatus = ref('')
const filterCount = ref('')
const filterCategoryType = ref('')
const viewMode = ref('list')
const showDetailDialog = ref(false)
const showResolveDialog = ref(false)
const showAddWarningDialog = ref(false)
const selectedWarning = ref(null)
// 核实弹窗相关：按标签整体核实
const currentResolvingTag = ref(null)
const tagPendingCount = ref(0)
const resolveTitle = ref('核实标签状态')
// 详情弹窗模式：view=只读查看，resolve=核实模式（含预警列表）
const detailMode = ref('view')

const timeRangeType = ref('month')
const customDateRange = ref([])
const dateFilterRange = ref(null)

const totalCount = computed(() => warnings.value.length)
const pendingCount = computed(() => warnings.value.filter(w => w.status === '待处理').length)
const resolvedCount = computed(() => warnings.value.filter(w => w.status === '已处理').length)
const todayCount = computed(() => warnings.value.filter(w => w.createTime.startsWith('2024-06-20')).length)

const mismatchWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType === '状态不一致' || w.warningType === '政策符合通知').length
})

const expireWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType === '政策到期提醒' || w.warningType === '到龄提醒').length
})

const mutexWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType === '政策互斥').length
})

const statusWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType === '状态异常').length
})

// 当前居民信息
const currentResident = computed(() => {
  if (!selectedWarning.value) return null
  return residents.find(r => r.id === selectedWarning.value.residentId)
})

// 当前选中预警对应的居民标签
const warningResidentTags = computed(() => {
  if (!selectedWarning.value) return []
  return mockTags.filter(t => t.residentId === selectedWarning.value.residentId)
})

// 当前居民的所有预警
const residentWarnings = computed(() => {
  if (!selectedWarning.value) return []
  return warnings.value.filter(w => w.residentId === selectedWarning.value.residentId)
})

// 比对信息表格数据（用于详情弹窗展示，与列表视图比对结果保持一致）
const comparisonTableData = computed(() => {
  const r = currentResident.value
  if (!r) return []
  const ci = r.comparisonInfo || {}
  const tags = mockTags.filter(t => t.residentId === r.id && t.isEnjoy)
  const residentWarnings = warnings.value.filter(w => w.residentId === r.id)
  const hasLowIncome = tags.some(t => t.tagType === '低保' || t.tagType === '特困')
  const hasDisability = tags.some(t => t.tagType === '残疾')
  const lowIncomeTag = tags.find(t => t.tagType === '低保' || t.tagType === '特困')

  const items = []

  items.push({
    name: '户籍状态',
    value: lowIncomeTag?.householdRegister || ci.householdRegister || r.community || '武昌区',
    status: ci.householdAbnormal ? 'abnormal' : 'normal',
    extra: ci.householdAbnormal ? '户籍已迁出' : ''
  })

  const hasSurvivalWarning = residentWarnings.some(w => w.ruleSource === '生存状态校验')
  items.push({
    name: '生存状态',
    value: hasSurvivalWarning ? '外部系统标记已去世' : (r.survivalStatus || '在世'),
    status: hasSurvivalWarning ? 'abnormal' : 'normal',
    extra: hasSurvivalWarning ? '与公安部门比对异常' : ''
  })

  items.push({
    name: '婚姻状态',
    value: r.maritalStatus || '—',
    status: 'normal',
    extra: ''
  })

  items.push({
    name: '学历',
    value: r.education || ci.education || '—',
    status: ci.educationAbnormal ? 'abnormal' : 'normal',
    extra: ci.educationSource || ''
  })

  items.push({
    name: '社保信息',
    value: ci.socialSecurity || '正常缴费',
    status: ci.socialSecurityAbnormal ? 'abnormal' : 'normal',
    extra: ci.socialSecurityBase ? `缴费基数 ${ci.socialSecurityBase} 元` : ''
  })

  items.push({
    name: '人均收入',
    value: ci.perCapitaIncome ? `${ci.perCapitaIncome}元/月` : '无收入',
    status: 'normal',
    extra: ''
  })

  items.push({
    name: '房产情况',
    value: ci.houseArea ? `房产面积 ${ci.houseArea}㎡ ${ci.houseStatus || ''}` : '无自购房产',
    status: ci.houseCheck === '否' ? 'abnormal' : 'normal',
    extra: ci.houseCheck === '否' ? '名下有额外房产' : ''
  })

  items.push({
    name: '车辆登记',
    value: ci.carPlate || (ci.carInfo || '无'),
    status: ci.carCheck === '否' ? 'abnormal' : 'normal',
    extra: ci.carModel ? ci.carModel : ''
  })

  items.push({
    name: '存款金额',
    value: ci.depositAmount ? `${ci.depositAmount}元` : '无存款',
    status: 'normal',
    extra: ''
  })

  items.push({
    name: '工商注册',
    value: ci.companyStatus || '名下无工商登记',
    status: ci.companyCheck === '否' ? 'abnormal' : 'normal',
    extra: ''
  })

  items.push({
    name: '服刑状态',
    value: ci.imprisoned === '否' ? '无服刑记录' : '在服刑',
    status: ci.imprisoned !== '否' ? 'abnormal' : 'normal',
    extra: ci.imprisoned !== '否' ? '服刑期间应停发保障待遇' : ''
  })

  // 政策互斥比对
  const hasMutexWarning = residentWarnings.some(w => w.warningType === '政策互斥')
  if (hasMutexWarning || (hasLowIncome && hasDisability)) {
    items.push({
      name: '政策互斥',
      value: hasMutexWarning ? '存在互斥待遇' : '政策享受正常',
      status: hasMutexWarning ? 'abnormal' : 'normal',
      extra: hasMutexWarning ? '同时享受多类同性质保障待遇' : ''
    })
  }

  // 政策不符比对
  const hasMismatchWarning = residentWarnings.some(w => w.warningType === '状态不一致' || w.warningType === '政策符合通知')
  if (hasMismatchWarning) {
    const mismatchWarning = residentWarnings.find(w => w.warningType === '状态不一致' || w.warningType === '政策符合通知')
    items.push({
      name: '政策不符',
      value: mismatchWarning?.content?.includes('符合') ? '政策符合' : '信息不一致',
      status: 'abnormal',
      extra: mismatchWarning?.content || ''
    })
  }

  // 到期取消比对
  const hasExpireWarning = residentWarnings.some(w => w.warningType === '政策到期提醒' || w.warningType === '到龄提醒')
  if (hasExpireWarning) {
    items.push({
      name: '到期取消',
      value: '存在到期/到龄提醒',
      status: 'abnormal',
      extra: '相关政策或待遇即将到期，需核实处理'
    })
  }

  // 状态变化比对
  const hasStatusWarning = residentWarnings.some(w => w.warningType === '状态异常')
  if (hasStatusWarning) {
    const statusWarning = residentWarnings.find(w => w.warningType === '状态异常')
    items.push({
      name: '状态变化',
      value: '状态异常',
      status: 'abnormal',
      extra: statusWarning?.content || ''
    })
  }

  return items
})

// 获取标签关联的所有预警（不限状态）——用于展示和按标签批量核实
const getTagWarnings = (tag) => {
  if (!selectedWarning.value) return []
  const tagName = tag.tagType + tag.tagSubType
  return residentWarnings.value.filter(w => {
    const wContent = w.warningType + w.content + w.ruleSource
    return wContent.includes(tag.tagType) || wContent.includes(tag.tagSubType) ||
           (tag.tagType === '低保' && w.warningType === '状态不一致') ||
           (tag.tagType === '低保' && w.warningType === '政策互斥') ||
           (tag.tagType === '残疾' && w.warningType === '政策互斥') ||
           (tag.tagType === '特困' && w.warningType === '政策互斥')
  })
}

// 核实按钮渲染控制：同标签下仅第一条待处理显示「核实处理」，其余预警隐藏核实按钮
const isFirstPendingWarning = (tag, w, idx) => {
  if (w.status !== '待处理') return false
  const list = getTagWarnings(tag)
  return list.findIndex(x => x.id === w.id) === 0
}

// 标签头部「核实」按钮：按标签整体打开核实弹窗，一次核实该标签下所有待处理预警
const openResolveForTag = (tag) => {
  const pendingList = getTagWarnings(tag).filter(w => w.status === '待处理')
  if (pendingList.length === 0) {
    ElMessage.info('该标签暂无可处理的预警')
    return
  }
  // 打开核实弹窗，以标签维度核实；表单默认载入首条预警信息，提交时同时处理标签下所有待处理
  currentResolvingTag.value = tag
  resolveForm.tagType = tag.tagType
  resolveForm.tagSubType = tag.tagSubType
  resolveForm.warningId = pendingList[0].id
  resolveForm.warningType = pendingList[0].warningType
  resolveForm.result = '继续享受'
  resolveForm.remark = ''
  resolveForm.operator = 'admin'
  resolveTitle.value = `核实 ${tag.tagType} · ${tag.tagSubType} 状态`
  tagPendingCount.value = pendingList.length
  showResolveDialog.value = true
}

// 处理标签关联的预警
const resolveTagWarning = (tag) => {
  const tagWarnings = getTagWarnings(tag)
  if (tagWarnings.length > 0) {
    openResolve(tagWarnings[0])
  } else {
    // 如果没有直接关联的预警，处理该居民的第一条待处理预警
    const pending = residentWarnings.value.filter(w => w.status === '待处理')
    if (pending.length > 0) {
      openResolve(pending[0])
    } else {
      ElMessage.info('该标签没有待处理的预警')
    }
  }
}

const onTimeRangeChange = () => {
  const now = new Date()
  if (timeRangeType.value === 'month') {
    dateFilterRange.value = [new Date(now.getFullYear(), now.getMonth(), 1), now]
  } else if (timeRangeType.value === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    dateFilterRange.value = [new Date(now.getFullYear(), q * 3, 1), now]
  } else if (timeRangeType.value === 'year') {
    dateFilterRange.value = [new Date(now.getFullYear(), 0, 1), now]
  } else {
    dateFilterRange.value = null
  }
}

// 按居民聚合预警
const groupedWarnings = computed(() => {
  const map = new Map()
  warnings.value.forEach(w => {
    if (!map.has(w.residentId)) {
      map.set(w.residentId, {
        residentId: w.residentId,
        residentName: w.residentName,
        idCard: w.idCard || '',
        warnings: [],
        warningCount: 0,
        residentTags: [],
        checkItems: []
      })
    }
    const group = map.get(w.residentId)
    group.warnings.push(w)
    group.warningCount++
  })
  // 填充居民标签和比对项
  map.forEach((group, residentId) => {
    group.residentTags = mockTags.filter(t => t.residentId === residentId && t.isEnjoy)
    group.checkItems = buildCheckItems(group)
  })
  const arr = Array.from(map.values())
  // 按预警数量降序、最新预警时间降序
  arr.sort((a, b) => {
    if (b.warningCount !== a.warningCount) return b.warningCount - a.warningCount
    const aTime = new Date(getLatestWarning(a).createTime)
    const bTime = new Date(getLatestWarning(b).createTime)
    return bTime - aTime
  })
  return arr
})

// 构建比对项列表
const buildCheckItems = (group) => {
  const tags = group.residentTags
  const hasLowIncome = tags.some(t => t.tagType === '低保' || t.tagType === '特困')
  const hasDisability = tags.some(t => t.tagType === '残疾')
  const hasElderly = tags.some(t => t.tagType === '老年')
  const hasPublicRental = tags.some(t => t.tagType === '公租房')
  const hasSocial = tags.some(t => t.tagType === '社保')

  // 从低保标签中提取比对数据
  const lowIncomeTag = tags.find(t => t.tagType === '低保' || t.tagType === '特困')
  const items = []

  // 户籍比对
  items.push({
    name: '户籍状态',
    value: lowIncomeTag?.householdRegister || '武昌区',
    status: 'normal',
    remark: ''
  })

  // 生存状态比对
  const hasSurvivalWarning = group.warnings.some(w => w.ruleSource === '生存状态校验')
  items.push({
    name: '生存状态',
    value: hasSurvivalWarning ? '外部系统标记已去世' : '在世',
    status: hasSurvivalWarning ? 'abnormal' : 'normal',
    remark: hasSurvivalWarning ? '与系统在册状态不一致' : ''
  })

  // 收入比对
  if (hasLowIncome || hasPublicRental) {
    const perCapitaIncome = lowIncomeTag?.perCapitaIncome || 0
    const incomeAbnormal = perCapitaIncome > 500
    items.push({
      name: '人均收入',
      value: perCapitaIncome + '元/月',
      status: incomeAbnormal ? 'abnormal' : 'normal',
      remark: incomeAbnormal ? '超出低保标准500元/月' : ''
    })
  }

  // 房产比对
  if (hasLowIncome) {
    const houseArea = lowIncomeTag?.houseArea || 0
    const houseCheck = lowIncomeTag?.houseCheck
    const houseAbnormal = houseCheck === '否' || houseArea > 50
    items.push({
      name: '房产情况',
      value: houseArea > 0 ? houseArea + '㎡' : '无自购房产',
      status: houseAbnormal ? 'abnormal' : 'normal',
      remark: houseAbnormal ? '房产面积超出保障标准' : ''
    })
  }

  // 车辆比对
  if (hasLowIncome) {
    const carPlate = lowIncomeTag?.carPlate || '无'
    const carCheck = lowIncomeTag?.carCheck
    const carAbnormal = carCheck === '否' || (carPlate && carPlate !== '无')
    items.push({
      name: '车辆登记',
      value: carPlate,
      status: carAbnormal ? 'abnormal' : 'normal',
      remark: carAbnormal ? '名下登记有车辆' : ''
    })
  }

  // 存款比对
  if (hasLowIncome) {
    const deposit = lowIncomeTag?.depositAmount || 0
    const depositCheck = lowIncomeTag?.depositCheck
    const depositAbnormal = depositCheck === '否' || deposit > 30000
    items.push({
      name: '存款金额',
      value: deposit + '元',
      status: depositAbnormal ? 'abnormal' : 'normal',
      remark: depositAbnormal ? '存款超出保障标准' : ''
    })
  }

  // 工商注册比对
  if (hasLowIncome) {
    const companyCheck = lowIncomeTag?.companyCheck
    items.push({
      name: '工商注册',
      value: companyCheck === '是' ? '无注册企业' : '名下有企业',
      status: companyCheck === '否' ? 'abnormal' : 'normal',
      remark: companyCheck === '否' ? '存在经营性收入' : ''
    })
  }

  // 服刑状态比对
  if (hasLowIncome) {
    const imprisoned = lowIncomeTag?.imprisoned
    items.push({
      name: '服刑状态',
      value: imprisoned === '否' ? '无服刑记录' : '在服刑',
      status: imprisoned !== '否' ? 'abnormal' : 'normal',
      remark: imprisoned !== '否' ? '服刑期间应停发保障待遇' : ''
    })
  }

  // 政策互斥比对
  const hasMutexWarning = group.warnings.some(w => w.warningType === '政策互斥')
  if (hasMutexWarning || (hasLowIncome && hasDisability)) {
    items.push({
      name: '政策互斥',
      value: hasMutexWarning ? '存在互斥待遇' : '政策享受正常',
      status: hasMutexWarning ? 'abnormal' : 'normal',
      remark: hasMutexWarning ? '同时享受多类同性质保障待遇' : ''
    })
  }

  // 政策不符比对
  const hasMismatchWarning = group.warnings.some(w => w.warningType === '状态不一致' || w.warningType === '政策符合通知')
  if (hasMismatchWarning) {
    const mismatchWarning = group.warnings.find(w => w.warningType === '状态不一致' || w.warningType === '政策符合通知')
    items.push({
      name: '政策不符',
      value: mismatchWarning?.content?.includes('符合') ? '政策符合' : '信息不一致',
      status: 'abnormal',
      remark: mismatchWarning?.content || ''
    })
  }

  // 到期取消比对
  const hasExpireWarning = group.warnings.some(w => w.warningType === '政策到期提醒' || w.warningType === '到龄提醒')
  if (hasExpireWarning) {
    items.push({
      name: '到期取消',
      value: '存在到期/到龄提醒',
      status: 'abnormal',
      remark: '相关政策或待遇即将到期，需核实处理'
    })
  }

  return items
}

const filteredGroupedWarnings = computed(() => {
  let result = groupedWarnings.value
  if (filterCategoryType.value) {
    const categoryMap = {
      '政策不符': ['状态不一致', '政策符合通知'],
      '到期取消': ['政策到期提醒', '到龄提醒'],
      '政策互斥': ['政策互斥']
    }
    const types = categoryMap[filterCategoryType.value] || []
    result = result.filter(g => g.warnings.some(w => types.includes(w.warningType)))
  }
  if (filterStatus.value) {
    result = result.filter(g => g.warnings.some(w => w.status === filterStatus.value))
  }
  if (filterCount.value) {
    if (filterCount.value === '3+') {
      result = result.filter(g => g.warningCount >= 3)
    } else {
      result = result.filter(g => g.warningCount === parseInt(filterCount.value))
    }
  }
  return result
})

const pagedGroupedWarnings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredGroupedWarnings.value.slice(start, end)
})

// 核查类型（大类）
const warningCategoryTypes = ['政策不符', '到期取消', '政策互斥', '状态变化']

// 获取核查大类
const getWarningCategory = (group) => {
  const types = group.warnings.map(w => w.warningType)
  const policyMatch = ['状态不一致', '政策符合通知']
  const expireMatch = ['政策到期提醒', '到龄提醒']
  const mutexMatch = ['政策互斥']
  const statusMatch = ['状态异常']
  const arr = []
  if (types.some(t => policyMatch.includes(t))) arr.push('政策不符')
  if (types.some(t => expireMatch.includes(t))) arr.push('到期取消')
  if (types.some(t => mutexMatch.includes(t))) arr.push('政策互斥')
  if (types.some(t => statusMatch.includes(t))) arr.push('状态变化')
  return arr
}

// ============ 辅助函数 ============

// 核查标签颜色分级：政策不符(紫) / 到期取消(橙) / 政策互斥(蓝) / 状态变化(青) / 纯异常(绿=正常,红=数据项异常)
const getCheckTagClass = (item) => {
  const cls = ['check-tag']
  if (item.status !== 'abnormal') {
    cls.push('is-normal')
    return cls
  }
  // 核查大类（来自预警分类）各用不同色，非纯红，与异常数量统计红做区分
  if (item.name === '政策不符') cls.push('is-purple')
  else if (item.name === '到期取消') cls.push('is-orange')
  else if (item.name === '政策互斥') cls.push('is-blue')
  else if (item.name === '状态变化') cls.push('is-cyan')
  else cls.push('is-abnormal') // 数据指标异常用纯红，配合异常统计红但仍通过文字区分
  return cls
}
const getCheckDotClass = (item) => {
  if (item.status !== 'abnormal') return 'check-dot dot-green'
  if (item.name === '政策不符') return 'check-dot dot-purple'
  if (item.name === '到期取消') return 'check-dot dot-orange'
  if (item.name === '政策互斥') return 'check-dot dot-blue'
  if (item.name === '状态变化') return 'check-dot dot-cyan'
  return 'check-dot dot-red'
}

const formatIdCard = (idCard) => {
  if (!idCard) return '--'
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

const getResidentCommunity = (residentId) => {
  const r = residents.find(x => x.id === residentId)
  return r ? `${r.community} · ${r.grid}` : '六角社区'
}

const getResidentGender = (residentId) => {
  const r = residents.find(x => x.id === residentId)
  return r ? r.gender : '-'
}

const getResidentAge = (residentId) => {
  const r = residents.find(x => x.id === residentId)
  return r ? r.age : '-'
}

const getResidentGrid = (residentId) => {
  const r = residents.find(x => x.id === residentId)
  return r ? r.grid : '-'
}

const getLatestWarning = (group) => {
  return group.warnings.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0]
}

const getUniqueWarningTypes = (group) => {
  return [...new Set(group.warnings.map(w => w.warningType))]
}

const countTypeInGroup = (group, type) => {
  return group.warnings.filter(w => w.warningType === type).length
}

const getCountLevel = (count) => {
  if (count >= 3) return 'level-high'
  if (count === 2) return 'level-mid'
  return 'level-low'
}

const getWarningTagType = (type) => {
  if (type.includes('死亡') || type.includes('状态不一致') || type.includes('互斥')) return 'danger'
  if (type.includes('到期') || type.includes('户籍')) return 'warning'
  if (type.includes('符合') || type.includes('到龄')) return 'success'
  return 'info'
}

const getStatusDotClass = (status) => {
  if (status === '待处理') return 'dot-pending'
  if (status === '审批中') return 'dot-approving'
  return 'dot-resolved'
}

const getStatusType = (status) => {
  if (status === '待处理') return 'warning'
  if (status === '审批中') return ''
  if (status === '已处理') return 'success'
  return 'info'
}

const getTagType = (type) => {
  const map = { '低保': '', '残疾': 'danger', '公租房': 'warning', '老年': 'success', '计生': 'info' }
  return map[type] || ''
}

const getSourceDesc = (source) => {
  const map = { 'internal': '内部系统比对', 'external': '外部系统推送', 'manual': '人工录入' }
  return map[source] || source
}

// ============ 操作函数 ============

const onViewModeChange = () => {
  ElMessage.success(`已切换为${viewMode.value === 'card' ? '卡片视图' : '列表视图'}`)
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterType.value = ''
  filterStatus.value = ''
  filterCount.value = ''
  filterCategoryType.value = ''
  currentPage.value = 1
}

const viewDetail = (w, mode = 'view') => {
  selectedWarning.value = w
  detailMode.value = mode
  showDetailDialog.value = true
}

// 处理单条预警（兼容旧入口；优先走标签整体核实流程）
const openResolve = (w) => {
  selectedWarning.value = w
  // 尝试找到该预警对应的居民标签，优先按标签整体打开
  const tags = mockTags.filter(t => t.residentId === w.residentId)
  let matchedTag = null
  for (const tag of tags) {
    const warnings = getTagWarnings(tag)
    if (warnings.some(x => x.id === w.id)) {
      matchedTag = tag
      break
    }
  }
  if (matchedTag) {
    openResolveForTag(matchedTag)
    return
  }
  // 兜底：无标签匹配时，按单条弹窗
  currentResolvingTag.value = null
  tagPendingCount.value = 1
  resolveTitle.value = `核实单条预警（${w.warningType}）`
  resolveForm.result = ''
  resolveForm.remark = ''
  resolveForm.approver = ''
  resolveForm.approveRemark = ''
  resolveForm.imageUrls = []
  resolveForm.tagType = ''
  resolveForm.tagSubType = ''
  resolveForm.warningId = w.id
  resolveForm.warningType = w.warningType
  resolveForm.operator = 'admin'
  fileList.value = []
  showResolveDialog.value = true
}

// 批量处理一组预警
const batchResolveGroup = (group) => {
  const pending = group.warnings.filter(w => w.status === '待处理')
  if (pending.length === 0) {
    ElMessage.warning('该居民没有待处理的预警')
    return
  }
  openResolve(pending[0])
}

// 从列表视图核实（直接打开详情弹窗）
const openResolveForGroup = (group) => {
  const pending = group.warnings.filter(w => w.status === '待处理')
  if (pending.length === 0) {
    ElMessage.warning('该居民没有待核查的预警')
    return
  }
  openResolve(pending[0])
}

// ============ 弹窗数据 ============
const resolveForm = reactive({
  result: '',
  remark: '',
  imageUrl: '',
  approver: '',
  approveRemark: '',
  imageUrls: [],
  tagType: '',
  tagSubType: '',
  warningId: '',
  warningType: '',
  operator: ''
})
const fileList = ref([])
const approvers = [
  { label: '街道民政办主任', value: 'director' },
  { label: '社区书记', value: 'secretary' },
  { label: '民政专干', value: 'specialist' }
]

// 当前核实标签是否涉及生存/死亡相关
const isDeathWarning = computed(() => {
  if (!currentResolvingTag.value) return false
  const pending = getTagWarnings(currentResolvingTag.value).filter(w => w.status === '待处理')
  return pending.some(w => w.warningType.includes('死亡') || w.warningType.includes('状态不一致') || w.ruleSource === '生存状态校验')
})

const handleUploadSuccess = (response, file) => {
  resolveForm.imageUrls.push(URL.createObjectURL(file.raw))
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG格式的图片')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

const handleRemove = () => {
  resolveForm.imageUrls = []
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传3张图片')
}

const confirmResolve = () => {
  if (!resolveForm.result) {
    ElMessage.warning('请选择核实结果')
    return
  }
  if (!resolveForm.remark || resolveForm.remark.trim() === '') {
    ElMessage.warning('请填写核实说明')
    return
  }
  if (resolveForm.imageUrls.length === 0) {
    ElMessage.warning('请上传佐证材料')
    return
  }
  if (!resolveForm.approver) {
    ElMessage.warning('请选择审批人')
    return
  }

  // 按标签整体处理：获取当前标签下所有待处理预警，一次性全部更新
  const tag = currentResolvingTag.value
  const pendingList = tag ? getTagWarnings(tag).filter(w => w.status === '待处理') : []

  if (pendingList.length === 0 && selectedWarning.value) {
    // 兜底：如果不是从标签入口进来的，则处理当前单条
    pendingList.push(selectedWarning.value)
  }

  const nowTime = new Date().toLocaleString('zh-CN')
  // 所有核实结果都进入审批中状态
  const finalStatus = '审批中'
  pendingList.forEach(w => {
    w.operator = resolveForm.operator || 'admin'
    w.resolveTime = nowTime
    w.imageUrls = [...resolveForm.imageUrls]
    w.result = resolveForm.result
    w.remark = resolveForm.remark
    w.status = finalStatus
    w.approver = resolveForm.approver
    w.approveRemark = resolveForm.approveRemark
  })

  // 如果是停发取消且涉及生存状态校验，同步更新标签享受状态（模拟）
  if (resolveForm.result === '停发取消' && tag && isDeathWarning.value) {
    tag.isEnjoy = false
  }

  ElMessage.success(`已提交审批，共 ${pendingList.length} 条预警进入审批流程`)
  showResolveDialog.value = false
}

const addForm = reactive({
  residentName: '',
  warningType: '',
  content: '',
  level: '普通'
})

const confirmAdd = () => {
  if (!addForm.residentName) {
    ElMessage.warning('请填写居民姓名')
    return
  }
  if (!addForm.warningType) {
    ElMessage.warning('请选择预警类型')
    return
  }
  ElMessage.success('新增预警成功')
  showAddWarningDialog.value = false
}
</script>

<style scoped>
.warning-list-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 12px; align-items: center; }

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
.filter-header { margin-bottom: 20px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.card-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.card-desc { font-size: 12px; color: #9ca3af; }

.time-filter-bar { display: flex; align-items: center; gap: 10px; }

.warning-category-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.warning-category-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 10px; color: #fff; }
.property-card { background: linear-gradient(135deg, #f56c6c, #e53e3e); }
.survival-card { background: linear-gradient(135deg, #e6a23c, #d97706); }
.household-card { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.status-card   { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.wc-icon { width: 52px; height: 52px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; }
.wc-info { display: flex; flex-direction: column; gap: 4px; }
.wc-count { font-size: 28px; font-weight: 700; line-height: 1.2; }
.wc-label { font-size: 14px; opacity: 0.9; }

.filter-bar { display: flex; gap: 10px; align-items: center; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }

/* ============ 卡片视图样式 ============ */
.warning-cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.empty-state { grid-column: 1 / -1; padding: 40px 0; }

.resident-warning-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.resident-warning-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border-color: #d1d5db;
}
.resident-warning-card.multi-warning {
  border-left: 3px solid #f56c6c;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.resident-info .avatar {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}
.resident-info .sub-info {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #9ca3af;
}
.resident-info .sub-info .id-card { color: #6b7280; }

.warning-count-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  min-width: 64px;
}
.warning-count-wrap.level-low {
  background: #fef3c7;
}
.warning-count-wrap.level-mid {
  background: #fee2e2;
}
.warning-count-wrap.level-high {
  background: #fecaca;
}
.warning-count-wrap .count-num {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: #b91c1c;
}
.warning-count-wrap.level-low .count-num { color: #92400e; }
.warning-count-wrap .count-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

/* ============ 享受政策标签 ============ */
.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}
.section-label.small {
  font-size: 12px;
  margin-bottom: 8px;
  color: #6b7280;
}
.section-label .abnormal-count {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #dc2626;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 10px;
}

.enjoyed-tags-section {
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
}
.enjoyed-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.enjoyed-tag {
  font-size: 12px;
}
.no-tags-tip {
  font-size: 12px;
  color: #9ca3af;
}

/* ============ 通铺比对列表 ============ */
.check-list-section {
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
}
.check-list-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.check-item {
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
  transition: all 0.15s;
}
.check-item.is-abnormal {
  background: #fef2f2;
  border-color: #fecaca;
}
.check-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.check-item-name {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}
.check-item.is-abnormal .check-item-name {
  color: #b91c1c;
}
.abnormal-icon {
  color: #dc2626;
  font-size: 14px;
}
.normal-icon {
  color: #10b981;
  font-size: 14px;
}
.check-item-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.4;
}
.check-item.is-abnormal .check-item-value {
  color: #dc2626;
}
.check-item-remark {
  font-size: 11px;
  color: #dc2626;
  margin-top: 4px;
  line-height: 1.4;
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.15s;
}
.warning-item:hover {
  background: #f5f5f5;
}
.warning-item.is-resolved {
  opacity: 0.65;
}
.warning-item.is-approving {
  background: #fffbeb;
  border-color: #fde68a;
}

.wi-left {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.wi-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.wi-status-dot.dot-pending { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
.wi-status-dot.dot-approving { background: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.wi-status-dot.dot-resolved { background: #10b981; }

.wi-content { flex: 1; min-width: 0; }
.wi-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.wi-time {
  font-size: 11px;
  color: #9ca3af;
}
.wi-body {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 6px;
}
.wi-source {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
}
.wi-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}
.pending-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #b45309;
  background: #fffbeb;
  padding: 4px 10px;
  border-radius: 6px;
}

/* ============ 列表视图样式 ============ */
.warning-list-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.warning-list-row {
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.15s;
}
.warning-list-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-color: #d1d5db;
}
.warning-list-row.has-abnormal {
  border-left: 3px solid #f56c6c;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  flex-shrink: 0;
}
.row-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
.row-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.row-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}
.row-warning-count {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #f56c6c;
  padding: 1px 8px;
  border-radius: 10px;
}
.row-sub {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 6px;
}
.row-sub .sep {
  color: #d1d5db;
}

.row-middle {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.row-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.row-section-label {
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
  padding-top: 2px;
  min-width: 60px;
}
.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.row-tag {
  font-size: 11px;
}
.no-tags {
  font-size: 12px;
  color: #9ca3af;
}
.more-tags {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
}

.row-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}
.row-check-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
  padding: 2px 0;
  cursor: default;
}
.row-check-item.is-abnormal {
  color: #dc2626;
}
.check-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.check-dot.dot-green {
  background: #10b981;
}
.check-dot.dot-red {
  background: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
}
.check-name {
  white-space: nowrap;
}

.row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  min-width: 180px;
}
.row-warnings {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.row-warn-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
}
.row-warn-count .num {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}
.row-warn-count .lbl {
  font-size: 11px;
  color: #6b7280;
}
.row-warn-count.level-low {
  background: #fef3c7;
}
.row-warn-count.level-low .num {
  color: #92400e;
}
.row-warn-count.level-mid {
  background: #fee2e2;
}
.row-warn-count.level-mid .num {
  color: #b91c1c;
}
.row-warn-count.level-high {
  background: #fecaca;
}
.row-warn-count.level-high .num {
  color: #b91c1c;
}
.row-abnormal-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #dc2626;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 4px;
}
.row-actions {
  display: flex;
  gap: 8px;
}

.detail-content { padding: 8px 0; max-height: 70vh; overflow-y: auto; }

/* 详情章节 */
.detail-section { margin-bottom: 18px; }
.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 10px 0;
  padding-left: 8px;
  border-left: 3px solid #3b82f6;
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-section-desc {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

/* 基础信息网格 */
.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px 16px;
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}
.info-item-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  font-size: 13px;
}
.info-label-mini {
  color: #9ca3af;
  flex-shrink: 0;
  min-width: 64px;
}
.info-value-mini {
  color: #1f2937;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-danger { color: #ef4444; }
.text-bold { font-weight: 600; }
.text-muted { color: #9ca3af; margin-left: 4px; }

/* 居民信息卡片 */
.resident-info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid #e0e7ff;
}
.resident-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  flex-shrink: 0;
}
.resident-detail { flex: 1; min-width: 0; }
.resident-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.resident-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}
.resident-meta > span { display: flex; align-items: center; gap: 4px; }
.resident-meta .sep { color: #d1d5db; }

/* 标签及预警列表 */
.tags-with-warnings { display: flex; flex-direction: column; gap: 14px; }
.tag-warnings-block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.15s;
}
.tag-warnings-block.has-pending {
  border-color: #fecaca;
  background: #fffafa;
}
.tag-warnings-block.has-pending .tag-header {
  background: linear-gradient(90deg, #fef2f2 0%, #fff 100%);
}
.tag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}
.tag-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag-sub { font-size: 14px; font-weight: 600; color: #1f2937; }
.tag-stats { display: flex; align-items: center; gap: 12px; font-size: 12px; }
.warn-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc2626;
  font-weight: 500;
}
.pending-count {
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.tag-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 10px 16px;
  font-size: 12px;
  color: #6b7280;
  border-bottom: 1px dashed #f3f4f6;
}
.tag-meta strong { color: #4b5563; font-weight: 500; margin-right: 4px; }

/* 标签下的预警列表 */
.tag-warning-list { padding: 8px 16px 12px; display: flex; flex-direction: column; gap: 10px; }
.tag-warning-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}
.tag-warning-item.is-pending {
  background: #fff7ed;
  border-color: #fed7aa;
}
.tw-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0; }
.tw-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.tw-status-dot.status-pending { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
.tw-status-dot.status-resolved { background: #10b981; }
.tw-status-dot.status-approving { background: #8b5cf6; }
.tw-content { flex: 1; min-width: 0; }
.tw-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.tw-time { font-size: 12px; color: #9ca3af; }
.tw-body { font-size: 13px; color: #374151; line-height: 1.5; margin-bottom: 6px; }
.tw-source { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
.tw-actions { display: flex; gap: 8px; flex-shrink: 0; }

.no-warning-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  font-size: 12px;
  color: #10b981;
}

.empty-tags { text-align: center; padding: 20px; }

.approve-tip, .confirm-tip { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: 6px; font-size: 12px; line-height: 1.5; }
.approve-tip { background: #eff6ff; color: #1d4ed8; }
.approve-tip .el-icon { margin-top: 1px; color: #3b82f6; }
.confirm-tip { background: #fef2f2; color: #b91c1c; }
.confirm-tip .el-icon { margin-top: 1px; color: #ef4444; }

/* 列表视图表格样式 */
.warning-list-table .resident-name-cell { font-weight: 600; color: #303133; }
.warning-list-table .benefit-tags-cell { display: flex; flex-wrap: wrap; gap: 4px; }
.warning-list-table .benefit-tag { font-size: 11px; border-color: #dcdfe6; color: #606266; background: #f4f4f5; }
.warning-list-table .category-tags-cell { display: flex; flex-wrap: wrap; }
.warning-list-table .no-benefit { color: #909399; font-size: 12px; }
.warning-list-table .check-cell { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.warning-list-table .check-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #606266; background: #f5f7fa; }
.warning-list-table .check-tag.is-normal  { color: #606266; background: #f4f4f5; border: 1px solid #e9e9eb; padding: 1px 5px; }
.warning-list-table .check-tag.is-abnormal { color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; padding: 1px 5px; font-weight: 500; }
.warning-list-table .check-tag.is-purple   { color: #7c3aed; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 1px 5px; font-weight: 500; }
.warning-list-table .check-tag.is-orange   { color: #d97706; background: #fff7ed; border: 1px solid #fed7aa; padding: 1px 5px; font-weight: 500; }
.warning-list-table .check-tag.is-blue     { color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1px 5px; font-weight: 500; }
.warning-list-table .check-tag.is-cyan     { color: #0d9488; background: #f0fdfa; border: 1px solid #99f6e4; padding: 1px 5px; font-weight: 500; }
.warning-list-table .check-tag .check-dot { width: 6px; height: 6px; border-radius: 50%; }
.warning-list-table .check-tag .dot-red    { background: #ef4444; }
.warning-list-table .check-tag .dot-green  { background: #67c23a; }
.warning-list-table .check-tag .dot-purple { background: #8b5cf6; }
.warning-list-table .check-tag .dot-orange { background: #f59e0b; }
.warning-list-table .check-tag .dot-blue   { background: #3b82f6; }
.warning-list-table .check-tag .dot-cyan   { background: #14b8a6; }
.warning-list-table .abnormal-count { color: #ef4444; font-size: 12px; margin-left: 4px; font-weight: 500; }
.warning-list-table .abnormal-count-txt { color: #ef4444; font-size: 12px; margin-left: 2px; font-weight: 600; }
</style>
 

