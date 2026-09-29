/* ==========================================================================
   SOLO VISTA PREVIA: barra Web · Kit de código · Guía, y utilidades del kit.
   No se lleva a producción (ver guia.html → "Llevar a producción").
   ========================================================================== */
(function () {
  'use strict';
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var page = location.pathname.split('/').pop() || 'index.html';

  /* ---------- Barra flotante ---------- */
  var hidden = false;
  try { hidden = sessionStorage.getItem('sys-bar') === 'off'; } catch (e) {}
  if (!hidden) {
    var bar = document.createElement('nav');
    bar.className = 'sys-bar';
    bar.setAttribute('aria-label', 'Vista previa');
    var tab = page === 'kit.html' ? 'kit' : page === 'guia.html' ? 'guia' : 'web';
    bar.innerHTML =
      '<span class="sys-bar__label">Vista previa</span>' +
      '<a href="index.html"' + (tab === 'web' ? ' aria-current="page"' : '') + '>Web</a>' +
      '<a href="kit.html"' + (tab === 'kit' ? ' aria-current="page"' : '') + '>Kit de código</a>' +
      '<a href="guia.html"' + (tab === 'guia' ? ' aria-current="page"' : '') + '>Guía</a>' +
      '<button type="button" aria-label="Ocultar barra"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    document.body.appendChild(bar);
    bar.querySelector('button').addEventListener('click', function () {
      bar.remove();
      try { sessionStorage.setItem('sys-bar', 'off'); } catch (e) {}
    });
  }

  /* ---------- Kit: muestra el código de cada demostración ---------- */
  function dedent(html) {
    var lines = html.replace(/^\n+|\s+$/g, '').split('\n');
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    return lines.map(function (l) { return l.slice(min === Infinity ? 0 : min); }).join('\n');
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tidy(code) {   // deja el HTML como se escribe a mano, no como lo serializa el navegador
    return code.replace(/ (data-[\w-]+|required|novalidate|hidden|open|disabled)=""/g, ' $1').replace(/><\/use>/g, '/>');
  }
  function addCode(piece, code) {
    code = tidy(code);
    var box = document.createElement('details');
    box.className = 'kit-code';
    box.innerHTML = '<summary>Ver código HTML</summary><button type="button" class="kit-copy">Copiar</button><pre><code>' + esc(code) + '</code></pre>';
    piece.appendChild(box);
    box.querySelector('.kit-copy').addEventListener('click', function (e) {
      var b = e.currentTarget;
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1500); });
    });
  }
  $$('.kit-piece').forEach(function (piece) {
    var demo = piece.querySelector('.kit-demo');
    var src = piece.getAttribute('data-source');   // pieza sacada de otra página: "index.html .site-header"
    if (src) {
      var parts = src.split(' '), url = parts.shift(), sel = parts.join(' ');
      fetch(url).then(function (r) { return r.text(); }).then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, 'text/html');
        var el = doc.querySelector(sel);
        if (!el) return;
        var html = el.outerHTML, lines = html.split('\n');
        var indent = lines.length > 1 ? lines[lines.length - 1].match(/^ */)[0] : '';   // sangría real del elemento en su archivo
        addCode(piece, dedent(indent + html));
      }).catch(function () { addCode(piece, '<!-- Abre el kit desde un servidor (no con file://) para ver este código. Está en ' + url + ' -->'); });
    } else if (demo) {
      addCode(piece, dedent(demo.innerHTML));
    }
  });

  /* ---------- Kit: todos los iconos del sprite ---------- */
  $$('[data-icon-grid]').forEach(function (grid) {
    grid.innerHTML = $$('symbol[id^="i-"]').map(function (sym) {
      return '<div><svg><use href="#' + sym.id + '"/></svg><code>' + sym.id + '</code></div>';
    }).join('');
  });

  /* ---------- Kit: valores reales de los tokens ---------- */
  var cs = getComputedStyle(document.documentElement);
  $$('[data-token]').forEach(function (el) { el.textContent = cs.getPropertyValue(el.getAttribute('data-token')).trim(); });
})();
