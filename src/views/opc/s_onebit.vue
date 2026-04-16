<template>
  <div class="page-container onebit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.s_onebit.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.s_onebit.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.s_onebit.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('opc.s_onebit.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <el-table :data="tableData" v-loading="loading" class="onebit-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 规则名称 -->
            <el-table-column prop="name" :label="$t('opc.s_onebit.ruleName')" min-width="150">
              <template #default="{ row }">
                <span class="rule-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- 用户组 -->
            <el-table-column prop="userGroup" :label="$t('opc.s_onebit.userGroup')" min-width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small" effect="plain">{{ row.userGroup }}</el-tag>
              </template>
            </el-table-column>

            <!-- 应答模式 -->
            <el-table-column :label="$t('opc.s_onebit.responseMode')" width="100">
              <template #default="{ row }">
                <el-tag type="primary" size="small">
                  {{ getResponseModeText(row.responseMode) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 应答超时 -->
            <el-table-column prop="responseTimeout" :label="$t('opc.s_onebit.responseTimeout')" width="120" align="center">
              <template #default="{ row }">
                <span class="timeout-value">{{ row.responseTimeout }}s</span>
              </template>
            </el-table-column>

            <!-- 最大包数 -->
            <el-table-column prop="maxPacketCount" :label="$t('opc.s_onebit.maxPacketCount')" width="120" align="center">
              <template #default="{ row }">
                <span class="packet-count">{{ row.maxPacketCount }}</span>
              </template>
            </el-table-column>

            <!-- 规则开关 -->
            <el-table-column :label="$t('opc.s_onebit.enabled')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? $t('common.enabled') : $t('common.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 阻断标识 -->
            <el-table-column :label="$t('opc.s_onebit.blockFlag')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.blockFlag ? 'danger' : 'info'" size="small">
                  {{ row.blockFlag ? $t('common.on') : $t('common.off') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.s_onebit.actions')" min-width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.s_onebit.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.s_onebit.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.s_onebit.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
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
      :title="isEdit ? $t('opc.s_onebit.editTitle') : $t('opc.s_onebit.addTitle')"
      width="700px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="160px" class="form-content">
        <el-form-item :label="$t('opc.s_onebit.ruleName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('opc.s_onebit.ruleNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.userGroup')" prop="userGroup">
          <el-select v-model="formData.userGroup" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.responseMode')" prop="responseMode">
          <el-select v-model="formData.responseMode" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option :label="$t('opc.s_onebit.responseModeNone')" value="NONE" />
            <el-option :label="$t('opc.s_onebit.responseModeSingle0')" value="SINGLE_0" />
            <el-option :label="$t('opc.s_onebit.responseModeSingle1')" value="SINGLE_1" />
            <el-option :label="$t('opc.s_onebit.responseModeDouble')" value="DOUBLE" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.responseTimeoutLabel')" prop="responseTimeout">
          <el-input-number v-model="formData.responseTimeout" :min="1" :max="3600" style="width: 150px" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.maxPacketCountLabel')" prop="maxPacketCount">
          <el-input-number v-model="formData.maxPacketCount" :min="1" :max="10000" style="width: 150px" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.enabled')" prop="enabled">
          <el-switch v-model="formData.enabled" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.s_onebit.blockFlag')" prop="blockFlag">
          <el-switch v-model="formData.blockFlag" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
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
      :title="$t('opc.s_onebit.viewTitle')"
      width="600px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.s_onebit.ruleName')">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.userGroup')">{{ viewData.userGroup }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.responseMode')">
          <el-tag type="primary" size="small">{{ getResponseModeText(viewData.responseMode) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.responseTimeout')">{{ viewData.responseTimeout }}s</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.maxPacketCount')">{{ viewData.maxPacketCount }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.enabled')">
          <el-tag :type="viewData.enabled ? 'success' : 'info'" size="small">
            {{ viewData.enabled ? $t('common.enabled') : $t('common.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s_onebit.blockFlag')" :span="2">
          <el-tag :type="viewData.blockFlag ? 'danger' : 'info'" size="small">
            {{ viewData.blockFlag ? $t('common.on') : $t('common.off') }}
          </el-tag>
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

type ResponseMode = 'NONE' | 'SINGLE_0' | 'SINGLE_1' | 'DOUBLE'

interface OnebitRule {
  id: string
  name: string
  userGroup: string
  responseMode: ResponseMode
  responseTimeout: number
  maxPacketCount: number
  enabled: boolean
  blockFlag: boolean
}

interface OnebitFormData {
  id?: string
  name: string
  userGroup: string
  responseMode: ResponseMode
  responseTimeout: number
  maxPacketCount: number
  enabled: boolean
  blockFlag: boolean
}

// 用户组选项
const groupOptions = [
  'opc_group_1',
  'opc_group_2',
  'admin_group',
  'user_group'
]

// 状态
const selectedRows = ref<OnebitRule[]>([])
const handleSelectionChange = (rows: OnebitRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('opc.s_onebit.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.s_onebit.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const tableData = ref<OnebitRule[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单数据
const formData = reactive<OnebitFormData>({
  id: undefined,
  name: '',
  userGroup: '',
  responseMode: 'NONE',
  responseTimeout: 30,
  maxPacketCount: 10,
  enabled: true,
  blockFlag: false
})

// 查看数据
const viewData = ref<OnebitRule>({
  id: '',
  name: '',
  userGroup: '',
  responseMode: 'NONE',
  responseTimeout: 30,
  maxPacketCount: 10,
  enabled: true,
  blockFlag: false
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: t('opc.s_onebit.ruleNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('opc.s_onebit.ruleNamePattern'), trigger: 'blur' }
  ],
  userGroup: [{ required: true, message: t('opc.s_onebit.userGroupRequired'), trigger: 'change' }],
  responseMode: [{ required: true, message: t('opc.s_onebit.responseModeRequired'), trigger: 'change' }],
  responseTimeout: [{ required: true, message: t('opc.s_onebit.responseTimeoutRequired'), trigger: 'blur' }],
  maxPacketCount: [{ required: true, message: t('opc.s_onebit.maxPacketCountRequired'), trigger: 'blur' }]
}

// 获取应答模式文本
const getResponseModeText = (mode: ResponseMode) => {
  const texts: Record<ResponseMode, string> = {
    NONE: t('opc.s_onebit.responseModeNone'),
    SINGLE_0: t('opc.s_onebit.responseModeSingle0'),
    SINGLE_1: t('opc.s_onebit.responseModeSingle1'),
    DOUBLE: t('opc.s_onebit.responseModeDouble')
  }
  return texts[mode] || mode
}

// 模拟数据
const mockData = ref<OnebitRule[]>([
  {
    id: '1',
    name: 'rule_1bit_001',
    userGroup: 'opc_group_1',
    responseMode: 'DOUBLE',
    responseTimeout: 30,
    maxPacketCount: 100,
    enabled: true,
    blockFlag: false
  },
  {
    id: '2',
    name: 'rule_1bit_002',
    userGroup: 'admin_group',
    responseMode: 'SINGLE_0',
    responseTimeout: 60,
    maxPacketCount: 50,
    enabled: true,
    blockFlag: true
  },
  {
    id: '3',
    name: 'rule_1bit_003',
    userGroup: 'user_group',
    responseMode: 'NONE',
    responseTimeout: 15,
    maxPacketCount: 200,
    enabled: false,
    blockFlag: false
  }
])

// 获取列表
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchList()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchList()
}

const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    total.value = mockData.value.length
    loading.value = false
  }, 500)
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.userGroup = ''
  formData.responseMode = 'NONE'
  formData.responseTimeout = 30
  formData.maxPacketCount = 10
  formData.enabled = true
  formData.blockFlag = false
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: OnebitRule) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 查看
const handleView = (row: OnebitRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (row: OnebitRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.s_onebit.deleteConfirm'),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.s_onebit.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

// 提交
const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        if (isEdit.value && formData.id) {
          const index = mockData.value.findIndex(item => item.id === formData.id)
          if (index !== -1) {
            mockData.value[index] = { ...formData } as OnebitRule
          }
        } else {
          mockData.value.push({
            ...formData,
            id: Date.now().toString()
          } as OnebitRule)
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.s_onebit.editSuccess') : t('opc.s_onebit.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 500)
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.onebit-page {
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

/* 表格样式 */
.onebit-table {
  width: 100%;
}

.onebit-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.onebit-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.onebit-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 规则名称 */
.rule-name {
  font-weight: 600;
  color: #409EFF;
}

/* 数值样式 */
.timeout-value,
.packet-count {
  color: #67C23A;
  font-weight: 500;
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

.unit-text {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}

/* 查看对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-dialog :deep(.el-descriptions) {
  width: 100%;
}

.view-dialog :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
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
