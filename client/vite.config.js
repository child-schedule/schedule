import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The project lives on a Windows drive mounted into WSL2 (/mnt/c/...).
  // Native fs change events don't reliably cross that boundary, so Vite's
  // watcher silently misses edits without polling.
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
