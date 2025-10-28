import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,

    // 🔥 Asegura que se detecten los cambios en tiempo real (incluso en Windows o red)
    watch: {
      usePolling: true,
      interval: 100,
    },

    // 🚫 Evita el cache del navegador
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
  },
})
