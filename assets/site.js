/* ---- Idioma: textos de la interfaz en inglés en /en/ ---- */
var __EN = /^en/i.test(document.documentElement.lang || '');
var LOC = __EN ? 'en-GB' : 'es-ES';
function T(s) { return (__EN && T.d[s]) || s; }
T.d = {"Cambiar a modo claro": "Switch to light mode", "Cambiar a modo oscuro": "Switch to dark mode", "Abrir menú": "Open menu", "Cerrar menú": "Close menu", "Imagen ampliada": "Enlarged image", "Abrir la carpeta": "Open the folder", "Cerrar la carpeta": "Close the folder", "Elige un caso, o baja para verlos uno a uno ↓": "Pick a case, or scroll down to see them one by one ↓", "Pulsa la carpeta para ver los casos, o baja para verlos uno a uno ↓": "Click the folder to see the cases, or scroll down to see them one by one ↓", "Pausar todas": "Pause all", "Lanzar todas": "Launch all", "Pausar": "Pause", "Lanzar": "Launch", "En antena": "Live", "En pausa": "Paused", "Cerrar": "Close", "Detalles": "Details", "Abrir": "Open", "Ver": "View", "Todas": "All", " la campaña ": " the campaign ", "✓ Email copiado: ": "✓ Email copied: "};

/* Carlos Osuna · Portfolio — JS compartido (sin dependencias) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---- Año automático ---- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Tema claro / oscuro ---- */
  var themeBtn = $('#themeBtn');
  function syncTheme() {
    var dark = root.dataset.theme === 'dark';
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? T('Cambiar a modo claro') : T('Cambiar a modo oscuro'));
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#121210' : '#F7F6EF');
  }
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('co-theme', next); } catch (e) {}
    syncTheme();
  });

  /* ---- Menú móvil ---- */
  var menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
  function closeMenu() { if (!navLinks) return; navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', T('Abrir menú')); }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? T('Cerrar menú') : T('Abrir menú'));
    });
    $$('a', navLinks).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---- Scroll: progreso, header, volver arriba, parallax, timeline ---- */
  var progress = $('#progress'), header = $('#header'), toTop = $('#toTop'), heroImg = $('#heroImg');
  var tl = $('#timeline'), tlFill = $('#tlFill'), ticking = false;
  /* Las medidas se leen solo cuando cambia el tamaño (ResizeObserver), así el scroll no fuerza recálculos de layout */
  var docH = 0, tlTop = 0, tlH = 0;
  function measure() {
    docH = document.documentElement.scrollHeight - innerHeight;
    if (tl) { var r = tl.getBoundingClientRect(); tlTop = r.top + window.scrollY; tlH = r.height; }
  }
  function onScroll() {
    if (dirty) { measure(); dirty = false; }
    var y = window.scrollY;
    if (progress) progress.style.transform = 'scaleX(' + (docH > 0 ? Math.min(y / docH, 1) : 0) + ')';
    if (header) header.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > innerHeight * 1.2);
    if (tl && tlFill && tlH) {
      var p = Math.min(Math.max((innerHeight * 0.65 - (tlTop - y)) / tlH, 0), 1);
      tlFill.style.height = (p * (tlH - 12)) + 'px';
    }
    ticking = false;
  }
  var dirty = true;
  if ('ResizeObserver' in window) new ResizeObserver(function () { dirty = true; }).observe(document.body);
  window.addEventListener('resize', function () { dirty = true; }, { passive: true });
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- Enlace activo del menú según la sección visible (solo en la home) ---- */
  var links = $$('.nav-links a.lnk[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id], #contacto').forEach(function (el) { secObs.observe(el); });
  }

  /* ---- Contadores ---- */
  function fmt(v, dec) { return v.toLocaleString(LOC, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' }).replace(/^(\d)(\d{3})$/, '$1' + (__EN ? ',' : '.') + '$2'); }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || 0, 10);
    if (reduce) { el.textContent = fmt(end, dec); return; }
    var t0 = null, dur = 1400;
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(end * e, dec);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ---- Apariciones al hacer scroll + disparadores ---- */
  function activate(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(count);
    if (el.matches('[data-count]')) count(el);
    $$('.split, .splitbar', el).concat(el.matches('.split, .splitbar') ? [el] : []).forEach(function (b) { b.classList.add('on'); });
    var phases = $$('.phase', el);
    phases.forEach(function (p, i) { setTimeout(function () { p.classList.add('on'); }, reduce ? 0 : 350 + i * 380); });
    if (el.classList.contains('job')) el.classList.add('on');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(activate); }

  /* ---- Filtro de proyectos (home) ---- */
  var cards = $$('#projects .card'), filters = $$('.filter');
  filters.forEach(function (btn) {
    var f = btn.dataset.filter;
    if (f !== 'all') {
      var n = cards.filter(function (c) { return c.dataset.cat.split(' ').indexOf(f) > -1; }).length;
      btn.insertAdjacentHTML('beforeend', '<span class="n">' + n + '</span>');
    }
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      cards.forEach(function (c) {
        var show = f === 'all' || c.dataset.cat.split(' ').indexOf(f) > -1;
        c.classList.toggle('is-hidden', !show);
        if (show) {
          activate(c);
          if (!reduce && c.animate && !document.startViewTransition) c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      });
      $$('#projects [data-wide]').forEach(function (c) { c.classList.toggle('wide', f === 'all'); });
    });
  });

  /* ---- Palabra rotatoria (máquina de escribir) ---- */
  var rot = $('#rotWord');
  if (rot && !reduce) {
    var words = (rot.dataset.words || rot.textContent).split('|'), wi = 0;
    rot.textContent = words[0];
    (function cycle() {
      var w = words[wi], i = w.length;
      function del() { if (i > 0) { rot.textContent = w.slice(0, --i); setTimeout(del, 45); } else { wi = (wi + 1) % words.length; typ(0); } }
      function typ(j) { var nw = words[wi]; if (j <= nw.length) { rot.textContent = nw.slice(0, j); setTimeout(function () { typ(j + 1); }, 85); } else setTimeout(cycle, 1900); }
      setTimeout(del, 1900);
    })();
  } else if (rot) { rot.textContent = (rot.dataset.words || rot.textContent).split('|')[0]; }

  /* ---- Anuncio de búsqueda simulado ---- */
  var serp = $('#serp'), serpQ = $('#serpQ');
  if (serp && serpQ) {
    var query = serpQ.dataset.q || '';
    var run = function () {
      if (reduce) { serpQ.textContent = query; serp.classList.add('shown'); return; }
      var k = 0;
      (function t() { if (k <= query.length) { serpQ.textContent = query.slice(0, k++); setTimeout(t, 55); } else setTimeout(function () { serp.classList.add('shown'); }, 250); })();
    };
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { so.disconnect(); run(); } }, { threshold: 0.15 });
      so.observe(serp);
    } else run();
  }

  /* ---- Copiar email + aviso ---- */
  var toast = $('#toast'), tt;
  function showToast(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 2200); }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(function () { showToast(T('✓ Email copiado: ') + v); }, function () { location.href = 'mailto:' + v; });
      else location.href = 'mailto:' + v;
    });
  });

  /* ---- CV: si el PDF aún no está subido, el botón lleva a LinkedIn ---- */
  var cvLinks = $$('[data-cv]');
  if (cvLinks.length && location.protocol.indexOf('http') === 0 && window.fetch) {
    fetch(cvLinks[0].getAttribute('href'), { method: 'HEAD' }).then(function (r) {
      if (!r.ok) cvLinks.forEach(function (a) {
        a.removeAttribute('download');
        a.setAttribute('href', 'https://www.linkedin.com/in/carlos-osuna-274a30227/');
        a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
        var lbl = a.querySelector('[data-cv-label]'); if (lbl) lbl.textContent = lbl.dataset.cvLabel;
        var ic = a.querySelector('svg'); if (ic) ic.outerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';
      });
    }).catch(function () {});
  }

  /* ---- Galería ampliada: se abre desde la miniatura, fundido entre diapositivas, contador y gesto ---- */
  var groups = $$('[data-lightbox]');
  if (groups.length) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', T('Imagen ampliada'));
    dlg.innerHTML = '<img alt=""><p><span class="lb-count" aria-live="polite"></span><span class="lb-cap"></span></p>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Cerrar">✕</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Anterior">←</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Siguiente">→</button>';
    document.body.appendChild(dlg);
    var img = $('img', dlg), cnt = $('.lb-count', dlg), cap = $('.lb-cap', dlg), list = [], idx = 0;
    var vt = function (fn) { if (reduce || !document.startViewTransition) { fn(); return Promise.resolve(); } return document.startViewTransition(fn).finished; };
    var thumb = function () { return list[idx] && $('img', list[idx]); };
    function fill(i) {
      idx = (i + list.length) % list.length;
      var b = list[idx], im = $('img', b);
      img.src = b.dataset.full || im.currentSrc || im.src; img.alt = im.alt;
      var fc = b.closest('figure') && $('figcaption', b.closest('figure'));
      cnt.textContent = (idx + 1) + ' / ' + list.length;
      cap.textContent = fc ? fc.textContent.replace(/\s+/g, ' ').trim() : im.alt;
    }
    function go(i) {
      if (reduce) { fill(i); return; }
      dlg.classList.add('swap');
      setTimeout(function () { fill(i); var done = function () { dlg.classList.remove('swap'); }; if (img.complete) requestAnimationFrame(done); else img.onload = done; }, 180);
    }
    function open(btns, i) {
      list = btns; fill(i);
      var t = thumb(); if (t) t.style.viewTransitionName = 'lb-img';
      vt(function () { if (t) t.style.viewTransitionName = ''; img.style.viewTransitionName = 'lb-img'; if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); })
        .then(function () { img.style.viewTransitionName = ''; });
    }
    function close() {
      if (!dlg.open) return;
      var t = thumb();
      img.style.viewTransitionName = 'lb-img';
      vt(function () { img.style.viewTransitionName = ''; dlg.close(); if (t) t.style.viewTransitionName = 'lb-img'; })
        .then(function () { if (t) t.style.viewTransitionName = ''; });
    }
    groups.forEach(function (g) {
      var btns = $$('button[data-full]', g);
      btns.forEach(function (b, i) { b.addEventListener('click', function () { open(btns, i); }); });
    });
    $('.lb-close', dlg).addEventListener('click', close);
    $('.lb-prev', dlg).addEventListener('click', function () { go(idx - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { go(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    var sx = null;
    dlg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    dlg.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); });
    document.addEventListener('keydown', function (e) {
      if (!dlg.open) return;
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
})();

/* Burbuja ESIC: abrir / cerrar el aviso */
(function () {
  var fab = document.getElementById('esicFab'); if (!fab) return;
  var seenKey = 'esic-aviso:' + location.pathname;
  var pop = document.getElementById('esicPop'), btn = fab.querySelector('.esic-btn'), tip = fab.querySelector('.esic-tip'), close = fab.querySelector('.esic-pop__close'), dot = fab.querySelector('.esic-btn__dot');
  function set(open, quiet) {
    pop.hidden = !open; btn.setAttribute('aria-expanded', open);
    if (tip) { tip.hidden = open; if (!open) tip.classList.add('gone'); }
    if (open) { if (dot) dot.remove(); dot = null; if (!quiet) close.focus(); } else { try { sessionStorage.setItem(seenKey, '1'); } catch (e) {} }
  }
  btn.addEventListener('click', function () { set(pop.hidden); });
  /* Al entrar en cada caso, el aviso se abre solo unos segundos (una vez por visita) */
  var seen = false; try { seen = sessionStorage.getItem(seenKey) === '1'; } catch (e) {}
  if (!seen && window.top === window.self) {
    setTimeout(function () {
      if (!pop.hidden) return;
      set(true, true);
      var hold = false;
      fab.addEventListener('pointerenter', function () { hold = true; });
      fab.addEventListener('focusin', function () { hold = true; });
      setTimeout(function () { if (!hold && !pop.hidden) set(false); }, 6500);
    }, 1100);
  }

  if (tip) tip.addEventListener('click', function () { set(true); });
  close.addEventListener('click', function () { set(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!pop.hidden && !fab.contains(e.target)) set(false); });

  /* La etiqueta se recoge a los pocos segundos o al hacer scroll; el botón sigue siempre visible */
  if (tip) {
    var fold = function () { if (pop.hidden) tip.classList.add('gone'); };
    var tt = setTimeout(fold, 6000);
    window.addEventListener('scroll', function () { if (window.scrollY > 240) { clearTimeout(tt); fold(); } }, { passive: true });
    btn.addEventListener('mouseenter', function () { tip.classList.remove('gone'); });
    fab.addEventListener('mouseleave', function () { if (pop.hidden) tip.classList.add('gone'); });
  }
})();

/* ---- Movimiento v5: carpeta, tarjetas, titulares, transiciones y galería ---- */
(function () {
  'use strict';
  var root = document.documentElement; root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Carpeta: abrir en dos tiempos (subir y abrir en abanico), cerrar rápido */
  var stage = document.getElementById('folderStage'), fbtn = document.getElementById('folderBtn'), hint = document.getElementById('folderHint');
  if (stage && fbtn) {
    var papers = $$('.paper', stage), label = fbtn.querySelector('.folder-label'), timer;
    var isOpen = function () { return stage.classList.contains('open') || stage.classList.contains('opening'); };
    var setOpen = function (open) {
      clearTimeout(timer);
      fbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = open ? T('Cerrar la carpeta') : T('Abrir la carpeta');
      if (hint) hint.textContent = open ? T('Elige un caso, o baja para verlos uno a uno ↓') : T('Pulsa la carpeta para ver los casos, o baja para verlos uno a uno ↓');
      papers.forEach(function (p) { if (open) p.removeAttribute('tabindex'); else p.setAttribute('tabindex', '-1'); p.style.removeProperty('--push'); });
      if (!open) { stage.classList.remove('open', 'opening'); return; }
      if (reduce) { stage.classList.add('open'); return; }
      stage.classList.remove('open'); stage.classList.add('opening');
      timer = setTimeout(function () { stage.classList.remove('opening'); stage.classList.add('open'); }, 130 + 75 * (papers.length - 1) + 1250 + 40);
    };
    setOpen(false);
    fbtn.addEventListener('click', function () { setOpen(!isOpen()); });
    var opened = false;
    var openOnce = function () { if (!opened) { opened = true; setTimeout(function () { setOpen(true); }, reduce ? 0 : 300); } };
    if ('IntersectionObserver' in window) {
      var fo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { fo.disconnect(); openOnce(); } }, { threshold: 0.55 });
      fo.observe(stage);
    } else setOpen(true);
    $$('a[href="#proyectos"]').forEach(function (a) { a.addEventListener('click', function () { setTimeout(openOnce, reduce ? 0 : 450); }); });
    if (!reduce) {
      /* Movimiento magnético: las hojas siguen un poco al cursor, cada una con su profundidad */
      stage.addEventListener('pointermove', function (e) {
        if (!fine.matches || !stage.classList.contains('open')) return;
        var r = stage.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
        papers.forEach(function (p, i) { var d = 4 + (i % 3) * 2; p.style.setProperty('--mgx', (mx * d) + 'px'); p.style.setProperty('--mgy', (my * d) + 'px'); });
      });
      stage.addEventListener('pointerleave', function () { papers.forEach(function (p) { p.style.removeProperty('--mgx'); p.style.removeProperty('--mgy'); }); });
      /* Al pasar por una hoja, las vecinas se apartan */
      papers.forEach(function (p, i) {
        p.addEventListener('pointerenter', function () {
          if (!fine.matches || !stage.classList.contains('open')) return;
          papers.forEach(function (q, j) { if (j !== i) q.style.setProperty('--push', (j < i ? -1 : 1) * (Math.abs(j - i) === 1 ? 16 : 7) + 'px'); });
        });
        p.addEventListener('pointerleave', function () { papers.forEach(function (q) { q.style.removeProperty('--push'); }); });
      });
    }
  }

  /* Relieve 3D contenido en tarjetas (brillo solo en las oscuras) */
  if (!reduce) $$('#projects .card, .case-nav a').forEach(function (el) {
    el.classList.add('tilt-on');
    el.addEventListener('pointermove', function (e) {
      if (!fine.matches) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--ry', ((x - 0.5) * 4) + 'deg'); el.style.setProperty('--rx', ((0.5 - y) * 3.5) + 'deg');
      el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* Botones magnéticos */
  if (!reduce) $$('.hero .cta-row .btn, .case-cta .btn, .c-link.primary').forEach(function (b) {
    b.classList.add('mag');
    b.addEventListener('pointermove', function (e) {
      if (!fine.matches) return;
      var r = b.getBoundingClientRect();
      b.classList.add('mag-live');
      b.style.setProperty('--tx', ((e.clientX - (r.left + r.width / 2)) * 0.2) + 'px');
      b.style.setProperty('--ty', ((e.clientY - (r.top + r.height / 2)) * 0.28) + 'px');
    });
    b.addEventListener('pointerleave', function () { b.classList.remove('mag-live'); b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); });
  });

  /* Titular de cada caso: entra palabra a palabra desde detrás de una máscara */
  var h = document.querySelector('.case-hero h1');
  if (h && !reduce) {
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            var wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++); wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h); h.classList.add('split-h');
  }

  /* Apariciones al hacer scroll: escalonado automático dentro de cada grupo */
  var groups = new Map();
  $$('.reveal').forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0;
    el.style.transitionDelay = Math.min(n, 5) * 70 + 'ms'; groups.set(p, n + 1);
  });

  /* Filtros: las tarjetas se deslizan a su sitio */
  var pcards = $$('#projects .card');
  pcards.forEach(function (c, k) { c.style.viewTransitionName = 'pcard-' + (k + 1); });
  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (reduce || !document.startViewTransition || btn.dataset.vt === '1') return;
      e.stopImmediatePropagation();
      btn.dataset.vt = '1';
      document.startViewTransition(function () { btn.click(); }).finished.then(function () { btn.dataset.vt = ''; }, function () { btn.dataset.vt = ''; });
    }, true);
  });

  /* Paso de la home a un caso: la portada pulsada se convierte en la cabecera del caso */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$=".html"]'); if (!a || reduce) return;
    var cp = a.closest('.camp'); var src = (a.closest('.paper') && a.closest('.paper').querySelector('.paper-img')) || (a.closest('.card') && a.closest('.card').querySelector('.media')) || (cp && (cp.classList.contains('open') ? cp.querySelector('.camp-det-img') : cp.querySelector('.camp-img')));
    if (!src) return;
    $$('[data-vt-cover]').forEach(function (n) { n.style.viewTransitionName = ''; n.removeAttribute('data-vt-cover'); });
    src.style.viewTransitionName = 'case-cover'; src.setAttribute('data-vt-cover', '');
  }, true);
  window.addEventListener('pageshow', function () { $$('[data-vt-cover]').forEach(function (n) { n.style.viewTransitionName = ''; n.removeAttribute('data-vt-cover'); }); });
})();

/* ---- v6 · Panel de campañas: lanzar cada caso y ver su resultado ---- */
(function () {
  'use strict';
  var panel = document.getElementById('campaigns'); if (!panel) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = Array.prototype.slice.call(panel.querySelectorAll('.camp'));
  var all = document.getElementById('campAll'), nOn = document.getElementById('campOn');
  var fmt = function (v, d) { return v.toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' }); };
  var count = function (b) {
    var v = parseFloat(b.dataset.v), d = +b.dataset.dec, suf = b.dataset.suf || '', pre = b.dataset.pre || '';
    if (reduce) { b.textContent = pre + fmt(v, d) + suf; return; }
    var t0 = performance.now(), dur = 1200;
    (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = pre + fmt(v * e, d) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
  };
  var sync = function () {
    var n = rows.filter(function (r) { return r.classList.contains('on'); }).length;
    nOn.textContent = n; panel.classList.toggle('has-on', n > 0);
    all.textContent = n === rows.length ? T('Pausar todas') : T('Lanzar todas');
  };
  var set = function (r, on) {
    if (r.classList.contains('on') === on) return;
    r.classList.toggle('on', on);
    var sw = r.querySelector('.camp-sw'), name = r.querySelector('.camp-name b').textContent;
    sw.setAttribute('aria-pressed', on ? 'true' : 'false');
    sw.querySelector('.sr-only').textContent = (on ? T('Pausar') : T('Lanzar')) + T(' la campaña ') + name;
    r.querySelector('.camp-st span').textContent = on ? T('En antena') : T('En pausa');
    if (on) count(r.querySelector('.camp-kpi b'));
    sync();
  };
  rows.forEach(function (r) { r.querySelector('.camp-sw').addEventListener('click', function () { set(r, !r.classList.contains('on')); }); });
  var cascade = function (on) { rows.forEach(function (r, i) { setTimeout(function () { set(r, on); }, reduce ? 0 : i * 180); }); };
  all.addEventListener('click', function () { cascade(rows.some(function (r) { return !r.classList.contains('on'); })); });
  /* Al llegar al panel por primera vez, las campañas se lanzan solas en cascada */
  var launched = false, launch = function () { if (!launched) { launched = true; setTimeout(function () { cascade(true); }, reduce ? 0 : 1100); } };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); launch(); } }, { threshold: 0.35 });
    io.observe(panel);
  } else launch();
})();


/* ---- v7 · Detalles del panel, filtros, embudo del método y cursor ---- */
(function () {
  'use strict';
  var $$ = function (q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Detalles desplegables de cada campaña */
  var toggle = function (li, open) {
    var btn = li.querySelector('.camp-more'), det = li.querySelector('.camp-det');
    if (!btn || !det) return;
    if (open === undefined) open = !li.classList.contains('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.querySelector('.t').textContent = open ? T('Cerrar') : T('Detalles');
    if (open) {
      det.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { li.classList.add('open'); }); });
    } else {
      li.classList.remove('open');
      setTimeout(function () { if (!li.classList.contains('open')) det.hidden = true; }, reduce ? 0 : 560);
    }
  };
  $$('.camp').forEach(function (li) {
    var b = li.querySelector('.camp-more'); if (b) b.addEventListener('click', function () { toggle(li); });
  });

  /* Filtros dentro de la barra del panel */
  var fl = $$('.cfilter'), rows = $$('.camp');
  fl.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      var run = function () {
        fl.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        rows.forEach(function (r) { r.classList.toggle('is-out', f !== 'all' && r.dataset.cat.split(' ').indexOf(f) < 0); });
      };
      if (!reduce && document.startViewTransition) {
        rows.forEach(function (r, k) { r.style.viewTransitionName = 'camp-' + k; });
        document.startViewTransition(run).finished.then(function () { rows.forEach(function (r) { r.style.viewTransitionName = ''; }); });
      } else run();
    });
  });

  /* Enlaces «Lo verás en»: llevan a la campaña, la abren y la lanzan */
  $$('[data-camp]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = document.getElementById('camp-' + a.dataset.camp); if (!li) return;
      e.preventDefault();
      fl.forEach(function (b) { if (b.dataset.filter === 'all' && b.getAttribute('aria-pressed') !== 'true') b.click(); });
      li.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () {
        if (!li.classList.contains('on')) li.querySelector('.camp-sw').click();
        if (!li.classList.contains('open')) toggle(li, true);
        li.querySelector('.camp-more').focus({ preventScroll: true });
      }, reduce ? 0 : 500);
    });
  });

  /* Embudo del método: los pasos se iluminan en orden */
  var funnel = document.getElementById('funnel');
  if (funnel) {
    var steps = $$('.step', funnel), fill = funnel.querySelector('.mfunnel-fill');
    var light = function () {
      steps.forEach(function (st, k) {
        setTimeout(function () { st.classList.add('lit'); if (fill) fill.style.setProperty('--p', k / (steps.length - 1)); }, reduce ? 0 : 250 + k * 420);
      });
    };
    if (reduce || !('IntersectionObserver' in window)) light();
    else {
      var fio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { fio.disconnect(); light(); } }, { threshold: 0.4 });
      fio.observe(funnel);
    }
  }

  /* Cursor propio: una C, con un anillo que reacciona a lo que tocas */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    document.documentElement.classList.add('c-cursor');
    var ring = document.createElement('div'); ring.className = 'cur-ring'; ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<span></span>'; document.body.appendChild(ring);
    var lab = ring.firstChild, x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    var loop = function () {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      raf = (Math.abs(x - rx) + Math.abs(y - ry) > 0.3) ? requestAnimationFrame(loop) : 0;
    };
    var labelFor = function (t) {
      if (t.closest('.camp-sw')) return t.closest('.camp').classList.contains('on') ? T('Pausar') : T('Lanzar');
      if (t.closest('.camp-more')) return t.closest('.camp').classList.contains('open') ? T('Cerrar') : T('Abrir');
      if (t.closest('.camp-img, .camp-det-img, .media, .zoom, .shot')) return T('Ver');
      if (t.closest('#campAll')) return T('Todas');
      return '';
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY; ring.classList.add('on');
      var t = e.target, l = t && t.closest ? labelFor(t) : '';
      lab.textContent = l; ring.classList.toggle('big', !!l);
      ring.classList.toggle('dark', !!(t.closest && t.closest('.stats, .camp-bar, .contact, footer, .card.dark, .inv')));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { ring.classList.remove('on'); });
    window.addEventListener('blur', function () { ring.classList.remove('on'); });
  }
})();

/* ---- v10 · Portadas que llegan, móvil de CIERZO y «hola» arrastrable ---- */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Las portadas del panel llegan desde los bordes antes de lanzarse */
  var panel = document.getElementById('campaigns');
  if (panel && !reduce && 'IntersectionObserver' in window && Element.prototype.animate) {
    var imgs = Array.prototype.slice.call(panel.querySelectorAll('.camp-img'));
    imgs.forEach(function (im) { im.style.opacity = '0'; });
    var pio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; pio.disconnect();
      var vw = window.innerWidth;
      imgs.forEach(function (im, i) {
        var r = im.getBoundingClientRect(), fromLeft = i % 2 === 0;
        var dx = fromLeft ? -(r.left + r.width + 40) : (vw - r.left + 40), dy = (i % 3 - 1) * 60, rot = fromLeft ? -18 : 18;
        im.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(1.3)', opacity: 0 },
                    { transform: 'translate(0,0) rotate(' + (rot / -6) + 'deg) scale(1.05)', opacity: 1, offset: .82 },
                    { transform: 'none', opacity: 1 }],
                   { duration: 900, delay: i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })
          .finished.then(function () { im.style.opacity = ''; });
        setTimeout(function () { im.style.opacity = ''; }, i * 90 + 30);
      });
    }, { threshold: 0.2 });
    pio.observe(panel);
  }

  /* El móvil de CIERZO pasa sus pantallas solo */
  Array.prototype.forEach.call(document.querySelectorAll('[data-cycle]'), function (ph) {
    var pics = ph.querySelectorAll('picture'); if (pics.length < 2) return;
    pics[0].classList.add('on'); var k = 0, timer = 0;
    var step = function () { pics[k].classList.remove('on'); k = (k + 1) % pics.length; pics[k].classList.add('on'); };
    if (reduce) return;
    var cio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { if (!timer) timer = setInterval(step, 2200); }
      else { clearInterval(timer); timer = 0; }
    });
    cio.observe(ph);
  });

  /* «hola.»: cada letra se puede arrastrar y vuelve a su sitio con un rebote */
  var bw = document.querySelector('.contact .big-word');
  if (bw && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var txt = bw.textContent; bw.textContent = '';
    txt.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'hl-l'; s.textContent = ch; bw.appendChild(s); });
    Array.prototype.forEach.call(bw.querySelectorAll('.hl-l'), function (l) {
      var sx = 0, sy = 0, dx = 0, dy = 0, on = false;
      l.addEventListener('pointerdown', function (e) { on = true; sx = e.clientX - dx; sy = e.clientY - dy; l.setPointerCapture(e.pointerId); l.classList.add('drag'); l.getAnimations().forEach(function (a) { a.cancel(); }); });
      l.addEventListener('pointermove', function (e) { if (!on) return; dx = e.clientX - sx; dy = e.clientY - sy; l.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (dx / 18) + 'deg)'; });
      var up = function () {
        if (!on) return; on = false; l.classList.remove('drag');
        var from = l.style.transform; l.style.transform = '';
        l.animate([{ transform: from }, { transform: 'none' }], { duration: 900, easing: 'linear(0, 0.25 9%, 0.87 22%, 1.1 30%, 1.04 40%, 0.98 52%, 1.005 70%, 1)' });
        dx = dy = 0;
      };
      l.addEventListener('pointerup', up); l.addEventListener('pointercancel', up);
    });
  }
})();

/* ---- v11 · El fondo toma el color de la marca y el móvil de CIERZO avanza con el scroll ---- */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* Fondo con el color de la marca en las secciones claras del caso (no en la cabecera) */
  if (body.hasAttribute('data-brand') && 'IntersectionObserver' in window) {
    var secs = Array.prototype.filter.call(document.querySelectorAll('main section, body > section'), function (s) {
      return !s.classList.contains('case-hero') && !s.classList.contains('band') && !s.classList.contains('contact');
    });
    var inView = new Set();
    var tio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) inView.add(e.target); else inView.delete(e.target); });
      body.classList.toggle('tinted', inView.size > 0);
    }, { rootMargin: '-45% 0px -45% 0px' });
    secs.forEach(function (s) { tio.observe(s); });
  }

  /* Pantallas de la app que avanzan según bajas */
  var ph = document.querySelector('[data-scrub]');
  if (ph) {
    var pics = ph.querySelectorAll('picture'), n = pics.length, cur = -1;
    var track = ph.closest('.scrub-track'), fig = ph.closest('.sc');
    var cnt = fig && fig.querySelector('.sc-count b'), bar = fig && fig.querySelector('.sc-prog');
    var show = function (k) {
      if (k === cur) return;
      if (cur >= 0) pics[cur].classList.remove('on');
      pics[k].classList.add('on'); cur = k;
      if (cnt) cnt.textContent = k + 1;
    };
    show(0);
    if (!reduce && track) {
      var ticking = false;
      var upd = function () {
        ticking = false;
        var r = track.getBoundingClientRect(), span = r.height - window.innerHeight;
        var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        show(Math.min(n - 1, Math.floor(p * n)));
        if (bar) bar.style.setProperty('--p', p.toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      window.addEventListener('resize', upd); upd();
    }
  }
})();
