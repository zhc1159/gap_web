import service from '../axios'

// 获取内网系统信息
export function GetSysInfo() {
  return service({
    headers: {
      'Api-Uid': 'supervise-sysInfo-get'
    },
    url: '/supervise/sysInfo/',
    method: 'get'
  })
}

// 获取内网运行时间
export function GetSysInfoUptime() {
  return service({
    headers: {
      'Api-Uid': 'supervise-sysInfo-uptime'
    },
    url: '/supervise/sysInfo_uptime/',
    method: 'post'
  })
}

// 获取外网系统信息
export function GetSysInfoOut() {
  return service({
    headers: {
      'Api-Uid': 'supervise-sysInfoOut-get'
    },
    url: '/supervise/sysInfo_out/',
    method: 'get'
  })
}

// 获取外网运行时间
export function GetSysInfoOutUptime() {
  return service({
    headers: {
      'Api-Uid': 'supervise-sysInfoOut-uptime'
    },
    url: '/supervise/sysInfo_out_uptime/',
    method: 'post'
  })
}
