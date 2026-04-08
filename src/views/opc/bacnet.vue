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

            <!-- 信令黑名单 -->
            <el-table-column :label="$t('opc.bacnet.blackCmd')" min-width="250">
              <template #default="{ row }">
                <div class="signal-tags">
                  <el-tag
                    v-for="cmd in row.black_cmd.slice(0, 3)"
                    :key="cmd"
                    type="info"
                    size="small"
                    class="signal-tag"
                  >
                    {{ cmd }}
                  </el-tag>
                  <el-tag v-if="row.black_cmd.length > 3" type="info" size="small" class="signal-tag">
                    +{{ row.black_cmd.length - 3 }}
                  </el-tag>
                  <span v-if="!row.black_cmd?.length" class="empty-text">-</span>
                </div>
              </template>
            </el-table-column>

            <!-- 寄存器控制 -->
            <el-table-column :label="$t('opc.bacnet.regControl')" min-width="150">
              <template #default="{ row }">
                <el-tag v-if="row.reg_str?.length" type="warning" size="small">
                  {{ row.reg_str.length }} {{ $t('opc.bacnet.regCount') }}
                </el-tag>
                <span v-else class="empty-text">-</span>
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
      :title="isEdit ? $t('opc.bacnet.editDialog') : $t('opc.bacnet.addDialog')"
      width="650px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="form-content">
        <el-form-item :label="$t('opc.bacnet.groupName')" prop="group_name">
          <el-input
            v-model="formData.group_name"
            :placeholder="$t('opc.bacnet.groupNamePlaceholder')"
            maxlength="31"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.ruleSwitch')" prop="rule_work">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.blackCmd')">
          <el-select
            v-model="formData.black_cmd"
            multiple
            filterable
            allow-create
            :placeholder="$t('opc.bacnet.blackCmdPlaceholder')"
            style="width: 100%"
          >
            <el-option v-for="cmd in signalOptions" :key="cmd.value" :label="cmd.label" :value="cmd.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('opc.bacnet.regControl')">
          <div class="reg-control-wrapper">
            <el-button type="primary" size="small" @click="addRegConfig">
              <el-icon><Plus /></el-icon>
              {{ $t('opc.bacnet.addReg') }}
            </el-button>
            <div v-if="formData.reg_str.length" class="reg-list">
              <div v-for="(reg, index) in formData.reg_str" :key="index" class="reg-item">
                <span class="reg-info">
                  {{ $t('opc.bacnet.address') }}: {{ reg.address }} |
                  {{ $t('opc.bacnet.range') }}: {{ reg.begin }} - {{ reg.end }}
                </span>
                <el-button type="danger" size="small" link @click="removeRegConfig(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
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

    <!-- 寄存器配置对话框 -->
    <el-dialog
      v-model="regDialogVisible"
      :title="$t('opc.bacnet.regConfig')"
      width="400px"
      class="reg-dialog"
    >
      <el-form :model="regForm" label-width="80px">
        <el-form-item :label="$t('opc.bacnet.address')">
          <el-input-number v-model="regForm.address" :min="0" :max="255" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('opc.bacnet.begin')">
          <el-input-number v-model="regForm.begin" :min="0" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('opc.bacnet.end')">
          <el-input-number v-model="regForm.end" :min="0" :max="65535" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmRegConfig">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.bacnet.viewDetail')"
      width="550px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.bacnet.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.bacnet.enabled') : $t('opc.bacnet.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.blackCmd')" :span="2">
          <div class="view-tags">
            <el-tag v-for="cmd in viewData.black_cmd" :key="cmd" type="info" size="small" class="view-tag">
              {{ cmd }}
            </el-tag>
            <span v-if="!viewData.black_cmd?.length">-</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.bacnet.regControl')" :span="2">
          <div v-if="viewData.reg_str?.length" class="view-reg-list">
            <div v-for="(reg, index) in viewData.reg_str" :key="index" class="view-reg-item">
              {{ $t('opc.bacnet.address') }}: {{ reg.address }} | {{ $t('opc.bacnet.range') }}: {{ reg.begin }} - {{ reg.end }}
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Cpu, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 类型定义
interface RegisterConfig {
  address: number
  begin: number
  end: number
}

interface BacnetRule {
  id: string
  group_name: string
  rule_work: boolean
  black_cmd: string[]
  reg_str: RegisterConfig[]
}

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const regDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// 模拟数据
const mockData = ref<BacnetRule[]>([
  {
    id: '1',
    group_name: 'hvac_control',
    rule_work: true,
    black_cmd: ['Who-Is', 'I-Am', 'Who-Has'],
    reg_str: [
      { address: 0, begin: 0, end: 100 },
      { address: 1, begin: 50, end: 200 }
    ]
  },
  {
    id: '2',
    group_name: 'lighting_system',
    rule_work: true,
    black_cmd: ['WriteProperty', 'ReadProperty'],
    reg_str: []
  },
  {
    id: '3',
    group_name: 'fire_alarm',
    rule_work: false,
    black_cmd: ['SubscribeCOV', 'ConfirmedEventNotification'],
    reg_str: [{ address: 10, begin: 0, end: 255 }]
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
  black_cmd: [] as string[],
  reg_str: [] as RegisterConfig[]
})

const regForm = reactive({
  address: 0,
  begin: 0,
  end: 0
})

const viewData = ref<BacnetRule>({
  id: '',
  group_name: '',
  rule_work: false,
  black_cmd: [],
  reg_str: []
})

const formRules: FormRules = {
  group_name: [
    { required: true, message: t('opc.bacnet.groupNameRequired'), trigger: 'blur' }
  ]
}

// BACnet信令选项
const signalOptions = [
  { value: 'Who-Is', label: 'Who-Is' },
  { value: 'I-Am', label: 'I-Am' },
  { value: 'Who-Has', label: 'Who-Has' },
  { value: 'I-Have', label: 'I-Have' },
  { value: 'ReadProperty', label: 'ReadProperty' },
  { value: 'WriteProperty', label: 'WriteProperty' },
  { value: 'ReadPropertyMultiple', label: 'ReadPropertyMultiple' },
  { value: 'WritePropertyMultiple', label: 'WritePropertyMultiple' },
  { value: 'SubscribeCOV', label: 'SubscribeCOV' },
  { value: 'ConfirmedEventNotification', label: 'ConfirmedEventNotification' },
  { value: 'UnconfirmedEventNotification', label: 'UnconfirmedEventNotification' },
  { value: 'DeviceCommunicationControl', label: 'DeviceCommunicationControl' }
]

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
  formData.black_cmd = []
  formData.reg_str = []
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
  formData.black_cmd = [...row.black_cmd]
  formData.reg_str = [...row.reg_str]
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

const addRegConfig = () => {
  regForm.address = 0
  regForm.begin = 0
  regForm.end = 0
  regDialogVisible.value = true
}

const confirmRegConfig = () => {
  formData.reg_str.push({
    address: regForm.address,
    begin: regForm.begin,
    end: regForm.end
  })
  regDialogVisible.value = false
}

const removeRegConfig = (index: number) => {
  formData.reg_str.splice(index, 1)
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
              black_cmd: [...formData.black_cmd],
              reg_str: [...formData.reg_str]
            }
          }
        } else {
          mockData.value.push({
            id: Date.now().toString(),
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            black_cmd: [...formData.black_cmd],
            reg_str: [...formData.reg_str]
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

/* 信令标签 */
.signal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.signal-tag {
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

/* 寄存器控制 */
.reg-control-wrapper {
  width: 100%;
}

.reg-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.reg-info {
  font-size: 13px;
  color: #606266;
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

.view-reg-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.view-reg-item {
  padding: 6px 10px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 4px;
  font-size: 13px;
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
