<template>
  <div class="page-container s7-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.s7.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.s7.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.s7.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <el-table :data="tableData" v-loading="loading" class="s7-table">
          <el-table-column prop="group_name" :label="$t('opc.s7.groupName')" min-width="140">
            <template #default="{ row }">
              <span class="group-name">{{ row.group_name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s7.status')" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.rule_work ? 'success' : 'danger'" size="small">
                {{ row.rule_work ? $t('opc.s7.enabled') : $t('opc.s7.disabled') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s7.protocolExt')" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.userdata_disable ? 'warning' : 'success'" size="small">
                {{ row.userdata_disable ? $t('opc.s7.disabled') : $t('opc.s7.enabled') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s7.readFilter')" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getFilterTagType(row.r_filter_type)" size="small">
                {{ getFilterTypeLabel(row.r_filter_type) }}
              </el-tag>
              <span v-if="row.r_tabs?.length" class="config-count">({{ row.r_tabs.length }})</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s7.writeFilter')" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getFilterTagType(row.w_filter_type)" size="small">
                {{ getFilterTypeLabel(row.w_filter_type) }}
              </el-tag>
              <span v-if="row.w_tabs?.length" class="config-count">({{ row.w_tabs.length }})</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('opc.s7.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="primary" size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('opc.s7.view') }}
                </el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('opc.s7.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('opc.s7.delete') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 添加/编辑 - 步骤条对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('opc.s7.editDialog') : $t('opc.s7.addDialog')"
      width="720px"
      class="stepper-dialog"
      :close-on-click-modal="false"
    >
      <!-- 步骤条 -->
      <div class="bs-stepper">
        <div class="bs-stepper-header">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step"
            :class="{ active: currentStep === index + 1, done: currentStep > index + 1 }"
            @click="goToStep(index + 1)"
          >
            <button type="button" class="step-trigger">
              <span class="bs-stepper-circle">{{ index + 1 }}</span>
              <span class="bs-stepper-label">{{ step.label }}</span>
            </button>
          </div>
          <div class="line" :class="{ active: currentStep >= 2 }"></div>
          <div class="line" :class="{ active: currentStep >= 3 }"></div>
        </div>
      </div>

      <!-- Step 1: 基础设置 -->
      <div v-show="currentStep === 1" class="step-content">
        <el-form :model="formData" :rules="formRules" ref="formRef" label-width="140px" class="step-form">
          <el-form-item :label="$t('opc.s7.ruleSwitch')">
            <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
          </el-form-item>
          <el-form-item :label="$t('opc.s7.groupName')" prop="group_name">
            <el-select v-model="formData.group_name" :placeholder="$t('opc.s7.groupNamePlaceholder')" style="width: 100%">
              <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('opc.s7.protocolExtSwitch')">
            <el-switch v-model="formData.userdata_disable" :active-text="$t('opc.s7.disabled')" :inactive-text="$t('opc.s7.enabled')" active-color="#f56c6c" inactive-color="#67c23a" />
          </el-form-item>
          <el-form-item :label="$t('opc.s7.userdataFilter')">
            <el-select v-model="formData.userdata_func_filter" multiple filterable allow-create :placeholder="$t('opc.s7.filterPlaceholder')" style="width: 100%">
              <el-option v-for="cmd in userdataOptions" :key="cmd.value" :label="cmd.label" :value="cmd.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('opc.s7.jobFilter')">
            <el-select v-model="formData.job_func_filter" multiple filterable allow-create :placeholder="$t('opc.s7.filterPlaceholder')" style="width: 100%">
              <el-option v-for="cmd in jobOptions" :key="cmd.value" :label="cmd.label" :value="cmd.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('opc.s7.ackFilter')">
            <el-select v-model="formData.ack_func_filter" multiple filterable allow-create :placeholder="$t('opc.s7.filterPlaceholder')" style="width: 100%">
              <el-option v-for="cmd in ackOptions" :key="cmd.value" :label="cmd.label" :value="cmd.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 读过滤 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item :label="$t('opc.s7.filterType')">
            <el-radio-group v-model="formData.r_filter_type">
              <el-radio :value="0">{{ $t('opc.s7.noLimit') }}</el-radio>
              <el-radio :value="1">{{ $t('opc.s7.whitelist') }}</el-radio>
              <el-radio :value="2">{{ $t('opc.s7.blacklist') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('opc.s7.readConfig')">
            <div class="filter-config-wrapper">
              <div class="config-header">
                <el-button type="primary" size="small" @click="addReadConfig">
                  <el-icon><Plus /></el-icon>
                  {{ $t('opc.s7.addConfig') }}
                </el-button>
              </div>
              <div v-if="formData.r_tabs.length" class="config-list">
                <div v-for="(config, index) in formData.r_tabs" :key="index" class="config-item">
                  <span class="config-info">
                    {{ config.block }}{{ config.block === 'DB' ? config.dbIndex : '' }}:
                    {{ config.startAddr }} - {{ config.endAddr }}
                  </span>
                  <el-button type="danger" size="small" link @click="removeReadConfig(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-else class="config-empty">{{ $t('opc.s7.noConfig') }}</div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 写过滤 -->
      <div v-show="currentStep === 3" class="step-content">
        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item :label="$t('opc.s7.filterType')">
            <el-radio-group v-model="formData.w_filter_type">
              <el-radio :value="0">{{ $t('opc.s7.noLimit') }}</el-radio>
              <el-radio :value="1">{{ $t('opc.s7.whitelist') }}</el-radio>
              <el-radio :value="2">{{ $t('opc.s7.blacklist') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('opc.s7.writeConfig')">
            <div class="filter-config-wrapper">
              <div class="config-header">
                <el-button type="primary" size="small" @click="addWriteConfig">
                  <el-icon><Plus /></el-icon>
                  {{ $t('opc.s7.addConfig') }}
                </el-button>
              </div>
              <div v-if="formData.w_tabs.length" class="config-list">
                <div v-for="(config, index) in formData.w_tabs" :key="index" class="config-item">
                  <span class="config-info">
                    {{ config.block }}{{ config.block === 'DB' ? config.dbIndex : '' }}:
                    {{ config.startAddr }} - {{ config.endAddr }}
                  </span>
                  <el-button type="danger" size="small" link @click="removeWriteConfig(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-else class="config-empty">{{ $t('opc.s7.noConfig') }}</div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤条底部按钮 -->
      <template #footer>
        <div class="stepper-footer">
          <el-button v-if="currentStep > 1" @click="previousStep">{{ $t('opc.s7.previous') }}</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">{{ $t('opc.s7.next') }}</el-button>
          <el-button v-if="currentStep === 3" type="success" @click="handleSubmit" :loading="submitLoading">{{ $t('opc.s7.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加数据配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      :title="configDialogTitle"
      width="450px"
      class="config-dialog"
    >
      <el-form :model="configForm" label-width="100px">
        <el-form-item :label="$t('opc.s7.blockType')">
          <el-select v-model="configForm.block" style="width: 100%">
            <el-option label="CT (Counter)" value="CT" />
            <el-option label="TM (Timer)" value="TM" />
            <el-option label="PE (Peripheral Input)" value="PE" />
            <el-option label="PA (Peripheral Output)" value="PA" />
            <el-option label="MK (Memory)" value="MK" />
            <el-option label="DB (Data Block)" value="DB" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="configForm.block === 'DB'" :label="$t('opc.s7.dbIndex')">
          <el-input-number v-model="configForm.dbIndex" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('opc.s7.startAddr')">
          <el-input v-model="configForm.startAddr" :placeholder="$t('opc.s7.addrHexPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('opc.s7.endAddr')">
          <el-input v-model="configForm.endAddr" :placeholder="$t('opc.s7.addrHexPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmConfig">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.s7.viewDetail')"
      width="650px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.s7.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.s7.enabled') : $t('opc.s7.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.protocolExt')">
          <el-tag :type="viewData.userdata_disable ? 'warning' : 'success'" size="small">
            {{ viewData.userdata_disable ? $t('opc.s7.disabled') : $t('opc.s7.enabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.userdataFilter')">
          {{ viewData.userdata_func_filter?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.jobFilter')" :span="2">
          {{ viewData.job_func_filter?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.ackFilter')" :span="2">
          {{ viewData.ack_func_filter?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.readConfig')" :span="2">
          <div class="view-config">
            <el-tag :type="getFilterTagType(viewData.r_filter_type)" size="small">
              {{ getFilterTypeLabel(viewData.r_filter_type) }}
            </el-tag>
            <div v-if="viewData.r_tabs?.length" class="config-detail">
              <div v-for="(cfg, i) in viewData.r_tabs" :key="i" class="cfg-line">
                {{ cfg.block }}{{ cfg.block === 'DB' ? cfg.dbIndex : '' }}: {{ cfg.startAddr }} - {{ cfg.endAddr }}
              </div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.s7.writeConfig')" :span="2">
          <div class="view-config">
            <el-tag :type="getFilterTagType(viewData.w_filter_type)" size="small">
              {{ getFilterTypeLabel(viewData.w_filter_type) }}
            </el-tag>
            <div v-if="viewData.w_tabs?.length" class="config-detail">
              <div v-for="(cfg, i) in viewData.w_tabs" :key="i" class="cfg-line">
                {{ cfg.block }}{{ cfg.block === 'DB' ? cfg.dbIndex : '' }}: {{ cfg.startAddr }} - {{ cfg.endAddr }}
              </div>
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
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Cpu, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface DataConfig {
  block: 'CT' | 'TM' | 'PE' | 'PA' | 'MK' | 'DB'
  dbIndex: number
  startAddr: string
  endAddr: string
}

interface S7Rule {
  id: string
  group_name: string
  rule_work: boolean
  userdata_disable: boolean
  userdata_func_filter: string[]
  job_func_filter: string[]
  ack_func_filter: string[]
  r_filter_type: number
  r_tabs: DataConfig[]
  w_filter_type: number
  w_tabs: DataConfig[]
}

// ==================== 选项数据 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

const userdataOptions = [
  { value: '0x00', label: '0x00 - CPU Services' },
  { value: '0x01', label: '0x01 - Read SZL' },
  { value: '0x02', label: '0x02 - Message S7' },
  { value: '0x03', label: '0x03 - Diagnostic' },
  { value: '0x04', label: '0x04 - PLC Control' },
  { value: '0x05', label: '0x05 - Protection' },
  { value: '0x06', label: '0x06 - PPI Param' },
  { value: '0x07', label: '0x07 - Programming' }
]

const jobOptions = [
  { value: '0xF0', label: '0xF0 - Setup Communication' },
  { value: '0xF1', label: '0xF1 - Read Var' },
  { value: '0xF2', label: '0xF2 - Write Var' },
  { value: '0xF3', label: '0xF3 - Request Download' },
  { value: '0xF4', label: '0xF4 - Download Block' },
  { value: '0xF5', label: '0xF5 - End Download' },
  { value: '0xF6', label: '0xF6 - Start Upload' },
  { value: '0xF7', label: '0xF7 - Upload' },
  { value: '0xF8', label: '0xF8 - End Upload' }
]

const ackOptions = [
  { value: '0xF0', label: '0xF0 - Setup Communication Ack' },
  { value: '0xF1', label: '0xF1 - Read Var Ack' },
  { value: '0xF2', label: '0xF2 - Write Var Ack' },
  { value: '0xF3', label: '0xF3 - Request Download Ack' },
  { value: '0xFA', label: '0xFA - User Data Ack' }
]

// ==================== 步骤条 ====================
const currentStep = ref(1)
const steps = computed(() => [
  { label: t('opc.s7.steps.basic') },
  { label: t('opc.s7.steps.readFilter') },
  { label: t('opc.s7.steps.writeFilter') }
])

const goToStep = (step: number) => {
  if (step >= 1 && step <= 3) currentStep.value = step
}
const nextStep = () => { if (currentStep.value < 3) currentStep.value++ }
const previousStep = () => { if (currentStep.value > 1) currentStep.value-- }

// ==================== 状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const configDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const isReadConfig = ref(true)

// ==================== 模拟数据 ====================
const mockData = ref<S7Rule[]>([
  {
    id: '1',
    group_name: 'plc_control',
    rule_work: true,
    userdata_disable: false,
    userdata_func_filter: ['0x00', '0x01'],
    job_func_filter: [],
    ack_func_filter: [],
    r_filter_type: 1,
    r_tabs: [{ block: 'DB', dbIndex: 1, startAddr: '0x0000', endAddr: '0x00FF' }],
    w_filter_type: 2,
    w_tabs: []
  },
  {
    id: '2',
    group_name: 'hmi_read',
    rule_work: true,
    userdata_disable: true,
    userdata_func_filter: [],
    job_func_filter: ['0xF0'],
    ack_func_filter: ['0xF1'],
    r_filter_type: 0,
    r_tabs: [],
    w_filter_type: 0,
    w_tabs: []
  }
])

const tableData = ref<S7Rule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  group_name: '',
  rule_work: true,
  userdata_disable: false,
  userdata_func_filter: [] as string[],
  job_func_filter: [] as string[],
  ack_func_filter: [] as string[],
  r_filter_type: 0,
  r_tabs: [] as DataConfig[],
  w_filter_type: 0,
  w_tabs: [] as DataConfig[]
})

const configForm = reactive({
  block: 'DB' as 'CT' | 'TM' | 'PE' | 'PA' | 'MK' | 'DB',
  dbIndex: 1,
  startAddr: '0x0000',
  endAddr: '0x00FF'
})

const configDialogTitle = ref('')

const viewData = ref<S7Rule>({
  id: '', group_name: '', rule_work: false, userdata_disable: false,
  userdata_func_filter: [], job_func_filter: [], ack_func_filter: [],
  r_filter_type: 0, r_tabs: [], w_filter_type: 0, w_tabs: []
})

const formRules: FormRules = {
  group_name: [{ required: true, message: t('opc.s7.groupNameRequired'), trigger: 'change' }]
}

// ==================== 辅助方法 ====================
const getFilterTypeLabel = (type: number) => {
  const labels: Record<number, string> = { 0: t('opc.s7.noLimit'), 1: t('opc.s7.whitelist'), 2: t('opc.s7.blacklist') }
  return labels[type] || '-'
}

const getFilterTagType = (type: number) => {
  const types: Record<number, 'info' | 'success' | 'danger'> = { 0: 'info', 1: 'success', 2: 'danger' }
  return types[type] || 'info'
}

// ==================== 数据加载 ====================
const fetchList = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData.value
    pagination.total = mockData.value.length
    loading.value = false
  }, 300)
}

// ==================== 表单操作 ====================
const resetForm = () => {
  formData.group_name = ''
  formData.rule_work = true
  formData.userdata_disable = false
  formData.userdata_func_filter = []
  formData.job_func_filter = []
  formData.ack_func_filter = []
  formData.r_filter_type = 0
  formData.r_tabs = []
  formData.w_filter_type = 0
  formData.w_tabs = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  currentStep.value = 1
  dialogVisible.value = true
}

const handleView = (row: S7Rule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: S7Rule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.userdata_disable = row.userdata_disable
  formData.userdata_func_filter = [...row.userdata_func_filter]
  formData.job_func_filter = [...row.job_func_filter]
  formData.ack_func_filter = [...row.ack_func_filter]
  formData.r_filter_type = row.r_filter_type
  formData.r_tabs = row.r_tabs.map(t => ({ ...t }))
  formData.w_filter_type = row.w_filter_type
  formData.w_tabs = row.w_tabs.map(t => ({ ...t }))
  currentStep.value = 1
  dialogVisible.value = true
}

const handleDelete = async (row: S7Rule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.s7.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.s7.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

// ==================== 数据配置 ====================
const addReadConfig = () => {
  isReadConfig.value = true
  configDialogTitle.value = t('opc.s7.readConfigTitle')
  configForm.block = 'DB'
  configForm.dbIndex = 1
  configForm.startAddr = '0x0000'
  configForm.endAddr = '0x00FF'
  configDialogVisible.value = true
}

const addWriteConfig = () => {
  isReadConfig.value = false
  configDialogTitle.value = t('opc.s7.writeConfigTitle')
  configForm.block = 'DB'
  configForm.dbIndex = 1
  configForm.startAddr = '0x0000'
  configForm.endAddr = '0x00FF'
  configDialogVisible.value = true
}

const confirmConfig = () => {
  const config: DataConfig = {
    block: configForm.block,
    dbIndex: configForm.dbIndex,
    startAddr: configForm.startAddr,
    endAddr: configForm.endAddr
  }
  if (isReadConfig.value) {
    formData.r_tabs.push(config)
  } else {
    formData.w_tabs.push(config)
  }
  configDialogVisible.value = false
}

const removeReadConfig = (index: number) => { formData.r_tabs.splice(index, 1) }
const removeWriteConfig = (index: number) => { formData.w_tabs.splice(index, 1) }

// ==================== 提交 ====================
const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) {
      currentStep.value = 1
      return
    }
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockData.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          mockData.value[index] = {
            id: editingId.value,
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            userdata_disable: formData.userdata_disable,
            userdata_func_filter: [...formData.userdata_func_filter],
            job_func_filter: [...formData.job_func_filter],
            ack_func_filter: [...formData.ack_func_filter],
            r_filter_type: formData.r_filter_type,
            r_tabs: formData.r_tabs.map(t => ({ ...t })),
            w_filter_type: formData.w_filter_type,
            w_tabs: formData.w_tabs.map(t => ({ ...t }))
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(),
          group_name: formData.group_name,
          rule_work: formData.rule_work,
          userdata_disable: formData.userdata_disable,
          userdata_func_filter: [...formData.userdata_func_filter],
          job_func_filter: [...formData.job_func_filter],
          ack_func_filter: [...formData.ack_func_filter],
          r_filter_type: formData.r_filter_type,
          r_tabs: formData.r_tabs.map(t => ({ ...t })),
          w_filter_type: formData.w_filter_type,
          w_tabs: formData.w_tabs.map(t => ({ ...t }))
        })
      }
      submitLoading.value = false
      dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('opc.s7.editSuccess') : t('opc.s7.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

// ==================== 初始化 ====================
fetchList()
</script>

<style scoped>
.s7-page {
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

/* ========== 页面描述 ========== */
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

/* ========== 主卡片 ========== */
.main-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px 28px;
}

/* ========== 表格 ========== */
.s7-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.s7-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.s7-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.group-name {
  font-weight: 600;
  color: #409EFF;
}

.config-count {
  margin-left: 4px;
  color: #909399;
  font-size: 12px;
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

/* ========== 步骤条 ========== */
.bs-stepper {
  margin-bottom: 24px;
}

.bs-stepper-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.bs-stepper-header .step {
  position: relative;
  z-index: 1;
}

.step-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bs-stepper-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(144, 147, 153, 0.1);
  border: 2px solid rgba(144, 147, 153, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #909399;
  transition: all 0.3s ease;
}

.bs-stepper-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step.active .bs-stepper-circle {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15), rgba(103, 194, 58, 0.15));
  border-color: #409EFF;
  color: #409EFF;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.25);
}

.step.active .bs-stepper-label {
  color: #409EFF;
  font-weight: 600;
}

.step.done .bs-stepper-circle {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border-color: #67C23A;
  color: white;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
}

.step.done .bs-stepper-label {
  color: #67C23A;
}

.bs-stepper-header .line {
  flex: 1;
  height: 2px;
  background: rgba(144, 147, 153, 0.15);
  margin: 0 4px;
  margin-bottom: 28px;
  border-radius: 1px;
  transition: background 0.3s ease;
}

.bs-stepper-header .line.active {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

/* ========== 步骤内容 ========== */
.step-content {
  min-height: 200px;
}

.step-form {
  max-width: 100%;
}

/* ========== 过滤配置区 ========== */
.filter-config-wrapper {
  width: 100%;
}

.config-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.config-info {
  font-size: 13px;
  color: #606266;
  font-family: 'Consolas', monospace;
}

.config-empty {
  padding: 20px;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  background: rgba(144, 147, 153, 0.04);
  border-radius: 6px;
  border: 1px dashed rgba(144, 147, 153, 0.2);
}

/* ========== 步骤条底部 ========== */
.stepper-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ========== 对话框样式 ========== */
.stepper-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.stepper-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.stepper-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

/* ========== 查看对话框 ========== */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.view-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.cfg-line {
  padding: 4px 8px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
}
</style>
