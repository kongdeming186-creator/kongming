import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/backend/Dashboard.vue')
      },
      {
        path: '/resident',
        name: 'ResidentList',
        component: () => import('../views/backend/ResidentList.vue')
      },
      {
        path: '/resident/detail/:id',
        name: 'ResidentDetail',
        component: () => import('../views/backend/ResidentDetail.vue')
      },
      {
        path: '/import',
        name: 'Import',
        component: () => import('../views/backend/Import.vue')
      },
      {
        path: '/warning',
        name: 'WarningList',
        component: () => import('../views/backend/WarningList.vue')
      },
      {
        path: '/warning/config',
        name: 'WarningConfig',
        component: () => import('../views/backend/WarningConfig.vue')
      },
      {
        path: '/task',
        name: 'TaskList',
        component: () => import('../views/backend/TaskList.vue')
      },
      {
        path: '/task/detail/:id',
        name: 'TaskDetail',
        component: () => import('../views/backend/TaskDetail.vue')
      },
      {
        path: '/report',
        name: 'Report',
        component: () => import('../views/backend/Report.vue')
      },
      {
        path: '/grid-worker',
        name: 'GridWorkerList',
        component: () => import('../views/backend/GridWorkerList.vue')
      },
      {
        path: '/grid-worker/assessment',
        name: 'Assessment',
        component: () => import('../views/backend/Assessment.vue')
      },
      {
        path: '/ai-match',
        name: 'AiMatch',
        component: () => import('../views/backend/AiMatch.vue')
      }
    ]
  },
  {
    path: '/mobile',
    name: 'MobileLayout',
    component: () => import('../views/mobile/MobileLayout.vue'),
    redirect: '/mobile/login',
    children: [
      {
        path: '/mobile/login',
        name: 'MobileLogin',
        component: () => import('../views/mobile/MobileLogin.vue')
      },
      {
        path: '/mobile/tasks',
        name: 'MobileTasks',
        component: () => import('../views/mobile/MobileTasks.vue')
      },
      {
        path: '/mobile/task/detail/:id',
        name: 'MobileTaskDetail',
        component: () => import('../views/mobile/MobileTaskDetail.vue')
      },
      {
        path: '/mobile/task/process/:id',
        name: 'MobileTaskProcess',
        component: () => import('../views/mobile/MobileTaskProcess.vue')
      },
      {
        path: '/mobile/resident/:id',
        name: 'MobileResident',
        component: () => import('../views/mobile/MobileResident.vue')
      },
      {
        path: '/mobile/checkin',
        name: 'MobileCheckIn',
        component: () => import('../views/mobile/MobileCheckIn.vue')
      },
      {
        path: '/mobile/visit',
        name: 'MobileVisit',
        component: () => import('../views/mobile/MobileVisitRecord.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('user')
  if (to.path !== '/login' && to.path !== '/mobile/login' && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
