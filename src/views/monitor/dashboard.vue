<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">{{ $t('dashboard.title') }}</div>
      </div>
      <div class="page-table">
        <el-empty :description="$t('dashboard.emptyDesc')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
