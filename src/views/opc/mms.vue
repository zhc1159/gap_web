<template>
  <div class="page-container mms-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.mms.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.mms.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.mms.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-info">{{ $t('opc.mms.selectedCount', { count: selectedRows.length }) }}</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            {{ $t('common.batchDelete') }}
          </el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" class="mms-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <!-- 用户组 -->
          <el-table-column prop="group_name" :label="$t('opc.mms.groupName')" min-width="130">
            <template #default="{ row }">
              <span class="group-name">{{ row.group_name }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('opc.mms.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- 白黑名单控制 -->
          <el-table-column :label="$t('opc.mms.filterType')" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getFilterTagType(row.filter_type)" size="small">
                {{ getFilterLabel(row.filter_type) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 服务配置 -->
          <el-table-column :label="$t('opc.mms.serviceConfig')" min-width="300">
            <template #default="{ row }">
              <div class="service-tags">
                <el-tag
                  v-for="svc in serviceList"
                  :key="svc.key"
                  :type="row.tabs[svc.key] === 1 ? 'success' : 'info'"
                  size="small"
                  class="service-tag"
                >
                  {{ svc.label }}
                  <el-icon v-if="row.tabs[svc.key] === 1" style="margin-left: 2px"><Check /></el-icon>
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('opc.mms.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button size="small" class="btn-view" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('opc.mms.view') }}
                </el-button>
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('opc.mms.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('opc.mms.delete') }}
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
      :title="isEdit ? $t('opc.mms.editDialog') : $t('opc.mms.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="180px" class="form-content">
        <!-- 规则开关 -->
        <el-form-item :label="$t('opc.mms.ruleSwitch')">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('opc.mms.groupName')" prop="group_name">
          <el-select v-model="formData.group_name" :placeholder="$t('opc.mms.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <!-- 白黑名单控制 -->
        <el-form-item :label="$t('opc.mms.filterType')" prop="filter_type">
          <el-select v-model="formData.filter_type" style="width: 100%">
            <el-option :label="$t('opc.mms.filterTypeOptions.noLimit')" :value="0" />
            <el-option :label="$t('opc.mms.filterTypeOptions.whitelist')" :value="1" />
            <el-option :label="$t('opc.mms.filterTypeOptions.blacklist')" :value="2" />
          </el-select>
        </el-form-item>

        <el-divider>{{ $t('opc.mms.serviceSection') }}</el-divider>

        <!-- MMS服务配置 -->
        <el-form-item
          v-for="svc in serviceList"
          :key="svc.key"
          :label="svc.label"
        >
          <el-radio-group v-model="formData.tabs[svc.key]">
            <el-radio :value="1">{{ $t('opc.mms.serviceEnable') }}</el-radio>
            <el-radio :value="0">{{ $t('opc.mms.serviceDisable') }}</el-radio>
          </el-radio-group>
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
    <el-dialog v-model="viewDialogVisible" :title="$t('opc.mms.viewDetail')" width="600px" class="view-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.mms.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.mms.enabled') : $t('opc.mms.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.filterType')">
          <el-tag :type="getFilterTagType(viewData.filter_type)" size="small">{{ getFilterLabel(viewData.filter_type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.serviceConfig')" :span="2">
          <div class="view-services">
            <div v-for="svc in serviceList" :key="svc.key" class="service-item">
              <span class="service-name">{{ svc.label }}</span>
              <el-tag :type="viewData.tabs[svc.key] === 1 ? 'success' : 'info'" size="small">
                {{ viewData.tabs[svc.key] === 1 ? $t('opc.mms.serviceEnable') : $t('opc.mms.serviceDisable') }}
              </el-tag>
            </div>
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
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, View, Edit, Delete, Check } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface MmsServiceConfig { [key: string]: number }
interface MmsRule {
  id: string; group_name: string; rule_work: boolean
  filter_type: number; tabs: MmsServiceConfig
}

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

const serviceList = [
  { key: 'MMS_GETNAMELIST', label: t('opc.mms.services.MMS_GETNAMELIST') },
  { key: 'MMS_READ', label: t('opc.mms.services.MMS_READ') },
  { key: 'MMS_WRITE', label: t('opc.mms.services.MMS_WRITE') },
  { key: 'MMS_GETVARIABLEACCESSATTRIBUTES', label: t('opc.mms.services.MMS_GETVARIABLEACCESSATTRIBUTES') },
  { key: 'MMS_GETNAMEDVARIABLELISTATTRIBUTES', label: t('opc.mms.services.MMS_GETNAMEDVARIABLELISTATTRIBUTES') },
  { key: 'MMS_LISTOFIDENTIFIER', label: t('opc.mms.services.MMS_LISTOFIDENTIFIER') }
]

// ==================== 辅助 ====================
const getFilterLabel = (type: number) => {
  const map: Record<number, string> = { 0: t('opc.mms.filterTypeOptions.noLimit'), 1: t('opc.mms.filterTypeOptions.whitelist'), 2: t('opc.mms.filterTypeOptions.blacklist') }
  return map[type] || '-'
}
const getFilterTagType = (type: number) => ({ 0: 'info', 1: 'success', 2: 'danger' }[type] || 'info')

const defaultTabs = (): MmsServiceConfig => ({
  MMS_GETNAMELIST: 0, MMS_READ: 0, MMS_WRITE: 0,
  MMS_GETVARIABLEACCESSATTRIBUTES: 0, MMS_GETNAMEDVARIABLELISTATTRIBUTES: 0,
  MMS_LISTOFIDENTIFIER: 0
})

// ==================== 状态 ====================
const selectedRows = ref<MmsRule[]>([])
const handleSelectionChange = (rows: MmsRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.mms.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.mms.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<MmsRule[]>([
  {
    id: '1', group_name: 'scada_system', rule_work: true, filter_type: 1,
    tabs: { MMS_GETNAMELIST: 1, MMS_READ: 1, MMS_WRITE: 0, MMS_GETVARIABLEACCESSATTRIBUTES: 1, MMS_GETNAMEDVARIABLELISTATTRIBUTES: 0, MMS_LISTOFIDENTIFIER: 1 }
  },
  {
    id: '2', group_name: 'engineering_station', rule_work: true, filter_type: 2,
    tabs: { MMS_GETNAMELIST: 0, MMS_READ: 0, MMS_WRITE: 1, MMS_GETVARIABLEACCESSATTRIBUTES: 0, MMS_GETNAMEDVARIABLELISTATTRIBUTES: 1, MMS_LISTOFIDENTIFIER: 0 }
  },
  {
    id: '3', group_name: 'monitor_only', rule_work: false, filter_type: 0,
    tabs: defaultTabs()
  }
])

const tableData = ref<MmsRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  group_name: '', rule_work: true, filter_type: 0, tabs: defaultTabs()
})
const viewData = ref<MmsRule>({
  id: '', group_name: '', rule_work: false, filter_type: 0, tabs: defaultTabs()
})
const formRules: FormRules = {
  group_name: [{ required: true, message: t('opc.mms.groupNameRequired'), trigger: 'change' }],
  filter_type: [{ required: true, message: t('opc.mms.filterTypeRequired'), trigger: 'change' }]
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
const resetForm = () => {
  formData.group_name = ''; formData.rule_work = true
  formData.filter_type = 0; formData.tabs = defaultTabs()
  editingId.value = ''
}

const handleAdd = () => { isEdit.value = false; resetForm(); dialogVisible.value = true }

const handleView = (row: MmsRule) => {
  viewData.value = { ...row, tabs: { ...row.tabs } }
  viewDialogVisible.value = true
}

const handleEdit = (row: MmsRule) => {
  isEdit.value = true; editingId.value = row.id
  formData.group_name = row.group_name; formData.rule_work = row.rule_work
  formData.filter_type = row.filter_type; formData.tabs = { ...row.tabs }
  dialogVisible.value = true
}

const handleDelete = async (row: MmsRule) => {
  try {
    await ElMessageBox.confirm(t('opc.mms.deleteConfirm', { name: row.group_name }), t('common.confirm'), { type: 'warning' })
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.mms.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: MmsRule) => {
  ElNotification({ title: t('common.success'), message: t('opc.mms.editSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const idx = mockData.value.findIndex(item => item.id === editingId.value)
        if (idx !== -1) {
          mockData.value[idx] = {
            id: editingId.value, group_name: formData.group_name,
            rule_work: formData.rule_work, filter_type: formData.filter_type,
            tabs: { ...formData.tabs }
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(), group_name: formData.group_name,
          rule_work: formData.rule_work, filter_type: formData.filter_type,
          tabs: { ...formData.tabs }
        })
      }
      submitLoading.value = false; dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('opc.mms.editSuccess') : t('opc.mms.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

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

.mms-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: var(--page-header-gradient);
  border-radius: 12px; margin-bottom: 16px;
  box-shadow: 0 4px 16px var(--page-header-shadow);
}
.header-left { display: flex; align-items: center; color: var(--page-header-text); }
.header-icon {
  width: 36px; height: 36px; background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  margin-right: 12px; font-size: 18px;
}
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; }
.btn-add:hover { background: rgba(255, 255, 255, 0.3); }

/* ========== 页面描述 ========== */
.page-describe {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px; margin-bottom: 16px; color: var(--el-text-color-secondary); font-size: 14px;
}
.describe-icon { color: #409EFF; font-size: 16px; }

/* ========== 主卡片 ========== */
.main-card {
  background: var(--card-bg); border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}
.card-content { padding: 24px 28px; }

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
.mms-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600; color: var(--el-text-color-primary); padding: 14px 12px;
}
.mms-table :deep(.el-table td.el-table__cell) { padding: 14px 12px; }
.mms-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}
.group-name { font-weight: 600; color: #409EFF; }
.service-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.service-tag { font-size: 12px; }
.empty-text { color: #c0c4cc; }
.action-btns { display: flex; gap: 6px; }
.pagination-wrapper {
  display: flex; justify-content: flex-end; margin-top: 20px;
  padding-top: 16px; border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0; padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}
.form-dialog :deep(.el-dialog__body) { padding: 24px; max-height: 60vh; overflow-y: auto; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid rgba(64, 158, 255, 0.1); padding: 16px 20px; }
.form-dialog :deep(.el-divider__text) { font-size: 14px; font-weight: 600; color: #409EFF; }
.form-content { max-width: 100%; }

/* ========== 查看对话框 ========== */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}
.view-services { display: flex; flex-direction: column; gap: 8px; }
.service-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 12px; background: rgba(64, 158, 255, 0.03);
  border-radius: 6px; border: 1px solid rgba(64, 158, 255, 0.06);
}
.service-name { font-size: 13px; color: var(--el-text-color-primary); font-weight: 500; }

/* ========== 底部按钮 ========== */
.dialog-footer { display: flex; justify-content: center; gap: 12px; }
</style>
