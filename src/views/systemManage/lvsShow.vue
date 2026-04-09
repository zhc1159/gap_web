<template>
  <div class="page-container lvs-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.lvsShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.lvsShow.btn.add') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.lvsShow.describe') }}</span>
    </div>

    <!-- 主内容 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <el-tabs v-model="activeTab" class="network-tabs">
            <!-- 内网LVS -->
            <el-tab-pane :label="$t('systemManage.lvsShow.innerTab')" name="inner">
              <el-table :data="innerList" v-loading="innerLoading" class="lvs-table" stripe>
                <el-table-column :label="$t('systemManage.lvsShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.lvsShow.table.floatIp')" prop="floatIp" min-width="150">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.floatIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.floatPort')" prop="floatPort" width="110" align="center" />
                <el-table-column :label="$t('systemManage.lvsShow.table.protocol')" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.protocol === 'tcp' ? '' : 'warning'" size="small" effect="plain">
                      {{ row.protocol.toUpperCase() }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.algorithm')" width="180" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ getAlgoLabel(row.algorithm) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.detail')" width="100" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="showDetail(row)">
                      <el-icon><InfoFilled /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.detail') }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row)">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 外网LVS -->
            <el-tab-pane :label="$t('systemManage.lvsShow.outerTab')" name="outer">
              <el-table :data="outerList" v-loading="outerLoading" class="lvs-table" stripe>
                <el-table-column :label="$t('systemManage.lvsShow.table.index')" type="index" width="70" align="center" />
                <el-table-column :label="$t('systemManage.lvsShow.table.floatIp')" prop="floatIp" min-width="150">
                  <template #default="{ row }">
                    <span class="mono-text">{{ row.floatIp }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.floatPort')" prop="floatPort" width="110" align="center" />
                <el-table-column :label="$t('systemManage.lvsShow.table.protocol')" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.protocol === 'tcp' ? '' : 'warning'" size="small" effect="plain">
                      {{ row.protocol.toUpperCase() }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.algorithm')" width="180" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ getAlgoLabel(row.algorithm) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.detail')" width="100" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="showDetail(row)">
                      <el-icon><InfoFilled /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.detail') }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('systemManage.lvsShow.table.actions')" width="160" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" text style="color: #fff" @click="openEditDialog(row)">
                      <el-icon><Edit /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.edit') }}
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(row)">
                      <el-icon><Delete /></el-icon>
                      {{ $t('systemManage.lvsShow.btn.delete') }}
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
    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? $t('systemManage.lvsShow.dialogEditTitle') : $t('systemManage.lvsShow.dialogAddTitle')"
      width="640px"
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="130px">
        <el-form-item v-if="!isEdit" :label="$t('systemManage.lvsShow.form.zone')" prop="zone">
          <el-select v-model="editForm.zone" :placeholder="$t('systemManage.lvsShow.form.zonePlaceholder')">
            <el-option :label="$t('systemManage.lvsShow.innerTab')" value="inner" />
            <el-option :label="$t('systemManage.lvsShow.outerTab')" value="outer" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.lvsShow.form.protocol')" prop="protocol">
          <el-select v-model="editForm.protocol" :placeholder="$t('systemManage.lvsShow.form.protocolPlaceholder')" style="width: 100%">
            <el-option value="tcp" label="TCP" />
            <el-option value="udp" label="UDP" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemManage.lvsShow.form.algorithm')" prop="algorithm">
          <el-select v-model="editForm.algorithm" :placeholder="$t('systemManage.lvsShow.form.algorithmPlaceholder')" style="width: 100%">
            <el-option value="rr" :label="$t('systemManage.lvsShow.algorithm.rr')" />
            <el-option value="wrr" :label="$t('systemManage.lvsShow.algorithm.wrr')" />
            <el-option value="lc" :label="$t('systemManage.lvsShow.algorithm.lc')" />
            <el-option value="wlc" :label="$t('systemManage.lvsShow.algorithm.wlc')" />
            <el-option value="sh" :label="$t('systemManage.lvsShow.algorithm.sh')" />
            <el-option value="dh" :label="$t('systemManage.lvsShow.algorithm.dh')" />
          </el-select>
        </el-form-item>
        <div class="inline-fields">
          <el-form-item :label="$t('systemManage.lvsShow.form.floatIp')" prop="floatIp" class="inline-form-item">
            <el-select v-model="editForm.floatIp" :placeholder="$t('systemManage.lvsShow.form.floatIpPlaceholder')" style="width: 100%">
              <el-option v-for="ip in virtualIps" :key="ip" :label="ip" :value="ip" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('systemManage.lvsShow.form.floatPort')" prop="floatPort" class="inline-form-item">
            <el-input v-model="editForm.floatPort" :placeholder="$t('systemManage.lvsShow.form.floatPortPlaceholder')" />
          </el-form-item>
        </div>

        <div class="tech-divider"></div>

        <div v-for="(row, idx) in editForm.realIpRows" :key="idx" class="real-ip-row">
          <el-form-item
            :label="`${$t('systemManage.lvsShow.form.realIp')} ${idx + 1}`"
            :prop="`realIpRows.${idx}.ip`"
            :rules="realIpRules"
            class="inline-form-item"
          >
            <el-input v-model="row.ip" :placeholder="$t('systemManage.lvsShow.form.realIpPlaceholder')" />
          </el-form-item>
          <el-form-item
            :label="$t('systemManage.lvsShow.form.realPort')"
            :prop="`realIpRows.${idx}.port`"
            :rules="realPortRules"
            class="inline-form-item port-item"
          >
            <el-input v-model="row.port" :placeholder="$t('systemManage.lvsShow.form.realPortPlaceholder')" />
          </el-form-item>
          <el-button type="danger" size="small" circle @click="removeRealIpRow(idx)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <el-button type="primary" size="small" @click="addRealIpRow">
          <el-icon><Plus /></el-icon>
          {{ $t('systemManage.lvsShow.btn.addRow') }}
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
      :title="$t('systemManage.lvsShow.detail.title')"
      width="720px"
    >
      <el-table :data="currentDetail" class="lvs-table" stripe>
        <el-table-column prop="ip" :label="$t('systemManage.lvsShow.detail.realIp')" min-width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="port" :label="$t('systemManage.lvsShow.detail.realPort')" width="100" align="center" />
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
}

interface LvsRule {
  uuid: string
  floatIp: string
  floatPort: string
  protocol: 'tcp' | 'udp'
  algorithm: 'rr' | 'wrr' | 'lc' | 'wlc' | 'sh' | 'dh'
  realList: RealServer[]
}

interface RealIpRow {
  ip: string
  port: string
}

// ==================== State ====================
const activeTab = ref('inner')
const virtualIps = ['192.168.1.100', '192.168.1.101', '192.168.2.100', '202.100.10.100']

const innerLoading = ref(false)
const outerLoading = ref(false)

const innerList = ref<LvsRule[]>([
  {
    uuid: 'uuid-inner-1',
    floatIp: '192.168.1.100',
    floatPort: '80',
    protocol: 'tcp',
    algorithm: 'rr',
    realList: [
      { ip: '192.168.10.1', port: '8080' },
      { ip: '192.168.10.2', port: '8080' },
      { ip: '192.168.10.3', port: '8080' }
    ]
  },
  {
    uuid: 'uuid-inner-2',
    floatIp: '192.168.1.101',
    floatPort: '443',
    protocol: 'tcp',
    algorithm: 'wlc',
    realList: [
      { ip: '192.168.20.1', port: '8443' },
      { ip: '192.168.20.2', port: '8443' }
    ]
  },
  {
    uuid: 'uuid-inner-3',
    floatIp: '192.168.2.100',
    floatPort: '53',
    protocol: 'udp',
    algorithm: 'sh',
    realList: [
      { ip: '192.168.30.1', port: '53' },
      { ip: '192.168.30.2', port: '53' },
      { ip: '192.168.30.3', port: '53' },
      { ip: '192.168.30.4', port: '53' }
    ]
  }
])

const outerList = ref<LvsRule[]>([
  {
    uuid: 'uuid-outer-1',
    floatIp: '202.100.10.100',
    floatPort: '80',
    protocol: 'tcp',
    algorithm: 'wrr',
    realList: [
      { ip: '10.10.1.1', port: '80' },
      { ip: '10.10.1.2', port: '80' }
    ]
  }
])

// ==================== Helpers ====================
function getAlgoLabel(value: string): string {
  const map: Record<string, string> = {
    rr: t('systemManage.lvsShow.algorithm.rr'),
    wrr: t('systemManage.lvsShow.algorithm.wrr'),
    lc: t('systemManage.lvsShow.algorithm.lc'),
    wlc: t('systemManage.lvsShow.algorithm.wlc'),
    sh: t('systemManage.lvsShow.algorithm.sh'),
    dh: t('systemManage.lvsShow.algorithm.dh')
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
const currentRow = ref<LvsRule | null>(null)

const editForm = reactive({
  zone: 'inner' as 'inner' | 'outer',
  protocol: 'tcp' as string,
  algorithm: 'rr' as string,
  floatIp: '',
  floatPort: '',
  realIpRows: [] as RealIpRow[]
})

// Validators
function validatePort(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.lvsShow.validation.realPortRequired'))); return }
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1 || num > 65535) { callback(new Error(t('systemManage.lvsShow.validation.realPortRange'))); return }
  callback()
}

function validateFloatPort(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.lvsShow.validation.floatPortRequired'))); return }
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1 || num > 65535) { callback(new Error(t('systemManage.lvsShow.validation.floatPortRange'))); return }
  callback()
}

function validateIp(_rule: any, value: string, callback: any): void {
  if (!value) { callback(new Error(t('systemManage.lvsShow.validation.realIpRequired'))); return }
  const regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  if (!regex.test(value)) { callback(new Error(t('systemManage.lvsShow.validation.realIpInvalid'))); return }
  callback()
}

const editFormRules = computed<FormRules>(() => ({
  zone: [{ required: true, message: t('systemManage.lvsShow.validation.zoneRequired'), trigger: 'change' }],
  protocol: [{ required: true, message: t('systemManage.lvsShow.validation.protocolRequired'), trigger: 'change' }],
  algorithm: [{ required: true, message: t('systemManage.lvsShow.validation.algorithmRequired'), trigger: 'change' }],
  floatIp: [{ required: true, message: t('systemManage.lvsShow.validation.floatIpRequired'), trigger: 'change' }],
  floatPort: [{ validator: validateFloatPort, trigger: 'blur' }]
}))

const realIpRules = computed(() => [{ validator: validateIp, trigger: 'blur' }])
const realPortRules = computed(() => [{ validator: validatePort, trigger: 'blur' }])

function resetEditForm(): void {
  editForm.zone = 'inner'
  editForm.protocol = 'tcp'
  editForm.algorithm = 'rr'
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

function openEditDialog(row: LvsRule): void {
  resetEditForm()
  isEdit.value = true
  currentRow.value = row
  editForm.protocol = row.protocol
  editForm.algorithm = row.algorithm
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

  const newRule: LvsRule = {
    uuid: isEdit.value && currentRow.value ? currentRow.value.uuid : `uuid-${Date.now()}`,
    floatIp: editForm.floatIp,
    floatPort: editForm.floatPort,
    protocol: editForm.protocol as 'tcp' | 'udp',
    algorithm: editForm.algorithm as any,
    realList: editForm.realIpRows.map(r => ({ ip: r.ip, port: r.port }))
  }

  if (isEdit.value) {
    const list = getCurrentList()
    const idx = list.value.findIndex(item => item.uuid === currentRow.value?.uuid)
    if (idx !== -1) list.value[idx] = newRule
    ElNotification({ title: t('common.success'), message: t('systemManage.lvsShow.msg.editSuccess'), type: 'success', customClass: 'notification-success' })
  } else {
    const list = editForm.zone === 'outer' ? outerList : innerList
    list.value.push(newRule)
    ElNotification({ title: t('common.success'), message: t('systemManage.lvsShow.msg.addSuccess'), type: 'success', customClass: 'notification-success' })
  }
  editDialogVisible.value = false
}

// ==================== Delete ====================
async function handleDelete(row: LvsRule): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('systemManage.lvsShow.confirm.delete'),
      t('common.tip'),
      { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
    )
    const list = getCurrentList()
    list.value = list.value.filter(v => v.uuid !== row.uuid)
    ElNotification({ title: t('common.success'), message: t('systemManage.lvsShow.msg.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// ==================== Detail Dialog ====================
const detailDialogVisible = ref(false)
const currentDetail = ref<RealServer[]>([])

function showDetail(row: LvsRule): void {
  currentDetail.value = row.realList || []
  detailDialogVisible.value = true
}
</script>

<style scoped>
.lvs-page {
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
.lvs-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 8px;
}

.lvs-table :deep(.el-table td.el-table__cell) {
  padding: 14px 8px;
}

.lvs-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
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
