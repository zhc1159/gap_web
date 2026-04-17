<template>
  <div class="page-container lan-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.lanShow.title') }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.lanShow.describe') }}</span>
    </div>

    <!-- 内外网切换Tab -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <el-tabs v-model="activeTab" class="network-tabs">
            <!-- 内网接口 -->
            <el-tab-pane :label="$t('systemManage.lanShow.innerTab')" name="inner">
              <div class="table-section">
                <el-table :data="innerInterfaces" v-loading="loading" class="lan-table" stripe>
                  <el-table-column prop="nickName" :label="$t('systemManage.lanShow.interfaceName')" width="120" />
                  <el-table-column :label="$t('systemManage.lanShow.remark')" width="120">
                    <template #default="{ row }">
                      <el-tooltip :content="row.remark" placement="top" :disabled="!row.remark">
                        <span class="remark-text">{{ row.remark || '-' }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.status')" width="100" align="center">
                    <template #default="{ row }">
                      <div class="status-icon" :class="getStatusClass(row)" @click="handleToggleStatus(row)">
                        <span class="status-dot"></span>
                        <span class="status-label">{{ getStatusLabel(row) }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="macAddr" :label="$t('systemManage.lanShow.macAddress')" width="160">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.macAddr || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ipv4Addr" :label="$t('systemManage.lanShow.ip')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.ipv4Addr || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.virtualIpMask')" min-width="200">
                    <template #default="{ row }">
                      <div class="expand-cell">
                        <el-button v-if="row.virtualIps?.length" size="small" text @click="toggleExpand(row.ethName, 'virtual')">
                          <el-icon>
                            <ArrowDown v-if="!expandState[row.ethName]?.virtualExpanded" />
                            <ArrowUp v-else />
                          </el-icon>
                          <span>{{ row.virtualIps.length }} {{ $t('systemManage.lanShow.count') }}</span>
                        </el-button>
                        <span v-else>-</span>
                      </div>
                      <div v-if="expandState[row.ethName]?.virtualExpanded && row.virtualIps?.length" class="expand-content">
                        <div v-for="(vip, idx) in row.virtualIps" :key="idx" class="expand-item">
                          <span class="mono-text">{{ vip.ethName }} - {{ vip.ipAddr }} / {{ vip.netmask }}</span>
                          <el-button size="small" text type="primary" style="color: #fff" @click="handleEditVirtualIP(vip)"><el-icon><Edit /></el-icon></el-button>
                          <el-button size="small" type="danger" style="color: #fff" @click="handleDeleteVirtualIP(vip)"><el-icon><Delete /></el-icon></el-button>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="defaultRouteV4" :label="$t('systemManage.lanShow.defaultRouteV4')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.defaultRouteV4 || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.ipv6AddrMask')" min-width="200">
                    <template #default="{ row }">
                      <div class="expand-cell">
                        <el-button v-if="row.ipv6Addrs?.length" size="small" text @click="toggleExpand(row.ethName, 'ipv6')">
                          <el-icon>
                            <ArrowDown v-if="!expandState[row.ethName]?.ipv6Expanded" />
                            <ArrowUp v-else />
                          </el-icon>
                          <span>{{ row.ipv6Addrs.length }} {{ $t('systemManage.lanShow.count') }}</span>
                        </el-button>
                        <span v-else>-</span>
                      </div>
                      <div v-if="expandState[row.ethName]?.ipv6Expanded && row.ipv6Addrs?.length" class="expand-content">
                        <div v-for="(ip6, idx) in row.ipv6Addrs" :key="idx" class="expand-item">
                          <span class="mono-text">{{ ip6.address }} / {{ ip6.netmask }}</span>
                          <el-button size="small" text type="primary" style="color: #fff" @click="handleEditIPv6(row.ethName, ip6)"><el-icon><Edit /></el-icon></el-button>
                          <el-button size="small" type="danger" style="color: #fff" @click="handleDeleteIPv6(row, ip6)"><el-icon><Delete /></el-icon></el-button>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="defaultRouteV6" :label="$t('systemManage.lanShow.defaultRouteV6')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.defaultRouteV6 || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.actions')" width="180" fixed="right" align="center">
                    <template #default="{ row }">
                      <div class="action-btns">
                        <el-button size="small" class="btn-detail" @click="openDetailDialog(row)">
                          <el-icon><ZoomIn /></el-icon>
                          {{ $t('systemManage.lanShow.detail') }}
                        </el-button>
                        <el-button type="primary" size="small" @click="openEditInterface(row)">
                          <el-icon><Edit /></el-icon>
                          {{ $t('systemManage.lanShow.edit') }}
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 内网DNS配置 -->
              <div class="dns-section">
                <div class="dns-row">
                  <el-icon class="dns-icon"><Connection /></el-icon>
                  <span class="dns-label">{{ $t('systemManage.lanShow.dnsTitle') }}</span>
                  <span class="dns-value">{{ innerDns || '-' }}</span>
                  <el-button type="primary" size="small" @click="openDnsModal('inner')">
                    {{ $t('systemManage.lanShow.dnsEdit') }}
                  </el-button>
                </div>
              </div>

            </el-tab-pane>

            <!-- 外网接口 -->
            <el-tab-pane :label="$t('systemManage.lanShow.outerTab')" name="outer">
              <div class="table-section">
                <el-table :data="outerInterfaces" v-loading="loading" class="lan-table" stripe>
                  <el-table-column prop="nickName" :label="$t('systemManage.lanShow.interfaceName')" width="120" />
                  <el-table-column :label="$t('systemManage.lanShow.remark')" width="120">
                    <template #default="{ row }">
                      <el-tooltip :content="row.remark" placement="top" :disabled="!row.remark">
                        <span class="remark-text">{{ row.remark || '-' }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.status')" width="100" align="center">
                    <template #default="{ row }">
                      <div class="status-icon" :class="getStatusClass(row)" @click="handleToggleStatus(row)">
                        <span class="status-dot"></span>
                        <span class="status-label">{{ getStatusLabel(row) }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="macAddr" :label="$t('systemManage.lanShow.macAddress')" width="160">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.macAddr || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ipv4Addr" :label="$t('systemManage.lanShow.ip')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.ipv4Addr || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.virtualIpMask')" min-width="200">
                    <template #default="{ row }">
                      <div class="expand-cell">
                        <el-button v-if="row.virtualIps?.length" size="small" text @click="toggleExpand(row.ethName, 'virtual')">
                          <el-icon>
                            <ArrowDown v-if="!expandState[row.ethName]?.virtualExpanded" />
                            <ArrowUp v-else />
                          </el-icon>
                          <span>{{ row.virtualIps.length }} {{ $t('systemManage.lanShow.count') }}</span>
                        </el-button>
                        <span v-else>-</span>
                      </div>
                      <div v-if="expandState[row.ethName]?.virtualExpanded && row.virtualIps?.length" class="expand-content">
                        <div v-for="(vip, idx) in row.virtualIps" :key="idx" class="expand-item">
                          <span class="mono-text">{{ vip.ethName }} - {{ vip.ipAddr }} / {{ vip.netmask }}</span>
                          <el-button size="small" text type="primary" style="color: #fff" @click="handleEditVirtualIP(vip)"><el-icon><Edit /></el-icon></el-button>
                          <el-button size="small" type="danger" style="color: #fff" @click="handleDeleteVirtualIP(vip)"><el-icon><Delete /></el-icon></el-button>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="defaultRouteV4" :label="$t('systemManage.lanShow.defaultRouteV4')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.defaultRouteV4 || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.ipv6AddrMask')" min-width="200">
                    <template #default="{ row }">
                      <div class="expand-cell">
                        <el-button v-if="row.ipv6Addrs?.length" size="small" text @click="toggleExpand(row.ethName, 'ipv6')">
                          <el-icon>
                            <ArrowDown v-if="!expandState[row.ethName]?.ipv6Expanded" />
                            <ArrowUp v-else />
                          </el-icon>
                          <span>{{ row.ipv6Addrs.length }} {{ $t('systemManage.lanShow.count') }}</span>
                        </el-button>
                        <span v-else>-</span>
                      </div>
                      <div v-if="expandState[row.ethName]?.ipv6Expanded && row.ipv6Addrs?.length" class="expand-content">
                        <div v-for="(ip6, idx) in row.ipv6Addrs" :key="idx" class="expand-item">
                          <span class="mono-text">{{ ip6.address }} / {{ ip6.netmask }}</span>
                          <el-button size="small" text type="primary" style="color: #fff" @click="handleEditIPv6(row.ethName, ip6)"><el-icon><Edit /></el-icon></el-button>
                          <el-button size="small" type="danger" style="color: #fff" @click="handleDeleteIPv6(row, ip6)"><el-icon><Delete /></el-icon></el-button>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="defaultRouteV6" :label="$t('systemManage.lanShow.defaultRouteV6')" width="140">
                    <template #default="{ row }">
                      <span class="mono-text">{{ row.defaultRouteV6 || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.lanShow.actions')" width="180" fixed="right" align="center">
                    <template #default="{ row }">
                      <div class="action-btns">
                        <el-button size="small" class="btn-detail" @click="openDetailDialog(row)">
                          <el-icon><ZoomIn /></el-icon>
                          {{ $t('systemManage.lanShow.detail') }}
                        </el-button>
                        <el-button type="primary" size="small" @click="openEditInterface(row)">
                          <el-icon><Edit /></el-icon>
                          {{ $t('systemManage.lanShow.edit') }}
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 外网DNS配置 -->
              <div class="dns-section">
                <div class="dns-row">
                  <el-icon class="dns-icon"><Connection /></el-icon>
                  <span class="dns-label">{{ $t('systemManage.lanShow.dnsTitle') }}</span>
                  <span class="dns-value">{{ outerDns || '-' }}</span>
                  <el-button type="primary" size="small" @click="openDnsModal('outer')">
                    {{ $t('systemManage.lanShow.dnsEdit') }}
                  </el-button>
                </div>
              </div>

            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- DNS编辑弹窗 -->
    <el-dialog v-model="showDnsModal" :title="$t('systemManage.lanShow.dnsTitle')" width="500px">
      <el-form label-width="160px">
        <el-form-item :label="$t('systemManage.lanShow.dnsLabel')">
          <el-input v-model="dnsForm.dnsAddr" :placeholder="$t('systemManage.lanShow.dnsPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDnsModal = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveDns">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 接口编辑弹窗 -->
    <el-dialog v-model="showInterfaceModal" :title="$t('systemManage.lanShow.interfaceEdit')" width="600px">
      <el-form :model="interfaceForm" label-width="160px">
        <el-form-item :label="$t('systemManage.lanShow.ipv4Addr')">
          <el-input v-model="interfaceForm.ipv4Addr" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv4Mask')">
          <el-input v-model="interfaceForm.ipv4Netmask" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv4Gateway')">
          <el-input v-model="interfaceForm.defaultRouteV4" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv6Addr')">
          <el-input v-model="interfaceForm.ipv6Addr" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv6MaskLength')">
          <el-input v-model="interfaceForm.ipv6Netmask" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.remarkLabel')">
          <el-input v-model="interfaceForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInterfaceModal = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveInterface">{{ $t('systemManage.lanShow.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- IPv4编辑弹窗 -->
    <el-dialog v-model="showIpv4Modal" :title="$t('systemManage.lanShow.editIpv4')" width="450px">
      <el-form label-width="120px">
        <el-form-item :label="$t('systemManage.lanShow.ipv4Addr')">
          <el-input v-model="ipv4Form.editIpv4" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv4Mask')">
          <el-input v-model="ipv4Form.editIpv4Netmask" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIpv4Modal = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveIpv4">{{ $t('systemManage.lanShow.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- IPv6编辑弹窗 -->
    <el-dialog v-model="showIpv6Modal" :title="$t('systemManage.lanShow.editIpv6')" width="450px">
      <el-form label-width="120px">
        <el-form-item :label="$t('systemManage.lanShow.ipv6Addr')">
          <el-input v-model="ipv6Form.editIpv6" />
        </el-form-item>
        <el-form-item :label="$t('systemManage.lanShow.ipv6MaskLength')">
          <el-input v-model="ipv6Form.editIpv6Netmask" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIpv6Modal = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveIpv6">{{ $t('systemManage.lanShow.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- 接口详情弹窗 -->
    <el-dialog v-model="showDetailDialog" :title="$t('systemManage.lanShow.detailTitle')" width="600px" class="detail-dialog">
      <div v-if="detailRow" class="detail-content">
        <div class="detail-header">
          <div class="detail-icon-box">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="detail-header-info">
            <div class="detail-name">{{ detailRow.nickName }}</div>
            <div class="detail-remark">{{ detailRow.remark || '-' }}</div>
          </div>
          <div class="detail-status-badge" :class="getStatusClass(detailRow)">
            <span class="status-dot"></span>
            <span>{{ getStatusLabel(detailRow) }}</span>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-grid">
            <div class="detail-field">
              <span class="field-label">{{ $t('systemManage.lanShow.interfaceName') }}</span>
              <span class="field-value">{{ detailRow.ethName }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">MAC</span>
              <span class="field-value mono">{{ detailRow.macAddr || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ $t('systemManage.lanShow.ipv4Addr') }}</span>
              <span class="field-value mono">{{ detailRow.ipv4Addr || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ $t('systemManage.lanShow.ipv4Mask') }}</span>
              <span class="field-value mono">{{ detailRow.ipv4Netmask || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ $t('systemManage.lanShow.defaultRouteV4') }}</span>
              <span class="field-value mono">{{ detailRow.defaultRouteV4 || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ $t('systemManage.lanShow.defaultRouteV6') }}</span>
              <span class="field-value mono">{{ detailRow.defaultRouteV6 || '-' }}</span>
            </div>
          </div>
          <!-- 虚拟IP -->
          <div v-if="detailRow.virtualIps?.length" class="detail-section">
            <div class="detail-section-title">{{ $t('systemManage.lanShow.virtualIpMask') }}</div>
            <div v-for="(vip, idx) in detailRow.virtualIps" :key="idx" class="detail-sub-item">
              <el-tag size="small" type="primary">{{ vip.ethName }}</el-tag>
              <span class="mono">{{ vip.ipAddr }} / {{ vip.netmask }}</span>
            </div>
          </div>
          <!-- IPv6地址 -->
          <div v-if="detailRow.ipv6Addrs?.length" class="detail-section">
            <div class="detail-section-title">{{ $t('systemManage.lanShow.ipv6AddrMask') }}</div>
            <div v-for="(ip6, idx) in detailRow.ipv6Addrs" :key="idx" class="detail-sub-item">
              <span class="mono">{{ ip6.address }} / {{ ip6.netmask }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Monitor,
  Refresh,
  Edit,
  Delete,
  InfoFilled,
  Connection,
  ArrowDown,
  ArrowUp,
  ZoomIn
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口类型定义
interface VirtualIP {
  ethName: string
  ipAddr: string
  netmask: string
  virtualIndex: number
}

interface IPv6Addr {
  address: string
  netmask: string
}

interface InterfaceInfo {
  ethName: string
  nickName: string
  upState: string
  runState: string
  ipv4Addr: string
  ipv4Netmask: string
  macAddr: string
  remark: string
  virtualIps: VirtualIP[]
  ipv6Addrs: IPv6Addr[]
  defaultRouteV4: string
  defaultRouteV6: string
}

// 展开/收起状态
interface ExpandState {
  [ethName: string]: {
    virtualExpanded: boolean
    ipv6Expanded: boolean
  }
}

// 状态
const loading = ref(false)
const activeTab = ref('inner')
const expandState = ref<ExpandState>({})
const innerDns = ref('8.8.8.8, 114.114.114.114')
const outerDns = ref('1.1.1.1, 8.8.4.4')

// Mock内网接口数据
const innerInterfaces = ref<InterfaceInfo[]>([])
// Mock外网接口数据
const outerInterfaces = ref<InterfaceInfo[]>([])

// 弹窗控制
const showDnsModal = ref(false)
const showInterfaceModal = ref(false)
const showIpv4Modal = ref(false)
const showIpv6Modal = ref(false)
const currentDnsTarget = ref<'inner' | 'outer'>('inner')

// 表单
const dnsForm = reactive({ dnsAddr: '' })
const interfaceForm = reactive({
  ethName: '', ipv4Addr: '', ipv4Netmask: '', defaultRouteV4: '',
  ipv6Addr: '', ipv6Netmask: '', defaultRouteV6: '', remark: ''
})
const ipv4Form = reactive({ editIpv4: '', editIpv4Netmask: '', editEthName: '', who: 4 })
const ipv6Form = reactive({
  editIpv6: '', editIpv6Netmask: '', oldEditIpv6: '', oldEditIpv6Netmask: '',
  editEthName6: '', who6: 6
})

// 状态样式
function getStatusClass(row: InterfaceInfo): string {
  if (row.upState === '0') return 'status-off'
  if (row.runState === '0') return 'status-warning'
  return 'status-ok'
}

function getStatusLabel(row: InterfaceInfo): string {
  if (row.upState === '0') return t('systemManage.lanShow.statusOff')
  if (row.runState === '0') return t('systemManage.lanShow.statusUnconnected')
  return t('systemManage.lanShow.statusConnected')
}

// 展开/收起
function toggleExpand(ethName: string, type: 'virtual' | 'ipv6') {
  if (!expandState.value[ethName]) {
    expandState.value[ethName] = { virtualExpanded: false, ipv6Expanded: false }
  }
  if (type === 'virtual') {
    expandState.value[ethName].virtualExpanded = !expandState.value[ethName].virtualExpanded
  } else {
    expandState.value[ethName].ipv6Expanded = !expandState.value[ethName].ipv6Expanded
  }
}

// 切换接口状态
async function handleToggleStatus(row: InterfaceInfo) {
  const action = row.upState === '0' ? 'up' : 'down'
  try {
    await ElMessageBox.confirm(
      t('systemManage.lanShow.messages.confirmDelete'),
      t('common.confirm'),
      { type: 'warning' }
    )
    row.upState = action === 'up' ? '1' : '0'
    row.runState = action === 'up' ? '1' : '0'
    ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 打开DNS编辑
function openDnsModal(target: 'inner' | 'outer') {
  currentDnsTarget.value = target
  dnsForm.dnsAddr = target === 'inner' ? innerDns.value : outerDns.value
  showDnsModal.value = true
}

// 保存DNS
async function handleSaveDns() {
  if (currentDnsTarget.value === 'inner') {
    innerDns.value = dnsForm.dnsAddr
  } else {
    outerDns.value = dnsForm.dnsAddr
  }
  showDnsModal.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
}

// 打开接口编辑
function openEditInterface(row: InterfaceInfo) {
  Object.assign(interfaceForm, {
    ethName: row.ethName,
    ipv4Addr: row.ipv4Addr,
    ipv4Netmask: row.ipv4Netmask,
    defaultRouteV4: row.defaultRouteV4,
    ipv6Addr: row.ipv6Addrs[0]?.address || '',
    ipv6Netmask: row.ipv6Addrs[0]?.netmask || '',
    defaultRouteV6: row.defaultRouteV6,
    remark: row.remark
  })
  showInterfaceModal.value = true
}

// 保存接口
async function handleSaveInterface() {
  const list = activeTab.value === 'inner' ? innerInterfaces : outerInterfaces
  const item = list.value.find(i => i.ethName === interfaceForm.ethName)
  if (item) {
    item.ipv4Addr = interfaceForm.ipv4Addr
    item.ipv4Netmask = interfaceForm.ipv4Netmask
    item.defaultRouteV4 = interfaceForm.defaultRouteV4
    item.defaultRouteV6 = interfaceForm.defaultRouteV6
    item.remark = interfaceForm.remark
    if (interfaceForm.ipv6Addr) {
      item.ipv6Addrs = [{ address: interfaceForm.ipv6Addr, netmask: interfaceForm.ipv6Netmask }]
    }
  }
  showInterfaceModal.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
}

// 编辑虚拟IP
function handleEditVirtualIP(vip: VirtualIP) {
  Object.assign(ipv4Form, {
    editIpv4: vip.ipAddr,
    editIpv4Netmask: vip.netmask,
    editEthName: vip.ethName,
    who: 4
  })
  showIpv4Modal.value = true
}

// 保存IPv4
async function handleSaveIpv4() {
  showIpv4Modal.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
}

// 编辑IPv6
function handleEditIPv6(ethName: string, ip6: IPv6Addr) {
  Object.assign(ipv6Form, {
    editIpv6: ip6.address,
    editIpv6Netmask: ip6.netmask,
    oldEditIpv6: ip6.address,
    oldEditIpv6Netmask: ip6.netmask,
    editEthName6: ethName,
    who6: 6
  })
  showIpv6Modal.value = true
}

// 保存IPv6
async function handleSaveIpv6() {
  showIpv6Modal.value = false
  ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
}

// 删除IPv6
async function handleDeleteIPv6(row: InterfaceInfo, ip6: IPv6Addr) {
  try {
    await ElMessageBox.confirm(
      t('systemManage.lanShow.messages.confirmDelete'),
      t('common.confirm'),
      { type: 'warning' }
    )
    row.ipv6Addrs = row.ipv6Addrs.filter(a => a !== ip6)
    ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 删除虚拟IP
async function handleDeleteVirtualIP(vip: VirtualIP) {
  try {
    await ElMessageBox.confirm(
      t('systemManage.lanShow.messages.confirmDelete'),
      t('common.confirm'),
      { type: 'warning' }
    )
    // 从内网和外网中移除
    innerInterfaces.value.forEach(i => {
      i.virtualIps = i.virtualIps.filter(v => v !== vip)
    })
    outerInterfaces.value.forEach(i => {
      i.virtualIps = i.virtualIps.filter(v => v !== vip)
    })
    ElNotification({ title: t('common.success'), message: t('systemManage.lanShow.messages.deleteSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  }
}

// 详情弹窗
const showDetailDialog = ref(false)
const detailRow = ref<InterfaceInfo | null>(null)

function openDetailDialog(row: InterfaceInfo) {
  detailRow.value = row
  showDetailDialog.value = true
}

// 刷新
function handleRefresh() {
  fetchData()
}

// 加载Mock数据
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    innerInterfaces.value = [
      {
        ethName: 'eth0',
        nickName: 'eth0',
        upState: '1',
        runState: '1',
        ipv4Addr: '192.168.1.1',
        ipv4Netmask: '255.255.255.0',
        macAddr: '00:1A:2B:3C:4D:5E',
        remark: '内网主接口',
        virtualIps: [
          { ethName: 'eth0:1', ipAddr: '192.168.1.100', netmask: '255.255.255.0', virtualIndex: 0 },
          { ethName: 'eth0:2', ipAddr: '192.168.1.101', netmask: '255.255.255.0', virtualIndex: 1 }
        ],
        ipv6Addrs: [
          { address: 'fe80::1', netmask: '64' },
          { address: '2001:db8::1', netmask: '64' }
        ],
        defaultRouteV4: '192.168.1.254',
        defaultRouteV6: 'fe80::254'
      },
      {
        ethName: 'eth1',
        nickName: 'eth1',
        upState: '1',
        runState: '0',
        ipv4Addr: '10.0.0.1',
        ipv4Netmask: '255.255.0.0',
        macAddr: '00:1A:2B:3C:4D:5F',
        remark: '内网备用',
        virtualIps: [],
        ipv6Addrs: [],
        defaultRouteV4: '',
        defaultRouteV6: ''
      },
      {
        ethName: 'eth2',
        nickName: 'eth2',
        upState: '0',
        runState: '0',
        ipv4Addr: '',
        ipv4Netmask: '',
        macAddr: '00:1A:2B:3C:4D:60',
        remark: '',
        virtualIps: [],
        ipv6Addrs: [],
        defaultRouteV4: '',
        defaultRouteV6: ''
      },
      {
        ethName: 'lo',
        nickName: 'lo',
        upState: '1',
        runState: '1',
        ipv4Addr: '127.0.0.1',
        ipv4Netmask: '255.0.0.0',
        macAddr: '00:00:00:00:00:00',
        remark: '回环接口',
        virtualIps: [],
        ipv6Addrs: [
          { address: '::1', netmask: '128' }
        ],
        defaultRouteV4: '',
        defaultRouteV6: ''
      },
      {
        ethName: 'bond0',
        nickName: 'bond0',
        upState: '1',
        runState: '1',
        ipv4Addr: '192.168.2.1',
        ipv4Netmask: '255.255.255.0',
        macAddr: '00:1A:2B:3C:4D:70',
        remark: '绑定接口',
        virtualIps: [],
        ipv6Addrs: [],
        defaultRouteV4: '192.168.2.254',
        defaultRouteV6: ''
      }
    ]
    outerInterfaces.value = [
      {
        ethName: 'eth3',
        nickName: 'eth3',
        upState: '1',
        runState: '1',
        ipv4Addr: '202.100.1.1',
        ipv4Netmask: '255.255.255.0',
        macAddr: '00:5E:4D:3C:2B:1A',
        remark: '外网主接口',
        virtualIps: [
          { ethName: 'eth3:1', ipAddr: '202.100.1.50', netmask: '255.255.255.0', virtualIndex: 0 }
        ],
        ipv6Addrs: [
          { address: '2001:db8:1::1', netmask: '64' }
        ],
        defaultRouteV4: '202.100.1.254',
        defaultRouteV6: '2001:db8:1::254'
      },
      {
        ethName: 'eth4',
        nickName: 'eth4',
        upState: '1',
        runState: '1',
        ipv4Addr: '172.16.0.1',
        ipv4Netmask: '255.255.0.0',
        macAddr: '00:5E:4D:3C:2B:1B',
        remark: '外网备用',
        virtualIps: [],
        ipv6Addrs: [],
        defaultRouteV4: '172.16.0.254',
        defaultRouteV6: ''
      },
      {
        ethName: 'lo',
        nickName: 'lo',
        upState: '1',
        runState: '1',
        ipv4Addr: '127.0.0.1',
        ipv4Netmask: '255.0.0.0',
        macAddr: '00:00:00:00:00:00',
        remark: '回环接口',
        virtualIps: [],
        ipv6Addrs: [
          { address: '::1', netmask: '128' }
        ],
        defaultRouteV4: '',
        defaultRouteV6: ''
      },
      {
        ethName: 'bond0',
        nickName: 'bond0',
        upState: '1',
        runState: '1',
        ipv4Addr: '202.100.2.1',
        ipv4Netmask: '255.255.255.0',
        macAddr: '00:5E:4D:3C:2B:20',
        remark: '绑定接口',
        virtualIps: [],
        ipv6Addrs: [],
        defaultRouteV4: '202.100.2.254',
        defaultRouteV6: ''
      }
    ]
    // 初始化展开状态
    const state: ExpandState = {}
    ;[...innerInterfaces.value, ...outerInterfaces.value].forEach(inter => {
      state[inter.ethName] = { virtualExpanded: false, ipv6Expanded: false }
    })
    expandState.value = state
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.lan-page {
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

/* 内容区域 */
.content-wrapper {
  flex: 1;
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
.network-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.network-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
}

.network-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

/* 表格样式 */
.lan-table {
  width: 100%;
}

.lan-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 8px;
  font-size: 13px;
}

.lan-table :deep(.el-table td.el-table__cell) {
  padding: 14px 8px;
}

.lan-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.remark-text {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* 状态指示灯 */
.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-icon:hover {
  transform: scale(1.1);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s;
}

.status-icon.status-ok .status-dot {
  background: #67C23A;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
}

.status-icon.status-warning .status-dot {
  background: #E6A23C;
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.6);
}

.status-icon.status-off .status-dot {
  background: #F56C6C;
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.6);
}

.status-label {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 展开/收起 */
.expand-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-content {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(64, 158, 255, 0.15);
}

.expand-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.expand-item .mono-text {
  flex: 1;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-detail {
  background: #606266;
  border-color: var(--el-text-color-secondary);
  color: #fff;
}

.btn-detail:hover {
  background: #73767a;
  border-color: #73767a;
}

/* DNS配置区 */
.dns-section {
  margin-top: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.04) 0%, rgba(103, 194, 58, 0.04) 100%);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.dns-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dns-icon {
  color: #409EFF;
  font-size: 18px;
}

.dns-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  white-space: nowrap;
}

.dns-value {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
}

/* 详情弹窗 */
.detail-content {
  padding: 4px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(103, 194, 58, 0.06) 100%);
  border-radius: 10px;
  margin-bottom: 20px;
}

.detail-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.detail-header-info {
  flex: 1;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-remark {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  margin-top: 2px;
}

.detail-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.detail-status-badge .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.detail-status-badge.status-ok {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.detail-status-badge.status-ok .status-dot {
  background: #67C23A;
}

.detail-status-badge.status-warning {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.detail-status-badge.status-warning .status-dot {
  background: #E6A23C;
}

.detail-status-badge.status-off {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.detail-status-badge.status-off .status-dot {
  background: #F56C6C;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.field-value {
  font-size: 14px;
  color: #303133;
}

.field-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.detail-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed rgba(144, 147, 153, 0.15);
}

.detail-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.detail-sub-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-sub-item .mono {
  font-family: 'Courier New', monospace;
}

/* 响应式 */
</style>
