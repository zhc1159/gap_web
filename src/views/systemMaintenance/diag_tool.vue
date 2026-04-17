<template>
  <div class="page-container diag-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Tools /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.diagTool.title') }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <!-- 工具选项卡 -->
        <div class="tabs-wrapper">
          <div
            v-for="tool in tools"
            :key="tool.value"
            :class="['tab-item', { active: activeTool === tool.value }]"
            @click="handleToolChange(tool.value)"
          >
            <el-icon><component :is="tool.icon" /></el-icon>
            <span>{{ tool.label }}</span>
          </div>
        </div>

        <!-- 参数配置区 -->
        <div class="params-section">
          <!-- Ping/Traceroute 参数 -->
          <template v-if="activeTool === 'ping' || activeTool === 'traceroute'">
            <div class="param-row">
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.networkInterface') }}</label>
                <el-select v-model="params.orient" class="param-select">
                  <el-option :label="$t('systemMaintenance.diagTool.allIntranet')" value="ALL_IN" />
                  <el-option :label="$t('systemMaintenance.diagTool.allExtranet')" value="ALL_OUT" />
                  <el-option label="eth0" value="eth0" />
                  <el-option label="eth1" value="eth1" />
                  <el-option label="eth2" value="eth2" />
                </el-select>
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.ipAddress') }}</label>
                <el-input
                  v-model="params.addr"
                  placeholder="192.168.1.1 / example.com"
                  class="param-input"
                />
              </div>
            </div>
          </template>

          <!-- ARP 参数 -->
          <template v-else-if="activeTool === 'arp'">
            <div class="param-row">
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.networkInterface') }}</label>
                <el-select v-model="params.orient" class="param-select">
                  <el-option :label="$t('systemMaintenance.diagTool.allIntranet')" value="ALL_IN" />
                  <el-option :label="$t('systemMaintenance.diagTool.allExtranet')" value="ALL_OUT" />
                  <el-option label="eth0" value="eth0" />
                  <el-option label="eth1" value="eth1" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- Tcpdump 参数 -->
          <template v-else-if="activeTool === 'tcpdump'">
            <div class="param-row">
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.networkInterface') }}</label>
                <el-select v-model="params.orient" class="param-select">
                  <el-option label="default" value="default" />
                  <el-option label="eth0" value="eth0" />
                  <el-option label="eth1" value="eth1" />
                </el-select>
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.protocol') }}</label>
                <el-select v-model="params.protocol" class="param-select">
                  <el-option label="All" value="all" />
                  <el-option label="TCP" value="TCP" />
                  <el-option label="UDP" value="UDP" />
                  <el-option label="ICMP" value="ICMP" />
                </el-select>
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.packetCount') }}</label>
                <el-input-number v-model="params.pkg" :min="1" :max="50" class="param-number" />
              </div>
            </div>
            <div class="param-row">
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.timeout') }}</label>
                <el-input-number v-model="params.exp" :min="10" :max="30" class="param-number" />
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.ipAddress') }} ({{ $t('common.optional') }})</label>
                <el-input v-model="params.addr" placeholder="192.168.1.1" class="param-input" />
              </div>
            </div>
          </template>

          <!-- Tcping 参数 -->
          <template v-else-if="activeTool === 'tcping'">
            <div class="param-row">
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.networkInterface') }}</label>
                <el-select v-model="params.where" class="param-select">
                  <el-option :label="$t('systemMaintenance.diagTool.internal')" value="in" />
                  <el-option :label="$t('systemMaintenance.diagTool.external')" value="out" />
                </el-select>
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.ipAddress') }}</label>
                <el-input v-model="params.addr" placeholder="192.168.1.1" class="param-input" />
              </div>
              <div class="param-item">
                <label>{{ $t('systemMaintenance.diagTool.port') }}</label>
                <el-input-number v-model="params.port" :min="1" :max="65535" class="param-number" />
              </div>
            </div>
          </template>

          <!-- 操作按钮 -->
          <div class="action-bar">
            <el-button
              type="primary"
              class="btn-start"
              :loading="isRunning"
              @click="handleStart"
            >
              <el-icon><VideoPlay /></el-icon>
              {{ isRunning ? $t('systemMaintenance.diagTool.running') : $t('systemMaintenance.diagTool.start') }}
            </el-button>
            <el-button
              type="danger"
              class="btn-stop"
              :disabled="!isRunning"
              @click="handleStop"
            >
              <el-icon><VideoPause /></el-icon>
              {{ $t('systemMaintenance.diagTool.stop') }}
            </el-button>
          </div>
        </div>

        <!-- 诊断结果区 -->
        <div class="result-terminal">
          <div class="terminal-header">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span class="terminal-title">{{ $t('systemMaintenance.diagTool.result') }}</span>
          </div>
          <el-scrollbar ref="scrollbarRef" class="terminal-body">
            <div v-for="(line, index) in resultLines" :key="index" class="terminal-line">
              <span class="line-number">{{ String(index + 1).padStart(3, '0') }}</span>
              <span class="line-content">{{ line }}</span>
            </div>
            <div v-if="resultLines.length === 0" class="empty-state">
              <el-icon><Document /></el-icon>
              <span>{{ $t('systemMaintenance.diagTool.noResult') }}</span>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Tools, VideoPlay, VideoPause, Document,
  Connection, Link, DataAnalysis, Monitor
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 工具选项
const tools = [
  { value: 'ping', label: t('systemMaintenance.diagTool.ping'), icon: Connection },
  { value: 'traceroute', label: t('systemMaintenance.diagTool.traceroute'), icon: Link },
  { value: 'arp', label: t('systemMaintenance.diagTool.arp'), icon: DataAnalysis },
  { value: 'tcpdump', label: t('systemMaintenance.diagTool.tcpdump'), icon: Monitor },
  { value: 'tcping', label: t('systemMaintenance.diagTool.tcping'), icon: Connection }
]

// 状态
const activeTool = ref<string>('ping')
const isRunning = ref(false)
const resultLines = ref<string[]>([])
const scrollbarRef = ref()

// 参数
const params = ref({
  cmd_head: 'ping',
  orient: 'ALL_IN',
  addr: '',
  addr_type: 'IPv4',
  where: 'in',
  protocol: 'all',
  pkg: 10,
  exp: 30,
  port: 80
})

let pollTimer: ReturnType<typeof setInterval> | null = null
let pollCount = 0

// 模拟结果数据
const mockResults = {
  ping: [
    'PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.',
    '64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.042 ms',
    '64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.038 ms',
    '64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=0.041 ms',
    '64 bytes from 192.168.1.1: icmp_seq=4 ttl=64 time=0.039 ms',
    '--- 192.168.1.1 ping statistics ---',
    '4 packets transmitted, 4 received, 0% packet loss',
    'round-trip min/avg/max/stddev = 0.038/0.040/0.042/0.001 ms'
  ],
  traceroute: [
    'traceroute to 192.168.1.1, 30 hops max, 60 byte packets',
    '1  gateway (192.168.0.1)  0.521 ms  0.398 ms  0.401 ms',
    '2  192.168.1.1 (192.168.1.1)  0.892 ms  0.756 ms  0.801 ms',
    'Trace complete.'
  ],
  arp: [
    'Address                  HWtype  HWaddress           Flags Mask          Interface',
    '192.168.0.1              ether   00:50:56:c0:00:08   C    eth0',
    '192.168.0.100            ether   00:0c:29:51:a7:3d   C    eth0',
    '192.168.0.255            ether   ff:ff:ff:ff:ff:ff   C    eth0',
    'Entries: 3'
  ],
  tcpdump: [
    'tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes',
    '14:23:01.123456 IP 192.168.0.100.12345 > 192.168.1.1.80: Flags [S], seq 0, win 65535, options [mss 1460], length 0',
    '14:23:01.234567 IP 192.168.1.1.80 > 192.168.0.100.12345: Flags [S.], seq 0, ack 1, win 65535, options [mss 1460], length 0',
    '14:23:01.345678 IP 192.168.0.100.12345 > 192.168.1.1.80: Flags [.], ack 1, win 65535, length 0',
    '10 packets captured',
    'tcpdump: capture complete'
  ],
  tcping: [
    'TCPING 192.168.1.1:80',
    'Connected to 192.168.1.1:80, time=0.023ms',
    'Connected to 192.168.1.1:80, time=0.019ms',
    'Connected to 192.168.1.1:80, time=0.021ms',
    'Ping statistics: 3 probes sent, 3 successful, 0% failed'
  ]
}

const handleToolChange = (tool: string) => {
  if (isRunning.value) {
    handleStop()
  }
  resultLines.value = []
  activeTool.value = tool
  params.value.cmd_head = tool
}

const handleStart = async () => {
  if (!validateParams()) return

  isRunning.value = true
  resultLines.value = []
  pollCount = 0

  // 模拟诊断结果
  const results = mockResults[activeTool.value as keyof typeof mockResults] || []

  for (const line of results) {
    if (!isRunning.value) break

    await new Promise(resolve => setTimeout(resolve, 500))
    resultLines.value.push(line)
    pollCount++

    nextTick(() => {
      scrollbarRef.value?.setScrollTop(scrollbarRef.value.wrap?.scrollHeight || 0)
    })
  }

  isRunning.value = false
}

const handleStop = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  isRunning.value = false
  resultLines.value.push('--- ' + t('systemMaintenance.diagTool.stopped') + ' ---')
}

const validateParams = () => {
  const { addr, pkg, exp, port } = params.value

  if ((activeTool.value === 'ping' || activeTool.value === 'traceroute' || activeTool.value === 'tcping') && !addr) {
    ElNotification({
      title: t('common.tip'),
      message: t('systemMaintenance.diagTool.ipRequired'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return false
  }

  if (activeTool.value === 'tcpdump') {
    if (pkg < 1 || pkg > 50) {
      ElNotification({
        title: t('common.tip'),
        message: t('systemMaintenance.diagTool.packetRange'),
        type: 'warning',
        customClass: 'notification-warning'
      })
      return false
    }
    if (exp < 10 || exp > 30) {
      ElNotification({
        title: t('common.tip'),
        message: t('systemMaintenance.diagTool.timeoutRange'),
        type: 'warning',
        customClass: 'notification-warning'
      })
      return false
    }
  }

  if (activeTool.value === 'tcping') {
    if (port < 1 || port > 65535) {
      ElNotification({
        title: t('common.tip'),
        message: t('systemMaintenance.diagTool.portRange'),
        type: 'warning',
        customClass: 'notification-warning'
      })
      return false
    }
  }

  return true
}

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style scoped>
.diag-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--page-header-gradient);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  color: var(--page-header-text);
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  font-size: 20px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
}

/* 内容区域 */
.content-wrapper {
  display: flex;
  flex-direction: column;
}

/* 主卡片 */
.main-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
}

/* 选项卡 */
.tabs-wrapper {
  display: flex;
  padding: 0 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.05);
}

.tab-item.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
  background: rgba(64, 158, 255, 0.08);
}

/* 参数区域 */
.params-section {
  padding: 24px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
}

.param-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.param-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.param-select,
.param-input,
.param-number {
  width: 100%;
}

/* 操作按钮 */
.action-bar {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.btn-start {
  background: var(--page-header-gradient);
  border: none;
  color: white;
  padding: 14px 32px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.35);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
}

.btn-stop {
  background: linear-gradient(135deg, #F56C6C 0%, #E6A23C 100%);
  border: none;
  color: white;
  padding: 14px 32px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(245, 108, 108, 0.35);
}

.btn-stop:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.45);
}

/* 终端结果区 */
.result-terminal {
  margin: 0 20px 20px;
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.terminal-header {
  background: #16213e;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #0f3460;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.terminal-dot.red { background: #FF5F56; }
.terminal-dot.yellow { background: #FFBD2E; }
.terminal-dot.green { background: #27C93F; }

.terminal-title {
  margin-left: 12px;
  color: #e94560;
  font-weight: 600;
  font-size: 13px;
}

.terminal-body {
  height: 320px;
  padding: 16px;
}

.terminal-line {
  display: flex;
  line-height: 1.8;
  font-family: 'Consolas', 'Monaco', 'SF Mono', monospace;
  font-size: 13px;
}

.line-number {
  color: #6366F1;
  margin-right: 16px;
  min-width: 40px;
  user-select: none;
  opacity: 0.7;
}

.line-content {
  color: #A5F3FC;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #4a5568;
  font-size: 14px;
  gap: 12px;
}

.empty-state .el-icon {
  font-size: 48px;
  opacity: 0.3;
}

/* 响应式 */
@media (max-width: 768px) {
  .tabs-wrapper {
    flex-wrap: wrap;
  }

  .tab-item {
    padding: 12px 16px;
  }

  .param-row {
    flex-direction: column;
  }

  .action-bar {
    flex-direction: column;
  }

  .action-bar .el-button {
    width: 100%;
  }
}
</style>
