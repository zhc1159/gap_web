import axios from 'axios'
import { ElNotification } from 'element-plus'

// Create axios instance
const service = axios.create({
  baseURL: (window as any).envs?.BASE_API_IP || '',
  timeout: 30000
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // Add token from sessionStorage
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // Check if response has error code
    if (res.code !== undefined && res.code !== 0 && res.code !== 200) {
      ElNotification({
        title: '错误',
        message: res.msg || '请求失败',
        type: 'error',
        customClass: 'notification-error'
      })
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  (error) => {
    console.error('Response error:', error)

    let message = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = error.response.data?.msg || '用户名或密码错误'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        default:
          message = error.response.data?.msg || `错误: ${error.response.status}`
      }
    } else if (error.message) {
      if (error.message.includes('timeout')) {
        message = '请求超时'
      } else if (error.message.includes('Network Error')) {
        message = '网络错误'
      }
    }

    ElNotification({
      title: '错误',
      message,
      type: 'error',
      customClass: 'notification-error'
    })

    return Promise.reject(error)
  }
)

export default service
