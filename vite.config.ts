import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env.API_KEY exists in the browser context
    'process.env': {
      API_KEY: process.env.API_KEY || ''
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});