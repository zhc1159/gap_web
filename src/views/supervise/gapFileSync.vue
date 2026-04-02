<template>
  <div class="page-container gap-file-sync-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <span class="header-title">{{ $t('supervise.gapFileSync.title') }}</span>
      </div>
      <div class="header-actions">
        <el-select v-model="filterForm.direction" size="default" style="width: 140px">
          <el-option :label="$t('supervise.gapFileSync.directionOutbound')" value="outbound" />
          <el-option :label="$t('supervise.gapFileSync.directionInbound')" value="inbound" />
          <el-option :label="$t('supervise.gapFileSync.directionSync')" value="sync" />
        </el-select>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(statsData.totalSuccess) }}</div>
            <div class="stat-label">{{ $t('supervise.gapFileSync.totalSuccess') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatBytes(statsData.totalBytes) }}</div>
            <div class="stat-label">{{ $t('supervise.gapFileSync.totalBytes') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.strategyCount }}</div>
            <div class="stat-label">{{ $t('supervise.gapFileSync.strategyCount') }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.avgSuccess }}</div>
            <div class="stat-label">{{ $t('supervise.gapFileSync.avgSuccess') }}</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="card chart-card">
        <div class="card-header">
          <el-icon class="card-icon"><Histogram /></el-icon>
          <span>{{ $t('supervise.gapFileSync.successChart') }}</span>
        </div>
        <div ref="chartRef" class="chart-container"></div>
      </div>

      <!-- 表格区域 -->
      <div class="card table-card">
        <div class="card-header">
          <el-icon class="card-icon"><List /></el-icon>
          <span>{{ $t('supervise.gapFileSync.strategyList') }}</span>
        </div>
        <el-table
          :data="tableData"
          v-loading="loading"
          @sort-change="handleSortChange"
          size="small"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('supervise.gapFileSync.strategyName')"
            sortable
            min-width="180"
          >
            <template #default="{ row }">
              <div class="strategy-name">
                <el-icon class="strategy-icon" :class="row.status"><Folder /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="direction"
            :label="$t('supervise.gapFileSync.direction')"
            width="100"
          >
            <template #default="{ row }">
              <el-tag size="small" :type="getDirectionType(row.direction)">
                {{ getDirectionLabel(row.direction) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTime"
            :label="$t('supervise.gapFileSync.startTime')"
            width="180"
            sortable
          >
            <template #default="{ row }">
              {{ formatDate(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="success"
            :label="$t('supervise.gapFileSync.successCount')"
            width="120"
            sortable
          >
            <template #default="{ row }">
              <span class="success-value">{{ formatNumber(row.success) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="failed"
            :label="$t('supervise.gapFileSync.failedCount')"
            width="100"
            sortable
          >
            <template #default="{ row }">
              <span class="failed-value">{{ formatNumber(row.failed) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="bytes"
            :label="$t('supervise.gapFileSync.fileSize')"
            width="130"
          >
            <template #default="{ row }">
              <span class="bytes-value">{{ formatBytes(row.bytes) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('supervise.gapFileSync.progress')"
            width="150"
          >
            <template #default="{ row }">
              <el-progress
                :percentage="row.progress"
                :color="getProgressColor(row.progress)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { FolderOpened, CircleCheck, Document, Timer, TrendCharts, Histogram, List, Folder } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 图表引用
const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<echarts.ECharts | null>(null)

// 加载状态
const loading = ref(false)

// 筛选表单
const filterForm = reactive({
  direction: 'outbound' as 'outbound' | 'inbound' | 'sync'
})

// 统计数据
const statsData = reactive({
  totalSuccess: 125680,
  totalBytes: 1073741824000,
  strategyCount: 24,
  avgSuccess: '5,237'
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 排序
const sortParams = reactive({
  prop: 'name',
  order: 'ascending' as 'ascending' | 'descending'
})

// 数据类型
interface StrategyItem {
  name: string
  direction: string
  startTime: string
  success: number
  failed: number
  bytes: number
  progress: number
  status: string
}

// 模拟数据
const generateMockData = (): StrategyItem[] => {
  const directions = ['outbound', 'inbound', 'sync']
  const statuses = ['active', 'pending', 'success']
  const strategies = [
    { name: '财务数据同步', prefix: 'finance' },
    { name: '日志文件传输', prefix: 'log' },
    { name: '备份数据同步', prefix: 'backup' },
    { name: '用户档案传输', prefix: 'user' },
    { name: '系统配置同步', prefix: 'config' },
    { name: '镜像文件传输', prefix: 'image' },
    { name: '数据库备份', prefix: 'database' },
    { name: '视频文件同步', prefix: 'video' },
    { name: '文档资料传输', prefix: 'document' },
    { name: '代码仓库同步', prefix: 'code' },
    { name: '监控数据传输', prefix: 'monitor' },
    { name: '证书文件同步', prefix: 'cert' }
  ]

  return strategies.map((s, index) => ({
    name: s.name,
    direction: directions[index % 3],
    startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    success: Math.floor(1000 + Math.random() * 9000),
    failed: Math.floor(Math.random() * 50),
    bytes: Math.floor(1073741824 + Math.random() * 107374182400),
    progress: Math.floor(60 + Math.random() * 40),
    status: statuses[index % 3]
  }))
}

// 表格数据
const allData = ref<StrategyItem[]>([])
const tableData = ref<StrategyItem[]>([])

// 格式化日期
const formatDate = (date: string): string => {
  const d = new Date(date)
  return d.toLocaleString()
}

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

// 获取方向类型
const getDirectionType = (direction: string): string => {
  const types: Record<string, string> = {
    outbound: 'primary',
    inbound: 'success',
    sync: 'warning'
  }
  return types[direction] || ''
}

// 获取方向标签
const getDirectionLabel = (direction: string): string => {
  const labels: Record<string, string> = {
    outbound: '发送',
    inbound: '接收',
    sync: '同步'
  }
  return labels[direction] || direction
}

// 获取进度条颜色
const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#67C23A'
  if (progress >= 70) return '#409EFF'
  if (progress >= 50) return '#E6A23C'
  return '#F56C6C'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return

  const data = tableData.value.slice(0, 10)

  chartInstance.value.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.3)' } },
      axisLabel: {
        color: '#909399',
        rotate: 30,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: 'rgba(64, 158, 255, 0.1)' } }
    },
    series: [{
      name: '成功数',
      type: 'bar',
      data: data.map(item => item.success),
      barWidth: 20,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' },
          { offset: 0.5, color: '#67C23A' },
          { offset: 1, color: '#409EFF' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: '#409EFF',
        fontSize: 11,
        formatter: (params: any) => formatNumber(params.value)
      }
    }]
  })
}

// 处理排序
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortParams.prop = prop
  sortParams.order = order as 'ascending' | 'descending'
  filterAndPaginateData()
}

// 筛选和分页
const filterAndPaginateData = () => {
  let filtered = allData.value

  // 筛选方向
  filtered = filtered.filter(item => {
    if (filterForm.direction === 'sync') return true
    return item.direction === filterForm.direction
  })

  // 排序
  if (sortParams.prop && sortParams.order) {
    filtered = [...filtered].sort((a: any, b: any) => {
      const aVal = a[sortParams.prop]
      const bVal = b[sortParams.prop]
      if (typeof aVal === 'string') {
        return sortParams.order === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return sortParams.order === 'ascending' ? aVal - bVal : bVal - aVal
    })
  }

  pagination.total = filtered.length

  // 分页
  const start = (pagination.page - 1) * pagination.size
  tableData.value = filtered.slice(start, start + pagination.size)

  // 更新图表
  updateChart()
}

// 获取数据
const fetchData = () => {
  loading.value = true
  // 模拟API延迟
  setTimeout(() => {
    allData.value = generateMockData()
    filterAndPaginateData()
    loading.value = false
  }, 500)
}

// 监听筛选条件变化
watch(filterForm, () => {
  pagination.page = 1
  filterAndPaginateData()
}, { deep: true })

// 监听分页变化
watch([() => pagination.page, () => pagination.size], () => {
  filterAndPaginateData()
})

// 生命周期
onMounted(() => {
  fetchData()
  initChart()

  window.addEventListener('resize', () => {
    chartInstance.value?.resize()
  })
})

onBeforeUnmount(() => {
  chartInstance.value?.dispose()
})
</script>

<style scoped>
.gap-file-sync-page {
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  color: white;
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

.header-actions :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.header-actions :deep(.el-input__inner) {
  color: white;
}

/* 内容区域 */
.content-wrapper {
  padding: 0;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.stat-icon.primary {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
  color: #409EFF;
}

.stat-icon.warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  color: #E6A23C;
}

.stat-icon.info {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.05) 100%);
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 卡片 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
}

.card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 14px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
}

/* 图表 */
.chart-container {
  height: 350px;
  padding: 15px;
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

.strategy-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-icon {
  font-size: 16px;
  color: #409EFF;
}

.strategy-icon.active {
  color: #67C23A;
}

.strategy-icon.pending {
  color: #E6A23C;
}

.strategy-icon.success {
  color: #409EFF;
}

.success-value {
  color: #67C23A;
  font-weight: 500;
}

.failed-value {
  color: #F56C6C;
  font-weight: 500;
}

.bytes-value {
  color: #409EFF;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 分页 */
.pagination-wrapper {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
