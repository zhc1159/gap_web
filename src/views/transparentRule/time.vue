<template>
  <div class="page-container time-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <span class="header-title">{{ $t('transparentRule.time.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('transparentRule.time.addGroup') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('transparentRule.time.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-bar" v-if="selectedRows.length > 0">
            <span class="batch-info">{{ t('transparentRule.time.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="time-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <!-- 时间组名称 -->
            <el-table-column prop="name" :label="$t('transparentRule.time.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- 开始日期 -->
            <el-table-column :label="$t('transparentRule.time.startDate')" width="130" align="center">
              <template #default="{ row }">
                <div class="date-cell">
                  <el-icon class="cell-icon"><Calendar /></el-icon>
                  <span>{{ row.startDate }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 结束日期 -->
            <el-table-column :label="$t('transparentRule.time.endDate')" width="130" align="center">
              <template #default="{ row }">
                <div class="date-cell">
                  <el-icon class="cell-icon"><Calendar /></el-icon>
                  <span>{{ row.endDate }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 开始时间 -->
            <el-table-column :label="$t('transparentRule.time.startTime')" width="100" align="center">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="cell-icon"><Clock /></el-icon>
                  <span>{{ row.startTime }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 结束时间 -->
            <el-table-column :label="$t('transparentRule.time.endTime')" width="100" align="center">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="cell-icon"><Clock /></el-icon>
                  <span>{{ row.endTime }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 星期 -->
            <el-table-column :label="$t('transparentRule.time.weekdays')" min-width="180">
              <template #default="{ row }">
                <div class="weekday-tags">
                  <el-tag
                    v-for="(day, index) in parseWeekdays(row.weekdays)"
                    :key="index"
                    size="small"
                    type="info"
                    class="weekday-tag"
                  >
                    {{ day }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('transparentRule.time.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('transparentRule.time.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('transparentRule.time.delete') }}
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
      :title="isEdit ? $t('transparentRule.time.editDialog') : $t('transparentRule.time.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('transparentRule.time.groupName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('transparentRule.time.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
            @input="handleNameInput"
          />
        </el-form-item>

        <el-form-item :label="$t('transparentRule.time.dateRange')" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            :range-separator="$t('transparentRule.time.to')"
            :start-placeholder="$t('transparentRule.time.startDatePlaceholder')"
            :end-placeholder="$t('transparentRule.time.endDatePlaceholder')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('transparentRule.time.timeRange')" prop="timeRange">
          <el-time-picker
            v-model="formData.timeRange"
            is-range
            :range-separator="$t('transparentRule.time.to')"
            :start-placeholder="$t('transparentRule.time.startTimePlaceholder')"
            :end-placeholder="$t('transparentRule.time.endTimePlaceholder')"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('transparentRule.time.weekdays')">
          <div class="weekday-checkboxes">
            <el-checkbox
              v-for="option in weekdayOptions"
              :key="option.value"
              :label="option.value"
              v-model="selectedWeekdays"
            >
              {{ option.label }}
            </el-checkbox>
          </div>
          <div class="weekday-hint">
            {{ $t('transparentRule.time.weekdayHint') }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Timer, Plus, InfoFilled, Calendar, Clock, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 星期枚举
const Weekday = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 4,
  THURSDAY: 8,
  FRIDAY: 16,
  SATURDAY: 32,
  SUNDAY: 64
}

// 类型定义
interface TimeGroup {
  id: string
  name: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  weekdays: number
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const selectedWeekdays = ref<number[]>([])

// 模拟数据
const mockData = ref<TimeGroup[]>([
  {
    id: '1',
    name: 'work_hours',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    startTime: '09:00',
    endTime: '18:00',
    weekdays: 31 // 周一到周五
  },
  {
    id: '2',
    name: 'weekend_access',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    startTime: '00:00',
    endTime: '23:59',
    weekdays: 96 // 周六周日
  },
  {
    id: '3',
    name: 'night_maintenance',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    startTime: '02:00',
    endTime: '05:00',
    weekdays: 127 // 每天
  },
  {
    id: '4',
    name: 'lunch_break',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    startTime: '12:00',
    endTime: '14:00',
    weekdays: 31 // 周一到周五
  }
])

const tableData = ref<TimeGroup[]>([])

const selectedRows = ref<TimeGroup[]>([])

const handleSelectionChange = (rows: TimeGroup[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.time.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.time.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  name: '',
  dateRange: ['', ''] as [string, string],
  timeRange: ['', ''] as [string, string]
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('transparentRule.time.groupNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('transparentRule.time.groupNamePattern'), trigger: 'blur' },
    { max: 31, message: t('transparentRule.time.groupNameMaxLength'), trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: t('transparentRule.time.dateRangeRequired'), trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: t('transparentRule.time.timeRangeRequired'), trigger: 'change' }
  ]
}

// 星期选项
const weekdayOptions = [
  { value: Weekday.MONDAY, label: t('transparentRule.time.monday') },
  { value: Weekday.TUESDAY, label: t('transparentRule.time.tuesday') },
  { value: Weekday.WEDNESDAY, label: t('transparentRule.time.wednesday') },
  { value: Weekday.THURSDAY, label: t('transparentRule.time.thursday') },
  { value: Weekday.FRIDAY, label: t('transparentRule.time.friday') },
  { value: Weekday.SATURDAY, label: t('transparentRule.time.saturday') },
  { value: Weekday.SUNDAY, label: t('transparentRule.time.sunday') }
]

// 列表方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const resetForm = () => {
  formData.name = ''
  formData.dateRange = ['', '']
  formData.timeRange = ['', '']
  selectedWeekdays.value = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: TimeGroup) => {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name
  formData.dateRange = [row.startDate, row.endDate]
  formData.timeRange = [row.startTime, row.endTime]
  selectedWeekdays.value = parseWeekdayMask(row.weekdays)
  dialogVisible.value = true
}

const handleDelete = async (row: TimeGroup) => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.time.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.time.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleNameInput = (value: string) => {
  formData.name = value.replace(/[^a-zA-Z0-9_]/g, '')
}

const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        // 计算星期位掩码
        const weekdayMask = selectedWeekdays.value.reduce((acc, val) => acc + val, 0)

        if (isEdit.value) {
          const index = mockData.value.findIndex(item => item.id === editingId.value)
          if (index !== -1) {
            mockData.value[index] = {
              id: editingId.value,
              name: formData.name,
              startDate: formData.dateRange[0],
              endDate: formData.dateRange[1],
              startTime: formData.timeRange[0],
              endTime: formData.timeRange[1],
              weekdays: weekdayMask === 0 ? 127 : weekdayMask
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            name: formData.name,
            startDate: formData.dateRange[0],
            endDate: formData.dateRange[1],
            startTime: formData.timeRange[0],
            endTime: formData.timeRange[1],
            weekdays: weekdayMask === 0 ? 127 : weekdayMask
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('transparentRule.time.editSuccess') : t('transparentRule.time.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

// 工具函数
const parseWeekdayMask = (mask: number): number[] => {
  const weekdays: number[] = []
  if (mask & Weekday.MONDAY) weekdays.push(Weekday.MONDAY)
  if (mask & Weekday.TUESDAY) weekdays.push(Weekday.TUESDAY)
  if (mask & Weekday.WEDNESDAY) weekdays.push(Weekday.WEDNESDAY)
  if (mask & Weekday.THURSDAY) weekdays.push(Weekday.THURSDAY)
  if (mask & Weekday.FRIDAY) weekdays.push(Weekday.FRIDAY)
  if (mask & Weekday.SATURDAY) weekdays.push(Weekday.SATURDAY)
  if (mask & Weekday.SUNDAY) weekdays.push(Weekday.SUNDAY)
  return weekdays
}

const parseWeekdays = (mask: number): string[] => {
  const days: string[] = []
  const dayNames = [
    t('transparentRule.time.monday'),
    t('transparentRule.time.tuesday'),
    t('transparentRule.time.wednesday'),
    t('transparentRule.time.thursday'),
    t('transparentRule.time.friday'),
    t('transparentRule.time.saturday'),
    t('transparentRule.time.sunday')
  ]

  const weekdayValues = [1, 2, 4, 8, 16, 32, 64]

  weekdayValues.forEach((value, index) => {
    if (mask & value) {
      days.push(dayNames[index])
    }
  })

  // 优化显示
  if (days.length === 5 && days.includes(dayNames[0]) && days.includes(dayNames[4])) {
    return [t('transparentRule.time.weekdaysShort')]
  }

  if (days.length === 2 && days.includes(dayNames[5]) && days.includes(dayNames[6])) {
    return [t('transparentRule.time.weekend')]
  }

  if (days.length === 7) {
    return [t('transparentRule.time.everyday')]
  }

  return days
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.time-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
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

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #00d4ff;
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
  border: 1px solid rgba(0, 212, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.time-table {
  width: 100%;
}

.time-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.time-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.time-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #00d4ff;
}

/* 日期/时间单元格 */
.date-cell,
.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.cell-icon {
  color: #00d4ff;
  font-size: 14px;
}

/* 星期标签 */
.weekday-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.weekday-tag {
  margin: 0;
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
  color: #606266;
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
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 100%;
}

/* 星期复选框 */
.weekday-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.weekday-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
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
}
</style>
