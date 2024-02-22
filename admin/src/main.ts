import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index';

import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // 图标库

import 'element-plus/theme-chalk/src/index.scss';
import '@/styles/index.scss';

import directives from '@/directives';

// If you want to use ElMessage, import it.
// import 'element-plus/theme-chalk/src/message.scss';
// import 'element-plus/theme-chalk/src/message-box.scss';

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.use(directives);

app.mount('#app');
