<template>
  <div class="check-task-page">
    <div class="content-card">
      <!-- 搜索栏 -->
      <div class="filter-bar">
        <el-input v-model="searchName" placeholder="居民姓名" style="width: 140px" clearable />
        <el-input v-model="searchIdCard" placeholder="身份证号" style="width: 180px" clearable />
        <el-select v-model="searchCommunity" placeholder="所属社区" style="width: 120px" clearable>
          <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="searchGrid" placeholder="所属网格" style="width: 120px" clearable>
          <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
        </el-select>
        <el-input v-model="searchReviewer" placeholder="审核人" style="width: 120px" clearable />
        <el-date-picker
          v-model="searchDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
          value-format="YYYY-MM-DD"
        />
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" @click="doSearch">
          <el-icon><Search /></el-icon>查询
        </el-button>
      </div>

      <!-- 任务类型 Tab -->
      <el-tabs v-model="activeTab" class="task-type-tabs" @tab-change="onTabChange">
        <el-tab-pane name="全部">
          <template #label>
            <span class="tab-label">全部 <el-badge :value="totalCount" :max="99" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="政策不符">
          <template #label>
            <span class="tab-label">政策不符 <el-badge :value="getTabCount('政策不符')" :max="99" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="到期提醒">
          <template #label>
            <span class="tab-label">到期提醒 <el-badge :value="getTabCount('到期提醒')" :max="99" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="政策互斥">
          <template #label>
            <span class="tab-label">政策互斥 <el-badge :value="getTabCount('政策互斥')" :max="99" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="状态变化">
          <template #label>
            <span class="tab-label">状态变化 <el-badge :value="getTabCount('状态变化')" :max="99" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 列表 -->
      <el-table :data="pagedData" v-loading="loading" style="width: 100%" stripe border>
        <el-table-column prop="residentName" label="居民姓名" width="100" fixed="left" />
        <el-table-column prop="idCard" label="身份证号" width="180">
          <template #default="{ row }">
            <span>{{ maskIdCard(row.idCard) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="community" label="所属社区" width="120" />
        <el-table-column prop="gridName" label="所属网格" width="110" />
        <el-table-column prop="warningType" label="预警类型" width="130">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.taskType)" size="small" effect="light">{{ row.warningType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warningContent" label="预警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="checkResult" label="核查结果" width="120">
          <template #default="{ row }">
            <el-tag :type="getResultTagType(row.checkResult)" size="small" effect="light">{{ row.checkResult }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checker" label="核查人" width="90" />
        <el-table-column prop="reviewer" label="审核人" width="90" />
        <el-table-column prop="checkTime" label="核查时间" width="170" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>

      <!-- 数据统计 -->
      <div class="data-stats-bar">
        <span class="stats-text">
          共 <strong>{{ filteredData.length }}</strong> 条，
          按期完成 <span class="stats-rate done">{{ dataStats.doneRate }}%</span>，
          超期完成 <span class="stats-rate overdue">{{ dataStats.overdueRate }}%</span>，
          未完成 <span class="stats-rate pending">{{ dataStats.pendingRate }}%</span>
        </span>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="核查详情" width="680px" :close-on-click-modal="false">
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            居民信息
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">居民姓名：</span>
              <span class="detail-value">{{ currentDetail.residentName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">身份证号：</span>
              <span class="detail-value">{{ maskIdCard(currentDetail.idCard) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属社区：</span>
              <span class="detail-value">{{ currentDetail.community }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属网格：</span>
              <span class="detail-value">{{ currentDetail.gridName }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            预警信息
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">任务类型：</span>
              <span class="detail-value">{{ currentDetail.taskType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预警类型：</span>
              <span class="detail-value">{{ currentDetail.warningType }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">预警内容：</span>
              <span class="detail-value">{{ currentDetail.warningContent }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            核查记录
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">核查人：</span>
              <span class="detail-value">{{ currentDetail.checker }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">核查时间：</span>
              <span class="detail-value">{{ currentDetail.checkTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">核查结果：</span>
              <span class="detail-value">
                <el-tag :type="getResultTagType(currentDetail.checkResult)" size="small" effect="light">{{ currentDetail.checkResult }}</el-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态：</span>
              <span class="detail-value">
                <el-tag :type="getStatusTagType(currentDetail.status)" size="small">{{ currentDetail.status }}</el-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">初审人：</span>
              <span class="detail-value">{{ currentDetail.firstReviewer }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">初审时间：</span>
              <span class="detail-value">{{ currentDetail.firstReviewTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">复审人：</span>
              <span class="detail-value">{{ currentDetail.secondReviewer }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">复审时间：</span>
              <span class="detail-value">{{ currentDetail.secondReviewTime }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">核查说明：</span>
              <span class="detail-value">{{ currentDetail.checkNote }}</span>
            </div>
            <div class="detail-item full-width" v-if="currentDetail.images && currentDetail.images.length">
              <span class="detail-label">核查图片：</span>
              <span class="detail-value">
                <el-image
                  v-for="(img, idx) in currentDetail.images"
                  :key="idx"
                  :src="img"
                  :preview-src-list="currentDetail.images"
                  :initial-index="idx"
                  fit="cover"
                  class="check-image"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
const searchName = ref('')
const searchIdCard = ref('')
const searchCommunity = ref('')
const searchGrid = ref('')
const searchReviewer = ref('')
const searchDateRange = ref([])
const activeTab = ref('全部')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentDetail = ref(null)

// 4种任务类型
const taskTypes = ['政策不符', '到期提醒', '政策互斥', '状态变化']

// 各类型对应的预警子类型
const warningTypeMap = {
  '政策不符': ['低保收入超标', '房产信息不符', '车辆信息不符', '工商登记异常'],
  '到期提醒': ['高龄津贴到期', '残疾证到期', '低保证到期', '公租房合同到期'],
  '政策互斥': ['低保与特困重复', '残疾两项重复', '高龄与低保冲突', '公租房与补贴冲突'],
  '状态变化': ['户籍迁出', '婚姻状况变更', '死亡状态变更', '迁入新增']
}

const checkResults = ['停发取消', '继续享受']
const completionStatuses = ['已完成', '已完成', '已完成', '未完成', '超期']

const residentsData = ref([])
const communities = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区']
const grids = ['001网格', '002网格', '003网格', '004网格', '005网格']
const checkers = ['小王', '小李', '小张', '小陈', '小刘', '小赵']
const reviewers = ['李某某', '王某某', '张某某', '刘某某', '陈某某']
const residentNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '刘十三', '陈十四', '杨十五', '黄十六', '林十七', '何十八']

const genIdCard = (seed) => {
  const base = '420106'
  const year = 1940 + (seed % 70)
  const month = String((seed % 12) + 1).padStart(2, '0')
  const day = String((seed % 28) + 1).padStart(2, '0')
  const seq = String((seed * 37) % 1000).padStart(3, '0')
  const check = String((seed * 13) % 10)
  return `${base}${year}${month}${day}${seq}${check}`
}

// 生成模拟数据
const generateData = () => {
  const data = []
  let idx = 0
  taskTypes.forEach(type => {
    const subTypes = warningTypeMap[type]
    const count = 8 + Math.floor(Math.random() * 12)
    for (let i = 0; i < count; i++) {
      const rIdx = idx % residentNames.length
      const cIdx = idx % communities.length
      const gIdx = idx % grids.length
      const subType = subTypes[i % subTypes.length]
      const day = String((idx % 28) + 1).padStart(2, '0')
      const hour = String(idx % 24).padStart(2, '0')
      const min = String((idx * 7) % 60).padStart(2, '0')

      data.push({
        id: `chk_${type}_${i}`,
        residentName: residentNames[rIdx],
        idCard: genIdCard(idx * 3 + i),
        community: communities[cIdx],
        gridName: grids[gIdx],
        taskType: type,
        warningType: subType,
        warningContent: `${subType}：${residentNames[rIdx]}（${communities[cIdx]}）触发${type}预警，需核实处理。`,
        checkResult: checkResults[idx % checkResults.length],
        checker: checkers[idx % checkers.length],
        reviewer: reviewers[idx % reviewers.length],
        checkTime: `2025-0${(idx % 6) + 1}-${day} ${hour}:${min}:00`,
        firstReviewer: reviewers[(idx + 1) % reviewers.length],
        firstReviewTime: `2025-0${(idx % 6) + 1}-${day} ${String((idx % 24) + 1).padStart(2, '0')}:${String(((idx * 7) % 60) + 10).padStart(2, '0')}:00`,
        secondReviewer: reviewers[(idx + 2) % reviewers.length],
        secondReviewTime: `2025-0${(idx % 6) + 1}-${day} ${String((idx % 24) + 2).padStart(2, '0')}:${String(((idx * 7) % 60) + 20).padStart(2, '0')}:00`,
        status: completionStatuses[idx % completionStatuses.length],
        checkNote: `经核查，该居民${subType}情况属实，已按相关规定处理完毕。核查方式：上门走访+系统比对。`,
        images: idx % 3 === 0 ? [
          `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=政府办公场所核查现场照片&image_size=square`,
          `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=居民身份核实材料照片&image_size=square`
        ] : idx % 3 === 1 ? [
          `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上门走访居民家现场&image_size=square`
        ] : []
      })
      idx++
    }
  })
  return data
}

residentsData.value = generateData()

const getTabCount = (type) => residentsData.value.filter(d => d.taskType === type).length
const totalCount = computed(() => residentsData.value.length)

const filteredData = computed(() => {
  let data = activeTab.value === '全部'
    ? [...residentsData.value]
    : residentsData.value.filter(d => d.taskType === activeTab.value)
  if (searchName.value) {
    data = data.filter(d => d.residentName.includes(searchName.value))
  }
  if (searchIdCard.value) {
    data = data.filter(d => d.idCard.includes(searchIdCard.value))
  }
  if (searchCommunity.value) {
    data = data.filter(d => d.community === searchCommunity.value)
  }
  if (searchGrid.value) {
    data = data.filter(d => d.gridName === searchGrid.value)
  }
  if (searchReviewer.value) {
    data = data.filter(d => d.reviewer.includes(searchReviewer.value))
  }
  if (searchDateRange.value && searchDateRange.value.length === 2) {
    const [start, end] = searchDateRange.value
    data = data.filter(d => {
      const date = d.checkTime.split(' ')[0]
      return date >= start && date <= end
    })
  }
  return data
})

const dataStats = computed(() => {
  const total = filteredData.value.length
  const done = filteredData.value.filter(item => item.status === '已完成').length
  const pending = filteredData.value.filter(item => item.status === '未完成').length
  const overdue = filteredData.value.filter(item => item.status === '超期').length
  const calcRate = (num) => total > 0 ? ((num / total) * 100).toFixed(1) : '0.0'
  return {
    done,
    pending,
    overdue,
    doneRate: calcRate(done),
    pendingRate: calcRate(pending),
    overdueRate: calcRate(overdue)
  }
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const onTabChange = () => {
  currentPage.value = 1
}

const resetSearch = () => {
  searchName.value = ''
  searchIdCard.value = ''
  searchCommunity.value = ''
  searchGrid.value = ''
  searchReviewer.value = ''
  searchDateRange.value = []
  activeTab.value = '全部'
  currentPage.value = 1
}

const doSearch = () => {
  currentPage.value = 1
}

const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}

const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 10) return idCard
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

const getTypeTagType = (type) => {
  const map = { '政策不符': 'danger', '到期提醒': 'warning', '政策互斥': 'info', '状态变化': 'primary' }
  return map[type] || ''
}

const getResultTagType = (result) => {
  if (result === '停发取消') return 'danger'
  return 'success'
}

const getStatusTagType = (status) => {
  if (status === '已完成') return 'success'
  if (status === '未完成') return 'warning'
  if (status === '超期') return 'danger'
  return 'info'
}
</script>

<style scoped>
.check-task-page { padding: 0; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }

.task-type-tabs {
  margin-bottom: 16px;
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
:deep(.tab-badge .el-badge__content) {
  font-size: 11px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
}

.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.detail-content { max-height: 620px; overflow-y: auto; }
.detail-section { margin-bottom: 24px; }
.detail-section:last-child { margin-bottom: 0; }

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.title-bar {
  width: 3px;
  height: 14px;
  background: #1e40af;
  border-radius: 2px;
}

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 40px; }
.detail-item { display: flex; font-size: 14px; line-height: 1.6; }
.detail-item.full-width { grid-column: 1 / -1; }
.detail-label { color: #64748b; flex-shrink: 0; }
.detail-value { color: #1f2937; word-break: break-all; }
.check-image {
  width: 120px;
  height: 120px;
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}
.check-image:last-child {
  margin-right: 0;
}

.data-stats-bar {
  margin-top: 16px;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.stats-text {
  font-size: 13px;
  color: #475569;
}
.stats-text strong {
  font-size: 15px;
  color: #1e40af;
}
.stats-rate {
  font-weight: 600;
  padding: 0 4px;
}
.stats-rate.done { color: #10b981; }
.stats-rate.pending { color: #f59e0b; }
.stats-rate.overdue { color: #ef4444; }
</style>
