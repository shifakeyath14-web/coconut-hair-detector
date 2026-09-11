import { spawn } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'start-api-server',
      configureServer(server) {
        const child = spawn('node', ['server.mjs'], {
          stdio: 'inherit',
          shell: true,
        })
        server.httpServer?.on('close', () => {
          child.kill()
        })
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})