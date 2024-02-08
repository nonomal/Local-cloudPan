// 通过vue-router插件实现路由模板配置
import { createRouter, createWebHashHistory } from 'vue-router';
import { constantRoute } from './routes';
// 创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoute,
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    };
  },
});
export default router;
