import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 生产环境基础路径，使用自定义域名
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://xiaotangyuan.qzz.io' 
  : '';

export default defineConfig({
  plugins: [
    vue()
  ],
  base: baseUrl, // 生产环境基础路径
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000, // Replit默认端口
    strictPort: true, // 强制使用指定端口
    proxy: {
      '/dylive': {
        target: 'https://live.douyin.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dylive/, ''),
        configure: proxy => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const ua = req.headers['user-agent'] || '';
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            if (isMobile) {
              proxyReq.setHeader(
                'User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
              );
            }
            proxyReq.setHeader('Referer', 'https://live.douyin.com/');
          });
          proxy.on('proxyRes', proxyRes => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              const newCookie = setCookie.map(cookie =>
                cookie
                  .replace(/; Domain=[^;]+/i, '')
                  .replace(/; SameSite=None/, '')
                  .replace(/; Secure=true/i, '')
              );
              proxyRes.headers['set-cookie'] = newCookie;
            }
          });
        }
      },
      '/socket': {
        target: 'wss://webcast5-ws-web-lf.douyin.com',
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: path => path.replace(/^\/socket/, ''),
        configure: proxy => {
          proxy.on('proxyReqWs', (proxyReq, req) => {
            const ua = req.headers['user-agent'] || '';
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            if (isMobile) {
              proxyReq.setHeader(
                'User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
              );
            }
          });
        }
      }
    }
  },
  // 构建配置，确保生产环境资源正确引用
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境关闭sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
        },
      },
    },
  },
});
