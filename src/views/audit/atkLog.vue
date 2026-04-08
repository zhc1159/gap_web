<template>
  <div class="page-container atk-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <span class="header-title">{{ $t('audit.atkLog.title') }}</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleAction">
          <el-button type="primary" class="btn-action">
            <el-icon><Operation /></el-icon>
            {{ $t('common.operation') }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="clear">
                <el-icon><Delete /></el-icon>
                {{ $t('audit.atkLog.clearLog') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('audit.atkLog.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item :label="$t('audit.atkLog.dateRange')">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              :range-separator="$t('common.to')"
              :start-placeholder="$t('common.startDate')"
              :end-placeholder="$t('common.endDate')"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
              class="filter-date"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              {{ $t('common.search') }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-dropdown @command="handleExport">
              <el-button type="success">
                <el-icon><Download /></el-icon>
                {{ $t('common.export') }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="LOG">LOG</el-dropdown-item>
                  <el-dropdown-item command="CSV">CSV</el-dropdown-item>
                  <el-dropdown-item command="HTML">HTML</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip
              :content="$t('audit.atkLog.exportAllOnly')"
              placement="top"
              effect="dark"
            >
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('audit.atkLog.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.delete') }}
            </el-button>
          </div>

          <el-table :data="tableData" v-loading="loading" class="log-table" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="time" :label="$t('audit.atkLog.time')" min-width="180" sortable>
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span>{{ row.time }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" :label="$t('audit.atkLog.warningType')" width="140" align="center">
              <template #default="{ row }">
                <el-tag :type="getAttackType(row.type)" size="small" effect="dark">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sourceIP" :label="$t('audit.atkLog.sourceIP')" width="150">
              <template #default="{ row }">
                <span class="ip-cell">{{ row.sourceIP }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sourcePort" :label="$t('audit.atkLog.sourcePort')" width="100" align="center">
              <template #default="{ row }">
                <span class="port-cell">{{ row.sourcePort }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="destIP" :label="$t('audit.atkLog.destIP')" width="150">
              <template #default="{ row }">
                <span class="ip-cell">{{ row.destIP }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="destPort" :label="$t('audit.atkLog.destPort')" width="100" align="center">
              <template #default="{ row }">
                <span class="port-cell">{{ row.destPort }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="region" :label="$t('audit.atkLog.region')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.region === 'internal' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.region === 'internal' ? $t('audit.atkLog.internal') : $t('audit.atkLog.external') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" :label="$t('audit.atkLog.message')" min-width="200">
              <template #default="{ row }">
                <el-tooltip v-if="row.message && row.message.length > 50" :content="row.message" placement="top">
                  <span class="desc-cell">{{ truncateText(row.message, 50) }}</span>
                </el-tooltip>
                <span v-else class="desc-cell">{{ row.message || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100, 200]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
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
import {
  Warning,
  Operation,
  ArrowDown,
  Delete,
  InfoFilled,
  Search,
  Download,
  Clock
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface AtkLogItem {
  id: string
  time: string
  type: string
  sourceIP: string
  sourcePort: number
  destIP: string
  destPort: number
  region: string
  message: string
}

// 筛选表单
const filterForm = reactive({
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<AtkLogItem[]>([])
const loading = ref(false)
const selectedRows = ref<AtkLogItem[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: t('common.today'),
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: t('common.last7Days'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: t('common.last30Days'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 截断文本
const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 获取攻击类型样式
const getAttackType = (type: string) => {
  const typeMap: Record<string, string> = {
    'DDoS': 'danger',
    'Port Scan': 'warning',
    'SQL Injection': 'danger',
    'XSS': 'warning',
    'Brute Force': 'danger',
    'Malware': 'danger',
    'Buffer Overflow': 'danger',
    'SYN Flood': 'danger',
    'UDP Flood': 'danger',
    'ICMP Flood': 'danger',
    'HTTP Flood': 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取数据（Mock）
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: '1', time: '2026-04-08 10:30:15', type: 'DDoS', sourceIP: '192.168.1.100', sourcePort: 54321, destIP: '10.0.0.50', destPort: 80, region: 'external', message: 'Detected DDoS attack from external network, multiple connection requests detected' },
      { id: '2', time: '2026-04-08 10:28:42', type: 'Port Scan', sourceIP: '192.168.1.101', sourcePort: 45678, destIP: '10.0.0.51', destPort: 22, region: 'external', message: 'Port scanning detected on multiple ports, potential reconnaissance activity' },
      { id: '3', time: '2026-04-08 10:25:33', type: 'SQL Injection', sourceIP: '192.168.1.102', sourcePort: 34567, destIP: '10.0.0.52', destPort: 3306, region: 'internal', message: 'SQL injection attempt detected in database query, malicious payload blocked' },
      { id: '4', time: '2026-04-08 10:20:18', type: 'Brute Force', sourceIP: '192.168.1.103', sourcePort: 23456, destIP: '10.0.0.53', destPort: 22, region: 'external', message: 'Multiple failed login attempts detected, potential brute force attack' },
      { id: '5', time: '2026-04-08 10:15:05', type: 'XSS', sourceIP: '192.168.1.104', sourcePort: 12345, destIP: '10.0.0.54', destPort: 443, region: 'external', message: 'Cross-site scripting attempt blocked, malicious script detected' },
      { id: '6', time: '2026-04-08 10:10:22', type: 'Buffer Overflow', sourceIP: '192.168.1.105', sourcePort: 54322, destIP: '10.0.0.55', destPort: 8080, region: 'external', message: 'Buffer overflow attack detected, oversized payload blocked' },
      { id: '7', time: '2026-04-08 10:05:11', type: 'SYN Flood', sourceIP: '10.0.0.56', sourcePort: 45679, destIP: '192.168.1.200', destPort: 443, region: 'internal', message: 'SYN flood attack detected, connection rate limit triggered' },
      { id: '8', time: '2026-04-08 10:00:08', type: 'UDP Flood', sourceIP: '192.168.1.106', sourcePort: 34568, destIP: '10.0.0.57', destPort: 53, region: 'external', message: 'UDP flood attack targeting DNS server, traffic throttled' },
      { id: '9', time: '2026-04-08 09:55:44', type: 'Malware', sourceIP: '192.168.1.107', sourcePort: 23457, destIP: '10.0.0.58', destPort: 4444, region: 'internal', message: 'Malware communication attempt detected, connection blocked' },
      { id: '10', time: '2026-04-08 09:50:30', type: 'HTTP Flood', sourceIP: '192.168.1.108', sourcePort: 12346, destIP: '10.0.0.59', destPort: 80, region: 'external', message: 'HTTP flood attack detected, request rate exceeded threshold' }
    ]
    pagination.total = 50
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 操作
const handleAction = async (command: string) => {
  if (command === 'clear') {
    try {
      await ElMessageBox.confirm(
        t('audit.atkLog.clearLogConfirm'),
        t('common.warning'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )
      tableData.value = []
      pagination.total = 0
      selectedRows.value = []
      ElNotification({
        title: t('common.success'),
        message: t('audit.atkLog.clearSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
    } catch {
      // cancelled
    }
  }
}

// 导出
const handleExport = async (type: string) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  ElNotification({
    title: t('common.success'),
    message: t('audit.atkLog.exportSuccess') + ` (${type})`,
    type: 'success',
    customClass: 'notification-success'
  })
}

// 选择变化
const handleSelectionChange = (rows: AtkLogItem[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('audit.atkLog.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(row => !ids.includes(row.id))
    pagination.total -= ids.length
    selectedRows.value = []
    ElNotification({
      title: t('common.success'),
      message: t('audit.atkLog.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // cancelled
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.atk-log-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(245, 108, 108, 0.02) 0%, rgba(230, 162, 60, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #F56C6C 0%, #E6A23C 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(245, 108, 108, 0.2);
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

.btn-action {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(230, 162, 60, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
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

/* 筛选卡片 */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.08);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-form :deep(.el-form-item__label) {
  color: #606266;
  font-size: 13px;
}

.filter-date {
  width: 260px;
}

.info-icon {
  margin-left: 8px;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

.info-icon:hover {
  color: #F56C6C;
}

/* 主卡片 */
.main-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.08);
}

.card-content {
  padding: 20px;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(230, 162, 60, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.15);
}

.batch-info {
  font-size: 13px;
  color: #606266;
}

/* 表格样式 */
.log-table {
  width: 100%;
}

.log-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(230, 162, 60, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.log-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.log-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.03) 0%, rgba(230, 162, 60, 0.03) 100%) !important;
}

/* 单元格样式 */
.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  color: #909399;
  font-size: 14px;
}

.ip-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.port-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #909399;
}

.desc-cell {
  color: #303133;
  cursor: default;
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
@media (max-width: 1200px) {
  .filter-form {
    flex-wrap: wrap;
  }

  .filter-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
