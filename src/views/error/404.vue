<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">页面未找到</div>
      </div>
      <div class="page-table" style="text-align: center; padding: 100px;">
        <el-empty description="您访问的页面不存在">
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
