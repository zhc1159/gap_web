<template>
  <div class="page-container file-proxy-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <span class="header-title">{{ $t('fileSafe.file_accessControl.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('fileSafe.file_accessControl.add') }}
        </el-button>
      </div>
    </div>

    <!-- 方向切换标签 -->
    <div class="direction-tabs">
      <div
        class="tab-item"
        :class="{ active: direction === 'out' }"
        @click="handleDirectionChange('out')"
      >
        <el-icon><Top /></el-icon>
        <span>{{ $t('fileSafe.file_accessControl.innerToOuter') }}</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: direction === 'in' }"
        @click="handleDirectionChange('in')"
      >
        <el-icon><Bottom /></el-icon>
        <span>{{ $t('fileSafe.file_accessControl.outerToInner') }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div v-if="selectedRows.length > 0" class="batch-bar">
            <span class="batch-info">{{ $t('fileSafe.file_accessControl.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ $t('common.batchDelete') }}
            </el-button>
          </div>
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="proxy-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <!-- 状态 -->
            <el-table-column :label="$t('fileSafe.file_accessControl.status')" min-width="80" align="center">
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

            <!-- 名称 -->
            <el-table-column prop="name" :label="$t('fileSafe.file_accessControl.name')" min-width="120">
              <template #default="{ row }">
                <div class="name-cell">
                  <el-icon class="name-icon"><Document /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 协议 -->
            <el-table-column prop="protocol" :label="$t('fileSafe.file_accessControl.protocol')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getProtocolTagType(row.protocol)" size="small" effect="dark">
                  {{ row.protocol }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 源对象 -->
            <el-table-column prop="source" :label="$t('fileSafe.file_accessControl.source')" min-width="120">
              <template #default="{ row }">
                <el-tooltip :content="row.source" placement="top">
                  <span class="ip-cell">{{ row.source }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <!-- 目的对象 -->
            <el-table-column prop="destination" :label="$t('fileSafe.file_accessControl.destination')" min-width="120">
              <template #default="{ row }">
                <el-tooltip :content="row.destination" placement="top">
                  <span class="ip-cell">{{ row.destination }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <!-- 目的端口 -->
            <el-table-column prop="destinationPort" :label="$t('fileSafe.file_accessControl.destPort')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="port-tag">{{ row.destinationPort }}</span>
              </template>
            </el-table-column>

            <!-- 入口端口 -->
            <el-table-column prop="inDevicePort" :label="$t('fileSafe.file_accessControl.inPort')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="port-tag">{{ row.inDevicePort }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('fileSafe.file_accessControl.actions')" min-width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" class="btn-view" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('fileSafe.file_accessControl.view') }}
                  </el-button>
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('fileSafe.file_accessControl.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('fileSafe.file_accessControl.delete') }}
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
      :title="formMode === 'add' ? $t('fileSafe.file_accessControl.addRule') : $t('fileSafe.file_accessControl.editRule')"
      width="700px"
      class="proxy-dialog"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('fileSafe.file_accessControl.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('fileSafe.file_accessControl.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('fileSafe.file_accessControl.protocol')" prop="protocol">
          <el-select v-model="formData.protocol" style="width: 100%">
            <el-option label="SFTP" value="SFTP" />
            <el-option label="FTP" value="FTP" />
            <el-option label="FTPS" value="FTPS" />
            <el-option label="TFTP" value="TFTP" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.source')" prop="source">
              <el-input v-model="formData.source" :placeholder="$t('fileSafe.file_accessControl.sourcePlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.sourcePort')" prop="sourcePort">
              <el-input-number v-model="formData.sourcePort" :min="1" :max="65535" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.destination')" prop="destination">
              <el-input v-model="formData.destination" :placeholder="$t('fileSafe.file_accessControl.destPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.destPort')" prop="destinationPort">
              <el-input v-model="formData.destinationPort" :placeholder="$t('fileSafe.file_accessControl.portPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.outInterface')" prop="outInterface">
              <el-select v-model="formData.outInterface" style="width: 100%">
                <el-option label="eth0" value="eth0" />
                <el-option label="eth1" value="eth1" />
                <el-option label="eth2" value="eth2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.inInterface')" prop="inInterface">
              <el-select v-model="formData.inInterface" style="width: 100%">
                <el-option label="eth0" value="eth0" />
                <el-option label="eth1" value="eth1" />
                <el-option label="eth2" value="eth2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.inDeviceIP')" prop="inDevice">
              <el-input v-model="formData.inDevice" :placeholder="$t('fileSafe.file_accessControl.ipPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('fileSafe.file_accessControl.inPort')" prop="inDevicePort">
              <el-input v-model="formData.inDevicePort" :placeholder="$t('fileSafe.file_accessControl.portPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('fileSafe.file_accessControl.timeGroup')" prop="timeGroup">
          <el-select v-model="formData.timeGroup" style="width: 100%" clearable>
            <el-option label="work_hours" value="work_hours" />
            <el-option label="night_shift" value="night_shift" />
            <el-option label="weekend" value="weekend" />
          </el-select>
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
      :title="$t('fileSafe.file_accessControl.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <div class="view-content">
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.name') }}</span>
          <span class="view-value">{{ viewData?.name }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.protocol') }}</span>
          <el-tag :type="getProtocolTagType(viewData?.protocol || '')" size="small" effect="dark">
            {{ viewData?.protocol }}
          </el-tag>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.source') }}</span>
          <span class="view-value">{{ viewData?.source }}:{{ viewData?.sourcePort }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.destination') }}</span>
          <span class="view-value">{{ viewData?.destination }}:{{ viewData?.destinationPort }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.interface') }}</span>
          <span class="view-value">{{ viewData?.outInterface }} → {{ viewData?.inInterface }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.inDevice') }}</span>
          <span class="view-value">{{ viewData?.inDevice }}:{{ viewData?.inDevicePort }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.timeGroup') }}</span>
          <span class="view-value">{{ viewData?.timeGroup || '-' }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('fileSafe.file_accessControl.status') }}</span>
          <el-tag :type="viewData?.enable ? 'success' : 'info'" size="small">
            {{ viewData?.enable ? $t('fileSafe.file_accessControl.enabled') : $t('fileSafe.file_accessControl.disabled') }}
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
import { Folder, Plus, Top, Bottom, Document, View, Edit, Delete, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface ProxyRule {
  id: string
  name: string
  protocol: string
  source: string
  sourcePort: number
  destination: string
  destinationPort: number | string
  outInterface: string
  inInterface: string
  inDevice: string
  inDevicePort: number | string
  enable: boolean
  timeGroup: string
}

interface ProxyFormData {
  id?: string
  name: string
  protocol: string
  source: string
  sourcePort: number
  destination: string
  destinationPort: string
  outInterface: string
  inInterface: string
  inDevice: string
  inDevicePort: string
  enable: boolean
  timeGroup: string
}

type DataDirection = 'in' | 'out'

// 状态
const loading = ref(false)
const saving = ref(false)
const direction = ref<DataDirection>('out')
const formVisible = ref(false)
const viewVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 模拟数据 - 内网到外网
const mockDataOut = ref<ProxyRule[]>([
  { id: '1', name: 'sftp-upload', protocol: 'SFTP', source: '192.168.1.0/24', sourcePort: 22, destination: '10.0.0.100', destinationPort: 22, outInterface: 'eth0', inInterface: 'eth1', inDevice: '192.168.1.1', inDevicePort: 2201, enable: true, timeGroup: 'work_hours' },
  { id: '2', name: 'ftp-backup', protocol: 'FTP', source: '192.168.1.50', sourcePort: 21, destination: '10.0.0.200', destinationPort: 21, outInterface: 'eth0', inInterface: 'eth1', inDevice: '192.168.1.1', inDevicePort: 2101, enable: true, timeGroup: '' },
  { id: '3', name: 'ftps-secure', protocol: 'FTPS', source: '192.168.1.0/24', sourcePort: 990, destination: '10.0.0.50', destinationPort: 990, outInterface: 'eth0', inInterface: 'eth1', inDevice: '192.168.1.1', inDevicePort: 9901, enable: false, timeGroup: 'weekend' }
])

// 模拟数据 - 外网到内网
const mockDataIn = ref<ProxyRule[]>([
  { id: '4', name: 'sftp-download', protocol: 'SFTP', source: '10.0.0.0/24', sourcePort: 22, destination: '192.168.1.100', destinationPort: 22, outInterface: 'eth1', inInterface: 'eth0', inDevice: '10.0.0.1', inDevicePort: 2202, enable: true, timeGroup: 'night_shift' },
  { id: '5', name: 'tftp-config', protocol: 'TFTP', source: '10.0.0.0/24', sourcePort: 69, destination: '192.168.1.200', destinationPort: 69, outInterface: 'eth1', inInterface: 'eth0', inDevice: '10.0.0.1', inDevicePort: 6901, enable: true, timeGroup: '' }
])

const tableData = ref<ProxyRule[]>([])

const selectedRows = ref<ProxyRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<ProxyFormData>({
  name: '',
  protocol: 'SFTP',
  source: '',
  sourcePort: 22,
  destination: '',
  destinationPort: '',
  outInterface: 'eth0',
  inInterface: 'eth1',
  inDevice: '',
  inDevicePort: '',
  enable: true,
  timeGroup: ''
})

const viewData = ref<ProxyRule | null>(null)

const formRules: FormRules = {
  name: [{ required: true, message: t('fileSafe.file_accessControl.nameRequired'), trigger: 'blur' }],
  protocol: [{ required: true, message: t('fileSafe.file_accessControl.protocolRequired'), trigger: 'change' }],
  source: [{ required: true, message: t('fileSafe.file_accessControl.sourceRequired'), trigger: 'blur' }],
  destination: [{ required: true, message: t('fileSafe.file_accessControl.destRequired'), trigger: 'blur' }]
}

// 方法
const handleDirectionChange = (dir: DataDirection) => {
  direction.value = dir
  pagination.page = 1
  selectedRows.value = []
  fetchList()
}

const handleSelectionChange = (rows: ProxyRule[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_accessControl.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    if (direction.value === 'out') {
      mockDataOut.value = mockDataOut.value.filter(r => !ids.includes(r.id))
    } else {
      mockDataIn.value = mockDataIn.value.filter(r => !ids.includes(r.id))
    }
    selectedRows.value = []
    fetchList()
    ElNotification({ title: t('common.success'), message: t('fileSafe.file_accessControl.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    if (direction.value === 'out') {
      tableData.value = mockDataOut.value
      pagination.total = mockDataOut.value.length
    } else {
      tableData.value = mockDataIn.value
      pagination.total = mockDataIn.value.length
    }
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  formMode.value = 'add'
  Object.assign(formData, {
    id: undefined,
    name: '',
    protocol: 'SFTP',
    source: '',
    sourcePort: 22,
    destination: '',
    destinationPort: '',
    outInterface: 'eth0',
    inInterface: 'eth1',
    inDevice: '',
    inDevicePort: '',
    enable: true,
    timeGroup: ''
  })
  formVisible.value = true
}

const handleView = (row: ProxyRule) => {
  viewData.value = { ...row }
  viewVisible.value = true
}

const handleEdit = (row: ProxyRule) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    protocol: row.protocol,
    source: row.source,
    sourcePort: row.sourcePort,
    destination: row.destination,
    destinationPort: String(row.destinationPort),
    outInterface: row.outInterface,
    inInterface: row.inInterface,
    inDevice: row.inDevice,
    inDevicePort: String(row.inDevicePort),
    enable: row.enable,
    timeGroup: row.timeGroup
  })
  formVisible.value = true
}

const handleDelete = async (row: ProxyRule) => {
  try {
    await ElMessageBox.confirm(
      t('fileSafe.file_accessControl.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    if (direction.value === 'out') {
      mockDataOut.value = mockDataOut.value.filter(r => r.id !== row.id)
    } else {
      mockDataIn.value = mockDataIn.value.filter(r => r.id !== row.id)
    }
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('fileSafe.file_accessControl.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleToggle = async (row: ProxyRule) => {
  row.enable = !row.enable
  ElNotification({
    title: t('common.success'),
    message: row.enable ? t('fileSafe.file_accessControl.enableSuccess') : t('fileSafe.file_accessControl.disableSuccess'),
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
          message: formMode.value === 'add' ? t('fileSafe.file_accessControl.addSuccess') : t('fileSafe.file_accessControl.editSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      }, 1000)
    }
  })
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const getProtocolTagType = (protocol: string): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    SFTP: 'success',
    FTP: 'primary',
    FTPS: 'warning',
    TFTP: 'info'
  }
  return typeMap[protocol] || ''
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

.file-proxy-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.02) 0%, rgba(230, 162, 60, 0.02) 100%);
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

/* 方向切换标签 */
.direction-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--card-bg);
  border-radius: 10px;
  border: 2px solid rgba(103, 194, 58, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.tab-item:hover {
  border-color: rgba(103, 194, 58, 0.3);
  background: rgba(103, 194, 58, 0.02);
}

.tab-item.active {
  border-color: #67C23A;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(230, 162, 60, 0.1) 100%);
  color: #67C23A;
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
.proxy-table {
  width: 100%;
}

.proxy-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(230, 162, 60, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.proxy-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.proxy-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.03) 0%, rgba(230, 162, 60, 0.03) 100%) !important;
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

/* IP单元格 */
.ip-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 端口标签 */
.port-tag {
  display: inline-flex;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #67C23A;
  font-weight: 500;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  gap: 8px;
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

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(103, 194, 58, 0.08);
}

/* 对话框 */
.proxy-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(230, 162, 60, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.proxy-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 查看详情对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(230, 162, 60, 0.05) 100%);
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
  width: 120px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.view-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .direction-tabs {
    flex-direction: column;
  }

  .action-btns {
    flex-direction: column;
  }
}
</style>
