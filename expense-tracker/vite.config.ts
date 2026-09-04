/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project-site URL. This tool lives in
// the personal-tools monorepo and is (for now) the only thing deployed to
// its Pages site, so the base is the repo name, not this subfolder's name.
// If a second tool starts sharing the same Pages site, this — and the
// deploy workflow's artifact path — will need to become a subpath instead.
const REPO_NAME = 'personal-tools'

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
