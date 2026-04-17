<template>
  <div class="page-container otp-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Key /></el-icon>
        </div>
        <span class="header-title">{{ $t('authorityManage.otp.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('authorityManage.otp.add') }}
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
            <span class="batch-info">{{ $t('authorityManage.otp.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <el-table :data="otpList" v-loading="loading" class="otp-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="name" :label="$t('authorityManage.otp.username')" min-width="150">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-icon class="user-icon"><User /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.otp.userType')" min-width="120">
              <template #default="{ row }">
                <el-tag :type="row.userId !== -2 ? 'danger' : 'primary'" size="small" effect="dark">
                  {{ row.userId !== -2 ? $t('authorityManage.otp.admin') : $t('authorityManage.otp.normalUser') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.otp.qrcode')" min-width="100" align="center">
              <template #default="{ row }">
                <div class="qrcode-btn" @click="showQrcode(row)">
                  <el-icon><Grid /></el-icon>
                  <span>{{ $t('authorityManage.otp.viewQrcode') }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.otp.codeLength')" min-width="100">
              <template #default="{ row }">
                <span class="code-length">
                  {{ row.codeLength }}{{ $t('authorityManage.otp.digits') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.otp.actions')" min-width="180">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" type="primary" @click="openEditDialog(row)">
                    {{ $t('authorityManage.otp.edit') }}
                  </el-button>
                  <el-button size="small" type="danger" @click="deleteOtp(row)">
                    {{ $t('authorityManage.otp.delete') }}
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
      :title="dialogType === 'add' ? $t('authorityManage.otp.add') : $t('authorityManage.otp.edit')"
      width="500px"
      class="otp-dialog"
    >
      <el-form :model="otpForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('authorityManage.otp.username')" prop="name">
          <el-input v-model="otpForm.name" :placeholder="$t('authorityManage.otp.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('authorityManage.otp.codeLength')" prop="codeLength">
          <el-radio-group v-model="otpForm.codeLength">
            <el-radio :value="6">6{{ $t('authorityManage.otp.digits') }}</el-radio>
            <el-radio :value="8">8{{ $t('authorityManage.otp.digits') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="saveOtp">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 二维码对话框 -->
    <el-dialog
      v-model="qrcodeVisible"
      :title="$t('authorityManage.otp.qrcodeTitle')"
      width="400px"
      class="qrcode-dialog"
    >
      <div class="qrcode-container">
        <div class="qrcode-wrapper">
          <div class="qrcode-placeholder">
            <el-icon class="qrcode-icon"><Grid /></el-icon>
            <div class="qrcode-text">{{ currentOtp?.name }}</div>
            <div class="qrcode-secret">{{ currentOtp?.codeLength }}{{ $t('authorityManage.otp.digits') }}</div>
          </div>
        </div>
        <div class="qrcode-info">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('authorityManage.otp.qrcodeHint') }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Key, Plus, User, Grid, InfoFilled, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface OtpConfig {
  id: number
  userId: number
  name: string
  codeLength: 6 | 8
}

interface OtpFormData {
  id?: number
  name: string
  codeLength: 6 | 8
  userId: number
}

// 状态
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const qrcodeVisible = ref(false)
const currentOtp = ref<OtpConfig | null>(null)
const formRef = ref<FormInstance>()
const selectedRows = ref<OtpConfig[]>([])

// 模拟数据
const otpList = ref<OtpConfig[]>([
  { id: 1, userId: 1, name: 'admin', codeLength: 6 },
  { id: 2, userId: 2, name: 'operator', codeLength: 8 },
  { id: 3, userId: -2, name: 'user1', codeLength: 6 },
  { id: 4, userId: -2, name: 'user2', codeLength: 6 },
  { id: 5, userId: 3, name: 'auditor', codeLength: 8 }
])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5
})

const otpForm = reactive<OtpFormData>({
  name: '',
  codeLength: 6,
  userId: -2
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('authorityManage.otp.usernameRequired'), trigger: 'blur' }
  ],
  codeLength: [
    { required: true, message: t('authorityManage.otp.codeLengthRequired'), trigger: 'change' }
  ]
}

// 方法
const openAddDialog = () => {
  dialogType.value = 'add'
  otpForm.id = undefined
  otpForm.name = ''
  otpForm.codeLength = 6
  otpForm.userId = -2
  dialogVisible.value = true
}

const openEditDialog = (otp: OtpConfig) => {
  dialogType.value = 'edit'
  otpForm.id = otp.id
  otpForm.name = otp.name
  otpForm.codeLength = otp.codeLength
  otpForm.userId = otp.userId
  dialogVisible.value = true
}

const saveOtp = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: t('authorityManage.otp.saveSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      }, 1000)
    }
  })
}

const deleteOtp = async (otp: OtpConfig) => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.otp.deleteConfirm', { name: otp.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    otpList.value = otpList.value.filter(o => o.id !== otp.id)
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.otp.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const showQrcode = (otp: OtpConfig) => {
  currentOtp.value = otp
  qrcodeVisible.value = true
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSelectionChange = (rows: OtpConfig[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.otp.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    otpList.value = otpList.value.filter(o => !ids.includes(o.id))
    selectedRows.value = []
    pagination.total = otpList.value.length
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.otp.batchDeleteSuccess'),
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
.otp-page {
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
.otp-table {
  width: 100%;
}

.otp-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.otp-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.otp-table :deep(.el-table .el-table__row:hover > td) {
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

/* 二维码按钮 */
.qrcode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%);
  border-radius: 6px;
  cursor: pointer;
  color: #00d4ff;
  font-size: 13px;
  transition: all 0.3s ease;
}

.qrcode-btn:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.15) 100%);
  transform: scale(1.05);
}

/* 口令长度 */
.code-length {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 4px;
  color: #67C23A;
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
.otp-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.otp-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 二维码对话框 */
.qrcode-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.qrcode-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.qrcode-container {
  text-align: center;
}

.qrcode-wrapper {
  display: inline-block;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(64, 158, 255, 0.02) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(0, 212, 255, 0.3);
}

.qrcode-icon {
  font-size: 80px;
  color: #00d4ff;
  margin-bottom: 12px;
}

.qrcode-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.qrcode-secret {
  font-size: 13px;
  color: #909399;
}

.qrcode-info {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
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
