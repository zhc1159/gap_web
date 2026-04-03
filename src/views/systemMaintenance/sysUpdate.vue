<template>
  <div class="page-container update-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Upload /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.sysUpdate.title') }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 文件上传区域 -->
      <div class="card upload-card">
        <div class="card-header">
          <el-icon class="card-icon"><Upload /></el-icon>
          <span>{{ $t('systemMaintenance.sysUpdate.uploadArea') }}</span>
        </div>
        <div class="card-content">
          <div class="upload-row">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              accept=".deepnet"
            >
              <el-button type="primary" class="btn-upload">
                <el-icon><Upload /></el-icon>
                {{ $t('systemMaintenance.sysUpdate.upload') }}
              </el-button>
            </el-upload>

            <el-button type="warning" class="btn-rollback-init" @click="handleRollbackInit">
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('systemMaintenance.sysUpdate.rollbackInit') }}
            </el-button>
          </div>

          <transition name="fade">
            <div v-if="uploading" class="progress-wrapper">
              <el-progress
                :percentage="uploadProgress"
                :stroke-width="10"
                :format="formatProgress"
              />
            </div>
          </transition>
        </div>
      </div>

      <!-- 左右两列布局 -->
      <div class="two-columns">
        <!-- 当前版本信息 -->
        <div class="card version-card">
          <div class="card-header">
            <el-icon class="card-icon"><InfoFilled /></el-icon>
            <span>{{ $t('systemMaintenance.sysUpdate.currentVersion') }}</span>
          </div>
          <div class="card-content">
            <div class="version-info">
              <div class="version-item">
                <div class="version-icon">
                  <el-icon><Box /></el-icon>
                </div>
                <div class="version-detail">
                  <div class="version-label">{{ $t('systemMaintenance.sysUpdate.productName') }}</div>
                  <div class="version-value">{{ currentVersion.title }}</div>
                </div>
              </div>
              <div class="version-item">
                <div class="version-icon system">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="version-detail">
                  <div class="version-label">{{ $t('systemMaintenance.sysUpdate.systemVersion') }}</div>
                  <div class="version-value">SWOS-{{ currentVersion.systemVersion }}</div>
                </div>
              </div>
              <div class="version-item">
                <div class="version-icon kernel">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="version-detail">
                  <div class="version-label">{{ $t('systemMaintenance.sysUpdate.kernelVersion') }}</div>
                  <div class="version-value">{{ currentVersion.kernelVersion }}</div>
                </div>
              </div>
              <div class="version-item">
                <div class="version-icon software">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="version-detail">
                  <div class="version-label">{{ $t('systemMaintenance.sysUpdate.softwareVersion') }}</div>
                  <div class="version-value">{{ currentVersion.softwareVersion }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史版本表格 -->
        <div class="card history-card">
          <div class="card-header">
            <el-icon class="card-icon"><Clock /></el-icon>
            <span>{{ $t('systemMaintenance.sysUpdate.historyVersions') }}</span>
          </div>
          <div class="card-content">
            <el-table :data="historyVersions" style="width: 100%" class="history-table">
              <el-table-column prop="index" :label="$t('systemMaintenance.sysUpdate.index')" min-width="60" />
              <el-table-column prop="version" :label="$t('systemMaintenance.sysUpdate.version')" min-width="120" />
              <el-table-column :label="$t('systemMaintenance.sysUpdate.changelog')" min-width="100">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click="showChangelog(row)">
                    <el-icon><View /></el-icon>
                    {{ $t('systemMaintenance.sysUpdate.view') }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" :label="$t('systemMaintenance.sysUpdate.updateTime')" min-width="160" />
              <el-table-column :label="$t('systemMaintenance.sysUpdate.actions')" min-width="200">
                <template #default="{ row }">
                  <template v-if="row.isCurrent">
                    <el-tag type="success" size="small">
                      {{ $t('systemMaintenance.sysUpdate.current') }}
                    </el-tag>
                  </template>
                  <template v-else>
                    <el-button size="small" type="info" @click="handleRollback(row.version)">
                      {{ $t('systemMaintenance.sysUpdate.rollback') }}
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row.version)">
                      {{ $t('systemMaintenance.sysUpdate.delete') }}
                    </el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本说明对话框 -->
    <el-dialog
      v-model="changelogDialogVisible"
      :title="$t('systemMaintenance.sysUpdate.changelog')"
      width="600px"
      class="changelog-dialog"
    >
      <pre class="changelog-content">{{ currentChangelog }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  Upload, RefreshLeft, InfoFilled, Box, Monitor,
  Cpu, Document, Clock, View
} from '@element-plus/icons-vue'

// 状态
const uploading = ref(false)
const uploadProgress = ref(0)
const currentVersion = ref({
  title: 'GAP Security Gateway',
  systemVersion: '2.5.0',
  kernelVersion: '5.4.0-150-generic',
  softwareVersion: 'v2.5.0-build20240101'
})
const historyVersions = ref([
  { index: 1, version: 'V2.5', changelog: '1. 新增系统升级功能\n2. 优化性能\n3. 修复已知问题', updateTime: '2024-01-15', isCurrent: true },
  { index: 2, version: 'V2.4', changelog: '1. 新增历史存档功能\n2. 优化界面布局', updateTime: '2024-01-01', isCurrent: false },
  { index: 3, version: 'V2.3', changelog: '1. 新增配置备份功能\n2. 修复安全漏洞', updateTime: '2023-12-15', isCurrent: false },
  { index: 4, version: 'V2.2', changelog: '1. 新增多语言支持\n2. 优化用户体验', updateTime: '2023-12-01', isCurrent: false }
])
const changelogDialogVisible = ref(false)
const currentChangelog = ref('')

const formatProgress = (percentage: number) => `${percentage}%`

const beforeUpload = (file: File) => {
  if (!file.name.endsWith('.deepnet')) {
    ElNotification({
      title: 'Error',
      message: 'Please upload .deepnet file',
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

  // 模拟上传进度
  const timer = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      uploading.value = false
      ElNotification({
        title: 'Success',
        message: 'Upload successful',
        type: 'success',
        customClass: 'notification-success'
      })
    }
  }, 200)
}

const handleRollbackInit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定回退到初始版本吗？',
      '确认',
      { type: 'warning' }
    )
    ElNotification({
      title: 'Success',
      message: 'Rollback to initial version successful',
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleRollback = async (version: string) => {
  try {
    await ElMessageBox.confirm(
      `确定回退到版本 ${version} 吗？`,
      '确认',
      { type: 'warning' }
    )
    ElNotification({
      title: 'Success',
      message: `Rollback to ${version} successful`,
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const handleDelete = async (version: string) => {
  try {
    await ElMessageBox.confirm(
      `确定删除版本 ${version} 吗？`,
      '确认',
      { type: 'warning' }
    )
    historyVersions.value = historyVersions.value.filter(v => v.version !== version)
    ElNotification({
      title: 'Success',
      message: 'Delete successful',
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // 用户取消
  }
}

const showChangelog = (row: any) => {
  currentChangelog.value = row.changelog
  changelogDialogVisible.value = true
}

onMounted(() => {
  // 模拟加载数据
})
</script>

<style scoped>
.update-page {
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

.upload-wrapper {
  flex: 1;
}

.file-input {
  cursor: pointer;
}

.upload-btn {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border: none;
  color: white;
}

.btn-upload {
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.35);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
}

.btn-rollback-init {
  background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(230, 162, 60, 0.35);
}

.btn-rollback-init:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.45);
}

.progress-wrapper {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  border-radius: 8px;
}

/* 两列布局 */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  align-items: stretch;
}

/* 版本信息 */
.version-card {
  display: flex;
  flex-direction: column;
}

.version-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.version-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.version-item:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.version-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 14px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
  color: #409EFF;
}

.version-icon.system {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.version-icon.kernel {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  color: #E6A23C;
}

.version-icon.software {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.05) 100%);
  color: #909399;
}

.version-detail {
  flex: 1;
}

.version-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.version-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

/* 历史版本 */
.history-card {
  display: flex;
  flex-direction: column;
}

.history-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 表格样式 */
.history-table {
  width: 100%;
}

.history-card :deep(.el-table) {
  --el-table-header-bg-color: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
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

.history-card :deep(.el-table .cell) {
  padding: 0 12px;
  line-height: 1.8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* 对话框 */
.changelog-content {
  white-space: pre-wrap;
  word-break: break-word;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%);
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
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
  .upload-row {
    flex-direction: column;
    align-items: stretch;
  }

  .upload-row .el-button {
    width: 100%;
  }
}
</style>
