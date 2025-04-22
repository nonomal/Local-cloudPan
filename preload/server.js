const Koa = require('koa');
const path = require('path');
const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
const static = require('koa-static');
const etag = require('koa-etag');
const compress = require('koa-compress');
const { getConfig } = require('./setting');
const { router: authRouter } = require('./auth');
const fileRouter = require('./file');
const { log, createLoggerMiddleware } = require('./logger');

let server = null;
// 存储在线用户IP
const onlineUsers = new Set();

/**
 * 创建IP处理中间件
 * 处理IPv4-mapped IPv6地址并挂载到ctx
 */
function createIPMiddleware() {
  return async (ctx, next) => {
    // 处理IPv4-mapped IPv6地址
    ctx.clientIP = ctx.ip.replace(/^::ffff:/, '');
    await next();
  };
}

// 创建服务器实例
function createServer() {
  const app = new Koa();
  const config = getConfig();

  // 基本中间件
  app.use(createIPMiddleware()); // IP处理中间件放在最前面
  app.use(createLoggerMiddleware());
  app.use(cors({ maxAge: 7200 }));
  app.use(bodyParser({ jsonLimit: '50mb' }));
  app.use(async (ctx, next) => {
    await next();
    if (ctx.fresh) {
      ctx.status = 304;
      ctx.body = null;
    }
  }); // 304缓存控制
  app.use(etag());
  app.use(compress({ threshold: 2048, br: false })); // 压缩

  // 用户数限制中间件
  app.use(async (ctx, next) => {
    // 检查是否超过最大用户数
    if (!onlineUsers.has(ctx.clientIP) && onlineUsers.size >= config.maxConnections) {
      log('warn', `用户 ${ctx.clientIP} 连接被拒绝: 已达到最大用户数 (${config.maxConnections})`);

      ctx.status = 429; // Too Many Requests
      ctx.type = 'html';
      ctx.body = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>连接被拒绝</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .error-container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #e74c3c;
                margin-bottom: 1rem;
              }
              p {
                color: #666;
                margin: 0.5rem 0;
              }
              .count {
                font-size: 1.2em;
                color: #333;
                margin: 1rem 0;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>连接被拒绝</h1>
              <p>服务器已达到最大用户数限制</p>
              <div class="count">当前在线用户数: ${onlineUsers.size}/${config.maxConnections}</div>
              <p>请稍后再试</p>
            </div>
          </body>
        </html>
      `;
      return;
    }

    // 添加用户到在线列表
    onlineUsers.add(ctx.clientIP);

    try {
      await next();
    } finally {
      // 如果用户断开连接，从在线列表中移除
      // 这里使用一个简单的超时机制，如果用户30秒内没有新的请求，则认为已断开
      setTimeout(() => {
        if (onlineUsers.has(ctx.clientIP)) {
          onlineUsers.delete(ctx.clientIP);
        }
      }, 30000);
    }
  });

  // 静态文件
  app.use(static(path.resolve(__dirname, 'frontPage'), { index: './index.html', defer: true })); // 设置首页
  app.use(static(config.publicPath, { index: false }));

  // 路由（逻辑功能）
  app.use(fileRouter.routes()).use(fileRouter.allowedMethods()); // 文件路由
  app.use(authRouter.routes()).use(authRouter.allowedMethods()); // 认证路由

  // 错误处理
  app.on('error', (err, ctx) => {
    const { UploadError } = require('./errorTypes');
    if (err instanceof UploadError) {
      ctx.body = {
        errCode: err.code,
        errMsg: err.message,
      };
      ctx.status = 500;
      log('error', `Upload Error: ${err.message}`);
    }
    if (err.code === 'ECONNRESET' || ctx.url.startsWith('/download')) {
      log('warn', '下载中断');
    } else if (err.code === 'Parse Error' || ctx.url.startsWith('/upload')) {
      log('warn', '上传中断');
    } else {
      log('error', `Request error: ${err.message}`);
    }
  });

  return app;
}

// 启动服务器
function startServer() {
  if (server) {
    log('warn', '服务器已经在运行中');
    return false;
  }

  try {
    const app = createServer();
    const config = getConfig();
    server = app.listen(config.port, () => {
      log('info', `服务器已启动，端口: ${config.port}`);
    });
    return true;
  } catch (error) {
    log('error', `启动服务器失败: ${error.message}`);
    return false;
  }
}

// 停止服务器
function stopServer() {
  if (!server) {
    log('warn', '服务器未运行');
    return false;
  }

  try {
    server.close(() => {
      log('info', '服务器已停止');
      server = null;
    });
    return true;
  } catch (error) {
    log('error', `停止服务器失败: ${error.message}`);
    return false;
  }
}

// 导出接口
module.exports = {
  startServer,
  stopServer,
};
