import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { getConfig } from '@/api/config';
import { checkAuth } from '@/api/auth';

// 创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    };
  },
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  try {
    // 检查是否需要认证
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (!requiresAuth) {
      next();
      return;
    }

    // 获取服务器配置
    const config = await getConfig();
    // 如果允许匿名访问，直接通过
    if (config.allowAnonymous) {
      next();
      return;
    }

    // 检查是否已经验证过密码
    const hasToken = localStorage.getItem('access_token');
    if (!hasToken && to.path !== '/auth') {
      // 未验证且不在认证页面，跳转到认证页面
      next('/auth');
      return;
    }

    if (hasToken && to.path !== '/auth') {
      try {
        // 验证 token 有效性
        await checkAuth();
        next();
      } catch (error) {
        // token 无效，跳转到认证页面
        localStorage.removeItem('access_token');
        next('/auth');
      }
    } else {
      next();
    }
  } catch (error) {
    console.error('路由守卫错误:', error);
    next('/auth');
  }
});

export default router;
