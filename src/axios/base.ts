import service from './axios'

// Base API interfaces
export interface ILoginParams {
  username: string
  password: string
  authType?: 'password' | 'certificate' | 'fingerprint' | 'ukey'
}

export interface ILoginResponse {
  code: number
  msg: string
  data: {
    accessToken: string
    nickName: string
    uid: string
    roleList: string[]
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

// Mock user data - 模拟用户数据
const mockUsers = [
  { username: 'admin', password: 'admin123', nickName: '管理员', uid: '1', roleList: ['admin'] },
  { username: 'deepnet', password: 'deepnet123', nickName: '超级管理员', uid: '2', roleList: ['super_admin'] },
  { username: 'auditor', password: 'auditor123', nickName: '审计员', uid: '3', roleList: ['auditor'] }
]

// Login API - 模拟登录
export function Login(data: ILoginParams): Promise<ILoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === data.username && u.password === data.password
      )

      if (user) {
        resolve({
          code: 200,
          msg: '登录成功',
          data: {
            accessToken: `mock-token-${Date.now()}`,
            nickName: user.nickName,
            uid: user.uid,
            roleList: user.roleList
          }
        })
      } else {
        reject({
          response: {
            status: 401,
            data: { msg: '用户名或密码错误' }
          }
        })
      }
    }, 500) // 模拟网络延迟
  })
}

// Logout API - 模拟登出
export function Logout(): Promise<{ code: number; msg: string }> {
  return Promise.resolve({ code: 200, msg: '登出成功' })
}

// Get current user info
export function GetUserInfo() {
  return service({
    headers: { 'Api-Uid': 'base-getUserInfo' },
    url: '/user/info',
    method: 'get'
  })
}

// Get user list
export function GetUserList(params: IPageParams) {
  return service({
    headers: { 'Api-Uid': 'base-getUserList' },
    url: '/user/list',
    method: 'get',
    params
  })
}

// Create user
export function CreateUser(data: Partial<IUserInfo> & { password: string }) {
  return service({
    headers: { 'Api-Uid': 'base-createUser' },
    url: '/user/create',
    method: 'post',
    data
  })
}

// Update user
export function UpdateUser(data: Partial<IUserInfo>) {
  return service({
    headers: { 'Api-Uid': 'base-updateUser' },
    url: '/user/update',
    method: 'put',
    data
  })
}

// Delete user
export function DeleteUser(id: string) {
  return service({
    headers: { 'Api-Uid': 'base-deleteUser' },
    url: `/user/delete/${id}`,
    method: 'delete'
  })
}

// Change password
export function ChangePassword(data: { oldPassword: string; newPassword: string }) {
  return service({
    headers: { 'Api-Uid': 'base-changePassword' },
    url: '/user/changePassword',
    method: 'post',
    data
  })
}

// Reset password
export function ResetPassword(id: string, newPassword: string) {
  return service({
    headers: { 'Api-Uid': 'base-resetPassword' },
    url: '/user/resetPassword',
    method: 'post',
    data: { id, newPassword }
  })
}
