import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 公共路由配置
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      titleEn: 'Login',
      requiresAuth: false
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      titleEn: 'Not Found',
      requiresAuth: false
    }
  }
]

/**
 * 动态路由配置
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          titleEn: 'Dashboard',
          icon: 'Odometer',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/status',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/status/link',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'link',
        name: 'LinkStatus',
        component: () => import('@/views/status/LinkStatus.vue'),
        meta: {
          title: '链路检测',
          titleEn: 'Link Detection',
          icon: 'Link',
          requiresAuth: true
        }
      },
      {
        path: 'system',
        name: 'SystemStatus',
        component: () => import('@/views/status/SystemStatus.vue'),
        meta: {
          title: '系统状态',
          titleEn: 'System Status',
          icon: 'Monitor',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/authority',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/authority/users',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/authority/users/index.vue'),
        meta: {
          title: '管理员管理',
          titleEn: 'Admin Management',
          icon: 'User',
          requiresAuth: true,
          permissions: ['authority.users']
        }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/authority/roles/index.vue'),
        meta: {
          title: '角色管理',
          titleEn: 'Role Management',
          icon: 'Key',
          requiresAuth: true,
          permissions: ['authority.roles']
        }
      },
      {
        path: 'secure',
        name: 'SecureOfficer',
        component: () => import('@/views/authority/secure/index.vue'),
        meta: {
          title: '安全保密员',
          titleEn: 'Security Officer',
          icon: 'Lock',
          requiresAuth: true,
          permissions: ['authority.secure']
        }
      },
      {
        path: 'auditor',
        name: 'Auditor',
        component: () => import('@/views/authority/auditor/index.vue'),
        meta: {
          title: '审计员管理',
          titleEn: 'Auditor Management',
          icon: 'View',
          requiresAuth: true,
          permissions: ['authority.auditor']
        }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/system/interface',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'interface',
        name: 'InterfaceConfig',
        component: () => import('@/views/system/InterfaceConfig.vue'),
        meta: {
          title: '接口配置',
          titleEn: 'Interface Config',
          icon: 'Connection',
          requiresAuth: true,
          permissions: ['system.interface']
        }
      },
      {
        path: 'route',
        name: 'RouteConfig',
        component: () => import('@/views/system/RouteConfig.vue'),
        meta: {
          title: '路由配置',
          titleEn: 'Route Config',
          icon: 'Sort',
          requiresAuth: true,
          permissions: ['system.route']
        }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: {
          title: '系统设置',
          titleEn: 'System Settings',
          icon: 'Tools',
          requiresAuth: true,
          permissions: ['system.config']
        }
      }
    ]
  },
  {
    path: '/audit',
    component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/audit/operation',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'operation',
        name: 'OperationLog',
        component: () => import('@/views/audit/OperationLog.vue'),
        meta: {
          title: '操作日志',
          titleEn: 'Operation Logs',
          icon: 'Edit',
          requiresAuth: true
        }
      },
      {
        path: 'system',
        name: 'SystemLog',
        component: () => import('@/views/audit/SystemLog.vue'),
        meta: {
          title: '系统日志',
          titleEn: 'System Logs',
          icon: 'Document',
          requiresAuth: true
        }
      },
      {
        path: 'security',
        name: 'SecurityLog',
        component: () => import('@/views/audit/SecurityLog.vue'),
        meta: {
          title: '安全日志',
          titleEn: 'Security Logs',
          icon: 'Lock',
          requiresAuth: true
        }
      },
      {
        path: 'login',
        name: 'LoginLog',
        component: () => import('@/views/audit/LoginLog.vue'),
        meta: {
          title: '登录日志',
          titleEn: 'Login Logs',
          icon: 'User',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes]
})

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  document.title = title ? `${title} - GAP System` : 'GAP System'

  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登录访问登录页，跳转首页
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router
