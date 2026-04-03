<template>
  <div class="page-container power-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><SwitchButton /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.onOff.title') }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card power-card">
        <!-- 系统状态显示 -->
        <div class="status-section">
          <div class="status-icon-wrapper">
            <div class="status-icon" :class="{ running: true }">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="status-pulse"></div>
          </div>
          <div class="status-info">
            <div class="status-title">{{ $t('systemMaintenance.onOff.systemStatus') }}</div>
            <div class="status-value">
              <el-tag type="success" size="large" effect="dark">
                <el-icon><CircleCheck /></el-icon>
                {{ $t('systemMaintenance.onOff.running') }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="warning-section">
          <el-alert
            :title="$t('systemMaintenance.onOff.warningTitle')"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              {{ $t('systemMaintenance.onOff.warningContent') }}
            </template>
          </el-alert>
        </div>

        <!-- 操作按钮区 -->
        <div class="action-section">
          <div class="action-buttons">
            <div class="button-wrapper">
              <el-button
                type="warning"
                size="large"
                class="btn-reboot"
                :loading="rebooting"
                @click="handleReboot"
              >
                <el-icon><RefreshRight /></el-icon>
                {{ $t('systemMaintenance.onOff.reboot') }}
              </el-button>
              <div class="button-hint">{{ $t('systemMaintenance.onOff.rebootHint') }}</div>
            </div>

            <div class="button-divider"></div>

            <div class="button-wrapper">
              <el-button
                type="danger"
                size="large"
                class="btn-shutdown"
                :loading="shuttingDown"
                @click="handleShutdown"
              >
                <el-icon><SwitchButton /></el-icon>
                {{ $t('systemMaintenance.onOff.shutdown') }}
              </el-button>
              <div class="button-hint">{{ $t('systemMaintenance.onOff.shutdownHint') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElNotification } from 'element-plus'
import { SwitchButton, Monitor, CircleCheck, RefreshRight } from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const rebooting = ref(false)
const shuttingDown = ref(false)

const handleReboot = async () => {
  try {
    await ElMessageBox.confirm(
      t('systemMaintenance.onOff.rebootConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        customClass: 'message-box-warning'
      }
    )

    rebooting.value = true
    // 模拟重启
    setTimeout(() => {
      ElNotification({
        title: t('common.success'),
        message: t('systemMaintenance.onOff.rebootSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
      rebooting.value = false
    }, 2000)
  } catch (error) {
    // 用户取消
  }
}

const handleShutdown = async () => {
  try {
    await ElMessageBox.confirm(
      t('systemMaintenance.onOff.shutdownConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'error',
        customClass: 'message-box-danger'
      }
    )

    shuttingDown.value = true
    // 模拟关机
    setTimeout(() => {
      ElNotification({
        title: t('common.success'),
        message: t('systemMaintenance.onOff.shutdownSuccess'),
        type: 'success',
        customClass: 'notification-success'
      })
      shuttingDown.value = false
    }, 2000)
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.power-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
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

/* 内容区域 */
.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex: 1;
}

/* 电源卡片 */
.power-card {
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  padding: 40px;
  display: flex;
  flex-direction: column;
}

/* 状态区域 */
.status-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  margin-bottom: 30px;
}

.status-icon-wrapper {
  position: relative;
  margin-right: 30px;
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #67C23A;
  position: relative;
  z-index: 1;
}

.status-icon.running {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(103, 194, 58, 0);
  }
}

.status-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid rgba(103, 194, 58, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.status-info {
  text-align: left;
}

.status-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.status-value .el-tag {
  padding: 8px 20px;
  font-size: 16px;
  font-weight: 500;
}

/* 警告区域 */
.warning-section {
  margin-bottom: 40px;
}

.warning-section :deep(.el-alert) {
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
  border: 1px solid rgba(230, 162, 60, 0.2);
}

/* 操作区域 */
.action-section {
  padding: 30px 0 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 60px;
}

.button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.button-divider {
  width: 1px;
  height: 80px;
  background: linear-gradient(180deg, transparent 0%, rgba(64, 158, 255, 0.2) 50%, transparent 100%);
}

/* 按钮样式 */
.btn-reboot,
.btn-shutdown {
  min-width: 200px;
  height: 70px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
}

.btn-reboot {
  background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4);
}

.btn-reboot:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(230, 162, 60, 0.5);
}

.btn-reboot:active {
  transform: translateY(-2px);
}

.btn-shutdown {
  background: linear-gradient(135deg, #F56C6C 0%, #C45656 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.4);
}

.btn-shutdown:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(245, 108, 108, 0.5);
}

.btn-shutdown:active {
  transform: translateY(-2px);
}

.button-hint {
  font-size: 12px;
  color: #909399;
  text-align: center;
  max-width: 200px;
}

/* 响应式 */
@media (max-width: 768px) {
  .power-card {
    padding: 24px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 30px;
  }

  .button-divider {
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(64, 158, 255, 0.2) 50%, transparent 100%);
  }

  .btn-reboot,
  .btn-shutdown {
    width: 100%;
    max-width: 280px;
  }

  .button-hint {
    max-width: 280px;
  }
}
</style>
