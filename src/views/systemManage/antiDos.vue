<template>
  <div class="page-container anti-dos-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Aim /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.antiDos.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.antiDos.describe') }}</span>
    </div>

    <!-- 防护状态英雄区 -->
    <div class="defense-hero" :class="{ active: heroActive }">
      <div class="hero-bg-pattern">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexGrid" width="28" height="49" patternUnits="userSpaceOnUse">
              <path d="M14 0L28 8.1V24.3L14 32.4L0 24.3V8.1Z" fill="none" stroke="rgba(64,158,255,0.04)" stroke-width="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>
      </div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="shield-ring">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="1.5" />
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="heroActive ? 'url(#shieldGrad)' : 'rgba(144,147,153,0.2)'"
                stroke-width="2.5" stroke-dasharray="263.89"
                :stroke-dashoffset="heroActive ? '0' : '197.92'"
                stroke-linecap="round" transform="rotate(-90 50 50)"
                class="ring-progress" />
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#409EFF" />
                  <stop offset="100%" stop-color="#67C23A" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-inner">
              <el-icon :size="30" class="ring-icon" :class="{ 'icon-active': heroActive }">
                <Aim />
              </el-icon>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-badge" :class="heroActive ? 'badge-on' : 'badge-off'">
            <span class="badge-dot"></span>
            <span class="badge-text">{{ heroActive ? $t('systemManage.antiDos.attackTable.enabled') : $t('systemManage.antiDos.attackTable.disabled') }}</span>
          </div>
          <h2 class="hero-title">{{ $t('systemManage.antiDos.title') }}</h2>
          <p class="hero-desc">{{ $t('systemManage.antiDos.describe') }}</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">{{ innerAntiAttack ? 1 : 0 }}</span>
              <span class="stat-label">{{ $t('systemManage.antiDos.innerTab') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ outerAntiAttack ? 1 : 0 }}</span>
              <span class="stat-label">{{ $t('systemManage.antiDos.outerTab') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置卡片 -->
    <div class="card main-card">
      <div class="card-content">
        <el-tabs v-model="activeTab" class="network-tabs">
          <!-- 内网 -->
          <el-tab-pane :label="$t('systemManage.antiDos.innerTab')" name="inner">
            <div class="tab-content">
              <div class="sections-row">
              <!-- 抗攻击开关 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-icon-wrap" :class="{ active: innerAntiAttack }">
                    <el-icon :size="16"><Aim /></el-icon>
                  </div>
                  <h3 class="section-title">{{ $t('systemManage.antiDos.antiAttackSwitch') }}</h3>
                  <el-switch v-model="innerAntiAttack" @change="handleInnerAntiAttackSwitch" />
                </div>
                <el-table :data="innerAttackItems" class="config-table" stripe>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.type')" min-width="160">
                    <template #default="{ row }">
                      <div class="type-cell">
                        <span class="type-badge" :class="{ 'fixed-type': !row.editable }">{{ row.name }}</span>
                        <el-tag v-if="!row.editable" size="small" type="info" effect="plain">{{ $t('systemManage.antiDos.attackTable.fixed') }}</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.threshold')" width="180">
                    <template #default="{ row }">
                      <el-input-number v-if="row.editable" v-model="row.value" :min="1" :max="65535" :disabled="!innerAntiAttack" size="small" controls-position="right" />
                      <span v-else class="fixed-value">{{ row.value }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.times')" width="180">
                    <template #default="{ row }">
                      <el-input-number v-if="row.editable" v-model="row.times" :min="1" :max="65535" :disabled="!innerAntiAttack" size="small" controls-position="right" />
                      <span v-else class="fixed-value">{{ row.times }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.status')" width="100" align="center">
                    <template #default="{ }">
                      <div class="status-indicator" :class="{ active: innerAntiAttack }">
                        <span class="status-dot"></span>
                        <span class="status-text">{{ innerAntiAttack ? $t('systemManage.antiDos.attackTable.enabled') : $t('systemManage.antiDos.attackTable.disabled') }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="section-divider"></div>
              <!-- 防扫描开关 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-icon-wrap" :class="{ active: innerAntiScan }">
                    <el-icon :size="16"><Search /></el-icon>
                  </div>
                  <h3 class="section-title">{{ $t('systemManage.antiDos.antiScanSwitch') }}</h3>
                  <el-switch v-model="innerAntiScan" @change="handleInnerAntiScanSwitch" />
                </div>
                <el-table :data="innerScanItems" class="config-table" stripe>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.type')" min-width="160">
                    <template #default="{ row }">
                      <div class="scan-type-cell">
                        <el-icon class="scan-icon"><Search /></el-icon>
                        <span>{{ row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.description')">
                    <template #default="{ row }">
                      <span class="scan-desc">{{ row.description }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.status')" width="100" align="center">
                    <template #default="{ }">
                      <div class="status-indicator" :class="{ active: innerAntiScan }">
                        <span class="status-dot"></span>
                        <span class="status-text">{{ innerAntiScan ? $t('systemManage.antiDos.attackTable.enabled') : $t('systemManage.antiDos.attackTable.disabled') }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              </div>

              <!-- 保存按钮 -->
              <div class="action-row">
                <el-button type="primary" size="large" class="apply-btn" @click="handleSave('inner')">
                  <el-icon><Check /></el-icon>
                  {{ $t('systemManage.antiDos.actions.save') }}
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 外网 -->
          <el-tab-pane :label="$t('systemManage.antiDos.outerTab')" name="outer">
            <div class="tab-content">
              <div class="sections-row">
              <!-- 抗攻击开关 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-icon-wrap" :class="{ active: outerAntiAttack }">
                    <el-icon :size="16"><Aim /></el-icon>
                  </div>
                  <h3 class="section-title">{{ $t('systemManage.antiDos.antiAttackSwitch') }}</h3>
                  <el-switch v-model="outerAntiAttack" @change="handleOuterAntiAttackSwitch" />
                </div>
                <el-table :data="outerAttackItems" class="config-table" stripe>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.type')" min-width="160">
                    <template #default="{ row }">
                      <div class="type-cell">
                        <span class="type-badge" :class="{ 'fixed-type': !row.editable }">{{ row.name }}</span>
                        <el-tag v-if="!row.editable" size="small" type="info" effect="plain">{{ $t('systemManage.antiDos.attackTable.fixed') }}</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.threshold')" width="180">
                    <template #default="{ row }">
                      <el-input-number v-if="row.editable" v-model="row.value" :min="1" :max="65535" :disabled="!outerAntiAttack" size="small" controls-position="right" />
                      <span v-else class="fixed-value">{{ row.value }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.times')" width="180">
                    <template #default="{ row }">
                      <el-input-number v-if="row.editable" v-model="row.times" :min="1" :max="65535" :disabled="!outerAntiAttack" size="small" controls-position="right" />
                      <span v-else class="fixed-value">{{ row.times }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.attackTable.status')" width="100" align="center">
                    <template #default="{ }">
                      <div class="status-indicator" :class="{ active: outerAntiAttack }">
                        <span class="status-dot"></span>
                        <span class="status-text">{{ outerAntiAttack ? $t('systemManage.antiDos.attackTable.enabled') : $t('systemManage.antiDos.attackTable.disabled') }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="section-divider"></div>
              <!-- 防扫描开关 -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-icon-wrap" :class="{ active: outerAntiScan }">
                    <el-icon :size="16"><Search /></el-icon>
                  </div>
                  <h3 class="section-title">{{ $t('systemManage.antiDos.antiScanSwitch') }}</h3>
                  <el-switch v-model="outerAntiScan" @change="handleOuterAntiScanSwitch" />
                </div>
                <el-table :data="outerScanItems" class="config-table" stripe>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.type')" min-width="160">
                    <template #default="{ row }">
                      <div class="scan-type-cell">
                        <el-icon class="scan-icon"><Search /></el-icon>
                        <span>{{ row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.description')">
                    <template #default="{ row }">
                      <span class="scan-desc">{{ row.description }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('systemManage.antiDos.scanTable.status')" width="100" align="center">
                    <template #default="{ }">
                      <div class="status-indicator" :class="{ active: outerAntiScan }">
                        <span class="status-dot"></span>
                        <span class="status-text">{{ outerAntiScan ? $t('systemManage.antiDos.attackTable.enabled') : $t('systemManage.antiDos.attackTable.disabled') }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              </div>

              <!-- 保存按钮 -->
              <div class="action-row">
                <el-button type="primary" size="large" class="apply-btn" @click="handleSave('outer')">
                  <el-icon><Check /></el-icon>
                  {{ $t('systemManage.antiDos.actions.save') }}
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Aim,
  InfoFilled,
  Search,
  Check
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const activeTab = ref('inner')
const innerAntiAttack = ref(true)
const innerAntiScan = ref(true)
const outerAntiAttack = ref(true)
const outerAntiScan = ref(false)

const heroActive = computed(() => innerAntiAttack.value || outerAntiAttack.value || innerAntiScan.value || outerAntiScan.value)

// 攻击类型
interface AttackItem {
  key: string
  name: string
  value: number
  times: number
  editable: boolean
}

function createAttackItems(): AttackItem[] {
  return [
    { key: 'SYN', name: 'SYN Flood', value: 1000, times: 10, editable: true },
    { key: 'UDP', name: 'UDP Flood', value: 1000, times: 10, editable: true },
    { key: 'ICMP', name: 'ICMP Flood', value: 1000, times: 10, editable: true },
    { key: 'NAPTHA', name: 'Naptha', value: 1, times: 1, editable: false },
    { key: 'WINNUKE', name: 'Winnuke', value: 1, times: 1, editable: false },
    { key: 'LAND', name: 'LAND Attack', value: 1, times: 1, editable: false }
  ]
}

// 扫描类型
interface ScanItem {
  key: string
  name: string
  description: string
}

function createScanItems(): ScanItem[] {
  return [
    { key: 'PORT_SCAN', name: 'Port Scan', description: '检测对目标主机的端口扫描行为' },
    { key: 'IP_SCAN', name: 'IP Scan', description: '检测对目标网络的 IP 地址扫描行为' },
    { key: 'FIN_SCAN', name: 'FIN Scan', description: '检测利用 FIN 标志进行的隐蔽扫描' },
    { key: 'NULL_SCAN', name: 'Null Scan', description: '检测不设置任何 TCP 标志的扫描行为' },
    { key: 'XMAS_SCAN', name: 'Xmas Scan', description: '检测设置 FIN/PSH/URG 标志的扫描行为' },
    { key: 'ACK_SCAN', name: 'ACK Scan', description: '检测利用 ACK 标志进行的扫描行为' }
  ]
}

const innerAttackItems = reactive(createAttackItems())
const outerAttackItems = reactive(createAttackItems())
const innerScanItems = reactive(createScanItems())
const outerScanItems = reactive(createScanItems())

// 开关处理
function handleInnerAntiAttackSwitch(val: boolean) {
  ElNotification({
    title: t('common.success'),
    message: val ? t('systemManage.antiDos.messages.switchOn') : t('systemManage.antiDos.messages.switchOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

function handleInnerAntiScanSwitch(val: boolean) {
  ElNotification({
    title: t('common.success'),
    message: val ? t('systemManage.antiDos.messages.switchOn') : t('systemManage.antiDos.messages.switchOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

function handleOuterAntiAttackSwitch(val: boolean) {
  ElNotification({
    title: t('common.success'),
    message: val ? t('systemManage.antiDos.messages.switchOn') : t('systemManage.antiDos.messages.switchOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

function handleOuterAntiScanSwitch(val: boolean) {
  ElNotification({
    title: t('common.success'),
    message: val ? t('systemManage.antiDos.messages.switchOn') : t('systemManage.antiDos.messages.switchOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 保存
function handleSave(_zone: string) {
  ElNotification({
    title: t('common.success'),
    message: t('systemManage.antiDos.messages.saveSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.anti-dos-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  min-height: calc(100vh - 60px);
}

/* ========== 页面头部 ========== */
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

/* ========== 页面描述 ========== */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* ========== 防护状态英雄区 ========== */
.defense-hero {
  position: relative;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: all 0.4s ease;
}

.defense-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(144, 147, 153, 0.15);
  transition: background 0.4s ease;
}

.defense-hero.active::before {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.hero-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.6;
  pointer-events: none;
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 36px;
}

.hero-left {
  flex-shrink: 0;
}

.shield-ring {
  width: 100px;
  height: 100px;
  position: relative;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-progress {
  transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;
}

.ring-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-icon {
  color: var(--el-text-color-placeholder);
  transition: all 0.4s ease;
}

.ring-icon.icon-active {
  color: #409EFF;
  filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.4));
}

.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  transition: all 0.3s ease;
}

.hero-badge.badge-on {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.hero-badge.badge-off {
  background: rgba(144, 147, 153, 0.06);
  color: var(--el-text-color-placeholder);
  border: 1px solid rgba(144, 147, 153, 0.12);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.3s;
}

.badge-on .badge-dot {
  background: #67C23A;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.badge-off .badge-dot {
  background: #C0C4CC;
}

.hero-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.hero-desc {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  margin: 0;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.stat-divider {
  width: 1px;
  height: 16px;
  background: rgba(64, 158, 255, 0.15);
}

/* ========== 主卡片 ========== */
.main-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px 28px;
}

/* Tab样式 */
.network-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
}

.network-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.tab-content {
  padding-top: 8px;
}

/* ========== 区块 ========== */
.sections-row {
  display: flex;
  gap: 24px;
}

.section-block {
  flex: 1;
  min-width: 0;
  margin-bottom: 28px;
}

.section-divider {
  width: 2px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.06) 0%, rgba(64, 158, 255, 0.18) 50%, rgba(103, 194, 58, 0.18) 50%, rgba(103, 194, 58, 0.06) 100%);
  border-radius: 1px;
  margin: 8px 0;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.section-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(144, 147, 153, 0.08);
  color: var(--el-text-color-placeholder);
  transition: all 0.3s;
}

.section-icon-wrap.active {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.section-title {
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

/* ========== 表格样式 ========== */
.config-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 12px 8px;
}

.config-table :deep(.el-table td.el-table__cell) {
  padding: 10px 8px;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.15);
  color: #409EFF;
}

.type-badge.fixed-type {
  background: rgba(144, 147, 153, 0.06);
  border-color: rgba(144, 147, 153, 0.15);
  color: var(--el-text-color-placeholder);
}

.fixed-value {
  color: var(--el-text-color-placeholder);
  font-family: 'Consolas', monospace;
  font-size: 14px;
  padding: 0 4px;
}

/* 状态指示 */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #C0C4CC;
  transition: all 0.3s;
}

.status-indicator.active .status-dot {
  background: #67C23A;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.status-text {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.status-indicator.active .status-text {
  color: #67C23A;
}

/* 扫描类型 */
.scan-type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
}

.scan-icon {
  font-size: 15px;
}

.scan-desc {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

/* ========== 操作栏 ========== */
.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.apply-btn {
  min-width: 140px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--page-header-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s;
}

.apply-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}
</style>
