import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    // ✅ پێویستە repository name ـت بێت
    base: '/Hujra/',

    plugins: [react()],

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  }
})
