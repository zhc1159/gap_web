<template>
  <div class="page-container port-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('transparentRule.port.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('transparentRule.port.addGroup') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('transparentRule.port.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-bar" v-if="selectedRows.length > 0">
            <span class="batch-info">{{ t('transparentRule.port.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="port-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <!-- 端口组名称 -->
            <el-table-column prop="name" :label="$t('transparentRule.port.groupName')" min-width="200">
              <template #default="{ row }">
                <span class="group-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- 端口范围 -->
            <el-table-column prop="portRange" :label="$t('transparentRule.port.portRange')" min-width="600">
              <template #default="{ row }">
                <el-tooltip v-if="row.portRange && row.portRange.length > 80" :content="row.portRange" placement="top">
                  <span class="port-text">{{ truncateText(row.portRange, 80) }}</span>
                </el-tooltip>
                <span v-else class="port-text">{{ row.portRange || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('transparentRule.port.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('transparentRule.port.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('transparentRule.port.delete') }}
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
      :title="isEdit ? $t('transparentRule.port.editDialog') : $t('transparentRule.port.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('transparentRule.port.groupName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('transparentRule.port.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
            @input="handleNameInput"
          />
        </el-form-item>

        <el-form-item :label="$t('transparentRule.port.portRange')" prop="portRange">
          <div class="port-input-wrapper">
            <!-- 端口输入框 -->
            <el-input
              v-model="formData.portRange"
              type="textarea"
              :rows="3"
              :placeholder="$t('transparentRule.port.portInputPlaceholder')"
              maxlength="512"
              show-word-limit
              @input="handlePortInput"
            />

            <!-- 端口预览 -->
            <div class="port-preview" v-if="parsedPorts.length > 0">
              <div class="preview-title">{{ $t('transparentRule.port.preview') }}</div>
              <div class="preview-content">
                <el-tag
                  v-for="(port, index) in parsedPorts"
                  :key="index"
                  :type="port.valid ? 'success' : 'danger'"
                  size="small"
                  class="port-tag"
                >
                  {{ formatPort(port) }}
                </el-tag>
              </div>
            </div>

            <div class="port-hint">
              {{ $t('transparentRule.port.portFormatHint') }}
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit" :disabled="!hasValidPorts">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface ParsedPort {
  type: 'single' | 'range'
  value: number | [number, number]
  valid: boolean
  error?: string
}

interface PortGroup {
  id: string
  name: string
  portRange: string
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// 模拟数据
const mockData = ref<PortGroup[]>([
  {
    id: '1',
    name: 'web_services',
    portRange: '80, 443, 8080-8089'
  },
  {
    id: '2',
    name: 'database_ports',
    portRange: '3306, 5432, 1521, 1433'
  },
  {
    id: '3',
    name: 'ftp_services',
    portRange: '20-21, 990, 2110-2120'
  },
  {
    id: '4',
    name: 'ssh_telnet',
    portRange: '22, 23'
  }
])

const tableData = ref<PortGroup[]>([])

const selectedRows = ref<PortGroup[]>([])

const handleSelectionChange = (rows: PortGroup[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.port.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.port.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  name: '',
  portRange: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('transparentRule.port.groupNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('transparentRule.port.groupNamePattern'), trigger: 'blur' },
    { max: 31, message: t('transparentRule.port.groupNameMaxLength'), trigger: 'blur' }
  ],
  portRange: [
    { required: true, message: t('transparentRule.port.portRangeRequired'), trigger: 'blur' }
  ]
}

// 解析端口
const parsedPorts = computed<ParsedPort[]>(() => {
  if (!formData.portRange) return []

  const parts = formData.portRange.split(',').filter(p => p.trim())
  return parts.map(part => {
    const trimmed = part.trim()

    // 检查是否是范围格式
    if (trimmed.includes('-')) {
      const rangeParts = trimmed.split('-')
      if (rangeParts.length !== 2) {
        return { type: 'range' as const, value: [0, 0], valid: false, error: 'Invalid format' }
      }

      const start = parseInt(rangeParts[0].trim())
      const end = parseInt(rangeParts[1].trim())

      if (isNaN(start) || isNaN(end)) {
        return { type: 'range' as const, value: [start, end], valid: false, error: 'Invalid range' }
      }

      if (start < 1 || start > 65535 || end < 1 || end > 65535) {
        return { type: 'range' as const, value: [start, end], valid: false, error: 'Port out of range' }
      }

      if (start >= end) {
        return { type: 'range' as const, value: [start, end], valid: false, error: 'Start must be less than end' }
      }

      return { type: 'range' as const, value: [start, end], valid: true }
    }

    // 单个端口
    const port = parseInt(trimmed)

    if (isNaN(port)) {
      return { type: 'single' as const, value: port, valid: false, error: 'Invalid port' }
    }

    if (port < 1 || port > 65535) {
      return { type: 'single' as const, value: port, valid: false, error: 'Port out of range' }
    }

    return { type: 'single' as const, value: port, valid: true }
  })
})

// 是否有有效端口
const hasValidPorts = computed(() =>
  parsedPorts.value.length > 0 && parsedPorts.value.some(p => p.valid)
)

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
  formData.name = ''
  formData.portRange = ''
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: PortGroup) => {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name
  formData.portRange = row.portRange
  dialogVisible.value = true
}

const handleDelete = async (row: PortGroup) => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.port.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.port.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleNameInput = (value: string) => {
  formData.name = value.replace(/[^a-zA-Z0-9_]/g, '')
}

const handlePortInput = (value: string) => {
  // 只允许数字、逗号、横杠
  formData.portRange = value.replace(/[^0-9,\-]/g, '')
}

const handleSubmit = () => {
  if (!formRef.value) return

  // 检查是否有有效的端口
  if (!hasValidPorts.value) {
    ElNotification({
      title: t('common.warning'),
      message: t('transparentRule.port.noValidPort'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        const portRange = parsedPorts.value
          .filter(p => p.valid)
          .map(p => formatPort(p))
          .join(', ')

        if (isEdit.value) {
          const index = mockData.value.findIndex(item => item.id === editingId.value)
          if (index !== -1) {
            mockData.value[index] = {
              id: editingId.value,
              name: formData.name,
              portRange
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            name: formData.name,
            portRange
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('transparentRule.port.editSuccess') : t('transparentRule.port.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

// 工具函数
const formatPort = (port: ParsedPort): string => {
  if (port.type === 'range') {
    const [start, end] = port.value as [number, number]
    return `${start}-${end}`
  }
  return String(port.value)
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.port-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #00d4ff;
  font-size: 16px;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.port-table {
  width: 100%;
}

.port-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.port-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.port-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #00d4ff;
}

/* 端口文本 */
.port-text {
  font-family: 'Courier New', monospace;
  color: #00d9ff;
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
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
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 100%;
}

/* 端口输入区域包装器 */
.port-input-wrapper {
  width: 100%;
}

/* 端口预览 */
.port-preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 212, 255, 0.02);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.preview-title {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}

.preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.port-tag {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 端口格式提示 */
.port-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.6;
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

  .action-btns {
    flex-direction: column;
  }
}
</style>
