import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const V4_LOCAL_DIR = 'C:/Users/AD/Downloads/WEB_DELIVERY_ALL_ASSIGNED_2026-11-16_NICKNAMES_V4';

function v4LocalMediaMiddleware() {
  return {
    name: 'v4-local-media-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/assets/P')) return next();
        const cleanRel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
        const fullPath = path.join(V4_LOCAL_DIR, cleanRel);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          res.setHeader('Content-Type', ext === '.mp4' ? 'video/mp4' : 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(fullPath).pipe(res);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/assets/P')) return next();
        const cleanRel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
        const fullPath = path.join(V4_LOCAL_DIR, cleanRel);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          res.setHeader('Content-Type', ext === '.mp4' ? 'video/mp4' : 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(fullPath).pipe(res);
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), v4LocalMediaMiddleware()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 16000
  },
  server: {
    port: 3000,
    open: false
  }
});
