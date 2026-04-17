<template>
  <div class="page-container gap-dip-page">
    <!-- 内网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapDip.innerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="innerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapDip.10min')" value="10min" />
            <el-option :label="$t('supervise.gapDip.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapDip.1day')" value="1day" />
            <el-option :label="$t('supervise.gapDip.1week')" value="1week" />
            <el-option :label="$t('supervise.gapDip.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card full-width">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapDip.trafficTrend') }}</span>
          </div>
          <div ref="innerTrendChartRef" class="chart-container"></div>
        </div>

        <!-- Top5排行 + 服务器列表 -->
        <div class="row">
          <div class="card rank-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrophyBase /></el-icon>
              <span>{{ $t('supervise.gapDip.topServers') }}</span>
            </div>
            <div ref="innerRankChartRef" class="chart-container small"></div>
          </div>

          <div class="card table-card">
            <div class="card-header">
              <el-icon class="card-icon"><Platform /></el-icon>
              <span>{{ $t('supervise.gapDip.serverIp') }}</span>
            </div>
            <el-table :data="innerServerData" size="small" stripe max-height="260" style="width: 100%">
              <el-table-column prop="serverIp" :label="$t('supervise.gapDip.serverIp')" min-width="130">
                <template #default="{ row }">
                  <div class="ip-cell">
                    <span class="status-dot" :class="row.status"></span>
                    <span>{{ row.serverIp }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.sendTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.receiveTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.totalTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.newSessions')" min-width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.newSessions > 5000 ? 'danger' : row.newSessions > 2000 ? 'warning' : ''">
                    {{ formatNumber(row.newSessions) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 外网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon outer">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapDip.outerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="outerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapDip.10min')" value="10min" />
            <el-option :label="$t('supervise.gapDip.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapDip.1day')" value="1day" />
            <el-option :label="$t('supervise.gapDip.1week')" value="1week" />
            <el-option :label="$t('supervise.gapDip.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card full-width">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapDip.trafficTrend') }}</span>
          </div>
          <div ref="outerTrendChartRef" class="chart-container"></div>
        </div>

        <!-- Top5排行 + 服务器列表 -->
        <div class="row">
          <div class="card rank-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrophyBase /></el-icon>
              <span>{{ $t('supervise.gapDip.topServers') }}</span>
            </div>
            <div ref="outerRankChartRef" class="chart-container small"></div>
          </div>

          <div class="card table-card">
            <div class="card-header">
              <el-icon class="card-icon"><Platform /></el-icon>
              <span>{{ $t('supervise.gapDip.serverIp') }}</span>
            </div>
            <el-table :data="outerServerData" size="small" stripe max-height="260" style="width: 100%">
              <el-table-column prop="serverIp" :label="$t('supervise.gapDip.serverIp')" min-width="130">
                <template #default="{ row }">
                  <div class="ip-cell">
                    <span class="status-dot" :class="row.status"></span>
                    <span>{{ row.serverIp }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.sendTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.receiveTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.totalTraffic')" min-width="90">
                <template #default="{ row }">
                  <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapDip.newSessions')" min-width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.newSessions > 5000 ? 'danger' : row.newSessions > 2000 ? 'warning' : ''">
                    {{ formatNumber(row.newSessions) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Monitor, Connection, TrendCharts, TrophyBase, Platform } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 时间范围
const innerTimeRange = ref('10min')
const outerTimeRange = ref('10min')

// 图表引用
const innerTrendChartRef = ref<HTMLDivElement>()
const innerRankChartRef = ref<HTMLDivElement>()
const outerTrendChartRef = ref<HTMLDivElement>()
const outerRankChartRef = ref<HTMLDivElement>()
const charts = ref<echarts.ECharts[]>([])

// 时间标签
const timeLabels = ref<string[]>([])

// 服务器类型
interface ServerItem {
  serverIp: string
  txBytes: number
  rxBytes: number
  totalBytes: number
  newSessions: number
  status: string
}

// 模拟数据 - 内网服务器
const innerServerData = ref<ServerItem[]>([
  { serverIp: '192.168.1.10', txBytes: 10737418240, rxBytes: 21474836480, totalBytes: 32212254720, newSessions: 5234, status: 'online' },
  { serverIp: '192.168.1.11', txBytes: 5368709120, rxBytes: 10737418240, totalBytes: 16106127360, newSessions: 3156, status: 'online' },
  { serverIp: '192.168.1.12', txBytes: 2684354560, rxBytes: 5368709120, totalBytes: 8053063680, newSessions: 1876, status: 'online' },
  { serverIp: '192.168.1.13', txBytes: 1342177280, rxBytes: 2684354560, totalBytes: 4026531840, newSessions: 982, status: 'warning' },
  { serverIp: '192.168.1.14', txBytes: 671088640, rxBytes: 1342177280, totalBytes: 2013265920, newSessions: 456, status: 'online' },
  { serverIp: '192.168.1.15', txBytes: 335544320, rxBytes: 671088640, totalBytes: 1006632960, newSessions: 234, status: 'offline' },
])

// 模拟数据 - 外网服务器
const outerServerData = ref<ServerItem[]>([
  { serverIp: '10.0.0.1', txBytes: 21474836480, rxBytes: 42949672960, totalBytes: 64424509440, newSessions: 8567, status: 'online' },
  { serverIp: '10.0.0.2', txBytes: 16106127360, rxBytes: 32212254720, totalBytes: 48318382080, newSessions: 6234, status: 'online' },
  { serverIp: '10.0.0.3', txBytes: 8053063680, rxBytes: 16106127360, totalBytes: 24159191040, newSessions: 4123, status: 'online' },
  { serverIp: '10.0.0.4', txBytes: 4026531840, rxBytes: 8053063680, totalBytes: 12079595520, newSessions: 2567, status: 'warning' },
  { serverIp: '10.0.0.5', txBytes: 2013265920, rxBytes: 4026531840, totalBytes: 6039797760, newSessions: 1234, status: 'online' },
])

// 趋势数据
const innerTrendData = ref<{ tx: number[]; rx: number[]; sessions: number[] }>({ tx: [], rx: [], sessions: [] })
const outerTrendData = ref<{ tx: number[]; rx: number[]; sessions: number[] }>({ tx: [], rx: [], sessions: [] })

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// 初始化趋势图
const initTrendChart = (
  container: HTMLDivElement | undefined,
  colors: { tx: string; rx: string; sessions: string }
) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['TX', 'RX', 'Sessions'],
      textStyle: { color: '#909399' },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeLabels.value,
      axisLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.3)' } },
      axisLabel: { color: '#909399', fontSize: 10, interval: 4 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Gbps',
        position: 'left',
        axisLine: { show: false },
        axisLabel: { color: '#909399' },
        splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.1)' } }
      },
      {
        type: 'value',
        name: 'Sessions',
        position: 'right',
        axisLine: { show: false },
        axisLabel: { color: '#909399' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'TX',
        type: 'line',
        yAxisIndex: 0,
        data: innerTrendData.value.tx,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: colors.tx },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.tx}40` },
            { offset: 1, color: `${colors.tx}05` }
          ])
        }
      },
      {
        name: 'RX',
        type: 'line',
        yAxisIndex: 0,
        data: innerTrendData.value.rx,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: colors.rx },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.rx}40` },
            { offset: 1, color: `${colors.rx}05` }
          ])
        }
      },
      {
        name: 'Sessions',
        type: 'line',
        yAxisIndex: 1,
        data: innerTrendData.value.sessions,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: colors.sessions, type: 'dashed' }
      }
    ]
  })
  charts.value.push(chart)
  return chart
}

// 初始化排行图
const initRankChart = (container: HTMLDivElement | undefined, data: ServerItem[]) => {
  if (!container) return

  const chart = echarts.init(container)
  const top5 = [...data].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 5)

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0]
        return `${item.name}<br/>${formatBytes(item.value)}`
      }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: top5.map(s => s.serverIp).reverse(),
      axisLine: { show: false },
      axisLabel: { color: '#303133', fontSize: 11 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: top5.map(s => s.totalBytes).reverse(),
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#67C23A' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        color: '#909399',
        fontSize: 10,
        formatter: (params: any) => formatBytes(params.value)
      }
    }]
  })
  charts.value.push(chart)
}

// 更新数据
const updateCharts = () => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  timeLabels.value.push(timeStr)
  if (timeLabels.value.length > 30) timeLabels.value.shift()

  innerTrendData.value.tx.push(Math.round(8 + Math.random() * 4))
  innerTrendData.value.rx.push(Math.round(12 + Math.random() * 6))
  innerTrendData.value.sessions.push(Math.round(4000 + Math.random() * 2000))
  outerTrendData.value.tx.push(Math.round(15 + Math.random() * 8))
  outerTrendData.value.rx.push(Math.round(25 + Math.random() * 10))
  outerTrendData.value.sessions.push(Math.round(6000 + Math.random() * 3000))

  if (innerTrendData.value.tx.length > 30) {
    innerTrendData.value.tx.shift()
    innerTrendData.value.rx.shift()
    innerTrendData.value.sessions.shift()
    outerTrendData.value.tx.shift()
    outerTrendData.value.rx.shift()
    outerTrendData.value.sessions.shift()
  }

  // 更新趋势图
  if (charts.value[0]) {
    charts.value[0].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: innerTrendData.value.tx },
        { data: innerTrendData.value.rx },
        { data: innerTrendData.value.sessions }
      ]
    })
  }
  if (charts.value[2]) {
    charts.value[2].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: outerTrendData.value.tx },
        { data: outerTrendData.value.rx },
        { data: outerTrendData.value.sessions }
      ]
    })
  }

  // 更新会话数
  innerServerData.value.forEach(item => {
    item.newSessions = Math.round(1000 + Math.random() * 4000)
  })
  outerServerData.value.forEach(item => {
    item.newSessions = Math.round(2000 + Math.random() * 7000)
  })
}

// 定时器
let updateTimer: number | null = null

onMounted(() => {
  // 初始化时间标签
  for (let i = 0; i < 20; i++) {
    const now = new Date(Date.now() - (19 - i) * 3000)
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    timeLabels.value.push(timeStr)
    innerTrendData.value.tx.push(Math.round(8 + Math.random() * 4))
    innerTrendData.value.rx.push(Math.round(12 + Math.random() * 6))
    innerTrendData.value.sessions.push(Math.round(4000 + Math.random() * 2000))
    outerTrendData.value.tx.push(Math.round(15 + Math.random() * 8))
    outerTrendData.value.rx.push(Math.round(25 + Math.random() * 10))
    outerTrendData.value.sessions.push(Math.round(6000 + Math.random() * 3000))
  }

  // 初始化图表
  initTrendChart(innerTrendChartRef.value, { tx: '#409EFF', rx: '#67C23A', sessions: '#E6A23C' })
  initRankChart(innerRankChartRef.value, innerServerData.value)
  initTrendChart(outerTrendChartRef.value, { tx: '#E6A23C', rx: '#F56C6C', sessions: '#909399' })
  initRankChart(outerRankChartRef.value, outerServerData.value)

  // 启动定时更新
  updateTimer = window.setInterval(updateCharts, 3000)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    charts.value.forEach(chart => chart?.resize())
  })
})

onBeforeUnmount(() => {
  if (updateTimer) clearInterval(updateTimer)
  charts.value.forEach(chart => chart?.dispose())
})
</script>

<style scoped>
.gap-dip-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 设备区域 */
.device-section {
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: var(--page-header-gradient);
  color: white;
}

.section-header .section-icon {
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

.section-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.header-actions :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.header-actions :deep(.el-input__inner) {
  color: white;
}

/* 内容容器 */
.content-wrapper {
  padding: 20px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-top: 16px;
}

/* 卡片 */
.card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 14px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
}

/* 图表容器 */
.chart-container {
  height: 260px;
  padding: 10px;
}

.chart-container.small {
  height: 260px;
}

/* IP单元格 */
.ip-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #67C23A;
  box-shadow: 0 0 6px #67C23A;
}

.status-dot.warning {
  background: #E6A23C;
  box-shadow: 0 0 6px #E6A23C;
}

.status-dot.offline {
  background: #909399;
}

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-table th) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

:deep(.el-table__row:hover > td) {
  background: rgba(64, 158, 255, 0.05) !important;
}

.traffic-value {
  font-weight: 500;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.traffic-value.send {
  color: #409EFF;
}

.traffic-value.receive {
  color: #67C23A;
}

.traffic-value.total {
  color: #E6A23C;
}

/* 响应式 */
@media (max-width: 1400px) {
  .row {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 220px;
  }
}
</style>
