/**
 * 本地存储封装
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const LANGUAGE_KEY = 'language'
const THEME_KEY = 'theme'

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUserInfo<T>(): T | null {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

/**
 * 设置用户信息
 */
export function setUserInfo<T>(info: T): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 获取语言设置
 */
export function getLanguage(): string {
  return localStorage.getItem(LANGUAGE_KEY) || 'zh-CN'
}

/**
 * 设置语言
 */
export function setLanguage(lang: string): void {
  localStorage.setItem(LANGUAGE_KEY, lang)
}

/**
 * 获取主题设置
 */
export function getTheme(): string {
  return localStorage.getItem(THEME_KEY) || 'dark'
}

/**
 * 设置主题
 */
export function setTheme(theme: string): void {
  localStorage.setItem(THEME_KEY, theme)
}

/**
 * 清除所有本地存储
 */
export function clearAll(): void {
  removeToken()
  removeUserInfo()
}

/**
 * 会话存储封装
 */
export const sessionStorageUtil = {
  get<T>(key: string): T | null {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },

  set<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    sessionStorage.removeItem(key)
  },

  clear(): void {
    sessionStorage.clear()
  }
}
