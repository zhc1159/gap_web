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

        <!-- 内容区域：左右布局 -->
        <div class="main-content">
          <!-- 左侧：系统状态 -->
          <div class="status-panel">
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>{{ $t('systemMaintenance.onOff.systemStatus') }}</span>
            </div>
            <div class="status-body">
              <div class="status-icon-wrapper">
                <div class="status-icon running">
                  <el-icon><CircleCheck /></el-icon>
                </div>
              </div>
              <div class="status-text">
                <div class="status-label">{{ $t('systemMaintenance.onOff.running') }}</div>
                <div class="status-desc">GAP Security Gateway</div>
              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="action-panel">
            <div class="panel-header">
              <el-icon><Operation /></el-icon>
              <span>{{ $t('systemMaintenance.onOff.operations') }}</span>
            </div>
            <div class="action-body">
              <div class="action-item">
                <el-button
                  type="warning"
                  class="btn-reboot"
                  :loading="rebooting"
                  @click="handleReboot"
                >
                  <el-icon><RefreshRight /></el-icon>
                  {{ $t('systemMaintenance.onOff.reboot') }}
                </el-button>
                <span class="action-hint">{{ $t('systemMaintenance.onOff.rebootHint') }}</span>
              </div>
              <div class="action-item">
                <el-button
                  type="danger"
                  class="btn-shutdown"
                  :loading="shuttingDown"
                  @click="handleShutdown"
                >
                  <el-icon><SwitchButton /></el-icon>
                  {{ $t('systemMaintenance.onOff.shutdown') }}
                </el-button>
                <span class="action-hint">{{ $t('systemMaintenance.onOff.shutdownHint') }}</span>
              </div>
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
import { SwitchButton, Monitor, CircleCheck, RefreshRight, Operation } from '@element-plus/icons-vue'

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

/* 内容区域 */
.content-wrapper {
  flex: 1;
}

/* 电源卡片 */
.power-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  padding: 20px;
}

/* 警告区域 */
.warning-section {
  margin-bottom: 20px;
}

.warning-section :deep(.el-alert) {
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
  border: 1px solid rgba(230, 162, 60, 0.2);
}

/* 主内容区：左右布局 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 面板通用样式 */
.status-panel,
.action-panel {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

/* 状态面板 */
.status-body {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 20px;
}

.status-icon-wrapper {
  flex-shrink: 0;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.status-icon.running {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.2) 0%, rgba(103, 194, 58, 0.1) 100%);
  color: #67C23A;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0.2);
  }
}

.status-text {
  flex: 1;
}

.status-label {
  font-size: 18px;
  font-weight: 600;
  color: #67C23A;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 13px;
  color: #909399;
}

/* 操作面板 */
.action-body {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-reboot,
.btn-shutdown {
  flex-shrink: 0;
  min-width: 140px;
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.btn-reboot {
  background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.btn-reboot:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(230, 162, 60, 0.4);
}

.btn-shutdown {
  background: linear-gradient(135deg, #F56C6C 0%, #C45656 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.btn-shutdown:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 108, 108, 0.4);
}

.action-hint {
  font-size: 12px;
  color: #909399;
}

/* 响应式 */
@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .power-page {
    padding: 12px;
  }

  .power-card {
    padding: 16px;
  }

  .btn-reboot,
  .btn-shutdown {
    width: 100%;
  }
}
</style>
