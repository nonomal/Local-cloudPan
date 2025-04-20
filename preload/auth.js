const Router = require('@koa/router');
const crypto = require('crypto');
const { getConfig } = require('./setting');
const { log } = require('./logger');

// Token 存储，用于保存有效的认证 token
const tokenStore = new Set();

// 生成一个简单的 token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// 验证 token 是否有效
const verifyToken = (token) => tokenStore.has(token);

// 创建认证相关的路由
const router = new Router({ prefix: '/api' });

// 验证密码
router.post('/auth/verify', async (ctx) => {
  const { password } = ctx.request.body;
  const config = getConfig();

  // 如果允许匿名访问或者密码正确，直接通过
  if (config.allowAnonymous || password === config.accessPassword) {
    const token = generateToken();
    tokenStore.add(token);
    ctx.body = {
      success: true,
      token,
    };
    return;
  } else {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '访问密码错误',
    };
  }
});

// 检查认证状态
router.get('/auth/check', async (ctx) => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { success: false, message: '未提供认证信息' };
    return;
  }

  const token = authHeader.substring(7);
  if (!verifyToken(token)) {
    ctx.status = 401;
    ctx.body = { success: false, message: '认证已过期或无效' };
    return;
  }

  ctx.body = { success: true };
});

// 获取配置（仅返回前端需要的部分）
router.get('/config', async (ctx) => {
  const config = getConfig();

  // 只返回前端需要的配置，避免敏感信息泄露
  ctx.body = {
    allowAnonymous: config.allowAnonymous,
  };
});

module.exports = {
  router,
  verifyToken, // 导出供其他模块使用
};
