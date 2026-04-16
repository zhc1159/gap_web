import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ThemeInfo {
  id: string
  labelZh: string
  labelEn: string
  previewGradient: string
}

const THEME_KEY = 'gap-theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem(THEME_KEY) || 'default')

  const themes: ThemeInfo[] = [
    { id: 'default', labelZh: '经典蓝绿', labelEn: 'Classic Blue', previewGradient: 'linear-gradient(135deg, #409EFF, #67C23A)' },
    { id: 'cyber-neon', labelZh: '赛博霓虹', labelEn: 'Cyber Neon', previewGradient: 'linear-gradient(135deg, #00f0ff, #0080ff)' },
    { id: 'matrix', labelZh: '矩阵黑客', labelEn: 'Matrix', previewGradient: 'linear-gradient(135deg, #00ff41, #003b00)' },
    { id: 'aurora', labelZh: '极光紫', labelEn: 'Aurora', previewGradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
    { id: 'crimson', labelZh: '赤焰科技', labelEn: 'Crimson Tech', previewGradient: 'linear-gradient(135deg, #ff4444, #ff8800)' },
    { id: 'ocean', labelZh: '深海科技', labelEn: 'Ocean Deep', previewGradient: 'linear-gradient(135deg, #0077b6, #00f5d4)' },
    { id: 'solar', labelZh: '日耀金', labelEn: 'Solar', previewGradient: 'linear-gradient(135deg, #ff9500, #ffd700)' },
    { id: 'arctic', labelZh: '极光冰白', labelEn: 'Arctic', previewGradient: 'linear-gradient(135deg, #a5f3fc, #e0f2fe)' }
  ]

  const currentThemeInfo = computed(() => themes.find(t => t.id === currentTheme.value) || themes[0])

  const setTheme = (id: string) => {
    currentTheme.value = id
    document.documentElement.dataset.theme = id
    localStorage.setItem(THEME_KEY, id)
  }

  const initTheme = () => {
    document.documentElement.dataset.theme = currentTheme.value
  }

  return { currentTheme, themes, currentThemeInfo, setTheme, initTheme }
})
