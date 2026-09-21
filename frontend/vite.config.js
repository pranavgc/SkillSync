import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the parent directory
  const env = loadEnv(mode, '../', ['VITE_', 'REACT_APP_'])

  return {
    plugins: [react()],
    envDir: '../',
    envPrefix: ['VITE_', 'REACT_APP_'],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
