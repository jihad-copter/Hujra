import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',   // ensures assets load correctly
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Hujra Manager',
          short_name: 'Hujra',
          start_url: '.',        // crucial for shortcuts
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#1976d2',
          icons: [
            {
              src: 'favicon.png', // put your app icon in public/
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'favicon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
