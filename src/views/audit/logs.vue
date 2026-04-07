<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('audit.logs.describe') }}</div>
      <div class="page-util">
        <el-form :model="filterForm" inline class="form-label">
          <el-form-item :label="$t('audit.logs.dateRange')">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              :range-separator="$t('common.to')"
              :start-placeholder="$t('common.startDate')"
              :end-placeholder="$t('common.endDate')"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item>
            <div class="page-button">
              <el-button type="primary" @click="handleSearch">
                {{ $t('common.search') }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-dropdown @command="handleAction">
              <el-button type="info">
                {{ $t('common.operation') }} <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="clear">
                    {{ $t('audit.logs.clearLog') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>

          <el-form-item>
            <el-dropdown @command="handleExport" class="show-msg" placement="top">
              <el-button type="success">
                {{ $t('common.export') }} <el-icon><ArrowDown /></el-icon>
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
              :content="$t('audit.logs.exportAllOnly')"
              placement="top"
              effect="dark"
            >
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </div>

      <div class="page-table">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="time" :label="$t('audit.logs.time')" width="180" sortable />
          <el-table-column prop="level" :label="$t('audit.logs.level')" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="source" :label="$t('audit.logs.source')" width="150" />
          <el-table-column prop="module" :label="$t('audit.logs.module')" width="120" />
          <el-table-column prop="message" :label="$t('audit.logs.message')" show-overflow-tooltip />
          <el-table-column :label="$t('audit.logs.actions')" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" link @click="handleViewDetail(row)">
                {{ $t('audit.logs.viewDetail') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
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

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('audit.logs.detailTitle')"
      width="700px"
      class="dialog-body-custom"
    >
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item :label="$t('audit.logs.time')">{{ currentLog.time }}</el-descriptions-item>
        <el-descriptions-item :label="$t('audit.logs.level')">
          <el-tag :type="getLevelType(currentLog.level)" size="small">{{ currentLog.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('audit.logs.source')">{{ currentLog.source }}</el-descriptions-item>
        <el-descriptions-item :label="$t('audit.logs.module')">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item :label="$t('audit.logs.message')" :span="2">{{ currentLog.message }}</el-descriptions-item>
        <el-descriptions-item :label="$t('audit.logs.details')" :span="2">
          <pre class="log-details">{{ currentLog.details || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { ArrowDown, InfoFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

interface LogItem {
  id: string
  time: string
  level: string
  source: string
  module: string
  message: string
  details?: string
}

// 筛选表单
const filterForm = reactive({
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<LogItem[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<LogItem | null>(null)

// 日期快捷选项
const dateShortcuts = [
  {
    text: t('common.today'),
    value: () => {
      const end = new Date()
      const start = new Date()
      return [start, end]
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

// 获取级别类型
const getLevelType = (level: string) => {
  const typeMap: Record<string, string> = {
    DEBUG: 'info',
    INFO: '',
    WARNING: 'warning',
    ERROR: 'danger',
    CRITICAL: 'danger'
  }
  return typeMap[level] || ''
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: '1',
        time: '2026-04-07 10:30:15',
        level: 'INFO',
        source: '192.168.1.100',
        module: 'HTTP',
        message: 'HTTP request processed successfully',
        details: 'Request: GET /api/users, Status: 200, Time: 45ms'
      },
      {
        id: '2',
        time: '2026-04-07 10:28:42',
        level: 'WARNING',
        source: '192.168.1.101',
        module: 'AUTH',
        message: 'Authentication attempt with invalid credentials',
        details: 'Username: admin, IP: 192.168.1.101, Attempts: 3'
      },
      {
        id: '3',
        time: '2026-04-07 10:25:33',
        level: 'ERROR',
        source: '192.168.1.102',
        module: 'DATABASE',
        message: 'Database connection failed',
        details: 'Connection timeout after 30 seconds'
      },
      {
        id: '4',
        time: '2026-04-07 10:20:18',
        level: 'INFO',
        source: '192.168.1.103',
        module: 'FILE',
        message: 'File sync completed',
        details: 'Files synced: 15, Total size: 2.3MB'
      },
      {
        id: '5',
        time: '2026-04-07 10:15:05',
        level: 'DEBUG',
        source: '192.168.1.104',
        module: 'SYSTEM',
        message: 'System health check passed',
        details: 'CPU: 45%, Memory: 62%, Disk: 38%'
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
        t('audit.logs.clearLogConfirm'),
        t('common.warning'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )
      // Mock clear
      tableData.value = []
      pagination.total = 0
      ElNotification({
        title: t('common.success'),
        message: t('audit.logs.clearSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
    } catch {
      // Cancelled
    }
  }
}

// 导出
const handleExport = async (type: string) => {
  try {
    // Mock export
    await new Promise(resolve => setTimeout(resolve, 300))
    ElNotification({
      title: t('common.success'),
      message: t('audit.logs.exportSuccess') + ` (${type})`,
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (error) {
    console.error(error)
  }
}

// 查看详情
const handleViewDetail = (row: LogItem) => {
  currentLog.value = row
  detailDialogVisible.value = true
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
.page-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: calc(100vh - 100px);
}

.page-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.page-describe {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-util {
  margin-bottom: 20px;
}

.page-button .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.page-button .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.info-icon {
  margin-left: 8px;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

.info-icon:hover {
  color: #409EFF;
}

.page-table {
  margin-top: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.log-details {
  max-height: 200px;
  overflow: auto;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  color: #606266;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%) !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  padding: 16px 20px;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
}
</style>
