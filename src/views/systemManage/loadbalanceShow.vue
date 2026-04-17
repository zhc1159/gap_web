<template>
  <div class="page-container loadbalance-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.loadbalanceShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.loadbalanceShow.addRule') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.loadbalanceShow.describe') }}</span>
    </div>

    <!-- 主内容 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <el-tabs v-model="activeTab" class="network-tabs">
            <!-- 内网负载均衡 -->
            <el-tab-pane :label="$t('systemManage.loadbalanceShow.innerTab')" name="inner">
              <div v-if="innerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.loadbalanceShow.selectedCount', { count: innerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('inner')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="innerTableRef" :data="innerList" v-loading="innerLoading" class="lb-table" stripe @selection-change="(rows: LoadbalanceRule[]) => innerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.floatIp')" prop="floatIp" min-width="150">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.floatIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.floatPort')" prop="floatPort" width="110" align="center" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.protocolType')" prop="protocolType" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.protocolType === 'tcp' ? '' : 'warning'" size="small" effect="plain">
                      {{ row.protocolType.toUpperCase() }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.algoType')" width="140" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ getAlgoLabel(row.algoType) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.detail')" width="100" align="center">
                  <template #default="{ row }">
                    <el-button size="small" class="btn-detail" @click="showDetail(row)">
                      <el-icon><InfoFilled /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.detailBtn') }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.editRule') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row)">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.deleteRule') }}
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

            <!-- 外网负载均衡 -->
            <el-tab-pane :label="$t('systemManage.loadbalanceShow.outerTab')" name="outer">
              <div v-if="outerSelectedRows.length > 0" class="batch-bar">
                <span class="batch-info">{{ $t('systemManage.loadbalanceShow.selectedCount', { count: outerSelectedRows.length }) }}</span>
                <el-button type="danger" size="small" @click="handleBatchDelete('outer')">
                  <el-icon><Delete /></el-icon>
                  {{ $t('common.delete') }}
                </el-button>
              </div>
              <el-table ref="outerTableRef" :data="outerList" v-loading="outerLoading" class="lb-table" stripe @selection-change="(rows: LoadbalanceRule[]) => outerSelectedRows = rows">
                <el-table-column type="selection" width="45" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.floatIp')" prop="floatIp" min-width="150">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.floatIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.floatPort')" prop="floatPort" width="110" align="center" />
                <el-table-column :label="$t('systemManage.loadbalanceShow.protocolType')" prop="protocolType" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.protocolType === 'tcp' ? '' : 'warning'" size="small" effect="plain">
                      {{ row.protocolType.toUpperCase() }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.algoType')" width="140" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ getAlgoLabel(row.algoType) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.detail')" width="100" align="center">
                  <template #default="{ row }">
                    <el-button size="small" class="btn-detail" @click="showDetail(row)">
                      <el-icon><InfoFilled /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.detailBtn') }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.loadbalanceShow.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.editRule') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row)">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.loadbalanceShow.deleteRule') }}
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
    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? $t('systemManage.loadbalanceShow.editTitle') : $t('systemManage.loadbalanceShow.addTitle')"
      width="640px"
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="130px">
        <el-form-item v-if="!isEdit" :label="$t('systemManage.loadbalanceShow.zoneLabel')" prop="zone">
          <el-select v-model="editForm.zone" :placeholder="$t('systemManage.loadbalanceShow.zonePlaceholder')">
            <el-option :label="$t('systemManage.loadbalanceShow.innerTab')" value="inner" />
            <el-option :label="$t('systemManage.loadbalanceShow.outerTab')" value="outer" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.loadbalanceShow.protocolLabel')" prop="protocolType">
          <el-select v-model="editForm.protocolType" :placeholder="$t('systemManage.loadbalanceShow.protocolPlaceholder')" style="width: 100%">
            <el-option value="tcp" label="TCP" />
            <el-option value="udp" label="UDP" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.loadbalanceShow.algoLabel')" prop="algoType">
          <el-select v-model="editForm.algoType" :placeholder="$t('systemManage.loadbalanceShow.algoPlaceholder')" style="width: 100%">
            <el-option value="rr" :label="$t('systemManage.loadbalanceShow.algoRR')" />
            <el-option value="lc" :label="$t('systemManage.loadbalanceShow.algoLC')" />
            <el-option value="sh" :label="$t('systemManage.loadbalanceShow.algoSH')" />
          </el-select>
        </el-form-item>
        <div class="inline-fields">
          <el-form-item :label="$t('systemManage.loadbalanceShow.floatIpLabel')" prop="floatIp" class="inline-form-item">
            <el-select v-model="editForm.floatIp" :placeholder="$t('systemManage.loadbalanceShow.floatIpPlaceholder')" style="width: 100%">
              <el-option v-for="ip in virtualIps" :key="ip" :label="ip" :value="ip" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('systemManage.loadbalanceShow.floatPortLabel')" prop="floatPort" class="inline-form-item">
            <el-input v-model="editForm.floatPort" :placeholder="$t('systemManage.loadbalanceShow.floatPortPlaceholder')" />
          </el-form-item>
        </div>

        <div class="tech-divider"></div>

        <div v-for="(row, idx) in editForm.realIpRows" :key="idx" class="real-ip-row">
          <el-form-item
            :label="`${$t('systemManage.loadbalanceShow.realIp')} ${idx + 1}`"
            :prop="`realIpRows.${idx}.ip`"
            :rules="realIpRules"
            class="inline-form-item"
          >
            <el-input v-model="row.ip" :placeholder="$t('systemManage.loadbalanceShow.realIpPlaceholder')" />
          </el-form-item>
          <el-form-item
            :label="$t('systemManage.loadbalanceShow.realPort')"
            :prop="`realIpRows.${idx}.port`"
            :rules="realPortRules"
            class="inline-form-item port-item"
          >
            <el-input v-model="row.port" :placeholder="$t('systemManage.loadbalanceShow.realPortPlaceholder')" />
          </el-form-item>
          <el-button type="danger" size="small" circle @click="removeRealIpRow(idx)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <el-button type="primary" size="small" @click="addRealIpRow">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.loadbalanceShow.addRealIp') }}
        </el-button>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('systemManage.loadbalanceShow.detailTitle')"
      width="720px"
    >
      <el-table :data="currentDetail" class="lb-table" stripe>
        <el-table-column prop="ip" :label="$t('systemManage.loadbalanceShow.serverIp')" min-width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="port" :label="$t('systemManage.loadbalanceShow.serverPort')" width="100" align="center" />
        <el-table-column prop="weight" :label="$t('systemManage.loadbalanceShow.serverWeight')" width="80" align="center" />
        <el-table-column prop="connNum" :label="$t('systemManage.loadbalanceShow.serverConn')" width="100" align="center" />
        <el-table-column prop="historyConn" :label="$t('systemManage.loadbalanceShow.serverHistory')" width="120" align="center" />
        <el-table-column prop="status" :label="$t('systemManage.loadbalanceShow.serverStatus')" width="110" align="center">
          <template #default="{ row }">
            <span class="status-indicator">
              <span class="status-dot" :class="row.status === 'UP' ? 'success' : 'error'"></span>
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Connection,
  InfoFilled,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ==================== Types ====================
interface RealServer {
  ip: string
  port: string
  weight: string
  connNum: string
  historyConn: string
  status: string
}

interface LoadbalanceRule {
  uuid: string
  floatIp: string
  floatPort: string
  protocolType: 'tcp' | 'udp'
  algoType: 'rr' | 'lc' | 'sh'
  realList: RealServer[]
}

interface RealIpRow {
  ip: string
  port: string
}

// ==================== State ====================
const activeTab = ref('inner')
const virtualIps = ['10.0.0.100', '10.0.0.200', '10.0.0.150']

const innerLoading = ref(false)
const outerLoading = ref(false)
const innerTableRef = ref()
const outerTableRef = ref()
const innerSelectedRows = ref<LoadbalanceRule[]>([])
const outerSelectedRows = ref<LoadbalanceRule[]>([])

const innerPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const outerPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const innerList = ref<LoadbalanceRule[]>([
  {
    uuid: 'uuid-inner-1',
    floatIp: '10.0.0.100',
    floatPort: '80',
    protocolType: 'tcp',
    algoType: 'rr',
    realList: [
      { ip: '192.168.1.10', port: '8080', weight: '1', connNum: '25', historyConn: '1024', status: 'UP' },
      { ip: '192.168.1.11', port: '8080', weight: '2', connNum: '10', historyConn: '500', status: 'UP' }
    ]
  },
  {
    uuid: 'uuid-inner-2',
    floatIp: '10.0.0.200',
    floatPort: '443',
    protocolType: 'tcp',
    algoType: 'lc',
    realList: [
      { ip: '192.168.2.10', port: '8443', weight: '1', connNum: '5', historyConn: '200', status: 'UP' },
      { ip: '192.168.2.11', port: '8443', weight: '1', connNum: '0', historyConn: '150', status: 'DOWN' }
    ]
  },
  {
    uuid: 'uuid-inner-3',
    floatIp: '10.0.0.150',
    floatPort: '53',
    protocolType: 'udp',
    algoType: 'sh',
    realList: [
      { ip: '192.168.3.10', port: '53', weight: '1', connNum: '30', historyConn: '800', status: 'UP' }
    ]
  }
])

const outerList = ref<LoadbalanceRule[]>([
  {
    uuid: 'uuid-outer-1',
    floatIp: '172.16.0.100',
    floatPort: '80',
    protocolType: 'tcp',
    algoType: 'rr',
    realList: [
      { ip: '10.10.1.10', port: '80', weight: '1', connNum: '50', historyConn: '2048', status: 'UP' },
      { ip: '10.10.1.11', port: '80', weight: '1', connNum: '48', historyConn: '1900', status: 'UP' },
      { ip: '10.10.1.12', port: '80', weight: '3', connNum: '0', historyConn: '800', status: 'DOWN' }
    ]
  }
])

// ==================== Helpers ====================
function getAlgoLabel(value: string): string {
  const map: Record<string, string> = {
    rr: t('systemManage.loadbalanceShow.algoRR'),
    lc: t('systemManage.loadbalanceShow.algoLC'),
    sh: t('systemManage.loadbalanceShow.algoSH')
  }
  return map[value] || value
}

function getCurrentList() {
  return activeTab.value === 'inner' ? innerList : outerList
}

// ==================== Edit Dialog ====================
const editDialogVisible = ref(false)
const isEdit = ref(false)
const editFormRef = ref<FormInstance>()
const currentRow = ref<LoadbalanceRule | null>(null)

const editForm = reactive({
  zone: 'inner' as 'inner' | 'outer',
  protocolType: 'tcp' as string,
  algoType: 'rr' as string,
  floatIp: '',
  floatPort: '',
  realIpRows: [] as RealIpRow[]
})

// Validators
function validatePort(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.loadbalanceShow.realPortRequired'))); return }
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1 || num > 65535) { callback(new Error(t('systemManage.loadbalanceShow.realPortInvalid'))); return }
  callback()
}

function validateFloatPort(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.loadbalanceShow.floatPortRequired'))); return }
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1 || num > 65535) { callback(new Error(t('systemManage.loadbalanceShow.floatPortInvalid'))); return }
  callback()
}

function validateIp(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.loadbalanceShow.realIpRequired'))); return }
  const regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  if (!regex.test(value)) { callback(new Error(t('systemManage.loadbalanceShow.realIpInvalid'))); return }
  callback()
}

const editFormRules = computed<FormRules>(() => ({
  zone: [{ required: true, message: t('systemManage.loadbalanceShow.zoneRequired'), trigger: 'change' }],
  protocolType: [{ required: true, message: t('systemManage.loadbalanceShow.protocolRequired'), trigger: 'change' }],
  algoType: [{ required: true, message: t('systemManage.loadbalanceShow.algoRequired'), trigger: 'change' }],
  floatIp: [{ required: true, message: t('systemManage.loadbalanceShow.floatIpRequired'), trigger: 'change' }],
  floatPort: [{ validator: validateFloatPort, trigger: 'blur' }]
}))

const realIpRules = computed(() => [{ validator: validateIp, trigger: 'blur' }])
const realPortRules = computed(() => [{ validator: validatePort, trigger: 'blur' }])

function resetEditForm(): void {
  editForm.zone = 'inner'
  editForm.protocolType = 'tcp'
  editForm.algoType = 'rr'
  editForm.floatIp = ''
  editForm.floatPort = ''
  editForm.realIpRows = [{ ip: '', port: '' }]
}

function openAddDialog(): void {
  resetEditForm()
  isEdit.value = false
  currentRow.value = null
  editDialogVisible.value = true
}

function openEditDialog(row: LoadbalanceRule): void {
  resetEditForm()
  isEdit.value = true
  currentRow.value = row
  editForm.protocolType = row.protocolType
  editForm.algoType = row.algoType
  editForm.floatIp = row.floatIp
  editForm.floatPort = row.floatPort
  editForm.realIpRows = row.realList.map(s => ({ ip: s.ip, port: s.port }))
  if (editForm.realIpRows.length === 0) {
    editForm.realIpRows = [{ ip: '', port: '' }]
  }
  editDialogVisible.value = true
}

function addRealIpRow(): void {
  editForm.realIpRows.push({ ip: '', port: '' })
}

function removeRealIpRow(idx: number): void {
  editForm.realIpRows.splice(idx, 1)
}

async function handleSubmit(): Promise<void> {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  const newRule: LoadbalanceRule = {
    uuid: isEdit.value && currentRow.value ? currentRow.value.uuid : `uuid-${Date.now()}`,
    floatIp: editForm.floatIp,
    floatPort: editForm.floatPort,
    protocolType: editForm.protocolType as 'tcp' | 'udp',
    algoType: editForm.algoType as 'rr' | 'lc' | 'sh',
    realList: editForm.realIpRows.map(r => ({
      ip: r.ip,
      port: r.port,
      weight: '1',
      connNum: '0',
      historyConn: '0',
      status: 'UP'
    }))
  }

  if (isEdit.value) {
    const list = getCurrentList()
    const idx = list.value.findIndex(item => item.uuid === currentRow.value?.uuid)
    if (idx !== -1) list.value[idx] = newRule
    ElNotification({ title: t('common.success'), message: t('systemManage.loadbalanceShow.editSuccess'), type: 'success', customClass: 'notification-success' })
  } else {
    const list = editForm.zone === 'outer' ? outerList : innerList
    list.value.push(newRule)
    ElNotification({ title: t('common.success'), message: t('systemManage.loadbalanceShow.addSuccess'), type: 'success', customClass: 'notification-success' })
  }
  editDialogVisible.value = false
}

// ==================== Delete ====================
async function handleDelete(row: LoadbalanceRule): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('systemManage.loadbalanceShow.deleteConfirm'),
      t('common.tip'),
      { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
    )
    const list = getCurrentList()
    list.value = list.value.filter(v => v.uuid !== row.uuid)
    ElNotification({ title: t('common.success'), message: t('systemManage.loadbalanceShow.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 批量删除
async function handleBatchDelete(tab: 'inner' | 'outer') {
  const selectedRows = tab === 'inner' ? innerSelectedRows : outerSelectedRows
  try {
    await ElMessageBox.confirm(
      t('systemManage.loadbalanceShow.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('common.warning'),
      { type: 'warning' }
    )
    const uuids = selectedRows.value.map(row => row.uuid)
    const list = tab === 'inner' ? innerList : outerList
    list.value = list.value.filter(v => !uuids.includes(v.uuid))
    selectedRows.value = []
    ElNotification({ title: t('common.success'), message: t('systemManage.loadbalanceShow.batchDeleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// ==================== Detail Dialog ====================
const detailDialogVisible = ref(false)
const currentDetail = ref<RealServer[]>([])

function showDetail(row: LoadbalanceRule): void {
  currentDetail.value = row.realList || []
  detailDialogVisible.value = true
}

innerPagination.total = innerList.value.length
outerPagination.total = outerList.value.length
</script>

<style scoped>
.btn-detail {
  background: #606266;
  border-color: var(--el-text-color-secondary);
  color: #fff;
}

.btn-detail:hover {
  background: #73767a;
  border-color: #73767a;
}

.loadbalance-page {
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
  color: var(--el-text-color-secondary);
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
  color: var(--el-text-color-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.main-card {
  background: var(--card-bg);
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
.lb-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 8px;
}

.lb-table :deep(.el-table td.el-table__cell) {
  padding: 14px 8px;
}

.lb-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 状态指示器 */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.success {
  background: #67C23A;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.4);
}

.status-dot.error {
  background: #F56C6C;
  box-shadow: 0 0 6px rgba(245, 108, 108, 0.4);
}

/* 弹窗表单 */
.inline-fields {
  display: flex;
  gap: 12px;
}

.inline-fields .inline-form-item {
  flex: 1;
}

.tech-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.2), rgba(103, 194, 58, 0.2), transparent);
  margin: 16px 0;
}

.real-ip-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.real-ip-row .inline-form-item {
  flex: 3;
}

.real-ip-row .port-item {
  flex: 2;
}
</style>
