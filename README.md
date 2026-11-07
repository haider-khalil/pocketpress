# PocketPress

**Free, private file compressor that runs entirely in the browser.** Images, PDFs and Office files are processed on the visitor's own device and are never uploaded to any server.

Live site: https://haider-khalil.github.io/pocketpress/

## What it does

| Tool | Details |
|---|---|
| Compress images | JPG, PNG, WebP, GIF, BMP, iPhone HEIC. Quality slider, strips photo location metadata |
| Fit under a size limit | 20 / 50 / 100 / 200 / 500 KB / 1 MB or any number; quality and dimensions adjusted automatically |
| Quick sizes for forms | Profile photo, signature, ID / CNIC scan, WhatsApp / email |
| Resize & convert | Longest side, percentage or exact width × height; output JPG, WebP or PNG |
| Compress PDF | **Strong** (pages redrawn as images, best for scans, optional black & white) or **Light** (keeps text) |
| Merge PDF, JPG → PDF | Combine PDFs, or turn photos into one PDF with A4 / Letter pages |
| Word, Excel, PowerPoint | Recompresses pictures inside .docx / .xlsx / .pptx; text and layout untouched |
| Anything else | Packed into a compressed .zip |
| Simple screen | Pick a goal (Smallest / Balanced / Best quality) and an optional size limit; everything else is under **More settings**. Changes apply straight away |
| Installable app | **Install app** button (Android, Windows, Mac) and iPhone steps on the `app/` page. Works offline, opens with its own icon and window |
| Open files from outside | Android: Share a photo or PDF from the Gallery to PocketPress. Windows/Mac: right-click a file → Open with → PocketPress |
| Extras | Before/after compare slider, Download all as .zip, Share on mobile, English / اردو |

## Project layout

```
build.py               ← generates all pages; edit settings + page texts here
assets/app.js          ← all the tool logic
assets/app.css         ← all the styles
assets/vendor/         ← JSZip, pdf-lib, pdf.js, heic2any (served locally, no CDN)
assets/fonts/          ← self-hosted fonts (no Google requests)
index.html, */index.html, sitemap.xml, robots.txt, sw.js, manifest.webmanifest  ← generated
```

Every tool page (`compress-image-to-100kb/`, `compress-pdf/`, …) is the same tool opened with different starting settings and its own title, description and FAQ. Separate pages help each one rank on Google for its own search.

## Making changes

1. Edit `build.py` (page texts, settings), `assets/app.js` or `assets/app.css`.
2. Run `python3 build.py` (Python 3.8+, no packages needed).
3. Commit and push. GitHub Pages updates within a minute or two.

To try it locally: `python3 -m http.server` in the folder above this one, then open `http://localhost:8000/pocketpress/`.

### Adding a new tool page

Add an entry to the `TOOLS` list in `build.py`, for example:

```python
dict(path="compress-image-to-30kb", nav="Image to 30 KB", tab="img",
     set=dict(imgFormat="image/jpeg", tgt=True, tgtV=30, rsMode="long", rsLongV=1000),
     title="Compress Image to 30KB Online Free | PocketPress",
     desc="…", h1="Compress image to 30 KB", h1_ur="…", intro="…", intro_ur="…",
     steps=["…"], faq=[("…", "…")]),
```

Then run `python3 build.py`.

## Connecting your own domain

1. Buy a domain (e.g. `pocketpress.pk` from PKNIC or a reseller, or a `.com` from Namecheap / Cloudflare).
2. In this repo: **Settings → Pages → Custom domain**, enter it, and follow GitHub's DNS instructions.
3. In `build.py` set `SITE_URL = "https://yourdomain"` and `BASE_PATH = "/"`, run `python3 build.py`, commit and push.
4. Add the site to [Google Search Console](https://search.google.com/search-console) and submit `sitemap.xml`.

## Example photo

The coffee photo shown on first visit (`assets/example-coffee.jpg`) is by Rachel Michetti, courtesy of Pikolo Espresso Bar, released under CC0 (no copyright restrictions). It ships with the scikit-image project. To use your own, replace that file with any JPG and run `python3 build.py`.

## Licenses

PocketPress code: MIT (see `LICENSE`). Bundled libraries keep their own licenses: JSZip (MIT), pdf-lib (MIT), pdf.js (Apache-2.0), heic2any (MIT). Fonts: SIL Open Font License (see `assets/fonts/`).
