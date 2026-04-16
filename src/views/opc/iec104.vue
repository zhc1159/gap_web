<template>
  <div class="page-container iec104-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Lightning /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.iec104.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.iec104.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.iec104.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('opc.iec104.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="iec104-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 用户组 -->
            <el-table-column prop="groupname" :label="$t('opc.iec104.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.groupname }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.iec104.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.iec104.enabled') : $t('opc.iec104.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 信令黑名单 -->
            <el-table-column :label="$t('opc.iec104.blackCmd')" min-width="200">
              <template #default="{ row }">
                <div class="cmd-tags">
                  <el-tag
                    v-for="cmd in row.black_cmd.slice(0, 4)"
                    :key="cmd"
                    type="info"
                    size="small"
                    class="cmd-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.black_cmd.length > 4" type="info" size="small" class="cmd-tag">
                    +{{ row.black_cmd.length - 4 }}
                  </el-tag>
                  <span v-if="!row.black_cmd?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 地址控制 -->
            <el-table-column :label="$t('opc.iec104.addrControl')" min-width="150">
              <template #default="{ row }">
                <span class="addr-count">{{ row.iec_addr?.length || 0 }} {{ $t('opc.iec104.addrCount') }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.iec104.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.iec104.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.iec104.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.iec104.delete') }}
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
      :title="isEdit ? $t('opc.iec104.editDialog') : $t('opc.iec104.addDialog')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('opc.iec104.groupName')" prop="groupname">
          <el-select v-model="formData.groupname" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.iec104.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.iec104.blackCmd')">
          <div class="cmd-config-wrapper">
            <el-select
              v-model="formData.black_cmd"
              multiple
              filterable
              allow-create
              :placeholder="$t('opc.iec104.blackCmdPlaceholder')"
              style="width: 100%"
            >
              <el-option
                v-for="cmd in iec104Commands"
                :key="cmd.value"
                :label="cmd.label"
                :value="cmd.value"
              />
            </el-select>
            <div class="cmd-hint">{{ $t('opc.iec104.blackCmdHint') }}</div>
          </div>
        </el-form-item>

        <el-form-item :label="$t('opc.iec104.addrConfig')">
          <div class="addr-config-wrapper">
            <div class="addr-list">
              <div v-for="(addr, index) in formData.iec_addr" :key="index" class="addr-item">
                <el-select v-model="addr.type" :placeholder="$t('opc.iec104.addrTypePlaceholder')" style="width: 140px">
                  <el-option :label="$t('opc.iec104.apduAddr')" value="apdu_addr" />
                  <el-option :label="$t('opc.iec104.infoAddr')" value="info_addr" />
                </el-select>
                <el-input-number v-model="addr.begin" :min="0" :max="65535" :placeholder="$t('opc.iec104.begin')" style="width: 130px" />
                <el-input-number v-model="addr.end" :min="0" :max="65535" :placeholder="$t('opc.iec104.end')" style="width: 130px" />
                <el-button type="danger" :icon="Delete" circle size="small" @click="handleRemoveAddr(index)" />
              </div>
              <el-button type="primary" plain @click="handleAddAddr">
                <el-icon><Plus /></el-icon>
                {{ $t('opc.iec104.addAddr') }}
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
      :title="$t('opc.iec104.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.iec104.groupName')">{{ viewData.groupname }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.iec104.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.iec104.enabled') : $t('opc.iec104.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.iec104.blackCmd')" :span="2">
          <div class="view-cmd-tags">
            <el-tag v-for="cmd in viewData.black_cmd" :key="cmd" type="info" size="small" class="cmd-tag">
              {{ cmd }}
            </el-tag>
            <span v-if="!viewData.black_cmd?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.iec104.addrConfig')" :span="2">
          <div class="view-addr-list">
            <div v-for="(addr, index) in viewData.iec_addr" :key="index" class="view-addr-item">
              <el-tag size="small">{{ addr.type === 'apdu_addr' ? $t('opc.iec104.apduAddr') : $t('opc.iec104.infoAddr') }}</el-tag>
              <span>{{ $t('opc.iec104.range') }}: {{ addr.begin }} - {{ addr.end }}</span>
            </div>
            <span v-if="!viewData.iec_addr?.length">-</span>
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
import { Lightning, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface IecAddrConfig {
  type: 'apdu_addr' | 'info_addr'
  begin: number
  end: number
}

interface Iec104Rule {
  id: string
  groupname: string
  rule_work: boolean
  black_cmd: string[]
  iec_addr: IecAddrConfig[]
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
const mockData = ref<Iec104Rule[]>([
  {
    id: '1',
    groupname: 'rtu_control',
    rule_work: true,
    black_cmd: ['M_CON_CLT_NA_1', 'M_CON_CLT_TA_1'],
    iec_addr: [
      { type: 'apdu_addr', begin: 1, end: 100 },
      { type: 'info_addr', begin: 0, end: 4096 }
    ]
  },
  {
    id: '2',
    groupname: 'scada_monitor',
    rule_work: true,
    black_cmd: ['C_SC_NA_1', 'C_DC_NA_1', 'C_RC_NA_1'],
    iec_addr: [
      { type: 'apdu_addr', begin: 101, end: 200 }
    ]
  }
])

const tableData = ref<Iec104Rule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  groupname: '',
  rule_work: true,
  black_cmd: [] as string[],
  iec_addr: [] as IecAddrConfig[]
})

const viewData = ref<Iec104Rule>({
  id: '',
  groupname: '',
  rule_work: false,
  black_cmd: [],
  iec_addr: []
})

const formRules: FormRules = {
  groupname: [
    { required: true, message: t('opc.iec104.groupNameRequired'), trigger: 'blur' }
  ]
}

// IEC104命令选项
const iec104Commands = [
  { value: 'M_CON_CLT_NA_1', label: 'M_CON_CLT_NA_1 - 单点遥信' },
  { value: 'M_CON_CLT_TA_1', label: 'M_CON_CLT_TA_1 - 带时标单点遥信' },
  { value: 'C_SC_NA_1', label: 'C_SC_NA_1 - 单点遥控' },
  { value: 'C_DC_NA_1', label: 'C_DC_NA_1 - 双点遥控' },
  { value: 'C_RC_NA_1', label: 'C_RC_NA_1 - 升降命令' },
  { value: 'M_ME_NA_1', label: 'M_ME_NA_1 - 归一化测量值' },
  { value: 'M_ME_NB_1', label: 'M_ME_NB_1 - 标度化测量值' },
  { value: 'M_ME_NC_1', label: 'M_ME_NC_1 - 短浮点测量值' }
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
  formData.groupname = ''
  formData.rule_work = true
  formData.black_cmd = []
  formData.iec_addr = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: Iec104Rule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: Iec104Rule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.groupname = row.groupname
  formData.rule_work = row.rule_work
  formData.black_cmd = [...row.black_cmd]
  formData.iec_addr = row.iec_addr.map(a => ({ ...a }))
  dialogVisible.value = true
}

const handleDelete = async (row: Iec104Rule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.iec104.deleteConfirm', { name: row.groupname }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.iec104.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const selectedRows = ref<Iec104Rule[]>([])

const handleSelectionChange = (rows: Iec104Rule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.iec104.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.iec104.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleAddAddr = () => {
  formData.iec_addr.push({
    type: 'apdu_addr',
    begin: 0,
    end: 0
  })
}

const handleRemoveAddr = (index: number) => {
  formData.iec_addr.splice(index, 1)
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
              groupname: formData.groupname,
              rule_work: formData.rule_work,
              black_cmd: [...formData.black_cmd],
              iec_addr: formData.iec_addr.map(a => ({ ...a }))
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            groupname: formData.groupname,
            rule_work: formData.rule_work,
            black_cmd: [...formData.black_cmd],
            iec_addr: formData.iec_addr.map(a => ({ ...a }))
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.iec104.editSuccess') : t('opc.iec104.addSuccess'),
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
.iec104-page {
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
.iec104-table {
  width: 100%;
}

.iec104-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.iec104-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.iec104-table :deep(.el-table .el-table__row:hover > td) {
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

/* 地址数量 */
.addr-count {
  color: #909399;
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
  color: #909399;
}

/* 地址配置 */
.addr-config-wrapper {
  width: 100%;
}

.addr-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addr-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

/* 添加配置项按钮样式 */
.addr-list :deep(.el-button--primary.is-plain),
.addr-config-wrapper :deep(.el-button--primary.is-plain) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #ffffff;
}

.addr-list :deep(.el-button--primary.is-plain:hover),
.addr-config-wrapper :deep(.el-button--primary.is-plain:hover) {
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

.view-addr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-addr-item {
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
  color: #606266;
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

  .addr-item {
    flex-wrap: wrap;
  }
}
</style>
