/* Marea Online · menú móvil + animaciones (GSAP + ScrollTrigger)
   Sin GSAP, con "reducir movimiento" o con ?static, todo queda visible y estático. */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');
  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Nav: pasa a claro al salir del hero ---------- */
  var nav = $('#nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.75); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var btn = $('#menuBtn'), menu = $('#mobileMenu'), closeBtn = $('#menuClose');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (btn) btn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) {
      if (HAS_GSAP && !REDUCE) {
        gsap.fromTo($$('.mm-link, .mm-cta > *', menu), { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out', delay: 0.08, overwrite: true });
      }
      setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
    }
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); btn.focus(); });
    $$('[data-menu-link]', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); btn.focus(); }
    });
    var mq = window.matchMedia('(min-width: 768px)');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Animaciones ---------- */
  if (!HAS_GSAP || REDUCE) { root.classList.remove('preanim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('anim');

  var handled = new Set();
  function mark(el) {
    if (!el) return;
    handled.add(el);
    var r = el.closest ? el.closest('.reveal') : null;
    if (r) handled.add(r);
  }
  function st(el, start) { return { trigger: el, start: start || 'top 85%', once: true }; }

  function splitWords(el) {
    if (!el) return [];
    if (!el.dataset.split) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) {
        var safe = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<span class="w"><span class="wi">' + safe + '</span></span>';
      }).join(' ');
      el.dataset.split = '1';
    }
    return $$('.wi', el);
  }

  function counter(el, duration) {
    var to = parseFloat(el.dataset.count);
    var from = el.dataset.from ? parseFloat(el.dataset.from) : 0;
    var obj = { v: from };
    el.textContent = String(from);
    return gsap.to(obj, {
      v: to, duration: duration || 1.8, ease: 'power3.out',
      onUpdate: function () { el.textContent = String(Math.round(obj.v)); }
    });
  }

  /* Barra de progreso de lectura */
  var progress = $('#progress');
  if (progress) {
    gsap.to(progress, { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
  }

  /* HERO: entrada orquestada */
  var hero = $('#inicio');
  if (hero) {
    var panel = $('.float.d1', hero), chat = $('.float.d2', hero), cita = $('.float.d3', hero);
    var bubbles = chat ? $$('.space-y-2 > div', chat) : [];
    var typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    if (bubbles[1]) bubbles[1].parentNode.insertBefore(typing, bubbles[1]);
    gsap.set(typing, { display: 'none' });

    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(nav, { y: -90, opacity: 0, duration: 1 }, 0)
      .from($('.hero-img', hero), { scale: 1.3, opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
      .from($('.contours', hero), { opacity: 0, duration: 2 }, 0.2)
      .from($('.hero-badge', hero), { y: 30, opacity: 0, duration: 0.8 }, 0.2)
      .from(splitWords($('h1', hero)), { yPercent: 118, rotate: 7, duration: 1.2, stagger: 0.06 }, 0.3)
      .from($('.hero-lead', hero), { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1.1, clearProps: 'filter' }, 0.75)
      .from($$('.hero-ctas > *', hero), { y: 30, opacity: 0, scale: 0.85, duration: 0.9, stagger: 0.08, ease: 'back.out(2)', clearProps: 'transform' }, 0.9)
      .from($$('.hero-quick li', hero), { y: 26, opacity: 0, duration: 0.7, stagger: 0.06 }, 1.05)
      .from($$('.hero-guarantees li', hero), { y: 20, opacity: 0, duration: 0.6, stagger: 0.07 }, 1.3);
    if (panel) {
      tl.from(panel, { x: 160, y: -30, rotate: 8, opacity: 0, duration: 1.4 }, 0.55)
        .from($$('.bars i', panel), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.05, ease: 'back.out(2.2)' }, 1.1);
      $$('[data-count]', panel).forEach(function (el) { tl.add(counter(el, 1.6), 1.1); });
    }
    if (chat) {
      tl.from(chat, { y: 140, rotate: -6, opacity: 0, duration: 1.3 }, 0.85);
      if (bubbles[0]) tl.from(bubbles[0], { x: 50, opacity: 0, duration: 0.55 }, 1.55);
      tl.set(typing, { display: 'flex' }, 1.95)
        .from(typing, { opacity: 0, y: 8, duration: 0.3 }, 1.95)
        .set(typing, { display: 'none' }, 2.75);
      if (bubbles[1]) tl.from(bubbles[1], { y: 16, opacity: 0, scale: 0.95, duration: 0.6, ease: 'back.out(2)' }, 2.75);
    }
    if (cita) tl.from(cita, { scale: 0.3, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.55)' }, 3.05);
    root.classList.remove('preanim');

    tl.eventCallback('onComplete', function () {
      [panel, chat, cita].forEach(function (el, i) {
        if (el) gsap.to(el, { y: '-=10', duration: 3.2 + i * 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });
    });
    gsap.to($('.hero-img', hero), { yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to($('.hero-float', hero), { yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  } else {
    root.classList.remove('preanim');
  }

  /* Títulos de sección: palabra por palabra */
  $$('section h2').forEach(function (h2) {
    mark(h2);
    gsap.from(splitWords(h2), { yPercent: 118, rotate: 5, duration: 1.1, stagger: 0.05, ease: 'expo.out', scrollTrigger: st(h2, 'top 90%') });
    var p = h2.nextElementSibling;
    if (p && p.tagName === 'P') {
      gsap.from(p, { y: 26, opacity: 0, filter: 'blur(8px)', duration: 1, delay: 0.25, ease: 'expo.out', clearProps: 'filter', scrollTrigger: st(h2, 'top 90%') });
    }
  });
  $$('.kicker').forEach(function (k) {
    if (k.closest('#servicios')) return;
    gsap.from(k, { x: -50, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: st(k, 'top 92%') });
  });

  /* Índice de servicios: tarjetas que se levantan */
  var idx = $$('#servicios .card');
  if (idx.length) {
    idx.forEach(mark);
    gsap.from(idx, { y: 110, rotateX: -28, scale: 0.9, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%',
      duration: 1.2, stagger: 0.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(idx[0].parentNode) });
  }

  /* Webs y Redes: tarjetas que entran de los lados + contenido interno */
  $$('#webs .grid > .card, #redes-sociales .grid > .card').forEach(function (card, i) {
    mark(card);
    var dir = i % 2 === 0 ? -1 : 1;
    var t = gsap.timeline({ scrollTrigger: st(card, 'top 85%'), defaults: { ease: 'expo.out' } });
    t.from(card, { x: 160 * dir, rotate: 4 * dir, opacity: 0, duration: 1.3, clearProps: 'transform' })
      .from($$('.check', card), { x: -30, opacity: 0, duration: 0.6, stagger: 0.07 }, 0.5);
    var bars = $$('[class*="h-1.5"][style*="width"]', card);
    if (bars.length) t.from(bars, { width: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, 0.6);
    $$('[data-count]', card).forEach(function (el) { t.add(counter(el, 1.6), 0.5); });
    var cells = $$('.grid-cols-7 > div', card).slice(7);
    if (cells.length) t.from(cells, { scale: 0, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(3)' }, 0.55);
    var weeks = $$('.grid-cols-4 > div', card);
    if (weeks.length) t.from(weeks, { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.55);
  });

  /* Apps: el móvil sube girando y se llena de reservas */
  var apps = $('#apps');
  if (apps) {
    var cols = $$('.reveal', apps);
    var textCol = cols[0], phoneCol = cols[1];
    if (textCol) {
      mark(textCol);
      gsap.from($$('.check', textCol), { x: -40, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out', scrollTrigger: st($('ul', textCol)) });
      gsap.from($$('.btn, .link', textCol), { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(2)', clearProps: 'transform', scrollTrigger: st($('.btn', textCol), 'top 94%') });
    }
    if (phoneCol) {
      mark(phoneCol);
      var phone = phoneCol.firstElementChild;
      var pt = gsap.timeline({ scrollTrigger: st(phoneCol, 'top 80%'), defaults: { ease: 'expo.out' } });
      pt.from(phone, { y: 180, rotate: 12, opacity: 0, duration: 1.4 })
        .from($$('.space-y-2 > div', phone), { x: 70, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.6)
        .from($$('.grid > div', phone), { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(2.4)' }, 0.95)
        .from(phone.lastElementChild, { scale: 0.7, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, 1.2);
      $$('[data-count]', phone).forEach(function (el) { pt.add(counter(el, 1.4), 0.95); });
    }
  }

  /* Automatizaciones: rejilla que emerge + flujo del setter paso a paso */
  var auto = $('#automatizaciones');
  if (auto) {
    var gl = $$('.glass', auto);
    if (gl.length) {
      gl.forEach(mark);
      gsap.from(gl, { y: 90, scale: 0.85, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: st(gl[0], 'top 88%') });
    }
    var flow = $('.rounded-3xl.bg-white', auto);
    if (flow) {
      mark(flow);
      var steps = $$('.grid-cols-3 > div', flow);
      var ft = gsap.timeline({ scrollTrigger: st(flow, 'top 85%'), defaults: { ease: 'expo.out' } });
      ft.from(flow, { y: 80, scale: 0.94, opacity: 0, duration: 1.1 })
        .from(steps, { y: 40, opacity: 0, duration: 0.7, stagger: 0.3, ease: 'back.out(2)' }, 0.4);
      if (steps[1]) ft.to(steps[1], { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 1.3);
    }
  }

  /* Casos: tarjetas que giran en 3D + métricas que cuentan */
  var cases = $$('#casos .case');
  if (cases.length) {
    cases.forEach(mark);
    var grid = cases[0].parentNode;
    var ct = gsap.timeline({ scrollTrigger: st(grid, 'top 82%'), defaults: { ease: 'expo.out' } });
    ct.from(cases, { y: 150, rotateY: -35, rotateX: 10, opacity: 0, transformPerspective: 1100, transformOrigin: '0% 50%',
      duration: 1.3, stagger: 0.12, clearProps: 'transform' }, 0);
    cases.forEach(function (c, i) {
      var at = 0.35 + i * 0.12;
      var ring = $('.ring', c), badge = $('.absolute.top-6', c), metric = $('.metric', c);
      if (ring) ct.from(ring, { rotate: -200, scale: 0.4, opacity: 0, duration: 1.1, ease: 'back.out(1.8)' }, at);
      if (badge) ct.from(badge, { scale: 0, rotate: -120, duration: 0.8, ease: 'back.out(3)' }, at + 0.3);
      if (metric) {
        if (metric.dataset.count) ct.add(counter(metric, 1.6), at + 0.2);
        else ct.from(metric, { scale: 0.4, opacity: 0, filter: 'blur(8px)', duration: 0.9, clearProps: 'filter' }, at + 0.2);
      }
    });
  }

  /* Proceso: la línea de marea se dibuja y los pasos se encienden en orden */
  var proc = $('#proceso');
  if (proc) {
    var line = $('svg', proc), items = $$('ol > li', proc);
    items.forEach(mark);
    var prt = gsap.timeline({ scrollTrigger: st($('ol', proc), 'top 85%'), defaults: { ease: 'expo.out' } });
    if (line) prt.fromTo(line, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, 0);
    items.forEach(function (li, i) {
      prt.from(li.firstElementChild, { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(3)' }, 0.25 + i * 0.35)
        .from($$('h3, p', li), { y: 26, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.35 + i * 0.35);
    });
  }

  /* Contacto */
  var contact = $('#contacto > div');
  if (contact) {
    gsap.from(contact, { y: 100, scale: 0.92, opacity: 0, duration: 1.3, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(contact, 'top 88%') });
    var cimg = $('img', contact);
    if (cimg) gsap.from(cimg, { scale: 1.3, duration: 2.2, ease: 'power2.out', scrollTrigger: st(contact, 'top 88%') });
    var form = $('form', contact);
    if (form) gsap.from($$(':scope > *', form), { x: 50, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(form, 'top 85%') });
  }

  /* Footer */
  var foot = $$('footer .grid > div');
  if (foot.length) gsap.from(foot, { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: st(foot[0], 'top 96%') });

  /* Resto de bloques marcados como .reveal */
  $$('.reveal').forEach(function (el) {
    if (handled.has(el)) return;
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: st(el, 'top 90%') });
  });

  /* Inclinación 3D al pasar el ratón (solo escritorio) */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.case, #servicios .card').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotateY: x * 12, rotateX: -y * 12, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' }); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
