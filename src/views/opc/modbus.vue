<template>
  <div class="page-container modbus-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.modbus.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.modbus.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.modbus.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('opc.modbus.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="modbus-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 用户组 -->
            <el-table-column prop="groupName" :label="$t('opc.modbus.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.groupName }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.modbus.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.modbus.enabled') : $t('opc.modbus.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 信令黑名单 -->
            <el-table-column :label="$t('opc.modbus.blackCmd')" min-width="250">
              <template #default="{ row }">
                <div class="cmd-tags">
                  <el-tag
                    v-for="cmd in row.black_cmd.slice(0, 5)"
                    :key="cmd"
                    type="info"
                    size="small"
                    class="cmd-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.black_cmd.length > 5" type="info" size="small" class="cmd-tag">
                    +{{ row.black_cmd.length - 5 }}
                  </el-tag>
                  <span v-if="!row.black_cmd?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 寄存器/线圈控制 -->
            <el-table-column :label="$t('opc.modbus.regControl')" min-width="150">
              <template #default="{ row }">
                <span class="reg-count">{{ row.reg_str?.length || 0 }} {{ $t('opc.modbus.regCount') }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.modbus.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button class="btn-view" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.modbus.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.modbus.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.modbus.delete') }}
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
      :title="isEdit ? $t('opc.modbus.editDialog') : $t('opc.modbus.addDialog')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('opc.modbus.groupName')" prop="groupName">
          <el-select v-model="formData.groupName" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.modbus.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.modbus.blackCmd')">
          <div class="cmd-config-wrapper">
            <el-select
              v-model="formData.black_cmd"
              multiple
              filterable
              allow-create
              :placeholder="$t('opc.modbus.blackCmdPlaceholder')"
              style="width: 100%"
            >
              <el-option
                v-for="cmd in modbusCommands"
                :key="cmd.value"
                :label="cmd.label"
                :value="cmd.value"
              />
            </el-select>
            <div class="cmd-hint">{{ $t('opc.modbus.blackCmdHint') }}</div>
          </div>
        </el-form-item>

        <el-form-item :label="$t('opc.modbus.regConfig')">
          <div class="reg-config-wrapper">
            <div class="reg-list">
              <div v-for="(reg, index) in formData.reg_str" :key="index" class="reg-item">
                <el-select v-model="reg.type" :placeholder="$t('opc.modbus.regTypePlaceholder')" style="width: 120px">
                  <el-option :label="$t('opc.modbus.register')" value="rw_reg" />
                  <el-option :label="$t('opc.modbus.coil')" value="rw_status" />
                </el-select>
                <el-input-number v-model="reg.address" :min="0" :max="65535" :placeholder="$t('opc.modbus.address')" style="width: 120px" />
                <el-input-number v-model="reg.begin" :min="0" :max="65535" :placeholder="$t('opc.modbus.begin')" style="width: 120px" />
                <el-input-number v-model="reg.end" :min="0" :max="65535" :placeholder="$t('opc.modbus.end')" style="width: 120px" />
                <el-button type="danger" :icon="Delete" circle size="small" @click="handleRemoveReg(index)" />
              </div>
              <el-button type="primary" plain @click="handleAddReg">
                <el-icon><Plus /></el-icon>
                {{ $t('opc.modbus.addReg') }}
              </el-button>
            </div>
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

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.modbus.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.modbus.groupName')">{{ viewData.groupName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.modbus.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.modbus.enabled') : $t('opc.modbus.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.modbus.blackCmd')" :span="2">
          <div class="view-cmd-tags">
            <el-tag v-for="cmd in viewData.black_cmd" :key="cmd" type="info" size="small" class="cmd-tag">
              {{ cmd }}
            </el-tag>
            <span v-if="!viewData.black_cmd?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.modbus.regConfig')" :span="2">
          <div class="view-reg-list">
            <div v-for="(reg, index) in viewData.reg_str" :key="index" class="view-reg-item">
              <el-tag size="small">{{ reg.type === 'rw_reg' ? $t('opc.modbus.register') : $t('opc.modbus.coil') }}</el-tag>
              <span>{{ $t('opc.modbus.address') }}: {{ reg.address }}, {{ $t('opc.modbus.range') }}: {{ reg.begin }}-{{ reg.end }}</span>
            </div>
            <span v-if="!viewData.reg_str?.length">-</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Cpu, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface RegisterConfig {
  type: 'rw_reg' | 'rw_status'
  address: number
  begin: number
  end: number
}

interface ModbusRule {
  id: string
  groupName: string
  rule_work: boolean
  black_cmd: string[]
  reg_str: RegisterConfig[]
}

// 状态
// 用户组选项
const groupOptions = [
  'opc_group_1',
  'opc_group_2',
  'admin_group',
  'user_group'
]

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// 模拟数据
const mockData = ref<ModbusRule[]>([
  {
    id: '1',
    groupName: 'plc_control',
    rule_work: true,
    black_cmd: ['01', '02', '05', '0F'],
    reg_str: [
      { type: 'rw_reg', address: 40001, begin: 0, end: 100 },
      { type: 'rw_status', address: 1, begin: 0, end: 16 }
    ]
  },
  {
    id: '2',
    groupName: 'sensor_read',
    rule_work: true,
    black_cmd: ['05', '06', '10'],
    reg_str: [
      { type: 'rw_reg', address: 30001, begin: 0, end: 50 }
    ]
  },
  {
    id: '3',
    groupName: 'hmi_access',
    rule_work: false,
    black_cmd: [],
    reg_str: []
  }
])

const tableData = ref<ModbusRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  groupName: '',
  rule_work: true,
  black_cmd: [] as string[],
  reg_str: [] as RegisterConfig[]
})

const viewData = ref<ModbusRule>({
  id: '',
  groupName: '',
  rule_work: false,
  black_cmd: [],
  reg_str: []
})

const formRules: FormRules = {
  groupName: [
    { required: true, message: t('opc.modbus.groupNameRequired'), trigger: 'blur' }
  ]
}

// MODBUS功能码选项
const modbusCommands = [
  { value: '01', label: '01 - 读线圈' },
  { value: '02', label: '02 - 读离散输入' },
  { value: '03', label: '03 - 读保持寄存器' },
  { value: '04', label: '04 - 读输入寄存器' },
  { value: '05', label: '05 - 写单个线圈' },
  { value: '06', label: '06 - 写单个寄存器' },
  { value: '0F', label: '0F - 写多个线圈' },
  { value: '10', label: '10 - 写多个寄存器' }
]

// 列表方法
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const resetForm = () => {
  formData.groupName = ''
  formData.rule_work = true
  formData.black_cmd = []
  formData.reg_str = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: ModbusRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: ModbusRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.groupName = row.groupName
  formData.rule_work = row.rule_work
  formData.black_cmd = [...row.black_cmd]
  formData.reg_str = row.reg_str.map(r => ({ ...r }))
  dialogVisible.value = true
}

const handleDelete = async (row: ModbusRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.modbus.deleteConfirm', { name: row.groupName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.modbus.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const selectedRows = ref<ModbusRule[]>([])

const handleSelectionChange = (rows: ModbusRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.modbus.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.modbus.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleAddReg = () => {
  formData.reg_str.push({
    type: 'rw_reg',
    address: 0,
    begin: 0,
    end: 0
  })
}

const handleRemoveReg = (index: number) => {
  formData.reg_str.splice(index, 1)
}

const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        if (isEdit.value) {
          const index = mockData.value.findIndex(item => item.id === editingId.value)
          if (index !== -1) {
            mockData.value[index] = {
              id: editingId.value,
              groupName: formData.groupName,
              rule_work: formData.rule_work,
              black_cmd: [...formData.black_cmd],
              reg_str: formData.reg_str.map(r => ({ ...r }))
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            groupName: formData.groupName,
            rule_work: formData.rule_work,
            black_cmd: [...formData.black_cmd],
            reg_str: formData.reg_str.map(r => ({ ...r }))
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.modbus.editSuccess') : t('opc.modbus.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.btn-view {
  background: #606266;
  border-color: var(--el-text-color-secondary);
  color: #fff;
}
.btn-view:hover {
  background: #73767a;
  border-color: #73767a;
}

.modbus-page {
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
.modbus-table {
  width: 100%;
}

.modbus-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.modbus-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.modbus-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 命令标签 */
.cmd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cmd-tag {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.empty-text {
  color: #c0c4cc;
}

/* 寄存器数量 */
.reg-count {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 6px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 100%;
}

/* 命令配置 */
.cmd-config-wrapper {
  width: 100%;
}

.cmd-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 寄存器配置 */
.reg-config-wrapper {
  width: 100%;
}

.reg-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

/* 寄存器配置项输入框样式 */
.reg-item :deep(.el-select .el-input__wrapper) {
  background-color: var(--card-bg);
}

.reg-item :deep(.el-select .el-input__inner::placeholder) {
  color: #a8abb2;
}

.reg-item :deep(.el-input-number) {
  background-color: var(--card-bg);
}

.reg-item :deep(.el-input-number .el-input__inner::placeholder) {
  color: #a8abb2;
}

/* 添加配置项按钮样式 */
.reg-list :deep(.el-button--primary.is-plain),
.reg-config-wrapper :deep(.el-button--primary.is-plain) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #ffffff;
}

.reg-list :deep(.el-button--primary.is-plain:hover),
.reg-config-wrapper :deep(.el-button--primary.is-plain:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #ffffff;
}

/* 查看对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-cmd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.view-reg-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-reg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
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

  .reg-item {
    flex-wrap: wrap;
  }
}
</style>
