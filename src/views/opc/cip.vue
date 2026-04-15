<template>
  <div class="page-container cip-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('opc.cip.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('opc.cip.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('opc.cip.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <el-table :data="tableData" v-loading="loading" class="cip-table">
          <!-- 用户组 -->
          <el-table-column prop="group_name" :label="$t('opc.cip.groupName')" min-width="130">
            <template #default="{ row }">
              <span class="group-name">{{ row.group_name }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('opc.cip.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- 协议模式 -->
          <el-table-column :label="$t('opc.cip.protocolMode')" width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_cip === 0 ? 'primary' : 'success'" size="small">
                {{ row.is_cip === 0 ? 'CIP' : 'ENIP' }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 封装层过滤 -->
          <el-table-column :label="$t('opc.cip.encapFilter')" min-width="200">
            <template #default="{ row }">
              <el-tag :type="getFilterTypeTagType(row.encap_filter_type)" size="small">
                {{ getFilterTypeLabel(row.encap_filter_type) }}
              </el-tag>
              <div v-if="row.encap_commands?.length" class="cmd-list">
                <el-tag v-for="cmd in row.encap_commands.slice(0, 3)" :key="cmd" type="info" size="small" class="cmd-tag">
                  {{ getEncapCommandLabel(cmd) }}
                </el-tag>
                <el-tag v-if="row.encap_commands.length > 3" type="info" size="small" class="cmd-tag">
                  +{{ row.encap_commands.length - 3 }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- CIP层过滤 -->
          <el-table-column :label="$t('opc.cip.cipFilter')" min-width="200">
            <template #default="{ row }">
              <template v-if="row.is_cip === 0">
                <el-tag :type="getFilterTypeTagType(row.cip_filter_type)" size="small">
                  {{ getFilterTypeLabel(row.cip_filter_type) }}
                </el-tag>
                <div v-if="row.cip_commands?.length" class="cmd-list">
                  <el-tag v-for="cmd in row.cip_commands.slice(0, 3)" :key="cmd" type="info" size="small" class="cmd-tag">
                    {{ getCipCommandLabel(cmd) }}
                  </el-tag>
                  <el-tag v-if="row.cip_commands.length > 3" type="info" size="small" class="cmd-tag">
                    +{{ row.cip_commands.length - 3 }}
                  </el-tag>
                </div>
              </template>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('opc.cip.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="primary" size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('opc.cip.view') }}
                </el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('opc.cip.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('opc.cip.delete') }}
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
      :title="isEdit ? $t('opc.cip.editDialog') : $t('opc.cip.addDialog')"
      width="640px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="140px" class="form-content">
        <!-- 规则开关 -->
        <el-form-item :label="$t('opc.cip.ruleSwitch')">
          <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
        </el-form-item>

        <!-- 用户组 -->
        <el-form-item :label="$t('opc.cip.groupName')" prop="group_name">
          <el-select v-model="formData.group_name" :placeholder="$t('opc.cip.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>

        <!-- 协议模式 -->
        <el-form-item :label="$t('opc.cip.protocolMode')" prop="is_cip">
          <el-select v-model="formData.is_cip" style="width: 100%" :disabled="isEdit" @change="handleIsCipChange">
            <el-option :label="$t('opc.cip.isCip.CIP')" :value="0" />
            <el-option :label="$t('opc.cip.isCip.ENIP')" :value="1" />
          </el-select>
        </el-form-item>

        <el-divider>{{ $t('opc.cip.encapSection') }}</el-divider>

        <!-- 封装层过滤类型 -->
        <el-form-item :label="$t('opc.cip.encapFilterType')">
          <el-select v-model="formData.encap_filter_type" style="width: 100%">
            <el-option :label="$t('opc.cip.filterType.noLimit')" :value="0" />
            <el-option :label="$t('opc.cip.filterType.whitelist')" :value="1" />
            <el-option :label="$t('opc.cip.filterType.blacklist')" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 封装层命令 -->
        <el-form-item v-if="formData.encap_filter_type !== 0" :label="$t('opc.cip.encapCommands')" prop="encap_commands">
          <el-select v-model="formData.encap_commands" multiple :placeholder="$t('opc.cip.encapCommandsPlaceholder')" style="width: 100%">
            <el-option v-for="item in encapCommandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- CIP层（仅CIP模式） -->
        <template v-if="formData.is_cip === 0">
          <el-divider>{{ $t('opc.cip.cipSection') }}</el-divider>

          <!-- CIP层过滤类型 -->
          <el-form-item :label="$t('opc.cip.cipFilterType')">
            <el-select v-model="formData.cip_filter_type" style="width: 100%">
              <el-option :label="$t('opc.cip.filterType.noLimit')" :value="0" />
              <el-option :label="$t('opc.cip.filterType.whitelist')" :value="1" />
              <el-option :label="$t('opc.cip.filterType.blacklist')" :value="2" />
            </el-select>
          </el-form-item>

          <!-- CIP层命令 -->
          <el-form-item v-if="formData.cip_filter_type !== 0" :label="$t('opc.cip.cipCommands')" prop="cip_commands">
            <el-select v-model="formData.cip_commands" multiple :placeholder="$t('opc.cip.cipCommandsPlaceholder')" style="width: 100%">
              <el-option v-for="item in cipCommandOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="$t('opc.cip.viewDetail')"
      width="650px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('opc.cip.groupName')">{{ viewData.group_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('opc.cip.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('opc.cip.enabled') : $t('opc.cip.disabled') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.cip.protocolMode')">
          <el-tag :type="viewData.is_cip === 0 ? 'primary' : 'success'" size="small">
            {{ viewData.is_cip === 0 ? 'CIP' : 'ENIP' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.cip.encapFilterType')">
          <el-tag :type="getFilterTypeTagType(viewData.encap_filter_type)" size="small">
            {{ getFilterTypeLabel(viewData.encap_filter_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('opc.cip.encapCommands')" :span="2">
          <div class="view-tags" v-if="viewData.encap_commands?.length">
            <el-tag v-for="cmd in viewData.encap_commands" :key="cmd" type="info" size="small" class="view-tag">
              {{ getEncapCommandLabel(cmd) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <template v-if="viewData.is_cip === 0">
          <el-descriptions-item :label="$t('opc.cip.cipFilterType')">
            <el-tag :type="getFilterTypeTagType(viewData.cip_filter_type)" size="small">
              {{ getFilterTypeLabel(viewData.cip_filter_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('opc.cip.cipCommandsLabel')">
            <div class="view-tags" v-if="viewData.cip_commands?.length">
              <el-tag v-for="cmd in viewData.cip_commands" :key="'c'+cmd" type="info" size="small" class="view-tag">
                {{ getCipCommandLabel(cmd) }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </template>
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
import { Connection, Plus, InfoFilled, View, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface CipRule {
  id: string
  group_name: string
  rule_work: boolean
  is_cip: number
  encap_filter_type: number
  encap_commands: number[]
  cip_filter_type: number
  cip_commands: number[]
}

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']

const encapCommandOptions = [
  { value: 0, label: 'NOP' },
  { value: 1, label: 'ListIdentity' },
  { value: 2, label: 'ListInterfaces' },
  { value: 3, label: 'RegisterSession' },
  { value: 4, label: 'ListServices' },
  { value: 5, label: 'UnregisterSession' },
  { value: 6, label: 'SendRRData' },
  { value: 7, label: 'SendUnitData' }
]

const cipCommandOptions = [
  { value: 0,  label: 'Nop' },
  { value: 1,  label: 'ForwardOpen' },
  { value: 2,  label: 'ForwardClose' },
  { value: 3,  label: 'UnconnectedSend' },
  { value: 4,  label: 'GetAttributeAll' },
  { value: 5,  label: 'SetAttributeAll' },
  { value: 6,  label: 'GetAttributeList' },
  { value: 7,  label: 'SetAttributeList' },
  { value: 8,  label: 'Reset' },
  { value: 9,  label: 'Start' },
  { value: 10, label: 'MultipleServicePacket' },
  { value: 11, label: 'Stop' },
  { value: 12, label: 'Create' },
  { value: 13, label: 'Delete' },
  { value: 14, label: 'ApplyAttributes' },
  { value: 15, label: 'GetAttributeSingle' },
  { value: 16, label: 'SetAttributeSingle' },
  { value: 17, label: 'FindNextObjectInstance' },
  { value: 18, label: 'ReadTag' },
  { value: 19, label: 'WriteTag' }
]

// ==================== 辅助 ====================
const getFilterTypeLabel = (type: number) => {
  const map: Record<number, string> = {
    0: t('opc.cip.filterType.noLimit'),
    1: t('opc.cip.filterType.whitelist'),
    2: t('opc.cip.filterType.blacklist')
  }
  return map[type] || '-'
}
const getFilterTypeTagType = (type: number) => {
  const map: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[type] || 'info'
}
const getEncapCommandLabel = (cmd: number) => {
  const map: Record<number, string> = {
    0: 'NOP', 1: 'ListIdentity', 2: 'ListInterfaces', 3: 'RegisterSession',
    4: 'ListServices', 5: 'UnregisterSession', 6: 'SendRRData', 7: 'SendUnitData'
  }
  return map[cmd] || String(cmd)
}
const getCipCommandLabel = (cmd: number) => {
  const map: Record<number, string> = {
    0: 'Nop', 1: 'ForwardOpen', 2: 'ForwardClose', 3: 'UnconnectedSend',
    4: 'GetAttributeAll', 5: 'SetAttributeAll', 6: 'GetAttributeList', 7: 'SetAttributeList',
    8: 'Reset', 9: 'Start', 10: 'MultipleServicePacket', 11: 'Stop',
    12: 'Create', 13: 'Delete', 14: 'ApplyAttributes', 15: 'GetAttributeSingle',
    16: 'SetAttributeSingle', 17: 'FindNextObjectInstance', 18: 'ReadTag', 19: 'WriteTag'
  }
  return map[cmd] || String(cmd)
}

// ==================== 状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<CipRule[]>([
  {
    id: '1', group_name: 'plc_control', rule_work: true, is_cip: 0,
    encap_filter_type: 2, encap_commands: [0, 3, 6],
    cip_filter_type: 1, cip_commands: [1, 15, 18]
  },
  {
    id: '2', group_name: 'hmi_interface', rule_work: true, is_cip: 0,
    encap_filter_type: 1, encap_commands: [1, 4, 7],
    cip_filter_type: 2, cip_commands: [8, 13, 16, 19]
  },
  {
    id: '3', group_name: 'data_collection', rule_work: false, is_cip: 1,
    encap_filter_type: 0, encap_commands: [],
    cip_filter_type: 0, cip_commands: []
  },
  {
    id: '4', group_name: 'scada_system', rule_work: true, is_cip: 0,
    encap_filter_type: 2, encap_commands: [0, 5, 6, 7],
    cip_filter_type: 1, cip_commands: [4, 6, 15]
  }
])

const tableData = ref<CipRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  group_name: '',
  rule_work: true,
  is_cip: 0,
  encap_filter_type: 0,
  encap_commands: [] as number[],
  cip_filter_type: 0,
  cip_commands: [] as number[]
})

const viewData = ref<CipRule>({
  id: '', group_name: '', rule_work: false, is_cip: 0,
  encap_filter_type: 0, encap_commands: [],
  cip_filter_type: 0, cip_commands: []
})

const formRules: FormRules = {
  group_name: [{ required: true, message: t('opc.cip.groupNameRequired'), trigger: 'change' }],
  encap_commands: [{
    validator: (_rule: any, value: number[], callback: Function) => {
      if (formData.encap_filter_type !== 0 && (!value || value.length === 0)) {
        callback(new Error(t('opc.cip.commandsRequired')))
      } else {
        callback()
      }
    }
  }],
  cip_commands: [{
    validator: (_rule: any, value: number[], callback: Function) => {
      if (formData.is_cip === 0 && formData.cip_filter_type !== 0 && (!value || value.length === 0)) {
        callback(new Error(t('opc.cip.commandsRequired')))
      } else {
        callback()
      }
    }
  }]
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
const handleIsCipChange = (value: number) => {
  if (value === 1) {
    formData.cip_filter_type = 0
    formData.cip_commands = []
  }
}

const resetForm = () => {
  formData.group_name = ''
  formData.rule_work = true
  formData.is_cip = 0
  formData.encap_filter_type = 0
  formData.encap_commands = []
  formData.cip_filter_type = 0
  formData.cip_commands = []
  editingId.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: CipRule) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleEdit = (row: CipRule) => {
  isEdit.value = true
  editingId.value = row.id
  formData.group_name = row.group_name
  formData.rule_work = row.rule_work
  formData.is_cip = row.is_cip
  formData.encap_filter_type = row.encap_filter_type
  formData.encap_commands = [...row.encap_commands]
  formData.cip_filter_type = row.cip_filter_type
  formData.cip_commands = [...row.cip_commands]
  dialogVisible.value = true
}

const handleDelete = async (row: CipRule) => {
  try {
    await ElMessageBox.confirm(
      t('opc.cip.deleteConfirm', { name: row.group_name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('opc.cip.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: CipRule) => {
  ElNotification({ title: t('common.success'), message: t('opc.cip.editSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockData.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          mockData.value[index] = {
            id: editingId.value,
            group_name: formData.group_name,
            rule_work: formData.rule_work,
            is_cip: formData.is_cip,
            encap_filter_type: formData.encap_filter_type,
            encap_commands: [...formData.encap_commands],
            cip_filter_type: formData.cip_filter_type,
            cip_commands: [...formData.cip_commands]
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(),
          group_name: formData.group_name,
          rule_work: formData.rule_work,
          is_cip: formData.is_cip,
          encap_filter_type: formData.encap_filter_type,
          encap_commands: [...formData.encap_commands],
          cip_filter_type: formData.cip_filter_type,
          cip_commands: [...formData.cip_commands]
        })
      }
      submitLoading.value = false
      dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('opc.cip.editSuccess') : t('opc.cip.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

// ==================== 初始化 ====================
fetchList()
</script>

<style scoped>
.cip-page {
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
.cip-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.cip-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.cip-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.group-name {
  font-weight: 600;
  color: #409EFF;
}

.cmd-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.cmd-tag {
  font-size: 11px;
}

.empty-text {
  color: #c0c4cc;
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

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.form-dialog :deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.form-content {
  max-width: 100%;
}

/* ========== 查看对话框 ========== */
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

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
