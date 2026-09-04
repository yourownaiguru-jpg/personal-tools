/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project-site URL (/<repo-name>/).
// Update REPO_NAME if the repository is renamed.
const REPO_NAME = 'privacy-expense-tracker'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // The Pages base path must apply to `vite preview` too — preview runs
  // with command === 'serve', and serving the built assets at '/' would
  // 404 every /<repo>/assets/* request.
  base: command === 'build' || isPreview ? `/${REPO_NAME}/` : '/',
  test: {
    // Playwright specs under e2e/ are run by `npm run e2e`, not vitest.
    include: ['src/**/*.test.ts'],
  },
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
