<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">{{ $t('fileSafe.file_approval_failed.title') }}</div>
      </div>
      <div class="page-table">
        <el-empty :description="$t('fileSafe.file_approval_failed.emptyDesc')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
