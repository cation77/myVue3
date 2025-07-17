import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import tailwindcss from '@tailwindcss/vite';
import {
  AntDesignVueResolver,
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_APP_BASE_ROUTE,
    plugins: [
      vue(),
      tailwindcss(),
      // 按需引入 vue 组件
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false // css in js
          }),
          ElementPlusResolver()
        ]
      }),
      autoImport({
        imports: ['vue', 'vue-router'],
        dts: 'src/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      visualizer()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@src': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components')
      }
    },
    server: {
      host: '0.0.0.0', // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
      open: true,
      port: 8090,
      proxy: {
        '/api': {
          target: '/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    }
  };
});
