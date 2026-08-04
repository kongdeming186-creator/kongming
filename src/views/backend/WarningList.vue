<template>
  <div class="warning-list-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">预警管理</h2>
        <p class="page-subtitle">共 {{ totalCount }} 条预警，待处理 {{ pendingCount }} 条 · 涉及 {{ filteredGroupedWarnings.length }} 位居民</p>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="default" @change="onViewModeChange">
          <el-radio-button label="card">
            <el-icon><Grid /></el-icon>
            <span style="margin-left:4px">卡片视图</span>
          </el-radio-button>
          <el-radio-button label="list">
            <el-icon><List /></el-icon>
            <span style="margin-left:4px">列表视图</span>
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="showAddWarningDialog = true">
          <el-icon><Plus /></el-icon>新增预警
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
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

    <!-- 预警分类统计 -->
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

    <!-- 筛选栏 + 预警列表 -->
    <div class="content-card">
      <div class="card-header filter-header">
      <div class="card-title">预警列表</div>
        <div class="filter-bar">
          <el-select v-model="filterCount" placeholder="预警数量" clearable style="width: 130px">
            <el-option label="1条预警" value="1" />
            <el-option label="2条预警" value="2" />
            <el-option label="3条及以上" value="3+" />
          </el-select>
          <el-select v-model="filterType" placeholder="预警类型" clearable style="width: 140px">
            <el-option v-for="t in warningTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 120px">
            <el-option label="待处理" value="待处理" />
            <el-option label="已处理" value="已处理" />
            <el-option label="审批中" value="审批中" />
          </el-select>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>

      <!-- ============ 卡片视图 ============ -->
      <div v-if="viewMode === 'card'" class="warning-cards-container">
        <div v-if="filteredGroupedWarnings.length === 0" class="empty-state">
          <el-empty description="暂无符合条件的预警" :image-size="80" />
        </div>
        <div
          v-for="(group, gIdx) in filteredGroupedWarnings" :key="group.residentId"
          class="resident-warning-card"
          :class="{ 'multi-warning': group.warningCount > 1 }">
          <!-- 卡片头部：居民信息 + 预警数量 -->
          <div class="card-head">
            <div class="resident-info">
              <div class="avatar">{{ group.residentName }}</div>
              <div class="sub-info">
                <span class="id-card">{{ formatIdCard(group.idCard) }}</span>
                <span class="community">{{ getResidentCommunity(group.residentId) }}</span>
              </div>
            </div>
            <div class="warning-count-wrap" :class="getCountLevel(group.warningCount)">
              <span class="count-num">{{ group.warningCount }}</span>
              <span class="count-label">条预警</span>
            </div>
          </div>

          <!-- 享受的政策标签 -->
          <div class="enjoyed-tags-section">
            <div class="section-label">
              <el-icon><DocumentChecked /></el-icon>
              <span>享受政策</span>
            </div>
            <div class="enjoyed-tags-list">
              <el-tag
                v-for="(tag, idx) in group.residentTags"
                :key="tag.id"
                :type="getTagType(tag.tagType)"
                size="default"
                effect="light"
                class="enjoyed-tag"
              >
                {{ tag.tagType }} · {{ tag.tagSubType }}
              </el-tag>
              <span v-if="group.residentTags.length === 0" class="no-tags-tip">暂无享受政策</span>
            </div>
          </div>

          <!-- 通铺比对列表 -->
          <div class="check-list-section">
            <div class="section-label">
              <el-icon><Connection /></el-icon>
              <span>比对结果</span>
              <span class="abnormal-count" v-if="group.checkItems.filter(c => c.status === 'abnormal').length > 0">
                {{ group.checkItems.filter(c => c.status === 'abnormal').length }}项异常
              </span>
            </div>
            <div class="check-list-grid">
              <div
                v-for="(item, idx) in group.checkItems"
                :key="idx"
                class="check-item"
                :class="{ 'is-abnormal': item.status === 'abnormal' }"
              >
                <div class="check-item-head">
                  <span class="check-item-name">{{ item.name }}</span>
                  <el-icon v-if="item.status === 'abnormal'" class="abnormal-icon"><WarningFilled /></el-icon>
                  <el-icon v-else class="normal-icon"><CircleCheck /></el-icon>
                </div>
                <div class="check-item-value">{{ item.value }}</div>
                <div v-if="item.remark" class="check-item-remark">{{ item.remark }}</div>
              </div>
            </div>
          </div>

          <!-- 预警明细 -->
          <div class="warning-details">
            <div class="section-label small">
              <el-icon><Bell /></el-icon>
              <span>预警明细</span>
            </div>
            <div
              v-for="(w, wIdx) in group.warnings"
              :key="w.id"
              class="warning-item"
              :class="{ 'is-resolved': w.status === '已处理', 'is-approving': w.status === '审批中' }">
              <div class="wi-left">
                <div class="wi-status-dot" :class="getStatusDotClass(w.status)"></div>
                <div class="wi-content">
                  <div class="wi-header">
                    <el-tag :type="getWarningTagType(w.warningType)" size="small" effect="dark">{{ w.warningType }}</el-tag>
                    <span class="wi-time">{{ w.createTime }}</span>
                    <el-tag v-if="w.status === '审批中'" type="warning" size="small" effect="plain">审批中</el-tag>
                    <el-tag v-else-if="w.status === '已处理'" type="success" size="small" effect="plain">已处理</el-tag>
                  </div>
                  <div class="wi-body">{{ w.content }}</div>
                  <div class="wi-source">
                    <el-icon><Connection /></el-icon>
                    <span>比对来源：{{ w.ruleSource }}</span>
                  </div>
                </div>
              </div>
              <div class="wi-actions">
                <el-button v-if="w.status === '待处理'" type="primary" size="small" @click="openResolve(w)">
                  <el-icon><Edit /></el-icon>处理
                </el-button>
                <el-button size="small" @click="viewDetail(w)">
                  <el-icon><View /></el-icon>详情
                </el-button>
              </div>
            </div>
          </div>

          <!-- 卡片底部操作栏 -->
          <div v-if="group.warnings.some(w => w.status === '待处理')" class="card-foot">
            <span class="pending-tip">
              <el-icon><InfoFilled /></el-icon>
              该居民还有 {{ group.warnings.filter(w => w.status === '待处理').length }} 条预警待处理
            </span>
            <el-button
              type="primary" size="small" @click="batchResolveGroup(group)">
              <el-icon><DocumentChecked /></el-icon>
              批量处理待处理预警
            </el-button>
          </div>
        </div>
      </div>

      <!-- ============ 列表视图 ============ -->
      <div v-else class="warning-list-rows">
        <div v-if="filteredGroupedWarnings.length === 0" class="empty-state">
          <el-empty description="暂无符合条件的预警" :image-size="80" />
        </div>
        <div
          v-for="(group, gIdx) in filteredGroupedWarnings"
          :key="group.residentId"
          class="warning-list-row"
          :class="{ 'has-abnormal': group.checkItems.some(c => c.status === 'abnormal') }"
        >
          <!-- 左侧：居民信息 -->
          <div class="row-left">
            <div class="row-avatar">{{ group.residentName.charAt(0) }}</div>
            <div class="row-info">
              <div class="row-name">
                {{ group.residentName }}
                <span v-if="group.warningCount > 1" class="row-warning-count">{{ group.warningCount }}条预警</span>
              </div>
              <div class="row-sub">
                <span>{{ formatIdCard(group.idCard) }}</span>
                <span class="sep">·</span>
                <span>{{ getResidentCommunity(group.residentId) }}</span>
              </div>
            </div>
          </div>

          <!-- 中间：享受政策 + 比对结果 -->
          <div class="row-middle">
            <!-- 享受政策 -->
            <div class="row-section">
              <span class="row-section-label">享受政策：</span>
              <div class="row-tags">
                <el-tag
                  v-for="tag in group.residentTags.slice(0, 4)"
                  :key="tag.id"
                  :type="getTagType(tag.tagType)"
                  size="small"
                  effect="light"
                  class="row-tag"
                >
                  {{ tag.tagType }}·{{ tag.tagSubType }}
                </el-tag>
                <span v-if="group.residentTags.length === 0" class="no-tags">无</span>
                <span v-if="group.residentTags.length > 4" class="more-tags">+{{ group.residentTags.length - 4 }}</span>
              </div>
            </div>

            <!-- 比对结果 -->
            <div class="row-section">
              <span class="row-section-label">比对结果：</span>
              <div class="row-checks">
                <div
                  v-for="(item, idx) in group.checkItems"
                  :key="idx"
                  class="row-check-item"
                  :class="{ 'is-abnormal': item.status === 'abnormal' }"
                  :title="item.remark || item.name + ': ' + item.value"
                >
                  <span class="check-dot" :class="item.status === 'abnormal' ? 'dot-red' : 'dot-green'"></span>
                  <span class="check-name">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：预警数 + 操作 -->
          <div class="row-right">
            <div class="row-warnings">
              <div class="row-warn-count" :class="getCountLevel(group.warningCount)">
                <span class="num">{{ group.warningCount }}</span>
                <span class="lbl">条预警</span>
              </div>
              <div class="row-abnormal-tip" v-if="group.checkItems.filter(c => c.status === 'abnormal').length > 0">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ group.checkItems.filter(c => c.status === 'abnormal').length }}项异常</span>
              </div>
            </div>
            <div class="row-actions">
              <el-button v-if="group.warnings.some(w => w.status === '待处理')" type="primary" size="small" @click="batchResolveGroup(group)">
                <el-icon><Edit /></el-icon>批量处理
              </el-button>
              <el-button size="small" @click="viewDetail(getLatestWarning(group))">
                <el-icon><View /></el-icon>详情
              </el-button>
            </div>
          </div>
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
    <el-dialog title="预警详情" v-model="showDetailDialog" width="680px">
      <div v-if="selectedWarning" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">预警信息</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">预警类型</span>
              <span class="info-value">
                <el-tag :type="getWarningTagType(selectedWarning.warningType)">{{ selectedWarning.warningType }}</el-tag>
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
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="selectedWarning && selectedWarning.status === '待处理'" type="primary" @click="openResolve(selectedWarning)">立即处理</el-button>
      </template>
    </el-dialog>

    <!-- 处理预警弹窗 -->
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
  Search, Refresh, Plus, Warning, Bell, CircleCheck, Clock, Money, User, Location, InfoFilled, DocumentChecked, Grid, List, Connection, View, Edit, WarningFilled
} from '@element-plus/icons-vue'
import { warnings as mockWarnings, warningTypes, residents, tags as mockTags } from '../../data/mock'

const warnings = ref([...mockWarnings])
const currentPage = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const filterStatus = ref('')
const filterCount = ref('')
const viewMode = ref('card')
const showDetailDialog = ref(false)
const showResolveDialog = ref(false)
const showAddWarningDialog = ref(false)
const selectedWarning = ref(null)

const timeRangeType = ref('month')
const customDateRange = ref([])
const dateFilterRange = ref(null)

const totalCount = computed(() => warnings.value.length)
const pendingCount = computed(() => warnings.value.filter(w => w.status === '待处理').length)
const resolvedCount = computed(() => warnings.value.filter(w => w.status === '已处理').length)
const todayCount = computed(() => warnings.value.filter(w => w.createTime.startsWith('2024-06-20')).length)

const propertyWarningCount = computed(() => {
  const types = ['不动产超标', '车辆登记', '工商注册', '公积金超标']
  return warnings.value.filter(w => types.some(t => w.warningType.includes(t) || t.includes(w.warningType))).length
})

const survivalWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType.includes('死亡') || w.warningType.includes('状态不一致')).length
})

const householdWarningCount = computed(() => {
  return warnings.value.filter(w => w.warningType.includes('户籍')).length
})

// 当前选中预警对应的居民标签
const warningResidentTags = computed(() => {
  if (!selectedWarning.value) return []
  return mockTags.filter(t => t.residentId === selectedWarning.value.residentId)
})

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

  return items
}

const filteredGroupedWarnings = computed(() => {
  let result = groupedWarnings.value
  if (filterType.value) {
    result = result.filter(g => g.warnings.some(w => w.warningType === filterType.value))
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

// ============ 辅助函数 ============

const formatIdCard = (idCard) => {
  if (!idCard) return '--'
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

const getResidentCommunity = (residentId) => {
  const r = residents.find(x => x.id === residentId)
  return r ? `${r.community} · ${r.grid}` : '六角社区'
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
  currentPage.value = 1
}

const viewDetail = (w) => {
  selectedWarning.value = w
  showDetailDialog.value = true
}

// 处理单条预警
const openResolve = (w) => {
  selectedWarning.value = w
  resolveForm.result = ''
  resolveForm.remark = ''
  resolveForm.approver = ''
  resolveForm.approveRemark = ''
  resolveForm.imageUrls = []
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

// ============ 弹窗数据 ============
const resolveForm = reactive({
  result: '',
  remark: '',
  imageUrl: '',
  approver: '',
  approveRemark: '',
  imageUrls: []
})
const fileList = ref([])
const approvers = [
  { label: '街道民政办主任', value: 'director' },
  { label: '社区书记', value: 'secretary' },
  { label: '民政专干', value: 'specialist' }
]

const isDeathWarning = computed(() => {
  return selectedWarning.value &&
    (selectedWarning.value.warningType.includes('死亡') || selectedWarning.value.warningType.includes('状态不一致'))
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
  if (resolveForm.result === '信息有误' && !resolveForm.approver) {
    ElMessage.warning('请选择审批人')
    return
  }

  const w = selectedWarning.value
  w.operator = 'admin'
  w.resolveTime = new Date().toLocaleString('zh-CN')
  w.imageUrls = [...resolveForm.imageUrls]
  if (resolveForm.result === '信息有误') {
    w.status = '审批中'
    w.approver = resolveForm.approver
    w.approveRemark = resolveForm.approveRemark
    ElMessage.success('已提交审批，请等待审批结果')
  } else {
    w.status = '已处理'
    ElMessage.success('处理成功')
  }
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

.warning-category-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.warning-category-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 10px; color: #fff; }
.property-card { background: linear-gradient(135deg, #f56c6c, #e53e3e); }
.survival-card { background: linear-gradient(135deg, #e6a23c, #d97706); }
.household-card { background: linear-gradient(135deg, #3b82f6, #2563eb); }
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
 
