import { createRouter, createWebHashHistory } from 'vue-router'

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
        path: '/resident/history',
        name: 'HistoryResidentList',
        component: () => import('../views/backend/HistoryResidentList.vue')
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
      },
      {
        path: '/task/visit',
        name: 'VisitTask',
        component: () => import('../views/backend/VisitTask.vue')
      },
      {
        path: '/task/check',
        name: 'CheckTask',
        component: () => import('../views/backend/CheckTask.vue')
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
  history: createWebHashHistory(),
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
