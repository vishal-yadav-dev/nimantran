// Nimantran Studio: template gallery, live preview, editing panels, AI help, sharing and video export.
import * as C from './catalog.js';
import { renderFrame, renderStill, buildTimeline, sceneAt, loadFonts, W, H, drawLogo, effectiveColors } from './engine.js';
import { SYMBOLS, MONO_STYLES } from './symbols.js';
import { attachTyping, transliterate } from './translit.js';
import * as api from './api.js';
import { exportVideo } from './exporter.js';
import { mountViewer, guardCapture } from './viewer.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CREDIT = 'Made with Nimantran';
const SCENE_LABEL = { blessing: 'Blessing', names: 'Names', message: 'Invitation', details: 'Date & venue', events: 'Programme', closing: 'Closing' };
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } },
};

let inv, health = { online: false, ai: false, email: false };
let saved = store.get('nm.saved');
let tab = 'text', typing = store.get('nm.typing') ?? true;
let photoImg = null, symbolImg = null, aiUndo = null;
let unlocked = !!store.get('nm.unlocked'), lockedScene = 1;

// ---------- state ----------
let draftT;
function changed({ rerender = false, thumbs = false, fonts = false } = {}) {
  inv._rev = (inv._rev || 0) + 1;
  clearTimeout(draftT); draftT = setTimeout(() => store.set('nm.draft', stripBlob(inv)), 400);
  $('#tname').textContent = `${C.OCCASIONS[inv.occasion].label} · ${C.LAYOUTS[inv.layout].label} · ${C.PALETTES[inv.palette]?.label || 'Custom colours'}`;
  if (fonts) loadFonts(inv).then(() => { inv._rev++; });
  if (thumbs) resetThumbs();
  if (rerender) renderPanel();
}
function stripBlob(o) { const c = { ...o }; if (c.music?.startsWith('blob:')) delete c.music; return c; }
function setPath(obj, path, val) {
  const ks = path.split('.'); let o = obj;
  for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; o = o[ks[i]]; }
  o[ks.at(-1)] = val;
}
function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
async function loadImg(src) { if (!src) return null; const i = new Image(); i.src = src; try { await i.decode(); return i; } catch { return null; } }
async function refreshImages() { photoImg = await loadImg(inv.photo); symbolImg = await loadImg(inv.symbolImage); }

function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms); }
function openModal(html) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}</div>`;
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
  document.body.appendChild(m); return m;
}

// ---------- player ----------
const cv = $('#cv'), g = cv.getContext('2d');
cv.addEventListener('contextmenu', (e) => e.preventDefault());
guardCapture(document.querySelector('.stage'));
let playing = true, t0 = performance.now(), tNow = 0, tl = null, tlRev = -1, chipsKey = '';
function sizeCanvas() { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(90, Math.round(r.width * d)); cv.height = Math.max(160, Math.round(r.height * d)); }
new ResizeObserver(sizeCanvas).observe(cv);
function frame(now) {
  if (inv) {
    if (tlRev !== inv._rev) { tl = buildTimeline(inv); tlRev = inv._rev; renderSceneChips(); if (tNow > tl.duration) seek(0); }
    if (!unlocked) { const sc = tl.scenes[Math.min(lockedScene, tl.scenes.length - 1)]; tNow = sc.start + Math.min(sc.dur - 0.7, 2.6); }
    else if (playing) { tNow = (now - t0) / 1000; if (tNow > tl.duration + 1.5) { t0 = now; tNow = 0; } }
    const k = Math.min(cv.width / W, cv.height / H);
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0e0c14'; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(k, 0, 0, k, (cv.width - W * k) / 2, (cv.height - H * k) / 2);
    const r = renderFrame(g, inv, Math.min(tNow, tl.duration - 0.01), { timeline: tl, photo: photoImg, symbolImage: symbolImg, credit: inv.showCredit ? CREDIT : '', previewMark: !unlocked });
    $('#timefill').style.width = Math.min(100, (tNow / tl.duration) * 100) + '%';
    $$('#sceneChips .chip').forEach((c, i) => c.setAttribute('aria-current', i === r.scene));
  }
  requestAnimationFrame(frame);
}
function seek(t) { tNow = t; t0 = performance.now() - t * 1000; }
function renderSceneChips() {
  const key = tl.scenes.map((s) => s.id).join();
  if (key === chipsKey) return; chipsKey = key;
  $('#sceneChips').innerHTML = tl.scenes.map((s, i) => `<button class="chip" data-i="${i}">${SCENE_LABEL[s.id]}</button>`).join('');
}
$('#sceneChips').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b && !unlocked) { lockedScene = +b.dataset.i; return; } if (b) { seek(tl.scenes[+b.dataset.i].start + 0.05); if (!playing) togglePlay(); } });
function togglePlay() { if (!unlocked) return unlockGate(); playing = !playing; if (playing) seek(tNow); $('#btnPlay').textContent = playing ? 'Pause' : 'Play'; }
$('#btnPlay').addEventListener('click', togglePlay);
$('#btnRestart').addEventListener('click', () => { if (!unlocked) return unlockGate(); seek(0); if (!playing) togglePlay(); });
$('#lock').addEventListener('click', () => unlockGate());

// ---------- gallery ----------
const gs = { occ: null, layout: 'all', pal: 'all', limit: 60 };
function buildGalleryControls() {
  gs.occ = inv.occasion;
  $('#occChips').innerHTML = [['all', 'All'], ...Object.entries(C.OCCASIONS).map(([k, o]) => [k, o.label])]
    .map(([k, l]) => `<button class="chip" data-occ="${k}" aria-pressed="${k === gs.occ}">${esc(l)}</button>`).join('');
  $('#layoutFilter').innerHTML = `<option value="all">All layouts</option>` + Object.entries(C.LAYOUTS).map(([k, l]) => `<option value="${k}">${l.label}</option>`).join('');
  $('#palFilter').innerHTML = `<button class="sw all" data-pal="all" aria-pressed="true" title="All colours"></button>` +
    Object.entries(C.PALETTES).map(([k, p]) => `<button class="sw" data-pal="${k}" aria-pressed="false" title="${p.label}" style="background:linear-gradient(135deg,${p.bg[0]} 50%,${p.head} 50%)"></button>`).join('');
  $('#occChips').addEventListener('click', (e) => { const b = e.target.closest('[data-occ]'); if (!b) return; gs.occ = b.dataset.occ; gs.limit = 60; $$('#occChips .chip').forEach((c) => c.setAttribute('aria-pressed', c === b)); renderGallery(); });
  $('#layoutFilter').addEventListener('change', (e) => { gs.layout = e.target.value; gs.limit = 60; renderGallery(); });
  $('#palFilter').addEventListener('click', (e) => { const b = e.target.closest('[data-pal]'); if (!b) return; gs.pal = b.dataset.pal; gs.limit = 60; $$('#palFilter .sw').forEach((c) => c.setAttribute('aria-pressed', c === b)); renderGallery(); });
  $('#grid').addEventListener('click', async (e) => {
    const more = e.target.closest('.more'); if (more) { gs.limit += 90; renderGallery(); return; }
    const tile = e.target.closest('[data-tid]'); if (!tile) return;
    inv = C.newInvite(tile.dataset.tid, inv); inv._rev = (inv._rev || 0) + 1;
    $$('#grid .tile').forEach((t) => t.setAttribute('aria-current', t === tile));
    await refreshImages(); await loadFonts(inv); changed({ rerender: true }); seek(0);
    if (matchMedia('(max-width: 920px)').matches) showPane('panePreview');
  });
}
function filtered() {
  return C.allTemplates().filter((t) => (gs.occ === 'all' || t.occasion === gs.occ) && (gs.layout === 'all' || t.layout === gs.layout) && (gs.pal === 'all' || t.palette === gs.pal))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
function renderGallery() {
  const list = filtered(), total = C.allTemplates().length;
  $('#gcount').textContent = `${list.length.toLocaleString('en-IN')} of ${total.toLocaleString('en-IN')}`;
  const shown = list.slice(0, gs.limit);
  $('#grid').innerHTML = shown.map((t) => `<button class="tile" data-tid="${t.id}" aria-current="${t.id === inv.templateId}" title="${esc(C.OCCASIONS[t.occasion].label + ' · ' + t.name)}">
      <div class="th" style="background:linear-gradient(${C.PALETTES[t.palette].bg[0]},${C.PALETTES[t.palette].bg[1]})">${t.score >= 8 ? '<span class="star">Top pick</span>' : ''}<img alt="" data-thumb="${t.id}"></div>
      <span>${esc(gs.occ === 'all' ? C.OCCASIONS[t.occasion].label + ' · ' : '')}${esc(t.name)}</span></button>`).join('')
    + (list.length > gs.limit ? `<button class="btn more">Show more (${(list.length - gs.limit).toLocaleString('en-IN')} left)</button>` : '');
  observeThumbs($('#grid'));
}

// thumbnails: rendered on demand into one small canvas, cached as JPEG blobs
const thumbCache = new Map(), queue = [];
let pumping = false, thumbVer = 0;
const tc = document.createElement('canvas'); tc.width = 216; tc.height = 384; const tg = tc.getContext('2d');
const io = new IntersectionObserver((ents) => { for (const e of ents) if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); } pump(); }, { rootMargin: '300px' });
function observeThumbs(root) { $$('img[data-thumb]', root).forEach((img) => { const k = thumbKey(img.dataset.thumb); if (thumbCache.has(k)) img.src = thumbCache.get(k); else io.observe(img); }); }
function thumbKey(tid) { return `${tid}|${inv.lang}|${inv.lang2 || ''}|${thumbVer}`; }
function resetThumbs() { thumbVer++; thumbCache.forEach((u) => URL.revokeObjectURL(u)); thumbCache.clear(); renderGallery(); if (tab === 'design') renderPanel(); }
async function pump() {
  if (pumping) return; pumping = true;
  while (queue.length) {
    const img = queue.shift(); if (!img.isConnected) continue;
    const tid = img.dataset.thumb, key = thumbKey(tid);
    if (!thumbCache.has(key)) {
      const ti = C.newInvite(tid, inv); ti.lang = inv.lang; ti.lang2 = inv.lang2; ti.photo = null; ti._rev = 'th' + key;
      if (img.dataset.keep) { Object.assign(ti, { colors: inv.colors, symbol: inv.symbol, monogram: inv.monogram, type: C.LAYOUTS[ti.layout].type }); ti.symbolImage = null; }
      await loadFonts(ti, 1500);
      tg.setTransform(0.2, 0, 0, 0.2, 0, 0); renderStill(tg, ti);
      const blob = await new Promise((r) => tc.toBlob(r, 'image/jpeg', 0.8));
      thumbCache.set(key, URL.createObjectURL(blob));
    }
    img.src = thumbCache.get(key);
    await new Promise((r) => setTimeout(r, 0));
  }
  pumping = false;
}

// ---------- inspector ----------
$$('.tab').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; $$('.tab').forEach((x) => x.setAttribute('aria-selected', x === b)); renderPanel(); }));
const panel = $('#panel');

function langOptions(sel, withNone) {
  return (withNone ? `<option value="">None</option>` : '') + Object.entries(C.LANGS).map(([k, l]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${l.native} (${l.label})</option>`).join('');
}
function input(path, label, { type = 'text', area = false, lang, ph = '', extra = '' } = {}) {
  const v = getPath(inv, path) ?? '';
  const ctl = area ? `<textarea data-bind="${path}" ${lang ? `data-lang="${lang}"` : ''} rows="3" placeholder="${esc(ph)}">${esc(v)}</textarea>`
    : `<input type="${type}" data-bind="${path}" ${lang ? `data-lang="${lang}"` : ''} value="${esc(v)}" placeholder="${esc(ph)}">`;
  return `<label class="field"><span>${label}</span>${extra ? `<div class="inline">${ctl}${extra}</div>` : ctl}</label>`;
}
function textFields(lang, heading) {
  const o = C.OCCASIONS[inv.occasion], nNames = Math.max((o.names.en || []).length, (inv.text[lang]?.names || []).length);
  const names = nNames === 2 ? `<div class="two">${input(`text.${lang}.names.0`, 'Name 1', { lang })}${input(`text.${lang}.names.1`, 'Name 2', { lang })}</div>`
    : nNames === 1 ? input(`text.${lang}.names.0`, inv.occasion === 'griha' ? 'Home name' : 'Name', { lang }) : '';
  return `${heading}${names}
    ${input(`text.${lang}.title`, 'Title', { lang })}
    ${input(`text.${lang}.tagline`, 'Tagline', { lang, extra: `<button class="btn small" data-act="taglines" data-lang="${lang}" title="Tagline ideas">Ideas</button>` })}
    ${input(`text.${lang}.message`, 'Invitation message', { lang, area: true })}
    ${input(`text.${lang}.host`, 'From', { lang })}
    ${input(`text.${lang}.closing`, 'Closing line', { lang })}`;
}

function renderPanel() {
  const L1 = inv.lang, L2 = inv.lang2 && inv.lang2 !== inv.lang ? inv.lang2 : null;
  const ln = (l) => C.LANGS[l].label;
  let h = '';
  if (tab === 'text') {
    h = `<div class="two"><label class="field"><span>Main language</span><select data-bind="lang" data-re="1">${langOptions(L1)}</select></label>
      <label class="field"><span>Second language</span><select data-bind="lang2" data-re="1">${langOptions(L2 || '', true).replace(`<option value="${L1}"`, `<option disabled value="${L1}"`)}</select></label></div>
      ${L1 !== 'en' || (L2 && L2 !== 'en') ? `<label class="check"><input type="checkbox" data-act="typing" ${typing ? 'checked' : ''}> Type in English letters and we convert to ${[L1, L2].filter((l) => l && l !== 'en').map((l) => C.LANGS[l].native).join(' / ')} as you type</label>` : ''}
      <div class="two"><label class="field"><span>Blessing line</span><select data-bind="blessing" data-re="1">${Object.entries(C.BLESSINGS).map(([k, b]) => `<option value="${k}" ${k === inv.blessing ? 'selected' : ''}>${b.label}</option>`).join('')}</select></label>
      <label class="field"><span>Sacred symbol</span><select data-bind="symbol" data-re="1">${symbolOptions()}</select></label></div>
      ${inv.symbol === 'custom' ? `<div class="row"><button class="btn small" data-act="symbolUpload">${inv.symbolImage ? 'Change image' : 'Upload idol or symbol image'}</button>${inv.symbolImage ? '<button class="btn small ghost" data-act="symbolRemove">Remove</button>' : ''}<span class="note">PNG with a transparent background looks best.</span></div>` : ''}
      <div class="sect">${textFields(L1, `<h3>${ln(L1)} text</h3>`)}</div>
      ${L2 ? `<div class="sect">${textFields(L2, `<div class="row" style="justify-content:space-between"><h3>${ln(L2)} text</h3><button class="btn small" data-act="translate" data-to="${L2}">Translate from ${ln(L1)}</button></div>`)}</div>` : ''}`;
  } else if (tab === 'details') {
    h = `<div class="two">${input('date', 'Date', { type: 'date' })}${input('time', 'Time', { type: 'time' })}</div>
      ${input(`text.${L1}.venue`, `Venue (${ln(L1)})`, { lang: L1 })}${L2 ? input(`text.${L2}.venue`, `Venue (${ln(L2)})`, { lang: L2 }) : ''}
      ${input(`text.${L1}.address`, `Address (${ln(L1)})`, { lang: L1 })}${L2 ? input(`text.${L2}.address`, `Address (${ln(L2)})`, { lang: L2 }) : ''}
      ${input('mapQuery', 'Google Maps search for directions', { ph: 'e.g. Rambagh Palace, Jaipur' })}
      ${input('contact', 'RSVP contact shown on the last scene', { type: 'tel', ph: 'e.g. Call Rahul: 98xxxxxx10' })}
      <div class="sect"><h3>Programme</h3>
        ${inv.events.map((e, i) => `<div class="ev"><div class="row">${`<input type="text" data-bind="events.${i}.name.${L1}" data-lang="${L1}" value="${esc(e.name[L1] || '')}" aria-label="Event name">`}<button class="btn small ghost" data-act="evDel" data-i="${i}" aria-label="Remove event">✕</button></div>
          ${L2 ? `<input type="text" data-bind="events.${i}.name.${L2}" data-lang="${L2}" value="${esc(e.name[L2] || '')}" aria-label="Event name in ${ln(L2)}">` : ''}
          <div class="two"><input type="date" data-bind="events.${i}.date" value="${e.date}" aria-label="Event date"><input type="time" data-bind="events.${i}.time" value="${e.time}" aria-label="Event time"></div></div>`).join('')}
        <div class="row"><select id="evPreset" style="flex:1">${Object.entries(C.EVENT_NAMES).map(([k, n]) => `<option value="${k}">${n.en} · ${n[L1]}</option>`).join('')}<option value="custom">Custom event</option></select><button class="btn small" data-act="evAdd">Add event</button></div>
      </div>
      <div class="sect"><h3>Scenes</h3><div class="row">${Object.entries(SCENE_LABEL).map(([k, l]) => `<label class="check"><input type="checkbox" data-bind="scenes.${k}" ${inv.scenes[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>`;
  } else if (tab === 'design') {
    const col = effectiveColors(inv);
    h = `<div class="field"><span class="lbl">Layout</span><div class="cards">${Object.entries(C.LAYOUTS).map(([k, l]) => `<button class="card" data-act="layout" data-v="${k}" aria-pressed="${k === inv.layout}"><img alt="" data-thumb="${inv.occasion}.${k}.${inv.palette in C.PALETTES ? inv.palette : 'ivory'}" data-keep="1"><span>${l.label}</span></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Colour theme</span><div class="swatches">${Object.entries(C.PALETTES).map(([k, p]) => `<button class="sw" data-act="palette" data-v="${k}" aria-pressed="${k === inv.palette}" title="${p.label}" style="background:linear-gradient(135deg,${p.bg[0]} 50%,${p.head} 50%)"></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Custom colours</span><div class="colors">
        ${[['colors.bg.0', 'Top'], ['colors.bg.1', 'Bottom'], ['colors.head', 'Headline'], ['colors.accent', 'Accent'], ['colors.ink', 'Text']].map(([p, l]) => `<label><input type="color" data-bind="${p}" value="${getPath(inv, p)}">${l}</label>`).join('')}</div></div>
      <div class="field"><span class="lbl">Lettering</span><div class="chips typechips">${Object.entries(C.TYPE_STYLES).map(([k, s]) => `<button class="chip" data-act="type" data-v="${k}" aria-pressed="${k === inv.type}" style="font-family:'${s[C.LANGS[L1].script]}'">${esc(sampleWord(L1))} · ${s.label}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Effects</span><div class="chips">${['petals', 'sparkles', 'confetti', 'bokeh', 'hearts', 'none'].map((k) => `<button class="chip" data-act="fx" data-v="${k}" aria-pressed="${k === inv.fx}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div>
      <label class="field"><span>Speed</span><input type="range" min="0.6" max="1.6" step="0.1" data-bind="speed" data-num="1" value="${inv.speed}"></label>
      <div class="sect"><h3>Initials logo</h3>
        <label class="check"><input type="checkbox" data-bind="monogram.on" ${inv.monogram?.on ? 'checked' : ''}> Show initials logo on the names scene</label>
        <div class="chips">${Object.entries(MONO_STYLES).map(([k, l]) => `<button class="chip" data-act="mono" data-v="${k}" aria-pressed="${k === inv.monogram?.style}">${l}</button>`).join('')}</div>
        <div class="row"><canvas id="logoPrev" width="240" height="240" style="width:120px;height:120px;border-radius:12px;background:linear-gradient(${col.bg[0]},${col.bg[1]})"></canvas>
          <div style="display:grid;gap:8px;flex:1">${input('monogram.text', 'Custom letters (optional)', { ph: 'e.g. A D' })}<button class="btn small" data-act="logoPng">Download logo (PNG)</button></div></div>
      </div>
      <label class="check"><input type="checkbox" data-bind="showCredit" ${inv.showCredit ? 'checked' : ''}> Show “${CREDIT}” at the bottom</label>`;
  } else if (tab === 'media') {
    h = `<div class="field"><span class="lbl">Photo</span>
        ${inv.photo ? `<div class="photo"><img src="${inv.photo}" alt="Your photo"><div class="row"><button class="btn small" data-act="photo">Change</button><button class="btn small ghost" data-act="photoDel">Remove</button></div></div>`
        : `<button class="drop" data-act="photo">Add a photo of the couple, the birthday star or your home<br><small>JPG or PNG, shown in a round frame on the names scene</small></button>`}</div>
      <div class="field"><span class="lbl">Background music</span>
        ${inv.music ? `<div class="row"><button class="btn small" data-act="musicPlay">Play / stop</button><button class="btn small" data-act="music">Change</button><button class="btn small ghost" data-act="musicDel">Remove</button></div>`
        : `<button class="drop" data-act="music">Add music (MP3 or M4A, up to 8 MB)</button>`}
        <p class="note">Guests hear it after they open the invitation, and it is mixed into the video. Use music you have the rights to share.</p></div>`;
  } else if (tab === 'ai') {
    const st = !health.online ? '<p class="note warn">Preview mode: no server is connected, so these buttons use the built-in text library instead of Gemini.</p>'
      : !health.ai ? '<p class="note warn">The server has no GEMINI_API_KEY yet, so these buttons use the built-in text library.</p>'
      : '<p class="note">Powered by Gemini (free tier). Avoid typing phone numbers or private details here: Google may review free-tier prompts.</p>';
    h = `${st}
      <div class="sect"><h3>Write my invitation</h3>
        <div class="two"><label class="field"><span>Tone</span><select id="aiTone"><option>Traditional</option><option>Warm and personal</option><option>Modern and short</option><option>Fun</option><option>Formal</option></select></label>
        <label class="field"><span>Languages</span><input type="text" disabled value="${[L1, L2].filter(Boolean).map(ln).join(' + ')}"></label></div>
        <label class="field"><span>Anything to include?</span><textarea id="aiNotes" rows="2" placeholder="e.g. dinner after the pheras, kids welcome, mention grandparents' blessings"></textarea></label>
        <button class="btn primary" data-act="aiWrite">Write it for me</button></div>
      <div class="sect"><h3>Translate everything</h3>
        <div class="row"><select id="aiTo" style="flex:1">${Object.entries(C.LANGS).filter(([k]) => k !== L1).map(([k, l]) => `<option value="${k}">${l.native} (${l.label})</option>`).join('')}</select><button class="btn" data-act="aiTranslate">Translate</button></div>
        <p class="note">Copies your ${ln(L1)} text, names, venue and programme into the other language, then you can show it as the second language.</p></div>
      <div class="sect"><h3>Names and venue in ${C.LANGS[L1].native}</h3>
        <button class="btn" data-act="aiTranslit" ${L1 === 'en' ? 'disabled' : ''}>Convert from English spelling</button>
        <p class="note">Turns “Aarav & Diya, Rambagh Palace” into the ${ln(L1)} script using your English text.</p></div>
      <div class="sect"><h3>Tagline ideas</h3><button class="btn" data-act="taglines" data-lang="${L1}">Suggest 4 taglines</button><div class="ai-out" id="aiOut"></div></div>
      ${aiUndo ? '<button class="btn ghost" data-act="aiUndo">Undo last AI change</button>' : ''}`;
  } else if (tab === 'share') {
    const link = saved ? `${location.origin}/i/${saved.id}` : '';
    h = !health.online ? `<p class="note warn">Sharing needs the Nimantran server. This preview runs without it, so you can try the guest view and the video download below, but links and RSVPs are not saved.</p>
        <button class="btn" data-act="guest">Open guest view</button>` : `
      <div class="sect" style="border:0;padding:0"><h3>Invitation link</h3>
        ${saved ? `<div class="linkbox"><input type="text" readonly value="${esc(link)}" id="lnk"><button class="btn small" data-act="copy">Copy</button></div>
          <div class="row"><a class="btn small" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(link)}">Send on WhatsApp</a><a class="btn small" target="_blank" rel="noopener" href="${esc(link)}">Open</a><button class="btn small primary" data-act="save">Save changes</button></div>
          <p class="note">Guests always see your latest saved version. Keep this private edit link to come back later: <br><span style="word-break:break-all">${esc(`${location.origin}/?edit=${saved.id}&key=${saved.key}`)}</span></p>`
          : `<button class="btn primary" data-act="save">Save and get link</button>`}
      </div>
      ${saved ? `<div class="sect"><div class="row" style="justify-content:space-between"><h3>Replies</h3><button class="btn small" data-act="rsvps">Refresh</button></div><div id="rsvpList" class="note">Press Refresh to load replies.</div></div>` : ''}`;
    h += `<div class="sect"><h3>Video</h3><p class="note">A 1080×1920 vertical video for WhatsApp and Instagram, about ${Math.round(buildTimeline(inv).duration)} seconds long.</p><button class="btn" data-act="video">Download video</button></div>`;
  }
  panel.innerHTML = h;
  $$('[data-lang]', panel).forEach((el) => { if (el.matches('input,textarea')) attachTyping(el, () => el.dataset.lang, () => typing); });
  if (tab === 'design') { observeThumbs(panel); drawLogoPreview(); }
}
function symbolOptions() {
  const groups = {};
  for (const [k, s] of Object.entries(SYMBOLS)) (groups[s.group] ||= []).push([k, s]);
  return Object.entries(groups).map(([gname, items]) => {
    const opts = items.map(([k, s]) => `<option value="${k}" ${k === (inv.symbol || 'none') ? 'selected' : ''}>${s.label}</option>`).join('');
    return gname ? `<optgroup label="${gname}">${opts}</optgroup>` : opts;
  }).join('');
}
function sampleWord(l) { return { en: 'Aa', hi: 'शुभ', pa: 'ਸ਼ੁਭ', gu: 'શુભ' }[l]; }
function drawLogoPreview() {
  const c = $('#logoPrev'); if (!c) return; const lg = c.getContext('2d'); lg.clearRect(0, 0, 240, 240); drawLogo(lg, inv, 120, 120, 200);
}

panel.addEventListener('input', (e) => {
  const el = e.target, path = el.dataset.bind; if (!path) return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.num) v = Number(v);
  if (path === 'lang2' && !v) v = null;
  setPath(inv, path, v);
  if (path === 'lang' && inv.lang2 === v) inv.lang2 = null;
  const langish = path === 'lang' || path === 'lang2';
  changed({ rerender: !!el.dataset.re, fonts: langish, thumbs: langish });
  if (path.startsWith('monogram') || path.startsWith('colors')) drawLogoPreview();
});
panel.addEventListener('change', (e) => { if (e.target.dataset.act === 'typing') { typing = e.target.checked; store.set('nm.typing', typing); } });

panel.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]'); if (!b || b.type === 'checkbox') return;
  const act = b.dataset.act, v = b.dataset.v;
  try {
    if (act === 'layout') { inv.layout = v; inv.type = C.LAYOUTS[v].type; inv.fx = C.LAYOUTS[v].fx; inv.templateId = C.templateId(inv.occasion, v, inv.palette); await loadFonts(inv); changed({ rerender: true }); }
    if (act === 'palette') { C.applyPalette(inv, v); changed({ rerender: true }); }
    if (act === 'type') { inv.type = v; await loadFonts(inv); changed({ rerender: true }); }
    if (act === 'fx') { inv.fx = v; changed({ rerender: true }); }
    if (act === 'mono') { inv.monogram = { ...(inv.monogram || {}), style: v, on: true }; changed({ rerender: true }); }
    if (act === 'logoPng') downloadLogo();
    if (act === 'evDel') { inv.events.splice(+b.dataset.i, 1); changed({ rerender: true }); }
    if (act === 'evAdd') {
      const k = $('#evPreset').value, last = inv.events.at(-1) || { date: inv.date, time: inv.time };
      inv.events.push({ key: k, name: k === 'custom' ? { en: 'New event', hi: 'नया कार्यक्रम', pa: 'ਨਵਾਂ ਪ੍ਰੋਗਰਾਮ', gu: 'નવો કાર્યક્રમ' } : { ...C.EVENT_NAMES[k] }, date: last.date, time: last.time });
      inv.scenes.events = true; changed({ rerender: true });
    }
    if (act === 'symbolUpload') { const f = await pickFile('image/*'); if (f) { inv.symbolImage = await fileToImage(f, 600, 'image/png'); symbolImg = await loadImg(inv.symbolImage); changed({ rerender: true }); } }
    if (act === 'symbolRemove') { inv.symbolImage = null; symbolImg = null; changed({ rerender: true }); }
    if (act === 'photo') { const f = await pickFile('image/*'); if (f) { inv.photo = await fileToImage(f, 720, 'image/jpeg'); photoImg = await loadImg(inv.photo); changed({ rerender: true }); } }
    if (act === 'photoDel') { inv.photo = null; photoImg = null; changed({ rerender: true }); }
    if (act === 'music') {
      const f = await pickFile('audio/*'); if (!f) return;
      if (f.size > 8 * 1024 * 1024) { toast('That file is over 8 MB. Please pick a shorter or smaller song.'); return; }
      inv.music = health.online ? await api.uploadMusic(f) : URL.createObjectURL(f);
      changed({ rerender: true }); toast(health.online ? 'Music added.' : 'Music added for this preview only.');
    }
    if (act === 'musicDel') { stopMusic(); inv.music = null; changed({ rerender: true }); }
    if (act === 'musicPlay') toggleMusic();
    if (act === 'guest') openGuest();
    if (act === 'video') videoGate();
    if (act === 'save') await shareSave();
    if (act === 'copy') { const t = $('#lnk'); try { await navigator.clipboard.writeText(t.value); toast('Link copied.'); } catch { t.select(); toast('Press Ctrl+C to copy.'); } }
    if (act === 'rsvps') await loadRsvps();
    if (act === 'translate' || act === 'aiTranslate') await aiTranslate(act === 'translate' ? b.dataset.to : $('#aiTo').value, b);
    if (act === 'taglines') await aiTaglines(b.dataset.lang, b);
    if (act === 'aiWrite') await aiWrite(b);
    if (act === 'aiTranslit') await aiTranslit(b);
    if (act === 'aiUndo' && aiUndo) { inv = aiUndo; aiUndo = null; changed({ rerender: true, thumbs: true }); toast('Undone.'); }
  } catch (err) { toast(err.message || 'Something went wrong.'); }
});

// ---------- AI ----------
async function busy(btn, fn) { const t = btn.textContent; btn.disabled = true; btn.textContent = 'Working…'; try { return await fn(); } finally { btn.disabled = false; btn.textContent = t; } }
function snapshot() { aiUndo = structuredClone(inv); }
async function aiWrite(btn) {
  const langs = [inv.lang, inv.lang2].filter(Boolean);
  const res = await busy(btn, () => api.ai('write', { occasion: inv.occasion, names: inv.text.en.names, tone: $('#aiTone').value, notes: $('#aiNotes').value.slice(0, 400), langs }));
  snapshot();
  for (const [l, f] of Object.entries(res.texts || {})) for (const k of C.FIELD_KEYS) if (f[k]) inv.text[l][k] = f[k];
  changed({ rerender: true }); toast(res.offline ? 'Filled with ready-made text (Gemini not connected).' : 'Done. Check the Text tab.');
}
async function aiTranslate(to, btn) {
  const from = inv.lang, f = inv.text[from];
  const res = await busy(btn, () => api.ai('translate', { occasion: inv.occasion, from, to, fields: { ...Object.fromEntries(C.FIELD_KEYS.map((k) => [k, f[k]])), names: f.names, venue: f.venue, address: f.address, events: inv.events.map((e) => e.name[from] || e.name.en) } }));
  snapshot();
  const out = res.fields || {};
  for (const k of [...C.FIELD_KEYS, 'venue', 'address']) if (out[k]) inv.text[to][k] = out[k];
  if (Array.isArray(out.names) && out.names.length) inv.text[to].names = out.names;
  if (Array.isArray(out.events)) out.events.forEach((n, i) => { if (n && inv.events[i]) inv.events[i].name[to] = n; });
  if (!inv.lang2) inv.lang2 = to;
  changed({ rerender: true, thumbs: true }); toast(res.offline ? `Used ready-made ${C.LANGS[to].label} text (Gemini not connected).` : `Translated to ${C.LANGS[to].label}.`);
}
async function aiTranslit(btn) {
  const en = inv.text.en, items = [...(en.names || []), en.venue || '', en.address || ''];
  const res = await busy(btn, () => api.ai('transliterate', { to: inv.lang, items }));
  snapshot();
  const n = (en.names || []).length, it = res.items || [];
  inv.text[inv.lang].names = it.slice(0, n); if (it[n]) inv.text[inv.lang].venue = it[n]; if (it[n + 1]) inv.text[inv.lang].address = it[n + 1];
  changed({ rerender: true, thumbs: true }); toast('Converted.');
}
async function aiTaglines(lang, btn) {
  const res = await busy(btn, () => api.ai('taglines', { occasion: inv.occasion, lang, names: inv.text[lang].names, tone: $('#aiTone')?.value || 'Warm and personal' }));
  const opts = res.options || [];
  const html = opts.map((o) => `<button data-tag="${esc(o)}">${esc(o)}</button>`).join('');
  let out = $('#aiOut');
  if (!out) { const m = openModal(`<h2>Tagline ideas</h2><div class="ai-out" id="aiOut2">${html}</div><button class="btn" data-close>Close</button>`); out = $('#aiOut2', m); out.addEventListener('click', (e) => { const t = e.target.closest('[data-tag]'); if (t) { inv.text[lang].tagline = t.dataset.tag; changed({ rerender: true }); m.remove(); } }); return; }
  out.innerHTML = html;
  out.onclick = (e) => { const t = e.target.closest('[data-tag]'); if (t) { inv.text[lang].tagline = t.dataset.tag; changed(); toast('Tagline updated.'); } };
}

// ---------- files ----------
function pickFile(accept) { return new Promise((res) => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.onchange = () => res(i.files[0] || null); i.click(); }); }
async function fileToImage(file, max, type) {
  const img = await loadImg(URL.createObjectURL(file)); if (!img) throw new Error('That image could not be opened.');
  const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.85);
}
let musicEl = null;
function toggleMusic() { if (musicEl && !musicEl.paused) return stopMusic(); musicEl = new Audio(inv.music); musicEl.play().catch(() => toast('Could not play this file.')); }
function stopMusic() { musicEl?.pause(); musicEl = null; }
function downloadLogo() {
  const c = document.createElement('canvas'); c.width = c.height = 1200;
  drawLogo(c.getContext('2d'), inv, 600, 600, 1100);
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `${fileBase(inv, 'Initials Logo')}.png`; document.body.appendChild(a); a.click(); a.remove();
  toast('Logo saved as PNG (transparent background).');
}

// File names like "Aarav-and-Diya-Wedding-Invitation.mp4" or "Bansal-Family-Diwali-Party-Invitation.mp4".
function fileBase(inv, suffix = 'Invitation') {
  const ascii = (x) => String(x || '').normalize('NFKD').replace(/[^A-Za-z0-9 ]+/g, ' ').trim();
  let names = (inv.text.en?.names || []).map(ascii).filter(Boolean);
  if (!names.length) names = (inv.text[inv.lang]?.names || []).map((n) => ascii(/[A-Za-z]/.test(n) ? n : '')).filter(Boolean);
  const host = ascii((inv.text.en?.host || '').replace(/^(hosted by|with love,?|love,?|from)\s+/i, '').replace(/^the\s+/i, ''));
  const occ = ascii(C.OCCASIONS[inv.occasion].label.split('/')[0]);
  const who = names.length ? names.join(' and ') : (/family/i.test(host) ? host : '');
  const parts = [who, occ, suffix].filter(Boolean).join(' ').replace(/\b(\w+)( \1\b)+/gi, '$1');
  return parts.split(/\s+/).filter(Boolean).map((w) => (w === 'and' ? w : w[0].toUpperCase() + w.slice(1))).join('-').slice(0, 90) || 'Invitation';
}

// ---------- guest view ----------
function openGuest() {
  if (!unlocked) return unlockGate(openGuest);
  const was = playing; if (playing) togglePlay();
  mountViewer($('#viewerRoot'), inv, { credit: CREDIT, previewMark: !unlocked, onClose: () => { if (was && !playing) togglePlay(); } });
}

// ---------- share ----------
async function shareSave() {
  if (!health.online) { tab = 'share'; selectTab(); return; }
  saved = await api.saveInvite(inv, saved?.id, saved?.key); store.set('nm.saved', saved);
  tab = 'share'; selectTab(); toast('Saved. Your link is ready.');
}
function selectTab() { $$('.tab').forEach((x) => x.setAttribute('aria-selected', x.dataset.tab === tab)); renderPanel(); if (matchMedia('(max-width: 920px)').matches) showPane('paneEdit'); }
async function loadRsvps() {
  const list = await api.listRsvps(saved.id, saved.key), el = $('#rsvpList');
  if (!list.length) { el.textContent = 'No replies yet.'; return; }
  const yes = list.filter((r) => r.attending === 'yes'), heads = yes.reduce((s, r) => s + (Number(r.guests) || 1), 0);
  el.innerHTML = `<p class="note"><b>${yes.length}</b> coming (${heads} guests) · <b>${list.length - yes.length}</b> can't make it</p>
    <table class="rsvps"><tr><th>Name</th><th>Reply</th><th>Guests</th><th>Message</th></tr>${list.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.attending === 'yes' ? 'Coming' : 'No'}</td><td>${esc(r.guests)}</td><td>${esc(r.note || '')}</td></tr>`).join('')}</table>`;
}

// ---------- email first: unlock the animated preview ----------
function lockUi() {
  $('#lock').hidden = unlocked;
  $('#btnPlay').textContent = unlocked ? (playing ? 'Pause' : 'Play') : 'Play';
}
function unlockGate(after) {
  if (unlocked) return after?.();
  const lead = store.get('nm.lead') || {};
  const m = openModal(`<h2>See your invitation come alive</h2>
    <p>Enter your email to unlock the animated preview, the guest view and your free video download.</p>
    <form id="ugate" style="display:grid;gap:12px">
      <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email" placeholder="you@example.com" value="${esc(lead.email || '')}"></label>
      <label class="field"><span>Name (optional)</span><input type="text" name="name" autocomplete="name" value="${esc(lead.name || '')}"></label>
      <label class="check"><input type="checkbox" name="marketing"> Also send me new templates and festival offers</label>
      <p class="note">By continuing, you agree to our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-close>Not now</button><button class="btn primary">Unlock</button></div>
    </form>`);
  $('#ugate', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target)); fd.marketing = !!fd.marketing;
    try { if (health.online) await api.registerDownload({ ...fd, inviteId: saved?.id || null, purpose: 'preview' }); }
    catch (err) { toast(err.message); return; }
    store.set('nm.lead', { email: fd.email, name: fd.name }); unlocked = true; store.set('nm.unlocked', true);
    m.remove(); playing = true; seek(0); lockUi(); toast('Unlocked. Enjoy the preview!');
    after?.();
  });
}

// ---------- video download (email gate) ----------
function videoGate() {
  if (!unlocked) return unlockGate(videoGate);
  const lead = store.get('nm.lead') || {};
  const m = openModal(`<h2>Download your video, free</h2>
    <p>Enter your email and we'll also send the download link to your inbox.</p>
    <form id="gate" style="display:grid;gap:12px">
      <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email" placeholder="you@example.com" value="${esc(lead.email || '')}"></label>
      <label class="field"><span>Name (optional)</span><input type="text" name="name" autocomplete="name" value="${esc(lead.name || '')}"></label>
      <label class="check"><input type="checkbox" name="marketing"> Also send me new templates and festival offers</label>
      <p class="note">By continuing, you agree to our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Get my video</button></div>
    </form>`);
  $('#gate', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target)); fd.marketing = !!fd.marketing;
    let code = 'NMT-PREVIEW', lead = null;
    try {
      if (health.online) { lead = await api.registerDownload({ ...fd, inviteId: saved?.id || null, purpose: 'video' }); code = lead.code; }
    } catch (err) { toast(err.message); return; }
    const box = $('.box', m);
    box.innerHTML = `<h2>Making your video…</h2><p>Keep this tab open. It records in real time and takes about ${Math.round(buildTimeline(inv).duration + 1)} seconds.</p><div class="progress"><b id="vp"></b></div>`;
    const was = playing; if (playing) togglePlay();
    try {
      const blob = await exportVideo(inv, { photo: photoImg, symbolImage: symbolImg, music: inv.music, credit: inv.showCredit ? CREDIT : '', watermark: code, onProgress: (p) => { const b = $('#vp'); if (b) b.style.width = (p * 100).toFixed(1) + '%'; } });
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm', url = URL.createObjectURL(blob), fname = `${fileBase(inv)}.${ext}`;
      let sentMsg = '';
      if (health.online) {
        try { const up = await api.uploadVideo(code, blob, fname); sentMsg = up.emailed ? `We've also emailed the link to ${esc(fd.email)}.` : 'Email sending is not set up on the server yet, so no email was sent.'; }
        catch (err) { sentMsg = 'The video is ready, but the email copy could not be sent: ' + esc(err.message); }
      }
      box.innerHTML = `<h2>Your video is ready</h2><video controls playsinline src="${url}"></video>
        <p class="note">${ext === 'webm' ? 'This browser saved a WebM file. WhatsApp prefers MP4, which recent Chrome, Edge and Safari produce.' : 'MP4, ready for WhatsApp status and Instagram reels.'} ${sentMsg}</p>
        ${health.online ? '' : '<p class="note">Preview mode: your browser may block the download here. In the app it saves straight to your device.</p>'}
        <div class="row" style="justify-content:flex-end"><a class="btn primary" href="${url}" download="${esc(fname)}">Save video</a><button class="btn" data-close>Close</button></div>`;
      const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      box.innerHTML = `<h2>Could not make the video</h2><p>${esc(err.message)}</p><button class="btn" data-close>Close</button>`;
    } finally { if (was && !playing) togglePlay(); }
  });
}

// ---------- top bar + mobile tabs ----------
$('#btnGuest').addEventListener('click', openGuest);
$('#btnGuest2').addEventListener('click', openGuest);
$('#btnVideo').addEventListener('click', videoGate);
$('#btnShare').addEventListener('click', () => shareSave().catch((e) => toast(e.message)));
function showPane(id) { $$('.work > .pane').forEach((p) => p.classList.toggle('active', p.id === id)); $$('.mtabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.m === id)); }
$$('.mtabs button').forEach((b) => b.addEventListener('click', () => showPane(b.dataset.m)));
function setStatus() {
  const s = $('#status');
  s.classList.toggle('on', health.online && health.ai);
  s.lastChild.textContent = !health.online ? 'Preview mode · no server' : health.ai ? 'Gemini connected' : 'Server online · AI off';
}

// ---------- boot ----------
(async function init() {
  const q = new URLSearchParams(location.search);
  health = await api.serverHealth(); setStatus();
  if (q.get('edit') && q.get('key') && health.online) {
    try { inv = await api.loadInvite(q.get('edit')); saved = { id: q.get('edit'), key: q.get('key') }; store.set('nm.saved', saved); } catch { toast('That invitation could not be loaded.'); }
  }
  if (!inv) { const d = store.get('nm.draft'); if (d?.v === 1 && C.OCCASIONS[d.occasion]) inv = d; }
  if (!inv) inv = C.newInvite('wedding.arch.maroon');
  inv.symbol ??= 'none'; inv.monogram ??= { on: false, style: 'ring', text: '' };
  inv._rev = 1;
  await refreshImages();
  buildGalleryControls(); renderGallery(); renderPanel(); changed();
  await loadFonts(inv); inv._rev++;
  lockUi();
  requestAnimationFrame(frame);
  window.__studio = { fileBase: () => fileBase(inv), get inv() { return inv; }, seek, togglePlay, renderPanel, setTab: (t) => { tab = t; selectTab(); } };
})();
