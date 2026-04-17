<template>
  <div class="page-container opc-user-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><User /></el-icon>
        </div>
        <span class="header-title">{{ $t('userManage.super_opcUser.title') }}</span>
      </div>
      <div class="header-right">
        <span class="header-switch-label">{{ $t('userManage.super_opcUser.authModule') }}</span>
        <el-switch v-model="authModuleEnabled" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt class="header-switch" @change="handleAuthModuleChange" />
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('userManage.super_opcUser.addUser') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('userManage.super_opcUser.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-info">{{ $t('userManage.super_opcUser.selectedCount', { count: selectedRows.length }) }}</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            {{ $t('common.delete') }}
          </el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" class="user-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45" />
          <!-- 账号 -->
          <el-table-column prop="username" :label="$t('userManage.super_opcUser.account')" min-width="120">
            <template #default="{ row }">
              <span class="user-name">{{ row.username }}</span>
            </template>
          </el-table-column>

          <!-- 等级 -->
          <el-table-column :label="$t('userManage.super_opcUser.level')" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getLevelTagType(row.level)" size="small">{{ getLevelText(row.level) }}</el-tag>
            </template>
          </el-table-column>

          <!-- 所属组 -->
          <el-table-column prop="group" :label="$t('userManage.super_opcUser.group')" min-width="120">
            <template #default="{ row }">
              <span class="group-text">{{ row.group }}</span>
            </template>
          </el-table-column>

          <!-- IP -->
          <el-table-column prop="ip" :label="$t('userManage.super_opcUser.ip')" min-width="140">
            <template #default="{ row }">
              <span class="mono-text">{{ row.ip || '-' }}</span>
            </template>
          </el-table-column>

          <!-- MAC -->
          <el-table-column prop="mac" :label="$t('userManage.super_opcUser.mac')" min-width="150">
            <template #default="{ row }">
              <span class="mono-text">{{ row.mac || '-' }}</span>
            </template>
          </el-table-column>

          <!-- 账户状态 -->
          <el-table-column :label="$t('userManage.super_opcUser.accountStatus')" width="110" align="center">
            <template #default="{ row }">
              <el-button :type="row.isActive ? 'success' : 'warning'" size="small" @click="handleToggleStatus(row)">
                {{ row.isActive ? $t('userManage.super_opcUser.active') : $t('userManage.super_opcUser.inactive') }}
              </el-button>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('userManage.super_opcUser.actions')" min-width="150" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('userManage.super_opcUser.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('userManage.super_opcUser.delete') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('userManage.super_opcUser.editTitle') : $t('userManage.super_opcUser.addTitle')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px" class="form-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formUsername')" prop="username">
              <el-input v-model="formData.username" :placeholder="$t('userManage.super_opcUser.usernamePlaceholder')" :disabled="isEdit" @input="handleUsernameInput" />
              <div class="form-tip">{{ $t('userManage.super_opcUser.usernameTip') }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formGroup')" prop="groupId">
              <el-select v-model="formData.groupId" :placeholder="$t('userManage.super_opcUser.groupPlaceholder')" style="width: 100%">
                <el-option v-for="g in groupOptions" :key="g.value" :label="g.label" :value="g.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formPassword')" prop="password">
              <el-input v-model="formData.password" type="password" show-password :placeholder="$t('userManage.super_opcUser.passwordPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formConfirmPwd')" prop="confirmPassword">
              <el-input v-model="formData.confirmPassword" type="password" show-password :placeholder="$t('userManage.super_opcUser.confirmPwdPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formIp')" prop="ip">
              <el-input v-model="formData.ip" :placeholder="$t('userManage.super_opcUser.ipPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManage.super_opcUser.formMac')" prop="mac">
              <el-input v-model="formData.mac" :placeholder="$t('userManage.super_opcUser.macPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('userManage.super_opcUser.formLevel')" prop="level">
          <el-radio-group v-model="formData.level">
            <el-radio value="0">{{ $t('userManage.super_opcUser.levelTopSecret') }}</el-radio>
            <el-radio value="1">{{ $t('userManage.super_opcUser.levelConfidential') }}</el-radio>
            <el-radio value="2">{{ $t('userManage.super_opcUser.levelSecret') }}</el-radio>
            <el-radio value="3">{{ $t('userManage.super_opcUser.levelUnclassified') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { User, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface OpcUser {
  id: string
  username: string
  level: string
  group: string
  ip: string
  mac: string
  isActive: boolean
}

// ==================== 等级映射 ====================
const levelMap: Record<string, string> = {
  '0': 'levelTopSecret', '1': 'levelConfidential',
  '2': 'levelSecret', '3': 'levelUnclassified'
}
const getLevelText = (level: string) => t(`userManage.super_opcUser.${levelMap[level] || 'levelUnclassified'}`)
const getLevelTagType = (level: string) => ({ '0': 'danger', '1': 'warning', '2': '', '3': 'info' }[level] || 'info')

// ==================== 选项 ====================
const groupOptions = [
  { value: 'sys', label: 'sys (系统管理组)' },
  { value: 'adm', label: 'adm (管理员组)' },
  { value: 'opc_group_1', label: 'opc_group_1' },
  { value: 'opc_group_2', label: 'opc_group_2' },
  { value: 'user_group', label: 'user_group' }
]

// ==================== 状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const selectedRows = ref<OpcUser[]>([])
const authModuleEnabled = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<OpcUser[]>([
  { id: '1', username: 'admin_opc', level: '0', group: 'sys', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:5E', isActive: true },
  { id: '2', username: 'operator1', level: '1', group: 'adm', ip: '192.168.1.20', mac: '00:1A:2B:3C:4D:5F', isActive: true },
  { id: '3', username: 'viewer01', level: '2', group: 'opc_group_1', ip: '192.168.1.30', mac: 'AA:BB:CC:DD:EE:01', isActive: false },
  { id: '4', username: 'guest01', level: '3', group: 'user_group', ip: '10.0.0.5', mac: 'AA:BB:CC:DD:EE:02', isActive: true },
  { id: '5', username: 'eng_user', level: '1', group: 'opc_group_2', ip: '10.0.0.15', mac: '11:22:33:44:55:66', isActive: true }
])

const tableData = ref<OpcUser[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  groupId: '',
  ip: '',
  mac: '00:00:00:00:00:00',
  level: '3'
})

const validateUsername = (_rule: any, value: string, callback: any) => {
  if (!value) { callback(new Error(t('userManage.super_opcUser.usernameRequired'))); return }
  if (!/^[a-zA-Z0-9]+$/.test(value)) { callback(new Error(t('userManage.super_opcUser.usernamePattern'))); return }
  callback()
}

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!isEdit.value && !value) { callback(new Error(t('userManage.super_opcUser.passwordRequired'))); return }
  if (value && value.length < 6) { callback(new Error(t('userManage.super_opcUser.passwordMinLength'))); return }
  callback()
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!isEdit.value && !value) { callback(new Error(t('userManage.super_opcUser.confirmPwdRequired'))); return }
  if (value && value !== formData.password) { callback(new Error(t('userManage.super_opcUser.confirmPwdMismatch'))); return }
  callback()
}

const formRules: FormRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  groupId: [{ required: true, message: t('userManage.super_opcUser.groupRequired'), trigger: 'change' }],
  level: [{ required: true, message: t('userManage.super_opcUser.levelRequired'), trigger: 'change' }]
}

// ==================== 数据加载 ====================
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 300)
}

// ==================== 操作 ====================
const handleUsernameInput = (val: string) => {
  formData.username = val.replace(/[^a-zA-Z0-9]/g, '')
}

const resetForm = () => {
  formData.username = ''; formData.password = ''; formData.confirmPassword = ''
  formData.groupId = ''; formData.ip = ''; formData.mac = '00:00:00:00:00:00'
  formData.level = '3'; editingId.value = ''
}

const handleAdd = () => { isEdit.value = false; resetForm(); dialogVisible.value = true }

const handleEdit = (row: OpcUser) => {
  isEdit.value = true; editingId.value = row.id
  formData.username = row.username; formData.password = ''; formData.confirmPassword = ''
  formData.groupId = row.group; formData.ip = row.ip; formData.mac = row.mac
  formData.level = row.level; dialogVisible.value = true
}

const handleDelete = async (row: OpcUser) => {
  try {
    await ElMessageBox.confirm(t('userManage.super_opcUser.deleteConfirm', { name: row.username }), t('common.confirm'), { type: 'warning' })
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('userManage.super_opcUser.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

// 选择变化
const handleSelectionChange = (rows: OpcUser[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('userManage.super_opcUser.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    mockData.value = mockData.value.filter(item => !ids.includes(item.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('userManage.super_opcUser.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleAuthModuleChange = (val: boolean) => {
  ElNotification({ title: t('common.success'), message: val ? t('userManage.super_opcUser.authModuleOn') : t('userManage.super_opcUser.authModuleOff'), type: 'success', customClass: 'notification-success' })
}

const handleToggleStatus = (row: OpcUser) => {
  row.isActive = !row.isActive
  ElNotification({ title: t('common.success'), message: row.isActive ? t('userManage.super_opcUser.activateSuccess') : t('userManage.super_opcUser.deactivateSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const idx = mockData.value.findIndex(item => item.id === editingId.value)
        if (idx !== -1) {
          mockData.value[idx] = {
            id: editingId.value, username: formData.username, level: formData.level,
            group: formData.groupId, ip: formData.ip, mac: formData.mac,
            isActive: mockData.value[idx].isActive
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(), username: formData.username, level: formData.level,
          group: formData.groupId, ip: formData.ip, mac: formData.mac, isActive: true
        })
      }
      submitLoading.value = false; dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('userManage.super_opcUser.editSuccess') : t('userManage.super_opcUser.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

fetchList()

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}
</script>

<style scoped>
.opc-user-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: var(--page-header-gradient);
  border-radius: 12px; margin-bottom: 16px;
  box-shadow: 0 4px 16px var(--page-header-shadow);
}
.header-left { display: flex; align-items: center; color: var(--page-header-text); }
.header-right { display: flex; align-items: center; gap: 12px; }
.header-switch-label { color: white; font-size: 14px; white-space: nowrap; }
.header-switch :deep(.el-switch__core) { border-color: rgba(0,0,0,0.25); background: #909399; }
.header-switch.is-checked :deep(.el-switch__core) { border-color: #e6a23c; background: #e6a23c; }
.header-icon {
  width: 36px; height: 36px; background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  margin-right: 12px; font-size: 18px;
}
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; }
.btn-add:hover { background: rgba(255, 255, 255, 0.3); }

/* ========== 页面描述 ========== */
.page-describe {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px; margin-bottom: 16px; color: var(--el-text-color-secondary); font-size: 14px;
}
.describe-icon { color: #409EFF; font-size: 16px; }

/* ========== 主卡片 ========== */
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
.batch-info { font-size: 13px; color: var(--el-text-color-secondary); }

.main-card {
  background: var(--card-bg); border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}
.card-content { padding: 24px 28px; }

/* ========== 表格 ========== */
.user-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600; color: var(--el-text-color-primary); padding: 14px 12px;
}
.user-table :deep(.el-table td.el-table__cell) { padding: 14px 12px; }
.user-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}
.user-name { font-weight: 600; color: #409EFF; }
.group-text { color: #67C23A; font-weight: 500; }
.mono-text { font-family: 'Courier New', monospace; color: var(--el-text-color-secondary); font-size: 13px; }
.action-btns { display: flex; gap: 6px; }
.pagination-wrapper {
  display: flex; justify-content: flex-end; margin-top: 20px;
  padding-top: 16px; border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0; padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}
.form-dialog :deep(.el-dialog__body) { padding: 24px; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid rgba(64, 158, 255, 0.1); padding: 16px 20px; }
.form-content { max-width: 100%; }
.form-tip { margin-top: 4px; font-size: 12px; color: var(--el-text-color-placeholder); }
.form-content :deep(.el-radio-group) { display: flex; gap: 16px; flex-wrap: wrap; }

/* ========== 底部按钮 ========== */
.dialog-footer { display: flex; justify-content: center; gap: 12px; }
</style>
