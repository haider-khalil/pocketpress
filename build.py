#!/usr/bin/env python3
"""
PocketPress site builder.

Generates every HTML page, sitemap.xml, robots.txt, the web-app manifest and the
offline service worker from the settings and page list below.

    python3 build.py

Edit SITE_URL / BASE_PATH when you connect your own domain, then run it again
and commit the result. No packages needed — plain Python 3.8+.
"""
import re, json, html, os, datetime, hashlib, pathlib

# ----------------------------------------------------------------------------
# Site settings — change these when you get a domain
# ----------------------------------------------------------------------------
SITE_NAME = "PocketPress"
SITE_URL  = "https://haider-khalil.github.io/pocketpress"   # no trailing slash
BASE_PATH = "/pocketpress/"      # "/" once you use your own domain
REPO_URL  = "https://github.com/haider-khalil/pocketpress"
CONTACT_EMAIL = ""               # e.g. "hello@pocketpress.pk" — leave empty to use GitHub issues
THEME = "#E09A12"

ROOT_DIR = pathlib.Path(__file__).parent
TODAY = datetime.date.today().isoformat()

# ----------------------------------------------------------------------------
# Tool pages. Each one opens the same tool with different starting settings,
# and has its own title, description and help text for search engines.
# ----------------------------------------------------------------------------
TOOLS = [
  dict(path="", nav="All-in-one", tab="img",
       title="PocketPress — Free File Compressor for Images, PDF & Word",
       desc="Compress images, PDFs, Word, Excel and PowerPoint files for free. Resize photos, fit images under 100 KB, convert JPG to PDF. Files never leave your device.",
       h1='<span dir="ltr">Pocket<span class="press">Press</span></span>', h1_ur='<span dir="ltr">Pocket<span class="press">Press</span></span>',
       intro="Shrink, resize and convert images, PDFs and Office files. Fit a photo under an upload limit, slim a scanned PDF, or turn photos into one PDF.",
       intro_ur="تصاویر، پی ڈی ایف اور آفس فائلوں کا سائز کم کریں۔ تصویر کو اپ لوڈ کی حد کے اندر لائیں، اسکین شدہ PDF چھوٹی کریں، یا تصاویر سے ایک PDF بنائیں۔",
       steps=["Drop your files in the box, or tap it to choose them.", "Pick a goal: Smallest, Balanced or Best quality. Need a photo under 100 KB? Tap the size limit. Everything else is under More settings.", "Press Download on each file, or Download all to get one .zip."],
       faq=[("What file types can I compress?", "JPG, PNG, WebP, GIF, BMP, iPhone HEIC photos, PDF, Word (.docx), Excel (.xlsx) and PowerPoint (.pptx). Any other file can be packed into a compressed .zip.")]),
  dict(path="compress-image", nav="Compress image", tab="img",
       title="Compress Image Online Free — JPG, PNG, WebP | PocketPress",
       desc="Reduce image file size without visible quality loss. Compress JPG, PNG and WebP photos in your browser. Free, no upload, no sign-up.",
       h1="Compress images", h1_ur="تصویر کا سائز کم کریں",
       intro="Make photos smaller without a visible loss in quality. Works with JPG, PNG, WebP, GIF, BMP and iPhone HEIC.",
       intro_ur="معیار میں نمایاں کمی کے بغیر تصاویر چھوٹی کریں۔ JPG، PNG، WebP اور آئی فون HEIC کے ساتھ کام کرتا ہے۔",
       steps=["Add your photos.", "Keep Balanced for everyday use, or pick Smallest for the tiniest files. Your files update as soon as you change a setting.", "Tap the thumbnail to compare before and after, then download."],
       faq=[("Will my photo look worse?", "At the Balanced setting most people cannot see a difference. Tap the thumbnail after compressing to compare the two side by side.")]),
  dict(path="compress-image-to-100kb", nav="Image to 100 KB", tab="img", set=dict(imgFormat="image/jpeg", tgt=True, tgtV=100, rsMode="long", rsLongV=1600),
       title="Compress Image to 100KB Online Free | PocketPress",
       desc="Reduce a photo to under 100 KB for job portals, university admissions and government forms. Automatic quality adjustment. Free and private.",
       h1="Compress image to 100 KB", h1_ur="تصویر کو 100 KB تک کم کریں",
       intro="Many online forms only accept photos under 100 KB. Add your picture and it is automatically adjusted to fit.",
       intro_ur="بہت سے آن لائن فارمز صرف 100 KB سے کم تصویر قبول کرتے ہیں۔ تصویر شامل کریں، یہ خود بخود حد کے اندر آ جائے گی۔",
       steps=["Add your photo. The 100 KB limit is already selected.", "Need a different limit? Tap 50 KB, 200 KB or 500 KB, or type any number under More settings.", "Download the result and upload it to your form."],
       faq=[("Why is my file slightly under 100 KB, not exactly 100?", "The tool finds the best quality that stays under your limit, so the file is always a little below it. That is what forms check for.")]),
  dict(path="compress-image-to-50kb", nav="Image to 50 KB", tab="img", set=dict(imgFormat="image/jpeg", tgt=True, tgtV=50, rsMode="long", rsLongV=1200),
       title="Compress Image to 50KB Online Free | PocketPress",
       desc="Reduce a photo or signature to under 50 KB for online applications. Quality and size are adjusted automatically. Free, no upload.",
       h1="Compress image to 50 KB", h1_ur="تصویر کو 50 KB تک کم کریں",
       intro="For applications that ask for a photo or signature under 50 KB. Your image is resized and compressed to fit.",
       intro_ur="ان درخواستوں کے لیے جو 50 KB سے کم تصویر یا دستخط مانگتی ہیں۔",
       steps=["Add your image.", "The 50 KB limit is already selected. Tap another size if your form asks for something else.", "Download and upload to your form."],
       faq=[("Can I get it even smaller?", "Yes. Tap 20 KB, or type any number under More settings. Very small limits also reduce the picture's dimensions.")]),
  dict(path="compress-image-to-20kb", nav="Image to 20 KB", tab="img", set=dict(imgFormat="image/jpeg", tgt=True, tgtV=20, rsMode="long", rsLongV=800),
       title="Compress Image to 20KB Online Free | PocketPress",
       desc="Shrink a photo or signature to under 20 KB for strict upload limits. Free, private and instant.",
       h1="Compress image to 20 KB", h1_ur="تصویر کو 20 KB تک کم کریں",
       intro="For the strictest upload limits, usually for signatures and thumb impressions.",
       intro_ur="سخت ترین اپ لوڈ حد کے لیے، عموماً دستخط اور انگوٹھے کے نشان کے لیے۔",
       steps=["Add your image.", "The 20 KB limit is already selected.", "Download the result."],
       faq=[("My signature looks blurry at 20 KB", "Scan it on plain white paper with dark ink and crop close to the signature before adding it. Less empty space means more detail fits in 20 KB.")]),
  dict(path="compress-image-to-200kb", nav="Image to 200 KB", tab="img", set=dict(imgFormat="image/jpeg", tgt=True, tgtV=200, rsMode="long", rsLongV=2000),
       title="Compress Image to 200KB Online Free | PocketPress",
       desc="Reduce a photo or document scan to under 200 KB. Ideal for ID card scans and application documents.",
       h1="Compress image to 200 KB", h1_ur="تصویر کو 200 KB تک کم کریں",
       intro="A good limit for ID card scans, certificates and document photos that still need to be readable.",
       intro_ur="شناختی کارڈ، سرٹیفکیٹ اور دستاویز کی تصاویر کے لیے مناسب حد جو پڑھنے کے قابل رہیں۔",
       steps=["Add your scan or photo.", "The 200 KB limit is already selected.", "Download and upload."],
       faq=[("Will text on my document stay readable?", "Usually yes at 200 KB. Use the Compare button to zoom in and check before you upload.")]),
  dict(path="photo-for-online-form", nav="Photo for forms", tab="img", quick="photo", more=True, 
       title="Resize Photo for Online Form — Under 100KB | PocketPress",
       desc="Resize and compress your photo for job, admission and government application forms. One tap presets for profile photo, signature and ID scans.",
       h1="Photo, signature and ID for online forms", h1_ur="آن لائن فارم کے لیے تصویر، دستخط اور شناختی کارڈ",
       intro="One-tap sizes for the uploads most forms ask for: profile photo, signature and ID card scan.",
       intro_ur="زیادہ تر فارمز کے لیے ایک ٹیپ میں سائز: پروفائل تصویر، دستخط اور شناختی کارڈ اسکین۔",
       steps=["Under More settings, tap the quick size that matches your form: Profile photo, Signature or ID / CNIC scan.", "Add your image.", "Check your form's exact limit, adjust the KB number if needed, then download."],
       faq=[("What size does my form need?", "Every form is different. The quick sizes cover the most common limits, but always read the instructions on your form and change the KB number to match.")]),
  dict(path="resize-image", nav="Resize image", tab="img", set=dict(rsMode="exact", rsW=1080, rsH=1080, rsFit=True),
       title="Resize Image Online Free — Change Width & Height | PocketPress",
       desc="Resize images to exact pixels, by percentage, or limit the longest side. Keep proportions automatically. Free, no upload.",
       h1="Resize images", h1_ur="تصویر کا سائز تبدیل کریں",
       intro="Change a picture's width and height in pixels, by percentage, or by limiting its longest side.",
       intro_ur="تصویر کی چوڑائی اور اونچائی پکسل، فیصد یا لمبی سائیڈ کی حد سے تبدیل کریں۔",
       steps=["Open More settings and choose how to resize under Resize.", "Enter the size you need. Keep proportions stops the picture from stretching.", "Add your images and download."],
       faq=[("Can I resize many photos at once?", "Yes. Add as many as you like and they all use the same settings. Download all gives you one .zip.")]),
  dict(path="heic-to-jpg", nav="HEIC to JPG", tab="img", set=dict(imgFormat="image/jpeg", rsMode="none", imgQ=88),
       title="HEIC to JPG Converter Online Free | PocketPress",
       desc="Convert iPhone HEIC photos to JPG in your browser. Works on Windows and Android. Free, private, no upload.",
       h1="Convert iPhone HEIC to JPG", h1_ur="آئی فون HEIC کو JPG میں تبدیل کریں",
       intro="iPhone photos are saved as HEIC, which many websites and Windows computers cannot open. Turn them into regular JPGs.",
       intro_ur="آئی فون کی تصاویر HEIC میں محفوظ ہوتی ہیں جو بہت سی ویب سائٹس نہیں کھولتیں۔ انہیں عام JPG بنائیں۔",
       steps=["Add your .heic photos.", "They are converted to JPG automatically.", "Download them one by one or all as a .zip."],
       faq=[("Why does the first HEIC photo take longer?", "The converter is loaded only when you add your first HEIC file, so the rest of the site stays fast. After that, each photo converts quickly.")]),
  dict(path="png-to-jpg", nav="PNG to JPG", tab="img", set=dict(imgFormat="image/jpeg", rsMode="none", imgQ=88),
       title="PNG to JPG Converter Online Free | PocketPress",
       desc="Convert PNG images and screenshots to smaller JPG files. Transparent areas become white. Free and private.",
       h1="Convert PNG to JPG", h1_ur="PNG کو JPG میں تبدیل کریں",
       intro="Screenshots and PNG photos are often much larger than they need to be. JPG makes them a fraction of the size.",
       intro_ur="اسکرین شاٹس اور PNG تصاویر اکثر ضرورت سے بڑی ہوتی ہیں۔ JPG انہیں بہت چھوٹا کر دیتا ہے۔",
       steps=["Add your PNG files.", "They are saved as JPG at high quality.", "Download."],
       faq=[("What happens to transparent backgrounds?", "JPG cannot store transparency, so transparent areas become white. Choose WebP or PNG as the output format to keep transparency.")]),
  dict(path="compress-pdf", nav="Compress PDF", tab="pdf", example=False, more=True, 
       title="Compress PDF Online Free — Reduce PDF File Size | PocketPress",
       desc="Reduce PDF file size for email and online forms. Strong mode for scanned documents, light mode keeps text selectable. Free, no upload.",
       h1="Compress PDF", h1_ur="PDF کا سائز کم کریں",
       intro="Make PDFs small enough for email and upload forms. Strong mode works best on scanned documents.",
       intro_ur="PDF کو ای میل اور اپ لوڈ فارمز کے لیے چھوٹا کریں۔ اسکین شدہ دستاویزات پر طاقتور موڈ بہترین ہے۔",
       steps=["Add your PDF.", "Strong mode gives the biggest savings. Turn on Black & white for scanned forms and ID copies.", "Use Light mode instead if you need to keep text selectable. Both are under More settings."],
       faq=[("Why can't I select text after compressing?", "Strong mode redraws each page as an image, which is what makes scans so much smaller. Choose Light mode to keep the text, with smaller savings."),
            ("My PDF is password-protected", "Remove the password first in the app you normally use to open it, then add it here.")]),
  dict(path="merge-pdf", nav="Merge PDF", tab="pdf", spot="#mergePdf", example=False,
       title="Merge PDF Files Online Free — Combine PDFs | PocketPress",
       desc="Combine several PDF files into one document in the order you choose. Free, private, works offline.",
       h1="Merge PDF files", h1_ur="PDF فائلیں جوڑیں",
       intro="Combine several PDFs into one file. Pages are joined in the order the files appear in your list.",
       intro_ur="کئی PDF فائلوں کو ایک فائل میں جوڑیں۔ صفحات فہرست کی ترتیب سے جڑتے ہیں۔",
       steps=["Add two or more PDFs, in the order you want them.", "Press Merge PDFs.", "The merged file appears at the bottom of the list. Download it."],
       faq=[("Can I compress and merge together?", "Yes. Files that have already been compressed are merged using their smaller compressed version.")]),
  dict(path="jpg-to-pdf", nav="JPG to PDF", tab="pdf", spot="#toPdf", more=True, 
       title="JPG to PDF Converter — Combine Images into One PDF | PocketPress",
       desc="Turn photos and scans into a single PDF with A4 or Letter pages. Free, private, no watermark.",
       h1="JPG to PDF", h1_ur="JPG سے PDF",
       intro="Turn photos of documents, receipts or notes into one tidy PDF with A4 pages.",
       intro_ur="دستاویزات، رسیدوں یا نوٹس کی تصاویر سے ایک صاف PDF بنائیں۔",
       steps=["Add your images in the order you want the pages.", "Under More settings → PDF, choose A4, Letter, or page = image size.", "Press Images → one PDF, then download the new PDF at the bottom of the list."],
       faq=[("Is there a watermark?", "No. The PDF contains only your pages.")]),
  dict(path="compress-word", nav="Compress Word", tab="office", example=False,
       title="Compress Word Document (DOCX) Online Free | PocketPress",
       desc="Reduce the size of Word .docx files by compressing the pictures inside. Text and formatting stay the same.",
       h1="Compress Word documents", h1_ur="ورڈ فائل کا سائز کم کریں",
       intro="Large Word files are almost always large because of pictures. Those pictures are compressed, and your text and layout stay exactly as they were.",
       intro_ur="بڑی ورڈ فائلیں عموماً تصاویر کی وجہ سے بڑی ہوتی ہیں۔ تصاویر کمپریس ہوتی ہیں، ٹیکسٹ اور ترتیب ویسی ہی رہتی ہے۔",
       steps=["Add your .docx file.", "For smaller files, pick Smallest, or lower Picture quality under More settings → Office.", "Download and open it in Word as usual."],
       faq=[("Does it work with old .doc files?", "No, only the modern .docx format. Open the .doc in Word and use Save As .docx first.")]),
  dict(path="compress-powerpoint", nav="Compress PowerPoint", tab="office", example=False,
       title="Compress PowerPoint (PPTX) Online Free | PocketPress",
       desc="Shrink PowerPoint .pptx presentations for email by compressing images inside slides. Free and private.",
       h1="Compress PowerPoint presentations", h1_ur="پاورپوائنٹ کا سائز کم کریں",
       intro="Make presentations small enough to email or share on WhatsApp by compressing the pictures on your slides.",
       intro_ur="سلائیڈز کی تصاویر کمپریس کر کے پریزنٹیشن کو ای میل یا واٹس ایپ کے قابل بنائیں۔",
       steps=["Add your .pptx file.", "Pick Smallest for bigger savings.", "Download."],
       faq=[("Are videos inside slides compressed?", "Not yet. Only pictures are compressed. Videos stay as they are.")]),
  dict(path="compress-excel", nav="Compress Excel", tab="office", example=False,
       title="Compress Excel File (XLSX) Online Free | PocketPress",
       desc="Reduce Excel .xlsx file size by compressing embedded pictures and repacking the file. Data and formulas stay untouched.",
       h1="Compress Excel files", h1_ur="ایکسل فائل کا سائز کم کریں",
       intro="Pictures inside the sheet are compressed and the file is repacked. Your data and formulas are not changed.",
       intro_ur="شیٹ کے اندر تصاویر کمپریس ہوتی ہیں اور فائل دوبارہ پیک ہوتی ہے۔ ڈیٹا اور فارمولے نہیں بدلتے۔",
       steps=["Add your .xlsx file.", "Pick a goal. Picture quality is under More settings → Office.", "Download."],
       faq=[("My Excel file has no pictures", "It is still repacked with stronger compression, which sometimes saves a little. Large data-only sheets usually cannot get much smaller.")]),
]

COMMON_FAQ = [
  ("Are my files uploaded anywhere?", "No. Everything happens inside your browser on your own phone or computer. Your files are never sent to a server, so private documents stay private.",
   "کیا میری فائلیں کہیں اپ لوڈ ہوتی ہیں؟", "نہیں۔ سب کچھ آپ کے اپنے فون یا کمپیوٹر کے براؤزر میں ہوتا ہے۔ فائلیں کسی سرور پر نہیں جاتیں۔"),
  ("Is PocketPress free?", "Yes, completely free with no sign-up and no watermark.",
   "کیا یہ مفت ہے؟", "جی ہاں، بالکل مفت۔ نہ سائن اپ، نہ واٹر مارک۔"),
  ("Does it work on my phone?", "Yes. It works in Chrome, Safari, Edge and Firefox on Android, iPhone, Windows and Mac. You can also install it from your browser menu and use it offline.",
   "کیا یہ موبائل پر چلتا ہے؟", "جی ہاں۔ اینڈرائیڈ، آئی فون، ونڈوز اور میک پر چلتا ہے۔ براؤزر مینو سے انسٹال کر کے آف لائن بھی استعمال کر سکتے ہیں۔"),
]

# ----------------------------------------------------------------------------
LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/><rect x="7" y="5" width="18" height="3.2" rx="1.2" fill="var(--accent-ink)"/><rect x="7" y="23.8" width="18" height="3.2" rx="1.2" fill="var(--accent-ink)"/><path d="M10.5 11.5h11v9h-11z" fill="#fff" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 14.5h6M13 17.5h4" stroke="var(--accent-ink)" stroke-width="1.4" stroke-linecap="round"/></svg>'

def e(s): return html.escape(s, quote=True)

def rel_root(path):
    return "./" if path == "" else "../" * (path.count("/") + 1)

def head(title, desc, canon, root, extra=""):
    return f'''<!doctype html>
<html lang="en" data-root="{root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
<meta name="theme-color" content="{THEME}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE_URL}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}assets/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}assets/icon-192.png">
<link rel="manifest" href="{root}manifest.webmanifest">
<link rel="preload" href="{root}assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{root}assets/app.css">
{extra}</head>
<body>
<div class="wrap">
'''

def topbar(root):
    links = "".join(f'<a class="hide-sm" href="{root}{p}/">{n}</a>' for p, n in [("compress-image-to-100kb","Image to 100 KB"),("compress-pdf","Compress PDF"),("jpg-to-pdf","JPG to PDF"),("app","Get the app")])
    return f'''<header class="top">
  <a class="brand" href="{root}">{LOGO}<span dir="ltr">{SITE_NAME}</span></a>
  <nav aria-label="Main">{links}<button class="btn sm primary" type="button" data-install hidden data-i18n="install">Install app</button><button class="btn sm" type="button" data-lang-toggle data-i18n="lang">اردو</button></nav>
</header>
'''

def tools_list(root, current):
    cur = ' aria-current="page"'
    li = "".join(f'<li><a href="{root}{t["path"] + "/" if t["path"] else ""}"{cur if t["path"]==current else ""}>{e(t["nav"])}</a></li>' for t in TOOLS)
    return f'<section class="tools" aria-labelledby="tl"><h2 id="tl">All tools</h2><ul>{li}</ul></section>'

def footer(root):
    contact = f'<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>' if CONTACT_EMAIL else f'<a href="{REPO_URL}/issues">Report a problem</a>'
    return f'''<footer>
  <span>© {datetime.date.today().year} {SITE_NAME} · Your files never leave your device.</span>
  <nav aria-label="Site"><a href="{root}app/">Get the app</a><a href="{root}about/">About</a><a href="{root}privacy/">Privacy</a><a href="{root}terms/">Terms</a>{contact}<a href="{REPO_URL}">Source code</a></nav>
</footer>
</div>
<div class="toast" id="toast" hidden></div>
'''

TOOL_UI = '''
  <div class="grid">
    <aside class="panel" aria-label="Settings">
      <div class="fields">
        <span class="label" data-i18n="goal">Goal</span>
        <div class="seg seg3" id="presets">
          <button type="button" data-preset="small" aria-pressed="false"><span data-i18n="p_small">Smallest</span><small data-i18n="p_small_s">Max shrink</small></button>
          <button type="button" data-preset="balanced" aria-pressed="true"><span data-i18n="p_bal">Balanced</span><small data-i18n="p_bal_s">Recommended</small></button>
          <button type="button" data-preset="quality" aria-pressed="false"><span data-i18n="p_q">Best quality</span><small data-i18n="p_q_s">Light touch</small></button>
        </div>
        <small class="hint" id="customNote" hidden data-i18n="custom_note">Using your own choices from More settings.</small>
      </div>
      <div class="fields">
        <span class="label" data-i18n="limit">Size limit for photos</span>
        <div class="chips" id="limitChips"><button class="chip" type="button" data-kb="0" data-i18n="no_limit">No limit</button><button class="chip" type="button" data-kb="20">20 KB</button><button class="chip" type="button" data-kb="50">50 KB</button><button class="chip" type="button" data-kb="100">100 KB</button><button class="chip" type="button" data-kb="200">200 KB</button><button class="chip" type="button" data-kb="500">500 KB</button><button class="chip" type="button" data-kb="1024">1 MB</button></div>
        <small class="hint" data-i18n="limit_hint">Pick one when a form says "maximum 100 KB".</small>
      </div>
      <details class="more" id="more">
      <summary data-i18n="more">More settings</summary>
      <div class="fields more-body">
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" type="button" aria-selected="true" data-tab="img" id="tab-img" data-i18n="tab_img">Images</button>
        <button class="tab" role="tab" type="button" aria-selected="false" data-tab="pdf" id="tab-pdf" data-i18n="tab_pdf">PDF</button>
        <button class="tab" role="tab" type="button" aria-selected="false" data-tab="office" id="tab-office" data-i18n="tab_office">Office</button>
      </div>

      <div class="fields" data-pane="img">
        <div class="field"><span data-i18n="quick">Quick sizes for forms</span>
          <div class="quick" id="quick">
            <button type="button" data-quick="photo" aria-pressed="false"><span data-i18n="q_photo">Profile photo</span><small data-i18n="q_photo_s">600 px · under 100 KB</small></button>
            <button type="button" data-quick="sign" aria-pressed="false"><span data-i18n="q_sign">Signature</span><small data-i18n="q_sign_s">400×150 · under 50 KB</small></button>
            <button type="button" data-quick="id" aria-pressed="false"><span data-i18n="q_id">ID / CNIC scan</span><small data-i18n="q_id_s">1600 px · under 200 KB</small></button>
            <button type="button" data-quick="chat" aria-pressed="false"><span data-i18n="q_chat">WhatsApp / email</span><small data-i18n="q_chat_s">1600 px · good quality</small></button>
          </div>
          <small data-i18n="q_note">Always check the exact limit your form asks for.</small>
        </div>
        <label class="field"><span data-i18n="fmt">Output format</span>
          <select id="imgFormat">
            <option value="keep" data-i18n="fmt_keep">Same as original</option>
            <option value="image/jpeg" data-i18n="fmt_jpg">JPG (smallest for photos)</option>
            <option value="image/webp" data-i18n="fmt_webp">WebP (modern, very small)</option>
            <option value="image/png" data-i18n="fmt_png">PNG (lossless, transparency)</option>
          </select>
        </label>
        <div class="field"><span data-i18n="quality">Quality</span>
          <div class="row" style="flex-wrap:nowrap"><input type="range" id="imgQ" min="10" max="100" value="78" aria-label="Quality"><span class="rangeval" id="imgQv">78</span></div>
          <small data-i18n="q_hint">Lower is smaller. 70–80 looks the same to most eyes.</small>
        </div>
        <div class="field"><span data-i18n="resize">Resize</span>
          <select id="rsMode" aria-label="Resize mode">
            <option value="none" data-i18n="rs_none">Keep original size</option>
            <option value="long" selected data-i18n="rs_long">Limit longest side</option>
            <option value="pct" data-i18n="rs_pct">Scale by percentage</option>
            <option value="exact" data-i18n="rs_exact">Exact width × height</option>
          </select>
          <div class="row" id="rsLong"><input type="number" id="rsLongV" value="2560" min="16" step="16" aria-label="Longest side in pixels"><small>px</small>
            <div class="chips"><button class="chip" type="button" data-long="1080">1080</button><button class="chip" type="button" data-long="1600">1600</button><button class="chip" type="button" data-long="1920">1920</button><button class="chip" type="button" data-long="2560">2560</button></div>
          </div>
          <div class="row" id="rsPct" hidden><input type="number" id="rsPctV" value="50" min="1" max="100" aria-label="Percent"><small>%</small></div>
          <div class="row" id="rsExact" hidden><input type="number" id="rsW" value="600" min="1" aria-label="Width"><small>×</small><input type="number" id="rsH" value="600" min="1" aria-label="Height"><small>px</small>
            <label class="check" style="width:100%"><input type="checkbox" id="rsFit" checked> <span data-i18n="keep_prop">Keep proportions (fit inside the box)</span></label>
          </div>
        </div>
        <div class="field">
          <label class="check"><input type="checkbox" id="tgtOn"> <span><b data-i18n="tgt">Fit under a file size</b><br><small data-i18n="tgt_s">Type any limit, for example 30 or 150 KB.</small></span></label>
          <div class="row" id="tgtRow" hidden><input type="number" id="tgtV" value="100" min="5" aria-label="Size limit in KB"><small>KB</small></div>
        </div>
        <small class="hint" data-i18n="meta_hint">Photo location data and other hidden metadata are removed automatically.</small>
      </div>

      <div class="fields" data-pane="pdf" hidden>
        <div class="field"><span data-i18n="method">Method</span>
          <div class="seg" id="pdfMode">
            <button type="button" data-mode="strong" aria-pressed="true"><span data-i18n="strong">Strong</span><small data-i18n="strong_s">Best for scans</small></button>
            <button type="button" data-mode="light" aria-pressed="false"><span data-i18n="light">Light</span><small data-i18n="light_s">Keeps text</small></button>
          </div>
          <small id="pdfModeHint"></small>
        </div>
        <label class="field" data-strong><span data-i18n="dpi">Page sharpness</span>
          <select id="pdfDpi">
            <option value="72">72 DPI · screen only, tiny</option>
            <option value="100">100 DPI · readable on phone</option>
            <option value="130" selected>130 DPI · balanced</option>
            <option value="170">170 DPI · good print</option>
            <option value="220">220 DPI · sharp print</option>
          </select>
        </label>
        <div class="field" data-strong><span data-i18n="pdfq">Image quality</span>
          <div class="row" style="flex-wrap:nowrap"><input type="range" id="pdfQ" min="20" max="95" value="68" aria-label="PDF image quality"><span class="rangeval" id="pdfQv">68</span></div>
        </div>
        <label class="check" data-strong><input type="checkbox" id="pdfGray"> <span><span data-i18n="gray">Black &amp; white (grayscale)</span><br><small data-i18n="gray_s">Great for scanned forms, CNIC copies and receipts.</small></span></label>
        <label class="field"><span data-i18n="pg_label">Page size for Images → PDF</span>
          <select id="pageSize"><option value="a4" data-i18n="pg_a4">A4 pages</option><option value="letter" data-i18n="pg_letter">Letter pages</option><option value="fit" data-i18n="pg_fit">Page = image size</option></select>
        </label>
      </div>

      <div class="fields" data-pane="office" hidden>
        <p class="hint" style="margin:0" data-i18n="off_intro">Word (.docx), Excel (.xlsx) and PowerPoint (.pptx) files get smaller by recompressing the pictures inside them. Text and layout stay untouched.</p>
        <div class="field"><span data-i18n="off_q">Picture quality</span>
          <div class="row" style="flex-wrap:nowrap"><input type="range" id="offQ" min="20" max="95" value="72" aria-label="Picture quality"><span class="rangeval" id="offQv">72</span></div>
        </div>
        <label class="field"><span data-i18n="off_max">Shrink pictures larger than</span>
          <div class="row"><input type="number" id="offMax" value="1920" min="320" step="10"><small data-i18n="px_long">px on the longest side</small></div>
        </label>
        <small class="hint" data-i18n="other_hint">Other file types are packed into a compressed .zip.</small>
      </div>

      </div>
      </details>
      <small class="hint" data-i18n="auto_hint">Changes apply to your files straight away.</small>
    </aside>

    <main class="fields" style="gap:14px">
      <label class="drop" id="drop" for="fileIn">
        <strong data-i18n="drop">Drop files here or tap to choose</strong>
        <span class="hint" data-i18n="drop_s">Add as many as you like. You can also paste a screenshot.</span>
        <span class="types"><span class="tag">JPG</span><span class="tag">PNG</span><span class="tag">WEBP</span><span class="tag">HEIC</span><span class="tag">GIF</span><span class="tag">PDF</span><span class="tag">DOCX</span><span class="tag">XLSX</span><span class="tag">PPTX</span><span class="tag">ANY → ZIP</span></span>
        <input type="file" id="fileIn" multiple hidden>
      </label>
      <div class="summary">
        <div><span class="label" data-i18n="files">Files</span><span class="num" id="sCount">0</span></div>
        <div><span class="label" data-i18n="before">Before</span><span class="num" id="sBefore">0 B</span></div>
        <div><span class="label" data-i18n="after">After</span><span class="num" id="sAfter">0 B</span></div>
        <div><span class="label" data-i18n="saved">Saved</span><span class="num good" id="sSaved">0%</span></div>
      </div>
      <div class="toolbar">
        <div class="row">
          <button class="btn" id="saveAll" type="button" disabled data-i18n="save_all">Download all (.zip)</button>
          <button class="btn" id="toPdf" type="button" disabled data-i18n="to_pdf">Images → one PDF</button>
          <button class="btn" id="mergePdf" type="button" disabled data-i18n="merge">Merge PDFs</button>
        </div>
        <button class="btn ghost sm" id="clearAll" type="button" data-i18n="clear">Clear list</button>
      </div>
      <div class="queue" id="queue"></div>
    </main>
  </div>

  <div class="modal" id="modal" hidden role="dialog" aria-modal="true" aria-label="Compare">
    <div class="modal-card">
      <div class="modal-head"><span><b id="cmpInfo"></b> · <span data-i18n="cmp_hint">Drag the slider to compare</span></span><button class="btn sm" type="button" id="cmpClose" data-i18n="close">Close</button></div>
      <div class="cmp" id="cmp"><img id="cmpA" alt="Original"><img id="cmpB" class="over" alt="Compressed"><span class="line"></span><span class="tagl" data-i18n="cmp_orig">Original</span><span class="tagr" data-i18n="cmp_new">Compressed</span></div>
      <input type="range" id="cmpRange" min="0" max="100" value="50" aria-label="Compare position">
    </div>
  </div>
'''

def faq_html(tool):
    rows = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in tool["faq"])
    rows += "".join(f'<details><summary data-ur="{e(qu)}">{e(q)}</summary><p data-ur="{e(au)}">{e(a)}</p></details>' for q, a, qu, au in COMMON_FAQ)
    return rows

def jsonld(tool, canon):
    faqs = [{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q, a in tool["faq"]] + \
           [{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q, a, _, _ in COMMON_FAQ]
    data = [
      {"@context":"https://schema.org","@type":"WebApplication","name":SITE_NAME,"url":canon,"applicationCategory":"UtilitiesApplication",
       "operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":tool["desc"]},
      {"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqs},
      {"@context":"https://schema.org","@type":"HowTo","name":re.sub(r'<[^>]+>','',tool["h1"]),
       "step":[{"@type":"HowToStep","position":i+1,"text":s} for i, s in enumerate(tool["steps"])]},
    ]
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>\n'

def tool_page(tool):
    root = rel_root(tool["path"])
    canon = SITE_URL + "/" + (tool["path"] + "/" if tool["path"] else "")
    cfg = {k: tool[k] for k in ("tab","preset","quick","set","spot","example","more") if k in tool}
    steps = "".join(f"<li>{e(s)}</li>" for s in tool["steps"])
    body = head(tool["title"], tool["desc"], canon, root, jsonld(tool, canon)) + topbar(root) + f'''
  <section class="hero">
    <div>
      <h1 data-ur="{e(tool['h1_ur'])}">{tool['h1']}</h1>
      <p class="sub" data-ur="{e(tool['intro_ur'])}">{e(tool['intro'])}</p>
    </div>
    <div class="privacy"><b>●</b> <span data-i18n="privacy">Your files never leave your device</span></div>
  </section>
''' + TOOL_UI + f'''
  <section class="content">
    <div class="prose"><h2>How to use it</h2><ol>{steps}</ol></div>
    <div class="prose faq"><h2>Questions</h2>{faq_html(tool)}</div>
  </section>
  {tools_list(root, tool["path"])}
''' + footer(root) + f'''<script>window.PP_PAGE={json.dumps(cfg)};</script>
<script src="{root}assets/vendor/jszip.min.js"></script>
<script src="{root}assets/vendor/pdf-lib.min.js"></script>
<script src="{root}assets/app.js"></script>
</body>
</html>
'''
    return body

# ----------------------------------------------------------------------------
# Content pages
# ----------------------------------------------------------------------------
CONTACT_LINE = (f'email <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>' if CONTACT_EMAIL
                else f'open an issue on <a href="{REPO_URL}/issues">GitHub</a>')

PAGES = {
 "about": ("About PocketPress", "PocketPress is a free, private file compressor that runs entirely in your browser.", f'''
<h1>About {SITE_NAME}</h1>
<p>{SITE_NAME} is a free tool for everyday file problems: a photo that is too big for an online form, a scanned PDF that will not attach to an email, a presentation too heavy for WhatsApp.</p>
<p>Most compressor websites upload your files to their servers. {SITE_NAME} does not. Every file is processed inside your own browser, on your own phone or computer, so ID cards, certificates and personal documents never leave your device.</p>
<h2>What it can do</h2>
<ul>
<li>Compress and resize JPG, PNG, WebP, GIF, BMP and iPhone HEIC photos</li>
<li>Fit an image under a size limit such as 20, 50, 100 or 200 KB</li>
<li>Compress, merge and create PDFs</li>
<li>Shrink Word, Excel and PowerPoint files by compressing their pictures</li>
<li>Work offline once installed from your browser menu</li>
</ul>
<h2>Open source</h2>
<p>The full source code is public on <a href="{REPO_URL}">GitHub</a>, so anyone can check that files are never uploaded.</p>
<h2>Contact</h2>
<p>Found a problem or have an idea? Please {CONTACT_LINE}.</p>
'''),
 "app": ("Get the PocketPress App — Windows, Android, iPhone", "Install PocketPress on your phone or computer. Works offline, opens files straight from your gallery or folders, and is free.", f'''
<h1>Get the {SITE_NAME} app</h1>
<p class="sub">Install {SITE_NAME} on your phone or computer and it works like normal software: its own icon, its own window, and it keeps working without internet. It is free, small and updates itself.</p>
<div class="row"><button class="btn primary" type="button" data-install hidden data-i18n="install">Install app</button><span class="hint" id="installedNote" hidden>You are already using the {SITE_NAME} app.</span></div>
<div class="appgrid">
<section class="appcard"><h2>Android</h2><ol>
<li>Open this page in <b>Chrome</b>.</li>
<li>Tap <b>Install app</b> above. If you don't see it, tap the <b>⋮</b> menu, then <b>Install app</b> or <b>Add to Home screen</b>.</li>
<li>Open {SITE_NAME} from your home screen.</li></ol>
<p class="hint">Tip: in your Gallery or Files app, tap <b>Share</b> on any photo or PDF and choose <b>{SITE_NAME}</b> to compress it straight away.</p></section>
<section class="appcard" id="iphone"><h2>iPhone and iPad</h2><ol>
<li>Open this page in <b>Safari</b>.</li>
<li>Tap the <b>Share</b> button (the square with an arrow pointing up).</li>
<li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>
<p class="hint">Apple only allows this from Safari, not Chrome.</p></section>
<section class="appcard"><h2>Windows and Mac</h2><ol>
<li>Open this page in <b>Chrome</b> or <b>Microsoft Edge</b>.</li>
<li>Click <b>Install app</b> above, or the install icon at the right end of the address bar.</li>
<li>{SITE_NAME} gets its own window and a desktop or Start menu icon.</li></ol>
<p class="hint">After installing, right-click a photo or PDF and choose <b>Open with → {SITE_NAME}</b>.</p></section>
</div>
<h2>Why install?</h2>
<ul>
<li><b>Works offline.</b> Compress files with no internet connection.</li>
<li><b>One tap away.</b> No searching for the website every time.</li>
<li><b>Still private.</b> Files are processed on your device, exactly like the website.</li>
<li><b>Always up to date.</b> New features arrive automatically, nothing to download again.</li>
</ul>
<p><a class="btn" href="{BASE_PATH}">Open {SITE_NAME} now</a></p>
'''),
 "privacy": ("Privacy Policy — PocketPress", "PocketPress processes files only on your device. We never receive, store or see your files.", f'''
<h1>Privacy Policy</h1>
<p><b>Last updated:</b> {TODAY}</p>
<h2>Your files</h2>
<p>Files you add to {SITE_NAME} are processed entirely inside your web browser on your own device. They are never uploaded, sent to a server, stored by us, or seen by anyone else. When you close the page, they are gone from {SITE_NAME}.</p>
<h2>Information we collect</h2>
<p>{SITE_NAME} has no accounts and no sign-up. We do not collect your name, email address or any personal details.</p>
<p>Our hosting provider may keep standard technical logs, such as IP addresses and the pages requested, for security and reliability. These logs never contain your files.</p>
<p>If we add privacy-friendly visitor statistics in the future, they will count page visits only, without cookies that track you across websites, and this policy will be updated.</p>
<h2>Saved preferences</h2>
<p>Your language choice is saved in your browser's local storage so the site remembers it. It never leaves your device and you can clear it at any time in your browser settings.</p>
<h2>Advertising</h2>
<p>{SITE_NAME} currently shows no ads. If ads are added later, the advertising provider may use cookies, and this policy will explain how and how to opt out before that happens.</p>
<h2>Children</h2>
<p>{SITE_NAME} does not knowingly collect any information from anyone, including children.</p>
<h2>Changes</h2>
<p>If this policy changes, the new version will be posted on this page with a new date.</p>
<h2>Contact</h2>
<p>Questions about privacy? Please {CONTACT_LINE}.</p>
'''),
 "terms": ("Terms of Use — PocketPress", "The terms for using PocketPress, a free browser-based file compressor.", f'''
<h1>Terms of Use</h1>
<p><b>Last updated:</b> {TODAY}</p>
<h2>Using the service</h2>
<p>{SITE_NAME} is free to use for personal and commercial purposes. You may only process files that you own or have the right to use.</p>
<h2>No warranty</h2>
<p>{SITE_NAME} is provided "as is". We work hard to make it reliable, but we cannot guarantee that every file will compress, that results will meet a particular form's requirements, or that the service will always be available. Always keep your original files and check results before submitting them anywhere important.</p>
<h2>Limitation of liability</h2>
<p>To the extent allowed by law, {SITE_NAME} and its creators are not liable for any loss or damage arising from use of the service, including lost or altered files.</p>
<h2>Prohibited use</h2>
<p>Do not use {SITE_NAME} to process illegal content or to infringe anyone's rights.</p>
<h2>Changes</h2>
<p>These terms may be updated from time to time. Continued use after a change means you accept the new terms.</p>
<h2>Contact</h2>
<p>Please {CONTACT_LINE}.</p>
'''),
}

def content_page(slug, title, desc, body, root=None, canon=None):
    root = root or rel_root(slug)
    canon = canon or f"{SITE_URL}/{slug}/"
    return head(title, desc, canon, root) + topbar(root) + f'<article class="doc">{body}</article>\n  {tools_list(root, None)}\n' + footer(root) + f'<script src="{root}assets/app.js"></script>\n</body>\n</html>\n'

# ----------------------------------------------------------------------------
def write(rel, text):
    p = ROOT_DIR / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")

def main():
    for tl in TOOLS:
        write((tl["path"] + "/index.html") if tl["path"] else "index.html", tool_page(tl))
    for slug, (title, desc, body) in PAGES.items():
        write(f"{slug}/index.html", content_page(slug, title, desc, body))
    write("404.html", content_page("404", "Page not found — PocketPress", "This page does not exist.",
          f'<h1>Page not found</h1><p>That page does not exist. <a href="{BASE_PATH}">Go to {SITE_NAME}</a> or pick a tool below.</p>',
          root=BASE_PATH, canon=SITE_URL + "/"))

    urls = [SITE_URL + "/" + (t["path"] + "/" if t["path"] else "") for t in TOOLS] + [f"{SITE_URL}/{s}/" for s in PAGES]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n")
    write("manifest.webmanifest", json.dumps({
        "name": SITE_NAME, "short_name": SITE_NAME, "description": "Compress images, PDFs and Office files privately on your device.",
        "id": "./", "start_url": "./", "scope": "./", "display": "standalone", "lang": "en", "categories": ["utilities", "productivity"],
        "shortcuts": [{"name": "Compress image to 100 KB", "url": "compress-image-to-100kb/"}, {"name": "Compress PDF", "url": "compress-pdf/"}, {"name": "JPG to PDF", "url": "jpg-to-pdf/"}],
        "share_target": {"action": "share-target/", "method": "POST", "enctype": "multipart/form-data",
                         "params": {"files": [{"name": "files", "accept": ["image/*", "application/pdf", ".pdf", ".docx", ".xlsx", ".pptx",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "application/vnd.openxmlformats-officedocument.presentationml.presentation"]}]}},
        "file_handlers": [{"action": "./", "accept": {
            "image/jpeg": [".jpg", ".jpeg", ".jfif"], "image/png": [".png"], "image/webp": [".webp"], "image/gif": [".gif"], "image/bmp": [".bmp"], "image/heic": [".heic", ".heif"],
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"]}}],
        "launch_handler": {"client_mode": "focus-existing"},
        "screenshots": [{"src": "assets/screen-wide.jpg", "sizes": "1280x800", "type": "image/jpeg", "form_factor": "wide", "label": "PocketPress on a computer"},
                        {"src": "assets/screen-narrow.jpg", "sizes": "780x1688", "type": "image/jpeg", "form_factor": "narrow", "label": "PocketPress on a phone"}], "background_color": "#F2F4F8", "theme_color": THEME,
        "icons": [{"src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png"},
                  {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=2))

    # Service worker: version changes whenever any asset changes, so visitors get updates.
    core = ["./", "assets/app.css", "assets/app.js", "assets/icon.svg", "manifest.webmanifest",
            "assets/example-coffee.jpg", "assets/vendor/jszip.min.js", "assets/vendor/pdf-lib.min.js", "assets/vendor/pdf.min.js", "assets/vendor/pdf.worker.min.js",
            "assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2", "assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2",
            "assets/fonts/bricolage-grotesque-latin-800-normal.woff2", "assets/fonts/bricolage-grotesque-latin-600-normal.woff2",
            "assets/fonts/jetbrains-mono-latin-400-normal.woff2", "assets/fonts/jetbrains-mono-latin-600-normal.woff2"]
    core += [t["path"] + "/" for t in TOOLS if t["path"]] + [s + "/" for s in PAGES]
    h = hashlib.sha1()
    for c in core[1:]:
        f = ROOT_DIR / c
        h.update((f / "index.html" if c.endswith("/") else f).read_bytes())
    write("sw.js", f'''/* PocketPress offline support — generated by build.py */
const CACHE = "pp-{h.hexdigest()[:10]}";
const CORE = {json.dumps(core)};
self.addEventListener("install", e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", e => {{
  const req = e.request, url = new URL(req.url);
  /* Android "Share to PocketPress": keep the shared files briefly, then open the app */
  if (req.method === "POST" && url.pathname.endsWith("/share-target/")) {{
    e.respondWith((async () => {{
      const fd = await req.formData(); const files = fd.getAll("files").filter(f => typeof f !== "string");
      await caches.delete("pp-share"); const c = await caches.open("pp-share");
      for (let i = 0; i < files.length; i++) {{
        await c.put(new Request("shared/" + i), new Response(files[i], {{ headers: {{ "content-type": files[i].type || "application/octet-stream", "x-name": encodeURIComponent(files[i].name || ("shared-" + i)) }} }}));
      }}
      return Response.redirect("./?shared=" + files.length, 303);
    }})());
    return;
  }}
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {{
    e.respondWith(fetch(req).then(r => {{ const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }})
      .catch(() => caches.match(req, {{ ignoreSearch: true }}).then(r => r || caches.match("./"))));
    return;
  }}
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {{ if (res.ok) {{ const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); }} return res; }})));
}});
''')
    print(f"Built {len(TOOLS)} tool pages, {len(PAGES)} content pages, sitemap with {len(urls)} URLs.")

if __name__ == "__main__":
    main()
