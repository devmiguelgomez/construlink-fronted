import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@src': resolve(__dirname, './src'),
      '@pages': resolve(__dirname, './pages'),
      '@components': resolve(__dirname, './components'),
      '@context': resolve(__dirname, './context'),
      '@services': resolve(__dirname, './services')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
