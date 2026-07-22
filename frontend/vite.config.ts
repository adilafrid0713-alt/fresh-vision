import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env from workspace root (a:\ai_food\.env) as well as local .env
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const localEnv = loadEnv(mode, __dirname, '');
  const apiKey = localEnv.VITE_GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.VITE_GOOGLE_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(apiKey),
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
