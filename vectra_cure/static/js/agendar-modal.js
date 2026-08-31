(() => {
  const modal = document.getElementById('agendar-modal');
  const disparadores = document.querySelectorAll('[data-agendar-id]');
  if (!modal || !disparadores.length) return;

  const form = document.getElementById('agendar-form');
  const fecha = document.getElementById('agendar-fecha');
  const hora = document.getElementById('agendar-hora');
  const nota = document.getElementById('agendar-hora-nota');
  const enviar = document.getElementById('agendar-enviar');
  const resumen = document.getElementById('agendar-resumen');
  const pagina = document.getElementById('agendar-pagina');
  let horasUrl = null;
  let disparador = null;

  async function refrescarHoras() {
    hora.innerHTML = '';
    if (!fecha.value || !horasUrl) {
      nota.textContent = 'Elige una fecha para ver las horas libres.';
      return;
    }
    hora.disabled = true;
    nota.textContent = 'Buscando horas disponibles…';
    try {
      const r = await fetch(`${horasUrl}?fecha=${encodeURIComponent(fecha.value)}`);
      const data = await r.json();
      if (data.error) {
        nota.textContent = data.error;
      } else if (!data.horas.length) {
        nota.textContent = 'Ese día no tiene horas libres. Prueba con otra fecha cercana.';
      } else {
        for (const h of data.horas) {
          const o = document.createElement('option');
          o.value = h;
          o.textContent = h;
          hora.appendChild(o);
        }
        nota.textContent = data.horas.length + ' hora(s) disponible(s) para esa fecha.';
      }
    } catch (_) {
      nota.textContent = 'No se pudieron cargar las horas; el servidor validará tu elección al continuar.';
    }
    const vacio = hora.options.length === 0;
    hora.disabled = vacio;
    enviar.disabled = vacio;
  }

  function abrir(el) {
    const d = el.dataset;
    disparador = el;
    form.action = '/agendar/' + d.agendarId;
    horasUrl = '/agendar/' + d.agendarId + '/horas';
    pagina.href = '/agendar/' + d.agendarId;
    resumen.textContent = d.agendarNombre + ' · ' + d.agendarEspecialidad
      + ' · consulta aprox. $' + d.agendarPrecio;
    fecha.value = '';
    hora.innerHTML = '';
    enviar.disabled = false;
    nota.textContent = 'Elige una fecha para ver las horas libres.';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    fecha.focus();
  }

  function cerrar() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (disparador) disparador.focus();
  }

  fecha.addEventListener('change', refrescarHoras);
  disparadores.forEach((el) => el.addEventListener('click', (ev) => { ev.preventDefault(); abrir(el); }));
  modal.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', cerrar));
  modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.classList.contains('is-open')) cerrar();
  });
})();
