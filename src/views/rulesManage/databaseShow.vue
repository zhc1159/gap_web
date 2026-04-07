<template>
  <div class="page-container database-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <span class="header-title">{{ $t('rulesManage.databaseShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('rulesManage.databaseShow.addDatabase') }}
        </el-button>
        <el-button type="success" class="btn-sync" @click="goToDatabaseSync">
          <el-icon><Link /></el-icon>
          {{ $t('rulesManage.databaseShow.goToSync') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('rulesManage.databaseShow.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="database-table">
            <!-- 数据库名称 -->
            <el-table-column prop="name" :label="$t('rulesManage.databaseShow.databaseName')" min-width="150">
              <template #default="{ row }">
                <div class="db-name">
                  <el-icon><Coin /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 数据库类型 -->
            <el-table-column prop="type" :label="$t('rulesManage.databaseShow.databaseType')" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getDbTagType(row.type)" effect="dark" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 主机地址 -->
            <el-table-column :label="$t('rulesManage.databaseShow.hostAddress')" min-width="180">
              <template #default="{ row }">
                <span class="connection-info">{{ row.host }}:{{ row.port }}</span>
              </template>
            </el-table-column>

            <!-- 用户名 -->
            <el-table-column prop="username" :label="$t('rulesManage.databaseShow.username')" min-width="120" />

            <!-- 状态 -->
            <el-table-column prop="status" :label="$t('rulesManage.databaseShow.status')" min-width="100" align="center">
              <template #default="{ row }">
                <div class="status-wrapper" :class="row.status.toLowerCase()">
                  <span class="status-dot"></span>
                  {{ getStatusText(row.status) }}
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('rulesManage.databaseShow.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('rulesManage.databaseShow.edit') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleTest(row)">
                    <el-icon><Connection /></el-icon>
                    {{ $t('rulesManage.databaseShow.testConnection') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('rulesManage.databaseShow.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('rulesManage.databaseShow.editDialog') : $t('rulesManage.databaseShow.addDialog')"
      width="550px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('rulesManage.databaseShow.databaseName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('rulesManage.databaseShow.databaseNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('rulesManage.databaseShow.databaseType')" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option label="Oracle" value="Oracle" />
            <el-option label="MySQL" value="MySQL" />
            <el-option label="PostgreSQL" value="PostgreSQL" />
            <el-option label="Dameng" value="Dameng" />
            <el-option label="Sybase" value="Sybase" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('rulesManage.databaseShow.host')" prop="host">
          <el-input v-model="formData.host" :placeholder="$t('rulesManage.databaseShow.hostPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('rulesManage.databaseShow.port')" prop="port">
          <el-input-number v-model="formData.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('rulesManage.databaseShow.username')" prop="username">
          <el-input v-model="formData.username" :placeholder="$t('rulesManage.databaseShow.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('rulesManage.databaseShow.password')" prop="password">
          <el-input v-model="formData.password" type="password" show-password :placeholder="$t('rulesManage.databaseShow.passwordPlaceholder')" />
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Coin, Plus, InfoFilled, Edit, Delete, Connection, Link } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()
const router = useRouter()

// 类型定义
type DatabaseType = 'Oracle' | 'MySQL' | 'PostgreSQL' | 'Dameng' | 'Sybase'
type DatabaseStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'

interface Database {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  username: string
  password?: string
  status: DatabaseStatus
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 模拟数据
const mockData = ref<Database[]>([
  {
    id: '1',
    name: 'production_oracle',
    type: 'Oracle',
    host: '192.168.1.100',
    port: 1521,
    username: 'system',
    status: 'ONLINE'
  },
  {
    id: '2',
    name: 'hr_mysql',
    type: 'MySQL',
    host: '10.0.0.50',
    port: 3306,
    username: 'root',
    status: 'ONLINE'
  },
  {
    id: '3',
    name: 'analytics_postgres',
    type: 'PostgreSQL',
    host: '172.16.0.10',
    port: 5432,
    username: 'postgres',
    status: 'OFFLINE'
  },
  {
    id: '4',
    name: 'government_dameng',
    type: 'Dameng',
    host: '192.168.100.200',
    port: 5236,
    username: 'SYSDBA',
    status: 'ONLINE'
  },
  {
    id: '5',
    name: 'legacy_sybase',
    type: 'Sybase',
    host: '10.10.10.5',
    port: 5000,
    username: 'sa',
    status: 'UNKNOWN'
  }
])

const tableData = ref<Database[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<Database>({
  id: '',
  name: '',
  type: 'MySQL',
  host: '',
  port: 3306,
  username: '',
  status: 'UNKNOWN'
})

const formRules: FormRules = {
  name: [{ required: true, message: t('rulesManage.databaseShow.databaseNameRequired'), trigger: 'blur' }],
  type: [{ required: true, message: t('rulesManage.databaseShow.databaseTypeRequired'), trigger: 'change' }],
  host: [{ required: true, message: t('rulesManage.databaseShow.hostRequired'), trigger: 'blur' }],
  port: [{ required: true, message: t('rulesManage.databaseShow.portRequired'), trigger: 'blur' }]
}

// 列表方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    type: 'MySQL',
    host: '',
    port: 3306,
    username: '',
    status: 'UNKNOWN'
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Database) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleTest = (_row: Database) => {
  ElNotification({
    title: t('common.success'),
    message: t('rulesManage.databaseShow.connectionSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const handleDelete = async (row: Database) => {
  try {
    await ElMessageBox.confirm(
      t('rulesManage.databaseShow.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter((d: Database) => d.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('rulesManage.databaseShow.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleSubmit = () => {
  submitLoading.value = true
  setTimeout(() => {
    submitLoading.value = false
    dialogVisible.value = false
    ElNotification({
      title: t('common.success'),
      message: isEdit.value ? t('rulesManage.databaseShow.editSuccess') : t('rulesManage.databaseShow.addSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
    fetchList()
  }, 1000)
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const goToDatabaseSync = () => {
  router.push('/databaseSafe/database_accessControl')
}

const getDbTagType = (type: DatabaseType) => {
  const types: Record<DatabaseType, string> = {
    Oracle: 'danger',
    MySQL: 'primary',
    PostgreSQL: 'success',
    Dameng: 'warning',
    Sybase: 'info'
  }
  return types[type]
}

const getStatusText = (status: DatabaseStatus) => {
  const texts: Record<DatabaseStatus, string> = {
    ONLINE: t('rulesManage.databaseShow.online'),
    OFFLINE: t('rulesManage.databaseShow.offline'),
    UNKNOWN: t('rulesManage.databaseShow.unknown')
  }
  return texts[status]
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.database-page {
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  color: white;
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

.header-right {
  display: flex;
  gap: 12px;
}

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-sync {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
}

.btn-sync:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
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
.database-table {
  width: 100%;
}

.database-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.database-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.database-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 数据库名称 */
.db-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

/* 连接信息 */
.connection-info {
  font-family: 'Courier New', monospace;
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

/* 状态样式 */
.status-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
}

.status-wrapper.online .status-dot {
  background: #67c23a;
  animation: pulse 2s ease-in-out infinite;
}

.status-wrapper.offline .status-dot {
  background: #f56c6c;
}

.status-wrapper.unknown .status-dot {
  background: #909399;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 400px;
  margin: 0 auto;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
