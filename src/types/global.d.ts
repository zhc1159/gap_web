// Global type declarations for Vue Router
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    pTitle?: string
    icon?: string
    checkAuth?: boolean
    [key: string]: any
  }
}
