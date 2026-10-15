/* Free Privacy Tools — MuftTools-style update:
   1. "Featured Tools" horizontal carousel, auto-scrolling right-to-left
      (pauses on hover/touch, prev/next buttons, heart favorites).
   2. EN/UR language switcher (Urdu = RTL), saved in localStorage.
   Does not touch tool logic in tools.js. */
(function () {
'use strict';

function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

/* favorites (same 'fpt_favs' store as features.js) */
function getFavs() { return lsGet('fpt_favs', []); }
function isFav(s) { return getFavs().indexOf(s) !== -1; }
function toggleFav(s) { var f = getFavs(), i = f.indexOf(s); if (i === -1) f.push(s); else f.splice(i, 1); lsSet('fpt_favs', f); return i === -1; }
function refreshHearts(slug) {
  var on = isFav(slug);
  document.querySelectorAll('.feat-card[data-slug="' + slug + '"] .feat-heart').forEach(function (b) {
    b.textContent = on ? '♥' : '♡';
    b.classList.toggle('on', on);
  });
}

/* ================= 1. I18N (EN / UR) ================= */
var STR = {
en: {
  navHome:'Home', navTools:'All Tools', navAbout:'About', navFaq:'FAQ', navBlog:'Blog', navContact:'Contact', navPrivacy:'Privacy',
  heroTitle:'50+ Free Online Tools',
  heroSub:'PDF, image, text, calculators, security, color & developer tools — free forever. No signup. Everything runs privately in your browser.',
  searchPh:'Search 55 tools... e.g. pdf, qr, password',
  featuredTitle:'Featured Tools', featuredSub:'Our most-loved tools — picked for you',
  openBtn:'Open',
  favTitle:'⭐ Your Favorites', favSub:'Tools you starred — saved on this device',
  recentTitle:'🕐 Recently Used', recentSub:'Your last visited tools',
  noResults:'No tools found. Try another keyword.',
  nlTitle:'📧 Newsletter', nlText:'Get notified when we add new free tools. No spam, ever.',
  nlPh:'Your email address', nlBtn:'Subscribe', nlDone:'✅ Subscribed! We will keep you posted.',
  ytTitle:'📺 Our YouTube Channels', ytSub:'Learn, laugh and explore — subscribe for new videos every week',
  ytSubscribe:'Subscribe', footYouTube:'YouTube',
  footTag:'50+ free online tools. No signup — everything runs in your browser.',
  footPopular:'Popular', footSite:'Site', footReq:'Request a Tool', footPrivacy:'Privacy Policy',
  useBadge:function (n) { return '🔥 ' + n + ' tool uses on this device'; }
},
ur: {
  navHome:'ہوم', navTools:'تمام ٹولز', navAbout:'ہمارے بارے میں', navFaq:'سوالات', navBlog:'بلاگ', navContact:'رابطہ', navPrivacy:'پرائیویسی',
  heroTitle:'50+ مفت آن لائن ٹولز',
  heroSub:'PDF، تصویر، متن، کیلکولیٹر، سیکیورٹی، رنگ اور ڈیولپر ٹولز — ہمیشہ مفت۔ کوئی سائن اپ نہیں۔ سب کچھ آپ کے براؤزر میں نجی طور پر چلتا ہے۔',
  searchPh:'55 ٹولز تلاش کریں... مثلاً pdf، qr، password',
  featuredTitle:'نمایاں ٹولز', featuredSub:'ہمارے سب سے مقبول ٹولز — آپ کے لیے منتخب',
  openBtn:'کھولیں',
  favTitle:'⭐ آپ کے پسندیدہ', favSub:'جن ٹولز کو آپ نے پسند کیا — اس ڈیوائس پر محفوظ',
  recentTitle:'🕐 حال ہی میں استعمال شدہ', recentSub:'آپ کے آخری دیکھے گئے ٹولز',
  noResults:'کوئی ٹول نہیں ملا۔ کوئی اور لفظ آزمائیں۔',
  nlTitle:'📧 نیوزلیٹر', nlText:'جب ہم نئے مفت ٹولز شامل کریں تو اطلاع پائیں۔ کوئی سپام نہیں۔',
  nlPh:'آپ کا ای میل ایڈریس', nlBtn:'سبسکرائب کریں', nlDone:'✅ سبسکرائب ہو گیا! ہم آپ کو باخبر رکھیں گے۔',
  ytTitle:'📺 ہمارے یوٹیوب چینلز', ytSub:'سیکھیں، ہنسیں اور دریافت کریں — ہر ہفتے نئی ویڈیوز کے لیے سبسکرائب کریں',
  ytSubscribe:'سبسکرائب', footYouTube:'یوٹیوب',
  footTag:'50+ مفت آن لائن ٹولز۔ کوئی سائن اپ نہیں — سب کچھ آپ کے براؤزر میں چلتا ہے۔',
  footPopular:'مقبول', footSite:'سائٹ', footReq:'ٹول کی درخواست', footPrivacy:'پرائیویسی پالیسی',
  useBadge:function (n) { return '🔥 اس ڈیوائس پر ' + n + ' ٹول استعمال'; }
}};
var CAT_UR = {
  'PDF Tools':'PDF ٹولز', 'Image Tools':'تصویری ٹولز', 'Text Tools':'متنی ٹولز',
  'Calculators':'کیلکولیٹرز', 'Security Tools':'سیکیورٹی ٹولز',
  'Color Tools':'رنگ ٹولز', 'Developer Tools':'ڈیولپر ٹولز'
};

function setLang(l) {
  if (l !== 'ur') l = 'en';
  lsSet('fpt_lang', l);
  var d = STR[l];
  document.documentElement.lang = l;
  document.documentElement.dir = (l === 'ur') ? 'rtl' : 'ltr';
  var t = document.getElementById('langToggle');
  if (t) t.textContent = (l === 'ur') ? 'EN' : 'اردو';
  document.querySelectorAll('[data-i18n]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n')];
    if (typeof v === 'string') e.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n-ph')];
    if (typeof v === 'string') e.placeholder = v;
  });
  /* category chips (built by features.js) */
  document.querySelectorAll('#catChips .chip').forEach(function (c) {
    if (!c.dataset.en) c.dataset.en = c.textContent;
    var en = c.dataset.en;
    c.textContent = (l === 'ur') ? (en === 'All' ? 'تمام' : (CAT_UR[en] || en)) : en;
  });
  /* category section titles + "N free tools" counts */
  document.querySelectorAll('[data-cat-section]').forEach(function (s) {
    var h = s.querySelector('h2'), sub = s.querySelector('.sub');
    if (sub && !s.dataset.enSub) s.dataset.enSub = sub.textContent;
    var cat = s.getAttribute('data-cat-section');
    if (l === 'ur') {
      if (h) h.textContent = CAT_UR[cat] || cat;
      if (sub) sub.textContent = sub.textContent.replace(/(\d+)\s*free tools/i, '$1 مفت ٹولز');
    } else {
      if (h) h.textContent = cat;
      if (sub && s.dataset.enSub) sub.textContent = s.dataset.enSub;
    }
  });
  /* usage badge (features.js sets English; override here) */
  var badge = document.getElementById('useBadge');
  if (badge) badge.textContent = d.useBadge(lsGet('fpt_usage', 0));
}

/* ================= 2. FEATURED CAROUSEL ================= */
var FEATURED = [
  'background-remover', 'qr-generator', 'image-compressor', 'password-generator',
  'pdf-merger', 'word-counter', 'link-shortener', 'age-calculator',
  'color-picker', 'images-to-pdf'
];

function featCard(slug) {
  var src = document.querySelector('.tool-card[href="tools/' + slug + '.html"]');
  if (!src) return null;
  var icon = src.querySelector('.ticon').textContent;
  var name = src.querySelector('h3').textContent;
  var desc = src.querySelector('p').textContent;

  var card = document.createElement('div');
  card.className = 'feat-card';
  card.setAttribute('data-slug', slug);

  var ic = document.createElement('div');
  ic.className = 'feat-icon';
  ic.textContent = icon;

  var heart = document.createElement('button');
  heart.className = 'feat-heart' + (isFav(slug) ? ' on' : '');
  heart.textContent = isFav(slug) ? '♥' : '♡';
  heart.setAttribute('aria-label', 'Add to favorites');
  heart.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleFav(slug);
    refreshHearts(slug);
  });

  var h = document.createElement('h3');
  h.textContent = name;
  var p = document.createElement('p');
  p.textContent = desc;

  var open = document.createElement('a');
  open.className = 'feat-open';
  open.href = 'tools/' + slug + '.html';
  var osp = document.createElement('span');
  osp.setAttribute('data-i18n', 'openBtn');
  osp.textContent = 'Open';
  open.appendChild(osp);
  open.appendChild(document.createTextNode(' ›'));

  card.appendChild(ic);
  card.appendChild(heart);
  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(open);
  card.addEventListener('click', function () { location.href = 'tools/' + slug + '.html'; });
  return card;
}

function initCarousel() {
  var car = document.getElementById('featCarousel');
  if (!car) return;
  /* build twice for a seamless right-to-left loop */
  FEATURED.forEach(function (s) { var c = featCard(s); if (c) car.appendChild(c); });
  FEATURED.forEach(function (s) { var c = featCard(s); if (c) car.appendChild(c); });

  var SPEED = 40; /* px per second */
  var paused = false, rafId = null, resumeT = null, last = 0;

  function tick(now) {
    if (!paused && !document.hidden) {
      if (last) {
        car.scrollLeft += (now - last) / 1000 * SPEED; /* cards glide right -> left */
        var half = car.scrollWidth / 2;
        if (half > 0 && car.scrollLeft >= half - 4) car.scrollLeft -= half;
      }
      last = now;
    } else {
      last = 0; /* avoid a jump after pause */
    }
    rafId = requestAnimationFrame(tick);
  }
  function pause() { paused = true; }
  function resume() { paused = false; }
  function scheduleResume(ms) {
    clearTimeout(resumeT);
    resumeT = setTimeout(resume, ms);
  }

  /* pause on mouse hover only (touch uses touchstart/touchend below) */
  car.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pause(); });
  car.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') resume(); });
  car.addEventListener('touchstart', pause, { passive: true });
  car.addEventListener('touchend', function () { scheduleResume(2500); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) resume(); });

  function manual(d) {
    pause();
    car.scrollBy({ left: d, behavior: 'smooth' });
    scheduleResume(4000);
  }
  var pv = document.getElementById('carPrev'), nx = document.getElementById('carNext');
  if (pv) pv.addEventListener('click', function () { manual(-280); });
  if (nx) nx.addEventListener('click', function () { manual(280); });

  rafId = requestAnimationFrame(tick); /* auto-glide starts immediately */
}

/* ================= init ================= */
onReady(function () {
  initCarousel();
  setLang(lsGet('fpt_lang', 'en'));
  var t = document.getElementById('langToggle');
  if (t) t.addEventListener('click', function () {
    setLang(lsGet('fpt_lang', 'en') === 'ur' ? 'en' : 'ur');
  });
});

})();
