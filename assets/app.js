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
