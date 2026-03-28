/**
 * 管理员用户
 */
export interface AdminUser {
  id: number
  username: string
  group: string
  pwdValidDays: number
  isActive: boolean
  authType: 'super' | 'deputy'
  certIssued: boolean
  isDomainUser: boolean
}

/**
 * 用户表单
 */
export interface AdminUserForm {
  username: string
  pwd: string
  pwdAgain: string
  authType: 'super' | 'deputy'
  authList: string[]
}
/**
 * 稡拟管理员用户数据
 */
export interface MockAdminUser extends AdminUser {
  createdAt: string
  updatedAt: string
}
