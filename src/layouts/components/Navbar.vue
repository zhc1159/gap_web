<template>
  <div class="navbar">
    <!-- 左侧 Logo 和系统名称 -->
    <div class="navbar-left">
      <div class="logo-wrapper">
        <el-icon class="logo-icon"><Odometer /></el-icon>
        <span class="system-name">{{ uiSetting.systemName }}</span>
      </div>
    </div>

    <!-- 右侧操作区 -->
    <div class="navbar-right">
      <!-- 语言切换 -->
      <el-dropdown @command="handleLanguageChange" class="language-dropdown">
        <span class="dropdown-link">
          <el-icon><Compass /></el-icon>
          <span class="language-text">{{ currentLanguage === 'zh-CN' ? '中文' : 'EN' }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :disabled="currentLanguage === 'zh-CN'">
              中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="currentLanguage === 'en-US'">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 全屏切换 -->
      <el-tooltip :content="isFullscreen ? t('layout.navbar.exitFullscreen') : t('layout.navbar.fullscreen')">
        <el-icon class="nav-icon" @click="toggleFullscreen">
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </el-tooltip>

      <!-- 用户信息 -->
      <el-dropdown class="user-dropdown" @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" class="user-avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              {{ t('layout.base.profile') }}
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>
              {{ t('layout.base.changePassword') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              {{ t('layout.base.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import {
  Odometer,
  Promotion,
  FullScreen,
  Aim,
  UserFilled,
  User,
  Lock,
  SwitchButton,
  ArrowDown,
  Compass
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'
import { setLanguage as saveLanguage } from '@/utils/storage'
import { setI18nLanguage } from '@/locales'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const layoutStore = useLayoutStore()

// 计算属性
const username = computed(() => userStore.username)
const uiSetting = computed(() => layoutStore.uiSetting)
const currentLanguage = computed(() => locale.value)

// 全屏状态
const isFullscreen = ref(false)

/**
 * 切换语言
 */
function handleLanguageChange(lang: 'zh-CN' | 'en-US') {
  locale.value = lang
  saveLanguage(lang)
  setI18nLanguage(lang)
}

/**
 * 切换全屏
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

/**
 * 监听全屏变化
 */
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

/**
 * 处理下拉命令
 */
async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          t('common.confirmLogout') || '确定要退出登录吗？',
          t('common.tip'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        await userStore.logout()
        router.push('/login')
      } catch {
        // 取消操作
      }
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="scss" scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;

    .logo-icon {
      font-size: 28px;
      color: $primary-color;
      animation: pulse 2s ease-in-out infinite;
    }

    .system-name {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      background: $gradient-primary;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;

  .language-dropdown {
    .dropdown-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: $text-secondary;
      cursor: pointer;
      transition: color $transition-fast;

      &:hover {
        color: $primary-color;
      }

      .language-text {
        font-size: 14px;
      }
    }
  }

  .nav-icon {
    font-size: 20px;
    color: $text-secondary;
    cursor: pointer;
    transition: color $transition-fast;

    &:hover {
      color: $primary-color;
    }
  }

  .user-dropdown {
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 20px;
      transition: background $transition-fast;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-avatar {
        background: $gradient-primary;
      }

      .username {
        color: $text-primary;
        font-size: 14px;
      }

      .dropdown-arrow {
        color: $text-muted;
        font-size: 12px;
        transition: transform $transition-fast;
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// Element Plus 下拉菜单样式覆盖
:deep(.el-dropdown-menu) {
  background: $bg-card;
  border: 1px solid $border-color;

  .el-dropdown-menu__item {
    color: $text-primary;

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      color: $primary-color;
    }
  }
}
</style>
