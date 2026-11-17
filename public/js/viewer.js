// The guest experience: tap to open, story-style scenes, countdown, directions, calendar, RSVP, share.
import { renderFrame, buildTimeline, sceneAt, effectiveColors, loadFonts, W, H, rgba, mix } from './engine.js';
import { UI, LANGS } from './catalog.js';
import { sendRsvp } from './api.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function mountViewer(root, invIn, opts = {}) {
  const inv = structuredClone(invIn); inv._rev = (inv._rev || 0) + 1000;
  const col = effectiveColors(inv);
  let lang = inv.lang;
  const L = (k) => UI[k][lang] || UI[k].en;
  const t = inv.text[lang] || inv.text.en;
  const names = (t.names || []).filter(Boolean);
  const initials = names.map((n) => [...n.trim()][0]).join(' & ') || '✦';

  root.classList.add('nv');
  root.style.setProperty('--nv-bg', col.bg[1]); root.style.setProperty('--nv-bg2', col.bg[0]);
  root.style.setProperty('--nv-accent', col.accent); root.style.setProperty('--nv-head', col.head); root.style.setProperty('--nv-ink', col.ink);
  root.style.setProperty('--nv-chip', col.dark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.7)');
  root.style.setProperty('--nv-chip-ink', col.dark ? '#fff' : mix(col.head, '#000000', 0.2));
  root.innerHTML = `
    <div class="nv-stage">
      <div class="nv-frame">
        <canvas class="nv-canvas" width="${W}" height="${H}" aria-label="Animated invitation"></canvas>
        <div class="nv-bars"></div>
        <button class="nv-tap nv-prev" aria-label="Previous"></button><button class="nv-tap nv-next" aria-label="Next"></button>
        <div class="nv-gate">
          <div class="nv-env">
            <div class="nv-flap"></div>
            <div class="nv-card"><div class="nv-invited"></div><div class="nv-from"></div></div>
            <button class="nv-seal" aria-label="Open invitation"><span></span></button>
          </div>
          <div class="nv-taptxt"></div>
        </div>
        <button class="nv-replay" hidden>↻</button>
      </div>
      <div class="nv-bar">
        <div class="nv-count" aria-live="polite"></div>
        <div class="nv-actions">
          <a class="nv-btn" data-a="map" target="_blank" rel="noopener"></a>
          <a class="nv-btn" data-a="cal" target="_blank" rel="noopener"></a>
          <button class="nv-btn nv-primary" data-a="rsvp"></button>
          <button class="nv-btn" data-a="share"></button>
          ${inv.lang2 && inv.lang2 !== inv.lang ? '<button class="nv-btn nv-lang" data-a="lang"></button>' : ''}
          ${inv.music ? '<button class="nv-btn nv-icon" data-a="mute" aria-label="Music on or off">♫</button>' : ''}
        </div>
      </div>
    </div>
    <div class="nv-sheet" hidden>
      <form class="nv-form">
        <h3></h3>
        <label><span data-l="yourName"></span><input name="name" required maxlength="80" autocomplete="name"></label>
        <div class="nv-seg"><label><input type="radio" name="attending" value="yes" checked><span data-l="attending"></span></label><label><input type="radio" name="attending" value="no"><span data-l="declining"></span></label></div>
        <label><span data-l="guests"></span><input name="guests" type="number" min="1" max="20" value="2"></label>
        <label><span>Message</span><textarea name="note" rows="2" maxlength="300"></textarea></label>
        <div class="nv-formrow"><button type="button" class="nv-btn" data-a="close">✕</button><button class="nv-btn nv-primary" type="submit" data-l="send"></button></div>
        <p class="nv-msg" role="status"></p>
      </form>
    </div>
    ${opts.onClose ? '<button class="nv-close" aria-label="Close guest view">✕</button>' : ''}`;

  const $ = (s) => root.querySelector(s);
  const canvas = $('.nv-canvas'), g = canvas.getContext('2d');
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  if (opts.previewMark) guardCapture(root);
  const gate = $('.nv-gate');

  function labels() {
    const tt = inv.text[lang] || inv.text.en;
    $('.nv-invited').textContent = L('invited');
    $('.nv-from').textContent = tt.title;
    $('.nv-taptxt').textContent = L('tap');
    $('.nv-seal span').textContent = initials;
    $('[data-a=map]').textContent = '📍 ' + L('directions');
    $('[data-a=cal]').textContent = '🗓 ' + L('calendar');
    $('[data-a=rsvp]').textContent = L('rsvp');
    $('[data-a=share]').textContent = L('share');
    const lb = $('[data-a=lang]'); if (lb) lb.textContent = LANGS[lang === inv.lang ? inv.lang2 : inv.lang].native;
    $('.nv-form h3').textContent = L('rsvp');
    root.querySelectorAll('[data-l]').forEach((el) => (el.textContent = L(el.dataset.l)));
    $('[data-a=map]').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(inv.mapQuery || tt.address || tt.venue || '');
    $('[data-a=cal]').href = calendarUrl(inv, tt);
  }
  labels();

  // ---------- photo + music ----------
  let photo = null, symbolImage = null;
  if (inv.photo) { photo = new Image(); photo.src = inv.photo; await photo.decode().catch(() => {}); }
  if (inv.symbolImage) { symbolImage = new Image(); symbolImage.src = inv.symbolImage; await symbolImage.decode().catch(() => {}); }
  let audio = null;
  if (inv.music) { audio = new Audio(inv.music); audio.loop = true; }
  await loadFonts(inv);

  // ---------- playback ----------
  let tl = buildTimeline(inv), t0 = null, paused = true, tNow = 0, raf = 0, ended = false;
  const bars = $('.nv-bars');
  bars.innerHTML = tl.scenes.map(() => '<i><b></b></i>').join('');
  function draw() {
    renderFrame(g, inv, tNow, { timeline: tl, photo, symbolImage, credit: inv.showCredit ? opts.credit : '', previewMark: opts.previewMark });
    const i = sceneAt(tl, tNow);
    [...bars.children].forEach((el, k) => {
      const s = tl.scenes[k]; el.firstChild.style.width = (k < i ? 100 : k > i ? 0 : Math.min(100, ((tNow - s.start) / s.dur) * 100)) + '%';
    });
  }
  function loop(now) {
    if (!paused) {
      tNow = (now - t0) / 1000;
      if (tNow >= tl.duration) { tNow = tl.duration - 0.01; paused = true; ended = true; $('.nv-replay').hidden = false; }
    }
    draw(); raf = requestAnimationFrame(loop);
  }
  function seek(t) { tNow = Math.max(0, Math.min(t, tl.duration - 0.01)); t0 = performance.now() - tNow * 1000; }
  function play() { paused = false; ended = false; $('.nv-replay').hidden = true; seek(ended ? 0 : tNow); }
  tNow = tl.scenes.find((s) => s.id === 'names')?.start + 2.5 || 2; // pretty still behind the gate
  raf = requestAnimationFrame(loop);

  const open = () => {
    gate.classList.add('nv-opening');
    if (audio) audio.play().catch(() => {});
    setTimeout(() => { gate.remove(); seek(0); paused = false; }, 1100);
  };
  gate.addEventListener('click', open);
  if (opts.autoOpen) open();

  $('.nv-prev').addEventListener('click', () => { const i = sceneAt(tl, tNow); seek(tl.scenes[Math.max(0, tNow - tl.scenes[i].start < 1 ? i - 1 : i)].start); if (ended) play(); });
  $('.nv-next').addEventListener('click', () => { const i = sceneAt(tl, tNow); if (i < tl.scenes.length - 1) { seek(tl.scenes[i + 1].start); if (ended) play(); } });
  $('.nv-replay').addEventListener('click', () => { seek(0); paused = false; ended = false; $('.nv-replay').hidden = true; });

  // ---------- countdown ----------
  const target = new Date(`${inv.date}T${inv.time || '00:00'}:00`);
  function tick() {
    const ms = target - Date.now(), el = $('.nv-count');
    if (!el) return;
    if (ms <= 0 && ms > -86400000) { el.textContent = L('today'); return; }
    if (ms <= 0) { el.textContent = ''; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    el.innerHTML = `<b>${d}</b> ${esc(L('days'))} <b>${h}</b> ${esc(L('hours'))} <b>${m}</b> ${esc(L('mins'))}`;
  }
  tick(); const tickT = setInterval(tick, 30000);

  // ---------- actions ----------
  const sheet = $('.nv-sheet'), form = $('.nv-form'), msg = $('.nv-msg');
  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'rsvp') { sheet.hidden = false; form.name.focus(); }
    if (a === 'close') sheet.hidden = true;
    if (a === 'mute' && audio) { audio.paused ? audio.play() : audio.pause(); }
    if (a === 'lang') {
      lang = lang === inv.lang ? inv.lang2 : inv.lang;
      const swap = inv.lang; inv.lang = inv.lang2; inv.lang2 = swap; inv._rev++; tl = buildTimeline(inv); labels(); tick();
    }
    if (a === 'share') {
      const url = opts.shareUrl || location.href, tt = inv.text[lang] || inv.text.en;
      const text = `${tt.title}${names.length ? ' · ' + names.join(' & ') : ''}`;
      if (navigator.share) { try { await navigator.share({ title: text, text, url }); return; } catch { /* fall through */ } }
      window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank', 'noopener');
    }
  });
  if (opts.onClose) $('.nv-close').addEventListener('click', () => { destroy(); opts.onClose(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)); data.guests = Number(data.guests) || 1;
    msg.textContent = '…';
    try {
      if (opts.id) await sendRsvp(opts.id, data);
      msg.textContent = L('thanks') + (opts.id ? '' : ' (Preview: nothing was sent.)');
      setTimeout(() => { sheet.hidden = true; msg.textContent = ''; }, 2200);
    } catch (err) { msg.textContent = err.message; }
  });

  function destroy() { cancelAnimationFrame(raf); clearInterval(tickT); audio?.pause(); root.innerHTML = ''; root.classList.remove('nv'); }
  return { destroy };
}

// Deterrent only: blur the invitation when the window loses focus (most desktop capture tools steal focus).
export function guardCapture(el) {
  const on = () => el.classList.add('nm-shield'), off = () => el.classList.remove('nm-shield');
  addEventListener('blur', on); addEventListener('focus', off);
  document.addEventListener('visibilitychange', () => (document.hidden ? on() : off()));
}

function calendarUrl(inv, tt) {
  const start = `${inv.date.replaceAll('-', '')}T${(inv.time || '10:00').replace(':', '')}00`;
  const d = new Date(`${inv.date}T${inv.time || '10:00'}:00`); d.setHours(d.getHours() + 4);
  const p = (x) => String(x).padStart(2, '0');
  const end = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const title = `${tt.title}${(tt.names || []).filter(Boolean).length ? ' · ' + tt.names.filter(Boolean).join(' & ') : ''}`;
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + start + '/' + end
    + '&details=' + encodeURIComponent(tt.message || '') + '&location=' + encodeURIComponent([tt.venue, tt.address].filter(Boolean).join(', ')) + '&ctz=Asia/Kolkata';
}
