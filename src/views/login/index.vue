<template>
  <div class="login-container">
    <!-- Background tech effects -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>
      <div class="bg-particles">
        <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></span>
      </div>
      <div class="scan-beam"></div>
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

    <!-- Main Layout -->
    <div class="login-main">
      <!-- Left Showcase Panel -->
      <div class="showcase-panel">
        <div class="showcase-content">
          <div class="showcase-brand">
            <h1 class="brand-title">{{ $t('login.title') }}</h1>
          </div>

          <div class="showcase-features">
            <div class="feature-item" v-for="f in features" :key="f.icon">
              <div class="feature-icon">
                <el-icon :size="20"><component :is="f.icon" /></el-icon>
              </div>
              <div class="feature-text">
                <span class="feature-title">{{ $t(f.titleKey) }}</span>
                <span class="feature-desc">{{ $t(f.descKey) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="showcase-divider">
          <span class="divider-line"></span>
          <span class="divider-dot"></span>
          <span class="divider-icon">
            <el-icon :size="14"><Promotion /></el-icon>
          </span>
          <span class="divider-dot"></span>
          <span class="divider-line"></span>
        </div>

        <!-- Ad Carousel -->
        <div class="ad-section">
          <div class="ad-carousel">
            <div class="ad-track" :style="{ transform: `translateX(-${currentAd * 100}%)` }">
              <div class="ad-card" v-for="(ad, idx) in adList" :key="idx" @click="openAdDetail(ad)">
                <div class="ad-product-img"
                  @mouseenter="previewSrc = ad.image"
                  @mouseleave="previewSrc = ''">
                  <img :src="ad.image" alt="" />
                </div>
                <div class="ad-info">
                  <h4 class="ad-product-name">{{ ad.name }}</h4>
                  <div class="ad-field">
                    <span class="ad-label">{{ $t('login.adContact') }}</span>
                    <span>{{ ad.contact }}</span>
                  </div>
                  <div class="ad-field">
                    <span class="ad-label">{{ $t('login.adPhone') }}</span>
                    <span>{{ ad.phone }}</span>
                  </div>
                  <div class="ad-field">
                    <span class="ad-label">{{ $t('login.adEmail') }}</span>
                    <span>{{ ad.email }}</span>
                  </div>
                  <div class="ad-field">
                    <span class="ad-label">{{ $t('login.adAddress') }}</span>
                    <span>{{ ad.address }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ad-dots">
              <span
                v-for="(_, idx) in adList"
                :key="idx"
                :class="['ad-dot', { active: currentAd === idx }]"
                @click="currentAd = idx"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Login Panel -->
      <div class="login-panel">
        <div class="login-card">
          <div class="login-header">
            <img src="@/assets/images/company_logo.png" alt="Logo" class="login-logo" />
            <h2 class="login-welcome">{{ $t('login.welcome') || $t('login.title') }}</h2>
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
      </div>
    </div>

    <!-- Image Preview Overlay -->
    <Transition name="preview-fade">
      <div v-if="previewSrc" class="image-preview-overlay">
        <img :src="previewSrc" class="image-preview-img" />
      </div>
    </Transition>

    <!-- Ad Detail Dialog -->
    <el-dialog
      v-model="showAdDialog"
      width="420px"
      :show-close="true"
      class="ad-detail-dialog"
      align-center
    >
      <div class="ad-detail" v-if="currentAdData">
        <div class="ad-detail-img">
          <img :src="currentAdData.image" alt="" />
        </div>
        <h3 class="ad-detail-name">{{ currentAdData.name }}</h3>
        <div class="ad-detail-fields">
          <div class="ad-detail-row">
            <span class="ad-detail-label">{{ $t('login.adContact') }}</span>
            <span class="ad-detail-value">{{ currentAdData.contact }}</span>
          </div>
          <div class="ad-detail-row">
            <span class="ad-detail-label">{{ $t('login.adPhone') }}</span>
            <span class="ad-detail-value">{{ currentAdData.phone }}</span>
          </div>
          <div class="ad-detail-row">
            <span class="ad-detail-label">{{ $t('login.adEmail') }}</span>
            <span class="ad-detail-value">{{ currentAdData.email }}</span>
          </div>
          <div class="ad-detail-row">
            <span class="ad-detail-label">{{ $t('login.adAddress') }}</span>
            <span class="ad-detail-value">{{ currentAdData.address }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Login } from '@/axios/base'
import { setLocale, getLocale } from '@/locales'
import companyLogo from '@/assets/images/company_logo.png'
import wangzhaLogo from '@/assets/images/wangzha_logo.png'

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
const currentAd = ref(0)
const previewSrc = ref('')
const showAdDialog = ref(false)
const currentAdData = ref<typeof adList[0] | null>(null)

const openAdDetail = (ad: typeof adList[0]) => {
  currentAdData.value = ad
  showAdDialog.value = true
}
let adTimer: ReturnType<typeof setInterval> | null = null

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

const features = [
  { icon: 'Shield', titleKey: 'login.featureSecurity', descKey: 'login.featureSecurityDesc' },
  { icon: 'Monitor', titleKey: 'login.featureMonitor', descKey: 'login.featureMonitorDesc' },
  { icon: 'Connection', titleKey: 'login.featureIsolation', descKey: 'login.featureIsolationDesc' },
  { icon: 'Setting', titleKey: 'login.featureManage', descKey: 'login.featureManageDesc' }
]

const adList = [
  {
    image: wangzhaLogo,
    name: 'GAP-2000 安全隔离网闸',
    contact: '张经理',
    phone: '010-88886666',
    email: 'sales@example.com',
    address: '北京市海淀区科技园路88号'
  },
  {
    image: wangzhaLogo,
    name: 'GAP-5000 千兆隔离网闸',
    contact: '李经理',
    phone: '010-88887777',
    email: 'info@example.com',
    address: '北京市海淀区科技园路88号'
  },
  {
    image: wangzhaLogo,
    name: 'GAP-8000 万兆隔离网闸',
    contact: '王经理',
    phone: '010-88889999',
    email: 'support@example.com',
    address: '北京市海淀区科技园路88号'
  }
]

const particleStyle = (i: number) => {
  const seed = i * 137.5
  return {
    left: `${(seed * 7.3) % 100}%`,
    top: `${(seed * 3.7) % 100}%`,
    width: `${2 + (i % 4)}px`,
    height: `${2 + (i % 4)}px`,
    animationDelay: `${(i * 0.5) % 8}s`,
    animationDuration: `${6 + (i % 5)}s`
  }
}

onMounted(() => {
  adTimer = setInterval(() => {
    currentAd.value = (currentAd.value + 1) % adList.length
  }, 4000)
})

onUnmounted(() => {
  if (adTimer) clearInterval(adTimer)
})

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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 40%, #ecfeff 100%);
}

/* ====== Language Switcher ====== */
.lang-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.lang-btn {
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

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(37, 99, 235, 0.25);
  color: #2563eb;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
}

.lang-btn .el-icon:last-child {
  font-size: 12px;
  margin-left: 2px;
}

.lang-flag {
  margin-right: 8px;
}

/* ====== Background Tech Effects ====== */
.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridShift 20s linear infinite;
}

@keyframes gridShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

.bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 15%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.06) 0%, transparent 60%);
  animation: softPulse 6s ease-in-out infinite;
}

@keyframes softPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.bg-particles .particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.25);
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
}

.scan-beam {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), rgba(37, 99, 235, 0.4), transparent);
  animation: scanDown 4s ease-in-out infinite;
}

@keyframes scanDown {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* ====== Main Layout ====== */
.login-main {
  display: flex;
  width: 1060px;
  min-height: 580px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow:
    0 20px 60px rgba(37, 99, 235, 0.1),
    0 0 0 1px rgba(37, 99, 235, 0.06);
}

/* ====== Left Showcase Panel ====== */
.showcase-panel {
  width: 520px;
  background: linear-gradient(160deg, #1e3a5f 0%, #0f2b4a 40%, #0a2540 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding: 40px 36px 24px;
}

/* Showcase tech decorations */
.showcase-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(37, 99, 235, 0.1) 0%, transparent 40%);
  pointer-events: none;
}

.showcase-panel::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -1px;
  width: 2px;
  height: 120px;
  transform: translateY(-50%);
  background: linear-gradient(transparent, rgba(6, 182, 212, 0.5), transparent);
  animation: dividerGlow 3s ease-in-out infinite;
}

@keyframes dividerGlow {
  0%, 100% { opacity: 0.4; height: 120px; }
  50% { opacity: 1; height: 180px; }
}

.showcase-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.showcase-brand {
  text-align: center;
  margin-bottom: 36px;
}

.brand-logo {
  width: 140px;
  height: auto;
  margin-bottom: 16px;
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: 3px;
}

.brand-subtitle {
  font-size: 13px;
  color: rgba(6, 182, 212, 0.8);
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.showcase-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-title {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.feature-desc {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.8);
  line-height: 1.4;
}

/* ====== Showcase Divider ====== */
.showcase-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 16px;
  position: relative;
  z-index: 1;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent);
}

.divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.6);
}

.divider-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2));
  border: 1px solid rgba(6, 182, 212, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
  animation: dividerPulse 2s ease-in-out infinite;
}

@keyframes dividerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.3); }
  50% { box-shadow: 0 0 12px 2px rgba(6, 182, 212, 0.2); }
}

/* ====== Ad Carousel Section ====== */
.ad-section {
  position: relative;
  z-index: 1;
  margin-top: 20px;
}

.ad-carousel {
  overflow: hidden;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ad-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ad-card {
  min-width: 100%;
  display: flex;
  gap: 16px;
  padding: 18px 20px;
  align-items: flex-start;
  cursor: pointer;
}

.ad-product-img {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.ad-product-img:hover {
  border-color: rgba(6, 182, 212, 0.5);
}

.ad-product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Image Preview Overlay */
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.image-preview-img {
  max-width: 60vw;
  max-height: 60vh;
  border-radius: 16px;
  border: 2px solid rgba(6, 182, 212, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 1);
  padding: 12px;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.25s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.ad-info {
  flex: 1;
  min-width: 0;
}

.ad-product-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px;
}

.ad-field {
  display: flex;
  font-size: 12px;
  line-height: 1.8;
  color: rgba(203, 213, 225, 0.8);
}

.ad-label {
  color: rgba(148, 163, 184, 0.6);
  flex-shrink: 0;
  width: 60px;
}

.ad-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 10px 0 12px;
}

.ad-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ad-dot.active {
  width: 20px;
  background: #22d3ee;
}

/* ====== Right Login Panel ====== */
.login-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 36px;
  backdrop-filter: blur(20px);
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  width: 160px;
  height: auto;
  margin-bottom: 16px;
  filter: brightness(0.85);
}

.login-welcome {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 1px;
}

/* ====== Login Tabs ====== */
.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.8);
}

.login-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(37, 99, 235, 0.08);
}

.login-tab:last-child {
  border-right: none;
}

.login-tab:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.04);
}

.login-tab.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(6, 182, 212, 0.06));
  color: #2563eb;
  font-weight: 600;
}

/* ====== Form ====== */
.login-form {
  margin-top: 4px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-button:hover {
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
  transform: translateY(-2px);
}

/* ====== Checkbox ====== */
:deep(.el-checkbox__label) {
  color: #64748b;
  font-size: 13px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* ====== Footer ====== */
.login-footer {
  margin-top: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  line-height: 2;
}

.account-hint {
  color: #2563eb;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 1px;
}

/* ====== Privacy ====== */
.form-options {
  margin-bottom: 0;
}

.privacy-item {
  margin-bottom: 14px;
}

.privacy-item :deep(.el-checkbox__label) {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.5;
}

.privacy-item :deep(.el-link) {
  font-size: 13px;
  margin-left: 2px;
}

/* ====== Privacy Dialog ====== */
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  line-height: 1.8;
  color: #475569;
  font-size: 14px;
}

.privacy-section-title {
  font-weight: 600;
  color: #1e293b;
  margin: 20px 0 8px;
  font-size: 15px;
}

.privacy-section-title:first-child {
  margin-top: 0;
}

.privacy-content p {
  margin: 0;
  text-indent: 2em;
}

.privacy-content ul {
  margin: 8px 0;
  padding-left: 3em;
}

.privacy-content li {
  margin: 4px 0;
}

/* ====== Responsive ====== */
@media (max-width: 1100px) {
  .login-main {
    width: 92vw;
    max-width: 1060px;
  }

  .showcase-panel {
    width: 46%;
  }
}

@media (max-width: 768px) {
  .login-main {
    flex-direction: column;
    width: 95vw;
    max-width: 440px;
    min-height: auto;
  }

  .showcase-panel {
    width: 100%;
    padding: 28px 24px 20px;
  }

  .showcase-features {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .login-panel {
    padding: 28px 24px;
  }
}

/* ====== Ad Detail Dialog ====== */
.ad-detail {
  text-align: center;
}

.ad-detail-img {
  width: 100%;
  max-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.ad-detail-img img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.ad-detail-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
}

.ad-detail-fields {
  text-align: left;
}

.ad-detail-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.ad-detail-row:last-child {
  border-bottom: none;
}

.ad-detail-label {
  width: 70px;
  flex-shrink: 0;
  color: #94a3b8;
  font-weight: 500;
}

.ad-detail-value {
  color: #334155;
}
</style>
