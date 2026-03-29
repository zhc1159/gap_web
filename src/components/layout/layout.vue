<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-head">
        <div class="sidebar-logo">
          <el-icon :size="28"><Lock /></el-icon>
        </div>
        <span v-show="!isCollapse" class="sidebar-title">GAP管理系统</span>
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
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="item.path + '/' + child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- No children -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.meta?.title }}</span>
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
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">{{ nickName?.charAt(0) }}</el-avatar>
              <span class="nick-name">{{ nickName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
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
        <span>GAP安全隔离网闸 &copy; {{ new Date().getFullYear() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Logout } from '@/axios/base'

const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const nickName = ref(sessionStorage.getItem('nick_name') || '')

// Menu list based on user permissions
const menuList = ref([
  {
    path: '/system',
    meta: { title: '系统' },
    icon: 'Setting',
    children: [
      { path: 'user', meta: { title: '用户管理' }, icon: 'User' },
      { path: 'role', meta: { title: '角色管理' }, icon: 'Avatar' },
      { path: 'menu', meta: { title: '菜单管理' }, icon: 'Grid' },
      { path: 'log', meta: { title: '日志管理' }, icon: 'Document' }
    ]
  },
  {
    path: '/policy',
    meta: { title: '策略' },
    icon: 'Lock',
    children: [
      { path: 'firewall', meta: { title: '防火墙策略' }, icon: 'Key' },
      { path: 'audit', meta: { title: '审计策略' }, icon: 'View' }
    ]
  },
  {
    path: '/audit',
    meta: { title: '审计' },
    icon: 'Tickets',
    children: [
      { path: 'operation', meta: { title: '操作日志' }, icon: 'List' },
      { path: 'security', meta: { title: '安全日志' }, icon: 'Warning' }
    ]
  },
  {
    path: '/monitor',
    meta: { title: '监控' },
    icon: 'Monitor',
    children: [
      { path: 'dashboard', meta: { title: '实时监控' }, icon: 'Odometer' },
      { path: 'traffic', meta: { title: '流量统计' }, icon: 'TrendCharts' }
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
    if (item.meta?.title) {
      items.push({
        title: item.meta.title as string,
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
        title: '提示',
        message: '修改密码功能开发中',
        type: 'info'
      })
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await Logout()
        sessionStorage.clear()
        router.push('/login')
        ElNotification({
          title: '成功',
          message: '已退出登录',
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
  background: #0f172a;
}

/* Sidebar - Dark Tech Style */
.layout-sidebar{
  width: 220px;
  background: linear-gradient(180deg, #1a202c 0%, #0f172a 100%);
  border-right: 1px solid #2d3748;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
}

.layout-sidebar.is-collapse{
  width: 64px;
}

.sidebar-head{
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #2d3748;
  background: rgba(0, 0, 0, 0.2);
}

.sidebar-logo{
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

.sidebar-title{
  margin-left: 14px;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
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
  background: #2d3748;
  border-radius: 2px;
}

/* Menu styles */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title){
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
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
  background-color: rgba(0, 212, 255, 0.1) !important;
  color: #00d4ff !important;
}

.sidebar-menu :deep(.el-menu-item.is-active){
  color: #00d4ff !important;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, transparent 100%) !important;
  border-left: 3px solid #00d4ff;
  font-weight: 700;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title){
  color: #00d4ff !important;
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
  background: #0f172a;
}

/* Header - Dark Tech Style */
.layout-header{
  height: 64px;
  background: linear-gradient(90deg, #1a202c 0%, #0f172a 100%);
  border-bottom: 1px solid #2d3748;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-left{
  display: flex;
  align-items: center;
  gap: 20px;
}

.hamburger{
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  color: #a3aec9;
  transition: all 0.3s ease;
}

.hamburger:hover{
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.header-breadcrumb :deep(.el-breadcrumb__inner){
  color: #a3aec9;
  font-weight: 500;
}

.header-breadcrumb :deep(.el-breadcrumb__inner:last-child){
  color: #00d4ff;
}

.header-breadcrumb :deep(.el-breadcrumb__separator){
  color: #4a5568;
}

.header-right{
  display: flex;
  align-items: center;
}

.user-info{
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover{
  background: rgba(0, 212, 255, 0.1);
}

.user-avatar{
  background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
  color: #fff;
  font-weight: 700;
}

.nick-name{
  color: #e2e8f0;
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info .el-icon{
  color: #a3aec9;
}

/* Content area */
.layout-content{
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: #0f172a;
}

/* Footer */
.layout-footer{
  height: 44px;
  background: #1a202c;
  border-top: 1px solid #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
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

/* Dropdown menu dark theme */
:deep(.el-dropdown-menu){
  background: #1a202c;
  border: 1px solid #2d3748;
}

:deep(.el-dropdown-menu__item){
  color: #a3aec9;
}

:deep(.el-dropdown-menu__item:hover){
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}
</style>
