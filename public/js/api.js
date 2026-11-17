// Talks to the Nimantran server. When there is no server (static preview), every call has an offline fallback.
import { OCCASIONS, FIELD_KEYS, LANGS } from './catalog.js';
import { transliterate } from './translit.js';

let health = null;
export async function serverHealth() {
  if (health) return health;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 2000);
    const r = await fetch('/api/health', { signal: ctl.signal });
    if (!r.ok) throw new Error();
    health = { online: true, ...(await r.json()) };
  } catch { health = { online: false, ai: false, email: false }; }
  return health;
}

async function post(url, body, headers = {}) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`);
  return j;
}

// ---------- AI (Gemini via server) ----------
export async function ai(task, input) {
  const h = await serverHealth();
  if (h.online && h.ai) return post('/api/ai', { task, input });
  return offlineAI(task, input);
}

function offlineAI(task, input) {
  if (task === 'write') {
    const o = OCCASIONS[input.occasion]; const texts = {};
    for (const l of input.langs) { texts[l] = {}; for (const k of FIELD_KEYS) texts[l][k] = o[k][l]; }
    return { texts, offline: true };
  }
  if (task === 'translate') {
    const o = OCCASIONS[input.occasion]; const out = {};
    for (const k of FIELD_KEYS) out[k] = o[k][input.to];
    // Offline we can only re-spell Latin text into Indic scripts; anything else keeps its current value.
    const latin = (x) => /^[\x00-\x7F]*$/.test(x || '');
    if (input.to !== 'en' && (input.fields.names || []).every(latin)) out.names = input.fields.names.map((n) => transliterate(n, input.to));
    if (input.to !== 'en' && latin(input.fields.venue)) out.venue = transliterate(input.fields.venue || '', input.to);
    if (input.to !== 'en' && latin(input.fields.address)) out.address = transliterate(input.fields.address || '', input.to);
    return { fields: out, offline: true };
  }
  if (task === 'transliterate') return { items: input.items.map((s) => transliterate(s, input.to)), offline: true };
  if (task === 'taglines') {
    const o = OCCASIONS[input.occasion];
    const extra = {
      en: ['Where love meets forever', 'A celebration of togetherness', 'Blessings, laughter and love', 'Save the date for joy'],
      hi: ['प्यार, विश्वास और साथ', 'खुशियों का एक नया अध्याय', 'आशीर्वाद, हँसी और प्रेम', 'यादों से सजी एक शाम'],
      pa: ['ਪਿਆਰ, ਵਿਸ਼ਵਾਸ ਅਤੇ ਸਾਥ', 'ਖੁਸ਼ੀਆਂ ਦਾ ਨਵਾਂ ਅਧਿਆਇ', 'ਅਸ਼ੀਰਵਾਦ, ਹਾਸਾ ਅਤੇ ਪਿਆਰ', 'ਯਾਦਾਂ ਨਾਲ ਸਜੀ ਇੱਕ ਸ਼ਾਮ'],
      gu: ['પ્રેમ, વિશ્વાસ અને સાથ', 'ખુશીઓનો નવો અધ્યાય', 'આશીર્વાદ, હાસ્ય અને પ્રેમ', 'યાદોથી સજેલી એક સાંજ'],
    }[input.lang];
    return { options: [o.tagline[input.lang], ...extra].slice(0, 4), offline: true };
  }
  throw new Error('Unknown AI task');
}

// ---------- invites ----------
export async function saveInvite(inv, id, key) {
  const body = { invite: stripLocal(inv) };
  if (id && key) {
    const r = await fetch(`/api/invites/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-edit-key': key }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Could not save'); return { id, key };
  }
  const j = await post('/api/invites', body); return { id: j.id, key: j.editKey };
}
export async function loadInvite(id) {
  const r = await fetch(`/api/invites/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error('This invitation was not found.');
  return (await r.json()).invite;
}
export async function sendRsvp(id, data) { return post(`/api/invites/${encodeURIComponent(id)}/rsvp`, data); }
export async function listRsvps(id, key) {
  const r = await fetch(`/api/invites/${encodeURIComponent(id)}/rsvps`, { headers: { 'x-edit-key': key } });
  if (!r.ok) throw new Error('Could not load replies'); return (await r.json()).rsvps;
}
export async function uploadMusic(file) {
  const r = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': file.type || 'audio/mpeg' }, body: file });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Upload failed'); return j.url;
}

// ---------- download gate ----------
export async function registerDownload(data) { return post('/api/leads', data); }
export async function uploadVideo(code, blob, filename = '') {
  const r = await fetch(`/api/videos/${encodeURIComponent(code)}?name=${encodeURIComponent(filename)}`, { method: 'POST', headers: { 'Content-Type': blob.type || 'video/webm' }, body: blob });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Upload failed'); return j;
}

function stripLocal(inv) {
  const { _rev, ...rest } = inv;
  if (rest.music && rest.music.startsWith('blob:')) delete rest.music;
  return rest;
}

export const LANG_LIST = Object.entries(LANGS).map(([k, v]) => ({ k, ...v }));
