import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IMenuItem } from '@/types/menu'
import { useUserStore } from './user'
import { menuConfig, getMenuByRole } from '@/config/menu.config'
import { UserRole } from '@/types/user'
import { useLayoutStore } from './layout'

export const useMenuStore = defineStore('menu', () => {
  // State
  const menuList = ref<IMenuItem[]>([])
  const activeMenu = ref<string>('')
  const openMenus = ref<string[]>([])
  const searchKeyword = ref<string>('')
  const loading = ref<boolean>(false)

  // Getters
  const filteredMenuList = computed(() => {
    if (!searchKeyword.value) {
      return menuList.value
    }
    return filterMenuByKeyword(menuList.value, searchKeyword.value.toLowerCase())
  })

  /**
   * 根据关键词过滤菜单
   */
  function filterMenuByKeyword(menus: IMenuItem[], keyword: string): IMenuItem[] {
    return menus
      .map(menu => {
        const titleMatch = menu.title.toLowerCase().includes(keyword) ||
          menu.titleEn.toLowerCase().includes(keyword)

        if (menu.children && menu.children.length > 0) {
          const filteredChildren = filterMenuByKeyword(menu.children, keyword)
          if (filteredChildren.length > 0) {
            return {
              ...menu,
              children: filteredChildren
            }
          }
        }

        return titleMatch ? menu : null
      })
      .filter((menu): menu is IMenuItem => menu !== null)
  }

  /**
   * 加载菜单配置
   */
  async function loadMenu() {
    try {
      loading.value = true
      const userStore = useUserStore()

      // 从用户角色获取菜单
      const role = userStore.role as UserRole
      const roleMenus = getMenuByRole(role)

      // 转换为菜单数据结构
      menuList.value = roleMenus

    } catch (error) {
      console.error('加载菜单失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置当前激活菜单
   */
  function setActiveMenu(path: string) {
    activeMenu.value = path

    // 自动打开父级菜单
    const parentIds = findParentMenuIds(menuList.value, path)
    openMenus.value = parentIds
  }

  /**
   * 查找父级菜单 ID
   */
  function findParentMenuIds(menus: IMenuItem[], targetPath: string, parents: string[] = []): string[] {
    for (const menu of menus) {
      if (menu.path === targetPath) {
        return parents
      }

      if (menu.children && menu.children.length > 0) {
        const found = findParentMenuIds(menu.children, targetPath, [...parents, menu.id])
        if (found.length > 0) {
          return found
        }
      }
    }

    return []
  }

  /**
   * 切换菜单展开
   */
  function toggleMenu(menuId: string) {
    const index = openMenus.value.indexOf(menuId)
    if (index > -1) {
      openMenus.value.splice(index, 1)
    } else {
      openMenus.value.push(menuId)
    }
  }

  return {
    menuList,
    activeMenu,
    openMenus,
    searchKeyword,
    loading,
    filteredMenuList,
    loadMenu,
    setActiveMenu,
    toggleMenu
  }
})
