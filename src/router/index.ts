import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/components/layout/layout.vue'

// Static routes (no auth required)
export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录', checkAuth: false },
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { title: '404', checkAuth: false },
    component: () => import('@/views/error/404.vue')
  }
]

// Dynamic routes (auth required)
export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    meta: { title: '首页', pTitle: '系统', checkAuth: true },
    redirect: '/supervise/sysInfo'
  },
  // 状态监视
  {
    path: '/supervise',
    meta: { title: '状态监视', pTitle: '状态监视', checkAuth: true },
    component: Layout,
    children: [
      { path: 'sysInfo', name: 'SysInfo', meta: { title: '主机信息', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/sysInfo.vue') },
      { path: 'gapIneth', name: 'GapIneth', meta: { title: '接口流量', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/gapIneth.vue') },
      { path: 'gapProtocol', name: 'GapProtocol', meta: { title: '应用流量', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/gapProtocol.vue') },
      { path: 'gapUser', name: 'GapUser', meta: { title: '用户流量', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/gapUser.vue') },
      { path: 'gapDip', name: 'GapDip', meta: { title: '服务器流量', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/gapDip.vue') },
      { path: 'gapFileSync', name: 'GapFileSync', meta: { title: '文件同步流量', pTitle: '状态监视', checkAuth: true }, component: () => import('@/views/supervise/gapFileSync.vue') }
    ]
  },
  // 系统配置
  {
    path: '/systemManage',
    meta: { title: '系统配置', pTitle: '系统配置', checkAuth: true },
    component: Layout,
    children: [
      { path: 'lanShow', name: 'LanShow', meta: { title: '网络接口', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/lanShow.vue') },
      { path: 'sysTime', name: 'SysTime', meta: { title: '系统时间', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/sysTime.vue') },
      { path: 'gapMode', name: 'GapMode', meta: { title: '模式切换', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/gapMode.vue') },
      { path: 'vlanShow', name: 'VlanShow', meta: { title: '虚网配置', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/vlanShow.vue') },
      { path: 'routeShow', name: 'RouteShow', meta: { title: '路由配置', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/routeShow.vue') },
      { path: 'softwareConf', name: 'SoftwareConf', meta: { title: 'SSH管理', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/softwareConf.vue') },
      { path: 'funcManager', name: 'FuncManager', meta: { title: 'SNMP', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/funcManager.vue') },
      { path: 'antiDos', name: 'AntiDos', meta: { title: '抗攻击', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/antiDos.vue') },
      { path: 'defenseSet', name: 'DefenseSet', meta: { title: '引擎设置', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/defenseSet.vue') },
      { path: 'defenseLog', name: 'DefenseLog', meta: { title: '告警日志', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/defenseLog.vue') },
      { path: 'defenseUpdate', name: 'DefenseUpdate', meta: { title: '特征库升级', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/defenseUpdate.vue') },
      { path: 'hotstandby', name: 'Hotstandby', meta: { title: '双机热备', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/hotstandby.vue') },
      { path: 'loadbalanceShow', name: 'LoadbalanceShow', meta: { title: '集群部署', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/loadbalanceShow.vue') },
      { path: 'lvsShow', name: 'LvsShow', meta: { title: '负载均衡', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/lvsShow.vue') },
      { path: 'linkPoly', name: 'LinkPoly', meta: { title: '链路聚合', pTitle: '系统配置', checkAuth: true }, component: () => import('@/views/systemManage/linkPoly.vue') }
    ]
  },
  // 用户管理
  {
    path: '/userManage',
    meta: { title: '用户管理', pTitle: '用户管理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'super_opcUser', name: 'SuperOpcUser', meta: { title: '普通用户', pTitle: '用户管理', checkAuth: true }, component: () => import('@/views/userManage/super_opcUser.vue') },
      { path: 'authFun', name: 'AuthFun', meta: { title: '认证功能模块管理', pTitle: '用户管理', checkAuth: true }, component: () => import('@/views/userManage/authFun.vue') }
    ]
  },
  // 系统维护
  {
    path: '/systemMaintenance',
    meta: { title: '系统维护', pTitle: '系统维护', checkAuth: true },
    component: Layout,
    children: [
      { path: 'licenseShow', name: 'LicenseShow', meta: { title: '软件授权', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/licenseShow.vue') },
      { path: 'loadProfileShow', name: 'LoadProfileShow', meta: { title: '历史存档', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/loadProfileShow.vue') },
      { path: 'ProfileBackup', name: 'ProfileBackup', meta: { title: '配置备份', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/ProfileBackup.vue') },
      { path: 'sysUpdate', name: 'SysUpdate', meta: { title: '系统升级', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/sysUpdate.vue') },
      { path: 'antiVirusUpdate', name: 'AntiVirusUpdate', meta: { title: '病毒库升级', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/antiVirusUpdate.vue') },
      { path: 'diagTool', name: 'DiagTool', meta: { title: '诊断工具', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/diag_tool.vue') },
      { path: 'oNAndOff', name: 'ONAndOff', meta: { title: '系统开关机', pTitle: '系统维护', checkAuth: true }, component: () => import('@/views/systemMaintenance/oNAndOff.vue') }
    ]
  },
  // 权限管理
  {
    path: '/authorityManage',
    meta: { title: '权限管理', pTitle: '权限管理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'showUser', name: 'ShowUser', meta: { title: '管理员', pTitle: '权限管理', checkAuth: true }, component: () => import('@/views/authorityManage/showUser.vue') },
      { path: 'userIpShow', name: 'UserIpShow', meta: { title: '管理机', pTitle: '权限管理', checkAuth: true }, component: () => import('@/views/authorityManage/userIpShow.vue') },
      { path: 'Otp', name: 'Otp', meta: { title: '动态口令', pTitle: '权限管理', checkAuth: true }, component: () => import('@/views/authorityManage/otp.vue') },
      { path: 'secureShow', name: 'SecureShow', meta: { title: '安全选项', pTitle: '权限管理', checkAuth: true }, component: () => import('@/views/authorityManage/secureShow.vue') }
    ]
  },
  // 对象管理
  {
    path: '/objectManage',
    meta: { title: '对象管理', pTitle: '对象管理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'ipGroup', name: 'IpGroup', meta: { title: 'IP组', pTitle: '对象管理', checkAuth: true }, component: () => import('@/views/objectManage/ipGroup.vue') },
      { path: 'timeGroup', name: 'TimeGroup', meta: { title: '时间组', pTitle: '对象管理', checkAuth: true }, component: () => import('@/views/objectManage/timeGroup.vue') }
    ]
  },
  // 通用代理
  {
    path: '/securityPolicy',
    meta: { title: '通用代理', pTitle: '通用代理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'general_accessControl', name: 'GeneralAccessControl', meta: { title: '代理规则', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/general_accessControl.vue') },
      { path: 's_ftp', name: 'SFtp', meta: { title: 'FTP安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_ftp.vue') },
      { path: 's_http', name: 'SHttp', meta: { title: 'HTTP安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_http.vue') },
      { path: 's_email', name: 'SEmail', meta: { title: '邮件安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_email.vue') },
      { path: 's_telnet', name: 'STelnet', meta: { title: 'Telnet安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_telnet.vue') },
      { path: 's_WebService', name: 'SWebService', meta: { title: 'WebService安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_WebService.vue') },
      { path: 's_httpProxy', name: 'SHttpProxy', meta: { title: 'Web代理安全', pTitle: '通用代理', checkAuth: true }, component: () => import('@/views/securityPolicy/s_httpProxy.vue') }
    ]
  },
  // 数据库安全
  {
    path: '/databaseSafe',
    meta: { title: '数据库安全', pTitle: '数据库安全', checkAuth: true },
    component: Layout,
    children: [
      { path: 'database_accessControl', name: 'DatabaseAccessControl', meta: { title: '代理规则', pTitle: '数据库安全', checkAuth: true }, component: () => import('@/views/databaseSafe/database_accessControl.vue') },
      { path: 's_db_sybase', name: 'SDbSybase', meta: { title: 'SYBASE安全', pTitle: '数据库安全', checkAuth: true }, component: () => import('@/views/databaseSafe/s_db_sybase.vue') },
      { path: 's_db_dameng', name: 'SDbDameng', meta: { title: 'DAMENG安全', pTitle: '数据库安全', checkAuth: true }, component: () => import('@/views/databaseSafe/s_db_dameng.vue') },
      { path: 's_db_oracle', name: 'SDbOracle', meta: { title: 'ORACLE安全', pTitle: '数据库安全', checkAuth: true }, component: () => import('@/views/databaseSafe/s_db_oracle.vue') }
    ]
  },
  // 文件传输
  {
    path: '/fileSafe',
    meta: { title: '文件传输', pTitle: '文件传输', checkAuth: true },
    component: Layout,
    children: [
      { path: 'file_accessControl', name: 'FileAccessControl', meta: { title: '代理规则', pTitle: '文件传输', checkAuth: true }, component: () => import('@/views/fileSafe/file_accessControl.vue') },
      { path: 's_stfp', name: 'SStfp', meta: { title: 'STFP安全', pTitle: '文件传输', checkAuth: true }, component: () => import('@/views/fileSafe/s_stfp.vue') },
      { path: 'file_approval', name: 'FileApproval', meta: { title: '等待审核', pTitle: '文件传输', checkAuth: true }, component: () => import('@/views/fileSafe/file_approval.vue') },
      { path: 'file_approval_success', name: 'FileApprovalSuccess', meta: { title: '审核已通过', pTitle: '文件传输', checkAuth: true }, component: () => import('@/views/fileSafe/file_approval_success.vue') },
      { path: 'file_approval_failed', name: 'FileApprovalFailed', meta: { title: '审核未通过', pTitle: '文件传输', checkAuth: true }, component: () => import('@/views/fileSafe/file_approval_failed.vue') }
    ]
  },
  // 视频代理
  {
    path: '/videoSafe',
    meta: { title: '视频代理', pTitle: '视频代理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'video_accessControl', name: 'VideoAccessControl', meta: { title: '代理规则', pTitle: '视频代理', checkAuth: true }, component: () => import('@/views/videoSafe/video_accessControl.vue') },
      { path: 'sipFilter', name: 'SipFilter', meta: { title: 'SIP安全', pTitle: '视频代理', checkAuth: true }, component: () => import('@/views/videoSafe/sipFilter.vue') },
      { path: 'rtspFilter', name: 'RtspFilter', meta: { title: 'RTSP安全', pTitle: '视频代理', checkAuth: true }, component: () => import('@/views/videoSafe/rtspFilter.vue') },
      { path: 'rtspOption', name: 'RtspOption', meta: { title: 'RTSP高级选项', pTitle: '视频代理', checkAuth: true }, component: () => import('@/views/videoSafe/rtspOption.vue') }
    ]
  },
  // 工控代理
  {
    path: '/opc',
    meta: { title: '工控代理', pTitle: '工控代理', checkAuth: true },
    component: Layout,
    children: [
      { path: 'opc_accessControl', name: 'OpcAccessControl', meta: { title: '代理规则', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/opc_accessControl.vue') },
      { path: 'modbus', name: 'Modbus', meta: { title: 'MODBUS安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/modbus.vue') },
      { path: 'opcShow', name: 'OpcShow', meta: { title: 'OPC安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/opcShow.vue') },
      { path: 'iec104', name: 'Iec104', meta: { title: 'IEC104', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/iec104.vue') },
      { path: 'dnp3', name: 'Dnp3', meta: { title: 'DNP3安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/dnp3.vue') },
      { path: 'bacnet', name: 'Bacnet', meta: { title: 'BACNET安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/bacnet.vue') },
      { path: 's7', name: 'S7', meta: { title: 'S7安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/s7.vue') },
      { path: 'trdp', name: 'Trdp', meta: { title: 'TRDP安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/trdp.vue') },
      { path: 'opcdaOption', name: 'OpcdaOption', meta: { title: 'OPCDA高级选项', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/opcdaOption.vue') },
      { path: 'coap', name: 'Coap', meta: { title: 'COAP安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/coap.vue') },
      { path: 'cip', name: 'Cip', meta: { title: 'CIP和ENIP安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/cip.vue') },
      { path: 'mms', name: 'Mms', meta: { title: 'MMS安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/mms.vue') },
      { path: 'fins', name: 'Fins', meta: { title: 'FINS安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/fins.vue') },
      { path: 'hartip', name: 'Hartip', meta: { title: 'HARTIP安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/hartip.vue') },
      { path: 's_onebit', name: 'SOnebit', meta: { title: '1Bit安全', pTitle: '工控代理', checkAuth: true }, component: () => import('@/views/opc/s_onebit.vue') }
    ]
  },
  // 地址转换
  {
    path: '/addressTranslation',
    meta: { title: '地址转换', pTitle: '地址转换', checkAuth: true },
    component: Layout,
    children: [
      { path: 'SourceNat', name: 'SourceNat', meta: { title: '源地址转换', pTitle: '地址转换', checkAuth: true }, component: () => import('@/views/addressTranslation/SourceNat.vue') },
      { path: 'DestNat', name: 'DestNat', meta: { title: '目的地址转换', pTitle: '地址转换', checkAuth: true }, component: () => import('@/views/addressTranslation/DestNat.vue') }
    ]
  },
  // 数据同步
  {
    path: '/rulesManage',
    meta: { title: '数据同步', pTitle: '数据同步', checkAuth: true },
    component: Layout,
    children: [
      { path: 'filePathShow', name: 'FilePathShow', meta: { title: '传输路径', pTitle: '数据同步', checkAuth: true }, component: () => import('@/views/rulesManage/filePathShow.vue') },
      { path: 'databaseShow', name: 'DatabaseShow', meta: { title: '数据库配置', pTitle: '数据同步', checkAuth: true }, component: () => import('@/views/rulesManage/databaseShow.vue') }
    ]
  },
  // 安全规则
  {
    path: '/transparentRule',
    meta: { title: '安全规则', pTitle: '安全规则', checkAuth: true },
    component: Layout,
    children: [
      { path: 'rules', name: 'TransparentRules', meta: { title: '规则管理', pTitle: '安全规则', checkAuth: true }, component: () => import('@/views/transparentRule/rules.vue') },
      { path: 'ip', name: 'TransparentIp', meta: { title: 'IP组', pTitle: '安全规则', checkAuth: true }, component: () => import('@/views/transparentRule/ip.vue') },
      { path: 'port', name: 'TransparentPort', meta: { title: '端口组', pTitle: '安全规则', checkAuth: true }, component: () => import('@/views/transparentRule/port.vue') },
      { path: 'time', name: 'TransparentTime', meta: { title: '时间组', pTitle: '安全规则', checkAuth: true }, component: () => import('@/views/transparentRule/time.vue') }
    ]
  },
  // 日志审计
  {
    path: '/audit',
    meta: { title: '日志审计', pTitle: '日志审计', checkAuth: true },
    component: Layout,
    children: [
      { path: 'logConfig', name: 'LogConfig', meta: { title: '日志配置', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/logConfig.vue') },
      { path: 'gapLog', name: 'GapLog', meta: { title: 'web日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/gapLog.vue') },
      { path: 'logs', name: 'Logs', meta: { title: '拦截日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/logs.vue') },
      { path: 'fileSynLog', name: 'FileSynLog', meta: { title: '文件同步日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/fileSynLog.vue') },
      { path: 'ferryloginLog', name: 'FerryloginLog', meta: { title: '登录日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/ferryloginLog.vue') },
      { path: 'ferrySendLog', name: 'FerrySendLog', meta: { title: '发送日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/ferrySendLog.vue') },
      { path: 'ferryReceiveLog', name: 'FerryReceiveLog', meta: { title: '接收日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/ferryReceiveLog.vue') },
      { path: 'strategyLog', name: 'StrategyLog', meta: { title: '策略日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/strategyLog.vue') },
      { path: 'sessionLog', name: 'SessionLog', meta: { title: '会话日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/sessionLog.vue') },
      { path: 'atkLog', name: 'AtkLog', meta: { title: '抗攻击日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/atkLog.vue') },
      { path: 'ifcfgStatusLog', name: 'IfcfgStatusLog', meta: { title: '网口状态日志', pTitle: '日志审计', checkAuth: true }, component: () => import('@/views/audit/ifcfgStatusLog.vue') }
    ]
  }
]

// Create router instance
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...staticRoutes, ...dynamicRoutes],
  scrollBehavior: () => ({ top: 0 })
})

// Route guard - check authentication
router.beforeEach((to, _from, next) => {
  // Set page title
  document.title = `${to.meta.title || 'GAP'} - GAP安全隔离网闸`

  // Check if route requires authentication
  if (to.meta.checkAuth !== false) {
    const token = sessionStorage.getItem('accessToken')
    if (!token) {
      // No token, redirect to login
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
