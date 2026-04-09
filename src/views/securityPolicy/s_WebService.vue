<template>
  <div class="page-container webservice-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('securityPolicy.s_WebService.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('securityPolicy.s_WebService.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('securityPolicy.s_WebService.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-card">
      <div class="card-content">
        <el-table :data="tableData" v-loading="loading" class="ws-table">
          <!-- 用户组 -->
          <el-table-column prop="groupName" :label="$t('securityPolicy.s_WebService.groupName')" min-width="120">
            <template #default="{ row }">
              <span class="group-name">{{ row.groupName }}</span>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column :label="$t('securityPolicy.s_WebService.status')" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.rule_work" @change="handleToggleStatus(row)" inline-prompt :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </template>
          </el-table-column>

          <!-- 协议头命令过滤 -->
          <el-table-column :label="$t('securityPolicy.s_WebService.blackCmd')" min-width="140">
            <template #default="{ row }">
              <div v-if="row.head.blackCmd.length" class="tag-list">
                <el-tag v-for="cmd in row.head.blackCmd.slice(0, 3)" :key="cmd" type="warning" size="small" class="badge-tag">{{ cmd }}</el-tag>
                <el-tag v-if="row.head.blackCmd.length > 3" type="warning" size="small" class="badge-tag">+{{ row.head.blackCmd.length - 3 }}</el-tag>
              </div>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>

          <!-- 授权IP白名单 -->
          <el-table-column :label="$t('securityPolicy.s_WebService.whitelistIp')" min-width="160">
            <template #default="{ row }">
              <div v-if="row.head.whitelistIp.length" class="tag-list">
                <el-tag v-for="ip in row.head.whitelistIp.slice(0, 2)" :key="ip" type="success" size="small" class="badge-tag">{{ ip }}</el-tag>
                <el-tag v-if="row.head.whitelistIp.length > 2" type="success" size="small" class="badge-tag">+{{ row.head.whitelistIp.length - 2 }}</el-tag>
              </div>
              <span v-else class="empty-text">{{ $t('securityPolicy.s_WebService.allAllowed') }}</span>
            </template>
          </el-table-column>

          <!-- SOAP函数过滤 -->
          <el-table-column :label="$t('securityPolicy.s_WebService.soapFun')" min-width="140">
            <template #default="{ row }">
              <div v-if="row.soap.soapFun.length" class="tag-list">
                <el-tag v-for="fn in row.soap.soapFun.slice(0, 3)" :key="fn" size="small" class="badge-tag soap-tag">{{ fn }}</el-tag>
                <el-tag v-if="row.soap.soapFun.length > 3" size="small" class="badge-tag soap-tag">+{{ row.soap.soapFun.length - 3 }}</el-tag>
              </div>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column :label="$t('securityPolicy.s_WebService.actions')" min-width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="primary" size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  {{ $t('securityPolicy.s_WebService.view') }}
                </el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  {{ $t('securityPolicy.s_WebService.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  {{ $t('securityPolicy.s_WebService.delete') }}
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('securityPolicy.s_WebService.editDialog') : $t('securityPolicy.s_WebService.addDialog')"
      width="900px"
      class="form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="180px" class="form-content">
        <div class="form-columns">
          <!-- 左栏：基础设置 -->
          <div class="form-col">
            <div class="col-header">
              <el-icon><Setting /></el-icon>
              <span>{{ $t('securityPolicy.s_WebService.basicSettings') }}</span>
            </div>
            <!-- 规则开关 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.ruleSwitch')">
              <el-switch v-model="formData.rule_work" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
            </el-form-item>
            <!-- 用户组 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.groupName')" prop="groupName">
              <el-select v-model="formData.groupName" :placeholder="$t('securityPolicy.s_WebService.groupNamePlaceholder')" style="width: 100%" :disabled="isEdit">
                <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 中栏：HEAD检查 -->
          <div class="form-col">
            <div class="col-header">
              <el-icon><Monitor /></el-icon>
              <span>{{ $t('securityPolicy.s_WebService.headInspection') }}</span>
            </div>
            <!-- HTTP命令过滤 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.blackCmdLabel')">
              <el-select v-model="formData.head.blackCmd" multiple :placeholder="$t('securityPolicy.s_WebService.blackCmdPlaceholder')" style="width: 100%">
                <el-option v-for="cmd in httpCommands" :key="cmd" :label="cmd" :value="cmd" />
              </el-select>
            </el-form-item>
            <!-- IP白名单 -->
            <el-form-item>
              <template #label>
                <span>{{ $t('securityPolicy.s_WebService.whitelistIpLabel') }}</span>
                <span class="field-hint">{{ $t('securityPolicy.s_WebService.whitelistIpHint') }}</span>
              </template>
              <div class="tag-input-wrapper">
                <div class="tag-list-box">
                  <el-tag v-for="ip in formData.head.whitelistIp" :key="ip" type="success" closable size="small" @close="removeIp(ip)">{{ ip }}</el-tag>
                  <span v-if="!formData.head.whitelistIp.length" class="empty-hint">{{ $t('securityPolicy.s_WebService.noIp') }}</span>
                </div>
                <div class="input-row">
                  <el-input v-model="newIp" :placeholder="$t('securityPolicy.s_WebService.ipPlaceholder')" @keyup.enter="addIp" />
                  <el-button type="primary" @click="addIp"><el-icon><Plus /></el-icon></el-button>
                </div>
              </div>
            </el-form-item>
          </div>

          <!-- 右栏：SOAP检查 -->
          <div class="form-col">
            <div class="col-header">
              <el-icon><Connection /></el-icon>
              <span>{{ $t('securityPolicy.s_WebService.soapInspection') }}</span>
            </div>
            <!-- SOAP函数名 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.soapFunLabel')">
              <div class="tag-input-wrapper">
                <div class="tag-list-box">
                  <el-tag v-for="item in formData.soap.soapFun" :key="item" size="small" closable @close="removeSoapItem('soapFun', item)">{{ item }}</el-tag>
                  <span v-if="!formData.soap.soapFun.length" class="empty-hint">{{ $t('securityPolicy.s_WebService.noContent') }}</span>
                </div>
                <div class="input-row">
                  <el-input v-model="newSoapFun" :placeholder="$t('securityPolicy.s_WebService.soapFunPlaceholder')" @keyup.enter="addSoapItem('soapFun')" />
                  <el-button type="primary" @click="addSoapItem('soapFun')"><el-icon><Plus /></el-icon></el-button>
                </div>
              </div>
            </el-form-item>
            <!-- SOAP参数 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.soapParamLabel')">
              <div class="tag-input-wrapper">
                <div class="tag-list-box">
                  <el-tag v-for="item in formData.soap.soapParam" :key="item" size="small" closable @close="removeSoapItem('soapParam', item)">{{ item }}</el-tag>
                  <span v-if="!formData.soap.soapParam.length" class="empty-hint">{{ $t('securityPolicy.s_WebService.noContent') }}</span>
                </div>
                <div class="input-row">
                  <el-input v-model="newSoapParam" :placeholder="$t('securityPolicy.s_WebService.soapParamPlaceholder')" @keyup.enter="addSoapItem('soapParam')" />
                  <el-button type="primary" @click="addSoapItem('soapParam')"><el-icon><Plus /></el-icon></el-button>
                </div>
              </div>
            </el-form-item>
            <!-- SOAP请求内容 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.soapRequestLabel')">
              <div class="tag-input-wrapper">
                <div class="tag-list-box">
                  <el-tag v-for="item in formData.soap.soapRequest" :key="item" size="small" closable @close="removeSoapItem('soapRequest', item)">{{ item }}</el-tag>
                  <span v-if="!formData.soap.soapRequest.length" class="empty-hint">{{ $t('securityPolicy.s_WebService.noContent') }}</span>
                </div>
                <div class="input-row">
                  <el-input v-model="newSoapRequest" :placeholder="$t('securityPolicy.s_WebService.soapRequestPlaceholder')" @keyup.enter="addSoapItem('soapRequest')" />
                  <el-button type="primary" @click="addSoapItem('soapRequest')"><el-icon><Plus /></el-icon></el-button>
                </div>
              </div>
            </el-form-item>
            <!-- SOAP压缩通过 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.soapCompress')">
              <el-switch v-model="formData.soap.soapCompress" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
            </el-form-item>
            <!-- SOAP响应内容 -->
            <el-form-item :label="$t('securityPolicy.s_WebService.soapResponseLabel')">
              <div class="tag-input-wrapper">
                <div class="tag-list-box">
                  <el-tag v-for="item in formData.soap.soapResponse" :key="item" size="small" closable @close="removeSoapItem('soapResponse', item)">{{ item }}</el-tag>
                  <span v-if="!formData.soap.soapResponse.length" class="empty-hint">{{ $t('securityPolicy.s_WebService.noContent') }}</span>
                </div>
                <div class="input-row">
                  <el-input v-model="newSoapResponse" :placeholder="$t('securityPolicy.s_WebService.soapResponsePlaceholder')" @keyup.enter="addSoapItem('soapResponse')" />
                  <el-button type="primary" @click="addSoapItem('soapResponse')"><el-icon><Plus /></el-icon></el-button>
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="viewVisible" :title="$t('securityPolicy.s_WebService.viewDetail')" width="600px" class="view-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.groupName')">{{ viewData.groupName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.status')">
          <el-tag :type="viewData.rule_work ? 'success' : 'danger'" size="small">
            {{ viewData.rule_work ? $t('common.on') : $t('common.off') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.blackCmdLabel')" :span="2">
          <div v-if="viewData.head?.blackCmd?.length" class="detail-tags">
            <el-tag v-for="cmd in viewData.head.blackCmd" :key="cmd" type="warning" size="small">{{ cmd }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.whitelistIpLabel')" :span="2">
          <div v-if="viewData.head?.whitelistIp?.length" class="detail-tags">
            <el-tag v-for="ip in viewData.head.whitelistIp" :key="ip" type="success" size="small">{{ ip }}</el-tag>
          </div>
          <span v-else>{{ $t('securityPolicy.s_WebService.allAllowed') }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.soapFunLabel')" :span="2">
          <div v-if="viewData.soap?.soapFun?.length" class="detail-tags">
            <el-tag v-for="fn in viewData.soap.soapFun" :key="fn" size="small">{{ fn }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.soapParamLabel')" :span="2">
          <div v-if="viewData.soap?.soapParam?.length" class="detail-tags">
            <el-tag v-for="p in viewData.soap.soapParam" :key="p" size="small">{{ p }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.soapRequestLabel')" :span="2">
          <div v-if="viewData.soap?.soapRequest?.length" class="detail-tags">
            <el-tag v-for="r in viewData.soap.soapRequest" :key="r" type="danger" size="small">{{ r }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.soapCompress')">
          <el-tag :type="viewData.soap?.soapCompress ? 'success' : 'info'" size="small">
            {{ viewData.soap?.soapCompress ? $t('common.on') : $t('common.off') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('securityPolicy.s_WebService.soapResponseLabel')">
          <div v-if="viewData.soap?.soapResponse?.length" class="detail-tags">
            <el-tag v-for="r in viewData.soap.soapResponse" :key="r" type="danger" size="small">{{ r }}</el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Connection, Plus, InfoFilled, View, Edit, Delete, Setting, Monitor } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// ==================== 类型 ====================
interface HeadData { blackCmd: string[]; whitelistIp: string[] }
interface SoapData { soapFun: string[]; soapParam: string[]; soapRequest: string[]; soapResponse: string[]; soapCompress: boolean }
interface WsRule { id: string; groupName: string; rule_work: boolean; head: HeadData; soap: SoapData }

// ==================== 选项 ====================
const groupOptions = ['opc_group_1', 'opc_group_2', 'admin_group', 'user_group']
const httpCommands = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'CONNECT', 'TRACE']

// ==================== 状态 ====================
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')
const newIp = ref('')
const newSoapFun = ref('')
const newSoapParam = ref('')
const newSoapRequest = ref('')
const newSoapResponse = ref('')

// ==================== 模拟数据 ====================
const mockData = ref<WsRule[]>([
  {
    id: '1', groupName: 'opc_group_1', rule_work: true,
    head: { blackCmd: ['GET', 'POST'], whitelistIp: ['192.168.1.100', '192.168.1.101'] },
    soap: { soapFun: ['GetUser', 'AddUser'], soapParam: ['userId', 'userName'], soapRequest: ['<password>'], soapResponse: ['<token>'], soapCompress: true }
  },
  {
    id: '2', groupName: 'admin_group', rule_work: true,
    head: { blackCmd: ['DELETE'], whitelistIp: [] },
    soap: { soapFun: ['ManageConfig'], soapParam: [], soapRequest: [], soapResponse: ['<secret>'], soapCompress: false }
  },
  {
    id: '3', groupName: 'opc_group_2', rule_work: false,
    head: { blackCmd: [], whitelistIp: ['10.0.0.1'] },
    soap: { soapFun: [], soapParam: [], soapRequest: [], soapResponse: [], soapCompress: true }
  }
])

const tableData = ref<WsRule[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ==================== 表单 ====================
const formData = reactive({
  groupName: '',
  rule_work: true,
  head: { blackCmd: [] as string[], whitelistIp: [] as string[] },
  soap: { soapFun: [] as string[], soapParam: [] as string[], soapRequest: [] as string[], soapResponse: [] as string[], soapCompress: true }
})
const viewData = ref<WsRule>({
  id: '', groupName: '', rule_work: false,
  head: { blackCmd: [], whitelistIp: [] },
  soap: { soapFun: [], soapParam: [], soapRequest: [], soapResponse: [], soapCompress: true }
})

const formRules: FormRules = {
  groupName: [{ required: true, message: t('securityPolicy.s_WebService.groupNameRequired'), trigger: 'change' }]
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

// ==================== IP操作 ====================
const isIPv4 = (v: string) => /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/.test(v)

const addIp = () => {
  const val = newIp.value.trim()
  if (!val) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.emptyContent'), type: 'warning' }); return }
  if (!isIPv4(val)) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.ipv4Format'), type: 'warning' }); return }
  if (formData.head.whitelistIp.includes(val)) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.duplicateContent'), type: 'warning' }); return }
  formData.head.whitelistIp.push(val)
  newIp.value = ''
}

const removeIp = (ip: string) => {
  formData.head.whitelistIp = formData.head.whitelistIp.filter(i => i !== ip)
}

const addSoapItem = (field: string) => {
  const inputRefs: Record<string, Ref<string>> = { soapFun: newSoapFun, soapParam: newSoapParam, soapRequest: newSoapRequest, soapResponse: newSoapResponse }
  const inputRef = inputRefs[field]
  if (!inputRef) return
  const val = inputRef.value.trim()
  if (!val) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.emptyContent'), type: 'warning' }); return }
  if (val.length > 200) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.soapFieldHint'), type: 'warning' }); return }
  const arr = formData.soap[field as keyof typeof formData.soap] as unknown as string[]
  if (arr.includes(val)) { ElNotification({ title: t('common.warning'), message: t('securityPolicy.s_WebService.duplicateContent'), type: 'warning' }); return }
  arr.push(val)
  inputRef.value = ''
}

const removeSoapItem = (field: string, item: string) => {
  const arr = formData.soap[field as keyof typeof formData.soap] as unknown as string[]
  const idx = arr.indexOf(item)
  if (idx !== -1) arr.splice(idx, 1)
}

// ==================== 操作 ====================
const resetForm = () => {
  formData.groupName = ''; formData.rule_work = true
  formData.head = { blackCmd: [], whitelistIp: [] }
  formData.soap = { soapFun: [], soapParam: [], soapRequest: [], soapResponse: [], soapCompress: true }
  editingId.value = ''; newIp.value = ''
  newSoapFun.value = ''; newSoapParam.value = ''
  newSoapRequest.value = ''; newSoapResponse.value = ''
}

const handleAdd = () => { isEdit.value = false; resetForm(); dialogVisible.value = true }

const handleView = (row: WsRule) => {
  viewData.value = {
    id: row.id, groupName: row.groupName, rule_work: row.rule_work,
    head: { blackCmd: [...row.head.blackCmd], whitelistIp: [...row.head.whitelistIp] },
    soap: { soapFun: [...row.soap.soapFun], soapParam: [...row.soap.soapParam], soapRequest: [...row.soap.soapRequest], soapResponse: [...row.soap.soapResponse], soapCompress: row.soap.soapCompress }
  }
  viewVisible.value = true
}

const handleEdit = (row: WsRule) => {
  isEdit.value = true; editingId.value = row.id
  formData.groupName = row.groupName; formData.rule_work = row.rule_work
  formData.head = { blackCmd: [...row.head.blackCmd], whitelistIp: [...row.head.whitelistIp] }
  formData.soap = { soapFun: [...row.soap.soapFun], soapParam: [...row.soap.soapParam], soapRequest: [...row.soap.soapRequest], soapResponse: [...row.soap.soapResponse], soapCompress: row.soap.soapCompress }
  newIp.value = ''; dialogVisible.value = true
}

const handleDelete = async (row: WsRule) => {
  try {
    await ElMessageBox.confirm(t('securityPolicy.s_WebService.deleteConfirm', { name: row.groupName }), t('common.confirm'), { type: 'warning' })
    mockData.value = mockData.value.filter(item => item.id !== row.id)
    fetchList()
    ElNotification({ title: t('common.success'), message: t('securityPolicy.s_WebService.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch { /* cancel */ }
}

const handleToggleStatus = (_row: WsRule) => {
  ElNotification({ title: t('common.success'), message: t('securityPolicy.s_WebService.editSuccess'), type: 'success', customClass: 'notification-success' })
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const idx = mockData.value.findIndex(item => item.id === editingId.value)
        if (idx !== -1) {
          mockData.value[idx] = {
            id: editingId.value, groupName: formData.groupName, rule_work: formData.rule_work,
            head: { blackCmd: [...formData.head.blackCmd], whitelistIp: [...formData.head.whitelistIp] },
            soap: { soapFun: [...formData.soap.soapFun], soapParam: [...formData.soap.soapParam], soapRequest: [...formData.soap.soapRequest], soapResponse: [...formData.soap.soapResponse], soapCompress: formData.soap.soapCompress }
          }
        }
      } else {
        mockData.value.push({
          id: Date.now().toString(), groupName: formData.groupName, rule_work: formData.rule_work,
          head: { blackCmd: [...formData.head.blackCmd], whitelistIp: [...formData.head.whitelistIp] },
          soap: { soapFun: [...formData.soap.soapFun], soapParam: [...formData.soap.soapParam], soapRequest: [...formData.soap.soapRequest], soapResponse: [...formData.soap.soapResponse], soapCompress: formData.soap.soapCompress }
        })
      }
      submitLoading.value = false; dialogVisible.value = false
      ElNotification({ title: t('common.success'), message: isEdit.value ? t('securityPolicy.s_WebService.editSuccess') : t('securityPolicy.s_WebService.addSuccess'), type: 'success', customClass: 'notification-success' })
      fetchList()
    }, 500)
  })
}

fetchList()
</script>

<style scoped>
.webservice-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 12px; margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}
.header-left { display: flex; align-items: center; color: white; }
.header-icon {
  width: 36px; height: 36px; background: rgba(255, 255, 255, 0.2);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  margin-right: 12px; font-size: 18px;
}
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; }
.btn-add:hover { background: rgba(255, 255, 255, 0.3); }

/* ========== 页面描述 ========== */
.page-describe {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px; margin-bottom: 16px; color: #606266; font-size: 14px;
}
.describe-icon { color: #409EFF; font-size: 16px; }

/* ========== 主卡片 ========== */
.main-card {
  background: white; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}
.card-content { padding: 24px 28px; }

/* ========== 表格 ========== */
.ws-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600; color: #303133; padding: 14px 12px;
}
.ws-table :deep(.el-table td.el-table__cell) { padding: 14px 12px; }
.ws-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}
.group-name { font-weight: 600; color: #409EFF; }
.tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
.badge-tag { font-size: 12px; }
.soap-tag { background: rgba(64, 158, 255, 0.08); border-color: rgba(64, 158, 255, 0.2); color: #409EFF; }
.empty-text { color: #c0c4cc; }
.action-btns { display: flex; gap: 6px; }
.pagination-wrapper {
  display: flex; justify-content: flex-end; margin-top: 20px;
  padding-top: 16px; border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 对话框 ========== */
.form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0; padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}
.form-dialog :deep(.el-dialog__body) { padding: 24px; max-height: 65vh; overflow-y: auto; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid rgba(64, 158, 255, 0.1); padding: 16px 20px; }
.form-content { max-width: 100%; }

/* ========== 三栏表单 ========== */
.form-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.form-col {
  padding: 16px; background: rgba(64, 158, 255, 0.02);
  border-radius: 10px; border: 1px solid rgba(64, 158, 255, 0.06);
}
.col-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px; padding-bottom: 10px;
  border-bottom: 2px solid; border-image: linear-gradient(90deg, #409EFF, #67C23A) 1;
  font-size: 14px; font-weight: 600; color: #409EFF;
}
.field-hint { font-size: 11px; color: #909399; margin-left: 6px; font-weight: normal; }

/* ========== 标签输入 ========== */
.tag-input-wrapper { width: 100%; }
.tag-list-box {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
  min-height: 32px; padding: 8px;
  background: rgba(64, 158, 255, 0.02); border-radius: 6px; border: 1px solid #dcdfe6;
}
.empty-hint { color: #c0c4cc; font-size: 13px; }
.input-row { display: flex; gap: 8px; }
.input-row :deep(.el-input) { flex: 1; }

/* ========== 查看对话框 ========== */
.view-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}
.detail-tags { display: flex; flex-wrap: wrap; gap: 4px; }

/* ========== 底部按钮 ========== */
.dialog-footer { display: flex; justify-content: center; gap: 12px; }

/* ========== 响应式 ========== */
@media (max-width: 1000px) {
  .form-columns { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px) {
  .form-columns { grid-template-columns: 1fr; }
}
</style>
