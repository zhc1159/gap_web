// Common types
export interface IPageParams {
  page: number
  size: number
  keyword?: string
  status?: string
}

export interface IPageResponse<T> {
  code: number
  msg: string
  data: {
    list: T[]
    total: number
    page: number
    size: number
  }
}

export interface IUserInfo {
  id: string
  nickName: string
  email: string
  phone: string
  avatar: string
  roleList: string[]
  status: 'active' | 'inactive' | 'locked'
  createTime: string
  lastLoginTime: string
}

export interface IRoleInfo {
  id: string
  name: string
  code: string
  description: string
  permissionList: string[]
  createTime: string
}

export interface IMenuInfo {
  id: string
  parentId: string
  name: string
  path: string
  icon: string
  sort: number
  status: 'active' | 'inactive'
  createTime: string
}

export interface ILogInfo {
  id: string
  userId: string
  userName: string
  operation: string
  ip: string
  module: string
  content: string
  createTime: string
}
