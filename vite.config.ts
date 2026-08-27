import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // File watching: only the Web app sources are relevant. The miniprogram/
      // folder is managed by WeChat DevTools, which locks files while
      // previewing/debugging (EBUSY) and would crash Vite's watcher, so it is
      // excluded along with other non-Web folders.
      watch: process.env.DISABLE_HMR === 'true'
        ? null
        : {
            ignored: [
              '**/node_modules/**',
              '**/miniprogram/**',
              '**/agnes-research/**',
              '**/deploy/**',
              '**/dist/**',
              '**/.git/**',
              /\.tmpdir/, // 文件编辑器/打包工具在根目录生成的临时目录，避免 watch 被锁文件（EBUSY）崩溃
            ],
          },
    },
  };
});
