// Nimantran engine: draws an invitation at any time t (seconds), deterministically.
// The same function powers the editor preview, the guest page, thumbnails and video export.
import { LANGS, LAYOUTS, TYPE_STYLES, BODY_FONTS, BLESSINGS, UI } from './catalog.js';
import { drawSymbol, drawMonogram, initialsOf } from './symbols.js';

export const W = 1080, H = 1920;

// ---------- small utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function hash(n) { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
export function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }
function luminance(h) { const [r, g, b] = hexRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

export function scriptOf(s = '') {
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x0900 && c <= 0x097f) return 'deva';
    if (c >= 0x0a00 && c <= 0x0a7f) return 'guru';
    if (c >= 0x0a80 && c <= 0x0aff) return 'gujr';
    if (/[A-Za-z]/.test(ch)) return 'latn';
  }
  return 'latn';
}

export function effectiveColors(inv) {
  const c = inv.colors;
  if (LAYOUTS[inv.layout]?.dark && luminance(c.bg[0]) > 0.25) {
    return { bg: [mix(c.head, '#000000', 0.7), mix(c.head, '#000000', 0.88)], ink: '#fbf1e2', head: mix(c.accent, '#ffffff', 0.35), accent: mix(c.accent, '#ffd27a', 0.3), soft: mix(c.head, '#000000', 0.45), dark: true };
  }
  return { ...c, dark: luminance(c.bg[0]) < 0.25 };
}

function fontFamily(role, script, inv) {
  const fam = role === 'display' ? (TYPE_STYLES[inv.type] || TYPE_STYLES.classic)[script] : BODY_FONTS[script];
  const fallback = { latn: 'Georgia, serif', deva: '"Noto Sans Devanagari", sans-serif', guru: '"Noto Sans Gurmukhi", sans-serif', gujr: '"Noto Sans Gujarati", sans-serif' }[script];
  return `"${fam}", ${fallback}`;
}
function fontScale(role, script, inv) {
  if (role !== 'display') return 1;
  if (inv.type === 'script' && script === 'latn') return 1.3;
  if (inv.type === 'royal' && script === 'latn') return 0.82;
  return 1;
}

export function familiesFor(inv) {
  const set = new Set();
  for (const lang of [inv.lang, inv.lang2].filter(Boolean)) {
    const s = LANGS[lang].script;
    set.add(`700 40px ${fontFamily('display', s, inv)}`);
    set.add(`400 40px ${fontFamily('display', s, inv)}`);
    set.add(`400 40px ${fontFamily('body', s, inv)}`);
    set.add(`500 40px ${fontFamily('body', s, inv)}`);
  }
  set.add(`400 40px ${fontFamily('body', 'latn', inv)}`);
  return [...set];
}
const SAMPLE = { latn: 'Aa&', deva: 'शुभ', guru: 'ਸ਼ੁਭ', gujr: 'શુભ' };
export async function loadFonts(inv, timeout = 4000) {
  if (!document.fonts) return;
  const jobs = familiesFor(inv).map((f) => document.fonts.load(f, Object.values(SAMPLE).join(' ')).catch(() => {}));
  await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, timeout))]);
}

// ---------- text helpers ----------
const tx = (inv, lang) => inv.text[lang] || inv.text.en;
function namesLine(names) { return names.filter(Boolean).join(' & '); }

export function fmtDate(date, lang, opts) {
  try { return new Intl.DateTimeFormat(LANGS[lang].locale, opts).format(new Date(date + 'T12:00:00')); } catch { return date; }
}
export function fmtTime(time, lang) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number); const d = new Date(2000, 0, 1, h, m);
  try { return new Intl.DateTimeFormat(LANGS[lang].locale, { hour: 'numeric', minute: '2-digit' }).format(d); } catch { return time; }
}

// ---------- timeline ----------
const SCENE_ORDER = ['blessing', 'names', 'message', 'details', 'events', 'closing'];
export function buildTimeline(inv) {
  const sp = inv.speed || 1, out = []; let t = 0;
  for (const id of SCENE_ORDER) {
    if (!inv.scenes[id]) continue;
    if (id === 'blessing' && inv.blessing === 'none' && (inv.symbol || 'none') === 'none') continue;
    if (id === 'events' && !(inv.events || []).length) continue;
    const base = { blessing: 3.2, names: 5.2, message: 5.4, details: 5.4, closing: 4.6 }[id] ?? (2.6 + 1.0 * Math.min(6, inv.events.length));
    const dur = base / sp; out.push({ id, start: t, dur }); t += dur;
  }
  if (!out.length) out.push({ id: 'names', start: 0, dur: 5 });
  return { scenes: out, duration: t || 5 };
}
export function sceneAt(tl, t) {
  let i = tl.scenes.findIndex((s) => t < s.start + s.dur);
  if (i < 0) i = tl.scenes.length - 1;
  return i;
}

// ---------- scene content → blocks ----------
function sceneBlocks(inv, id) {
  const L1 = inv.lang, L2 = inv.lang2 && inv.lang2 !== inv.lang ? inv.lang2 : null;
  const a = tx(inv, L1), b = L2 ? tx(inv, L2) : null;
  const B = [];
  const add = (text, role, size, color, opts = {}) => { if (text) B.push({ text, role, size, color, ...opts }); };
  const sec = (text, size, opts = {}) => { if (L2 && text) add(text, 'body', size, 'ink2', opts); };
  const gap = (h) => B.push({ gap: h });
  if (id === 'blessing') {
    const bl = BLESSINGS[inv.blessing] || {};
    if (hasSymbol(inv)) { B.push({ symbol: true, h: 340 }); gap(30); }
    add(bl[L1], 'display', 66, 'accent', { weight: 400 }); gap(70);
    add(UI.invited[L1], 'body', 56, 'ink', { label: true }); sec(UI.invited[L2], 38, { label: true });
  } else if (id === 'names') {
    const names = (a.names || []).filter(Boolean);
    if (names.length) {
      if (inv.monogram?.on && inv.layout !== 'minimal') { B.push({ monogram: true, h: 230 }); gap(26); }
      add(a.title, 'body', 46, 'accent', { label: true, weight: 500 }); sec(b?.title, 32, { label: true }); gap(40);
      if (inv.photo) B.push({ photo: true, h: 380 });
      if (names.length === 2) {
        add(names[0], 'display', 150, 'head', { shimmer: true, weight: 700 });
        add('&', 'display', 84, 'accent', { weight: 400, script: 'latn' });
        add(names[1], 'display', 150, 'head', { shimmer: true, weight: 700 });
      } else add(names.join(' '), 'display', 160, 'head', { shimmer: true, weight: 700 });
      if (b) sec(namesLine(b.names || []), 44);
      gap(44);
      add(a.tagline, 'body', 46, 'ink', { italic: true }); sec(b?.tagline, 32);
    } else {
      if (inv.photo) B.push({ photo: true, h: 380 });
      add(a.title, 'display', 132, 'head', { shimmer: true, weight: 700 }); sec(b?.title, 48); gap(50);
      add(a.tagline, 'body', 50, 'ink'); sec(b?.tagline, 34);
    }
  } else if (id === 'message') {
    add(a.message, 'body', 52, 'ink', { lh: 1.5 }); sec(b?.message, 36, { lh: 1.45 });
    B.push({ divider: true, h: 90 });
    add(a.host, 'display', 62, 'head', { weight: 700 }); sec(b?.host, 38);
  } else if (id === 'details') {
    add(UI.date[L1], 'body', 40, 'accent', { label: true }); gap(10);
    add(fmtDate(inv.date, L1, { day: 'numeric' }), 'display', 220, 'head', { weight: 700, script: 'latn', shimmer: true });
    add(fmtDate(inv.date, L1, { month: 'long', year: 'numeric' }), 'display', 64, 'head', { weight: 400 });
    add(fmtDate(inv.date, L1, { weekday: 'long' }) + ' · ' + fmtTime(inv.time, L1), 'body', 46, 'ink');
    B.push({ divider: true, h: 100 });
    add(UI.venue[L1], 'body', 40, 'accent', { label: true }); gap(14);
    add(a.venue, 'display', 70, 'head', { weight: 700 }); sec(b?.venue, 38);
    add(a.address, 'body', 44, 'ink'); sec(b?.address, 32);
  } else if (id === 'events') {
    add(UI.programme[L1], 'display', 76, 'head', { weight: 700 }); sec(UI.programme[L2], 38); gap(40);
    inv.events.slice(0, 6).forEach((e, i) => {
      add(e.name[L1] || e.name.en, 'display', 62, 'head', { weight: 700, ev: i });
      if (L2) add(e.name[L2], 'body', 34, 'ink2', { ev: i });
      add(fmtDate(e.date, L1, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + fmtTime(e.time, L1), 'body', 40, 'ink', { ev: i });
      gap(34);
    });
  } else if (id === 'closing') {
    if (hasSymbol(inv)) { B.push({ symbol: true, h: 170 }); gap(30); }
    add(a.closing, 'display', 76, 'head', { weight: 700, lh: 1.25 }); sec(b?.closing, 40); gap(60);
    if (inv.contact) add(inv.contact, 'body', 42, 'ink');
    add(namesLine(a.names || []) || a.host, 'body', 44, 'accent', { label: true });
  }
  return B;
}

function hasSymbol(inv) { return inv.symbol && inv.symbol !== 'none' && (inv.symbol !== 'custom' || inv.symbolImage); }
export function monoLetters(inv) {
  const custom = (inv.monogram?.text || '').trim();
  if (custom) return custom.split(/[\s&|·,]+/).filter(Boolean).slice(0, 2).map((w) => [...w][0]);
  return initialsOf((tx(inv, inv.lang).names || [])).slice(0, 2);
}
export function drawLogo(g, inv, cx, cy, size, col = effectiveColors(inv)) {
  drawMonogram(g, inv.monogram?.style || 'ring', monoLetters(inv), cx, cy, size, col, (ch) => fontFamily('display', scriptOf(ch), inv));
}

function setFont(ctx, blk, size, inv) {
  const script = blk.script || scriptOf(blk.text);
  const s = size * fontScale(blk.role, script, inv);
  ctx.font = `${blk.italic && script === 'latn' ? 'italic ' : ''}${blk.weight || 400} ${s}px ${fontFamily(blk.role, script, inv)}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = blk.label ? `${Math.round(s * 0.08)}px` : '0px';
  return s;
}
function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean); let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
    }
    out.push(line);
  }
  return out;
}

const layoutCache = new Map();
function layoutScene(ctx, inv, id, box) {
  const key = `${id}|${inv._rev || 0}|${inv.lang}|${inv.lang2}|${inv.type}|${box.w}|${box.h}|${document.fonts?.status}`;
  if (layoutCache.has(key)) return layoutCache.get(key);
  const blocks = sceneBlocks(inv, id);
  let scale = 1, lines = [], total = 0;
  for (let pass = 0; pass < 4; pass++) {
    lines = []; total = 0;
    for (const blk of blocks) {
      if (blk.gap) { total += blk.gap * scale; lines.push({ gap: blk.gap * scale }); continue; }
      if (blk.photo || blk.divider || blk.symbol || blk.monogram) { const h = blk.h * scale; lines.push({ ...blk, h }); total += h; continue; }
      const size = setFont(ctx, blk, blk.size * scale, inv);
      let ls = wrap(ctx, blk.text, box.w);
      // A single long word (a name) shrinks instead of overflowing.
      let fs = size, shrink = 1;
      const widest = Math.max(...ls.map((l) => ctx.measureText(l).width));
      if (widest > box.w) { shrink = box.w / widest; fs = size * shrink; }
      const lh = fs * (blk.lh || 1.22);
      for (const l of ls) { lines.push({ blk, text: l, size: blk.size * scale * shrink, lh }); total += lh; }
      lines.push({ gap: fs * 0.18 }); total += fs * 0.18;
    }
    if (total <= box.h) break;
    scale *= Math.max(0.6, (box.h / total) * 0.98);
  }
  const res = { lines, total };
  if (layoutCache.size > 300) layoutCache.clear();
  layoutCache.set(key, res);
  return res;
}

// ---------- cached art ----------
const artCache = new Map();
function cached(key, w, h, draw) {
  if (artCache.has(key)) return artCache.get(key);
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  draw(c.getContext('2d'), w, h);
  if (artCache.size > 60) artCache.clear();
  artCache.set(key, c);
  return c;
}

function marigold(c, r, hue) {
  const key = `mg|${r}|${hue}`;
  return cached(key, r * 2 + 4, r * 2 + 4, (g, w) => {
    g.translate(w / 2, w / 2);
    const cols = hue === 'red' ? ['#b3261e', '#d9442b', '#f06a3a'] : ['#e86a00', '#f79a00', '#ffc22e'];
    [[1, 14, cols[0]], [0.78, 12, cols[1]], [0.52, 10, cols[2]]].forEach(([k, n, col], j) => {
      for (let i = 0; i < n; i++) {
        g.save(); g.rotate((i / n) * Math.PI * 2 + j * 0.3);
        g.fillStyle = col; g.beginPath(); g.ellipse(r * k * 0.55, 0, r * k * 0.45, r * k * 0.22, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
    });
    g.fillStyle = '#8a3b00'; g.beginPath(); g.arc(0, 0, r * 0.14, 0, Math.PI * 2); g.fill();
  });
}

function mandalaArt(col, size) {
  return cached(`md|${col.accent}|${col.soft}|${col.head}|${size}`, size, size, (g, w) => {
    g.translate(w / 2, w / 2);
    const R = w / 2 - 4;
    const rings = [[0.12, 8, 'round'], [0.22, 12, 'pointed'], [0.33, 16, 'tear'], [0.45, 24, 'round'], [0.58, 20, 'pointed'], [0.72, 32, 'tear'], [0.86, 40, 'pointed'], [0.97, 64, 'dot']];
    g.lineWidth = 2;
    rings.forEach(([k, n, shape], ri) => {
      const r = R * k, prev = ri ? R * rings[ri - 1][0] : 0, len = (r - prev) * 0.95;
      g.strokeStyle = col.accent; g.fillStyle = ri % 2 ? rgba(col.soft, 0.55) : rgba(col.head, 0.18);
      for (let i = 0; i < n; i++) {
        g.save(); g.rotate((i / n) * Math.PI * 2 + (ri % 2 ? Math.PI / n : 0)); g.translate(prev, 0);
        g.beginPath();
        if (shape === 'round') { g.ellipse(len / 2, 0, len / 2, len * 0.28 * (8 / n) * 2.4, 0, 0, Math.PI * 2); }
        else if (shape === 'pointed') { g.moveTo(0, -len * 0.22); g.quadraticCurveTo(len * 0.6, -len * 0.25, len, 0); g.quadraticCurveTo(len * 0.6, len * 0.25, 0, len * 0.22); g.closePath(); }
        else if (shape === 'tear') { g.moveTo(0, 0); g.bezierCurveTo(len * 0.3, -len * 0.35, len, -len * 0.2, len, 0); g.bezierCurveTo(len, len * 0.2, len * 0.3, len * 0.35, 0, 0); }
        else { g.arc(len * 0.5, 0, Math.max(2, len * 0.12), 0, Math.PI * 2); }
        g.fill(); g.stroke(); g.restore();
      }
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.strokeStyle = rgba(col.accent, 0.7); g.stroke();
    });
    g.fillStyle = col.accent; g.beginPath(); g.arc(0, 0, R * 0.05, 0, Math.PI * 2); g.fill();
  });
}

function paisleyPath(g, s) {
  g.beginPath(); g.moveTo(0, s);
  g.bezierCurveTo(-s * 0.9, s * 0.9, -s * 0.9, -s * 0.2, -s * 0.2, -s * 0.6);
  g.bezierCurveTo(s * 0.3, -s * 0.9, s * 0.2, -s * 1.3, s * 0.6, -s * 1.2);
  g.bezierCurveTo(s * 0.2, -s * 0.8, s * 0.9, -s * 0.5, s * 0.8, s * 0.2);
  g.bezierCurveTo(s * 0.7, s * 0.8, s * 0.3, s, 0, s);
}

function flower(g, x, y, r, petals, c1, c2, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  for (let i = 0; i < petals; i++) {
    g.save(); g.rotate((i / petals) * Math.PI * 2);
    const gr = g.createRadialGradient(0, 0, r * 0.1, 0, -r * 0.5, r);
    gr.addColorStop(0, c2); gr.addColorStop(1, c1);
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, -r * 0.55, r * 0.42, r * 0.6, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  g.fillStyle = '#f7d36b'; g.beginPath(); g.arc(0, 0, r * 0.22, 0, Math.PI * 2); g.fill(); g.restore();
}
function leaf(g, x, y, len, ang, col) {
  g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0); g.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0); g.fill();
  g.strokeStyle = rgba('#ffffff', 0.25); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(len * 0.9, 0); g.stroke(); g.restore();
}

// ---------- layouts: background + frame ----------
const BOX = {
  arch: { x: 190, y: 420, w: 700, h: 1270 }, marigold: { x: 170, y: 400, w: 740, h: 1300 }, mandala: { x: 140, y: 300, w: 800, h: 1330 },
  minimal: { x: 150, y: 330, w: 780, h: 1330 }, diya: { x: 140, y: 380, w: 800, h: 1180 }, garden: { x: 160, y: 400, w: 760, h: 1200 },
  paisley: { x: 190, y: 350, w: 700, h: 1260 }, confetti: { x: 170, y: 380, w: 740, h: 1240 },
};

function drawBackground(g, inv, col, t, intro) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, col.bg[0]); gr.addColorStop(1, col.bg[1]);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.2, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, col.dark ? 'rgba(0,0,0,0.35)' : rgba(col.accent, 0.12));
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const p = easeOut(clamp(intro));
  const fn = FRAMES[inv.layout] || FRAMES.minimal;
  g.save(); fn(g, inv, col, t, p); g.restore();
}

const FRAMES = {
  arch(g, inv, col, t, p) {
    g.globalAlpha = p;
    const archPath = (inset) => {
      const l = 110 + inset, r = W - 110 - inset, spring = 760 + inset * 0.3, top = 250 + inset, bottom = 1800 - inset * 0.2;
      g.beginPath(); g.moveTo(l, bottom); g.lineTo(l, spring);
      g.bezierCurveTo(l, spring - 260, W / 2 - 170, top + 120, W / 2, top);
      g.bezierCurveTo(W / 2 + 170, top + 120, r, spring - 260, r, spring);
      g.lineTo(r, bottom);
    };
    archPath(0); g.closePath(); g.fillStyle = col.dark ? rgba('#000000', 0.18) : rgba('#ffffff', 0.45); g.fill();
    g.strokeStyle = col.accent; g.lineWidth = 7; archPath(0); g.stroke();
    g.lineWidth = 2.5; archPath(26); g.stroke();
    // scalloped jharokha edge
    g.fillStyle = col.accent;
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, l = 136, r = W - 136, spring = 768, top = 276;
      let x, y;
      if (u < 0.5) { const s = u * 2; x = bez(l, l, W / 2 - 170, W / 2, s); y = bez(spring, spring - 260, top + 120, top, s); }
      else { const s = (u - 0.5) * 2; x = bez(W / 2, W / 2 + 170, r, r, s); y = bez(top, top + 120, spring - 260, spring, s); }
      g.beginPath(); g.arc(x, y + 14, 4.5, 0, Math.PI * 2); g.fill();
    }
    // outer border + corners
    g.strokeStyle = rgba(col.accent, 0.8); g.lineWidth = 3; g.strokeRect(40, 40, W - 80, H - 80);
    g.lineWidth = 1.5; g.strokeRect(56, 56, W - 112, H - 112);
    // base steps
    g.fillStyle = rgba(col.accent, 0.9); g.fillRect(90, 1790, W - 180, 8); g.fillRect(70, 1812, W - 140, 5);
    // hanging lamps
    [[230, 330], [850, 330]].forEach(([x, len], i) => {
      const a = Math.sin(t * 1.4 + i * 1.7) * 0.06;
      g.save(); g.translate(x, 0); g.rotate(a);
      g.strokeStyle = col.accent; g.lineWidth = 2; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, len); g.stroke(); g.setLineDash([]);
      const glow = g.createRadialGradient(0, len + 60, 5, 0, len + 60, 110); glow.addColorStop(0, rgba('#ffd27a', 0.55)); glow.addColorStop(1, rgba('#ffd27a', 0));
      g.fillStyle = glow; g.beginPath(); g.arc(0, len + 60, 110, 0, Math.PI * 2); g.fill();
      g.fillStyle = col.accent; g.beginPath(); g.moveTo(-34, len + 20); g.quadraticCurveTo(0, len - 30, 34, len + 20); g.lineTo(26, len + 90); g.quadraticCurveTo(0, len + 110, -26, len + 90); g.closePath(); g.fill();
      g.fillStyle = rgba('#fff3c4', 0.85); g.beginPath(); g.ellipse(0, len + 62, 12, 22, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = col.accent; g.beginPath(); g.arc(0, len + 116, 7, 0, Math.PI * 2); g.fill();
      g.restore();
    });
  },
  marigold(g, inv, col, t, p) {
    const drop = (1 - p) * -400;
    g.translate(0, drop);
    // swags across the top
    for (let s = 0; s < 3; s++) {
      const x0 = s * (W / 3), x1 = x0 + W / 3, sag = 120 + Math.sin(t * 1.1 + s) * 6;
      for (let i = 0; i <= 14; i++) {
        const u = i / 14, x = x0 + (x1 - x0) * u, y = 70 + Math.sin(u * Math.PI) * sag;
        g.drawImage(marigold(g, 22, i % 3 === 0 ? 'red' : 'orange'), x - 24, y - 24);
      }
    }
    // mango-leaf toran
    for (let i = 0; i < 18; i++) leaf(g, 30 + i * 60, 40, 70, Math.PI / 2 + Math.sin(t * 1.5 + i) * 0.08, i % 2 ? '#3f7a32' : '#5b9a3d');
    g.fillStyle = col.accent; g.fillRect(0, 26, W, 10);
    // side strings
    [60, W - 60].forEach((x, si) => {
      const sway = Math.sin(t * 0.9 + si * 2) * 10;
      for (let i = 0; i < 22; i++) {
        const y = 140 + i * 62, xx = x + sway * (i / 22);
        g.drawImage(marigold(g, 24, i % 4 === 3 ? 'red' : 'orange'), xx - 26, y - 26);
      }
      g.fillStyle = col.accent; g.beginPath(); g.moveTo(x + sway - 16, 1530); g.quadraticCurveTo(x + sway, 1480, x + sway + 16, 1530); g.lineTo(x + sway + 12, 1566); g.lineTo(x + sway - 12, 1566); g.fill();
    });
    g.translate(0, -drop);
    g.globalAlpha = p; g.strokeStyle = rgba(col.accent, 0.7); g.lineWidth = 2;
    g.strokeRect(130, 330, W - 260, 1440);
    rangoliBorder(g, col, W / 2, 1810, p);
  },
  mandala(g, inv, col, t, p) {
    const art = mandalaArt(col, 1400);
    g.save(); g.globalAlpha = 0.22 * p; g.translate(W / 2, H * 0.47); g.rotate(t * 0.05); g.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p); g.drawImage(art, -700, -700); g.restore();
    const small = mandalaArt(col, 600);
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y], i) => {
      g.save(); g.globalAlpha = 0.75 * p; g.translate(x, y); g.rotate(-t * 0.08 * (i % 2 ? 1 : -1)); g.drawImage(small, -300, -300); g.restore();
    });
    g.globalAlpha = p; g.strokeStyle = col.accent; g.lineWidth = 2; g.strokeRect(70, 70, W - 140, H - 140);
  },
  minimal(g, inv, col, t, p) {
    g.globalAlpha = p; g.strokeStyle = rgba(col.head, 0.55); g.lineWidth = 2;
    const m = 70, gapL = 140;
    g.beginPath();
    g.moveTo(m + gapL, m); g.lineTo(W - m - gapL, m); g.moveTo(W - m, m + gapL); g.lineTo(W - m, H - m - gapL);
    g.moveTo(W - m - gapL, H - m); g.lineTo(m + gapL, H - m); g.moveTo(m, H - m - gapL); g.lineTo(m, m + gapL); g.stroke();
    g.fillStyle = col.accent; [[m, m], [W - m, m], [W - m, H - m], [m, H - m]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); });
    if (inv.monogram?.on && monoLetters(inv).length) { g.globalAlpha = p; drawLogo(g, inv, W / 2, 200, 170, col); }
  },
  diya(g, inv, col, t, p) {
    for (let i = 0; i < 90; i++) {
      const x = hash(i) * W, y = hash(i + 50) * H * 0.75, tw = Math.pow(Math.max(0, Math.sin(t * (1 + hash(i + 9)) + i)), 4);
      g.fillStyle = rgba('#fff6d8', (0.15 + 0.6 * tw) * p); g.beginPath(); g.arc(x, y, 1.5 + hash(i + 3) * 2, 0, Math.PI * 2); g.fill();
    }
    // fireworks
    const period = 3.1;
    for (let k = Math.max(0, Math.floor(t / period) - 1); k <= Math.floor(t / period); k++) {
      const age = t - k * period; if (age < 0 || age > 2.2) continue;
      const cx = 160 + hash(k * 7) * (W - 320), cy = 140 + hash(k * 13) * 260, hue = ['#ffd27a', '#ff8a5c', '#9be7ff', '#ffb3e6'][k % 4];
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2, r = easeOut(clamp(age / 1.4)) * (110 + hash(k + i) * 40);
        g.fillStyle = rgba(hue, (1 - age / 2.2) * p); g.beginPath(); g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r + age * age * 18, 3.4, 0, Math.PI * 2); g.fill();
      }
    }
    // hanging lanterns
    [[200, 260], [540, 180], [880, 260]].forEach(([x, len], i) => {
      const sw = Math.sin(t * 1.2 + i) * 0.05; g.save(); g.translate(x, 0); g.rotate(sw); g.globalAlpha = p;
      g.strokeStyle = rgba(col.accent, 0.8); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, len); g.stroke();
      const glow = g.createRadialGradient(0, len + 55, 4, 0, len + 55, 120); glow.addColorStop(0, rgba('#ffb347', 0.5)); glow.addColorStop(1, rgba('#ffb347', 0));
      g.fillStyle = glow; g.beginPath(); g.arc(0, len + 55, 120, 0, Math.PI * 2); g.fill();
      g.fillStyle = col.accent; star(g, 0, len + 55, 52, 24, 5); g.fill();
      g.fillStyle = rgba('#fff1c1', 0.9); star(g, 0, len + 55, 26, 12, 5); g.fill();
      g.strokeStyle = col.accent; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 8, len + 100); g.lineTo(k * 10, len + 150); g.stroke(); }
      g.restore();
    });
    // row of diyas
    for (let i = 0; i < 7; i++) {
      const x = 90 + i * 150, y = 1770, flick = 1 + Math.sin(t * 9 + i * 2.3) * 0.08 + Math.sin(t * 13 + i) * 0.05;
      g.globalAlpha = p;
      const glow = g.createRadialGradient(x, y - 50, 4, x, y - 50, 120); glow.addColorStop(0, rgba('#ffb347', 0.55)); glow.addColorStop(1, rgba('#ffb347', 0));
      g.fillStyle = glow; g.beginPath(); g.arc(x, y - 50, 120, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#a5481f'; g.beginPath(); g.moveTo(x - 52, y - 18); g.quadraticCurveTo(x, y + 52, x + 52, y - 18); g.quadraticCurveTo(x + 30, y - 8, x + 70, y - 30); g.quadraticCurveTo(x, y - 6, x - 52, y - 18); g.fill();
      g.fillStyle = '#d9783a'; g.beginPath(); g.ellipse(x, y - 18, 52, 10, 0, 0, Math.PI * 2); g.fill();
      g.save(); g.translate(x + 40, y - 34); g.scale(1, flick);
      const fl = g.createRadialGradient(0, -14, 2, 0, -14, 30); fl.addColorStop(0, '#fffbe0'); fl.addColorStop(0.5, '#ffd34d'); fl.addColorStop(1, rgba('#ff7a1a', 0));
      g.fillStyle = fl; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(-16, -10, 0, -44); g.quadraticCurveTo(16, -10, 0, 6); g.fill(); g.restore();
    }
    g.globalAlpha = p; rangoliBorder(g, col, W / 2, 1870, p);
  },
  garden(g, inv, col, t, p) {
    const leafC = mix('#4f7d43', col.accent, 0.15), petal = col.dark ? mix(col.head, '#ffffff', 0.2) : mix(col.head, '#ffffff', 0.35);
    const vine = (x0, y0, x1, y1, side) => {
      g.strokeStyle = leafC; g.lineWidth = 4; g.beginPath();
      const steps = 40, upto = Math.floor(steps * p);
      for (let i = 0; i <= upto; i++) {
        const u = i / steps, x = x0 + (x1 - x0) * u + Math.sin(u * 9 + t * 0.6) * 22 * side, y = y0 + (y1 - y0) * u;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
        if (i % 4 === 2) leaf(g, x, y, 46, (side > 0 ? -0.5 : Math.PI + 0.5) + Math.sin(t + i) * 0.1, leafC);
      }
      g.stroke();
    };
    vine(70, 300, 70, 1650, 1); vine(W - 70, 300, W - 70, 1650, -1);
    const cluster = (cx, cy, s, flip) => {
      for (let i = 0; i < 7; i++) leaf(g, cx, cy, 120 * s, (flip ? Math.PI : 0) + (i - 3) * 0.35 + Math.sin(t * 0.8 + i) * 0.04, leafC);
      [[0, 0, 70], [80, 40, 48], [-50, 70, 44], [30, -70, 40], [110, -30, 30]].forEach(([dx, dy, r], i) => {
        flower(g, cx + dx * (flip ? -1 : 1) * s, cy + dy * (flip ? -1 : 1) * s, r * s * p, i % 2 ? 5 : 6, petal, mix(petal, '#ffffff', 0.6), t * 0.15 + i);
      });
    };
    cluster(110, 150, 1.25, false); cluster(W - 110, H - 150, 1.25, true); cluster(W - 120, 170, 0.75, true); cluster(120, H - 170, 0.75, false);
  },
  paisley(g, inv, col, t, p) {
    g.globalAlpha = 0.16 * p; g.fillStyle = col.accent;
    for (let y = 30; y < H; y += 60) for (let x = (y / 60) % 2 ? 30 : 60; x < W; x += 60) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = p;
    const band = 74, m = 46;
    g.fillStyle = rgba(col.soft, col.dark ? 0.6 : 0.9);
    g.fillRect(m, m, W - 2 * m, band); g.fillRect(m, H - m - band, W - 2 * m, band); g.fillRect(m, m, band, H - 2 * m); g.fillRect(W - m - band, m, band, H - 2 * m);
    g.strokeStyle = col.accent; g.lineWidth = 3; g.strokeRect(m, m, W - 2 * m, H - 2 * m); g.strokeRect(m + band, m + band, W - 2 * (m + band), H - 2 * (m + band));
    const place = (x, y, a, i) => {
      g.save(); g.translate(x, y); g.rotate(a + Math.sin(t * 0.7 + i) * 0.05);
      paisleyPath(g, 24); g.fillStyle = i % 2 ? col.head : col.accent; g.fill();
      g.fillStyle = col.bg[0]; g.beginPath(); g.arc(0, 4, 7, 0, Math.PI * 2); g.fill(); g.restore();
    };
    let i = 0;
    for (let x = m + band + 40; x < W - m - band; x += 78) { place(x, m + band / 2, Math.PI / 2, i++); place(x, H - m - band / 2, -Math.PI / 2, i++); }
    for (let y = m + band + 40; y < H - m - band; y += 78) { place(m + band / 2, y, 0, i++); place(W - m - band / 2, y, Math.PI, i++); }
    [[m + band / 2, m + band / 2], [W - m - band / 2, m + band / 2], [m + band / 2, H - m - band / 2], [W - m - band / 2, H - m - band / 2]].forEach(([x, y]) => {
      flower(g, x, y, 34, 8, col.head, col.accent, t * 0.3);
    });
  },
  confetti(g, inv, col, t, p) {
    const pal = [col.head, col.accent, mix(col.head, '#ffffff', 0.5), '#ffd166', '#06d6a0', '#ef476f'];
    for (let i = 0; i < 6; i++) {
      const sp = 70 + hash(i) * 40, cycle = (H + 600) / sp, ph = ((t + hash(i + 3) * cycle) % cycle) / cycle;
      const x = 100 + hash(i + 20) * (W - 200) + Math.sin(t * 0.8 + i) * 30, y = H + 200 - ph * (H + 600);
      const c = pal[i % pal.length];
      g.globalAlpha = 0.9 * p;
      g.strokeStyle = rgba(col.dark ? '#ffffff' : '#000000', 0.25); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 90); g.quadraticCurveTo(x + 20, y + 160, x - 6, y + 240); g.stroke();
      const gr = g.createRadialGradient(x - 22, y - 30, 8, x, y, 90); gr.addColorStop(0, mix(c, '#ffffff', 0.5)); gr.addColorStop(1, c);
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 64, 80, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x - 9, y + 86); g.lineTo(x + 9, y + 86); g.lineTo(x, y + 76); g.fill();
    }
    g.globalAlpha = p;
    const r = 48, x = 110, y = 330, w = W - 220, h = 1340;
    g.fillStyle = col.dark ? rgba(col.bg[1], 0.82) : rgba('#ffffff', 0.86);
    g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
    g.strokeStyle = rgba(col.accent, 0.8); g.lineWidth = 3; g.setLineDash([2, 14]); g.lineCap = 'round'; g.beginPath(); g.roundRect(x + 18, y + 18, w - 36, h - 36, r - 12); g.stroke(); g.setLineDash([]);
  },
};

function bez(a, b, c, d, t) { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
function star(g, x, y, R, r, n) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r : R, a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
function rangoliBorder(g, col, cx, cy, p) {
  g.save(); g.globalAlpha *= 0.9;
  for (let i = -6; i <= 6; i++) {
    const x = cx + i * 72; g.fillStyle = i % 2 ? col.accent : col.head;
    g.beginPath(); g.moveTo(x, cy - 16 * p); g.lineTo(x + 16, cy); g.lineTo(x, cy + 16 * p); g.lineTo(x - 16, cy); g.fill();
  }
  g.restore();
}

// ---------- particles ----------
function drawFx(g, inv, col, t) {
  const fx = inv.fx;
  if (fx === 'petals') {
    const cols = inv.layout === 'garden' ? [mix(col.head, '#ffffff', 0.3), mix(col.head, '#ffffff', 0.55)] : ['#f7941d', '#ffb627', '#e8541c'];
    for (let i = 0; i < 26; i++) {
      const sp = 70 + hash(i) * 90, span = H + 200, y = ((hash(i + 7) * span + t * sp) % span) - 100;
      const x = hash(i + 1) * W + Math.sin(t * (0.6 + hash(i + 2)) + i) * 50, rot = t * (1 + hash(i + 4) * 2) + i;
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, Math.abs(Math.sin(t * 2 + i)) * 0.6 + 0.4);
      g.fillStyle = rgba(cols[i % cols.length], 0.85); g.beginPath(); g.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  } else if (fx === 'sparkles') {
    for (let i = 0; i < 44; i++) {
      const x = hash(i + 100) * W, y = hash(i + 200) * H, a = Math.pow(Math.max(0, Math.sin(t * (1.2 + hash(i)) * 2 + i * 3)), 6);
      if (a < 0.02) continue;
      const s = 8 + hash(i + 5) * 14;
      g.fillStyle = rgba(col.dark ? '#fff4d1' : col.accent, a); star(g, x, y, s, s * 0.22, 4); g.fill();
    }
  } else if (fx === 'confetti') {
    const pal = [col.head, col.accent, '#ffd166', '#06d6a0', '#ef476f', '#118ab2'];
    for (let i = 0; i < 70; i++) {
      const sp = 140 + hash(i) * 160, span = H + 100, y = ((hash(i + 7) * span + t * sp) % span) - 50;
      const x = hash(i + 1) * W + Math.sin(t * 1.5 + i) * 30;
      g.save(); g.translate(x, y); g.rotate(t * 3 + i); g.scale(Math.cos(t * 4 + i), 1);
      g.fillStyle = pal[i % pal.length]; g.fillRect(-9, -5, 18, 10); g.restore();
    }
  } else if (fx === 'bokeh') {
    for (let i = 0; i < 16; i++) {
      const sp = 14 + hash(i) * 22, span = H + 400, y = H + 200 - ((hash(i + 3) * span + t * sp) % span);
      const x = hash(i + 9) * W + Math.sin(t * 0.3 + i) * 40, r = 40 + hash(i + 2) * 90;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col.accent, 0.18)); gr.addColorStop(1, rgba(col.accent, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  } else if (fx === 'hearts') {
    for (let i = 0; i < 18; i++) {
      const sp = 60 + hash(i) * 60, span = H + 200, y = H + 100 - ((hash(i + 3) * span + t * sp) % span);
      const x = hash(i + 9) * W + Math.sin(t + i) * 30, s = 16 + hash(i + 2) * 22;
      g.save(); g.translate(x, y); g.fillStyle = rgba(i % 2 ? col.head : '#ff6b8b', 0.7);
      g.beginPath(); g.moveTo(0, s * 0.35); g.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s * 1.1, 0, -s * 0.45); g.bezierCurveTo(s * 0.4, -s * 1.1, s, -s * 0.4, 0, s * 0.35); g.fill(); g.restore();
    }
  }
}

// ---------- content ----------
function colorOf(col, key) {
  return { head: col.head, accent: col.accent, ink: col.ink, ink2: rgba(col.ink, 0.78) }[key] || col.ink;
}

function drawContent(g, inv, col, id, local, dur, alphaScene, photo, opts2 = {}) {
  const box = BOX[inv.layout] || BOX.minimal;
  const { lines, total } = layoutScene(g, inv, id, box);
  let y = box.y + (box.h - total) / 2;
  const cx = box.x + box.w / 2;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.shadowColor = col.dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)'; g.shadowBlur = 14;
  let idx = 0;
  for (const ln of lines) {
    if (ln.gap) { y += ln.gap; continue; }
    const delay = 0.15 + Math.min(idx, 12) * 0.12; idx++;
    const pr = easeOut(clamp((local - delay) / 0.75));
    const a = pr * alphaScene;
    if (ln.photo) {
      const r = ln.h / 2 - 10, py = y + ln.h / 2;
      g.save(); g.globalAlpha = a;
      g.shadowBlur = 0;
      g.strokeStyle = col.accent; g.lineWidth = 8; g.beginPath(); g.arc(cx, py, r + 14, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.arc(cx, py, r + 28, 0, Math.PI * 2); g.stroke();
      if (photo) {
        g.beginPath(); g.arc(cx, py, r, 0, Math.PI * 2); g.clip();
        const s = Math.max((2 * r) / photo.width, (2 * r) / photo.height), w = photo.width * s, h = photo.height * s;
        g.drawImage(photo, cx - w / 2, py - h / 2 + (1 - pr) * 20, w, h);
      } else { g.fillStyle = rgba(col.soft, 0.6); g.beginPath(); g.arc(cx, py, r, 0, Math.PI * 2); g.fill(); }
      g.restore(); y += ln.h; continue;
    }
    if (ln.symbol || ln.monogram) {
      g.save(); g.globalAlpha = a; g.shadowBlur = 0; const sz = ln.h * (0.85 + 0.15 * pr), my = y + ln.h / 2;
      if (ln.symbol) drawSymbol(g, inv.symbol, cx, my, sz, col, { image: opts2.symbolImage });
      else drawLogo(g, inv, cx, my, sz, col);
      g.restore(); y += ln.h; continue;
    }
    if (ln.divider) {
      g.save(); g.globalAlpha = a; g.shadowBlur = 0; const my = y + ln.h / 2, w = 260 * pr;
      g.strokeStyle = col.accent; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx - w, my); g.lineTo(cx - 26, my); g.moveTo(cx + 26, my); g.lineTo(cx + w, my); g.stroke();
      g.fillStyle = col.accent; g.beginPath(); g.moveTo(cx, my - 14); g.lineTo(cx + 14, my); g.lineTo(cx, my + 14); g.lineTo(cx - 14, my); g.fill();
      g.restore(); y += ln.h; continue;
    }
    const fs = setFont(g, ln.blk, ln.size, inv);
    const by = y + ln.lh * 0.78 + (1 - pr) * 36;
    g.globalAlpha = a;
    if (ln.blk.shimmer) {
      const w = g.measureText(ln.text).width, sh = ((local * 0.35) % 1.6) - 0.3;
      const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      const hi = col.dark ? mix(col.head, '#ffffff', 0.6) : mix(col.head, '#ffffff', 0.4);
      gr.addColorStop(0, col.head); gr.addColorStop(clamp(sh - 0.12), col.head); gr.addColorStop(clamp(sh), hi); gr.addColorStop(clamp(sh + 0.12), col.head); gr.addColorStop(1, col.head);
      g.fillStyle = gr;
    } else g.fillStyle = colorOf(col, ln.blk.color);
    g.fillText(ln.text, cx, by);
    y += ln.lh;
  }
  g.shadowBlur = 0; g.globalAlpha = 1;
}

// ---------- hidden watermark ----------
// Faint tiled text plus a low-contrast bit pattern. Invisible at normal viewing, readable when levels are boosted.
function drawWatermark(g, col, code) {
  if (!code) return;
  g.save();
  g.globalAlpha = 0.028; g.fillStyle = col.dark ? '#ffffff' : '#000000';
  g.font = '600 30px Poppins, sans-serif'; g.textAlign = 'center'; if ('letterSpacing' in g) g.letterSpacing = '6px';
  g.translate(W / 2, H / 2); g.rotate(-Math.PI / 6);
  for (let y = -H; y < H; y += 260) for (let x = -W; x < W; x += 620) g.fillText(code, x + ((y / 260) % 2) * 310, y);
  g.restore();
  // 48-bit cell code in the bottom-right corner
  let bits = 0n; for (const ch of code) bits = (bits * 31n + BigInt(ch.charCodeAt(0))) & ((1n << 48n) - 1n);
  g.save(); g.globalAlpha = 0.05; const s = 10, x0 = W - 8 * s - 24, y0 = H - 6 * s - 24;
  for (let i = 0; i < 48; i++) { g.fillStyle = (bits >> BigInt(i)) & 1n ? (col.dark ? '#fff' : '#000') : 'transparent'; g.fillRect(x0 + (i % 8) * s, y0 + Math.floor(i / 8) * s, s, s); }
  g.restore();
}

// Visible preview watermark: shown until the email gate is passed, so screen recordings aren't worth using.
function drawPreviewMark(g) {
  g.save();
  g.globalAlpha = 0.2; g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2;
  g.font = '700 64px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '10px';
  g.translate(W / 2, H / 2); g.rotate(-Math.PI / 5);
  for (let y = -1400; y <= 1400; y += 300) for (let x = -1200; x <= 1200; x += 760) { const xx = x + ((y / 300) % 2 ? 380 : 0); g.strokeText('PREVIEW', xx, y); g.fillText('PREVIEW', xx, y); }
  g.restore();
}

// ---------- main render ----------
export function renderFrame(g, inv, t, opts = {}) {
  const col = effectiveColors(inv);
  const tl = opts.timeline || buildTimeline(inv);
  const intro = opts.noIntro ? 1 : t / 1.4;
  g.save();
  drawBackground(g, inv, col, t, intro);
  const i = sceneAt(tl, t), sc = tl.scenes[i];
  const local = t - sc.start;
  const isLast = i === tl.scenes.length - 1;
  const fadeIn = clamp(local / 0.6), fadeOut = isLast && !opts.loop ? 1 : clamp((sc.dur - local) / 0.55);
  drawContent(g, inv, col, sc.id, local, sc.dur, easeInOut(Math.min(fadeIn, fadeOut)), opts.photo, opts);
  drawFx(g, inv, col, t);
  if (inv.showCredit && opts.credit) {
    g.globalAlpha = 0.6; g.fillStyle = col.ink; g.textAlign = 'center'; g.font = '400 24px Poppins, sans-serif';
    if ('letterSpacing' in g) g.letterSpacing = '2px';
    g.fillText(opts.credit, W / 2, H - 22); g.globalAlpha = 1;
  }
  drawWatermark(g, col, opts.watermark);
  if (opts.previewMark) drawPreviewMark(g);
  g.restore();
  return { scene: i, timeline: tl };
}

// Render one still for a thumbnail (names scene, everything settled).
export function renderStill(g, inv, sceneId = 'names') {
  const tl = buildTimeline(inv);
  const sc = tl.scenes.find((s) => s.id === sceneId) || tl.scenes[0];
  return renderFrame(g, inv, sc.start + Math.min(sc.dur - 0.7, 2.6), { timeline: tl, noIntro: true, loop: true });
}
