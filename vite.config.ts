import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    // 🔹 بۆ GitHub Pages (repository name)
    base: '/Hujra/',  

    plugins: [react()],

    server: {
      port: 3000,
      host: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
