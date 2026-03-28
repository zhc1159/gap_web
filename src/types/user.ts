/**
 * 用户角色枚举
 */
export enum UserRole {
  SUPER = 'super',           // 超级管理员 (deepnet)
  ADMIN = 'admin',           // 系统管理员 (sysadm)
  MANAGER = 'manager',       // 管理员 (admin)
  AUDITOR = 'auditor'        // 审计员 (auditor)
}

/**
 * 用户信息接口
 */
export interface IUserInfo {
  id: string
  username: string
  nickname?: string
  role: UserRole
  avatar?: string
  permissions: string[]
  lastLoginTime?: string
}

/**
 * 登录表单数据
 */
export interface ILoginForm {
  username: string
  password: string
  rememberMe?: boolean
}

/**
 * 登录响应数据
 */
export interface ILoginResponse {
  code: number
  message: string
  data: {
    token: string
    userInfo: IUserInfo
    permissions: string[]
  }
}

/**
 * 默认用户配置
 */
export interface IDefaultUser {
  username: string
  password: string
  role: UserRole
  permissions: string[]
}
