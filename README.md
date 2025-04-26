## 项目介绍

通过浏览器页面来共享本地文件夹，对其进行网盘式的在线管理。

支持**列表**与**网格**两种查看模式

支持的操作

- 支持暗黑模式

- 按照名称、文件大小、修改日期排序
- 新建文件夹
- 刷新
- 文件的下载、复制、移动、删除与重命名
- 针对大量文件渲染场景的虚拟列表
- 文件与文件夹的上传，支持大文件分片、断点续传，上传的暂停与取消
- 提供图片、txt、pdf、markdown 及音视频等多种格式的在线文件预览
- ……

## 技术栈

前端：Vue3 + TS + Element-plus

后端：koa2

## 项目运行

运行前请先安装`nodejs`

`clone`项目到本地

```shell
git clone https://github.com/dcbestwords/Local-cloudPan.git
```

前端运行

```shell
cd admin
npm i
npm run dev
```

后端运行

> 可以通过`server/config.js`配置后台服务的端口及代理的文件夹

```shell
cd server
npm i
npm start
```

为了确保运行正确，请先运行后端服务。再运行前端，之后访问 http://localhost:8888

## UI 演示

主界面

![image-20241020182533857](./docs/image-20241020182533857.png)

两种查看模式

![1729419111093](./docs/1729419111093.png)

右键菜单

![1729420097651](./docs/1729420097651.png)

复制与移动界面

![image-20241020182631815](./docs/image-20241020182631815.png)

传输列表

![image-20241020183146792](./docs/image-20241020183146792.png)

## 下载

通过本页面[releases](https://github.com/dcbestwords/Local-cloudPan/releases)选项卡下载

