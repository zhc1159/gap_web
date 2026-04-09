<template>
  <div class="page-container linkpoly-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Link /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.linkPoly.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.linkPoly.describe') }}</span>
    </div>

    <!-- 双栏配置 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="zones-row">
          <!-- 内端链路聚合 -->
          <div class="zone-panel">
            <div class="zone-title-bar">
              <div class="zone-dot inner"></div>
              <span class="zone-label">{{ $t('systemManage.linkPoly.innerConfig') }}</span>
              <el-switch v-model="innerConfig.switchOn" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
            </div>

            <div class="config-form">
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Setting /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.modeType') }}</span>
                </div>
                <el-select v-model="innerConfig.mode" style="width: 100%">
                  <el-option v-for="opt in bondModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Connection /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.bondInterface1') }}</span>
                </div>
                <el-select v-model="innerConfig.oneInter" :placeholder="$t('systemManage.linkPoly.bondInterface1Placeholder')" style="width: 100%" clearable>
                  <el-option v-for="opt in innerInterfaceOneOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Connection /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.bondInterface2') }}</span>
                </div>
                <el-select v-model="innerConfig.twoInter" :placeholder="$t('systemManage.linkPoly.bondInterface2Placeholder')" style="width: 100%" clearable>
                  <el-option v-for="opt in innerInterfaceTwoOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><EditPen /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.interfaceAddr') }}</span>
                </div>
                <el-input v-model="innerConfig.addr" :placeholder="$t('systemManage.linkPoly.interfaceAddrPlaceholder')" />
              </div>
              <transition name="tech-fade">
                <div v-if="innerConfig.mode === 4" class="form-row">
                  <div class="form-label">
                    <el-icon class="label-icon"><Sort /></el-icon>
                    <span>{{ $t('systemManage.linkPoly.diversionMode') }}</span>
                  </div>
                  <el-select v-model="innerConfig.diversionMode" style="width: 100%">
                    <el-option v-for="opt in diversionModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
              </transition>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="zone-divider"></div>

          <!-- 外端链路聚合 -->
          <div class="zone-panel">
            <div class="zone-title-bar">
              <div class="zone-dot outer"></div>
              <span class="zone-label">{{ $t('systemManage.linkPoly.outerConfig') }}</span>
              <el-switch v-model="outerConfig.switchOn" :active-text="$t('common.on')" :inactive-text="$t('common.off')" inline-prompt />
            </div>

            <div class="config-form">
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Setting /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.modeType') }}</span>
                </div>
                <el-select v-model="outerConfig.mode" style="width: 100%">
                  <el-option v-for="opt in bondModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Connection /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.bondInterface1') }}</span>
                </div>
                <el-select v-model="outerConfig.oneInter" :placeholder="$t('systemManage.linkPoly.bondInterface1Placeholder')" style="width: 100%" clearable>
                  <el-option v-for="opt in outerInterfaceOneOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><Connection /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.bondInterface2') }}</span>
                </div>
                <el-select v-model="outerConfig.twoInter" :placeholder="$t('systemManage.linkPoly.bondInterface2Placeholder')" style="width: 100%" clearable>
                  <el-option v-for="opt in outerInterfaceTwoOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="form-row">
                <div class="form-label">
                  <el-icon class="label-icon"><EditPen /></el-icon>
                  <span>{{ $t('systemManage.linkPoly.interfaceAddr') }}</span>
                </div>
                <el-input v-model="outerConfig.addr" :placeholder="$t('systemManage.linkPoly.interfaceAddrPlaceholder')" />
              </div>
              <transition name="tech-fade">
                <div v-if="outerConfig.mode === 4" class="form-row">
                  <div class="form-label">
                    <el-icon class="label-icon"><Sort /></el-icon>
                    <span>{{ $t('systemManage.linkPoly.diversionMode') }}</span>
                  </div>
                  <el-select v-model="outerConfig.diversionMode" style="width: 100%">
                    <el-option v-for="opt in diversionModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-row">
      <el-button type="primary" class="apply-btn" @click="handleSave">
        <el-icon><Check /></el-icon>
        {{ $t('systemManage.linkPoly.save') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import {
  Link,
  InfoFilled,
  Check,
  Setting,
  Connection,
  EditPen,
  Sort
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ==================== 接口选项 ====================
const innerInterfaces = [
  { label: 'eth0 (内网口1)', value: 'eth0' },
  { label: 'eth1 (内网口2)', value: 'eth1' },
  { label: 'eth2 (内网口3)', value: 'eth2' }
]

const outerInterfaces = [
  { label: 'eth3 (外网口1)', value: 'eth3' },
  { label: 'eth4 (外网口2)', value: 'eth4' },
  { label: 'eth5 (外网口3)', value: 'eth5' }
]

// ==================== 模式选项 ====================
const bondModeOptions = [
  { label: '0 - ' + t('systemManage.linkPoly.mode.0'), value: 0 },
  { label: '1 - ' + t('systemManage.linkPoly.mode.1'), value: 1 },
  { label: '2 - ' + t('systemManage.linkPoly.mode.2'), value: 2 },
  { label: '3 - ' + t('systemManage.linkPoly.mode.3'), value: 3 },
  { label: '4 - ' + t('systemManage.linkPoly.mode.4'), value: 4 }
]

const diversionModeOptions = [
  { label: t('systemManage.linkPoly.diversion.layer2'), value: 'layer2' },
  { label: t('systemManage.linkPoly.diversion.layer2+3'), value: 'layer2+3' },
  { label: t('systemManage.linkPoly.diversion.layer3+4'), value: 'layer3+4' }
]

// ==================== 内端配置 ====================
const innerConfig = reactive({
  switchOn: true,
  mode: 0,
  oneInter: 'eth0',
  twoInter: 'eth1',
  addr: '192.168.1.1/24',
  diversionMode: 'layer2'
})

// ==================== 外端配置 ====================
const outerConfig = reactive({
  switchOn: false,
  mode: 0,
  oneInter: '',
  twoInter: '',
  addr: '',
  diversionMode: 'layer2'
})

// ==================== 互斥接口选项 ====================
const innerInterfaceOneOptions = computed(() =>
  innerInterfaces.filter(opt => opt.value !== innerConfig.twoInter)
)
const innerInterfaceTwoOptions = computed(() =>
  innerInterfaces.filter(opt => opt.value !== innerConfig.oneInter)
)
const outerInterfaceOneOptions = computed(() =>
  outerInterfaces.filter(opt => opt.value !== outerConfig.twoInter)
)
const outerInterfaceTwoOptions = computed(() =>
  outerInterfaces.filter(opt => opt.value !== outerConfig.oneInter)
)

// ==================== 保存 ====================
function handleSave() {
  if (innerConfig.switchOn && innerConfig.oneInter === innerConfig.twoInter && innerConfig.oneInter !== '') {
    ElNotification({ title: t('common.error'), message: t('systemManage.linkPoly.interfaceSame'), type: 'error', customClass: 'notification-error' })
    return
  }
  if (outerConfig.switchOn && outerConfig.oneInter === outerConfig.twoInter && outerConfig.oneInter !== '') {
    ElNotification({ title: t('common.error'), message: t('systemManage.linkPoly.interfaceSame'), type: 'error', customClass: 'notification-error' })
    return
  }
  ElNotification({ title: t('common.success'), message: t('systemManage.linkPoly.saveSuccess'), type: 'success', customClass: 'notification-success' })
}
</script>

<style scoped>
.linkpoly-page {
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
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* ========== 主卡片 ========== */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.main-card {
  margin-bottom: 16px;
}

.card-content {
  padding: 24px 28px;
}

/* ========== 双栏平铺 ========== */
.zones-row {
  display: flex;
  gap: 0;
}

.zone-panel {
  flex: 1;
  min-width: 0;
  padding: 0 4px;
}

.zone-divider {
  width: 2px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.06) 0%, rgba(64, 158, 255, 0.18) 50%, rgba(103, 194, 58, 0.18) 50%, rgba(103, 194, 58, 0.06) 100%);
  border-radius: 1px;
  margin: 0 20px;
  flex-shrink: 0;
}

.zone-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.08);
}

.zone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.zone-dot.inner {
  background: linear-gradient(135deg, #409EFF, #79bbff);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.zone-dot.outer {
  background: linear-gradient(135deg, #67C23A, #95d475);
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}

.zone-label {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  flex: 1;
}

/* ========== 配置表单 ========== */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.label-icon {
  font-size: 16px;
  color: #409EFF;
}

/* ========== 保存按钮 ========== */
.action-row {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.apply-btn {
  min-width: 160px;
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

/* ========== 动画 ========== */
.tech-fade-enter-active,
.tech-fade-leave-active {
  transition: all 0.3s ease;
}

.tech-fade-enter-from,
.tech-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
