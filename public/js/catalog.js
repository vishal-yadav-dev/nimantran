// Template catalog: layouts × palettes × occasions = 1,280 templates.
// Every template ships with ready text in English, Hindi, Punjabi and Gujarati.

export const LANGS = {
  en: { label: 'English', native: 'English', script: 'latn', locale: 'en-IN' },
  hi: { label: 'Hindi', native: 'हिंदी', script: 'deva', locale: 'hi-IN' },
  pa: { label: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'guru', locale: 'pa-IN' },
  gu: { label: 'Gujarati', native: 'ગુજરાતી', script: 'gujr', locale: 'gu-IN' },
};

// Type styles: one display face per script, so every language looks designed, not fallen back.
export const TYPE_STYLES = {
  royal:   { label: 'Royal',   latn: 'Cinzel',             deva: 'Rozha One',             guru: 'Baloo Paaji 2', gujr: 'Shrikhand' },
  classic: { label: 'Classic', latn: 'Cormorant Garamond', deva: 'Tiro Devanagari Hindi', guru: 'Tiro Gurmukhi', gujr: 'Noto Serif Gujarati' },
  script:  { label: 'Script',  latn: 'Great Vibes',        deva: 'Kalam',                 guru: 'Mukta Mahee',   gujr: 'Farsan' },
  modern:  { label: 'Modern',  latn: 'Poppins',            deva: 'Mukta',                 guru: 'Mukta Mahee',   gujr: 'Hind Vadodara' },
  playful: { label: 'Playful', latn: 'Fredoka',            deva: 'Baloo 2',               guru: 'Baloo Paaji 2', gujr: 'Baloo Bhai 2' },
};
export const BODY_FONTS = { latn: 'Poppins', deva: 'Mukta', guru: 'Mukta Mahee', gujr: 'Hind Vadodara' };

export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?' + [
  'Cinzel:wght@500;700', 'Cormorant+Garamond:wght@500;600;700', 'Great+Vibes', 'Poppins:wght@300;400;500;600',
  'Fredoka:wght@500;600', 'Rozha+One', 'Tiro+Devanagari+Hindi', 'Kalam:wght@400;700', 'Mukta:wght@400;500;700',
  'Baloo+2:wght@500;700', 'Baloo+Paaji+2:wght@500;700', 'Tiro+Gurmukhi', 'Mukta+Mahee:wght@400;500;700',
  'Shrikhand', 'Noto+Serif+Gujarati:wght@500;700', 'Farsan', 'Hind+Vadodara:wght@400;500;600', 'Baloo+Bhai+2:wght@500;700',
].map((f) => 'family=' + f).join('&') + '&display=swap';

export const LAYOUTS = {
  arch:     { label: 'Royal Arch',    type: 'royal',   fx: 'sparkles', intro: 'doors' },
  marigold: { label: 'Marigold Toran', type: 'classic', fx: 'petals',   intro: 'envelope' },
  mandala:  { label: 'Mandala',       type: 'royal',   fx: 'sparkles', intro: 'envelope' },
  minimal:  { label: 'Modern Minimal', type: 'modern',  fx: 'bokeh',    intro: 'envelope' },
  diya:     { label: 'Diya Night',    type: 'classic', fx: 'sparkles', intro: 'envelope', dark: true },
  garden:   { label: 'Floral Garden', type: 'script',  fx: 'petals',   intro: 'envelope' },
  paisley:  { label: 'Paisley Scroll', type: 'classic', fx: 'petals',   intro: 'scroll' },
  confetti: { label: 'Confetti Pop',  type: 'playful', fx: 'confetti', intro: 'envelope' },
};

export const PALETTES = {
  maroon:   { label: 'Rani Maroon',    dark: true,  bg: ['#7a1222', '#3a0710'], ink: '#fbe9d0', head: '#f6d47a', accent: '#e0a93b', soft: '#a3303c' },
  haldi:    { label: 'Haldi Yellow',   dark: false, bg: ['#fff6cf', '#ffd76b'], ink: '#4f2c00', head: '#a83c0c', accent: '#e07a00', soft: '#ffe9a3' },
  mehendi:  { label: 'Mehendi Green',  dark: false, bg: ['#f1f6e2', '#c9dca3'], ink: '#2b3814', head: '#4b661c', accent: '#b0842a', soft: '#dfe9c3' },
  peacock:  { label: 'Peacock Blue',   dark: true,  bg: ['#0e4a6e', '#05213a'], ink: '#e8f4f2', head: '#f2c96b', accent: '#2bb5ad', soft: '#1a6a93' },
  blush:    { label: 'Blush Pink',     dark: false, bg: ['#fff4f5', '#f9cfd7'], ink: '#4a1f2b', head: '#a8325a', accent: '#c29a52', soft: '#ffe1e6' },
  ivory:    { label: 'Ivory Classic',  dark: false, bg: ['#fffbf2', '#f0e1c3'], ink: '#3d2c1e', head: '#7a1e2c', accent: '#b8892f', soft: '#ecdcb9' },
  midnight: { label: 'Midnight Gold',  dark: true,  bg: ['#1b1a2e', '#07060d'], ink: '#f1e9d8', head: '#e8c46a', accent: '#c9973a', soft: '#2e2c48' },
  lotus:    { label: 'Lotus Lavender', dark: false, bg: ['#f7f2fd', '#dccdf2'], ink: '#2f2346', head: '#663a9c', accent: '#d08a3a', soft: '#ebe1f8' },
  saffron:  { label: 'Saffron Sunset', dark: true,  bg: ['#f58a2e', '#c2331f'], ink: '#fff6e9', head: '#fff0b3', accent: '#7a1d12', soft: '#ffb36b' },
  mint:     { label: 'Mint Fresh',     dark: false, bg: ['#effbf6', '#bfe9d8'], ink: '#123b33', head: '#0f6f5a', accent: '#ea7d4f', soft: '#d6f3e7' },
};

export const BLESSINGS = {
  none: { label: 'None' },
  ganesh: { label: 'Shree Ganesh', en: '|| Shree Ganeshaya Namah ||', hi: '॥ श्री गणेशाय नमः ॥', pa: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥', gu: '॥ શ્રી ગણેશાય નમઃ ॥' },
  ikonkar: { label: 'Ik Onkar', en: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ', hi: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ', pa: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ', gu: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ' },
  om: { label: 'Om', en: 'ॐ', hi: 'ॐ', pa: 'ॐ', gu: 'ॐ' },
  krishna: { label: 'Jai Shri Krishna', en: '|| Jai Shri Krishna ||', hi: '॥ जय श्री कृष्ण ॥', pa: '॥ ਜੈ ਸ਼੍ਰੀ ਕ੍ਰਿਸ਼ਨ ॥', gu: '॥ જય શ્રીકૃષ્ણ ॥' },
  jinendra: { label: 'Jai Jinendra', en: '|| Jai Jinendra ||', hi: '॥ जय जिनेन्द्र ॥', pa: '॥ ਜੈ ਜਿਨੇਂਦਰ ॥', gu: '॥ જય જિનેન્દ્ર ॥' },
  ambe: { label: 'Jai Ambe Maa', en: '|| Jai Ambe Maa ||', hi: '॥ जय अम्बे माँ ॥', pa: '॥ ਜੈ ਅੰਬੇ ਮਾਂ ॥', gu: '॥ જય અંબે મા ॥' },
};

export const EVENT_NAMES = {
  haldi:     { en: 'Haldi', hi: 'हल्दी', pa: 'ਹਲਦੀ', gu: 'પીઠી' },
  mehendi:   { en: 'Mehendi', hi: 'मेहंदी', pa: 'ਮਹਿੰਦੀ', gu: 'મહેંદી' },
  sangeet:   { en: 'Sangeet', hi: 'संगीत', pa: 'ਸੰਗੀਤ', gu: 'સંગીત' },
  baraat:    { en: 'Baraat', hi: 'बारात', pa: 'ਬਰਾਤ', gu: 'જાન' },
  wedding:   { en: 'Wedding Ceremony', hi: 'विवाह संस्कार', pa: 'ਵਿਆਹ ਦੀ ਰਸਮ', gu: 'લગ્નવિધિ' },
  reception: { en: 'Reception', hi: 'प्रीतिभोज', pa: 'ਰਿਸੈਪਸ਼ਨ', gu: 'સ્વાગત સમારંભ' },
  ring:      { en: 'Ring Ceremony', hi: 'अंगूठी की रस्म', pa: 'ਮੁੰਦਰੀ ਦੀ ਰਸਮ', gu: 'વીંટી વિધિ' },
  cake:      { en: 'Cake Cutting', hi: 'केक कटिंग', pa: 'ਕੇਕ ਕਟਿੰਗ', gu: 'કેક કટિંગ' },
  dinner:    { en: 'Dinner', hi: 'रात्रि भोज', pa: 'ਰਾਤ ਦਾ ਖਾਣਾ', gu: 'રાત્રિ ભોજન' },
  lunch:     { en: 'Lunch', hi: 'भोजन', pa: 'ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ', gu: 'ભોજન' },
  puja:      { en: 'Puja', hi: 'पूजा', pa: 'ਪੂਜਾ', gu: 'પૂજા' },
  havan:     { en: 'Havan', hi: 'हवन', pa: 'ਹਵਨ', gu: 'હવન' },
  aarti:     { en: 'Aarti', hi: 'आरती', pa: 'ਆਰਤੀ', gu: 'આરતી' },
  garba:     { en: 'Garba Night', hi: 'गरबा रात्रि', pa: 'ਗਰਬਾ ਰਾਤ', gu: 'ગરબા રાત' },
  bonfire:   { en: 'Lohri Bonfire', hi: 'लोहड़ी अलाव', pa: 'ਲੋਹੜੀ ਦੀ ਧੂਣੀ', gu: 'લોહડી તાપણું' },
  party:     { en: 'Party', hi: 'पार्टी', pa: 'ਪਾਰਟੀ', gu: 'પાર્ટી' },
};

// Labels the invitation itself shows (on the video and the guest page).
export const UI = {
  date:      { en: 'Date', hi: 'दिनांक', pa: 'ਤਾਰੀਖ਼', gu: 'તારીખ' },
  time:      { en: 'Time', hi: 'समय', pa: 'ਸਮਾਂ', gu: 'સમય' },
  venue:     { en: 'Venue', hi: 'स्थान', pa: 'ਸਥਾਨ', gu: 'સ્થળ' },
  programme: { en: 'Programme', hi: 'कार्यक्रम', pa: 'ਪ੍ਰੋਗਰਾਮ', gu: 'કાર્યક્રમ' },
  invited:   { en: "You're invited", hi: 'आप आमंत्रित हैं', pa: 'ਤੁਹਾਨੂੰ ਸੱਦਾ ਹੈ', gu: 'આપને આમંત્રણ છે' },
  tap:       { en: 'Tap to open', hi: 'खोलने के लिए छुएँ', pa: 'ਖੋਲ੍ਹਣ ਲਈ ਛੂਹੋ', gu: 'ખોલવા માટે સ્પર્શ કરો' },
  days:      { en: 'days', hi: 'दिन', pa: 'ਦਿਨ', gu: 'દિવસ' },
  hours:     { en: 'hrs', hi: 'घंटे', pa: 'ਘੰਟੇ', gu: 'કલાક' },
  mins:      { en: 'min', hi: 'मिनट', pa: 'ਮਿੰਟ', gu: 'મિનિટ' },
  rsvp:      { en: 'RSVP', hi: 'उपस्थिति बताएँ', pa: 'ਹਾਜ਼ਰੀ ਦੱਸੋ', gu: 'હાજરી જણાવો' },
  calendar:  { en: 'Add to calendar', hi: 'कैलेंडर में जोड़ें', pa: 'ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ', gu: 'કેલેન્ડરમાં ઉમેરો' },
  directions:{ en: 'Directions', hi: 'रास्ता देखें', pa: 'ਰਸਤਾ ਵੇਖੋ', gu: 'રસ્તો જુઓ' },
  share:     { en: 'Share', hi: 'शेयर करें', pa: 'ਸਾਂਝਾ ਕਰੋ', gu: 'શેર કરો' },
  attending: { en: 'Joyfully attending', hi: 'ज़रूर आएँगे', pa: 'ਜ਼ਰੂਰ ਆਵਾਂਗੇ', gu: 'જરૂર આવીશું' },
  declining: { en: "Can't make it", hi: 'नहीं आ पाएँगे', pa: 'ਨਹੀਂ ਆ ਸਕਾਂਗੇ', gu: 'નહીં આવી શકીએ' },
  guests:    { en: 'Guests', hi: 'मेहमान', pa: 'ਮਹਿਮਾਨ', gu: 'મહેમાન' },
  yourName:  { en: 'Your name', hi: 'आपका नाम', pa: 'ਤੁਹਾਡਾ ਨਾਮ', gu: 'આપનું નામ' },
  send:      { en: 'Send', hi: 'भेजें', pa: 'ਭੇਜੋ', gu: 'મોકલો' },
  thanks:    { en: 'Thank you! Your reply has been sent.', hi: 'धन्यवाद! आपका जवाब भेज दिया गया है।', pa: 'ਧੰਨਵਾਦ! ਤੁਹਾਡਾ ਜਵਾਬ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।', gu: 'આભાર! આપનો જવાબ મોકલાઈ ગયો છે.' },
  today:     { en: 'Today is the day!', hi: 'आज ही है वो दिन!', pa: 'ਅੱਜ ਹੀ ਹੈ ਉਹ ਦਿਨ!', gu: 'આજે જ છે એ દિવસ!' },
};

const W = (en, hi, pa, gu) => ({ en, hi, pa, gu });

export const OCCASIONS = {
  wedding: {
    label: 'Wedding', blessing: 'ganesh', events: ['haldi', 'mehendi', 'sangeet', 'wedding', 'reception'],
    layouts: { arch: 3, marigold: 3, mandala: 2, paisley: 2, garden: 2, diya: 2, minimal: 1, confetti: 0 },
    palettes: { maroon: 3, ivory: 3, midnight: 2, peacock: 2, blush: 2, saffron: 2 },
    names: W(['Aarav', 'Diya'], ['आरव', 'दिया'], ['ਆਰਵ', 'ਦੀਆ'], ['આરવ', 'દિયા']),
    title: W('Wedding Invitation', 'शुभ विवाह', 'ਸ਼ੁਭ ਵਿਆਹ', 'શુભ લગ્ન'),
    tagline: W('Two hearts, one beautiful journey', 'दो दिल, एक सुंदर सफ़र', 'ਦੋ ਦਿਲ, ਇੱਕ ਸੋਹਣਾ ਸਫ਼ਰ', 'બે હૃદય, એક સુંદર સફર'),
    message: W('With the blessings of our elders, we warmly invite you and your family to bless the couple on their wedding.',
      'बड़ों के आशीर्वाद से, हम आपको सपरिवार सादर आमंत्रित करते हैं। कृपया पधारकर नवदंपति को अपना आशीर्वाद दें।',
      'ਵੱਡਿਆਂ ਦੇ ਅਸ਼ੀਰਵਾਦ ਨਾਲ, ਅਸੀਂ ਆਪ ਜੀ ਨੂੰ ਪਰਿਵਾਰ ਸਮੇਤ ਨਿੱਘਾ ਸੱਦਾ ਦਿੰਦੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਪਧਾਰ ਕੇ ਨਵੀਂ ਜੋੜੀ ਨੂੰ ਅਸ਼ੀਰਵਾਦ ਦਿਓ।',
      'વડીલોના આશીર્વાદ સાથે, અમે આપને સહપરિવાર ભાવભર્યું આમંત્રણ પાઠવીએ છીએ. પધારીને નવદંપતીને આશીર્વાદ આપશો.'),
    host: W('The Sharma & Mehta families', 'निवेदक: शर्मा एवं मेहता परिवार', 'ਵੱਲੋਂ: ਸ਼ਰਮਾ ਅਤੇ ਮਹਿਤਾ ਪਰਿਵਾਰ', 'નિમંત્રક: શર્મા અને મહેતા પરિવાર'),
    closing: W('Your presence will make our celebration complete', 'आपकी उपस्थिति हमारे लिए सौभाग्य होगी', 'ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਸਾਡੇ ਲਈ ਮਾਣ ਵਾਲੀ ਗੱਲ ਹੋਵੇਗੀ', 'આપની હાજરી અમારા માટે સૌભાગ્ય રહેશે'),
  },
  engagement: {
    label: 'Engagement', blessing: 'ganesh', events: ['ring', 'dinner'],
    layouts: { garden: 3, mandala: 3, arch: 2, minimal: 2, marigold: 2, paisley: 2, diya: 1, confetti: 1 },
    palettes: { blush: 3, lotus: 3, ivory: 2, midnight: 2, peacock: 2, maroon: 1 },
    names: W(['Kabir', 'Anaya'], ['कबीर', 'अनाया'], ['ਕਬੀਰ', 'ਅਨਾਇਆ'], ['કબીર', 'અનાયા']),
    title: W('Engagement Ceremony', 'सगाई समारोह', 'ਮੰਗਣੀ ਦੀ ਰਸਮ', 'સગાઈ સમારંભ'),
    tagline: W('A promise to forever', 'हमेशा साथ निभाने का वादा', 'ਸਦਾ ਲਈ ਸਾਥ ਦਾ ਵਾਅਦਾ', 'હંમેશના સાથનું વચન'),
    message: W('We would be delighted to have you with us as we exchange rings and begin a new chapter.',
      'रिश्तों की इस नई शुरुआत पर, अंगूठी की रस्म में आप सपरिवार सादर आमंत्रित हैं।',
      'ਰਿਸ਼ਤਿਆਂ ਦੀ ਇਸ ਨਵੀਂ ਸ਼ੁਰੂਆਤ ਮੌਕੇ, ਮੁੰਦਰੀ ਦੀ ਰਸਮ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਪਰਿਵਾਰ ਸਮੇਤ ਸੱਦਾ ਹੈ।',
      'સંબંધોની આ નવી શરૂઆતે, વીંટી વિધિમાં આપને સહપરિવાર આમંત્રણ છે.'),
    host: W('The Kapoor & Shah families', 'निवेदक: कपूर एवं शाह परिवार', 'ਵੱਲੋਂ: ਕਪੂਰ ਅਤੇ ਸ਼ਾਹ ਪਰਿਵਾਰ', 'નિમંત્રક: કપૂર અને શાહ પરિવાર'),
    closing: W('Come bless the couple', 'पधारकर जोड़ी को आशीर्वाद दें', 'ਪਧਾਰ ਕੇ ਜੋੜੀ ਨੂੰ ਅਸ਼ੀਰਵਾਦ ਦਿਓ', 'પધારીને જોડીને આશીર્વાદ આપશો'),
  },
  haldi: {
    label: 'Haldi', blessing: 'none', events: ['haldi', 'lunch'],
    layouts: { marigold: 3, garden: 3, paisley: 2, confetti: 2, mandala: 2, minimal: 1, arch: 1, diya: 0 },
    palettes: { haldi: 3, saffron: 3, mint: 1, ivory: 1 },
    names: W(['Aarav', 'Diya'], ['आरव', 'दिया'], ['ਆਰਵ', 'ਦੀਆ'], ['આરવ', 'દિયા']),
    title: W('Haldi Ceremony', 'हल्दी की रस्म', 'ਹਲਦੀ ਦੀ ਰਸਮ', 'પીઠીની વિધિ'),
    tagline: W('A splash of yellow, a lot of love', 'पीले रंग में रंगी खुशियाँ', 'ਪੀਲੇ ਰੰਗ ਵਿੱਚ ਰੰਗੀਆਂ ਖੁਸ਼ੀਆਂ', 'પીળા રંગે રંગાયેલી ખુશીઓ'),
    message: W('Join us for an afternoon of turmeric, laughter and blessings before the big day.',
      'शादी से पहले हल्दी, हँसी और आशीर्वाद भरी इस रस्म में आप सादर आमंत्रित हैं।',
      'ਵਿਆਹ ਤੋਂ ਪਹਿਲਾਂ ਹਲਦੀ, ਹਾਸੇ ਅਤੇ ਅਸ਼ੀਰਵਾਦ ਨਾਲ ਭਰੀ ਇਸ ਰਸਮ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਸੱਦਾ ਹੈ।',
      'લગ્ન પહેલાં પીઠી, હાસ્ય અને આશીર્વાદથી ભરેલી આ વિધિમાં આપને આમંત્રણ છે.'),
    host: W('With love, the families', 'सप्रेम: समस्त परिवार', 'ਪਿਆਰ ਸਹਿਤ: ਸਾਰਾ ਪਰਿਵਾਰ', 'સ્નેહસહ: સમગ્ર પરિવાર'),
    closing: W('Dress code: shades of yellow', 'ड्रेस कोड: पीले रंग', 'ਡਰੈੱਸ ਕੋਡ: ਪੀਲੇ ਰੰਗ', 'ડ્રેસ કોડ: પીળા રંગ'),
  },
  mehendi: {
    label: 'Mehendi', blessing: 'none', events: ['mehendi', 'dinner'],
    layouts: { paisley: 3, garden: 3, mandala: 2, marigold: 2, confetti: 1, minimal: 1, arch: 1, diya: 1 },
    palettes: { mehendi: 3, mint: 2, lotus: 2, haldi: 1, peacock: 1 },
    names: W(['Aarav', 'Diya'], ['आरव', 'दिया'], ['ਆਰਵ', 'ਦੀਆ'], ['આરવ', 'દિયા']),
    title: W('Mehendi Night', 'मेहंदी की रात', 'ਮਹਿੰਦੀ ਦੀ ਰਾਤ', 'મહેંદી રાત'),
    tagline: W('Henna, music and memories', 'मेहंदी, संगीत और यादें', 'ਮਹਿੰਦੀ, ਗੀਤ ਅਤੇ ਯਾਦਾਂ', 'મહેંદી, સંગીત અને યાદો'),
    message: W('Come colour your hands and our celebrations with music, dance and henna.',
      'मेहंदी, गीत-संगीत और नृत्य से सजी इस शाम में आप सादर आमंत्रित हैं।',
      'ਮਹਿੰਦੀ, ਗੀਤਾਂ ਅਤੇ ਨੱਚਣ-ਗਾਉਣ ਨਾਲ ਸਜੀ ਇਸ ਸ਼ਾਮ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਸੱਦਾ ਹੈ।',
      'મહેંદી, ગીત-સંગીત અને નૃત્યથી સજેલી આ સાંજમાં આપને આમંત્રણ છે.'),
    host: W("With love, the bride's family", 'सप्रेम: वधू पक्ष', 'ਪਿਆਰ ਸਹਿਤ: ਕੁੜੀ ਵਾਲੇ', 'સ્નેહસહ: કન્યા પક્ષ'),
    closing: W('Dress code: greens and florals', 'ड्रेस कोड: हरा और फूलों वाला', 'ਡਰੈੱਸ ਕੋਡ: ਹਰਾ ਅਤੇ ਫੁੱਲਦਾਰ', 'ડ્રેસ કોડ: લીલો અને ફૂલોવાળો'),
  },
  sangeet: {
    label: 'Sangeet', blessing: 'none', events: ['sangeet', 'dinner'],
    layouts: { diya: 3, confetti: 3, mandala: 2, minimal: 2, arch: 2, marigold: 1, garden: 1, paisley: 1 },
    palettes: { midnight: 3, peacock: 3, maroon: 2, saffron: 2, lotus: 1 },
    names: W(['Aarav', 'Diya'], ['आरव', 'दिया'], ['ਆਰਵ', 'ਦੀਆ'], ['આરવ', 'દિયા']),
    title: W('Sangeet Night', 'संगीत संध्या', 'ਸੰਗੀਤ ਦੀ ਸ਼ਾਮ', 'સંગીત સંધ્યા'),
    tagline: W('Let the music begin', 'आइए, सुर और ताल में झूमें', 'ਆਓ, ਢੋਲ ਦੀ ਤਾਲ ਤੇ ਨੱਚੀਏ', 'ચાલો, સૂર અને તાલમાં ઝૂમીએ'),
    message: W('An evening of songs, dance performances and dhol beats awaits you.',
      'गीतों, नृत्य और ढोल की थाप से सजी एक यादगार शाम आपका इंतज़ार कर रही है।',
      'ਗੀਤਾਂ, ਨਾਚ ਅਤੇ ਢੋਲ ਦੀ ਥਾਪ ਨਾਲ ਸਜੀ ਇੱਕ ਯਾਦਗਾਰ ਸ਼ਾਮ ਤੁਹਾਡੀ ਉਡੀਕ ਕਰ ਰਹੀ ਹੈ।',
      'ગીતો, નૃત્ય અને ઢોલના તાલથી સજેલી એક યાદગાર સાંજ આપની રાહ જુએ છે.'),
    host: W('With love, the families', 'सप्रेम: समस्त परिवार', 'ਪਿਆਰ ਸਹਿਤ: ਸਾਰਾ ਪਰਿਵਾਰ', 'સ્નેહસહ: સમગ્ર પરિવાર'),
    closing: W('Come ready to dance', 'नाचने के लिए तैयार होकर आइए', 'ਨੱਚਣ ਲਈ ਤਿਆਰ ਹੋ ਕੇ ਆਓ', 'નાચવા તૈયાર થઈને આવજો'),
  },
  reception: {
    label: 'Reception', blessing: 'none', events: ['reception', 'dinner'],
    layouts: { minimal: 3, arch: 3, diya: 2, mandala: 2, garden: 2, paisley: 1, marigold: 1, confetti: 0 },
    palettes: { midnight: 3, ivory: 3, maroon: 2, peacock: 2, blush: 2 },
    names: W(['Aarav', 'Diya'], ['आरव', 'दिया'], ['ਆਰਵ', 'ਦੀਆ'], ['આરવ', 'દિયા']),
    title: W('Wedding Reception', 'स्वागत समारोह', 'ਰਿਸੈਪਸ਼ਨ', 'સ્વાગત સમારંભ'),
    tagline: W('Celebrating Mr & Mrs', 'नवदंपति का स्वागत', 'ਨਵੀਂ ਜੋੜੀ ਦਾ ਸਵਾਗਤ', 'નવદંપતીનું સ્વાગત'),
    message: W('Join us for an evening of dinner and celebration as we welcome the newlyweds.',
      'नवविवाहित जोड़े के स्वागत में आयोजित प्रीतिभोज में आप सपरिवार सादर आमंत्रित हैं।',
      'ਨਵ-ਵਿਆਹੀ ਜੋੜੀ ਦੇ ਸਵਾਗਤ ਵਿੱਚ ਰੱਖੀ ਦਾਅਵਤ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਪਰਿਵਾਰ ਸਮੇਤ ਸੱਦਾ ਹੈ।',
      'નવદંપતીના સ્વાગતમાં યોજાયેલા પ્રીતિભોજમાં આપને સહપરિવાર આમંત્રણ છે.'),
    host: W('The Sharma & Mehta families', 'निवेदक: शर्मा एवं मेहता परिवार', 'ਵੱਲੋਂ: ਸ਼ਰਮਾ ਅਤੇ ਮਹਿਤਾ ਪਰਿਵਾਰ', 'નિમંત્રક: શર્મા અને મહેતા પરિવાર'),
    closing: W('We look forward to celebrating with you', 'आपके आगमन की प्रतीक्षा रहेगी', 'ਤੁਹਾਡੇ ਆਉਣ ਦੀ ਉਡੀਕ ਰਹੇਗੀ', 'આપના આગમનની રાહ રહેશે'),
  },
  birthday: {
    label: 'Birthday', blessing: 'none', events: ['cake', 'dinner'],
    layouts: { confetti: 3, minimal: 3, garden: 2, diya: 2, mandala: 1, marigold: 1, paisley: 1, arch: 1 },
    palettes: { midnight: 3, mint: 3, lotus: 2, blush: 2, saffron: 2, peacock: 2 },
    names: W(['Rohan'], ['रोहन'], ['ਰੋਹਨ'], ['રોહન']),
    title: W('Birthday Celebration', 'जन्मदिन समारोह', 'ਜਨਮਦਿਨ ਦਾ ਜਸ਼ਨ', 'જન્મદિવસની ઉજવણી'),
    tagline: W('Another year, more reasons to celebrate', 'एक और साल, खुशियाँ बेशुमार', 'ਇੱਕ ਹੋਰ ਸਾਲ, ਬੇਅੰਤ ਖੁਸ਼ੀਆਂ', 'એક વધુ વર્ષ, અઢળક ખુશીઓ'),
    message: W('Cake, music and good company. Come celebrate with us!',
      'केक, संगीत और अपनों का साथ। आइए, साथ मिलकर जश्न मनाएँ!',
      'ਕੇਕ, ਸੰਗੀਤ ਅਤੇ ਆਪਣਿਆਂ ਦਾ ਸਾਥ। ਆਓ, ਮਿਲ ਕੇ ਜਸ਼ਨ ਮਨਾਈਏ!',
      'કેક, સંગીત અને સ્વજનોનો સાથ. ચાલો, સાથે મળીને ઉજવીએ!'),
    host: W('Hosted by the Verma family', 'आयोजक: वर्मा परिवार', 'ਵੱਲੋਂ: ਵਰਮਾ ਪਰਿਵਾਰ', 'આયોજક: વર્મા પરિવાર'),
    closing: W("Can't wait to see you there", 'आपका इंतज़ार रहेगा', 'ਤੁਹਾਡੀ ਉਡੀਕ ਰਹੇਗੀ', 'આપની રાહ જોઈશું'),
  },
  kids: {
    label: 'First Birthday', blessing: 'none', events: ['cake', 'lunch'],
    layouts: { confetti: 3, garden: 3, minimal: 2, marigold: 1, mandala: 1, paisley: 1, diya: 0, arch: 0 },
    palettes: { mint: 3, blush: 3, lotus: 3, haldi: 2, peacock: 1 },
    names: W(['Vivaan'], ['विवान'], ['ਵਿਵਾਨ'], ['વિવાન']),
    title: W('First Birthday', 'पहला जन्मदिन', 'ਪਹਿਲਾ ਜਨਮਦਿਨ', 'પહેલો જન્મદિવસ'),
    tagline: W('Our little star turns one!', 'हमारा नन्हा सितारा एक साल का हो गया!', 'ਸਾਡਾ ਨਿੱਕਾ ਤਾਰਾ ਇੱਕ ਸਾਲ ਦਾ ਹੋ ਗਿਆ!', 'અમારો નાનકડો તારો એક વર્ષનો થયો!'),
    message: W('Join us for games, cake and lots of giggles as our little one turns one.',
      'खेल, केक और ढेर सारी मुस्कानों के साथ हमारे लाडले के पहले जन्मदिन में ज़रूर आइए।',
      'ਖੇਡਾਂ, ਕੇਕ ਅਤੇ ਢੇਰ ਸਾਰੇ ਹਾਸਿਆਂ ਨਾਲ ਸਾਡੇ ਲਾਡਲੇ ਦੇ ਪਹਿਲੇ ਜਨਮਦਿਨ ਤੇ ਜ਼ਰੂਰ ਆਓ।',
      'રમતો, કેક અને ઢગલાબંધ સ્મિત સાથે અમારા લાડકાના પહેલા જન્મદિવસે જરૂર પધારજો.'),
    host: W('Love, Mummy & Papa', 'सप्रेम: मम्मी-पापा', 'ਪਿਆਰ ਸਹਿਤ: ਮੰਮੀ-ਪਾਪਾ', 'સ્નેહસહ: મમ્મી-પપ્પા'),
    closing: W('Your blessings are the only gift we need', 'आपका आशीर्वाद ही सबसे बड़ा तोहफ़ा है', 'ਤੁਹਾਡਾ ਅਸ਼ੀਰਵਾਦ ਹੀ ਸਭ ਤੋਂ ਵੱਡਾ ਤੋਹਫ਼ਾ ਹੈ', 'આપના આશીર્વાદ જ સૌથી મોટી ભેટ છે'),
  },
  anniversary: {
    label: 'Anniversary', blessing: 'none', events: ['cake', 'dinner'],
    layouts: { garden: 3, minimal: 3, arch: 2, mandala: 2, diya: 2, paisley: 1, marigold: 1, confetti: 1 },
    palettes: { ivory: 3, midnight: 3, maroon: 2, blush: 2, lotus: 2 },
    names: W(['Rajesh', 'Sunita'], ['राजेश', 'सुनीता'], ['ਰਾਜੇਸ਼', 'ਸੁਨੀਤਾ'], ['રાજેશ', 'સુનીતા']),
    title: W('Anniversary Celebration', 'विवाह वर्षगाँठ', 'ਵਿਆਹ ਦੀ ਵਰ੍ਹੇਗੰਢ', 'લગ્નતિથિ ઉજવણી'),
    tagline: W('25 years of togetherness', 'साथ के 25 सुनहरे साल', 'ਸਾਥ ਦੇ 25 ਸੁਨਹਿਰੀ ਸਾਲ', 'સાથના 25 સોનેરી વર્ષ'),
    message: W('Join us as we celebrate a love that has grown stronger with every year.',
      'हर साल के साथ और गहरे होते इस प्यार का जश्न मनाने में हमारे साथ आइए।',
      'ਹਰ ਸਾਲ ਨਾਲ ਹੋਰ ਗੂੜ੍ਹੇ ਹੁੰਦੇ ਇਸ ਪਿਆਰ ਦਾ ਜਸ਼ਨ ਮਨਾਉਣ ਲਈ ਸਾਡੇ ਨਾਲ ਆਓ।',
      'દર વર્ષે વધુ ગાઢ બનતા આ પ્રેમની ઉજવણીમાં અમારી સાથે જોડાઓ.'),
    host: W('With love, the children', 'सप्रेम: बच्चे', 'ਪਿਆਰ ਸਹਿਤ: ਬੱਚੇ', 'સ્નેહસહ: સંતાનો'),
    closing: W('Your blessings mean the world to us', 'आपका आशीर्वाद हमारे लिए अनमोल है', 'ਤੁਹਾਡਾ ਅਸ਼ੀਰਵਾਦ ਸਾਡੇ ਲਈ ਅਨਮੋਲ ਹੈ', 'આપના આશીર્વાદ અમારા માટે અમૂલ્ય છે'),
  },
  griha: {
    label: 'Griha Pravesh', blessing: 'ganesh', events: ['puja', 'lunch'],
    layouts: { marigold: 3, mandala: 3, arch: 2, paisley: 2, minimal: 1, garden: 1, diya: 1, confetti: 0 },
    palettes: { saffron: 3, haldi: 3, ivory: 2, maroon: 2, mint: 1 },
    names: W(['Shubh Niwas'], ['शुभ निवास'], ['ਸ਼ੁਭ ਨਿਵਾਸ'], ['શુભ નિવાસ']),
    title: W('Griha Pravesh', 'गृह प्रवेश', 'ਗ੍ਰਹਿ ਪ੍ਰਵੇਸ਼', 'ગૃહ પ્રવેશ'),
    tagline: W('Our new home, your blessings', 'नया घर, आपका आशीर्वाद', 'ਨਵਾਂ ਘਰ, ਤੁਹਾਡਾ ਅਸ਼ੀਰਵਾਦ', 'નવું ઘર, આપના આશીર્વાદ'),
    message: W('We are stepping into our new home and would love you to join the puja and bless us.',
      'हमारे नए घर के गृह प्रवेश की पूजा में पधारकर हमें अपना आशीर्वाद दें।',
      'ਸਾਡੇ ਨਵੇਂ ਘਰ ਦੇ ਗ੍ਰਹਿ ਪ੍ਰਵੇਸ਼ ਦੀ ਪੂਜਾ ਵਿੱਚ ਪਧਾਰ ਕੇ ਸਾਨੂੰ ਅਸ਼ੀਰਵਾਦ ਦਿਓ।',
      'અમારા નવા ઘરના ગૃહ પ્રવેશની પૂજામાં પધારી અમને આશીર્વાદ આપશો.'),
    host: W('The Gupta family', 'निवेदक: गुप्ता परिवार', 'ਵੱਲੋਂ: ਗੁਪਤਾ ਪਰਿਵਾਰ', 'નિમંત્રક: ગુપ્તા પરિવાર'),
    closing: W('Lunch will follow the puja', 'पूजा के बाद भोजन की व्यवस्था है', 'ਪੂਜਾ ਤੋਂ ਬਾਅਦ ਭੋਜਨ ਦਾ ਪ੍ਰਬੰਧ ਹੈ', 'પૂજા બાદ ભોજનની વ્યવસ્થા છે'),
  },
  godhbharai: {
    label: 'Baby Shower', blessing: 'none', events: ['puja', 'lunch'],
    layouts: { garden: 3, confetti: 2, marigold: 2, mandala: 2, minimal: 2, paisley: 1, arch: 1, diya: 0 },
    palettes: { blush: 3, lotus: 3, mint: 2, haldi: 2, ivory: 1 },
    names: W(['Priya'], ['प्रिया'], ['ਪ੍ਰਿਆ'], ['પ્રિયા']),
    title: W('Baby Shower', 'गोद भराई', 'ਗੋਦ ਭਰਾਈ', 'સીમંત સંસ્કાર'),
    tagline: W('A little blessing is on the way', 'एक नन्ही खुशी आने वाली है', 'ਇੱਕ ਨਿੱਕੀ ਖੁਸ਼ੀ ਆਉਣ ਵਾਲੀ ਹੈ', 'એક નાનકડી ખુશી આવી રહી છે'),
    message: W('Join us to shower the mom-to-be with love, blessings and good wishes.',
      'होने वाली माँ को प्यार, आशीर्वाद और शुभकामनाओं से भरने के लिए आप सादर आमंत्रित हैं।',
      'ਹੋਣ ਵਾਲੀ ਮਾਂ ਨੂੰ ਪਿਆਰ, ਅਸ਼ੀਰਵਾਦ ਅਤੇ ਸ਼ੁਭਕਾਮਨਾਵਾਂ ਦੇਣ ਲਈ ਆਪ ਜੀ ਨੂੰ ਸੱਦਾ ਹੈ।',
      'થનાર માતાને પ્રેમ, આશીર્વાદ અને શુભેચ્છાઓથી વધાવવા આપને આમંત્રણ છે.'),
    host: W('With love, the Joshi family', 'सप्रेम: जोशी परिवार', 'ਪਿਆਰ ਸਹਿਤ: ਜੋਸ਼ੀ ਪਰਿਵਾਰ', 'સ્નેહસહ: જોશી પરિવાર'),
    closing: W('Blessings for mother and baby', 'माँ और शिशु को आशीर्वाद दें', 'ਮਾਂ ਅਤੇ ਬੱਚੇ ਨੂੰ ਅਸ਼ੀਰਵਾਦ ਦਿਓ', 'માતા અને શિશુને આશીર્વાદ આપશો'),
  },
  naamkaran: {
    label: 'Naming Ceremony', blessing: 'ganesh', events: ['havan', 'lunch'],
    layouts: { mandala: 3, garden: 3, marigold: 2, minimal: 2, paisley: 2, confetti: 1, arch: 1, diya: 0 },
    palettes: { mint: 3, haldi: 2, lotus: 2, ivory: 2, blush: 2 },
    names: W(['Neha', 'Amit'], ['नेहा', 'अमित'], ['ਨੇਹਾ', 'ਅਮਿਤ'], ['નેહા', 'અમિત']),
    title: W('Naming Ceremony', 'नामकरण संस्कार', 'ਨਾਮਕਰਨ ਸੰਸਕਾਰ', 'નામકરણ સંસ્કાર'),
    tagline: W('A name full of blessings', 'आशीर्वाद से भरा एक नाम', 'ਅਸ਼ੀਰਵਾਦਾਂ ਨਾਲ ਭਰਿਆ ਇੱਕ ਨਾਮ', 'આશીર્વાદથી ભરેલું એક નામ'),
    message: W('Join us as we name our little one and seek your blessings for a bright future.',
      'हमारे नन्हे शिशु के नामकरण संस्कार में पधारकर उसे अपना आशीर्वाद दें।',
      'ਸਾਡੇ ਨਿੱਕੇ ਬੱਚੇ ਦੇ ਨਾਮਕਰਨ ਸੰਸਕਾਰ ਵਿੱਚ ਪਧਾਰ ਕੇ ਉਸ ਨੂੰ ਅਸ਼ੀਰਵਾਦ ਦਿਓ।',
      'અમારા નાનકડા બાળકના નામકરણ સંસ્કારમાં પધારી તેને આશીર્વાદ આપશો.'),
    host: W('The Malhotra family', 'निवेदक: मल्होत्रा परिवार', 'ਵੱਲੋਂ: ਮਲਹੋਤਰਾ ਪਰਿਵਾਰ', 'નિમંત્રક: મલ્હોત્રા પરિવાર'),
    closing: W('Lunch will be served after the ceremony', 'संस्कार के बाद भोजन', 'ਸੰਸਕਾਰ ਤੋਂ ਬਾਅਦ ਭੋਜਨ', 'સંસ્કાર બાદ ભોજન'),
  },
  puja: {
    label: 'Puja / Katha', blessing: 'ganesh', events: ['puja', 'aarti', 'lunch'],
    layouts: { mandala: 3, marigold: 3, arch: 2, diya: 2, paisley: 2, minimal: 1, garden: 1, confetti: 0 },
    palettes: { saffron: 3, maroon: 2, haldi: 2, ivory: 2, peacock: 1 },
    names: W([], [], [], []),
    title: W('Satyanarayan Puja', 'श्री सत्यनारायण कथा', 'ਸ੍ਰੀ ਸਤਿਆਨਾਰਾਇਣ ਕਥਾ', 'શ્રી સત્યનારાયણ કથા'),
    tagline: W('With faith and gratitude', 'श्रद्धा और आभार के साथ', 'ਸ਼ਰਧਾ ਅਤੇ ਸ਼ੁਕਰਾਨੇ ਨਾਲ', 'શ્રદ્ધા અને આભાર સાથે'),
    message: W('We are holding a puja at our home and invite you and your family to join us and take prasad.',
      'हमारे निवास पर आयोजित पूजा एवं कथा में आप सपरिवार पधारकर प्रसाद ग्रहण करें।',
      'ਸਾਡੇ ਘਰ ਹੋ ਰਹੀ ਪੂਜਾ ਅਤੇ ਕਥਾ ਵਿੱਚ ਆਪ ਜੀ ਪਰਿਵਾਰ ਸਮੇਤ ਪਧਾਰ ਕੇ ਪ੍ਰਸ਼ਾਦ ਛਕੋ।',
      'અમારા નિવાસસ્થાને યોજાયેલી પૂજા અને કથામાં સહપરિવાર પધારી પ્રસાદ ગ્રહણ કરશો.'),
    host: W('The Agarwal family', 'निवेदक: अग्रवाल परिवार', 'ਵੱਲੋਂ: ਅਗਰਵਾਲ ਪਰਿਵਾਰ', 'નિમંત્રક: અગ્રવાલ પરિવાર'),
    closing: W('Prasad will follow the aarti', 'आरती के बाद प्रसाद वितरण', 'ਆਰਤੀ ਤੋਂ ਬਾਅਦ ਪ੍ਰਸ਼ਾਦ', 'આરતી બાદ પ્રસાદ'),
  },
  diwali: {
    label: 'Diwali Party', blessing: 'none', events: ['puja', 'party', 'dinner'],
    layouts: { diya: 3, mandala: 3, marigold: 2, confetti: 2, arch: 2, minimal: 1, paisley: 1, garden: 0 },
    palettes: { midnight: 3, maroon: 3, saffron: 2, peacock: 2, haldi: 1 },
    names: W([], [], [], []),
    title: W('Diwali Party', 'दीपावली मिलन', 'ਦੀਵਾਲੀ ਮਿਲਣੀ', 'દિવાળી મિલન'),
    tagline: W('Lights, sweets and good times', 'दीयों, मिठाइयों और खुशियों की शाम', 'ਦੀਵਿਆਂ, ਮਿਠਾਈਆਂ ਅਤੇ ਖੁਸ਼ੀਆਂ ਦੀ ਸ਼ਾਮ', 'દીવા, મીઠાઈ અને ખુશીઓની સાંજ'),
    message: W('Celebrate the festival of lights with us: diyas, rangoli, sweets and a friendly card game.',
      'दीयों, रंगोली, मिठाइयों और ढेर सारी खुशियों के साथ दीपावली मनाने आइए।',
      'ਦੀਵਿਆਂ, ਰੰਗੋਲੀ, ਮਿਠਾਈਆਂ ਅਤੇ ਢੇਰ ਸਾਰੀਆਂ ਖੁਸ਼ੀਆਂ ਨਾਲ ਦੀਵਾਲੀ ਮਨਾਉਣ ਆਓ।',
      'દીવા, રંગોળી, મીઠાઈ અને ઢગલાબંધ ખુશીઓ સાથે દિવાળી ઉજવવા પધારો.'),
    host: W('Hosted by the Bansal family', 'आयोजक: बंसल परिवार', 'ਵੱਲੋਂ: ਬਾਂਸਲ ਪਰਿਵਾਰ', 'આયોજક: બંસલ પરિવાર'),
    closing: W('Wear something festive!', 'त्योहारी कपड़ों में आइए!', 'ਤਿਉਹਾਰੀ ਕੱਪੜੇ ਪਾ ਕੇ ਆਓ!', 'તહેવારી પોશાકમાં આવજો!'),
  },
  lohri: {
    label: 'Lohri', blessing: 'none', events: ['bonfire', 'dinner'],
    layouts: { diya: 3, confetti: 3, marigold: 2, paisley: 2, mandala: 1, minimal: 1, garden: 0, arch: 1 },
    palettes: { saffron: 3, midnight: 3, maroon: 2, haldi: 2 },
    names: W([], [], [], []),
    title: W('Lohri Di Raat', 'लोहड़ी की रात', 'ਲੋਹੜੀ ਦੀ ਰਾਤ', 'લોહડીની રાત'),
    tagline: W('Bonfire, bhangra and rewri', 'अलाव, भांगड़ा और रेवड़ी', 'ਧੂਣੀ, ਭੰਗੜਾ ਅਤੇ ਰਿਓੜੀਆਂ', 'તાપણું, ભાંગડા અને રેવડી'),
    message: W('Gather around the bonfire with us for dhol, bhangra, rewri and peanuts.',
      'ढोल, भांगड़ा, रेवड़ी और मूँगफली के साथ लोहड़ी के अलाव के पास हमारे साथ आइए।',
      'ਢੋਲ, ਭੰਗੜੇ, ਰਿਓੜੀਆਂ ਅਤੇ ਮੂੰਗਫਲੀ ਨਾਲ ਲੋਹੜੀ ਦੀ ਧੂਣੀ ਦੁਆਲੇ ਸਾਡੇ ਨਾਲ ਆਓ।',
      'ઢોલ, ભાંગડા, રેવડી અને મગફળી સાથે લોહડીના તાપણા પાસે અમારી સાથે જોડાઓ.'),
    host: W('The Sandhu family', 'आयोजक: संधू परिवार', 'ਵੱਲੋਂ: ਸੰਧੂ ਪਰਿਵਾਰ', 'આયોજક: સંધુ પરિવાર'),
    closing: W('Bring your dancing shoes', 'नाचने के लिए तैयार रहिए', 'ਨੱਚਣ ਲਈ ਤਿਆਰ ਰਹੋ', 'નાચવા તૈયાર રહેજો'),
  },
  garba: {
    label: 'Garba Night', blessing: 'ambe', events: ['aarti', 'garba'],
    layouts: { mandala: 3, confetti: 3, paisley: 3, diya: 2, marigold: 2, minimal: 1, garden: 1, arch: 1 },
    palettes: { peacock: 3, saffron: 3, maroon: 2, haldi: 2, midnight: 2, mehendi: 1 },
    names: W([], [], [], []),
    title: W('Navratri Garba Night', 'नवरात्रि गरबा रात', 'ਨਵਰਾਤਰੀ ਗਰਬਾ ਰਾਤ', 'નવરાત્રી ગરબા રાત'),
    tagline: W('Nine nights of dance and devotion', 'नौ रातें, भक्ति और नृत्य', 'ਨੌਂ ਰਾਤਾਂ, ਭਗਤੀ ਅਤੇ ਨਾਚ', 'નવ રાત, ભક્તિ અને નૃત્ય'),
    message: W('Put on your chaniya choli and kediyu, and join us for garba and dandiya!',
      'चनिया-चोली और केडियू पहनकर गरबा और डांडिया के लिए हमारे साथ आइए!',
      'ਰੰਗ-ਬਿਰੰਗੇ ਕੱਪੜੇ ਪਾ ਕੇ ਗਰਬਾ ਅਤੇ ਡਾਂਡੀਆ ਲਈ ਸਾਡੇ ਨਾਲ ਆਓ!',
      'ચણિયાચોળી અને કેડિયું પહેરીને ગરબા અને દાંડિયા રમવા અમારી સાથે જોડાઓ!'),
    host: W('Hosted by the Patel family', 'आयोजक: पटेल परिवार', 'ਵੱਲੋਂ: ਪਟੇਲ ਪਰਿਵਾਰ', 'આયોજક: પટેલ પરિવાર'),
    closing: W('Dandiya sticks on us', 'डांडिया स्टिक हमारी ओर से', 'ਡਾਂਡੀਆ ਸਟਿੱਕਾਂ ਸਾਡੇ ਵੱਲੋਂ', 'દાંડિયા અમારા તરફથી'),
  },
};

export const SYMBOL_DEFAULT = { wedding: 'ganesh', engagement: 'ganesh', griha: 'kalash', naamkaran: 'om', puja: 'ganesh', diwali: 'diya', garba: 'diya', reception: 'none' };

export const FIELD_KEYS = ['title', 'tagline', 'message', 'host', 'closing'];

// ---------- template list ----------
export function templateId(occ, layout, pal) { return `${occ}.${layout}.${pal}`; }

let _all = null;
export function allTemplates() {
  if (_all) return _all;
  _all = [];
  for (const [occ, o] of Object.entries(OCCASIONS)) {
    for (const layout of Object.keys(LAYOUTS)) {
      for (const pal of Object.keys(PALETTES)) {
        const score = (o.layouts[layout] ?? 1) * 2 + (o.palettes[pal] ?? 0);
        _all.push({
          id: templateId(occ, layout, pal), occasion: occ, layout, palette: pal, score,
          name: `${LAYOUTS[layout].label} · ${PALETTES[pal].label}`,
        });
      }
    }
  }
  return _all;
}

// ---------- invitation model ----------
function isoDaysFromNow(n, hh = 19, mm = 0) {
  const d = new Date(); d.setDate(d.getDate() + n); d.setHours(hh, mm, 0, 0);
  const p = (x) => String(x).padStart(2, '0');
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(hh)}:${p(mm)}` };
}

export function newInvite(tid, prev) {
  const [occ, layout, pal] = tid.split('.');
  const o = OCCASIONS[occ];
  const L = LAYOUTS[layout];
  const main = isoDaysFromNow(45, 19, 0);
  const text = {};
  for (const lang of Object.keys(LANGS)) {
    text[lang] = { names: [...(o.names[lang] || [])] };
    for (const k of FIELD_KEYS) text[lang][k] = o[k][lang];
    text[lang].venue = { en: 'The Grand Palace Banquet', hi: 'द ग्रैंड पैलेस बैंक्वेट', pa: 'ਦ ਗ੍ਰੈਂਡ ਪੈਲੇਸ ਬੈਂਕੁਇਟ', gu: 'ધ ગ્રાન્ડ પેલેસ બેન્ક્વેટ' }[lang];
    text[lang].address = { en: 'MG Road, Jaipur', hi: 'एम.जी. रोड, जयपुर', pa: 'ਐਮ.ਜੀ. ਰੋਡ, ਜੈਪੁਰ', gu: 'એમ.જી. રોડ, જયપુર' }[lang];
  }
  const events = o.events.map((k, i) => {
    const d = isoDaysFromNow(45 - (o.events.length - 1 - i) * (occ === 'wedding' ? 1 : 0), [11, 16, 19, 20, 21][i] ?? 19, 0);
    return { key: k, name: { ...EVENT_NAMES[k] }, date: d.date, time: d.time };
  });
  const inv = {
    v: 1,
    templateId: tid, occasion: occ, layout, palette: pal,
    colors: { ...PALETTES[pal], bg: [...PALETTES[pal].bg] },
    type: L.type, fx: L.fx, blessing: o.blessing,
    symbol: SYMBOL_DEFAULT[occ] || 'none', symbolImage: null,
    monogram: { on: (o.names.en || []).length === 2, style: 'ring', text: '' },
    lang: 'hi', lang2: 'en',
    text, events,
    date: main.date, time: main.time,
    mapQuery: 'MG Road, Jaipur',
    contact: '',
    photo: null,
    scenes: { blessing: o.blessing !== 'none' || (SYMBOL_DEFAULT[occ] || 'none') !== 'none', names: true, message: true, details: true, events: events.length > 1, closing: true },
    speed: 1,
    showCredit: true,
  };
  // Keep what the person already typed when they switch templates.
  if (prev) {
    for (const k of ['lang', 'lang2', 'date', 'time', 'mapQuery', 'contact', 'photo', 'music', 'speed', 'showCredit', 'symbolImage']) if (prev[k] !== undefined) inv[k] = prev[k];
    if (prev.occasion === occ) {
      for (const k of ['text', 'events', 'blessing', 'scenes', 'symbol', 'monogram']) if (prev[k] !== undefined) inv[k] = prev[k];
    } else {
      // Same people, different function (e.g. wedding → haldi): keep names, venue and address.
      for (const lang of Object.keys(LANGS)) {
        const a = prev.text?.[lang], b = inv.text[lang]; if (!a) continue;
        if ((a.names || []).length === 2 && b.names.length === 2) b.names = [...a.names];
        b.venue = a.venue; b.address = a.address;
      }
      if (prev.monogram) inv.monogram = { ...prev.monogram, on: prev.monogram.on && inv.monogram.on };
    }
  }
  return inv;
}

export function applyPalette(inv, pal) {
  inv.palette = pal; inv.colors = { ...PALETTES[pal], bg: [...PALETTES[pal].bg] };
  inv.templateId = templateId(inv.occasion, inv.layout, pal);
}
