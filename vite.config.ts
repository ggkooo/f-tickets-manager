import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind to all network interfaces so the dev server is reachable from
    // other devices on the LAN (e.g. http://<host-ip>:5173), not just localhost.
    host: true,
  },
})
