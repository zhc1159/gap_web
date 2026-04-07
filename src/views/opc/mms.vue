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
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="mms-table">
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.mms.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.mms.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.mms.enabled') : $t('opc.mms.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 过滤模式 -->
            <el-table-column :label="$t('opc.mms.filterMode')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getFilterType(row.filter_type)" size="small">
                  {{ getFilterLabel(row.filter_type) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 服务配置 -->
            <el-table-column :label="$t('opc.mms.serviceConfig')" min-width="300">
              <template #default="{ row }">
                <div class="service-tags">
                  <el-tag
                    v-for="(value, key) in getActiveServices(row.tabs)"
                    :key="key"
                    :type="value === 1 ? 'success' : 'danger'"
                    size="small"
                    class="service-tag"
                  >
                    {{ getServiceLabel(key as string) }}
                  </el-tag>
                  <span v-if="!hasActiveServices(row.tabs)" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.mms.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.mms.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
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

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50]"
            />
          </div>
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
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.mms.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('opc.mms.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.mms.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.mms.filterMode')" prop="filter_type">
          <el-radio-group v-model="formData.filter_type">
            <el-radio :value="0">{{ $t('opc.mms.noLimit') }}</el-radio>
            <el-radio :value="1">{{ $t('opc.mms.whitelist') }}</el-radio>
            <el-radio :value="2">{{ $t('opc.mms.blacklist') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('opc.mms.serviceConfig')">
          <div class="service-config">
            <el-checkbox
              v-for="service in serviceList"
              :key="service.key"
              v-model="formData.tabs[service.key]"
              :true-value="1"
              :false-value="0"
            >
              {{ service.label }}
            </el-checkbox>
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
      :title="$t('opc.mms.viewDetail')"
      width="550px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.mms.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.mms.enabled') : $t('opc.mms.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.filterMode')">
          <el-tag :type="getFilterType(viewData.filter_type)" size="small">
            {{ getFilterLabel(viewData.filter_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.mms.serviceConfig')" :span="2">
          <div class="view-tags">
            <el-tag
              v-for="(value, key) in getActiveServices(viewData.tabs)"
              :key="key"
              :type="value === 1 ? 'success' : 'danger'"
              size="small"
              class="view-tag"
            >
              {{ getServiceLabel(key as string) }}
            </el-tag>
            <span v-if="!hasActiveServices(viewData.tabs)">-</span>
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
interface MmsServiceConfig {
  [key: string]: number
}

interface MmsRule {
  id: string
  group_name: string
  rule_work: boolean
  filter_type: number
  tabs: MmsServiceConfig
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// 服务列表
const serviceList = [
  { key: 'MMS_GETNAMELIST', label: 'GetNameList' },
  { key: 'MMS_READ', label: 'Read' },
  { key: 'MMS_WRITE', label: 'Write' },
  { key: 'MMS_GETVARIABLEACCESSATTRIBUTES', label: 'GetVariableAccessAttributes' },
  { key: 'MMS_GETNAMEDVARIABLELISTATTRIBUTES', label: 'GetNamedVariableListAttributes' },
  { key: 'MMS_LISTOFIDENTIFIER', label: 'ListOfIdentifier' }
]

// 模拟数据
const mockData = ref<MmsRule[]>([
  {
    id: '1',
    group_name: 'scada_system',
    rule_work: true,
    filter_type: 1,
    tabs: {
      MMS_GETNAMELIST: 1,
      MMS_READ: 1,
      MMS_WRITE: 0,
      MMS_GETVARIABLEACCESSATTRIBUTES: 1,
      MMS_GETNAMEDVARIABLELISTATTRIBUTES: 0,
      MMS_LISTOFIDENTIFIER: 1
    }
  },
  {
    id: '2',
    group_name: 'engineering_station',
    rule_work: true,
    filter_type: 2,
    tabs: {
      MMS_GETNAMELIST: 0,
      MMS_READ: 0,
      MMS_WRITE: 1,
      MMS_GETVARIABLEACCESSATTRIBUTES: 0,
      MMS_GETNAMEDVARIABLELISTATTRIBUTES: 1,
      MMS_LISTOFIDENTIFIER: 0
    }
  },
  {
    id: '3',
    group_name: 'monitor_only',
    rule_work: false,
    filter_type: 0,
    tabs: {
      MMS_GETNAMELIST: 0,
      MMS_READ: 0,
      MMS_WRITE: 0,
      MMS_GETVARIABLEACCESSATTRIBUTES: 0,
      MMS_GETNAMEDVARIABLELISTATTRIBUTES: 0,
      MMS_LISTOFIDENTIFIER: 0
    }
  }
])

const tableData = ref<MmsRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const defaultTabs = (): MmsServiceConfig => ({
  MMS_GETNAMELIST: 0,
  MMS_READ: 0,
  MMS_WRITE: 0,
  MMS_GETVARIABLEACCESSATTRIBUTES: 0,
  MMS_GETNAMEDVARIABLELISTATTRIBUTES: 0,
  MMS_LISTOFIDENTIFIER: 0
})

const formData = reactive({
  group_name: '',
  rule_work: true,
  filter_type: 0,
  tabs: defaultTabs()
})

const viewData = ref<MmsRule>({
  id: '',
  group_name: '',
  rule_work: false,
  filter_type: 0,
  tabs: defaultTabs()
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.mms.groupNameRequired'), trigger: 'blur' }
  ],
  filter_type: [
    { required: true, message: t('opc.mms.filterModeRequired'), trigger: 'change' }
  ]
}

// 辅助方法
const getFilterType = (type: number) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'danger'
  }
  return types[type] || 'info'
}

const getFilterLabel = (type: number) => {
  const labels: Record<number, string> = {
    0: t('opc.mms.noLimit'),
    1: t('opc.mms.whitelist'),
    2: t('opc.mms.blacklist')
  }
  return labels[type] || '-'
}

const getServiceLabel = (key: string) => {
  const service = serviceList.find(s => s.key === key)
  return service ? service.label : key
}

const getActiveServices = (tabs: MmsServiceConfig) => {
  const active: Record<string, number> = {}
  for (const [key, value] of Object.entries(tabs)) {
    if (value === 1) {
      active[key] = value
    }
  }
  return active
}

const hasActiveServices = (tabs: MmsServiceConfig) => {
  return Object.values(tabs).some(v => v === 1)
}

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
  formData.group_name = ''
  formData.rule_work = true
  formData.filter_type = 0
  formData.tabs = defaultTabs()
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: MmsRule) => {
  viewData.value = { ...row, tabs: { ...row.tabs } }
  viewDialogVisible.value = true
}

const handleEdit = (row: MmsRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.filter_type = row.filter_type
  formData.tabs = { ...row.tabs }
  dialogVisible.value = true
}

const handleDelete = async (row: MmsRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.mms.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.mms.deleteSuccess'),
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
              filter_type: formData.filter_type,
              tabs: { ...formData.tabs }
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            filter_type: formData.filter_type,
            tabs: { ...formData.tabs }
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.mms.editSuccess') : t('opc.mms.addSuccess'),
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
.mms-page {
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
.mms-table {
  width: 100%;
}

.mms-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.mms-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.mms-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 标签 */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.service-tag {
  font-size: 12px;
}

.empty-text {
  color: #c0c4cc;
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

.service-config {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.service-config .el-checkbox {
  margin-right: 0;
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
