import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import { viteMockServe } from 'vite-plugin-mock';

// import Unocss from 'unocss/vite';
// import {
//   presetAttributify,
//   presetIcons,
//   presetUno,
//   transformerDirectives,
//   transformerVariantGroup,
// } from 'unocss';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 用于为每个样式内容注入额外代码
          additionalData: `@use "@/styles/element/index.scss" as *;`,
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: path.resolve('./src', 'typings', 'components.d.ts'),
      }),
      // mock配置
      viteMockServe({
        mockPath: './mock',
        localEnabled: command === 'serve' && mode === 'mock',
      }),
      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      // Unocss({
      //   presets: [
      //     presetUno(),
      //     presetAttributify(),
      //     presetIcons({
      //       scale: 1.2,
      //       warn: true,
      //     }),
      //   ],
      //   transformers: [transformerDirectives(), transformerVariantGroup()],
      // }),
    ],
    server: {
      proxy: {
        '/api': {
          //获取数据的服务器地址设置
          target: 'http://localhost:9527',
          //需要代理跨域
          changeOrigin: true,
          //路径重写
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
