<template>
  <div class="page-container vlan-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Share /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.vlanShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.vlanShow.btn.add') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.vlanShow.describe') }}</span>
    </div>

    <!-- 主内容 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <el-tabs v-model="activeTab" class="network-tabs">
            <!-- 内网虚网 -->
            <el-tab-pane :label="$t('systemManage.vlanShow.innerTab')" name="inner">
              <div v-if="innerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.vlanShow.selectedCount', { count: innerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('inner')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="innerTableRef" :data="innerVlanList" v-loading="loading" class="vlan-table" stripe @selection-change="(rows: VlanEntry[]) => innerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.vlanShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.vlanShow.table.networkAddress')" prop="ipaddr" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.ipaddr }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.subnetMask')" prop="ipmask" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.ipmask }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.interface')" prop="inter_device" min-width="150" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ row.inter_device }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.vlanId')" prop="virtual_num" width="120" align="center">
                  <template #default="{ row }">
                    <span class="vlan-id-badge">VLAN {{ row.virtual_num }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.vlanShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row, 'inner')">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.vlanShow.btn.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 外网虚网 -->
            <el-tab-pane :label="$t('systemManage.vlanShow.outerTab')" name="outer">
              <div v-if="outerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.vlanShow.selectedCount', { count: outerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('outer')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="outerTableRef" :data="outerVlanList" v-loading="loading" class="vlan-table" stripe @selection-change="(rows: VlanEntry[]) => outerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.vlanShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.vlanShow.table.networkAddress')" prop="ipaddr" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.ipaddr }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.subnetMask')" prop="ipmask" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.ipmask }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.interface')" prop="inter_device" min-width="150" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ row.inter_device }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.vlanId')" prop="virtual_num" width="120" align="center">
                  <template #default="{ row }">
                    <span class="vlan-id-badge">VLAN {{ row.virtual_num }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.vlanShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.vlanShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row, 'outer')">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.vlanShow.btn.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? $t('systemManage.vlanShow.dialogAddTitle') : $t('systemManage.vlanShow.dialogEditTitle')" width="520px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" label-position="right">
        <el-form-item v-if="dialogMode === 'add'" :label="$t('systemManage.vlanShow.form.zone')" prop="zone">
          <el-select v-model="formData.zone" :placeholder="$t('systemManage.vlanShow.form.zonePlaceholder')">
            <el-option :label="$t('systemManage.vlanShow.innerTab')" value="inner" />
            <el-option :label="$t('systemManage.vlanShow.outerTab')" value="outer" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.vlanShow.form.networkAddress')" prop="ipaddr">
          <el-input v-model="formData.ipaddr" :placeholder="$t('systemManage.vlanShow.form.networkAddressPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.vlanShow.form.subnetMask')" prop="ipmask">
          <el-input v-model="formData.ipmask" :placeholder="$t('systemManage.vlanShow.form.subnetMaskPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.vlanShow.form.interface')" prop="inter_device">
          <el-select v-model="formData.inter_device" :placeholder="$t('systemManage.vlanShow.form.interfacePlaceholder')">
            <el-option v-for="item in interfaceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.vlanShow.form.vlanId')" prop="virtual_num">
          <el-input v-model="formData.virtual_num" :placeholder="$t('systemManage.vlanShow.form.vlanIdPlaceholder')" type="number" />
          <div class="form-help">{{ $t('systemManage.vlanShow.form.vlanIdRange') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('systemManage.vlanShow.btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('systemManage.vlanShow.btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Share,
  InfoFilled,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'

const { t } = useI18n()

// VLAN条目
interface VlanEntry {
  id: number
  ipaddr: string
  ipmask: string
  inter_device: string
  virtual_num: number
}

// 状态
const loading = ref(false)
const activeTab = ref('inner')
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const innerTableRef = ref()
const outerTableRef = ref()
const innerSelectedRows = ref<VlanEntry[]>([])
const outerSelectedRows = ref<VlanEntry[]>([])

const formData = reactive({
  id: 0,
  zone: 'inner' as 'inner' | 'outer',
  ipaddr: '',
  ipmask: '',
  inter_device: '',
  virtual_num: '' as string | number
})

// 接口选项
const interfaceOptions = ref([
  { label: 'eth0', value: 'eth0' },
  { label: 'eth1', value: 'eth1' },
  { label: 'eth2', value: 'eth2' },
  { label: 'eth3', value: 'eth3' },
  { label: 'eth4', value: 'eth4' },
  { label: 'bond0', value: 'bond0' },
  { label: 'lo', value: 'lo' }
])

// Mock内网VLAN数据
const innerVlanList = ref<VlanEntry[]>([
  { id: 1, ipaddr: '192.168.10.0', ipmask: '255.255.255.0', inter_device: 'eth0', virtual_num: 10 },
  { id: 2, ipaddr: '192.168.20.0', ipmask: '255.255.255.0', inter_device: 'eth1', virtual_num: 20 },
  { id: 3, ipaddr: '10.10.10.0', ipmask: '255.255.0.0', inter_device: 'bond0', virtual_num: 100 },
  { id: 4, ipaddr: '172.16.5.0', ipmask: '255.255.255.128', inter_device: 'eth0', virtual_num: 50 }
])

// Mock外网VLAN数据
const outerVlanList = ref<VlanEntry[]>([
  { id: 5, ipaddr: '202.100.10.0', ipmask: '255.255.255.0', inter_device: 'eth3', virtual_num: 110 },
  { id: 6, ipaddr: '202.100.20.0', ipmask: '255.255.255.0', inter_device: 'eth4', virtual_num: 120 }
])

// 验证
const isValidIpv4 = (ip: string) => /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)
const isValidMask = (mask: string) => {
  if (!isValidIpv4(mask)) return false
  const binary = mask.split('.').map(Number).map(o => o.toString(2).padStart(8, '0')).join('')
  return /^1*0*$/.test(binary) && binary.includes('1') && binary.includes('0')
}

const formRules = computed<FormRules>(() => ({
  zone: [
    { required: true, message: t('systemManage.vlanShow.validation.zoneRequired'), trigger: 'change' }
  ],
  ipaddr: [
    { required: true, message: t('systemManage.vlanShow.validation.networkAddressRequired'), trigger: 'blur' },
    { validator: (_r: any, v: string, cb: any) => { v && !isValidIpv4(v) ? cb(new Error(t('systemManage.vlanShow.validation.networkAddressInvalid'))) : cb() }, trigger: 'blur' }
  ],
  ipmask: [
    { required: true, message: t('systemManage.vlanShow.validation.subnetMaskRequired'), trigger: 'blur' },
    { validator: (_r: any, v: string, cb: any) => { v && !isValidMask(v) ? cb(new Error(t('systemManage.vlanShow.validation.subnetMaskInvalid'))) : cb() }, trigger: 'blur' }
  ],
  inter_device: [
    { required: true, message: t('systemManage.vlanShow.validation.interfaceRequired'), trigger: 'change' }
  ],
  virtual_num: [
    { required: true, message: t('systemManage.vlanShow.validation.vlanIdRequired'), trigger: 'blur' },
    { validator: (_r: any, v: any, cb: any) => {
      const n = Number(v)
      !Number.isInteger(n) ? cb(new Error(t('systemManage.vlanShow.validation.vlanIdInteger')))
        : (n < 1 || n > 4094) ? cb(new Error(t('systemManage.vlanShow.validation.vlanIdRange')))
        : cb()
    }, trigger: 'blur' }
  ]
}))

// 获取当前列表
function getCurrentList() {
  return activeTab.value === 'inner' ? innerVlanList : outerVlanList
}

// 新增
function openAddDialog() {
  dialogMode.value = 'add'
  formData.id = 0
  formData.zone = 'inner'
  formData.ipaddr = ''
  formData.ipmask = ''
  formData.inter_device = ''
  formData.virtual_num = ''
  dialogVisible.value = true
}

// 编辑
function openEditDialog(row: VlanEntry) {
  dialogMode.value = 'edit'
  formData.id = row.id
  formData.ipaddr = row.ipaddr
  formData.ipmask = row.ipmask
  formData.inter_device = row.inter_device
  formData.virtual_num = row.virtual_num
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (dialogMode.value === 'add') {
    const list = formData.zone === 'outer' ? outerVlanList : innerVlanList
    const newId = Math.max(...list.value.map(v => v.id), 0) + 1
    list.value.push({
      id: newId,
      ipaddr: formData.ipaddr,
      ipmask: formData.ipmask,
      inter_device: formData.inter_device,
      virtual_num: Number(formData.virtual_num)
    })
  } else {
    const list = getCurrentList()
    const item = list.value.find(v => v.id === formData.id)
    if (item) {
      item.ipaddr = formData.ipaddr
      item.ipmask = formData.ipmask
      item.inter_device = formData.inter_device
      item.virtual_num = Number(formData.virtual_num)
    }
  }
  dialogVisible.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.vlanShow.msg.submitSuccess'), type: 'success', customClass: 'notification-success' })
}

// 删除
async function handleDelete(row: VlanEntry, _tab: string) {
  try {
    await ElMessageBox.confirm(t('systemManage.vlanShow.confirm.delete'), t('common.confirm'), { type: 'warning' })
    const list = getCurrentList()
    list.value = list.value.filter(v => v.id !== row.id)
    ElNotification({ title: t('common.success'), message: t('systemManage.vlanShow.msg.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 批量删除
async function handleBatchDelete(tab: 'inner' | 'outer') {
  const selectedRows = tab === 'inner' ? innerSelectedRows : outerSelectedRows
  try {
    await ElMessageBox.confirm(
      t('systemManage.vlanShow.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    const list = tab === 'inner' ? innerVlanList : outerVlanList
    list.value = list.value.filter(v => !ids.includes(v.id))
    selectedRows.value = []
    ElNotification({ title: t('common.success'), message: t('systemManage.vlanShow.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.vlan-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
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

.header-right .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.header-right .el-button:hover {
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

/* 内容 */
.content-wrapper {
  flex: 1;
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

.main-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 20px;
}

/* Tab样式 */
.network-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
}

.network-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

/* 表格样式 */
.vlan-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 8px;
}

.vlan-table :deep(.el-table td.el-table__cell) {
  padding: 14px 8px;
}

.vlan-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

/* VLAN ID徽章 */
.vlan-id-badge {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
  border: 1px solid rgba(64, 158, 255, 0.25);
  color: #409EFF;
  padding: 2px 10px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-weight: 600;
  font-size: 13px;
}

/* 表单帮助 */
.form-help {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
