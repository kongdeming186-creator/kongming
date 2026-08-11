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
          <el-menu-item index="/warning/config">规则配置</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/report">
          <template #icon>
            <el-icon><PieChart /></el-icon>
          </template>
          <span>统计报表</span>
        </el-menu-item>
        
        <!-- 网格员管理模块已隐藏
        <el-sub-menu index="grid-worker">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>网格员管理</span>
          </template>
          <el-menu-item index="/grid-worker">网格员列表</el-menu-item>
          <el-menu-item index="/grid-worker/assessment">考核管理</el-menu-item>
        </el-sub-menu>
        -->
        
        <el-menu-item index="/ai-match">
          <template #icon>
            <el-icon><Star /></el-icon>
          </template>
          <span>政策匹配</span>
        </el-menu-item>
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
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  DataBoard, User, Upload, Warning, PieChart,
  Menu, Expand, Bell, ArrowDown, UserFilled, Star 
} from '@element-plus/icons-vue'
import { warnings } from '../data/mock'


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
  '/report': '统计报表',
  '/ai-match': '政策匹配'
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
  background: #f5f7fa;
}

.sidebar {
  width: 220px;
  background: #1e3a8a;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  font-size: 17px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 100%;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 4px 8px;
  border-radius: 4px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1e40af !important;
  color: #fff !important;
  font-weight: 500;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  padding-left: 48px !important;
  margin: 2px 8px;
  height: 38px;
  line-height: 38px;
  font-size: 13px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f7fa;
}

.top-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
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

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f5f7fa;
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
