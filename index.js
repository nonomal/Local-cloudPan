const Koa = require('koa');
const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
// const router = require('./router.js');
const static = require('koa-static');
const config = require('./config');

const app = new Koa();

// 添加跨域支持
app.use(cors());

// 添加请求正文解析中间件
app.use(bodyParser({ jsonLimit: '50mb' }));

// 静态文件服务
app.use(static(config.global.publicPath));

// 验证类型 => 验证大小 => 保存文件
// app.use(require('./controller/upload/single').routes());
// app.use(require('./controller/upload/base64').routes());
// app.use(require('./controller/upload/binary').routes());
// app.use(require('./controller/upload/multi').routes());
// app.use(require('./controller/download').routes());
// app.use(require('./controller/read').routes());
app.use(require('./controller/file').routes());

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
