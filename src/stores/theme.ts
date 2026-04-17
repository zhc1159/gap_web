import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ThemeInfo {
  id: string
  labelZh: string
  labelEn: string
  previewColor: string // 支持纯色或 linear-gradient(...)
  tagZh?: string
  tagEn?: string
}

const THEME_KEY = 'gap-theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem(THEME_KEY) || 'blue')

  const themes: ThemeInfo[] = [
    { id: 'blue', labelZh: '蓝绿渐变', labelEn: 'Blue-Green', previewColor: 'linear-gradient(135deg, #409EFF, #67C23A)' },
    { id: 'green', labelZh: '翡翠绿', labelEn: 'Green', previewColor: '#67C23A' },
    { id: 'orange', labelZh: '琥珀橙', labelEn: 'Orange', previewColor: '#E6A23C' },
    { id: 'red', labelZh: '胭脂红', labelEn: 'Red', previewColor: '#F56C6C' },
    { id: 'tech-cyan', labelZh: '科技青', labelEn: 'Tech Cyan', previewColor: '#06b6d4', tagZh: '科技', tagEn: 'Tech' },
    { id: 'tech-purple', labelZh: '星云紫', labelEn: 'Nebula', previewColor: '#8b5cf6', tagZh: '科技', tagEn: 'Tech' },
    { id: 'tech-emerald', labelZh: '翡翠荧光', labelEn: 'Emerald', previewColor: '#10b981', tagZh: '科技', tagEn: 'Tech' },
    { id: 'tech-neon', labelZh: '霓虹蓝', labelEn: 'Neon Blue', previewColor: '#0ea5e9', tagZh: '科技', tagEn: 'Tech' },
    { id: 'cyber-neon', labelZh: '赛博霓虹', labelEn: 'Cyber Neon', previewColor: '#00e5ff', tagZh: '暗色', tagEn: 'Dark' },
    { id: 'deep-ocean', labelZh: '深海', labelEn: 'Deep Ocean', previewColor: '#0077b6', tagZh: '暗色', tagEn: 'Dark' }
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
