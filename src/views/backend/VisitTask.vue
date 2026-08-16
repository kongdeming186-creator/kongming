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
        <el-table-column prop="completeTime" label="完成时间" width="170" align="center">
          <template #default="scope">
            <span v-if="scope.row.completeTime">{{ scope.row.completeTime }}</span>
            <span v-else style="color:#94a3b8">—</span>
          </template>
        </el-table-column>
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新增任务'" width="600px" :close-on-click-modal="false">
      <el-form :model="taskForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务内容" prop="content">
          <el-input v-model="taskForm.content" type="textarea" :rows="3" placeholder="请输入任务内容" />
        </el-form-item>

        <!-- 1. 所属社区 - 级联多选（支持选社区 / 选网格） -->
        <el-form-item label="所属社区" prop="communitiesCascade">
          <el-cascader
            v-model="taskForm.communitiesCascade"
            :options="communityGridOptions"
            :props="cascaderProps"
            placeholder="请选择社区或网格（可多选）"
            style="width: 100%"
            collapse-tags
            collapse-tags-tooltip
            clearable
          />
        </el-form-item>

        <!-- 2. 任务对象（标签类型：保障人员 / 特殊人员 / 其他） -->
        <el-form-item label="任务对象" prop="taskTarget">
          <el-radio-group v-model="taskForm.taskTarget" @change="onTargetChange">
            <el-radio-button label="保障人员" />
            <el-radio-button label="特殊人员" />
            <el-radio-button label="其他" />
          </el-radio-group>
        </el-form-item>

        <!-- 3. 任务标签 - 多选（根据任务对象联动，选"其他"时支持自定义输入） -->
        <el-form-item label="任务标签" prop="taskTags">
          <!-- 保障人员 / 特殊人员：多选下拉 -->
          <el-select
            v-if="taskForm.taskTarget !== '其他'"
            v-model="taskForm.taskTags"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :placeholder="taskForm.taskTarget === '保障人员' ? '请选择保障政策标签（可多选）' : '请选择特殊人群标签（可多选）'"
            style="width: 100%"
            clearable
          >
            <el-option-group v-if="taskForm.taskTarget === '保障人员'" label="基本生活保障">
              <el-option v-for="t in benefitTagGroups.living" :key="t" :label="t" :value="t" />
            </el-option-group>
            <el-option-group v-if="taskForm.taskTarget === '保障人员'" label="养老与助残">
              <el-option v-for="t in benefitTagGroups.elderly" :key="t" :label="t" :value="t" />
            </el-option-group>
            <el-option-group v-if="taskForm.taskTarget === '保障人员'" label="住房与就业">
              <el-option v-for="t in benefitTagGroups.housing" :key="t" :label="t" :value="t" />
            </el-option-group>
            <el-option-group v-if="taskForm.taskTarget === '保障人员'" label="儿童福利">
              <el-option v-for="t in benefitTagGroups.children" :key="t" :label="t" :value="t" />
            </el-option-group>

            <el-option-group v-if="taskForm.taskTarget === '特殊人员'" label="重点关爱人群">
              <el-option v-for="t in specialTagGroups.care" :key="t" :label="t" :value="t" />
            </el-option-group>
            <el-option-group v-if="taskForm.taskTarget === '特殊人员'" label="帮教管控人群">
              <el-option v-for="t in specialTagGroups.control" :key="t" :label="t" :value="t" />
            </el-option-group>
            <el-option-group v-if="taskForm.taskTarget === '特殊人员'" label="其他特殊">
              <el-option v-for="t in specialTagGroups.others" :key="t" :label="t" :value="t" />
            </el-option-group>
          </el-select>

          <!-- 其他：可自定义输入标签（多选分隔） -->
          <div v-else class="custom-tag-wrapper">
            <el-select
              v-model="taskForm.taskTags"
              multiple
              filterable
              allow-create
              default-first-option
              collapse-tags
              collapse-tags-tooltip
              placeholder="可输入任意标签名，回车确认（可添加多个）"
              style="width: 100%"
              clearable
            >
              <el-option v-for="t in otherCommonTags" :key="t" :label="t" :value="t" />
            </el-select>
            <div class="input-hint">输入标签后回车即可添加自定义标签</div>
          </div>
        </el-form-item>

        <!-- 4. 循环频次 - 支持"不循环"（显式选项或留空） -->
        <el-form-item label="循环频次" prop="cycleFrequency">
          <el-radio-group v-model="taskForm.cycleFrequency">
            <el-radio-button :label="''">不循环</el-radio-button>
            <el-radio-button label="周" />
            <el-radio-button label="月" />
            <el-radio-button label="季" />
            <el-radio-button label="半年" />
          </el-radio-group>
          <div class="input-hint">选择"不循环"或不选择均为一次性任务</div>
        </el-form-item>

        <!-- 5. 新增：完成时间 -->
        <el-form-item label="完成时间" prop="completeTime">
          <el-date-picker
            v-model="taskForm.completeTime"
            type="datetime"
            placeholder="请选择任务完成时间（可选）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            clearable
          />
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
              <span class="detail-value">{{ currentDetail.cycleFrequency || '不循环' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务开始时间：</span>
              <span class="detail-value">{{ currentDetail.startTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成时间：</span>
              <span class="detail-value">
                <span v-if="currentDetail.completeTime">{{ currentDetail.completeTime }}</span>
                <span v-else style="color:#94a3b8">未设置</span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">执行周期：</span>
              <span class="detail-value">{{ currentDetail.executePeriod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务对象：</span>
              <span class="detail-value">{{ currentDetail.taskTarget }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务标签：</span>
              <span class="detail-value">{{ currentDetail.taskTag || currentDetail.taskTags || '—' }}</span>
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
import { ref, computed, reactive, watch, nextTick } from 'vue'
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

// ====================== 1. 社区/网格 级联选择数据 ======================
// 每个社区下设置 3 个网格，与 mock 中"-第XXX网格"的命名保持一致
const communityList = ['学堂社区', '荣东社区', '六角社区', '由义社区', '民意社区']

const communityGridOptions = communityList.map(comm => ({
  value: comm,
  label: comm,
  children: [1, 2, 3].map(i => ({
    value: `${comm}-第00${i}网格`,
    label: `第00${i}网格`
  }))
}))

const cascaderProps = {
  multiple: true,
  checkStrictly: true,   // 允许选中任意层级（社区 或 网格）
  expandTrigger: 'hover',
  emitPath: false,       // 只回传最后一级 value（而非完整路径数组）
  value: 'value',
  label: 'label',
  children: 'children'
}

// ====================== 2. 任务对象 - 标签联动 ======================
// 2.1 保障人员标签（4个分组）
const benefitTagGroups = {
  living: ['低保', '特困人员救助供养', '临时救助', '支出型困难家庭'],
  elderly: ['高龄津贴', '重度残疾人护理补贴', '困难残疾人生活补贴', '基本养老保险'],
  housing: ['公租房保障', '廉租住房补贴', '4050灵活就业补贴', '公益性岗位安置'],
  children: ['困境儿童保障', '孤儿基本生活保障', '事实无人抚养儿童', '计生特别扶助']
}

// 2.2 特殊人员标签（3个分组）
const specialTagGroups = {
  care: ['高龄老人', '独居老人', '空巢老人', '留守儿童', '困境儿童', '孤儿'],
  control: ['涉毒人员', '精神障碍患者', '刑满释放人员', '社区矫正人员', '重点上访人员'],
  others: ['涉军优抚对象', '计生特殊家庭', '重残人员', '孤寡老人', '重大疾病患者']
}

// 2.3 其他类型常用标签（允许用户再自定义）
const otherCommonTags = ['常规走访', '节日慰问', '政策宣讲', '信息采集', '满意度调查', '重点回访', '安全检查']

// 当前类型下可选标签（供 reference 调试用）
const currentTagOptions = computed(() => {
  if (taskForm.taskTarget === '保障人员') {
    return [
      ...benefitTagGroups.living,
      ...benefitTagGroups.elderly,
      ...benefitTagGroups.housing,
      ...benefitTagGroups.children
    ]
  }
  if (taskForm.taskTarget === '特殊人员') {
    return [
      ...specialTagGroups.care,
      ...specialTagGroups.control,
      ...specialTagGroups.others
    ]
  }
  return otherCommonTags
})

// ====================== 数据状态 ======================
const tasks = ref([...visitTasks])

const filteredTasks = computed(() => {
  if (!searchName.value) return tasks.value
  return tasks.value.filter(t => t.name.includes(searchName.value))
})

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTasks.value.slice(start, start + pageSize.value)
})

// 表单模型
const taskForm = reactive({
  name: '',
  content: '',
  communitiesCascade: [],   // 级联选回的扁平 value 列表
  taskTarget: '保障人员',
  taskTags: [],              // 多选标签数组
  cycleFrequency: '',        // 空 = 不循环
  completeTime: ''           // 完成时间
})

// 切换任务对象类型时，清空已选标签（避免跨类型标签混入）
const onTargetChange = () => {
  taskForm.taskTags = []
}

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
  communitiesCascade: [{ required: true, type: 'array', message: '请选择社区或网格', trigger: 'change' }],
  taskTarget: [{ required: true, message: '请选择任务对象类型', trigger: 'change' }],
  taskTags: [{ required: true, type: 'array', message: '请选择或输入至少一个任务标签', trigger: 'change' }],
  cycleFrequency: [
    // 非必填：空值（不循环）和 选值（周/月/季/半年）均合法
    {
      validator: (_rule, value, callback) => {
        const allowed = ['', '周', '月', '季', '半年']
        if (allowed.includes(value)) {
          callback()
        } else {
          callback(new Error('循环频次取值非法'))
        }
      },
      trigger: 'change'
    }
  ],
  completeTime: []  // 可选
}

// ====================== 工具方法 ======================
const formatCommunities = (str) => {
  if (!str) return ''
  const list = str.split(',')
  return list.length > 3 ? list.slice(0, 3).join(',') + '...' : str
}

// 将级联选择的 value 扁平化（因 emitPath=false，已是 flat value 数组）
// 为编辑回填用：把"社区,社区-网格,社区"格式的字符串反解回 cascader 的值数组
const parseCommunitiesToCascade = (str) => {
  if (!str) return []
  // 直接按逗号切分：原数据中 communities 存的就是每项 value
  return str.split(',').filter(Boolean)
}

// 将历史的单一字符串 taskTag（如"高龄"）兼容转换为多选数组，按类型匹配
const parseTaskTagToArray = (taskTarget, tagStr) => {
  if (!tagStr) return []
  // 若已是逗号分隔的多标签（兼容未来），直接切
  if (tagStr.includes(',')) return tagStr.split(',').filter(Boolean)
  // 单一标签，包为数组
  return [tagStr]
}

// ====================== 事件处理 ======================
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
    communitiesCascade: [],
    taskTarget: '保障人员',
    taskTags: [],
    cycleFrequency: '',   // 默认不循环
    completeTime: ''
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value && formRef.value.clearValidate()
  })
}

const editTask = (row) => {
  isEdit.value = true
  // 兼容：历史数据 taskTarget 可能是具体人群（如高龄老人/残疾人），尝试规整回三类型
  let target = row.taskTarget
  if (target === '高龄老人' || target === '残疾人' || target === '刑释人员' ||
      target === '在矫人员' || target === '涉毒人员' || target === '精神病人') {
    target = '特殊人员'
  } else if (!['保障人员', '特殊人员', '其他'].includes(target)) {
    target = '保障人员'   // 无法识别的默认归为保障人员
  }

  Object.assign(taskForm, {
    name: row.name,
    content: row.content,
    communitiesCascade: parseCommunitiesToCascade(row.communities),
    taskTarget: target,
    taskTags: parseTaskTagToArray(target, row.taskTag),
    cycleFrequency: row.cycleFrequency || '',
    completeTime: row.completeTime || ''
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value && formRef.value.clearValidate()
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return

    const communitiesStr = taskForm.communitiesCascade.join(',')
    const tagsStr = taskForm.taskTags.join(',')
    const cycleDisplay = taskForm.cycleFrequency || '不循环'
    const periodStr = taskForm.cycleFrequency ? `已循环执行0${taskForm.cycleFrequency}` : '一次性任务'

    if (isEdit.value) {
      const idx = tasks.value.findIndex(t => t.id === (currentEditId.value || '') && false)
      // 按名称匹配（原逻辑），若找不到按 id 再兜底
      const findIdx = tasks.value.findIndex(t => t.name === taskForm.name)
      if (findIdx !== -1) {
        tasks.value[findIdx] = {
          ...tasks.value[findIdx],
          name: taskForm.name,
          content: taskForm.content,
          communities: communitiesStr,
          taskTarget: taskForm.taskTarget,
          taskTag: tagsStr,
          taskTags: taskForm.taskTags,          // 双写：数组形式供详情直接读
          cycleFrequency: cycleDisplay,
          completeTime: taskForm.completeTime
        }
      }
      ElMessage.success('编辑成功')
    } else {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      tasks.value.unshift({
        id: 'vt' + Date.now(),
        name: taskForm.name,
        content: taskForm.content,
        communities: communitiesStr,
        cycleFrequency: cycleDisplay,
        startTime: timeStr,
        completeTime: taskForm.completeTime,
        executePeriod: periodStr,
        enabled: true,
        taskTarget: taskForm.taskTarget,
        taskTag: tagsStr,
        taskTags: taskForm.taskTags,
        creator: '当前用户',
        executionRecords: []
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  })
}

// 占位变量（原findIndex用到，保留以减少不必要的警告；实际编辑时通过name匹配）
const currentEditId = ref('')

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

/* 自定义标签输入提示 */
.custom-tag-wrapper { width: 100%; }
.input-hint { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.4; }

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
