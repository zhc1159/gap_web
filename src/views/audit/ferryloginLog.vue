<template>
  <div class="page-container login-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <span class="header-title">{{ $t('audit.ferryloginLog.title') }}</span>
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
                {{ $t('audit.ferryloginLog.clearLog') }}
              </el-dropdown-item>
              <el-dropdown-item command="import">
                <el-icon><Upload /></el-icon>
                {{ $t('common.import') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('audit.ferryloginLog.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item :label="$t('audit.ferryloginLog.user')">
            <el-input
              v-model="filterForm.userName"
              :placeholder="$t('audit.ferryloginLog.userPlaceholder')"
              clearable
              class="filter-input"
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.ip')">
            <el-input
              v-model="filterForm.ip"
              :placeholder="$t('audit.ferryloginLog.ipPlaceholder')"
              clearable
              class="filter-input"
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.result')">
            <el-select v-model="filterForm.result" :placeholder="$t('common.pleaseSelect')" clearable class="filter-select">
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('common.failed')" value="0" />
              <el-option :label="$t('common.success')" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.description')">
            <el-input
              v-model="filterForm.describe"
              :placeholder="$t('audit.ferryloginLog.descPlaceholder')"
              clearable
              class="filter-input"
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.dateRange')">
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
            <span class="batch-info">{{ $t('audit.ferryloginLog.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.delete') }}
            </el-button>
          </div>

          <el-table :data="tableData" v-loading="loading" class="log-table" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="date" :label="$t('audit.ferryloginLog.time')" min-width="180" sortable>
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span>{{ row.date }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="region" :label="$t('audit.ferryloginLog.region')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.region === 'internal' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.region === 'internal' ? $t('audit.ferryloginLog.internal') : $t('audit.ferryloginLog.external') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="user" :label="$t('audit.ferryloginLog.user')" width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-icon class="user-icon"><User /></el-icon>
                  <span>{{ row.user }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="ip" :label="$t('audit.ferryloginLog.ip')" width="150">
              <template #default="{ row }">
                <span class="ip-cell">{{ row.ip }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="operate" :label="$t('audit.ferryloginLog.operation')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getOperateTagType(row.operate)" size="small" effect="plain">
                  {{ row.operate }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" :label="$t('audit.ferryloginLog.result')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.result ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.result ? $t('common.success') : $t('common.failed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="describe" :label="$t('audit.ferryloginLog.description')" min-width="200">
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
  UserFilled,
  Operation,
  ArrowDown,
  Delete,
  Upload,
  InfoFilled,
  Search,
  Download,
  Clock,
  User
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface LoginLogItem {
  id: string
  date: string
  region: string
  user: string
  ip: string
  operate: string
  result: boolean
  describe: string
}

// 筛选表单
const filterForm = reactive({
  userName: '',
  ip: '',
  result: '',
  describe: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<LoginLogItem[]>([])
const loading = ref(false)
const selectedRows = ref<LoginLogItem[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
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

// 操作类型标签
const getOperateTagType = (operate: string) => {
  const typeMap: Record<string, string> = {
    LOGIN: 'primary',
    LOGOUT: 'info'
  }
  return typeMap[operate] || ''
}

// 获取数据（Mock）
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: '1', date: '2026-04-08 10:30:15', region: 'internal', user: 'admin', ip: '192.168.1.100', operate: 'LOGIN', result: true, describe: '用户登录成功' },
      { id: '2', date: '2026-04-08 10:28:42', region: 'external', user: 'operator', ip: '10.0.0.50', operate: 'LOGIN', result: false, describe: '密码错误，登录失败' },
      { id: '3', date: '2026-04-08 10:25:33', region: 'internal', user: 'admin', ip: '192.168.1.101', operate: 'LOGOUT', result: true, describe: '用户退出登录' },
      { id: '4', date: '2026-04-08 10:20:18', region: 'external', user: 'guest', ip: '10.0.0.51', operate: 'LOGIN', result: true, describe: '访客用户登录成功' },
      { id: '5', date: '2026-04-08 10:15:05', region: 'internal', user: 'operator', ip: '192.168.1.102', operate: 'LOGIN', result: true, describe: '操作员从内网登录' },
      { id: '6', date: '2026-04-08 10:10:22', region: 'external', user: 'admin', ip: '172.16.0.10', operate: 'LOGIN', result: true, describe: '管理员从外网登录' },
      { id: '7', date: '2026-04-08 10:05:11', region: 'internal', user: 'operator', ip: '192.168.1.103', operate: 'LOGOUT', result: true, describe: '操作员退出登录' },
      { id: '8', date: '2026-04-08 10:00:08', region: 'external', user: 'admin', ip: '10.0.0.52', operate: 'LOGIN', result: false, describe: '账户被锁定，登录失败' },
      { id: '9', date: '2026-04-08 09:55:44', region: 'internal', user: 'guest', ip: '192.168.1.104', operate: 'LOGIN', result: true, describe: '访客用户登录成功' },
      { id: '10', date: '2026-04-08 09:50:30', region: 'external', user: 'operator', ip: '172.16.0.20', operate: 'LOGOUT', result: true, describe: '操作员退出登录' }
    ]
    pagination.total = 65
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
        t('audit.ferryloginLog.clearLogConfirm'),
        t('common.warning'),
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
        message: t('audit.ferryloginLog.clearSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
    } catch {
      // cancelled
    }
  } else if (command === 'import') {
    ElNotification({
      title: t('common.info'),
      message: t('audit.ferryloginLog.importHint'),
      type: 'info'
    })
  }
}

// 导出
const handleExport = async (type: string) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  ElNotification({
    title: t('common.success'),
    message: t('audit.ferryloginLog.exportSuccess') + ` (${type})`,
    type: 'success',
    customClass: 'notification-success'
  })
}

// 选择变化
const handleSelectionChange = (rows: LoginLogItem[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('audit.ferryloginLog.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(row => !ids.includes(row.id))
    pagination.total -= ids.length
    ElNotification({
      title: t('common.success'),
      message: t('audit.ferryloginLog.batchDeleteSuccess'),
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
.login-log-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(144, 147, 153, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: var(--el-text-color-placeholder);
  font-size: 16px;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

/* 筛选卡片 */
.filter-card {
  background: var(--card-bg);
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
  color: var(--el-text-color-secondary);
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
  background: var(--card-bg);
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
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.08) 0%, rgba(144, 147, 153, 0.08) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.15);
}

.batch-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 表格样式 */
.log-table {
  width: 100%;
}

.log-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.log-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.log-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

/* 单元格样式 */
.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-icon {
  color: #409EFF;
  font-size: 14px;
}

.ip-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.desc-cell {
  color: var(--el-text-color-primary);
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
