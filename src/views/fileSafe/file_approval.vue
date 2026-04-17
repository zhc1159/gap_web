<template>
  <div class="page-container file-approval-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <span class="header-title">{{ $t('fileSafe.file_approval.title') }}</span>
      </div>
      <div class="header-right">
        <el-select v-model="filterDirection" class="direction-select" @change="handleFilterChange">
          <el-option :label="$t('fileSafe.file_approval.intranet')" value="INTRANET" />
          <el-option :label="$t('fileSafe.file_approval.extranet')" value="EXTRANET" />
        </el-select>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('fileSafe.file_approval.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-actions">
            <el-button
              type="success"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchApprove"
            >
              <el-icon><Check /></el-icon>
              {{ $t('fileSafe.file_approval.batchApprove') }}
            </el-button>
            <el-button
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchReject"
            >
              <el-icon><Close /></el-icon>
              {{ $t('fileSafe.file_approval.batchReject') }}
            </el-button>
            <span class="selected-count" v-if="selectedFiles.length > 0">
              {{ $t('fileSafe.file_approval.selectedCount', { count: selectedFiles.length }) }}
            </span>
          </div>

          <!-- 表格区域 -->
          <el-table
            ref="tableRef"
            :data="tableData"
            v-loading="loading"
            class="approval-table"
            @selection-change="handleSelectionChange"
          >
            <!-- 选择列 -->
            <el-table-column type="selection" width="55" align="center" />

            <!-- 文件名 -->
            <el-table-column :label="$t('fileSafe.file_approval.filename')" min-width="200">
              <template #default="{ row }">
                <div class="filename-cell">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="filename-text">{{ row.filename }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 拦截类型 -->
            <el-table-column :label="$t('fileSafe.file_approval.interceptionType')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getInterceptionTagType(row.interceptionType)" size="small" effect="dark">
                  {{ getInterceptionText(row.interceptionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 命中关键字 -->
            <el-table-column :label="$t('fileSafe.file_approval.keyword')" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.keyword" type="warning" size="small" effect="plain">{{ row.keyword }}</el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('fileSafe.file_approval.status')" min-width="90" align="center">
              <template #default>
                <el-tag type="warning" size="small" effect="dark">
                  {{ $t('fileSafe.file_approval.pending') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 发送人 -->
            <el-table-column prop="senderIp" :label="$t('fileSafe.file_approval.sender')" min-width="120">
              <template #default="{ row }">
                <span class="ip-text">{{ row.senderIp }}</span>
              </template>
            </el-table-column>

            <!-- 接收人 -->
            <el-table-column prop="receiver" :label="$t('fileSafe.file_approval.receiver')" min-width="100" />

            <!-- 文件大小 -->
            <el-table-column :label="$t('fileSafe.file_approval.fileSize')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="size-text">{{ formatFileSize(row.fileSize) }}</span>
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column prop="createTime" :label="$t('fileSafe.file_approval.createTime')" min-width="160" />

            <!-- 操作 -->
            <el-table-column :label="$t('fileSafe.file_approval.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="success" size="small" @click="handleApprove(row)">
                    <el-icon><Check /></el-icon>
                    {{ $t('fileSafe.file_approval.allow') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleReject(row)">
                    <el-icon><Close /></el-icon>
                    {{ $t('fileSafe.file_approval.disallow') }}
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="row.fileSize > 200 * 1024 * 1024"
                    @click="handleDownload(row)"
                  >
                    <el-icon><Download /></el-icon>
                    {{ $t('fileSafe.file_approval.download') }}
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
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Clock, InfoFilled, Check, Close, Document, Download } from '@element-plus/icons-vue'

const { t } = useI18n()

// 类型定义
type InterceptionType = 'VIRUS' | 'FILE_TYPE' | 'KEYWORD'
type ApprovalStatus = 'PENDING' | 'PASSED' | 'REJECTED'

interface FileApproval {
  id: string
  filename: string
  interceptionType: InterceptionType
  keyword: string
  status: ApprovalStatus
  senderIp: string
  receiver: string
  fileSize: number
  createTime: string
}

// 响应式数据
const loading = ref(false)
const tableRef = ref()
const selectedFiles = ref<FileApproval[]>([])
const filterDirection = ref('INTRANET')

const tableData = ref<FileApproval[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockData = ref<FileApproval[]>([
  {
    id: '1',
    filename: '项目需求文档_v2.3.docx',
    interceptionType: 'FILE_TYPE',
    keyword: '',
    status: 'PENDING',
    senderIp: '192.168.1.100',
    receiver: '张三',
    fileSize: 2560000,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    filename: 'virus_detected_file.exe',
    interceptionType: 'VIRUS',
    keyword: '',
    status: 'PENDING',
    senderIp: '10.0.0.55',
    receiver: '李四',
    fileSize: 1500000,
    createTime: '2024-01-15 11:45:00'
  },
  {
    id: '3',
    filename: 'confidential_report.pdf',
    interceptionType: 'KEYWORD',
    keyword: '机密',
    status: 'PENDING',
    senderIp: '192.168.2.200',
    receiver: '王五',
    fileSize: 5200000,
    createTime: '2024-01-15 14:20:00'
  },
  {
    id: '4',
    filename: 'install_package.zip',
    interceptionType: 'FILE_TYPE',
    keyword: '',
    status: 'PENDING',
    senderIp: '172.16.0.100',
    receiver: '赵六',
    fileSize: 85000000,
    createTime: '2024-01-15 15:10:00'
  },
  {
    id: '5',
    filename: '敏感数据导出.xlsx',
    interceptionType: 'KEYWORD',
    keyword: '敏感',
    status: 'PENDING',
    senderIp: '192.168.1.150',
    receiver: '孙七',
    fileSize: 1200000,
    createTime: '2024-01-15 16:30:00'
  }
])

// 方法
const getInterceptionTagType = (type: InterceptionType) => {
  const types: Record<InterceptionType, string> = {
    VIRUS: 'danger',
    FILE_TYPE: 'warning',
    KEYWORD: 'info'
  }
  return types[type]
}

const getInterceptionText = (type: InterceptionType) => {
  const texts: Record<InterceptionType, string> = {
    VIRUS: t('fileSafe.file_approval.typeVirus'),
    FILE_TYPE: t('fileSafe.file_approval.typeFileType'),
    KEYWORD: t('fileSafe.file_approval.typeKeyword')
  }
  return texts[type]
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const handleSelectionChange = (selection: FileApproval[]) => {
  selectedFiles.value = selection
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchList()
}

const handleApprove = async (row: FileApproval) => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_approval.approveConfirm', { name: row.filename }),
      t('common.confirm'),
      { type: 'success' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.file_approval.approveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleReject = async (row: FileApproval) => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_approval.rejectConfirm', { name: row.filename }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.file_approval.rejectSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_approval.batchApproveConfirm'),
      t('common.confirm'),
      { type: 'success' }
    )
    const ids = selectedFiles.value.map(f => f.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    tableRef.value?.clearSelection()
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.file_approval.batchApproveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleBatchReject = async () => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_approval.batchRejectConfirm'),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedFiles.value.map(f => f.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    tableRef.value?.clearSelection()
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.file_approval.batchRejectSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleDownload = (row: FileApproval) => {
  if (row.fileSize > 200 * 1024 * 1024) {
    ElNotification({
      title: t('common.warning'),
      message: t('fileSafe.file_approval.downloadSizeLimit'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }
  ElNotification({
    title: t('common.success'),
    message: t('fileSafe.file_approval.downloadSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.file-approval-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(144, 147, 153, 0.02) 0%, rgba(230, 162, 60, 0.02) 100%);
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

.direction-select {
  width: 120px;
}

.direction-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.direction-select :deep(.el-input__inner) {
  color: white;
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.08) 0%, rgba(230, 162, 60, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #909399;
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
  border: 1px solid rgba(144, 147, 153, 0.08);
}

.card-content {
  padding: 20px;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(144, 147, 153, 0.1);
}

.selected-count {
  color: #E6A23C;
  font-size: 14px;
  font-weight: 500;
}

/* 表格样式 */
.approval-table {
  width: 100%;
}

.approval-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(230, 162, 60, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.approval-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.approval-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.03) 0%, rgba(230, 162, 60, 0.03) 100%) !important;
}

/* 文件名单元格 */
.filename-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
  font-size: 16px;
}

.filename-text {
  font-weight: 500;
  color: #303133;
}

/* IP地址 */
.ip-text {
  font-family: 'Courier New', monospace;
  color: #606266;
}

/* 文件大小 */
.size-text {
  font-family: 'Courier New', monospace;
  color: #909399;
}

.empty-text {
  color: #c0c4cc;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 6px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(144, 147, 153, 0.08);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .batch-actions {
    flex-wrap: wrap;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
