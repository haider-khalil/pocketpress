/* PocketPress — all processing happens in the visitor's browser. Nothing is uploaded. */
(function () {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const PAGE = window.PP_PAGE || {};
const ROOT = document.documentElement.dataset.root || './';

/* ================= i18n ================= */
const T = {
en:{
  tagline:'Shrink, resize and convert images, PDFs and Office files. Free, fast and private.',
  privacy:'Your files never leave your device',
  goal:'Goal', p_small:'Smallest', p_small_s:'Max shrink', p_bal:'Balanced', p_bal_s:'Recommended', p_q:'Best quality', p_q_s:'Light touch', p_c:'Custom', p_c_s:'Your settings',
  tab_img:'Images', tab_pdf:'PDF', tab_office:'Office',
  quick:'Quick sizes for forms', q_photo:'Profile photo', q_photo_s:'600 px · under 100 KB', q_sign:'Signature', q_sign_s:'400×150 · under 50 KB', q_id:'ID / CNIC scan', q_id_s:'1600 px · under 200 KB', q_chat:'WhatsApp / email', q_chat_s:'1600 px · good quality',
  q_note:'Always check the exact limit your form asks for.',
  fmt:'Output format', fmt_keep:'Same as original', fmt_jpg:'JPG (smallest for photos)', fmt_webp:'WebP (modern, very small)', fmt_png:'PNG (lossless, transparency)',
  quality:'Quality', q_hint:'Lower is smaller. 70–80 looks the same to most eyes.',
  resize:'Resize', rs_none:'Keep original size', rs_long:'Limit longest side', rs_pct:'Scale by percentage', rs_exact:'Exact width × height', keep_prop:'Keep proportions (fit inside the box)',
  tgt:'Fit under a file size', tgt_s:'Type any limit, for example 30 or 150 KB.',
  meta_hint:'Photo location data and other hidden metadata are removed automatically.',
  method:'Method', strong:'Strong', strong_s:'Best for scans', light:'Light', light_s:'Keeps text',
  strong_hint:'Redraws each page as an image. Big savings on scanned documents, but text can no longer be selected or searched.',
  light_hint:'Cleans up and repacks the file without touching its content. Text stays selectable; savings are usually small.',
  dpi:'Page sharpness', pdfq:'Image quality', gray:'Black & white (grayscale)', gray_s:'Great for scanned forms, CNIC copies and receipts.',
  off_intro:'Word (.docx), Excel (.xlsx) and PowerPoint (.pptx) files get smaller by recompressing the pictures inside them. Text and layout stay untouched.',
  off_q:'Picture quality', off_max:'Shrink pictures larger than', px_long:'px on the longest side', other_hint:'Other file types are packed into a compressed .zip.',
  apply:'Apply settings to all files',
  drop:'Drop files here or tap to choose', drop_s:'Add as many as you like. You can also paste a screenshot.',
  files:'Files', before:'Before', after:'After', saved:'Saved',
  save_all:'Download all (.zip)', to_pdf:'Images → one PDF', merge:'Merge PDFs', clear:'Clear list',
  pg_a4:'A4 pages', pg_letter:'Letter pages', pg_fit:'Page = image size',
  empty:'No files yet. Add some above to get started.',
  download:'Download', share:'Share', compare:'Compare', remove:'Remove',
  waiting:'Waiting', working:'Working', failed:'Failed', kept:'Original kept', same:'Same size', example:'Example',
  kept_note:'already well compressed, original kept', png_tip:'Tip: choose JPG or WebP as the output format to make it much smaller.',
  t_add:'Add some files first.', t_pdf_done:'PDF created. It is at the bottom of the list.', t_saved:'Downloaded {n}',
  t_merge_need:'Add at least two PDFs to merge.', t_pasted:'Pasted {n} file(s)', t_err:'Something went wrong with this file.',
  t_heic:'Converting iPhone photo', t_pdf_build:'Building PDF', t_merge_build:'Merging',
  cmp_orig:'Original', cmp_new:'Compressed', close:'Close', cmp_hint:'Drag the slider to compare',
  page_n:'Page {i} of {n}', pic_n:'Picture {i} of {n}', repack:'Repacking',
  limit:'Size limit for photos', no_limit:'No limit', limit_hint:'Pick one when a form says "maximum 100 KB".',
  more:'More settings', custom_note:'Using your own choices from More settings.', auto_hint:'Changes apply to your files straight away.',
  pg_label:'Page size for Images → PDF', install:'Install app', t_installed:'PocketPress is installed. Open it from your home screen or Start menu.',
  t_shared:'Opened {n} shared file(s)', t_upd:'Updated with your new settings',
  edit:'Edit', pages:'Pages', lock:'Lock', sheet:'Print sheet', drag:'Drag to reorder',
  th_auto:'Theme: automatic', th_light:'Theme: light', th_dark:'Theme: dark',
  life:'You have saved {size} across {n} files with PocketPress', t_party:'Nice! You just saved {size}.',
  pw_err:'This PDF has a password. Tap Lock to remove it first, then compress.',
  lang:'اردو'
},
ur:{
  tagline:'تصاویر، پی ڈی ایف اور آفس فائلوں کا سائز کم کریں، ریسائز اور کنورٹ کریں۔ مفت، تیز اور محفوظ۔',
  privacy:'آپ کی فائلیں آپ کے آلے سے باہر نہیں جاتیں',
  goal:'مقصد', p_small:'سب سے چھوٹی', p_small_s:'زیادہ سے زیادہ کمی', p_bal:'متوازن', p_bal_s:'تجویز کردہ', p_q:'بہترین کوالٹی', p_q_s:'ہلکی کمی', p_c:'اپنی مرضی', p_c_s:'آپ کی سیٹنگز',
  tab_img:'تصاویر', tab_pdf:'پی ڈی ایف', tab_office:'آفس',
  quick:'فارمز کے لیے فوری سائز', q_photo:'پروفائل تصویر', q_photo_s:'\u2066600 px\u2069 · \u2066100 KB\u2069 سے کم', q_sign:'دستخط', q_sign_s:'\u2066400×150\u2069 · \u206650 KB\u2069 سے کم', q_id:'شناختی کارڈ اسکین', q_id_s:'\u20661600 px\u2069 · \u2066200 KB\u2069 سے کم', q_chat:'واٹس ایپ / ای میل', q_chat_s:'\u20661600 px\u2069 · اچھی کوالٹی',
  q_note:'اپنے فارم کی اصل حد ضرور چیک کریں۔',
  fmt:'آؤٹ پٹ فارمیٹ', fmt_keep:'اصل جیسا', fmt_jpg:'JPG (تصاویر کے لیے سب سے چھوٹا)', fmt_webp:'WebP (جدید، بہت چھوٹا)', fmt_png:'PNG (بغیر نقصان، شفاف پس منظر)',
  quality:'کوالٹی', q_hint:'کم نمبر کا مطلب چھوٹی فائل۔ 70 سے 80 پر فرق عموماً نظر نہیں آتا۔',
  resize:'سائز تبدیل کریں', rs_none:'اصل سائز رکھیں', rs_long:'لمبی سائیڈ کی حد', rs_pct:'فیصد کے حساب سے', rs_exact:'مخصوص چوڑائی × اونچائی', keep_prop:'تناسب برقرار رکھیں',
  tgt:'فائل سائز کی حد کے اندر', tgt_s:'کوئی بھی حد لکھیں، مثلاً 30 یا 150 KB۔',
  meta_hint:'تصویر کی لوکیشن اور دیگر چھپی معلومات خود بخود ہٹا دی جاتی ہیں۔',
  method:'طریقہ', strong:'طاقتور', strong_s:'اسکین کے لیے بہترین', light:'ہلکا', light_s:'ٹیکسٹ محفوظ رہتا ہے',
  strong_hint:'ہر صفحے کو تصویر کے طور پر دوبارہ بناتا ہے۔ اسکین شدہ دستاویزات میں بڑی بچت، لیکن ٹیکسٹ سلیکٹ یا سرچ نہیں ہو سکے گا۔',
  light_hint:'مواد کو چھیڑے بغیر فائل کو صاف اور دوبارہ پیک کرتا ہے۔ ٹیکسٹ سلیکٹ ہوتا رہتا ہے، بچت عموماً کم ہوتی ہے۔',
  dpi:'صفحے کی وضاحت', pdfq:'تصویری کوالٹی', gray:'بلیک اینڈ وائٹ', gray_s:'اسکین شدہ فارمز، شناختی کارڈ کی کاپی اور رسیدوں کے لیے بہترین۔',
  off_intro:'ورڈ، ایکسل اور پاورپوائنٹ فائلوں کے اندر موجود تصاویر کو کمپریس کر کے سائز کم کیا جاتا ہے۔ ٹیکسٹ اور ترتیب ویسے ہی رہتے ہیں۔',
  off_q:'تصویری کوالٹی', off_max:'اس سے بڑی تصاویر چھوٹی کریں', px_long:'پکسل، لمبی سائیڈ پر', other_hint:'باقی اقسام کی فائلیں کمپریسڈ .zip میں پیک ہو جاتی ہیں۔',
  apply:'سیٹنگز تمام فائلوں پر لاگو کریں',
  drop:'فائلیں یہاں ڈالیں یا منتخب کرنے کے لیے ٹیپ کریں', drop_s:'جتنی چاہیں فائلیں شامل کریں۔ اسکرین شاٹ پیسٹ بھی کر سکتے ہیں۔',
  files:'فائلیں', before:'پہلے', after:'بعد', saved:'بچت',
  save_all:'سب ڈاؤن لوڈ کریں (.zip)', to_pdf:'تصاویر سے ایک PDF', merge:'PDF جوڑیں', clear:'فہرست صاف کریں',
  pg_a4:'A4 صفحات', pg_letter:'Letter صفحات', pg_fit:'صفحہ = تصویر کا سائز',
  empty:'ابھی کوئی فائل نہیں۔ شروع کرنے کے لیے اوپر فائلیں شامل کریں۔',
  download:'ڈاؤن لوڈ', share:'شیئر', compare:'موازنہ', remove:'ہٹائیں',
  waiting:'انتظار', working:'جاری ہے', failed:'ناکام', kept:'اصل فائل رکھی گئی', same:'اسی سائز', example:'مثال',
  kept_note:'پہلے ہی کمپریسڈ ہے، اصل فائل رکھی گئی', png_tip:'مشورہ: بہت چھوٹی فائل کے لیے آؤٹ پٹ فارمیٹ JPG یا WebP منتخب کریں۔',
  t_add:'پہلے کچھ فائلیں شامل کریں۔', t_pdf_done:'PDF بن گئی۔ یہ فہرست کے آخر میں ہے۔', t_saved:'{n} ڈاؤن لوڈ ہو گئی',
  t_merge_need:'جوڑنے کے لیے کم از کم دو PDF شامل کریں۔', t_pasted:'{n} فائل پیسٹ ہوئی', t_err:'اس فائل میں مسئلہ آیا۔',
  t_heic:'آئی فون تصویر کنورٹ ہو رہی ہے', t_pdf_build:'PDF بن رہی ہے', t_merge_build:'جوڑا جا رہا ہے',
  cmp_orig:'اصل', cmp_new:'کمپریسڈ', close:'بند کریں', cmp_hint:'موازنے کے لیے سلائیڈر کھینچیں',
  page_n:'صفحہ {i} از {n}', pic_n:'تصویر {i} از {n}', repack:'دوبارہ پیک ہو رہی ہے',
  limit:'تصاویر کے لیے سائز کی حد', no_limit:'کوئی حد نہیں', limit_hint:'جب فارم کہے "زیادہ سے زیادہ 100 KB" تو یہاں سے منتخب کریں۔',
  more:'مزید سیٹنگز', custom_note:'مزید سیٹنگز میں آپ کی اپنی پسند استعمال ہو رہی ہے۔', auto_hint:'تبدیلیاں فوراً آپ کی فائلوں پر لاگو ہو جاتی ہیں۔',
  pg_label:'تصاویر سے PDF کے صفحے کا سائز', install:'ایپ انسٹال کریں', t_installed:'PocketPress انسٹال ہو گئی۔ اسے ہوم اسکرین یا اسٹارٹ مینو سے کھولیں۔',
  t_shared:'{n} شیئر کی گئی فائل کھولی گئی', t_upd:'نئی سیٹنگز کے ساتھ اپ ڈیٹ ہو گیا',
  edit:'ایڈٹ', pages:'صفحات', lock:'لاک', sheet:'پرنٹ شیٹ', drag:'ترتیب بدلنے کے لیے کھینچیں',
  th_auto:'تھیم: خودکار', th_light:'تھیم: روشن', th_dark:'تھیم: گہرا',
  life:'آپ PocketPress سے {n} فائلوں میں {size} بچا چکے ہیں', t_party:'زبردست! آپ نے ابھی {size} بچائے۔',
  pw_err:'اس PDF پر پاس ورڈ ہے۔ پہلے لاک بٹن سے پاس ورڈ ہٹائیں، پھر کمپریس کریں۔',
  lang:'English'
}};
let LANG = 'en';
try { LANG = localStorage.getItem('pp-lang') || (navigator.language||'').startsWith('ur') && 'ur' || 'en'; } catch(e){}
if (PAGE.lang) LANG = PAGE.lang;
const t = (k, v) => { let s = (T[LANG] && T[LANG][k]) || T.en[k] || k; if (v) for (const n in v) s = s.replace('{'+n+'}', v[n]); return s; };
function applyLang(){
  document.documentElement.lang = LANG; document.documentElement.dir = LANG==='ur' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  $$('[data-i18n-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
  $$('[data-ur]').forEach(el => { if(!el.dataset.en) el.dataset.en = el.innerHTML; el.innerHTML = LANG==='ur' ? el.dataset.ur : el.dataset.en; });
  if (typeof render === 'function' && $('#queue')) render();
  if ($('#pdfModeHint')) setPdfMode(pdfMode, true);
  setTheme(getTheme()); showStats();
}
$$('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => { LANG = LANG==='ur'?'en':'ur'; try{localStorage.setItem('pp-lang',LANG);}catch(e){} applyLang(); }));

/* ================= service worker (offline) ================= */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register(ROOT + 'sw.js').catch(()=>{}));
}

const fmt = b => { if(b==null) return '—'; if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(b<10240?1:0)+' KB'; if(b<1073741824) return (b/1048576).toFixed(b<104857600?2:1)+' MB'; return (b/1073741824).toFixed(2)+' GB'; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= theme switch ================= */
const THEMES = ['auto','light','dark'];
function getTheme(){ try { return localStorage.getItem('pp-theme') || 'auto'; } catch(e){ return 'auto'; } }
function setTheme(th){
  if(th==='auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th;
  try { th==='auto' ? localStorage.removeItem('pp-theme') : localStorage.setItem('pp-theme', th); } catch(e){}
  $$('[data-theme-toggle]').forEach(b => { b.dataset.mode = th; b.setAttribute('aria-label', t('th_'+th)); b.title = t('th_'+th); });
}
$$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => setTheme(THEMES[(THEMES.indexOf(getTheme())+1)%3])));

/* ================= lifetime savings (kept on this device only) ================= */
function getStats(){ try { return JSON.parse(localStorage.getItem('pp-stats')) || {saved:0, files:0}; } catch(e){ return {saved:0, files:0}; } }
function putStats(st){ try { localStorage.setItem('pp-stats', JSON.stringify(st)); } catch(e){} showStats(); }
function showStats(){ const el=$('#lifetime'); if(!el) return; const st=getStats(); el.hidden = !(st.saved > 0); if(st.saved>0) el.querySelector('span').textContent = t('life', {size:fmt(st.saved), n:st.files}); }

let tt; function toast(msg){ const el=$('#toast'); if(!el) return; el.textContent=msg; el.hidden=false; clearTimeout(tt); tt=setTimeout(()=>el.hidden=true,3600); }

/* ================= install as an app ================= */
const STANDALONE = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installEvt = null;
const showInstall = on => $$('[data-install]').forEach(b => b.hidden = !on);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; showInstall(true); });
window.addEventListener('appinstalled', () => { installEvt = null; showInstall(false); toast(t('t_installed')); });
if (!STANDALONE && IOS) showInstall(true);
if (STANDALONE && $('#installedNote')) $('#installedNote').hidden = false;
$$('[data-install]').forEach(b => b.addEventListener('click', async () => {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(()=>null); if (r && r.outcome === 'accepted') { installEvt = null; showInstall(false); } return; }
  const target = ROOT + 'app/' + (IOS ? '#iphone' : '');
  if (location.pathname.replace(/index\.html$/,'').endsWith('/app/')) { const el = document.getElementById(IOS?'iphone':'') ; if (el) el.scrollIntoView({behavior:'smooth'}); }
  else location.href = target;
}));

if (!$('#queue')) { applyLang(); return; }   /* content-only pages stop here */

/* ================= helpers ================= */
let uid = 0; const items = []; let busy = false; const pending = [];
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('Could not load '+src)); document.head.appendChild(s); }); }

let pdfReady = null;
function needPdfJs(){ if(!pdfReady){ pdfReady = (async()=>{ await loadScript(ROOT+'assets/vendor/pdf.min.js'); pdfjsLib.GlobalWorkerOptions.workerSrc = ROOT+'assets/vendor/pdf.worker.min.js'; })(); } return pdfReady; }

/* ================= settings ================= */
const PRESETS = {
  small:   {imgFormat:'image/jpeg', imgQ:58, rsMode:'long', rsLongV:1600, pdfMode:'strong', pdfDpi:100, pdfQ:50, offQ:55, offMax:1280, tgt:false},
  balanced:{imgFormat:'keep', imgQ:78, rsMode:'long', rsLongV:2560, pdfMode:'strong', pdfDpi:130, pdfQ:68, offQ:72, offMax:1920, tgt:false},
  quality: {imgFormat:'keep', imgQ:90, rsMode:'none', rsLongV:2560, pdfMode:'light', pdfDpi:170, pdfQ:85, offQ:88, offMax:2560, tgt:false}
};
const QUICK = {
  photo:{imgFormat:'image/jpeg', imgQ:85, rsMode:'long', rsLongV:600, tgt:true, tgtV:100},
  sign: {imgFormat:'image/jpeg', imgQ:85, rsMode:'exact', rsW:400, rsH:150, rsFit:true, tgt:true, tgtV:50},
  id:   {imgFormat:'image/jpeg', imgQ:80, rsMode:'long', rsLongV:1600, tgt:true, tgtV:200},
  chat: {imgFormat:'image/jpeg', imgQ:75, rsMode:'long', rsLongV:1600, tgt:false}
};
let pdfMode = 'strong';
function setPdfMode(m, silent){ pdfMode=m; $$('#pdfMode button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.mode===m)); $$('[data-strong]').forEach(el=>el.hidden = m!=='strong'); $('#pdfModeHint').textContent = t(m==='strong'?'strong_hint':'light_hint'); }
function setVals(p){
  if(p.imgFormat) $('#imgFormat').value=p.imgFormat; if(p.imgQ) $('#imgQ').value=p.imgQ; if(p.rsMode) $('#rsMode').value=p.rsMode;
  if(p.rsLongV) $('#rsLongV').value=p.rsLongV; if(p.rsPct) $('#rsPctV').value=p.rsPct; if(p.rsW) $('#rsW').value=p.rsW; if(p.rsH) $('#rsH').value=p.rsH; if(p.rsFit!=null) $('#rsFit').checked=p.rsFit;
  if(p.tgt!=null) $('#tgtOn').checked=p.tgt; if(p.tgtV) $('#tgtV').value=p.tgtV;
  if(p.pdfDpi) $('#pdfDpi').value=p.pdfDpi; if(p.pdfQ) $('#pdfQ').value=p.pdfQ; if(p.offQ) $('#offQ').value=p.offQ; if(p.offMax) $('#offMax').value=p.offMax; if(p.pdfMode) setPdfMode(p.pdfMode); if(p.gray!=null) $('#pdfGray').checked=p.gray;
}
function pressPreset(name){ $$('#presets button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.preset===name)); $('#customNote').hidden = name!=='custom'; }
function pressQuick(name){ $$('#quick button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.quick===name)); }
function applyPreset(name){ pressPreset(name); pressQuick(null); if(PRESETS[name]) setVals(PRESETS[name]); syncUI(); }
function markCustom(){ pressPreset('custom'); pressQuick(null); }
function syncUI(){
  $('#imgQv').textContent=$('#imgQ').value; $('#pdfQv').textContent=$('#pdfQ').value; $('#offQv').textContent=$('#offQ').value;
  const m=$('#rsMode').value; $('#rsLong').hidden=m!=='long'; $('#rsPct').hidden=m!=='pct'; $('#rsExact').hidden=m!=='exact';
  $('#tgtRow').hidden=!$('#tgtOn').checked;
  const kb = $('#tgtOn').checked ? $('#tgtV').value : '0';
  $$('#limitChips .chip').forEach(c=>c.setAttribute('aria-pressed', c.dataset.kb==kb));
  $$('[data-long]').forEach(c=>c.setAttribute('aria-pressed', c.dataset.long==$('#rsLongV').value));
}
function S(){ return {
  format:$('#imgFormat').value, q:+$('#imgQ').value/100, rs:$('#rsMode').value, long:+$('#rsLongV').value||2560, pct:+$('#rsPctV').value||100,
  w:+$('#rsW').value||600, h:+$('#rsH').value||600, fit:$('#rsFit').checked,
  target: $('#tgtOn').checked ? Math.max(5,+$('#tgtV').value||100)*1024 : 0,
  pdfMode, dpi:+$('#pdfDpi').value, pdfQ:+$('#pdfQ').value/100, gray:$('#pdfGray').checked,
  offQ:+$('#offQ').value/100, offMax:+$('#offMax').value||1920 }; }
function showTab(name){ $$('.tab').forEach(x=>x.setAttribute('aria-selected', x.dataset.tab===name)); $$('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==name); }

let rerunT; function autoApply(){ clearTimeout(rerunT); rerunT=setTimeout(requeueAll, 450); }
$$('#presets button').forEach(b=>b.addEventListener('click',()=>{ const keepLimit=$('#tgtOn').checked, kb=$('#tgtV').value; applyPreset(b.dataset.preset); if(keepLimit){ $('#tgtOn').checked=true; $('#tgtV').value=kb; $('#imgFormat').value='image/jpeg'; syncUI(); } autoApply(); }));
$$('#quick button').forEach(b=>b.addEventListener('click',()=>{ setVals(QUICK[b.dataset.quick]); pressPreset('custom'); pressQuick(b.dataset.quick); syncUI(); autoApply(); }));
$$('#pdfMode button').forEach(b=>b.addEventListener('click',()=>{ setPdfMode(b.dataset.mode); markCustom(); autoApply(); }));
$$('.tab').forEach(x=>x.addEventListener('click',()=>showTab(x.dataset.tab)));
$$('aside input, aside select').forEach(el=>el.addEventListener('input',()=>{ if(el.id==='tgtV') $('#tgtOn').checked=true; if(el.id==='tgtOn'||el.id==='tgtV'){ if($('#tgtOn').checked && $('#imgFormat').value==='keep') $('#imgFormat').value='image/jpeg'; syncUI(); autoApply(); return; } if(el.id==='pageSize') return; syncUI(); markCustom(); autoApply(); }));
$$('[data-long]').forEach(c=>c.addEventListener('click',()=>{ $('#rsLongV').value=c.dataset.long; syncUI(); markCustom(); autoApply(); }));
$$('#limitChips .chip').forEach(c=>c.addEventListener('click',()=>{ const kb=+c.dataset.kb; $('#tgtOn').checked = kb>0; if(kb) $('#tgtV').value=kb; if(kb && $('#imgFormat').value==='keep') $('#imgFormat').value='image/jpeg'; syncUI(); autoApply(); }));

/* ================= file kinds ================= */
const ext = n => (n.match(/\.([^.]+)$/)||[,''])[1].toLowerCase();
const base = n => n.replace(/\.[^.]+$/,'');
const isHeic = f => /^(heic|heif)$/.test(ext(f.name)) || /image\/hei[cf]/.test(f.type);
function kindOf(f){ const e=ext(f.name);
  if(isHeic(f) || /^(jpe?g|jfif|png|webp|gif|bmp|avif)$/.test(e) || /^image\/(jpeg|png|webp|gif|bmp|avif)/.test(f.type)) return 'img';
  if(e==='pdf' || f.type==='application/pdf') return 'pdf';
  if(/^(docx|xlsx|pptx|docm|xlsm|pptm)$/.test(e)) return 'office';
  return 'other'; }
const MIME_EXT = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};

/* ================= image helpers ================= */
async function heicToJpeg(file, it){
  if(it){ it.progress=t('t_heic'); renderItem(it); }
  if(!window.heic2any) await loadScript(ROOT+'assets/vendor/heic2any.min.js');
  let r = await heic2any({blob:file, toType:'image/jpeg', quality:0.92});
  if(Array.isArray(r)) r=r[0];
  return r;
}
async function decode(blob){
  if(window.createImageBitmap){ try { return await createImageBitmap(blob, {imageOrientation:'from-image'}); } catch(e){} }
  return await new Promise((res,rej)=>{ const u=URL.createObjectURL(blob); const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error('This image could not be opened. TIFF and RAW photos need converting to JPG first.')); im.src=u; });
}
const W = b => b.width||b.naturalWidth, H = b => b.height||b.naturalHeight;
function dims(w,h,s){
  let nw=w, nh=h;
  if(s.rs==='long'){ const k=Math.min(1, s.long/Math.max(w,h)); nw=w*k; nh=h*k; }
  else if(s.rs==='pct'){ nw=w*s.pct/100; nh=h*s.pct/100; }
  else if(s.rs==='exact'){ if(s.fit){ const k=Math.min(s.w/w, s.h/h); nw=w*k; nh=h*k; } else { nw=s.w; nh=s.h; } }
  return {w:Math.max(1,Math.round(nw)), h:Math.max(1,Math.round(nh))};
}
function draw(src,w,h,opaque,gray){
  /* step down in halves for big reductions — sharper than one large jump */
  let cur=src, cw=W(src), ch=H(src);
  while(cw/2 > w*1.15 && ch/2 > h*1.15){
    const c=document.createElement('canvas'); c.width=Math.round(cw/2); c.height=Math.round(ch/2);
    const x=c.getContext('2d'); x.imageSmoothingQuality='high'; x.drawImage(cur,0,0,c.width,c.height);
    if(cur!==src && cur.width!=null) { cur.width=cur.height=0; }
    cur=c; cw=c.width; ch=c.height;
  }
  const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  if(opaque){ x.fillStyle='#fff'; x.fillRect(0,0,w,h); }
  x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high';
  if(gray) x.filter='grayscale(1)';
  x.drawImage(cur,0,0,w,h);
  if(cur!==src) cur.width=cur.height=0;
  return c;
}
/* Edits from the photo editor: rotate, flip, crop (0–1 of the rotated image), watermark */
function drawWatermark(ctx, x0, y0, w, h, wm){
  const text = (wm && wm.text || '').trim(); if(!text) return;
  let fs = Math.max(10, Math.min(w,h) * (wm.size||6) / 100);
  ctx.save(); ctx.beginPath(); ctx.rect(x0,y0,w,h); ctx.clip();
  ctx.globalAlpha = wm.opacity==null ? .35 : wm.opacity;
  const dark = wm.color==='black'; ctx.fillStyle = dark ? '#000' : '#fff';
  ctx.shadowColor = dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.45)'; ctx.shadowBlur = fs*.12;
  const font = s => `700 ${s}px "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif`;
  ctx.font = font(fs); ctx.textBaseline = 'middle';
  if(wm.pos==='tile'){
    ctx.translate(x0+w/2, y0+h/2); ctx.rotate(-Math.PI/6); ctx.textAlign='left';
    const tw = ctx.measureText(text).width + fs*2.2, th = fs*3.2, R = Math.hypot(w,h)/2 + tw;
    for(let y=-R, row=0; y<R; y+=th, row++){ for(let x=-R - (row%2)*tw/2; x<R; x+=tw) ctx.fillText(text, x, y); }
  } else if(wm.pos==='center'){
    const tw = ctx.measureText(text).width; if(tw > w*.9){ fs *= w*.9/tw; ctx.font = font(fs); }
    ctx.textAlign='center'; ctx.fillText(text, x0+w/2, y0+h/2);
  } else {
    const tw = ctx.measureText(text).width; if(tw > w*.8){ fs *= w*.8/tw; ctx.font = font(fs); }
    ctx.textAlign='right'; ctx.fillText(text, x0+w-fs*.7, y0+h-fs*.9);
  }
  ctx.restore();
}
function applyEdit(src, e){
  const sw=W(src), sh=H(src), rot=(((e.rot||0)%360)+360)%360, swap=rot%180!==0;
  const c1=document.createElement('canvas'); c1.width=swap?sh:sw; c1.height=swap?sw:sh;
  const x=c1.getContext('2d'); x.translate(c1.width/2, c1.height/2); x.rotate(rot*Math.PI/180); if(e.flip) x.scale(-1,1); x.drawImage(src, -sw/2, -sh/2);
  let out=c1;
  if(e.crop){ const c=e.crop, px=Math.round(c.x*c1.width), py=Math.round(c.y*c1.height), pw=Math.max(1,Math.round(c.w*c1.width)), ph=Math.max(1,Math.round(c.h*c1.height));
    if(px||py||pw!==c1.width||ph!==c1.height){ const c2=document.createElement('canvas'); c2.width=pw; c2.height=ph; c2.getContext('2d').drawImage(c1,px,py,pw,ph,0,0,pw,ph); c1.width=c1.height=0; out=c2; } }
  if(e.wm && e.wm.text) drawWatermark(out.getContext('2d'), 0, 0, out.width, out.height, e.wm);
  return out;
}
const hasEdit = e => !!(e && (e.rot || e.flip || e.crop || (e.wm && e.wm.text) || e.size || e.base || e.q || e.kb));
const encode = (c,mime,q) => new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Encoding failed. The image may be too large for this device.')), mime, q));
async function fitTarget(src,w,h,mime,target){
  let scale=1, best=null;
  for(let round=0; round<8; round++){
    const cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(h*scale));
    const c=draw(src,cw,ch,mime!=='image/png');
    if(mime==='image/png'){ const b=await encode(c,mime); if(b.size<=target) return {blob:b,w:cw,h:ch}; best={blob:b,w:cw,h:ch}; scale*=Math.sqrt(target/b.size)*0.92; continue; }
    const low=await encode(c,mime,0.12);
    if(low.size>target){ best={blob:low,w:cw,h:ch}; scale*=Math.sqrt(target/low.size)*0.9; continue; }
    let lo=0.12, hi=0.95, good=low;
    for(let i=0;i<7;i++){ const mid=(lo+hi)/2; const b=await encode(c,mime,mid); if(b.size<=target){ good=b; lo=mid; } else hi=mid; }
    return {blob:good,w:cw,h:ch};
  }
  return best;
}
function outMimeFor(file,s){
  if(s.format!=='keep') return s.format;
  const e=ext(file.name);
  if(e==='png'||e==='gif'||e==='bmp') return 'image/png';
  if(e==='webp') return 'image/webp';
  return 'image/jpeg';
}

/* ================= processors ================= */
async function sourceOf(it){
  if(it.edit && it.edit.base) return it.edit.base;          /* e.g. photo with white background */
  if(isHeic(it.file)){ const j = it.heicJpeg || (it.heicJpeg = await heicToJpeg(it.file, it)); if(!it.thumbSet){ if(it.thumb) URL.revokeObjectURL(it.thumb); it.thumb=URL.createObjectURL(j); it.thumbSet=true; } return j; }
  return it.file;
}
async function processImage(it,s){
  const e = it.edit || {};
  const decoded = it._src || await decode(await sourceOf(it));
  const ow=W(decoded), oh=H(decoded);
  const src = hasEdit(e) ? applyEdit(decoded, e) : decoded;
  if(src!==decoded && !it._src && decoded.close) decoded.close();
  const ew=W(src), eh=H(src);
  let w, h;
  if(e.size){ w=e.size.w; h=e.size.h; } else ({w,h}=dims(ew,eh,s));
  let mime = e.size ? 'image/jpeg' : outMimeFor(it.file,s);
  const target = e.kb!=null ? e.kb*1024 : s.target, q = e.q || s.q;
  if(target && mime==='image/png' && s.format==='keep') mime='image/jpeg';
  let blob;
  if(target && !e.size){ const r=await fitTarget(src,w,h,mime,target); blob=r.blob; w=r.w; h=r.h; }
  else if(target && e.size){ const c=draw(src,w,h,true); let lo=.12, hi=.95; blob=await encode(c,mime,.12); if(blob.size<=target){ for(let i=0;i<7;i++){ const mid=(lo+hi)/2, b=await encode(c,mime,mid); if(b.size<=target){ blob=b; lo=mid; } else hi=mid; } } }
  else { blob=await encode(draw(src,w,h,mime!=='image/png'), mime, q); }
  if(src!==decoded) src.width=src.height=0; else if(!it._src && src.close) src.close();
  const resized = (w!==ow||h!==oh);
  let note = (e.passportLabel ? e.passportLabel+' · ' : '') + `${ow}×${oh}` + (resized?` → ${w}×${h}`:'') + ` · ${MIME_EXT[mime].toUpperCase()}`;
  if(hasEdit(e) && !e.passportLabel) note += ' · edited';
  if(target && blob.size>target) note += ' · could not reach the size limit; this is the smallest possible';
  return {blob, name: base(it.file.name)+(e.passportLabel?'-passport.':'-compressed.')+MIME_EXT[mime], note, w, h, mustKeep: target>0 || s.format!=='keep' || isHeic(it.file) || hasEdit(e) || (s.rs!=='none' && resized)};
}

async function processPdf(it,s,progress){
  const buf = await it.file.arrayBuffer();
  if(s.pdfMode==='light'){
    const doc = await PDFLib.PDFDocument.load(buf.slice(0), {ignoreEncryption:true, updateMetadata:false});
    if(doc.isEncrypted) throw new Error(t('pw_err'));
    doc.setProducer('PocketPress'); doc.setCreator('');
    const bytes = await doc.save({useObjectStreams:true});
    return {blob:new Blob([bytes],{type:'application/pdf'}), name:base(it.file.name)+'-compressed.pdf', note:`${doc.getPageCount()} pages · light repack, text kept`};
  }
  await needPdfJs();
  let pdf;
  try { pdf = await pdfjsLib.getDocument({data:new Uint8Array(buf.slice(0)), isEvalSupported:false}).promise; }
  catch(e){ if(e && e.name==='PasswordException') throw new Error(t('pw_err')); throw e; }
  const out = await PDFLib.PDFDocument.create();
  const scale = s.dpi/72;
  for(let i=1;i<=pdf.numPages;i++){
    progress(t('page_n',{i, n:pdf.numPages}));
    const page = await pdf.getPage(i);
    const vp1 = page.getViewport({scale:1});
    let k = scale; const maxPx = 4200; if(vp1.width*k>maxPx || vp1.height*k>maxPx) k = maxPx/Math.max(vp1.width,vp1.height);
    const vp = page.getViewport({scale:k});
    const c = document.createElement('canvas'); c.width=Math.ceil(vp.width); c.height=Math.ceil(vp.height);
    const x = c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
    await page.render({canvasContext:x, viewport:vp}).promise;
    let target=c; if(s.gray){ target=draw(c,c.width,c.height,true,true); }
    const jb = await encode(target,'image/jpeg',s.pdfQ);
    const img = await out.embedJpg(new Uint8Array(await jb.arrayBuffer()));
    const p = out.addPage([vp1.width, vp1.height]);
    p.drawImage(img,{x:0,y:0,width:vp1.width,height:vp1.height});
    c.width=c.height=0; if(target!==c) target.width=target.height=0; page.cleanup();
  }
  const n = pdf.numPages; pdf.destroy();
  out.setProducer('PocketPress');
  const bytes = await out.save({useObjectStreams:true});
  return {blob:new Blob([bytes],{type:'application/pdf'}), name:base(it.file.name)+'-compressed.pdf', note:`${n} page${n>1?'s':''} · ${s.dpi} DPI${s.gray?' · grayscale':''} · text not selectable`};
}

async function processOffice(it,s,progress){
  const zip = await JSZip.loadAsync(it.file);
  const media = Object.keys(zip.files).filter(p=>/^(word|ppt|xl)\/media\/[^/]+\.(jpe?g|png)$/i.test(p));
  let changed=0;
  for(let i=0;i<media.length;i++){
    const path=media[i]; progress(t('pic_n',{i:i+1,n:media.length}));
    const orig = await zip.file(path).async('blob');
    let src; try { src = await decode(orig); } catch(e){ continue; }
    const w=W(src), h=H(src); const k=Math.min(1, s.offMax/Math.max(w,h)); const nw=Math.round(w*k), nh=Math.round(h*k);
    const isPng = /png$/i.test(path);
    if(isPng && k===1){ if(src.close) src.close(); continue; }
    const b = await encode(draw(src,nw,nh,!isPng), isPng?'image/png':'image/jpeg', s.offQ);
    if(src.close) src.close();
    if(b.size < orig.size){ zip.file(path, b, {binary:true}); changed++; }
  }
  progress(t('repack'));
  const blob = await zip.generateAsync({type:'blob', compression:'DEFLATE', compressionOptions:{level:9}, mimeType:it.file.type||'application/octet-stream'});
  return {blob, name: base(it.file.name)+'-compressed.'+ext(it.file.name), note: media.length ? `${changed} of ${media.length} picture${media.length>1?'s':''} recompressed` : 'No pictures inside · repacked only'};
}

async function processOther(it){
  const zip = new JSZip(); zip.file(it.file.name, it.file);
  const blob = await zip.generateAsync({type:'blob', compression:'DEFLATE', compressionOptions:{level:9}});
  return {blob, name: it.file.name+'.zip', note:'Packed into a compressed .zip', mustKeep:true};
}

/* ================= queue ================= */
let partyArmed = false;
function addFiles(list, example){
  const added = [];
  for(const f of list){ const it={id:++uid, file:f, kind:kindOf(f), status:'queued', out:null, note:'', example:!!example}; items.push(it); pending.push(it); added.push(it); }
  if(!example && added.length) partyArmed = true;
  if(window.PP && PP.onAdded) PP.onAdded(added);
  render(); pump();
  return added;
}
function countSaving(it){
  if(it.example || it.generated || it.status!=='done') return;
  const saved = Math.max(0, it.file.size - it.out.blob.size), st = getStats();
  st.saved += saved - (it.counted||0); if(it.counted==null) st.files++;
  it.counted = saved; putStats(st);
}
function celebrate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv=document.createElement('canvas'); cv.className='confetti'; cv.width=innerWidth*devicePixelRatio; cv.height=innerHeight*devicePixelRatio; document.body.appendChild(cv);
  const x=cv.getContext('2d'), cs=getComputedStyle(document.documentElement), cols=['--accent','--good','--office','--bad'].map(v=>cs.getPropertyValue(v).trim()||'#E09A12');
  const P=Array.from({length:140},()=>({x:cv.width*(.2+Math.random()*.6), y:cv.height*.35, vx:(Math.random()-.5)*16*devicePixelRatio, vy:(-6-Math.random()*12)*devicePixelRatio, r:(3+Math.random()*4)*devicePixelRatio, a:Math.random()*6, va:(Math.random()-.5)*.4, c:cols[Math.floor(Math.random()*cols.length)]}));
  const t0=performance.now();
  (function frame(now){ const el=now-t0; x.clearRect(0,0,cv.width,cv.height);
    for(const p of P){ p.vy+=.45*devicePixelRatio; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.globalAlpha=Math.max(0,1-el/1800); x.fillStyle=p.c; x.fillRect(-p.r,-p.r/2,p.r*2,p.r); x.restore(); }
    if(el<1800) requestAnimationFrame(frame); else cv.remove(); })(t0);
}
function maybeParty(){
  if(!partyArmed || pending.length) return; partyArmed=false;
  const done=items.filter(i=>i.status==='done' && !i.example && !i.generated);
  const before=done.reduce((a,i)=>a+i.file.size,0), saved=before-done.reduce((a,i)=>a+i.out.blob.size,0);
  if(saved >= 1048576 || (before && saved/before >= .5 && saved > 51200)){ celebrate(); toast(t('t_party',{size:fmt(saved)})); }
}
function requeueAll(){
  let n=0;
  for(const it of items){ if(it.generated) continue;
    if(it.status==='working'){ it.dirty=true; n++; continue; }
    it.status='queued'; it.out=null; it.note=''; if(!pending.includes(it)) pending.push(it); n++; }
  if(n){ render(); pump(); }
}
async function pump(){
  if(busy) return; busy=true; renderSummary();
  while(pending.length){
    const it=pending.shift(); if(!items.includes(it)) continue;
    it.status='working'; it.progress=''; renderItem(it);
    const s=S();
    try {
      const fn = {img:processImage, pdf:processPdf, office:processOffice, other:processOther}[it.kind];
      const r = await fn(it, s, msg=>{ it.progress=msg; renderItem(it); });
      if(r.blob.size >= it.file.size && !r.mustKeep){ it.out={blob:it.file, name:it.file.name}; it.kept=true; it.note=r.note+' · '+t('kept_note'); if(it.kind==='img' && /\.png$/i.test(r.name)) it.note+=' '+t('png_tip'); }
      else { it.out={blob:r.blob, name:r.name}; it.kept=false; it.note=r.note; }
      if(it.outUrl){ URL.revokeObjectURL(it.outUrl); it.outUrl=null; }
      it.status='done'; countSaving(it);
    } catch(e){ console.error(e); it.status='error'; it.note = (e && e.message) ? e.message : t('t_err'); }
    if(it.dirty){ it.dirty=false; it.status='queued'; it.out=null; it.note=''; pending.push(it); }
    renderItem(it); renderSummary();
    await new Promise(r=>setTimeout(r,0));
  }
  busy=false; renderSummary(); maybeParty();
}

const canShare = f => { try { return !!(navigator.canShare && navigator.canShare({files:[f]})); } catch(e){ return false; } };
function render(){
  const q=$('#queue'); q.innerHTML='';
  if(!items.length){ q.innerHTML=`<div class="empty">${esc(t('empty'))}</div>`; }
  for(const it of items){ const el=document.createElement('div'); el.className='item'; el.id='it'+it.id; el.dataset.id=it.id;
    el.innerHTML=`<button class="grip" type="button" aria-label="${esc(t('drag'))}" title="${esc(t('drag'))}"><svg viewBox="0 0 10 16" aria-hidden="true"><circle cx="3" cy="3" r="1.4"/><circle cx="7" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="7" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="7" cy="13" r="1.4"/></svg></button><div class="item-body"></div>`;
    q.appendChild(el); renderItem(it); }
  renderSummary();
}
/* first-page thumbnails for PDFs */
let thumbChain = Promise.resolve();
function pdfThumb(it){
  if(it.thumbTried) return; it.thumbTried = true;
  thumbChain = thumbChain.then(async () => {
    try { await needPdfJs();
      const src = it.generated ? it.out.blob : it.file;
      const pdf = await pdfjsLib.getDocument({data:new Uint8Array(await src.arrayBuffer()), isEvalSupported:false}).promise;
      const page = await pdf.getPage(1), vp0 = page.getViewport({scale:1}), vp = page.getViewport({scale: 120/vp0.width});
      const c=document.createElement('canvas'); c.width=Math.ceil(vp.width); c.height=Math.ceil(vp.height); const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
      await page.render({canvasContext:x, viewport:vp}).promise; it.pages = pdf.numPages; pdf.destroy();
      const b = await encode(c,'image/png'); it.thumb = URL.createObjectURL(b); renderItem(it);
    } catch(e){ /* password-protected or damaged: keep the PDF label */ }
  });
}
function renderItem(it){
  const row=document.getElementById('it'+it.id); if(!row) return; const el=row.querySelector('.item-body');
  if(it.kind==='pdf' && !it.thumb) pdfThumb(it);
  const label={img:'IMG',pdf:'PDF',office:ext(it.file.name).toUpperCase().slice(0,4),other:'ZIP'}[it.kind];
  if(it.kind==='img' && !it.thumb && !isHeic(it.file)){ it.thumb=URL.createObjectURL(it.file); }
  const before=it.file.size, after=it.out?it.out.blob.size:null;
  const pct = after!=null ? Math.round((1-after/before)*100) : 0;
  let pill='';
  if(it.status==='working') pill=`<span class="pill neutral"><span class="spin"></span> ${esc(it.progress||t('working'))}</span>`;
  else if(it.status==='queued') pill=`<span class="pill neutral">${esc(t('waiting'))}</span>`;
  else if(it.status==='error') pill=`<span class="pill bad">${esc(t('failed'))}</span>`;
  else if(it.kept) pill=`<span class="pill neutral">${esc(t('kept'))}</span>`;
  else pill = pct>0 ? `<span class="pill good">−${pct}%</span>` : `<span class="pill neutral">${pct===0?esc(t('same')):'+'+(-pct)+'%'}</span>`;
  const editable = it.kind==='img' && !it.generated;
  const done = it.status==='done';
  const shareable = done && typeof File!=='undefined' && canShare(new File([it.out.blob], it.out.name, {type:it.out.blob.type}));
  const thumb = it.thumb ? `<img alt="" src="${it.thumb}">` : label;
  el.innerHTML = `
    ${editable?`<button class="kind ${it.kind}" type="button" data-edit="${it.id}" aria-label="${esc(t('edit'))}">${thumb}</button>`:`<div class="kind ${it.kind}">${thumb}</div>`}
    <div class="meta">
      <div class="name" title="${esc(it.file.name)}">${esc(it.out&&!it.kept?it.out.name:it.file.name)}</div>
      <div class="sizes"><span>${fmt(before)}</span><span>→</span><span class="after">${after!=null?fmt(after):'…'}</span>${pill}${it.example?`<span class="pill ex">${esc(t('example'))}</span>`:''}</div>
      ${done&&!it.kept?`<div class="bar" aria-hidden="true"><i style="width:${Math.max(2,Math.min(100,100-pct))}%"></i></div>`:''}
      ${it.note?`<div class="note">${esc(it.note)}</div>`:''}
    </div>
    <div class="actions">
      ${editable?`<button class="btn sm" type="button" data-edit="${it.id}">${esc(t('edit'))}</button>`:''}
      ${editable&&it.edit&&it.edit.passportLabel&&done?`<button class="btn sm" type="button" data-sheet="${it.id}">${esc(t('sheet'))}</button>`:''}
      ${it.kind==='pdf'&&!it.generated?`<button class="btn sm" type="button" data-pages="${it.id}">${esc(t('pages'))}</button>`:''}
      ${it.kind==='pdf'?`<button class="btn sm" type="button" data-lock="${it.id}">${esc(t('lock'))}</button>`:''}
      ${shareable?`<button class="btn sm" type="button" data-share="${it.id}">${esc(t('share'))}</button>`:''}
      <button class="btn sm primary" type="button" data-save="${it.id}" ${done?'':'disabled'}>${esc(t('download'))}</button>
      <button class="btn sm ghost" type="button" data-del="${it.id}" aria-label="${esc(t('remove'))}">✕</button>
    </div>`;
}
function renderSummary(){
  const done=items.filter(i=>i.status==='done');
  const before=done.reduce((a,i)=>a+i.file.size,0), after=done.reduce((a,i)=>a+i.out.blob.size,0);
  $('#sCount').textContent=items.length; $('#sBefore').textContent=fmt(before); $('#sAfter').textContent=fmt(after);
  $('#sSaved').textContent = before? Math.max(0,Math.round((1-after/before)*100))+'%' : '0%';
  $('#saveAll').disabled = !done.length || busy;
  const nImg = items.filter(i=>i.kind==='img').length, nPdf = items.filter(i=>i.kind==='pdf').length;
  $('#toPdf').hidden = !nImg; $('#toPdf').disabled = busy;
  $('#mergePdf').hidden = nPdf<2; $('#mergePdf').disabled = busy;
}

$('#queue').addEventListener('click', e=>{
  const sv=e.target.closest('[data-save]'), dl=e.target.closest('[data-del]'), sh=e.target.closest('[data-share]');
  const find = id => items.find(i=>i.id==id);
  for(const [attr, fn] of [['edit','openEditor'],['pages','openPages'],['lock','openLock'],['sheet','printSheet']]){
    const b=e.target.closest('[data-'+attr+']'); if(b && window.PP && PP[fn]){ const it=find(b.dataset[attr]); if(it) PP[fn](it); return; } }
  if(sv){ const it=find(sv.dataset.save); if(it&&it.out) saveBlob(it.out.name, it.out.blob); }
  if(sh){ const it=find(sh.dataset.share); if(it&&it.out){ const f=new File([it.out.blob], it.out.name, {type:it.out.blob.type}); navigator.share({files:[f], title:it.out.name}).catch(()=>{}); } }
  if(dl){ const i=items.findIndex(x=>x.id==dl.dataset.del); if(i>-1){ const it=items[i]; if(it.thumb) URL.revokeObjectURL(it.thumb); if(it.outUrl) URL.revokeObjectURL(it.outUrl); items.splice(i,1); render(); } }
});
$('#clearAll').addEventListener('click',()=>{ items.forEach(i=>{ i.thumb&&URL.revokeObjectURL(i.thumb); i.outUrl&&URL.revokeObjectURL(i.outUrl); }); items.length=0; pending.length=0; render(); });

/* ================= drag to reorder ================= */
function sortable(container, sel, onDone){
  container.addEventListener('pointerdown', e=>{
    const h=e.target.closest('.grip'); if(!h || !container.contains(h)) return;
    const el=h.closest(sel); if(!el || el.parentNode!==container) return;
    e.preventDefault(); el.classList.add('dragging'); try{ h.setPointerCapture(e.pointerId); }catch(_){}
    const move=ev=>{
      let best=null, bd=1e9;
      for(const o of container.querySelectorAll(sel)){ if(o===el) continue; const r=o.getBoundingClientRect(); const d=Math.hypot(ev.clientX-(r.left+r.width/2), ev.clientY-(r.top+r.height/2)); if(d<bd){ bd=d; best=o; } }
      if(best){ const r=best.getBoundingClientRect(), wide=r.width>container.clientWidth*.6;
        const before = wide ? ev.clientY < r.top+r.height/2 : (ev.clientY < r.top || (ev.clientY <= r.bottom && ((ev.clientX < r.left+r.width/2) !== (document.dir==='rtl'))));
        if(before){ if(best.previousElementSibling!==el) container.insertBefore(el,best); } else if(best.nextElementSibling!==el) container.insertBefore(el,best.nextSibling); }
      if(ev.clientY<70) scrollBy(0,-14); else if(ev.clientY>innerHeight-70) scrollBy(0,14);
    };
    const up=()=>{ el.classList.remove('dragging'); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up); onDone(); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
  });
  container.addEventListener('keydown', e=>{
    const h=e.target.closest('.grip'); if(!h || !/^Arrow(Up|Down|Left|Right)$/.test(e.key)) return;
    const el=h.closest(sel); e.preventDefault();
    const back = e.key==='ArrowUp' || e.key===(document.dir==='rtl'?'ArrowRight':'ArrowLeft');
    if(back && el.previousElementSibling) container.insertBefore(el, el.previousElementSibling);
    else if(!back && el.nextElementSibling) container.insertBefore(el.nextElementSibling, el);
    h.focus(); onDone();
  });
}
sortable($('#queue'), '.item', ()=>{
  const order=[...$('#queue').querySelectorAll('.item')].map(x=>+x.dataset.id);
  items.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
});

/* ================= images → PDF ================= */
function busyBtn(btn, label){ btn.disabled=true; btn.innerHTML=`<span class="spin"></span> ${esc(label)}`; }
function resetBtn(btn, key){ btn.innerHTML=''; btn.textContent=t(key); renderSummary(); }
function pushGenerated(blob, name, note, origTotal, kind){
  kind = kind || 'pdf';
  const it={id:++uid, file:{name, size:origTotal, type:blob.type}, kind, status:'done', out:{blob,name}, kept:false, generated:true, note};
  if(kind==='img') it.thumb = URL.createObjectURL(blob);
  items.push(it); render(); toast(t('t_pdf_done'));
  const row=document.getElementById('it'+it.id); if(row) row.scrollIntoView({behavior:'smooth', block:'center'});
  return it;
}
$('#toPdf').addEventListener('click', async ()=>{
  const imgs=items.filter(i=>i.kind==='img'); if(!imgs.length) return;
  const btn=$('#toPdf'); busyBtn(btn, t('t_pdf_build'));
  try{
    const s=S(); const doc=await PDFLib.PDFDocument.create(); const size=$('#pageSize').value;
    for(const it of imgs){
      const outJpg = (it.out && /jpe?g$/i.test(it.out.name)) ? it.out.blob : null;
      let bytes, w, h;
      if(outJpg){ const b=await decode(outJpg); w=W(b); h=H(b); if(b.close) b.close(); bytes=new Uint8Array(await outJpg.arrayBuffer()); }
      else { const input = isHeic(it.file) ? (it.heicJpeg || (it.heicJpeg = await heicToJpeg(it.file))) : it.file;
        const src=await decode(input); const d=dims(W(src),H(src),s); w=d.w; h=d.h; const jb=await encode(draw(src,w,h,true),'image/jpeg',s.q); if(src.close) src.close(); bytes=new Uint8Array(await jb.arrayBuffer()); }
      const img=await doc.embedJpg(bytes);
      if(size==='fit'){ const pw=w*0.75, ph=h*0.75; doc.addPage([pw,ph]).drawImage(img,{x:0,y:0,width:pw,height:ph}); }
      else { let [pw,ph]= size==='a4'?[595.28,841.89]:[612,792]; if(w>h) [pw,ph]=[ph,pw]; const mg=24, k=Math.min((pw-2*mg)/w,(ph-2*mg)/h); const iw=w*k, ih=h*k; doc.addPage([pw,ph]).drawImage(img,{x:(pw-iw)/2,y:(ph-ih)/2,width:iw,height:ih}); }
    }
    doc.setProducer('PocketPress');
    const out=await doc.save();
    pushGenerated(new Blob([out],{type:'application/pdf'}), 'combined-images.pdf', `${imgs.length} image${imgs.length>1?'s':''} combined · ${size==='fit'?'page = image size':size.toUpperCase()+' pages'}`, imgs.reduce((a,i)=>a+i.file.size,0));
  } catch(e){ console.error(e); toast('Could not build the PDF: '+(e.message||e)); }
  resetBtn(btn,'to_pdf');
});

/* ================= merge PDFs ================= */
$('#mergePdf').addEventListener('click', async ()=>{
  const pdfs=items.filter(i=>i.kind==='pdf' && !i.generated || i.kind==='pdf' && i.generated && i.out);
  if(pdfs.length<2){ toast(t('t_merge_need')); return; }
  const btn=$('#mergePdf'); busyBtn(btn, t('t_merge_build'));
  try{
    const out=await PDFLib.PDFDocument.create(); let pages=0;
    for(const it of pdfs){
      const src = (it.status==='done' && it.out) ? it.out.blob : it.file;
      const d = await PDFLib.PDFDocument.load(await src.arrayBuffer(), {ignoreEncryption:true});
      const cp = await out.copyPages(d, d.getPageIndices()); cp.forEach(p=>out.addPage(p)); pages+=cp.length;
    }
    out.setProducer('PocketPress');
    const bytes=await out.save({useObjectStreams:true});
    pushGenerated(new Blob([bytes],{type:'application/pdf'}), 'merged.pdf', `${pdfs.length} PDFs merged in list order · ${pages} pages`, pdfs.reduce((a,i)=>a+i.file.size,0));
  } catch(e){ console.error(e); toast('Could not merge: '+(e.message||e)); }
  resetBtn(btn,'merge');
});

/* ================= saving ================= */
function saveBlob(name, blob){
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.rel='noopener';
  document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},8000);
  toast(t('t_saved',{n:name}));
}
$('#saveAll').addEventListener('click', async ()=>{
  const done=items.filter(i=>i.status==='done'); if(!done.length) return;
  if(done.length===1){ saveBlob(done[0].out.name, done[0].out.blob); return; }
  const z=new JSZip(); const used=new Set();
  for(const i of done){ let n=i.out.name, k=1; while(used.has(n)){ n=base(i.out.name)+`-${++k}.`+ext(i.out.name); } used.add(n); z.file(n, i.out.blob); }
  saveBlob('pocketpress-files.zip', await z.generateAsync({type:'blob', compression:'STORE'}));
});

/* ================= input ================= */
const drop=$('#drop'), fin=$('#fileIn');
fin.addEventListener('change',()=>{ addFiles([...fin.files]); fin.value=''; });
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault(); drop.classList.add('over');}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault(); drop.classList.remove('over');}));
drop.addEventListener('drop',e=>{ const f=[...(e.dataTransfer?.files||[])]; if(f.length) addFiles(f); });
window.addEventListener('dragover',e=>e.preventDefault()); window.addEventListener('drop',e=>e.preventDefault());
window.addEventListener('paste',e=>{ const f=[...(e.clipboardData?.files||[])]; if(f.length){ addFiles(f.map((x,i)=>x.name&&x.name!=='image.png'?x:new File([x],`pasted-${Date.now()}-${i}.png`,{type:x.type}))); toast(t('t_pasted',{n:f.length})); } });

/* ================= example so the first view shows what the tool does ================= */
async function makeExample(){
  try {
    const r = await fetch(ROOT + 'assets/example-coffee.jpg'); if(!r.ok) return;
    const b = await r.blob(); if(items.length) return;   /* visitor already added files */
    addFiles([new File([b], 'coffee-photo.jpg', {type:'image/jpeg'})], true);
  } catch(e){}
}

/* ================= files opened from outside the page ================= */
async function takeShared(){
  const m = location.search.match(/[?&]shared=(\d+)/); if(!m || !('caches' in window)) return false;
  history.replaceState(null, '', location.pathname);
  try {
    const c = await caches.open('pp-share'); const keys = await c.keys(); const files = [];
    for(const k of keys){ const r = await c.match(k); const b = await r.blob(); files.push(new File([b], decodeURIComponent(r.headers.get('x-name')||'shared'), {type:b.type})); }
    await caches.delete('pp-share');
    if(files.length){ addFiles(files); toast(t('t_shared',{n:files.length})); return true; }
  } catch(e){ console.error(e); }
  return false;
}
let launched = false;
if('launchQueue' in window){ window.launchQueue.setConsumer(async p => { if(!p.files || !p.files.length) return; launched = true;
  const files = await Promise.all(p.files.map(h => h.getFile())); addFiles(files); }); }

/* ================= boot ================= */
applyPreset(PAGE.preset && PRESETS[PAGE.preset] ? PAGE.preset : 'balanced');
if(PAGE.quick && QUICK[PAGE.quick]){ setVals(QUICK[PAGE.quick]); pressPreset('custom'); pressQuick(PAGE.quick); }
if(PAGE.set){ setVals(PAGE.set); pressPreset('custom'); }
syncUI();
showTab(PAGE.tab || 'img');
if(PAGE.spot && $(PAGE.spot)) $(PAGE.spot).classList.add('spot');
applyLang();
if(PAGE.more) $('#more').open = true;
takeShared().then(got => { if(!got && !launched && PAGE.example !== false) setTimeout(()=>{ if(!items.length && !launched) makeExample(); }, 150); });
window.PocketPress = { addFiles, items };   /* handy for testing */
Object.assign(window.PP = window.PP || {}, { items, addFiles, render, renderItem, renderSummary, pump, pending, t, toast, esc, fmt, decode, draw, encode, W, H,
  applyEdit, drawWatermark, processImage, sourceOf, S, pushGenerated, needPdfJs, saveBlob, loadScript, ROOT, base, ext, isHeic, PAGE, celebrate, sortable,
  lang: () => LANG,
  reprocess(it){ if(it.status==='working'){ it.dirty=true; return; } it.status='queued'; it.out=null; it.note=''; if(!pending.includes(it)) pending.push(it); renderItem(it); pump(); } });
if(window.PP.ready) window.PP.ready();
})();
