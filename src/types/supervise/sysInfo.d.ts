// 系统信息类型定义

export interface SysInfoData {
  cpuMsg: string
  memMsg: string
  diskData: {
    total: number
    partitions: Array<{ name: string; value: number }>
  }
  networkData: {
    interfaces: Array<{ name: string; data: number[] }>
  }
  realtimeData: {
    cpu: number
    memory: number
  }
}

export interface SysInfoUptimeResponse {
  uptime: string
  licenseTime: string
  licenseStatus: string
}
