/**
 * 菜单项接口
 */
export interface IMenuItem {
  id: string
  path: string
  name: string
  icon?: string
  title: string
  titleEn: string
  enabled: boolean
  sort: number
  children?: IMenuItem[]
  badge?: {
    value: number
    type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  }
}

/**
 * 角色菜单映射
 */
export interface IRoleMenuMap {
  [role: string]: IMenuItem[]
}

/**
 * 菜单状态接口
 */
export interface IMenuState {
  menuList: IMenuItem[]
  activeMenu: string
  openMenus: string[]
  searchKeyword: string
  loading: boolean
}

/**
 * 图标名称类型
 */
export type IconName =
  | 'Odometer'
  | 'Document'
  | 'User'
  | 'UserFilled'
  | 'Link'
  | 'Shield'
  | 'Sort'
  | 'VideoCamera'
  | 'Grid'
  | 'Refresh'
  | 'Download'
  | 'View'
  | 'Setting'
  | 'Tools'
  | 'Clock'
  | 'Connection'
  | 'DataLine'
  | 'TrendCharts'
  | 'Monitor'
  | 'Lock'
  | 'Key'
  | string
