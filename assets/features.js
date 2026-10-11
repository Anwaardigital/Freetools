/* Free Privacy Tools — site features: dark mode, favorites, recently used,
   ratings, category filters, share buttons, usage counter, newsletter + forms.
   100% client-side (localStorage). Does not touch tool logic in tools.js. */
(function () {
'use strict';

/* ---------- storage helpers ---------- */
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

/* ---------- 1. DARK MODE ---------- */
onReady(function () {
  if (lsGet('fpt_dark', false)) document.body.classList.add('dark');
  var b = el('button', 'dark-toggle', '🌙');
  b.id = 'darkToggle';
  b.title = 'Toggle dark mode';
  b.setAttribute('aria-label', 'Toggle dark mode');
  b.addEventListener('click', function () {
    var dark = document.body.classList.toggle('dark');
    lsSet('fpt_dark', dark);
    b.textContent = dark ? '☀️' : '🌙';
  });
  if (document.body.classList.contains('dark')) b.textContent = '☀️';
  document.body.appendChild(b);
});

/* ---------- favorites store ---------- */
function getFavs() { return lsGet('fpt_favs', []); }
function isFav(slug) { return getFavs().indexOf(slug) !== -1; }
function toggleFav(slug) {
  var f = getFavs(), i = f.indexOf(slug);
  if (i === -1) f.push(slug); else f.splice(i, 1);
  lsSet('fpt_favs', f);
  return i === -1;
}

/* ---------- tool-page detection ---------- */
function toolSlug() {
  var r = document.getElementById('tool-root');
  return r ? r.getAttribute('data-tool') : null;
}

/* ---------- 2/3/4/8. TOOL PAGE: favorite star, rating, share, tracking ---------- */
onReady(function () {
  var slug = toolSlug();
  if (!slug) return;
  var hero = document.querySelector('.tool-hero');
  if (!hero) return;

  /* track recently used (last 5) */
  var recent = lsGet('fpt_recent', []).filter(function (s) { return s !== slug; });
  recent.unshift(slug);
  lsSet('fpt_recent', recent.slice(0, 5));

  /* usage counter */
  lsSet('fpt_usage', (lsGet('fpt_usage', 0) + 1));

  var box = el('div', 'tool-actions');

  /* favorite star */
  var star = el('button', 'fav-star big' + (isFav(slug) ? ' on' : ''), isFav(slug) ? '★' : '☆');
  star.title = 'Add to favorites';
  star.setAttribute('aria-label', 'Add to favorites');
  star.addEventListener('click', function () {
    var now = toggleFav(slug);
    star.textContent = now ? '★' : '☆';
    star.classList.toggle('on', now);
  });
  var favWrap = el('span', 'action-item');
  favWrap.appendChild(star);
  favWrap.appendChild(el('span', 'action-label', 'Favorite'));
  box.appendChild(favWrap);

  /* star rating */
  var ratings = lsGet('fpt_ratings', {});
  var my = ratings[slug] || 0;
  var rateWrap = el('span', 'action-item');
  var stars = el('span', 'stars');
  for (var i = 1; i <= 5; i++) {
    (function (n) {
      var s = el('span', n <= my ? 'on' : '', '★');
      s.addEventListener('click', function () {
        var r = lsGet('fpt_ratings', {});
        r[slug] = n;
        lsSet('fpt_ratings', r);
        var kids = stars.children;
        for (var k = 0; k < kids.length; k++) kids[k].classList.toggle('on', k < n);
        rateMsg.textContent = 'Thanks! You rated this tool ' + n + '/5';
      });
      stars.appendChild(s);
    })(i);
  }
  rateWrap.appendChild(stars);
  rateWrap.appendChild(el('span', 'action-label', 'Rate this tool'));
  box.appendChild(rateWrap);
  var rateMsg = el('div', 'rate-msg', my ? 'Your rating: ' + my + '/5' : '');
  rateMsg.style.cssText = 'width:100%;font-size:13px;color:#16a34a;font-weight:600';

  /* share buttons */
  var shareWrap = el('span', 'action-item share-row');
  var pageUrl = location.href, pageTitle = document.title;
  var links = [
    ['WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(pageTitle + ' ' + pageUrl), '📱'],
    ['X', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(pageTitle) + '&url=' + encodeURIComponent(pageUrl), '𝕏'],
    ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl), '📘']
  ];
  links.forEach(function (l) {
    var a = el('a', 'share-btn', l[2]);
    a.href = l[0]; a.target = '_blank'; a.rel = 'noopener'; a.title = 'Share on ' + l[0];
    a.setAttribute('aria-label', 'Share on ' + l[0]);
    shareWrap.appendChild(a);
  });
  shareWrap.appendChild(el('span', 'action-label', 'Share'));
  box.appendChild(shareWrap);
  box.appendChild(rateMsg);
  hero.appendChild(box);
});

/* ---------- homepage: favorites + recent sections, filters, usage badge ---------- */
onReady(function () {
  if (toolSlug()) return; // tool pages handled above
  var favGrid = document.getElementById('favGrid');
  var recentGrid = document.getElementById('recentGrid');
  var isHome = !!document.getElementById('toolSearch');
  if (!isHome || (!favGrid && !recentGrid)) return;

  function cardForSlug(slug) {
    var a = document.querySelector('.tool-card[href="tools/' + slug + '.html"]');
    if (!a) return null;
    var c = a.cloneNode(true);
    var st = c.querySelector('.fav-star');
    if (st) st.remove();
    return c;
  }

  /* favorites section */
  if (favGrid) {
    var favs = getFavs();
    var wrap = document.getElementById('favWrap');
    if (favs.length && wrap) {
      wrap.style.display = '';
      favs.forEach(function (s) { var c = cardForSlug(s); if (c) favGrid.appendChild(c); });
    }
  }

  /* recently used section */
  if (recentGrid) {
    var rec = lsGet('fpt_recent', []);
    var rwrap = document.getElementById('recentWrap');
    if (rec.length && rwrap) {
      rwrap.style.display = '';
      rec.forEach(function (s) { var c = cardForSlug(s); if (c) recentGrid.appendChild(c); });
    }
  }

  /* usage counter badge */
  var badge = document.getElementById('useBadge');
  if (badge) {
    var n = lsGet('fpt_usage', 0);
    badge.textContent = '🔥 ' + n + ' tool uses on this device';
  }

  /* favorite stars on cards */
  document.querySelectorAll('.tool-card').forEach(function (card) {
    var m = /tools\/([^\/]+)\.html/.exec(card.getAttribute('href') || '');
    if (!m) return;
    var slug = m[1];
    var star = el('button', 'fav-star' + (isFav(slug) ? ' on' : ''), isFav(slug) ? '★' : '☆');
    star.title = 'Add to favorites';
    star.setAttribute('aria-label', 'Add to favorites');
    star.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var now = toggleFav(slug);
      star.textContent = now ? '★' : '☆';
      star.classList.toggle('on', now);
    });
    card.appendChild(star);
  });

  /* 5. category filter chips */
  var chipsBox = document.getElementById('catChips');
  var activeCat = '';
  function applyFilter() {
    var q = (document.getElementById('toolSearch').value || '').trim().toLowerCase();
    var visibleSections = {};
    document.querySelectorAll('.tool-card').forEach(function (c) {
      var hitQ = !q || (c.dataset.search || '').indexOf(q) !== -1;
      var hitC = !activeCat || c.dataset.cat === activeCat;
      var hit = hitQ && hitC;
      c.style.display = hit ? '' : 'none';
      if (hit) visibleSections[c.dataset.cat] = true;
    });
    document.querySelectorAll('[data-cat-section]').forEach(function (s) {
      s.style.display = visibleSections[s.dataset.catSection] ? '' : 'none';
    });
    var none = document.getElementById('noResults');
    var anyVisible = false;
    document.querySelectorAll('#tools .tool-card').forEach(function (c) { if (c.style.display !== 'none') anyVisible = true; });
    if (none) none.style.display = anyVisible ? 'none' : '';
  }
  if (chipsBox) {
    var cats = [];
    document.querySelectorAll('[data-cat-section]').forEach(function (s) {
      var c = s.getAttribute('data-cat-section');
      if (cats.indexOf(c) === -1) cats.push(c);
    });
    var all = el('button', 'chip active', 'All');
    all.addEventListener('click', function () {
      activeCat = '';
      chipsBox.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
      all.classList.add('active');
      applyFilter();
    });
    chipsBox.appendChild(all);
    cats.forEach(function (c) {
      var b = el('button', 'chip', c);
      b.addEventListener('click', function () {
        activeCat = (activeCat === c) ? '' : c;
        chipsBox.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
        if (activeCat) b.classList.add('active'); else all.classList.add('active');
        applyFilter();
      });
      chipsBox.appendChild(b);
    });
    document.getElementById('toolSearch').addEventListener('input', applyFilter);
  }
});

/* ---------- 6. newsletter ---------- */
onReady(function () {
  var f = document.getElementById('nlForm');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var em = document.getElementById('nlEmail');
    var v = (em.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { em.focus(); return; }
    var list = lsGet('fpt_newsletter', []);
    if (list.indexOf(v) === -1) { list.push(v); lsSet('fpt_newsletter', list); }
    document.getElementById('nlMsg').style.display = '';
    em.value = '';
  });
});

/* ---------- 9/13. request + contact forms -> WhatsApp ---------- */
onReady(function () {
  var rf = document.getElementById('requestForm');
  if (rf) rf.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (document.getElementById('rqName').value || '').trim();
    var desc = (document.getElementById('rqDesc').value || '').trim();
    if (!name || !desc) return;
    var msg = 'Tool request from Free Privacy Tools website:%0A%0ATool: ' + encodeURIComponent(name) + '%0ADetails: ' + encodeURIComponent(desc);
    window.open('https://wa.me/923288317526?text=' + msg, '_blank');
    document.getElementById('rqMsg').style.display = '';
    rf.reset();
  });
  var cf = document.getElementById('contactForm');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = (document.getElementById('ctName').value || '').trim();
    var em = (document.getElementById('ctEmail').value || '').trim();
    var m = (document.getElementById('ctMsg').value || '').trim();
    if (!n || !m) return;
    var msg = 'Contact from Free Privacy Tools website:%0A%0AName: ' + encodeURIComponent(n) + '%0AEmail: ' + encodeURIComponent(em) + '%0AMessage: ' + encodeURIComponent(m);
    window.open('https://wa.me/923288317526?text=' + msg, '_blank');
    document.getElementById('ctDone').style.display = '';
    cf.reset();
  });
});

})();
