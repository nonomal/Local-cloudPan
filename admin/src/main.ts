import { createApp } from 'vue';
import App from './App.vue';

import router from '@/router/index';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // 图标库
import 'element-plus/theme-chalk/src/index.scss';

import '@/styles/index.scss'; // 自定义样式
import directives from '@/directives'; // 自定义指令

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.use(directives);
app.mount('#app');
