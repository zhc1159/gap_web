<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="sidebar-head">
        <div class="sidebar-logo">
          <el-icon :size="28"><Lock /></el-icon>
        </div>
        <span v-show="!isCollapse" class="sidebar-title">GAP {{ $t('common.system') }}</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="#a3aec9"
        active-text-color="#00d4ff"
      >
        <template v-for="item in menuList" :key="item.path">
          <!-- Has children -->
          <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
            <template #title>
              <el-icon><component :is="getIcon(item.icon)" /></el-icon>
              <span>{{ $t(item.meta?.titleKey || '') }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="item.path + '/' + child.path"
            >
              <el-icon><component :is="getIcon(child.icon)" /></el-icon>
              <span>{{ $t(child.meta?.titleKey || '') }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- No children -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="getIcon(item.icon)" /></el-icon>
            <span>{{ $t(item.meta?.titleKey || '') }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- Main content -->
    <div class="layout-main">
      <!-- Header -->
      <div class="layout-header">
        <div class="header-left">
          <div class="hamburger" @click="toggleCollapse">
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- Language Switcher -->
          <el-dropdown trigger="click" @command="handleLanguageChange" class="lang-switcher">
            <div class="lang-btn">
              <el-icon><Globe /></el-icon>
              <span>{{ currentLangLabel }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
                  <span class="lang-flag">🇨🇳</span> 简体中文
                </el-dropdown-item>
                <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
                  <span class="lang-flag">🇺🇸</span> English
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- User Dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">{{ nickName?.charAt(0) }}</el-avatar>
              <span class="nick-name">{{ nickName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>{{ $t('navbar.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon>{{ $t('navbar.changePassword') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>{{ $t('navbar.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Content -->
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>

      <!-- Footer -->
      <div class="layout-footer">
        <span>GAP {{ $t('login.title') }} &copy; {{ new Date().getFullYear() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Logout } from '@/axios/base'
import { setLocale, getLocale } from '@/locales'
import * as Icons from '@element-plus/icons-vue'
import { markRaw } from 'vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const nickName = ref(sessionStorage.getItem('nick_name') || '')
const currentLocale = ref(getLocale())

// Icon mapping
const getIcon = (iconName: string) => {
  const icon = (Icons as Record<string, unknown>)[iconName]
  return icon ? markRaw(icon) : null
}

// Language options
const currentLangLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '中文' : 'EN'
})

const handleLanguageChange = (lang: string) => {
  setLocale(lang)
  currentLocale.value = lang
  window.location.reload()
}

// Menu list based on user permissions
const menuList = ref([
  // 状态监视
  {
    path: '/supervise',
    meta: { titleKey: 'menu.supervise' },
    icon: 'Monitor',
    children: [
      { path: 'sysInfo', meta: { titleKey: 'supervise.sysInfo.title' }, icon: 'InfoFilled' },
      { path: 'gapIneth', meta: { titleKey: 'supervise.gapIneth.title' }, icon: 'Connection' },
      { path: 'gapProtocol', meta: { titleKey: 'supervise.gapProtocol.title' }, icon: 'Link' },
      { path: 'gapUser', meta: { titleKey: 'supervise.gapUser.title' }, icon: 'User' },
      { path: 'gapDip', meta: { titleKey: 'supervise.gapDip.title' }, icon: 'Cpu' },
      { path: 'gapFileSync', meta: { titleKey: 'supervise.gapFileSync.title' }, icon: 'Files' }
    ]
  },
  // 系统配置
  {
    path: '/systemManage',
    meta: { titleKey: 'menu.systemManage' },
    icon: 'Setting',
    children: [
      { path: 'lanShow', meta: { titleKey: 'systemManage.lanShow.title' }, icon: 'Connection' },
      { path: 'sysTime', meta: { titleKey: 'systemManage.sysTime.title' }, icon: 'Clock' },
      { path: 'gapMode', meta: { titleKey: 'systemManage.gapMode.title' }, icon: 'Switch' },
      { path: 'vlanShow', meta: { titleKey: 'systemManage.vlanShow.title' }, icon: 'Grid' },
      { path: 'routeShow', meta: { titleKey: 'systemManage.routeShow.title' }, icon: 'Guide' },
      { path: 'softwareConf', meta: { titleKey: 'systemManage.softwareConf.title' }, icon: 'Key' },
      { path: 'funcManager', meta: { titleKey: 'systemManage.funcManager.title' }, icon: 'SetUp' },
      { path: 'antiDos', meta: { titleKey: 'systemManage.antiDos.title' }, icon: 'Warning' },
      { path: 'defenseSet', meta: { titleKey: 'systemManage.defenseSet.title' }, icon: 'Lock' },
      { path: 'defenseLog', meta: { titleKey: 'systemManage.defenseLog.title' }, icon: 'Document' },
      { path: 'defenseUpdate', meta: { titleKey: 'systemManage.defenseUpdate.title' }, icon: 'Upload' },
      { path: 'hotstandby', meta: { titleKey: 'systemManage.hotstandby.title' }, icon: 'CopyDocument' },
      { path: 'loadbalanceShow', meta: { titleKey: 'systemManage.loadbalanceShow.title' }, icon: 'Connection' },
      { path: 'lvsShow', meta: { titleKey: 'systemManage.lvsShow.title' }, icon: 'Sort' },
      { path: 'linkPoly', meta: { titleKey: 'systemManage.linkPoly.title' }, icon: 'Link' }
    ]
  },
  // 用户管理
  {
    path: '/userManage',
    meta: { titleKey: 'menu.userManage' },
    icon: 'User',
    children: [
      { path: 'super_opcUser', meta: { titleKey: 'userManage.super_opcUser.title' }, icon: 'UserFilled' },
      { path: 'authFun', meta: { titleKey: 'userManage.authFun.title' }, icon: 'Key' }
    ]
  },
  // 系统维护
  {
    path: '/systemMaintenance',
    meta: { titleKey: 'menu.systemMaintenance' },
    icon: 'Tools',
    children: [
      { path: 'licenseShow', meta: { titleKey: 'systemMaintenance.licenseShow.title' }, icon: 'Ticket' },
      { path: 'loadProfileShow', meta: { titleKey: 'systemMaintenance.loadProfileShow.title' }, icon: 'FolderOpened' },
      { path: 'ProfileBackup', meta: { titleKey: 'systemMaintenance.profileBackup.title' }, icon: 'Files' },
      { path: 'sysUpdate', meta: { titleKey: 'systemMaintenance.sysUpdate.title' }, icon: 'Promotion' },
      { path: 'antiVirusUpdate', meta: { titleKey: 'systemMaintenance.antiVirusUpdate.title' }, icon: 'Upload' },
      { path: 'diagTool', meta: { titleKey: 'systemMaintenance.diagTool.title' }, icon: 'Search' },
      { path: 'oNAndOff', meta: { titleKey: 'systemMaintenance.onOff.title' }, icon: 'SwitchButton' }
    ]
  },
  // 权限管理
  {
    path: '/authorityManage',
    meta: { titleKey: 'menu.authorityManage' },
    icon: 'Lock',
    children: [
      { path: 'showUser', meta: { titleKey: 'authorityManage.showUser.title' }, icon: 'User' },
      { path: 'userIpShow', meta: { titleKey: 'authorityManage.userIpShow.title' }, icon: 'Location' },
      { path: 'Otp', meta: { titleKey: 'authorityManage.otp.title' }, icon: 'Key' },
      { path: 'secureShow', meta: { titleKey: 'authorityManage.secureShow.title' }, icon: 'Lock' }
    ]
  },
  // 对象管理
  {
    path: '/objectManage',
    meta: { titleKey: 'menu.objectManage' },
    icon: 'Collection',
    children: [
      { path: 'ipGroup', meta: { titleKey: 'objectManage.ipGroup.title' }, icon: 'Location' },
      { path: 'timeGroup', meta: { titleKey: 'objectManage.timeGroup.title' }, icon: 'Timer' }
    ]
  },
  // 通用代理
  {
    path: '/securityPolicy',
    meta: { titleKey: 'menu.securityPolicy' },
    icon: 'Connection',
    children: [
      { path: 'general_accessControl', meta: { titleKey: 'securityPolicy.general_accessControl.title' }, icon: 'List' },
      { path: 's_ftp', meta: { titleKey: 'securityPolicy.s_ftp.title' }, icon: 'Upload' },
      { path: 's_http', meta: { titleKey: 'securityPolicy.s_http.title' }, icon: 'Link' },
      { path: 's_email', meta: { titleKey: 'securityPolicy.s_email.title' }, icon: 'Message' },
      { path: 's_telnet', meta: { titleKey: 'securityPolicy.s_telnet.title' }, icon: 'Monitor' },
      { path: 's_WebService', meta: { titleKey: 'securityPolicy.s_WebService.title' }, icon: 'Connection' },
      { path: 's_httpProxy', meta: { titleKey: 'securityPolicy.s_httpProxy.title' }, icon: 'Link' }
    ]
  },
  // 数据库安全
  {
    path: '/databaseSafe',
    meta: { titleKey: 'menu.databaseSafe' },
    icon: 'Coin',
    children: [
      { path: 'database_accessControl', meta: { titleKey: 'databaseSafe.database_accessControl.title' }, icon: 'List' },
      { path: 's_db_sybase', meta: { titleKey: 'databaseSafe.s_db_sybase.title' }, icon: 'Coin' },
      { path: 's_db_dameng', meta: { titleKey: 'databaseSafe.s_db_dameng.title' }, icon: 'Coin' },
      { path: 's_db_oracle', meta: { titleKey: 'databaseSafe.s_db_oracle.title' }, icon: 'Coin' }
    ]
  },
  // 文件传输
  {
    path: '/fileSafe',
    meta: { titleKey: 'menu.fileSafe' },
    icon: 'Folder',
    children: [
      { path: 'file_accessControl', meta: { titleKey: 'fileSafe.file_accessControl.title' }, icon: 'List' },
      { path: 's_stfp', meta: { titleKey: 'fileSafe.s_stfp.title' }, icon: 'Upload' },
      { path: 'file_approval', meta: { titleKey: 'fileSafe.file_approval.title' }, icon: 'Clock' },
      { path: 'file_approval_success', meta: { titleKey: 'fileSafe.file_approval_success.title' }, icon: 'CircleCheck' },
      { path: 'file_approval_failed', meta: { titleKey: 'fileSafe.file_approval_failed.title' }, icon: 'CircleClose' }
    ]
  },
  // 视频代理
  {
    path: '/videoSafe',
    meta: { titleKey: 'menu.videoSafe' },
    icon: 'VideoCamera',
    children: [
      { path: 'video_accessControl', meta: { titleKey: 'videoSafe.video_accessControl.title' }, icon: 'List' },
      { path: 'sipFilter', meta: { titleKey: 'videoSafe.sipFilter.title' }, icon: 'Filter' },
      { path: 'rtspFilter', meta: { titleKey: 'videoSafe.rtspFilter.title' }, icon: 'Filter' },
      { path: 'rtspOption', meta: { titleKey: 'videoSafe.rtspOption.title' }, icon: 'Setting' }
    ]
  },
  // 工控代理
  {
    path: '/opc',
    meta: { titleKey: 'menu.opc' },
    icon: 'Cpu',
    children: [
      { path: 'opc_accessControl', meta: { titleKey: 'opc.opc_accessControl.title' }, icon: 'List' },
      { path: 'modbus', meta: { titleKey: 'opc.modbus.title' }, icon: 'Connection' },
      { path: 'opcShow', meta: { titleKey: 'opc.opcShow.title' }, icon: 'Connection' },
      { path: 'iec104', meta: { titleKey: 'opc.iec104.title' }, icon: 'Connection' },
      { path: 'dnp3', meta: { titleKey: 'opc.dnp3.title' }, icon: 'Connection' },
      { path: 'bacnet', meta: { titleKey: 'opc.bacnet.title' }, icon: 'Connection' },
      { path: 's7', meta: { titleKey: 'opc.s7.title' }, icon: 'Connection' },
      { path: 'trdp', meta: { titleKey: 'opc.trdp.title' }, icon: 'Connection' },
      { path: 'opcdaOption', meta: { titleKey: 'opc.opcdaOption.title' }, icon: 'Setting' },
      { path: 'coap', meta: { titleKey: 'opc.coap.title' }, icon: 'Connection' },
      { path: 'cip', meta: { titleKey: 'opc.cip.title' }, icon: 'Connection' },
      { path: 'mms', meta: { titleKey: 'opc.mms.title' }, icon: 'Connection' },
      { path: 'fins', meta: { titleKey: 'opc.fins.title' }, icon: 'Connection' },
      { path: 'hartip', meta: { titleKey: 'opc.hartip.title' }, icon: 'Connection' },
      { path: 's_onebit', meta: { titleKey: 'opc.s_onebit.title' }, icon: 'Minus' }
    ]
  },
  // 地址转换
  {
    path: '/addressTranslation',
    meta: { titleKey: 'menu.addressTranslation' },
    icon: 'Sort',
    children: [
      { path: 'SourceNat', meta: { titleKey: 'addressTranslation.sourceNat.title' }, icon: 'Top' },
      { path: 'DestNat', meta: { titleKey: 'addressTranslation.destNat.title' }, icon: 'Bottom' }
    ]
  },
  // 数据同步
  {
    path: '/rulesManage',
    meta: { titleKey: 'menu.rulesManage' },
    icon: 'Refresh',
    children: [
      { path: 'filePathShow', meta: { titleKey: 'rulesManage.filePathShow.title' }, icon: 'Folder' },
      { path: 'databaseShow', meta: { titleKey: 'rulesManage.databaseShow.title' }, icon: 'Coin' }
    ]
  },
  // 安全规则
  {
    path: '/transparentRule',
    meta: { titleKey: 'menu.transparentRule' },
    icon: 'Document',
    children: [
      { path: 'rules', meta: { titleKey: 'transparentRule.rules.title' }, icon: 'List' },
      { path: 'ip', meta: { titleKey: 'transparentRule.ip.title' }, icon: 'Location' },
      { path: 'port', meta: { titleKey: 'transparentRule.port.title' }, icon: 'Grid' },
      { path: 'time', meta: { titleKey: 'transparentRule.time.title' }, icon: 'Timer' }
    ]
  },
  // 日志审计
  {
    path: '/audit',
    meta: { titleKey: 'menu.audit' },
    icon: 'Tickets',
    children: [
      { path: 'logConfig', meta: { titleKey: 'audit.logConfig.title' }, icon: 'Setting' },
      { path: 'gapLog', meta: { titleKey: 'audit.gapLog.title' }, icon: 'Document' },
      { path: 'logs', meta: { titleKey: 'audit.logs.title' }, icon: 'Document' },
      { path: 'fileSynLog', meta: { titleKey: 'audit.fileSynLog.title' }, icon: 'DocumentCopy' },
      { path: 'ferryloginLog', meta: { titleKey: 'audit.ferryloginLog.title' }, icon: 'User' },
      { path: 'ferrySendLog', meta: { titleKey: 'audit.ferrySendLog.title' }, icon: 'Upload' },
      { path: 'ferryReceiveLog', meta: { titleKey: 'audit.ferryReceiveLog.title' }, icon: 'Download' },
      { path: 'strategyLog', meta: { titleKey: 'audit.strategyLog.title' }, icon: 'List' },
      { path: 'sessionLog', meta: { titleKey: 'audit.sessionLog.title' }, icon: 'ChatLineSquare' },
      { path: 'atkLog', meta: { titleKey: 'audit.atkLog.title' }, icon: 'Warning' },
      { path: 'ifcfgStatusLog', meta: { titleKey: 'audit.ifcfgStatusLog.title' }, icon: 'Connection' }
    ]
  }
])

// Active menu
const activeMenu = computed(() => route.path)

// Breadcrumbs
const breadcrumbs = computed(() => {
  const items: { title: string; path: string }[] = []
  const matched = route.matched

  matched.forEach((item) => {
    if (item.meta?.titleKey) {
      items.push({
        title: t(item.meta.titleKey as string),
        path: item.path
      })
    }
  })

  return items
})

// Toggle sidebar collapse
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// Handle dropdown command
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/system/user')
      break
    case 'password':
      ElNotification({
        title: t('common.tip'),
        message: t('navbar.developing'),
        type: 'info',
        customClass: 'notification-info'
      })
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          t('navbar.logoutConfirm'),
          t('common.tip'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        await Logout()
        sessionStorage.clear()
        router.push('/login')
        ElNotification({
          title: t('common.success'),
          message: t('navbar.logoutSuccess'),
          type: 'success',
          customClass: 'notification-success'
        })
      } catch {
        // User cancelled
      }
      break
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #ecfeff 100%);
}

/* Sidebar - Blue Style */
.layout-sidebar{
  width: 220px;
  background: rgba(255, 255, 255, 0.85);
  border-right: 1px solid rgba(37, 99, 235, 0.1);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.layout-sidebar.is-collapse{
  width: 64px;
}

.sidebar-head{
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  background: rgba(37, 99, 235, 0.03);
}

.sidebar-logo{
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.sidebar-title{
  margin-left: 14px;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  color: #1e293b;
}

.sidebar-menu{
  flex: 1;
  border-right: none;
  overflow-y: auto;
  padding: 10px 0;
}

/* Custom scrollbar */
.sidebar-menu::-webkit-scrollbar{
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-thumb{
  background: rgba(37, 99, 235, 0.15);
  border-radius: 2px;
}

/* Menu styles - Blue */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title){
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #64748b;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item){
  font-size: 13px;
  font-weight: 500;
  padding-left: 52px !important;
  margin: 2px 12px;
  height: 42px;
  line-height: 42px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover){
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
}

.sidebar-menu :deep(.el-menu-item.is-active){
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.08) !important;
  font-weight: 700;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title){
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.08) !important;
  font-weight: 700;
}

.sidebar-menu :deep(.el-icon){
  font-size: 18px;
}

/* Main content area */
.layout-main{
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #ecfeff 100%);
}

/* Header - Blue Style */
.layout-header{
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
}

.header-left{
  display: flex;
  align-items: center;
  gap: 20px;
}

.hamburger{
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.3s ease;
}

.hamburger:hover{
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.header-breadcrumb :deep(.el-breadcrumb__inner){
  color: #64748b;
  font-weight: 500;
}

.header-breadcrumb :deep(.el-breadcrumb__inner:last-child){
  color: #2563eb;
}

.header-breadcrumb :deep(.el-breadcrumb__separator){
  color: #cbd5e1;
}

.header-right{
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Language Switcher */
.lang-switcher{
  margin-right: 8px;
}

.lang-btn{
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  color: #64748b;
  border: 1px solid transparent;
}

.lang-btn:hover{
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.15);
  color: #2563eb;
}

.lang-btn .el-icon:last-child{
  font-size: 12px;
  margin-left: 2px;
}

.lang-flag{
  margin-right: 8px;
}

.user-info{
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover{
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.15);
}

.user-avatar{
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  color: #fff;
  font-weight: 700;
}

.nick-name{
  color: #1e293b;
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info .el-icon{
  color: #3b82f6;
}

/* Content area */
.layout-content{
  flex: 1;
  padding: 24px;
  padding-bottom: 32px;
  overflow: auto;
  background: transparent;
}

/* Ensure child pages have proper spacing */
.layout-content > * {
  margin-bottom: 24px;
}

.layout-content > *:last-child {
  margin-bottom: 0;
}

/* Footer */
.layout-footer{
  height: 44px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

/* Transition */
.fade-enter-active,
.fade-leave-active{
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity: 0;
}

/* Dropdown menu blue theme */
:deep(.el-dropdown-menu){
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(37, 99, 235, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.el-dropdown-menu__item){
  color: #64748b;
}

:deep(.el-dropdown-menu__item:hover){
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}
</style>
