<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">{{ $t('firewall.title') }}</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>{{ $t('firewall.addPolicy') }}
          </el-button>
        </div>
      </div>
      <div class="page-table">
        <el-empty :description="$t('firewall.emptyDesc')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const handleAdd = () => {
  ElNotification({
    title: t('common.tip'),
    message: t('firewall.addDeveloping'),
    type: 'info',
    customClass: 'notification-info'
  })
}
</script>
