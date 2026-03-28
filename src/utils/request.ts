import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

// 扩展配置类型
interface IRequestConfig extends InternalAxiosRequestConfig {
  showLoading?: boolean
  loadingInstance?: ReturnType<typeof ElLoading.service>
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: IRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')

    // 添加 token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 添加请求加载动画
    if (config.showLoading !== false) {
      config.loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as IRequestConfig

    // 关闭加载动画
    if (config.loadingInstance) {
      config.loadingInstance.close()
    }

    const res = response.data

    // 根据业务状态码处理
    if (res.code !== 0 && res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5000
      })

      // 401: 未授权
      if (res.code === 401) {
        ElMessageBox.confirm(
          '登录状态已过期，请重新登录',
          '提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
        })
      }

      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  (error) => {
    const config = error.config as IRequestConfig

    // 关闭加载动画
    if (config?.loadingInstance) {
      config.loadingInstance.close()
    }

    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export function get<T = any>(url: string, params?: any, config?: Partial<IRequestConfig>): Promise<IApiResponse<T>> {
  return service.get(url, { params, ...config })
}

export function post<T = any>(url: string, data?: any, config?: Partial<IRequestConfig>): Promise<IApiResponse<T>> {
  return service.post(url, data, config)
}

export function put<T = any>(url: string, data?: any, config?: Partial<IRequestConfig>): Promise<IApiResponse<T>> {
  return service.put(url, data, config)
}

export function del<T = any>(url: string, config?: Partial<IRequestConfig>): Promise<IApiResponse<T>> {
  return service.delete(url, config)
}

export function patch<T = any>(url: string, data?: any, config?: Partial<IRequestConfig>): Promise<IApiResponse<T>> {
  return service.patch(url, data, config)
}

export default service
