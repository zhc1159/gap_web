<template>
  <div class="page-container admin-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <span class="header-title">{{ $t('authorityManage.showUser.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('authorityManage.showUser.addUser') }}
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('authorityManage.showUser.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <el-table :data="userList" v-loading="loading" class="user-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="username" :label="$t('authorityManage.showUser.username')" min-width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-icon class="user-icon"><User /></el-icon>
                  <span>{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="group" :label="$t('authorityManage.showUser.group')" min-width="100" />
            <el-table-column :label="$t('authorityManage.showUser.pwdValidDays')" min-width="120">
              <template #default="{ row }">
                <span :class="['pwd-valid', { domain: row.isDomainUser }]">
                  {{ row.isDomainUser ? $t('authorityManage.showUser.domainUser') : `${row.pwdValidDays}${$t('authorityManage.showUser.days')}` }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.showUser.status')" min-width="100">
              <template #default="{ row }">
                <span :class="['status-badge', row.isActive ? 'active' : 'inactive']">
                  <el-icon v-if="row.isActive"><CircleCheck /></el-icon>
                  <el-icon v-else><CircleClose /></el-icon>
                  {{ row.isActive ? $t('authorityManage.showUser.active') : $t('authorityManage.showUser.inactive') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.showUser.authType')" min-width="120">
              <template #default="{ row }">
                <el-tag :type="row.authType === 'super' ? 'danger' : 'primary'" size="small" effect="dark">
                  {{ row.authType === 'super' ? $t('authorityManage.showUser.superAdmin') : $t('authorityManage.showUser.normalAdmin') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="certSwitch" :label="$t('authorityManage.showUser.certificate')" min-width="120">
              <template #default="{ row }">
                <el-button v-if="row.certIssued" size="small" type="success" link @click="downloadCertificate(row.username)">
                  <el-icon><Download /></el-icon>
                  {{ $t('authorityManage.showUser.downloadCert') }}
                </el-button>
                <el-button v-else size="small" type="primary" link @click="issueCertificate(row.username)">
                  <el-icon><Document /></el-icon>
                  {{ $t('authorityManage.showUser.issueCert') }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.showUser.actions')" min-width="200">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button
                    v-if="!row.isActive"
                    size="small"
                    type="success"
                    @click="toggleUserActive(row)"
                  >
                    {{ $t('authorityManage.showUser.activate') }}
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="warning"
                    @click="toggleUserActive(row)"
                  >
                    {{ $t('authorityManage.showUser.freeze') }}
                  </el-button>
                  <el-button size="small" type="primary" @click="openEditDialog(row)">
                    {{ $t('authorityManage.showUser.edit') }}
                  </el-button>
                  <el-button
                    v-if="row.username !== currentUser"
                    size="small"
                    type="danger"
                    @click="deleteUser(row)"
                  >
                    {{ $t('authorityManage.showUser.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? $t('authorityManage.showUser.addUser') : $t('authorityManage.showUser.editUser')"
      width="500px"
      class="user-dialog"
    >
      <el-form :model="userForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('authorityManage.showUser.username')" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" :label="$t('authorityManage.showUser.password')" prop="pwd">
          <el-input v-model="userForm.pwd" type="password" show-password />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" :label="$t('authorityManage.showUser.confirmPwd')" prop="pwdAgain">
          <el-input v-model="userForm.pwdAgain" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('authorityManage.showUser.authType')" prop="authType">
          <el-select v-model="userForm.authType" style="width: 100%">
            <el-option :label="$t('authorityManage.showUser.superAdmin')" value="super" />
            <el-option :label="$t('authorityManage.showUser.normalAdmin')" value="deputy" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { UserFilled, Plus, User, CircleCheck, CircleClose, Download, Document, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface AdminUser {
  id: number
  username: string
  group: string
  pwdValidDays: number
  isActive: boolean
  authType: 'super' | 'deputy'
  certIssued: boolean
  isDomainUser: boolean
}

interface UserForm {
  username: string
  pwd: string
  pwdAgain: string
  authType: 'super' | 'deputy'
}

// 从 sessionStorage 获取当前用户名
const currentUser = computed(() => sessionStorage.getItem('nick_name') || '')

// 状态
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const certSwitch = ref(true)
const formRef = ref<FormInstance>()
const selectedRows = ref<AdminUser[]>([])

// 模拟数据
const userList = ref<AdminUser[]>([
  { id: 1, username: 'admin', group: '管理员', pwdValidDays: 30, isActive: true, authType: 'super', certIssued: true, isDomainUser: false },
  { id: 2, username: 'operator', group: '运维', pwdValidDays: 15, isActive: true, authType: 'deputy', certIssued: false, isDomainUser: false },
  { id: 3, username: 'auditor', group: '审计', pwdValidDays: 0, isActive: false, authType: 'deputy', certIssued: false, isDomainUser: true },
  { id: 4, username: 'user1', group: '普通用户', pwdValidDays: 7, isActive: true, authType: 'deputy', certIssued: true, isDomainUser: false },
  { id: 5, username: 'user2', group: '普通用户', pwdValidDays: 30, isActive: true, authType: 'deputy', certIssued: false, isDomainUser: false }
])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5
})

const userForm = reactive<UserForm>({
  username: '',
  pwd: '',
  pwdAgain: '',
  authType: 'deputy'
})

const formRules: FormRules = {
  username: [
    { required: true, message: t('authorityManage.showUser.usernameRequired'), trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: t('authorityManage.showUser.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('authorityManage.showUser.passwordMin'), trigger: 'blur' }
  ],
  pwdAgain: [
    { required: true, message: t('authorityManage.showUser.confirmPwdRequired'), trigger: 'blur' }
  ],
  authType: [
    { required: true, message: t('authorityManage.showUser.authTypeRequired'), trigger: 'change' }
  ]
}

// 方法
const openAddDialog = () => {
  dialogType.value = 'add'
  userForm.username = ''
  userForm.pwd = ''
  userForm.pwdAgain = ''
  userForm.authType = 'deputy'
  dialogVisible.value = true
}

const openEditDialog = (user: AdminUser) => {
  dialogType.value = 'edit'
  userForm.username = user.username
  userForm.pwd = ''
  userForm.pwdAgain = ''
  userForm.authType = user.authType
  dialogVisible.value = true
}

const saveUser = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add' && userForm.pwd !== userForm.pwdAgain) {
        ElNotification({
          title: t('common.tip'),
          message: t('authorityManage.showUser.passwordMismatch'),
          type: 'error',
          customClass: 'notification-error'
        })
        return
      }

      saving.value = true
      setTimeout(() => {
        saving.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: t('authorityManage.showUser.saveSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      }, 1000)
    }
  })
}

const deleteUser = async (user: AdminUser) => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.showUser.deleteConfirm', { name: user.username }),
      t('common.confirm'),
      { type: 'warning' }
    )
    userList.value = userList.value.filter(u => u.id !== user.id)
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.showUser.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const toggleUserActive = async (user: AdminUser) => {
  user.isActive = !user.isActive
  ElNotification({
    title: t('common.success'),
    message: user.isActive ? t('authorityManage.showUser.activateSuccess') : t('authorityManage.showUser.freezeSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const issueCertificate = async (userName: string) => {
  const user = userList.value.find(u => u.username === userName)
  if (user) {
    user.certIssued = true
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.showUser.issueCertSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  }
}

const downloadCertificate = (userName: string) => {
  // 模拟下载证书
  console.log('Download certificate for:', userName)
  ElNotification({
    title: t('common.success'),
    message: t('authorityManage.showUser.downloadCertSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSelectionChange = (rows: AdminUser[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.showUser.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    userList.value = userList.value.filter(u => !ids.includes(u.id))
    selectedRows.value = []
    pagination.total = userList.value.length
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.showUser.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

onMounted(() => {
  // 模拟加载数据
})
</script>

<style scoped>
.admin-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--page-header-gradient);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px var(--page-header-shadow);
}

.header-left {
  display: flex;
  align-items: center;
  color: var(--page-header-text);
}

.header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.user-table {
  width: 100%;
}

.user-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.user-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.user-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  color: #409EFF;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.status-badge.inactive {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

/* 密码有效期 */
.pwd-valid {
  color: #606266;
}

.pwd-valid.domain {
  color: #409EFF;
  font-weight: 500;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.15);
}

.batch-info {
  font-size: 13px;
  color: #606266;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 对话框 */
.user-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.user-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
