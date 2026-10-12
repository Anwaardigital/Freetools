#!/usr/bin/env python3
"""Generates index.html + 50 tool pages + sitemap for Free Privacy Tools."""
import os, html

BASE = os.path.expanduser('~/workspace/freetools')
SITE = 'https://freetools.example.com'  # replace with real domain

TOOLS = [
 # slug, name, category, icon, description
 ("pdf-merger","PDF Merger","PDF Tools","📄","Combine multiple PDF files into one document, in any order you choose."),
 ("pdf-splitter","PDF Splitter","PDF Tools","✂️","Extract specific pages or page ranges from any PDF file."),
 ("pdf-compressor","PDF Compressor","PDF Tools","🗜️","Shrink PDF file size with object-stream rebuilding, right in your browser."),
 ("pdf-to-text","PDF to Text","PDF Tools","📝","Extract all text content from PDF files instantly."),
 ("images-to-pdf","Images to PDF","PDF Tools","🖼️","Convert JPG and PNG images into a single PDF document."),
 ("image-compressor","Image Compressor","Image Tools","🗜️","Reduce image file size with adjustable quality — JPG and WebP output."),
 ("image-resizer","Image Resizer","Image Tools","📐","Resize images to exact pixel dimensions with aspect-ratio lock."),
 ("image-converter","Image Converter","Image Tools","🔄","Convert images between PNG, JPG, WebP and BMP formats."),
 ("background-remover","Background Remover","Image Tools","🧽","Remove white or light backgrounds from logos and product photos."),
 ("image-cropper","Image Cropper","Image Tools","✂️","Crop images to any rectangular region you choose."),
 ("image-rotator","Image Rotator","Image Tools","🔃","Rotate images 90°/180° or flip horizontally and vertically."),
 ("grayscale-filter","Photo Filters","Image Tools","🎨","Apply grayscale, sepia, invert, vintage and blur filters to photos."),
 ("qr-generator","QR Code Generator","Image Tools","🔳","Create custom QR codes from any text or URL, any size."),
 ("qr-reader","QR Code Reader","Image Tools","📷","Scan and decode QR codes from uploaded images."),
 ("favicon-generator","Favicon Generator","Image Tools","⭐","Generate favicon PNGs in 16, 32, 48 and 180px from any image."),
 ("word-counter","Word Counter","Text Tools","🔢","Count words, characters, sentences and reading time in real time."),
 ("character-counter","Character Counter","Text Tools","🔤","Live character, line and whitespace-free counts."),
 ("case-converter","Text Case Converter","Text Tools","🔠","Convert text to UPPERCASE, lowercase, Title Case and more."),
 ("remove-duplicates","Remove Duplicate Lines","Text Tools","🧹","Delete duplicate lines, sort and clean up lists instantly."),
 ("lorem-ipsum","Lorem Ipsum Generator","Text Tools","📜","Generate placeholder paragraphs, sentences or words for designs."),
 ("text-reverser","Text Reverser","Text Tools","↩️","Reverse text, words or line order with one click."),
 ("whitespace-remover","Whitespace Remover","Text Tools","␣","Clean extra spaces, blank lines and messy formatting."),
 ("base64","Base64 Encoder / Decoder","Text Tools","🔐","Encode text to Base64 or decode Base64 back to text."),
 ("url-encoder","URL Encoder / Decoder","Text Tools","🔗","Percent-encode URLs or decode them back to readable text."),
 ("json-formatter","JSON Formatter","Text Tools","🧾","Beautify, minify and validate JSON data."),
 ("age-calculator","Age Calculator","Calculators","🎂","Calculate exact age in years, months, days — plus total days lived."),
 ("bmi-calculator","BMI Calculator","Calculators","⚖️","Compute Body Mass Index and see your health category."),
 ("loan-calculator","Loan / EMI Calculator","Calculators","🏦","Calculate monthly loan payments, total interest and total payable."),
 ("percentage-calculator","Percentage Calculator","Calculators","💯","Solve any percentage problem: of, change, increase, decrease."),
 ("tip-calculator","Tip Calculator","Calculators","💵","Split bills and calculate tips per person."),
 ("discount-calculator","Discount Calculator","Calculators","🏷️","See sale prices and exactly how much you save."),
 ("currency-converter","Currency Converter","Calculators","💱","Convert between 12 world currencies with indicative rates."),
 ("unit-converter","Unit Converter","Calculators","📏","Convert length, weight, temperature, volume, speed and data units."),
 ("timezone-converter","Time Zone Converter","Calculators","🌍","Convert date & time between world time zones."),
 ("date-duration","Date Duration Calculator","Calculators","📅","Days, weeks and months between any two dates."),
 ("password-generator","Password Generator","Security Tools","🔑","Create strong cryptographically-random passwords."),
 ("hash-generator","Hash Generator","Security Tools","#️⃣","Generate SHA-256 hashes of any text, locally."),
 ("random-number","Random Number Generator","Security Tools","🎰","Secure random numbers in any range, with unique option."),
 ("coin-flip","Coin Flip","Security Tools","🪙","Flip a virtual coin — heads or tails with live stats."),
 ("dice-roller","Dice Roller","Security Tools","🎲","Roll any number of dice with any number of sides."),
 ("color-picker","Color Picker","Color Tools","🎨","Pick colors and get instant HEX + RGB values."),
 ("hex-to-rgb","HEX to RGB Converter","Color Tools","🌈","Convert HEX colors to RGB and back."),
 ("random-color","Random Color Palette","Color Tools","🖌️","Generate beautiful random color palettes, click to copy."),
 ("gradient-generator","Gradient Generator","Color Tools","🌅","Design CSS gradients with live preview and copy-ready code."),
 ("contrast-checker","Contrast Checker","Color Tools","👁️","Check WCAG text contrast ratios for accessibility."),
 ("html-encoder","HTML Encoder","Developer Tools","💻","Encode or decode HTML entities safely."),
 ("css-minifier","CSS Minifier","Developer Tools","📦","Minify or beautify CSS stylesheets."),
 ("js-minifier","JS Minifier","Developer Tools","⚡","Basic JavaScript minifier for smaller files."),
 ("uuid-generator","UUID Generator","Developer Tools","🆔","Generate version-4 UUIDs in bulk."),
 ("timestamp-converter","Timestamp Converter","Developer Tools","⏱️","Convert Unix timestamps to dates and back."),
 ("link-shortener","Link Shortener","Developer Tools","🔗","Shorten long URLs into compact, shareable links instantly."),
]

HOWTO = {
 "default": ["Open the tool — nothing to install, it runs in your browser.",
             "Enter your input or upload your file.",
             "Click the action button and download or copy the result."],
}
FAQ_DEFAULT = [
 ("Is it really free?", "Yes — every tool on this site is 100% free with no limits, no signup and no watermarks."),
 ("Is my data private?", "Absolutely. All processing happens locally in your browser. Your files are never uploaded to any server."),
]

CAT_ORDER = ["PDF Tools","Image Tools","Text Tools","Calculators","Security Tools","Color Tools","Developer Tools"]

HEADER = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<link rel="stylesheet" href="__ROOT__assets/style.css">
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="logo" href="__ROOT__index.html"><span class="shield">🛡️</span> Free Privacy Tools</a>
<button id="langToggle" class="lang-toggle" title="Switch language">اردو</button>
<nav class="nav"><a href="__ROOT__index.html" data-i18n="navHome">Home</a><a href="__ROOT__index.html#tools" data-i18n="navTools">All Tools</a><a href="__ROOT__privacy.html" data-i18n="navPrivacy">Privacy</a></nav>
</div></header>
"""

FOOTER = """<footer class="site-footer"><div class="wrap">
<div class="cols">
<div><h4>🛡️ Free Privacy Tools</h4><p data-i18n="footTag">50+ free online tools. No signup, no tracking — everything runs in your browser.</p></div>
<div><h4 data-i18n="footPopular">Popular</h4>__POPULAR__</div>
<div><h4 data-i18n="footSite">Site</h4><a href="__ROOT__index.html" data-i18n="navHome">Home</a><a href="__ROOT__index.html#tools" data-i18n="navTools">All Tools</a><a href="__ROOT__privacy.html" data-i18n="navPrivacy">Privacy Policy</a></div>
</div>
<div class="foot-note">© 2026 Free Privacy Tools — All tools run 100% in your browser.</div>
</div></footer>
<script src="__ROOT__assets/app.js"></script>
<script src="__ROOT__assets/features.js"></script>
<script src="__ROOT__assets/muft.js"></script>
__EXTRA__
</body></html>"""

TOOL_PAGE = HEADER + """
<main class="wrap">
<div class="crumbs"><a href="__ROOT__index.html">Home</a> / __CAT__ / __NAME__</div>
<div class="tool-hero"><h1>__ICON__ __NAME__</h1><p>__DESC__ Free, unlimited, private — works entirely in your browser.</p></div>
<div class="ad-slot">Advertisement — Google AdSense code goes here</div>
<div class="tool-box" id="tool-root" data-tool="__SLUG__"></div>
<div class="howto"><h2>How to use</h2><ol>__HOWTO__</ol></div>
<div class="faq"><h2>FAQ</h2>__FAQ__</div>
<div class="related"><h2>Related tools</h2><div class="grid">__RELATED__</div></div>
</div>
</main>
""" + FOOTER

def esc(s): return html.escape(s, quote=True)

def build():
    os.makedirs(os.path.join(BASE,'tools'), exist_ok=True)
    popular = "".join('<a href="%stools/%s.html">%s</a>' % ('__ROOT__', s, esc(n)) for s,n,_,_,_ in
                      [TOOLS[5],TOOLS[15],TOOLS[35],TOOLS[0],TOOLS[25]])
    # ---- tool pages ----
    for slug,name,cat,icon,desc in TOOLS:
        rel = [t for t in TOOLS if t[2]==cat and t[0]!=slug][:3]
        if len(rel)<3: rel += [t for t in TOOLS if t[2]!=cat][:3-len(rel)]
        rel_html = "".join(
            '<a class="tool-card" href="./%s.html"><div class="ticon">%s</div><h3>%s</h3><p>%s</p></a>'
            % (s2, ic2, esc(n2), esc(d2)) for s2,n2,_,ic2,d2 in rel)
        howto = "".join("<li>%s</li>" % esc(x) for x in HOWTO["default"])
        faq = "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(q), esc(a)) for q,a in FAQ_DEFAULT)
        extra = '<script src="../assets/tools.js"></script>'
        page = TOOL_PAGE.replace('__TITLE__', esc(name)+' — Free Online Tool | Free Privacy Tools')\
            .replace('__DESC__', esc(desc))\
            .replace('__ROOT__', '../').replace('__NAME__', esc(name))\
            .replace('__CAT__', esc(cat)).replace('__ICON__', icon)\
            .replace('__SLUG__', slug).replace('__HOWTO__', howto)\
            .replace('__FAQ__', faq).replace('__RELATED__', rel_html)\
            .replace('__POPULAR__', popular.replace('__ROOT__tools/', './'))\
            .replace('__EXTRA__', extra)
        with open(os.path.join(BASE,'tools',slug+'.html'),'w') as f: f.write(page)

    # ---- index ----
    cats_html = ""
    for cat in CAT_ORDER:
        cards = "".join(
            '<a class="tool-card" href="tools/%s.html" data-cat="%s" data-search="%s"><div class="ticon">%s</div><h3>%s</h3><p>%s</p><span class="cat-tag">%s</span></a>'
            % (s, esc(cat), esc((n+' '+d+' '+cat).lower()), ic, esc(n), esc(d), esc(cat))
            for s,n,c,ic,d in TOOLS if c==cat)
        cats_html += '<div class="section" data-cat-section="%s" style="padding-top:10px"><h2>%s</h2><p class="sub">%d free tools</p><div class="grid">%s</div></div>' % (esc(cat), esc(cat), cards.count('tool-card'), cards)
    index = HEADER.replace('__TITLE__','Free Privacy Tools — 50+ Free Online Tools, No Signup')\
        .replace('__DESC__','50+ free online PDF, image, text, calculator, security, color and developer tools. No signup, no tracking — everything runs in your browser.')\
        .replace('__ROOT__','./') + """
<main>
<div class="hero"><div class="wrap">
<h1 data-i18n="heroTitle">50+ Free Online Tools</h1>
<p data-i18n="heroSub">PDF, image, text, calculators, security, color & developer tools — free forever. No signup. No tracking. Everything runs privately in your browser.</p>
<div class="badges"><span class="badge">✅ 100% Free</span><span class="badge">🔒 Private by design</span><span class="badge">⚡ No signup</span><span class="badge">📱 Mobile friendly</span></div>
<div class="searchbar"><span class="icon">🔍</span><input id="toolSearch" type="text" data-i18n-ph="searchPh" placeholder="Search 51 tools... e.g. pdf, qr, password"></div>
</div></div>
<div class="wrap"><div class="section featured-sec">
<h2 data-i18n="featuredTitle">Featured Tools</h2>
<p class="sub" data-i18n="featuredSub">Our most-loved tools — picked for you</p>
<div class="carousel-wrap">
<button class="car-btn" id="carPrev" aria-label="Previous">‹</button>
<div class="carousel" id="featCarousel"></div>
<button class="car-btn" id="carNext" aria-label="Next">›</button>
</div>
</div></div>
<div class="wrap" id="tools">
<div class="ad-slot">Advertisement — Google AdSense code goes here</div>
""" + cats_html + """
<p id="noResults" style="display:none;text-align:center;color:#64748b;padding:30px" data-i18n="noResults">No tools found. Try another keyword.</p>
<div class="ad-slot">Advertisement — Google AdSense code goes here</div>
</div></main>
""" + FOOTER.replace('__ROOT__','./').replace('__POPULAR__', popular.replace('__ROOT__','./')).replace('__EXTRA__','')
    with open(os.path.join(BASE,'index.html'),'w') as f: f.write(index)

    # ---- privacy ----
    priv = HEADER.replace('__TITLE__','Privacy Policy | Free Privacy Tools')\
        .replace('__DESC__','Privacy policy: all tools run locally in your browser. No uploads, no tracking.')\
        .replace('__ROOT__','./') + """
<main class="wrap"><div class="tool-hero"><h1>Privacy Policy</h1></div>
<div class="tool-box">
<p><b>Your files never leave your device.</b> Every tool on Free Privacy Tools runs 100% in your browser using JavaScript. We do not upload, store, or see your files.</p>
<p><b>No accounts.</b> There is no signup, login, or user tracking.</p>
<p><b>Advertising.</b> We may display ads via Google AdSense to keep the site free. Ad providers may use cookies per their own policies.</p>
<p><b>Contact.</b> For questions, reach us via the site footer links.</p>
</div></main>
""" + FOOTER.replace('__ROOT__','./').replace('__POPULAR__', popular.replace('__ROOT__','./')).replace('__EXTRA__','')
    with open(os.path.join(BASE,'privacy.html'),'w') as f: f.write(priv)

    # ---- sitemap + robots ----
    urls = [SITE+'/'] + [SITE+'/tools/%s.html'%s for s,_,_,_,_ in TOOLS] + [SITE+'/privacy.html']
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
         "".join('<url><loc>%s</loc><changefreq>monthly</changefreq></url>\n' % u for u in urls) + '</urlset>'
    with open(os.path.join(BASE,'sitemap.xml'),'w') as f: f.write(sm)
    with open(os.path.join(BASE,'robots.txt'),'w') as f: f.write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % SITE)
    print('Built: index.html, privacy.html, %d tool pages, sitemap.xml, robots.txt' % len(TOOLS))

if __name__ == '__main__':
    build()
