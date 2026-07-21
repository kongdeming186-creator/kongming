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
        <span v-if="!sidebarCollapsed" class="logo-text">六角亭民政</span>
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
        </el-sub-menu>
        
        <el-menu-item index="/import">
          <template #icon>
            <el-icon><Upload /></el-icon>
          </template>
          <span>数据导入</span>
        </el-menu-item>
        
        <el-sub-menu index="warning">
          <template #title>
            <el-icon><Warning /></el-icon>
            <span>预警管理</span>
          </template>
          <el-menu-item index="/warning">预警列表</el-menu-item>
          <el-menu-item index="/warning/config">规则配置</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="task">
          <template #title>
            <el-icon><Clock /></el-icon>
            <span>任务管理</span>
          </template>
          <el-menu-item index="/task">任务列表</el-menu-item>
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
          <el-badge :value="3" class="notification-badge">
            <el-button circle size="small" class="icon-btn" aria-label="通知（3条未读）">
              <el-icon :size="18"><Bell /></el-icon>
            </el-button>
          </el-badge>
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
  DataBoard, User, Upload, Warning, Clock, PieChart,
  Menu, Expand, Bell, ArrowDown, UserFilled, Star 
} from '@element-plus/icons-vue'


const router = useRouter()
const route = useRoute()

const sidebarCollapsed = ref(false)

const userInfo = ref(JSON.parse(sessionStorage.getItem('user') || '{"username":"admin"}'))

const activeMenu = computed(() => route.path)

const titleMap = {
  '/dashboard': '仪表盘',
  '/resident': '居民列表',
  '/resident/detail': '居民详情',
  '/import': '数据导入',
  '/warning': '预警列表',
  '/warning/config': '规则配置',
  '/task': '任务列表',
  '/task/detail': '任务详情',
  '/report': '统计报表',
  // '/grid-worker': '网格员列表',
  // '/grid-worker/assessment': '考核管理',
  '/ai-match': '政策匹配'
}

const currentTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/resident/detail')) return '居民详情'
  if (path.startsWith('/task/detail')) return '任务详情'
  return titleMap[path] || ''
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
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
}

.sidebar {
  width: 220px;
  background: #0f172a;
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
  border-bottom: 1px solid #1e293b;
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
  height: 48px;
  line-height: 48px;
  margin: 2px 8px;
  border-radius: 6px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.06) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890FF !important;
  color: #fff !important;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  padding-left: 48px !important;
  margin: 2px 8px;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.top-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
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
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background: #f1f5f9;
  color: #334155;
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
  background: #f8fafc !important;
  border: none !important;
  color: #64748b !important;
}

.icon-btn:hover {
  background: #f1f5f9 !important;
  color: #334155 !important;
}

.notification-badge {
  display: flex;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 16px;
  border-left: 1px solid #e5e7eb;
}

.user-avatar {
  background: linear-gradient(135deg, #1890FF, #0ea5e9);
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
  color: #1e293b;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.dropdown-btn {
  color: #94a3b8 !important;
  padding: 0 4px !important;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f3f4f6;
}
</style>
