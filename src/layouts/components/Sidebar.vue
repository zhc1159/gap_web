<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="sidebar-logo" :class="{ 'logo-collapse': isCollapse }">
      <router-link to="/" class="logo-link">
        <el-icon v-if="isCollapse" class="logo-icon"><Odometer /></el-icon>
        <template v-else>
          <el-icon class="logo-icon"><Odometer /></el-icon>
          <span class="logo-text">{{ systemName }}</span>
        </template>
      </router-link>
    </div>

    <!-- 搜索框 -->
    <div class="sidebar-search" v-if="!isCollapse">
      <el-input
        v-model="searchKeyword"
        :placeholder="t('layout.sidebar.search')"
        clearable
        size="small"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 菜单列表 -->
    <el-scrollbar class="sidebar-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        :default-openeds="openMenus"
        :collapse="isCollapse"
        :unique-opened="true"
        :collapse-transition="false"
        :router="true"
        class="sidebar-menu"
        background-color="transparent"
        text-color="#cbd5e1"
        active-text-color="#00d4ff"
        @select="handleMenuSelect"
      >
        <template v-for="menu in filteredMenuList" :key="menu.id">
          <!-- 有子菜单 -->
          <el-sub-menu
            v-if="menu.children && menu.children.length > 0"
            :index="menu.id"
            class="menu-item-wrapper"
          >
            <template #title>
              <el-icon>
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
              <span>{{ currentLocale === 'zh-CN' ? menu.title : menu.titleEn }}</span>
            </template>

            <!-- 二级菜单 -->
            <template v-for="subMenu in menu.children" :key="subMenu.id">
              <el-menu-item
                :index="subMenu.path"
                class="sub-menu-item"
              >
                <el-icon v-if="subMenu.icon">
                  <component :is="getIconComponent(subMenu.icon)" />
                </el-icon>
                <span>{{ currentLocale === 'zh-CN' ? subMenu.title : subMenu.titleEn }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item
            v-else
            :index="menu.path"
            class="menu-item-wrapper single-menu"
          >
            <el-icon>
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
            <span>{{ currentLocale === 'zh-CN' ? menu.title : menu.titleEn }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="toggleCollapse">
      <el-icon :class="{ 'is-collapse': isCollapse }">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Search,
  Fold,
  Expand,
  Odometer,
  Document,
  User,
  UserFilled,
  Link,
  Sort,
  VideoCamera,
  Grid,
  Refresh,
  Download,
  View,
  Setting,
  Tools,
  Clock,
  Connection,
  DataLine,
  TrendCharts,
  Monitor,
  Lock,
  Key,
  Upload,
  Edit
} from '@element-plus/icons-vue'
import { useMenuStore } from '@/stores/menu'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'
import { getMenuByRole } from '@/config/menu.config'

const { t, locale: currentLocale } = useI18n()
const route = useRoute()
const menuStore = useMenuStore()
const layoutStore = useLayoutStore()
const userStore = useUserStore()

// 图标映射
const iconMap: Record<string, any> = {
  'Odometer': Odometer,
  'Document': Document,
  'User': User,
  'UserFilled': UserFilled,
  'Link': Link,
  'Shield': Key,
  'Sort': Sort,
  'VideoCamera': VideoCamera,
  'Grid': Grid,
  'Refresh': Refresh,
  'Download': Download,
  'View': View,
  'Setting': Setting,
  'Tools': Tools,
  'Clock': Clock,
  'Connection': Connection,
  'DataLine': DataLine,
  'TrendCharts': TrendCharts,
  'Monitor': Monitor,
  'Lock': Lock,
  'Key': Key,
  'Upload': Upload,
  'Edit': Edit
}

// 计算属性
const searchKeyword = computed({
  get: () => menuStore.searchKeyword,
  set: (val) => menuStore.searchKeyword = val
})

const filteredMenuList = computed(() => {
  const role = userStore.role
  const menus = getMenuByRole(role || 'auditor')

  if (!searchKeyword.value) {
    return menus
  }

  return filterMenuByKeyword(menus, searchKeyword.value.toLowerCase())
})

const activeMenu = computed(() => menuStore.activeMenu)
const openMenus = computed(() => menuStore.openMenus)
const isCollapse = computed(() => layoutStore.isCollapse)
const systemName = computed(() => layoutStore.uiSetting.systemName)

/**
 * 根据关键词过滤菜单
 */
function filterMenuByKeyword(menus: any[], keyword: string): any[] {
  return menus
    .map(menu => {
      const titleMatch = menu.title.toLowerCase().includes(keyword) ||
                        menu.titleEn.toLowerCase().includes(keyword)

      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterMenuByKeyword(menu.children, keyword)
        if (filteredChildren.length > 0) {
          return {
            ...menu,
            children: filteredChildren
          }
        }
      }

      return titleMatch ? menu : null
    })
    .filter((menu): menu is NonNullable<typeof menu> => menu !== null)
}

/**
 * 获取图标组件
 */
function getIconComponent(iconName?: string) {
  if (!iconName) return Document
  return iconMap[iconName] || Document
}

/**
 * 菜单选择处理
 */
function handleMenuSelect(index: string) {
  menuStore.setActiveMenu(index)
}

/**
 * 切换折叠
 */
function toggleCollapse() {
  layoutStore.toggleCollapse()
}

// 生命周期
onMounted(async () => {
  menuStore.setActiveMenu(route.path)
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-darker;
}

// Logo区域
.sidebar-logo {
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-md;
  border-bottom: 1px solid $border-color;
  transition: all $transition-normal;

  &.logo-collapse {
    padding: 0;
  }

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    gap: 10px;

    .logo-icon {
      font-size: 32px;
      color: $primary-color;
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      background: $gradient-primary;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }
  }
}

// 搜索框
.sidebar-search {
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;

  :deep(.el-input) {
    .el-input__wrapper {
      background: $bg-card;
      border: 1px solid $border-color;
      border-radius: $radius-md;
      box-shadow: none;

      &:hover {
        border-color: $primary-color;
      }

      &.is-focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
      }
    }

    .el-input__inner {
      color: $text-primary;

      &::placeholder {
        color: $text-muted;
      }
    }

    .el-input__prefix {
      color: $text-muted;
    }
  }
}

// 菜单滚动区域
.sidebar-menu-wrapper {
  flex: 1;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 3px;

    &:hover {
      background: $border-light;
    }
  }
}

// 菜单样式
.sidebar-menu {
  border: none;

  // 一级菜单
  .menu-item-wrapper {
    &.single-menu {
      &:hover {
        background: rgba(0, 212, 255, 0.1) !important;
      }

      &.is-active {
        background: $gradient-primary !important;
        color: white !important;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: $primary-color;
          box-shadow: 0 0 10px $primary-color;
        }
      }
    }

    :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;

      &:hover {
        background: rgba(0, 212, 255, 0.1) !important;
      }
    }

    &.is-active > .el-sub-menu__title {
      color: $primary-color !important;
    }
  }

  // 二级菜单
  .sub-menu-item {
    height: 45px;
    line-height: 45px;
    padding-left: 60px !important;

    &:hover {
      background: rgba(0, 212, 255, 0.1) !important;
    }

    &.is-active {
      background: rgba(0, 212, 255, 0.2) !important;
      color: $primary-color !important;
    }
  }
}

// 折叠按钮
.sidebar-toggle {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid $border-color;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $bg-hover;
  }

  .el-icon {
    font-size: 18px;
    color: $text-secondary;
    transition: transform $transition-normal;

    &.is-collapse {
      transform: rotate(180deg);
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 菜单展开/折叠动画
.el-menu--collapse {
  .sidebar-logo {
    .logo-text {
      display: none;
    }
  }

  .sidebar-search {
    display: none;
  }
}
</style>
