<template>
  <div class="page-container">
    <div class="detail-page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回列表">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>返回列表</span>
        </button>
      </div>
      <div class="header-actions">
        <el-button @click="handleVerifyAll">批量刷新</el-button>
        <el-button type="primary" @click="handleEditResident">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
      </div>
    </div>

    <div class="resident-overview-card">
      <div class="overview-left">
        <div class="overview-info">
          <div class="resident-name-row">
            <h2 class="resident-name">{{ resident.name }}</h2>
          </div>
          <div class="resident-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ resident.idCard }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <span class="meta-icon-text">📱</span>
              {{ resident.contact }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <el-icon><Place /></el-icon>
              {{ resident.community }} · {{ resident.estate }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">基础信息</h3>
          <span class="section-desc">居民个人及家庭基本资料</span>
        </div>
      </div>
      
      <div class="basic-info-grid">
        <div class="info-item">
          <span class="info-label">姓名</span>
          <span class="info-value">{{ resident.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">性别</span>
          <span class="info-value">{{ resident.gender }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">出生日期</span>
          <span class="info-value">{{ resident.birthDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">年龄</span>
          <span class="info-value">{{ resident.age }}岁</span>
        </div>
        <div class="info-item">
          <span class="info-label">身份证号</span>
          <span class="info-value">{{ resident.idCard }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">联系方式</span>
          <span class="info-value">{{ resident.contact }}<span v-if="resident.emergencyPhone" class="sub-info">&nbsp;/ 紧急：{{ resident.emergencyContact }} {{ resident.emergencyPhone }}</span></span>
        </div>
        <div class="info-item">
          <span class="info-label">政治面貌</span>
          <span class="info-value">{{ resident.politicalStatus }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">文化程度</span>
          <span class="info-value">{{ resident.education }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">婚姻状态</span>
          <span class="info-value">{{ resident.maritalStatus }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">人员类别</span>
          <span class="info-value">{{ resident.personType }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">残疾种类及等级</span>
          <span class="info-value">{{ resident.disabilityLevel || '无' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">家庭人口数</span>
          <span class="info-value">
            <el-tag type="primary" size="small" class="family-count-tag" @click="showFamilyMembers = true">
              {{ resident.familyCount || 0 }}人
            </el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">所属社区</span>
          <span class="info-value">{{ resident.community }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所在小区</span>
          <span class="info-value">{{ resident.estate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所属网格</span>
          <span class="info-value">{{ resident.grid }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">工作单位</span>
          <span class="info-value">{{ resident.workUnit || '无' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">重症疾病</span>
          <span class="info-value">{{ resident.severeDisease || '无' }}</span>
        </div>
        <div class="info-item full-width">
          <span class="info-label">户籍地址</span>
          <span class="info-value">{{ resident.householdAddress }}</span>
        </div>
        <div class="info-item full-width">
          <span class="info-label">居住地址</span>
          <span class="info-value">{{ resident.residenceAddress }}</span>
        </div>
      </div>
    </div>
    
    <div class="content-card section-card" :class="{ 'collapsed': !activeTagType }">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">保障信息</h3>
          <span class="section-desc">该居民关联的所有保障标签及核实详情</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="default" @click="showAddTagDialog = true">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </div>
      </div>
      
      <div v-if="residentTags.length > 0" class="benefit-info-container">
        <div class="benefit-tag-tabs">
          <div
            v-for="(group, tagType) in groupedTags"
            :key="tagType"
            :id="'tag-group-' + tagType"
            class="benefit-tab-item"
            :class="{ active: activeTagType === tagType }"
            @click="toggleTagType(tagType)">
            <el-tag :type="getTagType(tagType)" effect="light" size="small">
              {{ tagType }}
            </el-tag>
            <span class="tab-label">{{ tagType }}</span>
            <span class="tab-count">{{ group.length }}项</span>
            <el-icon class="tab-arrow" :class="{ expanded: activeTagType === tagType }">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
        
        <div v-for="(group, tagType) in groupedTags" :key="'content-' + tagType" v-show="activeTagType === tagType" class="benefit-group-content">
          <div v-if="tagType === '残疾' && disabilityGroupInfo.length > 0" class="group-base-info">
            <div class="benefit-subtitle group-info-subtitle">残疾信息</div>
            <div class="group-info-compact">
              <div class="benefit-row">
                <span class="benefit-label">残疾种类等级</span>
                <span class="benefit-value highlight">{{ disabilityTypesDisplay }}</span>
              </div>
              <div class="benefit-row" v-if="disabilityCardsDisplay">
                <span class="benefit-label">残疾证号</span>
                <span class="benefit-value">{{ disabilityCardsDisplay }}</span>
              </div>
            </div>
          </div>
          <div class="benefit-block-list">
            <div v-for="tag in group" :key="tag.id" :id="'tag-card-' + tag.id" class="benefit-block">
              <div class="benefit-block-header">
                <span class="benefit-block-title">{{ tag.tagSubType }}</span>
                <el-tag :type="tag.isEnjoy ? 'success' : 'info'" size="small" effect="plain">
                  {{ tag.isEnjoy ? '享受中' : '已停发' }}
                </el-tag>
              </div>
              <div class="benefit-block-body">
                <div class="benefit-row">
                  <span class="benefit-label">失效日期</span>
                  <span class="benefit-value">{{ tag.expireDate || '长期有效' }}</span>
                </div>
                <div class="benefit-row" v-if="tag.subsidyAmount">
                  <span class="benefit-label">补贴金额</span>
                  <span class="benefit-value highlight">{{ tag.subsidyAmount }}元/月</span>
                </div>
                
                <template v-if="tag.tagType === '低保'"></template>
                
                <template v-else-if="tag.tagType === '残疾'">
                  <div class="benefit-row" v-if="tag.mutexNote">
                    <span class="benefit-label">互斥说明</span>
                    <span class="benefit-value warning-highlight">{{ tag.mutexNote }}</span>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '公租房'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">配租信息</div>
                    <div class="benefit-row" v-if="tag.allocationType">
                      <span class="benefit-label">配租类型</span>
                      <span class="benefit-value">{{ tag.allocationType }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.houseAddress">
                      <span class="benefit-label">房屋地址</span>
                      <span class="benefit-value">{{ tag.houseAddress }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.rent">
                      <span class="benefit-label">租金</span>
                      <span class="benefit-value">{{ tag.rent }}元/月</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '老年'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">老年信息</div>
                    <div class="benefit-row">
                      <span class="benefit-label">年龄</span>
                      <span class="benefit-value highlight">{{ tag.age || resident.age }}岁</span>
                    </div>
                    <div class="benefit-row" v-if="tag.subsidyLevel">
                      <span class="benefit-label">津贴档次</span>
                      <span class="benefit-value">{{ tag.subsidyLevel }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.serviceOrg">
                      <span class="benefit-label">服务机构</span>
                      <span class="benefit-value">{{ tag.serviceOrg }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '计生'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">计生信息</div>
                    <div class="benefit-row" v-if="tag.childInfo">
                      <span class="benefit-label">子女情况</span>
                      <span class="benefit-value">{{ tag.childInfo }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.childAge">
                      <span class="benefit-label">子女年龄</span>
                      <span class="benefit-value">{{ tag.childAge }}周岁</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '社保'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">社保信息</div>
                    <div class="benefit-row">
                      <span class="benefit-label">户籍</span>
                      <span class="benefit-value">{{ tag.householdRegister || '武昌区' }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.totalMonths">
                      <span class="benefit-label">累计享受月数</span>
                      <span class="benefit-value">{{ tag.totalMonths }}个月</span>
                    </div>
                    <div class="benefit-row" v-if="tag.nextApplyDate">
                      <span class="benefit-label">下次申报时间</span>
                      <span class="benefit-value">{{ tag.nextApplyDate }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '困境儿童'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">儿童信息</div>
                    <div class="benefit-row">
                      <span class="benefit-label">户籍</span>
                      <span class="benefit-value">{{ tag.householdRegister || '武昌区' }}</span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">年龄</span>
                      <span class="benefit-value highlight">{{ tag.age || 0 }}岁</span>
                    </div>
                    <div class="benefit-row" v-if="tag.parentsStatus">
                      <span class="benefit-label">父母情况</span>
                      <span class="benefit-value">{{ tag.parentsStatus }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '涉军'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">涉军信息</div>
                    <div class="benefit-row" v-if="tag.deathInfo">
                      <span class="benefit-label">生存状态</span>
                      <span class="benefit-value">{{ tag.deathInfo }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.householdMigration">
                      <span class="benefit-label">户籍迁移</span>
                      <span class="benefit-value">{{ tag.householdMigration }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '重症'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">重症信息</div>
                    <div class="benefit-row" v-if="tag.severeData">
                      <span class="benefit-label">重症类型</span>
                      <span class="benefit-value">{{ tag.severeData }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '支农返汉'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">支农返汉</div>
                    <div class="benefit-row" v-if="tag.fixedPerson">
                      <span class="benefit-label">固定人员</span>
                      <span class="benefit-value">{{ tag.fixedPerson }}</span>
                    </div>
                  </div>
                </template>
              </div>
              <div class="benefit-block-footer">
                <div class="footer-info">
                  <span class="info-text">{{ tag.operator || '网格员' }} | {{ tag.createTime }}</span>
                </div>
                <div class="footer-actions">
                  <el-button size="small" @click="editTag(tag)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-tags">
        <el-empty description="暂无保障标签信息，点击右上角添加标签">
          <el-button type="primary" @click="showAddTagDialog = true">添加标签</el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 比对信息 -->
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">比对信息</h3>
          <span class="section-desc">多源数据全量核查结果，用于发现潜在问题线索</span>
        </div>
      </div>
      <el-table :data="comparisonTableData" stripe style="width: 100%" size="small" :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 600 }">
        <el-table-column prop="name" label="核查项" width="110">
          <template #default="scope">
            <span style="font-weight: 500;">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="数据内容" min-width="280">
          <template #default="scope">
            <span>{{ scope.row.value }}</span>
            <span v-if="scope.row.extra" class="text-muted">{{ scope.row.extra }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后一次更新时间" width="170">
        </el-table-column>
      </el-table>
    </div>

    <!-- 操作记录 -->
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">操作记录</h3>
          <span class="section-desc">该居民信息的操作历史</span>
        </div>
      </div>
      <el-table :data="operationHistory" stripe size="small" :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="action" label="操作类型" width="120">
          <template #default="scope">
            <el-tag size="small" :type="getActionType(scope.row.action)" effect="light">
              {{ scope.row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容" />
      </el-table>
    </div>
    
    <el-dialog title="添加标签" v-model="showAddTagDialog" width="500px">
      <el-form :model="tagForm" label-width="100px">
        <el-form-item label="标签类型">
          <el-select v-model="tagForm.tagType" @change="onTagTypeChange">
            <el-option v-for="t in tagTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="子类型">
          <el-select v-model="tagForm.tagSubType">
            <el-option v-for="s in currentSubTypes" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="失效日期">
          <el-date-picker v-model="tagForm.expireDate" type="date" />
        </el-form-item>
        <el-form-item label="是否享受">
          <el-switch v-model="tagForm.isEnjoy" />
        </el-form-item>
        <el-form-item label="补贴金额">
          <el-input v-model.number="tagForm.subsidyAmount" suffix="元" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddTag">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="家庭成员" v-model="showFamilyMembers" width="560px">
      <div class="family-members-content">
        <div class="family-header">
          <span class="family-title">户主：{{ resident.name }}</span>
          <el-tag type="info" size="small">共 {{ resident.familyMembers?.length || 0 }} 人</el-tag>
        </div>
        <el-table :data="resident.familyMembers || []" stripe size="small" :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="relation" label="与户主关系" width="100" />
          <el-table-column prop="idCard" label="身份证号" width="170" />
          <el-table-column prop="gender" label="性别" width="60" align="center" />
          <el-table-column prop="age" label="年龄" width="60" align="center" />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '在世' ? 'success' : 'info'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!resident.familyMembers || resident.familyMembers.length === 0" class="family-empty">
          暂无家庭成员信息
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Check, Refresh, Delete, User, Place, ArrowDown } from '@element-plus/icons-vue'
import { residents, tags, tagTypes, tagSubTypes } from '../../data/mock'

const router = useRouter()
const route = useRoute()

const residentId = route.params.id
const resident = ref(residents.find(r => r.id === residentId) || {})

const showAddTagDialog = ref(false)
const showFamilyMembers = ref(false)
const activeTagType = ref('')

const residentTags = computed(() => tags.filter(t => t.residentId === residentId))

// 比对信息表格
const comparisonTableData = computed(() => {
  const ci = resident.value?.comparisonInfo || {}
  const rows = [
    {
      name: '户籍',
      value: ci.householdRegister || resident.value?.community || '—',
      extra: ci.householdAbnormal ? '户籍已迁出' : '',
      status: ci.householdAbnormal ? 'abnormal' : 'normal',
      updateTime: ci.householdUpdateTime || '2024-06-20 10:30'
    },
    {
      name: '生存状态',
      value: resident.value?.survivalStatus || '—',
      extra: resident.value?.survivalStatus === '已去世' ? '与公安部门比对' : '',
      status: resident.value?.survivalStatus === '已去世' ? 'abnormal' : 'normal',
      updateTime: ci.survivalUpdateTime || '2024-06-20 10:30'
    },
    {
      name: '婚姻状态',
      value: resident.value?.maritalStatus || '—',
      extra: '',
      status: 'normal',
      updateTime: ci.marriageUpdateTime || '2024-06-20 10:30'
    },
    {
      name: '社保信息',
      value: ci.socialSecurity || '正常缴费',
      extra: ci.socialSecurityBase ? `缴费基数 ${ci.socialSecurityBase} 元` : '',
      status: ci.socialSecurityAbnormal ? 'abnormal' : 'normal',
      updateTime: ci.socialSecurityUpdateTime || '2024-06-15 09:00'
    },
    {
      name: '纳税信息',
      value: ci.taxInfo || '无个税缴纳记录',
      extra: ci.taxAmount ? `纳税 ${ci.taxAmount} 元/年` : '',
      status: ci.taxCheck === '否' ? 'abnormal' : 'normal',
      updateTime: ci.taxUpdateTime || '2024-06-01 00:00'
    },
    {
      name: '房产情况',
      value: ci.houseArea ? `房产面积 ${ci.houseArea}㎡` : '无自购房产',
      extra: ci.houseStatus || '',
      status: ci.houseCheck === '否' ? 'abnormal' : 'normal',
      updateTime: ci.houseUpdateTime || '2024-05-10 14:20'
    },
    {
      name: '车辆信息',
      value: ci.carPlate || (ci.carInfo || '无'),
      extra: ci.carModel || '',
      status: ci.carCheck === '否' ? 'abnormal' : 'normal',
      updateTime: ci.carUpdateTime || '2024-06-20 10:30'
    },
    {
      name: '工商注册',
      value: ci.companyStatus || '名下无工商登记',
      extra: '',
      status: ci.companyCheck === '否' ? 'abnormal' : 'normal',
      updateTime: ci.companyUpdateTime || '2024-06-18 16:00'
    },
    {
      name: '服刑状态',
      value: ci.imprisoned === '否' ? '无服刑记录' : '在服刑',
      extra: '',
      status: ci.imprisoned !== '否' ? 'abnormal' : 'normal',
      updateTime: ci.imprisonedUpdateTime || '2024-06-20 10:30'
    }
  ]
  return rows
})

const allowedTagTypes = ['低保', '残疾', '公租房']

const groupedTags = computed(() => {
  const groups = {}
  residentTags.value.forEach(tag => {
    if (!allowedTagTypes.includes(tag.tagType)) return
    if (!groups[tag.tagType]) {
      groups[tag.tagType] = []
    }
    groups[tag.tagType].push(tag)
  })
  return groups
})

const disabilityGroupInfo = computed(() => {
  const disabilityTags = residentTags.value.filter(t => t.tagType === '残疾')
  if (disabilityTags.length === 0) return []
  const seen = new Set()
  const list = []
  disabilityTags.forEach(t => {
    const key = `${t.disabilityType}-${t.disabilityLevel}-${t.disabilityCard}`
    if (!seen.has(key)) {
      seen.add(key)
      list.push({
        disabilityType: t.disabilityType,
        disabilityLevel: t.disabilityLevel,
        disabilityCard: t.disabilityCard
      })
    }
  })
  return list
})

const disabilityTypesDisplay = computed(() => {
  const types = disabilityGroupInfo.value
    .map(i => i.disabilityType && i.disabilityLevel ? `${i.disabilityType.replace('残疾', '')}${i.disabilityLevel}` : '')
    .filter(v => v)
  return [...new Set(types)].join('、')
})

const disabilityCardsDisplay = computed(() => {
  const cards = disabilityGroupInfo.value
    .map(i => i.disabilityCard)
    .filter(v => v)
  return [...new Set(cards)].join('、')
})

const pendingVerifyCount = computed(() => {
  return residentTags.value.filter(t => !t.lastCheckDate).length
})

const enjoyingCount = computed(() => {
  return residentTags.value.filter(t => t.isEnjoy).length
})

const getActionType = (action) => {
  const map = { '创建': 'success', '修改': 'warning', '添加': 'primary', '删除': 'danger' }
  return map[action] || 'info'
}

const handleVerifyAll = () => {
  ElMessage.info('批量核实功能开发中')
}

const handleEditResident = () => {
  ElMessage.info('编辑居民信息功能开发中')
}

const tagForm = reactive({
  tagType: '',
  tagSubType: '',
  expireDate: '',
  isEnjoy: true,
  subsidyAmount: ''
})

const currentSubTypes = computed(() => {
  return tagSubTypes[tagForm.tagType] || []
})

const operationHistory = ref([
  { time: '2024-06-20 10:30', operator: 'admin', action: '修改', content: '更新联系方式' },
  { time: '2024-06-15 14:20', operator: 'admin', action: '添加', content: '添加低保标签' },
  { time: '2024-02-20 09:00', operator: 'admin', action: '创建', content: '创建居民信息' }
])

const getSurvivalType = (status) => {
  const map = { '在世': 'success', '已去世': 'danger', '待核实': 'warning' }
  return map[status] || 'info'
}

const getTagType = (type) => {
  const map = {
    '低保': 'danger', '残疾': 'warning', '公租房': 'info',
    '老年': 'success', '计生': 'primary', '社保': 'primary',
    '重症': 'danger', '涉军': 'danger', '支农返汉': 'info', '困境儿童': 'warning'
  }
  return map[type] || 'info'
}

const goBack = () => {
  router.push('/resident')
}

const scrollToTagGroup = (tagType) => {
  activeTagType.value = tagType
  setTimeout(() => {
    const el = document.getElementById('tag-group-' + tagType)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 50)
}

const scrollToTagCard = (tagId) => {
  const tag = residentTags.value.find(t => t.id === tagId)
  if (tag) {
    activeTagType.value = tag.tagType
  }
  setTimeout(() => {
    const el = document.getElementById('tag-card-' + tagId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 50)
}

const toggleTagType = (tagType) => {
  activeTagType.value = activeTagType.value === tagType ? '' : tagType
}

watch(groupedTags, (groups) => {
  const types = Object.keys(groups)
  if (types.length > 0 && !activeTagType.value) {
    activeTagType.value = types[0]
  }
}, { immediate: true })

const onTagTypeChange = () => {
  tagForm.tagSubType = ''
}

const handleVerify = (tag) => {
  ElMessage.info(`开始核实 ${tag.tagType} - ${tag.tagSubType} 标签`)
}

const editTag = (tag) => {
  tagForm.tagType = tag.tagType
  tagForm.tagSubType = tag.tagSubType
  tagForm.expireDate = tag.expireDate
  tagForm.isEnjoy = tag.isEnjoy
  tagForm.subsidyAmount = tag.subsidyAmount
  showAddTagDialog.value = true
}

const deleteTag = (id) => {
  ElMessageBox.confirm('确定要删除该标签吗？删除后不可恢复。', '删除确认', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleAddTag = () => {
  showAddTagDialog.value = false
  ElMessage.success('添加成功')
}
</script>

<style scoped>
/* 全局紧凑样式 */
.content-card {
  padding: 8px 12px !important;
}

.detail-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #64748b;
  font-size: 12px;
  background: none;
  border: none;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.resident-overview-card {
  background: #1e40af;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 1px 3px rgba(30, 64, 175, 0.15);
  min-height: 56px;
  box-sizing: border-box;
}

.overview-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.resident-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.resident-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.resident-name {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: #fff;
  line-height: 1.2;
}

.resident-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.meta-icon-text {
  font-size: 14px;
  line-height: 1;
}

.meta-divider {
  color: rgba(255, 255, 255, 0.4);
}

.overview-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.tag-quick-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 320px;
}

.quick-nav-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.quick-nav-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quick-nav-tag {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.quick-nav-tag:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 48px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}

.stat-value.warning {
  color: #fef08a;
}

.stat-value.success {
  color: #bfdbfe;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.section-card {
  margin-bottom: 6px;
}

.section-card.collapsed .section-header {
  padding-bottom: 4px;
  margin-bottom: 4px;
}

.section-card.collapsed .benefit-info-container {
  gap: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  margin-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  position: relative;
}

.section-desc {
  font-size: 11px;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-count-badge {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 9px;
  border-radius: 4px;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.info-item {
  padding: 3px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 11px;
  color: #64748b;
  display: block;
  margin-bottom: 1px;
  font-weight: 500;
}

.info-value {
  font-size: 12px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.2;
}

.sub-info {
  color: #64748b;
  font-weight: 400;
  font-size: 12px;
}

.text-danger { color: #b91c1c; }
.text-bold { font-weight: 600; }
.text-muted { color: #94a3b8; margin-left: 6px; font-size: 12px; }

.family-count-tag {
  cursor: pointer;
}

.family-count-tag:hover {
  opacity: 0.85;
}

.benefit-info-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.benefit-tag-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 1px 0;
}

.benefit-tab-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.benefit-tab-item:hover {
  border-color: #1e40af;
  color: #1e40af;
}

.benefit-tab-item.active {
  background: #1e40af;
  border-color: #1e40af;
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.benefit-tab-item:hover .tab-label {
  color: #1e40af;
}

.benefit-tab-item.active .tab-label {
  color: #fff;
}

.tab-count {
  font-size: 12px;
  color: #64748b;
}

.benefit-tab-item.active .tab-count {
  color: rgba(255, 255, 255, 0.85);
}

.tab-arrow {
  font-size: 12px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.benefit-tab-item.active .tab-arrow {
  color: #fff;
}

.tab-arrow.expanded {
  transform: rotate(180deg);
}

.benefit-group-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.group-base-info {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  padding: 7px 12px;
  margin-bottom: 7px;
}

.group-info-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  padding-left: 7px;
  border-left: 3px solid #1e40af;
  margin-bottom: 4px;
}

.group-info-compact {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.benefit-block-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.benefit-block {
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  padding: 5px 10px;
}

.benefit-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid #e2e8f0;
}

.benefit-block-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.benefit-block-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px 16px;
}

.benefit-block-body .benefit-subsection {
  grid-column: 1 / -1;
  margin-top: 4px;
  padding-top: 5px;
}

.benefit-block-body .benefit-subsection + .benefit-subsection {
  margin-top: 2px;
}

.benefit-block-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  padding-top: 5px;
  border-top: 1px solid #e2e8f0;
}

.benefit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.benefit-label {
  font-size: 12px;
  color: #64748b;
  min-width: 80px;
}

.benefit-value {
  font-size: 12px;
  color: #1f2937;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.benefit-value.highlight {
  color: #b91c1c;
  font-weight: 600;
}

.benefit-value.warning-highlight {
  color: #d97706;
  font-weight: 600;
}

.warning-text {
  color: #d97706;
  font-size: 11px;
  margin-left: 4px;
}

.benefit-subsection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.benefit-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  padding-left: 6px;
  border-left: 2px solid #1e40af;
}

.benefit-row.warning {
  background: #fffbeb;
  padding: 8px;
  border-radius: 4px;
  margin: 4px 0;
}

.check-reason {
  margin-left: 6px;
  font-size: 11px;
  color: #b91c1c;
  font-weight: 500;
}

.comparison-container {
  padding: 8px 0;
}

.comparison-subsection {
  margin-bottom: 24px;
}

.comparison-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #1e40af;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
  padding: 0 16px;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comparison-label {
  font-size: 12px;
  color: #94a3b8;
}

.comparison-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
}

.comparison-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 4px;
}

.benefit-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-info {
  font-size: 11px;
  color: #94a3b8;
}

.info-text {
  font-size: 11px;
}

.footer-actions {
  display: flex;
  gap: 6px;
}

/* 压缩 el-table 行高 */
:deep(.el-table--small .el-table__cell) {
  padding: 4px 0;
}
:deep(.el-table .cell) {
  line-height: 1.4;
}

.empty-tags {
  padding: 30px 20px;
}

.family-members-content {
  padding: 8px 0;
}

.family-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.family-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.family-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 13px;
}

/* 全局紧凑表格样式 */
:deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
}
:deep(.el-table .el-table__header th) {
  padding: 6px 0;
}
:deep(.el-table .el-table__body td) {
  padding: 5px 0;
}
:deep(.el-table--small .el-table__header th) {
  padding: 4px 0;
}
:deep(.el-table--small .el-table__body td) {
  padding: 3px 0;
}
</style>
