/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Window environment configuration
interface WindowEnvs {
  BASE_API_IP: string
  WS_IP: string
  UKEY_IP: string
}

declare global {
  interface Window {
    envs: WindowEnvs
  }
}
