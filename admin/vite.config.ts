import path from 'path';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { analyzer } from 'vite-bundle-analyzer';

import { viteMockServe } from 'vite-plugin-mock';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // let env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      // css预处理器
      preprocessorOptions: {
        scss: {
          // 用于为每个样式内容注入额外代码
          additionalData: `@use "@/styles/element/index.scss" as *;`,
        },
      },
    },
    plugins: [
      vue(),
      mode === 'analyze' ? analyzer() : undefined,
      // 自动导入js、ts
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      // 自动导入组件
      Components({
        // ui库解析器
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
          IconsResolver(),
        ],
        dts: path.resolve('./src', 'typings', 'components.d.ts'),
      }),
      Icons({
        autoInstall: true,
      }),
      // mock配置
      viteMockServe({
        mockPath: './mock',
        localEnabled: command === 'serve' && mode === 'mock',
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 8888,
      proxy: {
        '/api': {
          // 获取数据的服务器地址设置
          target: 'http://127.0.0.1:9527',
          //需要代理跨域
          changeOrigin: true,
          //路径重写
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
