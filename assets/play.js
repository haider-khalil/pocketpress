/* PocketPress "play" layer: command palette, drop-anywhere overlay, hover spotlight,
   and the game layer (XP, levels, achievements, streaks, stats panel, share card).
   Progress is stored only in this browser (localStorage). Nothing is sent anywhere. */
(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const ROOT = document.documentElement.dataset.root || './';
const href = p => ROOT + (p ? p + '/' : '') + (window.PP_DEV ? 'index.html' : '');
const bus = window.PPBus || (window.PPBus = new EventTarget());
const lang = () => (document.documentElement.lang === 'ur' ? 'ur' : 'en');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = b => { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + ' KB'; if (b < 1073741824) return (b / 1048576).toFixed(b < 104857600 ? 1 : 0) + ' MB'; return (b / 1073741824).toFixed(2) + ' GB'; };
const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a10 10 0 1 1 17.4 0"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  stack: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  form: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>',
  person: '<rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M7 19c1-3 3-4 5-4s4 1 5 4"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  stamp: '<path d="M5 21h14"/><path d="M6 17h12v-3a2 2 0 0 0-2-2h-2.5l.8-4.2A3 3 0 1 0 9.7 7.8l.8 4.2H8a2 2 0 0 0-2 2z"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  merge: '<rect x="3" y="3" width="8" height="10" rx="2"/><rect x="13" y="11" width="8" height="10" rx="2"/><path d="M11 8h4a2 2 0 0 1 2 2v1"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.4 2-1.5 3-2.5 3 0-3-1-6-4-8 .3 3-1.5 5-3 7S4 13 4 15c0 4 3.5 7 8 7z"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  upload: '<path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  lockOpen: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/>'
};
const ic = (k, cls) => `<svg class="${cls || 'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k] || I.spark}</svg>`;

/* ---------------- strings ---------------- */
const STR = {
en: {
  search_ph: 'Search tools and actions…', search_btn: 'Search tools', popular: 'Popular tools', tools: 'Tools', actions: 'Actions', no_results: 'No matches. Try "pdf", "passport" or "100 kb".',
  nav_hint: '↑↓ to move · Enter to open · Esc to close',
  a_theme: 'Switch light / dark theme', a_lang: 'اردو میں دیکھیں', a_stats: 'Your stats and achievements', a_install: 'Install the app', a_sample: 'Try with a sample photo', a_choose: 'Choose files', a_clear: 'Clear the file list',
  veil: 'Drop to compress', veil_s: 'Photos, PDFs, Word, Excel and PowerPoint',
  lvl: 'Lv {n}', stats_title: 'Your PocketPress', level: 'Level {n}', xp_to: '{xp} XP to {next}', max_lvl: 'Top level reached. Legend!',
  t_saved: 'Saved', t_files: 'Files', t_streak: 'Day streak', t_best: 'Best single save', days: '{n} days', day1: '1 day',
  fun_wa: '≈ {n} WhatsApp-size photos', fun_up: '≈ {n} min of uploading saved on mobile data',
  ach: 'Achievements', ach_n: '{a} of {b} unlocked', unlocked: 'Achievement unlocked', levelup: 'Level up!', now: 'You are now a {name}',
  local: 'Your progress is saved only in this browser.', share: 'Share my stats', reset: 'Reset progress', reset2: 'Tap again to reset',
  card_saved: 'saved with PocketPress', card_files: '{n} files', card_badges: '{n} achievements', card_cta: 'Free · Private · Files never leave your device',
  shared: 'Stats card ready', locked: 'Locked', on: 'Unlocked {d}', keep: 'Start compressing to earn XP and unlock achievements.'
},
ur: {
  search_ph: 'ٹولز اور کام تلاش کریں…', search_btn: 'ٹولز تلاش کریں', popular: 'مقبول ٹولز', tools: 'ٹولز', actions: 'کام', no_results: 'کچھ نہیں ملا۔ "pdf"، "passport" یا "100 kb" آزمائیں۔',
  nav_hint: '↑↓ منتخب · Enter کھولیں · Esc بند',
  a_theme: 'روشن / گہرا تھیم', a_lang: 'Switch to English', a_stats: 'آپ کے اعداد و شمار اور کامیابیاں', a_install: 'ایپ انسٹال کریں', a_sample: 'نمونے کی تصویر سے آزمائیں', a_choose: 'فائلیں منتخب کریں', a_clear: 'فہرست صاف کریں',
  veil: 'کمپریس کرنے کے لیے چھوڑیں', veil_s: 'تصاویر، PDF، ورڈ، ایکسل اور پاورپوائنٹ',
  lvl: 'لیول {n}', stats_title: 'آپ کا PocketPress', level: 'لیول {n}', xp_to: '{next} تک {xp} XP', max_lvl: 'سب سے اونچا لیول۔ زبردست!',
  t_saved: 'بچت', t_files: 'فائلیں', t_streak: 'مسلسل دن', t_best: 'سب سے بڑی بچت', days: '{n} دن', day1: '1 دن',
  fun_wa: '≈ {n} واٹس ایپ سائز تصاویر', fun_up: '≈ {n} منٹ کی اپ لوڈنگ بچی',
  ach: 'کامیابیاں', ach_n: '{b} میں سے {a} حاصل', unlocked: 'کامیابی حاصل', levelup: 'لیول اپ!', now: 'اب آپ {name} ہیں',
  local: 'آپ کی پیش رفت صرف اسی براؤزر میں محفوظ ہے۔', share: 'اپنے اعداد شیئر کریں', reset: 'پیش رفت ری سیٹ', reset2: 'ری سیٹ کے لیے دوبارہ دبائیں',
  card_saved: 'PocketPress سے بچائے', card_files: '{n} فائلیں', card_badges: '{n} کامیابیاں', card_cta: 'Free · Private · Files never leave your device',
  shared: 'اسٹیٹس کارڈ تیار', locked: 'لاک', on: '{d} کو حاصل', keep: 'XP کمانے اور کامیابیاں حاصل کرنے کے لیے فائلیں کمپریس کریں۔'
}};
const tx = (k, v) => { let s = (STR[lang()] || STR.en)[k] || STR.en[k] || k; if (v) for (const n in v) s = s.replace('{' + n + '}', v[n]); return s; };

/* =====================================================================
   Game state
   ===================================================================== */
const LEVELS = [[0, 'Paper Clip', 'پیپر کلپ'], [60, 'Stapler', 'اسٹیپلر'], [180, 'Hole Punch', 'ہول پنچ'], [400, 'Folder', 'فولڈر'], [750, 'Filing Cabinet', 'فائلنگ کیبنٹ'],
  [1200, 'Squeezer', 'اسکویزر'], [1900, 'Press Operator', 'پریس آپریٹر'], [2900, 'Space Saver', 'اسپیس سیور'], [4300, 'Byte Bender', 'بائٹ بینڈر'], [6500, 'Compression Master', 'کمپریشن ماسٹر']];
const ACH = [
  ['first', 'spark', 'First squeeze', 'Compress your first file', 'پہلا اسکویز', 'اپنی پہلی فائل کمپریس کریں'],
  ['mb10', 'gauge', '10 MB club', 'Save 10 MB in total', '10 MB کلب', 'کل 10 MB بچائیں'],
  ['mb100', 'gauge', '100 MB club', 'Save 100 MB in total', '100 MB کلب', 'کل 100 MB بچائیں'],
  ['gb1', 'trophy', 'Gigabyte hero', 'Save 1 GB in total', 'گیگا بائٹ ہیرو', 'کل 1 GB بچائیں'],
  ['heavy', 'bolt', 'Heavy lifter', 'Shrink one file by 10 MB or more', 'وزن اٹھانے والا', 'ایک فائل 10 MB یا زیادہ چھوٹی کریں'],
  ['batch10', 'stack', 'Batch boss', 'Compress 10 files in one go', 'بیچ باس', 'ایک ساتھ 10 فائلیں کمپریس کریں'],
  ['form', 'form', 'Form ready', 'Fit a photo under 100 KB', 'فارم تیار', 'تصویر 100 KB سے کم کریں'],
  ['passport', 'person', 'Passport pro', 'Make a passport photo', 'پاسپورٹ ماہر', 'پاسپورٹ تصویر بنائیں'],
  ['sheet', 'print', 'Print ready', 'Make a passport print sheet', 'پرنٹ کے لیے تیار', 'پاسپورٹ پرنٹ شیٹ بنائیں'],
  ['wm', 'stamp', 'ID protector', 'Add a watermark to a photo', 'شناخت کا محافظ', 'تصویر پر واٹر مارک لگائیں'],
  ['lock', 'lock', 'Vault keeper', 'Lock a PDF with a password', 'تجوری کا رکھوالا', 'PDF پر پاس ورڈ لگائیں'],
  ['pages', 'grid', 'Page shuffler', 'Organize or split PDF pages', 'صفحات کا ماہر', 'PDF صفحات ترتیب دیں یا تقسیم کریں'],
  ['merge', 'merge', 'Glue master', 'Merge PDFs or turn photos into one PDF', 'جوڑنے کا ماہر', 'PDF جوڑیں یا تصاویر سے PDF بنائیں'],
  ['streak3', 'flame', 'On a roll', 'Use PocketPress 3 days in a row', 'مسلسل کامیابی', '3 دن مسلسل استعمال کریں'],
  ['night', 'moon', 'Night owl', 'Switch to the dark theme', 'رات کا الو', 'گہرا تھیم آن کریں'],
  ['urdu', 'globe', 'اردو دوست', 'Use PocketPress in Urdu', 'اردو دوست', 'PocketPress اردو میں استعمال کریں'],
  ['install', 'phone', 'Pocket sized', 'Install the PocketPress app', 'جیب میں', 'PocketPress ایپ انسٹال کریں']
];
const achName = a => lang() === 'ur' ? a[4] : a[2], achDesc = a => lang() === 'ur' ? a[5] : a[3];
const lvlName = l => lang() === 'ur' ? l[2] : l[1];

function load() { try { return Object.assign({ xp: 0, badges: {}, days: [], best: 0 }, JSON.parse(localStorage.getItem('pp-play')) || {}); } catch (e) { return { xp: 0, badges: {}, days: [], best: 0 }; } }
function save(st) { try { localStorage.setItem('pp-play', JSON.stringify(st)); } catch (e) {} }
function totals() { try { return JSON.parse(localStorage.getItem('pp-stats')) || { saved: 0, files: 0 }; } catch (e) { return { saved: 0, files: 0 }; } }
let G = load();
function levelOf(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const from = LEVELS[i][0], to = LEVELS[i + 1] ? LEVELS[i + 1][0] : null;
  return { i, n: i + 1, l: LEVELS[i], next: LEVELS[i + 1] || null, from, to, frac: to ? (xp - from) / (to - from) : 1 };
}
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function streak() {
  const set = new Set(G.days); let n = 0; const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1);
  for (;;) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if (!set.has(k)) break; n++; d.setDate(d.getDate() - 1); }
  return n;
}
function addXP(n) {
  const before = levelOf(G.xp).i; G.xp += n; save(G); paintLevel();
  const after = levelOf(G.xp);
  if (after.i > before) pop({ kind: 'level', title: tx('levelup'), sub: tx('now', { name: lvlName(after.l) }), icon: 'trophy', n: after.n });
}
function unlock(id) {
  if (G.badges[id]) return; const a = ACH.find(x => x[0] === id); if (!a) return;
  G.badges[id] = Date.now(); save(G);
  pop({ kind: 'ach', title: achName(a), sub: tx('unlocked'), icon: a[1], xp: 25 });
  addXP(25);
}
function markDay() { const d = today(); if (!G.days.includes(d)) { G.days.push(d); G.days = G.days.slice(-60); save(G); } if (streak() >= 3) unlock('streak3'); }

/* events from the rest of the site */
bus.addEventListener('file-done', e => {
  const d = e.detail || {};
  if (d.kind === 'img' && d.target && d.target <= 102400 && d.after <= d.target) unlock('form');
  if (d.kind === 'img' && d.edit && d.edit.kb && d.edit.kb <= 100 && d.after <= d.edit.kb * 1024) unlock('form');
  if (d.saved > G.best) { G.best = d.saved; save(G); }
  if (!d.first) return;
  markDay(); unlock('first');
  const t = totals(); if (t.saved >= 10485760) unlock('mb10'); if (t.saved >= 104857600) unlock('mb100'); if (t.saved >= 1073741824) unlock('gb1');
  if (d.saved >= 10485760) unlock('heavy');
  addXP(10 + Math.min(40, Math.floor(d.saved / 102400)));
});
bus.addEventListener('batch-done', e => { if ((e.detail || {}).count >= 10) unlock('batch10'); });
for (const [ev, id] of [['passport', 'passport'], ['sheet', 'sheet'], ['watermark', 'wm'], ['lock', 'lock'], ['pages', 'pages'], ['merge', 'merge'], ['install', 'install']])
  bus.addEventListener(ev, () => unlock(id));
bus.addEventListener('theme', e => { if (e.detail && e.detail.dark) unlock('night'); });
bus.addEventListener('lang', e => { if (e.detail && e.detail.lang === 'ur') unlock('urdu'); setTimeout(() => { paintLevel(); }, 0); });

/* ---------------- unlock pop-ups (one at a time) ---------------- */
const popQ = []; let popping = false;
function pop(p) { popQ.push(p); if (!popping) nextPop(); }
function nextPop() {
  const p = popQ.shift(); if (!p) { popping = false; return; } popping = true;
  const el = document.createElement('div'); el.className = 'ach-pop' + (p.kind === 'level' ? ' is-level' : ''); el.setAttribute('role', 'status');
  el.innerHTML = `<span class="ach-badge">${p.kind === 'level' ? `<b>${p.n}</b>` : ic(p.icon)}<i class="sp s1"></i><i class="sp s2"></i><i class="sp s3"></i><i class="sp s4"></i></span>
    <span class="ach-txt"><small>${esc(p.sub && p.kind === 'ach' ? p.sub : p.title)}</small><b>${esc(p.kind === 'ach' ? p.title : p.sub)}</b></span>${p.xp ? `<span class="ach-xp">+${p.xp} XP</span>` : ''}`;
  el.addEventListener('click', () => { el.remove(); openStats(); });
  document.body.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); nextPop(); }, 380); }, 3400);
}

/* ---------------- header level chip ---------------- */
function paintLevel() {
  const L = levelOf(G.xp);
  $$('[data-stats]').forEach(b => {
    const n = $('.lvl-n', b); if (n) n.textContent = tx('lvl', { n: L.n });
    b.style.setProperty('--p', (L.frac * 100).toFixed(1) + '%');
    b.title = `${lvlName(L.l)} · ${G.xp} XP`; b.setAttribute('aria-label', `${tx('stats_title')}: ${tx('level', { n: L.n })}, ${lvlName(L.l)}`);
  });
}

/* =====================================================================
   Stats panel
   ===================================================================== */
function openStats() {
  closeCmdk();
  const L = levelOf(G.xp), T = totals(), S = streak(), got = ACH.filter(a => G.badges[a[0]]).length;
  const wa = Math.round(T.saved / 204800), up = Math.round(T.saved * 8 / 5e6 / 60);
  const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', tx('stats_title'));
  const date = ts => new Date(ts).toLocaleDateString(lang() === 'ur' ? 'ur-PK' : undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const C = 2 * Math.PI * 52;
  m.innerHTML = `<div class="modal-card wide play-card">
    <div class="modal-head"><h2>${esc(tx('stats_title'))}</h2><button class="btn sm" type="button" data-x>${lang() === 'ur' ? 'بند کریں' : 'Close'}</button></div>
    <div class="modal-body">
      <div class="play-hero">
        <div class="lvl-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle class="lr-p" cx="60" cy="60" r="52" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${C.toFixed(1)};--to:${(C * (1 - L.frac)).toFixed(1)}"/></svg><span><small>${esc(tx('level', { n: '' }).trim())}</small><b>${L.n}</b></span></div>
        <div class="lvl-info"><p class="eyebrow-s">${esc(tx('level', { n: L.n }))} · ${G.xp} XP</p><h3 class="lvl-name">${esc(lvlName(L.l))}</h3>
          <div class="xpbar"><i style="--w:${(L.frac * 100).toFixed(1)}%"></i></div>
          <p class="hint">${L.next ? esc(tx('xp_to', { xp: L.to - G.xp, next: lvlName(L.next) })) : esc(tx('max_lvl'))}</p></div>
      </div>
      <div class="play-stats">
        <div><span class="label">${esc(tx('t_saved'))}</span><b class="num" data-count="${T.saved}" data-f="b">${fmt(T.saved)}</b></div>
        <div><span class="label">${esc(tx('t_files'))}</span><b class="num" data-count="${T.files}">${T.files}</b></div>
        <div><span class="label">${esc(tx('t_streak'))}</span><b class="num streak">${ic('flame')}<span>${S === 1 ? tx('day1') : tx('days', { n: S })}</span></b></div>
        <div><span class="label">${esc(tx('t_best'))}</span><b class="num">${fmt(G.best || 0)}</b></div>
      </div>
      ${T.saved > 0 ? `<p class="fun">${wa >= 1 ? `<span>${ic('image')}${esc(tx('fun_wa', { n: wa.toLocaleString() }))}</span>` : ''}${up >= 1 ? `<span>${ic('upload')}${esc(tx('fun_up', { n: up.toLocaleString() }))}</span>` : ''}</p>` : `<p class="hint">${esc(tx('keep'))}</p>`}
      <div class="ach-head"><h3>${esc(tx('ach'))}</h3><span class="hint">${esc(tx('ach_n', { a: got, b: ACH.length }))}</span></div>
      <div class="ach-grid">${ACH.map(a => { const on = G.badges[a[0]]; return `<div class="bdg${on ? ' on' : ''}"><span class="bdg-i">${on ? ic(a[1]) : ic('lock')}</span><b>${esc(achName(a))}</b><small>${esc(achDesc(a))}</small>${on ? `<em>${esc(tx('on', { d: date(on) }))}</em>` : ''}</div>`; }).join('')}</div>
      <p class="hint">${esc(tx('local'))}</p>
    </div>
    <div class="modal-foot"><button class="btn ghost" type="button" data-reset>${ic('trash')}<span>${esc(tx('reset'))}</span></button><span class="grow"></span><button class="btn primary" type="button" data-share>${ic('share')}<span>${esc(tx('share'))}</span></button></div>
  </div>`;
  document.body.appendChild(m); document.body.classList.add('modal-open');
  const close = () => { m.remove(); if (!$('.modal')) document.body.classList.remove('modal-open'); document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', key);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) close(); });
  requestAnimationFrame(() => requestAnimationFrame(() => { const p = $('.lr-p', m); if (p) p.style.strokeDashoffset = p.style.getPropertyValue('--to'); m.classList.add('ready'); }));
  $$('.num[data-count]', m).forEach(el => countUp(el, +el.dataset.count, el.dataset.f === 'b' ? fmt : v => Math.round(v).toLocaleString()));
  let armed = false;
  $('[data-reset]', m).addEventListener('click', ev => {
    const b = ev.currentTarget;
    if (!armed) { armed = true; $('span', b).textContent = tx('reset2'); b.classList.add('danger'); setTimeout(() => { if (!m.isConnected) return; armed = false; $('span', b).textContent = tx('reset'); b.classList.remove('danger'); }, 3500); return; }
    G = { xp: 0, badges: {}, days: [], best: 0 }; save(G); try { localStorage.removeItem('pp-stats'); } catch (e) {}
    paintLevel(); const lt = $('#lifetime'); if (lt) lt.hidden = true; close(); openStats();
  });
  $('[data-share]', m).addEventListener('click', () => shareCard());
  setTimeout(() => $('[data-x]', m).focus(), 30);
}
function countUp(el, to, f) {
  if (reduce() || !to) { el.textContent = f(to); return; }
  const t0 = performance.now(), D = 900;
  const step = now => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = f(to * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------------- shareable stats card ---------------- */
async function shareCard() {
  const L = levelOf(G.xp), T = totals(), got = ACH.filter(a => G.badges[a[0]]).length;
  try { await document.fonts.load('800 80px "Plus Jakarta Sans"'); await document.fonts.load('700 40px "Plus Jakarta Sans"'); } catch (e) {}
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0B1A3A'); g.addColorStop(.55, '#123A8C'); g.addColorStop(1, '#1D5BD8'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const glow = (cx, cy, r, col) => { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H); };
  glow(900, 160, 520, 'rgba(79,163,255,.55)'); glow(120, 1200, 520, 'rgba(43,212,196,.35)');
  const F = (w, s) => `${w} ${s}px "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif`;
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); };
  /* logo */
  x.fillStyle = '#fff'; rr(90, 96, 84, 84, 24); x.fill();
  x.fillStyle = '#1D5BD8'; rr(111, 112, 42, 8, 4); x.fill(); rr(117, 132, 30, 22, 6); x.fill(); x.globalAlpha = .5; rr(111, 160, 42, 8, 4); x.fill(); x.globalAlpha = 1;
  x.fillStyle = '#fff'; x.font = F(800, 46); x.textBaseline = 'middle'; x.fillText('PocketPress', 196, 140);
  /* big number */
  x.textBaseline = 'alphabetic'; x.font = F(800, 190); x.fillStyle = '#fff'; const big = fmt(T.saved);
  let fs = 190; while (x.measureText(big).width > W - 180 && fs > 90) { fs -= 10; x.font = F(800, fs); }
  x.fillText(big, 90, 560);
  x.font = F(700, 52); x.fillStyle = 'rgba(255,255,255,.82)'; x.fillText(lang() === 'ur' ? 'saved with PocketPress' : tx('card_saved'), 94, 640);
  /* level pill */
  x.fillStyle = 'rgba(255,255,255,.14)'; rr(90, 720, 900, 170, 36); x.fill();
  x.fillStyle = '#4FA3FF'; x.beginPath(); x.arc(185, 805, 58, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#fff'; x.font = F(800, 60); x.textAlign = 'center'; x.fillText(String(L.n), 185, 826); x.textAlign = 'left';
  x.font = F(700, 30); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(('Level ' + L.n).toUpperCase(), 272, 785);
  x.font = F(800, 54); x.fillStyle = '#fff'; x.fillText(L.l[1], 272, 845);
  /* tiles */
  const tile = (X, label, val) => { x.fillStyle = 'rgba(255,255,255,.1)'; rr(X, 930, 435, 170, 32); x.fill(); x.font = F(700, 28); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(label.toUpperCase(), X + 36, 990); x.font = F(800, 62); x.fillStyle = '#fff'; x.fillText(val, X + 36, 1066); };
  tile(90, 'Files', T.files.toLocaleString()); tile(555, 'Achievements', got + ' / ' + ACH.length);
  x.font = F(700, 30); x.fillStyle = 'rgba(255,255,255,.75)'; x.fillText('Free · Private · Files never leave your device', 90, 1190);
  x.font = F(800, 34); x.fillStyle = '#7FD6FF'; x.fillText(window.PP_SITE || 'haider-khalil.github.io/pocketpress', 90, 1250);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'my-pocketpress-stats.png', { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'My PocketPress stats' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  if (window.PP && window.PP.saveBlob) { window.PP.saveBlob(file.name, blob); return; }
  try { if (window.claude && window.claude.use) { const d = await window.claude.use('downloads'); if (d) { await d.save({ filename: file.name, data: blob }); return; } } } catch (e) { if (e && e.code === 'declined') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 6000);
}

/* =====================================================================
   Command palette
   ===================================================================== */
let cmdk = null, cmdIdx = 0, cmdItems = [];
function actionList() {
  const A = [];
  A.push({ k: 'theme', name: tx('a_theme'), icon: 'sun', run: () => { const b = $('[data-theme-toggle]'); if (b) b.click(); } });
  A.push({ k: 'lang', name: tx('a_lang'), icon: 'globe', run: () => { const b = $('[data-lang-toggle]'); if (b) b.click(); } });
  A.push({ k: 'stats', name: tx('a_stats'), icon: 'trophy', run: openStats });
  if ($('#fileIn')) A.push({ k: 'choose', name: tx('a_choose'), icon: 'upload', run: () => $('#fileIn').click() });
  if ($('[data-sample]')) A.push({ k: 'sample', name: tx('a_sample'), icon: 'image', run: () => $('[data-sample]').click() });
  const ib = $$('[data-install]').find(b => !b.hidden); A.push({ k: 'install', name: tx('a_install'), icon: 'phone', run: () => ib ? ib.click() : (location.href = href('app')) });
  if (window.PP && window.PP.items && window.PP.items.length) A.push({ k: 'clear', name: tx('a_clear'), icon: 'trash', run: () => $('#clearAll').click() });
  return A;
}
const TOOLS = () => (window.PP_TOOLS || []);
function score(t, q) {
  const n = t.n.toLowerCase(), all = (t.n + ' ' + t.d + ' ' + (t.k || '')).toLowerCase(); let s = 0;
  for (const w of q.split(/\s+/).filter(Boolean)) {
    if (n.startsWith(w)) s += 4; else if (n.split(/\W+/).some(p => p.startsWith(w))) s += 3; else if (n.includes(w)) s += 2; else if (all.includes(w)) s += 1; else return 0;
  }
  return s;
}
function openCmdk() {
  if (cmdk) return; if ($('.modal')) return;
  cmdk = document.createElement('div'); cmdk.className = 'cmdk'; cmdk.setAttribute('role', 'dialog'); cmdk.setAttribute('aria-modal', 'true'); cmdk.setAttribute('aria-label', tx('search_btn'));
  cmdk.innerHTML = `<div class="cmdk-box"><div class="cmdk-in">${ic('search')}<input type="text" id="cmdk-q" autocomplete="off" spellcheck="false" placeholder="${esc(tx('search_ph'))}" aria-label="${esc(tx('search_ph'))}" role="combobox" aria-expanded="true" aria-controls="cmdk-list"><kbd>Esc</kbd></div>
    <div class="cmdk-list" id="cmdk-list" role="listbox"></div><div class="cmdk-foot">${esc(tx('nav_hint'))}</div></div>`;
  document.body.appendChild(cmdk); document.body.classList.add('modal-open');
  const q = $('#cmdk-q', cmdk);
  q.addEventListener('input', () => { cmdIdx = 0; paintCmdk(q.value); });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdIdx = Math.min(cmdItems.length - 1, cmdIdx + 1); markCmd(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cmdIdx = Math.max(0, cmdIdx - 1); markCmd(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmd(cmdItems[cmdIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); closeCmdk(); }
  });
  cmdk.addEventListener('click', e => { if (e.target === cmdk) closeCmdk(); const it = e.target.closest('[data-ci]'); if (it) { e.preventDefault(); runCmd(cmdItems[+it.dataset.ci]); } });
  cmdk.addEventListener('mousemove', e => { const it = e.target.closest('[data-ci]'); if (it && +it.dataset.ci !== cmdIdx) { cmdIdx = +it.dataset.ci; markCmd(false); } });
  paintCmdk(''); q.focus();
}
function closeCmdk() { if (!cmdk) return; cmdk.remove(); cmdk = null; if (!$('.modal')) document.body.classList.remove('modal-open'); }
function paintCmdk(qv) {
  const q = qv.trim().toLowerCase(), list = $('.cmdk-list', cmdk); let html = ''; cmdItems = [];
  const here = (location.pathname.replace(/index\.html$/, '').match(/([^/]+)\/$/) || [])[1] || '';
  const toolRow = t => { cmdItems.push({ type: 'tool', t }); return `<a class="ci" role="option" data-ci="${cmdItems.length - 1}" href="${href(t.p)}"><span class="ci-i">${t.i}</span><span class="ci-t"><b>${esc(t.n)}</b><small>${esc(t.d)}</small></span>${t.p === here || (!t.p && !here) ? '<em class="ci-here">•</em>' : ''}<kbd>↵</kbd></a>`; };
  const actRow = a => { cmdItems.push({ type: 'act', a }); return `<button type="button" class="ci" role="option" data-ci="${cmdItems.length - 1}"><span class="ci-i">${ic(a.icon)}</span><span class="ci-t"><b>${esc(a.name)}</b></span><kbd>↵</kbd></button>`; };
  if (!q) {
    const pop = ['passport-photo', 'compress-image-to-100kb', 'compress-pdf', 'jpg-to-pdf', 'crop-image', 'lock-pdf'].map(p => TOOLS().find(t => t.p === p)).filter(Boolean);
    html += `<div class="cg">${esc(tx('popular'))}</div>` + pop.map(toolRow).join('');
    html += `<div class="cg">${esc(tx('actions'))}</div>` + actionList().map(actRow).join('');
  } else {
    const tools = TOOLS().map(t => [score(t, q), t]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 9).map(x => x[1]);
    const acts = actionList().filter(a => a.name.toLowerCase().includes(q) || a.k.includes(q));
    if (tools.length) html += `<div class="cg">${esc(tx('tools'))}</div>` + tools.map(toolRow).join('');
    if (acts.length) html += `<div class="cg">${esc(tx('actions'))}</div>` + acts.map(actRow).join('');
    if (!tools.length && !acts.length) html = `<p class="cmdk-empty">${esc(tx('no_results'))}</p>`;
  }
  list.innerHTML = html; markCmd(false);
}
function markCmd(scroll) {
  $$('.ci', cmdk).forEach((el, i) => { el.classList.toggle('on', i === cmdIdx); el.setAttribute('aria-selected', i === cmdIdx); if (i === cmdIdx && scroll !== false) el.scrollIntoView({ block: 'nearest' }); });
}
function runCmd(c) { if (!c) return; closeCmdk(); if (c.type === 'tool') location.href = href(c.t.p); else c.a.run(); }
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); cmdk ? closeCmdk() : openCmdk(); return; }
  if (e.key === 'Escape' && cmdk) { e.preventDefault(); closeCmdk(); return; }
  if (e.key === '/' && !cmdk && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') && !(document.activeElement || {}).isContentEditable) { e.preventDefault(); openCmdk(); }
});
$$('[data-cmdk]').forEach(b => { b.addEventListener('click', openCmdk); const k = $('kbd', b); if (k) k.textContent = MAC ? '⌘K' : 'Ctrl K'; });
$$('[data-stats]').forEach(b => b.addEventListener('click', openStats));
const life = $('#lifetime');
if (life) { life.setAttribute('role', 'button'); life.tabIndex = 0; life.classList.add('clickable'); life.addEventListener('click', openStats); life.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStats(); } }); }

/* =====================================================================
   Drop anywhere
   ===================================================================== */
if ($('#fileIn') && window.PP && window.PP.addFiles) {
  const veil = document.createElement('div'); veil.className = 'veil'; veil.hidden = true;
  veil.innerHTML = `<div class="veil-in"><span class="veil-ring">${ic('upload')}</span><b>${esc(tx('veil'))}</b><small>${esc(tx('veil_s'))}</small></div>`;
  document.body.appendChild(veil);
  let depth = 0;
  const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  window.addEventListener('dragenter', e => { if (!hasFiles(e)) return; depth++; if (!veil.hidden) return; $('b', veil).textContent = tx('veil'); $('small', veil).textContent = tx('veil_s'); veil.hidden = false; });
  window.addEventListener('dragleave', e => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) veil.hidden = true; });
  veil.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  veil.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); depth = 0; veil.hidden = true; const f = [...(e.dataTransfer.files || [])]; if (f.length) window.PP.addFiles(f); });
  window.addEventListener('drop', () => { depth = 0; veil.hidden = true; });
}

/* =====================================================================
   Hover spotlight + drop-zone tilt (mouse only)
   ===================================================================== */
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let raf = 0, last = null;
  document.addEventListener('pointermove', e => {
    last = e; if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const ev = last, el = ev.target.closest && ev.target.closest('.spot');
      if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); el.style.setProperty('--my', (ev.clientY - r.top) + 'px'); }
      const d = ev.target.closest && ev.target.closest('.drop');
      if (d && !reduce()) { const r = d.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width - .5, py = (ev.clientY - r.top) / r.height - .5;
        d.style.setProperty('--rx', (-py * 3).toFixed(2) + 'deg'); d.style.setProperty('--ry', (px * 4).toFixed(2) + 'deg');
        d.style.setProperty('--bx', (px * 14).toFixed(1) + 'px'); d.style.setProperty('--by', (py * 10).toFixed(1) + 'px'); }
    });
  }, { passive: true });
  document.addEventListener('pointerout', e => { const d = e.target.closest && e.target.closest('.drop'); if (d && !d.contains(e.relatedTarget)) ['--rx', '--ry', '--bx', '--by'].forEach(v => d.style.removeProperty(v)); });
}

/* first paint */
paintLevel();
if (lang() === 'ur') setTimeout(() => unlock('urdu'), 1200);
window.PPPlay = { openStats, openCmdk, unlock, state: () => G };
})();
