(() => {
  const form = document.getElementById('vc-agendar');
  if (!form) return;
  const fecha = document.getElementById('vc-fecha');
  const hora = document.getElementById('vc-hora');
  const nota = document.getElementById('vc-hora-nota');
  const enviar = document.getElementById('vc-agendar-enviar');
  const url = form.dataset.horasUrl;
  const previa = hora.value;

  async function refrescar() {
    if (!fecha.value) {
      nota.textContent = 'Elige una fecha para ver las horas libres de este especialista.';
      return;
    }
    hora.disabled = true;
    nota.textContent = 'Buscando horas disponibles…';
    try {
      const r = await fetch(`${url}?fecha=${encodeURIComponent(fecha.value)}`);
      const data = await r.json();
      hora.innerHTML = '';
      if (data.error) {
        nota.textContent = data.error;
      } else if (!data.horas.length) {
        nota.textContent = 'Ese día no tiene horas libres. Prueba con otra fecha cercana.';
      } else {
        for (const h of data.horas) {
          const opt = document.createElement('option');
          opt.value = h;
          opt.textContent = h;
          if (h === previa) opt.selected = true;
          hora.appendChild(opt);
        }
        nota.textContent = data.horas.length + ' hora(s) disponible(s) para esa fecha.';
      }
    } catch (_) {
      nota.textContent = 'No se pudieron cargar las horas; el servidor validará tu elección al continuar.';
    } finally {
      const vacio = hora.options.length === 0;
      hora.disabled = vacio;
      if (enviar) enviar.disabled = vacio;
    }
  }

  fecha.addEventListener('change', refrescar);
  if (fecha.value) refrescar();
})();
