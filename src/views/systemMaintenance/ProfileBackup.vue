<template>
  <div class="page-container backup-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.profileBackup.title') }}</span>
      </div>
      <div class="header-status">
        <span class="status-label">{{ $t('systemMaintenance.profileBackup.autoBackup') }}</span>
        <el-switch
          v-model="config.autoBackup"
          :active-text="$t('common.on')"
          :inactive-text="$t('common.off')"
          inline-prompt
          class="backup-switch"
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 备份设置卡片 -->
      <div class="card config-card">
        <div class="card-header">
          <el-icon class="card-icon"><Timer /></el-icon>
          <span>{{ $t('systemMaintenance.profileBackup.backupSettings') }}</span>
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              <el-icon><Clock /></el-icon>
              <span>{{ $t('systemMaintenance.profileBackup.interval') }}</span>
            </div>
            <div class="setting-control">
              <el-input-number
                v-model="config.interval"
                :min="5"
                :max="600"
                :step="5"
                :disabled="!config.autoBackup"
              />
              <span class="unit">{{ $t('systemMaintenance.profileBackup.minutes') }}</span>
            </div>
          </div>
          <div class="setting-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('systemMaintenance.profileBackup.intervalHint') }}</span>
          </div>
        </div>
      </div>

      <!-- FTP配置卡片 -->
      <div class="card ftp-card">
        <div class="card-header">
          <el-icon class="card-icon"><Connection /></el-icon>
          <span>{{ $t('systemMaintenance.profileBackup.ftpConfig') }}</span>
        </div>
        <div class="card-content">
          <el-form
            :model="config"
            :rules="rules"
            label-width="150px"
            class="config-form"
            :label-position="'left'"
          >
            <el-form-item :label="$t('systemMaintenance.profileBackup.ftpIp')" prop="ftpIp">
              <el-input
                v-model="config.ftpIp"
                placeholder="192.168.1.100"
                :prefix-icon="Monitor"
              />
            </el-form-item>

            <el-form-item :label="$t('systemMaintenance.profileBackup.ftpPort')" prop="ftpPort">
              <el-input-number v-model="config.ftpPort" :min="1" :max="65535" />
            </el-form-item>

            <el-form-item :label="$t('systemMaintenance.profileBackup.ftpUser')" prop="ftpUser">
              <el-input v-model="config.ftpUser" :prefix-icon="User" />
            </el-form-item>

            <el-form-item :label="$t('systemMaintenance.profileBackup.ftpPassword')" prop="ftpPassword">
              <el-input
                v-model="config.ftpPassword"
                :type="showPassword ? 'text' : 'password'"
                :prefix-icon="Lock"
              >
                <template #suffix>
                  <el-button link @click="showPassword = !showPassword">
                    <el-icon>
                      <View v-if="!showPassword" />
                      <Hide v-else />
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item :label="$t('systemMaintenance.profileBackup.uploadPath')" prop="uploadPath">
              <el-input v-model="config.uploadPath" placeholder="/backup" :prefix-icon="FolderOpened" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 备份状态卡片 -->
      <div class="card status-card">
        <div class="card-header">
          <el-icon class="card-icon"><DataAnalysis /></el-icon>
          <span>{{ $t('systemMaintenance.profileBackup.backupStatus') }}</span>
        </div>
        <div class="card-content">
          <div class="status-grid">
            <div class="status-item">
              <div class="status-icon success">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ lastBackupTime }}</div>
                <div class="status-label">{{ $t('systemMaintenance.profileBackup.lastBackup') }}</div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon primary">
                <el-icon><Files /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ totalBackups }}</div>
                <div class="status-label">{{ $t('systemMaintenance.profileBackup.totalBackups') }}</div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon warning">
                <el-icon><Coin /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ totalSize }}</div>
                <div class="status-label">{{ $t('systemMaintenance.profileBackup.totalSize') }}</div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon" :class="config.autoBackup ? 'success' : 'info'">
                <el-icon><RefreshRight /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ config.autoBackup ? $t('common.enabled') : $t('common.disabled') }}</div>
                <div class="status-label">{{ $t('systemMaintenance.profileBackup.autoBackupStatus') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button class="btn-save" :loading="saving" @click="handleSave">
          <el-icon><Check /></el-icon>
          {{ $t('systemMaintenance.profileBackup.save') }}
        </el-button>
        <el-button class="btn-test" @click="handleTest">
          <el-icon><Connection /></el-icon>
          {{ $t('systemMaintenance.profileBackup.testConnection') }}
        </el-button>
        <el-button class="btn-backup" @click="handleBackupNow">
          <el-icon><Download /></el-icon>
          {{ $t('systemMaintenance.profileBackup.backupNow') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import {
  Setting, Timer, Clock, InfoFilled, Connection, Monitor, User, Lock,
  View, Hide, FolderOpened, DataAnalysis, CircleCheck, Files, Coin,
  RefreshRight, Check, Download
} from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'

// 表单配置
const config = reactive({
  autoBackup: false,
  interval: 30,
  ftpIp: '',
  ftpPort: 21,
  ftpUser: '',
  ftpPassword: '',
  uploadPath: '/backup'
})

// 状态数据
const showPassword = ref(false)
const saving = ref(false)
const lastBackupTime = ref('2026-04-03 08:00:00')
const totalBackups = ref('12')
const totalSize = ref('256 MB')

// 表单验证规则
const rules: FormRules = {
  ftpIp: [
    { required: true, message: 'Please enter FTP IP', trigger: 'blur' },
    {
      pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
      message: 'Invalid IP format',
      trigger: 'blur'
    }
  ],
  ftpPort: [
    { required: true, message: 'Please enter FTP port', trigger: 'blur' }
  ],
  ftpUser: [
    { required: true, message: 'Please enter FTP username', trigger: 'blur' }
  ],
  ftpPassword: [
    { required: true, message: 'Please enter FTP password', trigger: 'blur' }
  ],
  uploadPath: [
    { required: true, message: 'Please enter upload path', trigger: 'blur' }
  ]
}

// 保存配置
const handleSave = async () => {
  saving.value = true
  // 模拟保存
  setTimeout(() => {
    saving.value = false
    ElNotification({
      title: 'Success',
      message: 'Configuration saved successfully',
      type: 'success',
      customClass: 'notification-success'
    })
  }, 1000)
}

// 测试连接
const handleTest = () => {
  ElNotification({
    title: 'Testing',
    message: 'Testing FTP connection...',
    type: 'info',
    customClass: 'notification-info'
  })
  setTimeout(() => {
    ElNotification({
      title: 'Success',
      message: 'FTP connection successful',
      type: 'success',
      customClass: 'notification-success'
    })
  }, 1500)
}

// 立即备份
const handleBackupNow = () => {
  ElNotification({
    title: 'Backup',
    message: 'Starting backup...',
    type: 'info',
    customClass: 'notification-info'
  })
  setTimeout(() => {
    lastBackupTime.value = new Date().toLocaleString()
    ElNotification({
      title: 'Success',
      message: 'Backup completed successfully',
      type: 'success',
      customClass: 'notification-success'
    })
  }, 2000)
}

onMounted(() => {
  // 模拟加载配置
})
</script>

<style scoped>
.backup-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
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

.header-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.backup-switch {
  --el-switch-on-color: #67C23A;
  --el-switch-off-color: rgba(255, 255, 255, 0.3);
}

/* 内容区域 */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 卡片 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
}

.card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 14px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  color: white;
}

.card-content {
  padding: 20px;
}

/* 设置行 */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.setting-label .el-icon {
  color: #409EFF;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit {
  color: #909399;
  font-size: 13px;
}

.setting-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  padding-top: 8px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* 表单样式 */
.config-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.config-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.config-form :deep(.el-input),
.config-form :deep(.el-input-number) {
  width: 100%;
}

/* 状态网格 */
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.status-item:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 14px;
}

.status-icon.success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.status-icon.primary {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
  color: #409EFF;
}

.status-icon.warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  color: #E6A23C;
}

.status-icon.info {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.05) 100%);
  color: #909399;
}

.status-info {
  flex: 1;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 操作按钮 */
.action-bar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.action-bar .el-button {
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  transition: all 0.3s ease;
}

.btn-save {
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.35);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
}

.btn-test {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.35);
}

.btn-test:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
}

.btn-backup {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.35);
}

.btn-backup:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.45);
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .action-bar {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
  }

  .action-bar .el-button {
    width: 100%;
  }
}
</style>
