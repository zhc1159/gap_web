<template>
  <div class="page-container coap-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.coap.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.coap.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.coap.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-info">{{ $t('opc.coap.selectedCount', { count: selectedRows.length }) }}</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            {{ $t('common.batchDelete') }}
          </el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" class="coap-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <!-- 用户组 -->
          <el-table-column prop="group_name" :label="$t('opc.coap.groupName')" min-width="140">
            <template #default="{ row }">
              <span class="group-name">{{ row.group_name }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('opc.coap.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- URI过滤 -->
          <el-table-column :label="$t('opc.coap.uriMode')" min-width="200">
            <template #default="{ row }">
              <el-tag :type="getUriModeTagType(row.filterMsgUriMode)" size="small">
                {{ getUriModeLabel(row.filterMsgUriMode) }}
              </el-tag>
              <div v-if="row.filterMsgUri?.length" class="uri-list">
                <el-tag v-for="uri in row.filterMsgUri" :key="uri" size="small" class="uri-tag">{{ uri }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 消息类型 -->
          <el-table-column :label="$t('opc.coap.msgTypeFilter')" min-width="180">
            <template #default="{ row }">
              <div class="badge-list">
                <el-tag v-for="mt in row.filterMsgType" :key="mt" :type="getMsgTypeTagType(mt)" size="small" class="tech-tag">
                  {{ getMsgTypeLabel(mt) }}
                </el-tag>
                <span v-if="!row.filterMsgType?.length" class="empty-text">-</span>
              </div>
            </template>
          </el-table-column>

          <!-- 请求码 -->
          <el-table-column :label="$t('opc.coap.msgCodeFilter')" min-width="140">
            <template #default="{ row }">
              <div class="badge-list">
                <el-tag v-for="code in row.filterMsgCode" :key="code" type="primary" size="small" class="tech-tag">
                  {{ getMsgCodeLabel(code) }}
                </el-tag>
                <span v-if="!row.filterMsgCode?.length" class="empty-text">-</span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('opc.coap.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button size="small" class="btn-view" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('opc.coap.view') }}
                </el-button>
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('opc.coap.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('opc.coap.delete') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.coap.editDialog') : $t('opc.coap.addDialog')"
      width="640px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <!-- 规则开关 -->
        <el-form-item :label="$t('opc.coap.ruleSwitch')">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('opc.coap.groupName')" prop="group_name">
          <el-select v-model="formData.group_name" :placeholder="$t('opc.coap.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <!-- URI过滤模式 -->
        <el-form-item :label="$t('opc.coap.uriMode')">
          <el-select v-model="formData.filterMsgUriMode" style="width: 100%">
            <el-option :label="$t('opc.coap.noLimit')" :value="0" />
            <el-option :label="$t('opc.coap.blacklist')" :value="1" />
            <el-option :label="$t('opc.coap.whitelist')" :value="2" />
          </el-select>
        </el-form-item>

        <!-- URI列表 -->
        <el-form-item v-if="formData.filterMsgUriMode !== 0" :label="$t('opc.coap.uriList')">
          <div class="keyword-input-wrapper">
            <div class="keyword-list">
              <el-tag
                v-for="uri in formData.filterMsgUri"
                :key="uri"
                type="primary"
                closable
                size="small"
                @close="removeUri(uri)"
              >
                {{ uri }}
              </el-tag>
              <span v-if="formData.filterMsgUri.length === 0" class="empty-hint">{{ $t('opc.coap.noData') }}</span>
            </div>
            <div class="input-row">
              <el-input v-model="newUri" :placeholder="$t('opc.coap.uriPlaceholder')" @keyup.enter="addUri" />
              <el-button type="primary" @click="addUri">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 响应内容过滤 -->
        <el-form-item :label="$t('opc.coap.contentFilter')">
          <div class="keyword-input-wrapper">
            <div class="keyword-list">
              <el-tag
                v-for="cont in formData.filterMsgCont"
                :key="cont"
                type="warning"
                closable
                size="small"
                @close="removeContent(cont)"
              >
                {{ cont }}
              </el-tag>
              <span v-if="formData.filterMsgCont.length === 0" class="empty-hint">{{ $t('opc.coap.noData') }}</span>
            </div>
            <div class="input-row">
              <el-input v-model="newContent" :placeholder="$t('opc.coap.contentPlaceholder')" @keyup.enter="addContent" />
              <el-button type="primary" @click="addContent">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-divider>{{ $t('opc.coap.filterSection') }}</el-divider>

        <!-- 消息类型 -->
        <el-form-item :label="$t('opc.coap.msgTypeFilter')">
          <el-select v-model="formData.filterMsgType" multiple :placeholder="$t('opc.coap.msgTypePlaceholder')" style="width: 100%">
            <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 请求码 -->
        <el-form-item :label="$t('opc.coap.msgCodeFilter')">
          <el-select v-model="formData.filterMsgCode" multiple :placeholder="$t('opc.coap.msgCodePlaceholder')" style="width: 100%">
            <el-option v-for="item in msgCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 内容格式 -->
        <el-form-item :label="$t('opc.coap.contFmtFilter')">
          <el-select v-model="formData.filterMsgContFmt" multiple :placeholder="$t('opc.coap.contFmtPlaceholder')" style="width: 100%">
            <el-option v-for="item in contFmtOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.coap.viewDetail')"
      width="650px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.coap.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.coap.enabled') : $t('opc.coap.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.uriMode')">
          <el-tag :type="getUriModeTagType(viewData.filterMsgUriMode)" size="small">
            {{ getUriModeLabel(viewData.filterMsgUriMode) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.uriList')">
          <div class="view-tags" v-if="viewData.filterMsgUri?.length">
            <el-tag v-for="uri in viewData.filterMsgUri" :key="uri" size="small" class="view-tag">{{ uri }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.contentFilter')" :span="2">
          <div class="view-tags" v-if="viewData.filterMsgCont?.length">
            <el-tag v-for="c in viewData.filterMsgCont" :key="c" type="warning" size="small" class="view-tag">{{ c }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.msgTypeFilter')">
          <div class="view-tags" v-if="viewData.filterMsgType?.length">
            <el-tag v-for="mt in viewData.filterMsgType" :key="mt" :type="getMsgTypeTagType(mt)" size="small" class="view-tag">{{ getMsgTypeLabel(mt) }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.msgCodeFilter')">
          <div class="view-tags" v-if="viewData.filterMsgCode?.length">
            <el-tag v-for="code in viewData.filterMsgCode" :key="code" type="primary" size="small" class="view-tag">{{ getMsgCodeLabel(code) }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.coap.contFmtFilter')" :span="2">
          <div class="view-tags" v-if="viewData.filterMsgContFmt?.length">
            <el-tag v-for="fmt in viewData.filterMsgContFmt" :key="fmt" type="info" size="small" class="view-tag">{{ getContFmtLabel(fmt) }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface CoapRule {
  id: string
  group_name: string
  rule_work: boolean
  filterMsgUriMode: number
  filterMsgUri: string[]
  filterMsgCont: string[]
  filterMsgType: number[]
  filterMsgCode: number[]
  filterMsgContFmt: number[]
}

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

const msgTypeOptions = [
  { value: 0, label: t('opc.coap.msgType.CON') },
  { value: 1, label: t('opc.coap.msgType.NON') },
  { value: 2, label: t('opc.coap.msgType.ACK') },
  { value: 3, label: t('opc.coap.msgType.RST') }
]

const msgCodeOptions = [
  { value: 1, label: t('opc.coap.msgCode.GET') },
  { value: 2, label: t('opc.coap.msgCode.POST') },
  { value: 3, label: t('opc.coap.msgCode.PUT') },
  { value: 4, label: t('opc.coap.msgCode.DELETE') }
]

const contFmtOptions = [
  { value: 0,  label: t('opc.coap.contFmt.TEXT_PLAIN') },
  { value: 40, label: t('opc.coap.contFmt.LINK_FORMAT') },
  { value: 41, label: t('opc.coap.contFmt.XML') },
  { value: 42, label: t('opc.coap.contFmt.OCTET_STREAM') },
  { value: 47, label: t('opc.coap.contFmt.EXI') },
  { value: 50, label: t('opc.coap.contFmt.JSON') }
]

// ==================== 辅助 ====================
const getUriModeLabel = (mode: number) => {
  const map: Record<number, string> = { 0: t('opc.coap.noLimit'), 1: t('opc.coap.blacklist'), 2: t('opc.coap.whitelist') }
  return map[mode] || '-'
}
const getUriModeTagType = (mode: number) => {
  const map: Record<number, string> = { 0: 'info', 1: 'danger', 2: 'success' }
  return map[mode] || 'info'
}
const getMsgTypeLabel = (v: number) => {
  const map: Record<number, string> = { 0: 'CON', 1: 'NON', 2: 'ACK', 3: 'RST' }
  return map[v] || String(v)
}
const getMsgTypeTagType = (v: number) => {
  const map: Record<number, string> = { 0: 'primary', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[v] || 'info'
}
const getMsgCodeLabel = (v: number) => {
  const map: Record<number, string> = { 1: 'GET', 2: 'POST', 3: 'PUT', 4: 'DELETE' }
  return map[v] || String(v)
}
const getContFmtLabel = (v: number) => {
  const map: Record<number, string> = { 0: 'text/plain', 40: 'link-format', 41: 'xml', 42: 'octet-stream', 47: 'exi', 50: 'json' }
  return map[v] || String(v)
}

// ==================== 状态 ====================
const selectedRows = ref<CoapRule[]>([])
const handleSelectionChange = (rows: CoapRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.coap.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.coap.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const newUri = ref('')
const newContent = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<CoapRule[]>([
  {
    id: '1', group_name: 'sensor_network', rule_work: true,
    filterMsgUriMode: 2, filterMsgUri: ['/sensors/temp', '/sensors/humidity'],
    filterMsgCont: ['error'], filterMsgType: [0, 1], filterMsgCode: [1], filterMsgContFmt: [50]
  },
  {
    id: '2', group_name: 'actuator_control', rule_work: true,
    filterMsgUriMode: 1, filterMsgUri: ['/actuators/valve'],
    filterMsgCont: [], filterMsgType: [0, 2], filterMsgCode: [2, 3], filterMsgContFmt: [0, 50]
  },
  {
    id: '3', group_name: 'device_mgmt', rule_work: false,
    filterMsgUriMode: 0, filterMsgUri: [],
    filterMsgCont: ['warning'], filterMsgType: [3], filterMsgCode: [1, 4], filterMsgContFmt: [41, 42]
  }
])

const tableData = ref<CoapRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  group_name: '',
  rule_work: true,
  filterMsgUriMode: 0,
  filterMsgUri: [] as string[],
  filterMsgCont: [] as string[],
  filterMsgType: [] as number[],
  filterMsgCode: [] as number[],
  filterMsgContFmt: [] as number[]
})

const viewData = ref<CoapRule>({
  id: '', group_name: '', rule_work: false,
  filterMsgUriMode: 0, filterMsgUri: [], filterMsgCont: [],
  filterMsgType: [], filterMsgCode: [], filterMsgContFmt: []
})

const formRules: FormRules = {
  group_name: [{ required: true, message: t('opc.coap.groupNameRequired'), trigger: 'change' }]
}

// ==================== 数据加载 ====================
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
  }, 300)
}

// ==================== 操作 ====================
const addUri = () => {
  const val = newUri.value.trim()
  if (val && !formData.filterMsgUri.includes(val)) {
    formData.filterMsgUri.push(val)
    newUri.value = ''
  }
}
const removeUri = (uri: string) => {
  formData.filterMsgUri = formData.filterMsgUri.filter(u => u !== uri)
}
const addContent = () => {
  const val = newContent.value.trim()
  if (val && !formData.filterMsgCont.includes(val)) {
    formData.filterMsgCont.push(val)
    newContent.value = ''
  }
}
const removeContent = (cont: string) => {
  formData.filterMsgCont = formData.filterMsgCont.filter(c => c !== cont)
}

const resetForm = () => {
  formData.group_name = ''
  formData.rule_work = true
  formData.filterMsgUriMode = 0
  formData.filterMsgUri = []
  formData.filterMsgCont = []
  formData.filterMsgType = []
  formData.filterMsgCode = []
  formData.filterMsgContFmt = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: CoapRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: CoapRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.filterMsgUriMode = row.filterMsgUriMode
  formData.filterMsgUri = [...row.filterMsgUri]
  formData.filterMsgCont = [...row.filterMsgCont]
  formData.filterMsgType = [...row.filterMsgType]
  formData.filterMsgCode = [...row.filterMsgCode]
  formData.filterMsgContFmt = [...row.filterMsgContFmt]
  dialogVisible.value = true
}

const handleDelete = async (row: CoapRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.coap.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.coap.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: CoapRule) => {
  ElNotification({ title: t('common.success'), message: t('opc.coap.editSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockData.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          mockData.value[index] = {
            id: editingId.value,
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            filterMsgUriMode: formData.filterMsgUriMode,
            filterMsgUri: [...formData.filterMsgUri],
            filterMsgCont: [...formData.filterMsgCont],
            filterMsgType: [...formData.filterMsgType],
            filterMsgCode: [...formData.filterMsgCode],
            filterMsgContFmt: [...formData.filterMsgContFmt]
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(),
          group_name: formData.group_name,
          rule_work: formData.rule_work,
          filterMsgUriMode: formData.filterMsgUriMode,
          filterMsgUri: [...formData.filterMsgUri],
          filterMsgCont: [...formData.filterMsgCont],
          filterMsgType: [...formData.filterMsgType],
          filterMsgCode: [...formData.filterMsgCode],
          filterMsgContFmt: [...formData.filterMsgContFmt]
        })
      }
      submitLoading.value = false
      dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('opc.coap.editSuccess') : t('opc.coap.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

// ==================== 初始化 ====================
fetchList()
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

.coap-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
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

/* ========== 页面描述 ========== */
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

/* ========== 主卡片 ========== */
.main-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px 28px;
}

/* ========== 批量操作栏 ========== */
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

/* ========== 表格 ========== */
.coap-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.coap-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.coap-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.group-name {
  font-weight: 600;
  color: #409EFF;
}

.config-count {
  margin-left: 4px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.uri-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.uri-tag {
  font-size: 11px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tech-tag {
  font-size: 12px;
}

.empty-text {
  color: #c0c4cc;
}

.action-btns {
  display: flex;
  gap: 6px;
}

/* ========== 分页 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.form-dialog :deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.form-content {
  max-width: 100%;
}

/* ========== 关键字输入（与SFTP风格一致） ========== */
.keyword-input-wrapper {
  width: 100%;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 32px;
  padding: 8px;
  background: rgba(64, 158, 255, 0.02);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row :deep(.el-input) {
  flex: 1;
}

/* ========== 查看对话框 ========== */
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

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
