<template>
  <div class="visit-task-page">
    <div class="page-header">
      <div class="page-title-wrapper">
        <h2 class="page-title">人员走访任务</h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>新建任务
        </el-button>
      </div>
    </div>

    <div class="content-card">
      <div class="filter-bar">
        <el-input
          v-model="searchName"
          placeholder="任务名称"
          style="width: 220px"
          clearable
        />
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" @click="doSearch">
          <el-icon><Search /></el-icon>查询
        </el-button>
      </div>

      <el-table :data="pagedTasks" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="任务内容" min-width="160" show-overflow-tooltip />
        <el-table-column prop="communities" label="执行对象" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ formatCommunities(scope.row.communities) }}
          </template>
        </el-table-column>
        <el-table-column prop="cycleFrequency" label="循环频次" width="90" align="center" />
        <el-table-column prop="startTime" label="任务开始时间" width="170" align="center" />
        <el-table-column prop="executePeriod" label="执行周期" width="140" align="center" />
        <el-table-column label="循环状态" width="90" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              active-text="启用"
              inactive-text="停止"
              @change="toggleEnabled(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="showDetail(scope.row)">详情</el-button>
            <el-button link type="primary" @click="editTask(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredTasks.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新增'" width="560px" :close-on-click-modal="false">
      <el-form :model="taskForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务内容" prop="content">
          <el-input v-model="taskForm.content" type="textarea" :rows="3" placeholder="请输入任务内容" />
        </el-form-item>
        <el-form-item label="所属社区" prop="communities">
          <el-select v-model="taskForm.communitiesList" multiple placeholder="请选择社区" style="width: 100%">
            <el-option v-for="c in communityOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务对象" prop="taskTarget">
          <el-radio-group v-model="taskForm.taskTarget">
            <el-radio-button label="特殊人群" />
            <el-radio-button label="困难人员" />
            <el-radio-button label="特殊关注人员" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务标签" prop="taskTag">
          <el-select v-model="taskForm.taskTag" placeholder="请选择标签" style="width: 100%">
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="循环频次" prop="cycleFrequency">
          <el-radio-group v-model="taskForm.cycleFrequency">
            <el-radio-button label="周" />
            <el-radio-button label="月" />
            <el-radio-button label="季" />
            <el-radio-button label="半年" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="任务执行记录" width="720px" :close-on-click-modal="false">
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            任务信息
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">任务名称：</span>
              <span class="detail-value">{{ currentDetail.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建人：</span>
              <span class="detail-value">{{ currentDetail.creator }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">循环频次：</span>
              <span class="detail-value">{{ currentDetail.cycleFrequency }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务开始时间：</span>
              <span class="detail-value">{{ currentDetail.startTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">执行周期：</span>
              <span class="detail-value">{{ currentDetail.executePeriod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务对象：</span>
              <span class="detail-value">{{ currentDetail.taskTarget }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">任务内容：</span>
              <span class="detail-value">{{ currentDetail.content }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">执行对象：</span>
              <span class="detail-value">{{ currentDetail.communities }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            执行记录
          </div>
          <div class="export-bar">
            <el-button size="small" @click="exportRecords">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
          <el-table :data="currentDetail.executionRecords" style="width: 100%" border>
            <el-table-column prop="taskName" label="任务名称" min-width="160" />
            <el-table-column prop="phaseTime" label="阶段时间" width="140" />
            <el-table-column prop="unfinishedPeople" label="未完成人员" min-width="300">
              <template #default="scope">
                <span style="color: #ef4444">{{ scope.row.unfinishedPeople }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { visitTasks } from '../../data/mock'

const loading = ref(false)
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentDetail = ref(null)

const communityOptions = ['紫润北社区', '天勤社区', '丰竹园社区', '园博北社区', '长宜社区', '百泽社区', '东风社区', '荣荟社区', '天顺北社区', '天顺南社区', '新墩社区', '永利社区', '园博南社区', '长丰社区', '长源社区', '正康社区', '紫润南社区', '团结社区', '长宁社区', '长顺社区']
const tagOptions = ['高龄', '残疾', '刑释', '在矫', '涉毒', '精障', '低保', '特困', '孤儿', '公租房', '计生', '困境儿童', '涉军', '社保']

const tasks = ref([...visitTasks])

const filteredTasks = computed(() => {
  if (!searchName.value) return tasks.value
  return tasks.value.filter(t => t.name.includes(searchName.value))
})

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTasks.value.slice(start, start + pageSize.value)
})

const taskForm = reactive({
  name: '',
  content: '',
  communitiesList: [],
  taskTarget: '特殊人群',
  taskTag: '',
  cycleFrequency: '季'
})

const formRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
  communitiesList: [{ required: true, type: 'array', message: '请选择社区', trigger: 'change' }],
  taskTarget: [{ required: true, message: '请选择任务对象', trigger: 'change' }],
  taskTag: [{ required: true, message: '请选择任务标签', trigger: 'change' }],
  cycleFrequency: [{ required: true, message: '请选择循环频次', trigger: 'change' }]
}

const formatCommunities = (str) => {
  if (!str) return ''
  const list = str.split(',')
  return list.length > 3 ? list.slice(0, 3).join(',') + '...' : str
}

const resetSearch = () => {
  searchName.value = ''
  currentPage.value = 1
}

const doSearch = () => {
  currentPage.value = 1
}

const toggleEnabled = (row) => {
  const action = row.enabled ? '启用' : '停止'
  ElMessageBox.confirm(`确定要${action}该任务吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    row.enabled = !row.enabled
  })
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(taskForm, {
    name: '',
    content: '',
    communitiesList: [],
    taskTarget: '特殊人群',
    taskTag: '',
    cycleFrequency: '季'
  })
  dialogVisible.value = true
}

const editTask = (row) => {
  isEdit.value = true
  Object.assign(taskForm, {
    name: row.name,
    content: row.content,
    communitiesList: row.communities ? row.communities.split(',') : [],
    taskTarget: row.taskTarget,
    taskTag: row.taskTag,
    cycleFrequency: row.cycleFrequency
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    if (isEdit.value) {
      const idx = tasks.value.findIndex(t => t.name === taskForm.name)
      if (idx !== -1) {
        tasks.value[idx] = {
          ...tasks.value[idx],
          name: taskForm.name,
          content: taskForm.content,
          communities: taskForm.communitiesList.join(','),
          taskTarget: taskForm.taskTarget,
          taskTag: taskForm.taskTag,
          cycleFrequency: taskForm.cycleFrequency
        }
      }
      ElMessage.success('编辑成功')
    } else {
      const now = new Date()
      const timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0')
      tasks.value.unshift({
        id: 'vt' + Date.now(),
        name: taskForm.name,
        content: taskForm.content,
        communities: taskForm.communitiesList.join(','),
        cycleFrequency: taskForm.cycleFrequency,
        startTime: timeStr,
        executePeriod: '已循环执行0季',
        enabled: true,
        taskTarget: taskForm.taskTarget,
        taskTag: taskForm.taskTag,
        creator: '当前用户',
        executionRecords: []
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  })
}

const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}

const exportRecords = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.visit-task-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }

.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.detail-content { max-height: 600px; overflow-y: auto; }
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

.export-bar { margin-bottom: 12px; }
</style>
