<template>
  <div class="page-container defense-update-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><UploadFilled /></el-icon>
        </div>
        <span class="header-title">{{ $t('systemManage.defenseUpdate.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('systemManage.defenseUpdate.describe') }}</span>
    </div>

    <!-- 上传区域 -->
    <div class="card upload-card">
      <div class="card-content">
        <div class="section-header">
          <div class="section-dot active"></div>
          <h3 class="section-title">{{ $t('systemManage.defenseUpdate.upload.title') }}</h3>
        </div>

        <el-upload
          ref="uploadRef"
          class="rules-upload"
          drag
          action=""
          :auto-upload="false"
          :limit="1"
          accept=".rules"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <div class="upload-zone-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <span>{{ $t('systemManage.defenseUpdate.upload.dragText') }}</span>
              <em class="upload-link">{{ $t('systemManage.defenseUpdate.upload.clickText') }}</em>
            </div>
            <div class="upload-hint">{{ $t('systemManage.defenseUpdate.upload.hint') }}</div>
          </div>
        </el-upload>

        <!-- 进度条 -->
        <transition name="fade-slide">
          <div v-if="uploadProgress.status !== 'idle'" class="progress-section">
            <div class="progress-header">
              <span class="progress-label">{{ $t('systemManage.defenseUpdate.upload.progress') }}</span>
              <span class="progress-percent">{{ uploadProgress.percent }}%</span>
            </div>
            <el-progress
              :percentage="uploadProgress.percent"
              :status="progressStatus"
              :stroke-width="12"
            />
            <div v-if="uploadProgress.message" class="progress-message" :class="uploadProgress.status">
              {{ uploadProgress.message }}
            </div>
          </div>
        </transition>

        <!-- 上传按钮 -->
        <div class="upload-actions">
          <el-button
            type="primary"
            size="large"
            class="apply-btn"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="handleUpload"
          >
            <el-icon v-if="!uploading"><Upload /></el-icon>
            {{ uploading ? $t('systemManage.defenseUpdate.upload.validating') : $t('systemManage.defenseUpdate.upload.clickText') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 升级历史 -->
    <div class="card main-card">
      <div class="card-content">
        <div class="section-header">
          <div class="section-dot active"></div>
          <h3 class="section-title">{{ $t('systemManage.defenseUpdate.history.title') }}</h3>
        </div>

        <el-table :data="historyData" v-loading="loading" class="history-table" stripe>
          <el-table-column :label="$t('systemManage.defenseUpdate.history.index')" width="80" align="center">
            <template #default="{ row }">
              <span class="index-badge">{{ row.index }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="library" :label="$t('systemManage.defenseUpdate.history.library')" min-width="250">
            <template #default="{ row }">
              <div class="library-cell">
                <el-icon class="library-icon"><Document /></el-icon>
                <span class="library-name">{{ row.library }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="time" :label="$t('systemManage.defenseUpdate.history.time')" width="200" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon class="time-icon"><Clock /></el-icon>
                <span>{{ row.time }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('systemManage.defenseUpdate.history.status')" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="dark">
                {{ $t(`systemManage.defenseUpdate.history.${row.status}`) }}
              </el-tag>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-state">
              <el-icon class="empty-icon"><FolderOpened /></el-icon>
              <p>{{ $t('systemManage.defenseUpdate.history.empty') }}</p>
            </div>
          </template>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import {
  UploadFilled,
  Upload,
  InfoFilled,
  Document,
  Clock,
  FolderOpened
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 上传相关
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

const uploadProgress = reactive({
  percent: 0,
  status: 'idle' as 'idle' | 'uploading' | 'success' | 'error',
  message: ''
})

const progressStatus = computed(() => {
  switch (uploadProgress.status) {
    case 'success': return 'success'
    case 'error': return 'exception'
    default: return undefined
  }
})

// 历史数据
interface HistoryItem {
  id: number
  index: number
  library: string
  time: string
  status: 'success' | 'failed' | 'pending'
}

const historyData = ref<HistoryItem[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 状态样式
function getStatusType(status: string): '' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'success': return 'success'
    case 'failed': return 'danger'
    case 'pending': return 'warning'
    default: return ''
  }
}

// 文件选择
function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    const file = uploadFile.raw
    if (!file.name.endsWith('.rules')) {
      ElNotification({
        title: t('common.error'),
        message: t('systemManage.defenseUpdate.upload.fileTypeError'),
        type: 'error',
        customClass: 'notification-error'
      })
      uploadRef.value?.clearFiles()
      selectedFile.value = null
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      ElNotification({
        title: t('common.error'),
        message: t('systemManage.defenseUpdate.upload.fileSizeError'),
        type: 'error',
        customClass: 'notification-error'
      })
      uploadRef.value?.clearFiles()
      selectedFile.value = null
      return
    }
    selectedFile.value = file
    uploadProgress.status = 'idle'
    uploadProgress.percent = 0
    uploadProgress.message = ''
  }
}

function handleExceed() {
  ElNotification({
    title: t('common.warning'),
    message: t('systemManage.defenseUpdate.upload.dragText'),
    type: 'warning',
    customClass: 'notification-warning'
  })
  uploadRef.value?.clearFiles()
  selectedFile.value = null
}

// 上传
async function handleUpload() {
  if (!selectedFile.value) return

  try {
    await ElMessageBox.confirm(
      t('systemManage.defenseUpdate.upload.confirmUpload'),
      t('systemManage.defenseUpdate.upload.confirmTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    uploading.value = true
    uploadProgress.status = 'uploading'
    uploadProgress.percent = 0
    uploadProgress.message = ''

    // Mock 上传进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      uploadProgress.percent = i
    }

    uploadProgress.status = 'success'
    uploadProgress.message = t('systemManage.defenseUpdate.upload.success')

    ElNotification({
      title: t('common.success'),
      message: t('systemManage.defenseUpdate.messages.uploadSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })

    // 刷新历史
    fetchData()
  } catch (e) {
    if (e !== 'cancel') {
      uploadProgress.status = 'error'
      uploadProgress.message = t('systemManage.defenseUpdate.upload.error')
      ElNotification({
        title: t('common.error'),
        message: t('systemManage.defenseUpdate.messages.uploadFail'),
        type: 'error',
        customClass: 'notification-error'
      })
    }
  } finally {
    uploading.value = false
  }
}

// 获取数据（Mock）
async function fetchData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    historyData.value = [
      { id: 1, index: 1, library: 'snort_rules_2026_04.rules', time: '2026-04-09 10:30:15', status: 'success' },
      { id: 2, index: 2, library: 'emerging_threats_v2.8.rules', time: '2026-04-08 14:22:33', status: 'success' },
      { id: 3, index: 3, library: 'custom_rules_2026_03.rules', time: '2026-03-28 09:15:48', status: 'failed' },
      { id: 4, index: 4, library: 'ips_rules_core_v4.rules', time: '2026-03-20 16:45:22', status: 'success' },
      { id: 5, index: 5, library: 'botnet_detector_v3.rules', time: '2026-03-15 11:30:05', status: 'success' },
      { id: 6, index: 6, library: 'web_attack_rules_v5.rules', time: '2026-03-10 08:20:17', status: 'pending' },
      { id: 7, index: 7, library: 'malware_signatures_v2.rules', time: '2026-03-05 15:55:41', status: 'success' }
    ]
    pagination.total = 7
  } finally {
    loading.value = false
  }
}

// 分页
function handleSizeChange(size: number) {
  pagination.pageSize = size
  fetchData()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.defense-update-page {
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

/* ========== 页面描述 ========== */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
}

/* ========== 通用卡片 ========== */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.08);
  margin-bottom: 20px;
}

.card-content {
  padding: 24px 28px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.section-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

/* ========== 上传区域 ========== */
.upload-card {
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.rules-upload :deep(.el-upload) {
  width: 100%;
}

.rules-upload :deep(.el-upload-dragger) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  border: 2px dashed rgba(64, 158, 255, 0.2);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
}

.rules-upload :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.upload-zone-content {
  padding: 10px;
}

.upload-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-link {
  color: #409EFF;
  font-style: normal;
  cursor: pointer;
  text-decoration: underline;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

/* 进度条 */
.progress-section {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.04) 0%, rgba(103, 194, 58, 0.04) 100%);
  border: 1px solid rgba(64, 158, 255, 0.1);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 13px;
  color: #606266;
}

.progress-percent {
  font-family: 'Consolas', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.progress-message {
  margin-top: 8px;
  font-size: 12px;
}

.progress-message.success {
  color: #67C23A;
}

.progress-message.error {
  color: #F56C6C;
}

/* 上传按钮 */
.upload-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.apply-btn {
  min-width: 140px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--page-header-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s;
}

.apply-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35);
  transform: translateY(-1px);
}

.apply-btn:disabled {
  opacity: 0.5;
  box-shadow: none;
  transform: none;
}

/* ========== 表格样式 ========== */
.history-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  font-weight: 600;
  color: #303133;
  padding: 14px 12px;
}

.history-table :deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
}

.history-table :deep(.el-table .el-table__row:hover > td) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(103, 194, 58, 0.03) 100%) !important;
}

.index-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.15);
  color: #409EFF;
}

.library-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.library-icon {
  font-size: 16px;
  color: #409EFF;
}

.library-name {
  font-size: 13px;
  color: #303133;
  font-family: 'Consolas', monospace;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.time-icon {
  color: #909399;
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 12px;
}

.empty-state p {
  color: #909399;
  font-size: 14px;
}

/* ========== 分页 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.08);
}

/* ========== 动画 ========== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
