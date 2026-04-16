<template>
  <div class="page-container opc-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Platform /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.opcShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.opcShow.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.opcShow.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-bar" v-if="selectedRows.length > 0">
            <span class="batch-info">{{ t('opc.opcShow.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="opc-table" @selection-change="handleSelectionChange">
            <!-- 多选列 -->
            <el-table-column type="selection" width="50" align="center" />

            <!-- 用户组 -->
            <el-table-column prop="groupName" :label="$t('opc.opcShow.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.groupName }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.opcShow.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.opcShow.enabled') : $t('opc.opcShow.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 过滤模式 -->
            <el-table-column :label="$t('opc.opcShow.filterMode')" min-width="300">
              <template #default="{ row }">
                <el-tooltip v-if="row.filter_name && row.filter_name.length > 3" :content="row.filter_name.join(', ')" placement="top">
                  <div class="mode-tags">
                    <el-tag
                      v-for="mode in row.filter_name.slice(0, 3)"
                      :key="mode"
                      type="info"
                      size="small"
                      class="mode-tag"
                    >
                      {{ mode }}
                    </el-tag>
                    <el-tag type="info" size="small" class="mode-tag">...</el-tag>
                  </div>
                </el-tooltip>
                <div v-else class="mode-tags">
                  <el-tag
                    v-for="mode in row.filter_name"
                    :key="mode"
                    type="info"
                    size="small"
                    class="mode-tag"
                  >
                    {{ mode }}
                  </el-tag>
                  <span v-if="!row.filter_name?.length" class="empty-mode">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.opcShow.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" class="btn-view" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.opcShow.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.opcShow.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.opcShow.delete') }}
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
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.opcShow.editDialog') : $t('opc.opcShow.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('opc.opcShow.groupName')" prop="groupName">
          <el-select v-model="formData.groupName" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.opcShow.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.opcShow.filterMode')">
          <div class="filter-mode-wrapper">
            <el-checkbox-group v-model="formData.filter_name">
              <el-checkbox
                v-for="mode in filterModes"
                :key="mode.value"
                :label="mode.value"
              >
                {{ mode.label }}
              </el-checkbox>
            </el-checkbox-group>
            <div class="mode-hint">{{ $t('opc.opcShow.filterModeHint') }}</div>
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
      :title="$t('opc.opcShow.viewDetail')"
      width="500px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.opcShow.groupName')">{{ viewData.groupName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.opcShow.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.opcShow.enabled') : $t('opc.opcShow.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.opcShow.filterMode')" :span="2">
          <div class="view-mode-tags">
            <el-tag v-for="mode in viewData.filter_name" :key="mode" type="info" size="small" class="mode-tag">
              {{ mode }}
            </el-tag>
            <span v-if="!viewData.filter_name?.length">-</span>
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
import { Platform, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface OpcRule {
  id: string
  groupName: string
  rule_work: boolean
  filter_name: string[]
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
const mockData = ref<OpcRule[]>([
  {
    id: '1',
    groupName: 'plc_access',
    rule_work: true,
    filter_name: ['OPC_DA', 'OPC_HDA', 'OPC_AE']
  },
  {
    id: '2',
    groupName: 'scada_read',
    rule_work: true,
    filter_name: ['OPC_DA', 'OPC_XML_DA']
  },
  {
    id: '3',
    groupName: 'hmi_control',
    rule_work: false,
    filter_name: ['OPC_DA', 'OPC_HDA', 'OPC_AE', 'OPC_XML_DA', 'OPC_UA']
  }
])

const tableData = ref<OpcRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  groupName: '',
  rule_work: true,
  filter_name: [] as string[]
})

const selectedRows = ref<OpcRule[]>([])

const handleSelectionChange = (rows: OpcRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.opcShow.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.opcShow.batchDeleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const viewData = ref<OpcRule>({
  id: '',
  groupName: '',
  rule_work: false,
  filter_name: []
})

const formRules: FormRules = {
  groupName: [
    { required: true, message: t('opc.opcShow.groupNameRequired'), trigger: 'blur' }
  ]
}

// OPC过滤模式选项
const filterModes = [
  { value: 'OPC_DA', label: 'OPC DA (Data Access)' },
  { value: 'OPC_HDA', label: 'OPC HDA (Historical Data Access)' },
  { value: 'OPC_AE', label: 'OPC AE (Alarms & Events)' },
  { value: 'OPC_XML_DA', label: 'OPC XML-DA' },
  { value: 'OPC_UA', label: 'OPC UA (Unified Architecture)' }
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
  formData.groupName = ''
  formData.rule_work = true
  formData.filter_name = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: OpcRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: OpcRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.groupName = row.groupName
  formData.rule_work = row.rule_work
  formData.filter_name = [...row.filter_name]
  dialogVisible.value = true
}

const handleDelete = async (row: OpcRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.opcShow.deleteConfirm', { name: row.groupName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.opcShow.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
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
              filter_name: [...formData.filter_name]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            groupName: formData.groupName,
            rule_work: formData.rule_work,
            filter_name: [...formData.filter_name]
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.opcShow.editSuccess') : t('opc.opcShow.addSuccess'),
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

// 分页
function handleSizeChange(size: number) {
  pagination.pageSize = size
  fetchList()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  fetchList()
}
</script>

<style scoped>
.btn-view {
  background: #606266;
  border-color: #606266;
  color: #fff;
}

.btn-view:hover {
  background: #73767a;
  border-color: #73767a;
}

.opc-page {
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.opc-table {
  width: 100%;
}

.opc-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.opc-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.opc-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
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

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 模式标签 */
.mode-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mode-tag {
  font-size: 12px;
}

.empty-mode {
  color: #c0c4cc;
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

/* 过滤模式配置 */
.filter-mode-wrapper {
  width: 100%;
}

.filter-mode-wrapper :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 查看对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-mode-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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
