const Koa = require('koa');
const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
const static = require('koa-static');
const multer = require('@koa/multer');
const Router = require('@koa/router');

const app = new Koa();
app.use(cors());
app.use(bodyParser({ jsonLimit: '50mb' }));
app.use(static('F://'));

const router = new Router();
const upload = multer({
  dest: 'F://新建文件夹',
  limits: undefined,
});
router.post('/upload', upload.single('file'), async (ctx) => {
  try {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      msg: '文件上传成功',
    };
  } catch (err) {
    console.log('upload error:', err);
    ctx.status = 500;
  }
});

app.use(router.routes());
app.on('error', (err) => console.error('Request error:', err));
app.listen(9528, () => console.log('Server start on port 9528'));
