/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from 'vite'

// Nothing you type ever leaves the browser — the name is parsed and
// rendered entirely client-side. Two deliberate, disclosed exceptions to
// an otherwise locked-down policy (see PRIVACY.md for both):
//   1. style-src/font-src allow Google Fonts, because rendering historic
//      scripts (Brahmi, Grantha, Siddham, ...) needs specific Noto fonts
//      no device ships with. A static, contentless font/CSS fetch — it
//      carries no part of what you typed.
//   2. script-src/connect-src allow GoatCounter, a page-load visit count
//      (no cookies, fires before you've typed anything) so the person who
//      built this can see how many people use it.
// GitHub Pages can't set response headers, so the policy ships as a meta
// tag, injected only into production builds (the dev server needs inline
// scripts and websockets this policy forbids).
//   script-src 'self' gc.zgo.at         — our bundled JS, plus GoatCounter's count.js
//   connect-src 'self' goatcounter.com  — fetch/XHR/WebSocket stay in-origin, except the visit-count beacon
//   style-src ... fonts.googleapis.com  — the one external stylesheet, for font faces
//   font-src ... fonts.gstatic.com      — the font files that stylesheet points to
//   worker-src 'self'                  — no blob/external workers
//   object/base/form 'none'            — no plugins, <base> tricks, or form exfiltration
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://gc.zgo.at",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://yourownaiguru.goatcounter.com",
  "worker-src 'self'",
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

// This tool lives in the personal-tools monorepo, at a subpath alongside
// expense-tracker (which keeps the site's root, since that URL is already
// shared publicly — see the root README for the full routing note).
const BASE_PATH = '/personal-tools/lipikala/'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [cspPlugin],
  base: command === 'build' || isPreview ? BASE_PATH : '/',
  test: {
    include: ['src/**/*.test.ts'],
  },
}))
