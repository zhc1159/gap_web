<template>
  <div class="page-container license-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Key /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.licenseShow.title') }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 授权状态卡片 -->
      <div class="card status-card">
        <div class="card-header">
          <el-icon class="card-icon"><CircleCheck /></el-icon>
          <span>{{ $t('systemMaintenance.licenseShow.status') }}</span>
        </div>
        <div class="status-content">
          <div class="status-visual">
            <div class="license-ring" :class="licenseStatus">
              <div class="ring-inner">
                <div class="ring-value">{{ remainingDays }}</div>
                <div class="ring-unit">{{ $t('systemMaintenance.licenseShow.days') }}</div>
              </div>
            </div>
          </div>
          <div class="status-info">
            <div class="info-row">
              <span class="info-label">{{ $t('systemMaintenance.licenseShow.expiryDate') }}</span>
              <span class="info-value">{{ expiryDate }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('systemMaintenance.licenseShow.licenseType') }}</span>
              <el-tag :type="licenseType === '正式版' ? 'success' : 'warning'" effect="dark">
                {{ licenseType }}
              </el-tag>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('systemMaintenance.licenseShow.authorizedModules') }}</span>
              <span class="info-value">{{ authorizedModules }}</span>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="showDeviceCode">
              <el-icon><View /></el-icon>
              {{ $t('systemMaintenance.licenseShow.viewDeviceCode') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 授权信息详情 -->
      <div class="card info-card">
        <div class="card-header">
          <el-icon class="card-icon"><Document /></el-icon>
          <span>{{ $t('systemMaintenance.licenseShow.licenseInfo') }}</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.deviceName') }}</div>
              <div class="info-item-value">{{ deviceName }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.cpuCores') }}</div>
              <div class="info-item-value">{{ cpuCores }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.activationDate') }}</div>
              <div class="info-item-value">{{ activationDate }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.lastUpdate') }}</div>
              <div class="info-item-value">{{ lastUpdate }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Key /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.serialNumber') }}</div>
              <div class="info-item-value serial-number">{{ serialNumber }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.maxConnections') }}</div>
              <div class="info-item-value">{{ maxConnections }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><Platform /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.version') }}</div>
              <div class="info-item-value">{{ version }}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="info-item-content">
              <div class="info-item-label">{{ $t('systemMaintenance.licenseShow.manufacturer') }}</div>
              <div class="info-item-value">{{ manufacturer }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="card upload-card">
        <div class="card-header">
          <el-icon class="card-icon"><Upload /></el-icon>
          <span>{{ $t('systemMaintenance.licenseShow.uploadLicense') }}</span>
        </div>
        <div class="upload-content">
          <el-upload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".crt,.der,.pfx,.lic"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            class="license-upload"
          >
            <div class="upload-dragger-content">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                <span>{{ $t('systemMaintenance.licenseShow.dragFile') }}</span>
                <em>{{ $t('systemMaintenance.licenseShow.clickUpload') }}</em>
              </div>
              <div class="upload-hint">
                {{ $t('systemMaintenance.licenseShow.supportFormats') }}: .crt, .der, .pfx, .lic
              </div>
            </div>
          </el-upload>

          <!-- 上传进度 -->
          <transition name="fade">
            <div v-if="uploading" class="progress-section">
              <el-progress
                :percentage="uploadProgress"
                :stroke-width="10"
                :show-text="true"
                :color="progressColor"
              />
              <div class="progress-text">{{ $t('systemMaintenance.licenseShow.uploading') }}...</div>
            </div>
          </transition>

          <!-- 操作按钮 -->
          <div v-if="fileList.length > 0" class="upload-actions">
            <el-button
              type="primary"
              :loading="uploading"
              @click="handleUpload"
            >
              <el-icon><Position /></el-icon>
              {{ uploading ? $t('systemMaintenance.licenseShow.uploading') : $t('systemMaintenance.licenseShow.startUpload') }}
            </el-button>
            <el-button @click="clearFiles">
              <el-icon><Delete /></el-icon>
              {{ $t('common.clear') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备码对话框 -->
    <el-dialog
      v-model="deviceCodeDialogVisible"
      :title="$t('systemMaintenance.licenseShow.deviceCode')"
      width="550px"
      class="device-code-dialog"
    >
      <div class="device-code-content">
        <div class="device-code-header">
          <el-icon><Link /></el-icon>
          <span>{{ $t('systemMaintenance.licenseShow.deviceCodeHint') }}</span>
        </div>
        <el-input
          v-model="deviceCode"
          type="textarea"
          :rows="8"
          readonly
          class="device-code-textarea"
        />
      </div>
      <template #footer>
        <el-button @click="deviceCodeDialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="copyDeviceCode">
          <el-icon><DocumentCopy /></el-icon>
          {{ $t('systemMaintenance.licenseShow.copyCode') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElNotification } from 'element-plus'
import {
  Key, CircleCheck, View, Document, Monitor, Cpu, Calendar, Timer,
  Upload, UploadFilled, Position, Delete, Link, DocumentCopy, Connection, Platform, OfficeBuilding
} from '@element-plus/icons-vue'

// 上传组件引用
const uploadRef = ref()

// 状态数据
const licenseStatus = ref('valid') // valid, expiring, expired
const remainingDays = ref(365)
const expiryDate = ref('2027-04-03')
const licenseType = ref('正式版')
const authorizedModules = ref('全部模块')
const deviceName = ref('GAP-Security-Gateway-01')
const cpuCores = ref('8 Cores')
const activationDate = ref('2024-04-03')
const lastUpdate = ref('2026-04-01 14:30:25')
const serialNumber = ref('GAP-2024-XXXX-XXXX-XXXX')
const maxConnections = ref('10000')
const version = ref('v3.2.1 Enterprise')
const manufacturer = ref('GAP Security Inc.')
const deviceCode = ref('')

// 上传相关
const fileList = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)

// 对话框
const deviceCodeDialogVisible = ref(false)

// 计算进度条颜色
const progressColor = computed(() => {
  if (uploadProgress.value < 30) return '#409EFF'
  if (uploadProgress.value < 70) return '#E6A23C'
  return '#67C23A'
})

// 显示设备码
const showDeviceCode = () => {
  // 模拟设备码
  deviceCode.value = `-----BEGIN DEVICE CODE-----
MIIFxzCCA6ygAwIBAgIJALhVu9HyT6w4MA0GCSqGSIb3DQEB
CwUAMIGWMQswCQYDVQQGEwJDTjEQMA4GA1UECAwHQmVpamlu
ZzEQMA4GA1UEBwwHQmVpamluZzEfMB0GA1UECgwWR0FQIFNl
Y3VyaXR5IEdhdGV3YXkxIzAhBgNVBAsMGkxpY2Vuc2UgQXV0
aG9yaXphdGlvbiBDZW50ZXIwHhcNMjQwNDAzMDAwMDAwWhcN
MjcwNDAzMDAwMDAwWjCBlzELMAkGA1UEBhMCQ04xEDAOBgNV
BAYHB0JlaWppbmcxEDAOBgNVBAcMB0JlaWppbmcxHzAdBgNV
BAoMFkdBUCBTZWN1cml0eSBHYXRld2F5MSMwIQYDVQQLDBpM
aWNlbnNlIEF1dGhvcml6YXRpb24gQ2VudGVyMIIBIjANBgkq
-----END DEVICE CODE-----`
  deviceCodeDialogVisible.value = true
}

// 复制设备码
const copyDeviceCode = () => {
  navigator.clipboard.writeText(deviceCode.value)
    .then(() => {
      ElNotification({
        title: 'Success',
        message: 'Copied to clipboard',
        type: 'success',
        customClass: 'notification-success'
      })
    })
    .catch(() => {
      ElNotification({
        title: 'Error',
        message: 'Copy failed',
        type: 'error',
        customClass: 'notification-error'
      })
    })
}

// 文件变化处理
const handleFileChange = (_file: any, files: any[]) => {
  fileList.value = files.map(f => f.raw)
}

// 文件移除处理
const handleFileRemove = (_file: any, files: any[]) => {
  fileList.value = files.map(f => f.raw)
}

// 上传文件
const handleUpload = async () => {
  if (fileList.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  // 模拟上传进度
  const timer = setInterval(() => {
    uploadProgress.value += Math.random() * 15
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(timer)

      setTimeout(() => {
        uploading.value = false
        ElNotification({
          title: 'Success',
          message: 'License uploaded successfully',
          type: 'success',
          customClass: 'notification-success'
        })
        clearFiles()
      }, 500)
    }
  }, 200)
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
  uploadProgress.value = 0
}

// 定时器
let updateTimer: number | null = null

onMounted(() => {
  // 模拟授权状态更新
  updateTimer = window.setInterval(() => {
    // 这里可以添加实时更新逻辑
  }, 1000)
})

onBeforeUnmount(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.license-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
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

/* 授权状态卡片 */
.status-card {
  grid-column: 1;
}

.status-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-visual {
  margin-bottom: 24px;
}

.license-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    #67C23A 0deg,
    #67C23A calc(var(--progress, 100) * 3.6deg),
    #e4e7ed calc(var(--progress, 100) * 3.6deg),
    #e4e7ed 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.license-ring.valid {
  --progress: 100;
  background: conic-gradient(#67C23A 0deg, #67C23A 360deg);
}

.license-ring.expiring {
  --progress: 30;
  background: conic-gradient(#E6A23C 0deg, #E6A23C 108deg, #e4e7ed 108deg, #e4e7ed 360deg);
}

.license-ring.expired {
  --progress: 0;
  background: conic-gradient(#F56C6C 0deg, #F56C6C 10deg, #e4e7ed 10deg, #e4e7ed 360deg);
}

.ring-inner {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
}

.ring-value {
  font-size: 36px;
  font-weight: 700;
  color: #67C23A;
  font-family: 'Courier New', monospace;
}

.ring-unit {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.status-info {
  width: 100%;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.action-buttons {
  width: 100%;
}

.action-buttons .el-button {
  width: 100%;
}

/* 授权信息卡片 */
.info-card {
  grid-column: 2;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  border-right: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(64, 158, 255, 0.03);
}

.info-item:nth-child(2n) {
  border-right: none;
}

.info-item:nth-last-child(-n+2) {
  border-bottom: none;
}

.info-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  font-size: 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
  color: #409EFF;
}

.info-item-content {
  flex: 1;
}

.info-item-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-item-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 上传卡片 */
.upload-card {
  grid-column: 1 / -1;
}

.upload-content {
  padding: 24px;
}

.license-upload {
  width: 100%;
}

.license-upload :deep(.el-upload-dragger) {
  border: 2px dashed rgba(64, 158, 255, 0.3);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  transition: all 0.3s ease;
}

.license-upload :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.05);
}

.upload-dragger-content {
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-text em {
  color: #409EFF;
  font-style: normal;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.progress-section {
  margin-top: 20px;
  padding: 20px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 10px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 设备码对话框 */
.device-code-content {
  padding: 10px 0;
}

.device-code-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.device-code-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f7fa;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .status-card,
  .info-card,
  .upload-card {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    border-right: none;
  }

  .info-item:nth-child(2n) {
    border-right: none;
  }
}
</style>
