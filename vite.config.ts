import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all network interfaces so the dev server is reachable from
    // other devices on the LAN (e.g. http://<host-ip>:5173), not just localhost.
    host: true,
  },
})
