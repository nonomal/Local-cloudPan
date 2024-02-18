import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index';

// import '@/styles/element/index.scss';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import '@/styles/index.scss';

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss';
import 'element-plus/theme-chalk/src/message-box.scss';

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.mount('#app');
