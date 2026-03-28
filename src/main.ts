import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import i18n from './locales'

import './styles/global.scss'
import './styles/animations.scss'

const app = createApp(App)

// 配置 Pinia
app.use(createPinia())

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

// 注册 Element Plus Icons
for (const [key, icon] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, icon)
}

// 配置路由
app.use(router)

// 配置国际化
app.use(i18n)

app.mount('#app')
