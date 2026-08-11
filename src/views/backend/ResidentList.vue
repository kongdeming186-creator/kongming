<template>
  <div class="resident-list-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">居民列表</h2>
        <p class="page-subtitle">共 {{ totalCount }} 位居民，{{ guaranteeCount }} 位保障人口</p>
      </div>
      <div class="header-actions">
        <el-button type="info" @click="goToHistoryResident">
          <el-icon><Clock /></el-icon>
          历史居民
        </el-button>
        <el-button type="primary" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="success" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增居民
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue"><el-icon><User /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">居民总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><el-icon><Medal /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ guaranteeCount }}</span>
          <span class="stat-label">保障人口</span>
        </div>
      </div>
      <div class="stat-card stat-card--clickable" @click="goToWarningList">
        <div class="stat-icon orange"><el-icon><Warning /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ residentsWithWarning.length }}</span>
          <span class="stat-label">待核查</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <div class="search-row">
          <div class="search-item">
            <el-input v-model="searchForm.keyword" placeholder="搜索姓名或身份证号…" style="width: 220px" clearable @keyup.enter="handleSearch" autocomplete="off">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.community" placeholder="选择社区" style="width: 130px" clearable>
              <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.grid" placeholder="选择网格" style="width: 110px" clearable>
              <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
            </el-select>
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.gender" placeholder="性别" style="width: 90px" clearable>
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </div>
          <div class="search-item">
            <el-input v-model="searchForm.minAge" placeholder="最小年龄" style="width: 90px" clearable type="number" />
          </div>
          <div class="search-item">
            <el-input v-model="searchForm.maxAge" placeholder="最大年龄" style="width: 90px" clearable type="number" />
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.personType" placeholder="人员类别" style="width: 120px" clearable>
              <el-option v-for="p in personTypes" :key="p" :label="p" :value="p" />
            </el-select>
          </div>
          <div class="search-item">
            <el-input v-model="searchForm.estate" placeholder="小区" style="width: 120px" clearable />
          </div>
          <div class="search-item">
            <el-select v-model="searchForm.survivalStatus" placeholder="生存状态" style="width: 110px" clearable>
              <el-option v-for="s in survivalStatus" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
        </div>
        <div class="search-row advanced">
          <div class="search-item tag-filter-item">
            <span class="filter-label">保障类型(多选)：</span>
            <el-checkbox-group v-model="searchForm.selectedTagTypes">
              <el-checkbox v-for="t in guaranteeTagTypes" :key="t" :label="t" size="default">{{ t }}</el-checkbox>
            </el-checkbox-group>
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
          <el-table-column prop="age" label="年龄" width="60" align="center" />
          <el-table-column prop="idCard" label="身份证号" width="170">
            <template #default="scope">{{ maskIdCard(scope.row.idCard) }}</template>
          </el-table-column>
          <el-table-column prop="community" label="社区" width="90" />
          <el-table-column prop="estate" label="小区" width="100" />
          <el-table-column prop="grid" label="网格" width="80" />
          <el-table-column prop="personType" label="人员类别" width="90" />
          <el-table-column label="家庭人口" width="80" align="center">
            <template #default="scope">
              <el-tag type="primary" size="small" class="family-tag" @click="showFamilyDialog(scope.row)">
                {{ scope.row.familyCount || 0 }}人
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="特殊人群" width="300">
            <template #default="scope">
              <div v-if="getResidentSpecialGroups(scope.row.id).length > 0" class="special-tags">
                <el-tag
                  v-for="s in getResidentSpecialGroups(scope.row.id)"
                  :key="s"
                  size="small"
                  effect="plain"
                  class="special-tag"
                  :type="getSpecialTagType(s)">
                  {{ s }}
                </el-tag>
              </div>
              <span v-else class="no-tag">--</span>
            </template>
          </el-table-column>
          <el-table-column label="保障信息" min-width="200">
            <template #default="scope">
              <div v-if="getResidentLevel1Tags(scope.row.id).length > 0" class="guarantee-tags">
                <el-tag
                  v-for="tagType in getResidentLevel1Tags(scope.row.id)"
                  :key="tagType"
                  :type="getTagType(tagType)"
                  size="small"
                  effect="light"
                  class="guarantee-tag"
                  @click="scrollToGuarantee(tagType)">
                  {{ tagType }}
                </el-tag>
              </div>
              <span v-else class="no-tag">暂无</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="最后一次更新时间" width="170" />
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button type="primary" link size="small" @click="goToDetail(scope.row.id)">详情</el-button>
                <el-button type="success" link size="small" @click="editResident(scope.row)">编辑</el-button>
                <el-button type="warning" link size="small" @click="refreshResident(scope.row)">刷新</el-button>
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

    <el-dialog title="新增居民" v-model="showAddDialog" width="600px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="addForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="addForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社区">
              <el-select v-model="addForm.community" placeholder="请选择社区" style="width: 100%">
                <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小区">
              <el-input v-model="addForm.estate" placeholder="请输入小区" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="网格">
              <el-select v-model="addForm.grid" placeholder="请选择网格" style="width: 100%">
                <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式">
              <el-input v-model="addForm.contact" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="批量导入" v-model="showImportDialog" width="500px" destroy-on-close>
      <div class="import-content">
        <div class="import-tip">
          <el-icon :size="20" color="#e6a23c"><Warning /></el-icon>
          <span>请下载导入模板并填写数据后上传</span>
        </div>
        <el-button type="primary" @click="downloadTemplate" style="margin: 16px 0">
          <el-icon><Download /></el-icon>下载导入模板
        </el-button>
        <div class="upload-area" @click="triggerUpload" role="button" tabindex="0" @keydown.enter="triggerUpload">
          <el-icon :size="48" color="#999" aria-hidden="true"><UploadFilled /></el-icon>
          <p class="upload-text">点击或拖拽文件到此处上传</p>
          <p class="upload-tip">支持 Excel 文件（.xlsx, .xls）</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="`${selectedResident?.name || ''} 的家庭成员`" v-model="showFamilyDialogVisible" width="500px">
      <div v-if="selectedResident" class="family-dialog-content">
        <div class="family-header">
          <span>户主：{{ selectedResident.name }}</span>
          <el-tag type="info" size="small">共 {{ selectedResident.familyMembers?.length || 0 }} 人</el-tag>
        </div>
        <el-table :data="selectedResident.familyMembers || []" stripe size="small"
          :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="relation" label="关系" width="80" />
          <el-table-column prop="idCard" label="身份证号" width="150" />
          <el-table-column prop="gender" label="性别" width="50" align="center" />
          <el-table-column prop="age" label="年龄" width="50" align="center" />
          <el-table-column prop="status" label="状态" width="60" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '在世' ? 'success' : 'info'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!selectedResident.familyMembers || selectedResident.familyMembers.length === 0" class="family-empty">
          暂无家庭成员信息
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Upload, Plus, Refresh, Download, Warning, UploadFilled, User, Medal, PriceTag, Clock } from '@element-plus/icons-vue'
import { residents as mockResidents, tags, communities, grids, survivalStatus, tagTypes, personTypes, warnings } from '../../data/mock'

const router = useRouter()
const residents = ref([...mockResidents])
const addFormRef = ref(null)
const showAdvanced = ref(false)
const showFamilyDialogVisible = ref(false)
const selectedResident = ref(null)

const guaranteeTagTypes = ['低保', '残疾', '公租房', '老年', '计生', '社保', '重症', '涉军', '支农返汉', '困境儿童']

const searchForm = reactive({
  keyword: '',
  community: '',
  grid: '',
  gender: '',
  personType: '',
  estate: '',
  minAge: '',
  maxAge: '',
  survivalStatus: '',
  selectedTagTypes: []
})

const currentPage = ref(1)
const pageSize = ref(10)
const showAddDialog = ref(false)
const showImportDialog = ref(false)

const addForm = reactive({ name: '', idCard: '', community: '', estate: '', grid: '', contact: '' })
const addRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
}

const totalCount = computed(() => residents.value.length)

const guaranteeCount = computed(() => {
  const idCardSet = new Set()
  tags.forEach(t => {
    if (guaranteeTagTypes.includes(t.tagType)) {
      const r = residents.value.find(r => r.id === t.residentId)
      if (r) idCardSet.add(r.idCard)
    }
  })
  return idCardSet.size
})

const residentsWithWarning = computed(() => {
  const warnedIds = new Set(warnings.map(w => w.residentId))
  return residents.value.filter(r => warnedIds.has(r.id))
})

const filteredResidents = computed(() => {
  let result = residents.value
  if (searchForm.keyword) {
    const kw = searchForm.keyword.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(kw) || r.idCard.includes(kw))
  }
  if (searchForm.community) result = result.filter(r => r.community === searchForm.community)
  if (searchForm.grid) result = result.filter(r => r.grid === searchForm.grid)
  if (searchForm.gender) result = result.filter(r => r.gender === searchForm.gender)
  if (searchForm.personType) result = result.filter(r => r.personType === searchForm.personType)
  if (searchForm.estate) result = result.filter(r => r.estate?.includes(searchForm.estate))
  if (searchForm.minAge) result = result.filter(r => r.age >= Number(searchForm.minAge))
  if (searchForm.maxAge) result = result.filter(r => r.age <= Number(searchForm.maxAge))
  if (searchForm.survivalStatus) result = result.filter(r => r.survivalStatus === searchForm.survivalStatus)
  if (searchForm.selectedTagTypes && searchForm.selectedTagTypes.length > 0) {
    result = result.filter(r => {
      const residentTagTypes = new Set(tags.filter(t => t.residentId === r.id).map(t => t.tagType))
      return searchForm.selectedTagTypes.every(t => residentTagTypes.has(t))
    })
  }
  return result
})

const pagedResidents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredResidents.value.slice(start, start + pageSize.value)
})

const getResidentTags = (residentId) => tags.filter(t => t.residentId === residentId)
const getResidentLevel1Tags = (residentId) => {
  const tagTypes = new Set()
  tags.filter(t => t.residentId === residentId).forEach(t => tagTypes.add(t.tagType))
  return Array.from(tagTypes)
}
const getResidentWarnings = (residentId) => warnings.filter(w => w.residentId === residentId)
const getResidentSpecialGroups = (residentId) => {
  const r = residents.value.find(x => x.id === residentId)
  return r?.specialGroups || []
}
const getSpecialTagType = (name) => ({
  '高龄': 'warning',
  '涉毒': 'danger',
  '孤儿': 'warning',
  '独居': 'info',
  '精障': 'danger'
}[name] || 'info')

const maskIdCard = (idCard) => idCard ? idCard.slice(0, 6) + '********' + idCard.slice(-4) : ''
const getSurvivalType = (status) => ({ '在世': 'success', '已去世': 'danger', '待核实': 'warning' }[status] || 'info')
const getTagType = (type) => ({
  '低保': 'danger', '残疾': 'warning', '公租房': 'info', '老年': 'success', '计生': '',
  '社保': '', '重症': 'danger', '涉军': 'danger', '支农返汉': 'info', '困境儿童': 'warning'
}[type] || 'info')

const goToDetail = (id) => router.push(`/resident/detail/${id}`)
const goToHistoryResident = () => router.push('/resident/history')
const goToWarningList = () => router.push('/warning')
const editResident = (row) => ElMessage.info(`编辑居民: ${row.name}`)
const refreshResident = (row) => ElMessage.info(`刷新居民数据: ${row.name}`)
const deleteResident = (id) => {
  ElMessageBox.confirm('确定要删除该居民吗？删除后不可恢复。', '删除确认', { type: 'warning' }).then(() => {
    residents.value = residents.value.filter(r => r.id !== id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  Object.keys(searchForm).forEach(k => searchForm[k] = k === 'selectedTagTypes' ? [] : '')
  currentPage.value = 1
}
const tagTotalCount = computed(() => tags.length)
const handleSizeChange = (size) => { pageSize.value = size }
const handleCurrentChange = (page) => { currentPage.value = page }
const handleAdd = () => {
  addFormRef.value?.validate((valid) => {
    if (valid) {
      residents.value.unshift({ id: String(Date.now()), ...addForm, personType: '户在人在', politicalStatus: '群众', education: '', maritalStatus: '', householdAddress: '', residenceAddress: '', survivalStatus: '在世', disabilityLevel: '', workUnit: '', retirementType: '', criminalRecord: '无', familyCount: 1, createTime: new Date().toISOString().split('T')[0] })
      showAddDialog.value = false
      ElMessage.success('新增成功')
      addFormRef.value?.resetFields()
    }
  })
}
const downloadTemplate = () => ElMessage.info('模板下载功能开发中')
const triggerUpload = () => ElMessage.info('文件上传功能开发中')
const handleImport = () => { showImportDialog.value = false; ElMessage.success('导入成功') }
const showFamilyDialog = (row) => { selectedResident.value = row; showFamilyDialogVisible.value = true }
const scrollToGuarantee = (tagType) => {
  ElMessage.info(`定位到保障类型：${tagType}`)
}
</script>

<style scoped>
.resident-list-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title-wrapper { flex: 1; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; }
.page-subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff; border-radius: 4px; border: 1px solid #e2e8f0; }
.stat-card--clickable { cursor: pointer; transition: all 0.2s; }
.stat-card--clickable:hover { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); border-color: #1e40af; }
.stat-icon { width: 44px; height: 44px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.stat-icon.blue { background: #1e40af; }
.stat-icon.green { background: #1e3a8a; }
.stat-icon.orange { background: #d97706; }
.stat-icon.purple { background: #1e40af; }
.stat-value { font-size: 22px; font-weight: 700; color: #1e293b; display: block; }
.stat-label { font-size: 12px; color: #64748b; }

.content-card { background: #fff; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; }
.search-bar { margin-bottom: 20px; }
.search-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.search-row.advanced { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
.search-item { flex-shrink: 0; }
.search-actions { margin-left: auto; display: flex; gap: 8px; }
.tag-filter-item { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; width: 100%; }
.filter-label { font-size: 13px; color: #64748b; font-weight: 500; flex-shrink: 0; }

.table-wrapper { overflow-x: auto; }
.guarantee-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.guarantee-tag { cursor: pointer; transition: all 0.2s; }
.guarantee-tag:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.no-tag { font-size: 12px; color: #cbd5e1; }
.no-warning { font-size: 12px; color: #cbd5e1; }
.family-tag { cursor: pointer; }
.family-tag:hover { opacity: 0.85; }
.action-buttons { display: flex; justify-content: center; gap: 4px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.special-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.special-tag { transition: all 0.2s; }

.import-content { text-align: center; }
.import-tip { display: flex; align-items: center; justify-content: center; gap: 8px; color: #d97706; font-size: 14px; }
.upload-area { border: 2px dashed #e2e8f0; border-radius: 4px; padding: 40px 20px; margin-top: 16px; cursor: pointer; transition: border-color 0.3s, background 0.3s; }
.upload-area:hover { border-color: #1e40af; background: #eff6ff; }
.upload-text { margin: 12px 0 4px 0; color: #374151; font-size: 14px; }
.upload-tip { margin: 0; color: #94a3b8; font-size: 12px; }

.family-dialog-content { padding: 8px 0; }
.family-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
.family-empty { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; }
</style>
