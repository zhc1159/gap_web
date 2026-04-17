<template>
  <div class="page-container admin-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('authorityManage.userIpShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('authorityManage.userIpShow.add') }}
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
            <span class="batch-info">{{ $t('authorityManage.userIpShow.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>

          <el-table :data="ipList" v-loading="loading" class="ip-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column :label="$t('authorityManage.userIpShow.ipAddress')" min-width="200">
              <template #default="{ row }">
                <div class="ip-cell">
                  <el-icon class="ip-icon"><Location /></el-icon>
                  <span :class="['ip-tag', row.ip === '*' ? 'all' : 'specific']">
                    {{ row.ip === '*' ? $t('authorityManage.userIpShow.allAddress') : row.ip }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="username" :label="$t('authorityManage.userIpShow.username')" min-width="150">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-icon class="user-icon"><User /></el-icon>
                  <span>{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('authorityManage.userIpShow.actions')" min-width="150">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" type="primary" @click="openEditDialog(row)">
                    {{ $t('authorityManage.userIpShow.edit') }}
                  </el-button>
                  <el-button
                    v-if="!isProtectedUser(row.username)"
                    size="small"
                    type="danger"
                    @click="deleteIp(row)"
                  >
                    {{ $t('authorityManage.userIpShow.delete') }}
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
      :title="dialogType === 'add' ? $t('authorityManage.userIpShow.add') : $t('authorityManage.userIpShow.edit')"
      width="500px"
      class="ip-dialog"
    >
      <el-form :model="ipForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('authorityManage.userIpShow.username')" prop="username">
          <el-select v-model="ipForm.username" style="width: 100%" :disabled="dialogType === 'edit'">
            <el-option
              v-for="user in userList"
              :key="user"
              :label="user"
              :value="user"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('authorityManage.userIpShow.ipType')" prop="ipType">
          <el-radio-group v-model="ipForm.ipType">
            <el-radio :value="1">{{ $t('authorityManage.userIpShow.allAddress') }}</el-radio>
            <el-radio :value="2">{{ $t('authorityManage.userIpShow.specificAddress') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="ipForm.ipType === 2" :label="$t('authorityManage.userIpShow.ipAddress')" prop="ip">
          <el-input v-model="ipForm.ip" :placeholder="$t('authorityManage.userIpShow.ipPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="saveIp">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Monitor, Plus, Location, User, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface UserIp {
  id: number
  ip: string
  username: string
}

interface IpFormData {
  username: string
  ipType: number
  ip: string
}

// 受保护用户列表
const PROTECTED_USERS = ['admin', 'sysadm', 'auditor']

// 状态
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const selectedRows = ref<UserIp[]>([])

// 模拟数据
const ipList = ref<UserIp[]>([
  { id: 1, ip: '192.168.1.100', username: 'admin' },
  { id: 2, ip: '*', username: 'sysadm' },
  { id: 3, ip: '192.168.1.101', username: 'user1' },
  { id: 4, ip: '10.0.0.50', username: 'operator' },
  { id: 5, ip: '*', username: 'auditor' }
])

const userList = ref<string[]>(['admin', 'sysadm', 'operator', 'user1', 'user2', 'auditor'])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5
})

const ipForm = reactive<IpFormData>({
  username: '',
  ipType: 1,
  ip: ''
})

const formRules: FormRules = {
  username: [
    { required: true, message: t('authorityManage.userIpShow.usernameRequired'), trigger: 'change' }
  ],
  ipType: [
    { required: true, message: t('authorityManage.userIpShow.ipTypeRequired'), trigger: 'change' }
  ],
  ip: [
    { required: true, message: t('authorityManage.userIpShow.ipRequired'), trigger: 'blur' }
  ]
}

// 方法
const isProtectedUser = (username: string): boolean => {
  return PROTECTED_USERS.includes(username)
}

const openAddDialog = () => {
  dialogType.value = 'add'
  ipForm.username = ''
  ipForm.ipType = 1
  ipForm.ip = ''
  dialogVisible.value = true
}

const openEditDialog = (item: UserIp) => {
  dialogType.value = 'edit'
  ipForm.username = item.username
  ipForm.ipType = item.ip === '*' ? 1 : 2
  ipForm.ip = item.ip === '*' ? '' : item.ip
  dialogVisible.value = true
}

const saveIp = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (ipForm.ipType === 2 && !ipForm.ip) {
        ElNotification({
          title: t('common.tip'),
          message: t('authorityManage.userIpShow.ipRequired'),
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
          message: t('authorityManage.userIpShow.saveSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      }, 1000)
    }
  })
}

const deleteIp = async (item: UserIp) => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.userIpShow.deleteConfirm', { ip: item.ip }),
      t('common.confirm'),
      { type: 'warning' }
    )
    ipList.value = ipList.value.filter(i => i.id !== item.id)
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.userIpShow.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSelectionChange = (rows: UserIp[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('authorityManage.userIpShow.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    ipList.value = ipList.value.filter(i => !ids.includes(i.id))
    selectedRows.value = []
    pagination.total = ipList.value.length
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.userIpShow.batchDeleteSuccess'),
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
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.ip-table {
  width: 100%;
}

.ip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.ip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.ip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.ip-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-icon {
  color: #409EFF;
}

.ip-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.ip-tag.all {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.1) 100%);
  color: #00d4ff;
  font-weight: 500;
}

.ip-tag.specific {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  color: #67C23A;
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
  color: var(--el-text-color-secondary);
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
.ip-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.ip-dialog :deep(.el-dialog__body) {
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
