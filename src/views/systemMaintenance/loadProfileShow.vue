<template>
  <div class="page-container profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemMaintenance.loadProfileShow.title') }}</span>
      </div>
      <div class="header-actions">
        <el-button class="btn-add" @click="openDialog('add')">
          <el-icon><Plus /></el-icon>
          {{ $t('systemMaintenance.loadProfileShow.addProfile') }}
        </el-button>
        <el-button class="btn-upload" @click="openDialog('upload')">
          <el-icon><Upload /></el-icon>
          {{ $t('systemMaintenance.loadProfileShow.uploadProfile') }}
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon primary">
          <el-icon><Files /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ profileList.length }}</div>
          <div class="stat-label">{{ $t('systemMaintenance.loadProfileShow.totalProfiles') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ currentProfile }}</div>
          <div class="stat-label">{{ $t('systemMaintenance.loadProfileShow.currentProfile') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ lastBackupTime }}</div>
          <div class="stat-label">{{ $t('systemMaintenance.loadProfileShow.lastBackup') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalSize }}</div>
          <div class="stat-label">{{ $t('systemMaintenance.loadProfileShow.totalSize') }}</div>
        </div>
      </div>
    </div>

    <!-- 存档列表 -->
    <div class="card">
      <div class="card-header">
        <el-icon class="card-icon"><List /></el-icon>
        <span>{{ $t('systemMaintenance.loadProfileShow.profileList') }}</span>
      </div>
      <el-table :data="profileList" stripe style="width: 100%">
        <el-table-column type="index" width="60" label="#" />
        <el-table-column prop="description" :label="$t('systemMaintenance.loadProfileShow.description')" min-width="180">
          <template #default="{ row }">
            <div class="description-cell">
              <el-icon class="desc-icon"><Document /></el-icon>
              <span>{{ row.description }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" :label="$t('systemMaintenance.loadProfileShow.fileName')" min-width="200">
          <template #default="{ row }">
            <span class="file-name">{{ row.fileName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" :label="$t('systemMaintenance.loadProfileShow.date')" width="180">
          <template #default="{ row }">
            <div class="date-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ row.date }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" :label="$t('systemMaintenance.loadProfileShow.size')" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.size }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('systemMaintenance.loadProfileShow.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isCurrent" type="success" effect="dark">
              {{ $t('systemMaintenance.loadProfileShow.current') }}
            </el-tag>
            <el-tag v-else type="info" effect="plain">
              {{ $t('systemMaintenance.loadProfileShow.history') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('systemMaintenance.loadProfileShow.action')" width="280" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="!row.isCurrent"
                type="primary"
                size="small"
                @click="handleRestore(row)"
              >
                <el-icon><RefreshRight /></el-icon>
                {{ $t('systemMaintenance.loadProfileShow.restore') }}
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="handleDownload(row)"
              >
                <el-icon><Download /></el-icon>
                {{ $t('systemMaintenance.loadProfileShow.download') }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                {{ $t('systemMaintenance.loadProfileShow.delete') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/上传对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="actionType === 'add' ? $t('systemMaintenance.loadProfileShow.addProfile') : $t('systemMaintenance.loadProfileShow.uploadProfile')"
      width="550px"
      class="profile-dialog"
    >
      <!-- 添加存档 -->
      <div v-if="actionType === 'add'" class="dialog-content">
        <div class="dialog-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('systemMaintenance.loadProfileShow.addProfileHint') }}</span>
        </div>
        <el-form label-width="100px">
          <el-form-item :label="$t('systemMaintenance.loadProfileShow.description')">
            <el-input
              v-model="profileDescription"
              :placeholder="$t('systemMaintenance.loadProfileShow.descriptionPlaceholder')"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 上传存档 -->
      <div v-else class="dialog-content">
        <div class="dialog-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('systemMaintenance.loadProfileShow.uploadProfileHint') }}</span>
        </div>
        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".tgz,.tar.gz"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          class="profile-upload"
        >
          <div class="upload-dragger-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              {{ $t('systemMaintenance.loadProfileShow.dragFile') }}
              <em>{{ $t('systemMaintenance.loadProfileShow.clickUpload') }}</em>
            </div>
            <div class="upload-hint">{{ $t('systemMaintenance.loadProfileShow.supportFormats') }}: .tgz, .tar.gz</div>
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
            <div class="progress-text">{{ $t('systemMaintenance.loadProfileShow.uploading') }}...</div>
          </div>
        </transition>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="uploading"
          @click="handleSubmit"
        >
          <el-icon><Check /></el-icon>
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  FolderOpened, Plus, Upload, Files, CircleCheck, Clock, DataAnalysis,
  List, Document, Calendar, RefreshRight, Download, Delete, InfoFilled,
  UploadFilled, Check
} from '@element-plus/icons-vue'

// 类型定义
interface ProfileItem {
  lineNumber: number
  description: string
  fileName: string
  date: string
  size: string
  isCurrent: boolean
  canRestore: boolean
}

// 状态
const dialogVisible = ref(false)
const actionType = ref<'add' | 'upload'>('add')
const profileDescription = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadRef = ref()

// 统计数据
const currentProfile = ref('v3.2.1')
const lastBackupTime = ref('2026-04-03')
const totalSize = ref('256 MB')

// 模拟数据
const profileList = ref<ProfileItem[]>([
  {
    lineNumber: 1,
    description: '系统初始配置',
    fileName: 'profile_initial_20240403.tgz',
    date: '2024-04-03 10:00:00',
    size: '45.2 MB',
    isCurrent: false,
    canRestore: true
  },
  {
    lineNumber: 2,
    description: '安全策略更新',
    fileName: 'profile_security_20250115.tgz',
    date: '2025-01-15 14:30:00',
    size: '48.7 MB',
    isCurrent: false,
    canRestore: true
  },
  {
    lineNumber: 3,
    description: '网络配置优化',
    fileName: 'profile_network_20251020.tgz',
    date: '2025-10-20 09:15:00',
    size: '52.1 MB',
    isCurrent: false,
    canRestore: true
  },
  {
    lineNumber: 4,
    description: '当前生产环境配置',
    fileName: 'profile_production_20260403.tgz',
    date: '2026-04-03 08:00:00',
    size: '55.8 MB',
    isCurrent: true,
    canRestore: false
  },
  {
    lineNumber: 5,
    description: '备份-防火墙规则更新',
    fileName: 'profile_firewall_20260325.tgz',
    date: '2026-03-25 16:45:00',
    size: '46.3 MB',
    isCurrent: false,
    canRestore: true
  },
  {
    lineNumber: 6,
    description: '备份-用户权限调整',
    fileName: 'profile_userauth_20260318.tgz',
    date: '2026-03-18 11:20:00',
    size: '44.9 MB',
    isCurrent: false,
    canRestore: true
  }
])

// 计算进度条颜色
const progressColor = computed(() => {
  if (uploadProgress.value < 30) return '#409EFF'
  if (uploadProgress.value < 70) return '#E6A23C'
  return '#67C23A'
})

// 打开对话框
const openDialog = (type: 'add' | 'upload') => {
  actionType.value = type
  profileDescription.value = ''
  selectedFile.value = null
  uploadProgress.value = 0
  dialogVisible.value = true
}

// 文件变化
const handleFileChange = (file: any, _files: any[]) => {
  selectedFile.value = file.raw
}

// 文件移除
const handleFileRemove = () => {
  selectedFile.value = null
}

// 提交
const handleSubmit = async () => {
  if (actionType.value === 'add') {
    if (!profileDescription.value) {
      ElNotification({
        title: 'Warning',
        message: 'Please enter description',
        type: 'warning',
        customClass: 'notification-warning'
      })
      return
    }

    // 模拟添加
    uploading.value = true
    setTimeout(() => {
      const newProfile: ProfileItem = {
        lineNumber: profileList.value.length + 1,
        description: profileDescription.value,
        fileName: `profile_custom_${Date.now()}.tgz`,
        date: new Date().toLocaleString(),
        size: '50.0 MB',
        isCurrent: false,
        canRestore: true
      }
      profileList.value.unshift(newProfile)
      uploading.value = false
      dialogVisible.value = false
      ElNotification({
        title: 'Success',
        message: 'Profile added successfully',
        type: 'success',
        customClass: 'notification-success'
      })
    }, 1000)
  } else {
    if (!selectedFile.value) {
      ElNotification({
        title: 'Warning',
        message: 'Please select file',
        type: 'warning',
        customClass: 'notification-warning'
      })
      return
    }

    // 模拟上传进度
    uploading.value = true
    uploadProgress.value = 0
    const timer = setInterval(() => {
      uploadProgress.value += Math.random() * 15
      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100
        clearInterval(timer)
        setTimeout(() => {
          const newProfile: ProfileItem = {
            lineNumber: profileList.value.length + 1,
            description: `Uploaded: ${selectedFile.value?.name}`,
            fileName: selectedFile.value?.name || 'unknown.tgz',
            date: new Date().toLocaleString(),
            size: '52.5 MB',
            isCurrent: false,
            canRestore: true
          }
          profileList.value.unshift(newProfile)
          uploading.value = false
          dialogVisible.value = false
          ElNotification({
            title: 'Success',
            message: 'Profile uploaded successfully',
            type: 'success',
            customClass: 'notification-success'
          })
        }, 500)
      }
    }, 200)
  }
}

// 恢复
const handleRestore = async (_row: ProfileItem) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to restore this profile?',
      'Confirm',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    ElNotification({
      title: 'Success',
      message: 'Profile restored successfully',
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // cancelled
  }
}

// 下载
const handleDownload = (row: ProfileItem) => {
  ElNotification({
    title: 'Success',
    message: `Downloading ${row.fileName}`,
    type: 'success',
    customClass: 'notification-success'
  })
}

// 删除
const handleDelete = async (row: ProfileItem) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this profile?',
      'Confirm',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    const index = profileList.value.findIndex(p => p.lineNumber === row.lineNumber)
    if (index > -1) {
      profileList.value.splice(index, 1)
    }

    ElNotification({
      title: 'Success',
      message: 'Profile deleted successfully',
      type: 'success',
      customClass: 'notification-success'
    })
  } catch {
    // cancelled
  }
}

onMounted(() => {
  // 模拟加载数据
})
</script>

<style scoped>
.profile-page {
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

.header-actions {
  display: flex;
  gap: 16px;
}

.header-actions .el-button {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  border: none;
}

.header-actions .btn-add {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
}

.header-actions .btn-add:hover {
  background: linear-gradient(135deg, #f5a8fc 0%, #f7707e 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
}

.header-actions .btn-upload {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.header-actions .btn-upload:hover {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
  color: #67C23A;
}

.stat-icon.primary {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
  color: #409EFF;
}

.stat-icon.warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
  color: #E6A23C;
}

.stat-icon.info {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.05) 100%);
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
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

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-table th) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

:deep(.el-table__row:hover > td) {
  background: rgba(64, 158, 255, 0.05) !important;
}

.description-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desc-icon {
  color: #409EFF;
}

.file-name {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 对话框 */
.dialog-content {
  padding: 10px 0;
}

.dialog-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  color: #409EFF;
  font-size: 13px;
}

.profile-upload {
  width: 100%;
}

.profile-upload :deep(.el-upload-dragger) {
  border: 2px dashed rgba(64, 158, 255, 0.3);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  transition: all 0.3s ease;
}

.profile-upload :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.05);
}

.upload-dragger-content {
  padding: 30px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
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

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
