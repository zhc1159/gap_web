<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-head">
        <div class="sidebar-logo">
          <el-icon :size="28"><Lock /></el-icon>
        </div>
        <span v-show="!isCollapse" class="sidebar-title">GAP {{ $t('common.system') }}</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="#a3aec9"
        active-text-color="#00d4ff"
      >
        <template v-for="item in menuList" :key="item.path">
          <!-- Has children -->
          <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ $t(item.meta?.titleKey || '') }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="item.path + '/' + child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ $t(child.meta?.titleKey || '') }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- No children -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ $t(item.meta?.titleKey || '') }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- Main content -->
    <div class="layout-main">
      <!-- Header -->
      <div class="layout-header">
        <div class="header-left">
          <div class="hamburger" @click="toggleCollapse">
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- Language Switcher -->
          <el-dropdown trigger="click" @command="handleLanguageChange" class="lang-switcher">
            <div class="lang-btn">
              <el-icon><Globe /></el-icon>
              <span>{{ currentLangLabel }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
                  <span class="lang-flag">🇨🇳</span> 简体中文
                </el-dropdown-item>
                <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
                  <span class="lang-flag">🇺🇸</span> English
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- User Dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">{{ nickName?.charAt(0) }}</el-avatar>
              <span class="nick-name">{{ nickName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>{{ $t('navbar.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon>{{ $t('navbar.changePassword') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>{{ $t('navbar.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Content -->
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>

      <!-- Footer -->
      <div class="layout-footer">
        <span>GAP {{ $t('login.title') }} &copy; {{ new Date().getFullYear() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Logout } from '@/axios/base'
import { setLocale, getLocale } from '@/locales'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const nickName = ref(sessionStorage.getItem('nick_name') || '')
const currentLocale = ref(getLocale())

// Language options
const currentLangLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '中文' : 'EN'
})

const handleLanguageChange = (lang: string) => {
  setLocale(lang)
  currentLocale.value = lang
  window.location.reload()
}

// Menu list based on user permissions
const menuList = ref([
  {
    path: '/system',
    meta: { titleKey: 'menu.system' },
    icon: 'Setting',
    children: [
      { path: 'user', meta: { titleKey: 'menu.userManage' }, icon: 'User' },
      { path: 'role', meta: { titleKey: 'menu.roleManage' }, icon: 'Avatar' },
      { path: 'menu', meta: { titleKey: 'menu.menuManage' }, icon: 'Grid' },
      { path: 'log', meta: { titleKey: 'menu.logManage' }, icon: 'Document' }
    ]
  },
  {
    path: '/policy',
    meta: { titleKey: 'menu.policy' },
    icon: 'Lock',
    children: [
      { path: 'firewall', meta: { titleKey: 'menu.firewallPolicy' }, icon: 'Key' },
      { path: 'audit', meta: { titleKey: 'menu.auditPolicy' }, icon: 'View' }
    ]
  },
  {
    path: '/audit',
    meta: { titleKey: 'menu.audit' },
    icon: 'Tickets',
    children: [
      { path: 'operation', meta: { titleKey: 'menu.operationLog' }, icon: 'List' },
      { path: 'security', meta: { titleKey: 'menu.securityLog' }, icon: 'Warning' }
    ]
  },
  {
    path: '/monitor',
    meta: { titleKey: 'menu.monitor' },
    icon: 'Monitor',
    children: [
      { path: 'dashboard', meta: { titleKey: 'menu.realtimeMonitor' }, icon: 'Odometer' },
      { path: 'traffic', meta: { titleKey: 'menu.trafficStats' }, icon: 'TrendCharts' }
    ]
  }
])

// Active menu
const activeMenu = computed(() => route.path)

// Breadcrumbs
const breadcrumbs = computed(() => {
  const items: { title: string; path: string }[] = []
  const matched = route.matched

  matched.forEach((item) => {
    if (item.meta?.titleKey) {
      items.push({
        title: t(item.meta.titleKey as string),
        path: item.path
      })
    }
  })

  return items
})

// Toggle sidebar collapse
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// Handle dropdown command
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/system/user')
      break
    case 'password':
      ElNotification({
        title: t('common.tip'),
        message: t('navbar.developing'),
        type: 'info',
        customClass: 'notification-info'
      })
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          t('navbar.logoutConfirm'),
          t('common.tip'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        await Logout()
        sessionStorage.clear()
        router.push('/login')
        ElNotification({
          title: t('common.success'),
          message: t('navbar.logoutSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      } catch {
        // User cancelled
      }
      break
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #ecfeff 100%);
}

/* Sidebar - Blue Style */
.layout-sidebar{
  width: 220px;
  background: rgba(255, 255, 255, 0.85);
  border-right: 1px solid rgba(37, 99, 235, 0.1);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.layout-sidebar.is-collapse{
  width: 64px;
}

.sidebar-head{
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  background: rgba(37, 99, 235, 0.03);
}

.sidebar-logo{
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.sidebar-title{
  margin-left: 14px;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  color: #1e293b;
}

.sidebar-menu{
  flex: 1;
  border-right: none;
  overflow-y: auto;
  padding: 10px 0;
}

/* Custom scrollbar */
.sidebar-menu::-webkit-scrollbar{
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-thumb{
  background: rgba(37, 99, 235, 0.15);
  border-radius: 2px;
}

/* Menu styles - Blue */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title){
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #64748b;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item){
  font-size: 13px;
  font-weight: 500;
  padding-left: 52px !important;
  margin: 2px 12px;
  height: 42px;
  line-height: 42px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover){
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
}

.sidebar-menu :deep(.el-menu-item.is-active){
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.08) !important;
  font-weight: 700;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title){
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.08) !important;
  font-weight: 700;
}

.sidebar-menu :deep(.el-icon){
  font-size: 18px;
}

/* Main content area */
.layout-main{
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #ecfeff 100%);
}

/* Header - Blue Style */
.layout-header{
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
}

.header-left{
  display: flex;
  align-items: center;
  gap: 20px;
}

.hamburger{
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.3s ease;
}

.hamburger:hover{
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.header-breadcrumb :deep(.el-breadcrumb__inner){
  color: #64748b;
  font-weight: 500;
}

.header-breadcrumb :deep(.el-breadcrumb__inner:last-child){
  color: #2563eb;
}

.header-breadcrumb :deep(.el-breadcrumb__separator){
  color: #cbd5e1;
}

.header-right{
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Language Switcher */
.lang-switcher{
  margin-right: 8px;
}

.lang-btn{
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  color: #64748b;
  border: 1px solid transparent;
}

.lang-btn:hover{
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.15);
  color: #2563eb;
}

.lang-btn .el-icon:last-child{
  font-size: 12px;
  margin-left: 2px;
}

.lang-flag{
  margin-right: 8px;
}

.user-info{
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover{
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.15);
}

.user-avatar{
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  color: #fff;
  font-weight: 700;
}

.nick-name{
  color: #1e293b;
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info .el-icon{
  color: #3b82f6;
}

/* Content area */
.layout-content{
  flex: 1;
  padding: 24px;
  padding-bottom: 32px;
  overflow: auto;
  background: transparent;
}

/* Ensure child pages have proper spacing */
.layout-content > * {
  margin-bottom: 24px;
}

.layout-content > *:last-child {
  margin-bottom: 0;
}

/* Footer */
.layout-footer{
  height: 44px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* Transition */
.fade-enter-active,
.fade-leave-active{
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity: 0;
}

/* Dropdown menu blue theme */
:deep(.el-dropdown-menu){
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(37, 99, 235, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.el-dropdown-menu__item){
  color: #64748b;
}

:deep(.el-dropdown-menu__item:hover){
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}
</style>
