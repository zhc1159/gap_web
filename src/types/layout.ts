import type { UserRole } from './user'

/**
 * UI 设置接口
 */
export interface IUISetting {
  browserTitle: string
  favicon: string
  copyright: string
  logo: string
  systemName: string
}

/**
 * 布局状态接口
 */
export interface ILayoutState {
  isCollapse: boolean
  isMobile: boolean
  device: 'desktop' | 'mobile' | 'tablet'
  theme: 'light' | 'dark'
  size: 'default' | 'small' | 'large'
}

/**
 * 系统配置接口
 */
export interface ISystemConfig {
  version: string
  gapWhere: 'intranet' | 'extranet'
  linkState: 'OK' | 'ERROR'
}

/**
 * 面包屑项
 */
export interface IBreadcrumbItem {
  title: string
  titleEn: string
  path?: string
  icon?: string
}

/**
 * 标签页项
 */
export interface ITabItem {
  path: string
  title: string
  titleEn: string
  icon?: string
  closable: boolean
}
