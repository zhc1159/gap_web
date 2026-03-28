<template>
  <div class="login-container">
    <!-- 左侧登录区域 -->
    <div class="login-left">
      <div class="login-card">
        <!-- 标题 -->
        <div class="login-header">
          <h1 class="login-title">{{ t('login.title') }}</h1>
          <p class="login-subtitle">{{ t('login.subtitle') }}</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <!-- 账号 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="t('login.usernamePlaceholder')"
              class="login-input"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              class="login-input"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 记住我 -->
          <el-form-item>
            <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">
              {{ t('login.rememberMe') }}
            </el-checkbox>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? t('login.logging') : t('login.submit') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 右侧产品介绍区域 -->
    <div class="login-right">
      <div class="product-intro">
        <h2 class="product-title">{{ t('login.productIntro.title') }}</h2>
        <ul class="product-features">
          <li class="feature-item">
            <el-icon class="feature-icon"><Monitor /></el-icon>
            {{ t('login.productIntro.feature1') }}
          </li>
          <li class="feature-item">
            <el-icon class="feature-icon"><Connection /></el-icon>
            {{ t('login.productIntro.feature2') }}
          </li>
          <li class="feature-item">
            <el-icon class="feature-icon"><Upload /></el-icon>
            {{ t('login.productIntro.feature3') }}
          </li>
          <li class="feature-item">
            <el-icon class="feature-icon"><Key /></el-icon>
            {{ t('login.productIntro.feature4') }}
          </li>
        </ul>
        <div class="product-image">
          <el-icon class="product-icon"><Odometer /></el-icon>
        </div>
      </div>

      <!-- 语言切换 -->
      <div class="language-switch">
        <el-dropdown @command="handleLanguageChange">
          <span class="language-btn">
            <el-icon><Compass /></el-icon>
            {{ currentLanguage === 'zh-CN' ? '中文' : 'EN' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Monitor,
  Connection,
  Upload,
  Key,
  Odometer,
  Compass,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { setLanguage as saveLanguage } from '@/utils/storage'
import type { FormInstance, FormRules } from 'element-plus'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Refs
const formRef = ref<FormInstance>()
const loading = ref(false)

// 当前语言
const currentLanguage = computed(() => locale.value)

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('login.validation.usernameRequired'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.validation.passwordRequired'), trigger: 'blur' }
  ]
}))

/**
 * 处理登录
 */
async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await userStore.login(loginForm)

      if (res.code === 0 || res.code === 200) {
        ElMessage.success(t('login.message.success'))

        // 跳转到目标页面或首页
        const redirect = (route.query.redirect as string) || '/dashboard'
        router.push(redirect)
      } else {
        ElMessage.error(res.message || t('login.message.failed'))
      }
    } catch (error: any) {
      ElMessage.error(error.message || t('login.message.failed'))
    } finally {
      loading.value = false
    }
  })
}

/**
 * 切换语言
 */
function handleLanguageChange(lang: string) {
  locale.value = lang
  saveLanguage(lang)
}

// 生命周期
onMounted(() => {
  // 如果已登录，跳转首页
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: $bg-dark;
  position: relative;
  overflow: hidden;

  // 动态背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }
}

// 左侧登录区域
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  z-index: 1;
}

// 登录卡片
.login-card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 24px;
  border: 1px solid $border-color;
  backdrop-filter: blur(20px);
  box-shadow: $shadow-glow;
  position: relative;
  overflow: hidden;
  animation: card-enter 0.6s ease-out;

  // 顶部渐变光条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: $gradient-primary;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  background: $gradient-primary;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.login-subtitle {
  color: $text-secondary;
  font-size: 14px;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

// 输入框样式
.login-input {
  :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid $border-color;
    border-radius: 12px;
    box-shadow: none;
    height: 48px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $primary-color;
    }

    &.is-focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: $text-primary;
    font-size: 15px;

    &::placeholder {
      color: $text-muted;
    }
  }

  :deep(.el-input__prefix) {
    color: $text-secondary;
  }
}

.remember-checkbox {
  color: $text-secondary;

  :deep(.el-checkbox__label) {
    color: $text-secondary;
  }
}

// 登录按钮
.login-button {
  width: 100%;
  height: 48px;
  background: $gradient-primary;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  // 按钮光效
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: btn-shine 3s ease-in-out infinite;
  }
}

// 右侧产品介绍区域
.login-right {
  width: 45%;
  min-width: 500px;
  background: linear-gradient(135deg, $bg-card 0%, $bg-dark 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;

  // 网格背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }
}

.product-intro {
  text-align: center;
  position: relative;
  z-index: 1;
}

.product-title {
  font-size: 32px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 40px;
  background: $gradient-primary;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.product-features {
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;

  .feature-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: $text-primary;
    font-size: 15px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(0, 212, 255, 0.3);
      transform: translateX(5px);
    }

    .feature-icon {
      font-size: 20px;
      color: $primary-color;
    }
  }
}

.product-image {
  .product-icon {
    font-size: 120px;
    color: $primary-color;
    opacity: 0.8;
    animation: float 6s ease-in-out infinite;
  }
}

// 语言切换
.language-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  .language-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: $text-primary;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// 动画
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes btn-shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  50%,
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 响应式
@media (max-width: 1200px) {
  .login-right {
    width: 40%;
    min-width: 400px;
  }
}

@media (max-width: 992px) {
  .login-right {
    display: none;
  }

  .login-left {
    flex: none;
    width: 100%;
  }
}
</style>
