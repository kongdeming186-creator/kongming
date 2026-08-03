<template>
  <div class="history-resident-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">历史居民</h2>
        <p class="page-subtitle">归档已确认死亡、户籍迁出人员，共 {{ historyResidents.length }} 人</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回居民列表
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon red"><el-icon><User /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ historyResidents.length }}</span>
          <span class="stat-label">历史居民总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><el-icon><Close /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ deathCount }}</span>
          <span class="stat-label">已去世</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><el-icon><Location /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ migrationCount }}</span>
          <span class="stat-label">户籍迁出</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><PriceTag /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ stoppedTagsCount }}</span>
          <span class="stat-label">已停发待遇</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <div class="search-row">
          <div class="search-item">
            <el-input v-model="searchKeyword" placeholder="搜索姓名或身份证号…" style="width: 220px" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="search-item">
            <el-select v-model="filterReason" placeholder="迁出原因" clearable style="width: 130px">
              <el-option label="已去世" value="已去世" />
              <el-option label="户籍迁出" value="户籍迁出" />
            </el-select>
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.community" placeholder="选择社区" clearable style="width: 130px">
              <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="search-item search-actions">
            <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="pagedResidents" border stripe style="width: 100%"
          :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="gender" label="性别" width="55" align="center" />
          <el-table-column prop="idCard" label="身份证号" width="170">
            <template #default="scope">{{ maskIdCard(scope.row.idCard) }}</template>
          </el-table-column>
          <el-table-column prop="community" label="社区" width="90" />
          <el-table-column prop="estate" label="小区" width="100" />
          <el-table-column label="迁出原因" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getReasonType(scope.row)" size="small" effect="light">
                {{ getReason(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="迁出时间" width="120">
            <template #default="scope">
              {{ scope.row.outDate || scope.row.updateTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="已停发待遇" min-width="200">
            <template #default="scope">
              <div v-if="getResidentTags(scope.row.id).length > 0" class="stopped-tags">
                <el-tag
                  v-for="tag in getResidentTags(scope.row.id)"
                  :key="tag.id"
                  type="info"
                  size="small"
                  effect="plain"
                  class="stopped-tag"
                >
                  {{ tag.tagType }} - {{ tag.tagSubType }}
                </el-tag>
              </div>
              <span v-else class="no-tag">--</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button type="primary" link size="small" @click="viewDetail(scope.row)">详情</el-button>
                <el-button type="warning" link size="small" @click="handleRestore(scope.row)">恢复</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
          :total="filteredResidents.length" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ArrowLeft, User, Close, Location, PriceTag } from '@element-plus/icons-vue'
import { residents as mockResidents, tags, communities } from '../../data/mock'

const router = useRouter()

const allResidents = ref([...mockResidents])

const historyResidents = computed(() => {
  return allResidents.value.filter(r => r.isHistorical || r.survivalStatus === '已去世')
})

const deathCount = computed(() => historyResidents.value.filter(r => r.survivalStatus === '已去世').length)
const migrationCount = computed(() => historyResidents.value.filter(r => r.survivalStatus !== '已去世' && r.isHistorical).length)
const stoppedTagsCount = computed(() => {
  let count = 0
  historyResidents.value.forEach(r => {
    count += tags.filter(t => t.residentId === r.id).length
  })
  return count
})

const searchKeyword = ref('')
const filterReason = ref('')
const searchForm = reactive({ community: '' })
const currentPage = ref(1)
const pageSize = ref(10)

const getResidentTags = (residentId) => tags.filter(t => t.residentId === residentId)

const getReason = (resident) => {
  if (resident.survivalStatus === '已去世') return '已去世'
  if (resident.isHistorical) return '户籍迁出'
  return '其他'
}

const getReasonType = (resident) => {
  if (resident.survivalStatus === '已去世') return 'danger'
  return 'warning'
}

const maskIdCard = (idCard) => idCard ? idCard.slice(0, 6) + '********' + idCard.slice(-4) : ''

const filteredResidents = computed(() => {
  let result = historyResidents.value
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(kw) || r.idCard.includes(kw))
  }
  if (searchForm.community) result = result.filter(r => r.community === searchForm.community)
  if (filterReason.value) {
    result = result.filter(r => {
      if (filterReason.value === '已去世') return r.survivalStatus === '已去世'
      if (filterReason.value === '户籍迁出') return r.survivalStatus !== '已去世' && r.isHistorical
      return true
    })
  }
  return result
})

const pagedResidents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredResidents.value.slice(start, start + pageSize.value)
})

const goBack = () => router.push('/resident')
const viewDetail = (row) => router.push(`/resident/detail/${row.id}`)

const handleRestore = (row) => {
  ElMessageBox.confirm(`确定要将居民"${row.name}"恢复到常规居民列表吗？恢复后其保障待遇状态将保持当前不变。`, '恢复确认', {
    type: 'warning',
    confirmButtonText: '确定恢复',
    cancelButtonText: '取消'
  }).then(() => {
    const r = allResidents.value.find(item => item.id === row.id)
    if (r) {
      r.isHistorical = false
      if (r.survivalStatus !== '已去世') {
        tags.filter(t => t.residentId === r.id).forEach(t => {
          t.isEnjoy = true
        })
      }
    }
    ElMessage.success('恢复成功')
  }).catch(() => {})
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  searchKeyword.value = ''
  filterReason.value = ''
  searchForm.community = ''
  currentPage.value = 1
}
const handleSizeChange = (size) => { pageSize.value = size }
const handleCurrentChange = (page) => { currentPage.value = page }
</script>

<style scoped>
.history-resident-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff; border-radius: 10px; border: 1px solid #f3f4f6; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.stat-icon.red { background: linear-gradient(135deg, #f56c6c, #e53e3e); }
.stat-icon.orange { background: linear-gradient(135deg, #e6a23c, #d97706); }
.stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.stat-icon.green { background: linear-gradient(135deg, #67c23a, #059669); }
.stat-value { font-size: 22px; font-weight: 700; color: #1f2937; display: block; }
.stat-label { font-size: 12px; color: #6b7280; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); }

.search-bar { margin-bottom: 20px; }
.search-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.search-item { flex-shrink: 0; }
.search-actions { margin-left: auto; display: flex; gap: 8px; }

.table-wrapper { overflow-x: auto; }
.stopped-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.stopped-tag { cursor: default; }
.no-tag { font-size: 12px; color: #d1d5db; }

.action-buttons { display: flex; justify-content: center; gap: 4px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
