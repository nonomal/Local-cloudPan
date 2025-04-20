import { createApp } from 'vue';
import App from './App.vue';

import router from '@/router/index';
import 'element-plus/theme-chalk/src/index.scss';
import '@/styles/index.scss'; // 自定义样式
import directives from '@/directives'; // 自定义指令

createApp(App).use(router).use(directives).mount('#app');
