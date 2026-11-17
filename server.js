// Nimantran Studio server. Node 18+, no required dependencies (nodemailer is optional, for emails).
// Copyright (c) Nimantran Studio. All rights reserved.
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(ROOT, '.env'));

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'].filter(Boolean))];
const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 400);
const AI_PER_IP_HOUR = Number(process.env.AI_PER_IP_HOUR || 30);
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const DATA = path.resolve(ROOT, process.env.DATA_DIR || 'data');
const PUB = path.join(ROOT, 'public');
for (const d of ['invites', 'rsvps', 'media', 'videos']) fs.mkdirSync(path.join(DATA, d), { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm' };

// ---------- helpers ----------
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const rid = (n) => { const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return [...crypto.randomBytes(n)].map((b) => a[b % a.length]).join(''); };
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const clip = (s, n) => String(s ?? '').slice(0, n);
function clientIp(req) {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  return (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
}
function send(res, status, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body) || typeof body === 'string';
  res.writeHead(status, { 'Content-Type': isBuf ? 'text/plain; charset=utf-8' : 'application/json', 'X-Content-Type-Options': 'nosniff', 'X-Powered-By': 'Nimantran Studio', ...headers });
  res.end(isBuf ? body : JSON.stringify(body));
}
async function readBody(req, limit) {
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw new HttpError(413, 'That upload is too large.'); chunks.push(c); }
  return Buffer.concat(chunks);
}
async function readJson(req, limit = 1e6) {
  try { return JSON.parse((await readBody(req, limit)).toString('utf8') || '{}'); } catch (e) { if (e instanceof HttpError) throw e; throw new HttpError(400, 'Invalid JSON.'); }
}
const buckets = new Map();
function limit(key, max, windowMs) {
  const now = Date.now(), arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) throw new HttpError(429, 'Too many requests. Please wait a little and try again.');
  arr.push(now); buckets.set(key, arr);
}
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => now - t < 36e5)) buckets.delete(k); }, 6e5).unref();
const validId = (id) => /^[A-Za-z0-9]{6,40}$/.test(id);
const validCode = (c) => /^NMT-[A-Z0-9]{6,10}$/.test(c);

// ---------- invites ----------
function sanitizeInvite(inv) {
  if (!inv || typeof inv !== 'object') throw new HttpError(400, 'Missing invitation.');
  const json = JSON.stringify(inv);
  if (json.length > 3_500_000) throw new HttpError(413, 'This invitation is too large. Try a smaller photo.');
  for (const k of ['photo', 'symbolImage']) if (inv[k] && !/^data:image\/(png|jpeg|webp);base64,/.test(inv[k])) inv[k] = null;
  if (inv.music && !/^\/media\/[A-Za-z0-9]+\.(mp3|m4a|aac|ogg|wav)$/.test(inv.music)) inv.music = null;
  return inv;
}
const invFile = (id) => path.join(DATA, 'invites', `${id}.json`);
async function readInvite(id) { try { return JSON.parse(await fsp.readFile(invFile(id), 'utf8')); } catch { throw new HttpError(404, 'Invitation not found.'); } }

// ---------- Gemini ----------
const SYSTEM = `You write text for Indian invitation cards and videos. Write natural, warm, culturally appropriate language that a native speaker would use on a real card.
Script rules: Hindi in Devanagari, Punjabi in Gurmukhi, Gujarati in Gujarati script, English in plain English.
Never invent phone numbers, addresses, URLs, prices, dates or facts that were not given. Keep lines short enough for a phone screen. Reply with JSON only.`;
const LANG_NAME = { en: 'English', hi: 'Hindi (Devanagari script)', pa: 'Punjabi (Gurmukhi script)', gu: 'Gujarati (Gujarati script)' };
const OCC = { wedding: 'Hindu/Indian wedding', engagement: 'engagement (sagai/ring ceremony)', haldi: 'haldi ceremony', mehendi: 'mehendi night', sangeet: 'sangeet night',
  reception: 'wedding reception', birthday: 'birthday party', kids: "child's first birthday", anniversary: 'wedding anniversary', griha: 'griha pravesh (housewarming puja)',
  godhbharai: 'godh bharai / baby shower', naamkaran: 'naamkaran (naming ceremony)', puja: 'Satyanarayan puja / katha at home', diwali: 'Diwali party', lohri: 'Lohri celebration', garba: 'Navratri garba night' };
const S = (type, extra = {}) => ({ type, ...extra });
const FIELDS = ['title', 'tagline', 'message', 'host', 'closing'];
const textObj = S('OBJECT', { properties: Object.fromEntries(FIELDS.map((f) => [f, S('STRING')])), required: FIELDS });

function buildTask(task, input) {
  const langs = (Array.isArray(input.langs) ? input.langs : [input.lang, input.to]).filter((l) => LANG_NAME[l]);
  const occ = OCC[input.occasion] || 'family celebration';
  const names = (Array.isArray(input.names) ? input.names : []).map((n) => clip(n, 60)).filter(Boolean);
  if (task === 'write') {
    if (!langs.length) throw new HttpError(400, 'Pick a language.');
    return {
      prompt: `Write the text for a ${occ} invitation.
Names: ${names.join(' & ') || '(none given)'}. Tone: ${clip(input.tone, 40) || 'warm'}.
Host's notes: ${clip(input.notes, 400) || '(none)'}.
Write it separately in each of these languages (write each one natively, not as a word-for-word translation): ${langs.map((l) => `${l} = ${LANG_NAME[l]}`).join('; ')}.
For each language give: title (2–5 words), tagline (under 10 words), message (1–2 sentences, under 40 words, inviting the guest and their family), host (a short sign-off such as "From the Sharma family"; use a generic warm sign-off if no surname is known), closing (under 10 words).`,
      schema: S('OBJECT', { properties: { texts: S('OBJECT', { properties: Object.fromEntries(langs.map((l) => [l, textObj])), required: langs }) }, required: ['texts'] }),
    };
  }
  if (task === 'translate') {
    const from = LANG_NAME[input.from], to = LANG_NAME[input.to];
    if (!from || !to) throw new HttpError(400, 'Unknown language.');
    const f = input.fields || {}, src = {};
    for (const k of [...FIELDS, 'venue', 'address']) src[k] = clip(f[k], 400);
    src.names = (f.names || []).slice(0, 4).map((n) => clip(n, 60));
    src.events = (f.events || []).slice(0, 12).map((n) => clip(n, 60));
    return {
      prompt: `Translate this ${occ} invitation from ${from} into ${to}. Make it sound natural to native ${to} speakers rather than literal.
Write personal names and place names in ${to} phonetically (transliterate, do not translate their meaning). Keep arrays the same length and order.
${JSON.stringify(src)}`,
      schema: S('OBJECT', { properties: { fields: S('OBJECT', { properties: { ...Object.fromEntries([...FIELDS, 'venue', 'address'].map((k) => [k, S('STRING')])), names: S('ARRAY', { items: S('STRING') }), events: S('ARRAY', { items: S('STRING') }) }, required: [...FIELDS, 'names', 'events'] }) }, required: ['fields'] }),
    };
  }
  if (task === 'transliterate') {
    const to = LANG_NAME[input.to]; if (!to) throw new HttpError(400, 'Unknown language.');
    const items = (input.items || []).slice(0, 10).map((s) => clip(s, 120));
    return { prompt: `Write each item in ${to}, spelled the way native speakers write these names and places (phonetic transliteration, not translation). Return the same number of items in the same order.\n${JSON.stringify(items)}`,
      schema: S('OBJECT', { properties: { items: S('ARRAY', { items: S('STRING') }) }, required: ['items'] }) };
  }
  if (task === 'taglines') {
    const to = LANG_NAME[input.lang]; if (!to) throw new HttpError(400, 'Unknown language.');
    return { prompt: `Suggest 4 different short taglines (under 9 words each) in ${to} for a ${occ} invitation${names.length ? ' for ' + names.join(' & ') : ''}. Tone: ${clip(input.tone, 40) || 'warm'}. Original lines only, no famous song lyrics or poems.`,
      schema: S('OBJECT', { properties: { options: S('ARRAY', { items: S('STRING') }) }, required: ['options'] }) };
  }
  throw new HttpError(400, 'Unknown AI task.');
}

const aiCache = new Map(), deadModels = new Set(); let aiDay = '', aiCount = 0;
async function gemini({ prompt, schema }) {
  const day = new Date().toISOString().slice(0, 10); if (day !== aiDay) { aiDay = day; aiCount = 0; }
  if (aiCount >= AI_DAILY_LIMIT) throw new HttpError(429, "Today's free AI quota is used up. You can still edit the text by hand.");
  aiCount++;
  for (const model of MODELS.filter((m) => !deadModels.has(m))) {
    const r = await fetch(`${GEMINI_BASE}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.8, maxOutputTokens: 2048 } }),
      signal: AbortSignal.timeout(30000),
    }).catch(() => null);
    if (!r) throw new HttpError(502, 'Could not reach Gemini. Please try again.');
    if (r.status === 404 || r.status === 400 && /not found|not supported/i.test(await r.clone().text())) { deadModels.add(model); continue; }
    if (r.status === 429) throw new HttpError(429, 'The free Gemini quota is used up for now. Try again later, or edit the text by hand.');
    if (r.status === 401 || r.status === 403) throw new HttpError(502, 'The Gemini API key was rejected. Check GEMINI_API_KEY on the server.');
    if (!r.ok) throw new HttpError(502, 'Gemini is unavailable right now. Please try again.');
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    try { return JSON.parse(text); } catch { throw new HttpError(502, 'Gemini returned an unexpected answer. Please try again.'); }
  }
  throw new HttpError(502, 'None of the configured Gemini models are available. Set GEMINI_MODEL in .env.');
}

// ---------- email (optional) ----------
let mailer = null;
async function getMailer() {
  if (mailer !== null) return mailer;
  if (!process.env.SMTP_HOST) return (mailer = false);
  try {
    const nm = (await import('nodemailer')).default;
    mailer = nm.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
  } catch (e) { console.warn('[email] nodemailer not installed; run npm install to enable emails'); mailer = false; }
  return mailer;
}
async function sendMail(to, subject, html) {
  const m = await getMailer(); if (!m) return false;
  try { await m.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html }); return true; }
  catch (e) { console.error('[email]', e.message); return false; }
}

// ---------- leads ----------
const LEADS = path.join(DATA, 'leads.jsonl');
async function readLeads() {
  try { return (await fsp.readFile(LEADS, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; }
}
const emailRe = /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,24}$/;

// ---------- static ----------
async function serveFile(res, file, extraHeaders = {}) {
  try {
    const st = await fsp.stat(file); if (!st.isFile()) throw 0;
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': ext === '.woff2' ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-cache' : 'public, max-age=3600', ...extraHeaders });
    fs.createReadStream(file).pipe(res);
  } catch { send(res, 404, 'Not found'); }
}
function within(base, p) { const r = path.resolve(base, '.' + p); return r.startsWith(base + path.sep) || r === base ? r : null; }

// ---------- router ----------
const routes = [];
const on = (method, re, fn) => routes.push({ method, re, fn });

on('GET', /^\/api\/health$/, async () => ({ ok: true, ai: !!GEMINI_KEY, email: !!process.env.SMTP_HOST }));

on('POST', /^\/api\/ai$/, async (req) => {
  if (!GEMINI_KEY) throw new HttpError(503, 'AI is not configured on this server.');
  limit('ai:' + clientIp(req), AI_PER_IP_HOUR, 36e5);
  const { task, input = {} } = await readJson(req, 20000);
  const job = buildTask(task, input);
  const key = sha(task + JSON.stringify(input));
  if (aiCache.has(key)) return aiCache.get(key);
  const out = await gemini(job);
  if (aiCache.size > 300) aiCache.delete(aiCache.keys().next().value);
  aiCache.set(key, out); return out;
});

on('POST', /^\/api\/invites$/, async (req) => {
  limit('inv:' + clientIp(req), 30, 36e5);
  const { invite } = await readJson(req, 4_000_000);
  const id = rid(10), editKey = rid(24);
  await fsp.writeFile(invFile(id), JSON.stringify({ invite: sanitizeInvite(invite), keyHash: sha(editKey), created: new Date().toISOString(), ip: clientIp(req) }));
  return { id, editKey };
});
on('PUT', /^\/api\/invites\/([A-Za-z0-9]+)$/, async (req, [, id]) => {
  if (!validId(id)) throw new HttpError(404, 'Not found.');
  const rec = await readInvite(id);
  if (!safeEq(sha(String(req.headers['x-edit-key'] || '')), rec.keyHash)) throw new HttpError(403, 'This edit link is not valid.');
  const { invite } = await readJson(req, 4_000_000);
  rec.invite = sanitizeInvite(invite); rec.updated = new Date().toISOString();
  await fsp.writeFile(invFile(id), JSON.stringify(rec)); return { ok: true };
});
on('GET', /^\/api\/invites\/([A-Za-z0-9]+)$/, async (req, [, id]) => {
  if (!validId(id)) throw new HttpError(404, 'Not found.');
  return { invite: (await readInvite(id)).invite };
});
on('POST', /^\/api\/invites\/([A-Za-z0-9]+)\/rsvp$/, async (req, [, id]) => {
  if (!validId(id)) throw new HttpError(404, 'Not found.');
  await readInvite(id);
  limit(`rsvp:${id}:${clientIp(req)}`, 8, 36e5);
  const b = await readJson(req, 5000);
  const name = clip(b.name, 80).trim(); if (!name) throw new HttpError(400, 'Please enter your name.');
  const row = { name, attending: b.attending === 'no' ? 'no' : 'yes', guests: Math.max(1, Math.min(20, Number(b.guests) || 1)), note: clip(b.note, 300), ts: new Date().toISOString(), ip: clientIp(req) };
  await fsp.appendFile(path.join(DATA, 'rsvps', `${id}.jsonl`), JSON.stringify(row) + '\n'); return { ok: true };
});
on('GET', /^\/api\/invites\/([A-Za-z0-9]+)\/rsvps$/, async (req, [, id]) => {
  if (!validId(id)) throw new HttpError(404, 'Not found.');
  const rec = await readInvite(id);
  if (!safeEq(sha(String(req.headers['x-edit-key'] || '')), rec.keyHash)) throw new HttpError(403, 'This edit link is not valid.');
  let rows = []; try { rows = (await fsp.readFile(path.join(DATA, 'rsvps', `${id}.jsonl`), 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { /* none yet */ }
  return { rsvps: rows.map(({ ip, ...r }) => r).reverse() };
});

on('POST', /^\/api\/media$/, async (req) => {
  limit('media:' + clientIp(req), 20, 36e5);
  const type = String(req.headers['content-type'] || '').split(';')[0];
  const ext = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav' }[type];
  if (!ext) throw new HttpError(415, 'Please upload an MP3, M4A, AAC, OGG or WAV file.');
  const buf = await readBody(req, 8 * 1024 * 1024);
  const name = `${rid(16)}.${ext}`; await fsp.writeFile(path.join(DATA, 'media', name), buf);
  return { url: `/media/${name}` };
});

on('POST', /^\/api\/leads$/, async (req) => {
  const ip = clientIp(req); limit('lead:' + ip, 20, 36e5);
  const b = await readJson(req, 5000);
  const email = clip(b.email, 254).trim().toLowerCase();
  if (!emailRe.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
  const code = 'NMT-' + rid(7).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const row = { id: rid(12), code, email, name: clip(b.name, 80), marketing: !!b.marketing, purpose: clip(b.purpose, 20) || 'video',
    inviteId: validId(String(b.inviteId || '')) ? b.inviteId : null, ip, ua: clip(req.headers['user-agent'], 300), ts: new Date().toISOString() };
  await fsp.appendFile(LEADS, JSON.stringify(row) + '\n');
  return { code };
});

on('POST', /^\/api\/videos\/(NMT-[A-Z0-9]+)$/, async (req, [, code], reqUrl) => {
  if (!validCode(code)) throw new HttpError(404, 'Unknown download.');
  const lead = (await readLeads()).find((l) => l.code === code);
  if (!lead) throw new HttpError(404, 'Unknown download.');
  const type = String(req.headers['content-type'] || '').split(';')[0];
  const ext = type === 'video/mp4' ? 'mp4' : type === 'video/webm' ? 'webm' : null;
  if (!ext) throw new HttpError(415, 'Unexpected video format.');
  const file = path.join(DATA, 'videos', `${code}.${ext}`);
  if (fs.existsSync(file)) throw new HttpError(409, 'This video was already uploaded.');
  await fsp.writeFile(file, await readBody(req, 80 * 1024 * 1024));
  const fname = (reqUrl.searchParams.get('name') || '').replace(/[^A-Za-z0-9.-]/g, '').slice(0, 100) || `Invitation.${ext}`;
  await fsp.writeFile(path.join(DATA, 'videos', `${code}.json`), JSON.stringify({ filename: fname.endsWith('.' + ext) ? fname : `${fname}.${ext}` }));
  const token = crypto.createHmac('sha256', ADMIN_KEY || 'nimantran').update(code).digest('hex').slice(0, 24);
  const url = `${PUBLIC_URL}/v/${code}?t=${token}`;
  const title = fname.replace(/\.(mp4|webm)$/, '').replace(/-/g, ' ');
  const emailed = await sendMail(lead.email, `Your video is ready: ${title}`,
    `<p>Namaste${lead.name ? ' ' + lead.name.replace(/[<>&"]/g, '') : ''},</p><p>Your invitation video is ready. Download it here:</p><p><a href="${url}">${url}</a></p><p>Made with Nimantran Studio.</p>`);
  return { ok: true, emailed, url };
});
on('GET', /^\/v\/(NMT-[A-Z0-9]+)$/, async (req, [, code], url, res) => {
  const token = crypto.createHmac('sha256', ADMIN_KEY || 'nimantran').update(code).digest('hex').slice(0, 24);
  if (!validCode(code) || !safeEq(url.searchParams.get('t') || '', token)) throw new HttpError(404, 'Not found.');
  for (const ext of ['mp4', 'webm']) {
    const f = path.join(DATA, 'videos', `${code}.${ext}`);
    if (!fs.existsSync(f)) continue;
    let name = `Invitation.${ext}`; try { name = JSON.parse(fs.readFileSync(path.join(DATA, 'videos', `${code}.json`), 'utf8')).filename || name; } catch { /* default */ }
    return serveFile(res, f, { 'Content-Disposition': `attachment; filename="${name}"` });
  }
  throw new HttpError(404, 'This video is no longer available.');
});

// admin: leads list and CSV (requires ADMIN_KEY)
function requireAdmin(req, url) {
  const k = url.searchParams.get('key') || req.headers['x-admin-key'] || '';
  if (!ADMIN_KEY || !safeEq(k, ADMIN_KEY)) throw new HttpError(403, 'Admin key required.');
}
on('GET', /^\/admin\/leads\.csv$/, async (req, m, url, res) => {
  requireAdmin(req, url);
  const rows = await readLeads(), cols = ['ts', 'email', 'name', 'marketing', 'ip', 'code', 'inviteId', 'purpose', 'ua'];
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  send(res, 200, csv, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="nimantran-leads.csv"' });
});
on('GET', /^\/admin$/, async (req, m, url, res) => {
  requireAdmin(req, url);
  const rows = (await readLeads()).reverse(), e = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const invites = fs.readdirSync(path.join(DATA, 'invites')).length;
  send(res, 200, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nimantran admin</title>
<style>body{font:14px system-ui;margin:24px;color:#1f1b2e}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left;font-size:13px}th{background:#f3f2f7}.k{display:flex;gap:24px;margin:12px 0}.k b{font-size:22px;display:block}</style>
<h1>Nimantran admin</h1><div class="k"><div><b>${rows.length}</b>download emails</div><div><b>${rows.filter((r) => r.marketing).length}</b>opted in to offers</div><div><b>${invites}</b>saved invitations</div><div><b>${aiCount}</b>AI calls today</div></div>
<p><a href="/admin/leads.csv?key=${encodeURIComponent(ADMIN_KEY)}">Download CSV</a></p>
<table><tr><th>When</th><th>Email</th><th>Name</th><th>Offers</th><th>IP</th><th>Video code</th></tr>${rows.slice(0, 1000).map((r) => `<tr><td>${e(r.ts.replace('T', ' ').slice(0, 16))}</td><td>${e(r.email)}</td><td>${e(r.name)}</td><td>${r.marketing ? 'Yes' : ''}</td><td>${e(r.ip)}</td><td>${e(r.code)}</td></tr>`).join('')}</table>`,
  { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
});

on('GET', /^\/media\/([A-Za-z0-9]+\.(mp3|m4a|aac|ogg|wav))$/, async (req, [, f], url, res) => serveFile(res, path.join(DATA, 'media', f)));
on('GET', /^\/privacy\/?$/, async (req, m, url, res) => serveFile(res, path.join(PUB, 'privacy.html')));
on('GET', /^\/i\/[A-Za-z0-9]+\/?$/, async (req, m, url, res) => serveFile(res, path.join(PUB, 'invite.html')));

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = url.pathname.match(r.re); if (!m) continue;
      const out = await r.fn(req, m, url, res);
      if (!res.headersSent && out !== undefined) send(res, 200, out);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(404, 'Not found.');
    if (url.pathname.startsWith('/_')) throw new HttpError(404, 'Not found.');
    const p = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = within(PUB, p); if (!file) throw new HttpError(404, 'Not found.');
    await serveFile(res, file);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status === 500) console.error(e);
    if (!res.headersSent) send(res, status, { error: status === 500 ? 'Something went wrong on the server.' : e.message });
  }
});
server.listen(PORT, () => {
  console.log(`Nimantran Studio running at ${PUBLIC_URL}`);
  console.log(`AI: ${GEMINI_KEY ? 'Gemini on (' + MODELS[0] + ')' : 'off (set GEMINI_API_KEY)'} · Email: ${process.env.SMTP_HOST ? 'on' : 'off'} · Admin: ${ADMIN_KEY ? '/admin?key=…' : 'off (set ADMIN_KEY)'}`);
});
