/* ============================================================================
   FREETOOLS 9-LANGUAGE SYSTEM (i18n9.js) — ASSISTANT TRANSLATIONS, NOT
   PROFESSIONALLY REVIEWED. See the confidence notes at the end of this file.
   ----------------------------------------------------------------------------
   WIRING SPEC FOR THE COORDINATOR (read before hooking this file in):
   1. SCRIPT TAG ORDER (do not change the order of the existing tags):
      Homepage (index.html), AFTER the existing tags, in this order:
        <script src="./assets/app.js"></script>
        <script src="./assets/features.js"></script>
        <script src="./assets/muft63.js"></script>
        <script src="./assets/i18n9.js"></script>
      Tool pages (tools/*.html), AFTER the existing tags, in this order:
        <script src="../assets/app.js"></script>
        <script src="../assets/tools.js"></script>
        <script src="../assets/features.js"></script>
        <script src="../assets/i18n9.js"></script>
      Rationale: i18n9 must run LAST. features.js builds the dark-mode button,
      the favorites/recent sections, the category chips and the tool-page
      action row; muft63.js builds the featured carousel. All of those run on
      DOMContentLoaded in script-registration order, so i18n9 (registered
      last) translates the finished DOM instead of text that is later
      overwritten. Nothing in i18n9 depends on muft63.js, so if muft63.js is
      ever removed, i18n9 still works on its own (carousel simply disappears).
   2. CHOICE: EXTEND, do NOT replace muft63.js. (Coordinator note: features.js WAS edited for the user-ordered header dark button + share-label fix; i18n9 still runs last.)
      - muft63.js keeps doing the featured carousel (its carousel code is
        untouched and still needed). Its old 2-language toggle is neutralised
        by i18n9, not by editing muft63.js: i18n9 hides the legacy
        #langToggle button (display:none) and inserts its own switcher, so
        the old EN/UR click handler can never fire. The old setLang() still
        runs once at load, but i18n9 re-applies the full 9-language state
        immediately afterwards, so the final visible state is always i18n9's.
      - The same localStorage key is reused: "fpt_lang". Old values "en"
        and "ur" (stored JSON-encoded, e.g. "\"ur\"") are valid in i18n9;
        any other stored value falls back to "en". No migration step needed.
      - The same element contract is reused: [data-i18n] for text and
        [data-i18n-ph] for placeholders. Every key muft63.js used still
        exists in i18n9 with the same meaning, so existing homepage markup
        needs zero edits to be translated in all 9 languages.
      - i18n9 additionally honours [data-i18n-title]: elements carrying it
        get their title and aria-label set from the dictionary. Use it for
        icon-only buttons (dark-mode toggle, search button, WhatsApp float).
   3. THE SWITCHER (built by i18n9, no HTML edit required):
      i18n9 inserts a button + dropdown into the header (.site-header .wrap),
      before the .nav-toggle button when one exists, otherwise at the end of
      the header wrap. The button shows the current language in its own
      native name (English, اردو, Türkçe, العربية, فارسی, Español, Italiano,
      Deutsch, Nederlands). The dropdown lists all 9 languages. It closes on
      outside click and on Escape. Basic dropdown CSS is injected by i18n9
      itself (a <style> element), so no stylesheet edit is required; the
      coordinator may restyle .lang9-wrap / .lang9-btn / .lang9-menu later.
      Language choice persists in localStorage ("fpt_lang") and is applied
      on every page load. document.documentElement.lang is set to the code
      (en, ur, tr, ar, fa, es, it, de, nl) and dir is "rtl" for Urdu, Arabic
      and Farsi, "ltr" otherwise. The existing stylesheet already flips the
      floating dark-mode button for [dir=rtl]; other RTL layout relies on
      the browser's direction handling plus the site's existing CSS.
   4. WHY SEARCH / FAVORITES / RECENT / FILTERS / COUNTER / SHARE /
      NEWSLETTER / DARK MODE STAY SAFE:
      - Search (features.js applyFilter + app.js live search) matches only
        the English data-search attribute and the English data-cat
        attribute. i18n9 NEVER writes to data-search or data-cat; it only
        changes visible text (h3, p, .cat-tag, chips, section headings).
        Search therefore keeps working exactly as before, in English
        keywords, in every language. Translated search keywords are PHASE 2
        (see the end of this file).
      - Favorites (fpt_favs) and recently used (fpt_recent) store tool
        SLUGS, not display text, so translating a card title can never
        break a saved favorite or a recent entry. The favorites/recent
        sections are clones of .tool-card elements, so i18n9's card pass
        translates them automatically.
      - The usage counter (fpt_usage) is a number. i18n9 only re-renders
        its badge text from the stored number using the current language's
        template; it never writes the counter.
      - Share: features.js builds share links from location.href and
        document.title. i18n9 does not change URLs or document.title; it
        only translates the visible "Share" label and the share buttons'
        title/aria-label text. Shared links are unchanged.
      - Newsletter: features.js validates the email and stores it locally.
        i18n9 only translates the form's visible labels, placeholder and
        success message (via the existing data-i18n keys). No form logic
        is touched.
      - Dark mode: features.js owns the toggle button and the body.dark
        class. i18n9 only sets that button's title/aria-label from the
        dictionary when the button exists; it never toggles the class.
        If the button is not present yet when i18n9 applies, i18n9 retries
        once after a short delay.
      - Tool logic (tools.js) is never touched: i18n9 only translates the
        tool hero (h1 + first paragraph) and the features.js action row
        labels. It never touches inputs, canvases, outputs or handlers.
   5. TOOL PAGES NEED NO HTML EDIT FOR HERO + NAV + FOOTER TRANSLATION:
      Tool pages currently carry no data-i18n attributes. i18n9 therefore
      translates them by structure, not by attributes: the hero is
      .tool-hero h1 + its first <p>, looked up by #tool-root[data-tool];
      the header nav links are matched by their href target; the footer
      columns are matched by position inside .site-footer .cols, and the
      "Popular" links are matched by their tool slug. RECOMMENDED (not
      required) follow-up for the coordinator: add the same data-i18n
      attributes used on the homepage to the tool-page nav/footer markup;
      i18n9's generic data-i18n pass will then handle those elements and
      the structural fallback becomes redundant. Until then, the fallback
      covers them.
   6. ENGLISH IS PRESERVED EXACTLY: on first apply, i18n9 stashes the
      original English text of every card title, card paragraph, hero title
      and hero paragraph in data-i18n9-orig. Selecting English restores
      those originals verbatim (including the homepage's long card
      paragraphs and the tool pages' long hero paragraphs). In the other 8
      languages those elements show the short one-line description from
      the TOOLS table below. Chrome strings (nav, hero, footer, etc.) use
      the EN dictionary, which matches the current English wording except
      that decorative symbols are removed, because this file must contain
      no emoji anywhere (see rule 8).
   7. HERO ICONS: a tool hero h1 begins with a decorative icon character
      in the original markup. i18n9 preserves that leading icon cluster
      and replaces only the words after it, so translated heroes keep
      their icon. No icon character is stored in this file.
   8. NO EMOJI RULE: this file contains no emoji in any string, key or
      comment, by design. That also means the English chrome strings here
      are text-only versions of the previous strings (for example the
      favorites heading is "Your Favorites", not the old symbol-prefixed
      text). Icons that live in the HTML/CSS (card .ticon elements, the
      logo mark, the dark-mode button glyph) are untouched.
   9. PUBLIC API: after load, window.FPT_I18N9 exposes { getLang, setLang,
      apply, LANGS }. If any future script injects new cards or chrome
      after page load, call window.FPT_I18N9.apply() to translate them.
      i18n9 also listens for a "fpt:retranslate" event on document for the
      same purpose.
   10. WHAT i18n9 DELIBERATELY DOES NOT TRANSLATE (phase 2, see footer):
      tool interiors (labels, buttons, results inside each tool), blog
      articles, about/faq/privacy/terms pages, YouTube channel descriptions,
      the developer section, and search keywords. The common tool-UI word
      list in the UI section of STR below is ready for phase 2: any tool
      element given data-i18n="<ui-key>" is translated by i18n9 today.
   ========================================================================== */
(function () {
'use strict';

/* Language list: code, native name shown in the dropdown, text direction. */
var LANGS = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', dir: 'ltr' }
];
var RTL = { ur: true, ar: true, fa: true };
var LANG_CODES = {};
LANGS.forEach(function (l) { LANG_CODES[l.code] = l; });

/* Templates use {n} for a number and {name} for a network name. */
var STR = {
en: {
  navHome: 'Home', navTools: 'All Tools', navAbout: 'About', navFaq: 'FAQ', navBlog: 'Blog', navContact: 'Contact', navPrivacy: 'Privacy',
  footTerms: 'Terms of Service', footDisclaimer: 'Disclaimer',
  heroTitle: '63 Free Online Tools',
  heroSub: 'PDF, image, text, calculators, security, color and developer tools — free forever. No signup. Everything runs privately in your browser.',
  searchPh: 'Search 63 tools... e.g. pdf, qr, password',
  badgeFree: '100% Free', badgePrivate: 'Private by design', badgeNoSignup: 'No signup', badgeMobile: 'Mobile friendly',
  useBadge: '{n} tool uses on this device',
  featuredTitle: 'Featured Tools', featuredSub: 'Our most-loved tools — picked for you', openBtn: 'Open',
  favTitle: 'Your Favorites', favSub: 'Tools you starred — saved on this device',
  recentTitle: 'Recently Used', recentSub: 'Your last visited tools',
  catAll: 'All', catFreeTools: '{n} free tools',
  noResults: 'No tools found. Try another keyword.',
  nlTitle: 'Newsletter', nlText: 'Get notified when we add new free tools. No spam, ever.',
  nlPh: 'Your email address', nlBtn: 'Subscribe', nlDone: 'Email saved on this device — email updates are coming soon!',
  ytTitle: 'Our YouTube Channels', ytSub: 'Learn, laugh and explore — subscribe for new videos every week', ytSubscribe: 'Subscribe', webTitle: 'Our Websites', webSub: 'More from Anwaar Digital — apps, guides and security resources', webVisit: 'Visit', webDescMain: '28+ Android apps, Windows software & free downloads', webDescHub: '57 guides, security tools, glossary & FAQ',
  footTag: '63 free online tools. No signup — everything runs in your browser.',
  footPopular: 'Popular', footSite: 'Site', footReq: 'Request a Tool', footPrivacy: 'Privacy Policy', footYouTube: 'YouTube',
  langLabel: 'Language', darkToggle: 'Toggle dark mode', darkLabel: 'Dark mode', lightLabel: 'Light mode', waChat: 'Chat on WhatsApp',
  favAction: 'Favorite', rateAction: 'Rate this tool', shareAction: 'Share', shareOn: 'Share on {name}',
  rateThanks: 'Thanks! You rated this tool {n}/5', rateYour: 'Your rating: {n}/5',
  btnOpen: 'Open', btnDownload: 'Download', btnCopy: 'Copy', btnCopied: 'Copied', btnGenerate: 'Generate', btnSubmit: 'Submit',
  btnClear: 'Clear', btnReset: 'Reset', btnCalculate: 'Calculate', btnConvert: 'Convert', btnSearch: 'Search', btnUpload: 'Upload',
  btnPrint: 'Print', btnSave: 'Save',
  statusDone: 'Done', statusError: 'Error', statusLoading: 'Loading...', statusPleaseWait: 'Please wait...',
  statusPleaseEnter: 'Please enter a value.', statusInvalid: 'Invalid input.', statusSuccess: 'Success',
  statusFailed: 'Failed. Please try again.', statusNoResult: 'No result found.'
},
ur: {
  navHome: 'ہوم', navTools: 'تمام ٹولز', navAbout: 'ہمارے بارے میں', navFaq: 'سوالات', navBlog: 'بلاگ', navContact: 'رابطہ', navPrivacy: 'پرائیویسی',
  footTerms: 'شرائط و ضوابط', footDisclaimer: 'دستبرداری',
  heroTitle: '63 مفت آن لائن ٹولز',
  heroSub: 'PDF، تصویر، متن، کیلکولیٹر، سیکیورٹی، رنگ اور ڈیولپر ٹولز — ہمیشہ مفت۔ کوئی سائن اپ نہیں۔ سب کچھ آپ کے براؤزر میں نجی طور پر چلتا ہے۔',
  searchPh: '63 ٹولز تلاش کریں... مثلاً pdf، qr، password',
  badgeFree: '100% مفت', badgePrivate: 'نجی ڈیزائن', badgeNoSignup: 'کوئی سائن اپ نہیں', badgeMobile: 'موبائل دوست',
  useBadge: 'اس ڈیوائس پر {n} ٹول استعمال',
  featuredTitle: 'نمایاں ٹولز', featuredSub: 'ہمارے سب سے مقبول ٹولز — آپ کے لیے منتخب', openBtn: 'کھولیں',
  favTitle: 'آپ کے پسندیدہ', favSub: 'جن ٹولز کو آپ نے پسند کیا — اس ڈیوائس پر محفوظ',
  recentTitle: 'حال ہی میں استعمال شدہ', recentSub: 'آپ کے آخری دیکھے گئے ٹولز',
  catAll: 'تمام', catFreeTools: '{n} مفت ٹولز',
  noResults: 'کوئی ٹول نہیں ملا۔ کوئی اور لفظ آزمائیں۔',
  nlTitle: 'نیوزلیٹر', nlText: 'جب ہم نئے مفت ٹولز شامل کریں تو اطلاع پائیں۔ کوئی سپام نہیں۔',
  nlPh: 'آپ کا ای میل ایڈریس', nlBtn: 'سبسکرائب کریں', nlDone: 'ای میل اس ڈیوائس پر محفوظ ہو گئی — ای میل اپڈیٹس جلد آ رہی ہیں!',
  ytTitle: 'ہمارے یوٹیوب چینلز', ytSub: 'سیکھیں، ہنسیں اور دریافت کریں — ہر ہفتے نئی ویڈیوز کے لیے سبسکرائب کریں', ytSubscribe: 'سبسکرائب', webTitle: 'ہماری ویب سائٹس', webSub: 'انوار ڈیجیٹل کی طرف سے — ایپس، گائیڈز اور سیکیورٹی وسائل', webVisit: 'وزٹ کریں', webDescMain: '28 سے زیادہ Android apps، Windows software اور مفت ڈاؤن لوڈز', webDescHub: '57 guides، security tools، glossary اور FAQ',
  footTag: '63 مفت آن لائن ٹولز۔ کوئی سائن اپ نہیں — سب کچھ آپ کے براؤزر میں چلتا ہے۔',
  footPopular: 'مقبول', footSite: 'سائٹ', footReq: 'ٹول کی درخواست', footPrivacy: 'پرائیویسی پالیسی', footYouTube: 'یوٹیوب',
  langLabel: 'زبان', darkToggle: 'ڈارک موڈ بدلیں', darkLabel: 'ڈارک موڈ', lightLabel: 'لائٹ موڈ', waChat: 'واٹس ایپ پر چیٹ کریں',
  favAction: 'پسندیدہ', rateAction: 'اس ٹول کی درجہ بندی کریں', shareAction: 'شیئر کریں', shareOn: '{name} پر شیئر کریں',
  rateThanks: 'شکریہ! آپ نے اس ٹول کو {n}/5 درجہ دیا', rateYour: 'آپ کی درجہ بندی: {n}/5',
  btnOpen: 'کھولیں', btnDownload: 'ڈاؤن لوڈ کریں', btnCopy: 'کاپی کریں', btnCopied: 'کاپی ہو گیا', btnGenerate: 'بنائیں', btnSubmit: 'جمع کریں',
  btnClear: 'صاف کریں', btnReset: 'دوبارہ ترتیب دیں', btnCalculate: 'حساب کریں', btnConvert: 'تبدیل کریں', btnSearch: 'تلاش کریں', btnUpload: 'اپ لوڈ کریں',
  btnPrint: 'پرنٹ کریں', btnSave: 'محفوظ کریں',
  statusDone: 'مکمل', statusError: 'خرابی', statusLoading: 'لوڈ ہو رہا ہے...', statusPleaseWait: 'براہ کرم انتظار کریں...',
  statusPleaseEnter: 'براہ کرم کوئی قیمت درج کریں۔', statusInvalid: 'غلط اندراج۔', statusSuccess: 'کامیاب',
  statusFailed: 'ناکام۔ براہ کرم دوبارہ کوشش کریں۔', statusNoResult: 'کوئی نتیجہ نہیں ملا۔'
},
tr: {
  navHome: 'Ana Sayfa', navTools: 'Tüm Araçlar', navAbout: 'Hakkında', navFaq: 'SSS', navBlog: 'Blog', navContact: 'İletişim', navPrivacy: 'Gizlilik',
  footTerms: 'Kullanım Şartları', footDisclaimer: 'Sorumluluk Reddi',
  heroTitle: '63 Ücretsiz Çevrimiçi Araç',
  heroSub: 'PDF, resim, metin, hesap makinesi, güvenlik, renk ve geliştirici araçları — sonsuza dek ücretsiz. Kayıt yok. Her şey tarayıcınızda gizli çalışır.',
  searchPh: '63 araçta ara... örn. pdf, qr, şifre',
  badgeFree: '%100 Ücretsiz', badgePrivate: 'Gizlilik öncelikli', badgeNoSignup: 'Kayıt yok', badgeMobile: 'Mobil uyumlu',
  useBadge: 'Bu cihazda {n} araç kullanımı',
  featuredTitle: 'Öne Çıkan Araçlar', featuredSub: 'En sevilen araçlarımız — sizin için seçildi', openBtn: 'Aç',
  favTitle: 'Favorileriniz', favSub: 'Yıldızladığınız araçlar — bu cihazda kayıtlı',
  recentTitle: 'Son Kullanılanlar', recentSub: 'Son ziyaret ettiğiniz araçlar',
  catAll: 'Tümü', catFreeTools: '{n} ücretsiz araç',
  noResults: 'Araç bulunamadı. Başka bir kelime deneyin.',
  nlTitle: 'Bülten', nlText: 'Yeni ücretsiz araçlar eklediğimizde haber alın. Asla spam yok.',
  nlPh: 'E-posta adresiniz', nlBtn: 'Abone ol', nlDone: 'E-posta bu cihaza kaydedildi — e-posta güncellemeleri yakında geliyor!',
  ytTitle: 'YouTube Kanallarımız', ytSub: 'Öğrenin, gülün ve keşfedin — her hafta yeni videolar için abone olun', ytSubscribe: 'Abone ol', webTitle: 'Web Sitelerimiz', webSub: 'Anwaar Digital\'den daha fazlası — uygulamalar, rehberler ve güvenlik kaynakları', webVisit: 'Ziyaret Et', webDescMain: '28+ Android uygulaması, Windows yazılımı ve ücretsiz indirmeler', webDescHub: '57 rehber, güvenlik araçları, sözlük ve SSS',
  footTag: '63 ücretsiz çevrimiçi araç. Kayıt yok — her şey tarayıcınızda çalışır.',
  footPopular: 'Popüler', footSite: 'Site', footReq: 'Araç Talebi', footPrivacy: 'Gizlilik Politikası', footYouTube: 'YouTube',
  langLabel: 'Dil', darkToggle: 'Karanlık modu değiştir', darkLabel: 'Karanlık mod', lightLabel: 'Açık mod', waChat: 'WhatsApp ile sohbet et',
  favAction: 'Favori', rateAction: 'Bu aracı puanla', shareAction: 'Paylaş', shareOn: '{name} üzerinde paylaş',
  rateThanks: 'Teşekkürler! Bu araca {n}/5 puan verdiniz', rateYour: 'Puanınız: {n}/5',
  btnOpen: 'Aç', btnDownload: 'İndir', btnCopy: 'Kopyala', btnCopied: 'Kopyalandı', btnGenerate: 'Oluştur', btnSubmit: 'Gönder',
  btnClear: 'Temizle', btnReset: 'Sıfırla', btnCalculate: 'Hesapla', btnConvert: 'Dönüştür', btnSearch: 'Ara', btnUpload: 'Yükle',
  btnPrint: 'Yazdır', btnSave: 'Kaydet',
  statusDone: 'Bitti', statusError: 'Hata', statusLoading: 'Yükleniyor...', statusPleaseWait: 'Lütfen bekleyin...',
  statusPleaseEnter: 'Lütfen bir değer girin.', statusInvalid: 'Geçersiz giriş.', statusSuccess: 'Başarılı',
  statusFailed: 'Başarısız. Lütfen tekrar deneyin.', statusNoResult: 'Sonuç bulunamadı.'
},
ar: {
  navHome: 'الرئيسية', navTools: 'كل الأدوات', navAbout: 'حول الموقع', navFaq: 'الأسئلة الشائعة', navBlog: 'المدونة', navContact: 'تواصل معنا', navPrivacy: 'الخصوصية',
  footTerms: 'شروط الاستخدام', footDisclaimer: 'إخلاء المسؤولية',
  heroTitle: '63 أداة مجانية على الإنترنت',
  heroSub: 'أدوات PDF والصور والنصوص والحاسبات والأمان والألوان والمطورين — مجانية للأبد. دون تسجيل. كل شيء يعمل بخصوصية في متصفحك.',
  searchPh: 'ابحث في 63 أداة... مثل pdf، qr، كلمة مرور',
  badgeFree: 'مجاني 100%', badgePrivate: 'مصمم للخصوصية', badgeNoSignup: 'دون تسجيل', badgeMobile: 'مناسب للجوال',
  useBadge: '{n} استخدام أداة على هذا الجهاز',
  featuredTitle: 'أدوات مميزة', featuredSub: 'أدواتنا الأكثر حبا — اخترناها لك', openBtn: 'افتح',
  favTitle: 'مفضلتك', favSub: 'الأدوات التي وضعت عليها نجمة — محفوظة على هذا الجهاز',
  recentTitle: 'استخدمت مؤخرا', recentSub: 'آخر الأدوات التي زرتها',
  catAll: 'الكل', catFreeTools: '{n} أداة مجانية',
  noResults: 'لم يتم العثور على أدوات. جرب كلمة أخرى.',
  nlTitle: 'النشرة البريدية', nlText: 'احصل على إشعار عند إضافة أدوات مجانية جديدة. دون إزعاج أبدا.',
  nlPh: 'عنوان بريدك الإلكتروني', nlBtn: 'اشترك', nlDone: 'تم حفظ البريد على هذا الجهاز — تحديثات البريد قادمة قريبا!',
  ytTitle: 'قنواتنا على يوتيوب', ytSub: 'تعلم واضحك واكتشف — اشترك لمقاطع جديدة كل أسبوع', ytSubscribe: 'اشترك', webTitle: 'مواقعنا', webSub: 'المزيد من أنوار ديجيتال — تطبيقات وأدلة وموارد أمنية', webVisit: 'زيارة', webDescMain: 'أكثر من 28 تطبيق أندرويد وبرامج ويندوز وتنزيلات مجانية', webDescHub: '57 دليلاً وأدوات أمنية وقاموس وأسئلة شائعة',
  footTag: '63 أداة مجانية على الإنترنت. دون تسجيل — كل شيء يعمل في متصفحك.',
  footPopular: 'الشائعة', footSite: 'الموقع', footReq: 'طلب أداة', footPrivacy: 'سياسة الخصوصية', footYouTube: 'يوتيوب',
  langLabel: 'اللغة', darkToggle: 'تبديل الوضع الداكن', darkLabel: 'الوضع الداكن', lightLabel: 'الوضع الفاتح', waChat: 'دردشة على واتساب',
  favAction: 'مفضلة', rateAction: 'قيم هذه الأداة', shareAction: 'مشاركة', shareOn: 'مشاركة على {name}',
  rateThanks: 'شكرا! قيمت هذه الأداة بـ {n}/5', rateYour: 'تقييمك: {n}/5',
  btnOpen: 'افتح', btnDownload: 'تنزيل', btnCopy: 'نسخ', btnCopied: 'تم النسخ', btnGenerate: 'إنشاء', btnSubmit: 'إرسال',
  btnClear: 'مسح', btnReset: 'إعادة تعيين', btnCalculate: 'احسب', btnConvert: 'تحويل', btnSearch: 'بحث', btnUpload: 'رفع',
  btnPrint: 'طباعة', btnSave: 'حفظ',
  statusDone: 'تم', statusError: 'خطأ', statusLoading: 'جار التحميل...', statusPleaseWait: 'يرجى الانتظار...',
  statusPleaseEnter: 'يرجى إدخال قيمة.', statusInvalid: 'إدخال غير صالح.', statusSuccess: 'نجاح',
  statusFailed: 'فشل. يرجى المحاولة مجددا.', statusNoResult: 'لم يتم العثور على نتيجة.'
},
fa: {
  navHome: 'خانه', navTools: 'همه ابزارها', navAbout: 'درباره ما', navFaq: 'سوالات متداول', navBlog: 'وبلاگ', navContact: 'تماس', navPrivacy: 'حریم خصوصی',
  footTerms: 'شرایط استفاده', footDisclaimer: 'سلب مسئولیت',
  heroTitle: '63 ابزار رایگان آنلاین',
  heroSub: 'ابزارهای PDF، تصویر، متن، ماشین حساب، امنیت، رنگ و توسعه دهنده — برای همیشه رایگان. بدون ثبت نام. همه چیز به صورت خصوصی در مرورگر شما اجرا می شود.',
  searchPh: 'در 63 ابزار جستجو کنید... مثلا pdf، qr، رمز عبور',
  badgeFree: '100% رایگان', badgePrivate: 'طراحی شده برای حریم خصوصی', badgeNoSignup: 'بدون ثبت نام', badgeMobile: 'مناسب موبایل',
  useBadge: '{n} استفاده از ابزار در این دستگاه',
  featuredTitle: 'ابزارهای ویژه', featuredSub: 'محبوب ترین ابزارهای ما — برای شما انتخاب شده', openBtn: 'باز کردن',
  favTitle: 'علاقه مندی های شما', favSub: 'ابزارهایی که ستاره زده اید — در این دستگاه ذخیره شده',
  recentTitle: 'اخیرا استفاده شده', recentSub: 'آخرین ابزارهایی که بازدید کرده اید',
  catAll: 'همه', catFreeTools: '{n} ابزار رایگان',
  noResults: 'ابزاری یافت نشد. کلمه دیگری را امتحان کنید.',
  nlTitle: 'خبرنامه', nlText: 'وقتی ابزارهای رایگان جدید اضافه می کنیم با خبر شوید. هرگز هرزنامه نیست.',
  nlPh: 'آدرس ایمیل شما', nlBtn: 'عضویت', nlDone: 'ایمیل در این دستگاه ذخیره شد — به روز رسانی های ایمیلی به زودی می آیند!',
  ytTitle: 'کانال های یوتیوب ما', ytSub: 'یاد بگیرید، بخندید و کاوش کنید — برای ویدیوهای جدید هر هفته عضو شوید', ytSubscribe: 'عضویت', webTitle: 'وب‌سایت‌های ما', webSub: 'بیشتر از انوار دیجیتال — اپلیکیشن‌ها، راهنماها و منابع امنیتی', webVisit: 'بازدید', webDescMain: 'بیش از 28 اپ اندروید، نرم‌افزار ویندوز و دانلودهای رایگان', webDescHub: '57 راهنما، ابزارهای امنیتی، واژه‌نامه و سؤالات متداول',
  footTag: '63 ابزار رایگان آنلاین. بدون ثبت نام — همه چیز در مرورگر شما اجرا می شود.',
  footPopular: 'محبوب', footSite: 'سایت', footReq: 'درخواست ابزار', footPrivacy: 'سیاست حریم خصوصی', footYouTube: 'یوتیوب',
  langLabel: 'زبان', darkToggle: 'تغییر حالت تیره', darkLabel: 'حالت تیره', lightLabel: 'حالت روشن', waChat: 'گفتگو در واتساپ',
  favAction: 'علاقه مندی', rateAction: 'به این ابزار امتیاز دهید', shareAction: 'اشتراک گذاری', shareOn: 'اشتراک در {name}',
  rateThanks: 'ممنون! به این ابزار {n}/5 امتیاز دادید', rateYour: 'امتیاز شما: {n}/5',
  btnOpen: 'باز کردن', btnDownload: 'دانلود', btnCopy: 'کپی', btnCopied: 'کپی شد', btnGenerate: 'ایجاد', btnSubmit: 'ارسال',
  btnClear: 'پاک کردن', btnReset: 'بازنشانی', btnCalculate: 'محاسبه', btnConvert: 'تبدیل', btnSearch: 'جستجو', btnUpload: 'بارگذاری',
  btnPrint: 'چاپ', btnSave: 'ذخیره',
  statusDone: 'انجام شد', statusError: 'خطا', statusLoading: 'در حال بارگذاری...', statusPleaseWait: 'لطفا صبر کنید...',
  statusPleaseEnter: 'لطفا یک مقدار وارد کنید.', statusInvalid: 'ورودی نامعتبر است.', statusSuccess: 'موفق',
  statusFailed: 'ناموفق بود. لطفا دوباره تلاش کنید.', statusNoResult: 'نتیجه ای یافت نشد.'
},
es: {
  navHome: 'Inicio', navTools: 'Todas las herramientas', navAbout: 'Acerca de', navFaq: 'Preguntas', navBlog: 'Blog', navContact: 'Contacto', navPrivacy: 'Privacidad',
  footTerms: 'Términos de uso', footDisclaimer: 'Aviso legal',
  heroTitle: '63 herramientas gratis en línea',
  heroSub: 'Herramientas de PDF, imagen, texto, calculadoras, seguridad, color y desarrollo — gratis para siempre. Sin registro. Todo funciona en privado en tu navegador.',
  searchPh: 'Busca en 63 herramientas... p. ej. pdf, qr, contraseña',
  badgeFree: '100% gratis', badgePrivate: 'Diseñado para la privacidad', badgeNoSignup: 'Sin registro', badgeMobile: 'Compatible con móvil',
  useBadge: '{n} usos de herramientas en este dispositivo',
  featuredTitle: 'Herramientas destacadas', featuredSub: 'Nuestras herramientas más queridas — elegidas para ti', openBtn: 'Abrir',
  favTitle: 'Tus favoritos', favSub: 'Herramientas que marcaste — guardadas en este dispositivo',
  recentTitle: 'Usadas recientemente', recentSub: 'Tus últimas herramientas visitadas',
  catAll: 'Todas', catFreeTools: '{n} herramientas gratis',
  noResults: 'No se encontraron herramientas. Prueba otra palabra.',
  nlTitle: 'Boletín', nlText: 'Recibe un aviso cuando añadamos herramientas gratis nuevas. Nunca spam.',
  nlPh: 'Tu correo electrónico', nlBtn: 'Suscribirse', nlDone: 'Correo guardado en este dispositivo — ¡las novedades por correo llegarán pronto!',
  ytTitle: 'Nuestros canales de YouTube', ytSub: 'Aprende, ríe y explora — suscríbete para vídeos nuevos cada semana', ytSubscribe: 'Suscribirse', webTitle: 'Nuestros sitios web', webSub: 'Más de Anwaar Digital — aplicaciones, guías y recursos de seguridad', webVisit: 'Visitar', webDescMain: 'Más de 28 apps Android, software Windows y descargas gratuitas', webDescHub: '57 guías, herramientas de seguridad, glosario y preguntas frecuentes',
  footTag: '63 herramientas gratis en línea. Sin registro — todo funciona en tu navegador.',
  footPopular: 'Populares', footSite: 'Sitio', footReq: 'Solicitar una herramienta', footPrivacy: 'Política de privacidad', footYouTube: 'YouTube',
  langLabel: 'Idioma', darkToggle: 'Cambiar modo oscuro', darkLabel: 'Modo oscuro', lightLabel: 'Modo claro', waChat: 'Chatea en WhatsApp',
  favAction: 'Favorito', rateAction: 'Valora esta herramienta', shareAction: 'Compartir', shareOn: 'Compartir en {name}',
  rateThanks: '¡Gracias! Valoraste esta herramienta con {n}/5', rateYour: 'Tu valoración: {n}/5',
  btnOpen: 'Abrir', btnDownload: 'Descargar', btnCopy: 'Copiar', btnCopied: 'Copiado', btnGenerate: 'Generar', btnSubmit: 'Enviar',
  btnClear: 'Limpiar', btnReset: 'Restablecer', btnCalculate: 'Calcular', btnConvert: 'Convertir', btnSearch: 'Buscar', btnUpload: 'Subir',
  btnPrint: 'Imprimir', btnSave: 'Guardar',
  statusDone: 'Listo', statusError: 'Error', statusLoading: 'Cargando...', statusPleaseWait: 'Espera, por favor...',
  statusPleaseEnter: 'Escribe un valor, por favor.', statusInvalid: 'Entrada no válida.', statusSuccess: 'Éxito',
  statusFailed: 'Falló. Inténtalo de nuevo, por favor.', statusNoResult: 'No se encontró ningún resultado.'
},
it: {
  navHome: 'Home', navTools: 'Tutti gli strumenti', navAbout: 'Chi siamo', navFaq: 'Domande', navBlog: 'Blog', navContact: 'Contatti', navPrivacy: 'Privacy',
  footTerms: 'Termini di utilizzo', footDisclaimer: 'Nota legale',
  heroTitle: '63 strumenti gratuiti online',
  heroSub: 'Strumenti PDF, immagine, testo, calcolatrici, sicurezza, colore e sviluppo — gratuiti per sempre. Senza registrazione. Tutto funziona in privato nel tuo browser.',
  searchPh: 'Cerca tra 63 strumenti... es. pdf, qr, password',
  badgeFree: '100% gratuito', badgePrivate: 'Progettato per la privacy', badgeNoSignup: 'Senza registrazione', badgeMobile: 'Adatto ai cellulari',
  useBadge: '{n} utilizzi di strumenti su questo dispositivo',
  featuredTitle: 'Strumenti in evidenza', featuredSub: 'I nostri strumenti più amati — scelti per te', openBtn: 'Apri',
  favTitle: 'I tuoi preferiti', favSub: 'Strumenti che hai contrassegnato — salvati su questo dispositivo',
  recentTitle: 'Usati di recente', recentSub: 'Gli ultimi strumenti che hai visitato',
  catAll: 'Tutti', catFreeTools: '{n} strumenti gratuiti',
  noResults: 'Nessuno strumento trovato. Prova un’altra parola.',
  nlTitle: 'Newsletter', nlText: 'Ricevi un avviso quando aggiungiamo nuovi strumenti gratuiti. Mai spam.',
  nlPh: 'Il tuo indirizzo email', nlBtn: 'Iscriviti', nlDone: 'Email salvata su questo dispositivo — gli aggiornamenti via email arriveranno presto!',
  ytTitle: 'I nostri canali YouTube', ytSub: 'Impara, ridi ed esplora — iscriviti per nuovi video ogni settimana', ytSubscribe: 'Iscriviti', webTitle: 'I nostri siti web', webSub: 'Altro da Anwaar Digital — app, guide e risorse di sicurezza', webVisit: 'Visita', webDescMain: 'Oltre 28 app Android, software Windows e download gratuiti', webDescHub: '57 guide, strumenti di sicurezza, glossario e FAQ',
  footTag: '63 strumenti gratuiti online. Senza registrazione — tutto funziona nel tuo browser.',
  footPopular: 'Popolari', footSite: 'Sito', footReq: 'Richiedi uno strumento', footPrivacy: 'Informativa sulla privacy', footYouTube: 'YouTube',
  langLabel: 'Lingua', darkToggle: 'Cambia modalità scura', darkLabel: 'Modalità scura', lightLabel: 'Modalità chiara', waChat: 'Chatta su WhatsApp',
  favAction: 'Preferito', rateAction: 'Valuta questo strumento', shareAction: 'Condividi', shareOn: 'Condividi su {name}',
  rateThanks: 'Grazie! Hai valutato questo strumento {n}/5', rateYour: 'La tua valutazione: {n}/5',
  btnOpen: 'Apri', btnDownload: 'Scarica', btnCopy: 'Copia', btnCopied: 'Copiato', btnGenerate: 'Genera', btnSubmit: 'Invia',
  btnClear: 'Cancella', btnReset: 'Ripristina', btnCalculate: 'Calcola', btnConvert: 'Converti', btnSearch: 'Cerca', btnUpload: 'Carica',
  btnPrint: 'Stampa', btnSave: 'Salva',
  statusDone: 'Fatto', statusError: 'Errore', statusLoading: 'Caricamento...', statusPleaseWait: 'Attendi, per favore...',
  statusPleaseEnter: 'Inserisci un valore, per favore.', statusInvalid: 'Input non valido.', statusSuccess: 'Operazione riuscita',
  statusFailed: 'Non riuscito. Riprova, per favore.', statusNoResult: 'Nessun risultato trovato.'
},
de: {
  navHome: 'Start', navTools: 'Alle Tools', navAbout: 'Über uns', navFaq: 'Fragen', navBlog: 'Blog', navContact: 'Kontakt', navPrivacy: 'Datenschutz',
  footTerms: 'Nutzungsbedingungen', footDisclaimer: 'Haftungsausschluss',
  heroTitle: '63 kostenlose Online-Tools',
  heroSub: 'PDF-, Bild-, Text-, Rechner-, Sicherheits-, Farb- und Entwickler-Tools — für immer kostenlos. Keine Anmeldung. Alles läuft privat in deinem Browser.',
  searchPh: '63 Tools durchsuchen... z. B. pdf, qr, Passwort',
  badgeFree: '100% kostenlos', badgePrivate: 'Privat by Design', badgeNoSignup: 'Keine Anmeldung', badgeMobile: 'Mobilfreundlich',
  useBadge: '{n} Tool-Nutzungen auf diesem Gerät',
  featuredTitle: 'Empfohlene Tools', featuredSub: 'Unsere beliebtesten Tools — für dich ausgewählt', openBtn: 'Öffnen',
  favTitle: 'Deine Favoriten', favSub: 'Tools, die du markiert hast — auf diesem Gerät gespeichert',
  recentTitle: 'Zuletzt verwendet', recentSub: 'Deine zuletzt besuchten Tools',
  catAll: 'Alle', catFreeTools: '{n} kostenlose Tools',
  noResults: 'Keine Tools gefunden. Versuch ein anderes Wort.',
  nlTitle: 'Newsletter', nlText: 'Erhalte eine Nachricht, wenn wir neue kostenlose Tools hinzufügen. Nie Spam.',
  nlPh: 'Deine E-Mail-Adresse', nlBtn: 'Abonnieren', nlDone: 'E-Mail auf diesem Gerät gespeichert — E-Mail-Updates kommen bald!',
  ytTitle: 'Unsere YouTube-Kanäle', ytSub: 'Lernen, lachen und entdecken — abonniere für neue Videos jede Woche', ytSubscribe: 'Abonnieren', webTitle: 'Unsere Webseiten', webSub: 'Mehr von Anwaar Digital — Apps, Anleitungen und Sicherheitsressourcen', webVisit: 'Besuchen', webDescMain: 'Über 28 Android-Apps, Windows-Software und kostenlose Downloads', webDescHub: '57 Anleitungen, Sicherheitstools, Glossar und FAQ',
  footTag: '63 kostenlose Online-Tools. Keine Anmeldung — alles läuft in deinem Browser.',
  footPopular: 'Beliebt', footSite: 'Website', footReq: 'Tool vorschlagen', footPrivacy: 'Datenschutzerklärung', footYouTube: 'YouTube',
  langLabel: 'Sprache', darkToggle: 'Dunkelmodus umschalten', darkLabel: 'Dunkelmodus', lightLabel: 'Hellmodus', waChat: 'Auf WhatsApp chatten',
  favAction: 'Favorit', rateAction: 'Dieses Tool bewerten', shareAction: 'Teilen', shareOn: 'Teilen auf {name}',
  rateThanks: 'Danke! Du hast dieses Tool mit {n}/5 bewertet', rateYour: 'Deine Bewertung: {n}/5',
  btnOpen: 'Öffnen', btnDownload: 'Herunterladen', btnCopy: 'Kopieren', btnCopied: 'Kopiert', btnGenerate: 'Erstellen', btnSubmit: 'Senden',
  btnClear: 'Leeren', btnReset: 'Zurücksetzen', btnCalculate: 'Berechnen', btnConvert: 'Umwandeln', btnSearch: 'Suchen', btnUpload: 'Hochladen',
  btnPrint: 'Drucken', btnSave: 'Speichern',
  statusDone: 'Fertig', statusError: 'Fehler', statusLoading: 'Laden...', statusPleaseWait: 'Bitte warten...',
  statusPleaseEnter: 'Bitte einen Wert eingeben.', statusInvalid: 'Ungültige Eingabe.', statusSuccess: 'Erfolgreich',
  statusFailed: 'Fehlgeschlagen. Bitte erneut versuchen.', statusNoResult: 'Kein Ergebnis gefunden.'
},
nl: {
  navHome: 'Home', navTools: 'Alle tools', navAbout: 'Over ons', navFaq: 'Vragen', navBlog: 'Blog', navContact: 'Contact', navPrivacy: 'Privacy',
  footTerms: 'Gebruiksvoorwaarden', footDisclaimer: 'Disclaimer',
  heroTitle: '63 gratis online tools',
  heroSub: 'PDF-, afbeeldings-, tekst-, reken-, beveiligings-, kleur- en ontwikkelaarstools — voor altijd gratis. Geen aanmelding. Alles draait privé in je browser.',
  searchPh: 'Zoek in 63 tools... bijv. pdf, qr, wachtwoord',
  badgeFree: '100% gratis', badgePrivate: 'Ontworpen voor privacy', badgeNoSignup: 'Geen aanmelding', badgeMobile: 'Mobielvriendelijk',
  useBadge: '{n} toolgebruiken op dit apparaat',
  featuredTitle: 'Uitgelichte tools', featuredSub: 'Onze populairste tools — voor jou gekozen', openBtn: 'Openen',
  favTitle: 'Jouw favorieten', favSub: 'Tools die je hebt gemarkeerd — opgeslagen op dit apparaat',
  recentTitle: 'Recent gebruikt', recentSub: 'Je laatst bezochte tools',
  catAll: 'Alle', catFreeTools: '{n} gratis tools',
  noResults: 'Geen tools gevonden. Probeer een ander woord.',
  nlTitle: 'Nieuwsbrief', nlText: 'Krijg bericht als we nieuwe gratis tools toevoegen. Nooit spam.',
  nlPh: 'Je e-mailadres', nlBtn: 'Abonneren', nlDone: 'E-mail opgeslagen op dit apparaat — e-mailupdates komen binnenkort!',
  ytTitle: 'Onze YouTube-kanalen', ytSub: 'Leer, lach en ontdek — abonneer voor elke week nieuwe videos', ytSubscribe: 'Abonneren', webTitle: 'Onze websites', webSub: 'Meer van Anwaar Digital — apps, handleidingen en beveiligingsbronnen', webVisit: 'Bezoeken', webDescMain: '28+ Android-apps, Windows-software en gratis downloads', webDescHub: '57 handleidingen, beveiligingstools, woordenlijst en veelgestelde vragen',
  footTag: '63 gratis online tools. Geen aanmelding — alles draait in je browser.',
  footPopular: 'Populair', footSite: 'Site', footReq: 'Vraag een tool aan', footPrivacy: 'Privacybeleid', footYouTube: 'YouTube',
  langLabel: 'Taal', darkToggle: 'Donkere modus wisselen', darkLabel: 'Donkere modus', lightLabel: 'Lichte modus', waChat: 'Chat op WhatsApp',
  favAction: 'Favoriet', rateAction: 'Beoordeel deze tool', shareAction: 'Delen', shareOn: 'Delen op {name}',
  rateThanks: 'Bedankt! Je hebt deze tool {n}/5 gegeven', rateYour: 'Jouw beoordeling: {n}/5',
  btnOpen: 'Openen', btnDownload: 'Downloaden', btnCopy: 'Kopiëren', btnCopied: 'Gekopieerd', btnGenerate: 'Genereren', btnSubmit: 'Verzenden',
  btnClear: 'Wissen', btnReset: 'Opnieuw instellen', btnCalculate: 'Berekenen', btnConvert: 'Omzetten', btnSearch: 'Zoeken', btnUpload: 'Uploaden',
  btnPrint: 'Afdrukken', btnSave: 'Opslaan',
  statusDone: 'Gereed', statusError: 'Fout', statusLoading: 'Laden...', statusPleaseWait: 'Even geduld...',
  statusPleaseEnter: 'Voer een waarde in.', statusInvalid: 'Ongeldige invoer.', statusSuccess: 'Gelukt',
  statusFailed: 'Mislukt. Probeer het opnieuw.', statusNoResult: 'Geen resultaat gevonden.'
}
};

/* Category names, keyed by the English category name used in data-cat and
   in data-cat-section on the homepage. */
var CAT = {
en: { 'PDF Tools': 'PDF Tools', 'Image Tools': 'Image Tools', 'Text Tools': 'Text Tools', 'Calculators': 'Calculators', 'Security Tools': 'Security Tools', 'Color Tools': 'Color Tools', 'Developer Tools': 'Developer Tools', 'Business Tools': 'Business Tools', 'Productivity Tools': 'Productivity Tools' },
ur: { 'PDF Tools': 'PDF ٹولز', 'Image Tools': 'تصویری ٹولز', 'Text Tools': 'متنی ٹولز', 'Calculators': 'کیلکولیٹرز', 'Security Tools': 'سیکیورٹی ٹولز', 'Color Tools': 'رنگ ٹولز', 'Developer Tools': 'ڈیولپر ٹولز', 'Business Tools': 'کاروباری ٹولز', 'Productivity Tools': 'پیداواری ٹولز' },
tr: { 'PDF Tools': 'PDF Araçları', 'Image Tools': 'Resim Araçları', 'Text Tools': 'Metin Araçları', 'Calculators': 'Hesap Makineleri', 'Security Tools': 'Güvenlik Araçları', 'Color Tools': 'Renk Araçları', 'Developer Tools': 'Geliştirici Araçları', 'Business Tools': 'İş Araçları', 'Productivity Tools': 'Verimlilik Araçları' },
ar: { 'PDF Tools': 'أدوات PDF', 'Image Tools': 'أدوات الصور', 'Text Tools': 'أدوات النصوص', 'Calculators': 'الحاسبات', 'Security Tools': 'أدوات الأمان', 'Color Tools': 'أدوات الألوان', 'Developer Tools': 'أدوات المطورين', 'Business Tools': 'أدوات الأعمال', 'Productivity Tools': 'أدوات الإنتاجية' },
fa: { 'PDF Tools': 'ابزارهای PDF', 'Image Tools': 'ابزارهای تصویر', 'Text Tools': 'ابزارهای متن', 'Calculators': 'ماشین حساب ها', 'Security Tools': 'ابزارهای امنیتی', 'Color Tools': 'ابزارهای رنگ', 'Developer Tools': 'ابزارهای توسعه دهنده', 'Business Tools': 'ابزارهای کسب و کار', 'Productivity Tools': 'ابزارهای بهره وری' },
es: { 'PDF Tools': 'Herramientas PDF', 'Image Tools': 'Herramientas de imagen', 'Text Tools': 'Herramientas de texto', 'Calculators': 'Calculadoras', 'Security Tools': 'Herramientas de seguridad', 'Color Tools': 'Herramientas de color', 'Developer Tools': 'Herramientas para desarrolladores', 'Business Tools': 'Herramientas de negocio', 'Productivity Tools': 'Herramientas de productividad' },
it: { 'PDF Tools': 'Strumenti PDF', 'Image Tools': 'Strumenti immagine', 'Text Tools': 'Strumenti di testo', 'Calculators': 'Calcolatrici', 'Security Tools': 'Strumenti di sicurezza', 'Color Tools': 'Strumenti colore', 'Developer Tools': 'Strumenti per sviluppatori', 'Business Tools': 'Strumenti aziendali', 'Productivity Tools': 'Strumenti di produttività' },
de: { 'PDF Tools': 'PDF-Tools', 'Image Tools': 'Bild-Tools', 'Text Tools': 'Text-Tools', 'Calculators': 'Rechner', 'Security Tools': 'Sicherheits-Tools', 'Color Tools': 'Farb-Tools', 'Developer Tools': 'Entwickler-Tools', 'Business Tools': 'Business-Tools', 'Productivity Tools': 'Produktivitäts-Tools' },
nl: { 'PDF Tools': 'PDF-tools', 'Image Tools': 'Afbeeldingstools', 'Text Tools': 'Teksttools', 'Calculators': 'Rekenmachines', 'Security Tools': 'Beveiligingstools', 'Color Tools': 'Kleurtools', 'Developer Tools': 'Ontwikkelaarstools', 'Business Tools': 'Zakelijke tools', 'Productivity Tools': 'Productiviteitstools' }
};

/* TOOLS: [title, one-line description] per language, keyed by tool slug.
   The English pair is the short form of the live homepage/hero wording;
   the English long text is always restored from the page itself (see the
   wiring spec, point 6), so the English pair here is only a fallback. */
var TOOLS = {
  "pdf-merger": { en: ["PDF Merger", "Combine multiple PDFs into one document, in any order you choose. Free and private in your browser."],
    ur: ["PDF مرجر", "کئی PDF فائلوں کو اپنی مرضی کی ترتیب میں ایک دستاویز میں جوڑیں۔ مفت، نجی اور بغیر سائن اپ۔"],
    tr: ["PDF Birleştirici", "Birden fazla PDF dosyasını istediğiniz sırada tek bir belgede birleştirin. Ücretsiz ve gizli."],
    ar: ["دمج PDF", "ادمج عدة ملفات PDF في مستند واحد بالترتيب الذي تختاره. مجاني وخاص في متصفحك."],
    fa: ["ادغام PDF", "چند فایل PDF را به ترتیب دلخواه در یک سند ترکیب کنید. رایگان و خصوصی در مرورگر شما."],
    es: ["Combinar PDF", "Combina varios PDF en un solo documento, en el orden que elijas. Gratis y privado."],
    it: ["Unisci PDF", "Combina più PDF in un unico documento, nell'ordine che scegli. Gratis e privato."],
    de: ["PDF zusammenführen", "Mehrere PDFs in beliebiger Reihenfolge zu einem Dokument zusammenführen. Kostenlos und privat."],
    nl: ["PDF samenvoegen", "Voeg meerdere PDFs samen tot één document, in de volgorde die jij kiest. Gratis en privé."] },
  "pdf-splitter": { en: ["PDF Splitter", "Extract pages or page ranges from any PDF into a new file. Free and private."],
    ur: ["PDF اسپلٹر", "کسی بھی PDF سے صفحات یا صفحات کی حد نکال کر نئی فائل بنائیں۔ مفت اور نجی۔"],
    tr: ["PDF Ayırıcı", "Herhangi bir PDF dosyasından sayfaları veya sayfa aralıklarını yeni bir dosyaya çıkarın. Ücretsiz."],
    ar: ["تقسيم PDF", "استخرج صفحات أو نطاقات صفحات من أي ملف PDF إلى ملف جديد. مجاني وخاص."],
    fa: ["تقسیم PDF", "صفحات یا بازه صفحات را از هر PDF در یک فایل جدید استخراج کنید. رایگان و خصوصی."],
    es: ["Dividir PDF", "Extrae páginas o rangos de páginas de cualquier PDF en un archivo nuevo. Gratis y privado."],
    it: ["Dividi PDF", "Estrai pagine o intervalli di pagine da qualsiasi PDF in un nuovo file. Gratis e privato."],
    de: ["PDF aufteilen", "Seiten oder Seitenbereiche aus einem PDF in eine neue Datei extrahieren. Kostenlos."],
    nl: ["PDF splitsen", "Haal paginas of paginabereiken uit een PDF in een nieuw bestand. Gratis en privé."] },
  "pdf-compressor": { en: ["PDF Compressor", "Shrink PDF file size right in your browser, before emailing or uploading. Free and private."],
    ur: ["PDF کمپریسر", "ای میل یا اپ لوڈ سے پہلے اپنے براؤزر میں PDF فائل کا سائز کم کریں۔ مفت اور نجی۔"],
    tr: ["PDF Sıkıştırıcı", "E-posta göndermeden veya yüklemeden önce PDF boyutunu tarayıcınızda küçültün. Ücretsiz."],
    ar: ["ضغط PDF", "قلل حجم ملف PDF في متصفحك قبل الإرسال أو الرفع. مجاني وخاص."],
    fa: ["فشرده ساز PDF", "حجم فایل PDF را پیش از ارسال یا بارگذاری در مرورگر خود کم کنید. رایگان و خصوصی."],
    es: ["Comprimir PDF", "Reduce el tamaño de un PDF en tu navegador, antes de enviarlo o subirlo. Gratis y privado."],
    it: ["Comprimi PDF", "Riduci la dimensione di un PDF nel tuo browser, prima di inviarlo o caricarlo. Gratis e privato."],
    de: ["PDF komprimieren", "PDF-Dateigröße direkt im Browser verkleinern, vor dem Versenden oder Hochladen. Kostenlos."],
    nl: ["PDF comprimeren", "Verklein een PDF in je browser, voor je hem mailt of uploadt. Gratis en privé."] },
  "pdf-to-text": { en: ["PDF to Text", "Extract all text from any PDF instantly, so you can copy, edit or search it. Free."],
    ur: ["PDF سے متن", "کسی بھی PDF سے سارا متن فوراً نکالیں تاکہ آپ اسے کاپی، ترمیم یا تلاش کر سکیں۔ مفت۔"],
    tr: ["PDFten Metne", "Herhangi bir PDF dosyasındaki tüm metni anında çıkarın, kopyalayın veya düzenleyin. Ücretsiz."],
    ar: ["PDF إلى نص", "استخرج كل النصوص من أي ملف PDF فورا لنسخها أو تحريرها أو البحث فيها. مجاني."],
    fa: ["PDF به متن", "همه متن هر PDF را فورا استخراج کنید تا بتوانید آن را کپی، ویرایش یا جستجو کنید. رایگان."],
    es: ["PDF a texto", "Extrae todo el texto de cualquier PDF al instante, para copiarlo, editarlo o buscarlo. Gratis."],
    it: ["PDF in testo", "Estrai subito tutto il testo da qualsiasi PDF, per copiarlo, modificarlo o cercarlo. Gratis."],
    de: ["PDF zu Text", "Den gesamten Text aus einem PDF sofort extrahieren, zum Kopieren, Bearbeiten oder Suchen. Kostenlos."],
    nl: ["PDF naar tekst", "Haal direct alle tekst uit een PDF, zodat je hem kunt kopiëren, bewerken of doorzoeken. Gratis."] },
  "images-to-pdf": { en: ["Images to PDF", "Convert JPG and PNG images into one PDF document, one image per page. Free."],
    ur: ["تصاویر سے PDF", "JPG اور PNG تصاویر کو ایک PDF دستاویز میں بدلیں، ہر صفحے پر ایک تصویر۔ مفت۔"],
    tr: ["Resimden PDFye", "JPG ve PNG resimlerini tek bir PDF belgesine dönüştürün, her sayfada bir resim. Ücretsiz."],
    ar: ["صور إلى PDF", "حول صور JPG وPNG إلى مستند PDF واحد، صورة في كل صفحة. مجاني."],
    fa: ["تصویر به PDF", "تصاویر JPG و PNG را به یک سند PDF تبدیل کنید، هر صفحه یک تصویر. رایگان."],
    es: ["Imágenes a PDF", "Convierte imágenes JPG y PNG en un solo PDF, una imagen por página. Gratis."],
    it: ["Immagini in PDF", "Converti immagini JPG e PNG in un unico PDF, un'immagine per pagina. Gratis."],
    de: ["Bilder zu PDF", "JPG- und PNG-Bilder in ein PDF-Dokument umwandeln, ein Bild pro Seite. Kostenlos."],
    nl: ["Afbeeldingen naar PDF", "Zet JPG- en PNG-afbeeldingen om in één PDF, één afbeelding per pagina. Gratis."] },
  "image-compressor": { en: ["Image Compressor", "Reduce image file size with an adjustable quality slider, JPG and WebP output. Free."],
    ur: ["تصویر کمپریسر", "کوالٹی سلائیڈر سے تصویر کا سائز کم کریں، JPG اور WebP آؤٹ پٹ کے ساتھ۔ مفت۔"],
    tr: ["Resim Sıkıştırıcı", "Ayarlanabilir kalite kaydırıcısıyla resim boyutunu küçültün, JPG ve WebP çıktısı. Ücretsiz."],
    ar: ["ضغط الصور", "قلل حجم الصور بمزلاج جودة قابل للتعديل، بمخرجات JPG وWebP. مجاني."],
    fa: ["فشرده ساز تصویر", "با نوار کیفیت قابل تنظیم حجم تصویر را کم کنید، خروجی JPG و WebP. رایگان."],
    es: ["Comprimir imagen", "Reduce el tamaño de imágenes con un control de calidad ajustable, salida JPG y WebP. Gratis."],
    it: ["Comprimi immagine", "Riduci le dimensioni delle immagini con un controllo di qualità regolabile, output JPG e WebP. Gratis."],
    de: ["Bild komprimieren", "Bildgröße mit einstellbarem Qualitätsregler reduzieren, JPG- und WebP-Ausgabe. Kostenlos."],
    nl: ["Afbeelding comprimeren", "Verklein afbeeldingen met een instelbare kwaliteitsschuif, JPG- en WebP-uitvoer. Gratis."] },
  "image-resizer": { en: ["Image Resizer", "Resize images to exact pixel dimensions, with an aspect-ratio lock. Free and private."],
    ur: ["تصویر ری سائزر", "تصاویر کو درست پکسل سائز میں بدلیں، تناسب کے لاک کے ساتھ۔ مفت اور نجی۔"],
    tr: ["Resim Boyutlandırıcı", "Resimleri tam piksel boyutlarına getirin, en boy oranı kilidiyle. Ücretsiz ve gizli."],
    ar: ["تغيير حجم الصور", "غير حجم الصور إلى أبعاد بكسل دقيقة مع قفل نسبة العرض إلى الارتفاع. مجاني وخاص."],
    fa: ["تغییر اندازه تصویر", "تصاویر را به ابعاد دقیق پیکسل تغییر دهید، با قفل نسبت ابعاد. رایگان و خصوصی."],
    es: ["Cambiar tamaño de imagen", "Cambia imágenes a dimensiones exactas en píxeles, con bloqueo de proporción. Gratis y privado."],
    it: ["Ridimensiona immagine", "Ridimensiona le immagini a dimensioni esatte in pixel, con blocco delle proporzioni. Gratis e privato."],
    de: ["Bildgröße ändern", "Bilder auf genaue Pixelmaße bringen, mit Seitenverhältnis-Sperre. Kostenlos und privat."],
    nl: ["Afbeelding formaat wijzigen", "Pas afbeeldingen aan naar exacte pixelmaten, met vergrendeling van de verhouding. Gratis en privé."] },
  "image-converter": { en: ["Image Converter", "Convert images between PNG, JPG, WebP and BMP formats in seconds. Free."],
    ur: ["تصویر کنورٹر", "تصاویر کو PNG، JPG، WebP اور BMP فارمیٹس کے درمیان سیکنڈوں میں بدلیں۔ مفت۔"],
    tr: ["Resim Dönüştürücü", "Resimleri PNG, JPG, WebP ve BMP formatları arasında saniyeler içinde dönüştürün. Ücretsiz."],
    ar: ["تحويل الصور", "حول الصور بين صيغ PNG وJPG وWebP وBMP في ثوان. مجاني."],
    fa: ["تبدیل تصویر", "تصاویر را در چند ثانیه بین قالب های PNG و JPG و WebP و BMP تبدیل کنید. رایگان."],
    es: ["Convertir imagen", "Convierte imágenes entre PNG, JPG, WebP y BMP en segundos. Gratis."],
    it: ["Converti immagine", "Converti immagini tra PNG, JPG, WebP e BMP in pochi secondi. Gratis."],
    de: ["Bild umwandeln", "Bilder in Sekunden zwischen PNG, JPG, WebP und BMP umwandeln. Kostenlos."],
    nl: ["Afbeelding omzetten", "Zet afbeeldingen in seconden om tussen PNG, JPG, WebP en BMP. Gratis."] },
  "image-cropper": { en: ["Image Cropper", "Crop images to any rectangular region you choose with a simple selection. Free."],
    ur: ["تصویر کراپر", "سادہ سلیکشن سے تصویر کا کوئی بھی مستطیل حصہ کاٹیں۔ مفت۔"],
    tr: ["Resim Kırpıcı", "Basit bir seçimle resimleri istediğiniz dikdörtgen bölgeye kırpın. Ücretsiz."],
    ar: ["قص الصور", "قص الصور إلى أي منطقة مستطيلة تختارها بتحديد بسيط. مجاني."],
    fa: ["برش تصویر", "تصاویر را با یک انتخاب ساده به هر ناحیه مستطیلی که می خواهید برش بزنید. رایگان."],
    es: ["Recortar imagen", "Recorta imágenes a cualquier región rectangular que elijas, con una selección simple. Gratis."],
    it: ["Ritaglia immagine", "Ritaglia le immagini in qualsiasi area rettangolare con una semplice selezione. Gratis."],
    de: ["Bild zuschneiden", "Bilder mit einfacher Auswahl auf einen beliebigen rechteckigen Bereich zuschneiden. Kostenlos."],
    nl: ["Afbeelding bijsnijden", "Snijd afbeeldingen bij tot elk rechthoekig gebied met een eenvoudige selectie. Gratis."] },
  "image-rotator": { en: ["Image Rotator", "Rotate images 90 or 180 degrees, or flip them horizontally and vertically. Free."],
    ur: ["تصویر روٹیٹر", "تصاویر کو 90 یا 180 ڈگری گھمائیں، یا افقی اور عمودی پلٹیں۔ مفت۔"],
    tr: ["Resim Döndürücü", "Resimleri 90 veya 180 derece döndürün ya da yatay ve dikey çevirin. Ücretsiz."],
    ar: ["تدوير الصور", "أدر الصور 90 أو 180 درجة، أو اقلبها أفقيا وعموديا. مجاني."],
    fa: ["چرخش تصویر", "تصاویر را 90 یا 180 درجه بچرخانید، یا به صورت افقی و عمودی برگردانید. رایگان."],
    es: ["Girar imagen", "Gira imágenes 90 o 180 grados, o voltéalas horizontal y verticalmente. Gratis."],
    it: ["Ruota immagine", "Ruota le immagini di 90 o 180 gradi, o capovolgile in orizzontale e verticale. Gratis."],
    de: ["Bild drehen", "Bilder um 90 oder 180 Grad drehen oder horizontal und vertikal spiegeln. Kostenlos."],
    nl: ["Afbeelding draaien", "Draai afbeeldingen 90 of 180 graden, of spiegel ze horizontaal en verticaal. Gratis."] },
  "grayscale-filter": { en: ["Photo Filters", "Apply grayscale, sepia, invert, vintage and blur effects to photos with one click. Free."],
    ur: ["فوٹو فلٹرز", "ایک کلک سے تصاویر پر گرے اسکیل، سیپیا، انورٹ، ونٹیج اور بلر اثرات لگائیں۔ مفت۔"],
    tr: ["Foto Filtreleri", "Fotoğraflara tek tıkla gri ton, sepya, ters çevirme, vintage ve bulanık efektleri uygulayın. Ücretsiz."],
    ar: ["فلاتر الصور", "طبق تأثيرات التدرج الرمادي والبني والعكس والقديم والضبابية على الصور بنقرة واحدة. مجاني."],
    fa: ["فیلترهای عکس", "با یک کلیک جلوه های خاکستری، قهوه ای، معکوس، قدیمی و تار را روی عکس ها اعمال کنید. رایگان."],
    es: ["Filtros de foto", "Aplica efectos de escala de grises, sepia, invertido, vintage y desenfoque con un clic. Gratis."],
    it: ["Filtri foto", "Applica effetti scala di grigi, seppia, invertito, vintage e sfocatura con un clic. Gratis."],
    de: ["Foto-Filter", "Graustufen-, Sepia-, Invert-, Vintage- und Weichzeichner-Effekte mit einem Klick anwenden. Kostenlos."],
    nl: ["Fotofilters", "Pas grijswaarden-, sepia-, invert-, vintage- en vervagingseffecten toe met één klik. Gratis."] },
  "qr-generator": { en: ["QR Code Generator", "Create custom QR codes from any text or URL, in small to print-ready sizes. Free."],
    ur: ["QR کوڈ جنریٹر", "کسی بھی متن یا لنک سے اپنی مرضی کے QR کوڈ بنائیں، چھوٹے سے پرنٹ سائز تک۔ مفت۔"],
    tr: ["QR Kod Oluşturucu", "Herhangi bir metin veya bağlantıdan özel QR kodları oluşturun, küçükten baskı boyutuna. Ücretsiz."],
    ar: ["مولد رمز QR", "أنشئ رموز QR مخصصة من أي نص أو رابط، من الأحجام الصغيرة إلى أحجام الطباعة. مجاني."],
    fa: ["سازنده کد QR", "کدهای QR سفارشی از هر متن یا پیوند بسازید، از اندازه کوچک تا چاپی. رایگان."],
    es: ["Generador de código QR", "Crea códigos QR personalizados desde cualquier texto o enlace, de tamaño pequeño a imprimible. Gratis."],
    it: ["Generatore di codici QR", "Crea codici QR personalizzati da qualsiasi testo o link, da piccoli a pronti per la stampa. Gratis."],
    de: ["QR-Code-Generator", "Eigene QR-Codes aus Text oder Link erstellen, von klein bis druckfertig. Kostenlos."],
    nl: ["QR-codegenerator", "Maak eigen QR-codes van elke tekst of link, van klein tot printklaar formaat. Gratis."] },
  "qr-reader": { en: ["QR Code Reader", "Scan and decode QR codes from uploaded images to reveal the link or text inside. Free."],
    ur: ["QR کوڈ ریڈر", "اپ لوڈ کی گئی تصاویر سے QR کوڈ اسکین کریں اور اندر کا لنک یا متن دیکھیں۔ مفت۔"],
    tr: ["QR Kod Okuyucu", "Yüklenen resimlerdeki QR kodlarını tarayın ve içindeki bağlantıyı veya metni görün. Ücretsiz."],
    ar: ["قارئ رمز QR", "امسح رموز QR من الصور المرفوعة وفك ترميزها لعرض الرابط أو النص داخلها. مجاني."],
    fa: ["خواننده کد QR", "کدهای QR را از تصاویر بارگذاری شده اسکن و رمزگشایی کنید تا پیوند یا متن داخل آن را ببینید. رایگان."],
    es: ["Lector de código QR", "Escanea y decodifica códigos QR de imágenes subidas para ver el enlace o texto dentro. Gratis."],
    it: ["Lettore di codici QR", "Scansiona e decodifica codici QR da immagini caricate per vedere il link o il testo dentro. Gratis."],
    de: ["QR-Code-Leser", "QR-Codes aus hochgeladenen Bildern scannen und decodieren, um Link oder Text zu sehen. Kostenlos."],
    nl: ["QR-codelezer", "Scan en decodeer QR-codes uit geüploade afbeeldingen om de link of tekst erin te zien. Gratis."] },
  "favicon-generator": { en: ["Favicon Generator", "Generate favicon PNGs in 16, 32, 48 and 180px sizes from any image. Free."],
    ur: ["فیویکان جنریٹر", "کسی بھی تصویر سے 16، 32، 48 اور 180 پکسل سائز کے فیویکان PNG بنائیں۔ مفت۔"],
    tr: ["Favicon Oluşturucu", "Herhangi bir resimden 16, 32, 48 ve 180 piksel boyutlarında favicon PNG dosyaları oluşturun. Ücretsiz."],
    ar: ["مولد الأيقونات", "أنشئ أيقونات PNG بمقاسات 16 و32 و48 و180 بكسل من أي صورة. مجاني."],
    fa: ["سازنده فاوآیکون", "فاوآیکون های PNG در اندازه های 16 و 32 و 48 و 180 پیکسل از هر تصویر بسازید. رایگان."],
    es: ["Generador de favicon", "Genera favicons PNG de 16, 32, 48 y 180 px desde cualquier imagen. Gratis."],
    it: ["Generatore di favicon", "Genera favicon PNG da 16, 32, 48 e 180 px da qualsiasi immagine. Gratis."],
    de: ["Favicon-Generator", "Favicon-PNGs in 16, 32, 48 und 180 px aus einem Bild erstellen. Kostenlos."],
    nl: ["Favicongenerator", "Genereer favicon-PNGs van 16, 32, 48 en 180 px uit elke afbeelding. Gratis."] },
  "background-remover": { en: ["AI Background Remover", "Remove any photo background with free AI, right in your browser. Private, no signup."],
    ur: ["AI بیک گراؤنڈ ریموور", "مفت AI سے کسی بھی تصویر کا پس منظر اپنے براؤزر میں ہٹائیں۔ نجی، بغیر سائن اپ۔"],
    tr: ["YZ Arka Plan Kaldırıcı", "Ücretsiz yapay zekayla herhangi bir fotoğrafın arka planını tarayıcınızda kaldırın. Gizli."],
    ar: ["إزالة خلفية الصور بالذكاء الاصطناعي", "أزل خلفية أي صورة بالذكاء الاصطناعي المجاني في متصفحك. خاص ودون تسجيل."],
    fa: ["حذف پس زمینه با هوش مصنوعی", "پس زمینه هر عکس را با هوش مصنوعی رایگان در مرورگر خود حذف کنید. خصوصی و بدون ثبت نام."],
    es: ["Quitar fondo con IA", "Quita el fondo de cualquier foto con IA gratis, en tu navegador. Privado, sin registro."],
    it: ["Rimuovi sfondo con IA", "Rimuovi lo sfondo di qualsiasi foto con IA gratuita, nel tuo browser. Privato, senza registrazione."],
    de: ["KI-Hintergrundentferner", "Den Hintergrund eines Fotos mit kostenloser KI direkt im Browser entfernen. Privat."],
    nl: ["AI-achtergrondverwijderaar", "Verwijder de achtergrond van elke foto met gratis AI, in je browser. Privé, geen aanmelding."] },
  "word-counter": { en: ["Word Counter", "Count words, characters, sentences and reading time in real time as you type. Free."],
    ur: ["ورڈ کاؤنٹر", "ٹائپ کرتے ہی الفاظ، حروف، جملے اور پڑھنے کا وقت فوراً گنیں۔ مفت۔"],
    tr: ["Kelime Sayacı", "Yazarken kelime, karakter, cümle ve okuma süresini gerçek zamanlı sayın. Ücretsiz."],
    ar: ["عداد الكلمات", "عد الكلمات والحروف والجمل ووقت القراءة في الوقت الحقيقي أثناء الكتابة. مجاني."],
    fa: ["شمارنده کلمات", "کلمات، حروف، جملات و زمان خواندن را هنگام تایپ به صورت زنده بشمارید. رایگان."],
    es: ["Contador de palabras", "Cuenta palabras, caracteres, frases y tiempo de lectura en tiempo real mientras escribes. Gratis."],
    it: ["Conta parole", "Conta parole, caratteri, frasi e tempo di lettura in tempo reale mentre scrivi. Gratis."],
    de: ["Wortzähler", "Wörter, Zeichen, Sätze und Lesezeit in Echtzeit beim Tippen zählen. Kostenlos."],
    nl: ["Woordenteller", "Tel woorden, tekens, zinnen en leestijd in realtime terwijl je typt. Gratis."] },
  "character-counter": { en: ["Character Counter", "Get live character, line and whitespace-free counts for any text you type or paste. Free."],
    ur: ["کریکٹر کاؤنٹر", "کسی بھی متن کے حروف، لائنوں اور خالی جگہ کے بغیر تعداد فوراً دیکھیں۔ مفت۔"],
    tr: ["Karakter Sayacı", "Yazdığınız veya yapıştırdığınız metin için canlı karakter, satır ve boşluksuz sayım alın. Ücretsiz."],
    ar: ["عداد الحروف", "احصل على عدد مباشر للحروف والأسطر ودون فراغات لأي نص تكتبه أو تلصقه. مجاني."],
    fa: ["شمارنده حروف", "تعداد زنده حروف، خطوط و بدون فاصله را برای هر متنی که تایپ یا الصاق می کنید بگیرید. رایگان."],
    es: ["Contador de caracteres", "Obtén recuentos en vivo de caracteres, líneas y sin espacios para cualquier texto. Gratis."],
    it: ["Conta caratteri", "Ottieni conteggi in tempo reale di caratteri, righe e senza spazi per qualsiasi testo. Gratis."],
    de: ["Zeichenzähler", "Live-Zählung von Zeichen, Zeilen und ohne Leerzeichen für jeden Text erhalten. Kostenlos."],
    nl: ["Tekenteller", "Krijg live tellingen van tekens, regels en zonder spaties voor elke tekst. Gratis."] },
  "case-converter": { en: ["Text Case Converter", "Convert text to UPPERCASE, lowercase, Title Case and more in one click. Free."],
    ur: ["ٹیکسٹ کیس کنورٹر", "متن کو ایک کلک میں بڑے حروف، چھوٹے حروف، ٹائٹل کیس اور مزید میں بدلیں۔ مفت۔"],
    tr: ["Metin Büyük Küçük Harf Dönüştürücü", "Metni tek tıkla BÜYÜK HARF, küçük harf, Başlık Durumu ve daha fazlasına dönüştürün. Ücretsiz."],
    ar: ["محول حالة النص", "حول النص إلى أحرف كبيرة وصغيرة وحالة العناوين وغيرها بنقرة واحدة. مجاني."],
    fa: ["تبدیل حالت متن", "متن را با یک کلیک به حروف بزرگ، کوچک، حالت عنوان و بیشتر تبدیل کنید. رایگان."],
    es: ["Convertir mayúsculas y minúsculas", "Convierte texto a MAYÚSCULAS, minúsculas, Tipo Título y más con un clic. Gratis."],
    it: ["Converti maiuscole e minuscole", "Converti il testo in MAIUSCOLO, minuscolo, Titolo e altro con un clic. Gratis."],
    de: ["Text-Großschreibung ändern", "Text mit einem Klick in GROSSBUCHSTABEN, Kleinbuchstaben, Titel-Schreibweise u. v. m. umwandeln. Kostenlos."],
    nl: ["Tekst hoofdletterconverter", "Zet tekst met één klik om naar HOOFDLETTERS, kleine letters, Titelstijl en meer. Gratis."] },
  "remove-duplicates": { en: ["Remove Duplicate Lines", "Delete duplicate lines from a list, and sort or clean up entries instantly. Free."],
    ur: ["ڈپلیکیٹ لائنیں ہٹائیں", "فہرست سے دہرائی گئی لائنیں حذف کریں اور اندراجات فوراً ترتیب دیں یا صاف کریں۔ مفت۔"],
    tr: ["Yinelenen Satırları Kaldır", "Listedeki yinelenen satırları silin, girişleri anında sıralayın veya temizleyin. Ücretsiz."],
    ar: ["إزالة الأسطر المكررة", "احذف الأسطر المكررة من قائمة ورتب المدخلات أو نظفها فورا. مجاني."],
    fa: ["حذف خطوط تکراری", "خطوط تکراری را از فهرست حذف کنید و ورودی ها را فورا مرتب یا پاک کنید. رایگان."],
    es: ["Quitar líneas duplicadas", "Elimina líneas duplicadas de una lista y ordena o limpia entradas al instante. Gratis."],
    it: ["Rimuovi righe duplicate", "Elimina le righe duplicate da un elenco e ordina o pulisci le voci all'istante. Gratis."],
    de: ["Doppelte Zeilen entfernen", "Doppelte Zeilen aus einer Liste löschen und Einträge sofort sortieren oder bereinigen. Kostenlos."],
    nl: ["Dubbele regels verwijderen", "Verwijder dubbele regels uit een lijst en sorteer of ruim vermeldingen direct op. Gratis."] },
  "lorem-ipsum": { en: ["Lorem Ipsum Generator", "Generate placeholder paragraphs, sentences or words for designs and mockups. Free."],
    ur: ["لورم اپسم جنریٹر", "ڈیزائن اور خاکوں کے لیے نمونہ پیراگراف، جملے یا الفاظ بنائیں۔ مفت۔"],
    tr: ["Lorem Ipsum Oluşturucu", "Tasarımlar ve taslaklar için yer tutucu paragraflar, cümleler veya kelimeler oluşturun. Ücretsiz."],
    ar: ["مولد لوريم إيبسوم", "أنشئ فقرات أو جملا أو كلمات مؤقتة للتصاميم والنماذج. مجاني."],
    fa: ["سازنده لورم ایپسوم", "پاراگراف ها، جملات یا کلمات نمونه برای طرح ها و پیش نویس ها بسازید. رایگان."],
    es: ["Generador de Lorem Ipsum", "Genera párrafos, frases o palabras de relleno para diseños y maquetas. Gratis."],
    it: ["Generatore di Lorem Ipsum", "Genera paragrafi, frasi o parole segnaposto per design e bozze. Gratis."],
    de: ["Lorem-Ipsum-Generator", "Platzhalter-Absätze, Sätze oder Wörter für Designs und Entwürfe erstellen. Kostenlos."],
    nl: ["Lorem Ipsum-generator", "Genereer tijdelijke alinea's, zinnen of woorden voor ontwerpen en mockups. Gratis."] },
  "text-reverser": { en: ["Text Reverser", "Reverse text, words or line order with one click. Free and private."],
    ur: ["ٹیکسٹ ریورسر", "ایک کلک سے متن، الفاظ یا لائنوں کی ترتیب الٹ دیں۔ مفت اور نجی۔"],
    tr: ["Metin Ters Çevirici", "Metni, kelimeleri veya satır sırasını tek tıkla ters çevirin. Ücretsiz ve gizli."],
    ar: ["عكس النص", "اعكس النص أو الكلمات أو ترتيب الأسطر بنقرة واحدة. مجاني وخاص."],
    fa: ["معکوس کننده متن", "متن، کلمات یا ترتیب خطوط را با یک کلیک معکوس کنید. رایگان و خصوصی."],
    es: ["Invertir texto", "Invierte texto, palabras u orden de líneas con un clic. Gratis y privado."],
    it: ["Inverti testo", "Inverti testo, parole o ordine delle righe con un clic. Gratis e privato."],
    de: ["Text umkehren", "Text, Wörter oder Zeilenreihenfolge mit einem Klick umkehren. Kostenlos und privat."],
    nl: ["Tekst omkeren", "Keer tekst, woorden of regelvolgorde om met één klik. Gratis en privé."] },
  "whitespace-remover": { en: ["Whitespace Remover", "Clean extra spaces, blank lines and messy formatting from pasted text. Free."],
    ur: ["وائٹ اسپیس ریموور", "کاپی شدہ متن سے اضافی خالی جگہیں، خالی لائنیں اور بگڑی فارمیٹنگ صاف کریں۔ مفت۔"],
    tr: ["Boşluk Temizleyici", "Yapıştırılan metindeki fazla boşlukları, boş satırları ve bozuk biçimlendirmeyi temizleyin. Ücretsiz."],
    ar: ["مزيل الفراغات", "نظف المسافات الزائدة والأسطر الفارغة والتنسيق الفوضوي من النص الملصوق. مجاني."],
    fa: ["حذف فاصله های اضافی", "فاصله های اضافی، خطوط خالی و قالب بندی به هم ریخته را از متن الصاق شده پاک کنید. رایگان."],
    es: ["Quitar espacios en blanco", "Limpia espacios extra, líneas en blanco y formato desordenado del texto pegado. Gratis."],
    it: ["Rimuovi spazi bianchi", "Pulisci spazi extra, righe vuote e formattazione disordinata dal testo incollato. Gratis."],
    de: ["Leerzeichen entfernen", "Überflüssige Leerzeichen, Leerzeilen und unordentliche Formatierung aus Text entfernen. Kostenlos."],
    nl: ["Witruimteverwijderaar", "Ruim extra spaties, lege regels en rommelige opmaak op uit geplakte tekst. Gratis."] },
  "base64": { en: ["Base64 Encoder / Decoder", "Encode text to Base64 or decode Base64 back to readable text. Free and private."],
    ur: ["Base64 انکوڈر / ڈیکوڈر", "متن کو Base64 میں بدلیں یا Base64 کو واپس پڑھنے والے متن میں لائیں۔ مفت اور نجی۔"],
    tr: ["Base64 Kodlayıcı / Kod Çözücü", "Metni Base64 formatına kodlayın veya Base64 kodunu okunabilir metne çevirin. Ücretsiz."],
    ar: ["ترميز وفك ترميز Base64", "رمز النص إلى Base64 أو أعد فك ترميز Base64 إلى نص مقروء. مجاني وخاص."],
    fa: ["کدگذار و رمزگشای Base64", "متن را به Base64 کدگذاری کنید یا Base64 را به متن خوانا برگردانید. رایگان و خصوصی."],
    es: ["Codificador / decodificador Base64", "Codifica texto a Base64 o decodifica Base64 a texto legible. Gratis y privado."],
    it: ["Codificatore / decodificatore Base64", "Codifica testo in Base64 o decodifica Base64 in testo leggibile. Gratis e privato."],
    de: ["Base64-Kodierer / -Dekodierer", "Text in Base64 kodieren oder Base64 zurück in lesbaren Text dekodieren. Kostenlos."],
    nl: ["Base64-codering / -decodering", "Codeer tekst naar Base64 of decodeer Base64 terug naar leesbare tekst. Gratis en privé."] },
  "url-encoder": { en: ["URL Encoder / Decoder", "Percent-encode URLs for safe use in links, or decode them back to readable text. Free."],
    ur: ["URL انکوڈر / ڈیکوڈر", "لنکس میں محفوظ استعمال کے لیے URLs کو انکوڈ کریں یا انہیں واپس پڑھنے والے متن میں لائیں۔ مفت۔"],
    tr: ["URL Kodlayıcı / Kod Çözücü", "Bağlantılarda güvenli kullanım için URLleri yüzde kodlamasıyla kodlayın veya geri çözün. Ücretsiz."],
    ar: ["ترميز وفك ترميز الروابط", "رمز الروابط بالنسبة المئوية للاستخدام الآمن، أو أعد فك ترميزها إلى نص مقروء. مجاني."],
    fa: ["کدگذار و رمزگشای URL", "نشانی ها را برای استفاده امن در پیوندها کدگذاری درصدی کنید یا به متن خوانا برگردانید. رایگان."],
    es: ["Codificador / decodificador de URL", "Codifica URL en porcentaje para uso seguro en enlaces, o decodifícalas a texto legible. Gratis."],
    it: ["Codificatore / decodificatore URL", "Codifica gli URL in percentuale per un uso sicuro nei link, o decodificali in testo leggibile. Gratis."],
    de: ["URL-Kodierer / -Dekodierer", "URLs prozentkodieren für sichere Verwendung in Links oder zurück in lesbaren Text dekodieren. Kostenlos."],
    nl: ["URL-codering / -decodering", "Codeer URLs procentueel voor veilig gebruik in links, of decodeer ze terug naar leesbare tekst. Gratis."] },
  "json-formatter": { en: ["JSON Formatter", "Beautify, minify and validate JSON data with clear error messages. Free and private."],
    ur: ["JSON فارمیٹر", "JSON ڈیٹا کو خوبصورت بنائیں، چھوٹا کریں اور واضح خامیوں کے ساتھ جانچیں۔ مفت اور نجی۔"],
    tr: ["JSON Biçimlendirici", "JSON verilerini net hata mesajlarıyla güzelleştirin, küçültün ve doğrulayın. Ücretsiz."],
    ar: ["منسق JSON", "جمل بيانات JSON وصغرها وتحقق منها برسائل خطأ واضحة. مجاني وخاص."],
    fa: ["قالب بندی JSON", "داده های JSON را با پیام های خطای روشن زیبا، کوچک و اعتبارسنجی کنید. رایگان و خصوصی."],
    es: ["Formateador JSON", "Embellece, minimiza y valida datos JSON con mensajes de error claros. Gratis y privado."],
    it: ["Formattatore JSON", "Abbellisci, minimizza e convalida dati JSON con messaggi di errore chiari. Gratis e privato."],
    de: ["JSON-Formatierer", "JSON-Daten verschönern, minimieren und mit klaren Fehlermeldungen prüfen. Kostenlos."],
    nl: ["JSON-formatter", "Maak JSON-gegevens mooi, minimaliseer en valideer ze met duidelijke foutmeldingen. Gratis en privé."] },
  "markdown-editor": { en: ["Markdown Editor", "Write Markdown and see a live HTML preview instantly. Copy HTML or download your file. Free."],
    ur: ["مارک ڈاؤن ایڈیٹر", "مارک ڈاؤن لکھیں اور فوراً لائیو HTML پیش نظارہ دیکھیں۔ HTML کاپی کریں یا فائل ڈاؤن لوڈ کریں۔ مفت۔"],
    tr: ["Markdown Düzenleyici", "Markdown yazın ve canlı HTML önizlemesini anında görün. HTML kopyalayın veya dosyanızı indirin. Ücretsiz."],
    ar: ["محرر Markdown", "اكتب Markdown وشاهد معاينة HTML مباشرة فورا. انسخ HTML أو نزل ملفك. مجاني."],
    fa: ["ویرایشگر Markdown", "Markdown بنویسید و پیش نمایش زنده HTML را فورا ببینید. HTML را کپی کنید یا فایل خود را دانلود کنید. رایگان."],
    es: ["Editor Markdown", "Escribe Markdown y ve una vista previa HTML en vivo al instante. Copia el HTML o descarga tu archivo. Gratis."],
    it: ["Editor Markdown", "Scrivi Markdown e vedi subito un'anteprima HTML dal vivo. Copia l'HTML o scarica il tuo file. Gratis."],
    de: ["Markdown-Editor", "Markdown schreiben und sofort eine Live-HTML-Vorschau sehen. HTML kopieren oder Datei laden. Kostenlos."],
    nl: ["Markdown-editor", "Schrijf Markdown en zie direct een live HTML-voorbeeld. Kopieer HTML of download je bestand. Gratis."] },
  "age-calculator": { en: ["Age Calculator", "Calculate exact age in years, months and days, plus total days lived. Free."],
    ur: ["عمر کیلکولیٹر", "سالوں، مہینوں اور دنوں میں درست عمر حساب کریں، اور کل گزارے دن بھی دیکھیں۔ مفت۔"],
    tr: ["Yaş Hesaplayıcı", "Yıl, ay ve gün olarak tam yaşı ve toplam yaşanan günü hesaplayın. Ücretsiz."],
    ar: ["حاسبة العمر", "احسب العمر الدقيق بالسنوات والأشهر والأيام، إضافة إلى إجمالي الأيام المعيشة. مجاني."],
    fa: ["محاسبه گر سن", "سن دقیق را به سال، ماه و روز محاسبه کنید، به علاوه کل روزهای زندگی شده. رایگان."],
    es: ["Calculadora de edad", "Calcula la edad exacta en años, meses y días, más el total de días vividos. Gratis."],
    it: ["Calcolatore di età", "Calcola l'età esatta in anni, mesi e giorni, più il totale dei giorni vissuti. Gratis."],
    de: ["Altersrechner", "Genaues Alter in Jahren, Monaten und Tagen berechnen, plus insgesamt gelebte Tage. Kostenlos."],
    nl: ["Leeftijdscalculator", "Bereken de exacte leeftijd in jaren, maanden en dagen, plus het totaal aantal geleefde dagen. Gratis."] },
  "bmi-calculator": { en: ["BMI Calculator", "Compute your Body Mass Index and see which health category it falls in. Free."],
    ur: ["BMI کیلکولیٹر", "اپنا باڈی ماس انڈیکس حساب کریں اور دیکھیں کہ یہ کس صحت کی کیٹیگری میں آتا ہے۔ مفت۔"],
    tr: ["VKİ Hesaplayıcı", "Vücut Kitle İndeksinizi hesaplayın ve hangi sağlık kategorisine girdiğini görün. Ücretsiz."],
    ar: ["حاسبة مؤشر كتلة الجسم", "احسب مؤشر كتلة جسمك واعرف الفئة الصحية التي يقع فيها. مجاني."],
    fa: ["محاسبه گر BMI", "شاخص توده بدنی خود را محاسبه کنید و ببینید در کدام دسته سلامتی قرار می گیرد. رایگان."],
    es: ["Calculadora de IMC", "Calcula tu índice de masa corporal y ve en qué categoría de salud cae. Gratis."],
    it: ["Calcolatore BMI", "Calcola il tuo indice di massa corporea e vedi in quale categoria di salute rientra. Gratis."],
    de: ["BMI-Rechner", "Body-Mass-Index berechnen und sehen, in welche Gesundheitskategorie er fällt. Kostenlos."],
    nl: ["BMI-calculator", "Bereken je body mass index en zie in welke gezondheidscategorie deze valt. Gratis."] },
  "loan-calculator": { en: ["Loan / EMI Calculator", "Calculate monthly loan payments, total interest and the total amount payable. Free."],
    ur: ["قرض / EMI کیلکولیٹر", "ماہانہ قرض کی قسط، کل سود اور کل قابل ادائیگی رقم حساب کریں۔ مفت۔"],
    tr: ["Kredi / Taksit Hesaplayıcı", "Aylık kredi ödemelerini, toplam faizi ve toplam ödenecek tutarı hesaplayın. Ücretsiz."],
    ar: ["حاسبة القروض والأقساط", "احسب دفعات القرض الشهرية وإجمالي الفائدة والمبلغ الإجمالي المستحق. مجاني."],
    fa: ["محاسبه گر وام", "پرداخت های ماهانه وام، کل بهره و مبلغ کل قابل پرداخت را محاسبه کنید. رایگان."],
    es: ["Calculadora de préstamo", "Calcula pagos mensuales del préstamo, interés total y cantidad total a pagar. Gratis."],
    it: ["Calcolatore di prestito", "Calcola le rate mensili del prestito, gli interessi totali e l'importo totale da pagare. Gratis."],
    de: ["Kreditrechner", "Monatliche Kreditraten, Gesamtzinsen und Gesamtbetrag berechnen. Kostenlos."],
    nl: ["Leningcalculator", "Bereken maandelijkse leningbetalingen, totale rente en het totaal te betalen bedrag. Gratis."] },
  "percentage-calculator": { en: ["Percentage Calculator", "Solve any percentage problem: of, change, increase or decrease. Free and instant."],
    ur: ["فیصد کیلکولیٹر", "فیصد کا کوئی بھی مسئلہ حل کریں: کا، تبدیلی، اضافہ یا کمی۔ مفت اور فوری۔"],
    tr: ["Yüzde Hesaplayıcı", "Herhangi bir yüzde problemini çözün: oranı, değişimi, artışı veya azalışı. Ücretsiz."],
    ar: ["حاسبة النسبة المئوية", "حل أي مسألة نسبة مئوية: النسبة أو التغير أو الزيادة أو النقصان. مجاني وفوري."],
    fa: ["محاسبه گر درصد", "هر مسئله درصدی را حل کنید: مقدار، تغییر، افزایش یا کاهش. رایگان و فوری."],
    es: ["Calculadora de porcentaje", "Resuelve cualquier problema de porcentaje: de, cambio, aumento o disminución. Gratis."],
    it: ["Calcolatore di percentuale", "Risolvi qualsiasi problema di percentuale: di, variazione, aumento o diminuzione. Gratis."],
    de: ["Prozentrechner", "Jedes Prozentproblem lösen: Anteil, Änderung, Erhöhung oder Senkung. Kostenlos."],
    nl: ["Percentagecalculator", "Los elk percentageprobleem op: van, verandering, stijging of daling. Gratis en direct."] },
  "tip-calculator": { en: ["Tip Calculator", "Split restaurant bills and calculate tips per person in seconds. Free."],
    ur: ["ٹپ کیلکولیٹر", "ریسٹورنٹ کا بل تقسیم کریں اور فی شخص ٹپ سیکنڈوں میں حساب کریں۔ مفت۔"],
    tr: ["Bahşiş Hesaplayıcı", "Restoran hesaplarını bölün ve kişi başına bahşişi saniyeler içinde hesaplayın. Ücretsiz."],
    ar: ["حاسبة الإكرامية", "قسم فواتير المطاعم واحسب الإكرامية لكل شخص في ثوان. مجاني."],
    fa: ["محاسبه گر انعام", "صورتحساب رستوران را تقسیم کنید و انعام هر نفر را در چند ثانیه محاسبه کنید. رایگان."],
    es: ["Calculadora de propina", "Divide cuentas de restaurante y calcula la propina por persona en segundos. Gratis."],
    it: ["Calcolatore di mancia", "Dividi i conti del ristorante e calcola la mancia a persona in pochi secondi. Gratis."],
    de: ["Trinkgeldrechner", "Restaurantrechnungen aufteilen und Trinkgeld pro Person in Sekunden berechnen. Kostenlos."],
    nl: ["Fooiencalculator", "Splits restaurantrekeningen en bereken de fooi per persoon in seconden. Gratis."] },
  "discount-calculator": { en: ["Discount Calculator", "See the final sale price and exactly how much you save on any discount. Free."],
    ur: ["ڈسکاؤنٹ کیلکولیٹر", "حتمی سیل قیمت دیکھیں اور جانیں کہ کسی بھی ڈسکاؤنٹ پر آپ کتنا بچاتے ہیں۔ مفت۔"],
    tr: ["İndirim Hesaplayıcı", "Nihai satış fiyatını ve herhangi bir indirimde tam olarak ne kadar tasarruf ettiğinizi görün. Ücretsiz."],
    ar: ["حاسبة الخصم", "اعرف سعر البيع النهائي ومقدار ما توفره بالضبط مع أي خصم. مجاني."],
    fa: ["محاسبه گر تخفیف", "قیمت نهایی فروش و مقدار دقیق صرفه جویی در هر تخفیف را ببینید. رایگان."],
    es: ["Calculadora de descuento", "Ve el precio final de venta y exactamente cuánto ahorras con cualquier descuento. Gratis."],
    it: ["Calcolatore di sconto", "Vedi il prezzo finale di vendita e quanto risparmi esattamente con qualsiasi sconto. Gratis."],
    de: ["Rabattrechner", "Endgültigen Verkaufspreis sehen und genau sehen, wie viel bei einem Rabatt gespart wird. Kostenlos."],
    nl: ["Kortingscalculator", "Zie de uiteindelijke verkoopprijs en precies hoeveel je bespaart bij elke korting. Gratis."] },
  "currency-converter": { en: ["Currency Converter", "Convert between 12 world currencies using indicative rates, for quick estimates. Free."],
    ur: ["کرنسی کنورٹر", "اشاراتی ریٹس سے 12 عالمی کرنسیوں کے درمیان تبدیلی کریں، فوری اندازے کے لیے۔ مفت۔"],
    tr: ["Döviz Çevirici", "Hızlı tahminler için gösterge kurlarıyla 12 dünya para birimi arasında dönüştürün. Ücretsiz."],
    ar: ["محول العملات", "حول بين 12 عملة عالمية بأسعار إرشادية لتقديرات سريعة. مجاني."],
    fa: ["تبدیل ارز", "بین 12 ارز جهان با نرخ های راهنما برای برآورد سریع تبدیل کنید. رایگان."],
    es: ["Convertidor de moneda", "Convierte entre 12 monedas del mundo con tasas indicativas, para estimaciones rápidas. Gratis."],
    it: ["Convertitore di valuta", "Converti tra 12 valute mondiali con tassi indicativi, per stime rapide. Gratis."],
    de: ["Währungsumrechner", "Zwischen 12 Weltwährungen mit Richtkursen umrechnen, für schnelle Schätzungen. Kostenlos."],
    nl: ["Valutaomzetter", "Reken om tussen 12 wereldvaluta's met indicatieve koersen, voor snelle schattingen. Gratis."] },
  "unit-converter": { en: ["Unit Converter", "Convert length, weight, temperature, volume, speed and data units instantly. Free."],
    ur: ["یونٹ کنورٹر", "لمبائی، وزن، درجہ حرارت، حجم، رفتار اور ڈیٹا یونٹس فوراً تبدیل کریں۔ مفت۔"],
    tr: ["Birim Dönüştürücü", "Uzunluk, ağırlık, sıcaklık, hacim, hız ve veri birimlerini anında dönüştürün. Ücretsiz."],
    ar: ["محول الوحدات", "حول وحدات الطول والوزن والحرارة والحجم والسرعة والبيانات فورا. مجاني."],
    fa: ["تبدیل واحد", "واحدهای طول، وزن، دما، حجم، سرعت و داده را فورا تبدیل کنید. رایگان."],
    es: ["Convertidor de unidades", "Convierte unidades de longitud, peso, temperatura, volumen, velocidad y datos al instante. Gratis."],
    it: ["Convertitore di unità", "Converti unità di lunghezza, peso, temperatura, volume, velocità e dati all'istante. Gratis."],
    de: ["Einheitenumrechner", "Längen-, Gewichts-, Temperatur-, Volumen-, Geschwindigkeits- und Dateneinheiten sofort umrechnen. Kostenlos."],
    nl: ["Eenhedenomzetter", "Reken lengte-, gewicht-, temperatuur-, volume-, snelheids- en data-eenheden direct om. Gratis."] },
  "timezone-converter": { en: ["Time Zone Converter", "Convert a date and time between world time zones, for meetings across countries. Free."],
    ur: ["ٹائم زون کنورٹر", "دوسرے ملکوں کے ساتھ میٹنگز کے لیے تاریخ و وقت کو عالمی ٹائم زونز کے درمیان بدلیں۔ مفت۔"],
    tr: ["Saat Dilimi Dönüştürücü", "Ülkeler arası toplantılar için tarih ve saati dünya saat dilimleri arasında dönüştürün. Ücretsiz."],
    ar: ["محول المناطق الزمنية", "حول التاريخ والوقت بين المناطق الزمنية العالمية لاجتماعات عبر البلدان. مجاني."],
    fa: ["تبدیل منطقه زمانی", "تاریخ و ساعت را بین مناطق زمانی جهان برای جلسات بین کشورها تبدیل کنید. رایگان."],
    es: ["Convertidor de zona horaria", "Convierte fecha y hora entre zonas horarias del mundo, para reuniones entre países. Gratis."],
    it: ["Convertitore di fuso orario", "Converti data e ora tra i fusi orari del mondo, per riunioni tra paesi. Gratis."],
    de: ["Zeitzonen-Umrechner", "Datum und Uhrzeit zwischen Weltzeitzonen umrechnen, für Meetings über Länder hinweg. Kostenlos."],
    nl: ["Tijdzoneomzetter", "Reken datum en tijd om tussen wereldtijdzones, voor vergaderingen tussen landen. Gratis."] },
  "date-duration": { en: ["Date Duration Calculator", "Find the days, weeks and months between any two dates. Free and instant."],
    ur: ["تاریخ دورانیہ کیلکولیٹر", "کسی بھی دو تاریخوں کے درمیان دن، ہفتے اور مہینے معلوم کریں۔ مفت اور فوری۔"],
    tr: ["Tarih Süresi Hesaplayıcı", "Herhangi iki tarih arasındaki gün, hafta ve ayları bulun. Ücretsiz."],
    ar: ["حاسبة مدة التاريخ", "اعرف الأيام والأسابيع والأشهر بين أي تاريخين. مجاني وفوري."],
    fa: ["محاسبه گر مدت تاریخ", "روزها، هفته ها و ماه های بین هر دو تاریخ را پیدا کنید. رایگان و فوری."],
    es: ["Calculadora de duración entre fechas", "Encuentra los días, semanas y meses entre dos fechas cualesquiera. Gratis."],
    it: ["Calcolatore di durata tra date", "Trova giorni, settimane e mesi tra due date qualsiasi. Gratis."],
    de: ["Datumsdauer-Rechner", "Tage, Wochen und Monate zwischen zwei Daten finden. Kostenlos."],
    nl: ["Datumduurcalculator", "Vind de dagen, weken en maanden tussen twee datums. Gratis en direct."] },
  "password-generator": { en: ["Password Generator", "Create strong, random passwords with custom length and character sets. On your device only."],
    ur: ["پاس ورڈ جنریٹر", "اپنی مرضی کی لمبائی اور حروف کے ساتھ مضبوط، بے ترتیب پاس ورڈ بنائیں۔ صرف آپ کی ڈیوائس پر۔"],
    tr: ["Şifre Oluşturucu", "Özel uzunluk ve karakter kümeleriyle güçlü, rastgele şifreler oluşturun. Yalnızca cihazınızda."],
    ar: ["مولد كلمات المرور", "أنشئ كلمات مرور قوية وعشوائية بطول ومجموعات حروف مخصصة. على جهازك فقط."],
    fa: ["سازنده رمز عبور", "رمزهای عبور قوی و تصادفی با طول و مجموعه حروف دلخواه بسازید. فقط روی دستگاه شما."],
    es: ["Generador de contraseñas", "Crea contraseñas fuertes y aleatorias con longitud y caracteres personalizados. Solo en tu dispositivo."],
    it: ["Generatore di password", "Crea password forti e casuali con lunghezza e caratteri personalizzati. Solo sul tuo dispositivo."],
    de: ["Passwort-Generator", "Starke, zufällige Passwörter mit eigener Länge und Zeichensätzen erstellen. Nur auf deinem Gerät."],
    nl: ["Wachtwoordgenerator", "Maak sterke, willekeurige wachtwoorden met eigen lengte en tekensets. Alleen op jouw apparaat."] },
  "hash-generator": { en: ["Hash Generator", "Generate SHA-256 hashes of any text, locally on your device. Nothing is sent anywhere."],
    ur: ["ہیش جنریٹر", "کسی بھی متن کا SHA-256 ہیش اپنی ڈیوائس پر مقامی طور پر بنائیں۔ کچھ کہیں نہیں بھیجا جاتا۔"],
    tr: ["Hash Oluşturucu", "Herhangi bir metnin SHA-256 karmasını cihazınızda yerel olarak oluşturun. Hiçbir şey gönderilmez."],
    ar: ["مولد التجزئة", "أنشئ تجزئة SHA-256 لأي نص محليا على جهازك. لا يتم إرسال أي شيء إلى أي مكان."],
    fa: ["سازنده هش", "هش SHA-256 هر متنی را به صورت محلی روی دستگاه خود بسازید. چیزی به جایی ارسال نمی شود."],
    es: ["Generador de hash", "Genera hashes SHA-256 de cualquier texto, localmente en tu dispositivo. Nada se envía a ningún lado."],
    it: ["Generatore di hash", "Genera hash SHA-256 di qualsiasi testo, localmente sul tuo dispositivo. Nulla viene inviato altrove."],
    de: ["Hash-Generator", "SHA-256-Hashes eines Textes lokal auf dem Gerät erzeugen. Nichts wird versendet."],
    nl: ["Hashgenerator", "Genereer SHA-256-hashes van elke tekst, lokaal op je apparaat. Er wordt niets verzonden."] },
  "random-number": { en: ["Random Number Generator", "Generate secure random numbers in any range, with an option for unique values. Free."],
    ur: ["رینڈم نمبر جنریٹر", "کسی بھی حد میں محفوظ بے ترتیب نمبر بنائیں، منفرد قیمتوں کے آپشن کے ساتھ۔ مفت۔"],
    tr: ["Rastgele Sayı Oluşturucu", "Herhangi bir aralıkta güvenli rastgele sayılar oluşturun, benzersiz değer seçeneğiyle. Ücretsiz."],
    ar: ["مولد الأرقام العشوائية", "أنشئ أرقاما عشوائية آمنة في أي نطاق مع خيار القيم الفريدة. مجاني."],
    fa: ["سازنده عدد تصادفی", "اعداد تصادفی امن در هر بازه بسازید، با گزینه مقادیر یکتا. رایگان."],
    es: ["Generador de números aleatorios", "Genera números aleatorios seguros en cualquier rango, con opción de valores únicos. Gratis."],
    it: ["Generatore di numeri casuali", "Genera numeri casuali sicuri in qualsiasi intervallo, con opzione per valori unici. Gratis."],
    de: ["Zufallszahlengenerator", "Sichere Zufallszahlen in beliebigem Bereich erzeugen, mit Option für einmalige Werte. Kostenlos."],
    nl: ["Willekeurige-getallengenerator", "Genereer veilige willekeurige getallen in elk bereik, met optie voor unieke waarden. Gratis."] },
  "coin-flip": { en: ["Coin Flip", "Flip a virtual coin and see heads or tails, with live running stats. Free."],
    ur: ["کوائن فلپ", "ورچوئل سکہ اچھالیں اور ہیڈ یا ٹیل دیکھیں، لائیو اعداد کے ساتھ۔ مفت۔"],
    tr: ["Yazı Tura", "Sanal bir para atın, yazı mı tura mı görün, canlı istatistiklerle. Ücretsiz."],
    ar: ["رمي العملة", "ارم عملة افتراضية واعرف الوجه أو الظهر مع إحصاءات مباشرة. مجاني."],
    fa: ["پرتاب سکه", "یک سکه مجازی پرتاب کنید و شیر یا خط را با آمار زنده ببینید. رایگان."],
    es: ["Lanzar moneda", "Lanza una moneda virtual y ve cara o cruz, con estadísticas en vivo. Gratis."],
    it: ["Lancio della moneta", "Lancia una moneta virtuale e vedi testa o croce, con statistiche in tempo reale. Gratis."],
    de: ["Münzwurf", "Eine virtuelle Münze werfen, Kopf oder Zahl sehen, mit Live-Statistik. Kostenlos."],
    nl: ["Muntje opgooien", "Gooi een virtuele munt en zie kop of munt, met live statistieken. Gratis."] },
  "dice-roller": { en: ["Dice Roller", "Roll any number of dice with any number of sides, instantly. Free."],
    ur: ["ڈائس رولر", "کسی بھی تعداد کے ڈائس کسی بھی تعداد کی سائیڈز کے ساتھ فوراً پھینکیں۔ مفت۔"],
    tr: ["Zar Atıcı", "Herhangi sayıda zarı, herhangi sayıda yüzle anında atın. Ücretsiz."],
    ar: ["رمي النرد", "ارم أي عدد من أحجار النرد بأي عدد من الأوجه فورا. مجاني."],
    fa: ["پرتاب تاس", "هر تعداد تاس را با هر تعداد وجه فورا پرتاب کنید. رایگان."],
    es: ["Lanzar dados", "Lanza cualquier cantidad de dados con cualquier cantidad de caras, al instante. Gratis."],
    it: ["Lancia dadi", "Lancia un numero qualsiasi di dadi con un numero qualsiasi di facce, all'istante. Gratis."],
    de: ["Würfel werfen", "Beliebig viele Würfel mit beliebig vielen Seiten sofort werfen. Kostenlos."],
    nl: ["Dobbelstenen gooien", "Gooi direct een willekeurig aantal dobbelstenen met een willekeurig aantal zijden. Gratis."] },
  "password-strength-checker": { en: ["Password Strength Checker", "Score your password live with crack-time estimates and improvement tips. Private."],
    ur: ["پاس ورڈ طاقت چیکر", "اپنے پاس ورڈ کا اسکور لائیو دیکھیں، کریک ٹائم اندازے اور بہتری کی تجاویز کے ساتھ۔ نجی۔"],
    tr: ["Şifre Güç Denetleyici", "Şifrenizi kırılma süresi tahminleri ve iyileştirme ipuçlarıyla canlı puanlayın. Gizli."],
    ar: ["مدقق قوة كلمة المرور", "قيم كلمة مرورك مباشرة مع تقديرات وقت الاختراق ونصائح التحسين. خاص."],
    fa: ["بررسی قدرت رمز عبور", "رمز عبور خود را به صورت زنده با برآورد زمان شکستن و نکته های بهبود امتیاز دهید. خصوصی."],
    es: ["Comprobar fortaleza de contraseña", "Puntúa tu contraseña en vivo con estimaciones de tiempo de descifrado y consejos. Privado."],
    it: ["Verifica robustezza password", "Valuta la tua password in tempo reale con stime di tempo di attacco e consigli. Privato."],
    de: ["Passwortstärke prüfen", "Passwort live bewerten, mit Knackzeit-Schätzung und Verbesserungstipps. Privat."],
    nl: ["Wachtwoordsterkte controleren", "Beoordeel je wachtwoord live met kraaktijdschattingen en verbetertips. Privé."] },
  "ip-lookup": { en: ["IP Lookup", "Look up any IP address or domain to see its city, country, ISP and timezone. Free."],
    ur: ["IP لک اپ", "کسی بھی IP ایڈریس یا ڈومین کو دیکھیں اور اس کا شہر، ملک، ISP اور ٹائم زون جانیں۔ مفت۔"],
    tr: ["IP Sorgulama", "Herhangi bir IP adresini veya alan adını sorgulayın, şehir, ülke, ISS ve saat dilimini görün. Ücretsiz."],
    ar: ["البحث عن عنوان IP", "ابحث عن أي عنوان IP أو نطاق لعرض مدينته وبلده ومزود الخدمة ومنطقته الزمنية. مجاني."],
    fa: ["جستجوی IP", "هر آدرس IP یا دامنه را جستجو کنید تا شهر، کشور، ارائه دهنده و منطقه زمانی آن را ببینید. رایگان."],
    es: ["Consultar IP", "Consulta cualquier dirección IP o dominio para ver su ciudad, país, ISP y zona horaria. Gratis."],
    it: ["Ricerca IP", "Cerca qualsiasi indirizzo IP o dominio per vedere città, paese, ISP e fuso orario. Gratis."],
    de: ["IP-Abfrage", "Eine IP-Adresse oder Domain abfragen und Stadt, Land, Anbieter und Zeitzone sehen. Kostenlos."],
    nl: ["IP-opzoeken", "Zoek een IP-adres of domein op en zie de stad, het land, de provider en de tijdzone. Gratis."] },
  "security-headers-checker": { en: ["Security Headers Checker", "Check a website's HTTP security headers, with plain-language explanations. Free."],
    ur: ["سیکیورٹی ہیڈرز چیکر", "کسی ویب سائٹ کے HTTP سیکیورٹی ہیڈرز سادہ وضاحتوں کے ساتھ چیک کریں۔ مفت۔"],
    tr: ["Güvenlik Başlıkları Denetleyici", "Bir web sitesinin HTTP güvenlik başlıklarını sade açıklamalarla denetleyin. Ücretsiz."],
    ar: ["مدقق رؤوس الأمان", "تحقق من رؤوس أمان HTTP لأي موقع مع شروحات بلغة بسيطة. مجاني."],
    fa: ["بررسی سربرگ های امنیتی", "سربرگ های امنیتی HTTP یک وب سایت را با توضیحات ساده بررسی کنید. رایگان."],
    es: ["Comprobar encabezados de seguridad", "Comprueba los encabezados HTTP de seguridad de un sitio, con explicaciones claras. Gratis."],
    it: ["Verifica intestazioni di sicurezza", "Controlla le intestazioni HTTP di sicurezza di un sito, con spiegazioni semplici. Gratis."],
    de: ["Sicherheits-Header prüfen", "HTTP-Sicherheitsheader einer Website prüfen, mit einfachen Erklärungen. Kostenlos."],
    nl: ["Beveiligingsheaders controleren", "Controleer de HTTP-beveiligingsheaders van een website, met eenvoudige uitleg. Gratis."] },
  "phishing-url-checker": { en: ["Phishing URL Checker", "Analyse a suspicious URL for phishing risk before you click it. A first-pass check only. Free."],
    ur: ["فشنگ URL چیکر", "کلک کرنے سے پہلے مشکوک لنک کا فشنگ خطرہ جانچیں۔ یہ صرف ابتدائی جانچ ہے۔ مفت۔"],
    tr: ["Kimlik Avı URL Denetleyici", "Tıklamadan önce şüpheli bir bağlantının kimlik avı riskini analiz edin. Yalnızca ilk kontrol. Ücretsiz."],
    ar: ["مدقق روابط التصيد", "حلل أي رابط مشبوه لخطر التصيد قبل النقر عليه. فحص أولي فقط. مجاني."],
    fa: ["بررسی پیوند فیشینگ", "پیوند مشکوک را پیش از کلیک از نظر خطر فیشینگ بررسی کنید. فقط یک بررسی اولیه است. رایگان."],
    es: ["Comprobar URL de phishing", "Analiza una URL sospechosa por riesgo de phishing antes de hacer clic. Solo un primer control. Gratis."],
    it: ["Verifica URL di phishing", "Analizza un URL sospetto per rischio di phishing prima di cliccarlo. Solo un primo controllo. Gratis."],
    de: ["Phishing-URL prüfen", "Eine verdächtige URL vor dem Klicken auf Phishing-Risiko analysieren. Nur eine erste Prüfung. Kostenlos."],
    nl: ["Phishing-URL controleren", "Analyseer een verdachte URL op phishingrisico voordat je klikt. Alleen een eerste controle. Gratis."] },
  "color-picker": { en: ["Color Picker", "Pick any color visually and get instant HEX and RGB values to copy. Free."],
    ur: ["کلر پکر", "کوئی بھی رنگ بصری طور پر چنیں اور فوراً HEX اور RGB قیمتیں کاپی کریں۔ مفت۔"],
    tr: ["Renk Seçici", "Herhangi bir rengi görsel olarak seçin ve anında HEX ve RGB değerlerini kopyalayın. Ücretsiz."],
    ar: ["منتقي الألوان", "اختر أي لون بصريا واحصل فورا على قيم HEX وRGB لنسخها. مجاني."],
    fa: ["انتخاب رنگ", "هر رنگی را به صورت بصری انتخاب کنید و مقادیر HEX و RGB را فورا برای کپی بگیرید. رایگان."],
    es: ["Selector de color", "Elige cualquier color visualmente y obtén valores HEX y RGB al instante para copiar. Gratis."],
    it: ["Selettore di colore", "Scegli qualsiasi colore visivamente e ottieni subito valori HEX e RGB da copiare. Gratis."],
    de: ["Farbauswahl", "Eine Farbe visuell wählen und sofort HEX- und RGB-Werte zum Kopieren erhalten. Kostenlos."],
    nl: ["Kleurkiezer", "Kies visueel een kleur en krijg direct HEX- en RGB-waarden om te kopiëren. Gratis."] },
  "hex-to-rgb": { en: ["HEX to RGB Converter", "Convert HEX color codes to RGB values and back instantly. Free."],
    ur: ["HEX سے RGB کنورٹر", "HEX کلر کوڈز کو RGB قیمتوں میں اور واپس فوراً بدلیں۔ مفت۔"],
    tr: ["HEXten RGBye Dönüştürücü", "HEX renk kodlarını RGB değerlerine ve geriye anında dönüştürün. Ücretsiz."],
    ar: ["محول HEX إلى RGB", "حول رموز ألوان HEX إلى قيم RGB وبالعكس فورا. مجاني."],
    fa: ["تبدیل HEX به RGB", "کدهای رنگ HEX را به مقادیر RGB و برعکس فورا تبدیل کنید. رایگان."],
    es: ["Convertidor HEX a RGB", "Convierte códigos de color HEX a valores RGB y viceversa al instante. Gratis."],
    it: ["Convertitore HEX in RGB", "Converti codici colore HEX in valori RGB e viceversa all'istante. Gratis."],
    de: ["HEX-zu-RGB-Umrechner", "HEX-Farbcodes sofort in RGB-Werte umwandeln und zurück. Kostenlos."],
    nl: ["HEX-naar-RGB-omzetter", "Zet HEX-kleurcodes direct om naar RGB-waarden en terug. Gratis."] },
  "random-color": { en: ["Random Color Palette", "Generate beautiful random color palettes with one click; click any color to copy it. Free."],
    ur: ["رینڈم کلر پیلیٹ", "ایک کلک سے خوبصورت بے ترتیب کلر پیلیٹس بنائیں؛ کاپی کے لیے کسی بھی رنگ پر کلک کریں۔ مفت۔"],
    tr: ["Rastgele Renk Paleti", "Tek tıkla güzel rastgele renk paletleri oluşturun; kopyalamak için renge tıklayın. Ücretsiz."],
    ar: ["لوحة ألوان عشوائية", "أنشئ لوحات ألوان عشوائية جميلة بنقرة واحدة؛ انقر أي لون لنسخه. مجاني."],
    fa: ["پالت رنگ تصادفی", "با یک کلیک پالت های رنگ تصادفی زیبا بسازید؛ برای کپی روی هر رنگ کلیک کنید. رایگان."],
    es: ["Paleta de colores aleatoria", "Genera paletas de colores aleatorias y bonitas con un clic; haz clic en un color para copiarlo. Gratis."],
    it: ["Tavolozza di colori casuale", "Genera bellissime tavolozze di colori casuali con un clic; clicca un colore per copiarlo. Gratis."],
    de: ["Zufällige Farbpalette", "Schöne zufällige Farbpaletten mit einem Klick erstellen; auf eine Farbe klicken zum Kopieren. Kostenlos."],
    nl: ["Willekeurig kleurenpalet", "Genereer mooie willekeurige kleurenpaletten met één klik; klik op een kleur om hem te kopiëren. Gratis."] },
  "gradient-generator": { en: ["Gradient Generator", "Design CSS gradients with a live preview and copy-ready code. Free."],
    ur: ["گریڈینٹ جنریٹر", "لائیو پیش نظارہ اور کاپی کے لیے تیار کوڈ کے ساتھ CSS گریڈینٹس ڈیزائن کریں۔ مفت۔"],
    tr: ["Gradyan Oluşturucu", "Canlı önizleme ve kopyalamaya hazır kodla CSS gradyanları tasarlayın. Ücretsiz."],
    ar: ["مولد التدرجات", "صمم تدرجات CSS بمعاينة مباشرة وشيفرة جاهزة للنسخ. مجاني."],
    fa: ["سازنده گرادیان", "گرادیان های CSS را با پیش نمایش زنده و کد آماده کپی طراحی کنید. رایگان."],
    es: ["Generador de degradados", "Diseña degradados CSS con vista previa en vivo y código listo para copiar. Gratis."],
    it: ["Generatore di gradienti", "Progetta gradienti CSS con anteprima dal vivo e codice pronto da copiare. Gratis."],
    de: ["Verlaufs-Generator", "CSS-Verläufe mit Live-Vorschau und kopierfertigem Code gestalten. Kostenlos."],
    nl: ["Verloopgenerator", "Ontwerp CSS-verlopen met een live voorbeeld en kopieerklare code. Gratis."] },
  "contrast-checker": { en: ["Contrast Checker", "Check WCAG text contrast ratios to see if color combinations are accessible. Free."],
    ur: ["کنٹراسٹ چیکر", "WCAG ٹیکسٹ کنٹراسٹ ریشو چیک کریں کہ رنگوں کا امتزاج قابل رسائی ہے یا نہیں۔ مفت۔"],
    tr: ["Kontrast Denetleyici", "Renk kombinasyonlarının erişilebilir olup olmadığını görmek için WCAG metin kontrast oranlarını denetleyin. Ücretsiz."],
    ar: ["مدقق التباين", "تحقق من نسب تباين نصوص WCAG لمعرفة ما إذا كانت تركيبات الألوان ميسرة. مجاني."],
    fa: ["بررسی کنتراست", "نسبت های کنتراست متن WCAG را بررسی کنید تا ببینید ترکیب رنگ ها دسترس پذیر هست یا نه. رایگان."],
    es: ["Comprobar contraste", "Comprueba ratios de contraste de texto WCAG para ver si las combinaciones son accesibles. Gratis."],
    it: ["Verifica contrasto", "Controlla i rapporti di contrasto del testo WCAG per vedere se le combinazioni sono accessibili. Gratis."],
    de: ["Kontrast prüfen", "WCAG-Textkontrastwerte prüfen, ob Farbkombinationen barrierefrei sind. Kostenlos."],
    nl: ["Contrast controleren", "Controleer WCAG-tekstcontrastverhoudingen om te zien of kleurcombinaties toegankelijk zijn. Gratis."] },
  "html-encoder": { en: ["HTML Encoder", "Encode or decode HTML entities safely, for code snippets or user input on pages. Free."],
    ur: ["HTML انکوڈر", "ویب صفحات پر کوڈ یا صارف کے اندراج کے لیے HTML اینٹٹیز کو محفوظ طریقے سے انکوڈ یا ڈیکوڈ کریں۔ مفت۔"],
    tr: ["HTML Kodlayıcı", "Sayfalardaki kod parçacıkları veya kullanıcı girdileri için HTML öğelerini güvenle kodlayın veya çözün. Ücretsiz."],
    ar: ["مرمز HTML", "رمز كيانات HTML أو أعد فك ترميزها بأمان لمقاطع الشيفرة أو مدخلات المستخدم. مجاني."],
    fa: ["کدگذار HTML", "موجودیت های HTML را برای قطعه کدها یا ورودی کاربر در صفحات به صورت امن کدگذاری یا رمزگشایی کنید. رایگان."],
    es: ["Codificador HTML", "Codifica o decodifica entidades HTML de forma segura, para fragmentos de código o entradas. Gratis."],
    it: ["Codificatore HTML", "Codifica o decodifica entità HTML in sicurezza, per frammenti di codice o input utente. Gratis."],
    de: ["HTML-Kodierer", "HTML-Entitäten sicher kodieren oder dekodieren, für Code-Snippets oder Nutzereingaben. Kostenlos."],
    nl: ["HTML-codering", "Codeer of decodeer HTML-entiteiten veilig, voor codefragmenten of gebruikersinvoer. Gratis."] },
  "css-minifier": { en: ["CSS Minifier", "Minify CSS to shrink file size, or beautify it for readability. Free."],
    ur: ["CSS منی فائر", "فائل سائز کم کرنے کے لیے CSS چھوٹا کریں، یا پڑھنے کے لیے خوبصورت بنائیں۔ مفت۔"],
    tr: ["CSS Küçültücü", "Dosya boyutunu küçültmek için CSS kodunu sıkıştırın veya okunabilirlik için güzelleştirin. Ücretsiz."],
    ar: ["مصغر CSS", "صغر شيفرة CSS لتقليل حجم الملف، أو جملها لسهولة القراءة. مجاني."],
    fa: ["کوچک کننده CSS", "CSS را برای کم کردن حجم فایل کوچک کنید، یا برای خوانایی زیبا کنید. رایگان."],
    es: ["Minificador CSS", "Minimiza CSS para reducir el tamaño del archivo, o embellecelo para leerlo. Gratis."],
    it: ["Minificatore CSS", "Minimizza il CSS per ridurre la dimensione del file, o abbelliscilo per leggerlo. Gratis."],
    de: ["CSS-Minifier", "CSS minimieren, um Dateigröße zu senken, oder für Lesbarkeit verschönern. Kostenlos."],
    nl: ["CSS-minifier", "Minimaliseer CSS om de bestandsgrootte te verkleinen, of maak hem leesbaar. Gratis."] },
  "js-minifier": { en: ["JS Minifier", "Shrink JavaScript files with a basic minifier for smaller files and quicker loads. Free."],
    ur: ["JS منی فائر", "بنیادی منی فائر سے جاوا اسکرپٹ فائلیں چھوٹی کریں تاکہ فائل چھوٹی اور لوڈ تیز ہو۔ مفت۔"],
    tr: ["JS Küçültücü", "Temel bir küçültücüyle JavaScript dosyalarını küçültün, daha küçük dosyalar ve hızlı yükleme için. Ücretsiz."],
    ar: ["مصغر JavaScript", "صغر ملفات JavaScript بمصغر أساسي لملفات أصغر وتحميل أسرع. مجاني."],
    fa: ["کوچک کننده JS", "فایل های جاوا اسکریپت را با یک کوچک کننده ساده کوچک کنید تا فایل کوچک تر و بارگذاری سریع تر شود. رایگان."],
    es: ["Minificador JS", "Reduce archivos JavaScript con un minificador básico, para archivos más pequeños y cargas rápidas. Gratis."],
    it: ["Minificatore JS", "Riduci i file JavaScript con un minificatore base, per file più piccoli e caricamenti rapidi. Gratis."],
    de: ["JS-Minifier", "JavaScript-Dateien mit einem einfachen Minifier verkleinern, für kleinere Dateien und schnelleres Laden. Kostenlos."],
    nl: ["JS-minifier", "Verklein JavaScript-bestanden met een eenvoudige minifier, voor kleinere bestanden en sneller laden. Gratis."] },
  "uuid-generator": { en: ["UUID Generator", "Generate version-4 UUIDs in bulk with one click, for databases and APIs. Free."],
    ur: ["UUID جنریٹر", "ڈیٹا بیس اور APIs کے لیے ایک کلک سے بڑی تعداد میں ورژن 4 UUID بنائیں۔ مفت۔"],
    tr: ["UUID Oluşturucu", "Veritabanları ve APIler için tek tıkla toplu olarak sürüm 4 UUID oluşturun. Ücretsiz."],
    ar: ["مولد UUID", "أنشئ UUID من الإصدار الرابع بكميات كبيرة بنقرة واحدة لقواعد البيانات وواجهات API. مجاني."],
    fa: ["سازنده UUID", "UUID نسخه 4 را به صورت انبوه با یک کلیک برای پایگاه داده ها و API ها بسازید. رایگان."],
    es: ["Generador de UUID", "Genera UUID versión 4 en masa con un clic, para bases de datos y API. Gratis."],
    it: ["Generatore di UUID", "Genera UUID versione 4 in blocco con un clic, per database e API. Gratis."],
    de: ["UUID-Generator", "Version-4-UUIDs in großen Mengen mit einem Klick erstellen, für Datenbanken und APIs. Kostenlos."],
    nl: ["UUID-generator", "Genereer versie 4-UUIDs in bulk met één klik, voor databases en APIs. Gratis."] },
  "timestamp-converter": { en: ["Timestamp Converter", "Convert Unix timestamps to readable dates and back, for debugging logs and APIs. Free."],
    ur: ["ٹائم اسٹیمپ کنورٹر", "لاگز اور APIs کی ڈیبگنگ کے لیے یونکس ٹائم اسٹیمپس کو پڑھنے والی تاریخوں میں اور واپس بدلیں۔ مفت۔"],
    tr: ["Zaman Damgası Dönüştürücü", "Günlük ve API hata ayıklaması için Unix zaman damgalarını okunabilir tarihlere ve geriye dönüştürün. Ücretsiz."],
    ar: ["محول الطوابع الزمنية", "حول طوابع Unix الزمنية إلى تواريخ مقروءة وبالعكس لتصحيح السجلات وواجهات API. مجاني."],
    fa: ["تبدیل مهر زمانی", "مهرهای زمانی یونیکس را به تاریخ های خوانا و برعکس برای اشکال زدایی گزارش ها و API ها تبدیل کنید. رایگان."],
    es: ["Convertidor de marca de tiempo", "Convierte marcas de tiempo Unix a fechas legibles y viceversa, para depurar registros y API. Gratis."],
    it: ["Convertitore di timestamp", "Converti timestamp Unix in date leggibili e viceversa, per debug di log e API. Gratis."],
    de: ["Zeitstempel-Umrechner", "Unix-Zeitstempel in lesbare Daten umwandeln und zurück, zum Debuggen von Logs und APIs. Kostenlos."],
    nl: ["Tijdstempelomzetter", "Zet Unix-tijdstempels om naar leesbare datums en terug, voor het debuggen van logs en APIs. Gratis."] },
  "link-shortener": { en: ["Link Shortener", "Turn long URLs into short, shareable links in one click. No signup needed."],
    ur: ["لنک شارٹنر", "لمبے لنکس کو ایک کلک میں چھوٹے، شیئر کرنے والے لنکس میں بدلیں۔ سائن اپ کی ضرورت نہیں۔"],
    tr: ["Bağlantı Kısaltıcı", "Uzun bağlantıları tek tıkla kısa, paylaşılabilir bağlantılara dönüştürün. Kayıt gerekmez."],
    ar: ["مختصر الروابط", "حول الروابط الطويلة إلى روابط قصيرة قابلة للمشاركة بنقرة واحدة. دون حاجة للتسجيل."],
    fa: ["کوتاه کننده پیوند", "پیوندهای طولانی را با یک کلیک به پیوندهای کوتاه و قابل اشتراک تبدیل کنید. نیازی به ثبت نام نیست."],
    es: ["Acortador de enlaces", "Convierte enlaces largos en enlaces cortos y compartibles con un clic. Sin registro."],
    it: ["Accorciatore di link", "Trasforma link lunghi in link corti e condivisibili con un clic. Senza registrazione."],
    de: ["Link-Verkürzer", "Lange URLs mit einem Klick in kurze, teilbare Links verwandeln. Keine Anmeldung nötig."],
    nl: ["Linkverkorter", "Maak van lange URLs met één klik korte, deelbare links. Geen aanmelding nodig."] },
  "meta-tag-generator": { en: ["Meta Tag Generator", "Generate SEO meta tags, Open Graph and Twitter Card tags in one click. Free."],
    ur: ["میٹا ٹیگ جنریٹر", "ایک کلک میں SEO میٹا ٹیگز، اوپن گراف اور ٹوئٹر کارڈ ٹیگز بنائیں۔ مفت۔"],
    tr: ["Meta Etiket Oluşturucu", "SEO meta etiketlerini, Open Graph ve Twitter Kartı etiketlerini tek tıkla oluşturun. Ücretsiz."],
    ar: ["مولد وسوم Meta", "أنشئ وسوم Meta لتحسين محركات البحث وOpen Graph وبطاقات تويتر بنقرة واحدة. مجاني."],
    fa: ["سازنده متا تگ", "متا تگ های سئو، اوپن گراف و کارت توییتر را با یک کلیک بسازید. رایگان."],
    es: ["Generador de metaetiquetas", "Genera metaetiquetas SEO, Open Graph y Twitter Card con un clic. Gratis."],
    it: ["Generatore di meta tag", "Genera meta tag SEO, Open Graph e Twitter Card con un clic. Gratis."],
    de: ["Meta-Tag-Generator", "SEO-Meta-Tags, Open-Graph- und Twitter-Card-Tags mit einem Klick erstellen. Kostenlos."],
    nl: ["Metataggenerator", "Genereer SEO-metatags, Open Graph- en Twitter Card-tags met één klik. Gratis."] },
  "regex-tester": { en: ["Regex Tester", "Test regular expressions with live match highlighting and capture groups. Free."],
    ur: ["ریجیکس ٹیسٹر", "لائیو میچ ہائی لائٹنگ اور کیپچر گروپس کے ساتھ ریگولر ایکسپریشنز ٹیسٹ کریں۔ مفت۔"],
    tr: ["Regex Test Aracı", "Düzenli ifadeleri canlı eşleşme vurgulama ve yakalama gruplarıyla test edin. Ücretsiz."],
    ar: ["مختبر التعابير المنتظمة", "اختبر التعابير المنتظمة مع تمييز مباشر للمطابقات ومجموعات الالتقاط. مجاني."],
    fa: ["آزمایشگر Regex", "عبارات منظم را با برجسته سازی زنده تطابق ها و گروه های ضبط آزمایش کنید. رایگان."],
    es: ["Probador de Regex", "Prueba expresiones regulares con resaltado de coincidencias en vivo y grupos de captura. Gratis."],
    it: ["Tester di Regex", "Testa espressioni regolari con evidenziazione delle corrispondenze e gruppi di acquisizione. Gratis."],
    de: ["Regex-Tester", "Reguläre Ausdrücke mit Live-Match-Hervorhebung und Erfassungsgruppen testen. Kostenlos."],
    nl: ["Regex-tester", "Test reguliere expressies met live matchmarkering en capturegroepen. Gratis."] },
  "invoice-generator": { en: ["Invoice Generator", "Create professional invoices in seconds: add items, tax and discount, then print or download. Free."],
    ur: ["انوائس جنریٹر", "سیکنڈوں میں پروفیشنل انوائس بنائیں: آئٹمز، ٹیکس اور ڈسکاؤنٹ شامل کریں، پھر پرنٹ یا ڈاؤن لوڈ کریں۔ مفت۔"],
    tr: ["Fatura Oluşturucu", "Saniyeler içinde profesyonel faturalar oluşturun: ürün, vergi ve indirim ekleyin, yazdırın veya indirin. Ücretsiz."],
    ar: ["مولد الفواتير", "أنشئ فواتير احترافية في ثوان: أضف البنود والضريبة والخصم، ثم اطبع أو نزل. مجاني."],
    fa: ["سازنده فاکتور", "در چند ثانیه فاکتورهای حرفه ای بسازید: اقلام، مالیات و تخفیف اضافه کنید، سپس چاپ یا دانلود کنید. رایگان."],
    es: ["Generador de facturas", "Crea facturas profesionales en segundos: añade artículos, impuestos y descuentos, luego imprime o descarga. Gratis."],
    it: ["Generatore di fatture", "Crea fatture professionali in pochi secondi: aggiungi voci, tasse e sconti, poi stampa o scarica. Gratis."],
    de: ["Rechnungsgenerator", "Professionelle Rechnungen in Sekunden erstellen: Positionen, Steuern und Rabatt hinzufügen, dann drucken oder laden. Kostenlos."],
    nl: ["Factuurgenerator", "Maak in seconden professionele facturen: voeg items, btw en korting toe, print of download daarna. Gratis."] },
  "vat-calculator": { en: ["VAT Calculator", "Add or remove VAT for EU countries and the UK with standard rates. Free."],
    ur: ["VAT کیلکولیٹر", "معیاری ریٹس کے ساتھ یورپی ملکوں اور برطانیہ کے لیے VAT شامل یا نکالیں۔ مفت۔"],
    tr: ["KDV Hesaplayıcı", "Standart oranlarla AB ülkeleri ve İngiltere için KDV ekleyin veya çıkarın. Ücretsiz."],
    ar: ["حاسبة ضريبة القيمة المضافة", "أضف ضريبة القيمة المضافة أو أزلها لدول الاتحاد الأوروبي وبريطانيا بالمعدلات القياسية. مجاني."],
    fa: ["محاسبه گر مالیات بر ارزش افزوده", "مالیات بر ارزش افزوده را برای کشورهای اتحادیه اروپا و بریتانیا با نرخ های استاندارد اضافه یا حذف کنید. رایگان."],
    es: ["Calculadora de IVA", "Añade o quita el IVA para países de la UE y Reino Unido con tasas estándar. Gratis."],
    it: ["Calcolatore IVA", "Aggiungi o rimuovi l'IVA per i paesi UE e il Regno Unito con aliquote standard. Gratis."],
    de: ["Mehrwertsteuer-Rechner", "Mehrwertsteuer für EU-Länder und Großbritannien mit Standardsätzen hinzufügen oder entfernen. Kostenlos."],
    nl: ["Btw-calculator", "Voeg btw toe of haal btw af voor EU-landen en het VK met standaardtarieven. Gratis."] },
  "mortgage-calculator": { en: ["Mortgage Calculator", "Calculate your monthly mortgage payment, total interest and total cost instantly. Free."],
    ur: ["مارگیج کیلکولیٹر", "اپنی ماہانہ مارگیج قسط، کل سود اور کل لاگت فوراً حساب کریں۔ مفت۔"],
    tr: ["Konut Kredisi Hesaplayıcı", "Aylık konut kredisi ödemenizi, toplam faizi ve toplam maliyeti anında hesaplayın. Ücretsiz."],
    ar: ["حاسبة الرهن العقاري", "احسب دفعتك الشهرية للرهن العقاري وإجمالي الفائدة والتكلفة الكلية فورا. مجاني."],
    fa: ["محاسبه گر وام مسکن", "پرداخت ماهانه وام مسکن، کل بهره و هزینه کل خود را فورا محاسبه کنید. رایگان."],
    es: ["Calculadora de hipoteca", "Calcula tu pago mensual de hipoteca, interés total y coste total al instante. Gratis."],
    it: ["Calcolatore di mutuo", "Calcola subito la rata mensile del mutuo, gli interessi totali e il costo totale. Gratis."],
    de: ["Hypothekenrechner", "Monatliche Hypothekenrate, Gesamtzinsen und Gesamtkosten sofort berechnen. Kostenlos."],
    nl: ["Hypotheekcalculator", "Bereken direct je maandelijkse hypotheekbetaling, totale rente en totale kosten. Gratis."] },
  "barcode-generator": { en: ["Barcode Generator", "Generate CODE128, EAN-13 and UPC barcodes and download them as SVG or PNG. Free."],
    ur: ["بارکوڈ جنریٹر", "CODE128، EAN-13 اور UPC بارکوڈ بنائیں اور انہیں SVG یا PNG میں ڈاؤن لوڈ کریں۔ مفت۔"],
    tr: ["Barkod Oluşturucu", "CODE128, EAN-13 ve UPC barkodları oluşturun, SVG veya PNG olarak indirin. Ücretsiz."],
    ar: ["مولد الباركود", "أنشئ باركود CODE128 وEAN-13 وUPC ونزله بصيغة SVG أو PNG. مجاني."],
    fa: ["سازنده بارکد", "بارکدهای CODE128 و EAN-13 و UPC بسازید و آنها را به صورت SVG یا PNG دانلود کنید. رایگان."],
    es: ["Generador de códigos de barras", "Genera códigos de barras CODE128, EAN-13 y UPC y descárgalos como SVG o PNG. Gratis."],
    it: ["Generatore di codici a barre", "Genera codici a barre CODE128, EAN-13 e UPC e scaricali come SVG o PNG. Gratis."],
    de: ["Barcode-Generator", "CODE128-, EAN-13- und UPC-Barcodes erstellen und als SVG oder PNG laden. Kostenlos."],
    nl: ["Barcodegenerator", "Genereer CODE128-, EAN-13- en UPC-barcodes en download ze als SVG of PNG. Gratis."] },
  "pomodoro-timer": { en: ["Pomodoro Timer", "Focus for 25 minutes, rest for 5, and take a long break after four sessions. Free."],
    ur: ["پومودورو ٹائمر", "25 منٹ توجہ کریں، 5 منٹ آرام کریں، اور چار سیشنز کے بعد لمبا وقفہ لیں۔ مفت۔"],
    tr: ["Pomodoro Zamanlayıcı", "25 dakika odaklanın, 5 dakika dinlenin, dört oturumdan sonra uzun mola verin. Ücretsiz."],
    ar: ["مؤقت بومودورو", "ركز 25 دقيقة واسترح 5 دقائق، وخذ استراحة طويلة بعد أربع جلسات. مجاني."],
    fa: ["تایمر پومودورو", "25 دقیقه تمرکز کنید، 5 دقیقه استراحت کنید، و پس از چهار جلسه استراحت طولانی بگیرید. رایگان."],
    es: ["Temporizador Pomodoro", "Concéntrate 25 minutos, descansa 5, y toma un descanso largo tras cuatro sesiones. Gratis."],
    it: ["Timer Pomodoro", "Concentrati per 25 minuti, riposa 5, e fai una lunga pausa dopo quattro sessioni. Gratis."],
    de: ["Pomodoro-Timer", "25 Minuten fokussieren, 5 Minuten pausieren, nach vier Einheiten eine lange Pause. Kostenlos."],
    nl: ["Pomodorotimer", "Focus 25 minuten, rust 5 minuten en neem na vier sessies een lange pauze. Gratis."] }
};

/* --------------------------------------------------------------------------
   LOGIC (no translatable strings below except through STR / CAT / TOOLS).
   -------------------------------------------------------------------------- */
function lsGet(k, d) { try { var v = localStorage.getItem(k); if (v === null) return d; try { return JSON.parse(v); } catch (e) { return v; } } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
function fill(tpl, n) { return String(tpl).replace(/\{n\}/g, n); }
function fillName(tpl, name) { return String(tpl).replace(/\{name\}/g, name); }
function getLang() { var l = lsGet('fpt_lang', 'en'); if (typeof l !== 'string') l = 'en'; l = l.toLowerCase().trim(); return LANG_CODES[l] ? l : 'en'; }
function dict(lang) { return STR[lang] || STR.en; }
function catName(lang, enCat) { var c = CAT[lang] || CAT.en; return c[enCat] || enCat; }
function toolText(lang, slug, idx) { var t = TOOLS[slug]; if (!t) return null; var p = t[lang] || t.en; return p ? p[idx] : null; }
function stash(el) { if (!el.dataset.i18n9Orig) el.dataset.i18n9Orig = el.textContent; }
function slugFromHref(href) { if (!href) return null; var m = /tools\/([^\/\?#]+)\.html/.exec(href) || /([^\/\?#]+)\.html$/.exec(href); return m ? m[1] : null; }
function firstLetterIndex(s) { var m = /[\p{L}\p{N}]/u.exec(s); return m ? m.index : -1; }

/* Navigation / footer matching for tool pages, which carry no data-i18n
   attributes. Links are matched by href target, never by English text, so
   re-applying after a translation still finds them. */
function navKeyForHref(href) {
  if (!href) return null;
  var h = href.split('#')[0].split('?')[0];
  if (/(^|\/)index\.html$/.test(h)) return 'navHome';
  if (/about\.html$/.test(h)) return 'navAbout';
  if (/faq\.html$/.test(h)) return 'navFaq';
  if (/blog\.html$/.test(h)) return 'navBlog';
  if (/contact\.html$/.test(h)) return 'navContact';
  if (/privacy\.html$/.test(h)) return 'navPrivacy';
  if (/request\.html$/.test(h)) return 'footReq';
  if (/terms\.html$/.test(h)) return 'footTerms';
  if (/disclaimer\.html$/.test(h)) return 'footDisclaimer';
  return null;
}

function applyLang(lang) {
  var d = dict(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL[lang] ? 'rtl' : 'ltr';

  /* Switcher button label (native name of the current language). */
  var btn = document.getElementById('langBtn9');
  if (btn) { var cur = LANG_CODES[lang]; btn.textContent = cur ? cur.name : 'English'; btn.setAttribute('aria-label', d.langLabel); }

  /* Generic attribute-driven chrome (homepage already uses these keys). */
  document.querySelectorAll('[data-i18n]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n')];
    if (typeof v === 'string') e.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n-ph')];
    if (typeof v === 'string') e.placeholder = v;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n-title')];
    if (typeof v === 'string') { e.title = v; e.setAttribute('aria-label', v); }
  });

  /* Hero badges: matched by English wording, never by position alone.
     The usage badge has its own id and template. */
  var badgeMap = { '100% Free': 'badgeFree', 'Private by design': 'badgePrivate', 'No signup': 'badgeNoSignup', 'Mobile friendly': 'badgeMobile' };
  document.querySelectorAll('.hero .badge').forEach(function (b) {
    if (b.id === 'useBadge') { b.textContent = fill(d.useBadge, lsGet('fpt_usage', 0)); return; }
    if (!b.dataset.i18n9BadgeKey) { var k = badgeMap[b.textContent.trim()]; if (k) b.dataset.i18n9BadgeKey = k; }
    var key = b.dataset.i18n9BadgeKey;
    if (key && d[key]) b.textContent = d[key];
  });
  var badge = document.getElementById('useBadge');
  if (badge && !badge.closest('.hero')) badge.textContent = fill(d.useBadge, lsGet('fpt_usage', 0));

  /* Category chips (built by features.js in English). */
  document.querySelectorAll('#catChips .chip').forEach(function (c) {
    if (!c.dataset.en) c.dataset.en = c.textContent;
    var en = c.dataset.en;
    c.textContent = (en === 'All') ? d.catAll : catName(lang, en);
  });

  /* Category section titles + "N free tools" counts. */
  document.querySelectorAll('[data-cat-section]').forEach(function (s) {
    var h = s.querySelector('h2'), sub = s.querySelector('.sub');
    if (sub && !s.dataset.enSub) s.dataset.enSub = sub.textContent;
    var cat = s.getAttribute('data-cat-section');
    if (h) h.textContent = catName(lang, cat);
    if (sub && s.dataset.enSub) {
      var m = /(\d+)/.exec(s.dataset.enSub);
      sub.textContent = m ? fill(d.catFreeTools, m[1]) : s.dataset.enSub;
    }
  });

  /* Tool cards on the homepage, including favorites/recent clones.
     data-search and data-cat are NEVER touched, so search keeps working. */
  document.querySelectorAll('.tool-card').forEach(function (card) {
    var slug = slugFromHref(card.getAttribute('href'));
    if (!slug || !TOOLS[slug]) return;
    var h3 = card.querySelector('h3'), p = card.querySelector('p'), tag = card.querySelector('.cat-tag');
    if (h3) {
      stash(h3);
      h3.textContent = (lang === 'en') ? h3.dataset.i18n9Orig : (toolText(lang, slug, 0) || h3.dataset.i18n9Orig);
    }
    if (p) {
      stash(p);
      p.textContent = (lang === 'en') ? p.dataset.i18n9Orig : (toolText(lang, slug, 1) || p.dataset.i18n9Orig);
    }
    if (tag) {
      if (!tag.dataset.en) tag.dataset.en = tag.textContent;
      tag.textContent = catName(lang, tag.dataset.en);
    }
  });

  /* Featured carousel cards (built by muft63.js from the source cards). */
  document.querySelectorAll('.feat-card[data-slug]').forEach(function (card) {
    var slug = card.getAttribute('data-slug');
    if (!TOOLS[slug]) return;
    var h3 = card.querySelector('h3'), p = card.querySelector('p');
    if (h3) { stash(h3); h3.textContent = (lang === 'en') ? h3.dataset.i18n9Orig : (toolText(lang, slug, 0) || h3.dataset.i18n9Orig); }
    if (p) { stash(p); p.textContent = (lang === 'en') ? p.dataset.i18n9Orig : (toolText(lang, slug, 1) || p.dataset.i18n9Orig); }
  });

  /* Tool-page hero: title + first paragraph, by #tool-root[data-tool]. */
  var root = document.getElementById('tool-root');
  var hero = document.querySelector('.tool-hero');
  if (root && hero) {
    var slug = root.getAttribute('data-tool');
    var h1 = hero.querySelector('h1'), hp = hero.querySelector('p');
    if (slug && TOOLS[slug]) {
      if (h1) {
        stash(h1);
        var heroTitle = (lang === 'en') ? h1.dataset.i18n9Orig : (toolText(lang, slug, 0) || h1.dataset.i18n9Orig);
        /* Keep the SVG hero icon: textContent assignment would destroy it. */
        h1.textContent = '';
        var hsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        hsvg.setAttribute('class', 'hero-icon'); hsvg.setAttribute('aria-hidden', 'true');
        var huse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        huse.setAttribute('href', '../assets/tool-icons.svg#icon-' + slug);
        hsvg.appendChild(huse); h1.appendChild(hsvg);
        h1.appendChild(document.createTextNode(' ' + heroTitle));
      }
      if (hp) { stash(hp); hp.textContent = (lang === 'en') ? hp.dataset.i18n9Orig : (toolText(lang, slug, 1) || hp.dataset.i18n9Orig); }
    }
    /* Tool-page action row (built by features.js in English). */
    var actionLabels = hero.querySelectorAll('.tool-actions .action-label');
    actionLabels.forEach(function (lab, i) {
      if (!lab.dataset.i18n9Orig) lab.dataset.i18n9Orig = lab.textContent;
      var orig = lab.dataset.i18n9Orig;
      if (orig === 'Favorite') lab.textContent = d.favAction;
      else if (orig === 'Rate this tool') lab.textContent = d.rateAction;
      else if (orig === 'Share') lab.textContent = d.shareAction;
    });
    var star = hero.querySelector('.fav-star');
    if (star) { star.title = d.favAction; star.setAttribute('aria-label', d.favAction); }
    hero.querySelectorAll('.share-btn').forEach(function (a) {
      var t = a.getAttribute('title') || a.getAttribute('aria-label') || '';
      var m = /Share on (.+)$/.exec(t);
      if (m) { var nt = fillName(d.shareOn, m[1]); a.title = nt; a.setAttribute('aria-label', nt); }
      else if (!a.dataset.i18n9ShareDone) { a.dataset.i18n9ShareDone = '1'; }
    });
    var rateMsg = hero.querySelector('.rate-msg');
    if (rateMsg && slug) {
      var ratings = lsGet('fpt_ratings', {});
      var my = ratings[slug] || 0;
      if (my) rateMsg.textContent = fill(d.rateYour, my);
    }
  }

  /* Header nav + footer on pages without data-i18n (tool pages). Elements
     that already carry data-i18n were handled above and are skipped here
     by the hasAttribute check, so nothing is translated twice. */
  document.querySelectorAll('.site-header .nav a').forEach(function (a) {
    if (a.hasAttribute('data-i18n')) return;
    var key = navKeyForHref(a.getAttribute('href'));
    if (a.getAttribute('href') && a.getAttribute('href').indexOf('#tools') !== -1) key = 'navTools';
    if (key && d[key]) a.textContent = d[key];
  });
  document.querySelectorAll('.site-footer .cols > div').forEach(function (col, ci) {
    var h4 = col.querySelector('h4');
    col.querySelectorAll('a').forEach(function (a) {
      if (a.hasAttribute('data-i18n')) return;
      var key = navKeyForHref(a.getAttribute('href'));
      if (key && d[key]) { a.textContent = d[key]; return; }
      var s2 = slugFromHref(a.getAttribute('href'));
      if (s2 && TOOLS[s2] && lang !== 'en') { var tt = toolText(lang, s2, 0); if (tt) a.textContent = tt; }
    });
    if (h4 && !h4.hasAttribute('data-i18n')) {
      if (ci === 0) { var fp = col.querySelector('p'); if (fp && !fp.hasAttribute('data-i18n')) fp.textContent = d.footTag; }
      else if (ci === 1 && col.querySelectorAll('a').length) { h4.textContent = d.footPopular; }
      else if (ci === 2) { h4.textContent = d.footSite; }
    }
  });

  /* Floating WhatsApp button (injected by app.js) and dark-mode button
     (injected by features.js): labels only, behaviour untouched. */
  var wa = document.getElementById('wa-float-btn');
  if (wa) { wa.title = d.waChat; wa.setAttribute('aria-label', d.waChat); }
  var dark = document.getElementById('darkToggle');
  if (dark) { dark.title = d.darkToggle; dark.setAttribute('aria-label', d.darkToggle); dark.textContent = document.body.classList.contains('dark') ? d.lightLabel : d.darkLabel; }
}

function setLang(lang) {
  if (!LANG_CODES[lang]) lang = 'en';
  lsSet('fpt_lang', lang);
  applyLang(lang);
}

/* Switcher UI: a separate header button + dropdown. The legacy #langToggle
   from muft63.js is hidden so only one switcher is visible; its handler
   then cannot fire. Basic styles are injected so no CSS edit is needed. */
function injectStyles() {
  if (document.getElementById('lang9Style')) return;
  var st = document.createElement('style');
  st.id = 'lang9Style';
  st.textContent = '.lang9-wrap{position:relative;display:inline-flex;align-items:center}' +
    '.lang9-btn{cursor:pointer;border:1px solid var(--border,#dbe2ea);background:var(--card,#fff);color:var(--ink,#0f172a);border-radius:999px;padding:7px 14px;font-size:14px;font-weight:700;line-height:1}' +
    '.lang9-menu{position:absolute;top:calc(100% + 6px);inset-inline-end:0;min-width:170px;margin:0;padding:6px 0;list-style:none;background:var(--card,#fff);border:1px solid var(--border,#dbe2ea);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:100;display:none}' +
    '.lang9-menu.open{display:block}' +
    '.lang9-menu button{display:block;width:100%;text-align:start;background:none;border:0;cursor:pointer;padding:9px 14px;font-size:14px;color:var(--ink,#0f172a)}' +
    '.lang9-menu button:hover{background:var(--bg,#f1f5f9)}' +
    '.lang9-menu button.on{font-weight:800}';
  document.head.appendChild(st);
}

function buildSwitcher() {
  if (document.getElementById('lang9Wrap')) return;
  var headerWrap = document.querySelector('.site-header .wrap');
  if (!headerWrap) return;
  injectStyles();
  var legacy = document.getElementById('langToggle');
  if (legacy) { legacy.style.display = 'none'; legacy.setAttribute('aria-hidden', 'true'); legacy.tabIndex = -1; }

  var wrap = document.createElement('span');
  wrap.className = 'lang9-wrap';
  wrap.id = 'lang9Wrap';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'langBtn9';
  btn.className = 'lang9-btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  var menu = document.createElement('ul');
  menu.className = 'lang9-menu';
  menu.id = 'langMenu9';
  menu.setAttribute('role', 'listbox');
  LANGS.forEach(function (l) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.name;
    b.setAttribute('data-lang9', l.code);
    b.setAttribute('role', 'option');
    b.addEventListener('click', function () {
      setLang(l.code);
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-lang9') === l.code); });
    });
    li.appendChild(b);
    menu.appendChild(li);
  });
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  wrap.appendChild(btn);
  wrap.appendChild(menu);
  var navToggle = headerWrap.querySelector('.nav-toggle');
  if (navToggle) headerWrap.insertBefore(wrap, navToggle);
  else headerWrap.appendChild(wrap);
}

onReady(function () {
  buildSwitcher();
  setLang(getLang());
  /* Dark-mode / WhatsApp buttons are created by earlier scripts, but if
     script order ever changes, one retry still labels them. */
  setTimeout(function () { applyLang(getLang()); }, 400);
  document.addEventListener('fpt:retranslate', function () { applyLang(getLang()); });
});

window.FPT_I18N9 = { getLang: getLang, setLang: setLang, apply: function () { applyLang(getLang()); }, LANGS: LANGS };

})();
/* ============================================================================
   CONFIDENCE NOTES (honest, assistant translations, not professionally
   reviewed — a native speaker should review before any language is called
   "final", especially for public-facing hero text):
   - Most confident: English (source), Spanish, Italian, German, Dutch,
     Turkish. These use standard, simple UI wording and were written
     directly, not machine-copied.
   - Confident with one caveat: Urdu. Wording is natural for a Pakistani
     audience, but formal vs. colloquial choices (for example "سبسکرائب"
     for Subscribe) should be confirmed by the site owner.
   - Least confident: Arabic and Farsi. Both are grammatical Modern
     Standard / everyday wording, but subtle choices may read as slightly
     formal or slightly off to native readers: Arabic "استخدمت مؤخرا" for
     Recently Used, Farsi "ماشین حساب ها" for Calculators, and Farsi
     phrasing in longer hero text deserve a native review pass first.
     Tool-description wording in Arabic and Farsi is deliberately short
     and plain to reduce the risk of an awkward sentence.
   - Least confident STRING SETS overall: (1) the 63 one-line tool
     descriptions in Arabic and Farsi; (2) the Farsi category names; (3)
     the newsletter success sentence in all non-English languages, which
     is long and should be checked for naturalness in each language.
   ============================================================================
   PHASE 2 (NOT in this file — coordinator / future work):
   - Tool interiors: tag each tool's own labels, buttons and result texts
     with data-i18n="<key from the UI section of STR>" (btnDownload,
     btnCopy, btnGenerate, statusDone, statusError, statusLoading, etc.);
     i18n9 already translates any such element with no code change.
     Tool-specific words (for example calculator result labels) still need
     new keys added to STR.
   - Translated search: add a per-language search index (for example a
     data-search-<lang> attribute per card) and extend the filter in
     features.js/app.js to match it. Until then search stays English-only
     by design, so filtering never breaks.
   - Static pages (about, faq, privacy, terms, disclaimer, contact,
     request, blog articles), YouTube channel descriptions, the developer
     section and the footer note (developer name, email, badges) are NOT
     translated by this file. The footer note is intentionally untouched
     because it contains a personal name and an email address.
   - Count check for this delivery: STR has 9 languages; CAT has 9
     categories x 9 languages; TOOLS has 63 slugs x 9 languages x
     (title + one-line description). Verified by script at build time.
   ========================================================================== */
