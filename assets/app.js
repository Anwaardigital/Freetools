/* Homepage interactions: live tool search */
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('toolSearch');
  if (!input) return;
  /* Search button (right-side icon): clicking re-runs the live filter */
  var searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var cards = document.querySelectorAll('.tool-card');
    var visibleSections = {};
    cards.forEach(function (c) {
      var hit = !q || c.dataset.search.indexOf(q) !== -1;
      c.style.display = hit ? '' : 'none';
      if (hit) visibleSections[c.dataset.cat] = true;
    });
    document.querySelectorAll('[data-cat-section]').forEach(function (s) {
      s.style.display = visibleSections[s.dataset.catSection] ? '' : 'none';
    });
    var none = document.getElementById('noResults');
    if (none) none.style.display = document.querySelectorAll('.tool-card:not([style*="none"])').length ? 'none' : '';
  });
});

/* Floating WhatsApp button — injected on every page */
(function () {
  function addWhatsAppButton() {
    if (document.getElementById('wa-float-btn')) return;
    var a = document.createElement('a');
    a.id = 'wa-float-btn';
    a.href = 'https://wa.me/923288317526';
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Chat on WhatsApp');
    a.title = 'Chat on WhatsApp';
    a.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;text-decoration:none;transition:transform .2s;';
    a.innerHTML = '<svg viewBox="0 0 32 32" width="32" height="32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.1 1.6h.2c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.6 1.1 1.2-4.4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10.1-9.9 10.1zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2-.2-.3 0-.5.1-.6l.9-1c.2-.3.3-.5.4-.7.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.2-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.4c.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>';
    a.addEventListener('mouseenter', function () { a.style.transform = 'scale(1.1)'; });
    a.addEventListener('mouseleave', function () { a.style.transform = 'scale(1)'; });
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWhatsAppButton);
  } else {
    addWhatsAppButton();
  }
})();

/* Mobile nav (hamburger) toggle — works on every page */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? '\u2715' : '\u2630';
  });
});

/* Cookie consent + consent-gated Google Analytics (GDPR) */
(function () {
  'use strict';
  var GA_ID = 'G-M0NYM1FT9H';
  var KEY = 'ad_cookie_consent_v1';

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function hideBanner() {
    var b = document.getElementById('adCookieBanner');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function showBanner() {
    if (document.getElementById('adCookieBanner')) return;
    if (!document.body) return;
    var b = document.createElement('div');
    b.id = 'adCookieBanner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie consent');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;' +
      'background:#0d2818;color:#ffffff;padding:14px 18px;display:flex;flex-wrap:wrap;' +
      'gap:12px;align-items:center;justify-content:center;font-size:14px;line-height:1.5;' +
      'box-shadow:0 -2px 18px rgba(0,0,0,.35);font-family:inherit';
    b.innerHTML =
      '<span style="max-width:640px">We use cookies for analytics (Google Analytics) ' +
      'to understand visits and improve our website. Accept to allow analytics cookies, or decline.</span>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" id="adCookieAccept" style="background:#d4af37;color:#0A3D2E;border:0;' +
      'border-radius:20px;padding:9px 28px;font-weight:700;cursor:pointer;font-size:14px">Accept</button>' +
      '<button type="button" id="adCookieDecline" style="background:transparent;color:#ffffff;' +
      'border:1px solid #ffffff;border-radius:20px;padding:9px 24px;cursor:pointer;font-size:14px">Decline</button>' +
      '</span>';
    document.body.appendChild(b);
    document.getElementById('adCookieAccept').onclick = function () {
      try { localStorage.setItem(KEY, 'accepted'); } catch (e) {}
      hideBanner(); loadGA();
    };
    document.getElementById('adCookieDecline').onclick = function () {
      try { localStorage.setItem(KEY, 'declined'); } catch (e) {}
      hideBanner();
    };
  }

  function init() {
    var c = null;
    try { c = localStorage.getItem(KEY); } catch (e) {}
    if (c === 'accepted') { loadGA(); return; }
    if (c === 'declined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();
})();
