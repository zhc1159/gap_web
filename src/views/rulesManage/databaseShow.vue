<template>
  <div class="page-container database-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <span class="header-title">{{ $t('rulesManage.databaseShow.title') }}</span>
      </div>
    </div>

    <!-- 页面描述 -->
    <div class="page-describe">
      <el-icon class="describe-icon"><InfoFilled /></el-icon>
      <span>{{ $t('rulesManage.databaseShow.describe') }}</span>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <div class="card main-card">
        <div class="card-content">
          <!-- 功能入口 -->
          <div class="function-entry">
            <div class="entry-icon">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="entry-info">
              <h3 class="entry-title">{{ $t('rulesManage.databaseShow.databaseSync') }}</h3>
              <p class="entry-desc">{{ $t('rulesManage.databaseShow.databaseSyncDesc') }}</p>
            </div>
            <el-button type="primary" class="btn-go" @click="goToDatabaseSync">
              <el-icon><Link /></el-icon>
              {{ $t('rulesManage.databaseShow.goToSync') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="$t('rulesManage.databaseShow.syncDialogTitle')"
      width="450px"
      class="sync-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="dialog-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <p class="dialog-message">{{ $t('rulesManage.databaseShow.syncDialogMessage') }}</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Coin, InfoFilled, Link } from '@element-plus/icons-vue'

// 状态
const dialogVisible = ref(false)

// 跳转到数据库同步
const goToDatabaseSync = () => {
  dialogVisible.value = true
}
</script>

<style scoped>
.database-page {
  padding: 20px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.02) 0%, rgba(103, 194, 58, 0.02) 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
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

/* 页面描述 */
.page-describe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.describe-icon {
  color: #409EFF;
  font-size: 16px;
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
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 功能入口 */
.function-entry {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 30px 40px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.function-entry:hover {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.entry-icon {
  width: 64px;
  height: 64px;
  background: var(--page-header-gradient);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.entry-info {
  flex: 1;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.entry-desc {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  margin: 0;
}

.btn-go {
  background: var(--page-header-gradient);
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.btn-go:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 弹框样式 */
.sync-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.sync-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.sync-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding: 16px 20px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.dialog-icon {
  width: 56px;
  height: 56px;
  background: var(--page-header-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.dialog-message {
  font-size: 15px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .function-entry {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .entry-info {
    text-align: center;
  }
}
</style>
