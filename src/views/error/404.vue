<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">{{ $t('error404.title') }}</div>
      </div>
      <div class="page-table" style="text-align: center; padding: 100px;">
        <el-empty :description="$t('error404.description')">
          <el-button type="primary" @click="$router.push('/')">{{ $t('error404.backHome') }}</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
