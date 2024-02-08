//表单形式上传单文件
const config = require('../config');
const multer = require('@koa/multer'); // 文件上传
const archiver = require('archiver'); // 文件压缩
const send = require('koa-send');
const fs = require('fs').promises;
const path = require('path');
const router = require('koa-router')();
const { sortByName, sortBySize, sortByModified } = require('./utils');
const upload = multer({
  storage: multer.diskStorage({
    destination: config.global.uploadPath,
  }),
  limits: undefined, // 不设置文件大小限制
});

// 文件上传
router.post('/upload', upload.single(config.single.fieldName), async (ctx, next) => {
  //save file
  const file = ctx.request.file;
  // 解决中文乱码问题
  const filename = Buffer.from(file.originalname, 'latin1').toString('utf-8');
  // 重命名(添加后缀)
  await fs.rename(file.path, `${file.destination}/${filename}`);
  const url = ctx.request.origin + `/upload/${filename}`;
  ctx.request.status = 200;
  ctx.body = {
    code: 200,
    msg: '文件上传成功',
    data: url,
  };
});

// 文件下载
router.get('/download', async (ctx) => {
  const fs = require('fs');
  let { filenameList: fList, path: reqPath } = ctx.request.query;
  fList = fList.slice(1, -1).split(',');
  reqPath = path.join(config.global.publicPath, reqPath);
  if (!fList || fList.length === 0) {
    ctx.body = { code: 200, msg: 'Filename list is required' };
    return;
  }
  const isDir = (filename) => fs.statSync(path.join(reqPath, filename)).isDirectory();
  // 是否需要进行压缩下载
  const shouldCompress = fList.length > 1 || fList.some((f) => isDir(f));
  if (shouldCompress) {
    const zipName = 'download.zip';
    // const zipStream = fs.createWriteStream(zipName);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 设置压缩级别
    });

    // 监听数据块生成事件，将数据块发送到响应中
    archive.on('data', (chunk) => {
      ctx.res.write(chunk);
    });

    // 监听压缩完成事件
    archive.on('end', () => {
      ctx.res.end();
    });

    // 将压缩器与响应流进行关联
    archive.pipe(ctx.res);

    // archive.pipe(zipStream);
    for (const filename of fList) {
      const filepath = path.join(reqPath, filename);
      isDir(filename)
        ? archive.directory(filepath, filename)
        : archive.file(filepath, { name: filename });
    }
    ctx.res.status = 200;
    ctx.res.setHeader('Connection', 'keep-alive'); // 保持链接一直在
    ctx.res.setHeader('Content-Type', 'application/octet-stream'); // 文件类型为文件流形式
    ctx.attachment(zipName);
    // 完成压缩并将压缩文件写入到响应中
    await archive.finalize();
    // send(ctx, zipName);
  }
  // 执行单个文件的下载
  else {
    ctx.attachment(fList[0]);
    ctx.res.status = 200;
    send(ctx, fList[0], { root: reqPath });
  }
});

// 文件读取
router.get('/fileList', async (ctx, next) => {
  const { path: reqPath, sortMode } = ctx.request.query;
  const filePath = path.join(config.global.publicPath, reqPath);
  // 读取路径下所有文件
  const files = await fs.readdir(filePath, {
    withFileTypes: true,
  });
  const fileList = [];
  // 获取具体信息
  for (const file of files) {
    const name = file.name;
    const isDir = file.isDirectory() ? true : false;
    const ext = path.extname(name).substring(1);
    try {
      const { ino, size, mtimeMs } = await fs.stat(path.join(filePath, name));
      fileList.push({ id: ino, name, isDir, ext, size, modified: mtimeMs });
    } catch {
      // 文件无权限或错误的文件路径
    }
  }
  // 排序
  switch (sortMode) {
    case 'name':
      fileList.sort((a, b) => sortByName(a, b));
      break;
    case 'size':
      fileList.sort((a, b) => sortBySize(a, b));
      break;
    case 'modified':
      fileList.sort((a, b) => sortByModified(a, b));
      break;
  }
  ctx.res.status = 200;
  ctx.body = { code: 200, data: { fileList } };
});

// 文件删除
router.delete('/delete', async (ctx, next) => {
  let { 'filenameList[]': fList, path: reqPath } = ctx.request.query;
  reqPath = path.join(config.global.publicPath, reqPath);
  fList = Array.isArray(fList) ? fList : [fList];
  if (!fList || fList.length === 0) {
    ctx.body = { code: 200, msg: 'Filename is required' };
    return;
  }
  for (const filename of fList) {
    const filePath = path.join(reqPath, filename);
    console.log(filePath);
    const isDir = await fs.stat(filePath).isDirectory;
    isDir ? await fs.rmdir(filePath) : await fs.unlink(filePath);
  }

  ctx.res.status = 200;
  ctx.body = { code: 200, msg: '文件删除成功' };
});

// 文件重命名
router.post('/delete1', async (ctx, next) => {
  console.log(ctx.request.body);
});
module.exports = router;
