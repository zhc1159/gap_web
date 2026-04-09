<template>
  <div class="page-container defense-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.defenseLog.title') }}</span>
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
                {{ $t('systemManage.defenseLog.actions.clearLog') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.defenseLog.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item :label="$t('systemManage.defenseLog.filter.dateRange')">
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
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="card main-card">
        <div class="card-content">
          <el-table :data="tableData" v-loading="loading" class="log-table" stripe>
            <el-table-column :label="$t('systemManage.defenseLog.table.index')" width="80" align="center">
              <template #default="{ row }">
                <span class="index-badge">{{ row.index }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="content" :label="$t('systemManage.defenseLog.table.content')" min-width="400">
              <template #default="{ row }">
                <span class="log-text">{{ row.content }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" :label="$t('systemManage.defenseLog.table.timestamp')" width="180" align="center">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span>{{ row.timestamp }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="level" :label="$t('systemManage.defenseLog.table.level')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)" size="small" effect="dark">
                  {{ $t(`systemManage.defenseLog.levels.${row.level}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <template #empty>
              <div class="empty-state">
                <el-icon class="empty-icon"><WarningFilled /></el-icon>
                <p>{{ $t('systemManage.defenseLog.table.empty') }}</p>
              </div>
            </template>
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
  Clock,
  WarningFilled
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 日志接口
interface DefenseLogItem {
  id: number
  index: number
  content: string
  timestamp: string
  level: 'info' | 'warning' | 'critical'
}

// 筛选表单
const filterForm = reactive({
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<DefenseLogItem[]>([])
const loading = ref(false)

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

// 级别样式
function getLevelType(level: string): '' | 'warning' | 'danger' {
  switch (level) {
    case 'critical': return 'danger'
    case 'warning': return 'warning'
    default: return ''
  }
}

// 获取数据（Mock）
async function fetchData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: 1, index: 1, content: '[INFO] TCP connection from 10.0.0.100 to 192.168.1.1 established successfully', timestamp: '2026-04-09 10:30:15', level: 'info' },
      { id: 2, index: 2, content: '[WARN] SYN flood detected on port 80, rate exceeded 1000 packets/sec threshold', timestamp: '2026-04-09 10:28:42', level: 'warning' },
      { id: 3, index: 3, content: '[CRIT] Port scan attack blocked from 172.16.0.50, scanned 256 ports in 3 seconds', timestamp: '2026-04-09 10:25:33', level: 'critical' },
      { id: 4, index: 4, content: '[INFO] UDP packet rate normalized on interface eth0, traffic within acceptable range', timestamp: '2026-04-09 10:20:18', level: 'info' },
      { id: 5, index: 5, content: '[WARN] ICMP flood threshold exceeded on external interface, mitigation activated', timestamp: '2026-04-09 10:15:05', level: 'warning' },
      { id: 6, index: 6, content: '[INFO] IPS engine signature database updated to version 2026.04.09', timestamp: '2026-04-09 10:10:22', level: 'info' },
      { id: 7, index: 7, content: '[CRIT] SQL injection attempt detected and blocked from 192.168.1.200', timestamp: '2026-04-09 10:05:11', level: 'critical' },
      { id: 8, index: 8, content: '[WARN] Brute force login attempt detected on SSH port 22, source: 10.0.0.99', timestamp: '2026-04-09 10:00:08', level: 'warning' },
      { id: 9, index: 9, content: '[INFO] DNS query rate returned to normal, throttle policy deactivated', timestamp: '2026-04-09 09:55:44', level: 'info' },
      { id: 10, index: 10, content: '[WARN] XSS attack pattern detected in HTTP request, payload sanitized', timestamp: '2026-04-09 09:50:30', level: 'warning' }
    ]
    pagination.total = 56
  } finally {
    loading.value = false
  }
}

// 查询
function handleSearch() {
  pagination.page = 1
  fetchData()
}

// 操作
async function handleAction(command: string) {
  if (command === 'clear') {
    try {
      await ElMessageBox.confirm(
        t('systemManage.defenseLog.messages.confirmClear'),
        t('systemManage.defenseLog.messages.confirmClearTitle'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )
      tableData.value = []
      pagination.total = 0
      ElNotification({
        title: t('common.success'),
        message: t('systemManage.defenseLog.messages.clearSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
    } catch {
      // cancelled
    }
  }
}

// 分页
function handleSizeChange(size: number) {
  pagination.pageSize = size
  fetchData()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.defense-log-page {
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

/* 表格样式 */
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

.index-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
  font-weight: 600;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.15);
  color: #F56C6C;
}

.log-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  word-break: break-all;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.time-icon {
  color: #909399;
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 12px;
}

.empty-state p {
  color: #909399;
  font-size: 14px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(245, 108, 108, 0.08);
}

@media (max-width: 1200px) {
  .filter-form {
    flex-wrap: wrap;
  }
  .filter-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
