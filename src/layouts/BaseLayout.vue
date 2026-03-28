<template>
  <el-container class="base-layout">
    <!-- 顶部导航 -->
    <el-header class="layout-header" :class="{ 'header-mobile': isMobile }">
      <Navbar />
    </el-header>

    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside
        class="layout-aside"
        :width="isCollapse ? '64px' : '220px'"
        :class="{ 'aside-collapsed': isCollapse }"
      >
        <Sidebar />
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <!-- 面包屑 -->
        <div class="breadcrumb-wrapper" v-if="!isMobile">
          <Breadcrumb />
        </div>

        <!-- 内容主体 -->
        <div class="content-body">
          <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>

    <!-- 页脚 -->
    <el-footer class="layout-footer" height="40px">
      <div class="footer-content">
        <span>{{ uiSetting.copyright }}</span>
        <span class="divider">|</span>
        <span>{{ t('layout.base.version') }}: {{ version }}</span>
      </div>
    </el-footer>

    <!-- 回到顶部 -->
    <el-backtop :bottom="60" :right="40">
      <div class="backtop-button">
        <el-icon><ArrowUp /></el-icon>
      </div>
    </el-backtop>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowUp } from '@element-plus/icons-vue'
import { useLayoutStore } from '@/stores/layout'
import { useMenuStore } from '@/stores/menu'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const { t } = useI18n()
const layoutStore = useLayoutStore()
const menuStore = useMenuStore()

// 计算属性
const isCollapse = computed(() => layoutStore.isCollapse)
const isMobile = computed(() => layoutStore.isMobile)
const uiSetting = computed(() => layoutStore.uiSetting)
const cachedViews = computed(() => [])
const version = computed(() => '1.0.0')

// 窗口大小变化处理
function handleResize() {
  layoutStore.detectDevice()
}

// 生命周期
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  menuStore.loadMenu()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.base-layout {
  height: 100vh;
  background: $bg-dark;
  overflow: hidden;

  // 顶部导航
  .layout-header {
    background: linear-gradient(90deg, $bg-darker 0%, $bg-card 100%);
    border-bottom: 1px solid $border-color;
    padding: 0;
    display: flex;
    align-items: center;
    height: $navbar-height;
    box-shadow: $shadow-md;
    z-index: 1000;

    &.header-mobile {
      height: 50px;
    }
  }

  .layout-container {
    height: calc(100vh - #{$navbar-height} - #{$footer-height});
  }

  // 侧边栏
  .layout-aside {
    background: $bg-darker;
    border-right: 1px solid $border-color;
    transition: width $transition-normal;
    overflow: hidden;

    &.aside-collapsed {
      width: 64px !important;
    }
  }

  // 主内容区
  .layout-main {
    background: $bg-dark;
    padding: 0;
    overflow-y: auto;
    position: relative;
  }

  .breadcrumb-wrapper {
    background: $bg-card;
    padding: 12px 24px;
    border-bottom: 1px solid $border-color;
  }

  .content-body {
    padding: 24px;
    min-height: calc(100vh - 200px);
  }

  // 页脚
  .layout-footer {
    background: $bg-darker;
    border-top: 1px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: center;

    .footer-content {
      color: $text-muted;
      font-size: 12px;

      .divider {
        margin: 0 12px;
        color: $border-color;
      }
    }
  }

  // 回到顶部按钮
  .backtop-button {
    width: 40px;
    height: 40px;
    background: $gradient-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: $shadow-glow;
    transition: all $transition-fast;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    }
  }
}

// 过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
