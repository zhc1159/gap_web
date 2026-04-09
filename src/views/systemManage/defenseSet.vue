<template>
  <div class="page-container defense-set-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.defenseSet.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.defenseSet.describe') }}</span>
    </div>

    <!-- 引擎状态英雄区 -->
    <div class="defense-hero" :class="{ active: engineEnabled }">
      <div class="hero-bg-pattern">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="defGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(64,158,255,0.04)" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#defGrid)" />
        </svg>
      </div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="engine-ring-wrap">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="1.5" />
              <circle cx="50" cy="50" r="42" fill="none"
                :stroke="engineEnabled ? 'url(#defGrad)' : 'rgba(144,147,153,0.2)'"
                stroke-width="2.5" stroke-dasharray="263.89"
                :stroke-dashoffset="engineEnabled ? '0' : '131.95'"
                stroke-linecap="round" transform="rotate(-90 50 50)"
                class="ring-progress" />
              <defs>
                <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#409EFF" />
                  <stop offset="100%" stop-color="#67C23A" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-inner">
              <el-icon :size="30" class="ring-icon" :class="{ 'icon-active': engineEnabled }">
                <Monitor />
              </el-icon>
            </div>
            <!-- 脉冲动画 -->
            <div v-if="engineEnabled" class="pulse-ring pulse-1"></div>
            <div v-if="engineEnabled" class="pulse-ring pulse-2"></div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-badge" :class="engineEnabled ? 'badge-on' : 'badge-off'">
            <span class="badge-dot"></span>
            <span class="badge-text">{{ engineEnabled ? $t('systemManage.defenseSet.engine.running') : $t('systemManage.defenseSet.engine.stopped') }}</span>
          </div>
          <h2 class="hero-title">{{ $t('systemManage.defenseSet.engine.label') }}</h2>
          <p class="hero-desc">{{ $t('systemManage.defenseSet.describe') }}</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value" :class="{ running: engineEnabled }">{{ engineEnabled ? $t('systemManage.defenseSet.engine.running') : $t('systemManage.defenseSet.engine.stopped') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedInterface || '--' }}</span>
              <span class="stat-label">{{ $t('systemManage.defenseSet.interface.label') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置卡片 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="section-header">
          <div class="section-dot" :class="{ active: engineEnabled }"></div>
          <h3 class="section-title">{{ $t('systemManage.defenseSet.engine.label') }}</h3>
        </div>

        <!-- 引擎开关 -->
        <div class="config-row">
          <div class="row-left">
            <div class="icon-wrapper" :class="{ enabled: engineEnabled }">
              <el-icon :size="20"><Switch /></el-icon>
            </div>
            <div class="row-text">
              <span class="row-title">{{ $t('systemManage.defenseSet.engine.switch') }}</span>
              <span class="row-desc">{{ engineEnabled ? $t('systemManage.defenseSet.engine.enable') : $t('systemManage.defenseSet.engine.disable') }}</span>
            </div>
          </div>
          <div class="row-right">
            <el-switch
              v-model="engineEnabled"
              size="large"
              :active-text="$t('systemManage.defenseSet.engine.enable')"
              :inactive-text="$t('systemManage.defenseSet.engine.disable')"
              inline-prompt
              @change="handleEngineToggle"
            />
          </div>
        </div>

        <div class="config-divider"></div>

        <!-- 监听接口 -->
        <div class="config-row">
          <div class="row-left">
            <div class="icon-wrapper interface-icon" :class="{ enabled: engineEnabled }">
              <el-icon :size="20"><Connection /></el-icon>
            </div>
            <div class="row-text">
              <span class="row-title">{{ $t('systemManage.defenseSet.interface.label') }}</span>
              <span class="row-desc">{{ $t('systemManage.defenseSet.interface.placeholder') }}</span>
            </div>
          </div>
          <div class="row-right">
            <el-select
              v-model="selectedInterface"
              :placeholder="$t('systemManage.defenseSet.interface.placeholder')"
              :disabled="!engineEnabled"
              filterable
              style="width: 320px"
            >
              <el-option
                v-for="iface in interfaceList"
                :key="iface.value"
                :label="`${iface.label} (${iface.ipAddress || '--'})`"
                :value="iface.value"
                :disabled="iface.status === 'down'"
              >
                <div class="interface-option">
                  <span class="iface-name">{{ iface.label }}</span>
                  <span class="iface-ip">{{ iface.ipAddress || '--' }}</span>
                  <el-tag
                    :type="iface.status === 'up' ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                    class="iface-status-tag"
                  >
                    {{ iface.status === 'up' ? $t('systemManage.defenseSet.interface.statusUp') : $t('systemManage.defenseSet.interface.statusDown') }}
                  </el-tag>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="action-row">
          <el-button type="primary" size="large" class="apply-btn" @click="handleSave">
            <el-icon><Check /></el-icon>
            {{ $t('systemManage.defenseSet.actions.save') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Lock,
  InfoFilled,
  Monitor,
  Switch,
  Connection,
  Check
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const engineEnabled = ref(false)
const selectedInterface = ref('eth0')

// 网络接口列表
interface InterfaceOption {
  value: string
  label: string
  status: 'up' | 'down'
  ipAddress: string
}

const interfaceList = reactive<InterfaceOption[]>([
  { value: 'eth0', label: 'eth0', status: 'up', ipAddress: '192.168.1.1' },
  { value: 'eth1', label: 'eth1', status: 'up', ipAddress: '10.0.0.1' },
  { value: 'eth2', label: 'eth2', status: 'down', ipAddress: '' },
  { value: 'eth3', label: 'eth3', status: 'up', ipAddress: '172.16.0.1' }
])

// 引擎开关
function handleEngineToggle(val: boolean) {
  ElNotification({
    title: t('common.success'),
    message: val ? t('systemManage.defenseSet.messages.engineStart') : t('systemManage.defenseSet.messages.engineStop'),
    type: 'success',
    customClass: 'notification-success'
  })
}

// 保存
function handleSave() {
  ElNotification({
    title: t('common.success'),
    message: t('systemManage.defenseSet.messages.saveSuccess'),
    type: 'success',
    customClass: 'notification-success'
  })
}

onMounted(() => {
  // Mock数据已预置
})
</script>

<style scoped>
.defense-set-page {
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

/* ========== 页面描述 ========== */
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

/* ========== 英雄区 ========== */
.defense-hero {
  position: relative;
  background: white;
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

.engine-ring-wrap {
  width: 110px;
  height: 110px;
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
  color: #C0C4CC;
  transition: all 0.4s ease;
}

.ring-icon.icon-active {
  color: #409EFF;
  filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.4));
}

/* 脉冲动画 */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(64, 158, 255, 0.3);
  pointer-events: none;
}

.pulse-1 {
  width: 100px;
  height: 100px;
  animation: pulse-expand 2s ease-out infinite;
}

.pulse-2 {
  width: 100px;
  height: 100px;
  animation: pulse-expand 2s ease-out infinite 0.6s;
}

@keyframes pulse-expand {
  0% {
    width: 100px;
    height: 100px;
    opacity: 0.5;
  }
  100% {
    width: 140px;
    height: 140px;
    opacity: 0;
  }
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
  color: #909399;
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
  animation: blink 1.5s ease-in-out infinite;
}

.badge-off .badge-dot {
  background: #C0C4CC;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.hero-desc {
  font-size: 13px;
  color: #909399;
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
  font-size: 14px;
  font-weight: 700;
  color: #909399;
}

.stat-value.running {
  color: #67C23A;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 16px;
  background: rgba(64, 158, 255, 0.15);
}

/* ========== 配置卡片 ========== */
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
  margin-bottom: 20px;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C0C4CC;
  transition: all 0.3s;
}

.section-dot.active {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.section-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

/* ========== 配置行 ========== */
.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
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
  background: rgba(144, 147, 153, 0.08);
  color: #909399;
}

.icon-wrapper.enabled {
  background: linear-gradient(135deg, #409EFF, rgba(103, 194, 58, 0.8));
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.icon-wrapper.interface-icon.enabled {
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
  color: #303133;
}

.row-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.config-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.06) 0%, rgba(64, 158, 255, 0.1) 50%, rgba(64, 158, 255, 0.06) 100%);
  margin: 4px 0;
}

/* 接口选项 */
.interface-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.iface-name {
  font-weight: 600;
  min-width: 60px;
}

.iface-ip {
  color: #909399;
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.iface-status-tag {
  margin-left: auto;
}

/* ========== 操作栏 ========== */
.action-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 8px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

.apply-btn {
  min-width: 140px;
  height: 40px;
  font-size: 14px;
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
</style>
