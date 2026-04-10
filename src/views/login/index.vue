<template>
  <div class="login-container">
    <!-- Background effects -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>
    </div>

    <!-- Language Switcher -->
    <div class="lang-switcher">
      <el-dropdown trigger="click" @command="handleLanguageChange">
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
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="42"><Lock /></el-icon>
        </div>
        <h1 class="login-title">{{ $t('login.title') }}</h1>
        <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
      </div>

      <div class="login-tabs">
        <div
          v-for="tab in authTabs"
          :key="tab.value"
          :class="['login-tab', { active: authType === tab.value }]"
          @click="authType = tab.value"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          <span>{{ $t(tab.labelKey) }}</span>
        </div>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('login.usernamePlaceholder')"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item class="form-options">
          <el-checkbox v-model="rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
        </el-form-item>

        <el-form-item class="privacy-item">
          <el-checkbox v-model="agreePrivacy">
            {{ $t('login.privacyAgreement') }}
            <el-link type="primary" @click.stop="showPrivacyDialog = true">{{ $t('login.privacyPolicy') }}</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ $t('login.login') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>{{ $t('login.firstLoginHint') }}</p>
        <p class="account-hint">{{ $t('login.adminAccount') }}</p>
      </div>
    </div>

    <!-- Privacy Dialog -->
    <el-dialog
      v-model="showPrivacyDialog"
      :title="$t('privacy.title')"
      width="520px"
      :close-on-click-modal="false"
      class="dialog-body-custom"
    >
      <div class="privacy-content">
        <p class="privacy-section-title">{{ $t('privacy.section1Title') }}</p>
        <p>{{ $t('privacy.section1Content') }}</p>

        <p class="privacy-section-title">{{ $t('privacy.section2Title') }}</p>
        <p>{{ $t('privacy.section2Content') }}</p>
        <ul>
          <li>{{ $t('privacy.section2Item1') }}</li>
          <li>{{ $t('privacy.section2Item2') }}</li>
          <li>{{ $t('privacy.section2Item3') }}</li>
        </ul>

        <p class="privacy-section-title">{{ $t('privacy.section3Title') }}</p>
        <p>{{ $t('privacy.section3Content') }}</p>

        <p class="privacy-section-title">{{ $t('privacy.section4Title') }}</p>
        <p>{{ $t('privacy.section4Content') }}</p>

        <p class="privacy-section-title">{{ $t('privacy.section5Title') }}</p>
        <p>{{ $t('privacy.section5Content') }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showPrivacyDialog = false">{{ $t('privacy.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Login } from '@/axios/base'
import { setLocale, getLocale } from '@/locales'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const authType = ref<'password' | 'certificate' | 'fingerprint' | 'ukey'>('password')
const rememberMe = ref(false)
const agreePrivacy = ref(false)
const showPrivacyDialog = ref(false)
const currentLocale = ref(getLocale())

const currentLangLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '中文' : 'EN'
})

const handleLanguageChange = (lang: string) => {
  setLocale(lang)
  currentLocale.value = lang
  window.location.reload()
}

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: t('login.usernamePlaceholder'), trigger: 'blur' },
    { min: 3, message: t('login.usernameMinLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' }
  ]
}

const authTabs: Array<{ labelKey: string; value: 'password' | 'certificate' | 'fingerprint' | 'ukey'; icon: string }> = [
  { labelKey: 'login.passwordLogin', value: 'password', icon: 'Key' },
  { labelKey: 'login.certificateLogin', value: 'certificate', icon: 'Postcard' },
  { labelKey: 'login.fingerprintLogin', value: 'fingerprint', icon: 'Pointer' }
]

const handleLogin = async () => {
  if (!agreePrivacy.value) {
    ElMessage.warning(t('login.pleaseAgreePrivacy'))
    return
  }

  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    const res = await Login({
      username: loginForm.username,
      password: loginForm.password,
      authType: authType.value
    })

    // Store token and user info
    sessionStorage.setItem('accessToken', res.data.accessToken)
    sessionStorage.setItem('nick_name', res.data.nickName)
    sessionStorage.setItem('uid', res.data.uid)
    sessionStorage.setItem('roleList', JSON.stringify(res.data.roleList))

    ElNotification({
      title: t('common.success'),
      message: t('login.loginSuccess'),
      type: 'success',
      customClass: 'notification-success'
    })

    // Redirect
    const redirect = route.query.redirect as string
    router.push(redirect || '/supervise/sysInfo')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container{
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #ecfeff 100%);
}

/* Language Switcher */
.lang-switcher{
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.lang-btn{
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #64748b;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(37, 99, 235, 0.1);
  backdrop-filter: blur(10px);
}

.lang-btn:hover{
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(37, 99, 235, 0.2);
  color: #2563eb;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
}

.lang-btn .el-icon:last-child{
  font-size: 12px;
  margin-left: 2px;
}

.lang-flag{
  margin-right: 8px;
}

/* Bright background effects */
.login-bg{
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-grid{
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

.bg-glow{
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%);
  animation: softPulse 6s ease-in-out infinite;
}

@keyframes softPulse{
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Login card - Bright style */
.login-card{
  width: 420px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  padding: 48px 40px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 8px 40px rgba(37, 99, 235, 0.12),
    0 0 0 1px rgba(37, 99, 235, 0.05);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(20px);
}

.login-header{
  text-align: center;
  margin-bottom: 32px;
}

.login-logo{
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #06b6d4 100%);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}

.login-title{
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.login-subtitle{
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* Login tabs - Bright style */
.login-tabs{
  display: flex;
  margin-bottom: 28px;
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.8);
}

.login-tab{
  flex: 1;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(37, 99, 235, 0.1);
}

.login-tab:last-child{
  border-right: none;
}

.login-tab:hover{
  color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}

.login-tab.active{
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
  color: #2563eb;
  font-weight: 600;
}

/* Form */
.login-form{
  margin-top: 8px;
}

.login-button{
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-button:hover{
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

/* Checkbox */
:deep(.el-checkbox__label){
  color: #64748b;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner){
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Footer */
.login-footer{
  margin-top: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  line-height: 2;
}

.account-hint{
  color: #2563eb;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
}

/* Privacy checkbox */
.form-options{
  margin-bottom: 0;
}

.privacy-item{
  margin-bottom: 16px;
}

.privacy-item :deep(.el-checkbox__label){
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.5;
}

.privacy-item :deep(.el-link){
  font-size: 14px;
  margin-left: 2px;
}

/* Privacy Dialog */
.privacy-content{
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  line-height: 1.8;
  color: #475569;
  font-size: 14px;
}

.privacy-section-title{
  font-weight: 600;
  color: #1e293b;
  margin: 20px 0 8px;
  font-size: 15px;
}

.privacy-section-title:first-child{
  margin-top: 0;
}

.privacy-content p{
  margin: 0;
  text-indent: 2em;
}

.privacy-content ul{
  margin: 8px 0;
  padding-left: 3em;
}

.privacy-content li{
  margin: 4px 0;
}
</style>
