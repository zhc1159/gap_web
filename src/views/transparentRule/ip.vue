<template>
  <div class="page-container ip-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('transparentRule.ip.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('transparentRule.ip.addGroup') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('transparentRule.ip.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 批量操作栏 -->
          <div class="batch-bar" v-if="selectedRows.length > 0">
            <span class="batch-info">{{ t('transparentRule.ip.selectedCount', { count: selectedRows.length }) }}</span>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              {{ t('common.batchDelete') }}
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="ip-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <!-- IP组名称 -->
            <el-table-column prop="name" :label="$t('transparentRule.ip.groupName')" min-width="200">
              <template #default="{ row }">
                <span class="group-name">{{ row.name }}</span>
              </template>
            </el-table-column>

            <!-- IP地址范围 -->
            <el-table-column prop="ipRange" :label="$t('transparentRule.ip.ipRange')" min-width="600">
              <template #default="{ row }">
                <el-tooltip v-if="row.ipRange && row.ipRange.length > 80" :content="row.ipRange" placement="top">
                  <span class="ip-text">{{ truncateText(row.ipRange, 80) }}</span>
                </el-tooltip>
                <span v-else class="ip-text">{{ row.ipRange || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('transparentRule.ip.actions')" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('transparentRule.ip.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('transparentRule.ip.delete') }}
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
      :title="isEdit ? $t('transparentRule.ip.editDialog') : $t('transparentRule.ip.addDialog')"
      width="600px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px" class="form-content">
        <el-form-item :label="$t('transparentRule.ip.groupName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('transparentRule.ip.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
            @input="handleNameInput"
          />
        </el-form-item>

        <el-form-item :label="$t('transparentRule.ip.ipAddress')" prop="ipRange">
          <div class="ip-input-wrapper">
            <!-- IP标签显示区域 -->
            <div class="ip-tags-container">
              <el-tag
                v-for="(ip, index) in ipTags"
                :key="index"
                closable
                :type="ip.valid ? 'success' : 'danger'"
                size="small"
                @close="handleRemoveIp(index)"
                class="ip-tag"
              >
                {{ ip.value }}
                <el-icon v-if="!ip.valid" class="invalid-icon"><Warning /></el-icon>
              </el-tag>
              <span v-if="ipTags.length === 0" class="empty-hint">{{ $t('transparentRule.ip.noIpHint') }}</span>
            </div>

            <!-- IP输入框 -->
            <div class="ip-input-row">
              <el-input
                v-model="currentIp"
                :placeholder="$t('transparentRule.ip.ipInputPlaceholder')"
                @keyup.enter="handleAddIp"
                class="ip-input"
              />
              <el-button type="primary" :icon="Plus" @click="handleAddIp" :disabled="!currentIp" />
            </div>

            <div class="ip-hint">
              {{ $t('transparentRule.ip.ipFormatHint') }}
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit" :disabled="!hasValidIps">
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Monitor, Plus, InfoFilled, Edit, Delete, Warning } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface IpTag {
  value: string
  type: 'ip' | 'domain' | 'cidr' | 'range'
  valid: boolean
}

interface IpGroup {
  id: string
  name: string
  ipRange: string
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentIp = ref('')
const ipTags = ref<IpTag[]>([])
const editingId = ref('')

// 模拟数据
const mockData = ref<IpGroup[]>([
  {
    id: '1',
    name: 'internal_network',
    ipRange: '192.168.1.0/24, 10.0.0.1-10.0.0.255'
  },
  {
    id: '2',
    name: 'external_servers',
    ipRange: '203.0.113.10, 203.0.113.20, example.com'
  },
  {
    id: '3',
    name: 'database_servers',
    ipRange: '172.16.0.100-172.16.0.200'
  },
  {
    id: '4',
    name: 'trusted_hosts',
    ipRange: '192.168.10.1, 192.168.10.2, 192.168.10.3'
  }
])

const tableData = ref<IpGroup[]>([])

const selectedRows = ref<IpGroup[]>([])

const handleSelectionChange = (rows: IpGroup[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.ip.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.confirm'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(r => r.id)
    mockData.value = mockData.value.filter(r => !ids.includes(r.id))
    selectedRows.value = []
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.ip.batchDeleteSuccess'),
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

const formData = reactive({
  name: '',
  ipRange: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('transparentRule.ip.groupNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('transparentRule.ip.groupNamePattern'), trigger: 'blur' },
    { max: 31, message: t('transparentRule.ip.groupNameMaxLength'), trigger: 'blur' }
  ],
  ipRange: [
    { required: true, message: t('transparentRule.ip.ipRangeRequired'), trigger: 'blur' }
  ]
}

// 计算属性
const hasValidIps = computed(() =>
  ipTags.value.length > 0 && ipTags.value.some(tag => tag.valid)
)

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
  formData.name = ''
  formData.ipRange = ''
  ipTags.value = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: IpGroup) => {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name

  // 解析IP范围
  if (row.ipRange) {
    const ips = row.ipRange.split(',').filter(ip => ip.trim())
    ipTags.value = ips.map(ip => ({
      value: ip.trim(),
      type: getIpType(ip.trim()),
      valid: validateIpFormat(ip.trim())
    }))
  } else {
    ipTags.value = []
  }

  dialogVisible.value = true
}

const handleDelete = async (row: IpGroup) => {
  try {
    await ElMessageBox.confirm(
      t('transparentRule.ip.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('transparentRule.ip.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleAddIp = () => {
  if (!currentIp.value) return

  const ip = currentIp.value.trim()
  const type = getIpType(ip)
  const valid = validateIpFormat(ip)

  // 检查重复
  if (ipTags.value.some(tag => tag.value === ip)) {
    ElNotification({
      title: t('common.warning'),
      message: t('transparentRule.ip.ipDuplicate'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }

  ipTags.value.push({ value: ip, type, valid })
  currentIp.value = ''
}

const handleRemoveIp = (index: number) => {
  ipTags.value.splice(index, 1)
}

const handleSubmit = () => {
  if (!formRef.value) return

  // 检查是否有有效的IP
  if (!hasValidIps.value) {
    ElNotification({
      title: t('common.warning'),
      message: t('transparentRule.ip.noValidIp'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }

  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        const ipRange = ipTags.value
          .filter(tag => tag.valid)
          .map(tag => tag.value)
          .join(', ')

        if (isEdit.value) {
          const index = mockData.value.findIndex(item => item.id === editingId.value)
          if (index !== -1) {
            mockData.value[index] = {
              id: editingId.value,
              name: formData.name,
              ipRange
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            name: formData.name,
            ipRange
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('transparentRule.ip.editSuccess') : t('transparentRule.ip.addSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

const handleNameInput = (value: string) => {
  formData.name = value.replace(/[^a-zA-Z0-9_]/g, '')
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

// 工具函数
const getIpType = (ip: string): 'ip' | 'domain' | 'cidr' | 'range' => {
  if (ip.includes('/')) return 'cidr'
  if (ip.includes('-')) return 'range'
  if (/^[a-zA-Z]/.test(ip)) return 'domain'
  return 'ip'
}

const validateIpFormat = (ip: string): boolean => {
  // IPv4正则
  const ipv4Regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  // IPv6正则
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  // CIDR正则
  const cidrRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\/\d{1,2}$/
  // IP范围正则
  const rangeRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)-((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  // 域名正则
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || cidrRegex.test(ip) || rangeRegex.test(ip) || domainRegex.test(ip)
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.ip-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #00d4ff;
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
  border: 1px solid rgba(0, 212, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.ip-table {
  width: 100%;
}

.ip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.ip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.ip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #00d4ff;
}

/* IP文本 */
.ip-text {
  font-family: 'Courier New', monospace;
  color: #00d9ff;
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
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
  border-top: 1px solid rgba(0, 212, 255, 0.08);
}

/* 表单对话框 */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  padding: 16px 20px;
}

.form-content {
  max-width: 100%;
}

/* IP标签容器 */
.ip-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 60px;
  padding: 12px;
  background: rgba(0, 212, 255, 0.02);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  margin-bottom: 12px;
}

.ip-tag {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.invalid-icon {
  margin-left: 4px;
  font-size: 12px;
}

.empty-hint {
  color: #c0c4cc;
  font-size: 13px;
}

/* IP输入区域包装器 - 与IP组名称输入框宽度一致 */
.ip-input-wrapper {
  width: 100%;
  max-width: 100%;
}

/* IP输入行 */
.ip-input-row {
  display: flex;
  gap: 8px;
}

.ip-input-row .ip-input {
  flex: 1;
}

/* IP格式提示 */
.ip-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.6;
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
