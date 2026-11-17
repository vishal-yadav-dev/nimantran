// Offline phonetic typing: "Diya Sharma" → "दिया शर्मा" / "ਦਿਆ ਸ਼ਰਮਾ" / "દિયા શર્મા".
// Gemini does this better when the server has a key; this keeps typing usable without it.

const CONS = [
  ['ksh', 'क्ष'], ['chh', 'छ'], ['shr', 'श्र'], ['gy', 'ज्ञ'],
  ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'],
  ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'], ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['f', 'फ़'], ['b', 'ब'],
  ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['z', 'ज़'], ['q', 'क'], ['x', 'क्स'],
];
const VOW = [ // [latin, independent, matra]
  ['aa', 'आ', 'ा'], ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'], ['ee', 'ई', 'ी'], ['ii', 'ई', 'ी'], ['oo', 'ऊ', 'ू'], ['uu', 'ऊ', 'ू'],
  ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो'],
];
const WORDS = { patel: 'पटेल', delhi: 'दिल्ली', road: 'रोड', hotel: 'होटल', party: 'पार्टी', resort: 'रिसॉर्ट', garden: 'गार्डन', banquet: 'बैंक्वेट', hall: 'हॉल', mehta: 'मेहता', singh: 'सिंह', kaur: 'कौर', and: 'और' };

function match(list, s, i) { for (const e of list) if (s.startsWith(e[0], i)) return e; return null; }

function wordToDeva(w) {
  const lw = w.toLowerCase();
  if (WORDS[lw]) return WORDS[lw];
  let out = '', i = 0, prevCons = false, prevChar = '';
  while (i < lw.length) {
    const v = match(VOW, lw, i);
    if (v) {
      const isFinalA = v[0] === 'a' && i === lw.length - 1 && prevCons && lw.length > 2;
      if (prevCons) out += isFinalA ? 'ा' : v[2]; else out += v[1];
      i += v[0].length; prevCons = false; continue;
    }
    // anusvara: n/m before a consonant
    if ((lw[i] === 'n' || lw[i] === 'm') && i > 0 && !prevCons && i < lw.length - 1) {
      const next = match(CONS, lw, i + 1);
      if (next && !['y', 'h', 'r', 'v', 'w', 'n', 'm'].includes(next[0]) && !(lw[i] === 'm' && !['p', 'b', 'ph', 'bh'].includes(next[0]))) { out += 'ं'; i += 1; continue; }
    }
    const c = match(CONS, lw, i);
    if (c) {
      if (prevCons && prevChar !== 'ह') out += '्';
      out += c[1]; prevChar = c[1]; i += c[0].length; prevCons = true; continue;
    }
    out += lw[i]; i += 1; prevCons = false;
  }
  return out;
}

export function romanToDeva(text) {
  return text.replace(/[A-Za-z]+/g, (w) => wordToDeva(w));
}

const NUKTA_BASE = [0x0915, 0x0916, 0x0917, 0x091c, 0x0921, 0x0922, 0x092b, 0x092f]; // bases of U+0958..U+095F
export function devaTo(script, s) {
  if (script === 'deva') return s;
  s = s.replace(/[\u0958-\u095F]/g, (c) => String.fromCodePoint(NUKTA_BASE[c.codePointAt(0) - 0x0958], 0x093c));
  if (script === 'gujr') s = s.replace(/\u093C/g, '');
  if (script === 'guru') s = s.replace(/\u094D(?![\u0930\u0939\u0935])/g, '');
  const off = script === 'guru' ? 0x100 : 0x180;
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 0x0900 || c > 0x097f) { out += ch; continue; }
    if (script === 'guru') {
      if (ch === 'ष') { out += 'ਸ਼'; continue; }
      if (ch === 'ं') { out += 'ੰ'; continue; }
      if (ch === '़') { out += '਼'; continue; }
      if (ch === 'ऋ') { out += 'ਰਿ'; continue; }
      if (ch === 'ृ') { out += '੍ਰਿ'; continue; }
      if (ch === 'ण') { out += 'ਣ'; continue; }
    }
    out += String.fromCodePoint(c + off);
  }
  return out;
}

export function transliterate(text, lang) {
  const script = { hi: 'deva', pa: 'guru', gu: 'gujr' }[lang];
  if (!script) return text;
  return devaTo(script, romanToDeva(text));
}

// Live typing: convert the word just finished when the user presses space or punctuation.
export function attachTyping(el, getLang, isOn) {
  el.addEventListener('input', (e) => {
    if (!isOn() || getLang() === 'en') return;
    if (!e.data || !/[\s,.!?]/.test(e.data)) return;
    const pos = el.selectionStart, before = el.value.slice(0, pos), after = el.value.slice(pos);
    const m = before.match(/([A-Za-z]+)([\s,.!?])$/);
    if (!m) return;
    const conv = transliterate(m[1], getLang());
    const nb = before.slice(0, before.length - m[0].length) + conv + m[2];
    el.value = nb + after; el.setSelectionRange(nb.length, nb.length);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
