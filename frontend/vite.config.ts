import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Nasłuchuje na wszystkich interfejsach - wymagane dla Dockera
    port: 5173,
    watch: {
      usePolling: true, // Zapewnia działanie HMR (Hot Reload) na Windowsie / WSL
    }
  }
})