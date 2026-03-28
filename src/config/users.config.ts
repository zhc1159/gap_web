import type { IDefaultUser } from '@/types/user'
import { UserRole } from '@/types/user'

/**
 * 默认用户配置
 * 四种角色：超级管理员、系统管理员、普通管理员、审计员
 */
export const defaultUsers: IDefaultUser[] = [
  {
    username: 'deepnet',
    password: 'deepnet',
    role: UserRole.SUPER,
    permissions: ['*'] // 拥有所有权限
  },
  {
    username: 'sysadm',
    password: 'sysadm',
    role: UserRole.ADMIN,
    permissions: [
      'dashboard',
      'status.view', 'status.link', 'status.system',
      'authority.view', 'authority.users', 'authority.roles',
      'system.view', 'system.interface', 'system.route', 'system.config',
      'audit.view', 'audit.operation', 'audit.system', 'audit.security', 'audit.login',
      'rules.view', 'rules.access', 'rules.filesync',
      'maintenance.view', 'maintenance.license', 'maintenance.backup', 'maintenance.upgrade', 'maintenance.diagnose'
    ]
  },
  {
    username: 'admin',
    password: 'admin',
    role: UserRole.MANAGER,
    permissions: [
      'dashboard',
      'status.view', 'status.link', 'status.system',
      'system.view', 'system.interface', 'system.route',
      'rules.view', 'rules.access', 'rules.filesync'
    ]
  },
  {
    username: 'auditor',
    password: 'auditor',
    role: UserRole.AUDITOR,
    permissions: [
      'dashboard',
      'audit.view', 'audit.operation', 'audit.system', 'audit.security', 'audit.login'
    ]
  }
]

/**
 * 获取用户角色名称
 */
export function getRoleName(role: UserRole, locale: string = 'zh-CN'): string {
  const roleNames: Record<string, Record<string, string>> = {
    [UserRole.SUPER]: {
      'zh-CN': '超级管理员',
      'en-US': 'Super Admin'
    },
    [UserRole.ADMIN]: {
      'zh-CN': '系统管理员',
      'en-US': 'System Admin'
    },
    [UserRole.MANAGER]: {
      'zh-CN': '管理员',
      'en-US': 'Manager'
    },
    [UserRole.AUDITOR]: {
      'zh-CN': '审计员',
      'en-US': 'Auditor'
    }
  }

  return roleNames[role]?.[locale] || role
}
