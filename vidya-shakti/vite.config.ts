import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' lets the built site work from any sub-path (e.g. GitHub Pages /personal-tools/vidya-shakti/).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
