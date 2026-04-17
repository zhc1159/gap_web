<template>
  <div class="page-container gap-ineth-page">
    <!-- 内网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapIneth.innerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="innerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapIneth.10min')" value="10min" />
            <el-option :label="$t('supervise.gapIneth.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapIneth.1day')" value="1day" />
            <el-option :label="$t('supervise.gapIneth.1week')" value="1week" />
            <el-option :label="$t('supervise.gapIneth.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapIneth.trafficTrend') }}</span>
          </div>
          <div ref="innerChartRef" class="chart-container"></div>
        </div>

        <!-- 接口列表 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><List /></el-icon>
            <span>{{ $t('supervise.gapIneth.interfaceName') }}</span>
          </div>
          <el-table
            :data="innerInterfaces"
            highlight-current-row
            @current-change="(row: InterfaceItem) => handleSelectInterface('inner', row)"
          >
            <el-table-column width="55">
              <template #default="{ row }">
                <el-radio v-model="innerSelected" :value="row.name">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('supervise.gapIneth.interfaceName')" />
            <el-table-column :label="$t('supervise.gapIneth.sendTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.receiveTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.totalTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.currentRate')" width="140">
              <template #default="{ row }">
                <span class="rate-value">{{ row.rate }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 外网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon outer">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapIneth.outerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="outerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapIneth.10min')" value="10min" />
            <el-option :label="$t('supervise.gapIneth.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapIneth.1day')" value="1day" />
            <el-option :label="$t('supervise.gapIneth.1week')" value="1week" />
            <el-option :label="$t('supervise.gapIneth.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 流量趋势图 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><TrendCharts /></el-icon>
            <span>{{ $t('supervise.gapIneth.trafficTrend') }}</span>
          </div>
          <div ref="outerChartRef" class="chart-container"></div>
        </div>

        <!-- 接口列表 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><List /></el-icon>
            <span>{{ $t('supervise.gapIneth.interfaceName') }}</span>
          </div>
          <el-table
            :data="outerInterfaces"
            highlight-current-row
            @current-change="(row: InterfaceItem) => handleSelectInterface('outer', row)"
          >
            <el-table-column width="55">
              <template #default="{ row }">
                <el-radio v-model="outerSelected" :value="row.name">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('supervise.gapIneth.interfaceName')" />
            <el-table-column :label="$t('supervise.gapIneth.sendTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.receiveTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.totalTraffic')" width="130">
              <template #default="{ row }">
                <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapIneth.currentRate')" width="140">
              <template #default="{ row }">
                <span class="rate-value">{{ row.rate }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Monitor, Connection, TrendCharts, List } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 类型定义
interface InterfaceItem {
  name: string
  txBytes: number
  rxBytes: number
  totalBytes: number
  rate: string
}

// 时间范围
const innerTimeRange = ref('10min')
const outerTimeRange = ref('10min')

// 选中的接口
const innerSelected = ref('eth0')
const outerSelected = ref('eth0')

// 图表引用
const innerChartRef = ref<HTMLDivElement>()
const outerChartRef = ref<HTMLDivElement>()
const charts = ref<echarts.ECharts[]>([])

// 模拟数据 - 内网接口
const innerInterfaces = ref<InterfaceItem[]>([
  { name: 'eth0', txBytes: 1073741824, rxBytes: 2147483648, totalBytes: 3221225472, rate: '125.5 Mbps' },
  { name: 'eth1', txBytes: 536870912, rxBytes: 1073741824, totalBytes: 1610612736, rate: '78.2 Mbps' },
  { name: 'eth2', txBytes: 268435456, rxBytes: 536870912, totalBytes: 805306368, rate: '45.6 Mbps' },
  { name: 'eth3', txBytes: 134217728, rxBytes: 268435456, totalBytes: 402653184, rate: '23.1 Mbps' },
])

// 模拟数据 - 外网接口
const outerInterfaces = ref<InterfaceItem[]>([
  { name: 'eth0', txBytes: 2147483648, rxBytes: 4294967296, totalBytes: 6442450944, rate: '256.3 Mbps' },
  { name: 'eth1', txBytes: 1610612736, rxBytes: 3221225472, totalBytes: 4831838208, rate: '189.7 Mbps' },
  { name: 'eth2', txBytes: 805306368, rxBytes: 1610612736, totalBytes: 2415919104, rate: '98.4 Mbps' },
])

// 时间标签数据
const timeLabels = ref<string[]>([])

// 图表数据
const innerChartData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })
const outerChartData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

// 选择接口
const handleSelectInterface = (type: 'inner' | 'outer', row: InterfaceItem) => {
  if (type === 'inner') {
    innerSelected.value = row.name
  } else {
    outerSelected.value = row.name
  }
}

// 初始化图表
const initChart = (
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

// 更新图表数据
const updateCharts = () => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  timeLabels.value.push(timeStr)
  if (timeLabels.value.length > 30) timeLabels.value.shift()

  // 生成随机数据
  innerChartData.value.tx.push(Math.round(80 + Math.random() * 60))
  innerChartData.value.rx.push(Math.round(100 + Math.random() * 80))
  outerChartData.value.tx.push(Math.round(150 + Math.random() * 100))
  outerChartData.value.rx.push(Math.round(200 + Math.random() * 120))

  if (innerChartData.value.tx.length > 30) {
    innerChartData.value.tx.shift()
    innerChartData.value.rx.shift()
    outerChartData.value.tx.shift()
    outerChartData.value.rx.shift()
  }

  // 更新图表
  if (charts.value[0]) {
    charts.value[0].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: innerChartData.value.tx },
        { data: innerChartData.value.rx }
      ]
    })
  }
  if (charts.value[1]) {
    charts.value[1].setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: outerChartData.value.tx },
        { data: outerChartData.value.rx }
      ]
    })
  }

  // 更新表格中的速率
  innerInterfaces.value.forEach(item => {
    item.rate = `${(50 + Math.random() * 150).toFixed(1)} Mbps`
  })
  outerInterfaces.value.forEach(item => {
    item.rate = `${(100 + Math.random() * 200).toFixed(1)} Mbps`
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
    innerChartData.value.tx.push(Math.round(80 + Math.random() * 60))
    innerChartData.value.rx.push(Math.round(100 + Math.random() * 80))
    outerChartData.value.tx.push(Math.round(150 + Math.random() * 100))
    outerChartData.value.rx.push(Math.round(200 + Math.random() * 120))
  }

  // 初始化图表
  initChart(innerChartRef.value, innerChartData.value.tx, innerChartData.value.rx, { tx: '#409EFF', rx: '#67C23A' })
  initChart(outerChartRef.value, outerChartData.value.tx, outerChartData.value.rx, { tx: '#E6A23C', rx: '#F56C6C' })

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
.gap-ineth-page {
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  color: var(--el-text-color-primary);
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

:deep(.el-table__row.current-row > td) {
  background: rgba(64, 158, 255, 0.1) !important;
}

.traffic-value {
  font-weight: 500;
  font-family: 'Courier New', monospace;
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

.rate-value {
  color: var(--el-text-color-placeholder);
  font-family: 'Courier New', monospace;
}

/* 响应式 */
@media (max-width: 1400px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 240px;
  }
}
</style>
