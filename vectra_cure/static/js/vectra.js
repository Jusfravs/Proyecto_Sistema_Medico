(() => {
  const body = document.body;
  let lastTrigger = null;
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => trigger.addEventListener('click', () => {
    const modal = document.getElementById(trigger.dataset.modalOpen); if (!modal) return;
    lastTrigger = trigger; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden';
    modal.querySelector('input, button, [href]')?.focus();
  }));
  document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.vc-modal'))));
  document.querySelectorAll('.vc-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal(document.querySelector('.vc-modal.is-open'));
    const modal = document.querySelector('.vc-modal.is-open');
    if (event.key === 'Tab' && modal) {
      const focusable = [...modal.querySelectorAll('button,[href],input,select,textarea')].filter((e) => !e.disabled);
      if (!focusable.length) return;
      const i = focusable.indexOf(document.activeElement);
      if (event.shiftKey && i <= 0) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && i === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  document.querySelector('.vc-menu-toggle')?.addEventListener('click', (event) => {
    const links = document.querySelector('.vc-nav-links'); const open = links.classList.toggle('is-open'); event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  // El reveal por scroll de [data-reveal] lo maneja vectra-anim.js
  // (con GSAP, o con un IntersectionObserver de respaldo si GSAP no carga).
  document.querySelectorAll('[data-result-card]').forEach((card) => card.addEventListener('click', (event) => {
    if (event.target.closest('a,button')) return;
    const already = card.classList.contains('is-expanded'); document.querySelectorAll('[data-result-card]').forEach((item) => item.classList.remove('is-expanded'));
    if (!already) card.classList.add('is-expanded');
  }));
})();
