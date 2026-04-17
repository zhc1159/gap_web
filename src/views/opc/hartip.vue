<template>
  <div class="page-container hartip-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.hartip.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.hartip.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.hartip.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('opc.hartip.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <el-table :data="tableData" v-loading="loading" class="hartip-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.hartip.groupName')" min-width="120">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.hartip.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.hartip.enabled') : $t('opc.hartip.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 消息类型过滤 -->
            <el-table-column :label="$t('opc.hartip.msgTypeFilter')" min-width="180">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="type in row.msg_type_filter.slice(0, 3)"
                    :key="type"
                    type="info"
                    size="small"
                    class="filter-tag"
                  >
                    {{ type }}
                  </el-tag>
                  <el-tag v-if="row.msg_type_filter.length > 3" type="info" size="small" class="filter-tag">
                    +{{ row.msg_type_filter.length - 3 }}
                  </el-tag>
                  <span v-if="!row.msg_type_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 消息标识过滤 -->
            <el-table-column :label="$t('opc.hartip.msgIdFilter')" min-width="180">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="id in row.msg_id_filter.slice(0, 3)"
                    :key="id"
                    type="warning"
                    size="small"
                    class="filter-tag"
                  >
                    {{ id }}
                  </el-tag>
                  <el-tag v-if="row.msg_id_filter.length > 3" type="warning" size="small" class="filter-tag">
                    +{{ row.msg_id_filter.length - 3 }}
                  </el-tag>
                  <span v-if="!row.msg_id_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 命令过滤 -->
            <el-table-column :label="$t('opc.hartip.cmdFilter')" min-width="180">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="cmd in row.cmd_filter.slice(0, 4)"
                    :key="cmd"
                    type="danger"
                    size="small"
                    class="filter-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.cmd_filter.length > 4" type="danger" size="small" class="filter-tag">
                    +{{ row.cmd_filter.length - 4 }}
                  </el-tag>
                  <span v-if="!row.cmd_filter?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.hartip.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" class="btn-view" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.hartip.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.hartip.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.hartip.delete') }}
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
      :title="isEdit ? $t('opc.hartip.editDialog') : $t('opc.hartip.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.hartip.groupName')" prop="group_name">
          <el-select v-model="formData.group_name" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.hartip.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.hartip.msgTypeFilter')">
          <el-select
            v-model="formData.msg_type_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.hartip.msgTypeFilterPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="type in msgTypeOptions" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.hartip.msgIdFilter')">
          <el-select
            v-model="formData.msg_id_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.hartip.msgIdFilterPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="id in msgIdOptions" :key="id" :label="id" :value="id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.hartip.cmdFilter')">
          <el-select
            v-model="formData.cmd_filter"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.hartip.cmdFilterPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="cmd in cmdOptions" :key="cmd" :label="cmd.toString()" :value="cmd" />
          </el-select>
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
      :title="$t('opc.hartip.viewDetail')"
      width="550px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.hartip.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.hartip.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.hartip.enabled') : $t('opc.hartip.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.hartip.msgTypeFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="type in viewData.msg_type_filter" :key="type" type="info" size="small" class="view-tag">
              {{ type }}
            </el-tag>
            <span v-if="!viewData.msg_type_filter?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.hartip.msgIdFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="id in viewData.msg_id_filter" :key="id" type="warning" size="small" class="view-tag">
              {{ id }}
            </el-tag>
            <span v-if="!viewData.msg_id_filter?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.hartip.cmdFilter')" :span="2">
          <div class="view-tags">
            <el-tag v-for="cmd in viewData.cmd_filter" :key="cmd" type="danger" size="small" class="view-tag">
              {{ cmd }}
            </el-tag>
            <span v-if="!viewData.cmd_filter?.length">-</span>
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
import { Connection, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface HartipRule {
  id: string
  group_name: string
  rule_work: boolean
  msg_type_filter: string[]
  msg_id_filter: string[]
  cmd_filter: number[]
}

// 状态
const selectedRows = ref<HartipRule[]>([])
const handleSelectionChange = (rows: HartipRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.hartip.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.hartip.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

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

// 消息类型选项
const msgTypeOptions = ['REQUEST', 'RESPONSE', 'PUBLISH', 'NOTIFY', 'ACK']

// 消息标识选项
const msgIdOptions = ['INITIALIZE', 'READ', 'WRITE', 'NOTIFY', 'COMMAND', 'RESPONSE']

// 命令选项
const cmdOptions = [0, 1, 2, 3, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127]

// 模拟数据
const mockData = ref<HartipRule[]>([
  {
    id: '1',
    group_name: 'field_devices',
    rule_work: true,
    msg_type_filter: ['REQUEST', 'RESPONSE'],
    msg_id_filter: ['READ', 'WRITE'],
    cmd_filter: [0, 1, 2, 3]
  },
  {
    id: '2',
    group_name: 'control_system',
    rule_work: true,
    msg_type_filter: ['PUBLISH', 'NOTIFY'],
    msg_id_filter: ['COMMAND', 'NOTIFY'],
    cmd_filter: [6, 7, 8, 11, 12]
  },
  {
    id: '3',
    group_name: 'monitoring_station',
    rule_work: false,
    msg_type_filter: [],
    msg_id_filter: [],
    cmd_filter: []
  }
])

const tableData = ref<HartipRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  group_name: '',
  rule_work: true,
  msg_type_filter: [] as string[],
  msg_id_filter: [] as string[],
  cmd_filter: [] as number[]
})

const viewData = ref<HartipRule>({
  id: '',
  group_name: '',
  rule_work: false,
  msg_type_filter: [],
  msg_id_filter: [],
  cmd_filter: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.hartip.groupNameRequired'), trigger: 'blur' }
  ]
}

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
  formData.group_name = ''
  formData.rule_work = true
  formData.msg_type_filter = []
  formData.msg_id_filter = []
  formData.cmd_filter = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: HartipRule) => {
  viewData.value = {
    ...row,
    msg_type_filter: [...row.msg_type_filter],
    msg_id_filter: [...row.msg_id_filter],
    cmd_filter: [...row.cmd_filter]
  }
  viewDialogVisible.value = true
}

const handleEdit = (row: HartipRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.msg_type_filter = [...row.msg_type_filter]
  formData.msg_id_filter = [...row.msg_id_filter]
  formData.cmd_filter = [...row.cmd_filter]
  dialogVisible.value = true
}

const handleDelete = async (row: HartipRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.hartip.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.hartip.deleteSuccess'),
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
              group_name: formData.group_name,
              rule_work: formData.rule_work,
              msg_type_filter: [...formData.msg_type_filter],
              msg_id_filter: [...formData.msg_id_filter],
              cmd_filter: [...formData.cmd_filter]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            msg_type_filter: [...formData.msg_type_filter],
            msg_id_filter: [...formData.msg_id_filter],
            cmd_filter: [...formData.cmd_filter]
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.hartip.editSuccess') : t('opc.hartip.addSuccess'),
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

.hartip-page {
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

/* 表格样式 */
.hartip-table {
  width: 100%;
}

.hartip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.hartip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.hartip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 标签 */
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-tag {
  font-size: 12px;
}

.empty-text {
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

/* 查看对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.view-tag {
  font-size: 12px;
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
