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
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
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
  function closeMenu() { if (!navLinks) return; navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menú'); }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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
    if (heroImg && !reduce && y < innerHeight) heroImg.style.transform = 'translateY(' + (y * 0.08) + 'px)';
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
  function fmt(v, dec) { return v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
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
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(function () { showToast('✓ Email copiado: ' + v); }, function () { location.href = 'mailto:' + v; });
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
      });
    }).catch(function () {});
  }

  /* ---- Lightbox para galerías ---- */
  var groups = $$('[data-lightbox]');
  if (groups.length) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', 'Imagen ampliada');
    dlg.innerHTML = '<img alt=""><p></p>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Cerrar">✕</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Anterior">←</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Siguiente">→</button>';
    document.body.appendChild(dlg);
    var img = $('img', dlg), cap = $('p', dlg), list = [], idx = 0;
    function show(i) {
      idx = (i + list.length) % list.length;
      var b = list[idx], im = $('img', b);
      img.src = b.dataset.full || im.currentSrc || im.src; img.alt = im.alt;
      var fc = b.closest('figure') && $('figcaption', b.closest('figure'));
      cap.textContent = fc ? fc.textContent.replace(/\s+/g, ' ').trim() : im.alt;
    }
    groups.forEach(function (g) {
      var btns = $$('button[data-full]', g);
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          list = btns; show(i);
          if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
        });
      });
    });
    $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    $('.lb-prev', dlg).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    document.addEventListener('keydown', function (e) {
      if (!dlg.open) return;
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
})();

/* Burbuja ESIC: abrir / cerrar el aviso */
(function () {
  var fab = document.getElementById('esicFab'); if (!fab) return;
  var pop = document.getElementById('esicPop'), btn = fab.querySelector('.esic-btn'), tip = fab.querySelector('.esic-tip'), close = fab.querySelector('.esic-pop__close'), dot = fab.querySelector('.esic-btn__dot');
  function set(open) {
    pop.hidden = !open; btn.setAttribute('aria-expanded', open);
    if (tip) tip.hidden = open;
    if (open) { if (dot) dot.remove(); dot = null; close.focus(); }
  }
  btn.addEventListener('click', function () { set(pop.hidden); });
  if (tip) tip.addEventListener('click', function () { set(true); });
  close.addEventListener('click', function () { set(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!pop.hidden && !fab.contains(e.target)) set(false); });
})();

/* ---- Movimiento v4: carpeta, relieve 3D, botones magnéticos, titulares y filtros animados ---- */
(function () {
  'use strict';
  var root = document.documentElement; root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Carpeta de proyectos */
  var stage = document.getElementById('folderStage'), fbtn = document.getElementById('folderBtn'), hint = document.getElementById('folderHint');
  if (stage && fbtn) {
    var papers = $$('.paper', stage);
    var setOpen = function (open) {
      stage.classList.toggle('open', open);
      fbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      fbtn.querySelector('.folder-label').textContent = open ? 'Cerrar la carpeta' : 'Abrir la carpeta';
      if (hint) hint.textContent = open ? 'Elige un caso' : 'Pulsa la carpeta';
      papers.forEach(function (p) { if (open) p.removeAttribute('tabindex'); else p.setAttribute('tabindex', '-1'); });
    };
    setOpen(false);
    fbtn.addEventListener('click', function () { setOpen(!stage.classList.contains('open')); });
    var opened = false;
    var openOnce = function () { if (!opened) { opened = true; setTimeout(function () { setOpen(true); }, reduce ? 0 : 350); } };
    if ('IntersectionObserver' in window) {
      var fo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { fo.disconnect(); openOnce(); } }, { threshold: 0.6 });
      fo.observe(stage);
    } else setOpen(true);
    $$('a[href="#proyectos"]').forEach(function (a) { a.addEventListener('click', function () { setTimeout(openOnce, reduce ? 0 : 500); }); });
  }

  /* Relieve 3D que sigue al cursor */
  if (!reduce) $$('#projects .card, .case-nav a').forEach(function (el) {
    el.classList.add('tilt-on');
    el.addEventListener('pointermove', function (e) {
      if (!fine.matches) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--ry', ((x - 0.5) * 7) + 'deg'); el.style.setProperty('--rx', ((0.5 - y) * 6) + 'deg');
      el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* Botones magnéticos (llamadas a la acción principales) */
  if (!reduce) $$('.hero .cta-row .btn, .case-cta .btn, .c-link.primary').forEach(function (b) {
    b.classList.add('mag');
    b.addEventListener('pointermove', function (e) {
      if (!fine.matches) return;
      var r = b.getBoundingClientRect();
      b.classList.add('mag-live');
      b.style.setProperty('--tx', ((e.clientX - (r.left + r.width / 2)) * 0.22) + 'px');
      b.style.setProperty('--ty', ((e.clientY - (r.top + r.height / 2)) * 0.3) + 'px');
    });
    b.addEventListener('pointerleave', function () { b.classList.remove('mag-live'); b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); });
  });

  /* Titular de cada caso: entra letra a letra (el lector de pantalla lee la frase completa) */
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
            for (var k = 0; k < part.length; k++) { var c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i++); c.textContent = part[k]; w.appendChild(c); }
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h); h.classList.add('split-h');
  }

  /* Filtros de proyectos: las tarjetas se deslizan a su sitio (View Transitions) */
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
})();
