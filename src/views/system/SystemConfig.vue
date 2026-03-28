<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>{{ $t('menu.system.config') }}</span>
        </div>
      </template>

      <div class="content-wrapper">
        <p>系统设置页面 - 功能开发中</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Setting } from '@element-plus/icons-vue'
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
