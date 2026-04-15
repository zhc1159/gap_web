<template>
  <div class="page-container route-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Guide /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.routeShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.routeShow.btn.add') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.routeShow.describe') }}</span>
    </div>

    <!-- 主内容 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <el-tabs v-model="activeTab" class="network-tabs">
            <!-- 内网路由 -->
            <el-tab-pane :label="$t('systemManage.routeShow.innerTab')" name="inner">
              <div v-if="innerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.routeShow.selectedCount', { count: innerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('inner')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="innerTableRef" :data="innerRouteList" v-loading="loading" class="route-table" stripe @selection-change="(rows: RouteEntry[]) => innerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.routeShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.routeShow.table.destination')" prop="dIp" min-width="220">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.dIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.gateway')" prop="gateIp" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.gateIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.interface')" prop="inter_device" min-width="150" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ row.inter_device }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.routeShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row, 'inner')">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.routeShow.btn.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="innerPagination.page"
                  v-model:page-size="innerPagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="innerPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="(size: number) => { innerPagination.pageSize = size }"
                  @current-change="(page: number) => { innerPagination.page = page }"
                />
              </div>
            </el-tab-pane>

            <!-- 外网路由 -->
            <el-tab-pane :label="$t('systemManage.routeShow.outerTab')" name="outer">
              <div v-if="outerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.routeShow.selectedCount', { count: outerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('outer')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="outerTableRef" :data="outerRouteList" v-loading="loading" class="route-table" stripe @selection-change="(rows: RouteEntry[]) => outerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.routeShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.routeShow.table.destination')" prop="dIp" min-width="220">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.dIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.gateway')" prop="gateIp" min-width="180">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.gateIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.interface')" prop="inter_device" min-width="150" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ row.inter_device }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.routeShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.routeShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row, 'outer')">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.routeShow.btn.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="outerPagination.page"
                  v-model:page-size="outerPagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="outerPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="(size: number) => { outerPagination.pageSize = size }"
                  @current-change="(page: number) => { outerPagination.page = page }"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? $t('systemManage.routeShow.dialogAddTitle') : $t('systemManage.routeShow.dialogEditTitle')" width="520px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" label-position="right">
        <el-form-item v-if="dialogMode === 'add'" :label="$t('systemManage.routeShow.form.zone')" prop="zone">
          <el-select v-model="formData.zone" :placeholder="$t('systemManage.routeShow.form.zonePlaceholder')">
            <el-option :label="$t('systemManage.routeShow.innerTab')" value="inner" />
            <el-option :label="$t('systemManage.routeShow.outerTab')" value="outer" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.routeShow.form.destination')" prop="dIp">
          <el-input v-model="formData.dIp" :placeholder="$t('systemManage.routeShow.form.destinationPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.routeShow.form.gateway')" prop="gateIp">
          <el-input v-model="formData.gateIp" :placeholder="$t('systemManage.routeShow.form.gatewayPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.routeShow.form.interface')" prop="inter_device">
          <el-select v-model="formData.inter_device" :placeholder="$t('systemManage.routeShow.form.interfacePlaceholder')">
            <el-option v-for="item in interfaceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('systemManage.routeShow.btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('systemManage.routeShow.btn.submit') }}</el-button>
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
  Guide,
  InfoFilled,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 路由条目
interface RouteEntry {
  id: number
  dIp: string
  gateIp: string
  inter_device: string
}

// 状态
const loading = ref(false)
const activeTab = ref('inner')
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const innerTableRef = ref()
const outerTableRef = ref()
const innerSelectedRows = ref<RouteEntry[]>([])
const outerSelectedRows = ref<RouteEntry[]>([])

const innerPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const outerPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const formData = reactive({
  id: 0,
  zone: 'inner' as 'inner' | 'outer',
  dIp: '',
  gateIp: '',
  inter_device: ''
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

// Mock内网路由数据
const innerRouteList = ref<RouteEntry[]>([
  { id: 1, dIp: '192.168.1.0/24', gateIp: '192.168.1.1', inter_device: 'eth0' },
  { id: 2, dIp: '10.0.0.0/8', gateIp: '10.0.0.1', inter_device: 'eth1' },
  { id: 3, dIp: '172.16.0.0/16', gateIp: '172.16.0.1', inter_device: 'bond0' },
  { id: 4, dIp: '0.0.0.0/0', gateIp: '192.168.1.254', inter_device: 'eth0' }
])

// Mock外网路由数据
const outerRouteList = ref<RouteEntry[]>([
  { id: 5, dIp: '202.100.10.0/24', gateIp: '202.100.10.1', inter_device: 'eth3' },
  { id: 6, dIp: '202.100.20.0/24', gateIp: '202.100.20.1', inter_device: 'eth4' },
  { id: 7, dIp: '0.0.0.0/0', gateIp: '202.100.10.254', inter_device: 'eth3' }
])

// 验证
const isValidIpOrCidr = (value: string) => {
  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  const cidrRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\/(3[0-2]|[12]?\d)$/
  return ipRegex.test(value) || cidrRegex.test(value)
}
const isValidIp = (ip: string) => /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)

const formRules = computed<FormRules>(() => ({
  zone: [
    { required: true, message: t('systemManage.routeShow.validation.zoneRequired'), trigger: 'change' }
  ],
  dIp: [
    { required: true, message: t('systemManage.routeShow.validation.destinationRequired'), trigger: 'blur' },
    { validator: (_r: any, v: string, cb: any) => { v && !isValidIpOrCidr(v) ? cb(new Error(t('systemManage.routeShow.validation.destinationInvalid'))) : cb() }, trigger: 'blur' }
  ],
  gateIp: [
    { required: true, message: t('systemManage.routeShow.validation.gatewayRequired'), trigger: 'blur' },
    { validator: (_r: any, v: string, cb: any) => { v && !isValidIp(v) ? cb(new Error(t('systemManage.routeShow.validation.gatewayInvalid'))) : cb() }, trigger: 'blur' }
  ],
  inter_device: [
    { required: true, message: t('systemManage.routeShow.validation.interfaceRequired'), trigger: 'change' }
  ]
}))

// 获取当前列表
function getCurrentList() {
  return activeTab.value === 'inner' ? innerRouteList : outerRouteList
}

// 新增
function openAddDialog() {
  dialogMode.value = 'add'
  formData.id = 0
  formData.zone = 'inner'
  formData.dIp = ''
  formData.gateIp = ''
  formData.inter_device = ''
  dialogVisible.value = true
}

// 编辑
function openEditDialog(row: RouteEntry) {
  dialogMode.value = 'edit'
  formData.id = row.id
  formData.dIp = row.dIp
  formData.gateIp = row.gateIp
  formData.inter_device = row.inter_device
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (dialogMode.value === 'add') {
    const list = formData.zone === 'outer' ? outerRouteList : innerRouteList
    const newId = Math.max(...list.value.map(v => v.id), 0) + 1
    list.value.push({
      id: newId,
      dIp: formData.dIp,
      gateIp: formData.gateIp,
      inter_device: formData.inter_device
    })
  } else {
    const list = getCurrentList()
    const item = list.value.find(v => v.id === formData.id)
    if (item) {
      item.dIp = formData.dIp
      item.gateIp = formData.gateIp
      item.inter_device = formData.inter_device
    }
  }
  dialogVisible.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.routeShow.msg.submitSuccess'), type: 'success', customClass: 'notification-success' })
}

// 删除
async function handleDelete(row: RouteEntry, _tab: string) {
  try {
    await ElMessageBox.confirm(t('systemManage.routeShow.confirm.delete'), t('common.confirm'), { type: 'warning' })
    const list = getCurrentList()
    list.value = list.value.filter(v => v.id !== row.id)
    ElNotification({ title: t('common.success'), message: t('systemManage.routeShow.msg.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 批量删除
async function handleBatchDelete(tab: 'inner' | 'outer') {
  const selectedRows = tab === 'inner' ? innerSelectedRows : outerSelectedRows
  try {
    await ElMessageBox.confirm(
      t('systemManage.routeShow.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const ids = selectedRows.value.map(row => row.id)
    const list = tab === 'inner' ? innerRouteList : outerRouteList
    list.value = list.value.filter(v => !ids.includes(v.id))
    selectedRows.value = []
    ElNotification({ title: t('common.success'), message: t('systemManage.routeShow.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

onMounted(() => {
  innerPagination.total = innerRouteList.value.length
  outerPagination.total = outerRouteList.value.length
})
</script>

<style scoped>
.route-page {
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
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
.route-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 8px;
}

.route-table :deep(.el-table td.el-table__cell) {
  padding: 14px 8px;
}

.route-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}
</style>
