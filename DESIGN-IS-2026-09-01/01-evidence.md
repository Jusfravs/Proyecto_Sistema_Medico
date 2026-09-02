# Evidencia consolidada

## Ejecución e interacción real

- Se levantó `vectra_cure/app.py` en `http://127.0.0.1:5000` y se recorrieron landing, menú móvil, scroll, directorio, mapa, ficha, login de paciente demo y primer paso de reserva. No se creó, pagó ni canceló una cita.
- En escritorio, el directorio separa filtros/lista a la izquierda y mapa a la derecha. Para abrir una ficha se tuvo que pulsar un marcador: las tarjetas de resultados no son enlaces ni controles operables.
- En móvil (`390 × 844`, viewport efectivo 375 px), el mapa mide 375 × 405 px y aparece antes de filtros y resultados. No hubo desbordamiento horizontal, pero el objetivo principal (filtrar y comparar) queda después de un bloque de mapa de gran altura.
- El menú móvil abre correctamente y anuncia `aria-expanded`; sin embargo, los enlaces ocultos del menú permanecen en el orden de tabulación cuando el menú está cerrado (medición DOM: rectángulos 0 × 0 para esos enlaces).
- En una sesión de especialista, la CTA pública “Agendar cita rápida” lleva a la landing con el flash “No tienes permisos para acceder a esa página.” No ofrece alternativa ni explica que es una acción para pacientes.

## Estructura, interacción y accesibilidad

- La app usa Flask + Jinja; el cascarón ofrece skip link, `nav`, `main`, footer y flashes con `role="status"`. `vectra_cure/templates/base.html:12-30`.
- Inventario fuente: 149 controles declarados en 23 plantillas (52 enlaces, 29 botones, 55 inputs, 11 selects y 2 textareas); los bucles Jinja hacen que el total real cambie según datos/rol. Profundidad máxima estimada: 14 niveles. `vectra_cure/templates/**/*.html`.
- Las tarjetas del directorio son `<article>` clicables sin `tabindex`, `role="button"` ni listener de teclado; sus acciones están ocultas hasta el clic. `templates/directorio.html:40-43`, `static/css/vectra.css:95`, `static/js/vectra.js:34-38`.
- Los filtros “Nombre o consultorio”, especialidad y orden no tienen etiqueta programática; zona y radio sí. `templates/directorio.html:16-31`.
- Los cambios de ubicación y de horas no se anuncian con `aria-live`. `templates/directorio.html:13-15`, `templates/agendar.html:21`, `static/js/directorio.js:8-25`, `static/js/agendar.js:11-42`.
- Hay manejo correcto de Escape, retorno de foco y ciclo Tab en modales globales; el modal de reserva duplica el flujo de página. `templates/base.html:26`, `static/js/vectra.js:4-27`, `templates/agendar.html:6-35`, `static/js/agendar-modal.js:1-80`.
- Contraste calculado: tinta `#112530`/blanco 15.78:1; azul `#276EF1`/blanco 4.58:1; texto secundario `#667B83`/blanco 4.44:1 (no alcanza AA normal); foco global compuesto ~1.62:1 (no alcanza 3:1). Los inputs aplican además borde azul 4.58:1. `static/css/vectra.css:1-14,44-47,95`.
- La app respeta `prefers-reduced-motion`; no ofrece tema oscuro. `static/css/vectra.css:102-108`.

## Copy, confianza y estados

- Pago y reverso se identifican como simulados, sin transferencia de dinero real: fortaleza de honestidad. `templates/pago.html:7-25`, `templates/cancelar_cita.html:9-10`.
- “Perfil verificado” se publica aunque el registro crea el perfil con `verificado=True`, sin revisión documental. `templates/registro.html:31-56`, `app.py:255-280`.
- “Especialistas recomendados” se ordena por rating y un perfil sin reseñas arranca en 5.0; “Atiende esta semana” es texto fijo. `templates/index.html:21`, `app.py:155-161`, `logica.py:225-238`.
- “Notificación enviada” y el ticket dicen que se notificó por teléfono/correo/WhatsApp, pero el sistema solo registra una notificación simulada. `templates/cita_exito.html:9`, `app.py:471-473`, `logica.py:199`.
- Las reseñas no se vinculan a una cita y pueden ser editadas por administración, pese al título “Reseñas de pacientes”. `templates/especialista.html:49-57`, `models.py:225-247`, `app.py:778-792`.
- Existen estados de vacío, carga, error y éxito para directorio, disponibilidad, reserva y cancelación; faltan páginas explícitas 403/404. `templates/directorio.html:45-53`, `static/js/agendar.js:16-42`, `templates/error_base_datos.html:18-20`.

## Rendimiento y fricción

- Portada estimada: 2,066,292 B de CSS/JS/imágenes locales sin HTML, fuentes ni cabeceras; el fondo PNG supone 1,859,461 B. Las imágenes no son lazy. `templates/index.html:12,21`, `static/css/vectra.css:92`.
- La portada usa JS propio pequeño (2,756 B), pero carga Google Fonts y cinco PNG. El directorio suma Leaflet/CDN, teselas OSM y ruta OSRM bajo demanda. `templates/base.html:6-8,28`, `templates/directorio.html:5-7,59-68`, `static/js/mapa.js:4-23`.
- Hay dos tarjetas flotantes con animación continua al inicio. Se reduce con `prefers-reduced-motion`. `templates/index.html:13-14`, `static/css/vectra.css:76-77,102-108`.
- Cuatro familias CSS no se usan: `.vc-orbit`, `.vc-map-shape`, `.vc-pin` y `.vc-doctor-cover`. `static/css/vectra.css:68-75,88`.

## Verificación funcional

- `python -m unittest discover -s tests -v`: **20 pruebas aprobadas**. La traza de “no such table” pertenece a la prueba intencionada de manejo de esquema faltante y terminó en `ok`.
