<template>
  <div class="page-container sys-time-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.sysTime.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.sysTime.description') }}</span>
    </div>

    <!-- 时间展示区 - 左侧大时钟 + 右侧信息 -->
    <div class="time-hero">
      <div class="time-hero-left">
        <div class="clock-ring">
          <svg viewBox="0 0 120 120" class="clock-svg">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="2" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#clockGrad)" stroke-width="2.5"
              stroke-dasharray="339.292" :stroke-dashoffset="clockProgress" stroke-linecap="round"
              transform="rotate(-90 60 60)" />
            <defs>
              <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#409EFF" />
                <stop offset="100%" stop-color="#67C23A" />
              </linearGradient>
            </defs>
          </svg>
          <div class="clock-inner">
            <span class="clock-seconds">{{ seconds }}</span>
          </div>
        </div>
      </div>
      <div class="time-hero-right">
        <div class="time-date-row">
          <span class="time-date-text">{{ dateDisplay }}</span>
          <span class="time-weekday">{{ weekdayDisplay }}</span>
        </div>
        <div class="time-value-row">
          <span class="time-hour">{{ hours }}</span>
          <span class="time-colon" :class="{ blink: colonVisible }">:</span>
          <span class="time-minute">{{ minutes }}</span>
        </div>
        <div class="time-label-row">
          <el-icon class="time-label-icon"><Clock /></el-icon>
          <span>{{ $t('systemManage.sysTime.currentTime.label') }}</span>
        </div>
      </div>
    </div>

    <!-- 时间设置方式 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="section-header">
          <div class="section-dot"></div>
          <h3 class="section-title">{{ $t('systemManage.sysTime.mode.label') }}</h3>
        </div>

        <!-- 三栏模式选择 -->
        <div class="mode-cards">
          <div
            v-for="mode in modes"
            :key="mode.value"
            class="mode-card"
            :class="{ active: selectedMode === mode.value }"
            @click="selectedMode = mode.value"
          >
            <div class="mode-card-indicator"></div>
            <div class="mode-card-body">
              <div class="mode-icon-row">
                <div class="mode-icon-circle">
                  <el-icon :size="22"><component :is="mode.icon" /></el-icon>
                </div>
                <div class="mode-radio-dot" :class="{ checked: selectedMode === mode.value }">
                  <div class="radio-inner"></div>
                </div>
              </div>
              <span class="mode-name">{{ mode.label }}</span>
              <span class="mode-desc">{{ mode.desc }}</span>
            </div>
          </div>
        </div>

        <!-- 展开内容区 -->
        <transition name="slide-fade" mode="out-in">
          <!-- 手动设置 -->
          <div v-if="selectedMode === 0" key="manual" class="mode-content-panel">
            <div class="panel-header">
              <el-icon :size="18" color="#409EFF"><EditPen /></el-icon>
              <span class="panel-title">{{ $t('systemManage.sysTime.mode.manual') }}</span>
            </div>
            <div class="panel-body">
              <el-form label-width="100px" label-position="right" class="time-form">
                <el-form-item :label="$t('systemManage.sysTime.form.date')">
                  <el-date-picker
                    v-model="manualDate"
                    type="date"
                    :placeholder="$t('systemManage.sysTime.form.datePlaceholder')"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 280px"
                  />
                </el-form-item>
                <el-form-item :label="$t('systemManage.sysTime.form.time')">
                  <el-time-picker
                    v-model="manualTime"
                    :placeholder="$t('systemManage.sysTime.form.timePlaceholder')"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    style="width: 280px"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 本地同步 -->
          <div v-else-if="selectedMode === 1" key="local" class="mode-content-panel">
            <div class="panel-header">
              <el-icon :size="18" color="#409EFF"><RefreshRight /></el-icon>
              <span class="panel-title">{{ $t('systemManage.sysTime.mode.localSync') }}</span>
            </div>
            <div class="panel-body">
              <div class="local-sync-info">
                <div class="sync-badge">
                  <el-icon :size="16" color="#67C23A"><CircleCheckFilled /></el-icon>
                </div>
                <div class="sync-detail">
                  <span class="sync-label">{{ $t('systemManage.sysTime.currentTime.prefix') }}</span>
                  <span class="sync-time-mono">{{ displayTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- NTP设置 -->
          <div v-else-if="selectedMode === 2" key="ntp" class="mode-content-panel">
            <div class="panel-header">
              <el-icon :size="18" color="#409EFF"><Connection /></el-icon>
              <span class="panel-title">{{ $t('systemManage.sysTime.mode.ntp') }}</span>
            </div>
            <div class="panel-body">
              <el-form label-width="140px" label-position="right" class="time-form">
                <el-form-item :label="$t('systemManage.sysTime.form.ntpServer')">
                  <el-input
                    v-model="ntpServer"
                    :placeholder="$t('systemManage.sysTime.form.ntpServerPlaceholder')"
                    style="width: 320px"
                  >
                    <template #prefix>
                      <el-icon><Link /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('systemManage.sysTime.form.lastSync')">
                  <span class="last-sync-time">
                    {{ lastSyncTime || $t('systemManage.sysTime.form.neverSync') }}
                  </span>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="syncing" @click="handleNtpSync">
                    <el-icon><Refresh /></el-icon>
                    {{ $t('systemManage.sysTime.form.syncNow') }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </transition>

        <!-- 应用按钮 -->
        <div class="action-row">
          <el-button type="primary" size="large" class="apply-btn" :loading="submitting" @click="handleApply">
            <el-icon><Check /></el-icon>
            {{ $t('systemManage.sysTime.btn.apply') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Clock,
  InfoFilled,
  EditPen,
  RefreshRight,
  Connection,
  CircleCheckFilled,
  Link,
  Refresh,
  Check
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const selectedMode = ref(0)
const manualDate = ref('')
const manualTime = ref('')
const ntpServer = ref('ntp.aliyun.com')
const lastSyncTime = ref('2026-04-08 12:00:00')
const syncing = ref(false)
const submitting = ref(false)
const displayTime = ref('')
const colonVisible = ref(true)

// 时间分解
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const dateDisplay = ref('')
const weekdayDisplay = ref('')

// 时钟进度（秒圈）
const clockProgress = computed(() => {
  const s = parseInt(seconds.value) || 0
  const total = 339.292
  return total - (s / 60) * total
})

// 模式选项
const modes = computed(() => [
  { value: 0, icon: EditPen, label: t('systemManage.sysTime.mode.manual'), desc: t('systemManage.sysTime.mode.manualDesc') },
  { value: 1, icon: RefreshRight, label: t('systemManage.sysTime.mode.localSync'), desc: t('systemManage.sysTime.mode.localSyncDesc') },
  { value: 2, icon: Connection, label: t('systemManage.sysTime.mode.ntp'), desc: t('systemManage.sysTime.mode.ntpDesc') }
])

let timerId: ReturnType<typeof setInterval> | null = null

// 格式化
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function updateClock() {
  const now = new Date()
  hours.value = pad(now.getHours())
  minutes.value = pad(now.getMinutes())
  seconds.value = pad(now.getSeconds())
  colonVisible.value = now.getMilliseconds() < 500
  displayTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hours.value}:${minutes.value}:${seconds.value}`
  dateDisplay.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  weekdayDisplay.value = weekdays[now.getDay()]
}

function startClock() {
  updateClock()
  timerId = setInterval(updateClock, 1000)
}

function stopClock() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

// NTP同步
async function handleNtpSync() {
  if (!ntpServer.value) {
    ElNotification({
      title: t('common.warning'),
      message: t('systemManage.sysTime.msg.ntpServerRequired'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }
  syncing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    lastSyncTime.value = displayTime.value
    ElNotification({
      title: t('common.success'),
      message: t('systemManage.sysTime.msg.syncSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } finally {
    syncing.value = false
  }
}

// 应用设置
async function handleApply() {
  if (selectedMode.value === 0 && (!manualDate.value || !manualTime.value)) {
    ElNotification({
      title: t('common.warning'),
      message: t('systemManage.sysTime.msg.manualRequired'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }
  if (selectedMode.value === 2 && !ntpServer.value) {
    ElNotification({
      title: t('common.warning'),
      message: t('systemManage.sysTime.msg.ntpServerRequired'),
      type: 'warning',
      customClass: 'notification-warning'
    })
    return
  }
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    ElNotification({
      title: t('common.success'),
      message: t('systemManage.sysTime.msg.saveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  startClock()
})

onUnmounted(() => {
  stopClock()
})
</script>

<style scoped>
.sys-time-page {
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* ========== 时间展示英雄区 ========== */
.time-hero {
  display: flex;
  align-items: center;
  gap: 40px;
  background: white;
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.time-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.time-hero-left {
  flex-shrink: 0;
}

.clock-ring {
  width: 120px;
  height: 120px;
  position: relative;
}

.clock-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.clock-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.clock-seconds {
  font-size: 28px;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time-hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-date-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-date-text {
  font-size: 15px;
  color: #909399;
  font-family: 'Consolas', monospace;
  letter-spacing: 1px;
}

.time-weekday {
  font-size: 12px;
  font-weight: 600;
  color: #409EFF;
  background: rgba(64, 158, 255, 0.08);
  padding: 2px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.time-value-row {
  display: flex;
  align-items: baseline;
}

.time-hour,
.time-minute {
  font-size: 52px;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  letter-spacing: 4px;
  color: #303133;
  line-height: 1;
}

.time-colon {
  font-size: 48px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #409EFF;
  margin: 0 4px;
  line-height: 1;
  transition: opacity 0.3s;
}

.time-colon.blink {
  opacity: 0.3;
}

.time-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
}

.time-label-icon {
  color: #409EFF;
}

/* ========== 主卡片 ========== */
.main-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 28px 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.section-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* ========== 三栏模式卡片 ========== */
.mode-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.mode-card {
  position: relative;
  background: linear-gradient(135deg, #fafcfe 0%, #f5f9ff 100%);
  border: 2px solid rgba(64, 158, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.mode-card:hover {
  border-color: rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.1);
}

.mode-card.active {
  border-color: #409EFF;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.04) 0%, rgba(103, 194, 58, 0.04) 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
}

.mode-card-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  border-radius: 12px 12px 0 0;
  transition: background 0.3s;
}

.mode-card.active .mode-card-indicator {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.mode-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mode-icon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mode-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  transition: all 0.3s;
}

.mode-card.active .mode-icon-circle {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.mode-radio-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.mode-radio-dot.checked {
  border-color: #409EFF;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s;
}

.mode-radio-dot.checked .radio-inner {
  background: linear-gradient(135deg, #409EFF, #67C23A);
}

.mode-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* ========== 展开面板 ========== */
.mode-content-panel {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border: 1px solid rgba(64, 158, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.06);
  background: rgba(64, 158, 255, 0.02);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-body {
  padding: 20px 24px;
}

.time-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.time-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 本地同步信息 */
.local-sync-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(103, 194, 58, 0.04);
  border: 1px solid rgba(103, 194, 58, 0.1);
  border-radius: 10px;
}

.sync-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(103, 194, 58, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sync-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sync-label {
  font-size: 12px;
  color: #909399;
}

.sync-time-mono {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 1px;
}

.last-sync-time {
  color: #606266;
  font-family: 'Consolas', monospace;
  font-size: 14px;
}

/* ========== 应用按钮 ========== */
.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.apply-btn {
  min-width: 160px;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s;
}

.apply-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}

/* ========== 动画 ========== */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(12px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }

  .time-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
  }

  .time-hero-right {
    align-items: center;
  }

  .time-value-row {
    justify-content: center;
  }

  .time-hour,
  .time-minute {
    font-size: 36px;
  }

  .bottom-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .apply-btn {
    width: 100%;
  }
}
</style>
