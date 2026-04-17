<template>
  <div class="page-container security-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <span class="header-title">{{ $t('authorityManage.secureShow.title') }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 数值配置区域 -->
          <div class="config-section">
            <div class="section-title">{{ $t('authorityManage.secureShow.numericConfig') }}</div>

            <div class="config-grid">
              <div class="config-item">
                <div class="config-label">
                  <el-icon><RefreshRight /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.retry') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.retry" :min="1" :max="5" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.retryHint') }}</span>
                </div>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Timer /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.userTimeout') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.userTimeout" :min="1" :max="59" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.userTimeoutHint') }}</span>
                </div>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Unlock /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.userUnlockTimeout') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.userUnlockTimeout" :min="1" :max="59" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.userUnlockTimeoutHint') }}</span>
                </div>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Key /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.userPwdLen') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.userPwdLen" :min="8" :max="16" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.userPwdLenHint') }}</span>
                </div>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.userPwdCycle') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.userPwdCycle" :min="1" :max="7" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.userPwdCycleHint') }}</span>
                </div>
              </div>

              <div class="config-item">
                <div class="config-label">
                  <el-icon><Clock /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.autoActiveInterval') }}</span>
                </div>
                <div class="config-input">
                  <el-input-number v-model="config.autoActiveInterval" :min="30" :max="300" controls-position="right" />
                  <span class="hint">{{ $t('authorityManage.secureShow.autoActiveIntervalHint') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 认证开关区域 -->
          <div class="config-section">
            <div class="section-title">{{ $t('authorityManage.secureShow.authSwitches') }}</div>

            <div class="switch-grid">
              <div class="switch-item">
                <div class="switch-label">
                  <el-icon><Tickets /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.certSwitch') }}</span>
                </div>
                <el-switch v-model="config.certSwitch" />
              </div>

              <div class="switch-item">
                <div class="switch-label">
                  <el-icon><Connection /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.ukeySwitch') }}</span>
                </div>
                <el-switch v-model="config.ukeySwitch" />
              </div>

              <div class="switch-item">
                <div class="switch-label">
                  <el-icon><Grid /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.otpSwitch') }}</span>
                </div>
                <el-switch v-model="config.otpSwitch" />
              </div>

              <div class="switch-item">
                <div class="switch-label">
                  <el-icon><Aim /></el-icon>
                  <span>{{ $t('authorityManage.secureShow.firsSwitch') }}</span>
                </div>
                <el-switch v-model="config.firsSwitch" />
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="save-section">
            <el-button type="primary" class="save-btn" :loading="saving" @click="handleSave">
              <el-icon v-if="!saving"><Check /></el-icon>
              {{ $t('common.save') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import { Lock, RefreshRight, Timer, Unlock, Key, Calendar, Clock, Tickets, Connection, Grid, Aim, Check } from '@element-plus/icons-vue'

const { t } = useI18n()

// 接口定义
interface SecurityConfig {
  retry: number
  userTimeout: number
  userUnlockTimeout: number
  userPwdLen: number
  userPwdCycle: number
  autoActiveInterval: number
  certSwitch: boolean
  ukeySwitch: boolean
  otpSwitch: boolean
  firsSwitch: boolean
}

// 状态
const saving = ref(false)

// 模拟数据
const config = reactive<SecurityConfig>({
  retry: 3,
  userTimeout: 30,
  userUnlockTimeout: 30,
  userPwdLen: 8,
  userPwdCycle: 7,
  autoActiveInterval: 60,
  certSwitch: false,
  ukeySwitch: false,
  otpSwitch: false,
  firsSwitch: false
})

// 保存配置
const handleSave = async () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElNotification({
      title: t('common.success'),
      message: t('authorityManage.secureShow.saveSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })
  }, 1000)
}

onMounted(() => {
  // 模拟加载数据
})
</script>

<style scoped>
.security-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
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

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

.main-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.card-content {
  padding: 24px;
}

/* 配置区域 */
.config-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: var(--page-header-gradient);
  border-radius: 2px;
}

/* 数值配置网格 */
.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 30px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.config-label .el-icon {
  color: #409EFF;
  font-size: 16px;
}

.config-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-input :deep(.el-input-number) {
  width: 140px;
}

.config-input .hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 开关网格 */
.switch-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
}

.switch-item:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(103, 194, 58, 0.06) 100%);
  border-color: rgba(64, 158, 255, 0.15);
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.switch-label .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.switch-item :deep(.el-switch.is-checked .el-switch__core) {
  border-color: #67C23A;
  background-color: #67C23A;
}

/* 保存区域 */
.save-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(64, 158, 255, 0.1);
}

.save-btn {
  min-width: 160px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  background: var(--page-header-gradient);
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

/* 响应式 */
@media (max-width: 900px) {
  .config-grid,
  .switch-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .security-page {
    padding: 12px;
  }

  .card-content {
    padding: 16px;
  }
}
</style>
