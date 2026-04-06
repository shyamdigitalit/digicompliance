import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on the current `mode`
  const env = loadEnv(mode, __dirname, '')

  const venv = env.VITE_ENV || 'dev'
  const appenv = env.VITE_APP_ENV || 'quality'

  const portDetails = {
    quality: Number(env.VITE_APPPORT_QAS) || 3027,
    production: Number(env.VITE_APPPORT_PRD) || 3026,
  }
  const apiUrl = {
    dev: {
      quality: String(env.VITE_APIURL_DEVQ).toLowerCase(),
      production: String(env.VITE_APIURL_DEVP).toLowerCase(),
    },
    live: {
      quality: String(env.VITE_APIURL_QAS).toLowerCase(),
      production: String(env.VITE_APIURL_PRD).toLowerCase(),
    }
  }

  return {
  plugins: [react()],
  server: {
    port: portDetails[appenv] || 3027,
    host: true,
    proxy: {
      // Proxy /api/* requests to backend during development
      '/api': {
        target: apiUrl[venv][appenv] || 'http://localhost:5039',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}})
