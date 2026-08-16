<template>
  <div class="layout-container">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="40" height="40" rx="8" fill="#1890FF"/>
            <path d="M14 16H20V22H14V16ZM14 26H28V30H14V26Z" fill="white"/>
          </svg>
        </div>
        <span v-if="!sidebarCollapsed" class="logo-text">智汇亭</span>
      </div>
      
      <el-menu 
        :default-active="activeMenu" 
        class="sidebar-menu"
        background-color="#0f172a"
        text-color="#94a3b8"
        active-text-color="#ffffff"
        router
        :collapse="sidebarCollapsed"
      >
        <el-menu-item index="/dashboard">
          <template #icon>
            <el-icon><DataBoard /></el-icon>
          </template>
          <span>首页仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="resident">
          <template #title>
            <el-icon><User /></el-icon>
            <span>居民信息管理</span>
          </template>
          <el-menu-item index="/resident">居民列表</el-menu-item>
          <el-menu-item index="/resident/history">历史居民</el-menu-item>
          <el-menu-item index="/import">数据导入</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="warning">
          <template #title>
            <el-icon><Bell /></el-icon>
            <span>核查管理</span>
          </template>
          <el-menu-item index="/warning">核查列表</el-menu-item>
          <el-menu-item index="/task/check">核查历史</el-menu-item>
          <el-menu-item index="/warning/config">规则配置</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/ai-match">
          <template #icon>
            <el-icon><Star /></el-icon>
          </template>
          <span>政策匹配</span>
        </el-menu-item>

        <el-menu-item index="/task/visit">
          <template #icon>
            <el-icon><Tickets /></el-icon>
          </template>
          <span>走访任务</span>
        </el-menu-item>

        <el-sub-menu index="report">
          <template #title>
            <el-icon><PieChart /></el-icon>
            <span>统计报表</span>
          </template>
          <el-menu-item index="/report">数据汇总</el-menu-item>
          <el-menu-item index="/report/task">任务统计报表</el-menu-item>
          <el-menu-item index="/report/community">社区工作统计报表</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>
    
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar" aria-label="切换侧边栏">
            <el-icon :size="18">
              <Menu v-if="!sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </button>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleMessageCommand">
            <div class="message-item warning-item">
              <el-icon :size="16" class="msg-icon"><Warning /></el-icon>
              <span class="msg-text">待核查</span>
              <el-badge :value="pendingWarningCount" :hidden="pendingWarningCount === 0" class="msg-badge" />
            </div>
            <template #dropdown>
              <el-dropdown-menu class="msg-dropdown">
                <div class="dropdown-header">
                  <span>待核查消息</span>
                  <span class="header-count">共 {{ pendingWarningCount }} 条未处理</span>
                </div>
                <el-dropdown-item v-for="w in recentWarnings" :key="w.id" :command="'warning:' + w.id">
                  <div class="msg-dropdown-item">
                    <div class="msg-item-title">{{ w.residentName }} - {{ w.warningType }}</div>
                    <div class="msg-item-desc">{{ w.content }}</div>
                    <div class="msg-item-time">{{ w.createTime }}</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="viewAllWarnings" class="view-all">
                  查看全部待核查
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <el-dropdown trigger="click" @command="handleMessageCommand">
            <div class="message-item notify-item">
              <el-icon :size="16" class="msg-icon"><Bell /></el-icon>
              <span class="msg-text">通知</span>
              <el-badge :value="notifications.length" :hidden="notifications.length === 0" class="msg-badge" />
            </div>
            <template #dropdown>
              <el-dropdown-menu class="msg-dropdown">
                <div class="dropdown-header">
                  <span>通知公告</span>
                  <span class="header-count">街道下发工作任务</span>
                </div>
                <el-dropdown-item v-for="n in notifications" :key="n.id" :command="'notify:' + n.id">
                  <div class="msg-dropdown-item">
                    <div class="msg-item-title" :class="{ important: n.important }">
                      <el-tag v-if="n.important" size="small" type="danger">重要</el-tag>
                      {{ n.title }}
                    </div>
                    <div class="msg-item-desc">{{ n.content }}</div>
                    <div class="msg-item-footer">
                      <span class="msg-item-from">{{ n.from }}</span>
                      <span class="msg-item-time">{{ n.createTime }}</span>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="viewAllNotifies" class="view-all">
                  查看全部通知
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar" aria-hidden="true">
              {{ userInfo.username?.charAt(0) || 'A' }}
            </el-avatar>
            <div class="user-detail">
              <span class="user-name">{{ userInfo.username || 'admin' }}</span>
              <span class="user-role">管理员</span>
            </div>
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button text class="dropdown-btn" aria-label="用户菜单" aria-haspopup="true">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </header>
      
      <main class="content-area">
        <router-view />
      </main>
    </div>
    
    <AiAssistant />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  DataBoard, User, Upload, Warning, PieChart,
  Menu, Expand, Bell, ArrowDown, UserFilled, Star, Tickets 
} from '@element-plus/icons-vue'
import { warnings } from '../data/mock'
import AiAssistant from '../components/AIAssistant.vue'


const router = useRouter()
const route = useRoute()

const sidebarCollapsed = ref(false)

const userInfo = ref(JSON.parse(sessionStorage.getItem('user') || '{"username":"admin"}'))

const pendingWarningCount = computed(() => warnings.filter(w => w.status === '待处理').length)
const recentWarnings = computed(() => warnings.filter(w => w.status === '待处理').slice(0, 3))

const notifications = ref([
  {
    id: 'n1',
    title: '关于开展2024年度低保年审工作的通知',
    content: '请各社区于7月30日前完成辖区内低保对象年审资料收集工作',
    from: '六角亭街道办事处',
    important: true,
    createTime: '2024-06-20 09:00'
  },
  {
    id: 'n2',
    title: '残疾人两项补贴发放提醒',
    content: '本月残疾人两项补贴将于6月25日发放，请及时核对发放名单',
    from: '街道民政办',
    important: false,
    createTime: '2024-06-19 14:30'
  },
  {
    id: 'n3',
    title: '高龄津贴资格认证通知',
    content: '请通知辖区内80岁以上老人完成本年度高龄津贴资格认证',
    from: '街道民政办',
    important: false,
    createTime: '2024-06-18 10:15'
  }
])

const activeMenu = computed(() => route.path)

const titleMap = {
  '/dashboard': '仪表盘',
  '/resident': '居民列表',
  '/resident/history': '历史居民',
  '/resident/detail': '居民详情',
  '/import': '数据导入',
  '/warning': '核查列表',
  '/warning/config': '规则配置',
  '/ai-match': '政策匹配',
  '/task/visit': '走访任务',
  '/task/check': '核查历史',
  '/report': '数据汇总',
  '/report/task': '任务统计报表',
  '/report/community': '社区工作统计报表'
}

const currentTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/resident/detail')) return '居民详情'
  return titleMap[path] || ''
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMessageCommand = (command) => {
  if (command === 'viewAllWarnings' || command.startsWith('warning:')) {
    router.push('/warning')
  } else if (command === 'viewAllNotifies' || command.startsWith('notify:')) {
    router.push('/warning')
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定退出',
      cancelButtonText: '取消'
    }).then(() => {
      sessionStorage.removeItem('user')
      router.push('/login')
    }).catch(() => {})
  } else if (command === 'profile') {
    // 个人中心
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #eef2f7;
}

/* ============ 侧边栏 ============ */
.sidebar {
  width: 230px;
  background: linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 4px 0 24px rgba(15, 23, 42, 0.12);
  z-index: 10;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: 64px;
  flex-shrink: 0;
}

.logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  white-space: nowrap;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 8px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 100%;
}

.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}
.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

:deep(.el-menu) {
  border-right: none;
  background: transparent !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  margin: 3px 10px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
  color: #fff !important;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  padding-left: 48px !important;
  margin: 2px 10px;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

/* ============ 主内容区 ============ */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #eef2f7;
  margin: 16px 16px 16px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.top-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e8ecf1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  flex-shrink: 0;
  border-radius: 12px 12px 0 0;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #eef2f7;
  border-radius: 0 0 12px 12px;
  padding: 20px 24px;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}
.content-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background: #f1f5f9;
  color: #1e40af;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: #f1f5f9 !important;
  border: none !important;
  color: #64748b !important;
}

.icon-btn:hover {
  background: #e2e8f0 !important;
  color: #1e40af !important;
}

.notification-badge {
  display: flex;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 16px;
  border-left: 1px solid #e2e8f0;
}

.user-avatar {
  background: #1e40af;
  font-weight: 600;
  font-size: 14px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.user-role {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.dropdown-btn {
  color: #64748b !important;
  padding: 0 4px !important;
}


.message-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.message-item:hover {
  background: #f1f5f9;
}

.warning-item .msg-icon {
  color: #b91c1c;
}

.notify-item .msg-icon {
  color: #1e40af;
}

.msg-text {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.msg-badge {
  margin-left: 2px;
}

:deep(.msg-dropdown) {
  min-width: 340px;
  max-width: 380px;
  padding: 0;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.header-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

.msg-dropdown-item {
  padding: 4px 0;
}

.msg-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.msg-item-title.important {
  color: #b91c1c;
}

.msg-item-desc {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-item-time {
  font-size: 11px;
  color: #94a3b8;
}

.msg-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.msg-item-from {
  font-size: 11px;
  color: #64748b;
}

.view-all {
  text-align: center;
  color: #1e40af;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
  margin-top: 4px;
}
</style>
