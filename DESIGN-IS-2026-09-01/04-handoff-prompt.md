````
/make-plan Redesign Vectra Cure: directorio y flujo de reserva. Current design failed audit at 13/30 with critical gaps in principles #2 useful, #4 understandable, #6 honest, #9 environmentally friendly and #10 as little design as possible.

Verdict paragraph (quoted from 03-verdict.md):
> REDESIGN. Vectra Cure obtiene 13/30: la funcionalidad está presente, pero la navegación hacia la comparación/reserva, la accesibilidad de los resultados, la honestidad de señales de confianza y el peso de la portada son problemas estructurales que no se solucionan con retoques aislados.

Why redesign and not refine: el total está bajo 20/30 y los fallos se encuentran en la tarea primaria, la comprensión de controles y la confianza clínica.

Preserve from current design (MUST be non-empty):
- Tokens cromáticos, jerarquía tipográfica, skip link y foco de formularios de `vectra_cure/static/css/vectra.css:1-55`.
- Validación de disponibilidad en cliente y servidor de `vectra_cure/static/js/agendar.js:11-42` y `vectra_cure/app.py:402-469`.

Discard (MUST be non-empty):
- Tarjetas de resultados como `<article>` expandible solo con clic. Evidence: `vectra_cure/templates/directorio.html:40-43`. Caused failure on principle #4.
- Mapa como primer bloque dominante en móvil y único acceso práctico al perfil. Evidence: `vectra_cure/templates/directorio.html:9-68`. Caused failure on principle #2.
- Reserva duplicada como página y modal. Evidence: `vectra_cure/templates/agendar.html:6-35` y `vectra_cure/templates/base.html:26`. Caused failure on principle #10.

Top 3–5 moves from the audit (verbatim):
1. #2 Útil: convertir cada resultado en una tarjeta/enlace completa y priorizar lista/filtros sobre el mapa en móvil. Evidencia: `01-evidence.md` §Ejecución y §Estructura.
2. #6 Honesto: ajustar o implementar verificación, recomendaciones, reseñas y notificaciones para que cada etiqueta represente una capacidad real. Evidencia: `01-evidence.md` §Copy.
3. #4 Comprensible: unificar etiquetas, asociar los filtros a labels, anunciar cambios dinámicos y corregir el menú móvil/tabulación. Evidencia: `01-evidence.md` §Estructura.
4. #10 Menos diseño: conservar una única superficie de reserva y eliminar secciones/estilos que no mejoren la decisión del paciente. Evidencia: `01-evidence.md` §§Estructura, Rendimiento.
5. #9 Ambiental: sustituir/optimizar el PNG de 1.86 MB, usar carga diferida de imágenes y cargar el mapa bajo demanda. Evidencia: `01-evidence.md` §Rendimiento.

Redesign principles in priority order:
1. #2 Useful — una persona encuentra, compara y abre un perfil desde cualquier resultado, con filtros antes del mapa en móvil.
2. #4 Understandable — cada control tiene nombre visible/programático y el estado de búsqueda se comunica a ratón, teclado y lector de pantalla.
3. #6 Honest — insignias, reseñas, pagos y notificaciones declaran exactamente lo que el sistema realiza.

Deliverables for the plan:
- New information architecture (not derived from old)
- New primary flow (low-fi, labeled, compared side-by-side to current)
- States checklist (empty, loading, error, success, focus, disabled)
- Migration path for users currently on the old design
- Cutover criteria (when is the old design retired)

Anti-patterns to guard against (specific to REDESIGN):
- Porting old structure under new styling
- Keeping both designs behind a flag indefinitely
- Redesigning to follow a trend rather than the principles above
- Treating the Preserve list as optional — it must be filled before this handoff is valid
````
