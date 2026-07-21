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
        <el-button @click="handleVerifyAll">批量核实</el-button>
        <el-button type="primary" @click="handleEditResident">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
      </div>
    </div>

    <div class="resident-overview-card">
      <div class="overview-left">
        <el-avatar :size="64" class="resident-avatar">
          {{ resident.name?.charAt(0) || '居' }}
        </el-avatar>
        <div class="overview-info">
          <div class="resident-name-row">
            <h2 class="resident-name">{{ resident.name }}</h2>
            <el-tag :type="getSurvivalType(resident.survivalStatus)" size="small" effect="light">
              {{ resident.survivalStatus }}
            </el-tag>
            <el-tag type="primary" size="small" effect="light" v-if="residentTags.length > 0">
              {{ residentTags.length }} 个标签
            </el-tag>
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
      <div class="overview-right">
        <div class="stat-item">
          <span class="stat-value">{{ residentTags.length }}</span>
          <span class="stat-label">关联标签</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value warning">{{ pendingVerifyCount }}</span>
          <span class="stat-label">待核实</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value success">{{ enjoyingCount }}</span>
          <span class="stat-label">享受中</span>
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
          <span class="info-value">{{ resident.contact }}</span>
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
          <span class="info-label">残疾等级</span>
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
    
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">保障信息</h3>
          <span class="section-desc">该居民关联的所有保障标签及核实详情</span>
        </div>
        <div class="header-actions">
          <span class="tag-count-badge">共 {{ residentTags.length }} 个标签</span>
          <el-button type="primary" size="default" @click="showAddTagDialog = true">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </div>
      </div>
      
      <div v-if="residentTags.length > 0" class="benefit-info-container">
        <div v-for="(group, tagType) in groupedTags" :key="tagType" class="benefit-group">
          <div class="benefit-group-header">
            <el-tag :type="getTagType(tagType)" effect="light" size="small">
              {{ tagType }}
            </el-tag>
            <span class="benefit-group-title">{{ tagType }}</span>
            <span class="benefit-group-count">{{ group.length }}项</span>
          </div>
          <div class="benefit-cards">
            <div v-for="tag in group" :key="tag.id" class="benefit-card">
              <div class="benefit-card-header">
                <span class="benefit-card-title">{{ tag.tagSubType }}</span>
                <el-tag :type="tag.isEnjoy ? 'success' : 'info'" size="small" effect="plain">
                  {{ tag.isEnjoy ? '享受中' : '已停发' }}
                </el-tag>
              </div>
              <div class="benefit-card-body">
                <div class="benefit-row">
                  <span class="benefit-label">生效日期</span>
                  <span class="benefit-value">{{ tag.effectiveDate }}</span>
                </div>
                <div class="benefit-row">
                  <span class="benefit-label">失效日期</span>
                  <span class="benefit-value">{{ tag.expireDate || '长期有效' }}</span>
                </div>
                <div class="benefit-row" v-if="tag.subsidyAmount">
                  <span class="benefit-label">补贴金额</span>
                  <span class="benefit-value highlight">{{ tag.subsidyAmount }}元/月</span>
                </div>
                
                <template v-if="tag.tagType === '低保'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">财产信息</div>
                    <div class="benefit-row">
                      <span class="benefit-label">户籍</span>
                      <span class="benefit-value">{{ tag.householdRegister || '武昌区' }}</span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">人均收入</span>
                      <span class="benefit-value" :class="{ 'warning-highlight': tag.perCapitaIncome > 500 }">
                        {{ tag.perCapitaIncome || 0 }}元/月
                        <span v-if="tag.perCapitaIncome > 500" class="warning-text">（超标准预警）</span>
                      </span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">存款金额</span>
                      <span class="benefit-value">{{ tag.depositAmount || 0 }}元</span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">车辆信息</span>
                      <span class="benefit-value">{{ tag.carPlate || '无' }}</span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">房产面积</span>
                      <span class="benefit-value">{{ tag.houseArea || 0 }}㎡</span>
                    </div>
                  </div>
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">重点比对</div>
                    <div class="benefit-row" v-if="tag.carCheck">
                      <span class="benefit-label">车辆比对</span>
                      <span class="benefit-value">
                        <el-tag :type="tag.carCheck === '是' ? 'success' : 'danger'" size="small">
                          {{ tag.carCheck }}
                        </el-tag>
                        <span v-if="tag.carCheck === '否' && tag.carCheckReason" class="check-reason">{{ tag.carCheckReason }}</span>
                      </span>
                    </div>
                    <div class="benefit-row" v-if="tag.houseCheck">
                      <span class="benefit-label">房产比对</span>
                      <span class="benefit-value">
                        <el-tag :type="tag.houseCheck === '是' ? 'success' : 'danger'" size="small">
                          {{ tag.houseCheck }}
                        </el-tag>
                        <span v-if="tag.houseCheck === '否' && tag.houseCheckReason" class="check-reason">{{ tag.houseCheckReason }}</span>
                      </span>
                    </div>
                    <div class="benefit-row" v-if="tag.depositCheck">
                      <span class="benefit-label">存款比对</span>
                      <span class="benefit-value">
                        <el-tag :type="tag.depositCheck === '是' ? 'success' : 'danger'" size="small">
                          {{ tag.depositCheck }}
                        </el-tag>
                        <span v-if="tag.depositCheck === '否' && tag.depositCheckReason" class="check-reason">{{ tag.depositCheckReason }}</span>
                      </span>
                    </div>
                    <div class="benefit-row" v-if="tag.imprisoned">
                      <span class="benefit-label">服刑状态</span>
                      <span class="benefit-value">
                        <el-tag :type="tag.imprisoned === '否' ? 'success' : 'danger'" size="small">
                          {{ tag.imprisoned === '否' ? '无服刑' : '有服刑' }}
                        </el-tag>
                      </span>
                    </div>
                    <div class="benefit-row" v-if="tag.householdMigration">
                      <span class="benefit-label">户籍迁移</span>
                      <span class="benefit-value">{{ tag.householdMigration }}</span>
                    </div>
                  </div>
                </template>
                
                <template v-else-if="tag.tagType === '残疾'">
                  <div class="benefit-subsection">
                    <div class="benefit-subtitle">残疾信息</div>
                    <div class="benefit-row">
                      <span class="benefit-label">残疾种类</span>
                      <span class="benefit-value">{{ tag.disabilityType || '肢体残疾' }}</span>
                    </div>
                    <div class="benefit-row">
                      <span class="benefit-label">残疾等级</span>
                      <span class="benefit-value highlight">{{ tag.disabilityLevel || '二级' }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.disabilityCard">
                      <span class="benefit-label">残疾证号</span>
                      <span class="benefit-value">{{ tag.disabilityCard }}</span>
                    </div>
                    <div class="benefit-row" v-if="tag.cardExpireDate">
                      <span class="benefit-label">证件有效期</span>
                      <span class="benefit-value">{{ tag.cardExpireDate }}</span>
                    </div>
                  </div>
                  <div class="benefit-subsection" v-if="tag.mutexNote">
                    <div class="benefit-subtitle">互斥说明</div>
                    <div class="benefit-row warning">
                      <span class="benefit-label">注意</span>
                      <span class="benefit-value">{{ tag.mutexNote }}</span>
                    </div>
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
              <div class="benefit-card-footer">
                <div class="footer-info">
                  <span class="info-text">{{ tag.operator || '网格员' }} | {{ tag.createTime }}</span>
                </div>
                <div class="footer-actions">
                  <el-button size="small" type="primary" @click="handleVerify(tag)">
                    <el-icon><Check /></el-icon>核实
                  </el-button>
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
    
    <div class="content-card section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h3 class="section-title">操作记录</h3>
          <span class="section-desc">该居民信息的操作历史</span>
        </div>
      </div>
      <el-table :data="operationHistory" stripe :header-cell-style="{ background: '#fafafa', color: '#666', fontWeight: 500 }">
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
        <el-form-item label="生效日期">
          <el-date-picker v-model="tagForm.effectiveDate" type="date" />
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
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Check, Delete, User, Place } from '@element-plus/icons-vue'
import { residents, tags, tagTypes, tagSubTypes } from '../../data/mock'

const router = useRouter()
const route = useRoute()

const residentId = route.params.id
const resident = ref(residents.find(r => r.id === residentId) || {})

const showAddTagDialog = ref(false)
const showFamilyMembers = ref(false)
const activeTagNames = ref([])

const residentTags = computed(() => tags.filter(t => t.residentId === residentId))

const groupedTags = computed(() => {
  const groups = {}
  residentTags.value.forEach(tag => {
    if (!groups[tag.tagType]) {
      groups[tag.tagType] = []
    }
    groups[tag.tagType].push(tag)
  })
  return groups
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
  effectiveDate: '',
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

const onTagTypeChange = () => {
  tagForm.tagSubType = ''
}

const handleVerify = (tag) => {
  ElMessage.info(`开始核实 ${tag.tagType} - ${tag.tagSubType} 标签`)
}

const editTag = (tag) => {
  tagForm.tagType = tag.tagType
  tagForm.tagSubType = tag.tagSubType
  tagForm.effectiveDate = tag.effectiveDate
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
.detail-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.resident-overview-card {
  background: linear-gradient(135deg, #1890FF 0%, #0ea5e9 100%);
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  min-height: 120px;
  box-sizing: border-box;
}

.overview-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.resident-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.resident-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resident-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #fff;
  line-height: 1.3;
}

.resident-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
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
  gap: 24px;
  flex-shrink: 0;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 56px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.stat-value.warning {
  color: #fde047;
}

.stat-value.success {
  color: #86efac;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #1890FF, #0ea5e9);
  border-radius: 2px;
}

.section-desc {
  font-size: 12px;
  color: #9ca3af;
  padding-left: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-count-badge {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 12px;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.info-item {
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  line-height: 1.4;
}

.family-count-tag {
  cursor: pointer;
}

.family-count-tag:hover {
  opacity: 0.85;
}

.benefit-info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-group {
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
}

.benefit-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.benefit-group-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.benefit-group-count {
  font-size: 12px;
  color: #9ca3af;
  background: #fff;
  padding: 2px 8px;
  border-radius: 10px;
}

.benefit-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.benefit-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.benefit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.benefit-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.benefit-card-body {
  padding: 14px;
}

.benefit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.benefit-label {
  font-size: 12px;
  color: #6b7280;
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
  color: #ef4444;
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
  border-top: 1px dashed #e5e7eb;
}

.benefit-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #1890FF;
  margin-bottom: 8px;
  padding-left: 6px;
  border-left: 2px solid #1890FF;
}

.benefit-row.warning {
  background: #fffbe6;
  padding: 8px;
  border-radius: 4px;
  margin: 4px 0;
}

.check-reason {
  margin-left: 6px;
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
}

.benefit-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.footer-info {
  font-size: 11px;
  color: #9ca3af;
}

.info-text {
  font-size: 11px;
}

.footer-actions {
  display: flex;
  gap: 6px;
}

.empty-tags {
  padding: 40px 20px;
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
  border-bottom: 1px solid #f3f4f6;
}

.family-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.family-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 13px;
}
</style>