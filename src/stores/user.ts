import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IUserInfo, ILoginForm, ILoginResponse } from '@/types/user'
import { UserRole } from '@/types/user'
import { getToken, setToken, removeToken, setUserInfo, removeUserInfo, getLanguage, setLanguage } from '@/utils/storage'
import { post } from '@/utils/request'
import { defaultUsers } from '@/config/users.config'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(getToken() || '')
  const userInfo = ref<IUserInfo | null>(null)
  const permissions = ref<string[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const role = computed(() => userInfo.value?.role)
  const roles = computed(() => userInfo.value ? [userInfo.value.role] : [])

  /**
   * 模拟登录 - 使用默认用户配置
   */
  async function login(loginForm: ILoginForm): Promise<ILoginResponse> {
    // 模拟登录验证
    const user = defaultUsers.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    )

    if (!user) {
      return {
        code: 401,
        message: '用户名或密码错误',
        data: {
          token: '',
          userInfo: {} as IUserInfo,
          permissions: []
        }
      }
    }

    // 生成模拟 token
    const mockToken = `token_${user.username}_${Date.now()}`

    // 构建用户信息
    const info: IUserInfo = {
      id: user.username,
      username: user.username,
      nickname: user.username,
      role: user.role,
      permissions: user.permissions,
      lastLoginTime: new Date().toISOString()
    }

    // 保存状态
    token.value = mockToken
    userInfo.value = info
    permissions.value = user.permissions

    // 持久化存储
    setToken(mockToken)
    setUserInfo(info)

    return {
      code: 0,
      message: '登录成功',
      data: {
        token: mockToken,
        userInfo: info,
        permissions: user.permissions
      }
    }
  }

  /**
   * 登出
   */
  async function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    removeToken()
    removeUserInfo()
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (token.value && !userInfo.value) {
      // 在实际项目中这里会调用 API
      // const res = await get('/api/user/info')
      // userInfo.value = res.data
    }
  }

  /**
   * 检查是否有权限
   */
  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*')) {
      return true
    }
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否有任一权限
   */
  function hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => hasPermission(p))
  }

  /**
   * 检查是否有所有权限
   */
  function hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => hasPermission(p))
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    username,
    role,
    roles,
    login,
    logout,
    fetchUserInfo,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
})
