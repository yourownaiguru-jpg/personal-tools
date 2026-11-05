const MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * The only text in this app that isn't developer-authored is the typed
 * name — and it reaches the page both by typing and via a shared #t=...
 * URL, so an un-escaped render would be a DOM-based XSS vector for anyone
 * who opens a crafted link. Every place the parsed name (or its rendered
 * glyphs) is interpolated into an HTML string goes through this first.
 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => MAP[c])
}
