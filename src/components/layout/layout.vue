<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-head">
        <div class="sidebar-logo">
          <el-icon :size="28" color="#667eea"><Lock /></el-icon>
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
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32">{{ nickName?.charAt(0) }}</el-avatar>
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
      // TODO: Open change password dialog
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
}

.layout-sidebar{
  width: 220px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.layout-sidebar.is-collapse{
  width: 64px;
}

.sidebar-head{
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
}

.sidebar-logo{
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
}

.sidebar-title{
  margin-left: 12px;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-menu{
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.layout-main{
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header{
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left{
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger{
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.hamburger:hover{
  background: #f5f5f5;
}

.user-info{
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
}

.user-info:hover{
  background: #f5f5f5;
}

.nick-name{
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout-content{
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #f5f7fa;
}

.layout-footer{
  height: 40px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
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
</style>
