const config = require('../config');
const router = require('koa-router')();

const fs = require('fs').promises;
const path = require('path');

router.get('/fileList', async (ctx, next) => {
  const reqPath = ctx.request.query.path || '';
  const filePath = path.join(config.global.publicPath, reqPath);
  const files = await fs.readdir(filePath, {
    withFileTypes: true,
  });
  const fileList = files.map((file) => {
    const name = file.name;
    const type = file.isDirectory() ? 'directory' : 'file';
    const ext = path.extname(name).substring(1);
    return { name, type, ext };
  });

  ctx.res.status = 200;
  ctx.body = fileList;
});

module.exports = router;
