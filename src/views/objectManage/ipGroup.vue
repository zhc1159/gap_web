<template>
  <div class="page-container ip-group-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Collection /></el-icon>
        </div>
        <span class="header-title">{{ $t('objectManage.ipGroup.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('objectManage.ipGroup.add') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('objectManage.ipGroup.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 表格区域 -->
          <el-table :data="tableData" v-loading="loading" class="ip-table">
            <!-- IP组名 -->
            <el-table-column prop="ipName" :label="$t('objectManage.ipGroup.ipName')" min-width="150">
              <template #default="{ row }">
                <div class="name-cell">
                  <el-icon class="name-icon"><FolderOpened /></el-icon>
                  <span class="name-text">{{ row.ipName }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- IP地址/域名 -->
            <el-table-column :label="$t('objectManage.ipGroup.ipList')" min-width="350">
              <template #default="{ row }">
                <div class="ip-list-cell">
                  <div class="ip-tags">
                    <el-tag
                      v-for="(ip, index) in row.ipList.slice(0, 3)"
                      :key="index"
                      size="small"
                      class="ip-tag"
                      effect="plain"
                    >
                      {{ ip }}
                    </el-tag>
                    <el-tag
                      v-if="row.ipList.length > 3"
                      size="small"
                      type="info"
                      class="more-tag"
                    >
                      +{{ row.ipList.length - 3 }}
                    </el-tag>
                  </div>
                  <el-tooltip
                    v-if="row.ipList.length > 0"
                    :content="row.ipList.join('; ')"
                    placement="top"
                  >
                    <el-icon class="view-all-icon"><View /></el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>

            <!-- 等级 -->
            <el-table-column :label="$t('objectManage.ipGroup.level')" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)" size="small" effect="dark" class="level-tag">
                  {{ getLevelLabel(row.level) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- IP数量 -->
            <el-table-column :label="$t('objectManage.ipGroup.ipCount')" min-width="100" align="center">
              <template #default="{ row }">
                <span class="count-badge">{{ row.ipList.length }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('objectManage.ipGroup.actions')" min-width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="info" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('objectManage.ipGroup.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('objectManage.ipGroup.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('objectManage.ipGroup.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? $t('objectManage.ipGroup.addDialog') : $t('objectManage.ipGroup.editDialog')"
      width="600px"
      class="ip-dialog"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('objectManage.ipGroup.ipName')" prop="ipName">
          <el-input
            v-model="formData.ipName"
            :placeholder="$t('objectManage.ipGroup.ipNamePlaceholder')"
            :maxlength="32"
          />
        </el-form-item>

        <el-form-item :label="$t('objectManage.ipGroup.level')" prop="level">
          <el-select v-model="formData.level" style="width: 100%">
            <el-option :label="$t('objectManage.ipGroup.level0')" :value="0" />
            <el-option :label="$t('objectManage.ipGroup.level1')" :value="1" />
            <el-option :label="$t('objectManage.ipGroup.level2')" :value="2" />
            <el-option :label="$t('objectManage.ipGroup.level3')" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('objectManage.ipGroup.ipList')" prop="ipList">
          <div class="ip-input-wrapper">
            <div class="ip-tags-container">
              <el-tag
                v-for="(ip, index) in formData.ipList"
                :key="index"
                closable
                size="small"
                class="input-ip-tag"
                @close="handleRemoveIp(index)"
              >
                {{ ip }}
              </el-tag>
            </div>
            <div class="ip-input-row">
              <el-input
                v-model="ipInput"
                :placeholder="$t('objectManage.ipGroup.ipInputPlaceholder')"
                @keyup.enter="handleAddIp"
                style="flex: 1"
              />
              <el-button type="primary" @click="handleAddIp">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="ip-input-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ $t('objectManage.ipGroup.ipInputHint') }}</span>
            </div>
          </div>
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
      :title="$t('objectManage.ipGroup.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <div class="view-content">
        <div class="view-item">
          <span class="view-label">{{ $t('objectManage.ipGroup.ipName') }}</span>
          <span class="view-value">{{ viewData?.ipName }}</span>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('objectManage.ipGroup.level') }}</span>
          <el-tag :type="getLevelType(viewData?.level ?? 3)" size="small" effect="dark">
            {{ getLevelLabel(viewData?.level ?? 3) }}
          </el-tag>
        </div>
        <div class="view-item">
          <span class="view-label">{{ $t('objectManage.ipGroup.ipCount') }}</span>
          <span class="view-value">{{ viewData?.ipList.length }} {{ $t('objectManage.ipGroup.ipUnit') }}</span>
        </div>
        <div class="view-item ip-list-view">
          <span class="view-label">{{ $t('objectManage.ipGroup.ipList') }}</span>
          <div class="ip-list-content">
            <el-tag
              v-for="(ip, index) in viewData?.ipList"
              :key="index"
              size="small"
              class="view-ip-tag"
              effect="plain"
            >
              {{ ip }}
            </el-tag>
          </div>
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
import { Collection, Plus, InfoFilled, FolderOpened, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 接口定义
interface IpGroup {
  id: string
  ipName: string
  ipList: string[]
  level: 0 | 1 | 2 | 3
}

interface IpGroupFormData {
  id?: string
  ipName: string
  ipList: string[]
  level: 0 | 1 | 2 | 3
}

// 状态
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const viewVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const ipInput = ref('')

// 模拟数据
const mockData = ref<IpGroup[]>([
  {
    id: '1',
    ipName: 'server_group',
    ipList: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5'],
    level: 2
  },
  {
    id: '2',
    ipName: 'db_servers',
    ipList: ['10.0.0.100', '10.0.0.101', '10.0.0.102'],
    level: 1
  },
  {
    id: '3',
    ipName: 'external_net',
    ipList: ['www.example.com', 'api.example.com', '2001:db8::1', '2001:db8::2'],
    level: 3
  },
  {
    id: '4',
    ipName: 'core_switch',
    ipList: ['172.16.0.1', '172.16.0.2'],
    level: 0
  },
  {
    id: '5',
    ipName: 'monitor_hosts',
    ipList: ['192.168.100.0/24'],
    level: 3
  }
])

const tableData = ref<IpGroup[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<IpGroupFormData>({
  ipName: '',
  ipList: [],
  level: 3
})

const viewData = ref<IpGroup | null>(null)

const formRules: FormRules = {
  ipName: [
    { required: true, message: t('objectManage.ipGroup.ipNameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/, message: t('objectManage.ipGroup.ipNamePattern'), trigger: 'blur' }
  ],
  level: [{ required: true, message: t('objectManage.ipGroup.levelRequired'), trigger: 'change' }]
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
    ipName: '',
    ipList: [],
    level: 3
  })
  ipInput.value = ''
  formVisible.value = true
}

const handleView = (row: IpGroup) => {
  viewData.value = { ...row }
  viewVisible.value = true
}

const handleEdit = (row: IpGroup) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    ipName: row.ipName,
    ipList: [...row.ipList],
    level: row.level
  })
  ipInput.value = ''
  formVisible.value = true
}

const handleDelete = async (row: IpGroup) => {
  try {
    await ElMessageBox.confirm(
      t('objectManage.ipGroup.deleteConfirm', { name: row.ipName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(r => r.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('objectManage.ipGroup.deleteSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleAddIp = () => {
  const ip = ipInput.value.trim()
  if (!ip) return

  // 简单的IP/域名/CIDR验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(\/\d{1,3})?$/
  const domainRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && !domainRegex.test(ip)) {
    ElNotification({
      title: t('common.warning'),
      message: t('objectManage.ipGroup.ipInvalid'),
      type: 'warning'
    })
    return
  }

  if (formData.ipList.includes(ip)) {
    ElNotification({
      title: t('common.warning'),
      message: t('objectManage.ipGroup.ipDuplicate'),
      type: 'warning'
    })
    return
  }

  formData.ipList.push(ip)
  ipInput.value = ''
}

const handleRemoveIp = (index: number) => {
  formData.ipList.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (formData.ipList.length === 0) {
        ElNotification({
          title: t('common.warning'),
          message: t('objectManage.ipGroup.ipListRequired'),
          type: 'warning'
        })
        return
      }

      saving.value = true
      setTimeout(() => {
        saving.value = false
        formVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: formMode.value === 'add' ? t('objectManage.ipGroup.addSuccess') : t('objectManage.ipGroup.editSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
        fetchList()
      }, 1000)
    }
  })
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const getLevelType = (level: number): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const typeMap: Record<number, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'danger',
    1: 'warning',
    2: 'primary',
    3: 'info'
  }
  return typeMap[level] ?? 'info'
}

const getLevelLabel = (level: number): string => {
  const labelMap: Record<number, string> = {
    0: t('objectManage.ipGroup.level0'),
    1: t('objectManage.ipGroup.level1'),
    2: t('objectManage.ipGroup.level2'),
    3: t('objectManage.ipGroup.level3')
  }
  return labelMap[level] ?? '-'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.ip-group-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(230, 162, 60, 0.02) 0%, rgba(64, 158, 255, 0.02) 100%);
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
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #E6A23C;
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
  border: 1px solid rgba(230, 162, 60, 0.08);
}

.card-content {
  padding: 20px;
}

/* 表格样式 */
.ip-table {
  width: 100%;
}

.ip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.ip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.ip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.03) 0%, rgba(64, 158, 255, 0.03) 100%) !important;
}

/* 名称单元格 */
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon {
  color: #E6A23C;
}

.name-text {
  font-weight: 500;
}

/* IP列表单元格 */
.ip-list-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ip-tag {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
  border-color: rgba(230, 162, 60, 0.2);
  color: #E6A23C;
  font-family: 'Courier New', monospace;
}

.more-tag {
  cursor: pointer;
}

.view-all-icon {
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.view-all-icon:hover {
  color: #409EFF;
}

/* 等级标签 */
.level-tag {
  font-weight: 500;
}

/* 数量徽章 */
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: linear-gradient(135deg, #E6A23C 0%, #409EFF 100%);
  border-radius: 11px;
  color: white;
  font-size: 12px;
  font-weight: 600;
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
  border-top: 1px solid rgba(230, 162, 60, 0.08);
}

/* 对话框 */
.ip-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.ip-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* IP输入区域 */
.ip-input-wrapper {
  width: 100%;
}

.ip-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 32px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 6px;
}

.input-ip-tag {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.08) 100%);
  border-color: rgba(230, 162, 60, 0.3);
  color: #E6A23C;
  font-family: 'Courier New', monospace;
}

.ip-input-row {
  display: flex;
  gap: 8px;
}

.ip-input-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

/* 查看详情对话框 */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(64, 158, 255, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
}

.view-content {
  padding: 10px 0;
}

.view-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid rgba(230, 162, 60, 0.08);
}

.view-item:last-child {
  border-bottom: none;
}

.view-label {
  width: 100px;
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.view-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.ip-list-view {
  align-items: flex-start;
}

.ip-list-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.view-ip-tag {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
  border-color: rgba(230, 162, 60, 0.2);
  color: #E6A23C;
  font-family: 'Courier New', monospace;
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
