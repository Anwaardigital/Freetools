/* Free Privacy Tools — 89 tools, 100% client-side. No uploads. */
(function () {
'use strict';

/* ---------- helpers ---------- */
function h(tag, attrs) {
  var e = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'html') e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    if (c === undefined || c === null) continue;
    e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return e;
}
var __fieldSeq = 0;
function field(label, input) {
  var d = h('div', { class: 'field' });
  var slug = String(label == null ? '' : label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'fld';
  var id = 'f' + (++__fieldSeq) + '-' + slug;
  if (input && typeof input.setAttribute === 'function' && !input.getAttribute('id')) {
    input.setAttribute('id', id);
  }
  d.appendChild(h('label', { for: id }, label));
  d.appendChild(input);
  return d;
}
function numInput(val, min, max, step) {
  var i = h('input', { type: 'number', value: val });
  if (min !== undefined) i.min = min;
  if (max !== undefined) i.max = max;
  if (step !== undefined) i.step = step;
  return i;
}
function btn(label, cls, fn) {
  var b = h('button', { class: 'btn' + (cls ? ' ' + cls : ''), type: 'button' }, label);
  b.addEventListener('click', fn);
  return b;
}
function btnRow() {
  var d = h('div', { class: 'btn-row' });
  for (var i = 0; i < arguments.length; i++) d.appendChild(arguments[i]);
  return d;
}
function resultBox(big) {
  return h('div', { class: 'result' + (big ? ' big' : '') });
}
function downloadBlob(blob, name) {
  var a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
function pickFiles(accept, multiple) {
  return new Promise(function (res) {
    var i = h('input', { type: 'file', accept: accept || '' });
    if (multiple) i.multiple = true;
    i.style.display = 'none';
    i.addEventListener('change', function () { res(i.files); i.remove(); });
    document.body.appendChild(i); i.click();
  });
}
function dropZone(text, accept, multiple, onFiles) {
  var z = h('div', { class: 'drop' }, text || 'Click to choose files (or drag & drop here)');
  var hidden = h('input', { type: 'file', accept: accept || '' });
  if (multiple) hidden.multiple = true;
  hidden.style.display = 'none';
  z.appendChild(hidden);
  z.addEventListener('click', function (e) { if (e.target !== hidden) hidden.click(); });
  hidden.addEventListener('change', function () { onFiles(hidden.files); });
  ['dragover', 'dragenter'].forEach(function (ev) { z.addEventListener(ev, function (e) { e.preventDefault(); z.style.borderColor = '#2563eb'; }); });
  ['dragleave', 'drop'].forEach(function (ev) { z.addEventListener(ev, function (e) { e.preventDefault(); z.style.borderColor = ''; }); });
  z.addEventListener('drop', function (e) { onFiles(e.dataTransfer.files); });
  return z;
}
function readAs(what, file) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () { res(r.result); };
    r.onerror = rej;
    r[what](file);
  });
}
function loadImage(file) {
  return readAs('readAsDataURL', file).then(function (url) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = url;
    });
  });
}
function copyText(t, btnEl) {
  function done() { var o = btnEl.textContent; btnEl.textContent = 'Copied!'; setTimeout(function () { btnEl.textContent = o; }, 1500); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done);
  else { var ta = h('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
}
function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function secureRand(n) {
  var a = new Uint8Array(n);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return a;
}
var TOOLS = {};
function reg(slug, fn) { TOOLS[slug] = fn; }

/* ================= PDF TOOLS ================= */
function needPdfLib() {
  if (window.PDFLib) return Promise.resolve();
  return new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    s.onload = res; s.onerror = function () { rej(new Error('Could not load PDF engine (internet needed once).')); };
    document.head.appendChild(s);
  });
}

reg('pdf-merger', function (root) {
  var list = h('div'); var files = [];
  root.appendChild(dropZone('Select 2+ PDF files to merge (in order)', '.pdf', true, function (fs) {
    files = Array.prototype.slice.call(fs); list.innerHTML = '';
    files.forEach(function (f, i) { list.appendChild(h('div', null, (i + 1) + '. ' + f.name + ' (' + fmtBytes(f.size) + ')')); });
  }));
  root.appendChild(list);
  var out = h('div');
  root.appendChild(btnRow(btn('Merge PDFs', '', function () {
    if (files.length < 2) { out.textContent = 'Please select at least 2 PDF files.'; return; }
    out.textContent = 'Merging...';
    needPdfLib().then(function () {
      var PDFLib = window.PDFLib;
      return PDFLib.PDFDocument.create().then(function (merged) {
        var chain = Promise.resolve();
        files.forEach(function (f) {
          chain = chain.then(function () {
            return readAs('readAsArrayBuffer', f).then(function (buf) {
              return PDFLib.PDFDocument.load(buf).then(function (pdf) {
                return merged.copyPages(pdf, pdf.getPageIndices()).then(function (pages) {
                  pages.forEach(function (p) { merged.addPage(p); });
                });
              });
            });
          });
        });
        return chain.then(function () { return merged.save(); });
      });
    }).then(function (bytes) {
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
      out.textContent = 'Done! merged.pdf downloaded (' + fmtBytes(bytes.length) + ').';
    }).catch(function (e) { out.textContent = 'Error: ' + e.message; });
  })));
  root.appendChild(out);
});

reg('pdf-splitter', function (root) {
  var file = null, info = h('div');
  root.appendChild(dropZone('Select a PDF file', '.pdf', false, function (fs) {
    file = fs[0]; info.textContent = file ? file.name + ' (' + fmtBytes(file.size) + ')' : '';
  }));
  root.appendChild(info);
  var pages = h('input', { type: 'text', placeholder: 'e.g. 1-3, 5, 7-9' });
  root.appendChild(field('Pages to extract', pages));
  var out = h('div');
  root.appendChild(btnRow(btn('Split / Extract Pages', '', function () {
    if (!file) { out.textContent = 'Select a PDF first.'; return; }
    out.textContent = 'Working...';
    needPdfLib().then(function () {
      var PDFLib = window.PDFLib;
      return readAs('readAsArrayBuffer', file).then(function (buf) {
        return PDFLib.PDFDocument.load(buf).then(function (src) {
          var total = src.getPageCount(), idx = [];
          pages.value.split(',').forEach(function (part) {
            part = part.trim();
            var m = part.match(/^(\d+)\s*-\s*(\d+)$/);
            if (m) { for (var i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= total) idx.push(i - 1); }
            else { var n = parseInt(part, 10); if (n >= 1 && n <= total) idx.push(n - 1); }
          });
          idx = idx.filter(function (v, i) { return idx.indexOf(v) === i; });
          if (!idx.length) throw new Error('No valid pages. This PDF has ' + total + ' pages.');
          return PDFLib.PDFDocument.create().then(function (doc) {
            return doc.copyPages(src, idx).then(function (cp) {
              cp.forEach(function (p) { doc.addPage(p); });
              return doc.save();
            });
          });
        });
      });
    }).then(function (bytes) {
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'split.pdf');
      out.textContent = 'Done! split.pdf downloaded.';
    }).catch(function (e) { out.textContent = 'Error: ' + e.message; });
  })));
  root.appendChild(out);
});

reg('pdf-compressor', function (root) {
  var file = null, info = h('div');
  root.appendChild(dropZone('Select a PDF to compress', '.pdf', false, function (fs) {
    file = fs[0]; info.textContent = file ? file.name + ' (' + fmtBytes(file.size) + ')' : '';
  }));
  root.appendChild(info);
  var out = h('div');
  root.appendChild(h('p', null, 'Rebuilds the PDF with object streams to shrink file size. Best on PDFs with lots of metadata/structure.'));
  root.appendChild(btnRow(btn('Compress PDF', '', function () {
    if (!file) { out.textContent = 'Select a PDF first.'; return; }
    out.textContent = 'Compressing...';
    needPdfLib().then(function () {
      var PDFLib = window.PDFLib;
      return readAs('readAsArrayBuffer', file).then(function (buf) {
        return PDFLib.PDFDocument.load(buf).then(function (pdf) {
          return pdf.save({ useObjectStreams: true });
        });
      });
    }).then(function (bytes) {
      var saved = file.size - bytes.length;
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'compressed.pdf');
      out.textContent = 'Done! ' + (saved > 0 ? 'Saved ' + fmtBytes(saved) + ' (' + Math.round(saved / file.size * 100) + '% smaller).' : 'File was already optimized.') + ' compressed.pdf downloaded.';
    }).catch(function (e) { out.textContent = 'Error: ' + e.message; });
  })));
  root.appendChild(out);
});

function needPdfJs() {
  if (window.pdfjsLib && window.pdfjsLib.getDocument) return Promise.resolve();
  /* pdf.js 4.x is module-only: load via dynamic import (CVE-2024-4367 fixed in 4.2.67+). */
  return import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs').then(function (mod) {
    window.pdfjsLib = (mod && mod.getDocument) ? mod : window.pdfjsLib;
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  }).catch(function () { throw new Error('Could not load PDF engine (internet needed once).'); });
}

reg('pdf-to-text', function (root) {
  var ta = h('textarea', { placeholder: 'Extracted text will appear here...', readonly: 'readonly' });
  root.appendChild(dropZone('Select a PDF file', '.pdf', false, function (fs) {
    var f = fs[0]; if (!f) return;
    ta.value = 'Extracting text...';
    needPdfJs().then(function () {
      return readAs('readAsArrayBuffer', f);
    }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var chain = Promise.resolve(''), n = pdf.numPages;
      for (var i = 1; i <= n; i++) {
        (function (p) {
          chain = chain.then(function (acc) {
            return pdf.getPage(p).then(function (page) {
              return page.getTextContent().then(function (tc) {
                return acc + '\n\n--- Page ' + p + ' ---\n' + tc.items.map(function (it) { return it.str; }).join(' ');
              });
            });
          });
        })(i);
      }
      return chain;
    }).then(function (txt) { ta.value = txt.trim(); })
      .catch(function (e) { ta.value = 'Error: ' + e.message; });
  }));
  root.appendChild(ta);
  root.appendChild(btnRow(
    btn('Copy Text', 'secondary', function () { copyText(ta.value, this); }),
    btn('Download .txt', 'secondary', function () { downloadBlob(new Blob([ta.value], { type: 'text/plain' }), 'extracted.txt'); })
  ));
});

reg('images-to-pdf', function (root) {
  var files = [], list = h('div');
  root.appendChild(dropZone('Select images (JPG/PNG) — in page order', 'image/*', true, function (fs) {
    files = Array.prototype.slice.call(fs); list.innerHTML = '';
    files.forEach(function (f, i) { list.appendChild(h('div', null, (i + 1) + '. ' + f.name)); });
  }));
  root.appendChild(list);
  var out = h('div');
  root.appendChild(btnRow(btn('Create PDF', '', function () {
    if (!files.length) { out.textContent = 'Select at least one image.'; return; }
    out.textContent = 'Creating PDF...';
    needPdfLib().then(function () {
      var PDFLib = window.PDFLib;
      return PDFLib.PDFDocument.create().then(function (pdf) {
        var chain = Promise.resolve();
        files.forEach(function (f) {
          chain = chain.then(function () {
            return readAs('readAsArrayBuffer', f).then(function (buf) {
              var p = f.type.indexOf('png') !== -1 ? pdf.embedPng(buf) : pdf.embedJpg(buf);
              return p.then(function (img) {
                var page = pdf.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
              });
            });
          });
        });
        return chain.then(function () { return pdf.save(); });
      });
    }).then(function (bytes) {
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'images.pdf');
      out.textContent = 'Done! images.pdf downloaded (' + files.length + ' pages).';
    }).catch(function (e) { out.textContent = 'Error: ' + e.message; });
  })));
  root.appendChild(out);
});

/* ================= IMAGE TOOLS ================= */
function imgWorkArea(root, accept, onImg, extra) {
  var state = { img: null, name: 'image' };
  var wrap = h('div');
  var canvas = h('canvas', { class: 'preview' });
  wrap.appendChild(dropZone('Select an image', accept || 'image/*', false, function (fs) {
    var f = fs[0]; if (!f) return;
    state.name = f.name.replace(/\.[^.]+$/, '');
    loadImage(f).then(function (img) {
      state.img = img;
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      wrap.querySelector('.controls').style.display = '';
      if (onImg) onImg(state, canvas);
    });
  }));
  wrap.appendChild(canvas);
  var controls = h('div', { class: 'controls' });
  controls.style.display = 'none';
  if (extra) extra(state, canvas, controls);
  wrap.appendChild(controls);
  root.appendChild(wrap);
  return state;
}
function canvasDownload(c, name, type, quality) {
  c.toBlob(function (b) { downloadBlob(b, name); }, type || 'image/png', quality);
}

reg('image-compressor', function (root) {
  var q = numInput(80, 1, 100, 1), sizeInfo = h('div');
  imgWorkArea(root, 'image/*', function (st, cv) {
    sizeInfo.textContent = 'Original: ' + cv.width + 'x' + cv.height;
  }, function (st, cv, controls) {
    controls.appendChild(field('Quality (1-100)', q));
    controls.appendChild(btnRow(
      btn('Compress & Download JPG', '', function () {
        canvasDownload(cv, st.name + '-compressed.jpg', 'image/jpeg', q.value / 100);
      }),
      btn('Compress & Download WebP', 'secondary', function () {
        canvasDownload(cv, st.name + '-compressed.webp', 'image/webp', q.value / 100);
      })
    ));
    controls.appendChild(sizeInfo);
  });
});

reg('image-resizer', function (root) {
  var wI = numInput(800, 1), hI = numInput(600, 1), keep = h('input', { type: 'checkbox' });
  keep.checked = true;
  imgWorkArea(root, 'image/*', function (st, cv) {
    wI.value = cv.width; hI.value = cv.height;
    st.ow = cv.width; st.oh = cv.height;
  }, function (st, cv, controls) {
    controls.appendChild(h('div', { class: 'row' }, field('Width (px)', wI), field('Height (px)', hI)));
    var lab = h('label', null, ' Keep aspect ratio ');
    lab.prepend ? null : null;
    var chk = h('div', { class: 'checks' });
    var l = h('label'); l.appendChild(keep); l.appendChild(document.createTextNode(' Keep aspect ratio'));
    chk.appendChild(l); controls.appendChild(chk);
    wI.addEventListener('input', function () { if (keep.checked && st.ow) hI.value = Math.round(wI.value * st.oh / st.ow); });
    hI.addEventListener('input', function () { if (keep.checked && st.oh) wI.value = Math.round(hI.value * st.ow / st.oh); });
    controls.appendChild(h('div', { style: 'font-weight:700;margin:12px 0 6px' }, 'One-click sizes:'));
    var presets = [['YouTube Thumbnail 1280x720', 1280, 720], ['Instagram Post 1080x1080', 1080, 1080], ['Instagram Story 1080x1920', 1080, 1920], ['Facebook Cover 820x312', 820, 312], ['X Header 1500x500', 1500, 500], ['Website Hero 1920x1080', 1920, 1080]];
    var prow = h('div', { class: 'btn-row' });
    presets.forEach(function (pr) {
      var pb = btn(pr[0], 'secondary', function () { keep.checked = false; wI.value = pr[1]; hI.value = pr[2]; });
      prow.appendChild(pb);
    });
    controls.appendChild(prow);
    controls.appendChild(btnRow(btn('Resize & Download', '', function () {
      var c = h('canvas'); c.width = +wI.value; c.height = +hI.value;
      c.getContext('2d').drawImage(st.img, 0, 0, c.width, c.height);
      canvasDownload(c, st.name + '-' + c.width + 'x' + c.height + '.png');
    })));
  });
});

reg('image-converter', function (root) {
  var sel = h('select');
  [['image/png', 'PNG'], ['image/jpeg', 'JPEG'], ['image/webp', 'WebP'], ['image/bmp', 'BMP']].forEach(function (o) {
    sel.appendChild(h('option', { value: o[0] }, o[1]));
  });
  var ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/bmp': 'bmp' };
  imgWorkArea(root, 'image/*', null, function (st, cv, controls) {
    controls.appendChild(field('Convert to', sel));
    controls.appendChild(btnRow(btn('Convert & Download', '', function () {
      canvasDownload(cv, st.name + '.' + ext[sel.value], sel.value);
    })));
  });
});

reg('background-remover', function (root) {
  var tol = numInput(30, 0, 150, 1);
  root.appendChild(h('p', null, 'Removes solid white / light backgrounds (great for logos & product shots). For complex photos use a dedicated AI tool.'));
  imgWorkArea(root, 'image/*', null, function (st, cv, controls) {
    controls.appendChild(field('Tolerance (0-150)', tol));
    controls.appendChild(btnRow(btn('Remove Background', '', function () {
      var ctx = cv.getContext('2d');
      var d = ctx.getImageData(0, 0, cv.width, cv.height), p = d.data, t = +tol.value;
      for (var i = 0; i < p.length; i += 4) {
        if (p[i] > 255 - t && p[i + 1] > 255 - t && p[i + 2] > 255 - t) p[i + 3] = 0;
      }
      ctx.putImageData(d, 0, 0);
    }), btn('Download PNG', 'green', function () { canvasDownload(cv, st.name + '-nobg.png'); })));
  });
});

reg('image-cropper', function (root) {
  var x = numInput(0, 0), y = numInput(0, 0), w = numInput(200, 1), hh = numInput(200, 1);
  imgWorkArea(root, 'image/*', function (st, cv) {
    x.max = cv.width; y.max = cv.height; w.max = cv.width; hh.max = cv.height;
    w.value = Math.min(400, cv.width); hh.value = Math.min(400, cv.height);
  }, function (st, cv, controls) {
    controls.appendChild(h('div', { class: 'row' }, field('X', x), field('Y', y)));
    controls.appendChild(h('div', { class: 'row' }, field('Width', w), field('Height', hh)));
    controls.appendChild(btnRow(btn('Crop & Download', '', function () {
      var c = h('canvas'); c.width = +w.value; c.height = +hh.value;
      c.getContext('2d').drawImage(cv, +x.value, +y.value, +w.value, +hh.value, 0, 0, +w.value, +hh.value);
      canvasDownload(c, st.name + '-cropped.png');
    })));
  });
});

reg('image-rotator', function (root) {
  imgWorkArea(root, 'image/*', null, function (st, cv, controls) {
    controls.appendChild(btnRow(
      btn('Rotate 90°', '', function () { rotate(st, cv, Math.PI / 2); }),
      btn('Rotate 180°', 'secondary', function () { rotate(st, cv, Math.PI); }),
      btn('Flip Horizontal', 'secondary', function () { flip(st, cv, true); }),
      btn('Flip Vertical', 'secondary', function () { flip(st, cv, false); }),
      btn('Download', 'green', function () { canvasDownload(cv, st.name + '-rotated.png'); })
    ));
  });
  function rotate(st, cv, ang) {
    var tmp = h('canvas'); tmp.width = cv.width; tmp.height = cv.height;
    tmp.getContext('2d').drawImage(cv, 0, 0);
    var swap = Math.abs(ang) % Math.PI !== 0;
    cv.width = swap ? tmp.height : tmp.width;
    cv.height = swap ? tmp.width : tmp.height;
    var ctx = cv.getContext('2d');
    ctx.translate(cv.width / 2, cv.height / 2); ctx.rotate(ang);
    ctx.drawImage(tmp, -tmp.width / 2, -tmp.height / 2);
  }
  function flip(st, cv, horiz) {
    var tmp = h('canvas'); tmp.width = cv.width; tmp.height = cv.height;
    tmp.getContext('2d').drawImage(cv, 0, 0);
    var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    if (horiz) { ctx.translate(cv.width, 0); ctx.scale(-1, 1); }
    else { ctx.translate(0, cv.height); ctx.scale(1, -1); }
    ctx.drawImage(tmp, 0, 0); ctx.restore();
  }
});

reg('grayscale-filter', function (root) {
  var sel = h('select');
  ['Grayscale', 'Sepia', 'Invert', 'High Contrast', 'Blur', 'Vintage'].forEach(function (f) {
    sel.appendChild(h('option', null, f));
  });
  imgWorkArea(root, 'image/*', null, function (st, cv, controls) {
    controls.appendChild(field('Filter', sel));
    controls.appendChild(btnRow(
      btn('Apply Filter', '', function () {
        var ctx = cv.getContext('2d');
        ctx.drawImage(st.img, 0, 0);
        var d = ctx.getImageData(0, 0, cv.width, cv.height), p = d.data, f = sel.value, i, r, g, b;
        for (i = 0; i < p.length; i += 4) {
          r = p[i]; g = p[i + 1]; b = p[i + 2];
          if (f === 'Grayscale') { var v = .299 * r + .587 * g + .114 * b; p[i] = p[i + 1] = p[i + 2] = v; }
          else if (f === 'Sepia') { p[i] = Math.min(255, .393 * r + .769 * g + .189 * b); p[i + 1] = Math.min(255, .349 * r + .686 * g + .168 * b); p[i + 2] = Math.min(255, .272 * r + .534 * g + .131 * b); }
          else if (f === 'Invert') { p[i] = 255 - r; p[i + 1] = 255 - g; p[i + 2] = 255 - b; }
          else if (f === 'High Contrast') { var c2 = 1.6, o = 128 * (1 - c2); p[i] = Math.max(0, Math.min(255, r * c2 + o)); p[i + 1] = Math.max(0, Math.min(255, g * c2 + o)); p[i + 2] = Math.max(0, Math.min(255, b * c2 + o)); }
          else if (f === 'Vintage') { p[i] = Math.min(255, r * 1.1); p[i + 2] = Math.max(0, b * .85); }
        }
        ctx.putImageData(d, 0, 0);
        if (f === 'Blur') { ctx.filter = 'blur(4px)'; ctx.drawImage(st.img, 0, 0); ctx.filter = 'none'; }
      }),
      btn('Reset', 'secondary', function () { cv.getContext('2d').drawImage(st.img, 0, 0); }),
      btn('Download', 'green', function () { canvasDownload(cv, st.name + '-filtered.png'); })
    ));
  });
});

function needQR() {
  if (window.QRCode) return Promise.resolve();
  return new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = res; s.onerror = function () { rej(new Error('Could not load QR engine (internet needed once).')); };
    document.head.appendChild(s);
  });
}
reg('qr-generator', function (root) {
  var txt = h('input', { type: 'text', placeholder: 'https://example.com or any text' });
  var size = numInput(256, 64, 1024, 1);
  var box = h('div'); var cur = null;
  root.appendChild(field('Text / URL', txt));
  root.appendChild(field('Size (px)', size));
  root.appendChild(btnRow(btn('Generate QR Code', '', function () {
    box.innerHTML = ''; cur = null;
    needQR().then(function () {
      try {
        new window.QRCode(box, {
          text: txt.value || 'https://example.com',
          width: +size.value, height: +size.value,
          colorDark: '#000000', colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
        cur = box.querySelector('canvas') || box.querySelector('img');
      } catch (e) { box.textContent = 'Error: ' + e.message; }
    }).catch(function (e) { box.textContent = 'Error: ' + e.message; });
  }), btn('Download PNG', 'green', function () {
    var b = cur || box.querySelector('canvas') || box.querySelector('img');
    if (!b) return;
    if (b.tagName === 'CANVAS' || b.toBlob) { canvasDownload(b, 'qrcode.png'); }
    else {
      var c = h('canvas'); c.width = b.naturalWidth || +size.value; c.height = b.naturalHeight || +size.value;
      c.getContext('2d').drawImage(b, 0, 0, c.width, c.height);
      canvasDownload(c, 'qrcode.png');
    }
  })));
  root.appendChild(box);
});

function needJsQR() {
  if (window.jsQR) return Promise.resolve();
  return new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    s.onload = res; s.onerror = function () { rej(new Error('Could not load QR reader (internet needed once).')); };
    document.head.appendChild(s);
  });
}
reg('qr-reader', function (root) {
  var out = resultBox();
  root.appendChild(dropZone('Select an image containing a QR code', 'image/*', false, function (fs) {
    var f = fs[0]; if (!f) return;
    out.textContent = 'Reading...';
    needJsQR().then(function () {
      return loadImage(f);
    }).then(function (img) {
      var c = h('canvas'); c.width = img.width; c.height = img.height;
      var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      var code = window.jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      out.innerHTML = '';
      if (code && code.data) {
        out.appendChild(h('div', null, 'QR content:'));
        out.appendChild(h('div', { class: 'big' }, code.data));
        var cp = btn('Copy', 'secondary', function () { copyText(code.data, cp); });
        out.appendChild(btnRow(cp));
      } else out.textContent = 'No QR code found in this image.';
    }).catch(function (e) { out.textContent = 'Error: ' + e.message; });
  }));
  root.appendChild(out);
});

reg('favicon-generator', function (root) {
  imgWorkArea(root, 'image/*', null, function (st, cv, controls) {
    var sizes = [16, 32, 48, 180];
    var prev = h('div');
    controls.appendChild(btnRow(btn('Generate Favicons', '', function () {
      prev.innerHTML = '';
      sizes.forEach(function (s) {
        var c = h('canvas'); c.width = s; c.height = s;
        c.getContext('2d').drawImage(st.img, 0, 0, s, s);
        c.style.margin = '6px'; c.style.border = '1px solid #e2e8f0'; c.style.borderRadius = '6px';
        prev.appendChild(c);
        var d = btn('PNG ' + s + 'px', 'secondary', function () { canvasDownload(c, 'favicon-' + s + '.png'); });
        d.style.margin = '6px'; prev.appendChild(d);
      });
    })));
    controls.appendChild(prev);
    controls.appendChild(h('p', null, 'Upload the PNGs to your site root as favicon-16.png etc., or convert to .ico with any converter.'));
  });
});

/* ================= TEXT TOOLS ================= */
function textTool(root, placeholder, buttons) {
  var ta = h('textarea', { placeholder: placeholder || 'Paste or type your text here...' });
  var out = h('textarea', { placeholder: 'Result...', readonly: 'readonly' });
  root.appendChild(ta);
  var row = btnRow();
  buttons.forEach(function (b) {
    row.appendChild(btn(b[0], b[2] || '', function () {
      var r = b[1](ta.value);
      if (r && r.download) downloadBlob(new Blob([r.text], { type: 'text/plain' }), r.download);
      else out.value = r;
    }));
  });
  row.appendChild(btn('Copy Result', 'secondary', function () { copyText(out.value, this); }));
  root.appendChild(row);
  root.appendChild(out);
  return ta;
}

reg('word-counter', function (root) {
  var ta = h('textarea', { placeholder: 'Type or paste text...' });
  var stats = h('div', { class: 'row3' });
  function upd() {
    var t = ta.value, words = (t.trim().match(/\S+/g) || []).length;
    var chars = t.length, noSpace = t.replace(/\s/g, '').length;
    var sents = (t.match(/[^.!?]+[.!?]+/g) || []).length;
    var paras = t.split(/\n\s*\n/).filter(function (x) { return x.trim(); }).length;
    var mins = Math.ceil(words / 200);
    stats.innerHTML = '';
    stats.innerHTML = '';
    [['Words', words], ['Characters', chars], ['No spaces', noSpace], ['Sentences', sents], ['Paragraphs', paras], ['Reading time', mins + ' min']].forEach(function (s) {
      var d = h('div', { class: 'result big' }); d.style.textAlign = 'center';
      d.appendChild(h('div', null, String(s[1])));
      d.appendChild(h('div', { style: 'font-size:13px;font-weight:400;color:#64748b' }, s[0]));
      stats.appendChild(d);
    });
  }
  ta.addEventListener('input', upd);
  root.appendChild(ta); root.appendChild(stats); upd();
});

reg('character-counter', function (root) {
  var ta = h('textarea', { placeholder: 'Type or paste text...' });
  var out = resultBox(true);
  function upd() {
    var t = ta.value;
    out.textContent = t.length + ' characters  •  ' + t.replace(/\s/g, '').length + ' without spaces  •  ' + t.split('\n').length + ' lines';
  }
  ta.addEventListener('input', upd);
  root.appendChild(ta); root.appendChild(out); upd();
});

reg('case-converter', function (root) {
  textTool(root, 'Type text...', [
    ['UPPERCASE', function (t) { return t.toUpperCase(); }],
    ['lowercase', function (t) { return t.toLowerCase(); }],
    ['Title Case', function (t) { return t.toLowerCase().replace(/(?:^|\s)\S/g, function (c) { return c.toUpperCase(); }); }, 'secondary'],
    ['Sentence case', function (t) { return t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function (c) { return c.toUpperCase(); }); }, 'secondary'],
    ['aLtErNaTiNg', function (t) { return t.split('').map(function (c, i) { return i % 2 ? c.toLowerCase() : c.toUpperCase(); }).join(''); }, 'secondary']
  ]);
});

reg('remove-duplicates', function (root) {
  var cs = h('input', { type: 'checkbox' }); cs.checked = true;
  var trim = h('input', { type: 'checkbox' }); trim.checked = true;
  var chk = h('div', { class: 'checks' });
  [['Case sensitive', cs], ['Trim whitespace', trim]].forEach(function (o) {
    var l = h('label'); l.appendChild(o[1]); l.appendChild(document.createTextNode(' ' + o[0])); chk.appendChild(l);
  });
  root.appendChild(chk);
  textTool(root, 'Paste lines (one per line)...', [
    ['Remove Duplicates', function (t) {
      var seen = {}, out = [];
      t.split('\n').forEach(function (line) {
        var k = trim.checked ? line.trim() : line;
        if (!cs.checked) k = k.toLowerCase();
        if (!seen[k]) { seen[k] = 1; out.push(trim.checked ? line.trim() : line); }
      });
      return out.join('\n');
    }],
    ['Sort A-Z', function (t) { return t.split('\n').sort().join('\n'); }, 'secondary'],
    ['Reverse Lines', function (t) { return t.split('\n').reverse().join('\n'); }, 'secondary']
  ]);
});

var LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
reg('lorem-ipsum', function (root) {
  var n = numInput(3, 1, 50, 1);
  var type = h('select');
  ['Paragraphs', 'Sentences', 'Words'].forEach(function (o) { type.appendChild(h('option', null, o)); });
  var out = h('textarea', { readonly: 'readonly', placeholder: 'Generated text...' });
  root.appendChild(h('div', { class: 'row' }, field('Amount', n), field('Type', type)));
  function gen() {
    function sent() {
      var w = [], c = randInt(6, 14);
      for (var i = 0; i < c; i++) w.push(LOREM_WORDS[randInt(0, LOREM_WORDS.length - 1)]);
      var s = w.join(' '); return s.charAt(0).toUpperCase() + s.slice(1) + '.';
    }
    var t = type.value, k = +n.value, r = [];
    if (t === 'Words') { for (var i = 0; i < k; i++) r.push(LOREM_WORDS[randInt(0, LOREM_WORDS.length - 1)]); return r.join(' '); }
    if (t === 'Sentences') { for (var j = 0; j < k; j++) r.push(sent()); return r.join(' '); }
    for (var p = 0; p < k; p++) { var ss = []; for (var q = 0; q < randInt(3, 6); q++) ss.push(sent()); r.push(ss.join(' ')); }
    return r.join('\n\n');
  }
  root.appendChild(btnRow(
    btn('Generate', '', function () { out.value = gen(); }),
    btn('Copy', 'secondary', function () { copyText(out.value, this); })
  ));
  root.appendChild(out);
  out.value = gen();
});

reg('text-reverser', function (root) {
  textTool(root, 'Type text...', [
    ['Reverse Text', function (t) { return t.split('').reverse().join(''); }],
    ['Reverse Words', function (t) { return t.split(/\s+/).reverse().join(' '); }, 'secondary'],
    ['Flip Lines', function (t) { return t.split('\n').reverse().join('\n'); }, 'secondary']
  ]);
});

reg('whitespace-remover', function (root) {
  textTool(root, 'Paste messy text...', [
    ['Clean Up', function (t) { return t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').split('\n').map(function (l) { return l.trim(); }).join('\n').trim(); }],
    ['Remove ALL Spaces', function (t) { return t.replace(/\s+/g, ''); }, 'secondary'],
    ['Single Line', function (t) { return t.replace(/\s+/g, ' ').trim(); }, 'secondary']
  ]);
});

reg('base64', function (root) {
  textTool(root, 'Type or paste...', [
    ['Encode → Base64', function (t) { try { return btoa(unescape(encodeURIComponent(t))); } catch (e) { return 'Error: ' + e.message; } }],
    ['Decode Base64 →', function (t) { try { return decodeURIComponent(escape(atob(t.trim()))); } catch (e) { return 'Error: invalid Base64'; } }, 'secondary']
  ]);
});

reg('url-encoder', function (root) {
  textTool(root, 'Type or paste URL/text...', [
    ['Encode URL', function (t) { return encodeURIComponent(t); }],
    ['Decode URL', function (t) { try { return decodeURIComponent(t); } catch (e) { return 'Error: invalid encoding'; } }, 'secondary']
  ]);
});

reg('json-formatter', function (root) {
  var ta = h('textarea', { placeholder: 'Paste JSON here...' });
  var out = h('textarea', { readonly: 'readonly', placeholder: 'Result...' });
  root.appendChild(ta);
  root.appendChild(btnRow(
    btn('Format / Beautify', '', function () {
      try { out.value = JSON.stringify(JSON.parse(ta.value), null, 2); }
      catch (e) { out.value = 'Invalid JSON: ' + e.message; }
    }),
    btn('Minify', 'secondary', function () {
      try { out.value = JSON.stringify(JSON.parse(ta.value)); }
      catch (e) { out.value = 'Invalid JSON: ' + e.message; }
    }),
    btn('Validate', 'secondary', function () {
      try { JSON.parse(ta.value); out.value = 'Valid JSON ✓'; }
      catch (e) { out.value = 'Invalid JSON: ' + e.message; }
    }),
    btn('Copy', 'secondary', function () { copyText(out.value, this); })
  ));
  root.appendChild(out);
});

/* ================= CALCULATORS ================= */
function calcTool(root, fields, compute, bigResult) {
  fields.forEach(function (f) { root.appendChild(field(f[0], f[1])); });
  var out = resultBox(bigResult !== false);
  var go = btn('Calculate', '', function () {
    var vals = fields.map(function (f) { return f[1].value; });
    out.innerHTML = compute(vals);
  });
  root.appendChild(btnRow(go));
  root.appendChild(out);
  return out;
}

reg('age-calculator', function (root) {
  var d = h('input', { type: 'date' });
  root.appendChild(field('Your birth date', d));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate Age', '', function () {
    if (!d.value) { out.textContent = 'Pick a date.'; return; }
    var b = new Date(d.value), now = new Date();
    var y = now.getFullYear() - b.getFullYear(), m = now.getMonth() - b.getMonth(), dd = now.getDate() - b.getDate();
    if (dd < 0) { m--; dd += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    var days = Math.floor((now - b) / 864e5);
    out.innerHTML = y + ' years, ' + m + ' months, ' + dd + ' days<br><small style="font-size:14px;font-weight:400;color:#64748b">' + days.toLocaleString() + ' days total • next birthday in ' + Math.ceil((new Date(now.getFullYear() + (now > new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0), b.getMonth(), b.getDate()) - now) / 864e5) + ' days</small>';
  })));
  root.appendChild(out);
});

reg('bmi-calculator', function (root) {
  var w = numInput(70, 1, 500, .1), hh = numInput(170, 30, 300, .1);
  root.appendChild(h('div', { class: 'row' }, field('Weight (kg)', w), field('Height (cm)', hh)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate BMI', '', function () {
    var bmi = w.value / Math.pow(hh.value / 100, 2);
    var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
    var col = bmi < 18.5 ? '#eab308' : bmi < 25 ? '#16a34a' : bmi < 30 ? '#f97316' : '#dc2626';
    out.innerHTML = 'BMI: <span style="color:' + col + '">' + bmi.toFixed(1) + '</span><br><small style="font-size:15px;font-weight:400">Category: ' + cat + '</small>';
  })));
  root.appendChild(out);
});

reg('loan-calculator', function (root) {
  var amt = numInput(10000, 1), rate = numInput(8, 0, 100, .1), yrs = numInput(5, 1, 50, 1);
  root.appendChild(h('div', { class: 'row3' }, field('Loan amount', amt), field('Interest % / year', rate), field('Years', yrs)));
  var out = resultBox();
  root.appendChild(btnRow(btn('Calculate EMI', '', function () {
    var P = +amt.value, r = +rate.value / 1200, n = +yrs.value * 12;
    var emi = r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
    out.innerHTML = '<div class="big" style="font-size:24px;font-weight:700">Monthly payment: ' + emi.toFixed(2) + '</div>Total payable: ' + (emi * n).toFixed(2) + ' • Total interest: ' + (emi * n - P).toFixed(2);
  })));
  root.appendChild(out);
});

reg('percentage-calculator', function (root) {
  var mode = h('select');
  ['What is X% of Y?', 'X is what % of Y?', 'Increase X by Y%', 'Decrease X by Y%'].forEach(function (o) { mode.appendChild(h('option', null, o)); });
  var x = numInput(20), y = numInput(200);
  root.appendChild(field('Mode', mode));
  root.appendChild(h('div', { class: 'row' }, field('X', x), field('Y', y)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate', '', function () {
    var a = +x.value, b = +y.value, r;
    if (mode.selectedIndex === 0) r = a / 100 * b;
    else if (mode.selectedIndex === 1) r = b ? a / b * 100 : 0;
    else if (mode.selectedIndex === 2) r = a * (1 + b / 100);
    else r = a * (1 - b / 100);
    out.textContent = (mode.selectedIndex === 1 ? r.toFixed(2) + '%' : r.toLocaleString(undefined, { maximumFractionDigits: 2 }));
  })));
  root.appendChild(out);
});

reg('tip-calculator', function (root) {
  var bill = numInput(50, 0, 1e9, .01), tip = numInput(15, 0, 100, 1), people = numInput(1, 1, 100, 1);
  root.appendChild(h('div', { class: 'row3' }, field('Bill amount', bill), field('Tip %', tip), field('People', people)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate', '', function () {
    var t = +bill.value * +tip.value / 100, total = +bill.value + t;
    out.innerHTML = 'Tip: ' + t.toFixed(2) + ' • Total: ' + total.toFixed(2) + '<br><small style="font-size:14px;font-weight:400;color:#64748b">Per person: ' + (total / +people.value).toFixed(2) + '</small>';
  })));
  root.appendChild(out);
});

reg('discount-calculator', function (root) {
  var price = numInput(100, 0, 1e9, .01), disc = numInput(20, 0, 100, 1);
  root.appendChild(h('div', { class: 'row' }, field('Original price', price), field('Discount %', disc)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate', '', function () {
    var save = +price.value * +disc.value / 100;
    out.innerHTML = 'You pay: ' + (+price.value - save).toFixed(2) + '<br><small style="font-size:14px;font-weight:400;color:#16a34a">You save: ' + save.toFixed(2) + '</small>';
  })));
  root.appendChild(out);
});

reg('currency-converter', function (root) {
  var rates = { USD: 1, EUR: .92, GBP: .79, PKR: 278, INR: 83.5, AED: 3.67, SAR: 3.75, CNY: 7.24, JPY: 149.8, CAD: 1.36, AUD: 1.52, CHF: .88 };
  var amt = numInput(100, 0, 1e12, .01), from = h('select'), to = h('select');
  Object.keys(rates).forEach(function (c) { from.appendChild(h('option', null, c)); to.appendChild(h('option', null, c)); });
  from.value = 'USD'; to.value = 'EUR';
  root.appendChild(field('Amount', amt));
  root.appendChild(h('div', { class: 'row' }, field('From', from), field('To', to)));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Uses indicative static rates. For exact transfers check your bank.'));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Convert', '', function () {
    var r = +amt.value / rates[from.value] * rates[to.value];
    out.textContent = +amt.value + ' ' + from.value + ' = ' + r.toFixed(2) + ' ' + to.value;
  })));
  root.appendChild(out);
});

var UNITS = {
  Length: { m: 1, km: 1000, cm: .01, mm: .001, mi: 1609.34, yd: .9144, ft: .3048, in: .0254 },
  Weight: { kg: 1, g: .001, lb: .453592, oz: .0283495, t: 1000 },
  Temperature: 'special',
  Volume: { l: 1, ml: .001, gal: 3.78541, cup: .236588 },
  Speed: { 'km/h': 1, 'm/s': 3.6, mph: 1.60934 },
  Data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }
};
reg('unit-converter', function (root) {
  var cat = h('select'), from = h('select'), to = h('select'), amt = numInput(1, 0, 1e15, .01);
  Object.keys(UNITS).forEach(function (c) { cat.appendChild(h('option', null, c)); });
  function fill() {
    from.innerHTML = ''; to.innerHTML = '';
    var u = UNITS[cat.value];
    if (u === 'special') { ['Celsius', 'Fahrenheit', 'Kelvin'].forEach(function (x) { from.appendChild(h('option', null, x)); to.appendChild(h('option', null, x)); }); }
    else Object.keys(u).forEach(function (x) { from.appendChild(h('option', null, x)); to.appendChild(h('option', null, x)); });
    to.selectedIndex = 1;
  }
  cat.addEventListener('change', fill); fill();
  root.appendChild(field('Category', cat));
  root.appendChild(field('Value', amt));
  root.appendChild(h('div', { class: 'row' }, field('From', from), field('To', to)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Convert', '', function () {
    var v = +amt.value, r;
    if (cat.value === 'Temperature') {
      var c = from.value === 'Celsius' ? v : from.value === 'Fahrenheit' ? (v - 32) * 5 / 9 : v - 273.15;
      r = to.value === 'Celsius' ? c : to.value === 'Fahrenheit' ? c * 9 / 5 + 32 : c + 273.15;
    } else { var u = UNITS[cat.value]; r = v * u[from.value] / u[to.value]; }
    out.textContent = v + ' ' + from.value + ' = ' + (+r.toFixed(6)) + ' ' + to.value;
  })));
  root.appendChild(out);
});

reg('timezone-converter', function (root) {
  var dt = h('input', { type: 'datetime-local' });
  var from = h('select'), to = h('select');
  var zones = ['UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'];
  zones.forEach(function (z) { from.appendChild(h('option', null, z)); to.appendChild(h('option', null, z)); });
  from.value = 'Europe/London'; to.value = 'Asia/Karachi';
  root.appendChild(field('Date & time', dt));
  root.appendChild(h('div', { class: 'row' }, field('From zone', from), field('To zone', to)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Convert', '', function () {
    if (!dt.value) { out.textContent = 'Pick a date & time.'; return; }
    var d = new Date(dt.value);
    var fmt = function (z) { return d.toLocaleString('en-GB', { timeZone: z, dateStyle: 'medium', timeStyle: 'short' }); };
    out.innerHTML = fmt(from.value) + ' <small>(' + from.value + ')</small><br>= ' + fmt(to.value) + ' <small>(' + to.value + ')</small>';
  })));
  root.appendChild(out);
});

reg('date-duration', function (root) {
  var a = h('input', { type: 'date' }), b = h('input', { type: 'date' });
  root.appendChild(h('div', { class: 'row' }, field('Start date', a), field('End date', b)));
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Calculate', '', function () {
    if (!a.value || !b.value) { out.textContent = 'Pick both dates.'; return; }
    var d1 = new Date(a.value), d2 = new Date(b.value);
    var days = Math.round(Math.abs(d2 - d1) / 864e5);
    out.innerHTML = days.toLocaleString() + ' days<br><small style="font-size:14px;font-weight:400;color:#64748b">' + (days / 7).toFixed(1) + ' weeks • ' + (days / 30.44).toFixed(1) + ' months • ' + (days / 365.25).toFixed(2) + ' years</small>';
  })));
  root.appendChild(out);
});

/* ================= SECURITY TOOLS ================= */
reg('password-generator', function (root) {
  var len = numInput(16, 4, 128, 1);
  var up = h('input', { type: 'checkbox' }), lo = h('input', { type: 'checkbox' }),
      dg = h('input', { type: 'checkbox' }), sy = h('input', { type: 'checkbox' });
  up.checked = lo.checked = dg.checked = sy.checked = true;
  var chk = h('div', { class: 'checks' });
  [['Uppercase', up], ['Lowercase', lo], ['Digits', dg], ['Symbols', sy]].forEach(function (o) {
    var l = h('label'); l.appendChild(o[1]); l.appendChild(document.createTextNode(' ' + o[0])); chk.appendChild(l);
  });
  root.appendChild(field('Length', len)); root.appendChild(chk);
  var out = resultBox(true); out.style.fontFamily = 'monospace'; out.style.fontSize = '20px';
  root.appendChild(btnRow(
    btn('Generate Password', '', function () {
      var pool = '';
      if (up.checked) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      if (lo.checked) pool += 'abcdefghijkmnpqrstuvwxyz';
      if (dg.checked) pool += '23456789';
      if (sy.checked) pool += '!@#$%^&*()-_=+[]{};:,.<>?';
      if (!pool) { out.textContent = 'Select at least one character set.'; return; }
      var r = secureRand(+len.value), s = '';
      for (var i = 0; i < r.length; i++) s += pool[r[i] % pool.length];
      out.textContent = s;
    }),
    btn('Copy', 'secondary', function () { copyText(out.textContent, this); })
  ));
  root.appendChild(out);
});

function sha256(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  var maxWord = Math.pow(2, 32), result = '', words = [], bitLen = ascii.length * 8;
  var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (var i = 0; i < ascii.length; i++) { var j = ascii.charCodeAt(i); if (j >> 8) return; words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = (bitLen / maxWord) | 0; words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], hh = hash[7];
    for (i = 0; i < 64; i++) {
      if (i < 16) { /* w[i] */ } else { var s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3); var s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g);
      var t1 = (hh + S1 + ch + k[i] + w[i]) | 0, S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0; hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0; hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + hh) | 0;
  }
  for (i = 0; i < hash.length; i++) for (j = 3; j + 1; j--) { var b2 = (hash[i] >> (j * 8)) & 255; result += ((b2 < 16) ? '0' : '') + b2.toString(16); }
  return result;
}
reg('hash-generator', function (root) {
  var ta = h('textarea', { placeholder: 'Type text to hash...' });
  var out = resultBox();
  root.appendChild(ta);
  root.appendChild(btnRow(btn('Generate Hashes', '', function () {
    var t = unescape(encodeURIComponent(ta.value));
    var md5 = 'use online for MD5';
    var h32 = 0;
    for (var i = 0; i < t.length; i++) h32 = (h32 * 31 + t.charCodeAt(i)) | 0;
    out.innerHTML = '<b>SHA-256:</b><br><code style="word-break:break-all">' + sha256(t) + '</code><br><br><b>Simple checksum:</b> ' + (h32 >>> 0).toString(16);
  })));
  root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Hashes are computed locally in your browser — your text never leaves your device.'));
});

reg('random-number', function (root) {
  var mn = numInput(1), mx = numInput(100), cnt = numInput(1, 1, 1000, 1);
  var uniq = h('input', { type: 'checkbox' });
  root.appendChild(h('div', { class: 'row3' }, field('Min', mn), field('Max', mx), field('Count', cnt)));
  var chk = h('div', { class: 'checks' });
  var l = h('label'); l.appendChild(uniq); l.appendChild(document.createTextNode(' Unique numbers')); chk.appendChild(l);
  root.appendChild(chk);
  var out = resultBox(true);
  root.appendChild(btnRow(btn('Generate', '', function () {
    var a = +mn.value, b = +mx.value, n = +cnt.value, r = [];
    if (uniq.checked && n > b - a + 1) { out.textContent = 'Range too small for ' + n + ' unique numbers.'; return; }
    var seen = {};
    while (r.length < n) {
      var v = a + secureRand(4).reduce(function (x, y) { return x * 256 + y; }, 0) % (b - a + 1);
      if (uniq.checked && seen[v]) continue;
      seen[v] = 1; r.push(v);
    }
    out.textContent = r.join(', ');
  })));
  root.appendChild(out);
});

reg('coin-flip', function (root) {
  var out = resultBox(true); out.style.fontSize = '64px'; out.style.textAlign = 'center';
  var coin = h('div', null, '?'); coin.style.cssText = 'font-size:48px;font-weight:800;text-align:center';; out.appendChild(coin);
  var hist = h('p', { style: 'text-align:center;color:#64748b' });
  var hh = 0, tt = 0;
  root.appendChild(h('div', { style: 'text-align:center' }, btn('Flip Coin', '', function () {
    var heads = Math.random() < .5;
    if (heads) hh++; else tt++;
    coin.textContent = heads ? 'Heads' : 'Tails';
    coin.style.transform = 'rotateY(720deg)'; coin.style.transition = 'transform .6s';
    setTimeout(function () { coin.style.transform = ''; }, 650);
    out.querySelector('div:last-child, .lbl') || null;
    hist.textContent = (heads ? 'HEADS!' : 'TAILS!') + '  —  Heads: ' + hh + ' • Tails: ' + tt;
  })));
  root.appendChild(out); root.appendChild(hist);
});

reg('dice-roller', function (root) {
  var n = numInput(1, 1, 10, 1), sides = numInput(6, 2, 100, 1);
  root.appendChild(h('div', { class: 'row' }, field('Dice', n), field('Sides', sides)));
  var out = resultBox(true); out.style.fontSize = '48px'; out.style.textAlign = 'center';
  root.appendChild(h('div', { style: 'text-align:center' }, btn('Roll', '', function () {
    var r = [];
    for (var i = 0; i < +n.value; i++) r.push(randInt(1, +sides.value));
    out.textContent = r.join('  •  ') + '   = ' + r.reduce(function (a, b) { return a + b; }, 0);
  })));
  root.appendChild(out);
});

/* ================= COLOR TOOLS ================= */
reg('color-picker', function (root) {
  var c = h('input', { type: 'color' }); c.value = '#2563eb';
  var prev = h('div', { style: 'height:120px;border-radius:12px;margin:14px 0;background:#2563eb' });
  var out = resultBox();
  function upd() {
    prev.style.background = c.value;
    var r = parseInt(c.value.slice(1, 3), 16), g = parseInt(c.value.slice(3, 5), 16), b = parseInt(c.value.slice(5, 7), 16);
    out.innerHTML = '<b>HEX:</b> ' + c.value + ' &nbsp; <b>RGB:</b> ' + r + ', ' + g + ', ' + b;
  }
  c.addEventListener('input', upd);
  root.appendChild(field('Pick a color', c)); root.appendChild(prev); root.appendChild(out);
  root.appendChild(btnRow(btn('Copy HEX', 'secondary', function () { copyText(c.value, this); })));
  upd();
});

reg('hex-to-rgb', function (root) {
  var hx = h('input', { type: 'text', placeholder: '#2563eb' });
  var r = numInput(37, 0, 255, 1), g = numInput(99, 0, 255, 1), b = numInput(235, 0, 255, 1);
  var out = resultBox(true);
  root.appendChild(field('HEX → RGB', hx));
  root.appendChild(btnRow(btn('HEX to RGB', '', function () {
    var m = hx.value.trim().replace('#', '');
    if (m.length === 3) m = m.split('').map(function (x) { return x + x; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(m)) { out.textContent = 'Invalid HEX.'; return; }
    out.textContent = 'rgb(' + parseInt(m.slice(0, 2), 16) + ', ' + parseInt(m.slice(2, 4), 16) + ', ' + parseInt(m.slice(4, 6), 16) + ')';
  })));
  root.appendChild(h('div', { class: 'row3' }, field('R', r), field('G', g), field('B', b)));
  root.appendChild(btnRow(btn('RGB to HEX', 'secondary', function () {
    function to2(v) { var s = Math.max(0, Math.min(255, +v)).toString(16); return s.length < 2 ? '0' + s : s; }
    out.textContent = '#' + to2(r.value) + to2(g.value) + to2(b.value);
  })));
  root.appendChild(out);
});

reg('random-color', function (root) {
  var box = h('div', { class: 'row3' });
  root.appendChild(btnRow(btn('Generate Palette', '', function () {
    box.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var col = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
      var d = h('div', { style: 'background:' + col + ';border-radius:10px;padding:26px 8px;text-align:center;color:#fff;font-weight:700;cursor:pointer;font-size:13px' }, col);
      (function (cc, el) { el.addEventListener('click', function () { copyText(cc, el); }); })(col, d);
      box.appendChild(d);
    }
  })));
  root.appendChild(box);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Click any color to copy its HEX code.'));
});

reg('gradient-generator', function (root) {
  var c1 = h('input', { type: 'color' }); c1.value = '#2563eb';
  var c2 = h('input', { type: 'color' }); c2.value = '#7c3aed';
  var ang = numInput(135, 0, 360, 1);
  var prev = h('div', { style: 'height:160px;border-radius:12px;margin:14px 0' });
  var out = h('textarea', { readonly: 'readonly' });
  function upd() {
    var g = 'linear-gradient(' + ang.value + 'deg, ' + c1.value + ', ' + c2.value + ')';
    prev.style.background = g;
    out.value = 'background: ' + g + ';';
  }
  [c1, c2, ang].forEach(function (i) { i.addEventListener('input', upd); });
  root.appendChild(h('div', { class: 'row3' }, field('Color 1', c1), field('Color 2', c2), field('Angle', ang)));
  root.appendChild(prev);
  root.appendChild(btnRow(btn('Copy CSS', 'secondary', function () { copyText(out.value, this); })));
  root.appendChild(out); upd();
});

function lum(hex) {
  var r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  function f(c) { return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
}
reg('contrast-checker', function (root) {
  var fg = h('input', { type: 'color' }); fg.value = '#ffffff';
  var bg = h('input', { type: 'color' }); bg.value = '#2563eb';
  var prev = h('div', { style: 'border-radius:12px;padding:30px;margin:14px 0;text-align:center;font-size:24px;font-weight:700' }, 'Sample Text');
  var out = resultBox();
  function upd() {
    prev.style.color = fg.value; prev.style.background = bg.value;
    var l1 = lum(fg.value), l2 = lum(bg.value);
    var ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
    var aa = ratio >= 4.5 ? 'PASS' : 'FAIL', aaa = ratio >= 7 ? 'PASS' : 'FAIL';
    out.innerHTML = 'Contrast ratio: <b>' + ratio.toFixed(2) + ':1</b><br>WCAG AA (normal text): <b>' + aa + '</b> • AAA: <b>' + aaa + '</b>';
  }
  [fg, bg].forEach(function (i) { i.addEventListener('input', upd); });
  root.appendChild(h('div', { class: 'row' }, field('Text color', fg), field('Background', bg)));
  root.appendChild(prev); root.appendChild(out); upd();
});

/* ================= DEVELOPER TOOLS ================= */
reg('html-encoder', function (root) {
  textTool(root, 'Paste HTML...', [
    ['Encode HTML', function (t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }],
    ['Decode HTML', function (t) { var d = document.createElement('div'); d.innerHTML = t; return d.textContent; }, 'secondary']
  ]);
});

reg('css-minifier', function (root) {
  textTool(root, 'Paste CSS...', [
    ['Minify CSS', function (t) {
      return t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,>+~])\s*/g, '$1').replace(/;}/g, '}').replace(/\s+/g, ' ').trim();
    }],
    ['Beautify CSS', function (t) {
      return t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*{\s*/g, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n\n').trim();
    }, 'secondary']
  ]);
});

reg('js-minifier', function (root) {
  textTool(root, 'Paste JavaScript...', [
    ['Minify JS (basic)', function (t) {
      return t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*\/\/.*$/gm, '$1').replace(/\s*\n\s*/g, ' ').replace(/\s*([{}();,=+\-*/<>!&|:?])\s*/g, '$1').trim();
    }]
  ]);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Basic whitespace/comment minifier. For production builds use Terser or esbuild.'));
});

reg('uuid-generator', function (root) {
  var n = numInput(5, 1, 100, 1);
  var out = h('textarea', { readonly: 'readonly' });
  function gen() {
    var r = [];
    for (var i = 0; i < +n.value; i++) {
      var b = secureRand(16); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      var hx = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      r.push(hx.slice(0, 8) + '-' + hx.slice(8, 12) + '-' + hx.slice(12, 16) + '-' + hx.slice(16, 20) + '-' + hx.slice(20));
    }
    return r.join('\n');
  }
  root.appendChild(field('How many', n));
  root.appendChild(btnRow(
    btn('Generate UUIDs', '', function () { out.value = gen(); }),
    btn('Copy All', 'secondary', function () { copyText(out.value, this); })
  ));
  root.appendChild(out);
  out.value = gen();
});

reg('timestamp-converter', function (root) {
  var ts = h('input', { type: 'text', placeholder: 'e.g. 1728566400' });
  var dt = h('input', { type: 'datetime-local' });
  var out = resultBox();
  root.appendChild(field('Unix timestamp → date', ts));
  root.appendChild(btnRow(btn('To Date', '', function () {
    var v = parseFloat(ts.value.trim());
    if (isNaN(v)) { out.textContent = 'Invalid timestamp.'; return; }
    if (v < 1e12) v *= 1000;
    var d = new Date(v);
    out.innerHTML = '<b>UTC:</b> ' + d.toUTCString() + '<br><b>Local:</b> ' + d.toLocaleString();
  })));
  root.appendChild(field('Date → timestamp', dt));
  root.appendChild(btnRow(btn('To Timestamp', 'secondary', function () {
    if (!dt.value) { out.textContent = 'Pick a date.'; return; }
    var ms = new Date(dt.value).getTime();
    out.innerHTML = '<b>Seconds:</b> ' + Math.floor(ms / 1000) + '<br><b>Milliseconds:</b> ' + ms;
  })));
  root.appendChild(btnRow(btn('Current Timestamp', 'secondary', function () {
    out.innerHTML = '<b>Now (seconds):</b> ' + Math.floor(Date.now() / 1000) + '<br><b>Milliseconds:</b> ' + Date.now();
  })));
  root.appendChild(out);
});

reg('link-shortener', function (root) {
  var inp = h('input', { type: 'url', placeholder: 'https://example.com/very/long/url...' });
  inp.style.width = '100%';
  var out = resultBox(true);
  root.appendChild(field('Long URL', inp));
  root.appendChild(btnRow(btn('Shorten Link', '', function () {
    var url = inp.value.trim();
    if (!url) { out.textContent = 'Please paste a URL first.'; return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    out.textContent = 'Shortening...';
    // NOTE: is.gd / tinyurl / v.gd block browser fetch (no usable CORS headers);
    // da.gd sends Access-Control-Allow-Origin:* so it works directly, and a
    // public CORS proxy is kept as a last resort for the other services.
    var dagd = 'https://da.gd/s?url=',
        isgd = 'https://is.gd/create.php?format=simple&url=',
        vgd = 'https://v.gd/create.php?format=simple&url=',
        tiny = 'https://tinyurl.com/api-create.php?url=',
        proxy = 'https://api.allorigins.win/raw?url=';
    var services = [
      dagd + encodeURIComponent(url),
      isgd + encodeURIComponent(url),
      vgd + encodeURIComponent(url),
      tiny + encodeURIComponent(url),
      proxy + encodeURIComponent(tiny + encodeURIComponent(url)),
      proxy + encodeURIComponent(isgd + encodeURIComponent(url))
    ];
    var tryService = function (idx) {
      if (idx >= services.length) {
        out.textContent = 'Could not reach the shortening service. Check your internet and try again.';
        return;
      }
      var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(services[idx], ctl ? { signal: ctl.signal } : {})
        .then(function (r) { clearTimeout(to); return r.text(); })
        .then(function (short) {
          short = short.trim();
          if (!/^https?:\/\//i.test(short)) { tryService(idx + 1); return; }
          out.innerHTML = '';
          out.appendChild(h('div', null, 'Your short link:'));
          var link = h('a', { href: short, target: '_blank', rel: 'noopener' }, short);
          link.style.cssText = 'font-size:1.3em;font-weight:bold;word-break:break-all;';
          out.appendChild(h('div', null, link));
          var cp = btn('Copy Link', 'green', function () { copyText(short, cp); });
          out.appendChild(btnRow(cp));
        })
        .catch(function () { clearTimeout(to); tryService(idx + 1); });
    };
    tryService(0);
  })));
  root.appendChild(out);
  root.appendChild(h('p', { class: 'note' }, 'Note: uses the free da.gd / is.gd service over HTTPS.'));
});

/* ================= NEW SECURITY TOOLS (2026-10-15) ================= */
reg('password-strength-checker', function (root) {
  var pw = h('input', { type: 'password', placeholder: 'Type your password...', autocomplete: 'off' });
  pw.style.cssText = 'font-size:18px;padding:10px;width:100%;box-sizing:border-box;';
  var meterWrap = h('div', { style: 'margin:14px 0 6px;background:#e2e8f0;border-radius:8px;height:14px;overflow:hidden;' });
  var meter = h('div', { style: 'height:100%;width:0%;border-radius:8px;transition:width .3s,background .3s;' });
  meterWrap.appendChild(meter);
  var scoreLine = h('p', { style: 'font-weight:bold;font-size:17px;margin:6px 0;' });
  var crackLine = h('p', { style: 'color:#64748b;margin:4px 0;' });
  var tips = h('ul', { style: 'color:#475569;line-height:1.9;' });
  var showBtn = btn('Show', 'secondary', function () {
    pw.type = pw.type === 'password' ? 'text' : 'password';
    showBtn.textContent = pw.type === 'password' ? 'Show' : 'Hide';
  });
  root.appendChild(field('Password', pw));
  root.appendChild(btnRow(showBtn));
  root.appendChild(meterWrap);
  root.appendChild(scoreLine); root.appendChild(crackLine);
  root.appendChild(h('h3', null, 'How to improve')); root.appendChild(tips);

  function entropy(s) {
    var pool = 0;
    if (/[a-z]/.test(s)) pool += 26;
    if (/[A-Z]/.test(s)) pool += 26;
    if (/[0-9]/.test(s)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(s)) pool += 32;
    if (/[\u0080-\uffff]/.test(s)) pool += 100;
    return s.length * Math.log2(pool || 1);
  }
  function crackTime(bits) {
    var guesses = Math.pow(2, bits - 1), perSec = 1e10;
    var secs = guesses / perSec;
    if (secs < 1) return 'less than a second';
    if (secs < 60) return Math.round(secs) + ' seconds';
    if (secs < 3600) return Math.round(secs / 60) + ' minutes';
    if (secs < 86400) return Math.round(secs / 3600) + ' hours';
    if (secs < 31536000) return Math.round(secs / 86400) + ' days';
    if (secs < 3153600000) return Math.round(secs / 31536000) + ' years';
    return 'centuries';
  }
  pw.addEventListener('input', function () {
    var s = pw.value, bits = entropy(s), score = Math.min(100, Math.round(bits * 1.4));
    var label, color;
    if (!s) { label = ''; color = '#e2e8f0'; score = 0; }
    else if (score < 30) { label = 'Weak'; color = '#dc2626'; }
    else if (score < 55) { label = 'Fair'; color = '#f59e0b'; }
    else if (score < 80) { label = 'Good'; color = '#84cc16'; }
    else { label = 'Strong'; color = '#16a34a'; }
    meter.style.width = score + '%'; meter.style.background = color;
    scoreLine.textContent = s ? label + ' — ' + score + '/100' : '';
    scoreLine.style.color = color;
    crackLine.textContent = s ? 'Estimated time to crack: ' + crackTime(bits) + ' (10 billion guesses/sec).' : '';
    var t = [];
    if (s.length < 12) t.push('Make it at least 12 characters long (16+ is better).');
    if (!/[A-Z]/.test(s)) t.push('Add uppercase letters.');
    if (!/[a-z]/.test(s)) t.push('Add lowercase letters.');
    if (!/[0-9]/.test(s)) t.push('Add numbers.');
    if (!/[^a-zA-Z0-9]/.test(s)) t.push('Add symbols like !@#$%.');
    if (/(.)\1\1/.test(s)) t.push('Avoid repeating the same character 3+ times.');
    if (/^(123|abc|password|qwerty)/i.test(s)) t.push('Avoid common patterns and dictionary words.');
    if (!t.length && s) t.push('Great! This looks like a strong password. Use a unique one per site.');
    tips.innerHTML = '';
    t.forEach(function (x) { var li = h('li', null, x); tips.appendChild(li); });
  });
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Checked 100% locally in your browser — your password is never sent anywhere.'));
});

reg('ip-lookup', function (root) {
  var inp = h('input', { type: 'text', placeholder: 'IP address or domain — e.g. 8.8.8.8' });
  inp.style.cssText = 'width:100%;box-sizing:border-box;padding:10px;font-size:16px;';
  var out = resultBox();
  root.appendChild(field('IP or domain', inp));
  function render(d) {
    out.innerHTML = '';
    var rows = [
      ['IP address', d.ip || '—'], ['City', d.city || '—'], ['Region', d.region || '—'],
      ['Country', (d.country_name || '') + (d.country_code ? ' (' + d.country_code + ')' : '')],
      ['ISP / Org', d.org || '—'], ['Timezone', d.timezone || '—'],
      ['Latitude / Longitude', (d.latitude != null ? d.latitude + ', ' + d.longitude : '—')]
    ];
    var tbl = h('table', { style: 'width:100%;border-collapse:collapse;' });
    rows.forEach(function (r) {
      var tr = h('tr');
      tr.appendChild(h('td', { style: 'padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold;width:40%;' }, r[0]));
      tr.appendChild(h('td', { style: 'padding:8px;border-bottom:1px solid #e2e8f0;word-break:break-all;' }, r[1]));
      tbl.appendChild(tr);
    });
    out.appendChild(tbl);
  }
  function lookup(q) {
    out.textContent = 'Looking up…';
    fetch('https://ipapi.co/' + encodeURIComponent(q) + '/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) { out.textContent = 'Lookup failed: ' + d.reason + '. Try again in a moment.'; return; }
        render(d);
      })
      .catch(function () { out.textContent = 'Could not reach the lookup service. Check your internet and try again.'; });
  }
  root.appendChild(btnRow(
    btn('Look Up', '', function () {
      var q = inp.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
      if (!q) { out.textContent = 'Enter an IP address or domain first.'; return; }
      lookup(q);
    }),
    btn('My IP', 'secondary', function () { lookup(''); inp.value = ''; })
  ));
  root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Uses the free ipapi.co geolocation API. Locations are approximate (ISP level).'));
});

reg('security-headers-checker', function (root) {
  var inp = h('input', { type: 'text', placeholder: 'example.com' });
  inp.style.cssText = 'width:100%;box-sizing:border-box;padding:10px;font-size:16px;';
  var out = resultBox();
  root.appendChild(field('Website URL', inp));
  var HEADERS = [
    ['strict-transport-security', 'Strict-Transport-Security (HSTS)', 'Forces browsers to use HTTPS only. Protects against protocol-downgrade attacks.'],
    ['content-security-policy', 'Content-Security-Policy (CSP)', 'Controls which scripts, styles and resources may load. Key defense against XSS attacks.'],
    ['x-frame-options', 'X-Frame-Options', 'Prevents the page being embedded in iframes — stops clickjacking attacks.'],
    ['x-content-type-options', 'X-Content-Type-Options', 'Stops browsers "sniffing" file types — set to nosniff.'],
    ['referrer-policy', 'Referrer-Policy', 'Controls how much referrer info is sent when users click away.'],
    ['permissions-policy', 'Permissions-Policy', 'Restricts powerful browser features (camera, mic, geolocation).']
  ];
  function render(found) {
    out.innerHTML = '';
    var present = 0;
    HEADERS.forEach(function (hd) {
      var key = hd[0], val = null, rawKey = null;
      Object.keys(found).forEach(function (k) { if (k.toLowerCase() === key) { val = found[k]; rawKey = k; } });
      var ok = val !== null; if (ok) present++;
      var row = h('div', { style: 'padding:10px;border:1px solid ' + (ok ? '#bbf7d0' : '#fecaca') + ';border-radius:8px;margin-bottom:8px;background:' + (ok ? '#f0fdf4' : '#fef2f2') + ';' });
      row.appendChild(h('div', { style: 'font-weight:bold;' }, (ok ? 'Pass: ' : 'Fail: ') + hd[1]));
      row.appendChild(h('div', { style: 'font-size:13px;color:#475569;margin-top:4px;' }, hd[2]));
      if (ok) row.appendChild(h('code', { style: 'font-size:12px;word-break:break-all;display:block;margin-top:6px;color:#166534;' }, rawKey + ': ' + String(val).slice(0, 220)));
      out.appendChild(row);
    });
    var sum = h('p', { style: 'font-weight:bold;margin-top:10px;' }, 'Score: ' + present + ' / ' + HEADERS.length + ' security headers present.');
    out.appendChild(sum);
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'For a deeper automated scan, also try securityheaders.com.'));
  }
  root.appendChild(btnRow(btn('Check Headers', '', function () {
    var q = inp.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!q) { out.textContent = 'Enter a website URL first.'; return; }
    out.textContent = 'Fetching headers…';
    fetch('https://api.hackertarget.com/httpheaders/?q=' + encodeURIComponent(q))
      .then(function (r) { return r.text(); })
      .then(function (t) {
        if (/error/i.test(t) && t.length < 200) { out.textContent = 'Lookup failed: ' + t.trim(); return; }
        var found = {};
        t.split(/\r?\n/).forEach(function (line) {
          var i = line.indexOf(':');
          if (i > 0) found[line.slice(0, i).trim()] = line.slice(i + 1).trim();
        });
        if (!Object.keys(found).length) { out.textContent = 'No headers returned. The site may block this check — try securityheaders.com instead.'; return; }
        render(found);
      })
      .catch(function () { out.textContent = 'Could not reach the header service. Check your internet and try again.'; });
  })));
  root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Header fetch uses the free hackertarget.com API. Explanations are educational — this is a defensive learning tool.'));
});

reg('phishing-url-checker', function (root) {
  var inp = h('input', { type: 'text', placeholder: 'Paste the suspicious URL here…' });
  inp.style.cssText = 'width:100%;box-sizing:border-box;padding:10px;font-size:16px;';
  var out = resultBox();
  root.appendChild(field('URL to analyze', inp));
  var SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'shorte.st'];
  var SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.link', '.work', '.loan'];
  function check(raw) {
    var url = raw.trim(), findings = [], risk = 0;
    var u;
    try {
      u = new URL(/^[a-z]+:\/\//i.test(url) ? url : 'http://' + url);
    } catch (e) { return { err: 'That does not look like a valid URL.' }; }
    var host = u.hostname.toLowerCase(), full = u.href;
    function add(pts, ok, text) { risk += pts; findings.push({ pts: pts, ok: ok, text: text }); }
    if (/^https:/i.test(u.protocol)) add(0, true, 'Uses HTTPS (encrypted connection).');
    else add(25, false, 'No HTTPS — data is sent unencrypted.');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) add(25, false, 'Host is a raw IP address instead of a domain name.');
    else add(0, true, 'Host is a domain name, not a raw IP.');
    var parts = host.split('.');
    if (parts.length > 3) add(15, false, 'Many subdomains (' + parts.length + ' parts) — a common phishing trick.');
    else add(0, true, 'Subdomain depth looks normal.');
    var tldBad = SUSPICIOUS_TLDS.some(function (t) { return host.endsWith(t); });
    if (tldBad) add(20, false, 'Uses a top-level domain often abused by scammers.');
    else add(0, true, 'Top-level domain is not on the high-risk list.');
    if (full.indexOf('@') !== -1) add(25, false, 'Contains "@" — everything before it can be fake.');
    else add(0, true, 'No "@" trick in the URL.');
    if (/-/.test(host) && /paypal|apple|google|amazon|bank|login|secure|account|verify/i.test(host))
      add(25, false, 'Brand-like words combined with hyphens (e.g. "paypal-secure-login").');
    else add(0, true, 'No brand-imitating hyphen pattern detected.');
    var short = SHORTENERS.some(function (s) { return host === s || host.endsWith('.' + s); });
    if (short) add(15, false, 'URL shortener hides the real destination.');
    else add(0, true, 'Not a known URL shortener.');
    if (full.length > 120) add(10, false, 'Very long URL (' + full.length + ' chars) — can hide the true domain.');
    else add(0, true, 'URL length looks normal.');
    if (/[а-яё\u0370-\u03ff\u3040-\u30ff\u4e00-\u9fff]/i.test(full))
      add(20, false, 'Contains non-Latin characters — possible homograph attack.');
    else add(0, true, 'No suspicious non-Latin characters.');
    if (/\d/.test(host.replace(/\./g, '')) && /login|secure|verify|account|bank/i.test(host))
      add(10, false, 'Numbers mixed into a sensitive-looking domain.');
    return { risk: Math.min(100, risk), findings: findings };
  }
  root.appendChild(btnRow(btn('Check URL', '', function () {
    var r = check(inp.value);
    out.innerHTML = '';
    if (r.err) { out.textContent = r.err; return; }
    var label, color;
    if (r.risk < 25) { label = 'Looks Safe'; color = '#16a34a'; }
    else if (r.risk < 60) { label = 'Suspicious'; color = '#f59e0b'; }
    else { label = 'Dangerous'; color = '#dc2626'; }
    var head = h('div', { style: 'text-align:center;padding:16px;border-radius:10px;background:' + color + '18;border:2px solid ' + color + ';margin-bottom:12px;' });
    head.appendChild(h('div', { style: 'font-size:26px;font-weight:bold;color:' + color + ';' }, label + ' — ' + r.risk + '/100 risk'));
    out.appendChild(head);
    r.findings.forEach(function (f) {
      var row = h('div', { style: 'padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;' });
      row.appendChild(h('span', { style: 'font-weight:bold;color:' + (f.ok ? '#16a34a' : '#dc2626') + ';' }, f.ok ? 'Pass: ' : 'Warning: '));
      row.appendChild(document.createTextNode(f.text + (f.pts ? ' (+' + f.pts + ' risk)' : '')));
      out.appendChild(row);
    });
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b;margin-top:10px;' }, 'Disclaimer: this is a first-pass heuristic check only and cannot guarantee a site is legitimate. When in doubt, never enter passwords or payment details.'));
  })));
  root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Analysis runs 100% locally in your browser — the URL is never sent anywhere.'));
});

/* ================= CREATOR + MEDIA TOOLS (2026-11-05, Wave 2) ================= */
/* All client-side. No uploads. Tools that fetch a library use the same CDN
   pattern as the existing tools (pdf-lib, pdf.js, qrcodejs). */
function needScript(src, test) {
  if (test && test()) return Promise.resolve();
  return new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = function () { rej(new Error('Could not load the needed library (internet needed once).')); };
    document.head.appendChild(s);
  });
}
function needTesseract() { return needScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js', function () { return !!window.Tesseract; }); }
function needFFmpeg() { return needScript('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.min.js', function () { return !!window.FFmpeg; }); }
function needDocx() { return needScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js', function () { return !!window.docx; }); }
function needDocxPreview() { return needScript('https://cdn.jsdelivr.net/npm/docx-preview@0.3.2/dist/docx-preview.min.js', function () { return !!window.docxPreview; }); }
function ytVideoId(url) {
  var m = String(url || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ---------- 1. YouTube Thumbnail Downloader ---------- */
reg('youtube-thumbnail-downloader', function (root) {
  var inp = h('input', { type: 'url', placeholder: 'Paste a YouTube video URL — e.g. https://www.youtube.com/watch?v=...' });
  var out = h('div'); var list = h('div');
  root.appendChild(field('YouTube video URL', inp));
  root.appendChild(btnRow(btn('Get Thumbnails', '', function () {
    var id = ytVideoId(inp.value);
    list.innerHTML = '';
    if (!id) { out.textContent = 'Could not find a video ID in that link. Paste a full YouTube watch, Shorts or youtu.be link.'; return; }
    out.textContent = '';
    var quals = [['HD 1280x720', 'maxresdefault'], ['SD 640x480', 'sddefault'], ['HQ 480x360', 'hqdefault'], ['MQ 320x180', 'mqdefault'], ['Default 120x90', 'default']];
    quals.forEach(function (q) {
      var url = 'https://i.ytimg.com/vi/' + id + '/' + q[1] + '.jpg';
      var card = h('div', { class: 'thumb-card', style: 'margin:12px 0;padding:10px;border:1px solid #e2e8f0;border-radius:10px' });
      card.appendChild(h('div', null, q[0]));
      var img = h('img', { src: url, alt: q[0] + ' thumbnail', style: 'max-width:100%;border-radius:8px;margin:6px 0' });
      img.onerror = function () { card.style.display = 'none'; };
      card.appendChild(img);
      card.appendChild(btnRow(
        btn('Download JPG', '', function () {
          fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
            downloadBlob(b, 'youtube-thumbnail-' + id + '-' + q[1] + '.jpg');
          }).catch(function () { window.open(url, '_blank'); });
        }),
        btn('Copy Image URL', 'secondary', function () { copyText(url, this); })
      ));
      list.appendChild(card);
    });
  })));
  root.appendChild(out); root.appendChild(list);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Thumbnails are fetched directly from YouTube’s image server (i.ytimg.com) — the video ID you enter is sent to YouTube so it can return the images. Only use thumbnails you have the right to use.'));
});

/* ---------- 2. Hashtag Generator ---------- */
reg('hashtag-generator', function (root) {
  var topic = h('input', { type: 'text', placeholder: 'e.g. homemade biryani, travel vlog, fitness tips' });
  var plat = h('select');
  [['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']].forEach(function (o) { plat.appendChild(h('option', { value: o[0] }, o[1])); });
  var cnt = h('select');
  [['10', '10 hashtags'], ['20', '20 hashtags'], ['30', '30 hashtags']].forEach(function (o) { cnt.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('textarea', { placeholder: 'Your hashtags will appear here...', readonly: 'readonly' });
  var triggers = {
    travel: ['travel', 'trip', 'tour', 'vacation', 'holiday', 'flight', 'hotel', 'beach', 'mountain', 'adventure', 'backpack', 'journey', 'destination', 'wanderlust'],
    food: ['food', 'biryani', 'recipe', 'cooking', 'kitchen', 'restaurant', 'chai', 'cake', 'pizza', 'burger', 'dessert', 'snack', 'breakfast', 'lunch', 'dinner', 'bakery', 'chef', 'eat', 'curry', 'kebab'],
    fitness: ['fitness', 'gym', 'workout', 'yoga', 'run', 'running', 'health', 'diet', 'weight', 'muscle', 'exercise', 'training', 'fit'],
    tech: ['tech', 'app', 'software', 'phone', 'computer', 'gadget', 'ai', 'robot', 'coding', 'programming', 'review', 'unboxing'],
    fashion: ['fashion', 'style', 'outfit', 'dress', 'clothes', 'shopping', 'makeup', 'look', 'trend'],
    business: ['business', 'startup', 'money', 'marketing', 'sales', 'entrepreneur', 'shop', 'store', 'brand', 'invest'],
    education: ['education', 'learn', 'study', 'student', 'school', 'exam', 'course', 'tutorial', 'teacher', 'english', 'urdu', 'math', 'science'],
    gaming: ['gaming', 'game', 'gamer', 'pubg', 'fortnite', 'playstation', 'xbox', 'esports', 'gameplay'],
    music: ['music', 'song', 'singer', 'singing', 'guitar', 'piano', 'naat', 'qawwali', 'playlist'],
    beauty: ['beauty', 'makeup', 'skincare', 'hair', 'glow', 'cosmetics', 'mehndi'],
    photography: ['photo', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
    motivation: ['motivation', 'inspire', 'success', 'goal', 'mindset', 'positive', 'dream', 'hardwork']
  };
  var niche = {
    travel: ['travel', 'wanderlust', 'travelphotography', 'adventure', 'explore', 'vacation', 'trip', 'tourism'],
    food: ['food', 'foodie', 'foodlover', 'recipe', 'homemade', 'delicious', 'cooking', 'foodblogger'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'fitlife', 'exercise', 'training', 'healthy'],
    tech: ['tech', 'technology', 'gadgets', 'innovation', 'software', 'digital', 'ai', 'review'],
    fashion: ['fashion', 'style', 'outfit', 'ootd', 'trend', 'shopping', 'lookbook'],
    business: ['business', 'entrepreneur', 'startup', 'marketing', 'money', 'success', 'smallbusiness'],
    education: ['education', 'learning', 'study', 'student', 'knowledge', 'tutorial', 'school'],
    gaming: ['gaming', 'gamer', 'videogames', 'game', 'esports', 'gameplay'],
    music: ['music', 'song', 'singer', 'musician', 'newmusic', 'playlist'],
    beauty: ['beauty', 'makeup', 'skincare', 'glow', 'cosmetics'],
    photography: ['photography', 'photo', 'photographer', 'photoshoot', 'portrait'],
    motivation: ['motivation', 'inspiration', 'mindset', 'goals', 'success', 'positivevibes']
  };
  var platTags = {
    instagram: ['instagood', 'photooftheday', 'instadaily', 'love', 'instamood'],
    youtube: ['youtube', 'youtuber', 'subscribe', 'video', 'channel'],
    tiktok: ['fyp', 'foryou', 'foryoupage', 'viral', 'trending'],
    facebook: ['facebook', 'follow', 'like', 'share', 'community']
  };
  root.appendChild(field('Topic', topic));
  root.appendChild(field('Platform', plat));
  root.appendChild(field('How many?', cnt));
  root.appendChild(btnRow(btn('Generate Hashtags', '', function () {
    var t = topic.value.trim();
    if (!t) { out.value = 'Type a topic first — e.g. "homemade biryani".'; return; }
    var words = t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function (w) { return w.length > 1; });
    var tags = [];
    words.forEach(function (w) { tags.push(w); });
    tags.push(words.join(''));
    var lowWords = t.toLowerCase().split(/\s+/);
    Object.keys(niche).forEach(function (k) {
      var hit = lowWords.indexOf(k) >= 0 || (triggers[k] || []).some(function (w) { return lowWords.indexOf(w) >= 0; });
      if (hit) niche[k].forEach(function (g) { tags.push(g); });
    });
    (platTags[plat.value] || []).forEach(function (g) { tags.push(g); });
    tags.push('reels', 'explorepage', 'viralpost');
    var seen = {}, uniq = [];
    tags.forEach(function (g) { g = g.replace(/[^a-z0-9]/g, ''); if (g && !seen[g]) { seen[g] = 1; uniq.push('#' + g); } });
    out.value = uniq.slice(0, +cnt.value).join(' ');
  }), btn('Copy All', 'secondary', function () { copyText(out.value, this); })));
  root.appendChild(out);
});

/* ---------- 3. Caption Generator ---------- */
reg('caption-generator', function (root) {
  var topic = h('input', { type: 'text', placeholder: 'e.g. morning chai, first day at gym' });
  var tone = h('select');
  [['funny', 'Funny'], ['motivational', 'Motivational'], ['professional', 'Professional'], ['casual', 'Casual / Friendly']].forEach(function (o) { tone.appendChild(h('option', { value: o[0] }, o[1])); });
  var plat = h('select');
  [['instagram', 'Instagram / Reels'], ['tiktok', 'TikTok'], ['youtube', 'YouTube Shorts'], ['facebook', 'Facebook']].forEach(function (o) { plat.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('div');
  var caps = {
    funny: ['POV: {t} and suddenly everything makes sense.', 'Nobody: ... Absolutely nobody: ... Me: {t}.', '{t} — because normal is boring.', 'I came. I saw. I did {t}. No regrets.', 'Warning: {t} may cause excessive smiling.'],
    motivational: ['Small steps, big change. Today: {t}.', '{t} is not just a moment — it is a mindset.', 'Your only limit is the one you accept. Start with {t}.', 'Dream it. Plan it. Do {t}.', 'Every expert was once a beginner at {t}.'],
    professional: ['A closer look at {t} — insights, tips and what actually works.', '{t}: what I learned and how you can apply it today.', 'Breaking down {t} into simple, practical steps.', 'Why {t} matters more than you think — a short, honest take.', 'The complete beginner’s guide to {t}.'],
    casual: ['Just a little moment of {t} for your feed.', '{t} kind of day. What about you?', 'Sharing a bit of {t} — hope it makes your day better.', 'Okay but can we talk about {t} for a second?', '{t} — simple, real, and straight from the heart.']
  };
  root.appendChild(field('Topic', topic));
  root.appendChild(field('Tone', tone));
  root.appendChild(field('Platform', plat));
  root.appendChild(btnRow(btn('Generate Captions', '', function () {
    var t = topic.value.trim();
    if (!t) { out.textContent = 'Type a topic first.'; return; }
    out.innerHTML = '';
    caps[tone.value].forEach(function (c) {
      var text = c.split('{t}').join(t);
      var row = h('div', { class: 'result', style: 'margin:8px 0' });
      row.appendChild(h('div', null, text));
      var cp = btn('Copy', 'secondary', function () { copyText(text, cp); });
      cp.style.marginTop = '6px'; row.appendChild(cp);
      out.appendChild(row);
    });
  })));
  root.appendChild(out);
});

/* ---------- 4. YouTube Title Generator ---------- */
reg('youtube-title-generator', function (root) {
  var topic = h('input', { type: 'text', placeholder: 'e.g. how to make biryani, learn English' });
  var style = h('select');
  [['howto', 'How-To'], ['list', 'List / Numbered'], ['question', 'Question'], ['story', 'Story / "I Tried"'], ['ultimate', 'Ultimate Guide']].forEach(function (o) { style.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('div');
  var tpl = {
    howto: ['How to {T} (Step by Step for Beginners)', 'How to {T} in 10 Minutes — Easy Method', 'How to {T} Without Any Experience', 'How to {T}: The Complete 2026 Tutorial', 'Learn How to {T} From Scratch', 'How to {T} — 5 Mistakes to Avoid', 'How to {T} on a Budget', 'How to {T}: Beginner to Pro in One Video'],
    list: ['10 Best Ways to {T}', '7 {T} Tips You Wish You Knew Earlier', '5 {T} Secrets Nobody Tells You', 'Top 10 {T} Ideas for 2026', '3 Simple {T} Tricks That Actually Work', '12 {T} Mistakes Beginners Always Make', '8 {T} Hacks That Save You Hours', '15 {T} Ideas You Can Start Today'],
    question: ['Is {T} Really Worth It?', 'Can You {T} in Just 7 Days?', 'Why Does Nobody Talk About {T}?', 'What Happens If You {T} Every Day for 30 Days?', 'Should You Start {T} in 2026?', 'How Hard Is {T} Really?', 'What Is {T} and Why Is Everyone Talking About It?', 'Does {T} Actually Work? Honest Review'],
    story: ['I Tried {T} for 30 Days — Here Is What Happened', 'My First Time Doing {T} (Honest Experience)', 'I Spent $0 on {T} — The Result Shocked Me', 'From Zero to {T} in 30 Days', 'I Tried {T} So You Don’t Have To', 'My {T} Journey: What I Wish I Knew', 'I Did {T} Every Day for a Month', 'How I Learned {T} Without a Teacher'],
    ultimate: ['The Ultimate Guide to {T} (2026)', 'Everything You Need to Know About {T}', '{T} Explained: The Only Guide You Will Ever Need', 'The Complete {T} Masterclass for Beginners', '{T} in 2026: Full Beginner’s Guide', 'Master {T} — From Basics to Advanced', 'The Definitive Guide to {T}', '{T} A to Z: The Ultimate Tutorial']
  };
  root.appendChild(field('Video topic', topic));
  root.appendChild(field('Title style', style));
  root.appendChild(btnRow(btn('Generate Titles', '', function () {
    var t = topic.value.trim();
    if (!t) { out.textContent = 'Type a video topic first.'; return; }
    out.innerHTML = '';
    tpl[style.value].forEach(function (x) {
      var title = x.split('{T}').join(t);
      var row = h('div', { class: 'result', style: 'margin:8px 0;cursor:pointer', title: 'Click to copy' });
      row.textContent = title;
      row.addEventListener('click', function () { copyText(title, row); });
      out.appendChild(row);
    });
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Click any title to copy it. Keep titles under 60 characters so they do not get cut off in search.'));
  })));
  root.appendChild(out);
});

/* ---------- 5. Bio Generator ---------- */
reg('bio-generator', function (root) {
  var name = h('input', { type: 'text', placeholder: 'Your name' });
  var role = h('input', { type: 'text', placeholder: 'e.g. food blogger, student, shop owner' });
  var kw = h('input', { type: 'text', placeholder: 'Keywords, comma separated — e.g. recipes, travel, tech' });
  var plat = h('select');
  [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['facebook', 'Facebook']].forEach(function (o) { plat.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('div');
  root.appendChild(field('Name', name));
  root.appendChild(field('What do you do?', role));
  root.appendChild(field('Keywords', kw));
  root.appendChild(field('Platform', plat));
  root.appendChild(btnRow(btn('Generate Bios', '', function () {
    var n = name.value.trim() || 'Your Name';
    var r = role.value.trim() || 'creator';
    var k = kw.value.trim();
    var kws = k ? k.split(',').map(function (s) { return s.trim(); }).filter(Boolean).join(' | ') : '';
    var bios = [
      n + ' | ' + r + (kws ? '\n' + kws : '') + '\nNew posts every week. Follow for more.',
      'Hi, I am ' + n + ' — a ' + r + ' sharing ' + (k || 'useful, honest content') + '.\nDM for collaborations.',
      n + '\n' + r + ' • ' + (kws || 'daily content') + '\nTurning ideas into posts, one day at a time.'
    ];
    out.innerHTML = '';
    bios.forEach(function (b, i) {
      var row = h('div', { class: 'result', style: 'margin:8px 0;white-space:pre-line' });
      row.appendChild(h('div', null, b));
      var cp = btn('Copy Bio ' + (i + 1), 'secondary', function () { copyText(b, cp); });
      cp.style.marginTop = '6px'; row.appendChild(cp);
      out.appendChild(row);
    });
  })));
  root.appendChild(out);
});

/* ---------- 6. Tag Extractor ---------- */
reg('tag-extractor', function (root) {
  var ta = h('textarea', { placeholder: 'Paste a video description, article or any text here...' });
  var out = h('textarea', { placeholder: 'Extracted tags will appear here...', readonly: 'readonly' });
  var stop = ('a an the and or of to in on for with is are was were be been it its this that these those you your we our they their he she his her at by from as not no do does did can could will would should i me my we us our have has had if but so than then when where which who whom what how all any each few more most other some such only own same too very just also because until while about into through after over between out against during without before under around among'.split(' '));
  root.appendChild(ta);
  root.appendChild(btnRow(btn('Extract Tags', '', function () {
    var words = (ta.value.toLowerCase().match(/[a-z0-9][a-z0-9\-]{1,}/g) || []);
    var counts = {};
    words.forEach(function (w) { if (stop.indexOf(w) < 0) counts[w] = (counts[w] || 0) + 1; });
    var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 15);
    out.value = sorted.length ? sorted.map(function (w) { return '#' + w; }).join(' ') : 'No useful keywords found — paste longer text.';
  }), btn('Copy Tags', 'secondary', function () { copyText(out.value, this); })));
  root.appendChild(out);
});

/* ---------- 7. Video SEO Checker ---------- */
reg('video-seo-checker', function (root) {
  var title = h('input', { type: 'text', placeholder: 'Video title' });
  var desc = h('textarea', { placeholder: 'Video description...' });
  var tags = h('input', { type: 'text', placeholder: 'Tags, comma separated' });
  var out = h('div');
  function check(label, pass, hint) { return { label: label, pass: !!pass, hint: hint }; }
  root.appendChild(field('Title', title));
  root.appendChild(field('Description', desc));
  root.appendChild(field('Tags (comma separated)', tags));
  root.appendChild(btnRow(btn('Check SEO', '', function () {
    var t = title.value.trim(), d = desc.value.trim();
    var tagList = tags.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var firstWords = t.toLowerCase().split(/\s+/).slice(0, 3);
    var kwInDesc = firstWords.some(function (w) { return w.length > 3 && d.toLowerCase().indexOf(w) >= 0; });
    var checks = [
      check('Title is 30–60 characters (shows fully in search)', t.length >= 30 && t.length <= 60, t.length + ' characters now'),
      check('Title contains a number or list', /\d/.test(t), 'Numbers in titles get more clicks'),
      check('Description is at least 120 characters', d.length >= 120, d.length + ' characters now'),
      check('Main keyword appears early in the description', kwInDesc, 'Repeat your title’s main word in the first 1–2 lines'),
      check('At least 5 tags', tagList.length >= 5, tagList.length + ' tags now'),
      check('No more than 15 tags (too many looks like spam)', tagList.length <= 15, tagList.length + ' tags now'),
      check('No ALL-CAPS title (looks like clickbait spam)', t !== t.toUpperCase() || t.length === 0, 'Use normal capitalization')
    ];
    var score = Math.round(checks.filter(function (c) { return c.pass; }).length / checks.length * 100);
    out.innerHTML = '';
    var big = resultBox(true);
    big.textContent = 'SEO Score: ' + score + '/100 — ' + (score >= 85 ? 'Excellent' : score >= 60 ? 'Good, a few fixes left' : score >= 40 ? 'Needs work' : 'Needs a lot of work');
    out.appendChild(big);
    checks.forEach(function (c) {
      var row = h('div', { style: 'margin:6px 0' });
      row.appendChild(h('strong', null, (c.pass ? '✓ ' : '✗ ') + c.label));
      row.appendChild(h('div', { style: 'font-size:13px;color:#64748b' }, c.hint));
      out.appendChild(row);
    });
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'This is a checklist based on widely used YouTube best practices — it cannot see your thumbnail or know your audience. A good thumbnail and a strong first 30 seconds matter just as much.'));
  })));
  root.appendChild(out);
});

/* ---------- 8. Best Posting Time Guide ---------- */
reg('best-posting-time', function (root) {
  var plat = h('select');
  [['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['x', 'X (Twitter)']].forEach(function (o) { plat.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('div');
  var data = {
    instagram: [['Monday – Friday', '11:00 AM – 1:00 PM, 7:00 – 9:00 PM'], ['Saturday – Sunday', '10:00 AM – 12:00 PM'], ['Best days', 'Wednesday and Friday'], ['Avoid', 'Late night (12 – 5 AM)']],
    youtube: [['Tuesday – Thursday', '12:00 – 3:00 PM, 6:00 – 9:00 PM'], ['Saturday – Sunday', '9:00 – 11:00 AM'], ['Best days', 'Thursday and Friday'], ['Avoid', 'Very early morning']],
    tiktok: [['Tuesday & Thursday', '6:00 – 9:00 PM'], ['Saturday', '11:00 AM – 1:00 PM'], ['Best days', 'Tuesday and Thursday evenings'], ['Avoid', 'Early weekday mornings']],
    facebook: [['Wednesday – Friday', '11:00 AM – 1:00 PM'], ['Saturday', '12:00 – 2:00 PM'], ['Best days', 'Wednesday and Thursday'], ['Avoid', 'Sundays']],
    x: [['Monday – Friday', '9:00 – 11:00 AM'], ['Wednesday', '9:00 AM (often the peak)'], ['Best days', 'Wednesday and Friday'], ['Avoid', 'Late nights and Sundays']]
  };
  root.appendChild(field('Platform', plat));
  root.appendChild(btnRow(btn('Show Best Times', '', function () {
    out.innerHTML = '';
    var table = h('table', { class: 'gs-table', style: 'width:100%;border-collapse:collapse' });
    data[plat.value].forEach(function (row) {
      var tr = h('tr');
      tr.appendChild(h('td', { style: 'border:1px solid #e2e8f0;padding:8px;font-weight:700' }, row[0]));
      tr.appendChild(h('td', { style: 'border:1px solid #e2e8f0;padding:8px' }, row[1]));
      table.appendChild(tr);
    });
    out.appendChild(table);
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'These are general windows from widely published creator guidance — your own audience is different. Check your own analytics (Instagram Insights, YouTube Analytics) for when YOUR followers are online, and test different times for 2–3 weeks. Times are in your local time.'));
  })));
  root.appendChild(out);
});

/* ---------- 9. Fancy Text / Fonts Generator ---------- */
reg('fancy-text-generator', function (root) {
  var inp = h('input', { type: 'text', placeholder: 'Type your text — e.g. Malik Anwaar' });
  var out = h('div');
  function mapText(t, fn) { return t.split('').map(fn).join(''); }
  function offset(ch, baseA, basea, base0) {
    var c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCodePoint(baseA + c - 65);
    if (c >= 97 && c <= 122) return String.fromCodePoint(basea + c - 97);
    if (c >= 48 && c <= 57) return String.fromCodePoint(base0 + c - 48);
    return ch;
  }
  var smallCaps = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
  var styles = [
    ['Bold', function (ch) { return offset(ch, 0x1D400, 0x1D41A, 0x1D7CE); }],
    ['Italic', function (ch) { return offset(ch, 0x1D434, 0x1D44E, 0x1D7CE); }],
    ['Bold Italic', function (ch) { return offset(ch, 0x1D468, 0x1D482, 0x1D7CE); }],
    ['Script', function (ch) { return offset(ch, 0x1D49C, 0x1D4B6, 0x1D7CE); }],
    ['Monospace', function (ch) { return offset(ch, 0x1D670, 0x1D68A, 0x1D7F6); }],
    ['Circled', function (ch) { var c = ch.charCodeAt(0); if (c >= 65 && c <= 90) return String.fromCodePoint(0x24B6 + c - 65); if (c >= 97 && c <= 122) return String.fromCodePoint(0x24D0 + c - 97); if (c >= 48 && c <= 57) return String.fromCodePoint(c === 48 ? 0x24EA : 0x2460 + c - 49); return ch; }],
    ['Small Caps', function (ch) { var l = ch.toLowerCase(); return smallCaps[l] || ch; }]
  ];
  root.appendChild(field('Your text', inp));
  root.appendChild(btnRow(btn('Generate Styles', '', function () {
    var t = inp.value;
    if (!t.trim()) { out.textContent = 'Type some text first.'; return; }
    out.innerHTML = '';
    styles.forEach(function (s) {
      var styled = mapText(t, s[1]);
      var row = h('div', { class: 'result', style: 'margin:8px 0' });
      row.appendChild(h('div', { style: 'font-size:18px' }, styled));
      row.appendChild(h('div', { style: 'font-size:13px;color:#64748b' }, s[0]));
      var cp = btn('Copy', 'secondary', function () { copyText(styled, cp); });
      cp.style.marginTop = '6px'; row.appendChild(cp);
      out.appendChild(row);
    });
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'These use Unicode styled letters, so they work in Instagram bios, TikTok names and YouTube titles. Some very old phones may show boxes for a few styles.'));
  })));
  root.appendChild(out);
});

/* ---------- 10. Script Timer + Urdu Voice-Over Counter ---------- */
reg('script-timer', function (root) {
  var ta = h('textarea', { placeholder: 'Paste your video script here — in English or Urdu...' });
  var out = h('div');
  function upd() {
    var t = ta.value;
    var words = (t.trim().match(/\S+/g) || []).length;
    var chars = t.length;
    function mins(wpm) { var m = words / wpm; var mm = Math.floor(m), ss = Math.round((m - mm) * 60); return mm + ' min ' + (ss < 10 ? '0' : '') + ss + ' sec'; }
    out.innerHTML = '';
    var box = resultBox(true);
    box.innerHTML = '';
    box.appendChild(h('div', null, words + ' words • ' + chars + ' characters'));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, 'Speaking time — slow (120 wpm): ' + mins(120)));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400' }, 'Speaking time — normal (150 wpm): ' + mins(150)));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400' }, 'Speaking time — fast (180 wpm): ' + mins(180)));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, 'Urdu voice-over is usually slower — plan on about 120 words per minute (' + mins(120) + ' for this script).'));
    out.appendChild(box);
  }
  ta.addEventListener('input', upd);
  root.appendChild(ta); root.appendChild(out); upd();
});

/* ---------- 11. AdSense / RPM Earnings Estimator ---------- */
reg('adsense-estimator', function (root) {
  var views = numInput(10000, 0), rpm = numInput(1.5, 0, 100, 0.1);
  var out = h('div');
  root.appendChild(field('Monthly page views', views));
  root.appendChild(field('RPM — earnings per 1000 views ($)', rpm));
  root.appendChild(btnRow(btn('Estimate Earnings', '', function () {
    var v = +views.value || 0, r = +rpm.value || 0;
    var monthly = v / 1000 * r;
    out.innerHTML = '';
    var box = resultBox(true);
    box.appendChild(h('div', null, 'Estimated: $' + monthly.toFixed(2) + ' / month'));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, 'Yearly (same traffic): $' + (monthly * 12).toFixed(2)));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400' }, 'Daily: $' + (monthly / 30).toFixed(2)));
    if (r > 0) box.appendChild(h('div', { style: 'font-size:14px;font-weight:400' }, 'Views needed for $100/month at this RPM: ' + Math.ceil(100 / r * 1000).toLocaleString('en-US')));
    out.appendChild(box);
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'This is a rough estimate. Real RPM depends on country, topic, ad placement and season — finance and tech traffic usually pays more than entertainment. Your AdSense dashboard shows your real RPM.'));
  })));
  root.appendChild(out);
});

/* ---------- 12. Engagement Rate Calculator ---------- */
reg('engagement-calculator', function (root) {
  var fol = numInput(1000, 0), likes = numInput(100, 0), com = numInput(10, 0), shr = numInput(5, 0), sav = numInput(5, 0);
  var out = h('div');
  root.appendChild(field('Followers', fol));
  root.appendChild(field('Likes (per post)', likes));
  root.appendChild(field('Comments (per post)', com));
  root.appendChild(field('Shares (per post)', shr));
  root.appendChild(field('Saves (per post)', sav));
  root.appendChild(btnRow(btn('Calculate Engagement', '', function () {
    var f = +fol.value || 0;
    var total = (+likes.value || 0) + (+com.value || 0) + (+shr.value || 0) + (+sav.value || 0);
    if (!f) { out.textContent = 'Enter your follower count first.'; return; }
    var rate = total / f * 100;
    var verdict = rate < 1 ? 'Low — try more interactive posts (questions, polls)' : rate < 3 ? 'Average — healthy for most accounts' : rate < 6 ? 'Good — above average' : 'Excellent — very strong engagement';
    out.innerHTML = '';
    var box = resultBox(true);
    box.appendChild(h('div', null, 'Engagement rate: ' + rate.toFixed(2) + '%'));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, verdict));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400' }, total.toLocaleString('en-US') + ' total interactions per post'));
    out.appendChild(box);
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Rate = (likes + comments + shares + saves) ÷ followers × 100. Small accounts often have higher rates; compare with accounts your own size, not with celebrities.'));
  })));
  root.appendChild(out);
});

/* ---------- 13. Meme Maker ---------- */
reg('meme-maker', function (root) {
  var top = h('input', { type: 'text', placeholder: 'TOP TEXT' });
  var bot = h('input', { type: 'text', placeholder: 'BOTTOM TEXT' });
  var size = numInput(48, 16, 120, 1);
  root.appendChild(h('p', null, 'Upload a photo, add top and bottom text, and download your meme. Everything stays in your browser.'));
  imgWorkArea(root, 'image/*', function (st, cv) {
    drawMeme(st, cv);
  }, function (st, cv, controls) {
    controls.appendChild(field('Top text', top));
    controls.appendChild(field('Bottom text', bot));
    controls.appendChild(field('Text size', size));
    [top, bot, size].forEach(function (el) { el.addEventListener('input', function () { drawMeme(st, cv); }); });
    controls.appendChild(btnRow(btn('Download Meme PNG', '', function () {
      drawMeme(st, cv);
      canvasDownload(cv, (st.name || 'meme') + '-meme.png');
    })));
  });
  function drawMeme(st, cv) {
    if (!st.img) return;
    var ctx = cv.getContext('2d');
    cv.width = st.img.width; cv.height = st.img.height;
    ctx.drawImage(st.img, 0, 0);
    var fs = +size.value || 48;
    ctx.font = 'bold ' + fs + 'px Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.lineWidth = Math.max(3, fs / 10);
    ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
    var t = top.value.trim().toUpperCase(), b = bot.value.trim().toUpperCase();
    if (t) { ctx.strokeText(t, cv.width / 2, fs + 10); ctx.fillText(t, cv.width / 2, fs + 10); }
    if (b) { ctx.strokeText(b, cv.width / 2, cv.height - 12); ctx.fillText(b, cv.width / 2, cv.height - 12); }
  }
});

/* ---------- 14. Copyright-Free Resources ---------- */
reg('copyright-free-resources', function (root) {
  var groups = [
    ['Free Music (no copyright)', [['YouTube Audio Library', 'https://studio.youtube.com/channel/UC/music', 'Free music and sound effects for YouTube videos — no copyright strikes.'], ['Free Music Archive', 'https://freemusicarchive.org/', 'Free music under Creative Commons licences — check each track’s licence.'], ['Pixabay Music', 'https://pixabay.com/music/', 'Royalty-free music, no attribution needed for most tracks.'], ['Bensound', 'https://www.bensound.com/', 'Free music with attribution; paid licence removes the credit line.']]],
    ['Free Images', [['Unsplash', 'https://unsplash.com/', 'Free high-quality photos — free for commercial use, no attribution required.'], ['Pexels', 'https://www.pexels.com/', 'Free photos and videos, free for commercial use.'], ['Pixabay', 'https://pixabay.com/', 'Free images, videos and music under the Pixabay licence.'], ['Openverse', 'https://wordpress.org/openverse/', 'Search engine for openly licensed images and audio.']]],
    ['Free Videos', [['Pexels Videos', 'https://www.pexels.com/videos/', 'Free stock video clips for creators.'], ['Pixabay Videos', 'https://pixabay.com/videos/', 'Free video clips, no attribution needed.'], ['Coverr', 'https://coverr.co/', 'Free video clips for websites and social posts.']]],
    ['Free Fonts', [['Google Fonts', 'https://fonts.google.com/', 'Free open-source fonts for videos, thumbnails and websites.']]]
  ];
  root.appendChild(h('p', null, 'Every link below is a well-known free library. Always read the licence on the site itself before using something in a paid project — "free" usually means free for commercial use, sometimes with attribution.'));
  groups.forEach(function (g) {
    root.appendChild(h('h3', null, g[0]));
    var ul = h('ul');
    g[1].forEach(function (r) {
      var li = h('li');
      var a = h('a', { href: r[1], target: '_blank', rel: 'noopener' }, r[0]);
      li.appendChild(a); li.appendChild(document.createTextNode(' — ' + r[2]));
      ul.appendChild(li);
    });
    root.appendChild(ul);
  });
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Tip: never download "free" music or images from random re-upload channels — use the official libraries above so your videos do not get copyright claims.'));
});

/* ---------- 15. Fake Follower / Comment Spam Checker ---------- */
reg('fake-follower-checker', function (root) {
  var ta = h('textarea', { placeholder: 'Paste comments here — one comment per line...' });
  var out = h('div');
  var spamWords = ['follow me', 'follow back', 'f4f', 'check my profile', 'dm me', 'earn money', 'make money', 'crypto', 'double your', 'free followers', 'buy followers', 'check my page', 'promote it on', 'send me', 'whatsapp me'];
  var generic = ['nice pic', 'nice', 'great', 'awesome', 'beautiful', 'amazing', 'wow', 'love it', 'cool', 'good', 'nice post', 'superb', 'fantastic', 'excellent'];
  root.appendChild(ta);
  root.appendChild(btnRow(btn('Check Comments', '', function () {
    var lines = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) { out.textContent = 'Paste some comments first.'; return; }
    var seen = {}, dups = 0, links = 0, spammy = 0, flagged = [];
    lines.forEach(function (line) {
      var low = line.toLowerCase();
      var reasons = [];
      if (seen[low]) { dups++; reasons.push('repeated comment'); } else seen[low] = 1;
      if (/https?:\/\/|www\./.test(low)) { links++; reasons.push('contains a link'); }
      if (spamWords.some(function (w) { return low.indexOf(w) >= 0; })) { spammy++; reasons.push('spam phrase'); }
      else if (generic.indexOf(low) >= 0 || (low.length < 12 && /^[a-z! ]+$/.test(low))) { reasons.push('very generic'); }
      if ((line.match(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u) || []).length >= 4) reasons.push('emoji spam');
      if (reasons.length) flagged.push(line + '  →  ' + reasons.join(', '));
    });
    var score = Math.round((dups + links + spammy) / lines.length * 100);
    var verdict = score < 10 ? 'Looks mostly genuine' : score < 30 ? 'Mixed — some suspicious comments' : 'Likely spam-heavy — review these accounts';
    out.innerHTML = '';
    var box = resultBox(true);
    box.appendChild(h('div', null, verdict + ' — spam signals in ' + score + '% of comments'));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, lines.length + ' comments checked • ' + dups + ' repeated • ' + links + ' with links • ' + spammy + ' with spam phrases'));
    out.appendChild(box);
    if (flagged.length) {
      out.appendChild(h('h3', null, 'Flagged comments'));
      var ul = h('ul');
      flagged.slice(0, 20).forEach(function (f) { ul.appendChild(h('li', null, f)); });
      out.appendChild(ul);
    }
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'This is a heuristic check of the words in the comments — it cannot prove an account is fake. Real fans also write short comments. Use it as a first filter, then look at the accounts themselves (no posts, no profile photo, following thousands).'));
  })));
  root.appendChild(out);
});

/* ---------- 16. Check Link Before Clicking ---------- */
reg('link-safety-checker', function (root) {
  var inp = h('input', { type: 'url', placeholder: 'Paste the link here — e.g. https://example.com/page' });
  var out = h('div');
  var shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorte.st', 'adf.ly'];
  var badTld = ['.xyz', '.top', '.buzz', '.click', '.link', '.zip', '.mov', '.quest', '.sbs'];
  root.appendChild(field('Link to check', inp));
  root.appendChild(btnRow(btn('Check This Link', '', function () {
    var raw = inp.value.trim();
    if (!raw) { out.textContent = 'Paste a link first.'; return; }
    var url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    var u;
    try { u = new URL(url); } catch (e) { out.textContent = 'That does not look like a valid link. Check for typos.'; return; }
    var host = u.hostname.toLowerCase();
    var issues = [], ok = [];
    if (u.protocol === 'https:') ok.push('Uses HTTPS (encrypted connection).');
    else issues.push('Not HTTPS — the connection is not encrypted.');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) issues.push('The link points to a raw IP address instead of a domain name — suspicious.');
    if (host.indexOf('xn--') >= 0) issues.push('Contains punycode (xn--) — a common trick to fake familiar domain names.');
    if (shorteners.indexOf(host) >= 0) issues.push('URL shortener — the real destination is hidden. Expand it before trusting it.');
    if (host.split('.').length > 3) issues.push('Unusually many subdomains — often used to imitate a real site (e.g. login.example.com.attacker.com).');
    if (badTld.some(function (t) { return host.endsWith(t); })) issues.push('Unusual domain ending — extra caution needed.');
    if (u.username || u.password || url.indexOf('@') >= 0) issues.push('Contains "@" in the link — the part before @ is ignored, so the real site may differ.');
    if (url.length > 120) issues.push('Very long link — often used to hide the real destination.');
    if (!issues.length) ok.push('No common warning signs found in the link text itself.');
    out.innerHTML = '';
    var box = resultBox(true);
    box.appendChild(h('div', null, 'Real destination domain: ' + host));
    box.appendChild(h('div', { style: 'font-size:14px;font-weight:400;margin-top:6px' }, issues.length ? 'Caution — ' + issues.length + ' warning sign(s) found.' : 'Looks OK on a quick check.'));
    out.appendChild(box);
    ok.forEach(function (s) { out.appendChild(h('div', null, '✓ ' + s)); });
    issues.forEach(function (s) { out.appendChild(h('div', null, '✗ ' + s)); });
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Decoded link: ' + decodeURIComponent(url)));
    out.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'This is a first-pass heuristic check of the link text only — it cannot guarantee a site is safe. A clean result does not mean the site is trustworthy. Never enter passwords or payment details from a link you received unexpectedly. For a deeper check, use the Phishing URL Checker.'));
  })));
  root.appendChild(out);
});

/* ---------- 17. Video Compressor ---------- */
reg('video-compressor', function (root) {
  var file = null, info = h('div'), out = h('div'), prog = h('div');
  var preset = h('select');
  [['720p — 2.5 Mbps', 2500000], ['480p — 1 Mbps', 1000000], ['360p — 0.6 Mbps', 600000]].forEach(function (o) { preset.appendChild(h('option', { value: o[1] }, o[0])); });
  root.appendChild(dropZone('Select a video file (MP4, WebM, MOV...)', 'video/*', false, function (fs) {
    file = fs[0];
    info.textContent = file ? file.name + ' (' + fmtBytes(file.size) + ')' : '';
  }));
  root.appendChild(info);
  root.appendChild(field('Target quality', preset));
  root.appendChild(btnRow(btn('Compress Video', '', function () {
    if (!file) { out.textContent = 'Select a video first.'; return; }
    if (!window.MediaRecorder) { out.textContent = 'Sorry — your browser does not support video recording (MediaRecorder). Try Chrome or Firefox.'; return; }
    out.textContent = 'Compressing... please keep this tab open. The video will play once while it records.';
    prog.textContent = '';
    var url = URL.createObjectURL(file);
    var vid = document.createElement('video');
    vid.muted = true; vid.playsInline = true; vid.preload = 'auto';
    vid.src = url;
    vid.onloadedmetadata = function () {
      var stream = vid.captureStream ? vid.captureStream() : vid.mozCaptureStream();
      var rec;
      try { rec = new MediaRecorder(stream, { mimeType: 'video/webm', videoBitsPerSecond: +preset.value }); }
      catch (e) { try { rec = new MediaRecorder(stream, { videoBitsPerSecond: +preset.value }); } catch (e2) { out.textContent = 'Your browser could not start the recorder: ' + e2.message; return; } }
      var chunks = [];
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var blob = new Blob(chunks, { type: 'video/webm' });
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, '') + '-compressed.webm');
        out.textContent = 'Done! Original ' + fmtBytes(file.size) + ' → compressed ' + fmtBytes(blob.size) + ' (' + Math.max(0, Math.round((1 - blob.size / file.size) * 100)) + '% smaller). Saved as WebM.';
        URL.revokeObjectURL(url);
      };
      vid.ontimeupdate = function () { if (vid.duration) prog.textContent = 'Recording: ' + Math.round(vid.currentTime) + 's / ' + Math.round(vid.duration) + 's'; };
      vid.onended = function () { try { rec.stop(); } catch (e) {} };
      rec.start();
      vid.play().catch(function (e) { out.textContent = 'Could not play the video: ' + e.message; });
    };
    vid.onerror = function () { out.textContent = 'Could not read this video file. Try an MP4 or WebM file.'; };
  })));
  root.appendChild(prog); root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'The video is re-encoded in your browser and downloaded as a WebM file (smaller, same video). Quality depends on the target you pick — 720p keeps most detail, 360p is smallest. Very long videos take a while; the tab must stay open.'));
});

/* ---------- 18. Image to Text (OCR) ---------- */
reg('image-to-text', function (root) {
  var file = null;
  var lang = h('select');
  [['eng', 'English'], ['urd', 'Urdu'], ['eng+urd', 'English + Urdu']].forEach(function (o) { lang.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('textarea', { placeholder: 'Extracted text will appear here...', readonly: 'readonly' });
  var status = h('div');
  root.appendChild(dropZone('Select an image with text (photo, screenshot, scan)', 'image/*', false, function (fs) { file = fs[0]; status.textContent = file ? file.name + ' selected.' : ''; }));
  root.appendChild(status);
  root.appendChild(field('Text language', lang));
  root.appendChild(btnRow(btn('Extract Text', '', function () {
    if (!file) { status.textContent = 'Select an image first.'; return; }
    status.textContent = 'Loading OCR engine (first use downloads about 10 MB)...';
    out.value = '';
    needTesseract().then(function () {
      return window.Tesseract.recognize(file, lang.value, { logger: function (m) { if (m.status) status.textContent = m.status + (m.progress != null ? ' — ' + Math.round(m.progress * 100) + '%' : ''); } });
    }).then(function (res) {
      out.value = (res.data && res.data.text ? res.data.text.trim() : '');
      status.textContent = out.value ? 'Done — text extracted. Check it before copying; OCR can misread blurry or handwritten text.' : 'No text found in this image. Try a clearer photo with good lighting.';
    }).catch(function (e) { status.textContent = 'Error: ' + e.message; });
  }), btn('Copy Text', 'secondary', function () { copyText(out.value, this); })));
  root.appendChild(out);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'OCR runs fully in your browser with the Tesseract engine (downloaded once from a CDN). Your image never leaves your device. Clear, well-lit text works best.'));
});

/* ---------- 19. Speech to Text ---------- */
reg('speech-to-text', function (root) {
  var lang = h('select');
  [['en-US', 'English (US)'], ['ur-PK', 'Urdu (Pakistan)'], ['en-GB', 'English (UK)'], ['hi-IN', 'Hindi'], ['ar-SA', 'Arabic']].forEach(function (o) { lang.appendChild(h('option', { value: o[0] }, o[1])); });
  var out = h('textarea', { placeholder: 'Your speech will appear here as text...', readonly: 'readonly' });
  var status = h('div');
  var rec = null, finalText = '';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  root.appendChild(field('Language', lang));
  if (!SR) {
    status.textContent = 'Sorry — live speech recognition is not supported in this browser. It works in Chrome (desktop and Android). Your typed text is not sent anywhere.';
  } else {
    root.appendChild(btnRow(
      btn('Start Listening', '', function () {
        if (rec) return;
        rec = new SR();
        rec.lang = lang.value; rec.interimResults = true; rec.continuous = true;
        rec.onresult = function (e) {
          var interim = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
            else interim += e.results[i][0].transcript;
          }
          out.value = finalText + interim;
        };
        rec.onerror = function (e) { status.textContent = 'Microphone error: ' + (e.error || 'unknown') + '. Allow microphone access and try again.'; rec = null; };
        rec.onend = function () { rec = null; status.textContent = 'Stopped listening.'; };
        try { rec.start(); status.textContent = 'Listening... speak now. Click Stop when done.'; } catch (e) { status.textContent = 'Could not start: ' + e.message; rec = null; }
      }),
      btn('Stop', 'secondary', function () { if (rec) { try { rec.stop(); } catch (e) {} } })
    ));
  }
  root.appendChild(status);
  root.appendChild(out);
  root.appendChild(btnRow(btn('Copy Text', 'secondary', function () { copyText(out.value, this); }), btn('Clear', 'secondary', function () { out.value = ''; finalText = ''; })));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Uses your browser’s built-in speech recognition. In Chrome, audio is sent to Google’s speech service for recognition (microphone permission required). Speak clearly in a quiet room for best results.'));
});

/* ---------- 20. Text to Speech (Urdu) ---------- */
reg('text-to-speech', function (root) {
  var ta = h('textarea', { placeholder: 'Type or paste text here — in Urdu or English...' });
  var voiceSel = h('select');
  var rate = numInput(1, 0.5, 2, 0.1), pitch = numInput(1, 0.5, 2, 0.1);
  var status = h('div');
  function loadVoices() {
    var vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    voiceSel.innerHTML = '';
    if (!vs.length) { voiceSel.appendChild(h('option', { value: '' }, 'Default voice')); return; }
    vs.forEach(function (v, i) { voiceSel.appendChild(h('option', { value: String(i) }, v.name + ' (' + v.lang + ')')); });
    var ur = vs.findIndex(function (v) { return (v.lang || '').toLowerCase().indexOf('ur') === 0; });
    if (ur >= 0) voiceSel.value = String(ur);
  }
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Sorry — text to speech is not supported in this browser. Try Chrome, Edge or Firefox.';
  } else {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  root.appendChild(ta);
  root.appendChild(field('Voice (Urdu voices appear first if installed)', voiceSel));
  root.appendChild(field('Speed', rate));
  root.appendChild(field('Pitch', pitch));
  root.appendChild(btnRow(
    btn('Speak', '', function () {
      if (!('speechSynthesis' in window)) return;
      var t = ta.value.trim();
      if (!t) { status.textContent = 'Type some text first.'; return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t);
      var vs = window.speechSynthesis.getVoices();
      var v = vs[+voiceSel.value];
      if (v) u.voice = v;
      u.rate = +rate.value || 1; u.pitch = +pitch.value || 1;
      u.onend = function () { status.textContent = 'Finished.'; };
      u.onerror = function (e) { status.textContent = 'Speech error: ' + (e.error || 'unknown'); };
      window.speechSynthesis.speak(u);
      status.textContent = 'Speaking...';
    }),
    btn('Stop', 'secondary', function () { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); status.textContent = ''; })
  ));
  root.appendChild(status);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Speech is generated by your device’s own voices — nothing is uploaded. An Urdu voice appears in the list only if your phone or computer has one installed (most Android phones do; on Windows, install an Urdu voice from Settings).'));
});

/* ---------- 21. Audio Trimmer ---------- */
reg('audio-trimmer', function (root) {
  var file = null, buf = null, actx = null;
  var startI = numInput(0, 0), endI = numInput(0, 0);
  var status = h('div'), wave = h('canvas', { style: 'width:100%;height:80px;border:1px solid #e2e8f0;border-radius:8px' });
  function wavEncode(b) {
    var ch = b.numberOfChannels, sr = b.sampleRate, len = b.length * ch * 2 + 44;
    var ab = new ArrayBuffer(len), v = new DataView(ab), i, c;
    function wstr(o, s) { for (var k = 0; k < s.length; k++) v.setUint8(o + k, s.charCodeAt(k)); }
    wstr(0, 'RIFF'); v.setUint32(4, len - 8, true); wstr(8, 'WAVE'); wstr(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    wstr(36, 'data'); v.setUint32(40, len - 44, true);
    var off = 44;
    for (i = 0; i < b.length; i++) for (c = 0; c < ch; c++) { var s = Math.max(-1, Math.min(1, b.getChannelData(c)[i])); v.setInt16(off, s < 0 ? s * 32768 : s * 32767, true); off += 2; }
    return new Blob([ab], { type: 'audio/wav' });
  }
  function drawWave() {
    if (!buf) return;
    var ctx = wave.getContext('2d');
    wave.width = wave.clientWidth || 600; wave.height = 80;
    var data = buf.getChannelData(0), step = Math.floor(data.length / wave.width);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, wave.width, wave.height);
    ctx.fillStyle = '#2563eb';
    for (var x = 0; x < wave.width; x++) {
      var max = 0;
      for (var i = 0; i < step; i += 10) { var a = Math.abs(data[x * step + i] || 0); if (a > max) max = a; }
      var hh = Math.max(2, max * 78);
      ctx.fillRect(x, (80 - hh) / 2, 1, hh);
    }
  }
  root.appendChild(dropZone('Select an audio file (MP3, WAV, M4A, OGG...)', 'audio/*', false, function (fs) {
    file = fs[0]; if (!file) return;
    status.textContent = 'Reading ' + file.name + '...';
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    readAs('readAsArrayBuffer', file).then(function (ab) { return actx.decodeAudioData(ab); }).then(function (b) {
      buf = b;
      startI.max = b.duration; endI.max = b.duration; endI.value = Math.round(b.duration * 10) / 10;
      status.textContent = file.name + ' — ' + Math.round(b.duration * 10) / 10 + ' seconds, ' + b.numberOfChannels + ' channel(s).';
      drawWave();
    }).catch(function () { status.textContent = 'Could not read this audio file. Try an MP3 or WAV file.'; });
  }));
  root.appendChild(status);
  root.appendChild(wave);
  root.appendChild(field('Start (seconds)', startI));
  root.appendChild(field('End (seconds)', endI));
  root.appendChild(btnRow(btn('Trim & Download WAV', '', function () {
    if (!buf) { status.textContent = 'Select an audio file first.'; return; }
    var s = Math.max(0, +startI.value || 0), e = Math.min(buf.duration, +endI.value || buf.duration);
    if (e <= s) { status.textContent = 'End time must be after start time.'; return; }
    var sr = buf.sampleRate, frames = Math.floor((e - s) * sr);
    var out = actx.createBuffer(buf.numberOfChannels, frames, sr);
    for (var c = 0; c < buf.numberOfChannels; c++) out.getChannelData(c).set(buf.getChannelData(c).subarray(Math.floor(s * sr), Math.floor(s * sr) + frames));
    downloadBlob(wavEncode(out), (file ? file.name.replace(/\.[^.]+$/, '') : 'audio') + '-trimmed.wav');
    status.textContent = 'Done! Trimmed ' + Math.round((e - s) * 10) / 10 + ' seconds, downloaded as WAV.';
  })));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Audio is decoded and trimmed entirely in your browser. The download is a WAV file (uncompressed, works everywhere).'));
});

/* ---------- 22. Video to MP3 ---------- */
reg('video-to-mp3', function (root) {
  var file = null, status = h('div'), prog = h('div');
  root.appendChild(dropZone('Select a video file (MP4, WebM, MOV...)', 'video/*', false, function (fs) { file = fs[0]; status.textContent = file ? file.name + ' (' + fmtBytes(file.size) + ')' : ''; }));
  root.appendChild(status); root.appendChild(prog);
  root.appendChild(btnRow(btn('Convert to MP3', '', function () {
    if (!file) { status.textContent = 'Select a video first.'; return; }
    status.textContent = 'Loading audio engine (first use downloads about 30 MB — please wait)...';
    prog.textContent = '';
    needFFmpeg().then(function () {
      var ffmpeg = window.FFmpeg.createFFmpeg({ log: false, corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js' });
      ffmpeg.setProgress(function (p) { if (p && p.ratio != null) prog.textContent = 'Converting: ' + Math.round(p.ratio * 100) + '%'; });
      return ffmpeg.load().then(function () {
        status.textContent = 'Extracting audio...';
        return readAs('readAsArrayBuffer', file).then(function (buf) {
          ffmpeg.FS('writeFile', 'in.dat', new Uint8Array(buf));
          return ffmpeg.run('-i', 'in.dat', '-vn', '-c:a', 'libmp3lame', '-q:a', '2', 'out.mp3');
        }).then(function () {
          var data = ffmpeg.FS('readFile', 'out.mp3');
          downloadBlob(new Blob([data.buffer], { type: 'audio/mpeg' }), file.name.replace(/\.[^.]+$/, '') + '.mp3');
          status.textContent = 'Done! MP3 downloaded.';
          try { ffmpeg.FS('unlink', 'in.dat'); ffmpeg.FS('unlink', 'out.mp3'); } catch (e) {}
        });
      });
    }).catch(function (e) { status.textContent = 'Error: ' + e.message + ' (Conversion needs internet once to load the engine, and works best in Chrome/Firefox.)'; });
  })));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'The video is converted in your browser with the FFmpeg engine — your file never leaves your device. First use downloads the engine (about 30 MB); later conversions are faster.'));
});

/* ---------- 23. PDF to Word ---------- */
reg('pdf-to-word', function (root) {
  var file = null, status = h('div');
  root.appendChild(dropZone('Select a PDF file', '.pdf', false, function (fs) { file = fs[0]; status.textContent = file ? file.name + ' selected.' : ''; }));
  root.appendChild(status);
  root.appendChild(btnRow(btn('Convert to Word (.docx)', '', function () {
    if (!file) { status.textContent = 'Select a PDF first.'; return; }
    status.textContent = 'Reading PDF...';
    needPdfJs().then(function () { return readAs('readAsArrayBuffer', file); }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var chain = Promise.resolve([]), n = pdf.numPages;
      for (var p = 1; p <= n; p++) {
        (function (pageNo) {
          chain = chain.then(function (pages) {
            return pdf.getPage(pageNo).then(function (page) { return page.getTextContent(); }).then(function (tc) {
              var lines = {};
              tc.items.forEach(function (it) {
                var y = Math.round(it.transform[5]);
                (lines[y] = lines[y] || []).push(it.str);
              });
              var text = Object.keys(lines).sort(function (a, b) { return b - a; }).map(function (y) { return lines[y].join(' '); }).join('\n');
              pages.push(text);
              status.textContent = 'Reading page ' + pageNo + ' of ' + n + '...';
              return pages;
            });
          });
        })(p);
      }
      return chain;
    }).then(function (pages) {
      status.textContent = 'Building Word file...';
      return needDocx().then(function () {
        var D = window.docx;
        var children = [];
        pages.forEach(function (pg, i) {
          pg.split('\n').forEach(function (line) { children.push(new D.Paragraph({ children: [new D.TextRun(line)] })); });
          if (i < pages.length - 1) children.push(new D.Paragraph({ children: [new D.PageBreak()] }));
        });
        var doc = new D.Document({ sections: [{ children: children }] });
        return D.Packer.toBlob(doc);
      });
    }).then(function (blob) {
      downloadBlob(blob, file.name.replace(/\.pdf$/i, '') + '.docx');
      status.textContent = 'Done! Word file downloaded. Note: only the text is carried over — layout, images and tables are not preserved.';
    }).catch(function (e) { status.textContent = 'Error: ' + e.message; });
  })));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Text is extracted from your PDF and saved as a real .docx file, all in your browser. Scanned PDFs (photos of pages) have no text to extract — use the Image to Text (OCR) tool for those.'));
});

/* ---------- 24. Word to PDF ---------- */
reg('word-to-pdf', function (root) {
  var file = null, status = h('div');
  var view = h('div', { id: 'docx-view', style: 'border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;min-height:120px;background:#fff' });
  view.textContent = 'Your document will appear here after you choose a .docx file.';
  root.appendChild(dropZone('Select a Word file (.docx)', '.docx', false, function (fs) {
    file = fs[0]; if (!file) return;
    status.textContent = 'Reading document...';
    needDocxPreview().then(function () {
      view.innerHTML = '';
      return window.docxPreview.renderAsync(file, view);
    }).then(function () { status.textContent = 'Document ready. Click "Save as PDF" and choose "Save as PDF" in your browser’s print dialog.'; })
    .catch(function (e) { status.textContent = 'Error: ' + e.message; });
  }));
  root.appendChild(status);
  root.appendChild(view);
  root.appendChild(btnRow(btn('Save as PDF (Print)', '', function () {
    if (!file) { status.textContent = 'Select a .docx file first.'; return; }
    var st = document.createElement('style');
    st.textContent = '@media print { body * { visibility: hidden; } #docx-view, #docx-view * { visibility: visible; } #docx-view { position: absolute; left: 0; top: 0; width: 100%; border: none; margin: 0; padding: 0; } }';
    document.head.appendChild(st);
    window.print();
  })));
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'Your Word file is rendered in your browser and printed to PDF with your browser’s own "Save as PDF" option — no upload, no conversion server. Layout is kept as close as the browser can render it.'));
});

/* ---------- 25. PDF Unlock ---------- */
reg('pdf-unlock', function (root) {
  var file = null, pass = h('input', { type: 'password', placeholder: 'PDF password' });
  var status = h('div');
  root.appendChild(dropZone('Select a password-protected PDF', '.pdf', false, function (fs) { file = fs[0]; status.textContent = file ? file.name + ' selected.' : ''; }));
  root.appendChild(field('Password', pass));
  root.appendChild(btnRow(btn('Unlock PDF', '', function () {
    if (!file) { status.textContent = 'Select a PDF first.'; return; }
    if (!pass.value) { status.textContent = 'Enter the PDF password. (This tool removes a password you already know — it cannot crack a password.)'; return; }
    status.textContent = 'Opening PDF...';
    var pdfDoc = null, pages = [];
    needPdfJs().then(function () { return readAs('readAsArrayBuffer', file); }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf, password: pass.value }).promise;
    }).then(function (pdf) {
      pdfDoc = pdf;
      status.textContent = 'Rendering ' + pdf.numPages + ' page(s)...';
      var chain = Promise.resolve();
      for (var p = 1; p <= pdf.numPages; p++) {
        (function (pageNo) {
          chain = chain.then(function () {
            return pdfDoc.getPage(pageNo).then(function (page) {
              var vp = page.getViewport({ scale: 1.5 });
              var cv = document.createElement('canvas');
              cv.width = vp.width; cv.height = vp.height;
              return page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () {
                return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, 'image/jpeg', 0.85); });
              }).then(function (blob) { return blob.arrayBuffer(); }).then(function (ab) {
                pages.push({ data: ab, w: vp.width, h: vp.height });
                status.textContent = 'Rendered page ' + pageNo + ' of ' + pdfDoc.numPages + '...';
              });
            });
          });
        })(p);
      }
      return chain;
    }).then(function () { return needPdfLib(); }).then(function () {
      return window.PDFLib.PDFDocument.create();
    }).then(function (doc) {
      var chain2 = Promise.resolve();
      pages.forEach(function (pg) {
        chain2 = chain2.then(function () {
          return doc.embedJpg(pg.data).then(function (img) {
            var page = doc.addPage([pg.w, pg.h]);
            page.drawImage(img, { x: 0, y: 0, width: pg.w, height: pg.h });
          });
        });
      });
      return chain2.then(function () { return doc.save(); });
    }).then(function (bytes) {
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf');
      status.textContent = 'Done! Unlocked PDF downloaded. Pages are kept as images, so text selection is lost.';
    }).catch(function (e) { status.textContent = 'Error: ' + (e && e.message ? e.message : e) + ' — check the password and try again.'; });
  })));
  root.appendChild(status);
  root.appendChild(h('p', { style: 'font-size:13px;color:#64748b' }, 'This removes the password from a PDF you already know the password for — it cannot crack or guess passwords. Pages are kept as images in the unlocked file, so text selection is lost.'));
});

/* ---------- 26. Watermark Adder ---------- */
reg('watermark-adder', function (root) {
  var wm = h('input', { type: 'text', placeholder: 'e.g. © Malik Anwaar' });
  var pos = h('select');
  [['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['top-right', 'Top right'], ['top-left', 'Top left'], ['center', 'Center'], ['bottom-center', 'Bottom center']].forEach(function (o) { pos.appendChild(h('option', { value: o[0] }, o[1])); });
  var op = numInput(0.5, 0.1, 1, 0.05), size = numInput(36, 12, 120, 1);
  function drawWm(st, cv) {
    if (!st.img) return;
    var ctx = cv.getContext('2d');
    cv.width = st.img.width; cv.height = st.img.height;
    ctx.drawImage(st.img, 0, 0);
    var t = wm.value.trim();
    if (!t) return;
    var fs = Math.max(12, Math.round(cv.width * (+size.value || 36) / 800));
    ctx.font = 'bold ' + fs + 'px Arial, sans-serif';
    ctx.globalAlpha = +op.value || 0.5;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3;
    var tw = ctx.measureText(t).width, m = 16, x, y;
    var p = pos.value;
    x = p.indexOf('left') >= 0 ? m : p.indexOf('right') >= 0 ? cv.width - tw - m : (cv.width - tw) / 2;
    y = p.indexOf('top') >= 0 ? m + fs : p === 'center' ? cv.height / 2 : cv.height - m;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.strokeText(t, x, y); ctx.fillText(t, x, y);
    ctx.globalAlpha = 1;
  }
  root.appendChild(h('p', null, 'Add a text watermark to protect your photos. Everything stays in your browser.'));
  imgWorkArea(root, 'image/*', function (st, cv) { drawWm(st, cv); }, function (st, cv, controls) {
    controls.appendChild(field('Watermark text', wm));
    controls.appendChild(field('Position', pos));
    controls.appendChild(field('Opacity (0.1 – 1)', op));
    controls.appendChild(field('Text size', size));
    [wm, pos, op, size].forEach(function (el) { el.addEventListener('input', function () { drawWm(st, cv); }); });
    controls.appendChild(btnRow(btn('Download Watermarked PNG', '', function () {
      drawWm(st, cv);
      canvasDownload(cv, (st.name || 'image') + '-watermarked.png');
    })));
  });
});

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var root = document.getElementById('tool-root');
  if (root && TOOLS[root.getAttribute('data-tool')]) {
    try { TOOLS[root.getAttribute('data-tool')](root); }
    catch (e) { root.innerHTML = '<p>Error loading tool: ' + e.message + '</p>'; }
  }
});
})();
