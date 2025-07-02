import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '@/components/layout/index.vue';

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'homePage',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: '/masonry',
        name: 'masonryPage',
        component: () => import('@/views/masonry/index.vue')
      },
      {
        path: '/realization',
        name: 'realization',
        component: () => import('@/views/realization/index.vue')
      },
      {
        path: '/asyncForm',
        name: 'asyncForm',
        component: () => import('@/views/asyncForm/index.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
