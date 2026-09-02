/*
 * vectra-anim.js — capa de animación con GSAP + ScrollTrigger.
 * Progressive enhancement: si GSAP no carga, vectra.js usa el IntersectionObserver
 * y la transición CSS de [data-reveal]. Si el usuario pide menos movimiento
 * (prefers-reduced-motion), no se ejecuta nada y la CSS deja todo visible.
 */
(() => {
  const g = window.gsap;
  const ST = window.ScrollTrigger;

  // Respaldo si GSAP no cargó (CDN caído/lento): reveal con IntersectionObserver.
  if (!g || !ST) {
    const reveal = document.querySelectorAll('[data-reveal]');
    const obs = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        }), { threshold: 0.12 })
      : null;
    reveal.forEach((n) => (obs ? obs.observe(n) : n.classList.add('is-visible')));
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('has-gsap');
  g.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  const all = Array.from(document.querySelectorAll('[data-reveal]'));

  // ── Hero (solo landing): timeline de entrada al cargar ───────────────
  const hero = document.querySelector('.vc-hero');
  const heroReveals = hero ? Array.from(hero.querySelectorAll('[data-reveal]')) : [];
  if (hero) {
    const textCol = hero.querySelector('.vc-hero-grid > div');
    const visual = hero.querySelector('.vc-hero-visual');
    g.set(heroReveals, { opacity: 1, y: 0 });
    const tl = g.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
    if (textCol) {
      tl.from(textCol.children, { opacity: 0, y: 22, duration: 0.7, stagger: 0.09, clearProps: 'transform' }, 0);
    }
    if (visual) {
      tl.from(visual, { opacity: 0, scale: 0.94, duration: 0.9, clearProps: 'transform' }, 0.12);
      g.to(visual, {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  // ── Reveal AL HACER SCROLL (todo lo que no está en el hero) ──────────
  const rest = all.filter((el) => heroReveals.indexOf(el) === -1);
  // Ocultar de inmediato para que no haya flash antes de animar.
  g.set(rest, { opacity: 0, y: 28 });

  function setupScrollReveals() {
    // Agrupar por contenedor inmediato → escalona filas (cards, pasos…) de forma natural.
    const groups = new Map();
    rest.forEach((el) => {
      const key = el.parentElement || el;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    groups.forEach((els) => {
      ST.create({
        trigger: els[0],
        start: 'top 84%',
        once: true,
        onEnter: () => g.to(els, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.08,
          ease: 'power2.out', overwrite: true, clearProps: 'transform',
        }),
      });
    });
    ST.refresh();
  }

  // Esperar a que las fuentes carguen antes de medir posiciones: si no, el
  // layout provisional mete varias secciones "en pantalla" y se disparan todas
  // a la vez. Tope de 800 ms por si las fuentes no resuelven.
  let started = false;
  const start = () => { if (started) return; started = true; setupScrollReveals(); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    setTimeout(start, 800);
  } else {
    start();
  }
  window.addEventListener('load', () => ST.refresh());

  // ── Nav compacta al hacer scroll ────────────────────────────────────
  ST.create({
    start: 'top -48', end: 99999,
    toggleClass: { targets: '.vc-nav', className: 'is-scrolled' },
  });

  // ── Directorio: entrada escalonada de las tarjetas ──────────────────
  if (document.body.classList.contains('vc-page-explorer')) {
    const cards = document.querySelectorAll('.vc-result-card');
    if (cards.length) {
      g.from(cards, { opacity: 0, y: 12, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' });
    }
    const panel = document.querySelector('.vc-filter-panel');
    if (panel) g.from(panel, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out', clearProps: 'transform' });
  }

  // ── Red de seguridad acotada: rescata solo elementos visibles y atascados,
  //    sin adelantar los que deben aparecer al hacer scroll. ──────────
  setTimeout(() => {
    rest.forEach((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0;
      if (visible && parseFloat(getComputedStyle(el).opacity) < 0.05) {
        g.to(el, { opacity: 1, y: 0, duration: 0.3, clearProps: 'transform' });
      }
    });
  }, 6000);
})();
