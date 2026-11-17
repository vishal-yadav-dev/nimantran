# Nimantran Studio

A web app for making animated digital invitations in **Hindi, English, Punjabi and Gujarati**. Each invitation becomes:

- an **interactive link** guests open on their phone: tap to open the envelope, story-style animated scenes, a countdown, Google Maps directions, Add to Google Calendar, RSVP and share, and
- a **1080×1920 video** (MP4 in Chrome, Edge and Safari) for WhatsApp status and Instagram.

## What's inside

| | |
|---|---|
| Templates | 1,280 = 8 animated layouts × 10 colour themes × 16 occasions (wedding, engagement, haldi, mehendi, sangeet, reception, birthday, first birthday, anniversary, griha pravesh, baby shower, naming ceremony, puja, Diwali, Lohri, garba). Best matches for each occasion are marked "Top pick". |
| Languages | Every template ships with ready text in all 4 languages. Show one language or two at once. Typing in English letters converts to Hindi, Punjabi or Gujarati as you type. |
| Editing | All text, names, date, venue, programme of events, colours, lettering style, effects (petals, sparkles, confetti, bokeh, hearts), speed, scenes on and off, photo, music. |
| Sacred symbols | Ganesh ji, Krishna, Om, Swastik, Kalash, Lotus, Diya, Ik Onkar, Khanda, Jain symbol, Crescent & star, Cross, Dharma chakra, Star of David, or upload your own idol image. Blessing lines: Shree Ganesh, Ik Onkar, Om, Jai Shri Krishna, Jai Jinendra, Jai Ambe Maa. |
| Initials logo | 5 frame styles, automatic or custom letters, shown on the invitation and downloadable as a transparent PNG. |
| AI help (Gemini free tier) | Write the invitation, translate everything, convert names and venue into the right script, tagline ideas. Prompts are built on the server, so your key can't be used as a general chatbot. |
| Download gate | Before a video downloads, the visitor gives their email (and can opt in to offers). The server records email, name, opt-in, IP address, browser and time, emails them the download link, and every video carries a faint hidden code linked to that download. |

## Run it

```bash
cp .env.example .env      # add GEMINI_API_KEY and ADMIN_KEY at least
npm install               # only needed for emails (installs nodemailer)
npm start                 # http://localhost:3000
```

Needs Node 18.17 or newer. Nothing else is required: without a Gemini key the AI buttons fall back to the built-in text library, and without SMTP settings videos still download, they just aren't emailed.

- Studio: `/`
- Guest link: `/i/<id>` (created by **Share link**)
- Admin (download emails, IPs, opt-ins, CSV export): `/admin?key=<ADMIN_KEY>`

## Data

Everything is stored as files under `data/` (change with `DATA_DIR`):

- `invites/*.json`: saved invitations (edit key stored hashed)
- `rsvps/*.jsonl`: replies per invitation
- `leads.jsonl`: download emails with IP address, browser and time
- `videos/`, `media/`: uploaded videos and music

Back this folder up. For heavy traffic, move it to a database and object storage (for example DynamoDB and S3); the API shapes stay the same.

## Before you launch

- **Privacy notice.** You collect emails and IP addresses, so publish a privacy policy that says what you store, why, how long, and how people can ask for deletion (India's DPDP Act requires notice and consent). The download form already tells people what is stored; link your policy from it.
- **Gemini free tier.** Google may use free-tier prompts to improve its products and reviewers may read them, so the AI tab warns users not to type phone numbers or private details. Free-tier quotas are small (a few hundred requests a day on Flash-Lite); `AI_DAILY_LIMIT` and `AI_PER_IP_HOUR` keep you inside them.
- **Behind a proxy** (Nginx, Cloudflare): set `TRUST_PROXY=1` so the real visitor IP is recorded.
- **Music.** Users upload their own; remind them to use music they have rights to.

## Branding protection

- Copyright notices in the HTML, server and `generator`/`copyright` meta tags.
- "Made with Nimantran" credit on invitations (users can switch it off; remove the toggle in `studio.js` if you want it always on).
- Every downloaded video carries a faint tiled code plus a corner bit pattern linked to the download in `leads.jsonl`. Boost the levels on a frame to read it. It survives normal sharing and WhatsApp compression, but a determined person can still crop or blur it out.

Code that runs in a browser can always be copied, so for real protection keep the server code private and register your brand name.

## Files

```
server.js            API, static files, Gemini proxy, leads, admin
public/index.html    studio
public/invite.html   guest page (/i/<id>)
public/js/catalog.js templates, palettes, occasions, all ready-made text in 4 languages
public/js/engine.js  canvas renderer for every layout, scene and effect
public/js/symbols.js sacred symbols and initials logo
public/js/viewer.js  interactive guest experience
public/js/studio.js  editor
public/js/exporter.js video recording
public/js/translit.js offline typing in Indic scripts
public/fonts/        self-hosted fonts (SIL Open Font License)
```

## Adding more templates

Add a layout to `LAYOUTS` and a drawing function to `FRAMES` in `engine.js`: that adds 160 templates (16 occasions × 10 colours). Adding a palette adds 128; an occasion adds 80.
