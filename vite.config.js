import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: {
    port: 5173,
  },
});
