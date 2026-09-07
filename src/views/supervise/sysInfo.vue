<template>
  <div class="page-container sys-info-page">
    <!-- 内网设备 -->
    <div class="device-section inner-net">
      <div class="section-header">
        <div class="section-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.sysInfo.innerNet') }}</span>
        <span class="status-badge online">Online</span>
      </div>

      <div class="content-wrapper">
        <!-- 第一行：CPU使用率 + 内存使用率 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon cpu"><Cpu /></el-icon>
              <span>{{ $t('supervise.sysInfo.cpuUsage') }}</span>
              <span class="current-value" :class="getValueClass(innerData.cpuValue)">
                {{ innerData.cpuValue }}%
              </span>
            </div>
            <div ref="innerCpuChart" class="chart-container"></div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon mem"><Memo /></el-icon>
              <span>{{ $t('supervise.sysInfo.memUsage') }}</span>
              <span class="current-value" :class="getValueClass(innerData.memValue)">
                {{ innerData.memValue }}%
              </span>
            </div>
            <div ref="innerMemChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 第二行：系统信息 + 硬盘使用 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon info"><InfoFilled /></el-icon>
              <span>{{ $t('supervise.sysInfo.systemInfo') }}</span>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.cpuInfo') }}</span>
                <span class="value">{{ innerData.cpuMsg }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.memInfo') }}</span>
                <span class="value">{{ innerData.memMsg }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.runTime') }}</span>
                <span class="value highlight">{{ innerData.uptime }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.licenseStatus') }}</span>
                <span class="value success">{{ innerData.licenseStatus }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon disk"><FolderOpened /></el-icon>
              <span>{{ $t('supervise.sysInfo.diskUsage') }}</span>
              <span class="total-label">{{ $t('supervise.sysInfo.total') }}: {{ innerData.totalDisk }}GB</span>
            </div>
            <div ref="innerDiskChart" class="chart-container small"></div>
          </div>
        </div>

        <!-- 网口速率 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon network"><Connection /></el-icon>
            <span>{{ $t('supervise.sysInfo.networkSpeed') }}</span>
          </div>
          <div ref="innerNetworkChart" class="chart-container large"></div>
        </div>
      </div>
    </div>

    <!-- 外网设备 -->
    <div class="device-section outer-net">
      <div class="section-header">
        <div class="section-icon outer">
          <el-icon><Connection /></el-icon>
        </div>
        <span class="section-title">{{ $t('supervise.sysInfo.outerNet') }}</span>
        <span class="status-badge online">Online</span>
      </div>

      <div class="content-wrapper">
        <!-- 第一行：CPU使用率 + 内存使用率 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon cpu"><Cpu /></el-icon>
              <span>{{ $t('supervise.sysInfo.cpuUsage') }}</span>
              <span class="current-value" :class="getValueClass(outerData.cpuValue)">
                {{ outerData.cpuValue }}%
              </span>
            </div>
            <div ref="outerCpuChart" class="chart-container"></div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon mem"><Memo /></el-icon>
              <span>{{ $t('supervise.sysInfo.memUsage') }}</span>
              <span class="current-value" :class="getValueClass(outerData.memValue)">
                {{ outerData.memValue }}%
              </span>
            </div>
            <div ref="outerMemChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 第二行：系统信息 + 硬盘使用 -->
        <div class="row">
          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon info"><InfoFilled /></el-icon>
              <span>{{ $t('supervise.sysInfo.systemInfo') }}</span>
            </div>
            <div class="info-list">
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.cpuInfo') }}</span>
                <span class="value">{{ outerData.cpuMsg }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.memInfo') }}</span>
                <span class="value">{{ outerData.memMsg }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.runTime') }}</span>
                <span class="value highlight">{{ outerData.uptime }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('supervise.sysInfo.licenseStatus') }}</span>
                <span class="value success">{{ outerData.licenseStatus }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <el-icon class="card-icon disk"><FolderOpened /></el-icon>
              <span>{{ $t('supervise.sysInfo.diskUsage') }}</span>
              <span class="total-label">{{ $t('supervise.sysInfo.total') }}: {{ outerData.totalDisk }}GB</span>
            </div>
            <div ref="outerDiskChart" class="chart-container small"></div>
          </div>
        </div>

        <!-- 网口速率 -->
        <div class="card">
          <div class="card-header">
            <el-icon class="card-icon network"><Connection /></el-icon>
            <span>{{ $t('supervise.sysInfo.networkSpeed') }}</span>
          </div>
          <div ref="outerNetworkChart" class="chart-container large"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Monitor, Connection, Cpu, Memo, InfoFilled, FolderOpened } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 图表实例
const charts = ref<echarts.ECharts[]>([])

// 图表容器引用
const innerCpuChart = ref<HTMLDivElement>()
const innerMemChart = ref<HTMLDivElement>()
const innerDiskChart = ref<HTMLDivElement>()
const innerNetworkChart = ref<HTMLDivElement>()
const outerCpuChart = ref<HTMLDivElement>()
const outerMemChart = ref<HTMLDivElement>()
const outerDiskChart = ref<HTMLDivElement>()
const outerNetworkChart = ref<HTMLDivElement>()

// 模拟数据 - 内网
const innerData = reactive({
  cpuValue: 35,
  memValue: 42,
  cpuMsg: 'Intel Xeon E5-2680 v4 @ 2.40GHz',
  memMsg: '64GB DDR4 ECC',
  uptime: '125天 14小时 32分钟',
  licenseStatus: '正常',
  totalDisk: 2000
})

// 模拟数据 - 外网
const outerData = reactive({
  cpuValue: 28,
  memValue: 38,
  cpuMsg: 'Intel Xeon E5-2680 v4 @ 2.40GHz',
  memMsg: '64GB DDR4 ECC',
  uptime: '125天 14小时 28分钟',
  licenseStatus: '正常',
  totalDisk: 2000
})

// CPU/内存历史数据
const cpuHistory = { inner: [] as number[], outer: [] as number[] }
const memHistory = { inner: [] as number[], outer: [] as number[] }
const timeLabels = [] as string[]

// 网口速率历史数据
const networkHistory = {
  inner: { eth0: [] as number[], eth1: [] as number[], eth2: [] as number[] },
  outer: { eth0: [] as number[], eth1: [] as number[], eth2: [] as number[] }
}
const networkCurrent = {
  inner: { eth0: 120, eth1: 85, eth2: 45 },
  outer: { eth0: 95, eth1: 70, eth2: 35 }
}

// 定时器
let updateTimer: number | null = null

// 获取值样式类
const getValueClass = (value: number) => {
  if (value >= 80) return 'danger'
  if (value >= 60) return 'warning'
  return 'normal'
}

// 初始化 CPU 图表
const initCpuChart = (container: HTMLDivElement | undefined, data: number[]) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff', fontSize: 12 }
    },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.3)' } },
      axisLabel: { color: '#909399', fontSize: 10, interval: 4 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: '#909399', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.1)' } }
    },
    series: [{
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#409EFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      }
    }]
  })
  charts.value.push(chart)
  return chart
}

// 初始化内存图表
const initMemChart = (container: HTMLDivElement | undefined, data: number[]) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#67C23A',
      textStyle: { color: '#fff', fontSize: 12 }
    },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLine: { lineStyle: { color: 'rgba(103, 194, 58, 0.3)' } },
      axisLabel: { color: '#909399', fontSize: 10, interval: 4 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: '#909399', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(103, 194, 58, 0.1)' } }
    },
    series: [{
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#67C23A' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103, 194, 58, 0.4)' },
          { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
        ])
      }
    }]
  })
  charts.value.push(chart)
  return chart
}

// 初始化硬盘图表
const initDiskChart = (container: HTMLDivElement | undefined) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}GB ({d}%)'
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
      data: [
        { name: '系统盘', value: 256, itemStyle: { color: '#409EFF' } },
        { name: '数据盘', value: 512, itemStyle: { color: '#67C23A' } },
        { name: '备份盘', value: 384, itemStyle: { color: '#E6A23C' } },
        { name: '剩余空间', value: 848, itemStyle: { color: '#909399' } }
      ]
    }]
  })
  charts.value.push(chart)
  return chart
}

// 初始化网络图表
const initNetworkChart = (container: HTMLDivElement | undefined, initData: number[][]) => {
  if (!container) return

  const chart = echarts.init(container)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            ${p.seriesName}: <b>${p.value} Mbps</b></div>`
        })
        return html
      }
    },
    legend: {
      data: ['eth0', 'eth1', 'eth2'],
      textStyle: { color: '#909399' },
      top: 0
    },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: timeLabels,
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
        name: 'eth0',
        type: 'line',
        data: initData[0],
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
          ])
        }
      },
      {
        name: 'eth1',
        type: 'line',
        data: initData[1],
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.02)' }
          ])
        }
      },
      {
        name: 'eth2',
        type: 'line',
        data: initData[2],
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#E6A23C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.02)' }
          ])
        }
      }
    ]
  })
  charts.value.push(chart)
  return chart
}

// 生成随机波动值
const randomChange = (current: number, min: number, max: number) => {
  const change = (Math.random() - 0.5) * 10
  return Math.max(min, Math.min(max, current + change))
}

// 更新数据
const updateData = () => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  timeLabels.push(timeStr)
  if (timeLabels.length > 30) timeLabels.shift()

  // 更新内网数据
  innerData.cpuValue = Math.round(randomChange(innerData.cpuValue, 10, 70))
  innerData.memValue = Math.round(randomChange(innerData.memValue, 20, 60))
  cpuHistory.inner.push(innerData.cpuValue)
  memHistory.inner.push(innerData.memValue)
  if (cpuHistory.inner.length > 30) {
    cpuHistory.inner.shift()
    memHistory.inner.shift()
  }

  // 更新外网数据
  outerData.cpuValue = Math.round(randomChange(outerData.cpuValue, 10, 60))
  outerData.memValue = Math.round(randomChange(outerData.memValue, 20, 55))
  cpuHistory.outer.push(outerData.cpuValue)
  memHistory.outer.push(outerData.memValue)
  if (cpuHistory.outer.length > 30) {
    cpuHistory.outer.shift()
    memHistory.outer.shift()
  }

  // 更新图表（索引: 0=内网CPU, 1=内网内存, 4=外网CPU, 5=外网内存）
  updateChartData(0, cpuHistory.inner)
  updateChartData(1, memHistory.inner)
  updateChartData(4, cpuHistory.outer)
  updateChartData(5, memHistory.outer)

  // 更新内网网口速率（渐进式变化）
  const ports = ['eth0', 'eth1', 'eth2'] as const
  const innerRanges = [{ min: 60, max: 200 }, { min: 40, max: 150 }, { min: 10, max: 80 }]
  const outerRanges = [{ min: 50, max: 180 }, { min: 30, max: 130 }, { min: 5, max: 70 }]

  ports.forEach((p, i) => {
    networkCurrent.inner[p] = Math.round(randomChange(networkCurrent.inner[p], innerRanges[i].min, innerRanges[i].max))
    networkHistory.inner[p].push(networkCurrent.inner[p])
    if (networkHistory.inner[p].length > 30) networkHistory.inner[p].shift()

    networkCurrent.outer[p] = Math.round(randomChange(networkCurrent.outer[p], outerRanges[i].min, outerRanges[i].max))
    networkHistory.outer[p].push(networkCurrent.outer[p])
    if (networkHistory.outer[p].length > 30) networkHistory.outer[p].shift()
  })

  // 更新网络图表（索引: 3=内网, 7=外网）
  updateNetworkChart(3, [networkHistory.inner.eth0, networkHistory.inner.eth1, networkHistory.inner.eth2])
  updateNetworkChart(7, [networkHistory.outer.eth0, networkHistory.outer.eth1, networkHistory.outer.eth2])
}

// 更新图表数据
const updateChartData = (index: number, data: number[]) => {
  if (charts.value[index]) {
    charts.value[index].setOption({
      xAxis: { data: timeLabels },
      series: [{ data: data }]
    })
  }
}

// 更新网络图表
const updateNetworkChart = (index: number, data: number[][]) => {
  if (charts.value[index]) {
    charts.value[index].setOption({
      xAxis: { data: timeLabels },
      series: data.map(d => ({ data: d }))
    })
  }
}

// 初始化
onMounted(() => {
  // 初始化历史数据
  for (let i = 0; i < 20; i++) {
    const now = new Date(Date.now() - (19 - i) * 3000)
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    timeLabels.push(timeStr)
    cpuHistory.inner.push(Math.round(30 + Math.random() * 20))
    memHistory.inner.push(Math.round(35 + Math.random() * 15))
    cpuHistory.outer.push(Math.round(25 + Math.random() * 20))
    memHistory.outer.push(Math.round(30 + Math.random() * 15))
    // 网口初始历史数据
    networkHistory.inner.eth0.push(Math.round(100 + Math.random() * 40))
    networkHistory.inner.eth1.push(Math.round(70 + Math.random() * 30))
    networkHistory.inner.eth2.push(Math.round(30 + Math.random() * 20))
    networkHistory.outer.eth0.push(Math.round(80 + Math.random() * 35))
    networkHistory.outer.eth1.push(Math.round(55 + Math.random() * 25))
    networkHistory.outer.eth2.push(Math.round(20 + Math.random() * 18))
  }
  // 同步当前值
  networkCurrent.inner.eth0 = networkHistory.inner.eth0[19]
  networkCurrent.inner.eth1 = networkHistory.inner.eth1[19]
  networkCurrent.inner.eth2 = networkHistory.inner.eth2[19]
  networkCurrent.outer.eth0 = networkHistory.outer.eth0[19]
  networkCurrent.outer.eth1 = networkHistory.outer.eth1[19]
  networkCurrent.outer.eth2 = networkHistory.outer.eth2[19]

  // 初始化图表
  initCpuChart(innerCpuChart.value, cpuHistory.inner)
  initMemChart(innerMemChart.value, memHistory.inner)
  initDiskChart(innerDiskChart.value)
  initNetworkChart(innerNetworkChart.value, [networkHistory.inner.eth0, networkHistory.inner.eth1, networkHistory.inner.eth2])

  initCpuChart(outerCpuChart.value, cpuHistory.outer)
  initMemChart(outerMemChart.value, memHistory.outer)
  initDiskChart(outerDiskChart.value)
  initNetworkChart(outerNetworkChart.value, [networkHistory.outer.eth0, networkHistory.outer.eth1, networkHistory.outer.eth2])

  // 启动定时更新
  updateTimer = window.setInterval(updateData, 3000)

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
.sys-info-page {
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

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.online {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* 内容容器 */
.content-wrapper {
  padding: 20px;
}

/* 行布局 */
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.row:last-of-type {
  margin-bottom: 0;
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
  transform: translateY(-2px);
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
  color: white;
}

.card-icon.cpu { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.card-icon.mem { background: linear-gradient(135deg, #67C23A, #85ce61); }
.card-icon.info { background: linear-gradient(135deg, #909399, #a6a9ad); }
.card-icon.disk { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.card-icon.network { background: linear-gradient(135deg, #409EFF, #67C23A); }

.current-value {
  margin-left: auto;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.current-value.normal { color: #67C23A; }
.current-value.warning { color: #E6A23C; }
.current-value.danger {
  color: #F56C6C;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.total-label {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-weight: normal;
}

/* 图表容器 */
.chart-container {
  height: 180px;
  padding: 10px;
}

.chart-container.small {
  height: 160px;
}

.chart-container.large {
  height: 220px;
}

/* 信息卡片 */
.info-list {
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(64, 158, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  width: 80px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.info-row .value {
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 500;
}

.info-row .value.highlight {
  color: #409EFF;
}

.info-row .value.success {
  color: #67C23A;
}

/* 全宽卡片 */
.full-width {
  grid-column: span 4;
}

/* 响应式 */
@media (max-width: 1200px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
