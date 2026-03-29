<template>
  <div class="page-container">
    <div class="page-card">
      <div class="page-util">
        <div class="page-title-1">防火墙策略</div>
        <div class="page-button">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增策略
          </el-button>
        </div>
      </div>
      <div class="page-table">
        <el-empty description="防火墙策略管理模块" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'

const handleAdd = () => {
  ElNotification({
    title: '提示',
    message: '新增策略功能开发中',
    type: 'info'
  })
}
</script>
