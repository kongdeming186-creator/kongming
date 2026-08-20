<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">政策匹配</h2>
        <p class="page-desc">AI智能匹配民政政策，实现政策找人精准帮扶</p>
      </div>
    </div>
    
    <div class="tabs-row">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="批量检索" name="batch" />
        <el-tab-pane label="单人判定" name="single" />
        <el-tab-pane label="服务场景" name="scene" />
      </el-tabs>
    </div>
    
    <!-- 批量检索 -->
    <div v-if="activeTab === 'batch'" class="content-card batch-all-in-one">
      <!-- 第一步：政策条件 -->
      <div class="step-section">
        <div class="step-section-header">
          <span class="step-section-title">① 政策条件</span>
          <span class="step-section-desc">上传政策文件或描述条件，AI 自动识别匹配规则</span>
        </div>

        <div class="policy-upload-desc-row">
          <!-- 左侧：政策文件上传 -->
          <div class="policy-upload-section">
            <div class="section-title">
              <span>政策文件上传</span>
              <el-tag size="small" type="info">支持直接上传政策文件，AI 自动识别条件</el-tag>
            </div>
            <div class="policy-upload-box">
              <el-upload
                class="policy-uploader"
                :auto-upload="false"
                :on-change="handlePolicyFileChange"
                :on-remove="handlePolicyFileRemove"
                :file-list="policyFileList"
                multiple
                :limit="5"
                :on-exceed="handlePolicyFileExceed"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              >
                <div class="upload-placeholder">
                  <el-icon class="upload-icon" :size="36"><UploadFilled /></el-icon>
                  <div class="upload-text">将政策文件拖到此处，或<span class="highlight">点击上传</span></div>
                  <div class="upload-subtip">支持 PDF / Word / TXT / Excel 格式</div>
                </div>
              </el-upload>
              <div v-if="policyFileList.length > 0" class="policy-file-list">
                <div v-for="(file, idx) in policyFileList" :key="idx" class="policy-file-item">
                  <div class="file-left">
                    <div class="file-icon" :class="getFileIconClass(file.name)">
                      <el-icon :size="20"><component :is="getFileIcon(file.name)" /></el-icon>
                    </div>
                    <div class="file-info">
                      <div class="file-name" :title="file.name">{{ file.name }}</div>
                      <div class="file-meta">
                        <span>{{ formatFileSize(file.size) }}</span>
                        <span v-if="file.parsed" class="status-tag parsed">已解析</span>
                        <span v-else-if="file.parsing" class="status-tag parsing">解析中...</span>
                        <span v-else class="status-tag pending">待解析</span>
                      </div>
                    </div>
                  </div>
                  <div class="file-right">
                    <el-button
                      v-if="!file.parsed && !file.parsing"
                      type="primary"
                      size="small"
                      link
                      @click="parsePolicyFile(file)"
                      :loading="file.parsing"
                    >
                      AI 解析
                    </el-button>
                    <el-button type="primary" size="small" link @click.prevent="handlePreviewPolicyFile(file)">
                      预览
                    </el-button>
                  </div>
                </div>
              </div>
              <div v-if="policyFileList.length > 0" class="policy-file-actions">
                <el-button type="primary" size="default" @click="parseAllPolicyFiles" :loading="parsingPolicyFiles">
                  <el-icon><MagicStick /></el-icon>
                  全部 AI 解析
                </el-button>
                <el-button size="default" @click="clearAllPolicyFiles">
                  <el-icon><Delete /></el-icon>
                  清空文件
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧：政策条件描述 -->
          <div class="policy-desc-section">
            <div class="section-title">政策条件描述</div>
            <div class="desc-input-wrap">
              <el-input
                v-model="policyDescText"
                type="textarea"
                :rows="5"
                placeholder="请手动输入相关政策条件，AI将智能识别并匹配居民。例如：'查找年龄在60岁以上、人均月收入低于1000元的高龄老人'…"
              />
              <el-button type="primary" size="large" class="desc-parse-btn" @click="parsePolicyDesc" :loading="parsingPolicy">
                <el-icon><MagicStick /></el-icon>
                AI识别条件
              </el-button>
            </div>
          </div>
        </div>

        <div class="policy-select-section">
          <div class="section-title">已识别的政策类型</div>
          <div class="policy-tags">
            <el-tag 
              v-for="policy in policyMatchRules" 
              :key="policy.id" 
              :type="selectedPolicies.includes(policy.policyName) ? 'primary' : 'info'"
              effect="plain"
              :class="{ 'policy-tag-active': selectedPolicies.includes(policy.policyName) }"
              @click="togglePolicy(policy.policyName)"
            >
              {{ policy.policyName }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 第二步：批量检索 -->
      <div class="step-section">
        <div class="step-section-header">
          <span class="step-section-title">② 批量检索</span>
          <span class="step-section-desc">选择检索方式，从居民库中批量筛选符合条件的群众</span>
        </div>

        <div class="search-mode-tabs">
          <div 
            class="search-mode-tab" 
            :class="{ active: searchMode === 'upload' }"
            @click="searchMode = 'upload'"
          >
            <el-icon :size="22"><Upload /></el-icon>
            <div class="mode-info">
              <div class="mode-title">上传居民底册</div>
              <div class="mode-desc">支持 Excel/CSV 格式上传外部数据进行比对</div>
            </div>
          </div>
          <div 
            class="search-mode-tab" 
            :class="{ active: searchMode === 'library' }"
            @click="searchMode = 'library'"
          >
            <el-icon :size="22"><Files /></el-icon>
            <div class="mode-info">
              <div class="mode-title">居民库内比对</div>
              <div class="mode-desc">直接从系统居民库中按条件检索匹配</div>
            </div>
          </div>
        </div>

        <!-- 上传底册 -->
        <div v-show="searchMode === 'upload'" class="batch-tools">
          <div class="upload-box-large">
            <el-upload
              class="upload-btn"
              :auto-upload="false"
              :on-change="handleFileChange"
              accept=".xlsx,.xls,.csv"
            >
              <div class="upload-box-content">
                <el-icon :size="48" color="#409eff"><Upload /></el-icon>
                <div class="upload-box-title">点击或拖拽文件到此区域上传</div>
                <div class="upload-box-sub">支持 .xlsx / .xls / .csv 格式，单次最多 10000 条数据</div>
              </div>
            </el-upload>
          </div>
          <div v-if="uploadedFileName" class="upload-result">
            <el-tag type="success" effect="light" size="large">
              <el-icon><CircleCheck /></el-icon>
              {{ uploadedFileName }} 上传成功，共解析 {{ uploadedCount }} 条居民数据
            </el-tag>
          </div>
        </div>

        <!-- 库内比对 -->
        <div v-show="searchMode === 'library'" class="library-search">
          <div class="library-filter">
            <div class="filter-row">
              <div class="filter-item">
                <span class="filter-label">社区范围</span>
                <el-select v-model="libraryFilters.community" placeholder="全部社区" clearable style="width: 160px">
                  <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
                </el-select>
              </div>
              <div class="filter-item">
                <span class="filter-label">网格</span>
                <el-select v-model="libraryFilters.grid" placeholder="全部网格" clearable style="width: 140px">
                  <el-option v-for="g in grids" :key="g" :label="g" :value="g" />
                </el-select>
              </div>
              <div class="filter-item">
                <span class="filter-label">年龄范围</span>
                <el-select v-model="libraryFilters.ageRange" placeholder="不限" clearable style="width: 160px">
                  <el-option label="0-18岁" value="0-18" />
                  <el-option label="19-59岁" value="19-59" />
                  <el-option label="60岁以上" value="60+" />
                  <el-option label="65岁以上" value="65+" />
                  <el-option label="80岁以上" value="80+" />
                </el-select>
              </div>
              <div class="filter-item">
                <span class="filter-label">人员类别</span>
                <el-select v-model="libraryFilters.personType" placeholder="不限" clearable style="width: 140px">
                  <el-option v-for="p in personTypes" :key="p" :label="p" :value="p" />
                </el-select>
              </div>
              <div class="filter-item">
                <span class="filter-label">特殊人群</span>
                <el-select v-model="libraryFilters.specialGroup" placeholder="不限" clearable style="width: 140px">
                  <el-option v-for="s in specialGroupTypes" :key="s" :label="s" :value="s" />
                </el-select>
              </div>
            </div>
          </div>
          <div class="library-stat">
            <div class="stat-item">
              <span class="stat-value">{{ residents.length }}</span>
              <span class="stat-label">居民库总量</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ filteredLibraryCount }}</span>
              <span class="stat-label">当前筛选</span>
            </div>
          </div>
        </div>

        <div class="execute-actions">
          <el-button type="primary" size="large" @click="executeSearch" :disabled="selectedPolicies.length === 0">
            <el-icon><Search /></el-icon>
            AI 智能匹配
          </el-button>
          <span class="search-tip" v-if="selectedPolicies.length > 0">
            将根据所选 {{ selectedPolicies.length }} 项政策条件，筛选符合条件的居民
          </span>
          <span class="search-tip" v-else>
            请先选择政策条件（在上方「已识别的政策类型」中选择）
          </span>
        </div>
      </div>

      <!-- 第三步：匹配结果 -->
      <div class="step-section" v-show="showResults">
        <div class="step-section-header">
          <span class="step-section-title">③ 匹配结果</span>
          <span class="step-section-desc">共 {{ matchResults.length }} 人符合条件，已按匹配度排序</span>
        </div>

        <div v-if="matchResults.length > 0" class="results-section">
          <div class="results-toolbar">
            <div class="results-stats">
              <div class="results-stat-item">
                <span class="results-stat-value">{{ matchResults.length }}</span>
                <span class="results-stat-label">匹配人数</span>
              </div>
              <div class="results-stat-item">
                <span class="results-stat-value">{{ selectedPolicies.length }}</span>
                <span class="results-stat-label">匹配政策</span>
              </div>
              <div class="results-stat-item">
                <span class="results-stat-value">{{ avgMatchScore }}</span>
                <span class="results-stat-label">平均匹配度</span>
              </div>
            </div>
            <div class="results-actions">
              <el-button type="primary" @click="exportResults">
                <el-icon><Download /></el-icon>导出名单
              </el-button>
            </div>
          </div>
          
          <el-table :data="matchResults" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
            <el-table-column prop="name" label="姓名" width="80" />
            <el-table-column prop="gender" label="性别" width="60" align="center" />
            <el-table-column prop="age" label="年龄" width="60" align="center" />
            <el-table-column prop="idCard" label="身份证号" width="170" />
            <el-table-column prop="community" label="社区" width="100" />
            <el-table-column prop="grid" label="网格" width="100" />
            <el-table-column prop="matchedFiles" label="匹配文件名称" width="200">
              <template #default="scope">
                <el-tag v-for="f in scope.row.matchedFiles" :key="f" type="primary" size="small" effect="light">
                  <el-icon style="margin-right: 4px;"><Document /></el-icon>{{ f }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="matchScore" label="匹配度" width="120" align="center">
              <template #default="scope">
                <el-progress :percentage="scope.row.matchScore" :color="getScoreColor(scope.row.matchScore)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="small" @click="viewResident(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div v-else class="empty-section">
          <el-empty description="暂无符合条件的居民" />
        </div>
      </div>

      <!-- 初始引导 -->
      <div v-if="!showResults && policyFileList.length === 0 && !policyDescText && selectedPolicies.length === 0 && uploadedFileName === ''" class="guide-section">
        <div class="guide-icon">
          <el-icon><Star /></el-icon>
        </div>
        <h3 class="guide-title">AI政策匹配功能</h3>
        <p class="guide-desc">
          第一步：上传政策文件或描述条件<br>
          第二步：选择检索方式批量筛选居民<br>
          第三步：查看匹配结果并导出名单
        </p>
        <div class="guide-features">
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>政策文件 AI 智能识别</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>批量底册比对</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>匹配度评分排序</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>一键导出名单</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 单人判定 -->
    <div v-if="activeTab === 'single'" class="content-card">
      <div class="single-header">
        <span class="card-title">单人政策判定</span>
        <p class="card-desc">上传居民材料或输入基本信息，AI一键判定可申报的福利类型与补贴标准</p>
      </div>
      
      <div class="single-tools">
        <el-button size="large" @click="openDescDialog" class="desc-btn">
          <el-icon><EditPen /></el-icon>
          手动描述居民信息
        </el-button>
        <span class="desc-tip">支持文字描述居民情况，AI 自动解析填充</span>
      </div>

      <div class="single-upload-section">
        <div class="section-title">上传居民材料</div>
        <div class="single-upload-box">
          <el-upload
            class="single-uploader"
            :auto-upload="false"
            :on-change="handleSingleFileChange"
            :on-remove="handleSingleFileRemove"
            :file-list="singleFileList"
            multiple
            :limit="3"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          >
            <div class="upload-placeholder">
              <el-icon class="upload-icon" :size="36"><UploadFilled /></el-icon>
              <div class="upload-text">上传居民证明材料</div>
              <div class="upload-subtip">支持身份证、户口本、收入证明等材料，PDF/Word/图片格式，最多 3 个文件</div>
            </div>
          </el-upload>
        </div>
      </div>
      
      <div class="form-section">
        <el-form :model="singleForm" label-width="120px">
          <div class="form-row form-row-center">
            <el-form-item label="姓名" required>
              <el-input 
                v-model="singleForm.name" 
                placeholder="请输入姓名" 
                @blur="fillResidentInfo"
                clearable
              />
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input 
                v-model="singleForm.idCard" 
                placeholder="请输入身份证号" 
                @blur="fillResidentInfo"
                clearable
              />
            </el-form-item>
          </div>
          
          <div class="form-actions">
            <el-button type="primary" size="large" @click="handleSingleMatch">
              <el-icon><Star /></el-icon>
              AI一键判定
            </el-button>
            <el-button size="large" @click="resetForm">重置表单</el-button>
          </div>
        </el-form>
      </div>
      
      <div v-if="singleResults.length > 0" class="results-section">
        <div class="results-header">
          <span class="results-title">匹配结果</span>
          <span class="results-count">共匹配到 {{ singleResults.length }} 项政策</span>
        </div>
        
        <div class="policy-cards">
          <div v-for="result in singleResults" :key="result.policyName" class="policy-card">
            <div class="policy-card-header">
              <div class="policy-tag">
                <el-tag type="success" size="small">{{ result.policyName }}</el-tag>
              </div>
              <div class="match-score">
                匹配度 {{ result.matchScore }}%
              </div>
            </div>
            <div class="policy-card-body">
              <div class="policy-desc">{{ result.description }}</div>
              <div class="subsidy-info">
                <span class="info-label">补贴标准：</span>
                <span class="info-value">{{ result.subsidyStandard }}</span>
              </div>
              <div class="match-reason">
                <span class="info-label">匹配原因：</span>
                <span class="info-value">{{ result.matchReason }}</span>
              </div>
            </div>
            <div class="policy-card-footer">
              <el-button type="primary" size="small" @click="applyPolicy(result)">
                <el-icon><Plus /></el-icon>申请办理
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="searchTriggered" class="empty-section">
        <el-empty description="未匹配到符合条件的政策" />
      </div>
    </div>
    
    <!-- 服务场景 -->
    <div v-if="activeTab === 'scene'" class="content-card">
      <div class="scene-header">
        <span class="card-title">AI 服务场景</span>
        <p class="card-desc">多场景 AI 智能感知与应用，覆盖天气预警、灾害提醒、关怀服务等</p>
      </div>
      
      <div class="scene-grid">
        <div 
          v-for="scene in aiScenes" 
          :key="scene.id" 
          class="scene-card"
          :class="{ active: scene.active }"
          @click="toggleScene(scene)"
        >
          <div class="scene-icon-wrap" :style="{ background: scene.bg }">
            <el-icon :size="32" :color="scene.iconColor">
              <component :is="IconMap[scene.iconName]" />
            </el-icon>
          </div>
          <div class="scene-info">
            <div class="scene-title">{{ scene.title }}</div>
            <div class="scene-desc">{{ scene.desc }}</div>
          </div>
          <div class="scene-switch">
            <el-switch v-model="scene.active" @click.stop />
          </div>
        </div>
      </div>
      
      <div class="scene-log-section">
        <div class="section-title">
          <span>场景感知日志</span>
          <el-tag size="small" type="info">今日共 {{ sceneLogs.length }} 条</el-tag>
        </div>
        <el-table :data="sceneLogs" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column prop="time" label="时间" width="170" />
          <el-table-column prop="scene" label="场景" width="140">
            <template #default="scope">
              <el-tag :type="sceneTagType(scope.row.scene)" size="small" effect="light">
                {{ scope.row.scene }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="级别" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.level === '高' ? 'danger' : scope.row.level === '中' ? 'warning' : 'info'" size="small">
                {{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" min-width="300" />
          <el-table-column prop="impact" label="影响人群" width="140" align="center">
            <template #default="scope">
              <span style="font-weight: 600; color: #1e40af;">{{ scope.row.impact }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="handleSceneLog(scope.row)">
                推送通知
              </el-button>
              <el-button size="small" link>详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 手动描述居民信息 对话框 -->
    <el-dialog v-model="descDialogVisible" title="手动描述居民信息" width="620px" destroy-on-close>
      <div class="desc-dialog-body">
        <div class="desc-example">
          <div class="example-label">💡 描述示例：</div>
          <el-tag size="small" effect="plain" @click="fillExample(1)">
            居民王大锤，男，65岁，独居，退休金1800元/月，名下无房无车，患有高血压
          </el-tag>
          <el-tag size="small" effect="plain" @click="fillExample(2)">
            李小花，女，38岁，离异，抚养1个孩子，打零工月收入1500元，三级残疾
          </el-tag>
        </div>
        <el-input
          v-model="descText"
          type="textarea"
          :rows="6"
          placeholder="请用自然语言描述居民的基本情况，包括年龄、性别、家庭情况、收入、财产、健康状况等，AI 将自动解析并填充到表单中。"
        />
      </div>
      <template #footer>
        <el-button @click="descDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="parsingDesc" @click="parseDescAndFill">
          <el-icon><MagicStick /></el-icon>
          AI 解析并填充
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Download, Star, CircleCheck, Plus, MagicStick, Upload, UploadFilled, Delete, EditPen,
  Sunny, House, Calendar, Bell, Warning as WIcon, Document, Notebook, Files, Picture,
  ArrowRight, ArrowLeft, RefreshLeft
} from '@element-plus/icons-vue'

const IconMap = { Sunny, House, Calendar, Bell, Warning: WIcon, User: Star }
import { policyMatchRules, residents, communities, grids, personTypes } from '../../data/mock'

const specialGroupTypes = ['涉毒', '信访', '社矫', '刑释', '精障（肇事）', '特扶', '高龄', '独居', '空巢', '孤寡', '孤儿', '事无', '涉军', '精障', '问题儿童']

const activeTab = ref('batch')
const batchStep = ref(1)
const searchMode = ref('library')
const selectedPolicies = ref([])
const searchTriggered = ref(false)
const policyDescText = ref('')
const parsingPolicy = ref(false)
const uploadedFileName = ref('')
const uploadedCount = ref(0)

const libraryFilters = reactive({
  community: '',
  grid: '',
  ageRange: '',
  personType: '',
  specialGroup: ''
})

const filteredLibraryCount = computed(() => {
  let count = residents.length
  if (libraryFilters.community) count = residents.filter(r => r.community === libraryFilters.community).length
  if (libraryFilters.grid) count = residents.filter(r => r.grid === libraryFilters.grid).length
  if (libraryFilters.personType) count = residents.filter(r => r.personType === libraryFilters.personType).length
  if (libraryFilters.specialGroup) count = residents.filter(r => (r.specialGroups || []).includes(libraryFilters.specialGroup)).length
  return count
})

const avgMatchScore = computed(() => {
  if (matchResults.value.length === 0) return 0
  const sum = matchResults.value.reduce((acc, r) => acc + r.matchScore, 0)
  return Math.round(sum / matchResults.value.length)
})

const showResults = computed(() => searchTriggered.value && matchResults.value.length > 0)

const goToStep = (step) => {
  if (step === 2 && selectedPolicies.value.length === 0) {
    ElMessage.warning('请先选择政策条件')
    return
  }
  batchStep.value = step
}

const backToStep2 = () => {
  batchStep.value = 2
}

const executeSearch = () => {
  if (selectedPolicies.value.length === 0) {
    ElMessage.warning('请先选择政策条件')
    return
  }
  batchStep.value = 3
  searchTriggered.value = true
  ElMessage.success(`已检索到 ${matchResults.value.length} 位符合条件的居民`)
}

// 政策文件上传
const policyFileList = ref([])
const parsingPolicyFiles = ref(false)

const matchResults = ref([
  { id: '3', name: '王五', gender: '男', age: 75, idCard: '420101195008203456', community: '六角社区', grid: '第三网格', matchedFiles: ['高龄津贴政策.pdf'], matchScore: 95 },
  { id: '2', name: '李四', gender: '男', age: 40, idCard: '420101198505152345', community: '六角社区', grid: '第二网格', matchedFiles: ['残疾人护理补贴政策.docx', '4050补贴通知.pdf'], matchScore: 88 },
  { id: '5', name: '钱七', gender: '女', age: 50, idCard: '420101197512125678', community: '六角社区', grid: '第二网格', matchedFiles: ['困难残疾人生活补贴办法.pdf'], matchScore: 85 }
])

const singleResults = ref([])

const singleForm = reactive({
  name: '',
  idCard: ''
})

const singleFileList = ref([])

const handleSingleFileChange = (file) => {
  singleFileList.value.push({
    uid: file.uid,
    name: file.name,
    size: file.size,
    raw: file.raw
  })
  ElMessage.success(`已上传文件：${file.name}`)
}

const handleSingleFileRemove = (file) => {
  const idx = singleFileList.value.findIndex(f => f.uid === file.uid)
  if (idx > -1) {
    singleFileList.value.splice(idx, 1)
  }
}

const descDialogVisible = ref(false)
const descText = ref('')
const parsingDesc = ref(false)

const aiScenes = ref([
  { id: 1, title: '天气灾害预警', desc: '实时感知高温、暴雨、寒潮等天气，推送重点人群关怀', iconName: 'Sunny', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', iconColor: '#d97706', active: true },
  { id: 2, title: '独居老人关怀', desc: '基于行动轨迹与用水用电数据，智能感知异常并预警', iconName: 'House', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', iconColor: '#2563eb', active: true },
  { id: 3, title: '重点节日走访', desc: '中秋、春节等节日自动匹配走访人群，生成任务', iconName: 'Calendar', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', iconColor: '#dc2626', active: false },
  { id: 4, title: '政策到期提醒', desc: '自动识别即将到期的补贴，提前通知办理续期', iconName: 'Bell', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', iconColor: '#059669', active: true },
  { id: 5, title: '涉毒人员管控', desc: 'AI 分析社会关系，识别风险行为并推送预警', iconName: 'Warning', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', iconColor: '#7c3aed', active: false },
  { id: 6, title: '精神障碍监护', desc: '定期提醒监护人复诊，联动社区网格员上门', iconName: 'User', bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', iconColor: '#0d9488', active: false }
])

const sceneLogs = ref([
  { time: '2026-08-16 09:15:20', scene: '天气灾害预警', level: '高', content: '武汉发布高温橙色预警（39°C），建议对高龄、独居老人进行防暑关怀', impact: '128 户' },
  { time: '2026-08-16 08:30:10', scene: '独居老人关怀', level: '中', content: '独居老人钱某连续 24 小时用水异常，已通知网格员上门核实', impact: '1 人' },
  { time: '2026-08-15 16:42:03', scene: '政策到期提醒', level: '低', content: '共有 32 名居民的低保资格将于 30 日内到期，已自动推送办理提醒', impact: '32 人' },
  { time: '2026-08-15 10:05:50', scene: '天气灾害预警', level: '中', content: '雷雨大风蓝色预警，建议转移低洼地段居民并加固户外设施', impact: '76 户' }
])

const toggleScene = (scene) => {
  scene.active = !scene.active
  ElMessage.success(`已${scene.active ? '开启' : '关闭'}场景：${scene.title}`)
}

const sceneTagType = (scene) => {
  if (scene.includes('天气')) return 'warning'
  if (scene.includes('独居')) return 'primary'
  if (scene.includes('政策')) return 'success'
  return 'info'
}

const handleSceneLog = (row) => {
  ElMessage.success(`已向相关网格员推送：${row.scene} 通知`)
}

const togglePolicy = (policyName) => {
  const index = selectedPolicies.value.indexOf(policyName)
  if (index > -1) {
    selectedPolicies.value.splice(index, 1)
  } else {
    selectedPolicies.value.push(policyName)
  }
}

const handleFileChange = (file) => {
  uploadedFileName.value = file.name
  uploadedCount.value = Math.floor(Math.random() * 500) + 100
  ElMessage.success(`已选择文件：${file.name}，AI解析中…`)
  setTimeout(() => {
    ElMessage.success(`文件解析完成，共识别 ${uploadedCount.value} 条居民数据`)
  }, 1200)
}

// 政策文件上传处理
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls']

const handlePolicyFileChange = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) {
    ElMessage.error(`不支持的文件格式 .${ext}，请上传 PDF/Word/TXT/Excel 文件`)
    return
  }
  policyFileList.value.push({
    uid: file.uid,
    name: file.name,
    size: file.size,
    raw: file.raw,
    parsed: false,
    parsing: false
  })
  ElMessage.success(`已添加文件：${file.name}`)
}

const handlePolicyFileRemove = (file) => {
  const idx = policyFileList.value.findIndex(f => f.uid === file.uid)
  if (idx > -1) {
    policyFileList.value.splice(idx, 1)
    ElMessage.info(`已移除文件：${file.name}`)
  }
}

const handlePolicyFileExceed = () => {
  ElMessage.warning('最多只能同时上传 5 个政策文件')
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / 1024 / 1024).toFixed(1) + ' MB'
}

const getFileIcon = (name) => {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext)) return Picture
  if (['doc', 'docx'].includes(ext)) return Document
  if (['xlsx', 'xls'].includes(ext)) return Notebook
  if (['txt'].includes(ext)) return Files
  return Document
}

const getFileIconClass = (name) => {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext)) return 'icon-pdf'
  if (['doc', 'docx'].includes(ext)) return 'icon-doc'
  if (['xlsx', 'xls'].includes(ext)) return 'icon-xls'
  if (['txt'].includes(ext)) return 'icon-txt'
  return 'icon-default'
}

const parsePolicyFile = (file) => {
  file.parsing = true
  setTimeout(() => {
    file.parsing = false
    file.parsed = true
    // 根据文件名模拟识别对应的政策
    const text = file.name
    const auto = []
    if (/高龄|老人|养老|60|年纪/.test(text)) auto.push('高龄津贴')
    if (/低保|收入|困难|最低/.test(text)) auto.push('低保')
    if (/残疾|护理|两项/.test(text)) auto.push('重度残疾人护理补贴')
    if (/特困|特困人员|五保/.test(text)) auto.push('特困人员')
    if (/公租房|住房|廉租|保障性住房/.test(text)) auto.push('公租房')
    if (/灵活就业|4050|再就业/.test(text)) auto.push('4050灵活就业补贴')
    if (/计生|特扶|独生子女|奖扶/.test(text)) auto.push('计生特扶')
    if (auto.length === 0) auto.push('低保', '高龄津贴')

    let addedCount = 0
    auto.forEach(p => {
      if (!selectedPolicies.value.includes(p)) {
        selectedPolicies.value.push(p)
        addedCount++
      }
    })

    const match = auto.join('、')
    if (addedCount > 0) {
      ElMessage.success(`文件「${file.name}」解析完成，识别到政策：${match}（已自动选中 ${addedCount} 项）`)
    } else {
      ElMessage.success(`文件「${file.name}」解析完成，识别到政策：${match}`)
    }
  }, 1500)
}

const parseAllPolicyFiles = () => {
  const pending = policyFileList.value.filter(f => !f.parsed && !f.parsing)
  if (pending.length === 0 && policyFileList.value.length > 0) {
    // 全部已解析，直接执行匹配
    if (selectedPolicies.value.length === 0) {
      ElMessage.warning('请先上传或解析政策文件')
    } else {
      handleBatchSearch()
    }
    return
  }
  parsingPolicyFiles.value = true
  Promise.all(pending.map(f => new Promise(resolve => {
    f.parsing = true
    setTimeout(() => {
      f.parsing = false
      f.parsed = true
      const text = f.name
      const auto = []
      if (/高龄|老人|养老|60|年纪/.test(text)) auto.push('高龄津贴')
      if (/低保|收入|困难|最低/.test(text)) auto.push('低保')
      if (/残疾|护理|两项/.test(text)) auto.push('重度残疾人护理补贴')
      if (/特困|特困人员|五保/.test(text)) auto.push('特困人员')
      if (/公租房|住房|廉租|保障性住房/.test(text)) auto.push('公租房')
      if (/灵活就业|4050|再就业/.test(text)) auto.push('4050灵活就业补贴')
      if (auto.length === 0) auto.push('低保', '高龄津贴')
      auto.forEach(p => {
        if (!selectedPolicies.value.includes(p)) selectedPolicies.value.push(p)
      })
      resolve()
    }, 1500)
  }))).then(() => {
    parsingPolicyFiles.value = false
    ElMessage.success(`已完成 ${pending.length} 个文件解析，共选中 ${selectedPolicies.value.length} 项政策`)
    if (selectedPolicies.value.length > 0) {
      handleBatchSearch()
    }
  })
}

const clearAllPolicyFiles = () => {
  policyFileList.value = []
  ElMessage.info('已清空所有政策文件')
}

const handlePreviewPolicyFile = (file) => {
  ElMessage.info(`预览功能开发中：${file.name}`)
}

const parsePolicyDesc = () => {
  if (!policyDescText.value.trim()) {
    ElMessage.warning('请先输入政策描述')
    return
  }
  parsingPolicy.value = true
  setTimeout(() => {
    const text = policyDescText.value
    const auto = []
    if (text.includes('高龄') || text.includes('老人') || text.includes('60')) auto.push('高龄津贴')
    if (text.includes('低保') || text.includes('收入')) auto.push('低保')
    if (text.includes('残疾') || text.includes('护理')) auto.push('重度残疾人护理补贴')
    if (text.includes('特困') || text.includes('特困人员')) auto.push('特困人员')
    if (text.includes('公租房') || text.includes('住房')) auto.push('公租房')
    if (auto.length === 0) {
      auto.push('低保', '高龄津贴')
    }
    auto.forEach(p => {
      if (!selectedPolicies.value.includes(p)) selectedPolicies.value.push(p)
    })
    parsingPolicy.value = false
    ElMessage.success(`AI 已识别并选中 ${auto.length} 项政策：${auto.join('、')}`)
  }, 1400)
}

const handleBatchSearch = () => {
  executeSearch()
}

const exportResults = () => {
  ElMessage.success('导出功能开发中')
}

const viewResident = (row) => {
  ElMessage.info(`查看居民详情：${row.name}`)
}

const fillResidentInfo = () => {
  const name = singleForm.name?.trim()
  const idCard = singleForm.idCard?.trim()
  if (!name && !idCard) return

  const found = residents.find(r =>
    (name && r.name === name) ||
    (idCard && r.idCard === idCard)
  )
  if (!found) return

  singleForm.name = found.name || singleForm.name
  singleForm.idCard = found.idCard || singleForm.idCard

  ElMessage.success(`已自动填充「${found.name}」的居民信息`)
}

const openDescDialog = () => {
  descText.value = ''
  descDialogVisible.value = true
}

const fillExample = (n) => {
  if (n === 1) {
    descText.value = '居民王大锤，男，65岁，独居，退休金1800元/月，名下无房无车，患有高血压'
  } else {
    descText.value = '李小花，女，38岁，离异，抚养1个孩子，打零工月收入1500元，三级残疾'
  }
}

const parseDescAndFill = () => {
  if (!descText.value.trim()) {
    ElMessage.warning('请输入居民信息描述')
    return
  }
  parsingDesc.value = true
  setTimeout(() => {
    const text = descText.value
    const name = text.match(/(居民)?([\u4e00-\u9fa5]{2,4})/)?.[2] || ''
    const idCardMatch = text.match(/\d{17}[\dXx]/)
    const idCard = idCardMatch ? idCardMatch[0] : ''

    singleForm.name = name
    singleForm.idCard = idCard

    parsingDesc.value = false
    descDialogVisible.value = false
    ElMessage.success('AI 已解析居民信息，请确认后提交判定')
  }, 1200)
}

const handleSingleMatch = () => {
  if (!singleForm.name && singleForm.idCard === '') {
    ElMessage.warning('请输入姓名或身份证号')
    return
  }
  searchTriggered.value = true
  const fileMatch = singleFileList.value.length > 0
  singleResults.value = fileMatch ? [
    {
      policyName: '低保',
      description: '基于上传材料与居民信息，AI智能匹配低保资格',
      subsidyStandard: '按家庭人口计算，每人每月不超过当地低保标准',
      matchScore: 85,
      matchReason: '上传材料显示人均收入低于标准线，符合低保申请条件'
    },
    {
      policyName: '困难残疾人生活补贴',
      description: '为困难残疾人提供生活补贴',
      subsidyStandard: '每人每月80元',
      matchScore: 90,
      matchReason: '上传的残疾证材料符合困难残疾人认定条件'
    }
  ] : [
    {
      policyName: '低保',
      description: '城乡居民最低生活保障',
      subsidyStandard: '按家庭人口计算，每人每月不超过当地低保标准',
      matchScore: 75,
      matchReason: '根据姓名与身份证号匹配，初步符合低保条件，建议上传证明材料复核'
    }
  ]
  ElMessage.success(`已匹配到 ${singleResults.value.length} 项政策`)
}

const resetForm = () => {
  singleForm.name = ''
  singleForm.idCard = ''
  singleFileList.value = []
  singleResults.value = []
  searchTriggered.value = false
}

const applyPolicy = (result) => {
  ElMessage.success(`开始办理 ${result.policyName} 申请`)
}

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#409eff'
  if (score >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.page-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 4px 0 0;
}

.tabs-row {
  margin-bottom: 20px;
}

.content-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #f3f4f6;
}

.batch-header, .single-header, .scene-header {
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: block;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 6px 0 0;
}

.batch-tools {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  margin-bottom: 20px;
}

.upload-tip {
  font-size: 13px;
  color: #9ca3af;
}

.policy-desc-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.desc-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 0% !important;
  min-height: 300px;
}

.desc-input-wrap :deep(.el-textarea) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.desc-input-wrap :deep(.el-textarea__inner) {
  flex: 1;
  resize: none;
  min-height: 0 !important;
  height: auto !important;
  box-sizing: border-box;
}

.desc-parse-btn {
  align-self: flex-end;
  flex-shrink: 0;
  height: 36px !important;
  padding: 12px 20px;
  white-space: nowrap;
}

.policy-select-section {
  margin-bottom: 24px;
}

.policy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.policy-tag-active {
  background: #e6f7ff !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 10px;
}

.search-tip {
  font-size: 13px;
  color: #6b7280;
}

.results-section {
  margin-top: 24px;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.results-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.results-count {
  font-size: 13px;
  color: #6b7280;
}

.empty-section {
  padding: 40px 20px;
}

.guide-section {
  text-align: center;
  padding: 48px 20px;
}

.guide-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
}

.guide-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.guide-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px;
}

.guide-features {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.guide-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
}

.single-tools {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-radius: 10px;
  margin-bottom: 20px;
}

.desc-btn {
  background: white;
  border: 1px solid #c7d2fe;
  color: #4338ca;
}
.desc-btn:hover {
  color: #4338ca !important;
  border-color: #a5b4fc !important;
}

.desc-tip {
  font-size: 13px;
  color: #6366f1;
}

.form-section {
  max-width: 800px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row .el-form-item {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.policy-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.policy-card {
  background: #f9fafb;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.policy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
}

.match-score {
  font-size: 13px;
  font-weight: 600;
  color: #67c23a;
}

.policy-card-body {
  padding: 16px;
}

.policy-desc {
  font-size: 14px;
  color: #374151;
  margin-bottom: 12px;
}

.subsidy-info, .match-reason {
  margin-bottom: 8px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.policy-card-footer {
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.scene-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.25s;
}

.scene-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.scene-card.active {
  border-color: #818cf8;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
}

.scene-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.45;
}

.scene-log-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.desc-dialog-body {
  padding: 4px 0;
}

.desc-example {
  margin-bottom: 14px;
}

.example-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.desc-example .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

/* 政策文件上传 + 条件描述 左右并排 */
.policy-upload-desc-row {
  display: flex !important;
  gap: 20px;
  margin-bottom: 20px;
  align-items: stretch;
}

.policy-upload-desc-row > .policy-upload-section,
.policy-upload-desc-row > .policy-desc-section {
  flex: 1 1 0% !important;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  height: 100%;
}

.policy-upload-desc-row > .policy-desc-section {
  margin-bottom: 0;
}

.policy-upload-section {
  margin-bottom: 0;
}

.policy-upload-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 320px;
  box-sizing: border-box;
}

.policy-upload-box .policy-uploader {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.policy-upload-box .policy-uploader :deep(.el-upload) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.policy-upload-box .policy-uploader :deep(.el-upload-dragger) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.policy-upload-box .upload-placeholder {
  flex: 1;
  min-height: 0;
  padding: 32px 16px;
}

.policy-uploader :deep(.el-upload-dragger) {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
}

.policy-uploader {
  width: 100%;
}

.policy-uploader :deep(.el-upload) {
  width: 100%;
}

.upload-placeholder {
  width: 100%;
  min-height: 220px;
  padding: 28px 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
  background: #f8fafc;
  transition: all 0.25s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-placeholder:hover {
  border-color: #1e40af;
  background: #eff6ff;
}

.upload-icon {
  color: #1e40af;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
}

.upload-text .highlight {
  color: #1e40af;
  font-weight: 600;
}

.upload-subtip {
  font-size: 12px;
  color: #94a3b8;
}

.policy-file-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.policy-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.policy-file-item:hover {
  border-color: #1e40af;
  background: #f1f5f9;
}

.file-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.file-icon.icon-pdf { background: #dc2626; }
.file-icon.icon-doc { background: #2563eb; }
.file-icon.icon-xls { background: #16a34a; }
.file-icon.icon-txt { background: #64748b; }
.file-icon.icon-default { background: #475569; }

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

.file-meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-tag {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.pending { background: #f1f5f9; color: #64748b; }
.status-tag.parsing { background: #dbeafe; color: #1e40af; }
.status-tag.parsed  { background: #dcfce7; color: #15803d; }

.file-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.policy-file-actions {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 步骤指示器 */
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 20px 0;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s;
}

.step-item.active {
  opacity: 1;
}

.step-item.done .step-num {
  background: #67c23a;
  color: #fff;
}

.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.step-item.active .step-num {
  background: #409eff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.step-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.step-item.active .step-label {
  color: #409eff;
  font-weight: 600;
}

.step-item.done .step-label {
  color: #67c23a;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 12px;
  margin-bottom: 28px;
  transition: all 0.3s;
}

.step-line.active {
  background: #67c23a;
}

/* 步骤区域 */
.step-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.step-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.step-section-desc {
  font-size: 13px;
  color: #9ca3af;
}

.step-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.step-tip {
  font-size: 13px;
  color: #9ca3af;
}

.step-tip.step-success {
  color: #67c23a;
  font-weight: 500;
}

/* 检索方式切换 */
.search-mode-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  background: #fff;
}

.search-mode-tab:hover {
  border-color: #93c5fd;
  background: #f8fafc;
}

.search-mode-tab.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.search-mode-tab .el-icon {
  color: #409eff;
  flex-shrink: 0;
}

.mode-info .mode-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.mode-info .mode-desc {
  font-size: 12px;
  color: #6b7280;
}

/* 大文件上传区 */
.upload-box-large {
  padding: 20px 0;
}

.upload-box-content {
  padding: 40px 20px;
  border: 2px dashed #93c5fd;
  border-radius: 12px;
  background: #f8fbff;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
}

.upload-box-content:hover {
  border-color: #409eff;
  background: #eff6ff;
}

.upload-box-title {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin: 12px 0 6px;
}

.upload-box-sub {
  font-size: 12px;
  color: #9ca3af;
}

.upload-result {
  margin-top: 16px;
  text-align: center;
}

/* 库内比对筛选 */
.library-search {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.library-filter {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.library-stat {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.library-stat .stat-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.library-stat .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.library-stat .stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

/* 结果工具栏 */
.results-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
}

.results-stats {
  display: flex;
  gap: 32px;
}

.results-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.results-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.results-stat-label {
  font-size: 12px;
  color: #6b7280;
}

.results-actions {
  display: flex;
  gap: 12px;
}

/* 单人判定上传区域 */
.single-upload-section {
  margin-bottom: 24px;
}

.single-upload-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
}

.single-uploader :deep(.el-upload-dragger) {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
}

.single-uploader {
  width: 100%;
}

.single-uploader :deep(.el-upload) {
  width: 100%;
}

/* 表单项居中对齐 */
.form-row-center {
  justify-content: center;
  gap: 24px;
}

.form-row-center .el-form-item {
  flex: none;
  width: 320px;
}

/* 一页三步骤布局 */
.batch-all-in-one {
  padding: 0 0 4px 0;
}

.batch-all-in-one .step-section {
  padding: 20px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid #e5e7eb;
}

.batch-all-in-one .step-section:last-of-type {
  border-bottom: none;
}

.execute-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.execute-actions .search-tip {
  font-size: 13px;
  color: #9ca3af;
}

.batch-all-in-one .step-section .step-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: inline-block;
}

.batch-all-in-one .step-section .step-section-desc {
  margin-left: 12px;
  font-size: 13px;
  color: #9ca3af;
}

/* 隐藏旧的步骤指示器 */
.steps-bar {
  display: none;
}

/* 响应式：窄屏时改为上下堆叠 */
@media (max-width: 900px) {
  .policy-upload-desc-row {
    flex-direction: column;
  }
  .policy-upload-desc-row .policy-upload-section,
  .policy-upload-desc-row .policy-desc-section {
    flex: none;
    width: 100%;
  }
}
</style>
