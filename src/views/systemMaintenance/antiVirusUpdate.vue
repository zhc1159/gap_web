<template>
  <div class="page-container virus-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FirstAidKit /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.antiVirusUpdate.title') }}</span>
      </div>
      <div class="header-status">
        <span class="header-status-label">{{ $t('systemMaintenance.antiVirusUpdate.autoUpdate') }}</span>
        <el-switch
          v-model="autoUpdate"
          :active-text="$t('common.on')"
          :inactive-text="$t('common.off')"
          inline-prompt
          class="auto-switch"
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 文件上传区域 -->
      <div class="card upload-card">
        <div class="card-header">
          <el-icon class="card-icon"><Upload /></el-icon>
          <span>{{ $t('systemMaintenance.antiVirusUpdate.uploadArea') }}</span>
        </div>
        <div class="card-content">
          <div class="upload-row">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              accept=".cvd"
            >
              <el-button type="primary" class="btn-upload">
                <el-icon><Upload /></el-icon>
                {{ $t('systemMaintenance.antiVirusUpdate.uploadFile') }}
              </el-button>
            </el-upload>

            <el-button
              type="success"
              class="btn-manual"
              :disabled="!canManualUpdate"
              :loading="manualUpdating"
              @click="handleManualUpdate"
            >
              <el-icon><Refresh /></el-icon>
              {{ manualUpdateText }}
            </el-button>
          </div>

          <transition name="fade">
            <div v-if="uploading" class="progress-wrapper">
              <el-progress
                :percentage="uploadProgress"
                :stroke-width="10"
                :format="formatProgress"
              />
              <span class="progress-text">{{ progressText }}</span>
            </div>
          </transition>
        </div>
      </div>

      <!-- 左右两列布局 -->
      <div class="two-columns">
        <!-- 杀毒引擎信息 -->
        <div class="card engine-card">
          <div class="card-header">
            <el-icon class="card-icon"><Cpu /></el-icon>
            <span>{{ $t('systemMaintenance.antiVirusUpdate.engineInfo') }}</span>
          </div>
          <div class="card-content">
            <div class="engine-info">
              <div class="engine-item">
                <div class="engine-icon">
                  <el-icon><Aim /></el-icon>
                </div>
                <div class="engine-detail">
                  <div class="engine-label">{{ $t('systemMaintenance.antiVirusUpdate.engineName') }}</div>
                  <div class="engine-value">{{ engineInfo.name }}</div>
                </div>
              </div>
              <div class="engine-item">
                <div class="engine-icon version">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="engine-detail">
                  <div class="engine-label">{{ $t('systemMaintenance.antiVirusUpdate.engineVersion') }}</div>
                  <div class="engine-value">{{ engineInfo.version }}</div>
                </div>
              </div>
              <div class="engine-item">
                <div class="engine-icon date">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="engine-detail">
                  <div class="engine-label">{{ $t('systemMaintenance.antiVirusUpdate.lastUpdate') }}</div>
                  <div class="engine-value">{{ engineInfo.lastUpdate }}</div>
                </div>
              </div>
              <div class="engine-item">
                <div class="engine-icon status">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="engine-detail">
                  <div class="engine-label">{{ $t('systemMaintenance.antiVirusUpdate.dbStatus') }}</div>
                  <div class="engine-value status-active">
                    <el-tag type="success" size="small">{{ $t('systemMaintenance.antiVirusUpdate.upToDate') }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 升级文件列表 -->
        <div class="card history-card">
          <div class="card-header">
            <el-icon class="card-icon"><Files /></el-icon>
            <span>{{ $t('systemMaintenance.antiVirusUpdate.fileList') }}</span>
          </div>
          <div class="card-content">
            <el-table :data="fileList" style="width: 100%" class="file-table">
              <el-table-column prop="index" :label="$t('systemMaintenance.antiVirusUpdate.index')" min-width="60" />
              <el-table-column prop="fileName" :label="$t('systemMaintenance.antiVirusUpdate.fileName')" min-width="150" />
              <el-table-column prop="version" :label="$t('systemMaintenance.antiVirusUpdate.version')" min-width="100" />
              <el-table-column prop="updateTime" :label="$t('systemMaintenance.antiVirusUpdate.updateTime')" min-width="160" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Upload, Refresh, Cpu, Document, Clock,
  CircleCheck, Files, Aim, FirstAidKit
} from '@element-plus/icons-vue'

// 状态
const autoUpdate = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const progressText = ref('')
const canManualUpdate = ref(true)
const manualUpdating = ref(false)

const engineInfo = ref({
  name: 'DeepNet Antivirus Engine',
  version: '1.0.3',
  lastUpdate: '2024-01-15 10:30:00'
})

const fileList = ref([
  { index: 1, fileName: 'daily.cvd', version: '1.0.3', updateTime: '2024-01-15 10:30:00' },
  { index: 2, fileName: 'main.cvd', version: '1.0.2', updateTime: '2024-01-10 09:20:00' },
  { index: 3, fileName: 'bytecode.cvd', version: '1.0.1', updateTime: '2024-01-05 14:15:00' },
  { index: 4, fileName: 'bytecode.cvd', version: '1.0.0', updateTime: '2024-01-01 08:00:00' }
])

const manualUpdateText = computed(() => {
  return canManualUpdate.value
    ? 'Manual Update'
    : 'Recently updated, please wait...'
})

const formatProgress = (percentage: number) => `${percentage}%`

const beforeUpload = (file: File) => {
  if (!file.name.endsWith('.cvd')) {
    ElNotification({
      title: 'Error',
      message: 'Only .cvd files are allowed',
      type: 'error',
      customClass: 'notification-error'
    })
    return false
  }
  return true
}

const handleUpload = async () => {
  uploading.value = true
  uploadProgress.value = 0
  progressText.value = 'Uploading...'

  const timer = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      progressText.value = 'Verifying virus database...'
      setTimeout(() => {
        uploading.value = false
        ElNotification({
          title: 'Success',
          message: 'Virus database updated successfully',
          type: 'success',
          customClass: 'notification-success'
        })
      }, 500)
    }
  }, 200)
}

const handleManualUpdate = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to update virus database manually?',
      'Confirm',
      { type: 'warning' }
    )

    manualUpdating.value = true
    setTimeout(() => {
      manualUpdating.value = false
      ElNotification({
        title: 'Success',
        message: 'Virus database updated successfully',
        type: 'success',
        customClass: 'notification-success'
      })
      canManualUpdate.value = false
      setTimeout(() => {
        canManualUpdate.value = true
      }, 60000)
    }, 2000)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.virus-page {
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

.header-status-label {
  color: #ffffff;
  font-size: 16px !important;
  font-weight: 500;
}

.auto-switch {
  --el-switch-on-color: #9C27B0;
  --el-switch-off-color: rgba(0, 0, 0, 0.3);
}

/* 内容区域 */
.content-wrapper {
  display: flex;
  flex-direction: column;
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

/* 上传区域 */
.upload-card .card-content {
  padding: 24px;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-upload {
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border: none;
  color: white;
  padding: 14px 28px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.35);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
}

.btn-manual {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  border: none;
  color: white;
  padding: 14px 28px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(103, 194, 58, 0.35);
}

.btn-manual:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.45);
}

.progress-wrapper {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  border-radius: 10px;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

/* 两列布局 */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  align-items: stretch;
}

/* 引擎信息 */
.engine-card {
  display: flex;
  flex-direction: column;
}

.engine-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.engine-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.engine-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.engine-item:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.engine-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 14px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.engine-icon.version {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
  color: #409EFF;
}

.engine-icon.date {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  color: #E6A23C;
}

.engine-icon.status {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.engine-detail {
  flex: 1;
}

.engine-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.engine-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

/* 文件列表 */
.history-card {
  display: flex;
  flex-direction: column;
}

.history-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-table {
  width: 100%;
}

.history-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.history-card :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(103, 194, 58, 0.06) 100%);
  font-weight: 600;
  color: #303133;
  padding: 18px 16px;
  font-size: 14px;
  text-align: center;
}

.history-card :deep(.el-table td.el-table__cell) {
  padding: 20px 16px;
  font-size: 14px;
  text-align: center;
}

.history-card :deep(.el-table .el-table__row) {
  transition: all 0.3s ease;
}

.history-card :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.06) 0%, rgba(103, 194, 58, 0.06) 100%) !important;
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
  .two-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .upload-row {
    flex-direction: column;
    align-items: stretch;
  }

  .upload-row .el-button {
    width: 100%;
  }
}
</style>
