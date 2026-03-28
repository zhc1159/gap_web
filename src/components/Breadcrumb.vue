<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path || index">
      <router-link v-if="item.path && index < breadcrumbs.length - 1" :to="item.path" class="link">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ currentLocale === 'zh-CN' ? item.title : item.titleEn }}</span>
      </router-link>
      <span v-else class="current">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ currentLocale === 'zh-CN' ? item.title : item.titleEn }}</span>
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const { locale: currentLocale } = useI18n()
const menuStore = useMenuStore()

interface BreadcrumbItem {
  title: string
  titleEn: string
  path?: string
  icon?: Component
}

const breadcrumbs = ref<BreadcrumbItem[]>([])

/**
 * 生成面包屑数据
 */
function generateBreadcrumbs() {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const crumbs: BreadcrumbItem[] = []

  // 添加首页
  crumbs.push({
    title: '首页',
    titleEn: 'Home',
    path: '/dashboard',
    icon: undefined
  })

  // 添加匹配的路由
  matched.forEach(item => {
    crumbs.push({
      title: item.meta.title as string,
      titleEn: (item.meta.titleEn as string) || (item.meta.title as string),
      path: item.path,
      icon: undefined
    })
  })

  breadcrumbs.value = crumbs
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    generateBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.breadcrumb {
  padding: 0 $spacing-md;
  height: 40px;
  display: flex;
  align-items: center;

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      gap: 6px;

      .link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: $text-secondary;
        text-decoration: none;
        transition: color $transition-fast;

        &:hover {
          color: $primary-color;
        }
      }

      .current {
        display: flex;
        align-items: center;
        gap: 6px;
        color: $text-primary;
      }
    }

    .el-breadcrumb__separator {
      color: $text-muted;
    }
  }
}
</style>
