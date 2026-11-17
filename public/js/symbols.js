// Sacred symbols and the initials logo, drawn as vector art so they stay crisp at any size.

export const SYMBOLS = {
  none:      { label: 'None', group: '' },
  ganesh:    { label: 'Ganesh ji', group: 'Hindu' },
  krishna:   { label: 'Krishna (flute & feather)', group: 'Hindu' },
  om:        { label: 'Om', group: 'Hindu' },
  swastik:   { label: 'Swastik', group: 'Hindu / Jain' },
  kalash:    { label: 'Kalash', group: 'Hindu' },
  lotus:     { label: 'Lotus', group: 'Hindu / Buddhist' },
  diya:      { label: 'Diya', group: 'Festive' },
  ikonkar:   { label: 'Ik Onkar', group: 'Sikh' },
  khanda:    { label: 'Khanda', group: 'Sikh' },
  jain:      { label: 'Jain symbol', group: 'Jain' },
  crescent:  { label: 'Crescent & star', group: 'Muslim' },
  cross:     { label: 'Cross', group: 'Christian' },
  chakra:    { label: 'Dharma chakra', group: 'Buddhist' },
  david:     { label: 'Star of David', group: 'Jewish' },
  custom:    { label: 'My own image', group: 'Upload' },
};

export const MONO_STYLES = { ring: 'Ring', arch: 'Arch', laurel: 'Laurel', diamond: 'Diamond', crest: 'Crest' };

const TAU = Math.PI * 2;

// Draw symbol `id` centred at (cx, cy), fitting a square of `size`.
export function drawSymbol(g, id, cx, cy, size, col, opts = {}) {
  if (!id || id === 'none') return;
  g.save(); g.translate(cx, cy);
  const s = size / 200; g.scale(s, s); // design space: 200×200, centred
  g.lineCap = 'round'; g.lineJoin = 'round';
  const gold = col.accent, head = col.head, glow = col.dark ? 'rgba(255,220,140,.35)' : 'rgba(255,200,90,.28)';
  const halo = g.createRadialGradient(0, 0, 10, 0, 0, 110); halo.addColorStop(0, glow); halo.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(0, 0, 110, 0, TAU); g.fill();
  const fn = ART[id];
  if (id === 'custom') {
    const img = opts.image;
    if (img) { const k = Math.min(190 / img.width, 190 / img.height); g.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); }
  } else if (fn) fn(g, gold, head, col, opts);
  g.restore();
}

const ART = {
  ganesh(g, gold, head) {
    g.strokeStyle = gold; g.lineWidth = 5; g.fillStyle = 'rgba(255,215,140,.18)';
    // ears
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(sx * 30, -40);
      g.bezierCurveTo(sx * 95, -70, sx * 105, 10, sx * 62, 40);
      g.bezierCurveTo(sx * 50, 48, sx * 38, 30, sx * 34, 12);
      g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 2.5; g.beginPath(); g.moveTo(sx * 42, -28); g.bezierCurveTo(sx * 80, -40, sx * 82, 8, sx * 56, 26); g.stroke(); g.lineWidth = 5;
    }
    // head
    g.beginPath(); g.moveTo(-34, -46); g.bezierCurveTo(-40, 0, -24, 26, -16, 34); g.lineTo(16, 34); g.bezierCurveTo(24, 26, 40, 0, 34, -46); g.closePath(); g.fill(); g.stroke();
    // crown
    g.fillStyle = gold; g.beginPath(); g.moveTo(-36, -46); g.lineTo(36, -46); g.lineTo(26, -66); g.lineTo(14, -60); g.lineTo(0, -92); g.lineTo(-14, -60); g.lineTo(-26, -66); g.closePath(); g.fill();
    g.fillStyle = head; g.beginPath(); g.arc(0, -70, 5, 0, TAU); g.fill();
    // tilak, eyes
    g.strokeStyle = '#d0342c'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -38); g.lineTo(0, -20); g.stroke();
    g.strokeStyle = gold; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, -24); g.lineTo(-24, -24); g.stroke();
    g.beginPath(); g.arc(-17, -14, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(17, -14, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    // trunk curling to his left
    g.lineWidth = 9; g.beginPath(); g.moveTo(0, -4); g.bezierCurveTo(-4, 30, -14, 54, -4, 72); g.bezierCurveTo(6, 90, 34, 86, 30, 66); g.bezierCurveTo(28, 56, 16, 58, 18, 66); g.stroke();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-8 + i, 14 + i * 12); g.lineTo(5 - i, 14 + i * 12); g.stroke(); }
    // tusk
    g.fillStyle = '#fff6e0'; g.beginPath(); g.moveTo(14, 26); g.quadraticCurveTo(26, 34, 26, 48); g.quadraticCurveTo(18, 38, 10, 34); g.fill();
  },
  krishna(g, gold) {
    // peacock feather
    g.save(); g.rotate(-0.35);
    g.strokeStyle = '#3f7d3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 90); g.quadraticCurveTo(6, 10, 0, -70); g.stroke();
    g.strokeStyle = 'rgba(70,150,90,.7)'; g.lineWidth = 1.4;
    for (let y = -60; y < 70; y += 6) { const w = 34 * Math.sin(((y + 70) / 150) * Math.PI) + 6; g.beginPath(); g.moveTo(2, y); g.quadraticCurveTo(w * 0.6, y - 8, w, y - 18); g.moveTo(2, y); g.quadraticCurveTo(-w * 0.6, y - 8, -w, y - 18); g.stroke(); }
    const eye = [['#2f8f5a', 30, 40], ['#e2b33c', 22, 30], ['#1b6fb3', 16, 22], ['#123c8c', 10, 14], ['#0b1f4d', 5, 7]];
    for (const [c, rx, ry] of eye) { g.fillStyle = c; g.beginPath(); g.ellipse(2, -52, rx, ry, 0, 0, TAU); g.fill(); }
    g.restore();
    // flute
    g.save(); g.rotate(0.42);
    const fl = g.createLinearGradient(0, -8, 0, 8); fl.addColorStop(0, '#f2cf7a'); fl.addColorStop(1, '#a8741c');
    g.fillStyle = fl; g.beginPath(); g.roundRect(-96, -8, 192, 16, 8); g.fill();
    g.fillStyle = '#5a3a0a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-10 + i * 16, 0, 3.4, 0, TAU); g.fill(); }
    g.fillStyle = gold; g.fillRect(-80, -9, 6, 18); g.fillRect(70, -9, 6, 18);
    g.strokeStyle = '#d0342c'; g.lineWidth = 3; g.beginPath(); g.moveTo(-78, 8); g.quadraticCurveTo(-84, 40, -70, 60); g.stroke();
    g.restore();
  },
  om(g, gold, head, col, o) { glyph(g, 'ॐ', 150, gold, '"Tiro Devanagari Hindi", "Mukta", serif'); },
  ikonkar(g, gold) { glyph(g, 'ੴ', 170, gold, '"Tiro Gurmukhi", "Mukta Mahee", serif'); },
  swastik(g, gold, head) {
    g.strokeStyle = '#d0342c'; g.lineWidth = 14;
    g.beginPath(); g.moveTo(0, -70); g.lineTo(0, 70); g.moveTo(-70, 0); g.lineTo(70, 0);
    g.moveTo(0, -70); g.lineTo(52, -70); g.moveTo(70, 0); g.lineTo(70, 52); g.moveTo(0, 70); g.lineTo(-52, 70); g.moveTo(-70, 0); g.lineTo(-70, -52); g.stroke();
    g.fillStyle = gold; for (const [x, y] of [[35, -35], [35, 35], [-35, 35], [-35, -35]]) { g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); }
  },
  kalash(g, gold, head) {
    // mango leaves + coconut
    for (let i = -2; i <= 2; i++) { g.save(); g.translate(0, -40); g.rotate(i * 0.38 - Math.PI / 2); g.fillStyle = i % 2 ? '#3f7a32' : '#5b9a3d'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(32, -15, 66, 0); g.quadraticCurveTo(32, 15, 0, 0); g.fill(); g.restore(); }
    g.fillStyle = '#8a5a2b'; g.beginPath(); g.ellipse(0, -58, 26, 32, 0, 0, TAU); g.fill();
    g.strokeStyle = '#5a3a1a'; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 8, -88); g.lineTo(i * 5, -30); g.stroke(); }
    // pot
    const pg = g.createLinearGradient(-60, 0, 60, 0); pg.addColorStop(0, mix2(gold, '#000', 0.25)); pg.addColorStop(0.4, mix2(gold, '#fff', 0.35)); pg.addColorStop(1, mix2(gold, '#000', 0.3));
    g.fillStyle = pg; g.beginPath(); g.moveTo(-30, -32); g.lineTo(30, -32); g.lineTo(24, -18); g.bezierCurveTo(78, -6, 78, 70, 30, 84); g.lineTo(-30, 84); g.bezierCurveTo(-78, 70, -78, -6, -24, -18); g.closePath(); g.fill();
    g.fillStyle = '#d0342c'; g.fillRect(-60, 14, 120, 8);
    g.strokeStyle = '#d0342c'; g.lineWidth = 4; g.beginPath();
    g.moveTo(0, 30); g.lineTo(0, 62); g.moveTo(-16, 46); g.lineTo(16, 46); g.moveTo(0, 30); g.lineTo(10, 30); g.moveTo(16, 46); g.lineTo(16, 56); g.moveTo(0, 62); g.lineTo(-10, 62); g.moveTo(-16, 46); g.lineTo(-16, 36); g.stroke();
  },
  lotus(g, gold, head) {
    const pet = (a, len, w, c) => { g.save(); g.rotate(a); g.fillStyle = c; g.beginPath(); g.moveTo(0, 20); g.bezierCurveTo(-w, -len * 0.3, -w * 0.4, -len * 0.8, 0, -len); g.bezierCurveTo(w * 0.4, -len * 0.8, w, -len * 0.3, 0, 20); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.stroke(); g.restore(); };
    const p1 = '#e46a95', p2 = '#f39ab8', p3 = '#ffd0e0';
    [-1.25, 1.25].forEach((a) => pet(a, 80, 30, p1)); [-0.75, 0.75].forEach((a) => pet(a, 92, 32, p2)); [-0.3, 0.3].forEach((a) => pet(a, 100, 30, p2)); pet(0, 108, 30, p3);
    g.fillStyle = '#3f7d3a'; g.beginPath(); g.ellipse(0, 34, 70, 12, 0, 0, TAU); g.fill();
    g.fillStyle = gold; for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(i * 8, 10 - Math.abs(i) * 2, 3, 0, TAU); g.fill(); }
  },
  diya(g, gold) {
    const fl = g.createRadialGradient(0, -50, 4, 0, -50, 50); fl.addColorStop(0, '#fffbe0'); fl.addColorStop(0.5, '#ffd34d'); fl.addColorStop(1, 'rgba(255,122,26,0)');
    g.fillStyle = fl; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-30, -30, 0, -96); g.quadraticCurveTo(30, -30, 0, 0); g.fill();
    g.fillStyle = '#a5481f'; g.beginPath(); g.moveTo(-80, 8); g.quadraticCurveTo(0, 100, 80, 8); g.quadraticCurveTo(50, 20, 96, -12); g.quadraticCurveTo(0, 22, -80, 8); g.fill();
    g.fillStyle = gold; g.beginPath(); g.ellipse(0, 10, 80, 13, 0, 0, TAU); g.fill();
  },
  khanda(g, gold) {
    g.strokeStyle = gold; g.fillStyle = gold;
    // chakkar
    g.lineWidth = 12; g.beginPath(); g.arc(0, 8, 46, 0, TAU); g.stroke();
    // central khanda
    g.beginPath(); g.moveTo(0, -92); g.lineTo(11, -70); g.lineTo(9, 40); g.lineTo(-9, 40); g.lineTo(-11, -70); g.closePath(); g.fill();
    g.fillRect(-20, 40, 40, 7); g.fillRect(-5, 47, 10, 22); g.beginPath(); g.arc(0, 74, 7, 0, TAU); g.fill();
    // two kirpans
    for (const sx of [-1, 1]) {
      g.lineWidth = 8; g.beginPath(); g.moveTo(sx * 28, 70); g.bezierCurveTo(sx * 70, 40, sx * 86, -10, sx * 66, -60); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.moveTo(sx * 14, 62); g.lineTo(sx * 34, 80); g.stroke();
      g.beginPath(); g.arc(sx * 18, 86, 7, 0, TAU); g.fill();
    }
  },
  jain(g, gold) {
    g.strokeStyle = '#d0342c'; g.lineWidth = 10; const s = 34;
    g.beginPath(); g.moveTo(0, 20 - s); g.lineTo(0, 20 + s); g.moveTo(-s, 20); g.lineTo(s, 20);
    g.moveTo(0, 20 - s); g.lineTo(s * 0.7, 20 - s); g.moveTo(s, 20); g.lineTo(s, 20 + s * 0.7); g.moveTo(0, 20 + s); g.lineTo(-s * 0.7, 20 + s); g.moveTo(-s, 20); g.lineTo(-s, 20 - s * 0.7); g.stroke();
    g.fillStyle = gold; [-26, 0, 26].forEach((x) => { g.beginPath(); g.arc(x, -40, 7, 0, TAU); g.fill(); });
    g.lineWidth = 6; g.strokeStyle = gold; g.beginPath(); g.arc(0, -78, 22, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.beginPath(); g.arc(0, -86, 6, 0, TAU); g.fill();
  },
  crescent(g, gold) {
    g.fillStyle = gold; g.beginPath(); g.arc(-10, 0, 76, 0, TAU); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(16, -10, 66, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over';
    star5(g, 46, -18, 26, 11); g.fill();
  },
  cross(g, gold) {
    const cg = g.createLinearGradient(-20, -90, 20, 90); cg.addColorStop(0, mix2(gold, '#fff', 0.35)); cg.addColorStop(1, gold);
    g.fillStyle = cg; g.beginPath(); g.roundRect(-12, -90, 24, 180, 6); g.fill(); g.beginPath(); g.roundRect(-60, -48, 120, 24, 6); g.fill();
  },
  chakra(g, gold) {
    g.strokeStyle = gold; g.fillStyle = gold; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 76, 0, TAU); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); g.lineTo(Math.cos(a) * 76, Math.sin(a) * 76); g.stroke(); g.beginPath(); g.arc(Math.cos(a) * 88, Math.sin(a) * 88, 7, 0, TAU); g.fill(); }
  },
  david(g, gold) {
    g.strokeStyle = gold; g.lineWidth = 10;
    for (const r of [0, Math.PI]) { g.beginPath(); for (let i = 0; i < 3; i++) { const a = r - Math.PI / 2 + (i / 3) * TAU; i ? g.lineTo(Math.cos(a) * 82, Math.sin(a) * 82) : g.moveTo(Math.cos(a) * 82, Math.sin(a) * 82); } g.closePath(); g.stroke(); }
  },
};

function glyph(g, ch, size, color, font) {
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `400 ${size}px ${font}`;
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  g.fillText(ch, 0, 8);
}
function star5(g, x, y, R, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r : R, a = (i / 10) * TAU - Math.PI / 2; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
function mix2(a, b, t) { const h = (x) => { x = x.replace('#', ''); if (x.length === 3) x = [...x].map((c) => c + c).join(''); return x.match(/../g); }; const _h = (x) => h(x).map((v) => parseInt(v, 16)); const A = _h(a), B = _h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }

// ---------- initials logo ----------
export function initialsOf(names) {
  return names.filter(Boolean).map((n) => [...n.trim()][0] || '').filter(Boolean);
}

export function drawMonogram(g, style, letters, cx, cy, size, col, font) {
  g.save(); g.translate(cx, cy); const s = size / 200; g.scale(s, s);
  g.strokeStyle = col.accent; g.fillStyle = col.accent; g.lineCap = 'round'; g.lineJoin = 'round';
  if (style === 'ring') {
    g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 92, 0, TAU); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 80, 0, TAU); g.stroke();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; g.beginPath(); g.arc(Math.cos(a) * 86, Math.sin(a) * 86, 2.2, 0, TAU); g.fill(); }
  } else if (style === 'arch') {
    g.lineWidth = 5; g.beginPath(); g.moveTo(-70, 92); g.lineTo(-70, -10); g.bezierCurveTo(-70, -70, -20, -80, 0, -100); g.bezierCurveTo(20, -80, 70, -70, 70, -10); g.lineTo(70, 92); g.closePath(); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(-58, 80); g.lineTo(-58, -6); g.bezierCurveTo(-58, -58, -16, -66, 0, -84); g.bezierCurveTo(16, -66, 58, -58, 58, -6); g.lineTo(58, 80); g.closePath(); g.stroke();
  } else if (style === 'laurel') {
    for (const sx of [-1, 1]) {
      g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 84, sx > 0 ? -1.2 : Math.PI + 1.2, sx > 0 ? 1.4 : Math.PI - 1.4, sx < 0); g.stroke();
      for (let i = 0; i < 9; i++) {
        const a = sx > 0 ? -1.1 + i * 0.28 : Math.PI + 1.1 - i * 0.28, x = Math.cos(a) * 84, y = Math.sin(a) * 84;
        g.save(); g.translate(x, y); g.rotate(a + (sx > 0 ? 0.9 : -0.9)); g.beginPath(); g.ellipse(0, 0, 14, 5.5, 0, 0, TAU); g.fill(); g.restore();
      }
    }
  } else if (style === 'diamond') {
    g.lineWidth = 5; g.beginPath(); g.moveTo(0, -98); g.lineTo(98, 0); g.lineTo(0, 98); g.lineTo(-98, 0); g.closePath(); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(0, -84); g.lineTo(84, 0); g.lineTo(0, 84); g.lineTo(-84, 0); g.closePath(); g.stroke();
  } else if (style === 'crest') {
    g.lineWidth = 5; g.beginPath(); g.moveTo(-74, -78); g.lineTo(74, -78); g.lineTo(74, 10); g.bezierCurveTo(74, 60, 30, 84, 0, 98); g.bezierCurveTo(-30, 84, -74, 60, -74, 10); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(-30, -78); g.lineTo(-20, -98); g.lineTo(-8, -86); g.lineTo(0, -104); g.lineTo(8, -86); g.lineTo(20, -98); g.lineTo(30, -78); g.fill();
  }
  // letters
  g.fillStyle = col.head; g.textAlign = 'center'; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  if (letters.length >= 2) {
    g.font = `700 58px ${font(letters[0])}`; g.fillText(letters[0], -24, -14);
    g.font = `700 58px ${font(letters[1])}`; g.fillText(letters[1], 24, 22);
    g.strokeStyle = col.accent; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-16, 40); g.lineTo(16, -36); g.stroke();
  } else {
    g.font = `700 88px ${font(letters[0] || '✦')}`; g.fillText(letters[0] || '✦', 0, 6);
  }
  g.restore();
}
