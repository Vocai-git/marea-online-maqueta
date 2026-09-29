/* ==========================================================================
   Marea Online · Animaciones (GSAP + ScrollTrigger, en js/vendor/)
   - Todo el contenido es visible sin este archivo: las animaciones solo "llegan".
   - Con "reducir movimiento" del sistema o con ?static en la URL no se anima nada.
   - Cada bloque busca su pieza por clase; si la pieza no está en la página, se salta.
   Para quitar una animación: borrar su bloque. Para quitarlas todas: no cargar este archivo.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('static');
  if (!window.gsap || !window.ScrollTrigger || REDUCE) { root.classList.remove('preanim'); return; }

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('anim');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var done = new Set();                          // piezas ya animadas por un bloque específico
  function mark(el) { if (el) done.add(el); }
  function st(el, start) { return { trigger: el, start: start || 'top 85%', once: true }; }

  /* Parte un titular en palabras para que suban una a una */
  function splitWords(el) {
    if (!el) return [];
    if (!el.dataset.split) {
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
        return '<span class="w" aria-hidden="true"><span class="wi">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
      }).join(' ');
      el.dataset.split = '1';
    }
    return $$('.wi', el);
  }

  /* Contador: data-count="87" (y opcional data-from="38" para contar hacia abajo) */
  function counter(el, duration) {
    var to = parseFloat(el.dataset.count), from = el.dataset.from ? parseFloat(el.dataset.from) : 0, obj = { v: from };
    el.textContent = String(from);
    return gsap.to(obj, { v: to, duration: duration || 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = String(Math.round(obj.v)); } });
  }

  /* Menú móvil: los enlaces entran escalonados al abrir */
  document.addEventListener('marea:menu', function (e) {
    if (!e.detail.open) return;
    gsap.fromTo($$('.mm-link, .mobile-menu__cta > *'), { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out', delay: 0.08, overwrite: true });
  });

  /* Barra de progreso de lectura */
  var progress = $('.progress');
  if (progress) gsap.to(progress, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  var nav = $('.nav');

  /* ---------- HERO DE LA HOME: entrada orquestada ---------- */
  var hero = $('.hero');
  if (hero) {
    var panel = $('.float--panel', hero), chat = $('.float--chat', hero), note = $('.float--note', hero);
    var msgs = chat ? $$('.msg', chat) : [];
    var typing = document.createElement('div');
    typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>'; typing.setAttribute('aria-hidden', 'true');
    if (msgs[1]) msgs[1].parentNode.insertBefore(typing, msgs[1]);
    gsap.set(typing, { display: 'none' });

    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(nav, { y: -90, opacity: 0, duration: 1 }, 0)
      .from($('.sea-img', hero), { scale: 1.3, opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
      .from($('.contours', hero), { opacity: 0, duration: 2 }, 0.2)
      .from($('.pill', hero), { y: 30, opacity: 0, duration: 0.8 }, 0.2)
      .from(splitWords($('.hero__title', hero)), { yPercent: 118, rotate: 7, duration: 1.2, stagger: 0.06 }, 0.3)
      .from($('.hero__lead', hero), { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1.1, clearProps: 'filter' }, 0.75)
      .from($$('.hero__ctas > *', hero), { y: 30, opacity: 0, scale: 0.85, duration: 0.9, stagger: 0.08, ease: 'back.out(2)', clearProps: 'transform' }, 0.9)
      .from($$('.quick li', hero), { y: 26, opacity: 0, duration: 0.7, stagger: 0.06 }, 1.05)
      .from($$('.guarantees li', hero), { y: 20, opacity: 0, duration: 0.6, stagger: 0.07 }, 1.3);
    if (panel) {
      tl.from(panel, { x: 160, y: -30, rotate: 8, opacity: 0, duration: 1.4 }, 0.55)
        .from($$('.bars i', panel), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.05, ease: 'back.out(2.2)' }, 1.1);
      $$('[data-count]', panel).forEach(function (el) { tl.add(counter(el, 1.6), 1.1); });
    }
    if (chat) {
      tl.from(chat, { y: 140, rotate: -6, opacity: 0, duration: 1.3 }, 0.85);
      if (msgs[0]) tl.from(msgs[0], { x: 50, opacity: 0, duration: 0.55 }, 1.55);
      tl.set(typing, { display: 'flex' }, 1.95).from(typing, { opacity: 0, y: 8, duration: 0.3 }, 1.95).set(typing, { display: 'none' }, 2.75);
      if (msgs[1]) tl.from(msgs[1], { y: 16, opacity: 0, scale: 0.95, duration: 0.6, ease: 'back.out(2)' }, 2.75);
    }
    if (note) tl.from(note, { scale: 0.3, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.55)' }, 3.05);
    root.classList.remove('preanim');

    tl.eventCallback('onComplete', function () {   // deriva suave, como el mar
      [panel, chat, note].forEach(function (el, i) { if (el) gsap.to(el, { y: '-=10', duration: 3.2 + i * 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }); });
    });
    gsap.to($('.sea-img', hero), { yPercent: 16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to($('.floats', hero), { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- HERO DE PÁGINA INTERIOR ---------- */
  var ph = $('.page-hero');
  if (ph) {
    var visual = $('.page-hero__visual', ph);
    var pt = gsap.timeline({ defaults: { ease: 'expo.out' } });
    pt.from(nav, { y: -90, opacity: 0, duration: 1 }, 0)
      .from($('.sea-img', ph), { scale: 1.25, opacity: 0, duration: 2.2, ease: 'power2.out' }, 0)
      .from($$('.crumbs, .kicker', ph), { x: -40, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.15)
      .from(splitWords($('.h1', ph)), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.05 }, 0.25)
      .from($('.lead', ph), { y: 26, opacity: 0, filter: 'blur(8px)', duration: 1, clearProps: 'filter' }, 0.6)
      .from($$('.btn-row > *, .page-index a', ph), { y: 24, opacity: 0, duration: 0.7, stagger: 0.05, clearProps: 'transform' }, 0.8);
    if (visual) {
      pt.from(visual, { y: 120, rotate: -5, opacity: 0, duration: 1.3 }, 0.5);
      $$('[data-count]', visual).forEach(function (el) { pt.add(counter(el, 1.6), 1); });
      var vbars = $$('.bars i', visual);
      if (vbars.length) pt.from(vbars, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.05, ease: 'back.out(2.2)' }, 1);
      var vh = $$('.hbar i', visual);
      if (vh.length) pt.from(vh, { width: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, 1);
    }
    root.classList.remove('preanim');
  }
  if (!hero && !ph) root.classList.remove('preanim');

  /* ---------- Titulares de sección: palabra por palabra ---------- */
  $$('.section-head .h2, .cta__title').forEach(function (h) {
    gsap.from(splitWords(h), { yPercent: 118, rotate: 5, duration: 1.1, stagger: 0.05, ease: 'expo.out', scrollTrigger: st(h, 'top 90%') });
    var head = h.closest('.section-head') || h.parentNode;
    mark(head);
    var rest = $$('.lead, .cta__text', head);
    if (rest.length) gsap.from(rest, { y: 26, opacity: 0, filter: 'blur(8px)', duration: 1, delay: 0.25, ease: 'expo.out', clearProps: 'filter', scrollTrigger: st(h, 'top 90%') });
    var link = head.classList.contains('section-head--row') ? $(':scope > .link', head) : null;
    if (link) gsap.from(link, { x: 40, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: st(h, 'top 90%') });
  });
  $$('.section-head .kicker').forEach(function (k) {
    gsap.from(k, { x: -50, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: st(k, 'top 92%') });
  });

  /* ---------- Grupos que se levantan en 3D (índice de servicios, baldosas) ---------- */
  $$('[data-anim="lift"]').forEach(function (group) {
    var items = Array.prototype.slice.call(group.children);
    items.forEach(mark);
    gsap.from(items, { y: 110, rotateX: -28, scale: 0.9, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%',
      duration: 1.2, stagger: 0.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(group) });
  });

  /* ---------- Tarjetas que entran de los lados + su contenido ---------- */
  $$('[data-anim="sides"]').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (card, i) {
      mark(card);
      var dir = i % 2 === 0 ? -1 : 1;
      var t = gsap.timeline({ scrollTrigger: st(card), defaults: { ease: 'expo.out' } });
      t.from(card, { x: 160 * dir, rotate: 4 * dir, opacity: 0, duration: 1.3, clearProps: 'transform' })
        .from($$('.checks li', card), { x: -30, opacity: 0, duration: 0.6, stagger: 0.07 }, 0.5);
      var hb = $$('.hbar i', card);
      if (hb.length) t.from(hb, { width: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, 0.6);
      $$('[data-count]', card).forEach(function (el) { t.add(counter(el, 1.6), 0.5); });
      var slots = $$('.mock-cal__slot', card);
      if (slots.length) t.from(slots, { scale: 0, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(3)' }, 0.55);
      var weeks = $$('.mock-month > div', card);
      if (weeks.length) t.from(weeks, { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.55);
    });
  });

  /* ---------- Móvil de apps: sube girando y se llena ---------- */
  $$('.mock-phone').forEach(function (phone) {
    if (phone.closest('.page-hero')) return;
    var wrap = phone.parentNode; mark(wrap);
    var t = gsap.timeline({ scrollTrigger: st(wrap, 'top 80%'), defaults: { ease: 'expo.out' } });
    t.from(phone, { y: 180, rotate: 12, opacity: 0, duration: 1.4 })
      .from($$('.mock-phone__row', phone), { x: 70, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.6)
      .from($$('.mock-phone__stats > *', phone), { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(2.4)' }, 0.95)
      .from($('.mock-phone__cta', phone), { scale: 0.7, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, 1.2);
    $$('[data-count]', phone).forEach(function (el) { t.add(counter(el, 1.4), 0.95); });
  });

  /* ---------- Flujo en pasos (setter, bot…) ---------- */
  $$('.flow').forEach(function (flow) {
    mark(flow);
    var steps = $$('.flow__step', flow);
    var t = gsap.timeline({ scrollTrigger: st(flow), defaults: { ease: 'expo.out' } });
    t.from(flow, { y: 80, scale: 0.94, opacity: 0, duration: 1.1 })
      .from(steps, { y: 40, opacity: 0, duration: 0.7, stagger: 0.3, ease: 'back.out(2)' }, 0.4);
    var key = $('.flow__step--key', flow);
    if (key) t.to(key, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 1.3);
  });

  /* ---------- Casos: giran en 3D y las métricas cuentan ---------- */
  $$('[data-anim="cases"]').forEach(function (grid) {
    var cases = $$('.case', grid);
    cases.forEach(mark);
    var t = gsap.timeline({ scrollTrigger: st(grid, 'top 82%'), defaults: { ease: 'expo.out' } });
    t.from(cases, { y: 150, rotateY: -35, rotateX: 10, opacity: 0, transformPerspective: 1100, transformOrigin: '0% 50%', duration: 1.3, stagger: 0.12, clearProps: 'transform' }, 0);
    cases.forEach(function (c, i) {
      var at = 0.35 + i * 0.12, ring = $('.ring', c), seal = $('.case__seal', c), metric = $('.case__metric', c);
      if (ring) t.from(ring, { rotate: -200, scale: 0.4, opacity: 0, duration: 1.1, ease: 'back.out(1.8)' }, at);
      if (seal) t.from(seal, { scale: 0, rotate: -120, duration: 0.8, ease: 'back.out(3)' }, at + 0.3);
      if (metric) {
        if (metric.dataset.count) t.add(counter(metric, 1.6), at + 0.2);
        else t.from(metric, { scale: 0.4, opacity: 0, filter: 'blur(8px)', duration: 0.9, clearProps: 'filter' }, at + 0.2);
      }
    });
  });

  /* ---------- Proceso: la línea de marea se dibuja y los pasos se encienden ---------- */
  $$('.steps-wrap').forEach(function (wrap) {
    var line = $('.steps-line', wrap), items = $$('.step', wrap);
    items.forEach(mark);
    var t = gsap.timeline({ scrollTrigger: st(wrap), defaults: { ease: 'expo.out' } });
    if (line) t.fromTo(line, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, 0);
    items.forEach(function (li, i) {
      t.from($('.step__num', li), { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(3)' }, 0.25 + i * 0.35)
        .from($$('.h4, p', li), { y: 26, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.35 + i * 0.35);
    });
  });

  /* ---------- Listas escalonadas (características, FAQ, canales) ---------- */
  $$('[data-anim="stagger"]').forEach(function (group) {
    var items = Array.prototype.slice.call(group.children);
    items.forEach(mark); mark(group);
    gsap.from(items, { y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(group, 'top 88%') });
  });

  /* ---------- Bloque de contacto ---------- */
  $$('.cta').forEach(function (cta) {
    if (cta.closest('.page-hero')) return;
    mark(cta);
    gsap.from(cta, { y: 100, scale: 0.92, opacity: 0, duration: 1.3, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(cta, 'top 88%') });
    var img = $('.sea-img', cta);
    if (img) gsap.from(img, { scale: 1.3, duration: 2.2, ease: 'power2.out', scrollTrigger: st(cta, 'top 88%') });
    var form = $('.form', cta);
    if (form) gsap.from($$(':scope > *:not(.form__status):not(.form__hp)', form), { x: 50, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(form) });
  });

  /* ---------- Pie ---------- */
  var foot = $$('.site-footer__grid > div');
  if (foot.length) gsap.from(foot, { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: st(foot[0], 'top 96%') });

  /* ---------- Resto: cualquier elemento con .reveal ---------- */
  $$('.reveal').forEach(function (el) {
    if (done.has(el)) return;
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(el, 'top 90%') });
  });

  /* ---------- Inclinación 3D al pasar el ratón (solo escritorio) ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.case, [data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotateY: x * 12, rotateX: -y * 12, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' }); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
