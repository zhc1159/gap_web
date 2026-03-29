<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="48" color="#667eea"><Lock /></el-icon>
        </div>
        <h1 class="login-title">GAP安全隔离网闸</h1>
        <p class="login-subtitle">管理系统</p>
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
        <p>提示：首次登录请使用管理员账号</p>
        <p>默认管理员：admin / admin123</p>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card{
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header{
  text-align: center;
  margin-bottom: 30px;
}

.login-logo{
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
}

.login-title{
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle{
  font-size: 14px;
  color: #909399;
}

.login-tabs{
  display: flex;
  margin-bottom: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.login-tab{
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
}

.login-tab:hover{
  background: #f5f7fa;
}

.login-tab.active{
  background: var(--el-color-primary);
  color: #fff;
}

.login-form{
  margin-top: 20px;
}

.login-button{
  width: 100%;
}

.login-footer{
  margin-top: 30px;
  text-align: center;
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
}
</style>
