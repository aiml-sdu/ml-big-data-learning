import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'local-lab-downloads',
    apply: 'serve',
    configureServer(server) {
      const files = new Set(['Exercise2_data_exploration.ipynb', 'Exercise3_clustering.ipynb']);
      server.middlewares.use('/__lab-notebook/', (request, response, next) => {
        const filename = request.url?.split('?')[0]?.replace(/^\//, '') ?? '';
        if (!files.has(filename)) { next(); return; }
        response.setHeader('Content-Type', 'application/x-ipynb+json');
        response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const stream = createReadStream(resolve(import.meta.dirname, 'materials/labs', filename));
        stream.on('error', () => { response.statusCode = 404; response.end('Notebook unavailable.'); });
        stream.pipe(response);
      });
    },
  }],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
  },
});
