<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('audit.atkLog.describe') }}</div>
      <div class="page-util">
        <el-form :model="filterForm" inline class="form-label">
          <el-form-item :label="$t('audit.atkLog.dateRange')">
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
                    {{ $t('audit.atkLog.clearLog') }}
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
              :content="$t('audit.atkLog.exportAllOnly')"
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
          <el-table-column prop="time" :label="$t('audit.atkLog.time')" width="180" sortable />
          <el-table-column prop="type" :label="$t('audit.atkLog.warningType')" width="120">
            <template #default="{ row }">
              <el-tag :type="getAttackType(row.type)" size="small">
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sourceIP" :label="$t('audit.atkLog.sourceIP')" width="150" />
          <el-table-column prop="sourcePort" :label="$t('audit.atkLog.sourcePort')" width="100" />
          <el-table-column prop="destIP" :label="$t('audit.atkLog.destIP')" width="150" />
          <el-table-column prop="destPort" :label="$t('audit.atkLog.destPort')" width="100" />
          <el-table-column prop="region" :label="$t('audit.atkLog.region')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.region === 'internal' ? 'success' : 'warning'" size="small">
                {{ row.region === 'internal' ? $t('audit.atkLog.internal') : $t('audit.atkLog.external') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" :label="$t('audit.atkLog.message')" show-overflow-tooltip />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { ArrowDown, InfoFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

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

// 获取攻击类型样式
const getAttackType = (type: string) => {
  const typeMap: Record<string, string> = {
    'DDoS': 'danger',
    'Port Scan': 'warning',
    'SQL Injection': 'danger',
    'XSS': 'warning',
    'Brute Force': 'danger',
    'Malware': 'danger'
  }
  return typeMap[type] || 'info'
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
        type: 'DDoS',
        sourceIP: '192.168.1.100',
        sourcePort: 54321,
        destIP: '10.0.0.50',
        destPort: 80,
        region: 'external',
        message: 'Detected DDoS attack from external network'
      },
      {
        id: '2',
        time: '2026-04-07 10:28:42',
        type: 'Port Scan',
        sourceIP: '192.168.1.101',
        sourcePort: 45678,
        destIP: '10.0.0.51',
        destPort: 22,
        region: 'external',
        message: 'Port scanning detected on multiple ports'
      },
      {
        id: '3',
        time: '2026-04-07 10:25:33',
        type: 'SQL Injection',
        sourceIP: '192.168.1.102',
        sourcePort: 34567,
        destIP: '10.0.0.52',
        destPort: 3306,
        region: 'internal',
        message: 'SQL injection attempt detected in database query'
      },
      {
        id: '4',
        time: '2026-04-07 10:20:18',
        type: 'Brute Force',
        sourceIP: '192.168.1.103',
        sourcePort: 23456,
        destIP: '10.0.0.53',
        destPort: 22,
        region: 'external',
        message: 'Multiple failed login attempts detected'
      },
      {
        id: '5',
        time: '2026-04-07 10:15:05',
        type: 'XSS',
        sourceIP: '192.168.1.104',
        sourcePort: 12345,
        destIP: '10.0.0.54',
        destPort: 443,
        region: 'external',
        message: 'Cross-site scripting attempt blocked'
      }
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
      // Mock clear
      tableData.value = []
      pagination.total = 0
      ElNotification({
        title: t('common.success'),
        message: t('audit.atkLog.clearSuccess'),
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
      message: t('audit.atkLog.exportSuccess') + ` (${type})`,
      type: 'success',
      customClass: 'notification-success'
    })
  } catch (error) {
    console.error(error)
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
</style>
