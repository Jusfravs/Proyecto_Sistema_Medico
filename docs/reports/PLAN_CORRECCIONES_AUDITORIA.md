# Plan de correcciones — auditorías de diseño y técnica

**Fecha:** 1 de septiembre de 2026
**Insumos:** `DESIGN-IS-2026-09-01/` (auditoría Rams, veredicto **REDESIGN 13/30**),
`docs/reports/REVISION_TECNICA_CODIGO_Y_BD.md` (6 altas · 15 medias · 1 baja),
reporte de bugs reportados por el equipo.

Este documento consolida todo en **un solo backlog priorizado** y registra qué
se corrigió ya en esta iteración y qué queda pendiente, con su razón.

---

## 1. Corregido en esta iteración

Cambios de bajo riesgo, contenidos en archivos ya intervenidos. La suite
`unittest` sigue en **20/20**. Verificado con capturas en escritorio (1440×900),
viewport corto (1366×625) y móvil (390–430 px).

| # | Cambio | Archivo(s) | Origen |
|---|---|---|---|
| B1 | **Cards de la landing recuperan animación y `:hover`.** El reveal usaba `transform: none` en `.is-visible`, que —con igual especificidad y más abajo en el archivo— anulaba los `transform` de `:hover` y del escalonado `nth-child`. Ahora el reveal anima con la propiedad `translate:` y no colisiona. | `static/css/vectra.css` | Bug equipo |
| B2 | **El mapa ya no genera scroll vertical.** `.vc-explorer` tenía `height: calc(100vh - 76px)` + `min-height: 660px`; en pantallas de menos de ~740 px de alto el `min-height` desbordaba la ventana. Ahora `100dvh`, `min-height: 0`, `overflow: hidden` en `.vc-explorer` y `.vc-map`. | `static/css/vectra.css` | Bug equipo |
| B3 | **El modal "Agendar" ya no queda tapado por el mapa.** `.vc-modal` estaba en `z-index: 100`; los controles de Leaflet llegan a `z-index: 1000`. Ahora `.vc-modal` está en `z-index: 1100` y `.vc-map` usa `isolation: isolate` para encerrar el apilamiento de Leaflet. Verificado: el modal se abre por encima del mapa y sus marcadores. | `static/css/vectra.css` | Bug equipo |
| D1 | **Móvil: filtros y resultados antes que el mapa.** Se quitó `grid-row: 1` de `.vc-map` en móvil y se bajó su alto (`48vh` → `42vh`). | `static/css/vectra.css` | DESIGN-IS mov. #1 |
| D2 | **Contraste AA.** `--muted` `#667b83` (4.44:1) → `#5f7377` (≈4.9:1). Foco global: de `rgba(39,110,241,.35)` (~1.6:1) a `var(--blue-dark)` sólido (≥3:1), con anillo blanco interior en los botones llenos. | `static/css/vectra.css` | DESIGN-IS §Accesibilidad |
| D3 | **CSS muerto eliminado.** `.vc-orbit`, `.vc-map-shape`, `.vc-pin*`, `.vc-doctor-cover*` (sin uso en ninguna plantilla). | `static/css/vectra.css` | DESIGN-IS §Rendimiento |
| D4 | **Imágenes de tarjetas de especialista con `loading="lazy"` + `decoding="async"`.** | `templates/index.html` | DESIGN-IS mov. #5 |
| SEC-02 | **XSS DOM en el popup del mapa (severidad ALTA).** `mapa.js` concatenaba `profile.name` / `profile.specialty` como HTML en `bindPopup`. Ahora el popup se construye con nodos DOM y `textContent`; los datos del especialista nunca se interpretan como HTML. | `static/js/mapa.js` | REVISIÓN TÉCNICA |
| A11Y | **Labels programáticos** (`aria-label`) en los filtros del directorio (buscar, especialidad, orden). **`aria-live="polite"`** en las notas de zona y de horas disponibles. | `templates/directorio.html`, `base.html`, `agendar.html` | DESIGN-IS mov. #3 / UX-01 |

### Adicional — 24 especialistas en el polígono de Quito

- **`scripts/generar_especialistas_zona.py`** — generador determinista (semilla
  fija). Polígono: **Miraflores → La Vicentina → P. M. Guangüiltagua →
  P. E. Rumipamba**. Muestreo en rejilla con *jitter* + *point-in-polygon*
  (ray casting): cobertura uniforme, sin huecos ni grumos. Parámetro `--n`
  (mínimo 20).
- **`database/05_seed_zona_centro_norte_postgresql.sql`** — salida del
  generador, **aditiva e idempotente** (`ON CONFLICT … DO UPDATE`), mismo
  estilo que `02_seed_demo`. Inserta cuentas `medico.zn00…zn23@vectra.demo`
  (contraseña demo `medico123`), perfiles con geolocalización dentro del
  polígono, disponibilidad estándar, 2–4 reseñas por perfil y recálculo de
  rating. **Ya aplicada a la base local** (`perfiles_medicos`: 8 → 32).
- **`constantes.py`** — nueva zona de referencia `floresta_parques`
  ("La Floresta – La Vicentina (parques)") en el centroide del polígono, para
  que el directorio muestre a los 24 dentro de un radio corto.

> Para regenerar con otro número: `python scripts/generar_especialistas_zona.py --n 30`
> y volver a ejecutar el `.sql` en pgAdmin (es idempotente).

---

## 2. Pendiente — orden recomendado

### Fase A — Antes de exponer a usuarios reales (crítico)

De la revisión técnica; ninguno tocado aún porque implican lógica de
`app.py` / `config.py` / `scripts/` y necesitan sus propias pruebas.

| ID | Hallazgo | Corrección resumida | Esfuerzo |
|---|---|---|---|
| **SEC-01** | CSRF ausente en todos los `POST` | `Flask-WTF` / `CSRFProtect` global + token en formularios y AJAX | M |
| **SEC-03** | Cuenta desactivada conserva sesión y permisos | Revalidar `usuario.activo` en el cargador de sesión y en `rol_requerido`; invalidar sesión si es falso | S |
| **SEC-04** | `SECRET_KEY` con valor de respaldo público | Fallar al arrancar (fuera de tests) si falta, es de baja entropía o coincide con el ejemplo | S |
| **NEG-01** | Se puede reservar con un médico inactivo | Reconsultar el perfil dentro de la transacción de reserva y exigir `activo` | S |
| **DB-01** | El migrador escribe antes de validar el destino | Separar *preflight* (versión, tablas, tipos, índices, constraints) de la aplicación transaccional | M |

**Además:** añadir una prueba por cada corrección (SEC-01 sin token → 403;
SEC-03 sesión revocada → rechazo; NEG-01 médico inactivo → sin registro).

### Fase B — Siguiente iteración funcional

| ID | Hallazgo | Nota |
|---|---|---|
| NEG-02 | Reseñas ilimitadas y sin cita atendida | Vincular reseña ↔ cita `COMPLETADA`; unicidad por par paciente-médico o por cita |
| NEG-03 | Se acepta una hora ya pasada de hoy | Comparar `datetime` (fecha+hora) con reloj de negocio + antelación mínima; reloj inyectable en tests |
| NEG-04 | Transiciones de cita / reembolso sin regla única | Máquina de estados explícita + política de reembolso con *idempotency key* |
| APP-01 | Vista de cita inaccesible para administración | Vista de detalle admin con RBAC propio (hoy usa la ruta de paciente) |
| VAL-01 | Validaciones de longitud dispersas | Límites de dominio únicos en validadores + `CHECK` en BD |
| DB-02 | `--check` no valida índices ni constraints | Comparar contra manifiesto del esquema (`information_schema`, `pg_constraint`, `pg_indexes`) |
| DB-03 | `--fresh` no hace lo que dice la guía | Unificar semántica (destructivo con confirmación **o** renombrar) y corregir la guía |
| DB-04 | Tipos e integridad dependientes de la app | `TIME`/`timestamptz` en vez de `CHAR(5)`; trigger de `fecha_actualizacion`; agregados de reseña por vista/consulta |

### Fase C — Endurecimiento y operación

| ID | Hallazgo | Nota |
|---|---|---|
| SEC-05 | Cargas validadas solo por extensión | Verificar firma/MIME, renombrar por servidor, servir desde origen no ejecutable |
| SEC-06 | Sin *rate limiting* ni política de contraseñas | Límite por IP/cuenta con respuesta uniforme; longitud mínima + bloqueo de claves filtradas; no enumerar correos |
| SEC-07 | Cookies y cabeceras sin endurecer | `SESSION_COOKIE_HTTPONLY/SECURE/SAMESITE`, HSTS en prod, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`, CSP compatible con Leaflet/Fonts/OSRM |
| OPS-01 | Se registran datos personales al crear cita | Loguear solo identificadores técnicos; enmascarar; retención y acceso |
| OPS-02 | Dependencias sin *lockfile*; conflictos en Python 3.14 | Declarar versión soportada, acotar/fijar versiones, *lockfile*, no promover 3.14 hasta que haya *wheels* |
| QA-01 | Cobertura no cubre los riesgos principales | Pirámide de pruebas (dominio, integración PostgreSQL, seguridad con cliente Flask, E2E mínimo) + CI con `compileall`, linter, tests, cobertura |
| DOC-01 | README / FLUJO / MANUAL con conteos y Bootstrap obsoletos | Actualizar desde fuente de verdad y fechar; revisar en el mismo PR que cambie arquitectura |

### Fase D — Rediseño (DESIGN-IS: veredicto REDESIGN 13/30)

El veredicto pide **rediseño**, no retoques, en la tarea primaria
(comparar y reservar). Necesita su propio plan (`/make-plan` con el
`DESIGN-IS-2026-09-01/04-handoff-prompt.md`). Movimientos:

1. **#2 Útil** — cada resultado del directorio es una tarjeta/enlace completa
   y operable (hoy solo se abre el perfil pulsando un pin del mapa). En móvil,
   filtros y lista **antes** del mapa (paso D1 ya adelanta el orden; falta la
   tarjeta-enlace).
2. **#6 Honesto** — "Perfil verificado" se asigna sin revisión (`verificado=True`
   al registrar); "Atiende esta semana" es texto fijo; el ticket dice que
   notificó por WhatsApp/correo pero solo hay una notificación simulada;
   rating 5.0 sin reseñas. Ajustar cada etiqueta a lo que el sistema hace.
3. **#4 Comprensible** — labels (parcial en D2/A11Y), anunciar cambios
   dinámicos (parcial), menú móvil que saca los enlaces del orden de
   tabulación cuando está cerrado.
4. **#10 Menos diseño** — **una sola** superficie de reserva (hoy hay página
   `agendar.html` **y** modal `#agendar-modal` con lógica duplicada en
   `agendar.js` + `agendar-modal.js`).
5. **#9 Ambiental** — `static/img/referencial/consulta-clinica-vectra.png`
   pesa **1.86 MB** (fondo de `.vc-final`). Recomprimir/redimensionar y pasar
   a WebP; el entorno actual no tiene ImageMagick/Pillow/cwebp, así que queda
   como tarea con herramienta.

### Otros detectados fuera de los informes

- **Desbordamiento horizontal en `/directorio` en móvil** (~≤430 px): los
  inputs de filtro sobresalen del viewport. Preexistente. Revisar el
  `minmax`/`min-width` de la rejilla y el `padding` del drawer.
- **`agendar.html`** referencia `bloques` en un bucle Jinja pero la ruta no
  pasa esa variable (render vacío silencioso). Cosmético; revisar al unificar
  la reserva (#10).

---

## 3. Estado por archivo tocado en esta iteración

```
vectra_cure/static/css/vectra.css      B1 B2 B3 D1 D2 D3
vectra_cure/static/js/mapa.js          SEC-02
vectra_cure/templates/index.html       D4
vectra_cure/templates/directorio.html  A11Y
vectra_cure/templates/base.html        A11Y
vectra_cure/templates/agendar.html     A11Y
vectra_cure/constantes.py              nueva zona floresta_parques
scripts/generar_especialistas_zona.py  nuevo
database/05_seed_zona_centro_norte_postgresql.sql  nuevo (aplicado a la base local)
```
