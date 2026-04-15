<template>
  <div class="page-container bacnet-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.bacnet.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.bacnet.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.bacnet.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数据表格 -->
          <el-table :data="tableData" v-loading="loading" class="bacnet-table">
            <!-- 用户组 -->
            <el-table-column prop="group_name" :label="$t('opc.bacnet.groupName')" min-width="150">
              <template #default="{ row }">
                <span class="group-name">{{ row.group_name }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column :label="$t('opc.bacnet.status')" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                  {{ row.rule_work ? $t('opc.bacnet.enabled') : $t('opc.bacnet.disabled') }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 应用类型黑名单 -->
            <el-table-column :label="$t('opc.bacnet.appTypeBlacklist')" min-width="200">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="item in row.app_type_blacklist.slice(0, 3)"
                    :key="item"
                    type="info"
                    size="small"
                    class="filter-tag"
                  >
                    {{ getAppTypeLabel(item) }}
                  </el-tag>
                  <el-tag v-if="row.app_type_blacklist.length > 3" type="info" size="small" class="filter-tag">
                    +{{ row.app_type_blacklist.length - 3 }}
                  </el-tag>
                  <span v-if="!row.app_type_blacklist?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 服务类型黑名单 -->
            <el-table-column :label="$t('opc.bacnet.svcTypeBlacklist')" min-width="250">
              <template #default="{ row }">
                <div class="filter-tags">
                  <el-tag
                    v-for="item in row.svc_type_blacklist.slice(0, 3)"
                    :key="item"
                    type="warning"
                    size="small"
                    class="filter-tag"
                  >
                    {{ getSvcTypeLabel(item) }}
                  </el-tag>
                  <el-tag v-if="row.svc_type_blacklist.length > 3" type="warning" size="small" class="filter-tag">
                    +{{ row.svc_type_blacklist.length - 3 }}
                  </el-tag>
                  <span v-if="!row.svc_type_blacklist?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column :label="$t('opc.bacnet.actions')" min-width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('opc.bacnet.view') }}
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('opc.bacnet.edit') }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    {{ $t('opc.bacnet.delete') }}
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
      :title="isEdit ? $t('opc.bacnet.editDialog') : $t('opc.bacnet.addDialog')"
      width="550px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.bacnet.groupName')" prop="group_name">
          <el-select v-model="formData.group_name" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.appTypeBlacklist')">
          <el-select
            v-model="formData.app_type_blacklist"
            multiple
            :placeholder="$t('opc.bacnet.appTypePlaceholder')"
            style="width: 100%"
          >
            <el-option
              v-for="item in appTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.svcTypeBlacklist')">
          <el-select
            v-model="formData.svc_type_blacklist"
            multiple
            :placeholder="$t('opc.bacnet.svcTypePlaceholder')"
            style="width: 100%"
          >
            <el-option
              v-for="item in svcTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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
      :title="$t('opc.bacnet.viewDetail')"
      width="600px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.bacnet.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.bacnet.enabled') : $t('opc.bacnet.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.appTypeBlacklist')" :span="2">
          <div class="view-tags">
            <el-tag v-for="item in viewData.app_type_blacklist" :key="item" type="info" size="small" class="view-tag">
              {{ getAppTypeLabel(item) }}
            </el-tag>
            <span v-if="!viewData.app_type_blacklist?.length" class="empty-text">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.svcTypeBlacklist')" :span="2">
          <div class="view-tags">
            <el-tag v-for="item in viewData.svc_type_blacklist" :key="item" type="warning" size="small" class="view-tag">
              {{ getSvcTypeLabel(item) }}
            </el-tag>
            <span v-if="!viewData.svc_type_blacklist?.length" class="empty-text">-</span>
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
import { Cpu, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface BacnetRule {
  id: string
  group_name: string
  rule_work: boolean
  app_type_blacklist: number[]
  svc_type_blacklist: number[]
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

// 应用类型选项
const appTypeOptions = [
  { value: 0, label: '0 - 需确认的请求 Confirmed-Req' }
]

// 服务类型选项
const svcTypeOptions = [
  { value: 12, label: '12 - 读对象值 ReadProperty' },
  { value: 14, label: '14 - 读多个对象属性 ReadPropertyMultiple' },
  { value: 15, label: '15 - 写对象值 WriteProperty' }
]

// 获取应用类型标签
const getAppTypeLabel = (value: number) => {
  const item = appTypeOptions.find(o => o.value === value)
  return item ? item.label : value
}

// 获取服务类型标签
const getSvcTypeLabel = (value: number) => {
  const item = svcTypeOptions.find(o => o.value === value)
  return item ? item.label : value
}

// 模拟数据
const mockData = ref<BacnetRule[]>([
  {
    id: '1',
    group_name: 'hvac_control',
    rule_work: true,
    app_type_blacklist: [0],
    svc_type_blacklist: [12, 14, 15]
  },
  {
    id: '2',
    group_name: 'lighting_system',
    rule_work: true,
    app_type_blacklist: [0],
    svc_type_blacklist: [15]
  },
  {
    id: '3',
    group_name: 'fire_alarm',
    rule_work: false,
    app_type_blacklist: [],
    svc_type_blacklist: [12, 14]
  }
])

const tableData = ref<BacnetRule[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  group_name: '',
  rule_work: true,
  app_type_blacklist: [] as number[],
  svc_type_blacklist: [] as number[]
})

const viewData = ref<BacnetRule>({
  id: '',
  group_name: '',
  rule_work: false,
  app_type_blacklist: [],
  svc_type_blacklist: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.bacnet.groupNameRequired'), trigger: 'blur' }
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
  formData.app_type_blacklist = []
  formData.svc_type_blacklist = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: BacnetRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: BacnetRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.app_type_blacklist = [...row.app_type_blacklist]
  formData.svc_type_blacklist = [...row.svc_type_blacklist]
  dialogVisible.value = true
}

const handleDelete = async (row: BacnetRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.bacnet.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({
      title: t('common.success'),
      message: t('opc.bacnet.deleteSuccess'),
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
              app_type_blacklist: [...formData.app_type_blacklist],
              svc_type_blacklist: [...formData.svc_type_blacklist]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            app_type_blacklist: [...formData.app_type_blacklist],
            svc_type_blacklist: [...formData.svc_type_blacklist]
          })
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElNotification({
          title: t('common.success'),
          message: isEdit.value ? t('opc.bacnet.editSuccess') : t('opc.bacnet.addSuccess'),
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
.bacnet-page {
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
.bacnet-table {
  width: 100%;
}

.bacnet-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.bacnet-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.bacnet-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

/* 组名称 */
.group-name {
  font-weight: 600;
  color: #409EFF;
}

/* 过滤标签 */
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

.view-dialog :deep(.el-descriptions) {
  width: 100%;
}

.view-dialog :deep(.el-descriptions__body) {
  width: 100%;
}

.view-dialog :deep(.el-descriptions__table) {
  width: 100%;
  table-layout: auto;
}

.view-dialog :deep(.el-descriptions__label) {
  white-space: nowrap;
  width: 1%;
}

.view-dialog :deep(.el-descriptions__cell) {
  width: auto;
}

.view-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
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
