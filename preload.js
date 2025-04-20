const { getConfig, updateConfig, resetConfig, watchConfig } = require('./preload/setting');
const { getLocalIPs, getPreferredIP, getNetworkInterfaces } = require('./preload/ip');
const { startServer, stopServer } = require('./preload/server');
const { getLatestLogs, clearLogs } = require('./preload/logger');

const _setImmediate = setImmediate;
process.once('loaded', function () {
  global.setImmediate = _setImmediate;
});

// 导出API给前端使用
window.customApis = {
  // 配置相关
  getConfig,
  updateConfig,
  resetConfig,
  watchConfig,

  // IP相关
  getLocalIPs,
  getPreferredIP,
  getNetworkInterfaces,

  // 服务相关
  startServer,
  stopServer,

  // 日志相关
  getLatestLogs,
  clearLogs,
};
