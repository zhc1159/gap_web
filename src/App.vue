<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { getLocale } from './locales'
import { useThemeStore } from './stores/theme'

const elementLocale = computed(() => {
  return getLocale() === 'zh-CN' ? zhCn : en
})

const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
