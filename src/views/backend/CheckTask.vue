<template>
  <div class="check-task-page">
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
        <el-table-column prop="taskName" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="任务内容" min-width="280" show-overflow-tooltip />
        <el-table-column prop="target" label="执行对象" min-width="140" show-overflow-tooltip />
        <el-table-column prop="startTime" label="任务开始时间" width="170" align="center" />
        <el-table-column prop="endTime" label="任务结束时间" width="170" align="center" />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="showDetail(scope.row)">详情</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="760px" :close-on-click-modal="false">
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-section">
          <div class="section-title">
            <span class="title-bar"></span>
            任务信息
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">任务名称：</span>
              <span class="detail-value">{{ currentDetail.taskName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">执行对象：</span>
              <span class="detail-value">{{ currentDetail.target }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">任务内容：</span>
              <span class="detail-value">{{ currentDetail.content }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务开始时间：</span>
              <span class="detail-value">{{ currentDetail.startTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务结束时间：</span>
              <span class="detail-value">{{ currentDetail.endTime }}</span>
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
          <el-table :data="currentDetail.records" style="width: 100%" border>
            <el-table-column prop="residentName" label="居民姓名" width="100" />
            <el-table-column prop="idCard" label="身份证号" width="180">
              <template #default="scope">
                <span>{{ maskIdCard(scope.row.idCard) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="联系方式" width="140">
              <template #default="scope">
                <span>{{ maskPhone(scope.row.phone) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="执行结果及内容" min-width="140">
              <template #default="scope">
                <el-tag :type="getResultTagType(scope.row.result)" size="small" effect="light">
                  {{ scope.row.result }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="核查图片" width="100" align="center">
              <template #default="scope">
                <el-button v-if="scope.row.hasImage" link type="primary" @click="viewImage(scope.row)">
                  查看图片
                </el-button>
                <span v-else style="color: #c0c4cc">--</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="完成情况" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small" effect="light">
                  {{ scope.row.status }}
                </el-tag>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { verifyTasks } from '../../data/mock'

const loading = ref(false)
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentDetail = ref(null)

const tasks = ref([...verifyTasks])

const filteredTasks = computed(() => {
  if (!searchName.value) return tasks.value
  return tasks.value.filter(t => t.taskName.includes(searchName.value))
})

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTasks.value.slice(start, start + pageSize.value)
})

const resetSearch = () => {
  searchName.value = ''
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
  return idCard.slice(0, 8) + '**********' + idCard.slice(-2)
}

const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

const getResultTagType = (result) => {
  if (result === '死亡' || result === '拒访' || result === '在世异常') return 'danger'
  if (result === '已搬迁' || result === '联系方式变更') return 'warning'
  return 'success'
}

const getStatusTagType = (status) => {
  if (status === '已完成') return 'success'
  if (status === '待核实') return 'warning'
  if (status === '核实中') return 'info'
  return ''
}

const viewImage = (row) => {
  ElMessage.info('查看核查图片（演示）')
}

const exportRecords = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.check-task-page { padding: 0; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }

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

.export-bar { margin-bottom: 12px; }
</style>
