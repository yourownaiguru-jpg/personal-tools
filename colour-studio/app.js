/* Colour Studio: vanilla JS, no dependencies, no network calls except loading colour-data.json. */
(() => {
  'use strict';

  // ---------- colour helpers ----------
  const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hsl = h => {
    const [r, g, b] = hx(h).map(v => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hu = 0;
    if (d) hu = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hu = (hu * 60 + 360) % 360;
    return { h: hu, c: d, l: 0.2126 * r + 0.7152 * g + 0.0722 * b };
  };
  const cmykOf = h => {
    const [r, g, b] = hx(h).map(v => v / 255);
    const k = 1 - Math.max(r, g, b);
    if (k >= 1) return '0,0,0,100';
    return [r, g, b].map(v => Math.round((1 - v - k) / (1 - k) * 100)).concat(Math.round(k * 100)).join(',');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
  const safeHex = h => HEX_RE.test(h) ? h : '#000000';

  // ---------- static content ----------
  const SHARES = { 1: [100], 2: [70, 30], 3: [60, 30, 10], 4: [60, 25, 10, 5], 5: [50, 20, 15, 10, 5], 6: [45, 20, 15, 10, 6, 4], 7: [40, 20, 12, 10, 8, 6, 4] };
  const USES = {
    painting: { label: 'Painting', sub: 'Canvas, murals, illustration', roles: ['Field', 'Mid-tone', 'Accent', 'Spark', 'Detail'],
      tips: ['Block in the large areas with the softest colour; save the strongest for small accents.', 'Value matters more than hue: squint at the swatch and your paint together.', 'Acrylics dry slightly darker. Let a test swatch dry before you compare.'] },
    interiors: { label: 'Interiors', sub: 'Walls, furniture, textiles', roles: ['Walls', 'Large furniture', 'Textiles', 'Accent pieces', 'Detail'],
      tips: ['Give the quietest colour to the walls; the liveliest belongs on things you can swap.', 'Warm colours advance and cool ones recede. Use them to shape the depth of a room.', 'Take the HEX or CMYK to your paint supplier for a match, then test a sample on the wall.'] },
    fashion: { label: 'Fashion', sub: 'Garments, outfits, collections', roles: ['Base garment', 'Second piece', 'Accent', 'Accessory', 'Detail'],
      tips: ['Wear the softest colour in the largest piece; let the strongest sit in one accent.', 'Equal amounts of every colour usually look flat. Favour one.', 'Pair warm and cool: a cool base makes a warm accent come forward.'] }
  };
  const MOODS = ['All', 'Warm', 'Cool', 'Muted', 'Vivid', 'Light', 'Dark'];
  const SIZES = [[0, 'All'], [2, 'Two'], [3, 'Three'], [4, 'Four']];
  const COLS = {
    harmonies: { label: 'Harmonies', intro: 'The classic schemes from colour theory (Goethe, Chevreul, Itten), each with an example palette. Shift them lighter, darker or duller to taste.' },
    japanese: { label: 'Japanese colours', intro: 'Dentō-shoku: colours named after dyes, plants and nature. The Edo-period greys and tea browns suit quiet, sophisticated schemes. Pick any colour to see it alone. Digital values vary between sources.' },
    kasane: { label: 'Heian layers', intro: 'Kasane no irome: seasonal pairings from Heian court robes (794–1185). Values are approximate reconstructions.' },
    limited: { label: 'Limited palettes', intro: 'A few tubes, endless harmony. Every mix shares the same pigments, so the work holds together. Tube swatches are approximate and vary by brand.' },
    seasons: { label: "Itten's seasons", intro: 'Johannes Itten (Bauhaus) linked colour character to the seasons in The Art of Color (1961).' }
  };
  const PAGE = 48;

  // ---------- state ----------
  const S = { d: null, use: 'painting', size: 0, mood: 'All', query: '', base: null, limit: PAGE, sel: null, rot: 0, value: false, col: 'harmonies' };
  let byId = {}, byHex = {}, toastTimer;
  const $ = id => document.getElementById(id);

  function prepare(d) {
    d.colors.forEach(c => { byId[c.id] = c; byHex[c.hex] = c; });
    d.combos.forEach(x => {
      x.colors = x.c.map(i => byId[i]);
      const m = x.colors.map(c => hsl(c.hex)), chrom = m.filter(v => v.c > 0.18);
      const warm = chrom.filter(v => v.h < 70 || v.h > 320).length, cool = chrom.filter(v => v.h > 150 && v.h < 290).length;
      const avgC = m.reduce((a, v) => a + v.c, 0) / m.length, avgL = m.reduce((a, v) => a + v.l, 0) / m.length;
      x.mood = { Warm: warm > cool && warm >= chrom.length / 2, Cool: cool > warm && cool >= chrom.length / 2, Muted: avgC < 0.38, Vivid: Math.max(...m.map(v => v.c)) > 0.72, Light: avgL > 0.62, Dark: avgL < 0.32 };
      x.search = x.colors.map(c => c.name.toLowerCase()).join(' ');
    });
    return d;
  }

  const wadaColour = c => ({ hex: c.hex, name: c.name, rgb: c.rgb, cmyk: c.cmyk, mix: c.mix, id: c.id, count: c.combos.length });
  function wadaPalette(x) {
    const kind = ['', '', 'Pair', 'Trio', 'Set of four'][x.colors.length];
    return { kicker: 'Wada No. ' + x.n + ' · ' + kind, title: x.colors.map(c => c.name).join(' / '), n: x.n, colors: x.colors.map(wadaColour) };
  }
  function freePalette(kicker, title, hexes, labels) {
    return { kicker, title, colors: hexes.map((h, i) => byHex[h] ? wadaColour(byHex[h])
      : { hex: h, name: (labels && labels[i]) || h, rgb: hx(h).join(','), cmyk: cmykOf(h) }) };
  }

  function filtered() {
    if (!S.d) return [];
    const q = S.query.trim().toLowerCase();
    return S.d.combos.filter(x => (!S.size || x.c.length === S.size) && (S.mood === 'All' || x.mood[S.mood]) && (!q || x.search.includes(q)) && (!S.base || x.c.includes(S.base)));
  }

  function flash(msg) {
    const t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1600);
  }
  function copy(text, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => flash(msg), () => flash(text));
  }

  // ---------- renderers ----------
  function renderUses() {
    $('uses').innerHTML = Object.keys(USES).map(k => `<button class="tile use" data-use="${k}" aria-pressed="${S.use === k}"><span class="use-title">${USES[k].label}</span><span class="use-sub">${USES[k].sub}</span></button>`).join('');
  }
  const segHTML = (name, opts) => opts.map(([v, l, on]) => `<label class="seg-opt"><input type="radio" name="${name}" value="${esc(v)}"${on ? ' checked' : ''}>${esc(l)}</label>`).join('');
  function renderFilters() {
    $('size-opts').innerHTML = segHTML('size', SIZES.map(([v, l]) => [v, l, S.size === v]));
    $('mood-opts').innerHTML = segHTML('mood', MOODS.map(m => [m, m, S.mood === m]));
  }
  function renderSwatches() {
    if (!S.d) return;
    $('swatches').innerHTML = S.d.colors.map(c => `<button class="tile swatch" data-base="${c.id}" aria-pressed="${S.base === c.id}" title="${esc(c.id + ' · ' + c.name + ' · ' + c.hex)}" aria-label="${esc(c.name + ' ' + c.hex)}" style="background:${safeHex(c.hex)}"></button>`).join('');
    const b = S.base && byId[S.base], cb = $('clear-base');
    cb.hidden = !b; if (b) cb.textContent = 'Clear ' + b.name + ' ×';
  }
  function renderCards() {
    const list = filtered(), baseC = S.base && byId[S.base], selN = S.sel && S.sel.n;
    $('count').textContent = S.d ? list.length + ' of 348 combinations' + (baseC ? ' with ' + baseC.name : '') : 'Loading combinations…';
    $('cards').innerHTML = list.slice(0, S.limit).map(x => `<button class="tile card" data-combo="${x.n}" aria-current="${x.n === selN}">
      <div class="card-strip">${x.colors.map(c => `<div style="background:${safeHex(c.hex)}"></div>`).join('')}</div>
      <div class="card-meta"><span class="card-num">No. ${String(x.n).padStart(3, '0')}</span><span class="card-kind">${['', '', 'Pair', 'Trio', 'Four'][x.c.length]}</span></div>
      <span class="card-names">${esc(x.colors.map(c => c.name).join(' · '))}</span></button>`).join('');
    $('empty').hidden = !(S.d && !list.length);
    const rem = list.length - S.limit;
    $('more-wrap').hidden = rem <= 0;
    if (rem > 0) $('more').textContent = 'Show more · ' + rem + ' left';
  }

  let ordered = [];
  function renderDetail() {
    const p = S.sel || { kicker: 'Loading', title: '…', colors: [] }, use = USES[S.use], n = p.colors.length;
    ordered = [...p.colors].sort((a, b) => hsl(a.hex).c - hsl(b.hex).c);
    if (n) { const r = S.rot % n; ordered = ordered.slice(r).concat(ordered.slice(0, r)); }
    const shares = SHARES[Math.min(n, 7)] || [];
    const roleIdx = n === 2 ? [0, 2] : ordered.map((_, i) => Math.min(i, 4));
    const g = i => safeHex((ordered[Math.min(i, n - 1)] || {}).hex || '#eae9e9');
    const s0 = g(0), s1 = g(1), s2 = n === 2 ? g(1) : g(2), s3 = n >= 4 ? g(3) : g(n - 1);
    const floor = `color-mix(in oklch, ${s0} 45%, #201e1d)`, skirting = `color-mix(in oklch, ${s0} 70%, #ffffff)`;
    let preview;
    if (S.use === 'painting') preview = `<div class="preview painting" style="background:${s0}" role="img" aria-label="Painting preview">
        <div style="left:0;right:0;bottom:0;height:34%;background:${s1}"></div>
        <div style="left:0;right:0;bottom:34%;height:4%;background:${s3}"></div>
        <div style="right:16%;top:16%;width:15%;aspect-ratio:1;border-radius:50%;background:${s2}"></div></div>`;
    else if (S.use === 'interiors') preview = `<div class="preview" style="background:${s0}" role="img" aria-label="Room preview">
        <div style="left:0;right:0;bottom:0;height:20%;background:${floor}"></div>
        <div style="left:0;right:0;bottom:20%;height:2%;background:${skirting}"></div>
        <div style="left:58%;top:14%;width:22%;height:30%;background:${s3};border:6px solid ${skirting}"></div>
        <div style="left:10%;bottom:20%;width:56%;height:26%;background:${s1}"></div>
        <div style="left:10%;bottom:46%;width:56%;height:8%;background:${s1};filter:brightness(0.92)"></div>
        <div style="left:16%;bottom:40%;width:11%;height:13%;background:${s2}"></div>
        <div style="left:29%;bottom:40%;width:11%;height:13%;background:${s3}"></div>
        <div style="left:74%;bottom:20%;width:12%;height:20%;background:${s2}"></div></div>`;
    else preview = `<div class="preview fashion" role="img" aria-label="Outfit preview">
        <div style="left:8%;top:8%;width:42%;height:84%;background:${s0}"></div>
        <div style="left:8%;top:48%;width:42%;height:5%;background:${s2}"></div>
        <div style="left:56%;top:8%;width:36%;height:44%;background:${s1}"></div>
        <div style="left:56%;top:58%;width:20%;height:34%;background:${s1};filter:brightness(0.9)"></div>
        <div style="left:80%;top:62%;width:12%;height:22%;background:${s3}"></div></div>`;
    const roles = ordered.map((c, i) => ({ ...c, share: shares[i] || 4, role: use.roles[roleIdx[i]] }));
    const inner = $('detail-inner');
    inner.classList.toggle('grey', S.value);
    inner.innerHTML = `<div><span class="kicker">${esc(p.kicker)}</span><h2>${esc(p.title)}</h2></div>
      ${preview}
      <div class="bar">${roles.map(r => `<div style="flex:${r.share};background:${safeHex(r.hex)}"></div>`).join('')}</div>
      <div class="actions">
        <button class="btn btn-secondary" data-act="rotate">Rotate roles</button>
        <button class="btn btn-secondary" data-act="value" aria-pressed="${S.value}">${S.value ? 'Show colour' : 'Value check'}</button>
        <button class="btn btn-primary" data-act="copyall">Copy HEX codes</button>
      </div>
      <div class="roles">${roles.map((r, i) => `<div class="role">
        <div class="role-chip" style="background:${safeHex(r.hex)}"></div>
        <div class="role-body">
          <div class="role-head"><span class="role-name">${esc(r.name)}</span><span class="role-share">${esc(r.role)} · ${r.share}%</span></div>
          <div class="role-codes"><button class="link-btn" data-copy="${i}" title="Copy ${esc(r.hex)}">${esc(r.hex)}</button><span>RGB ${esc(r.rgb)}</span><span>CMYK ${esc(r.cmyk)}</span></div>
          ${S.use === 'painting' && r.mix ? `<span class="role-small">Acrylic start: ${esc(r.mix)}</span>` : ''}
          ${r.id && r.count > 1 ? `<button class="link-btn role-small" data-explore="${r.id}">In ${r.count} combinations →</button>` : ''}
        </div></div>`).join('')}</div>
      <div class="tips"><span class="label">${use.label} notes</span>${use.tips.map(t => `<p>— ${esc(t)}</p>`).join('')}</div>`;
  }

  let colPalettes = [];
  function renderCollections() {
    $('col-tabs').innerHTML = segHTML('col', Object.keys(COLS).map(k => [k, COLS[k].label, S.col === k]));
    $('col-intro').textContent = COLS[S.col].intro;
    if (!S.d) return;
    const d = S.d; let items = [];
    if (S.col === 'harmonies') items = d.harmonies.map(h => ({ title: h.name, aside: h.c.length + ' colours', desc: h.desc, c: h.c, p: ['Harmony', h.name, h.c] }));
    if (S.col === 'japanese') items = d.japanese.map(j => ({ title: j.kanji + ' ' + j.name, aside: j.hex, desc: j.meaning, c: [j.hex], p: ['Japanese colour · ' + j.meaning, j.kanji + ' ' + j.name, [j.hex], [j.name]] }));
    if (S.col === 'kasane') items = d.kasane.map(k => { const [season, plant] = k.season.split(' · ');
      return { title: k.kanji + ' ' + k.name, aside: season, desc: plant + ': ' + k.desc, c: k.c, p: ['Heian layers · ' + k.season, k.name, k.c] }; });
    if (S.col === 'limited') items = d.limited.map(l => ({ title: l.name, aside: l.c.length + ' tubes', desc: l.desc, c: l.c, p: ['Limited palette', l.name, l.c, l.labels] }));
    if (S.col === 'seasons') items = d.seasons.map(l => ({ title: l.name, aside: '6 colours', desc: l.desc, c: l.c, p: ["Itten's seasons", l.name, l.c] }));
    colPalettes = items.map(it => it.p);
    $('col-grid').innerHTML = items.map((it, i) => `<button class="tile col-item" data-col-item="${i}">
      <div class="col-strip">${it.c.map(h => `<div style="background:${safeHex(h)}"></div>`).join('')}</div>
      <div class="card-meta"><span class="col-title">${esc(it.title)}</span><span class="col-aside">${esc(it.aside)}</span></div>
      <span class="col-desc">${esc(it.desc)}</span></button>`).join('');
  }

  function renderAll() { renderUses(); renderFilters(); renderSwatches(); renderCards(); renderDetail(); renderCollections(); }

  function select(p) {
    S.sel = p; S.rot = 0; renderDetail(); renderCards();
    const t = $('detail').getBoundingClientRect().top;
    if (t < 0 || t > window.innerHeight * 0.6) window.scrollTo({ top: t + window.scrollY - 56, behavior: 'smooth' });
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('button');
    if (!el) return;
    const ds = el.dataset;
    if (ds.use) { S.use = ds.use; renderUses(); renderDetail(); }
    else if (ds.base) { const id = +ds.base; S.base = S.base === id ? null : id; S.limit = PAGE; renderSwatches(); renderCards(); }
    else if (ds.combo) { const x = S.d.combos.find(c => c.n === +ds.combo); if (x) select(wadaPalette(x)); }
    else if (ds.colItem) { const p = colPalettes[+ds.colItem]; if (p) select(freePalette(...p)); }
    else if (ds.copy) { const c = ordered[+ds.copy]; if (c) copy(c.hex, 'Copied ' + c.hex); }
    else if (ds.explore) {
      Object.assign(S, { base: +ds.explore, size: 0, mood: 'All', query: '', limit: PAGE });
      $('query').value = ''; renderFilters(); renderSwatches(); renderCards();
      $('studio').scrollIntoView({ behavior: 'smooth' });
    }
    else if (ds.act === 'rotate') { S.rot++; renderDetail(); }
    else if (ds.act === 'value') { S.value = !S.value; renderDetail(); }
    else if (ds.act === 'copyall') copy(ordered.map(c => c.hex).join(' '), 'Copied ' + ordered.length + ' codes');
    else if (el.id === 'clear-base') { S.base = null; renderSwatches(); renderCards(); }
    else if (el.id === 'more') { S.limit += PAGE; renderCards(); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'size') { S.size = +t.value; S.limit = PAGE; renderCards(); }
    else if (t.name === 'mood') { S.mood = t.value; S.limit = PAGE; renderCards(); }
    else if (t.name === 'col') { S.col = t.value; renderCollections(); }
  });
  $('query').addEventListener('input', e => { S.query = e.target.value; S.limit = PAGE; renderCards(); });

  // ---------- boot ----------
  renderAll();
  fetch('colour-data.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
    S.d = prepare(d);
    S.sel = wadaPalette(d.combos.find(x => x.n === 262));
    renderAll();
  }).catch(() => { $('count').textContent = 'Could not load the colour data. Please reload the page.'; });
})();
