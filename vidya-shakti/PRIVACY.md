# Privacy

Vidya Shakti collects **nothing**.

- **No login or account.**
- **No analytics, cookies, local storage, ads or fingerprinting.** Filters live in memory and vanish when you close the tab.
- **No third-party requests.** Fonts and data are bundled. A Content-Security-Policy in `index.html` (`connect-src 'none'`, `default-src 'none'`) makes the browser block any outside network call, even by mistake.
- **No referrer leaks.** `referrer: no-referrer` is set, and outbound links use `rel="noopener noreferrer"`.
- **Outbound links** go to official or source websites only when you tap them. Those sites have their own privacy practices.
- **Hosting:** the static host (e.g. GitHub Pages) may keep standard server logs outside this tool's control.

Verified: a fresh page load makes four same-origin requests (JS, CSS, two font files) and nothing else.
