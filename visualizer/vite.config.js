import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@monaco-editor/react', 'monaco-editor'],
  },
  server: {
    port: 3010,
  },
  build: {
    rollupOptions: {
      // Rolldown check: purely informational build-time breakdown. The build is
      // fast (~3s), so silence this advisory while keeping all correctness checks on.
      checks: {
        pluginTimings: false,
      },
    },
  },
})
