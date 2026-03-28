import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ILayoutState, IUISetting } from '@/types/layout'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const state = ref<ILayoutState>({
    isCollapse: false,
    isMobile: false,
    device: 'desktop',
    theme: 'dark',
    size: 'default'
  })

  const uiSetting = ref<IUISetting>({
    browserTitle: 'GAP System',
    favicon: '/favicon.ico',
    copyright: '© 2024 Security System',
    logo: '/logo.png',
    systemName: '安全隔离网闸'
  })

  // Getters
  const isCollapse = computed(() => state.value.isCollapse)
  const isMobile = computed(() => state.value.isMobile)
  const currentTheme = computed(() => state.value.theme)
  const device = computed(() => state.value.device)
  const componentSize = computed(() => state.value.size)

  // Actions
  /**
   * 切换侧边栏折叠状态
   */
  function toggleCollapse() {
    state.value.isCollapse = !state.value.isCollapse
  }

  /**
   * 设置折叠状态
   */
  function setCollapse(collapse: boolean) {
    state.value.isCollapse = collapse
  }

  /**
   * 设置设备类型
   */
  function setDevice(device: 'desktop' | 'mobile' | 'tablet') {
    state.value.device = device
    state.value.isMobile = device === 'mobile'

    // 移动端自动折叠侧边栏
    if (device === 'mobile') {
      state.value.isCollapse = true
    }
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    state.value.theme = state.value.theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', state.value.theme === 'dark')
  }

  /**
   * 设置主题
   */
  function setTheme(theme: 'light' | 'dark') {
    state.value.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  /**
   * 设置组件尺寸
   */
  function setComponentSize(size: 'default' | 'small' | 'large') {
    state.value.size = size
  }

  /**
   * 更新 UI 设置
   */
  function updateUISetting(setting: Partial<IUISetting>) {
    uiSetting.value = { ...uiSetting.value, ...setting }
  }

  /**
   * 检测设备类型
   */
  function detectDevice() {
    const width = window.innerWidth
    if (width < 768) {
      setDevice('mobile')
    } else if (width < 1024) {
      setDevice('tablet')
    } else {
      setDevice('desktop')
    }
  }

  return {
    state,
    uiSetting,
    isCollapse,
    isMobile,
    currentTheme,
    device,
    componentSize,
    toggleCollapse,
    setCollapse,
    setDevice,
    toggleTheme,
    setTheme,
    setComponentSize,
    updateUISetting,
    detectDevice
  }
})
