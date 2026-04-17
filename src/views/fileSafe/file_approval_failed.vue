<template>
  <div class="page-container file-approval-failed-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><CircleClose /></el-icon>
        </div>
        <span class="header-title">{{ $t('fileSafe.file_approval_failed.title') }}</span>
      </div>
      <div class="header-right">
        <el-select v-model="filterDirection" class="direction-select" @change="handleFilterChange">
          <el-option :label="$t('fileSafe.file_approval_failed.intranet')" value="INTRANET" />
          <el-option :label="$t('fileSafe.file_approval_failed.extranet')" value="EXTRANET" />
        </el-select>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('fileSafe.file_approval_failed.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="failed-table">
            <!-- 文件名 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.filename')" min-width="200">
              <template #default="{ row }">
                <div class="filename-cell">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="filename-text">{{ row.filename }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 拦截类型 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.interceptionType')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getInterceptionTagType(row.interceptionType)" size="small" effect="dark">
                  {{ getInterceptionText(row.interceptionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 命中关键字 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.keyword')" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.keyword" type="danger" size="small" effect="plain">{{ row.keyword }}</el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.status')" min-width="90" align="center">
              <template #default>
                <el-tag type="danger" size="small" effect="dark">
                  {{ $t('fileSafe.file_approval_failed.rejected') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 发送人 -->
            <el-table-column prop="senderIp" :label="$t('fileSafe.file_approval_failed.sender')" min-width="120">
              <template #default="{ row }">
                <span class="ip-text">{{ row.senderIp }}</span>
              </template>
            </el-table-column>

            <!-- 接收人 -->
            <el-table-column prop="receiver" :label="$t('fileSafe.file_approval_failed.receiver')" min-width="100" />

            <!-- 文件大小 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.fileSize')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="size-text">{{ formatFileSize(row.fileSize) }}</span>
              </template>
            </el-table-column>

            <!-- 拒绝原因 -->
            <el-table-column :label="$t('fileSafe.file_approval_failed.rejectReason')" min-width="150">
              <template #default="{ row }">
                <span class="reason-text">{{ row.rejectReason }}</span>
              </template>
            </el-table-column>

            <!-- 审核时间 -->
            <el-table-column prop="auditTime" :label="$t('fileSafe.file_approval_failed.auditTime')" min-width="160" />
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
import { CircleClose, InfoFilled, Document } from '@element-plus/icons-vue'

const { t } = useI18n()

// 类型定义
type InterceptionType = 'VIRUS' | 'FILE_TYPE' | 'KEYWORD'

interface FileApprovalRejected {
  id: string
  filename: string
  interceptionType: InterceptionType
  keyword: string
  senderIp: string
  receiver: string
  fileSize: number
  rejectReason: string
  auditTime: string
}

// 响应式数据
const loading = ref(false)
const filterDirection = ref('INTRANET')

const tableData = ref<FileApprovalRejected[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockData = ref<FileApprovalRejected[]>([
  {
    id: '1',
    filename: 'malware_detected.exe',
    interceptionType: 'VIRUS',
    keyword: '',
    senderIp: '192.168.1.100',
    receiver: '张三',
    fileSize: 3500000,
    rejectReason: '检测到病毒威胁',
    auditTime: '2024-01-14 09:30:00'
  },
  {
    id: '2',
    filename: '敏感数据导出.xlsx',
    interceptionType: 'KEYWORD',
    keyword: '机密',
    senderIp: '10.0.0.55',
    receiver: '李四',
    fileSize: 1200000,
    rejectReason: '包含敏感关键字',
    auditTime: '2024-01-14 11:20:00'
  },
  {
    id: '3',
    filename: 'unauthorized_access.bat',
    interceptionType: 'FILE_TYPE',
    keyword: '',
    senderIp: '192.168.2.200',
    receiver: '王五',
    fileSize: 50000,
    rejectReason: '禁止的文件类型',
    auditTime: '2024-01-14 14:15:00'
  },
  {
    id: '4',
    filename: 'virus_script.vbs',
    interceptionType: 'VIRUS',
    keyword: '',
    senderIp: '172.16.0.100',
    receiver: '赵六',
    fileSize: 85000,
    rejectReason: '检测到恶意脚本',
    auditTime: '2024-01-14 16:45:00'
  },
  {
    id: '5',
    filename: 'password_list.txt',
    interceptionType: 'KEYWORD',
    keyword: '密码',
    senderIp: '192.168.1.150',
    receiver: '孙七',
    fileSize: 15000,
    rejectReason: '包含密码相关信息',
    auditTime: '2024-01-14 17:30:00'
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
    VIRUS: t('fileSafe.file_approval_failed.typeVirus'),
    FILE_TYPE: t('fileSafe.file_approval_failed.typeFileType'),
    KEYWORD: t('fileSafe.file_approval_failed.typeKeyword')
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

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.file-approval-failed-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(245, 108, 108, 0.02) 0%, rgba(144, 147, 153, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(144, 147, 153, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #F56C6C;
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
  border: 1px solid rgba(245, 108, 108, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.failed-table {
  width: 100%;
}

.failed-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(144, 147, 153, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.failed-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.failed-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.03) 0%, rgba(144, 147, 153, 0.03) 100%) !important;
}

/* 文件名单元格 */
.filename-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #F56C6C;
  font-size: 16px;
}

.filename-text {
  font-weight: 500;
  color: #303133;
}

/* IP地址 */
.ip-text {
  font-family: 'Courier New', monospace;
  color: var(--el-text-color-secondary);
}

/* 文件大小 */
.size-text {
  font-family: 'Courier New', monospace;
  color: var(--el-text-color-placeholder);
}

/* 拒绝原因 */
.reason-text {
  color: #F56C6C;
  font-size: 13px;
}

.empty-text {
  color: #c0c4cc;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(245, 108, 108, 0.08);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
