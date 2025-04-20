const { getConfig } = require('./setting');

// 日志级别定义
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 内存中存储最近的日志
const logBuffer = [];
const MAX_LOG_ENTRIES = 1000; // 最多保存1000条日志

/**
 * 添加日志到缓存
 * @param {Object} logEntry 日志条目
 */
function addToBuffer(logEntry) {
  logBuffer.push(logEntry);
  if (logBuffer.length > MAX_LOG_ENTRIES) {
    logBuffer.shift(); // 移除最旧的日志
  }
}

/**
 * 记录日志
 * @param {string} level 日志级别
 * @param {string} message 日志消息
 */
function log(level, message) {
  const config = getConfig();
  const configLevel = config.logLevel.toLowerCase();

  if (logLevels[level] <= logLevels[configLevel]) {
    const timestamp = new Date().toLocaleString();
    const logEntry = {
      id: Date.now() + Math.random(), // 添加唯一ID
      timestamp,
      level: level.toUpperCase(),
      message,
    };

    // 添加到缓存
    addToBuffer(logEntry);

    // 控制台输出
    // console.log(`[${timestamp}] [${logEntry.level}] ${message}`);
  }
}

/**
 * 获取所有日志
 * @returns {Array} 日志列表
 */
function getLogs() {
  return [...logBuffer];
}

/**
 * 获取最新日志
 * @param {number} lastId 最后一条日志的ID
 * @returns {Array} 新增的日志列表
 */
function getLatestLogs(lastId = 0) {
  if (lastId === 0) {
    return getLogs();
  }
  const index = logBuffer.findIndex((log) => log.id > lastId);
  if (index === -1) {
    return [];
  }
  return logBuffer.slice(index);
}

/**
 * 清空日志
 */
function clearLogs() {
  logBuffer.length = 0;
}

/**
 * 创建Koa日志中间件
 */
function createLoggerMiddleware() {
  return async (ctx, next) => {
    const start = Date.now();
    try {
      await next();
      const ms = Date.now() - start;
      // 解码 URL，如果解码失败则使用原始 URL
      let decodedUrl;
      try {
        decodedUrl = decodeURIComponent(ctx.url);
      } catch (e) {
        decodedUrl = ctx.url;
      }
      log('info', `${ctx.method} ${decodedUrl} - ${ms}ms`);
    } catch (error) {
      const ms = Date.now() - start;
      let decodedUrl;
      try {
        decodedUrl = decodeURIComponent(ctx.url);
      } catch (e) {
        decodedUrl = ctx.url;
      }
      log('error', `${ctx.method} ${decodedUrl} - ${ms}ms - ${error.message}`);
      throw error;
    }
  };
}

// 导出日志相关函数
module.exports = {
  log,
  getLogs,
  getLatestLogs,
  clearLogs,
  createLoggerMiddleware,
};
