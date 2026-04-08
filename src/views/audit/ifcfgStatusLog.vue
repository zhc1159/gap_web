<template>
  <div class="page-container ifcfg-status-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('audit.ifcfgStatusLog.title') }}</span>
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
                {{ $t('audit.ifcfgStatusLog.clearLog') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('audit.ifcfgStatusLog.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item :label="$t('audit.ifcfgStatusLog.interface')">
            <el-input
              v-model="filterForm.interface"
              :placeholder="$t('audit.ifcfgStatusLog.interfacePlaceholder')"
              clearable
              class="filter-input"
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ifcfgStatusLog.status')">
            <el-select v-model="filterForm.status" :placeholder="$t('common.pleaseSelect')" clearable class="filter-select">
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('audit.ifcfgStatusLog.up')" value="up" />
              <el-option :label="$t('audit.ifcfgStatusLog.down')" value="down" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('audit.ifcfgStatusLog.dateRange')">
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
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('audit.ifcfgStatusLog.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.delete') }}
            </el-button>
          </div>

          <el-table :data="tableData" v-loading="loading" class="log-table" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="date" :label="$t('audit.ifcfgStatusLog.time')" min-width="180" sortable>
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span>{{ row.date }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="interface" :label="$t('audit.ifcfgStatusLog.interface')" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="dark">
                  {{ row.interface }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="oldStatus" :label="$t('audit.ifcfgStatusLog.oldStatus')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.oldStatus === 'up' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.oldStatus === 'up' ? $t('audit.ifcfgStatusLog.up') : $t('audit.ifcfgStatusLog.down') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="newStatus" :label="$t('audit.ifcfgStatusLog.newStatus')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.newStatus === 'up' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.newStatus === 'up' ? $t('audit.ifcfgStatusLog.up') : $t('audit.ifcfgStatusLog.down') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP" width="150">
              <template #default="{ row }">
                <span class="ip-cell">{{ row.ip }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mac" label="MAC" width="150">
              <template #default="{ row }">
                <span class="mac-cell">{{ row.mac }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="describe" :label="$t('audit.ifcfgStatusLog.description')" min-width="200">
              <template #default="{ row }">
                <el-tooltip v-if="row.describe && row.describe.length > 50" :content="row.describe" placement="top">
                  <span class="desc-cell">{{ truncateText(row.describe, 50) }}</span>
                </el-tooltip>
                <span v-else class="desc-cell">{{ row.describe || '-' }}</span>
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
  Connection,
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
interface IfcfgStatusItem {
  id: string
  date: string
  interface: string
  oldStatus: string
  newStatus: string
  ip: string
  mac: string
  describe: string
}

// 筛选表单
const filterForm = reactive({
  interface: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<IfcfgStatusItem[]>([])
const loading = ref(false)
const selectedRows = ref<IfcfgStatusItem[]>([])

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

// 获取数据（Mock）
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: '1', date: '2026-04-08 10:30:15', interface: 'eth0', oldStatus: 'down', newStatus: 'up', ip: '192.168.1.100', mac: '00:1A:2B:3C:4D:5E', describe: 'Interface eth0 brought up, link established successfully' },
      { id: '2', date: '2026-04-08 10:25:42', interface: 'eth1', oldStatus: 'up', newStatus: 'down', ip: '192.168.2.100', mac: '00:1A:2B:3C:4D:5F', describe: 'Interface eth1 link down detected, cable disconnected' },
      { id: '3', date: '2026-04-08 10:20:33', interface: 'eth2', oldStatus: 'down', newStatus: 'up', ip: '10.0.0.100', mac: '00:1A:2B:3C:4D:60', describe: 'Interface eth2 connected, speed 1000Mbps full duplex' },
      { id: '4', date: '2026-04-08 10:15:18', interface: 'eth0', oldStatus: 'up', newStatus: 'up', ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', describe: 'IP address updated from 192.168.1.100 to 192.168.1.101' },
      { id: '5', date: '2026-04-08 10:10:05', interface: 'lo', oldStatus: 'up', newStatus: 'up', ip: '127.0.0.1', mac: '00:00:00:00:00:00', describe: 'Loopback interface verified, status unchanged' },
      { id: '6', date: '2026-04-08 10:05:22', interface: 'eth3', oldStatus: 'down', newStatus: 'up', ip: '172.16.0.50', mac: '00:1A:2B:3C:4D:61', describe: 'Interface eth3 enabled, DHCP client started' },
      { id: '7', date: '2026-04-08 10:00:11', interface: 'eth1', oldStatus: 'down', newStatus: 'up', ip: '192.168.2.100', mac: '00:1A:2B:3C:4D:5F', describe: 'Interface eth1 reconnected, link restored' },
      { id: '8', date: '2026-04-08 09:55:44', interface: 'bond0', oldStatus: 'up', newStatus: 'up', ip: '192.168.1.200', mac: '00:1A:2B:3C:4D:70', describe: 'Bond0 interface status checked, all slaves active' },
      { id: '9', date: '2026-04-08 09:50:30', interface: 'eth0', oldStatus: 'up', newStatus: 'down', ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', describe: 'Interface eth0 going down for maintenance' },
      { id: '10', date: '2026-04-08 09:45:08', interface: 'vlan10', oldStatus: 'down', newStatus: 'up', ip: '10.10.10.1', mac: '00:1A:2B:3C:4D:80', describe: 'VLAN10 interface created and brought up' }
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
        t('audit.ifcfgStatusLog.clearLogConfirm'),
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
        message: t('audit.ifcfgStatusLog.clearSuccess'),
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
    message: t('audit.ifcfgStatusLog.exportSuccess') + ` (${type})`,
    type: 'success',
    customClass: 'notification-success'
  })
}

// 选择变化
const handleSelectionChange = (rows: IfcfgStatusItem[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('audit.ifcfgStatusLog.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(row => !ids.includes(row.id))
    pagination.total -= ids.length
    selectedRows.value = []
    ElNotification({
      title: t('common.success'),
      message: t('audit.ifcfgStatusLog.batchDeleteSuccess'),
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
.ifcfg-status-log-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(144, 147, 153, 0.02) 0%, rgba(96, 98, 102, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(144, 147, 153, 0.2);
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
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.08) 0%, rgba(96, 98, 102, 0.08) 100%);
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

/* 筛选卡片 */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(144, 147, 153, 0.08);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-form :deep(.el-form-item__label) {
  color: #606266;
  font-size: 13px;
}

.filter-input {
  width: 140px;
}

.filter-select {
  width: 120px;
}

.filter-date {
  width: 260px;
}

/* 主卡片 */
.main-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(144, 147, 153, 0.08);
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
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.08) 0%, rgba(96, 98, 102, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(144, 147, 153, 0.15);
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
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(96, 98, 102, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.log-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.log-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.03) 0%, rgba(96, 98, 102, 0.03) 100%) !important;
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

.mac-cell {
  font-family: 'Courier New', monospace;
  font-size: 12px;
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
  border-top: 1px solid rgba(144, 147, 153, 0.08);
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
