//表单形式上传单文件
const config = require('../../config');
const multer = require('@koa/multer');
const upload = multer({
  dest: config.global.uploadPath,
  limits: {
    fileSize: config.single.sizeLimit,
  },
});

const router = require('koa-router')();

router.post(
  '/upload/single',
  upload.single(config.single.fieldName),
  async (ctx, next) => {
    //save file
    const { generateUrl } = require('../utils');
    const file = ctx.request.file;
    const filename = file.originalname;
    const fs = require('fs');
    // 重命名(添加后缀)
    await fs.promises.rename(file.path, `${file.destination}/${filename}`);
    const url = generateUrl(ctx.request, file.originalname);
    ctx.request.status = 200;
    ctx.body = {
      data: url,
    };
  }
);
module.exports = router;
