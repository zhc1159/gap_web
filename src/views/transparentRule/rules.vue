<template>
  <div class="page-container security-rules-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <span class="header-title">{{ $t('transparentRule.rules.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('transparentRule.rules.add') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('transparentRule.rules.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-bar" v-if="selectedRows.length > 0">
            <span class="batch-info">{{ t('transparentRule.rules.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="rules-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <!-- 状态 -->
            <el-table-column :label="$t('transparentRule.rules.status')" min-width="80" align="center">
              <template #default="{ row }">
                <div class="status-toggle" @click="handleToggle(row)">
                  <div class="status-indicator" :class="{ active: row.enable }"></div>
                  <el-icon class="status-icon" :class="{ active: row.enable }">
                    <VideoPlay v-if="!row.enable" />
                    <VideoPause v-else />
                  </el-icon>
                </div>
              </template>
            </el-table-column>

            <!-- 规则名称 -->
            <el-table-column prop="name" :label="$t('transparentRule.rules.name')" min-width="140">
              <template #default="{ row }">
                <div class="name-cell">
                  <el-icon class="name-icon"><Document /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 协议 -->
            <el-table-column prop="protocol" :label="$t('transparentRule.rules.protocol')" min-width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getProtocolTagType(row.protocol)" size="small" effect="dark">
                  {{ row.protocol }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 源IP组 -->
            <el-table-column prop="sourceGroup" :label="$t('transparentRule.rules.sourceGroup')" min-width="120">
              <template #default="{ row }">
                <el-tooltip :content="row.sourceGroup" placement="top">
                  <span class="group-cell">{{ row.sourceGroup }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <!-- 目的IP组 -->
            <el-table-column prop="destGroup" :label="$t('transparentRule.rules.destGroup')" min-width="120">
              <template #default="{ row }">
                <el-tooltip :content="row.destGroup" placement="top">
                  <span class="group-cell">{{ row.destGroup }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <!-- 端口组 -->
            <el-table-column prop="portGroup" :label="$t('transparentRule.rules.portGroup')" min-width="120">
              <template #default="{ row }">
                <el-tooltip :content="row.portGroup" placement="top">
                  <span class="group-cell">{{ row.portGroup }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <!-- 时间组 -->
            <el-table-column prop="timeGroup" :label="$t('transparentRule.rules.timeGroup')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.timeGroup" type="info" size="small" effect="plain">
                  {{ row.timeGroup }}
                </el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>

            <!-- 动作 -->
            <el-table-column prop="action" :label="$t('transparentRule.rules.action')" min-width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.action === 'accept' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.action === 'accept' ? $t('transparentRule.rules.accept') : $t('transparentRule.rules.reject') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('transparentRule.rules.actions')" min-width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="info" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('transparentRule.rules.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('transparentRule.rules.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('transparentRule.rules.delete') }}
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
      v-model="formVisible"
      :title="formMode === 'add' ? $t('transparentRule.rules.addDialog') : $t('transparentRule.rules.editDialog')"
      width="650px"
      class="rules-dialog"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('transparentRule.rules.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('transparentRule.rules.namePlaceholder')" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.protocol')" prop="protocol">
              <el-select v-model="formData.protocol" style="width: 100%">
                <el-option label="TCP" value="TCP" />
                <el-option label="UDP" value="UDP" />
                <el-option label="ICMP" value="ICMP" />
                <el-option label="ALL" value="ALL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.action')" prop="action">
              <el-select v-model="formData.action" style="width: 100%">
                <el-option :label="$t('transparentRule.rules.accept')" value="accept" />
                <el-option :label="$t('transparentRule.rules.reject')" value="reject" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.sourceGroup')" prop="sourceGroup">
              <el-select v-model="formData.sourceGroup" style="width: 100%" filterable>
                <el-option label="server_group" value="server_group" />
                <el-option label="db_servers" value="db_servers" />
                <el-option label="client_group" value="client_group" />
                <el-option label="any" value="any" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.destGroup')" prop="destGroup">
              <el-select v-model="formData.destGroup" style="width: 100%" filterable>
                <el-option label="external_net" value="external_net" />
                <el-option label="internal_net" value="internal_net" />
                <el-option label="dmz_group" value="dmz_group" />
                <el-option label="any" value="any" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.portGroup')" prop="portGroup">
              <el-select v-model="formData.portGroup" style="width: 100%" filterable>
                <el-option label="http_ports" value="http_ports" />
                <el-option label="db_ports" value="db_ports" />
                <el-option label="custom_ports" value="custom_ports" />
                <el-option label="any" value="any" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('transparentRule.rules.timeGroup')" prop="timeGroup">
              <el-select v-model="formData.timeGroup" style="width: 100%" clearable>
                <el-option label="work_hours" value="work_hours" />
                <el-option label="night_shift" value="night_shift" />
                <el-option label="weekend" value="weekend" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('transparentRule.rules.remark')" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" :placeholder="$t('transparentRule.rules.remarkPlaceholder')" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewVisible"
      :title="$t('transparentRule.rules.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <div class="view-content">
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.name') }}</span>
          <span class="view-value">{{ viewData?.name }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.protocol') }}</span>
          <el-tag :type="getProtocolTagType(viewData?.protocol || '')" size="small" effect="dark">
            {{ viewData?.protocol }}
          </el-tag>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.action') }}</span>
          <el-tag :type="viewData?.action === 'accept' ? 'success' : 'danger'" size="small" effect="dark">
            {{ viewData?.action === 'accept' ? $t('transparentRule.rules.accept') : $t('transparentRule.rules.reject') }}
          </el-tag>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.sourceGroup') }}</span>
          <span class="view-value">{{ viewData?.sourceGroup }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.destGroup') }}</span>
          <span class="view-value">{{ viewData?.destGroup }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.portGroup') }}</span>
          <span class="view-value">{{ viewData?.portGroup }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.timeGroup') }}</span>
          <span class="view-value">{{ viewData?.timeGroup || '-' }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.remark') }}</span>
          <span class="view-value">{{ viewData?.remark || '-' }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('transparentRule.rules.status') }}</span>
          <el-tag :type="viewData?.enable ? 'success' : 'info'" size="small">
            {{ viewData?.enable ? $t('transparentRule.rules.enabled') : $t('transparentRule.rules.disabled') }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="viewVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Lock, Plus, InfoFilled, Document, View, Edit, Delete, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface SecurityRule {
  id: string
  name: string
  protocol: string
  sourceGroup: string
  destGroup: string
  portGroup: string
  timeGroup: string
  action: 'accept' | 'reject'
  remark: string
  enable: boolean
}

interface RuleFormData {
  id?: string
  name: string
  protocol: string
  sourceGroup: string
  destGroup: string
  portGroup: string
  timeGroup: string
  action: 'accept' | 'reject'
  remark: string
  enable: boolean
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const viewVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 模拟数据
const mockData = ref<SecurityRule[]>([
  {
    id: '1',
    name: 'allow_http_access',
    protocol: 'TCP',
    sourceGroup: 'client_group',
    destGroup: 'external_net',
    portGroup: 'http_ports',
    timeGroup: 'work_hours',
    action: 'accept',
    remark: '允许客户端在工作时间访问外部HTTP服务',
    enable: true
  },
  {
    id: '2',
    name: 'block_p2p',
    protocol: 'ALL',
    sourceGroup: 'any',
    destGroup: 'any',
    portGroup: 'any',
    timeGroup: '',
    action: 'reject',
    remark: '禁止所有P2P流量',
    enable: true
  },
  {
    id: '3',
    name: 'db_access_rule',
    protocol: 'TCP',
    sourceGroup: 'server_group',
    destGroup: 'db_servers',
    portGroup: 'db_ports',
    timeGroup: '',
    action: 'accept',
    remark: '允许应用服务器访问数据库',
    enable: true
  },
  {
    id: '4',
    name: 'night_maintenance',
    protocol: 'ALL',
    sourceGroup: 'server_group',
    destGroup: 'internal_net',
    portGroup: 'any',
    timeGroup: 'night_shift',
    action: 'accept',
    remark: '夜间维护时段允许访问',
    enable: false
  }
])

const tableData = ref<SecurityRule[]>([])

const selectedRows = ref<SecurityRule[]>([])

const handleSelectionChange = (rows: SecurityRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.rules.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.rules.batchDeleteSuccess'),
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

const formData = reactive<RuleFormData>({
  name: '',
  protocol: 'TCP',
  sourceGroup: 'any',
  destGroup: 'any',
  portGroup: 'any',
  timeGroup: '',
  action: 'accept',
  remark: '',
  enable: true
})

const viewData = ref<SecurityRule | null>(null)

const formRules: FormRules = {
  name: [{ required: true, message: t('transparentRule.rules.nameRequired'), trigger: 'blur' }],
  protocol: [{ required: true, message: t('transparentRule.rules.protocolRequired'), trigger: 'change' }],
  sourceGroup: [{ required: true, message: t('transparentRule.rules.sourceGroupRequired'), trigger: 'change' }],
  destGroup: [{ required: true, message: t('transparentRule.rules.destGroupRequired'), trigger: 'change' }],
  action: [{ required: true, message: t('transparentRule.rules.actionRequired'), trigger: 'change' }]
}

// 方法
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  formMode.value = 'add'
  Object.assign(formData, {
    id: undefined,
    name: '',
    protocol: 'TCP',
    sourceGroup: 'any',
    destGroup: 'any',
    portGroup: 'any',
    timeGroup: '',
    action: 'accept',
    remark: '',
    enable: true
  })
  formVisible.value = true
}

const handleView = (row: SecurityRule) => {
  viewData.value = { ...row }
  viewVisible.value = true
}

const handleEdit = (row: SecurityRule) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    protocol: row.protocol,
    sourceGroup: row.sourceGroup,
    destGroup: row.destGroup,
    portGroup: row.portGroup,
    timeGroup: row.timeGroup,
    action: row.action,
    remark: row.remark,
    enable: row.enable
  })
  formVisible.value = true
}

const handleDelete = async (row: SecurityRule) => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.rules.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.rules.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleToggle = (row: SecurityRule) => {
  row.enable = !row.enable
  ElNotification({
    title: t('common.success'),
    message: row.enable ? t('transparentRule.rules.enableSuccess') : t('transparentRule.rules.disableSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        formVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: formMode.value === 'add' ? t('transparentRule.rules.addSuccess') : t('transparentRule.rules.editSuccess'),
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

const getProtocolTagType = (protocol: string): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    TCP: 'primary',
    UDP: 'success',
    ICMP: 'warning',
    ALL: 'info'
  }
  return typeMap[protocol] || ''
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.security-rules-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #67C23A;
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
  border: 1px solid rgba(103, 194, 58, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.rules-table {
  width: 100%;
}

.rules-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 12px;
}

.rules-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.rules-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

/* 状态切换按钮 */
.status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.1) 0%, rgba(144, 147, 153, 0.05) 100%);
  transition: all 0.3s ease;
}

.status-toggle:hover {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.1) 100%);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #67C23A;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-icon {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.status-icon.active {
  color: #67C23A;
}

/* 名称单元格 */
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon {
  color: #67C23A;
}

/* 组单元格 */
.group-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}

.group-cell:hover {
  color: #409EFF;
}

/* 空文本 */
.empty-text {
  color: #c0c4cc;
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
  border-top: 1px solid rgba(103, 194, 58, 0.08);
}

/* 对话框 */
.rules-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.rules-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 查看详情对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.view-content {
  padding: 10px 0;
}

.view-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(103, 194, 58, 0.08);
}

.view-item:last-child {
  border-bottom: none;
}

.view-label {
  width: 100px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.view-value {
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 14px;
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
