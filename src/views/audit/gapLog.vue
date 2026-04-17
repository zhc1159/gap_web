<template>
  <div class="page-container gap-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Document /></el-icon>
        </div>
        <span class="header-title">{{ $t('audit.gapLog.title') }}</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleAction">
          <el-button type="primary" class="btn-action">
            <el-icon><Plus /></el-icon>
            {{ $t('common.operation') }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="clear">
                <el-icon><Delete /></el-icon>
                {{ $t('audit.gapLog.clearLog') }}
              </el-dropdown-item>
              <el-dropdown-item command="import">
                <el-icon><Upload /></el-icon>
                {{ $t('audit.gapLog.importLog') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('audit.gapLog.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item :label="$t('audit.gapLog.user')">
            <el-select
              v-model="filterForm.userId"
              :placeholder="$t('common.pleaseSelect')"
              clearable
              class="filter-select"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option
                v-for="user in userList"
                :key="user.value"
                :label="user.label"
                :value="user.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('audit.gapLog.result')">
            <el-select
              v-model="filterForm.result"
              :placeholder="$t('common.pleaseSelect')"
              clearable
              class="filter-select"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('common.failed')" value="0" />
              <el-option :label="$t('common.success')" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('audit.gapLog.description')">
            <el-input
              v-model="filterForm.describ"
              :placeholder="$t('audit.gapLog.descPlaceholder')"
              clearable
              class="filter-input"
            />
          </el-form-item>
          <el-form-item :label="$t('audit.gapLog.dateRange')">
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
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('audit.gapLog.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.delete') }}
            </el-button>
          </div>
          <el-table :data="tableData" v-loading="loading" class="log-table" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="date" :label="$t('audit.gapLog.time')" width="220" sortable>
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span>{{ formatDate(row.date) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sip" :label="$t('audit.gapLog.sourceIP')" width="150">
              <template #default="{ row }">
                <span class="ip-cell">{{ row.sip }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="region" :label="$t('audit.gapLog.region')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.region === 'internal' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.region === 'internal' ? $t('audit.gapLog.internal') : $t('audit.gapLog.external') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="user" :label="$t('audit.gapLog.userLabel')" width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-icon class="user-icon"><User /></el-icon>
                  <span>{{ row.user }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="result" :label="$t('audit.gapLog.result')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.result ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.result ? $t('common.success') : $t('common.failed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="describe" :label="$t('audit.gapLog.description')" min-width="200">
              <template #default="{ row }">
                <el-tooltip v-if="row.describe && row.describe.length > 50" :content="row.describe" placement="top">
                  <span class="desc-cell">{{ truncateText(row.describe, 50) }}</span>
                </el-tooltip>
                <span v-else class="desc-cell">{{ row.describe || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="failReason" :label="$t('audit.gapLog.failReason')" min-width="150">
              <template #default="{ row }">
                <span :class="['fail-reason', { 'has-reason': row.failReason }]">
                  {{ row.failReason || '-' }}
                </span>
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
  Document,
  Plus,
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
interface GapLogItem {
  id: string
  date: string
  sip: string
  region: 'internal' | 'external'
  user: string
  result: boolean
  describe: string
  failReason: string
}

// 筛选表单
const filterForm = reactive({
  userId: '',
  result: '',
  describ: '',
  dateRange: [] as string[]
})

// 用户列表
const userList = ref<Array<{ label: string; value: string }>>([
  { label: 'admin', value: 'admin' },
  { label: 'operator', value: 'operator' },
  { label: 'guest', value: 'guest' }
])

// 表格数据
const tableData = ref<GapLogItem[]>([])
const loading = ref(false)
const selectedRows = ref<GapLogItem[]>([])

// 选择变化
const handleSelectionChange = (rows: GapLogItem[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('audit.gapLog.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(row => !ids.includes(row.id))
    pagination.total -= ids.length
    ElNotification({
      title: t('common.success'),
      message: t('audit.gapLog.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // cancelled
  }
}

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

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

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
      {
        id: '1',
        date: '2026-04-08 10:30:15',
        sip: '192.168.1.100',
        region: 'internal',
        user: 'admin',
        result: true,
        describe: '用户登录成功',
        failReason: ''
      },
      {
        id: '2',
        date: '2026-04-08 10:28:42',
        sip: '192.168.1.101',
        region: 'external',
        user: 'operator',
        result: false,
        describe: '配置修改失败',
        failReason: '权限不足'
      },
      {
        id: '3',
        date: '2026-04-08 10:25:33',
        sip: '192.168.1.102',
        region: 'internal',
        user: 'admin',
        result: true,
        describe: '系统配置更新',
        failReason: ''
      },
      {
        id: '4',
        date: '2026-04-08 10:20:18',
        sip: '10.0.0.50',
        region: 'external',
        user: 'guest',
        result: false,
        describe: '访问被拒绝',
        failReason: '无效凭证'
      },
      {
        id: '5',
        date: '2026-04-08 10:15:05',
        sip: '192.168.1.103',
        region: 'internal',
        user: 'operator',
        result: true,
        describe: '文件同步已启动',
        failReason: ''
      }
    ]
    pagination.total = 100
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
        t('audit.gapLog.clearLogConfirm'),
        t('common.warning'),
        { type: 'warning' }
      )
      tableData.value = []
      pagination.total = 0
      ElNotification({
        title: t('common.success'),
        message: t('audit.gapLog.clearSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
    } catch {
      // cancelled
    }
  } else if (command === 'import') {
    ElNotification({
      title: t('common.info'),
      message: t('audit.gapLog.importHint'),
      type: 'info'
    })
  }
}

// 导出
const handleExport = async (type: string) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  ElNotification({
    title: t('common.success'),
    message: `${t('audit.gapLog.exportSuccess')} (${type})`,
    type: 'success',
    customClass: 'notification-success'
  })
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
.gap-log-page {
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
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
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

/* 筛选卡片 */
.filter-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-form :deep(.el-form-item__label) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.filter-select {
  width: 140px;
}

.filter-input {
  width: 180px;
}

.filter-date {
  width: 260px;
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
.log-table {
  width: 100%;
}

.log-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.log-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.log-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
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

.ip-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
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

.desc-cell {
  color: #303133;
  cursor: default;
}

.fail-reason {
  color: #c0c4cc;
  font-size: 13px;
}

.fail-reason.has-reason {
  color: #f56c6c;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
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
