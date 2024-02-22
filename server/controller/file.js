//表单形式上传单文件
const config = require('../config');
const multer = require('@koa/multer'); // 文件上传
const archiver = require('archiver'); // 文件压缩
const send = require('koa-send');
const fs = require('fs-extra');
const path = require('path');
const router = require('koa-router')();
const { sortByName, sortBySize, sortByModified } = require('./utils');
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(config.global.publicPath, req.body.path);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // 解决中文乱码问题
      const filename = Buffer.from(file.originalname, 'latin1').toString('utf-8');
      cb(null, filename);
    },
  }),
  limits: undefined, // 不设置文件大小限制
});

// 文件上传
router.post('/upload', upload.single(config.single.fieldName), async (ctx) => {
  try {
    const file = ctx.request.file;
    const url = ctx.request.origin + `/${ctx.request.body.path}/${file.filename}`;
    ctx.request.status = 200;
    ctx.body = {
      code: 200,
      msg: '文件上传成功',
      data: url,
    };
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

// 文件下载
router.get('/download', async (ctx) => {
  const fs = require('fs');
  let { filenameList: fList, path: reqPath } = ctx.request.query;
  fList = fList.slice(1, -1).split(',');
  reqPath = path.join(config.global.publicPath, reqPath);

  // 文件名列表为空
  if (!fList || fList.length === 0) {
    ctx.body = { code: 200, msg: 'Filename list is required' };
    return;
  }
  const isDir = (filename) => fs.statSync(path.join(reqPath, filename)).isDirectory();
  // 是否需要进行压缩下载
  const shouldCompress = fList.length > 1 || fList.some((f) => isDir(f));
  if (shouldCompress) {
    const zipName = 'download.zip';
    const zipStream = fs.createWriteStream(zipName);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 设置压缩级别
    });

    // // 监听数据块生成事件，将数据块发送到响应中
    // archive.on('data', (chunk) => {
    //   ctx.res.write(chunk);
    // });

    // // 监听压缩完成事件
    // archive.on('end', () => {
    //   ctx.res.end();
    // });

    // // 将压缩器与响应流进行关联
    // archive.pipe(ctx.res);

    archive.pipe(zipStream);
    for (const filename of fList) {
      const filepath = path.join(reqPath, filename);
      isDir(filename)
        ? archive.directory(filepath, filename)
        : archive.file(filepath, { name: filename });
    }
    ctx.res.status = 200;
    // ctx.res.setHeader('Connection', 'keep-alive'); // 保持链接一直在
    // ctx.res.setHeader('Content-Type', 'application/octet-stream'); // 文件类型为文件流形式
    ctx.attachment(zipName);
    // 完成压缩并将压缩文件写入到响应中
    await archive.finalize();
    await send(ctx, zipName);
  }
  // 执行单个文件的下载
  else {
    ctx.attachment(fList[0]);
    ctx.res.status = 200;
    await send(ctx, fList[0], { root: reqPath });
  }
});

// 文件读取
router.get('/fileList', async (ctx) => {
  try {
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
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

// 文件删除
router.delete('/delete', async (ctx) => {
  try {
    let { 'filenameList[]': fList, path: reqPath } = ctx.request.query;
    reqPath = path.join(config.global.publicPath, reqPath);
    fList = Array.isArray(fList) ? fList : [fList];
    if (!fList || fList.length === 0) {
      ctx.body = { code: 201, msg: '请先选择文件！' };
      return;
    }
    for (const filename of fList) {
      const filePath = path.join(reqPath, filename);
      await fs.remove(filePath);
    }

    ctx.res.status = 200;
    ctx.body = { code: 200, msg: '文件删除成功' };
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

// 文件重命名
router.post('/rename', async (ctx) => {
  try {
    const { oldName, newName, path: reqPath } = ctx.request.body;
    const oldPath = path.join(config.global.publicPath, reqPath, oldName);
    const newPath = path.join(config.global.publicPath, reqPath, newName);
    await fs.rename(oldPath, newPath);
    ctx.res.status = 200;
    ctx.body = { code: 200, msg: '文件重命名成功' };
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

// 文件移动或复制
router.post('/fileMoveOrCopy', async (ctx) => {
  try {
    ctx.res.status = 200;
    const { fileList, destination, path: reqPath, dtype } = ctx.request.body;
    const operate = dtype === 'move' ? fs.move : fs.copy;
    const operateText = dtype === 'move' ? '移动' : '复制';
    for (const file of fileList) {
      const oldPath = path.join(config.global.publicPath, reqPath, file);
      const newPath = path.join(config.global.publicPath, destination, file);
      if (newPath.includes(oldPath)) {
        ctx.body = { code: 201, msg: `不能${operateText}到自身或子目录!` };
        return;
      }
      await operate(oldPath, newPath, { overwrite: true });
    }
    ctx.body = { code: 200, msg: `文件${operateText}成功` };
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

// 文件夹创建
router.post('/createDir', async (ctx) => {
  try {
    const { dirName, path: reqPath } = ctx.request.body;
    const dirPath = path.join(config.global.publicPath, reqPath, dirName);
    await fs.mkdir(dirPath, { recursive: true });
    ctx.res.status = 200;
    ctx.body = { code: 200, msg: '文件夹创建成功' };
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
  }
});

module.exports = router;
