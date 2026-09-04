import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project-site URL (/<repo-name>/).
// Update REPO_NAME if the repository is renamed.
const REPO_NAME = 'privacy-expense-tracker'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          recharts: ['recharts'],
        },
      },
    },
  },
}))
