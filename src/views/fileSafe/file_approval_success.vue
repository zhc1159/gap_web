<template>
  <div class="page-container file-approval-success-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <span class="header-title">{{ $t('fileSafe.file_approval_success.title') }}</span>
      </div>
      <div class="header-right">
        <el-select v-model="filterDirection" class="direction-select" @change="handleFilterChange">
          <el-option :label="$t('fileSafe.file_approval_success.intranet')" value="INTRANET" />
          <el-option :label="$t('fileSafe.file_approval_success.extranet')" value="EXTRANET" />
        </el-select>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('fileSafe.file_approval_success.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="success-table">
            <!-- 文件名 -->
            <el-table-column :label="$t('fileSafe.file_approval_success.filename')" min-width="200">
              <template #default="{ row }">
                <div class="filename-cell">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="filename-text">{{ row.filename }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 拦截类型 -->
            <el-table-column :label="$t('fileSafe.file_approval_success.interceptionType')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getInterceptionTagType(row.interceptionType)" size="small" effect="dark">
                  {{ getInterceptionText(row.interceptionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 命中关键字 -->
            <el-table-column :label="$t('fileSafe.file_approval_success.keyword')" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.keyword" type="warning" size="small" effect="plain">{{ row.keyword }}</el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('fileSafe.file_approval_success.status')" min-width="90" align="center">
              <template #default>
                <el-tag type="success" size="small" effect="dark">
                  {{ $t('fileSafe.file_approval_success.passed') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 发送人 -->
            <el-table-column prop="senderIp" :label="$t('fileSafe.file_approval_success.sender')" min-width="120">
              <template #default="{ row }">
                <span class="ip-text">{{ row.senderIp }}</span>
              </template>
            </el-table-column>

            <!-- 接收人 -->
            <el-table-column prop="receiver" :label="$t('fileSafe.file_approval_success.receiver')" min-width="100" />

            <!-- 文件大小 -->
            <el-table-column :label="$t('fileSafe.file_approval_success.fileSize')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="size-text">{{ formatFileSize(row.fileSize) }}</span>
              </template>
            </el-table-column>

            <!-- 审核时间 -->
            <el-table-column prop="auditTime" :label="$t('fileSafe.file_approval_success.auditTime')" min-width="160" />
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
import { CircleCheck, InfoFilled, Document } from '@element-plus/icons-vue'

const { t } = useI18n()

// 类型定义
type InterceptionType = 'VIRUS' | 'FILE_TYPE' | 'KEYWORD'

interface FileApprovalPassed {
  id: string
  filename: string
  interceptionType: InterceptionType
  keyword: string
  senderIp: string
  receiver: string
  fileSize: number
  auditTime: string
}

// 响应式数据
const loading = ref(false)
const filterDirection = ref('INTRANET')

const tableData = ref<FileApprovalPassed[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockData = ref<FileApprovalPassed[]>([
  {
    id: '1',
    filename: '项目需求文档_v1.0.docx',
    interceptionType: 'FILE_TYPE',
    keyword: '',
    senderIp: '192.168.1.100',
    receiver: '张三',
    fileSize: 1560000,
    auditTime: '2024-01-14 09:30:00'
  },
  {
    id: '2',
    filename: '财务报表_2024Q1.xlsx',
    interceptionType: 'KEYWORD',
    keyword: '财务',
    senderIp: '10.0.0.55',
    receiver: '李四',
    fileSize: 2500000,
    auditTime: '2024-01-14 11:20:00'
  },
  {
    id: '3',
    filename: '技术方案设计书.pdf',
    interceptionType: 'FILE_TYPE',
    keyword: '',
    senderIp: '192.168.2.200',
    receiver: '王五',
    fileSize: 4500000,
    auditTime: '2024-01-14 14:15:00'
  },
  {
    id: '4',
    filename: '客户资料汇总.xlsx',
    interceptionType: 'KEYWORD',
    keyword: '客户',
    senderIp: '172.16.0.100',
    receiver: '赵六',
    fileSize: 1800000,
    auditTime: '2024-01-14 16:45:00'
  },
  {
    id: '5',
    filename: '安全检测报告_clean.exe',
    interceptionType: 'VIRUS',
    keyword: '',
    senderIp: '192.168.1.150',
    receiver: '孙七',
    fileSize: 5200000,
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
    VIRUS: t('fileSafe.file_approval_success.typeVirus'),
    FILE_TYPE: t('fileSafe.file_approval_success.typeFileType'),
    KEYWORD: t('fileSafe.file_approval_success.typeKeyword')
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
.file-approval-success-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.02) 0%, rgba(144, 147, 153, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #67C23A 0%, #95d475 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.25);
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
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(149, 212, 117, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #67C23A;
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
  border: 1px solid rgba(103, 194, 58, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.success-table {
  width: 100%;
}

.success-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(149, 212, 117, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.success-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.success-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(149, 212, 117, 0.03) 100%) !important;
}

/* 文件名单元格 */
.filename-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #67C23A;
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

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(103, 194, 58, 0.08);
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
