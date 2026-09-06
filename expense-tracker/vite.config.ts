/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

// Enforces the app's no-network-egress promise at the browser level, with
// one narrow, disclosed exception (see PRIVACY.md): a GoatCounter visit
// count, which fires once per page load via navigator.sendBeacon and
// carries no statement data — everything about a parsed statement still
// never leaves 'self'. GitHub Pages can't set response headers, so the
// policy ships as a meta tag — injected only into production builds
// because the dev server needs inline scripts (React refresh preamble) and
// websockets that this policy forbids. What each directive is for:
//   script-src 'self' gc.zgo.at        — our bundled JS, plus GoatCounter's count.js
//   connect-src 'self' goatcounter.com — fetch/XHR/WebSocket stay in-origin, except the visit-count beacon
//   style-src 'unsafe-inline'          — React/recharts set style attributes inline
//   worker-src blob:                   — pdf.js falls back to a blob worker in some setups
//   object/base/form 'none'            — no plugins, <base> tricks, or form exfiltration
// (frame-ancestors is header-only and ignored in meta CSP, so it's omitted.)
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://gc.zgo.at",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self' https://yourownaiguru.goatcounter.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const cspPlugin: PluginOption = {
  name: 'inject-csp-meta',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    )
  },
}

// Base path matches the GitHub Pages project-site URL. This tool lives in
// the personal-tools monorepo and is (for now) the only thing deployed to
// its Pages site, so the base is the repo name, not this subfolder's name.
// If a second tool starts sharing the same Pages site, this — and the
// deploy workflow's artifact path — will need to become a subpath instead.
const REPO_NAME = 'personal-tools'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), cspPlugin],
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
        // Function form — vite 8 (rolldown) dropped the object shorthand.
        manualChunks(id) {
          if (id.includes('node_modules/pdfjs-dist')) return 'pdfjs'
          if (id.includes('node_modules/recharts')) return 'recharts'
        },
      },
    },
  },
}))
