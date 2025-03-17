import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

/**
 * 定义路由配置
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const routes = [
  {
    path: '/',
    name: 'Game',
    component: () => import('./views/SudokuGame.vue')
  },
  {
    path: '/techniques',
    name: 'Techniques',
    component: () => import('./views/SudokuTechniques.vue')
  }
];

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * 创建并挂载Vue应用
 */
const app = createApp(App);
app.use(router);
app.mount('#app');