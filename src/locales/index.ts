import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 获取浏览器语言或本地存储的语言设置
function getDefaultLocale(): string {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale) {
    return savedLocale
  }

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n

// 切换语言
export function setLocale(locale: string): void {
  localStorage.setItem('locale', locale)
  i18n.global.locale.value = locale as any
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value as string
}
