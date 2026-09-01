(() => {
  // ── Panel lateral plegable (hamburguesa, solo escritorio) ────────────
  const explorer = document.querySelector('.vc-explorer');
  const toggle = document.querySelector('.vc-drawer-toggle');
  if (explorer && toggle) {
    const KEY = 'vc-drawer-collapsed';
    const apply = (collapsed, persist) => {
      explorer.classList.toggle('drawer-collapsed', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? 'Mostrar el panel de búsqueda' : 'Ocultar el panel de búsqueda');
      if (persist) { try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch (e) {} }
      // Leaflet se redibuja al detectar un resize de ventana.
      setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
    };
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored === '1') apply(true, false);
    toggle.addEventListener('click', () => apply(!explorer.classList.contains('drawer-collapsed'), true));
  }

  const form = document.getElementById('vc-filtros');
  if (!form) return;
  const latIn = document.getElementById('vc-lat');
  const lngIn = document.getElementById('vc-lng');
  const nota = document.getElementById('vc-zona-nota');

  function pedirUbicacion(btn) {
    if (!navigator.geolocation) {
      if (nota) nota.textContent = 'Tu navegador no permite compartir ubicación; cambia la zona en el filtro.';
      return;
    }
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Buscando tu ubicación…'; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latIn.value = pos.coords.latitude.toFixed(6);
        lngIn.value = pos.coords.longitude.toFixed(6);
        form.submit();
      },
      () => {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        if (nota) nota.textContent = 'No pudimos usar tu ubicación. Seguimos con la zona elegida; puedes cambiarla en el filtro.';
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  document.getElementById('vc-usar-ubicacion')?.addEventListener('click', (e) => pedirUbicacion(e.currentTarget));
  document.getElementById('vc-usar-ubicacion-vacio')?.addEventListener('click', (e) => pedirUbicacion(e.currentTarget));

  form.querySelector('[name="zona"]')?.addEventListener('change', () => {
    if (latIn) latIn.value = '';
    if (lngIn) lngIn.value = '';
  });
})();
