const Koa = require('koa');
const logger = require('koa-logger');
const cors = require('@koa/cors'); // 跨域
const { bodyParser } = require('@koa/bodyparser'); // 请求正文解析
const static = require('koa-static'); // 静态文件服务
const etag = require('koa-etag'); // etag缓存
const compress = require('koa-compress'); // gzip压缩
const config = require('./config');

const app = new Koa();

app.use(logger());
app.use(cors({ maxAge: 7200 }));
app.use(bodyParser({ jsonLimit: '50mb' }));
// 协商缓存设置304
app.use(async (ctx, next) => {
  await next();
  if (ctx.fresh) {
    ctx.status = 304;
    ctx.body = null;
  }
});
app.use(etag()); // etag缓存
app.use(compress({ threshold: 2048, br: false }));
app.use(static(config.global.publicPath));
app.use(require('./controller/file').routes());

// 验证类型 => 验证大小 => 保存文件
// app.use(require('./controller/upload/single').routes());
// app.use(require('./controller/upload/base64').routes());
// app.use(require('./controller/upload/binary').routes());
// app.use(require('./controller/upload/multi').routes());
// app.use(require('./controller/download').routes());
// app.use(require('./controller/read').routes());

// 处理错误
app.on('error', (err, ctx) => {
  const { UploadError } = require('./controller/errorTypes');
  if (err instanceof UploadError) {
    ctx.body = {
      errCode: err.code,
      errMsg: err.message,
    };
    ctx.status = 500;
  }
  console.log(err);
});

app.listen(config.global.port, () => {
  console.log(`Server start on port ${config.global.port}`);
});
