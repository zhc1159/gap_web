<template>
  <div class="page-container snmp-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.funcManager.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.funcManager.describe') }}</span>
    </div>

    <!-- SNMP 状态英雄区 -->
    <div class="snmp-hero" :class="{ active: innerEnabled || outerEnabled }">
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
          <div class="snmp-status-ring">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="1.5" />
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="(innerEnabled || outerEnabled) ? 'url(#snmpGrad)' : 'rgba(144,147,153,0.2)'"
                stroke-width="2" stroke-dasharray="263.89"
                :stroke-dashoffset="(innerEnabled || outerEnabled) ? '0' : '131.95'"
                stroke-linecap="round" transform="rotate(-90 50 50)"
                class="ring-progress" />
              <defs>
                <linearGradient id="snmpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#409EFF" />
                  <stop offset="100%" stop-color="#67C23A" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-inner">
              <el-icon :size="28" class="ring-icon" :class="{ 'icon-active': innerEnabled || outerEnabled }">
                <Monitor />
              </el-icon>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-badge" :class="(innerEnabled || outerEnabled) ? 'badge-on' : 'badge-off'">
            <span class="badge-dot"></span>
            <span class="badge-text">{{ (innerEnabled || outerEnabled) ? $t('systemManage.funcManager.status.on') : $t('systemManage.funcManager.status.off') }}</span>
          </div>
          <h2 class="hero-title">{{ $t('systemManage.funcManager.title') }}</h2>
          <p class="hero-desc">{{ $t('systemManage.funcManager.info') }}</p>
        </div>
      </div>
    </div>

    <!-- 配置卡片 - 并排布局 -->
    <div class="cards-row">
      <!-- 内网 SNMP -->
      <div class="card switch-card">
        <div class="card-content">
          <div class="section-header">
            <div class="section-dot"></div>
            <h3 class="section-title">{{ $t('systemManage.funcManager.switch.inner') }}</h3>
          </div>
          <div class="config-row">
            <div class="row-left">
              <div class="icon-wrapper inner-icon" :class="{ enabled: innerEnabled }">
                <el-icon :size="22"><Monitor /></el-icon>
              </div>
              <div class="row-text">
                <span class="row-title">{{ $t('systemManage.funcManager.switch.inner') }}</span>
                <span class="row-desc">{{ $t('systemManage.funcManager.switch.innerDesc') }}</span>
              </div>
            </div>
            <div class="row-right">
              <el-switch
                v-model="innerEnabled"
                size="large"
                :active-text="$t('systemManage.funcManager.status.on')"
                :inactive-text="$t('systemManage.funcManager.status.off')"
                inline-prompt
                @change="handleInnerChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 外网 SNMP -->
      <div class="card switch-card">
        <div class="card-content">
          <div class="section-header">
            <div class="section-dot"></div>
            <h3 class="section-title">{{ $t('systemManage.funcManager.switch.outer') }}</h3>
          </div>
          <div class="config-row">
            <div class="row-left">
              <div class="icon-wrapper outer-icon" :class="{ enabled: outerEnabled }">
                <el-icon :size="22"><Connection /></el-icon>
              </div>
              <div class="row-text">
                <span class="row-title">{{ $t('systemManage.funcManager.switch.outer') }}</span>
                <span class="row-desc">{{ $t('systemManage.funcManager.switch.outerDesc') }}</span>
              </div>
            </div>
            <div class="row-right">
              <el-switch
                v-model="outerEnabled"
                size="large"
                :active-text="$t('systemManage.funcManager.status.on')"
                :inactive-text="$t('systemManage.funcManager.status.off')"
                inline-prompt
                @change="handleOuterChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Monitor,
  InfoFilled,
  Connection
} from '@element-plus/icons-vue'

const { t } = useI18n()

const innerEnabled = ref(false)
const outerEnabled = ref(false)

function handleInnerChange(value: boolean) {
  ElNotification({
    title: t('common.success'),
    message: value ? t('systemManage.funcManager.msg.innerOn') : t('systemManage.funcManager.msg.innerOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

function handleOuterChange(value: boolean) {
  ElNotification({
    title: t('common.success'),
    message: value ? t('systemManage.funcManager.msg.outerOn') : t('systemManage.funcManager.msg.outerOff'),
    type: 'success',
    customClass: 'notification-success'
  })
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.snmp-page {
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

/* ========== SNMP 状态英雄区 ========== */
.snmp-hero {
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

.snmp-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(144, 147, 153, 0.15);
  transition: background 0.4s ease;
}

.snmp-hero.active::before {
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

.snmp-status-ring {
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

/* ========== 配置卡片并排布局 ========== */
.cards-row {
  display: flex;
  gap: 20px;
}

.switch-card {
  flex: 1;
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
  margin-bottom: 18px;
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
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

/* ========== 配置行 ========== */
.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.icon-wrapper.inner-icon {
  background: rgba(64, 158, 255, 0.08);
  color: var(--el-text-color-placeholder);
}

.icon-wrapper.inner-icon.enabled {
  background: linear-gradient(135deg, #409EFF, rgba(103, 194, 58, 0.8));
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.icon-wrapper.outer-icon {
  background: rgba(103, 194, 58, 0.08);
  color: var(--el-text-color-placeholder);
}

.icon-wrapper.outer-icon.enabled {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.8), #67C23A);
  color: white;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.row-desc {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

</style>
