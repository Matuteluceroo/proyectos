import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  open: true, // Abre automáticamente el navegador
  server: {
    host: true, // Permite acceso en la red local
    port: 5173, // Puedes cambiarlo si lo deseas
  }
})
