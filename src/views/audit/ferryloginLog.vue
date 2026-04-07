<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-describe">{{ $t('audit.ferryloginLog.describe') }}</div>
      <div class="page-util">
        <el-form :model="filterForm" inline class="form-label">
          <el-form-item :label="$t('audit.ferryloginLog.user')">
            <el-input
              v-model="filterForm.userName"
              :placeholder="$t('audit.ferryloginLog.userPlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.ip')">
            <el-input
              v-model="filterForm.ip"
              :placeholder="$t('audit.ferryloginLog.ipPlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('audit.ferryloginLog.result')">
            <el-select v-model="filterForm.result" :placeholder="$t('common.pleaseSelect')" clearable>
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('common.failed')" value="0" />
              <el-option :label="$t('common.success')" value="1" />
            </el-select>
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
                    {{ $t('audit.ferryloginLog.clearLog') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
          <el-form-item>
            <el-dropdown @command="handleExport" placement="top">
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
          </el-form-item>
        </el-form>
      </div>

      <div class="page-table">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="date" :label="$t('audit.ferryloginLog.time')" width="180" sortable />
          <el-table-column prop="region" :label="$t('audit.ferryloginLog.region')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.region === 'internal' ? 'success' : 'warning'" size="small">
                {{ row.region === 'internal' ? $t('audit.ferryloginLog.internal') : $t('audit.ferryloginLog.external') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="user" :label="$t('audit.ferryloginLog.user')" width="120" />
          <el-table-column prop="ip" :label="$t('audit.ferryloginLog.ip')" width="150" />
          <el-table-column prop="operate" :label="$t('audit.ferryloginLog.operation')" width="100" />
          <el-table-column prop="result" :label="$t('audit.ferryloginLog.result')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result ? 'success' : 'danger'" size="small">
                {{ row.result ? $t('common.success') : $t('common.failed') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="describe" :label="$t('audit.ferryloginLog.description')" min-width="200" show-overflow-tooltip />
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
import { ArrowDown } from '@element-plus/icons-vue'

const { t } = useI18n()

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

const filterForm = reactive({
  userName: '',
  ip: '',
  result: '',
  dateRange: [] as string[]
})

const tableData = ref<LoginLogItem[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const dateShortcuts = [
  { text: t('common.today'), value: () => { const end = new Date(); const start = new Date(); return [start, end] } },
  { text: t('common.last7Days'), value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); return [start, end] } },
  { text: t('common.last30Days'), value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 30); return [start, end] } }
]

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: '1', date: '2026-04-07 10:30:15', region: 'internal', user: 'admin', ip: '192.168.1.100', operate: 'LOGIN', result: true, describe: 'User login successful' },
      { id: '2', date: '2026-04-07 10:25:42', region: 'external', user: 'operator', ip: '10.0.0.50', operate: 'LOGIN', result: false, describe: 'Invalid password' },
      { id: '3', date: '2026-04-07 10:20:33', region: 'internal', user: 'admin', ip: '192.168.1.101', operate: 'LOGOUT', result: true, describe: 'User logout successful' },
      { id: '4', date: '2026-04-07 10:15:18', region: 'external', user: 'guest', ip: '10.0.0.51', operate: 'LOGIN', result: true, describe: 'Guest user login' },
      { id: '5', date: '2026-04-07 10:10:05', region: 'internal', user: 'operator', ip: '192.168.1.102', operate: 'LOGIN', result: true, describe: 'Operator login from internal network' }
    ]
    pagination.total = 50
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; fetchData() }

const handleAction = async (command: string) => {
  if (command === 'clear') {
    try {
      await ElMessageBox.confirm(t('audit.ferryloginLog.clearLogConfirm'), t('common.warning'), { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' })
      tableData.value = []
      pagination.total = 0
      ElNotification({ title: t('common.success'), message: t('audit.ferryloginLog.clearSuccess'), type: 'success', customClass: 'notification-success' })
    } catch { }
  }
}

const handleExport = async (type: string) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  ElNotification({ title: t('common.success'), message: t('audit.ferryloginLog.exportSuccess') + ` (${type})`, type: 'success', customClass: 'notification-success' })
}

const handleSizeChange = (size: number) => { pagination.pageSize = size; fetchData() }
const handleCurrentChange = (page: number) => { pagination.page = page; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); min-height: calc(100vh - 100px); }
.page-card { background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); padding: 24px; }
.page-describe { font-size: 14px; color: #606266; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #ebeef5; background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.page-util { margin-bottom: 20px; }
.page-button .el-button--primary { background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%); border: none; box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3); }
.page-button .el-button--primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4); }
.page-table { margin-top: 16px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
:deep(.el-table) { border-radius: 8px; overflow: hidden; }
:deep(.el-table th) { background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%) !important; }
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background: #fafafa; }
</style>
