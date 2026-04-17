<template>
  <div class="page-container gap-mode-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Switch /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.gapMode.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.gapMode.subtitle') }}</span>
    </div>

    <!-- 左右布局 -->
    <div class="main-layout">
      <!-- 左侧：模式选择 -->
      <div class="left-panel">
        <div class="card mode-card">
          <div class="card-content">
            <div class="section-header">
              <div class="section-dot"></div>
              <h3 class="section-title">{{ $t('systemManage.gapMode.modes.label') }}</h3>
            </div>

            <div class="mode-list">
              <!-- 代理模式 -->
              <div class="mode-item" :class="{ active: currentMode === 0 }" @click="currentMode = 0">
                <div class="mode-radio">
                  <div class="radio-outer"><div v-if="currentMode === 0" class="radio-inner"></div></div>
                </div>
                <div class="mode-info">
                  <div class="mode-name-row">
                    <span class="mode-name">{{ $t('systemManage.gapMode.modes.proxy') }}</span>
                    <el-tag v-if="currentMode === 0" size="small" effect="dark" class="mode-tag proxy-tag">
                      {{ $t('systemManage.gapMode.badge.proxy') }}
                    </el-tag>
                  </div>
                  <p class="mode-desc">{{ $t('systemManage.gapMode.modes.proxyDesc') }}</p>
                </div>
              </div>

              <!-- 路由模式 -->
              <div class="mode-item" :class="{ active: currentMode === 1 }" @click="currentMode = 1">
                <div class="mode-radio">
                  <div class="radio-outer"><div v-if="currentMode === 1" class="radio-inner"></div></div>
                </div>
                <div class="mode-info">
                  <div class="mode-name-row">
                    <span class="mode-name">{{ $t('systemManage.gapMode.modes.route') }}</span>
                    <el-tag v-if="currentMode === 1" size="small" effect="dark" class="mode-tag route-tag">
                      {{ $t('systemManage.gapMode.badge.route') }}
                    </el-tag>
                  </div>
                  <p class="mode-desc">{{ $t('systemManage.gapMode.modes.routeDesc') }}</p>
                </div>
              </div>

              <!-- 透明模式 -->
              <div class="mode-item" :class="{ active: currentMode === 2 }" @click="currentMode = 2">
                <div class="mode-radio">
                  <div class="radio-outer"><div v-if="currentMode === 2" class="radio-inner"></div></div>
                </div>
                <div class="mode-info">
                  <div class="mode-name-row">
                    <span class="mode-name">{{ $t('systemManage.gapMode.modes.transparent') }}</span>
                    <el-tag v-if="currentMode === 2" size="small" effect="dark" class="mode-tag transparent-tag">
                      {{ $t('systemManage.gapMode.badge.transparent') }}
                    </el-tag>
                  </div>
                  <p class="mode-desc">{{ $t('systemManage.gapMode.modes.transparentDesc') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：配置区 -->
      <div class="right-panel">
        <!-- 当前模式横幅 -->
        <div class="current-mode-banner" :class="modeBannerClass">
          <div class="banner-icon">
            <el-icon :size="24"><Monitor /></el-icon>
          </div>
          <div class="banner-text">
            <span class="banner-label">{{ $t('systemManage.gapMode.modes.label') }}:</span>
            <span class="banner-value">{{ currentModeLabel }}</span>
          </div>
        </div>

        <!-- 透明模式配置 -->
        <transition name="slide-fade" mode="out-in">
          <div v-if="currentMode === 2" key="transparent" class="card config-card" style="flex:1;display:flex;flex-direction:column;">
            <div class="card-content">
              <div class="section-header">
                <div class="section-dot purple"></div>
                <h3 class="section-title">{{ $t('systemManage.gapMode.transparentConfig.title') }}</h3>
              </div>

              <div class="config-form">
                <!-- 隧道ID -->
                <div class="form-row">
                  <div class="form-label">
                    <el-icon class="label-icon"><Link /></el-icon>
                    <span>{{ $t('systemManage.gapMode.transparentConfig.tunnelId') }}</span>
                  </div>
                  <el-input v-model="tunnelId" :placeholder="$t('systemManage.gapMode.transparentConfig.tunnelIdPlaceholder')" disabled>
                    <template #prefix><el-icon><Key /></el-icon></template>
                  </el-input>
                </div>

                <!-- 内网接口 -->
                <div class="form-row">
                  <div class="form-label">
                    <el-icon class="label-icon"><Connection /></el-icon>
                    <span>{{ $t('systemManage.gapMode.transparentConfig.innerInterfaces') }}</span>
                  </div>
                  <el-select
                    v-model="innerInterfaces"
                    :placeholder="$t('systemManage.gapMode.transparentConfig.innerInterfacesPlaceholder')"
                    multiple
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
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
                        <el-tag :type="iface.status === 'up' ? 'success' : 'danger'" size="small" effect="dark">
                          {{ iface.status === 'up' ? $t('systemManage.gapMode.transparentConfig.statusUp') : $t('systemManage.gapMode.transparentConfig.statusDown') }}
                        </el-tag>
                      </div>
                    </el-option>
                  </el-select>
                </div>

                <!-- 外网接口 -->
                <div class="form-row">
                  <div class="form-label">
                    <el-icon class="label-icon"><Promotion /></el-icon>
                    <span>{{ $t('systemManage.gapMode.transparentConfig.outerInterfaces') }}</span>
                  </div>
                  <el-select
                    v-model="outerInterfaces"
                    :placeholder="$t('systemManage.gapMode.transparentConfig.outerInterfacesPlaceholder')"
                    multiple
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
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
                        <el-tag :type="iface.status === 'up' ? 'success' : 'danger'" size="small" effect="dark">
                          {{ iface.status === 'up' ? $t('systemManage.gapMode.transparentConfig.statusUp') : $t('systemManage.gapMode.transparentConfig.statusDown') }}
                        </el-tag>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 非透明模式提示 -->
          <div v-else key="placeholder" class="card placeholder-card" style="flex:1;">
            <div class="card-content placeholder-content">
              <el-icon class="placeholder-icon" :size="48"><InfoFilled /></el-icon>
              <p class="placeholder-text">{{ currentMode === 0 ? $t('systemManage.gapMode.modes.proxyDesc') : $t('systemManage.gapMode.modes.routeDesc') }}</p>
            </div>
          </div>
        </transition>

        <!-- 保存按钮 -->
        <div class="action-bar">
          <el-button type="primary" size="large" class="save-btn" :loading="saving" @click="handleSave">
            <el-icon v-if="!saving"><Check /></el-icon>
            {{ saving ? $t('systemManage.gapMode.actions.saving') : $t('systemManage.gapMode.actions.save') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Switch,
  InfoFilled,
  Monitor,
  Link,
  Key,
  Connection,
  Promotion,
  Check
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const currentMode = ref(0)
const tunnelId = ref('tunnel_001')
const innerInterfaces = ref<string[]>(['eth0', 'eth1'])
const outerInterfaces = ref<string[]>(['eth3', 'eth4'])
const saving = ref(false)

// 接口列表（Mock）
const interfaceList = ref([
  { value: 'eth0', label: 'eth0', ipAddress: '192.168.1.1', status: 'up' },
  { value: 'eth1', label: 'eth1', ipAddress: '10.0.0.1', status: 'up' },
  { value: 'eth2', label: 'eth2', ipAddress: '', status: 'down' },
  { value: 'eth3', label: 'eth3', ipAddress: '202.100.1.1', status: 'up' },
  { value: 'eth4', label: 'eth4', ipAddress: '172.16.0.1', status: 'up' },
  { value: 'lo', label: 'lo', ipAddress: '127.0.0.1', status: 'up' },
  { value: 'bond0', label: 'bond0', ipAddress: '192.168.2.1', status: 'up' }
])

// 当前模式标签
const currentModeLabel = computed(() => {
  const modes = [
    t('systemManage.gapMode.modes.proxy'),
    t('systemManage.gapMode.modes.route'),
    t('systemManage.gapMode.modes.transparent')
  ]
  return modes[currentMode.value] || modes[0]
})

// 模式横幅样式
const modeBannerClass = computed(() => {
  return ['mode-proxy', 'mode-route', 'mode-transparent'][currentMode.value] || 'mode-proxy'
})

// 保存
async function handleSave() {
  if (currentMode.value === 2) {
    if (innerInterfaces.value.length === 0) {
      ElNotification({ title: t('common.warning'), message: t('systemManage.gapMode.messages.selectInnerRequired'), type: 'warning', customClass: 'notification-warning' })
      return
    }
    if (outerInterfaces.value.length === 0) {
      ElNotification({ title: t('common.warning'), message: t('systemManage.gapMode.messages.selectOuterRequired'), type: 'warning', customClass: 'notification-warning' })
      return
    }
  }
  try {
    await ElMessageBox.confirm(
      t('systemManage.gapMode.messages.confirmSave'),
      t('systemManage.gapMode.actions.save'),
      { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
    )
    saving.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElNotification({ title: t('common.success'), message: t('systemManage.gapMode.messages.saveSuccess'), type: 'success', customClass: 'notification-success' })
  } catch {
    // cancelled
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // Mock加载
})
</script>

<style scoped>
.gap-mode-page {
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* 左右布局 */
.main-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.left-panel {
  width: 350px;
  min-width: 350px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 通用卡片 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.section-dot.purple {
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 模式列表 */
.mode-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mode-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
}

.mode-item:hover {
  border-color: rgba(64, 158, 255, 0.15);
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.04) 0%, rgba(103, 194, 58, 0.04) 100%);
}

.mode-item.active {
  border-color: #409EFF;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(103, 194, 58, 0.06) 100%);
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.1);
}

.mode-radio {
  padding-top: 2px;
}

.radio-outer {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.mode-item.active .radio-outer {
  border-color: #409EFF;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
}

.mode-info {
  flex: 1;
}

.mode-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mode-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.mode-tag.proxy-tag {
  background: rgba(64, 158, 255, 0.15) !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
  color: #409EFF !important;
}

.mode-tag.route-tag {
  background: rgba(103, 194, 58, 0.15) !important;
  border-color: rgba(103, 194, 58, 0.3) !important;
  color: #67C23A !important;
}

.mode-tag.transparent-tag {
  background: rgba(168, 85, 247, 0.15) !important;
  border-color: rgba(168, 85, 247, 0.3) !important;
  color: #A855F7 !important;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

/* 当前模式横幅 */
.current-mode-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(64, 158, 255, 0.15);
  transition: all 0.3s ease;
}

.current-mode-banner.mode-proxy {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(64, 158, 255, 0.02) 100%);
  border-color: rgba(64, 158, 255, 0.2);
}

.current-mode-banner.mode-proxy .banner-icon,
.current-mode-banner.mode-proxy .banner-value {
  color: #409EFF;
}

.current-mode-banner.mode-route {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.06) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-color: rgba(103, 194, 58, 0.2);
}

.current-mode-banner.mode-route .banner-icon,
.current-mode-banner.mode-route .banner-value {
  color: #67C23A;
}

.current-mode-banner.mode-transparent {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(168, 85, 247, 0.02) 100%);
  border-color: rgba(168, 85, 247, 0.2);
}

.current-mode-banner.mode-transparent .banner-icon,
.current-mode-banner.mode-transparent .banner-value {
  color: #A855F7;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-label {
  font-size: 14px;
  color: #909399;
}

.banner-value {
  font-size: 16px;
  font-weight: 700;
}

/* 配置卡片 */
.config-card {
  flex: 1;
}

/* 配置表单 */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.label-icon {
  color: #409EFF;
  font-size: 16px;
}

.form-row .el-input,
.form-row .el-select {
  flex: 1;
}

.interface-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.iface-name {
  font-weight: 600;
  color: #303133;
  min-width: 60px;
}

.iface-ip {
  color: #909399;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

/* 占位卡片 */
.placeholder-card {
  flex: 1;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
}

.placeholder-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.placeholder-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 保存按钮 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn {
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

.save-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}

/* 动画 */
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

/* 响应式 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-label {
    min-width: 0;
  }
}
</style>
