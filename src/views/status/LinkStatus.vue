<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <el-icon><Link /></el-icon>
          <span>{{ t('menu.status.link') }}</span>
        </div>
      </template>

      <div class="content-wrapper">
        <p>链路检测页面 - 功能开发中</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Link } from '@element-plus/icons-vue'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.page-container {
  padding: $spacing-lg;
}

.page-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius-lg;

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-primary;
    font-size: 18px;
    font-weight: 600;
  }
}

.content-wrapper {
  padding: $spacing-md;
  color: $text-secondary;
}
</style>
