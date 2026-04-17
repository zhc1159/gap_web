<template>
  <div class="page-container ssh-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.softwareConf.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.softwareConf.describe') }}</span>
    </div>

    <!-- SSH 状态英雄区 -->
    <div class="ssh-hero" :class="{ active: sshEnabled }">
      <div class="hero-bg-pattern">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(64,158,255,0.04)" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="ssh-status-ring">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="1.5" />
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="sshEnabled ? 'url(#sshGrad)' : 'rgba(255,77,79,0.3)'"
                stroke-width="2" stroke-dasharray="263.89" :stroke-dashoffset="sshEnabled ? '0' : '131.95'"
                stroke-linecap="round" transform="rotate(-90 50 50)"
                class="ring-progress" />
              <defs>
                <linearGradient id="sshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#409EFF" />
                  <stop offset="100%" stop-color="#67C23A" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-inner">
              <el-icon :size="28" class="ring-icon" :class="{ 'icon-active': sshEnabled }">
                <Key />
              </el-icon>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-badge" :class="sshEnabled ? 'badge-on' : 'badge-off'">
            <span class="badge-dot"></span>
            <span class="badge-text">{{ sshEnabled ? $t('systemManage.softwareConf.status.on') : $t('systemManage.softwareConf.status.off') }}</span>
          </div>
          <h2 class="hero-title">{{ $t('systemManage.softwareConf.ssh.switch') }}</h2>
          <p class="hero-desc">{{ $t('systemManage.softwareConf.ssh.switchDesc') }}</p>
          <div class="hero-switch">
            <el-switch
              v-model="sshEnabled"
              :active-text="$t('systemManage.softwareConf.status.on')"
              :inactive-text="$t('systemManage.softwareConf.status.off')"
              inline-prompt
              size="large"
              @change="handleSshSwitchChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 警告横幅 (SSH 关闭时) -->
    <transition name="fade-slide">
      <div v-if="!sshEnabled" class="warning-banner">
        <div class="warning-icon-wrap">
          <el-icon :size="18"><WarningFilled /></el-icon>
        </div>
        <div class="warning-text">
          <span class="warning-title">{{ $t('systemManage.softwareConf.warning.sshDisable') }}</span>
        </div>
      </div>
    </transition>

    <!-- 配置卡片 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="section-header">
          <div class="section-dot"></div>
          <h3 class="section-title">{{ $t('systemManage.softwareConf.ssh.port') }}</h3>
        </div>

        <transition name="slide-fade" mode="out-in">
          <!-- SSH 启用 - 端口配置 -->
          <div v-if="sshEnabled" key="enabled" class="port-panel">
            <div class="port-layout">
              <div class="port-visual">
                <div class="port-icon-block">
                  <div class="port-icon-circle">
                    <el-icon :size="24"><Connection /></el-icon>
                  </div>
                  <div class="port-icon-label">
                    <span class="port-label-main">SSH</span>
                    <span class="port-label-sub">TCP</span>
                  </div>
                </div>
                <div class="port-arrow">
                  <svg width="40" height="2" viewBox="0 0 40 2">
                    <line x1="0" y1="1" x2="36" y2="1" stroke="url(#arrowGrad)" stroke-width="2" stroke-linecap="round" />
                    <polygon points="34,0 40,1 34,2" fill="#67C23A" />
                    <defs>
                      <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#409EFF" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#67C23A" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div class="port-form-area">
                <div class="port-input-group">
                  <label class="port-input-label">{{ $t('systemManage.softwareConf.ssh.port') }}</label>
                  <el-input
                    v-model="sshPort"
                    :placeholder="$t('systemManage.softwareConf.ssh.portPlaceholder')"
                    class="port-input"
                    type="number"
                    size="large"
                  >
                    <template #prefix>
                      <el-icon color="#409EFF"><Connection /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="port-help-row">
                  <el-icon class="help-icon" :size="14"><InfoFilled /></el-icon>
                  <span>{{ $t('systemManage.softwareConf.ssh.portHelp') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SSH 禁用 - 提示 -->
          <div v-else key="disabled" class="disabled-panel">
            <div class="disabled-content">
              <div class="disabled-icon">
                <el-icon :size="32"><Lock /></el-icon>
              </div>
              <span class="disabled-text">{{ $t('systemManage.softwareConf.ssh.switchDesc') }}</span>
            </div>
          </div>
        </transition>

        <!-- 应用按钮 -->
        <div class="action-row">
          <el-button type="primary" size="large" class="apply-btn" :disabled="!sshEnabled" @click="handleApply">
            <el-icon><Check /></el-icon>
            {{ $t('systemManage.softwareConf.btn.apply') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Setting,
  InfoFilled,
  Key,
  WarningFilled,
  Connection,
  Check,
  Lock
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const sshEnabled = ref(true)
const sshPort = ref('22')

// SSH开关变更 — 关闭时弹确认框
async function handleSshSwitchChange(value: boolean) {
  if (!value) {
    try {
      await ElMessageBox.confirm(
        t('systemManage.softwareConf.warning.sshDisable'),
        t('common.confirm'),
        { type: 'warning' }
      )
    } catch {
      sshEnabled.value = true
    }
  }
}

// 应用配置
async function handleApply() {
  const port = Number(sshPort.value)
  if (!port || port < 1 || port > 65535 || !Number.isInteger(port)) {
    ElNotification({ title: t('common.warning'), message: t('systemManage.softwareConf.validation.portRange'), type: 'warning', customClass: 'notification-warning' })
    return
  }

  if (port < 1000) {
    try {
      await ElMessageBox.confirm(
        t('systemManage.softwareConf.validation.portWarning'),
        t('common.confirm'),
        { type: 'warning' }
      )
    } catch {
      return
    }
  }

  ElNotification({ title: t('common.success'), message: t('systemManage.softwareConf.msg.saveSuccess'), type: 'success', customClass: 'notification-success' })
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.ssh-page {
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

/* ========== SSH 状态英雄区 ========== */
.ssh-hero {
  position: relative;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 36px 40px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: all 0.4s ease;
}

.ssh-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 77, 79, 0.6), rgba(255, 77, 79, 0.2));
  transition: background 0.4s ease;
}

.ssh-hero.active::before {
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
  gap: 40px;
}

.hero-left {
  flex-shrink: 0;
}

.ssh-status-ring {
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
  gap: 8px;
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
  background: rgba(255, 77, 79, 0.1);
  color: #F56C6C;
  border: 1px solid rgba(255, 77, 79, 0.2);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background 0.3s;
}

.badge-on .badge-dot {
  background: #67C23A;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.badge-off .badge-dot {
  background: #F56C6C;
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
  line-height: 1.5;
}

.hero-switch {
  margin-top: 4px;
}

/* ========== 警告横幅 ========== */
.warning-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.06) 0%, rgba(255, 149, 0, 0.04) 100%);
  border: 1px solid rgba(255, 77, 79, 0.15);
  border-left: 3px solid #F56C6C;
  border-radius: 10px;
  margin-bottom: 16px;
}

.warning-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 77, 79, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F56C6C;
  flex-shrink: 0;
}

.warning-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.warning-title {
  color: #F56C6C;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
}

/* ========== 主卡片 ========== */
.main-card {
  background: var(--card-bg);
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
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* ========== 端口面板 ========== */
.port-panel {
  padding: 4px 0;
}

.port-layout {
  display: flex;
  align-items: center;
  gap: 32px;
}

.port-visual {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.port-icon-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.port-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.port-icon-label {
  text-align: center;
}

.port-label-main {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #409EFF;
  letter-spacing: 2px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.port-label-sub {
  display: block;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  letter-spacing: 1px;
}

.port-form-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.port-input-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.port-input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  min-width: 80px;
}

.port-input {
  max-width: 320px;
}

.port-help-row {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  padding-left: 96px;
}

.help-icon {
  color: var(--el-text-color-placeholder);
}

/* ========== 禁用面板 ========== */
.disabled-panel {
  padding: 24px 0;
}

.disabled-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.03) 0%, rgba(144, 147, 153, 0.06) 100%);
  border-radius: 12px;
  border: 1px dashed rgba(144, 147, 153, 0.2);
}

.disabled-icon {
  color: var(--el-text-color-placeholder);
}

.disabled-text {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

/* ========== 应用按钮 ========== */
.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.apply-btn {
  min-width: 160px;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--page-header-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s;
}

.apply-btn:not(:disabled):hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}

/* ========== 动画 ========== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

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
</style>
