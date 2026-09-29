/* ==========================================================================
   Marea Online · Comportamiento básico (sin dependencias)
   1. Cabecera: pasa a clara al salir del hero
   2. Menú móvil
   3. Enlaces de WhatsApp, email y teléfono desde js/config.js
   4. Formulario de contacto: validación, envío y estados
   ========================================================================== */
(function () {
  'use strict';
  var CFG = window.MAREA_CONFIG || {};
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Cabecera ---------- */
  var nav = $('.nav');
  var hero = $('[data-dark-top]');   // sección oscura de arriba: mientras se ve, la cabecera va en oscuro
  function onScroll() {
    if (!nav) return;
    var limit = hero ? hero.offsetHeight - 120 : 0;
    nav.classList.toggle('is-scrolled', window.scrollY > Math.max(limit, window.innerHeight * 0.4));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- 2. Menú móvil ---------- */
  var btn = $('[data-menu-open]'), menu = $('#mobileMenu'), closeBtn = $('[data-menu-close]');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (btn) btn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-menu-open', open);
    document.dispatchEvent(new CustomEvent('marea:menu', { detail: { open: open } }));
    if (open) setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); btn.focus(); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); btn.focus(); }
    });
    var mq = window.matchMedia('(min-width: 768px)');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- 3. Canales de contacto ---------- */
  var waUrl = CFG.whatsapp
    ? 'https://wa.me/' + CFG.whatsapp + (CFG.whatsappText ? '?text=' + encodeURIComponent(CFG.whatsappText) : '')
    : null;
  $$('[data-whatsapp]').forEach(function (a) {
    if (waUrl) { a.href = waUrl; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = 'contacto.html#formulario'; }   // sin número configurado, lleva al formulario
  });
  $$('[data-email]').forEach(function (a) {
    if (!CFG.email) return;
    a.href = 'mailto:' + CFG.email;
    if (a.hasAttribute('data-fill')) a.textContent = CFG.email;
  });
  $$('[data-phone]').forEach(function (a) {
    if (!CFG.phone) { var item = a.closest('[data-optional]'); if (item) item.hidden = true; return; }
    a.href = 'tel:' + CFG.phone.replace(/\s+/g, '');
    if (a.hasAttribute('data-fill')) a.textContent = CFG.phone;
  });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 4. Formulario ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var MSG = {
    required: 'Este campo es obligatorio.',
    email: 'Revisa el email: parece que falta algo.',
    consent: 'Necesitamos tu permiso para responderte.',
    demo: 'Formulario en modo demostración: todo está bien, pero todavía no está conectado. Conéctalo en js/config.js.',
    error: 'No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.'
  };

  function setError(field, text) {
    var wrap = field.closest('.field, .consent');
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!text);
    var err = wrap.querySelector('.field__error');
    if (text) {
      if (!err) { err = document.createElement('span'); err.className = 'field__error'; wrap.appendChild(err); }
      err.id = err.id || field.id + '-error';
      err.textContent = text;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', err.id);
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  function validate(form) {
    var first = null;
    $$('[required]', form).forEach(function (f) {
      var msg = '';
      if (f.type === 'checkbox') msg = f.checked ? '' : MSG.consent;
      else if (!f.value.trim()) msg = MSG.required;
      else if (f.type === 'email' && !EMAIL_RE.test(f.value.trim())) msg = MSG.email;
      setError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  function status(form, type, text) {
    var box = $('.form__status', form);
    if (!box) return;
    box.className = 'form__status is-' + type;
    box.textContent = text;
    box.hidden = false;
  }

  $$('form[data-lead-form]').forEach(function (form) {
    /* Servicio preseleccionado desde la URL: contacto.html?servicio=web-ia */
    var pre = new URLSearchParams(location.search).get('servicio');
    var sel = $('select[name="servicio"]', form);
    if (pre && sel && $('option[value="' + pre + '"]', sel)) sel.value = pre;

    $$('[required]', form).forEach(function (f) {
      f.addEventListener(f.type === 'checkbox' ? 'change' : 'blur', function () {
        if (f.closest('.is-invalid')) validate(form);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var data = new FormData(form);
      if (data.get('web')) return;   // campo trampa: si viene relleno, es un bot

      var payload = {
        nombre: (data.get('nombre') || '').trim(),
        email: (data.get('email') || '').trim(),
        telefono: (data.get('telefono') || '').trim(),
        servicio: data.get('servicio') || '',
        mensaje: (data.get('mensaje') || '').trim(),
        consentimiento: data.get('consentimiento') === 'si',
        origen: location.pathname,
        enviado_en: new Date().toISOString()
      };

      if (!CFG.formEndpoint) { status(form, 'ok', MSG.demo); return; }

      var submit = $('[type="submit"]', form);
      if (submit) submit.classList.add('is-loading');
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        location.href = CFG.thanksPage || 'gracias.html';
      }).catch(function () {
        status(form, 'error', MSG.error);
      }).then(function () {
        if (submit) submit.classList.remove('is-loading');
      });
    });
  });
})();
