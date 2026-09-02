# Auditoría UX/UI de Vectra Cure

**Fecha:** 1 de septiembre de 2026  
**Alcance:** landing, navegación, responsive, directorio, mapa, ficha, autenticación y primer paso de reserva.  
**Método:** inspección de código y prueba interactiva en `http://127.0.0.1:5000`; se usó una cuenta demo de paciente, sin crear, pagar ni cancelar citas. Las pruebas automatizadas finalizaron con **20/20 OK**.

## Resumen ejecutivo

Vectra Cure tiene una base visual atractiva y una funcionalidad de reserva que valida horarios. Sin embargo, hoy la experiencia se apoya demasiado en el mapa, no permite abrir los resultados de forma accesible desde sus tarjetas y comunica garantías que el sistema no está realizando. Para una plataforma médica, esos tres puntos pesan más que el estilo: afectan encontrabilidad, inclusión y confianza.

**Se recomienda rediseño del directorio y del flujo de acceso a reserva, no solo ajustes cosméticos.** La puntuación complementaria de principios de Dieter Rams fue **13/30**; su desglose está en `DESIGN-IS-2026-09-01/02-scorecard.md`.

## Problemas priorizados y cómo resolverlos

| Prioridad | Problema comprobado | Impacto | Cómo solventarlo | Verificación de salida |
| --- | --- | --- | --- | --- |
| Crítica | Las tarjetas de resultados son `<article>` clicables solo con ratón; no son enlaces ni se enfocan con teclado. | Pacientes de teclado/lector de pantalla no pueden abrir perfiles desde la lista. El mapa queda como única vía efectiva. | Hacer toda la tarjeta un `<a href="/especialista/<id>">` o añadir botones visibles “Ver perfil” y “Reservar”; eliminar el patrón de expandir al clic. | Tab llega a cada tarjeta; Enter abre la ficha; lector anuncia nombre, especialidad, distancia y destino. |
| Crítica | En móvil el mapa aparece antes de filtros y resultados y ocupa 405 px de alto en un viewport de 844 px. | La tarea principal es comparar; el usuario debe desplazarse mucho antes de filtrar o ver médicos. | En móvil: filtros y lista primero; mapa como pestaña/botón “Ver mapa” o bloque plegable después de resultados. Mantener el mapa al lado en escritorio. | A 375 px se puede filtrar y abrir el primer perfil sin hacer scroll por un mapa. |
| Crítica | “Verificado”, “recomendados”, “reseñas de pacientes” y “notificación enviada” no siempre describen la realidad implementada. | En salud, las señales de confianza alteran decisiones. El riesgo es ético y de credibilidad, incluso en una demo. | Implementar la capacidad real o cambiar la etiqueta: “Perfil de demostración”, “Destacados por calificación”, “Reseñas publicadas por cuentas”, “Aviso simulado registrado”. No mostrar verificación automática como validación documental. | Cada afirmación se puede rastrear a una regla, evidencia o integración real. |
| Alta | La CTA “Agendar cita rápida” se muestra a un especialista, pero termina en la landing con un error genérico de permisos. | El producto ofrece una acción que luego niega y no explica el siguiente paso. | Ocultar/desactivar la reserva para rol médico con una explicación breve, o redirigir a “Mi panel”. Para paciente, llamar la acción “Ver horarios y reservar”. | Ningún rol ve CTA que no puede completar; la denegación 403 indica qué hacer. |
| Alta | Los filtros de nombre, especialidad y orden carecen de etiqueta programática; los mensajes de ubicación/horas no usan `aria-live`. | Menor comprensión con lector de pantalla y posible pérdida de estados de carga/error. | Añadir `<label for>` o `aria-label` a todos los campos y `role="status" aria-live="polite"` a las notas dinámicas. | Auditoría con lector anuncia el nombre de cada filtro y cada resultado de búsqueda/horas. |
| Alta | El menú móvil oculta enlaces visualmente, pero los enlaces cerrados quedan tabulables. | El foco puede ir a contenido invisible, una trampa de navegación. | Al cerrar, usar `hidden`, `inert` o retirar los enlaces de tabulación; al abrir, restaurarlos. Sincronizar con `aria-expanded`. | Con menú cerrado, Tab pasa de “Menú” al siguiente control visible; con menú abierto recorre solo opciones visibles. |
| Media | La reserva está duplicada: página `/agendar/<id>` y modal global con código/estados propios. | Inconsistencias futuras y más esfuerzo para mantener accesibilidad y validaciones. | Conservar una sola experiencia de reserva: preferiblemente página completa de dos pasos, con URL compartible y errores persistentes. | Un solo módulo controla horario, foco, estados y copy. |
| Media | La portada supera 2 MB en recursos locales antes de HTML/fuentes y usa dos tarjetas animadas en reposo. | Penaliza carga y consumo de datos; la animación no aumenta la capacidad de reservar. | Convertir el PNG de fondo de 1.86 MB a AVIF/WebP responsivo, definir `width/height`, usar `loading="lazy"` en contenido fuera del primer viewport y eliminar/reducir la animación flotante. Cargar Leaflet solo al pedir el mapa. | LCP/transferencia de landing bajan; objetivo inicial: <500 KB de recursos propios críticos y cero animación continua. |
| Media | Contraste de texto secundario 4.44:1 y foco global ~1.62:1 sobre blanco. | Incumple los mínimos respectivos de AA normal y foco no textual. | Oscurecer `--muted` (por ejemplo, hasta >=4.5:1) y usar un outline sólido de >=3:1 para enlaces/botones. | Medición WCAG de todos los tokens y foco visible en fondo claro/oscuro. |
| Baja | Hay copy impreciso: “Explorar”, “Reserva segura”, “Ruta”, “ticket”, “Tasa $0.00”. | Añade carga cognitiva y expectativa errónea. | Usar verbos y consecuencias: “Buscar especialistas”, “Reserva con validación de disponibilidad”, “Ver ruta en el mapa”, “Ticket de reserva (demo)”, “Sin comisión de plataforma”. | Prueba de primer uso: la persona predice correctamente el resultado de cada CTA. |

## Responsive y diseño visual

**Lo que funciona:** la landing mantiene jerarquía clara a 390 px, el menú se vuelve compacto y no se observó desbordamiento horizontal. El sistema de colores, cards, espaciado y tipografía es consistente entre landing, directorio y reserva.

**Lo que debe cambiar:** el directorio cambia el orden de prioridades en móvil: el mapa, que sirve para orientar, desplaza los controles que sirven para decidir. En escritorio la composición de dos paneles es razonable; en móvil debe ser un flujo lineal con **buscar → filtrar → comparar → ver mapa opcionalmente**.

Además, la portada tiene suficientes secciones para comunicar confianza, especialidades, destacados, pasos y un CTA profesional, pero varias compiten por la misma atención. Mantener hero + acceso al directorio + especialidades principales + una explicación breve del proceso es suficiente; los bloques restantes deben aportar una decisión real o eliminarse.

## Heurísticas de Jakob Nielsen

| # | Heurística | Estado | Evidencia y acción |
| --- | --- | --- | --- |
| 1 | Visibilidad del estado del sistema | Parcial | Horarios y cancelación comunican carga/error, pero ubicación y horas no se anuncian a tecnología asistiva. Agregar `aria-live` y conservar el mensaje junto al control. |
| 2 | Relación con el mundo real | Parcial | “Topográfica”, “ticket”, “tasa” y “reserva segura” no son el lenguaje más directo del paciente. Sustituir por palabras de tarea y aclarar que el pago/notificación son demo. |
| 3 | Control y libertad | Parcial | Hay “Volver” y “Limpiar”, pero una CTA negada por rol regresa a landing sin recuperación. Ofrecer ruta alternativa contextual. |
| 4 | Consistencia y estándares | Parcial | Se mezclan página y modal para la misma reserva; las tarjetas aparentan ser controles pero no lo son semánticamente. Elegir un patrón por tarea y usar enlaces/botones nativos. |
| 5 | Prevención de errores | Bien | El servidor vuelve a validar fecha, horario y colisión de cita. Conservar esta doble validación y mostrar por qué una hora no se puede elegir. |
| 6 | Reconocimiento antes que recuerdo | Débil | Para descubrir perfiles hay que inferir que el pin del mapa es la entrada; las tarjetas no muestran CTA visible. Hacer visibles las acciones de cada resultado. |
| 7 | Flexibilidad y eficiencia | Parcial | Filtros, ubicación y orden ayudan a usuarios expertos, pero el acceso a acciones está penalizado en teclado y móvil. Hacer lista prioritaria y mapear filtros a URL compartible. |
| 8 | Diseño estético y minimalista | Parcial | La identidad es buena, pero landing extensa, animaciones continuas y reserva duplicada añaden ruido. Quitar todo elemento que no ayude a elegir o reservar. |
| 9 | Reconocer, diagnosticar y recuperarse de errores | Parcial | Hay errores de disponibilidad, pero la denegación por rol es vaga. Especificar el motivo, el rol requerido y el siguiente enlace útil. |
| 10 | Ayuda y documentación | Parcial | El flujo de cuatro pasos orienta, pero faltan explicaciones cortas para verificación, datos de ubicación, método de pago y qué significa “simulado”. Añadir ayuda contextual donde ocurre la decisión. |

## Reglas de diseño para la siguiente versión

1. La lista es la fuente principal de decisión; el mapa es una vista complementaria.
2. Cada resultado debe ser completamente operable con ratón, teclado y lector de pantalla.
3. Ninguna señal de confianza debe afirmarse sin respaldo técnico o editorial real.
4. Un mismo trabajo de usuario debe tener una sola interfaz de ejecución.
5. Toda carga, resultado vacío, error, éxito, foco y estado deshabilitado debe diseñarse y probarse.
6. El rendimiento es parte de UX: no descargar una imagen de 1.86 MB ni un mapa si aún no hacen falta.

## Archivos clave para implementar las correcciones

- Directorio y semántica: `vectra_cure/templates/directorio.html`, `vectra_cure/static/js/vectra.js`, `vectra_cure/static/js/directorio.js`.
- Responsive y tokens: `vectra_cure/static/css/vectra.css`.
- Reserva única y permisos: `vectra_cure/templates/agendar.html`, `vectra_cure/templates/base.html`, `vectra_cure/app.py`.
- Mensajes de confianza/copy: `vectra_cure/templates/index.html`, `especialista.html`, `cita_exito.html`, `registro.html`, `logica.py`.

## Anexos

- Evidencia bruta y mediciones: `DESIGN-IS-2026-09-01/01-evidence.md`.
- Scorecard Rams: `DESIGN-IS-2026-09-01/02-scorecard.md`.
- Veredicto y acciones: `DESIGN-IS-2026-09-01/03-verdict.md`.
- Prompt listo para planificar el rediseño: `DESIGN-IS-2026-09-01/04-handoff-prompt.md`.
