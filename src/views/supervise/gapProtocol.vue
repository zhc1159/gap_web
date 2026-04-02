<template>
  <div class="page-container gap-protocol-page">
    <!-- 内网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapProtocol.innerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="innerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapProtocol.10min')" value="10min" />
            <el-option :label="$t('supervise.gapProtocol.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapProtocol.1day')" value="1day" />
            <el-option :label="$t('supervise.gapProtocol.1week')" value="1week" />
            <el-option :label="$t('supervise.gapProtocol.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card full-width">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapProtocol.trafficTrend') }}</span>
          </div>
          <div ref="innerTrendChartRef" class="chart-container"></div>
        </div>

        <!-- 协议分布 + 应用列表 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon"><PieChart /></el-icon>
              <span>{{ $t('supervise.gapProtocol.protocolDistribution') }}</span>
            </div>
            <div ref="innerPieChartRef" class="chart-container small"></div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon"><List /></el-icon>
              <span>{{ $t('supervise.gapProtocol.appName') }}</span>
            </div>
            <el-table :data="innerAppData" size="small" max-height="280">
              <el-table-column prop="appName" :label="$t('supervise.gapProtocol.appName')" />
              <el-table-column :label="$t('supervise.gapProtocol.sendTraffic')" width="100">
                <template #default="{ row }">
                  <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.receiveTraffic')" width="100">
                <template #default="{ row }">
                  <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.inRate')" width="90">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain">{{ row.inRate }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.outRate')" width="90">
                <template #default="{ row }">
                  <el-tag size="small" type="success" effect="plain">{{ row.outRate }}</el-tag>
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
        <span class="section-title">{{ $t('supervise.gapProtocol.outerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="outerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapProtocol.10min')" value="10min" />
            <el-option :label="$t('supervise.gapProtocol.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapProtocol.1day')" value="1day" />
            <el-option :label="$t('supervise.gapProtocol.1week')" value="1week" />
            <el-option :label="$t('supervise.gapProtocol.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card full-width">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapProtocol.trafficTrend') }}</span>
          </div>
          <div ref="outerTrendChartRef" class="chart-container"></div>
        </div>

        <!-- 协议分布 + 应用列表 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon"><PieChart /></el-icon>
              <span>{{ $t('supervise.gapProtocol.protocolDistribution') }}</span>
            </div>
            <div ref="outerPieChartRef" class="chart-container small"></div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon"><List /></el-icon>
              <span>{{ $t('supervise.gapProtocol.appName') }}</span>
            </div>
            <el-table :data="outerAppData" size="small" max-height="280">
              <el-table-column prop="appName" :label="$t('supervise.gapProtocol.appName')" />
              <el-table-column :label="$t('supervise.gapProtocol.sendTraffic')" width="100">
                <template #default="{ row }">
                  <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.receiveTraffic')" width="100">
                <template #default="{ row }">
                  <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.inRate')" width="90">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain">{{ row.inRate }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('supervise.gapProtocol.outRate')" width="90">
                <template #default="{ row }">
                  <el-tag size="small" type="success" effect="plain">{{ row.outRate }}</el-tag>
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
import { Monitor, Connection, TrendCharts, PieChart, List } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 类型定义
interface AppItem {
  appName: string
  txBytes: number
  rxBytes: number
  totalBytes: number
  inRate: string
  outRate: string
}

// 时间范围
const innerTimeRange = ref('10min')
const outerTimeRange = ref('10min')

// 图表引用
const innerTrendChartRef = ref<HTMLDivElement>()
const innerPieChartRef = ref<HTMLDivElement>()
const outerTrendChartRef = ref<HTMLDivElement>()
const outerPieChartRef = ref<HTMLDivElement>()
const charts = ref<echarts.ECharts[]>([])

// 时间标签
const timeLabels = ref<string[]>([])

// 图表数据
const innerTrendData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })
const outerTrendData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })

// 模拟数据 - 内网应用
const innerAppData = ref<AppItem[]>([
  { appName: 'HTTP', txBytes: 1073741824, rxBytes: 2147483648, totalBytes: 3221225472, inRate: '125.5', outRate: '89.2' },
  { appName: 'HTTPS', txBytes: 2147483648, rxBytes: 4294967296, totalBytes: 6442450944, inRate: '256.3', outRate: '198.7' },
  { appName: 'FTP', txBytes: 536870912, rxBytes: 1073741824, totalBytes: 1610612736, inRate: '78.4', outRate: '45.6' },
  { appName: 'DNS', txBytes: 107374182, rxBytes: 214748364, totalBytes: 322122546, inRate: '12.5', outRate: '8.3' },
  { appName: 'SSH', txBytes: 53687091, rxBytes: 107374182, totalBytes: 161061273, inRate: '6.2', outRate: '4.1' },
  { appName: 'SMTP', txBytes: 268435456, rxBytes: 536870912, totalBytes: 805306368, inRate: '32.1', outRate: '21.8' },
])

// 模拟数据 - 外网应用
const outerAppData = ref<AppItem[]>([
  { appName: 'HTTP', txBytes: 2147483648, rxBytes: 4294967296, totalBytes: 6442450944, inRate: '256.3', outRate: '189.4' },
  { appName: 'HTTPS', txBytes: 4294967296, rxBytes: 8589934592, totalBytes: 12884901888, inRate: '512.6', outRate: '387.2' },
  { appName: 'FTP', txBytes: 1073741824, rxBytes: 2147483648, totalBytes: 3221225472, inRate: '156.8', outRate: '91.2' },
  { appName: 'DNS', txBytes: 214748364, rxBytes: 429496728, totalBytes: 644245092, inRate: '25.1', outRate: '16.6' },
  { appName: 'SMTP', txBytes: 536870912, rxBytes: 1073741824, totalBytes: 1610612736, inRate: '64.2', outRate: '43.6' },
  { appName: 'POP3', txBytes: 268435456, rxBytes: 536870912, totalBytes: 805306368, inRate: '32.1', outRate: '21.8' },
])

// 协议分布数据
const innerPieData = [
  { name: 'HTTPS', value: 45 },
  { name: 'HTTP', value: 25 },
  { name: 'FTP', value: 15 },
  { name: 'SMTP', value: 8 },
  { name: 'Other', value: 7 }
]

const outerPieData = [
  { name: 'HTTPS', value: 55 },
  { name: 'HTTP', value: 20 },
  { name: 'FTP', value: 12 },
  { name: 'SMTP', value: 8 },
  { name: 'Other', value: 5 }
]

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

// 初始化趋势图
const initTrendChart = (
  container: HTMLDivElement | undefined,
  txData: number[],
  rxData: number[],
  colors: { tx: string; rx: string }
) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['TX', 'RX'],
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
    yAxis: {
      type: 'value',
      name: 'Mbps',
      axisLine: { show: false },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.1)' } }
    },
    series: [
      {
        name: 'TX',
        type: 'line',
        data: txData,
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
        data: rxData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: colors.rx },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.rx}40` },
            { offset: 1, color: `${colors.rx}05` }
          ])
        }
      }
    ]
  })
  charts.value.push(chart)
  return chart
}

// 初始化饼图
const initPieChart = (container: HTMLDivElement | undefined, data: typeof innerPieData) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#909399', fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#fff' }
      },
      data: data.map((item, index) => ({
        ...item,
        itemStyle: {
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][index]
        }
      }))
    }]
  })
  charts.value.push(chart)
  return chart
}

// 更新图表数据
const updateCharts = () => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  timeLabels.value.push(timeStr)
  if (timeLabels.value.length > 30) timeLabels.value.shift()

  // 生成随机数据
  innerTrendData.value.tx.push(Math.round(80 + Math.random() * 60))
  innerTrendData.value.rx.push(Math.round(100 + Math.random() * 80))
  outerTrendData.value.tx.push(Math.round(150 + Math.random() * 100))
  outerTrendData.value.rx.push(Math.round(200 + Math.random() * 120))

  if (innerTrendData.value.tx.length > 30) {
    innerTrendData.value.tx.shift()
    innerTrendData.value.rx.shift()
    outerTrendData.value.tx.shift()
    outerTrendData.value.rx.shift()
  }

  // 更新趋势图
  if (charts.value[0]) {
    charts.value[0].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: innerTrendData.value.tx },
        { data: innerTrendData.value.rx }
      ]
    })
  }
  if (charts.value[2]) {
    charts.value[2].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: outerTrendData.value.tx },
        { data: outerTrendData.value.rx }
      ]
    })
  }

  // 更新表格中的速率
  innerAppData.value.forEach(item => {
    item.inRate = (50 + Math.random() * 200).toFixed(1)
    item.outRate = (30 + Math.random() * 150).toFixed(1)
  })
  outerAppData.value.forEach(item => {
    item.inRate = (100 + Math.random() * 400).toFixed(1)
    item.outRate = (80 + Math.random() * 300).toFixed(1)
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
    innerTrendData.value.tx.push(Math.round(80 + Math.random() * 60))
    innerTrendData.value.rx.push(Math.round(100 + Math.random() * 80))
    outerTrendData.value.tx.push(Math.round(150 + Math.random() * 100))
    outerTrendData.value.rx.push(Math.round(200 + Math.random() * 120))
  }

  // 初始化图表
  initTrendChart(innerTrendChartRef.value, innerTrendData.value.tx, innerTrendData.value.rx, { tx: '#409EFF', rx: '#67C23A' })
  initPieChart(innerPieChartRef.value, innerPieData)
  initTrendChart(outerTrendChartRef.value, outerTrendData.value.tx, outerTrendData.value.rx, { tx: '#E6A23C', rx: '#F56C6C' })
  initPieChart(outerPieChartRef.value, outerPieData)

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
.gap-protocol-page {
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
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

.section-header .section-icon.outer {
  background: rgba(255, 255, 255, 0.2);
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
}

.card.full-width {
  width: 100%;
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
  height: 280px;
  padding: 10px;
}

.chart-container.small {
  height: 260px;
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

/* 响应式 */
@media (max-width: 1400px) {
  .row {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 240px;
  }
}
</style>
