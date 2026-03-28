<template>
  <div class="error-container">
    <div class="error-content">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <h1 class="error-title">404</h1>
      <p class="error-message">{{ $t('error.notFound') }}</p>
      <el-button type="primary" @click="goHome">
        {{ $t('error.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

function goHome() {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;
}

.error-content {
  text-align: center;

  .error-icon {
    font-size: 80px;
    color: $warning-color;
    margin-bottom: $spacing-lg;
  }

  .error-title {
    font-size: 48px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  .error-message {
    font-size: 16px;
    color: $text-secondary;
    margin-bottom: $spacing-xl;
  }
}
</style>
