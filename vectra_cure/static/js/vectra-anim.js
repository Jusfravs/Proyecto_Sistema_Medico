/*
 * vectra-anim.js — capa de animación con GSAP + ScrollTrigger.
 * Progressive enhancement: si GSAP no carga, vectra.js usa el IntersectionObserver
 * y la transición CSS de [data-reveal]. Si el usuario pide menos movimiento
 * (prefers-reduced-motion), no se ejecuta nada y la CSS deja todo visible.
 */
(() => {
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  if (!g || !ST) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('has-gsap');
  g.registerPlugin(ST);

  const all = Array.from(document.querySelectorAll('[data-reveal]'));
  g.set(all, { opacity: 0, y: 16 });

  // ── Hero (solo landing) ──────────────────────────────────────────────
  const hero = document.querySelector('.vc-hero');
  const heroReveals = hero ? Array.from(hero.querySelectorAll('[data-reveal]')) : [];

  if (hero) {
    const textCol = hero.querySelector('.vc-hero-grid > div');
    const visual = hero.querySelector('.vc-hero-visual');
    g.set(heroReveals, { opacity: 1, y: 0 });

    const tl = g.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
    if (textCol) {
      tl.from(textCol.children, {
        opacity: 0, y: 22, duration: 0.7, stagger: 0.09, clearProps: 'transform',
      }, 0);
    }
    if (visual) {
      tl.from(visual, { opacity: 0, scale: 0.94, duration: 0.9, clearProps: 'transform' }, 0.12);
      g.to(visual, {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  // ── Reveal por lotes con stagger ─────────────────────────────────────
  const rest = all.filter((el) => heroReveals.indexOf(el) === -1);
  if (rest.length) {
    ST.batch(rest, {
      start: 'top 87%',
      onEnter: (batch) => g.to(batch, {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.08,
        ease: 'power2.out', overwrite: true, clearProps: 'transform',
      }),
    });
  }

  // ── Nav compacta al hacer scroll ────────────────────────────────────
  ST.create({
    start: 'top -48', end: 99999,
    toggleClass: { targets: '.vc-nav', className: 'is-scrolled' },
  });

  // ── Directorio: entrada escalonada de las tarjetas ──────────────────
  if (document.body.classList.contains('vc-page-explorer')) {
    const cards = document.querySelectorAll('.vc-result-card');
    if (cards.length) {
      g.from(cards, {
        opacity: 0, y: 12, duration: 0.45, stagger: 0.05,
        ease: 'power2.out', clearProps: 'transform',
      });
    }
    const drawerFilter = document.querySelector('.vc-drawer .vc-filter, .vc-drawer form');
    if (drawerFilter) g.from(drawerFilter, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' });
  }

  // Recalcular posiciones cuando terminen de cargar imágenes / el mapa.
  window.addEventListener('load', () => ST.refresh());

  // Red de seguridad: nada debe quedar invisible.
  setTimeout(() => g.set(rest, { opacity: 1, y: 0 }), 4000);
})();
