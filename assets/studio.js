/* PocketPress studio: photo editor (crop, rotate, watermark, live preview), passport photo maker,
   PDF page organizer and PDF password lock. Everything runs on the visitor's device. */
(function () {
'use strict';
if (!window.PP || !window.PP.items || !document.getElementById('queue')) return;
const PP = window.PP, $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { esc, fmt, ROOT } = PP;

/* ---------------- strings ---------------- */
const ST = {
en: {
  close:'Close', cancel:'Cancel', save:'Save changes', reset:'Reset', edit_title:'Edit photo', loading:'Loading…',
  v_edit:'Edit', v_result:'Before & after', rotate_l:'Rotate left', rotate_r:'Rotate right', flip:'Flip',
  crop:'Crop', c_none:'No crop', c_free:'Free', wm:'Watermark', wm_ph:'e.g. Copy for bank account only',
  wm_tile:'Repeat', wm_center:'Centre', wm_corner:'Corner', wm_white:'White', wm_black:'Black', wm_size:'Size', wm_op:'Strength',
  wm_all:'Use this watermark on all photos', wm_all_done:'Watermark added to {n} photos',
  q:'Quality', q_page:'Use page setting', result:'Result', result_v:'{dim} · {size} ({pct})', working:'Working…',
  before:'Before', after:'After',
  pp_title:'Passport photo', pp_size:'Photo size', pp_bg:'Make background white', pp_bg_on:'White background on', pp_bg_load:'Getting background tool ready (about 6 MB, first time only)…',
  pp_bg_fail:'The background tool does not work on this device. You can still crop and resize.', pp_kb:'Maximum file size', pp_nolimit:'No limit',
  pp_tip:'Drag the box so your head and the top of your shoulders fit inside. Your face should fill about 70% of the height.',
  pp_w:'Width', pp_h:'Height', pp_custom:'Custom size (pixels)',
  sheet_title:'Print sheet', sheet_intro:'Put several copies of your photo on one page to print at a photo shop or at home.',
  sheet_4x6:'4×6 inch photo paper (10×15 cm)', sheet_a4:'A4 paper', sheet_make:'Make print sheet', sheet_note:'{n} copies · print at 100% size, {paper}',
  sheet_hint:'Tip: tap Print sheet to put {n} copies on one 4×6 photo for printing.',
  pg_title:'Organize pages', pg_hint:'Drag ⠿ to reorder. ↻ rotates a page, ✕ removes it.', pg_count:'{n} pages · {k} removed',
  pg_save:'Save as new PDF', pg_split:'Split into separate pages (.zip)', pg_rot:'Rotate page', pg_del:'Remove page', pg_keep:'Keep page',
  pg_none:'Keep at least one page.', pg_pw:'This PDF has a password. Use Lock to remove it first.', pg_saved:'{n} pages', pg_split_note:'{n} single-page PDFs in a .zip',
  lk_title:'Password protect PDF', lk_pw:'Password', lk_pw2:'Type it again', lk_show:'Show password', lk_btn:'Lock PDF',
  lk_note:'Anyone opening the PDF will need this password. Keep it safe: it cannot be recovered.', lk_short:'Use at least 4 characters.', lk_match:'The two passwords are different.',
  lk_done:'Locked with a password · AES-256', ul_title:'Remove PDF password', ul_intro:'This PDF is locked. Enter its password to save an unlocked copy you can compress and edit.',
  ul_btn:'Unlock PDF', ul_wrong:'That password is not correct. Try again.', ul_done:'Unlocked copy added. It is being compressed now.'
},
ur: {
  close:'بند کریں', cancel:'منسوخ', save:'تبدیلیاں محفوظ کریں', reset:'ری سیٹ', edit_title:'تصویر ایڈٹ کریں', loading:'لوڈ ہو رہا ہے…',
  v_edit:'ایڈٹ', v_result:'پہلے اور بعد', rotate_l:'بائیں گھمائیں', rotate_r:'دائیں گھمائیں', flip:'پلٹیں',
  crop:'کراپ', c_none:'کراپ نہیں', c_free:'آزاد', wm:'واٹر مارک', wm_ph:'مثلاً صرف بینک اکاؤنٹ کے لیے کاپی',
  wm_tile:'دہرائیں', wm_center:'درمیان', wm_corner:'کونے میں', wm_white:'سفید', wm_black:'کالا', wm_size:'سائز', wm_op:'گہرائی',
  wm_all:'یہ واٹر مارک تمام تصاویر پر لگائیں', wm_all_done:'{n} تصاویر پر واٹر مارک لگ گیا',
  q:'کوالٹی', q_page:'صفحے کی سیٹنگ', result:'نتیجہ', result_v:'{dim} · {size} ({pct})', working:'جاری ہے…',
  before:'پہلے', after:'بعد',
  pp_title:'پاسپورٹ تصویر', pp_size:'تصویر کا سائز', pp_bg:'پس منظر سفید کریں', pp_bg_on:'سفید پس منظر لگا ہے', pp_bg_load:'پس منظر کا ٹول تیار ہو رہا ہے (تقریباً 6 MB، صرف پہلی بار)…',
  pp_bg_fail:'یہ ٹول اس آلے پر کام نہیں کرتا۔ آپ پھر بھی کراپ اور سائز تبدیل کر سکتے ہیں۔', pp_kb:'زیادہ سے زیادہ فائل سائز', pp_nolimit:'کوئی حد نہیں',
  pp_tip:'باکس کو ایسے رکھیں کہ سر اور کندھوں کا اوپری حصہ اندر آ جائے۔ چہرہ تقریباً 70 فیصد اونچائی میں ہو۔',
  pp_w:'چوڑائی', pp_h:'اونچائی', pp_custom:'اپنا سائز (پکسل)',
  sheet_title:'پرنٹ شیٹ', sheet_intro:'ایک صفحے پر تصویر کی کئی کاپیاں تاکہ فوٹو شاپ یا گھر پر پرنٹ ہو سکیں۔',
  sheet_4x6:'4×6 انچ فوٹو پیپر (10×15 سینٹی میٹر)', sheet_a4:'A4 کاغذ', sheet_make:'پرنٹ شیٹ بنائیں', sheet_note:'{n} کاپیاں · 100% سائز پر پرنٹ کریں، {paper}',
  sheet_hint:'مشورہ: پرنٹ شیٹ دبائیں اور ایک 4×6 فوٹو پر {n} کاپیاں حاصل کریں۔',
  pg_title:'صفحات ترتیب دیں', pg_hint:'ترتیب کے لیے ⠿ کھینچیں۔ ↻ صفحہ گھماتا ہے، ✕ ہٹاتا ہے۔', pg_count:'{n} صفحات · {k} ہٹائے گئے',
  pg_save:'نئی PDF محفوظ کریں', pg_split:'الگ الگ صفحات میں تقسیم (.zip)', pg_rot:'صفحہ گھمائیں', pg_del:'صفحہ ہٹائیں', pg_keep:'صفحہ رکھیں',
  pg_none:'کم از کم ایک صفحہ رکھیں۔', pg_pw:'اس PDF پر پاس ورڈ ہے۔ پہلے لاک بٹن سے ہٹائیں۔', pg_saved:'{n} صفحات', pg_split_note:'{n} ایک صفحے والی PDF، ایک .zip میں',
  lk_title:'PDF پر پاس ورڈ لگائیں', lk_pw:'پاس ورڈ', lk_pw2:'دوبارہ لکھیں', lk_show:'پاس ورڈ دکھائیں', lk_btn:'PDF لاک کریں',
  lk_note:'PDF کھولنے کے لیے یہ پاس ورڈ چاہیے ہوگا۔ اسے سنبھال کر رکھیں، یہ واپس نہیں مل سکتا۔', lk_short:'کم از کم 4 حروف استعمال کریں۔', lk_match:'دونوں پاس ورڈ مختلف ہیں۔',
  lk_done:'پاس ورڈ سے لاک · AES-256', ul_title:'PDF کا پاس ورڈ ہٹائیں', ul_intro:'یہ PDF لاک ہے۔ اس کا پاس ورڈ لکھیں تاکہ ان لاک کاپی بن سکے۔',
  ul_btn:'PDF ان لاک کریں', ul_wrong:'پاس ورڈ درست نہیں۔ دوبارہ کوشش کریں۔', ul_done:'ان لاک کاپی شامل ہو گئی اور کمپریس ہو رہی ہے۔'
}};
const tx = (k, v) => { let s = (ST[PP.lang()] || ST.en)[k] || ST.en[k] || k; if (v) for (const n in v) s = s.replace('{' + n + '}', v[n]); return s; };

/* ---------------- modal shell ---------------- */
function modal(title, cls) {
  const m = document.createElement('div');
  m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', title);
  m.innerHTML = `<div class="modal-card ${cls || ''}"><div class="modal-head"><h2>${esc(title)}</h2><button class="btn sm" type="button" data-x>${esc(tx('close'))}</button></div><div class="modal-body"></div><div class="modal-foot"></div></div>`;
  document.body.appendChild(m); document.body.classList.add('modal-open');
  const api = { m, body: $('.modal-body', m), foot: $('.modal-foot', m), onClose: null, closed: false };
  const key = e => { if (e.key === 'Escape') api.close(); };
  api.close = () => { if (api.closed) return; api.closed = true; m.remove(); if (!$('.modal')) document.body.classList.remove('modal-open'); document.removeEventListener('keydown', key); if (api.onClose) api.onClose(); };
  document.addEventListener('keydown', key);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) api.close(); });
  setTimeout(() => { const f = $('[data-autofocus]', m) || $('[data-x]', m); if (f) f.focus(); }, 30);
  return api;
}
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- passport sizes ---------------- */
const PASSPORT = {
  p35: { label: '35×45 mm', sub: 'Passport, ID and most forms', w: 413, h: 531, mm: [35, 45] },
  p2in: { label: '2×2 inch', sub: 'US visa and passport', w: 600, h: 600, mm: [50.8, 50.8] },
  p3545hi: { label: '35×45 mm HD', sub: '600 DPI for photo labs', w: 827, h: 1063, mm: [35, 45] },
  custom: { label: 'Custom', sub: 'Your own pixel size', w: 600, h: 800, mm: null }
};
function fitCrop(aspect, rw, rh, scale) {
  if (!aspect) return { x: 0, y: 0, w: 1, h: 1 };
  const an = aspect * rh / rw; let w, h;
  if (an <= 1) { h = 1; w = an; } else { w = 1; h = 1 / an; }
  if (scale) { w *= scale; h *= scale; }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}
function passportEdit(e, key, rw, rh, px) {
  const P = PASSPORT[key] || PASSPORT.p35;
  const w = key === 'custom' && px ? px.w : P.w, h = key === 'custom' && px ? px.h : P.h;
  const rot = e.rot || 0, swap = rot % 180 !== 0, RW = swap ? rh : rw, RH = swap ? rw : rh;
  const c = fitCrop(w / h, RW, RH, .92); c.y = (1 - c.h) * .35;
  const mm = P.mm || [w / 300 * 25.4, h / 300 * 25.4];
  return Object.assign(e, { passport: key, crop: c, size: { w, h }, mm, passportLabel: key === 'custom' ? `${w}×${h} px` : P.label });
}

/* ---------------- white background (on-device, loaded on first use) ---------------- */
let segP = null;
function getSeg() {
  if (!segP) segP = (async () => {
    await PP.loadScript(ROOT + 'assets/vendor/selfie/selfie_segmentation.js');
    const seg = new window.SelfieSegmentation({ locateFile: f => ROOT + 'assets/vendor/selfie/' + f });
    seg.setOptions({ modelSelection: 0, selfieMode: false });
    await seg.initialize();
    return seg;
  })().catch(e => { segP = null; throw e; });
  return segP;
}
async function whiteBackground(bitmap) {
  const seg = await getSeg();
  const w = PP.W(bitmap), h = PP.H(bitmap), k = Math.min(1, 1024 / Math.max(w, h));
  const input = PP.draw(bitmap, Math.round(w * k), Math.round(h * k), true);
  const mask = document.createElement('canvas'); mask.width = input.width; mask.height = input.height;
  await new Promise((res, rej) => {
    seg.onResults(r => { mask.getContext('2d').drawImage(r.segmentationMask, 0, 0, mask.width, mask.height); res(); });
    seg.send({ image: input }).catch(rej);
  });
  const out = document.createElement('canvas'); out.width = w; out.height = h; const x = out.getContext('2d');
  x.imageSmoothingQuality = 'high'; x.filter = `blur(${Math.max(1, Math.round(Math.max(w, h) / 900))}px)`;
  x.drawImage(mask, 0, 0, w, h); x.filter = 'none';
  x.globalCompositeOperation = 'source-in'; x.drawImage(bitmap, 0, 0, w, h);
  x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
  input.width = input.height = 0;
  return await PP.encode(out, 'image/jpeg', .95);
}

/* =====================================================================
   Photo editor
   ===================================================================== */
let ed = null;
async function openEditor(it, opts) {
  opts = opts || {};
  const mdl = modal(tx(opts.passport || (it.edit && it.edit.passport) ? 'pp_title' : 'edit_title'), 'wide');
  mdl.body.innerHTML = `<p class="hint">${esc(tx('loading'))}</p>`;
  let original;
  try { const tmp = { file: it.file, heicJpeg: it.heicJpeg }; const ob = await PP.sourceOf(tmp); if (tmp.heicJpeg) it.heicJpeg = tmp.heicJpeg; original = await PP.decode(ob); }
  catch (e) { mdl.body.innerHTML = `<p class="hint">${esc(e.message || String(e))}</p>`; return; }
  const e0 = JSON.parse(JSON.stringify(Object.assign({}, it.edit || {}, { base: undefined })));
  if (it.edit && it.edit.base) e0.base = it.edit.base;
  ed = { it, mdl, original, src: original, prev: null, e: e0, aspect: e0.crop ? (e0.aspect || null) : null, view: 'edit', token: 0, resultUrl: null, beforeUrl: null };
  if (e0.base) ed.src = await PP.decode(e0.base);
  const passport = !!(opts.passport || e0.passport);
  if (passport && !e0.passport) passportEdit(ed.e, 'p35', PP.W(ed.src), PP.H(ed.src));
  if (passport) ed.aspect = ed.e.size.w / ed.e.size.h;
  makePreview();

  const kbNow = ed.e.kb != null ? ed.e.kb : 0;
  mdl.body.innerHTML = `
  <div class="ed">
    <div class="ed-stage">
      <div class="seg ed-views"><button type="button" data-view="edit" aria-pressed="true">${esc(tx('v_edit'))}</button><button type="button" data-view="result" aria-pressed="false">${esc(tx('v_result'))}</button></div>
      <div class="ed-canvas-box"><div class="ed-wrap"><canvas class="ed-canvas"></canvas><div class="crop" hidden><i class="h nw"></i><i class="h ne"></i><i class="h sw"></i><i class="h se"></i></div></div></div>
      <div class="cmp ed-cmp" hidden><img class="ed-before" alt="${esc(tx('before'))}"><img class="ed-after over" alt="${esc(tx('after'))}"><span class="line"></span><span class="tagl">${esc(tx('before'))}</span><span class="tagr">${esc(tx('after'))}</span></div>
      <input type="range" class="ed-cmp-range" min="0" max="100" value="50" aria-label="${esc(tx('v_result'))}" hidden>
      <div class="ed-result"><span class="label">${esc(tx('result'))}</span> <b class="ed-rv">…</b></div>
    </div>
    <div class="ed-side">
      ${passport ? `
      <section class="ed-sec">
        <h3>${esc(tx('pp_size'))}</h3>
        <div class="quick ed-pp">${Object.entries(PASSPORT).map(([k, P]) => `<button type="button" data-pp="${k}" aria-pressed="${ed.e.passport === k}"><span>${esc(k === 'custom' ? tx('pp_custom') : P.label)}</span><small>${esc(P.sub)}</small></button>`).join('')}</div>
        <div class="row ed-pp-custom" ${ed.e.passport === 'custom' ? '' : 'hidden'}><label>${esc(tx('pp_w'))} <input type="number" class="ed-pw" min="50" max="4000" value="${ed.e.size.w}"></label><label>${esc(tx('pp_h'))} <input type="number" class="ed-ph" min="50" max="4000" value="${ed.e.size.h}"></label></div>
        <p class="hint">${esc(tx('pp_tip'))}</p>
        <button type="button" class="btn ed-bg" aria-pressed="${!!ed.e.base}">${esc(ed.e.base ? tx('pp_bg_on') : tx('pp_bg'))}</button>
        <p class="hint ed-bg-msg" hidden></p>
        <h3>${esc(tx('pp_kb'))}</h3>
        <div class="chips ed-kb">${[0, 20, 50, 100, 200].map(k => `<button class="chip" type="button" data-kb="${k}" aria-pressed="${kbNow == k}">${k ? k + ' KB' : esc(tx('pp_nolimit'))}</button>`).join('')}</div>
      </section>` : ''}
      <section class="ed-sec">
        <div class="row ed-tools">
          <button type="button" class="btn sm" data-act="rotl" title="${esc(tx('rotate_l'))}">⟲ <span>${esc(tx('rotate_l'))}</span></button>
          <button type="button" class="btn sm" data-act="rotr" title="${esc(tx('rotate_r'))}">⟳ <span>${esc(tx('rotate_r'))}</span></button>
          <button type="button" class="btn sm" data-act="flip" title="${esc(tx('flip'))}">⇋ <span>${esc(tx('flip'))}</span></button>
        </div>
      </section>
      ${passport ? '' : `
      <section class="ed-sec">
        <h3>${esc(tx('crop'))}</h3>
        <div class="chips ed-crop">
          <button class="chip" type="button" data-a="none">${esc(tx('c_none'))}</button><button class="chip" type="button" data-a="free">${esc(tx('c_free'))}</button>
          <button class="chip" type="button" data-a="1">1:1</button><button class="chip" type="button" data-a="0.8">4:5</button><button class="chip" type="button" data-a="0.75">3:4</button><button class="chip" type="button" data-a="1.3333">4:3</button><button class="chip" type="button" data-a="1.7778">16:9</button><button class="chip" type="button" data-a="0.7778">35×45</button>
        </div>
      </section>`}
      <section class="ed-sec ed-wm-sec">
        <h3>${esc(tx('wm'))}</h3>
        <input type="text" class="ed-wm" maxlength="80" placeholder="${esc(tx('wm_ph'))}" value="${esc((ed.e.wm && ed.e.wm.text) || '')}" aria-label="${esc(tx('wm'))}">
        <div class="chips ed-wmpos"><button class="chip" type="button" data-pos="tile">${esc(tx('wm_tile'))}</button><button class="chip" type="button" data-pos="center">${esc(tx('wm_center'))}</button><button class="chip" type="button" data-pos="corner">${esc(tx('wm_corner'))}</button>
          <span class="sep"></span><button class="chip" type="button" data-col="white">${esc(tx('wm_white'))}</button><button class="chip" type="button" data-col="black">${esc(tx('wm_black'))}</button></div>
        <label class="field"><span>${esc(tx('wm_size'))}</span><input type="range" class="ed-wms" min="2" max="16" step="0.5" value="${(ed.e.wm && ed.e.wm.size) || 6}"></label>
        <label class="field"><span>${esc(tx('wm_op'))}</span><input type="range" class="ed-wmo" min="0.1" max="0.9" step="0.05" value="${(ed.e.wm && ed.e.wm.opacity) || .35}"></label>
        ${PP.items.filter(i => i.kind === 'img' && !i.generated).length > 1 ? `<button type="button" class="btn sm ed-wm-all">${esc(tx('wm_all'))}</button>` : ''}
      </section>
      ${passport ? '' : `
      <section class="ed-sec">
        <h3>${esc(tx('q'))} <span class="rangeval ed-qv">${ed.e.q ? Math.round(ed.e.q * 100) : ''}</span></h3>
        <input type="range" class="ed-q" min="10" max="100" value="${ed.e.q ? Math.round(ed.e.q * 100) : Math.round(PP.S().q * 100)}" aria-label="${esc(tx('q'))}">
        <label class="check"><input type="checkbox" class="ed-qpage" ${ed.e.q ? '' : 'checked'}> ${esc(tx('q_page'))}</label>
      </section>`}
    </div>
  </div>`;
  mdl.foot.innerHTML = `<button type="button" class="btn ghost" data-act="reset">${esc(tx('reset'))}</button><span class="grow"></span><button type="button" class="btn" data-x>${esc(tx('cancel'))}</button><button type="button" class="btn primary" data-act="save" data-autofocus>${esc(tx('save'))}</button>`;

  const B = mdl.body, root = mdl.m;
  ed.canvas = $('.ed-canvas', B); ed.wrap = $('.ed-wrap', B); ed.cropEl = $('.crop', B);
  syncChips(); drawStage(); liveResult();

  /* views */
  $$('[data-view]', B).forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  $('.ed-cmp-range', B).addEventListener('input', ev => $('.ed-cmp', B).style.setProperty('--x', ev.target.value + '%'));
  /* toolbar */
  root.addEventListener('click', ev => {
    const a = ev.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act, e = ed.e;
    if (act === 'rotl' || act === 'rotr') { e.rot = (((e.rot || 0) + (act === 'rotr' ? 90 : -90)) % 360 + 360) % 360; refitCrop(); }
    else if (act === 'flip') { e.flip = !e.flip; }
    else if (act === 'reset') { const keepPass = e.passport; ed.e = {}; ed.src = ed.original; if (keepPass) { passportEdit(ed.e, keepPass, PP.W(ed.src), PP.H(ed.src)); ed.aspect = ed.e.size.w / ed.e.size.h; } else ed.aspect = null; makePreview(); syncChips(); resetInputs(); }
    else if (act === 'save') { saveEditor(); return; }
    else return;
    drawStage(); liveResult();
  });
  /* crop chips */
  $$('.ed-crop .chip', B).forEach(c => c.addEventListener('click', () => {
    const a = c.dataset.a, d = rotDims();
    if (a === 'none') { delete ed.e.crop; ed.aspect = null; }
    else if (a === 'free') { ed.aspect = null; ed.e.crop = ed.e.crop || { x: .05, y: .05, w: .9, h: .9 }; }
    else { ed.aspect = +a; ed.e.crop = fitCrop(ed.aspect, d.w, d.h, .9); }
    ed.e.aspect = ed.aspect; syncChips(); drawStage(); liveResult();
  }));
  /* watermark */
  const wm = () => (ed.e.wm = ed.e.wm || { text: '', pos: 'tile', color: 'white', size: 6, opacity: .35 });
  $('.ed-wm', B).addEventListener('input', ev => { wm().text = ev.target.value; drawStage(); liveResult(); });
  $$('.ed-wmpos [data-pos]', B).forEach(c => c.addEventListener('click', () => { wm().pos = c.dataset.pos; syncChips(); drawStage(); liveResult(); }));
  $$('.ed-wmpos [data-col]', B).forEach(c => c.addEventListener('click', () => { wm().color = c.dataset.col; syncChips(); drawStage(); liveResult(); }));
  $('.ed-wms', B).addEventListener('input', ev => { wm().size = +ev.target.value; drawStage(); liveResult(); });
  $('.ed-wmo', B).addEventListener('input', ev => { wm().opacity = +ev.target.value; drawStage(); liveResult(); });
  const all = $('.ed-wm-all', B);
  if (all) all.addEventListener('click', () => {
    const w = ed.e.wm; if (!w || !w.text.trim()) { $('.ed-wm', B).focus(); return; }
    let n = 0; for (const i of PP.items) { if (i.kind !== 'img' || i.generated || i === it) continue; i.edit = Object.assign(i.edit || {}, { wm: Object.assign({}, w) }); PP.reprocess(i); n++; }
    PP.toast(tx('wm_all_done', { n: n + 1 })); saveEditor();
  });
  /* quality */
  const q = $('.ed-q', B), qp = $('.ed-qpage', B);
  if (q) {
    q.addEventListener('input', () => { qp.checked = false; ed.e.q = +q.value / 100; $('.ed-qv', B).textContent = q.value; liveResult(); });
    qp.addEventListener('change', () => { if (qp.checked) { delete ed.e.q; $('.ed-qv', B).textContent = ''; q.value = Math.round(PP.S().q * 100); } else { ed.e.q = +q.value / 100; $('.ed-qv', B).textContent = q.value; } liveResult(); });
  }
  /* passport */
  $$('[data-pp]', B).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.pp; passportEdit(ed.e, k, PP.W(ed.src), PP.H(ed.src), k === 'custom' ? { w: +$('.ed-pw', B).value || 600, h: +$('.ed-ph', B).value || 800 } : null);
    ed.aspect = ed.e.size.w / ed.e.size.h; $('.ed-pp-custom', B).hidden = k !== 'custom';
    $$('[data-pp]', B).forEach(x => x.setAttribute('aria-pressed', x === b)); drawStage(); liveResult();
  }));
  $$('.ed-pw, .ed-ph', B).forEach(inp => inp.addEventListener('input', debounce(() => {
    const w = clamp(+$('.ed-pw', B).value || 600, 50, 4000), h = clamp(+$('.ed-ph', B).value || 800, 50, 4000);
    passportEdit(ed.e, 'custom', PP.W(ed.src), PP.H(ed.src), { w, h }); ed.aspect = w / h; drawStage(); liveResult();
  }, 300)));
  $$('.ed-kb .chip', B).forEach(c => c.addEventListener('click', () => {
    const k = +c.dataset.kb; if (k) ed.e.kb = k; else delete ed.e.kb;
    $$('.ed-kb .chip', B).forEach(x => x.setAttribute('aria-pressed', x === c)); liveResult();
  }));
  const bg = $('.ed-bg', B);
  if (bg) bg.addEventListener('click', async () => {
    const msg = $('.ed-bg-msg', B);
    if (ed.e.base) { delete ed.e.base; ed.src = ed.original; bg.setAttribute('aria-pressed', 'false'); bg.textContent = tx('pp_bg'); makePreview(); drawStage(); liveResult(); return; }
    bg.disabled = true; msg.hidden = false; msg.textContent = tx('pp_bg_load');
    try {
      const blob = await whiteBackground(ed.original);
      if (mdl.closed) return;
      ed.e.base = blob; ed.src = await PP.decode(blob); makePreview(); drawStage(); liveResult();
      bg.setAttribute('aria-pressed', 'true'); bg.textContent = tx('pp_bg_on'); msg.hidden = true;
    } catch (err) { console.error(err); msg.textContent = tx('pp_bg_fail'); }
    bg.disabled = false;
  });
  /* crop dragging */
  initCropDrag();
  window.addEventListener('resize', positionCrop);
  mdl.onClose = () => {
    window.removeEventListener('resize', positionCrop);
    if (ed && ed.resultUrl) URL.revokeObjectURL(ed.resultUrl);
    if (ed && ed.it.hold) { ed.it.hold = false; if (!ed.saved) { if (!ed.it.edit || !ed.it.edit.passport) ed.it.edit = ed.e; PP.reprocess(ed.it); } }
    ed = null;
  };
}

function rotDims() { const r = ed.e.rot || 0, w = PP.W(ed.prev), h = PP.H(ed.prev); return r % 180 ? { w: h, h: w } : { w, h }; }
function makePreview() {
  const w = PP.W(ed.src), h = PP.H(ed.src), k = Math.min(1, 1400 / Math.max(w, h));
  ed.prev = PP.draw(ed.src, Math.round(w * k), Math.round(h * k), false);
}
function refitCrop() { if (!ed.e.crop) return; const d = rotDims(); ed.e.crop = fitCrop(ed.aspect, d.w, d.h, ed.aspect ? (ed.e.passport ? .92 : .9) : 1); if (ed.e.passport) ed.e.crop.y = (1 - ed.e.crop.h) * .35; }
function drawStage() {
  const e = ed.e, c = PP.applyEdit(ed.prev, { rot: e.rot, flip: e.flip });
  const cv = ed.canvas; cv.width = c.width; cv.height = c.height; const x = cv.getContext('2d'); x.drawImage(c, 0, 0); c.width = c.height = 0;
  const cr = e.crop || { x: 0, y: 0, w: 1, h: 1 };
  if (e.wm && e.wm.text) PP.drawWatermark(x, cr.x * cv.width, cr.y * cv.height, cr.w * cv.width, cr.h * cv.height, e.wm);
  positionCrop();
}
function positionCrop() {
  if (!ed) return; const cr = ed.e.crop, el = ed.cropEl;
  el.hidden = !cr || ed.view !== 'edit'; if (!cr) return;
  Object.assign(el.style, { left: cr.x * 100 + '%', top: cr.y * 100 + '%', width: cr.w * 100 + '%', height: cr.h * 100 + '%' });
}
function syncChips() {
  const B = ed.mdl.body, e = ed.e, wm = e.wm || {};
  const a = !e.crop ? 'none' : (ed.aspect ? null : 'free');
  $$('.ed-crop .chip', B).forEach(c => c.setAttribute('aria-pressed', a ? c.dataset.a === a : Math.abs(+c.dataset.a - ed.aspect) < .01));
  $$('.ed-wmpos [data-pos]', B).forEach(c => c.setAttribute('aria-pressed', (wm.pos || 'tile') === c.dataset.pos));
  $$('.ed-wmpos [data-col]', B).forEach(c => c.setAttribute('aria-pressed', (wm.color || 'white') === c.dataset.col));
}
function resetInputs() {
  const B = ed.mdl.body; $('.ed-wm', B).value = ''; $('.ed-wms', B).value = 6; $('.ed-wmo', B).value = .35;
  const q = $('.ed-q', B); if (q) { $('.ed-qpage', B).checked = true; q.value = Math.round(PP.S().q * 100); $('.ed-qv', B).textContent = ''; }
  const bg = $('.ed-bg', B); if (bg) { bg.setAttribute('aria-pressed', 'false'); bg.textContent = tx('pp_bg'); }
}
function setView(v) {
  ed.view = v; const B = ed.mdl.body;
  $$('[data-view]', B).forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
  $('.ed-canvas-box', B).hidden = v !== 'edit'; $('.ed-cmp', B).hidden = v !== 'result'; $('.ed-cmp-range', B).hidden = v !== 'result';
  if (v === 'result') showCompare(); positionCrop();
}
function showCompare() {
  const B = ed.mdl.body, full = PP.applyEdit(ed.prev, ed.e);
  $('.ed-before', B).src = full.toDataURL('image/jpeg', .92); full.width = full.height = 0;
  if (ed.resultUrl) $('.ed-after', B).src = ed.resultUrl;
}
const liveResult = debounce(async () => {
  if (!ed) return; const my = ++ed.token, B = ed.mdl.body, rv = $('.ed-rv', B);
  rv.innerHTML = `<span class="spin"></span> ${esc(tx('working'))}`;
  try {
    const fake = { file: ed.it.file, heicJpeg: ed.it.heicJpeg, _src: ed.src, edit: Object.assign({}, ed.e, { base: undefined }) };
    const r = await PP.processImage(fake, PP.S());
    if (!ed || my !== ed.token) return;
    const pct = Math.round((1 - r.blob.size / ed.it.file.size) * 100);
    rv.textContent = tx('result_v', { dim: `${r.w}×${r.h}`, size: fmt(r.blob.size), pct: (pct >= 0 ? '−' : '+') + Math.abs(pct) + '%' });
    if (ed.resultUrl) URL.revokeObjectURL(ed.resultUrl);
    ed.resultUrl = URL.createObjectURL(r.blob);
    if (ed.view === 'result') showCompare();
  } catch (e) { if (ed && my === ed.token) rv.textContent = e.message || String(e); }
}, 300);

function saveEditor() {
  const it = ed.it, e = ed.e;
  if (e.crop && e.crop.x <= .0005 && e.crop.y <= .0005 && e.crop.w >= .999 && e.crop.h >= .999 && !e.passport) delete e.crop;
  if (e.wm && !e.wm.text.trim()) delete e.wm;
  it.edit = e; ed.saved = true;
  const wasHold = it.hold; it.hold = false;
  ed.mdl.close();
  PP.reprocess(it);
  if (e.passport && e.mm) { const n = sheetLayout(e.mm, '4x6').n; setTimeout(() => PP.toast(tx('sheet_hint', { n })), 900); }
  void wasHold;
}

function initCropDrag() {
  const box = ed.cropEl, wrap = ed.wrap;
  box.addEventListener('pointerdown', ev => {
    if (!ed) return; ev.preventDefault();
    const h = ev.target.closest('.h'), mode = h ? [...h.classList].find(c => c.length === 2) : 'move';
    const r = wrap.getBoundingClientRect(), c0 = Object.assign({}, ed.e.crop), d = rotDims(), an = ed.aspect ? ed.aspect * d.h / d.w : null;
    const sx = ev.clientX, sy = ev.clientY; try { box.setPointerCapture(ev.pointerId); } catch (_) {}
    const move = e2 => {
      const dx = (e2.clientX - sx) / r.width, dy = (e2.clientY - sy) / r.height; let c = Object.assign({}, c0);
      if (mode === 'move') { c.x = clamp(c0.x + dx, 0, 1 - c0.w); c.y = clamp(c0.y + dy, 0, 1 - c0.h); }
      else {
        const ax = mode[1] === 'w' ? c0.x + c0.w : c0.x, ay = mode[0] === 'n' ? c0.y + c0.h : c0.y;
        const px = clamp((e2.clientX - r.left) / r.width, 0, 1), py = clamp((e2.clientY - r.top) / r.height, 0, 1);
        const availW = mode[1] === 'w' ? ax : 1 - ax, availH = mode[0] === 'n' ? ay : 1 - ay;
        let w = clamp(Math.abs(px - ax), .04, availW), hh = clamp(Math.abs(py - ay), .04, availH);
        if (an) { hh = w / an; if (hh > availH) { hh = availH; w = hh * an; } if (w > availW) { w = availW; hh = w / an; } }
        c = { x: mode[1] === 'w' ? ax - w : ax, y: mode[0] === 'n' ? ay - hh : ay, w, h: hh };
      }
      ed.e.crop = c; drawStage();
    };
    const up = () => { box.removeEventListener('pointermove', move); box.removeEventListener('pointerup', up); box.removeEventListener('pointercancel', up); liveResult(); };
    box.addEventListener('pointermove', move); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  });
}

/* =====================================================================
   Print sheet for passport photos
   ===================================================================== */
function sheetLayout(mm, paper) {
  const dpi = 300, pw = Math.round(mm[0] / 25.4 * dpi), ph = Math.round(mm[1] / 25.4 * dpi);
  const [SW, SH] = paper === 'a4' ? [2480, 3508] : [1800, 1200], gap = 20, m = 24;
  const cols = Math.max(1, Math.floor((SW - 2 * m + gap) / (pw + gap))), rows = Math.max(1, Math.floor((SH - 2 * m + gap) / (ph + gap)));
  return { SW, SH, pw, ph, gap, cols, rows, n: cols * rows };
}
function printSheet(it) {
  if (!it.out || !it.edit || !it.edit.mm) return;
  const mdl = modal(tx('sheet_title'));
  const L4 = sheetLayout(it.edit.mm, '4x6'), LA = sheetLayout(it.edit.mm, 'a4');
  mdl.body.innerHTML = `<p>${esc(tx('sheet_intro'))}</p><div class="quick sheet-pick">
    <button type="button" data-paper="4x6" aria-pressed="true"><span>${esc(tx('sheet_4x6'))}</span><small>${L4.n} ×</small></button>
    <button type="button" data-paper="a4" aria-pressed="false"><span>${esc(tx('sheet_a4'))}</span><small>${LA.n} ×</small></button></div>`;
  mdl.foot.innerHTML = `<span class="grow"></span><button type="button" class="btn" data-x>${esc(tx('cancel'))}</button><button type="button" class="btn primary" data-make data-autofocus>${esc(tx('sheet_make'))}</button>`;
  let paper = '4x6';
  $$('[data-paper]', mdl.body).forEach(b => b.addEventListener('click', () => { paper = b.dataset.paper; $$('[data-paper]', mdl.body).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('[data-make]', mdl.foot).addEventListener('click', async () => {
    const L = sheetLayout(it.edit.mm, paper), img = await PP.decode(it.out.blob);
    const c = document.createElement('canvas'); c.width = L.SW; c.height = L.SH; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, L.SW, L.SH); x.imageSmoothingQuality = 'high';
    const gw = L.cols * L.pw + (L.cols - 1) * L.gap, gh = L.rows * L.ph + (L.rows - 1) * L.gap, ox = (L.SW - gw) / 2, oy = (L.SH - gh) / 2;
    x.strokeStyle = '#c8c8c8'; x.lineWidth = 2; x.setLineDash([10, 8]);
    for (let r = 0; r < L.rows; r++) for (let k = 0; k < L.cols; k++) {
      const px = ox + k * (L.pw + L.gap), py = oy + r * (L.ph + L.gap);
      x.drawImage(img, px, py, L.pw, L.ph); x.strokeRect(px - L.gap / 2, py - L.gap / 2, L.pw + L.gap, L.ph + L.gap);
    }
    if (img.close) img.close();
    const blob = await PP.encode(c, 'image/jpeg', .95);
    const paperName = paper === 'a4' ? 'A4' : '4×6 inch (10×15 cm)';
    PP.pushGenerated(blob, `${PP.base(it.file.name)}-print-${paper}.jpg`, tx('sheet_note', { n: L.n, paper: paperName }), it.out.blob.size, 'img');
    mdl.close();
  });
}

/* =====================================================================
   PDF page organizer
   ===================================================================== */
async function openPages(it) {
  const mdl = modal(tx('pg_title') + ' · ' + it.file.name, 'wide');
  mdl.body.innerHTML = `<p class="hint">${esc(tx('pg_hint'))}</p><p class="pg-count hint"></p><div class="pg-grid"></div>`;
  mdl.foot.innerHTML = `<button type="button" class="btn" data-split disabled>${esc(tx('pg_split'))}</button><span class="grow"></span><button type="button" class="btn" data-x>${esc(tx('cancel'))}</button><button type="button" class="btn primary" data-savepdf data-autofocus disabled>${esc(tx('pg_save'))}</button>`;
  const grid = $('.pg-grid', mdl.body), bytes = new Uint8Array(await it.file.arrayBuffer());
  let pdf;
  try { await PP.needPdfJs(); pdf = await pdfjsLib.getDocument({ data: bytes.slice(0), isEvalSupported: false }).promise; }
  catch (e) { mdl.body.innerHTML = `<p>${esc(e && e.name === 'PasswordException' ? tx('pg_pw') : (e.message || String(e)))}</p>`; mdl.foot.innerHTML = ''; return; }
  const N = pdf.numPages, state = Array.from({ length: N }, (_, i) => ({ i, rot: 0, del: false }));
  const count = () => { $('.pg-count', mdl.body).textContent = tx('pg_count', { n: N, k: state.filter(s => s.del).length }); };
  grid.innerHTML = state.map(s => `<div class="pg" data-i="${s.i}">
      <button class="grip" type="button" aria-label="${esc(PP.t('drag'))}"><svg viewBox="0 0 10 16" aria-hidden="true"><circle cx="3" cy="3" r="1.4"/><circle cx="7" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="7" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="7" cy="13" r="1.4"/></svg></button>
      <div class="pg-thumb"><span class="spin"></span></div>
      <div class="pg-bar"><b>${s.i + 1}</b><button type="button" class="btn sm" data-rot title="${esc(tx('pg_rot'))}" aria-label="${esc(tx('pg_rot'))}">↻</button><button type="button" class="btn sm" data-del title="${esc(tx('pg_del'))}" aria-label="${esc(tx('pg_del'))}">✕</button></div></div>`).join('');
  count();
  PP.sortable(grid, '.pg', () => {});
  grid.addEventListener('click', e => {
    const card = e.target.closest('.pg'); if (!card) return; const s = state[+card.dataset.i];
    if (e.target.closest('[data-rot]')) { s.rot = (s.rot + 90) % 360; const c = $('canvas', card); if (c) c.style.transform = `rotate(${s.rot}deg)`; }
    if (e.target.closest('[data-del]')) { s.del = !s.del; card.classList.toggle('off', s.del); const b = $('[data-del]', card); b.textContent = s.del ? '↺' : '✕'; b.title = b.ariaLabel = tx(s.del ? 'pg_keep' : 'pg_del'); count(); }
  });
  (async () => {
    for (let i = 1; i <= N && !mdl.closed; i++) {
      const page = await pdf.getPage(i), v0 = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 150 / Math.max(v0.width, v0.height) });
      const c = document.createElement('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: x, viewport: vp }).promise; page.cleanup();
      const slot = $(`.pg[data-i="${i - 1}"] .pg-thumb`, grid); if (slot) { slot.innerHTML = ''; slot.appendChild(c); }
    }
    pdf.destroy();
  })();
  $$('[data-split],[data-savepdf]', mdl.foot).forEach(b => b.disabled = false);
  const order = () => $$('.pg', grid).map(c => state[+c.dataset.i]).filter(s => !s.del);
  async function build(list) {
    const src = await PDFLib.PDFDocument.load(bytes.slice(0), { ignoreEncryption: true }), out = await PDFLib.PDFDocument.create();
    const pages = await out.copyPages(src, list.map(s => s.i));
    pages.forEach((p, k) => { if (list[k].rot) p.setRotation(PDFLib.degrees((p.getRotation().angle + list[k].rot) % 360)); out.addPage(p); });
    out.setProducer('PocketPress'); return out.save({ useObjectStreams: true });
  }
  $('[data-savepdf]', mdl.foot).addEventListener('click', async ev => {
    const list = order(); if (!list.length) { PP.toast(tx('pg_none')); return; }
    ev.target.disabled = true;
    try { const b = await build(list); PP.pushGenerated(new Blob([b], { type: 'application/pdf' }), PP.base(it.file.name) + '-organized.pdf', tx('pg_saved', { n: list.length }), it.file.size); mdl.close(); }
    catch (e) { console.error(e); PP.toast(e.message || String(e)); ev.target.disabled = false; }
  });
  $('[data-split]', mdl.foot).addEventListener('click', async ev => {
    const list = order(); if (!list.length) { PP.toast(tx('pg_none')); return; }
    ev.target.disabled = true;
    try {
      const z = new JSZip(), pad = String(N).length;
      for (const s of list) z.file(`${PP.base(it.file.name)}-page-${String(s.i + 1).padStart(pad, '0')}.pdf`, await build([s]));
      const blob = await z.generateAsync({ type: 'blob', compression: 'STORE' });
      PP.pushGenerated(blob, PP.base(it.file.name) + '-pages.zip', tx('pg_split_note', { n: list.length }), it.file.size, 'other'); mdl.close();
    } catch (e) { console.error(e); PP.toast(e.message || String(e)); ev.target.disabled = false; }
  });
}

/* =====================================================================
   PDF password lock / unlock
   ===================================================================== */
async function openLock(it) {
  const useOut = it.status === 'done' && it.out && !it.kept;
  const srcBlob = it.generated ? it.out.blob : (useOut ? it.out.blob : it.file);
  const bytes = new Uint8Array(await srcBlob.arrayBuffer());
  let encrypted = false;
  try { encrypted = (await PDFLib.PDFDocument.load(bytes.slice(0), { ignoreEncryption: true })).isEncrypted; } catch (e) { PP.toast(e.message || String(e)); return; }
  const name = PP.base(it.out && it.generated ? it.out.name : it.file.name);
  const mdl = modal(tx(encrypted ? 'ul_title' : 'lk_title'));
  if (encrypted) {
    mdl.body.innerHTML = `<form class="fields lockform" autocomplete="off"><p>${esc(tx('ul_intro'))}</p>
      <label class="field"><span>${esc(tx('lk_pw'))}</span><input type="password" class="pw1" autocomplete="off" data-autofocus></label>
      <p class="hint err" hidden></p></form>`;
    mdl.foot.innerHTML = `<span class="grow"></span><button type="button" class="btn" data-x>${esc(tx('cancel'))}</button><button type="button" class="btn primary" data-go>${esc(tx('ul_btn'))}</button>`;
    const go = async () => {
      const pw = $('.pw1', mdl.body).value, err = $('.err', mdl.body);
      try {
        const doc = await PDFLib.PDFDocument.load(bytes.slice(0), { password: pw });
        const out = await doc.save({ useObjectStreams: true });
        mdl.close(); PP.addFiles([new File([out], name + '-unlocked.pdf', { type: 'application/pdf' })]); PP.toast(tx('ul_done'));
      } catch (e) { err.hidden = false; err.textContent = tx('ul_wrong'); }
    };
    $('[data-go]', mdl.foot).addEventListener('click', go);
    $('form', mdl.body).addEventListener('submit', e => { e.preventDefault(); go(); });
    return;
  }
  mdl.body.innerHTML = `<form class="fields lockform" autocomplete="off">
    <label class="field"><span>${esc(tx('lk_pw'))}</span><input type="password" class="pw1" autocomplete="new-password" data-autofocus></label>
    <label class="field"><span>${esc(tx('lk_pw2'))}</span><input type="password" class="pw2" autocomplete="new-password"></label>
    <label class="check"><input type="checkbox" class="pwshow"> ${esc(tx('lk_show'))}</label>
    <p class="hint">${esc(tx('lk_note'))}</p><p class="hint err" hidden></p></form>`;
  mdl.foot.innerHTML = `<span class="grow"></span><button type="button" class="btn" data-x>${esc(tx('cancel'))}</button><button type="button" class="btn primary" data-go>${esc(tx('lk_btn'))}</button>`;
  $('.pwshow', mdl.body).addEventListener('change', e => $$('.pw1,.pw2', mdl.body).forEach(i => i.type = e.target.checked ? 'text' : 'password'));
  const go = async () => {
    const a = $('.pw1', mdl.body).value, b = $('.pw2', mdl.body).value, err = $('.err', mdl.body);
    if (a.length < 4) { err.hidden = false; err.textContent = tx('lk_short'); return; }
    if (a !== b) { err.hidden = false; err.textContent = tx('lk_match'); return; }
    try {
      const doc = await PDFLib.PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });
      doc.encrypt({ userPassword: a, ownerPassword: a, permissions: { printing: 'highResolution', modifying: true, copying: true, annotating: true, fillingForms: true, contentAccessibility: true, documentAssembly: true } });
      const out = await doc.save({ useObjectStreams: false });
      mdl.close(); PP.pushGenerated(new Blob([out], { type: 'application/pdf' }), name + '-locked.pdf', tx('lk_done'), srcBlob.size);
    } catch (e) { console.error(e); err.hidden = false; err.textContent = e.message || String(e); }
  };
  $('[data-go]', mdl.foot).addEventListener('click', go);
  $('form', mdl.body).addEventListener('submit', e => { e.preventDefault(); go(); });
}

/* =====================================================================
   Page-specific behaviour (passport page, crop page, organize page …)
   ===================================================================== */
async function autoPassport(it) {
  try { const b = await PP.decode(await PP.sourceOf(it)); passportEdit(it.edit = it.edit || {}, 'p35', PP.W(b), PP.H(b)); if (b.close) b.close(); } catch (e) {}
  it.hold = false; PP.reprocess(it);
}
PP.onAdded = added => {
  const mode = PP.PAGE.autoOpen; if (!mode) return;
  const want = mode === 'pages' || mode === 'lock' ? 'pdf' : 'img';
  const list = added.filter(i => i.kind === want && !i.example); if (!list.length) return;
  if (mode === 'passport') {
    for (const i of list) { i.hold = true; const k = PP.pending.indexOf(i); if (k > -1) PP.pending.splice(k, 1); }
    setTimeout(() => { list.slice(1).forEach(autoPassport); if (!$('.modal')) openEditor(list[0], { passport: true }); else autoPassport(list[0]); }, 0);
    return;
  }
  if ($('.modal')) return;
  setTimeout(() => {
    if (mode === 'edit' || mode === 'edit-wm') { openEditor(list[0]).then(() => { if (mode === 'edit-wm' && ed) { const w = $('.ed-wm', ed.mdl.body); if (w) { w.focus(); w.scrollIntoView({ block: 'center' }); } } }); }
    else if (mode === 'pages') openPages(list[0]);
    else if (mode === 'lock') openLock(list[0]);
  }, 250);
};
Object.assign(PP, { openEditor, openPages, openLock, printSheet });
})();
