/* Carlos Osuna · Portfolio — interacciones compartidas */
(function () {
  /* Reveal on scroll */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 })
    : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* Copy email buttons: <button data-copy="texto" data-copied="#id"> */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const txt = btn.dataset.copy, out = document.querySelector(btn.dataset.copied);
      try { await navigator.clipboard.writeText(txt); if (out) out.textContent = '✓ Email copiado. ¡Hablamos pronto!'; }
      catch { if (out) out.textContent = 'Escríbeme a ' + txt; }
      btn.animate && btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06) rotate(-2deg)' }, { transform: 'scale(1)' }], { duration: 350 });
      if (out) setTimeout(() => out.textContent = '', 3500);
    });
  });

  /* Lightbox: any container with [data-lightbox] */
  const groups = document.querySelectorAll('[data-lightbox]');
  if (groups.length) {
    const lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Cerrar">✕</button><button class="prev" aria-label="Anterior">←</button><button class="next" aria-label="Siguiente">→</button><span class="cap mono"></span>';
    document.body.appendChild(lb);
    const img = lb.querySelector('img'), cap = lb.querySelector('.cap');
    let list = [], i = 0;
    const show = () => { img.src = list[i].src; img.alt = list[i].alt; cap.textContent = (i + 1) + ' / ' + list.length + ' · ' + list[i].alt; };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
    groups.forEach(g => {
      const imgs = [...g.querySelectorAll('img')];
      imgs.forEach((im, k) => im.addEventListener('click', () => { list = imgs; i = k; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }));
    });
    lb.querySelector('.x').onclick = close;
    lb.querySelector('.prev').onclick = e => { e.stopPropagation(); i = (i - 1 + list.length) % list.length; show(); };
    lb.querySelector('.next').onclick = e => { e.stopPropagation(); i = (i + 1) % list.length; show(); };
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') lb.querySelector('.next').click();
      if (e.key === 'ArrowLeft') lb.querySelector('.prev').click();
    });
  }
})();
