<template>
  <div class="page-container gap-user-page">
    <!-- 内网设备 -->
    <div class="device-section">
      <div class="section-header">
        <div class="section-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.gapUser.innerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="innerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapUser.10min')" value="10min" />
            <el-option :label="$t('supervise.gapUser.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapUser.1day')" value="1day" />
            <el-option :label="$t('supervise.gapUser.1week')" value="1week" />
            <el-option :label="$t('supervise.gapUser.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 第一行：流量趋势图 + Top5排行 -->
        <div class="row">
          <div class="card chart-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrendCharts /></el-icon>
              <span>{{ $t('supervise.gapUser.trafficTrend') }}</span>
            </div>
            <div ref="innerTrendChartRef" class="chart-container"></div>
          </div>

          <div class="card rank-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrophyBase /></el-icon>
              <span>{{ $t('supervise.gapUser.topUsers') }}</span>
            </div>
            <div ref="innerRankChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 第二行：用户列表 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><User /></el-icon>
            <span>{{ $t('supervise.gapUser.user') }}</span>
          </div>
          <el-table :data="innerUserData" size="small" stripe>
            <el-table-column prop="user" :label="$t('supervise.gapUser.user')" width="150">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="28" class="user-avatar">{{ row.user.charAt(0).toUpperCase() }}</el-avatar>
                  <span>{{ row.user }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.sendTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.receiveTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.totalTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.inRate')" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.inRate }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.outRate')" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="plain">{{ row.outRate }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Traffic Bar">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.percent"
                  :stroke-width="8"
                  :show-text="false"
                  :color="getProgressColor(row.percent)"
                />
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
        <span class="section-title">{{ $t('supervise.gapUser.outerNet') }}</span>
        <div class="header-actions">
          <el-select v-model="outerTimeRange" size="small" style="width: 120px">
            <el-option :label="$t('supervise.gapUser.10min')" value="10min" />
            <el-option :label="$t('supervise.gapUser.1hour')" value="1hour" />
            <el-option :label="$t('supervise.gapUser.1day')" value="1day" />
            <el-option :label="$t('supervise.gapUser.1week')" value="1week" />
            <el-option :label="$t('supervise.gapUser.1month')" value="1month" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 第一行：流量趋势图 + Top5排行 -->
        <div class="row">
          <div class="card chart-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrendCharts /></el-icon>
              <span>{{ $t('supervise.gapUser.trafficTrend') }}</span>
            </div>
            <div ref="outerTrendChartRef" class="chart-container"></div>
          </div>

          <div class="card rank-card">
            <div class="card-header">
              <el-icon class="card-icon"><TrophyBase /></el-icon>
              <span>{{ $t('supervise.gapUser.topUsers') }}</span>
            </div>
            <div ref="outerRankChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 第二行：用户列表 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon"><User /></el-icon>
            <span>{{ $t('supervise.gapUser.user') }}</span>
          </div>
          <el-table :data="outerUserData" size="small" stripe>
            <el-table-column prop="user" :label="$t('supervise.gapUser.user')" width="150">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="28" class="user-avatar">{{ row.user.charAt(0).toUpperCase() }}</el-avatar>
                  <span>{{ row.user }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.sendTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value send">{{ formatBytes(row.txBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.receiveTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value receive">{{ formatBytes(row.rxBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.totalTraffic')" width="120">
              <template #default="{ row }">
                <span class="traffic-value total">{{ formatBytes(row.totalBytes) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.inRate')" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.inRate }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('supervise.gapUser.outRate')" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="plain">{{ row.outRate }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Traffic Bar">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.percent"
                  :stroke-width="8"
                  :show-text="false"
                  :color="getProgressColor(row.percent)"
                />
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
import { Monitor, Connection, TrendCharts, TrophyBase, User } from '@element-plus/icons-vue'
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

// 用户类型
interface UserItem {
  user: string
  txBytes: number
  rxBytes: number
  totalBytes: number
  inRate: string
  outRate: string
  percent: number
}

// 模拟数据 - 内网用户
const innerUserData = ref<UserItem[]>([
  { user: 'admin', txBytes: 1073741824, rxBytes: 2147483648, totalBytes: 3221225472, inRate: '125.5', outRate: '89.2', percent: 85 },
  { user: 'zhangsan', txBytes: 536870912, rxBytes: 1073741824, totalBytes: 1610612736, inRate: '78.2', outRate: '56.4', percent: 65 },
  { user: 'lisi', txBytes: 268435456, rxBytes: 536870912, totalBytes: 805306368, inRate: '45.6', outRate: '32.1', percent: 45 },
  { user: 'wangwu', txBytes: 134217728, rxBytes: 268435456, totalBytes: 402653184, inRate: '23.1', outRate: '18.5', percent: 30 },
  { user: 'zhaoliu', txBytes: 67108864, rxBytes: 134217728, totalBytes: 201326592, inRate: '12.8', outRate: '9.6', percent: 18 },
])

// 模拟数据 - 外网用户
const outerUserData = ref<UserItem[]>([
  { user: 'admin', txBytes: 2147483648, rxBytes: 4294967296, totalBytes: 6442450944, inRate: '256.3', outRate: '189.4', percent: 92 },
  { user: 'system', txBytes: 1610612736, rxBytes: 3221225472, totalBytes: 4831838208, inRate: '189.7', outRate: '145.2', percent: 78 },
  { user: 'guest', txBytes: 805306368, rxBytes: 1610612736, totalBytes: 2415919104, inRate: '98.4', outRate: '72.6', percent: 55 },
  { user: 'test', txBytes: 402653184, rxBytes: 805306368, totalBytes: 1207959552, inRate: '52.1', outRate: '38.9', percent: 35 },
  { user: 'demo', txBytes: 201326592, rxBytes: 402653184, totalBytes: 603979776, inRate: '28.6', outRate: '19.2', percent: 22 },
])

// 趋势数据
const innerTrendData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })
const outerTrendData = ref<{ tx: number[]; rx: number[] }>({ tx: [], rx: [] })

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

// 进度条颜色
const getProgressColor = (percent: number) => {
  if (percent >= 80) return '#F56C6C'
  if (percent >= 60) return '#E6A23C'
  return '#67C23A'
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
      textStyle: { color: '#fff' }
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
}

// 初始化排行图
const initRankChart = (container: HTMLDivElement | undefined, data: UserItem[]) => {
  if (!container) return

  const chart = echarts.init(container)
  const top5 = [...data].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 5)

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#909399', formatter: '{value}GB' },
      splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.1)' } }
    },
    yAxis: {
      type: 'category',
      data: top5.map(u => u.user).reverse(),
      axisLine: { show: false },
      axisLabel: { color: '#303133' },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: top5.map(u => Math.round(u.totalBytes / 1024 / 1024 / 1024)).reverse(),
      barWidth: 16,
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#67C23A' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        color: '#909399',
        formatter: '{c}GB'
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

  innerTrendData.value.tx.push(Math.round(60 + Math.random() * 40))
  innerTrendData.value.rx.push(Math.round(80 + Math.random() * 60))
  outerTrendData.value.tx.push(Math.round(100 + Math.random() * 80))
  outerTrendData.value.rx.push(Math.round(150 + Math.random() * 100))

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

  // 更新表格速率
  innerUserData.value.forEach(item => {
    item.inRate = (50 + Math.random() * 100).toFixed(1)
    item.outRate = (30 + Math.random() * 80).toFixed(1)
  })
  outerUserData.value.forEach(item => {
    item.inRate = (80 + Math.random() * 200).toFixed(1)
    item.outRate = (60 + Math.random() * 150).toFixed(1)
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
    innerTrendData.value.tx.push(Math.round(60 + Math.random() * 40))
    innerTrendData.value.rx.push(Math.round(80 + Math.random() * 60))
    outerTrendData.value.tx.push(Math.round(100 + Math.random() * 80))
    outerTrendData.value.rx.push(Math.round(150 + Math.random() * 100))
  }

  // 初始化图表
  initTrendChart(innerTrendChartRef.value, innerTrendData.value.tx, innerTrendData.value.rx, { tx: '#409EFF', rx: '#67C23A' })
  initRankChart(innerRankChartRef.value, innerUserData.value)
  initTrendChart(outerTrendChartRef.value, outerTrendData.value.tx, outerTrendData.value.rx, { tx: '#E6A23C', rx: '#F56C6C' })
  initRankChart(outerRankChartRef.value, outerUserData.value)

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
.gap-user-page {
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
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
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
  height: 260px;
  padding: 10px;
}

.chart-card .chart-container {
  height: 280px;
}

.rank-card .chart-container {
  height: 280px;
}

/* 用户单元格 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  font-size: 12px;
  font-weight: bold;
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
    height: 240px;
  }
}
</style>
