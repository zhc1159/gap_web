# GAP安全隔离网闸 - 菜单列表文档

> 根据 vue3-design 设计文档自动生成

---

## 菜单结构总览

```
GAP安全隔离网闸
├── 登录模块 (login)
├── 权限管理 (authorityManage)
├── 系统管理 (systemManage)
├── 系统维护 (systemMaintenance)
├── 审计日志 (audit)
├── 监控中心 (supervise)
├── 规则管理 (rulesManage)
│   ├── 访问控制 (access)
│   ├── 代理配置 (agent)
│   ├── 数据库 (database)
│   ├── 传输摆渡 (ferry)
│   ├── 文件审核 (fileApproval)
│   ├── 文件复制 (fileCopy)
│   ├── 对象管理 (object)
│   ├── 协议过滤 (protocol)
│   └── 安全策略 (securityPolicy)
├── 安全策略 (securityPolicy)
├── 地址转换 (addressTranslation)
├── 工业协议 (opc)
├── 透明规则 (transparentRule)
├── 视频安全 (videoSafe)
├── 对象管理 (objectManage)
├── 个人中心 (personal)
├── 上报配置 (fgwReportConfig)
└── IPC管理 (ipc)
```

---

## 一、登录模块 (login)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 登录页面 | Login | login.md |
| 2 | 客户端登录 | Client Login | clientLogin.md |
| 3 | 客户端管理 | Client | client.md |
| 4 | 修改密码 | Change Password | changePwd.md |
| 5 | 更新密码 | Update Password | updatePwd.md |

---

## 二、权限管理模块 (authorityManage)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 用户管理 | Users | users.md |
| 2 | 客户端管理 | Client | client.md |
| 3 | 域管理 | AD Domain | AdDomain.md |
| 4 | 域客户端 | AD Domain Client | AdDomainClient.md |
| 5 | 域用户 | AD Domain Users | AdDomainUsers.md |
| 6 | 认证功能 | Auth Function | AuthFun.md |
| 7 | OTP配置 | OTP | otp.md |
| 8 | 安全配置 | Secure Config | secureConf.md |
| 9 | 用户IP | Users IP | usersIp.md |
| 10 | 激活码 | Activate Code | activate_code.md |
| 11 | 初始化证书 | Init Certificate | init_cert.md |
| 12 | 初始化授权 | Init License | init_license.md |
| 13 | FIRS配置 | FIRS | FIRS.md |

---

## 三、系统管理模块 (systemManage)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 系统架构 | Common Architecture | common-architecture.md |
| 2 | 防御日志 | Defense Log | defenseLog-design.md |
| 3 | 防御设置 | Defense Set | defenseSet-design.md |
| 4 | 抗DoS设置 | Anti DoS | antiDos-design.md |
| 5 | 转换状态 | Conversion Status | CONVERSION_STATUS.md |

---

## 四、系统维护模块 (systemMaintenance)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 病毒库升级 | AntiVirus Update | 01-antiVirusUpdate-病毒库升级_vue3.md |
| 2 | 配置导入 | Config Import | 02-config_import-配置导入_vue3.md |
| 3 | 诊断工具 | Diagnostic Tool | 03-diagTool-诊断工具_vue3.md |
| 4 | 软件授权 | License Show | 04-licenseShow-软件授权_vue3.md |
| 5 | 配置存档 | Load Profile | 05-loadProfile-配置存档_vue3.md |
| 6 | 系统开关机 | On/Off | 06-oNAndOff-系统开关机_vue3.md |
| 7 | 配置备份 | Profile Backup | 07-ProfileBackup-配置备份_vue3.md |
| 8 | 系统升级 | System Update | 08-sysUpdate-系统升级_vue3.md |

---

## 五、审计日志模块 (audit)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 抗攻击日志 | Anti-Attack Log | 01-atkLog.md |
| 2 | 数据库同步日志 | Database Sync Log | 02-dbSyncLog.md |
| 3 | 文件摆渡登录日志 | File Ferry Login Log | 03-ferryloginLog.md |
| 4 | 文件摆渡接收日志 | File Ferry Receive Log | 04-ferryReceiveLog.md |
| 5 | 文件摆渡发送日志 | File Ferry Send Log | 05-ferrySendLog.md |
| 6 | 文件同步日志 | File Sync Log | 06-fileSynLog.md |
| 7 | Web日志 | Web Log | 07-gapLog.md |
| 8 | 网络接口状态日志 | Network Interface Status Log | 08-ifcfgStatusLog.md |
| 9 | 日志设置 | Log Configuration | 09-logConfig.md |
| 10 | 抗攻击日志(外网) | Anti-Attack Log External | 10-out_atkLog.md |
| 11 | 会话日志 | Session Log | 11-sessionLog.md |
| 12 | 策略日志 | Strategy Log | 12-strategyLog.md |

---

## 六、监控中心模块 (supervise)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 系统信息 | System Info | sysInfo_design.md |
| 2 | 系统信息2 | System Info 2 | sysInfo2_design.md |
| 3 | GAP DIP | GAP DIP | gapDip_design.md |
| 4 | GAP以太网 | GAP Ineth | gapIneth_design.md |
| 5 | GAP文件同步 | GAP File Sync | gapFileSync_design.md |
| 6 | GAP用户 | GAP User | gapUser_design.md |
| 7 | GAP协议 | GAP Protocol | gapProtocol_design.md |
| 8 | 路径检查 | Path Check | pathCheck_design.md |

---

## 七、规则管理模块 (rulesManage)

### 7.1 访问控制 (access)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | MAC地址管理 | MAC Address | access/mac.md |

### 7.2 代理配置 (agent)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 密钥管理 | Key | agent/key.md |
| 2 | 规则配置 | Rules | agent/rules.md |
| 3 | 视频代理 | Video Agent | agent/videoAgent.md |

### 7.3 数据库 (database)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 数据库策略展示 | Database Policy Show | database/databasePolicyShow.md |
| 2 | 数据库展示 | Database Show | database/databaseShow.md |

### 7.4 传输摆渡 (ferry)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 病毒过滤 | Antivirus | ferry/antivirus.md |
| 2 | 关键字过滤 | Key Filter | ferry/key.md |
| 3 | 着陆区配置 | Land | ferry/land.md |
| 4 | 路径配置 | Path Config | ferry/pathConf.md |
| 5 | 后缀过滤 | Suffix | ferry/suffix.md |

### 7.5 文件审核 (fileApproval)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 等待审核 | File Approval | fileApproval/file_approval.md |
| 2 | 审核通过 | Approval Success | fileApproval/file_approval_success.md |
| 3 | 审核未通过 | Approval Failed | fileApproval/file_approval_failed.md |

### 7.6 文件复制 (fileCopy)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 传输路径管理 | File Path | fileCopy/filePath.md |

### 7.7 对象管理 (object)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | IP组管理 | IP Group | object/ipGroup.md |
| 2 | 时间段管理 | Time Range | object/timeRange.md |

### 7.8 协议过滤 (protocol)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 邮件过滤 | Email | protocol/email.md |
| 2 | FTP协议过滤 | FTP | protocol/ftp.md |
| 3 | HTTP协议过滤 | HTTP | protocol/http.md |

### 7.9 安全策略 (securityPolicy)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 数据库策略(通用) | Database Security | s_db.md |
| 2 | 达梦数据库策略 | Dameng Database | s_db_dameng.md |
| 3 | Oracle数据库策略 | Oracle Database | s_db_oracle.md |
| 4 | Sybase数据库策略 | Sybase Database | s_db_sybase.md |
| 5 | FTP安全策略 | FTP Security | s_ftp.md |
| 6 | HTTP安全策略 | HTTP Security | s_http.md |
| 7 | Web代理安全策略 | HTTP Proxy Security | s_httpProxy.md |
| 8 | 邮件安全策略 | Mail Security | s_mail.md |
| 9 | 1Bit安全策略 | 1Bit Security | s_onebit.md |
| 10 | STFP安全策略 | STFP Security | s_stfp.md |

---

## 八、安全策略模块 (securityPolicy)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 访问控制 | Access Control | accessControl.md |
| 2 | 超级访问控制 | Super Access Control | super_accessControl.md |
| 3 | 数据库访问控制 | Database Access Control | database_accessControl.md |
| 4 | OPC访问控制 | OPC Access Control | opc_accessControl.md |
| 5 | 文件访问控制 | File Access Control | file_accessControl.md |
| 6 | 视频访问控制 | Video Access Control | video_accessControl.md |
| 7 | RTSP过滤 | RTSP Filter | rtspFilter.md |
| 8 | RTSP选项 | RTSP Option | rtspOption.md |
| 9 | SIP过滤 | SIP Filter | sipFilter.md |

---

## 九、地址转换模块 (addressTranslation)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 源地址转换 | Source NAT | SourceNat-vue3.md |
| 2 | 目的地址转换 | Destination NAT | DestNat-vue3.md |
| 3 | 内网源地址转换 | Internal Source NAT | inSourceNat-vue3.md |
| 4 | 内网目的地址转换 | Internal Destination NAT | inDestNat-vue3.md |
| 5 | 外网源地址转换 | External Source NAT | outSourceNat-vue3.md |
| 6 | 外网目的地址转换 | External Destination NAT | outDestNat-vue3.md |
| 7 | 外网NAT | External NAT | outNat-vue3.md |
| 8 | 转换IP组 | Translation IP Group | tranIpGroup-vue3.md |
| 9 | 转换端口组 | Translation Port Group | tranPortGroup-vue3.md |

---

## 十、工业协议模块 (opc)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 认证功能 | Auth Function | AuthFun.md |
| 2 | BACnet协议 | BACnet | bacnet.md |
| 3 | CIP协议 | CIP | cip.md |
| 4 | CoAP协议 | CoAP | coap.md |
| 5 | DNP3协议 | DNP3 | dnp3.md |
| 6 | EGD协议 | EGD | egd.md |
| 7 | FINS协议 | FINS | fins.md |
| 8 | HART-IP协议 | HART-IP | hartip.md |
| 9 | IEC104协议 | IEC104 | iec104.md |
| 10 | IP组 | IP Group | ipGroup.md |
| 11 | 映射模式 | Map Mode | mapMode.md |
| 12 | MMS协议 | MMS | mms.md |
| 13 | Modbus协议 | Modbus | modbus.md |
| 14 | Modbus设置 | Modbus Set | modbusset.md |
| 15 | Modbus隧道 | Modbus Tunnel | modbus_tunnel.md |
| 16 | OPC-DA选项 | OPC-DA Option | opcdaOption.md |
| 17 | OPC展示 | OPC Show | opcShow.md |
| 18 | OPC-UA协议 | OPC-UA | opcua.md |
| 19 | OPC用户 | OPC User | opcUser.md |
| 20 | S7协议 | S7 | s7.md |
| 21 | 超级OPC用户 | Super OPC User | super_opcUser.md |
| 22 | 时间组 | Time Group | timeGroup.md |
| 23 | TRDP协议 | TRDP | trdp.md |
| 24 | 用户组 | User Group | userGroup.md |

---

## 十一、透明规则模块 (transparentRule)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 透明规则 | Transparent Rules | transparentRules-vue3.md |
| 2 | 输入规则 | Input Rules | input_rules.md |
| 3 | IP管理 | IP | ip.md |
| 4 | 日志 | Log | log.md |
| 5 | 端口管理 | Port | port.md |
| 6 | 规则配置 | Rules | rules.md |
| 7 | 时间配置 | Time | time.md |

---

## 十二、视频安全模块 (videoSafe)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 映射模式 | Map Mode | mapMode_design.md |
| 2 | RTSP过滤 | RTSP Filter | rtspFilter_design.md |
| 3 | SIP过滤 | SIP Filter | sipFilter_design.md |

---

## 十三、对象管理模块 (objectManage)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 时间组 | Time Group | timeGroup_design-vue3.md |
| 2 | 时间范围 | Time Range | timeRange_design-vue3.md |

---

## 十四、个人中心模块 (personal)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 个人设置 | Personal | personal_design_vue3.md |

---

## 十五、上报配置模块 (fgwReportConfig)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | 采集配置 | Collection Config | collection_config_design_vue3.md |
| 2 | 采集设备 | Collection Device | collection_device_design_vue3.md |
| 3 | 企业信息 | Company Info | company_infor_design_vue3.md |
| 4 | 消费类别 | Consume Category | consume_cate_design_vue3.md |
| 5 | 消费信息 | Consume Info | consume_infor_design_vue3.md |
| 6 | 平台注册 | Platform Reg | platform_reg_design_vue3.md |
| 7 | 生产过程 | Process | pro_process_design_vue3.md |
| 8 | 生产单元 | Process Unit | pro_processUnit_design_vue3.md |
| 9 | 上传地址 | Upload Address | upload_addr_design_vue3.md |

---

## 十六、IPC管理模块 (ipc)

| 序号 | 页面名称 | 英文名称 | 文件路径 |
|------|----------|----------|----------|
| 1 | IPC应用 | IPC App | ipc_app_design.md |
| 2 | IPC授权 | IPC License | ipc_license_design.md |
| 3 | IPC插件 | IPC Plugin | ipc_plugin_design.md |
| 4 | IPC状态 | IPC Status | ipc_status_design_vue3.md |
| 5 | IPC版本 | IPC Version | ipc_version_design_vue3.md |

---

## 统计汇总

| 模块 | 页面数量 |
|------|----------|
| 登录模块 | 5 |
| 权限管理 | 13 |
| 系统管理 | 5 |
| 系统维护 | 8 |
| 审计日志 | 12 |
| 监控中心 | 8 |
| 规则管理 | 31 |
| 安全策略 | 9 |
| 地址转换 | 9 |
| 工业协议 | 24 |
| 透明规则 | 7 |
| 视频安全 | 3 |
| 对象管理 | 2 |
| 个人中心 | 1 |
| 上报配置 | 9 |
| IPC管理 | 5 |
| **总计** | **151** |

---

## 路由配置建议

```typescript
// src/router/index.ts
export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/system/user',
    children: [
      // 权限管理
      { path: 'authority/users', name: 'Users', component: () => import('@/views/authority/Users.vue'), meta: { title: '用户管理' } },
      { path: 'authority/client', name: 'Client', component: () => import('@/views/authority/Client.vue'), meta: { title: '客户端管理' } },
      { path: 'authority/domain', name: 'Domain', component: () => import('@/views/authority/Domain.vue'), meta: { title: '域管理' } },

      // 系统管理
      { path: 'system/defense', name: 'Defense', component: () => import('@/views/system/Defense.vue'), meta: { title: '防御设置' } },
      { path: 'system/antiDos', name: 'AntiDos', component: () => import('@/views/system/AntiDos.vue'), meta: { title: '抗DoS设置' } },

      // 系统维护
      { path: 'maintenance/antivirus', name: 'AntivirusUpdate', component: () => import('@/views/maintenance/AntivirusUpdate.vue'), meta: { title: '病毒库升级' } },
      { path: 'maintenance/backup', name: 'Backup', component: () => import('@/views/maintenance/Backup.vue'), meta: { title: '配置备份' } },
      { path: 'maintenance/upgrade', name: 'Upgrade', component: () => import('@/views/maintenance/Upgrade.vue'), meta: { title: '系统升级' } },

      // 审计日志
      { path: 'audit/atkLog', name: 'AtkLog', component: () => import('@/views/audit/AtkLog.vue'), meta: { title: '抗攻击日志' } },
      { path: 'audit/dbSyncLog', name: 'DbSyncLog', component: () => import('@/views/audit/DbSyncLog.vue'), meta: { title: '数据库同步日志' } },
      { path: 'audit/logConfig', name: 'LogConfig', component: () => import('@/views/audit/LogConfig.vue'), meta: { title: '日志设置' } },

      // 规则管理
      { path: 'rules/access', name: 'AccessControl', component: () => import('@/views/rules/Access.vue'), meta: { title: '访问控制' } },
      { path: 'rules/ferry', name: 'Ferry', component: () => import('@/views/rules/Ferry.vue'), meta: { title: '传输摆渡' } },
      { path: 'rules/fileApproval', name: 'FileApproval', component: () => import('@/views/rules/FileApproval.vue'), meta: { title: '文件审核' } },

      // 安全策略
      { path: 'policy/accessControl', name: 'PolicyAccessControl', component: () => import('@/views/policy/AccessControl.vue'), meta: { title: '访问控制' } },
      { path: 'policy/rtspFilter', name: 'RtspFilter', component: () => import('@/views/policy/RtspFilter.vue'), meta: { title: 'RTSP过滤' } },

      // 地址转换
      { path: 'nat/source', name: 'SourceNat', component: () => import('@/views/nat/SourceNat.vue'), meta: { title: '源地址转换' } },
      { path: 'nat/dest', name: 'DestNat', component: () => import('@/views/nat/DestNat.vue'), meta: { title: '目的地址转换' } },

      // 工业协议
      { path: 'opc/modbus', name: 'Modbus', component: () => import('@/views/opc/Modbus.vue'), meta: { title: 'Modbus协议' } },
      { path: 'opc/opcua', name: 'OpcUa', component: () => import('@/views/opc/OpcUa.vue'), meta: { title: 'OPC-UA协议' } },

      // 透明规则
      { path: 'transparent/rules', name: 'TransparentRules', component: () => import('@/views/transparent/Rules.vue'), meta: { title: '透明规则' } },

      // 监控中心
      { path: 'monitor/dashboard', name: 'Dashboard', component: () => import('@/views/monitor/Dashboard.vue'), meta: { title: '实时监控' } },
      { path: 'monitor/sysInfo', name: 'SysInfo', component: () => import('@/views/monitor/SysInfo.vue'), meta: { title: '系统信息' } },
    ]
  }
]
```

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-03-29 | 根据vue3-design设计文档生成初始版本 |

