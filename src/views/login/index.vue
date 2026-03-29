<template>
  <div class="login-container">
    <!-- Background effects -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="42"><Lock /></el-icon>
        </div>
        <h1 class="login-title">GAP安全隔离网闸</h1>
        <p class="login-subtitle">Security Isolation Gateway</p>
      </div>

      <div class="login-tabs">
        <div
          v-for="tab in authTabs"
          :key="tab.value"
          :class="['login-tab', { active: authType === tab.value }]"
          @click="authType = tab.value"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          <span>{{ tab.label }}</span>
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
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>首次登录请使用管理员账号</p>
        <p class="account-hint">admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { Login } from '@/axios/base'

const router = useRouter()
const route = useRoute()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const authType = ref<'password' | 'certificate' | 'fingerprint' | 'ukey'>('password')
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

const authTabs: Array<{ label: string; value: 'password' | 'certificate' | 'fingerprint' | 'ukey'; icon: string }> = [
  { label: '密码登录', value: 'password', icon: 'Key' },
  { label: '证书登录', value: 'certificate', icon: 'Postcard' },
  { label: '指纹登录', value: 'fingerprint', icon: 'Pointer' }
]

const handleLogin = async () => {
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
      title: '成功',
      message: '登录成功',
      type: 'success',
      customClass: 'notification-success'
    })

    // Redirect
    const redirect = route.query.redirect as string
    router.push(redirect || '/system/user')
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
  background: linear-gradient(135deg, #0d0221 0%, #1a0a2e 50%, #150734 100%);
}

/* Neon city background effects */
.login-bg{
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-grid{
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 45, 146, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove{
  0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
}

.bg-glow{
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(255, 45, 146, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(185, 103, 255, 0.1) 0%, transparent 60%);
  animation: neonPulse 4s ease-in-out infinite;
}

@keyframes neonPulse{
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Login card - Neon style */
.login-card{
  width: 420px;
  background: linear-gradient(145deg, rgba(26, 10, 46, 0.95) 0%, rgba(13, 2, 33, 0.98) 100%);
  border-radius: 20px;
  padding: 48px 40px;
  border: 1px solid rgba(255, 45, 146, 0.3);
  box-shadow:
    0 0 40px rgba(255, 45, 146, 0.2),
    0 0 80px rgba(0, 240, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(20px);
}

.login-card::before{
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #ff2d92, #00f0ff, #b967ff, #ff2d92);
  border-radius: 22px;
  z-index: -1;
  opacity: 0.5;
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow{
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
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
  background: linear-gradient(135deg, #ff2d92 0%, #b967ff 50%, #00f0ff 100%);
  border-radius: 20px;
  color: #fff;
  box-shadow:
    0 0 30px rgba(255, 45, 146, 0.5),
    0 0 60px rgba(0, 240, 255, 0.3);
  animation: logoGlow 2s ease-in-out infinite;
}

@keyframes logoGlow{
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 45, 146, 0.5), 0 0 60px rgba(0, 240, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 45, 146, 0.7), 0 0 80px rgba(0, 240, 255, 0.5);
  }
}

.login-title{
  font-size: 26px;
  font-weight: 700;
  color: #f0e6ff;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(255, 45, 146, 0.5);
}

.login-subtitle{
  font-size: 14px;
  color: #b967ff;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* Login tabs - Neon style */
.login-tabs{
  display: flex;
  margin-bottom: 28px;
  border: 1px solid rgba(185, 103, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(21, 7, 52, 0.6);
}

.login-tab{
  flex: 1;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #b8a9c9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(185, 103, 255, 0.2);
}

.login-tab:last-child{
  border-right: none;
}

.login-tab:hover{
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
}

.login-tab.active{
  background: linear-gradient(135deg, rgba(255, 45, 146, 0.2) 0%, rgba(185, 103, 255, 0.2) 100%);
  color: #ff2d92;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 45, 146, 0.5);
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
  background: linear-gradient(135deg, #ff2d92 0%, #b967ff 50%, #00f0ff 100%);
  background-size: 200% 200%;
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: gradientMove 3s ease infinite;
}

@keyframes gradientMove{
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-button:hover{
  box-shadow: 0 0 30px rgba(255, 45, 146, 0.6), 0 0 60px rgba(0, 240, 255, 0.4);
  transform: translateY(-2px);
}

/* Checkbox */
:deep(.el-checkbox__label){
  color: #b8a9c9;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner){
  background-color: #ff2d92;
  border-color: #ff2d92;
  box-shadow: 0 0 10px rgba(255, 45, 146, 0.5);
}

/* Footer */
.login-footer{
  margin-top: 32px;
  text-align: center;
  color: #6b5b7a;
  font-size: 13px;
  line-height: 2;
}

.account-hint{
  color: #00f0ff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
</style>
