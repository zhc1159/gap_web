import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AdminUser, AdminUserForm, MockAdminUser } from '@/types/users'

/**
 * 分页参数
 */
interface PaginationParams {
  page: number
  pageSize: number
  total: number
}

export const useUsersStore = defineStore('users', () => {
  // State
  const list = ref<AdminUser[]>([])
  const authList = ref<string[]>([
    'dashboard.view',
    'status.view',
    'status.link',
    'status.system',
    'authority.view',
    'authority.users',
    'authority.roles',
    'system.view',
    'system.interface',
    'system.route',
    'audit.view',
    'audit.operation',
    'audit.system',
    'audit.security',
    'audit.login'
  ])
  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10,
    total: 0
  })
  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentForm = ref<AdminUserForm | null>(null)
  const certSwitch = ref(false)

  /**
   * 模拟数据
   */
  const mockUsers: MockAdminUser[] = [
    {
      id: 1,
      username: 'deepnet',
      group: '超级管理员',
      pwdValidDays: 999,
      isActive: true,
      authType: 'super',
      certIssued: true,
      isDomainUser: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      username: 'sysadm',
      group: '系统管理员',
      pwdValidDays: 30,
      isActive: true,
      authType: 'super',
      certIssued: false,
      isDomainUser: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 3,
      username: 'admin',
      group: '管理员',
      pwdValidDays: 15,
      isActive: true,
      authType: 'deputy',
      certIssued: false,
      isDomainUser: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 4,
      username: 'auditor',
      group: '审计员',
      pwdValidDays: 30,
      isActive: true,
      authType: 'deputy',
      certIssued: false,
      isDomainUser: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  /**
   * 获取用户列表
   */
  async function fetchList(page = 1) {
    loading.value = true
    try {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          const start = (page - 1) * pagination.value.pageSize
          const end = start + pagination.value.pageSize
          const users = mockUsers.slice(start, end)

          list.value = users
          pagination.value = {
            ...pagination.value,
            page,
            total: mockUsers.length
          }
          resolve()
        }, 500)
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * 打开添加对话框
   */
  function openAddDialog() {
    dialogType.value = 'add'
    currentForm.value = {
      username: '',
      pwd: '',
      pwdAgain: '',
      authType: 'deputy',
      authList: []
    }
    dialogVisible.value = true
  }

  /**
   * 打开编辑对话框
   */
  function openEditDialog(user: AdminUser) {
    dialogType.value = 'edit'
    currentForm.value = {
      username: user.username,
      pwd: '',
      pwdAgain: '',
      authType: user.authType,
      authList: []
    }
    dialogVisible.value = true
  }

  /**
   * 保存用户
   */
  async function saveUser(form: AdminUserForm): Promise<boolean> {
    if (form.pwd !== form.pwdAgain) {
      ElMessage.error('两次密码输入不一致')
      return false
    }

    loading.value = true
    try {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          if (dialogType.value === 'add') {
            const newUser: MockAdminUser = {
              id: mockUsers.length + 1,
              username: form.username,
              group: form.authType === 'super' ? '超级管理员' : '管理员',
              pwdValidDays: 30,
              isActive: true,
              authType: form.authType,
              certIssued: false,
              isDomainUser: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            mockUsers.push(newUser)
          } else {
            const index = mockUsers.findIndex(u => u.username === form.username)
            if (index > -1) {
              mockUsers[index] = {
                ...mockUsers[index],
                authType: form.authType,
                updatedAt: new Date().toISOString()
              }
            }
          }

          ElMessage.success('保存成功')
          dialogVisible.value = false
          fetchList(pagination.value.page)
          resolve()
        }, 500)
      })
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除用户
   */
  async function deleteUser(id: number) {
    try {
      await ElMessageBox.confirm(
        '确定要删除该管理员吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const index = mockUsers.findIndex(u => u.id === id)
      if (index > -1) {
        mockUsers.splice(index, 1)
      }

      ElMessage.success('删除成功')
      await fetchList(pagination.value.page)
    } catch {
      // 取消删除
    }
  }

  /**
   * 切换用户状态
   */
  async function toggleUserActive(user: AdminUser) {
    loading.value = true
    try {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          const index = mockUsers.findIndex(u => u.id === user.id)
          if (index > -1) {
            mockUsers[index].isActive = !mockUsers[index].isActive
          }
          resolve()
        }, 300)
      })
      await fetchList(pagination.value.page)
    } finally {
      loading.value = false
    }
  }

  /**
   * 签发证书
   */
  async function issueCertificate(username: string) {
    loading.value = true
    try {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          const user = mockUsers.find(u => u.username === username)
          if (user) {
            user.certIssued = true
          }
          resolve()
        }, 1000)
      })
      ElMessage.success('签发成功')
      await fetchList(pagination.value.page)
    } finally {
      loading.value = false
    }
  }

  /**
   * 下载证书
   */
  async function downloadCertificate(username: string) {
    try {
      const content = `Certificate for ${username}\nGenerated at ${new Date().toISOString()}`
      const blob = new Blob([content], { type: 'application/x-pkcs12' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${username}.pfx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      ElMessage.error('下载失败')
    }
  }

  return {
    list,
    authList,
    pagination,
    loading,
    dialogVisible,
    dialogType,
    currentForm,
    certSwitch,
    fetchList,
    openAddDialog,
    openEditDialog,
    saveUser,
    deleteUser,
    toggleUserActive,
    issueCertificate,
    downloadCertificate
  }
})
