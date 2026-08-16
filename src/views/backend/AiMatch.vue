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
    <div v-if="activeTab === 'batch'" class="content-card">
      <div class="batch-header">
        <span class="card-title">批量检索符合条件的居民</span>
        <p class="card-desc">根据政策条件，从全量居民底册中筛选符合条件的群众</p>
      </div>
      
      <div class="batch-tools">
        <el-upload
          class="upload-btn"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx,.xls,.csv"
        >
          <el-button size="large">
            <el-icon><Upload /></el-icon>
            上传居民底册
          </el-button>
        </el-upload>
        <span class="upload-tip">支持 .xlsx / .xls / .csv 格式</span>
      </div>
      
      <div class="policy-desc-section">
        <div class="section-title">政策条件描述</div>
        <div class="desc-input-wrap">
          <el-input
            v-model="policyDescText"
            type="textarea"
            :rows="3"
            placeholder="请手动输入相关政策条件，AI将智能识别并匹配居民。例如：'查找年龄在60岁以上、人均月收入低于1000元的高龄老人'…"
          />
          <el-button type="primary" size="large" class="desc-parse-btn" @click="parsePolicyDesc" :loading="parsingPolicy">
            <el-icon><MagicStick /></el-icon>
            AI识别条件
          </el-button>
        </div>
      </div>
      
      <div class="policy-select-section">
        <div class="section-title">选择政策类型</div>
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
      
      <div class="search-section">
        <el-button type="primary" size="large" @click="handleBatchSearch" :disabled="selectedPolicies.length === 0">
          <el-icon><Search /></el-icon>
          AI智能匹配
        </el-button>
        <span class="search-tip" v-if="selectedPolicies.length > 0">
          将根据所选政策条件，筛选符合条件的居民
        </span>
      </div>
      
      <div v-if="matchResults.length > 0" class="results-section">
        <div class="results-header">
          <span class="results-title">匹配结果</span>
          <span class="results-count">共 {{ matchResults.length }} 人符合条件</span>
          <el-button type="primary" size="small" @click="exportResults">
            <el-icon><Download /></el-icon>导出名单
          </el-button>
        </div>
        
        <el-table :data="matchResults" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="gender" label="性别" width="60" align="center" />
          <el-table-column prop="age" label="年龄" width="60" align="center" />
          <el-table-column prop="idCard" label="身份证号" width="170" />
          <el-table-column prop="community" label="社区" width="100" />
          <el-table-column prop="grid" label="网格" width="100" />
          <el-table-column prop="matchPolicies" label="匹配政策" width="200">
            <template #default="scope">
              <el-tag v-for="p in scope.row.matchPolicies" :key="p" type="success" size="small" effect="light">
                {{ p }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="matchScore" label="匹配度" width="100" align="center">
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
      
      <div v-else-if="searchTriggered" class="empty-section">
        <el-empty description="暂无符合条件的居民" />
      </div>
      
      <div v-else class="guide-section">
        <div class="guide-icon">
          <el-icon><Star /></el-icon>
        </div>
        <h3 class="guide-title">AI政策匹配功能</h3>
        <p class="guide-desc">
          选择一个或多个政策类型，系统将自动检索符合条件的居民，<br>
          帮助您快速发现潜在的政策受益人群。
        </p>
        <div class="guide-features">
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>全量居民底册智能筛选</span>
          </div>
          <div class="guide-feature">
            <el-icon><CircleCheck /></el-icon>
            <span>多政策组合匹配</span>
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
        <p class="card-desc">手动录入居民信息，AI一键判定可申报的福利类型与补贴标准</p>
      </div>
      
      <div class="single-tools">
        <el-button size="large" @click="openDescDialog" class="desc-btn">
          <el-icon><EditPen /></el-icon>
          手动描述居民信息
        </el-button>
        <span class="desc-tip">支持文字描述居民情况，AI 自动解析填充表单</span>
      </div>
      
      <div class="form-section">
        <el-form :model="singleForm" label-width="120px">
          <div class="form-row">
            <el-form-item label="姓名" required>
              <el-input 
                v-model="singleForm.name" 
                placeholder="请输入姓名" 
                @blur="fillResidentInfo"
                clearable
              />
            </el-form-item>
            <el-form-item label="性别" required>
              <el-select v-model="singleForm.gender" placeholder="请选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
            <el-form-item label="年龄" required>
              <el-input-number v-model="singleForm.age" :min="0" :max="150" placeholder="请输入年龄" />
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="身份证号">
              <el-input 
                v-model="singleForm.idCard" 
                placeholder="请输入身份证号" 
                @blur="fillResidentInfo"
                clearable
              />
            </el-form-item>
            <el-form-item label="户籍地址">
              <el-input v-model="singleForm.householdRegister" placeholder="如：武昌区" />
            </el-form-item>
            <el-form-item label="婚姻状态">
              <el-select v-model="singleForm.maritalStatus" placeholder="请选择婚姻状态">
                <el-option label="未婚" value="未婚" />
                <el-option label="已婚" value="已婚" />
                <el-option label="离异" value="离异" />
                <el-option label="丧偶" value="丧偶" />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="人均月收入">
              <el-input-number v-model="singleForm.perCapitaIncome" :min="0" placeholder="单位：元" />
              <span style="margin-left: 8px; color: #9ca3af;">元/月</span>
            </el-form-item>
            <el-form-item label="存款金额">
              <el-input-number v-model="singleForm.depositAmount" :min="0" placeholder="单位：元" />
              <span style="margin-left: 8px; color: #9ca3af;">元</span>
            </el-form-item>
            <el-form-item label="房产面积">
              <el-input-number v-model="singleForm.houseArea" :min="0" placeholder="单位：㎡" />
              <span style="margin-left: 8px; color: #9ca3af;">㎡</span>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="车辆信息">
              <el-select v-model="singleForm.carPlate" placeholder="是否有车">
                <el-option label="无" value="无" />
                <el-option label="有" value="有" />
              </el-select>
            </el-form-item>
            <el-form-item label="残疾种类及等级">
              <el-select v-model="singleForm.disabilityLevel" placeholder="请选择残疾种类及等级">
                <el-option label="无" value="" />
                <el-option label="一级" value="一级" />
                <el-option label="二级" value="二级" />
                <el-option label="三级" value="三级" />
                <el-option label="四级" value="四级" />
              </el-select>
            </el-form-item>
            <el-form-item label="生存状态">
              <el-select v-model="singleForm.survivalStatus" placeholder="请选择生存状态">
                <el-option label="在世" value="在世" />
                <el-option label="已去世" value="已去世" />
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="工作单位">
              <el-input v-model="singleForm.workUnit" placeholder="请输入工作单位" />
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="singleForm.contact" placeholder="请输入手机号码" />
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Download, Star, CircleCheck, Plus, MagicStick, Upload, EditPen,
  Sunny, House, Calendar, Bell, Warning as WIcon
} from '@element-plus/icons-vue'

const IconMap = { Sunny, House, Calendar, Bell, Warning: WIcon, User: Star }
import { policyMatchRules, residents } from '../../data/mock'

const activeTab = ref('batch')
const selectedPolicies = ref([])
const searchTriggered = ref(false)
const policyDescText = ref('')
const parsingPolicy = ref(false)

const matchResults = ref([
  { id: '3', name: '王五', gender: '男', age: 75, idCard: '420101195008203456', community: '六角社区', grid: '第三网格', matchPolicies: ['高龄津贴'], matchScore: 95 },
  { id: '2', name: '李四', gender: '男', age: 40, idCard: '420101198505152345', community: '六角社区', grid: '第二网格', matchPolicies: ['重度残疾人护理补贴', '4050灵活就业补贴'], matchScore: 88 },
  { id: '5', name: '钱七', gender: '女', age: 50, idCard: '420101197512125678', community: '六角社区', grid: '第二网格', matchPolicies: ['困难残疾人生活补贴'], matchScore: 85 }
])

const singleResults = ref([])

const singleForm = reactive({
  name: '',
  gender: '',
  age: '',
  idCard: '',
  householdRegister: '',
  maritalStatus: '',
  perCapitaIncome: '',
  depositAmount: '',
  houseArea: '',
  carPlate: '',
  disabilityLevel: '',
  survivalStatus: '',
  workUnit: '',
  contact: ''
})

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
  ElMessage.success(`已选择文件：${file.name}，AI解析中…`)
  setTimeout(() => {
    ElMessage.success(`文件解析完成，共识别 128 条居民数据`)
  }, 1200)
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
  searchTriggered.value = true
  ElMessage.success(`已检索到 ${matchResults.value.length} 位符合条件的居民`)
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
  singleForm.gender = found.gender || singleForm.gender
  singleForm.age = found.age || singleForm.age
  singleForm.idCard = found.idCard || singleForm.idCard
  singleForm.maritalStatus = found.maritalStatus || ''
  singleForm.survivalStatus = found.survivalStatus || '在世'
  singleForm.disabilityLevel = found.disabilityLevel || ''
  singleForm.workUnit = found.workUnit || ''
  singleForm.contact = found.contact || ''
  singleForm.householdRegister = found.comparisonInfo?.householdRegister || found.householdAddress?.replace(/武汉市|区.*/g, '') || ''
  singleForm.perCapitaIncome = found.comparisonInfo?.perCapitaIncome || ''
  singleForm.depositAmount = found.comparisonInfo?.depositAmount || ''
  singleForm.houseArea = found.comparisonInfo?.houseArea || ''
  singleForm.carPlate = (found.comparisonInfo?.carPlate && found.comparisonInfo.carPlate !== '') ? '有' : '无'

  ElMessage.success(`已自动填充「${found.name}」的居民库信息`)
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
    const male = /男/.test(text)
    const female = /女/.test(text)
    const ageMatch = text.match(/(\d{1,3})\s*岁/)
    const age = ageMatch ? parseInt(ageMatch[1]) : ''
    const incomeMatch = text.match(/月?收入[^0-9]{0,4}(\d+)/)
    const income = incomeMatch ? parseInt(incomeMatch[1]) : ''
    const pensionMatch = text.match(/退休金[^0-9]{0,4}(\d+)/)
    const perCapita = pensionMatch ? parseInt(pensionMatch[1]) : income

    Object.keys(singleForm).forEach(k => singleForm[k] = '')
    singleForm.name = text.match(/(居民)?([\u4e00-\u9fa5]{2,4})/)?.[2] || ''
    singleForm.gender = male ? '男' : female ? '女' : ''
    singleForm.age = age
    singleForm.maritalStatus = /离异/.test(text) ? '离异' : /已婚/.test(text) ? '已婚' : /未婚/.test(text) ? '未婚' : /丧偶/.test(text) ? '丧偶' : ''
    singleForm.survivalStatus = '在世'
    singleForm.perCapitaIncome = perCapita
    singleForm.houseArea = /无房/.test(text) ? 0 : ''
    singleForm.carPlate = /无车/.test(text) ? '无' : ''
    const disMatch = text.match(/([一二三四])级残疾/) || text.match(/残疾.*([一二三四])级/)
    const disMap = { 一: '一级', 二: '二级', 三: '三级', 四: '四级' }
    if (disMatch) singleForm.disabilityLevel = disMap[disMatch[1]] || ''

    parsingDesc.value = false
    descDialogVisible.value = false
    ElMessage.success('AI 已解析居民信息并填充表单，请确认')
  }, 1200)
}

const handleSingleMatch = () => {
  searchTriggered.value = true
  singleResults.value = [
    {
      policyName: '低保',
      description: '城乡居民最低生活保障',
      subsidyStandard: '按家庭人口计算，每人每月不超过当地低保标准',
      matchScore: 85,
      matchReason: '人均收入低于500元/月，无房产、无车辆，存款在限额内'
    },
    {
      policyName: '困难残疾人生活补贴',
      description: '为困难残疾人提供生活补贴',
      subsidyStandard: '每人每月80元',
      matchScore: 90,
      matchReason: '持有残疾证，残疾等级为三级，符合困难残疾人认定条件'
    }
  ]
  ElMessage.success(`已匹配到 ${singleResults.value.length} 项政策`)
}

const resetForm = () => {
  Object.keys(singleForm).forEach(key => {
    singleForm[key] = ''
  })
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
  gap: 12px;
  align-items: flex-end;
}

.desc-input-wrap .el-textarea {
  flex: 1;
}

.desc-parse-btn {
  height: auto !important;
  padding: 16px 20px;
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
</style>
