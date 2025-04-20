import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'sharePan',
    component: () => import('@/pages/sharePan/index.vue'),
    beforeEnter: (to, _) => {
      if (to.query.path === undefined) {
        return { path: to.path, query: { ...to.query, path: '' } };
      }
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/auth',
    component: () => import('../pages/Auth.vue'),
    meta: {
      requiresAuth: false,
    },
  },
];

export default routes;
