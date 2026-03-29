import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/components/layout/layout.vue'

// Static routes (no auth required)
export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录', checkAuth: false },
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { title: '404', checkAuth: false },
    component: () => import('@/views/error/404.vue')
  }
]

// Dynamic routes (auth required)
export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    meta: { title: '首页', pTitle: '系统', checkAuth: true },
    redirect: '/system/user'
  },
  // System management
  {
    path: '/system',
    meta: { title: '系统', pTitle: '系统管理', checkAuth: true },
    component: Layout,
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        meta: { title: '用户管理', pTitle: '系统', checkAuth: true },
        component: () => import('@/views/user/index.vue')
      },
      {
        path: 'role',
        name: 'SystemRole',
        meta: { title: '角色管理', pTitle: '系统', checkAuth: true },
        component: () => import('@/views/system/role.vue')
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        meta: { title: '菜单管理', pTitle: '系统', checkAuth: true },
        component: () => import('@/views/system/menu.vue')
      },
      {
        path: 'log',
        name: 'SystemLog',
        meta: { title: '日志管理', pTitle: '系统', checkAuth: true },
        component: () => import('@/views/system/log.vue')
      }
    ]
  },
  // Policy management
  {
    path: '/policy',
    meta: { title: '策略', pTitle: '策略管理', checkAuth: true },
    component: Layout,
    children: [
      {
        path: 'firewall',
        name: 'PolicyFirewall',
        meta: { title: '防火墙策略', pTitle: '策略', checkAuth: true },
        component: () => import('@/views/policy/firewall.vue')
      },
      {
        path: 'audit',
        name: 'PolicyAudit',
        meta: { title: '审计策略', pTitle: '策略', checkAuth: true },
        component: () => import('@/views/policy/audit.vue')
      }
    ]
  },
  // Audit
  {
    path: '/audit',
    meta: { title: '审计', pTitle: '审计日志', checkAuth: true },
    component: Layout,
    children: [
      {
        path: 'operation',
        name: 'AuditOperation',
        meta: { title: '操作日志', pTitle: '审计', checkAuth: true },
        component: () => import('@/views/audit/operation.vue')
      },
      {
        path: 'security',
        name: 'AuditSecurity',
        meta: { title: '安全日志', pTitle: '审计', checkAuth: true },
        component: () => import('@/views/audit/security.vue')
      }
    ]
  },
  // Monitor
  {
    path: '/monitor',
    meta: { title: '监控', pTitle: '监控中心', checkAuth: true },
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'MonitorDashboard',
        meta: { title: '实时监控', pTitle: '监控', checkAuth: true },
        component: () => import('@/views/monitor/dashboard.vue')
      },
      {
        path: 'traffic',
        name: 'MonitorTraffic',
        meta: { title: '流量统计', pTitle: '监控', checkAuth: true },
        component: () => import('@/views/monitor/traffic.vue')
      }
    ]
  }
]

// Create router instance
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...staticRoutes, ...dynamicRoutes],
  scrollBehavior: () => ({ top: 0 })
})

// Route guard - check authentication
router.beforeEach((to, _from, next) => {
  // Set page title
  document.title = `${to.meta.title || 'GAP'} - GAP安全隔离网闸`

  // Check if route requires authentication
  if (to.meta.checkAuth !== false) {
    const token = sessionStorage.getItem('accessToken')
    if (!token) {
      // No token, redirect to login
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
