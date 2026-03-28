import type { IMenuItem } from '@/types/menu'

/**
 * 菜单配置
 * 根据设计文档定义完整的菜单结构
 */
export const menuConfig: IMenuItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    name: 'dashboard',
    icon: 'Odometer',
    title: '仪表盘',
    titleEn: 'Dashboard',
    enabled: true,
    sort: 0
  },
  {
    id: 'status',
    path: '/status',
    name: 'status',
    icon: 'View',
    title: '状态监视',
    titleEn: 'Status Monitor',
    enabled: true,
    sort: 1,
    children: [
      {
        id: 'status-link',
        path: '/status/link',
        name: 'link',
        icon: 'Link',
        title: '链路检测',
        titleEn: 'Link Detection',
        enabled: true,
        sort: 1
      },
      {
        id: 'status-system',
        path: '/status/system',
        name: 'system-status',
        icon: 'Monitor',
        title: '系统状态',
        titleEn: 'System Status',
        enabled: true,
        sort: 2
      }
    ]
  },
  {
    id: 'authority',
    path: '/authority',
    name: 'authority',
    icon: 'UserFilled',
    title: '权限管理',
    titleEn: 'Authority Management',
    enabled: true,
    sort: 2,
    children: [
      {
        id: 'authority-users',
        path: '/authority/users',
        name: 'users',
        icon: 'User',
        title: '管理员管理',
        titleEn: 'Admin Management',
        enabled: true,
        sort: 1
      },
      {
        id: 'authority-roles',
        path: '/authority/roles',
        name: 'roles',
        icon: 'Key',
        title: '角色管理',
        titleEn: 'Role Management',
        enabled: true,
        sort: 2
      },
      {
        id: 'authority-secure',
        path: '/authority/secure',
        name: 'secure',
        icon: 'Lock',
        title: '安全保密员',
        titleEn: 'Security Officer',
        enabled: true,
        sort: 3
      },
      {
        id: 'authority-auditor',
        path: '/authority/auditor',
        name: 'auditor',
        icon: 'View',
        title: '审计员管理',
        titleEn: 'Auditor Management',
        enabled: true,
        sort: 4
      },
      {
        id: 'authority-otp',
        path: '/authority/otp',
        name: 'otp',
        icon: 'Key',
        title: 'OTP配置',
        titleEn: 'OTP Config',
        enabled: true,
        sort: 5
      },
      {
        id: 'authority-ipwhitelist',
        path: '/authority/ipwhitelist',
        name: 'ipwhitelist',
        icon: 'Connection',
        title: 'IP白名单',
        titleEn: 'IP Whitelist',
        enabled: true,
        sort: 6
      }
    ]
  },
  {
    id: 'system',
    path: '/system',
    name: 'system',
    icon: 'Setting',
    title: '系统管理',
    titleEn: 'System Management',
    enabled: true,
    sort: 3,
    children: [
      {
        id: 'system-interface',
        path: '/system/interface',
        name: 'interface',
        icon: 'Connection',
        title: '接口配置',
        titleEn: 'Interface Config',
        enabled: true,
        sort: 1
      },
      {
        id: 'system-route',
        path: '/system/route',
        name: 'route',
        icon: 'Sort',
        title: '路由配置',
        titleEn: 'Route Config',
        enabled: true,
        sort: 2
      },
      {
        id: 'system-config',
        path: '/system/config',
        name: 'system-config',
        icon: 'Tools',
        title: '系统设置',
        titleEn: 'System Settings',
        enabled: true,
        sort: 3
      }
    ]
  },
  {
    id: 'audit',
    path: '/audit',
    name: 'audit',
    icon: 'Document',
    title: '日志审计',
    titleEn: 'Audit Logs',
    enabled: true,
    sort: 4,
    children: [
      {
        id: 'audit-operation',
        path: '/audit/operation',
        name: 'operation-log',
        icon: 'Edit',
        title: '操作日志',
        titleEn: 'Operation Logs',
        enabled: true,
        sort: 1
      },
      {
        id: 'audit-system',
        path: '/audit/system',
        name: 'system-log',
        icon: 'Document',
        title: '系统日志',
        titleEn: 'System Logs',
        enabled: true,
        sort: 2
      },
      {
        id: 'audit-security',
        path: '/audit/security',
        name: 'security-log',
        icon: 'Lock',
        title: '安全日志',
        titleEn: 'Security Logs',
        enabled: true,
        sort: 3
      },
      {
        id: 'audit-login',
        path: '/audit/login',
        name: 'login-log',
        icon: 'User',
        title: '登录日志',
        titleEn: 'Login Logs',
        enabled: true,
        sort: 4
      }
    ]
  },
  {
    id: 'rules',
    path: '/rules',
    name: 'rules',
    icon: 'Grid',
    title: '规则管理',
    titleEn: 'Rules Management',
    enabled: true,
    sort: 5,
    children: [
      {
        id: 'rules-access',
        path: '/rules/access',
        name: 'access-rules',
        icon: 'Lock',
        title: '访问限制',
        titleEn: 'Access Restriction',
        enabled: true,
        sort: 1
      },
      {
        id: 'rules-filesync',
        path: '/rules/filesync',
        name: 'file-sync',
        icon: 'Refresh',
        title: '文件同步',
        titleEn: 'File Sync',
        enabled: true,
        sort: 2
      }
    ]
  },
  {
    id: 'maintenance',
    path: '/maintenance',
    name: 'maintenance',
    icon: 'Tools',
    title: '系统维护',
    titleEn: 'System Maintenance',
    enabled: true,
    sort: 6,
    children: [
      {
        id: 'maintenance-license',
        path: '/maintenance/license',
        name: 'license',
        icon: 'Document',
        title: '软件授权',
        titleEn: 'Software License',
        enabled: true,
        sort: 1
      },
      {
        id: 'maintenance-backup',
        path: '/maintenance/backup',
        name: 'backup',
        icon: 'Download',
        title: '配置存档',
        titleEn: 'Config Backup',
        enabled: true,
        sort: 2
      },
      {
        id: 'maintenance-upgrade',
        path: '/maintenance/upgrade',
        name: 'upgrade',
        icon: 'Upload',
        title: '软件升级',
        titleEn: 'Software Upgrade',
        enabled: true,
        sort: 3
      },
      {
        id: 'maintenance-diagnose',
        path: '/maintenance/diagnose',
        name: 'diagnose',
        icon: 'Tools',
        title: '诊断工具',
        titleEn: 'Diagnostic Tools',
        enabled: true,
        sort: 4
      }
    ]
  }
]

/**
 * 根据角色获取菜单
 */
export function getMenuByRole(role: string): IMenuItem[] {
  const allMenus = ['*']
  const adminMenus = ['dashboard', 'status', 'authority', 'system', 'audit', 'rules', 'maintenance']
  const managerMenus = ['dashboard', 'status', 'system', 'rules']
  const auditorMenus = ['dashboard', 'audit']

  let allowedMenus: string[]

  switch (role) {
    case 'super':
      allowedMenus = allMenus
      break
    case 'admin':
      allowedMenus = adminMenus
      break
    case 'manager':
      allowedMenus = managerMenus
      break
    case 'auditor':
      allowedMenus = auditorMenus
      break
    default:
      allowedMenus = ['dashboard']
  }

  if (allowedMenus.includes('*')) {
    return menuConfig
  }

  return menuConfig.filter(menu => allowedMenus.includes(menu.name))
}
