import { createI18n } from 'vue-i18n'
import { getLanguage } from '@/utils/storage'

// 导入语言包
import zhCN from './zh-CN/common'
import enUS from './en-US/common'

type MessageSchema = typeof zhCN
type Locales = 'zh-CN' | 'en-US'

const messages: Record<Locales, MessageSchema> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const savedLang = getLanguage()
const defaultLocale: Locales = (savedLang === 'en-US' || savedLang === 'zh-CN') ? savedLang : 'zh-CN'

const i18n = createI18n<[MessageSchema], Locales>({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n

// 切换语言的方法
export function setI18nLanguage(locale: Locales) {
  (i18n.global.locale as unknown as { value: Locales }).value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
}
