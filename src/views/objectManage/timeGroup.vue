<template>
  <div class="page-container time-group-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <span class="header-title">{{ $t('objectManage.timeGroup.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('objectManage.timeGroup.add') }}
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="groupList" v-loading="loading" class="time-table">
            <el-table-column prop="group_name" :label="$t('objectManage.timeGroup.groupName')" min-width="150">
              <template #default="{ row }">
                <div class="group-name-cell">
                  <el-icon class="group-icon"><Timer /></el-icon>
                  <span class="group-name">{{ row.group_name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('objectManage.timeGroup.details')" min-width="400">
              <template #default="{ row }">
                <div class="time-details">
                  <div
                    v-for="(detail, index) in row.details"
                    :key="index"
                    class="time-detail-item"
                  >
                    <div v-if="row.time_type === 'period'" class="detail-row">
                      <span class="detail-label">{{ $t('objectManage.timeGroup.startTime') }}:</span>
                      <span class="detail-value">{{ detail.stime }}</span>
                      <span class="detail-label">{{ $t('objectManage.timeGroup.endTime') }}:</span>
                      <span class="detail-value">{{ detail.etime }}</span>
                      <span class="detail-label">{{ $t('objectManage.timeGroup.weekday') }}:</span>
                      <span class="detail-value">{{ formatWeekday(detail.day) }}</span>
                    </div>
                    <div v-else class="detail-row">
                      <span class="detail-label">{{ $t('objectManage.timeGroup.timeRange') }}:</span>
                      <span class="detail-value time-range">
                        {{ formatTimePiece(detail.s_time_hour, detail.s_time_min, detail.s_time_sec) }}
                        -
                        {{ formatTimePiece(detail.e_time_hour, detail.e_time_min, detail.e_time_sec) }}
                      </span>
                      <span class="detail-label">{{ $t('objectManage.timeGroup.weekday') }}:</span>
                      <span class="detail-value">{{ formatWeekday(detail.day) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('objectManage.timeGroup.timeType')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.time_type === 'period' ? 'success' : 'warning'" size="small" effect="dark">
                  {{ row.time_type === 'period' ? $t('objectManage.timeGroup.period') : $t('objectManage.timeGroup.piece') }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column :label="$t('objectManage.timeGroup.actions')" min-width="150">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="openEditDialog(row)">
                    {{ $t('objectManage.timeGroup.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row.group_name)">
                    {{ $t('objectManage.timeGroup.delete') }}
                  </el-button>
                </div>
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
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? $t('objectManage.timeGroup.addDialog') : $t('objectManage.timeGroup.editDialog')"
      width="800px"
      class="time-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item :label="$t('objectManage.timeGroup.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('objectManage.timeGroup.groupNamePlaceholder')"
            :disabled="dialogMode === 'edit'"
            maxlength="31"
            clearable
          />
          <div class="form-help-text">{{ $t('objectManage.timeGroup.groupNameHint') }}</div>
        </el-form-item>

        <!-- 时间配置列表 -->
        <el-form-item :label="$t('objectManage.timeGroup.timeConfig')">
          <div class="time-config-list">
            <div
              v-for="(config, index) in formData.time_configs"
              :key="index"
              class="time-config-item"
            >
              <div class="config-card">
                <div class="config-header">
                  <span class="config-title">{{ $t('objectManage.timeGroup.configItem') }} {{ index + 1 }}</span>
                  <el-button type="danger" link size="small" @click="removeConfig(index)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>

                <el-form-item :label="$t('objectManage.timeGroup.timeType')">
                  <el-radio-group v-model="config.time_type">
                    <el-radio value="period">{{ $t('objectManage.timeGroup.period') }}</el-radio>
                    <el-radio value="piece">{{ $t('objectManage.timeGroup.piece') }}</el-radio>
                  </el-radio-group>
                </el-form-item>

                <!-- 段时间 -->
                <div v-if="config.time_type === 'period'" class="time-period-section">
                  <el-form-item :label="$t('objectManage.timeGroup.startTime')">
                    <el-date-picker
                      v-model="config.stime"
                      type="datetime"
                      :placeholder="$t('objectManage.timeGroup.selectStartTime')"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('objectManage.timeGroup.endTime')">
                    <el-date-picker
                      v-model="config.etime"
                      type="datetime"
                      :placeholder="$t('objectManage.timeGroup.selectEndTime')"
                      style="width: 100%"
                    />
                  </el-form-item>
                </div>

                <!-- 片时间 -->
                <div v-else class="time-piece-section">
                  <el-form-item :label="$t('objectManage.timeGroup.timeRange')">
                    <div class="time-range-input">
                      <el-time-picker
                        v-model="config.s_time"
                        :placeholder="$t('objectManage.timeGroup.startTime')"
                        format="HH:mm:ss"
                        style="width: 45%"
                      />
                      <span class="time-separator">{{ $t('objectManage.timeGroup.to') }}</span>
                      <el-time-picker
                        v-model="config.e_time"
                        :placeholder="$t('objectManage.timeGroup.endTime')"
                        format="HH:mm:ss"
                        style="width: 45%"
                      />
                    </div>
                  </el-form-item>
                </div>

                <!-- 星期选择 -->
                <el-form-item :label="$t('objectManage.timeGroup.weekday')">
                  <el-checkbox-group v-model="config.day">
                    <el-checkbox v-for="option in WEEKDAY_OPTIONS" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </div>
            </div>

            <el-button type="primary" link class="add-config-btn" @click="addConfig">
              <el-icon><Plus /></el-icon>
              {{ $t('objectManage.timeGroup.addConfig') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Clock, Plus, Timer, Close } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface TimeGroupDetail {
  stime: string
  etime: string
  day: string
  s_time_hour: number
  s_time_min: number
  s_time_sec: number
  e_time_hour: number
  e_time_min: number
  e_time_sec: number
}

interface TimeGroup {
  id: number
  group_name: string
  time_type: 'period' | 'piece'
  details: TimeGroupDetail[]
}

interface TimeConfigItem {
  time_type: 'period' | 'piece'
  stime: Date | string | null
  etime: Date | string | null
  s_time: Date | string | null
  e_time: Date | string | null
  day: number[]
}

// 状态
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 星期选项
const WEEKDAY_OPTIONS = [
  { value: 1, label: t('objectManage.timeGroup.weekdays.monday') },
  { value: 2, label: t('objectManage.timeGroup.weekdays.tuesday') },
  { value: 3, label: t('objectManage.timeGroup.weekdays.wednesday') },
  { value: 4, label: t('objectManage.timeGroup.weekdays.thursday') },
  { value: 5, label: t('objectManage.timeGroup.weekdays.friday') },
  { value: 6, label: t('objectManage.timeGroup.weekdays.saturday') },
  { value: 7, label: t('objectManage.timeGroup.weekdays.sunday') }
]

// 模拟数据
const groupList = ref<TimeGroup[]>([
  {
    id: 1,
    group_name: 'work_hours',
    time_type: 'period',
    details: [
      { stime: '2024-01-01 09:00:00', etime: '2024-12-31 18:00:00', day: '1,2,3,4,5', s_time_hour: 0, s_time_min: 0, s_time_sec: 0, e_time_hour: 0, e_time_min: 0, e_time_sec: 0 }
    ]
  },
  {
    id: 2,
    group_name: 'night_shift',
    time_type: 'piece',
    details: [
      { stime: '', etime: '', day: '1,2,3,4,5', s_time_hour: 18, s_time_min: 0, s_time_sec: 0, e_time_hour: 23, e_time_min: 59, e_time_sec: 59 },
      { stime: '', etime: '', day: '6,7', s_time_hour: 0, s_time_min: 0, s_time_sec: 0, e_time_hour: 8, e_time_min: 0, e_time_sec: 0 }
    ]
  },
  {
    id: 3,
    group_name: 'weekend',
    time_type: 'piece',
    details: [
      { stime: '', etime: '', day: '6,7', s_time_hour: 0, s_time_min: 0, s_time_sec: 0, e_time_hour: 23, e_time_min: 59, e_time_sec: 59 }
    ]
  }
])

// 表单数据
const formData = reactive<{
  group_name: string
  time_type: 'period' | 'piece'
  time_configs: TimeConfigItem[]
}>({
  group_name: '',
  time_type: 'period',
  time_configs: []
})

// 表单验证规则
const formRules: FormRules = {
  group_name: [
    { required: true, message: t('objectManage.timeGroup.groupNameRequired'), trigger: 'blur' },
    { max: 31, message: t('objectManage.timeGroup.groupNameMaxLength'), trigger: 'blur' }
  ]
}

// 方法
const openAddDialog = () => {
  dialogMode.value = 'add'
  formData.group_name = ''
  formData.time_type = 'period'
  formData.time_configs = []
  dialogVisible.value = true
}

const openEditDialog = (row: TimeGroup) => {
  dialogMode.value = 'edit'
  formData.group_name = row.group_name
  formData.time_type = row.time_type
  formData.time_configs = row.details.map(d => ({
    time_type: row.time_type,
    stime: d.stime ? new Date(d.stime) : null,
    etime: d.etime ? new Date(d.etime) : null,
    s_time: new Date(2000, 1, 1, d.s_time_hour || 0, d.s_time_min || 0, d.s_time_sec || 0),
    e_time: new Date(2000, 1, 1, d.e_time_hour || 23, d.e_time_min || 59, d.e_time_sec || 59),
    day: d.day ? d.day.split(',').map(Number) : []
  }))
  dialogVisible.value = true
}

const handleDelete = async (name: string) => {
  try {
    await ElMessageBox.confirm(
      t('objectManage.timeGroup.deleteConfirm', { name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    groupList.value = groupList.value.filter(g => g.group_name !== name)
    ElNotification({
      title: t('common.success'),
      message: t('objectManage.timeGroup.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const addConfig = () => {
  formData.time_configs.push({
    time_type: 'period',
    stime: null,
    etime: null,
    s_time: null,
    e_time: null,
    day: []
  })
}

const removeConfig = (index: number) => {
  formData.time_configs.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: dialogMode.value === 'add' ? t('objectManage.timeGroup.addSuccess') : t('objectManage.timeGroup.editSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      }, 1000)
    }
  })
}

// 格式化星期
const formatWeekday = (dayStr: string): string => {
  if (!dayStr) return '-'
  const days = dayStr.split(',').map(d => parseInt(d))
  const names = days.map(d => {
    const option = WEEKDAY_OPTIONS.find(o => o.value === d)
    return option?.label || '-'
  })
  return names.join(', ')
}

// 格式化片时间
const formatTimePiece = (hour: number, min: number, sec: number): string => {
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

onMounted(() => {
  pagination.total = groupList.value.length
})
</script>

<style scoped>
.time-group-page {
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
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

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.time-table {
  width: 100%;
}

.time-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.time-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.time-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.group-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-icon {
  color: #409EFF;
  font-size: 16px;
}

.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 时间详情 */
.time-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-detail-item {
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  border-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-label {
  color: #909399;
  font-size: 13px;
  min-width: 60px;
}

.detail-value {
  color: #606266;
  font-size: 13px;
}

.detail-value.time-range {
  font-family: 'Courier New', monospace;
  color: #67C23A;
  font-weight: 500;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 对话框 */
.time-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.time-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 时间配置列表 */
.time-config-list {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 10px;
}

.time-config-item {
  margin-bottom: 16px;
}

.config-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.config-title {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.time-period-section,
.time-piece-section {
  margin-bottom: 12px;
}

.time-range-input {
  display: flex;
  align-items: center;
  width: 100%;
}

.time-separator {
  margin: 0 12px;
  color: #909399;
  font-size: 14px;
}

.add-config-btn {
  width: 100%;
  border: 1px dashed rgba(64, 158, 255, 0.3);
  padding: 12px;
  border-radius: 6px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .action-btns {
    flex-direction: column;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
