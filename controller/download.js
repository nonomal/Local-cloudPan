const config = require('../config');
const router = require('koa-router')();

const fs = require('fs');
const path = require('path');

router.get('/api/download', async (ctx) => {
  const filename = ctx.request.query.filename; // 获取文件名
  const filepath = path.join(config.global.uploadPath, filename); // 设置文件的完整路径
  ctx.attachment(filename); // 设置响应头，指定文件名和下载方式
  const file = await fs.promises.readFile(filepath);
  ctx.body = file;
});
module.exports = router;
