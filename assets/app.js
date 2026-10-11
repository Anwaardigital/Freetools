/* Homepage interactions: live tool search */
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('toolSearch');
  if (!input) return;
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
