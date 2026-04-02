export default {
  common: {
    system: 'Management',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    loading: 'Loading...',
    success: 'Success',
    failed: 'Failed',
    tip: 'Tips',
    warning: 'Warning',
    all: 'All',
    pleaseSelect: 'Please select',
    pleaseInput: 'Please input'
  },
  login: {
    title: 'GAP Security Gateway',
    subtitle: 'Security Isolation Gateway',
    passwordLogin: 'Password',
    certificateLogin: 'Certificate',
    fingerprintLogin: 'Fingerprint',
    username: 'Username',
    usernamePlaceholder: 'Please enter username',
    usernameMinLength: 'Username must be at least 3 characters',
    password: 'Password',
    passwordPlaceholder: 'Please enter password',
    passwordMinLength: 'Password must be at least 6 characters',
    rememberMe: 'Remember me',
    login: 'LOGIN',
    loginSuccess: 'Login successful',
    privacyAgreement: 'I have read and agree to',
    privacyPolicy: 'Privacy Policy',
    pleaseAgreePrivacy: 'Please read and agree to the Privacy Policy first',
    firstLoginHint: 'First login please use admin account',
    adminAccount: 'admin / admin123'
  },
  privacy: {
    title: 'Privacy Policy',
    confirm: 'I Agree',
    section1Title: '1. Information Collection',
    section1Content: 'We collect your account information (username, password) only for authentication and system access control. We do not collect, store or share any other personal information.',
    section2Title: '2. Information Usage',
    section2Content: 'Your login information is used for the following purposes:',
    section2Item1: 'Verify your identity and authorize system access',
    section2Item2: 'Record system operation logs for security audit',
    section2Item3: 'Ensure secure system operation',
    section3Title: '3. Information Security',
    section3Content: 'We adopt industry-standard security measures to protect your information, including but not limited to encrypted data transmission, access control, security audit and other technical means.',
    section4Title: '4. Information Retention',
    section4Content: 'Your account information will be retained during your use of the system. To delete your account, please contact the system administrator.',
    section5Title: '5. Commitment Statement',
    section5Content: 'This system is committed to strictly comply with relevant laws and regulations, protect user privacy, and will not use your information for any unauthorized purposes.'
  },
  navbar: {
    profile: 'Profile',
    changePassword: 'Change Password',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutSuccess: 'Logged out',
    developing: 'Feature under development'
  },
  menu: {
    system: 'System',
    userManage: 'User Management',
    roleManage: 'Role Management',
    menuManage: 'Menu Management',
    logManage: 'Log Management',
    policy: 'Policy',
    firewallPolicy: 'Firewall Policy',
    auditPolicy: 'Audit Policy',
    audit: 'Log Audit',
    operationLog: 'Operation Log',
    securityLog: 'Security Log',
    monitor: 'Monitor',
    realtimeMonitor: 'Real-time Monitor',
    trafficStats: 'Traffic Statistics',
    authorityManage: 'Authority Management',
    objectManage: 'Object Management',
    securityPolicy: 'General Proxy',
    databaseSafe: 'Database Security',
    fileSafe: 'File Transfer',
    videoSafe: 'Video Proxy',
    opc: 'Industrial Proxy',
    addressTranslation: 'Address Translation',
    rulesManage: 'Data Sync',
    transparentRule: 'Security Rules',
    supervise: 'Status Monitor',
    systemManage: 'System Configuration',
    systemMaintenance: 'System Maintenance'
  },
  user: {
    title: 'User Management',
    addUser: 'Add User',
    editUser: 'Edit User',
    nickname: 'Nickname',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    createTime: 'Create Time',
    resetPassword: 'Reset Password',
    resetPasswordConfirm: 'Reset password for user "{name}"?',
    resetPasswordSuccess: 'Password has been reset to: 123456',
    deleteConfirm: 'Delete user "{name}"?',
    deleteSuccess: 'Deleted successfully',
    addDeveloping: 'Add user feature is under development',
    editDeveloping: 'Edit user feature is under development'
  },
  firewall: { title: 'Firewall Policy', addPolicy: 'Add Policy', addDeveloping: 'Add policy feature is under development', emptyDesc: 'Firewall Policy Management' },
  role: { title: 'Role Management', emptyDesc: 'Role Management Module' },
  menuManage: { title: 'Menu Management', emptyDesc: 'Menu Management Module' },
  logManage: { title: 'Log Management', emptyDesc: 'Log Management Module' },
  operation: { title: 'Operation Log', emptyDesc: 'Operation Log Module' },
  security: { title: 'Security Log', emptyDesc: 'Security Log Module' },
  dashboard: { title: 'Real-time Monitor', emptyDesc: 'Real-time Monitor Module' },
  traffic: { title: 'Traffic Statistics', emptyDesc: 'Traffic Statistics Module' },
  error404: { title: 'Page Not Found', description: 'The page you visited does not exist', backHome: 'Back to Home' },

  audit: {
    gapLog: { title: 'Web Log', emptyDesc: 'Web Log Module' },
    fileSynLog: { title: 'File Sync Log', emptyDesc: 'File Sync Log Module' },
    ferryloginLog: { title: 'Login Log', emptyDesc: 'Login Log Module' },
    ferrySendLog: { title: 'Send Log', emptyDesc: 'Send Log Module' },
    ferryReceiveLog: { title: 'Receive Log', emptyDesc: 'Receive Log Module' },
    strategyLog: { title: 'Strategy Log', emptyDesc: 'Strategy Log Module' },
    sessionLog: { title: 'Session Log', emptyDesc: 'Session Log Module' },
    atkLog: { title: 'Anti-Attack Log', emptyDesc: 'Anti-Attack Log Module' },
    ifcfgStatusLog: { title: 'Interface Status Log', emptyDesc: 'Interface Status Log Module' },
    logConfig: { title: 'Log Configuration', emptyDesc: 'Log Configuration Module' },
    logs: { title: 'Intercept Log', emptyDesc: 'Intercept Log Module' },
    operation: { title: 'Operation Log', emptyDesc: 'Operation Log Module' },
    security: { title: 'Security Log', emptyDesc: 'Security Log Module' }
  },

  authorityManage: {
    showUser: { title: 'Administrator', emptyDesc: 'Administrator Module' },
    userIpShow: { title: 'Management Host', emptyDesc: 'Management Host Module' },
    otp: { title: 'Dynamic Password', emptyDesc: 'Dynamic Password Module' },
    secureShow: { title: 'Security Options', emptyDesc: 'Security Options Module' }
  },

  userManage: {
    super_opcUser: { title: 'Normal User', emptyDesc: 'Normal User Module' },
    authFun: { title: 'Auth Function Management', emptyDesc: 'Auth Function Management Module' }
  },

  objectManage: {
    ipGroup: { title: 'IP Group', emptyDesc: 'IP Group Module' },
    timeGroup: { title: 'Time Group', emptyDesc: 'Time Group Module' }
  },

  securityPolicy: {
    general_accessControl: { title: 'Proxy Rules', emptyDesc: 'Proxy Rules Module' },
    s_ftp: { title: 'FTP Security', emptyDesc: 'FTP Security Module' },
    s_http: { title: 'HTTP Security', emptyDesc: 'HTTP Security Module' },
    s_email: { title: 'Email Security', emptyDesc: 'Email Security Module' },
    s_telnet: { title: 'Telnet Security', emptyDesc: 'Telnet Security Module' },
    s_WebService: { title: 'WebService Security', emptyDesc: 'WebService Security Module' },
    s_httpProxy: { title: 'Web Proxy Security', emptyDesc: 'Web Proxy Security Module' }
  },

  databaseSafe: {
    database_accessControl: { title: 'Proxy Rules', emptyDesc: 'Proxy Rules Module' },
    s_db_sybase: { title: 'SYBASE Security', emptyDesc: 'SYBASE Security Module' },
    s_db_dameng: { title: 'DAMENG Security', emptyDesc: 'DAMENG Security Module' },
    s_db_oracle: { title: 'ORACLE Security', emptyDesc: 'ORACLE Security Module' }
  },

  fileSafe: {
    file_accessControl: { title: 'Proxy Rules', emptyDesc: 'Proxy Rules Module' },
    s_stfp: { title: 'STFP Security', emptyDesc: 'STFP Security Module' },
    file_approval: { title: 'Pending Approval', emptyDesc: 'Pending Approval Module' },
    file_approval_success: { title: 'Approved', emptyDesc: 'Approved Module' },
    file_approval_failed: { title: 'Rejected', emptyDesc: 'Rejected Module' }
  },

  videoSafe: {
    video_accessControl: { title: 'Proxy Rules', emptyDesc: 'Proxy Rules Module' },
    sipFilter: { title: 'SIP Security', emptyDesc: 'SIP Security Module' },
    rtspFilter: { title: 'RTSP Security', emptyDesc: 'RTSP Security Module' },
    rtspOption: { title: 'RTSP Options', emptyDesc: 'RTSP Options Module' }
  },

  opc: {
    opc_accessControl: { title: 'Proxy Rules', emptyDesc: 'Proxy Rules Module' },
    modbus: { title: 'MODBUS Security', emptyDesc: 'MODBUS Security Module' },
    opcShow: { title: 'OPC Security', emptyDesc: 'OPC Security Module' },
    iec104: { title: 'IEC104', emptyDesc: 'IEC104 Module' },
    dnp3: { title: 'DNP3 Security', emptyDesc: 'DNP3 Security Module' },
    bacnet: { title: 'BACNET Security', emptyDesc: 'BACNET Security Module' },
    s7: { title: 'S7 Security', emptyDesc: 'S7 Security Module' },
    trdp: { title: 'TRDP Security', emptyDesc: 'TRDP Security Module' },
    opcdaOption: { title: 'OPCDA Options', emptyDesc: 'OPCDA Options Module' },
    coap: { title: 'COAP Security', emptyDesc: 'COAP Security Module' },
    cip: { title: 'CIP/ENIP Security', emptyDesc: 'CIP/ENIP Security Module' },
    mms: { title: 'MMS Security', emptyDesc: 'MMS Security Module' },
    fins: { title: 'FINS Security', emptyDesc: 'FINS Security Module' },
    hartip: { title: 'HARTIP Security', emptyDesc: 'HARTIP Security Module' },
    s_onebit: { title: '1Bit Security', emptyDesc: '1Bit Security Module' }
  },

  addressTranslation: {
    sourceNat: { title: 'Source NAT', emptyDesc: 'Source NAT Module' },
    destNat: { title: 'Destination NAT', emptyDesc: 'Destination NAT Module' }
  },

  rulesManage: {
    filePathShow: { title: 'Transfer Path', emptyDesc: 'Transfer Path Module' },
    databaseShow: { title: 'Database Configuration', emptyDesc: 'Database Configuration Module' }
  },

  transparentRule: {
    rules: { title: 'Rules Management', emptyDesc: 'Rules Management Module' },
    ip: { title: 'IP Group', emptyDesc: 'IP Group Module' },
    port: { title: 'Port Group', emptyDesc: 'Port Group Module' },
    time: { title: 'Time Group', emptyDesc: 'Time Group Module' }
  },

  supervise: {
    sysInfo: {
      title: 'Host Information',
      emptyDesc: 'Host Information Module',
      innerNet: 'Inner Network',
      outerNet: 'Outer Network',
      cpuUsage: 'CPU Usage',
      memUsage: 'Memory Usage',
      systemInfo: 'System Info',
      cpuInfo: 'CPU Info',
      memInfo: 'Memory Info',
      runTime: 'Run Time',
      licenseStatus: 'License Status',
      diskUsage: 'Disk Usage',
      total: 'Total',
      networkSpeed: 'Network Speed'
    },
    gapIneth: {
      title: 'Interface Traffic',
      emptyDesc: 'Interface Traffic Module',
      innerNet: 'Inner Network',
      outerNet: 'Outer Network',
      timeRange: 'Time Range',
      '10min': '10 Minutes',
      '1hour': '1 Hour',
      '1day': '1 Day',
      '1week': '1 Week',
      '1month': '1 Month',
      trafficTrend: 'Traffic Trend',
      interfaceName: 'Interface Name',
      sendTraffic: 'Send Traffic',
      receiveTraffic: 'Receive Traffic',
      totalTraffic: 'Total Traffic',
      currentRate: 'Current Rate'
    },
    gapProtocol: {
      title: 'Application Traffic',
      emptyDesc: 'Application Traffic Module',
      innerNet: 'Inner Network',
      outerNet: 'Outer Network',
      timeRange: 'Time Range',
      '10min': '10 Minutes',
      '1hour': '1 Hour',
      '1day': '1 Day',
      '1week': '1 Week',
      '1month': '1 Month',
      trafficTrend: 'Traffic Trend',
      appName: 'Application',
      sendTraffic: 'Send Traffic',
      receiveTraffic: 'Receive Traffic',
      totalTraffic: 'Total Traffic',
      inRate: 'In Rate',
      outRate: 'Out Rate',
      protocolDistribution: 'Protocol Distribution'
    },
    gapUser: { title: 'User Traffic', emptyDesc: 'User Traffic Module' },
    gapDip: { title: 'Server Traffic', emptyDesc: 'Server Traffic Module' },
    gapFileSync: { title: 'File Sync Traffic', emptyDesc: 'File Sync Traffic Module' }
  },

  systemManage: {
    lanShow: { title: 'Network Interface', emptyDesc: 'Network Interface Module' },
    sysTime: { title: 'System Time', emptyDesc: 'System Time Module' },
    gapMode: { title: 'Mode Switch', emptyDesc: 'Mode Switch Module' },
    vlanShow: { title: 'VLAN Configuration', emptyDesc: 'VLAN Configuration Module' },
    routeShow: { title: 'Route Configuration', emptyDesc: 'Route Configuration Module' },
    softwareConf: { title: 'SSH Management', emptyDesc: 'SSH Management Module' },
    funcManager: { title: 'SNMP', emptyDesc: 'SNMP Module' },
    antiDos: { title: 'Anti-Attack', emptyDesc: 'Anti-Attack Module' },
    defenseSet: { title: 'Engine Settings', emptyDesc: 'Engine Settings Module' },
    defenseLog: { title: 'Alert Log', emptyDesc: 'Alert Log Module' },
    defenseUpdate: { title: 'Signature Update', emptyDesc: 'Signature Update Module' },
    hotstandby: { title: 'Hot Standby', emptyDesc: 'Hot Standby Module' },
    loadbalanceShow: { title: 'Cluster Deployment', emptyDesc: 'Cluster Deployment Module' },
    lvsShow: { title: 'Load Balance', emptyDesc: 'Load Balance Module' },
    linkPoly: { title: 'Link Aggregation', emptyDesc: 'Link Aggregation Module' }
  },

  systemMaintenance: {
    licenseShow: { title: 'Software License', emptyDesc: 'Software License Module' },
    loadProfileShow: { title: 'History Archive', emptyDesc: 'History Archive Module' },
    profileBackup: { title: 'Configuration Backup', emptyDesc: 'Configuration Backup Module' },
    sysUpdate: { title: 'System Upgrade', emptyDesc: 'System Upgrade Module' },
    antiVirusUpdate: { title: 'Virus Database Upgrade', emptyDesc: 'Virus Database Upgrade Module' },
    diagTool: { title: 'Diagnostic Tool', emptyDesc: 'Diagnostic Tool Module' },
    onOff: { title: 'System Power', emptyDesc: 'System Power Module' }
  }
}
