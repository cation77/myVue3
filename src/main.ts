import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import 'element-plus/dist/index.css';
import './style.css';
import '@/assets/styles/index.scss';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(Antd)
  .use(ElementPlus)
  .mount('#app');
