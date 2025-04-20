/**
 * 默认配置
 */
const defaultConfig = {
  port: 8080,
  publicPath: 'D://',
  maxConnections: 10,
  allowAnonymous: true, // 默认允许匿名访问
  accessPassword: '', // 访问密码
};

/**
 * 配置键名
 */
const CONFIG_KEY = 'disk-share-config';

/**
 * 获取配置
 * @returns {Object} 配置对象
 */
function getConfig() {
  const config = utools.dbStorage.getItem(CONFIG_KEY);
  if (!config) {
    // 如果没有配置，则使用默认配置并保存
    utools.dbStorage.setItem(CONFIG_KEY, defaultConfig);
    return defaultConfig;
  }
  return { ...defaultConfig, ...config };
}

/**
 * 验证配置
 * @param {Object} config - 配置对象
 * @returns {Object} 包含验证结果和错误信息的对象
 */
function validateConfig(config) {
  // 验证端口号
  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    return {
      valid: false,
      error: '端口号必须是1-65535之间的数字',
    };
  }

  // 验证最大连接数
  if (typeof config.maxConnections !== 'number' || config.maxConnections < 1) {
    return {
      valid: false,
      error: '最大连接数必须是大于0的数字',
    };
  }

  // 验证访问密码
  if (!config.allowAnonymous && typeof config.accessPassword !== 'string') {
    return {
      valid: false,
      error: '禁用匿名访问时必须设置访问密码',
    };
  }

  // 验证访问密码长度（当不允许匿名访问时）
  if (!config.allowAnonymous && config.accessPassword.length < 1) {
    return {
      valid: false,
      error: '访问密码不能为空',
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * 更新配置
 * @param {Object} newConfig - 新的配置对象
 * @returns {Object} 包含更新结果和错误信息的对象
 */
function updateConfig(newConfig) {
  try {
    const currentConfig = getConfig();
    const mergedConfig = {
      ...currentConfig,
      ...newConfig,
    };

    // 验证配置
    const validationResult = validateConfig(mergedConfig);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
      };
    }

    // 保存配置
    utools.dbStorage.setItem(CONFIG_KEY, mergedConfig);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: '保存配置时发生错误：' + error.message,
    };
  }
}

/**
 * 重置配置
 * @returns {boolean} 是否重置成功
 */
function resetConfig() {
  try {
    utools.dbStorage.setItem(CONFIG_KEY, defaultConfig);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 监听配置变化
 * @param {Function} callback - 配置变化时的回调函数
 * @returns {Function} 取消监听的函数
 */
function watchConfig(callback) {
  const watcher = () => {
    const config = getConfig();
    callback(config);
  };

  // 这里可以根据需要实现配置变化的监听机制
  // 由于 uTools 没有提供直接的配置变化监听，我们可以在每次更新配置时手动触发回调

  return () => {
    // 返回取消监听的函数
  };
}

// 导出配置管理相关函数
module.exports = {
  getConfig,
  updateConfig,
  resetConfig,
  watchConfig,
  defaultConfig,
};
