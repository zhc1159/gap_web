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
  background: #0f172a;
}

/* Background effects */
.login-bg{
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-grid{
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.bg-glow{
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse{
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Login card */
.login-card{
  width: 420px;
  background: rgba(30, 41, 59, 0.95);
  border-radius: 16px;
  padding: 48px 40px;
  border: 1px solid #2d3748;
  box-shadow: 0 0 40px rgba(0, 212, 255, 0.15);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
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
  background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
}

.login-title{
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.login-subtitle{
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 2px;
}

/* Login tabs */
.login-tabs{
  display: flex;
  margin-bottom: 28px;
  border: 1px solid #2d3748;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5);
}

.login-tab{
  flex: 1;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  border-right: 1px solid #2d3748;
}

.login-tab:last-child{
  border-right: none;
}

.login-tab:hover{
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

.login-tab.active{
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
  color: #00d4ff;
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
  background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-button:hover{
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-1px);
}

/* Checkbox */
:deep(.el-checkbox__label){
  color: #94a3b8;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner){
  background-color: #00d4ff;
  border-color: #00d4ff;
}

/* Footer */
.login-footer{
  margin-top: 32px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  line-height: 2;
}

.account-hint{
  color: #00d4ff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
}
</style>
