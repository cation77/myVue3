import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import tailwindcss from '@tailwindcss/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
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
          })
        ]
      }),
      autoImport({
        imports: ['vue', 'vue-router'],
        dts: 'src/auto-imports.d.ts'
      })
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
      port: 8080,
      proxy: {
        '/api': {
          target: '/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      minify: 'terser',
      sourcemap: false, // 生产环境关闭 sourcemap
      terserOptions: {
        compress: {
          drop_console: true, // 移除所有 console
          drop_debugger: true, // 移除 debugger
          pure_funcs: ['console.info'] // 额外移除 console.info
        },
        format: {
          comments: false // 移除注释
        }
      }
    }
  };
});
