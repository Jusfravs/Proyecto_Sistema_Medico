# Stitch prompt — Cancelación y reverso

Respeta `DESIGN.md`. Diseña el flujo de cancelación de una cita y su reverso simulado.

## Objetivo

Permitir cancelar sin ambigüedad, explicar consecuencias y confirmar el estado final. No generes miedo ni ocultes el impacto.

## Flujo

1. La persona selecciona “Cancelar cita” desde “Mis citas”.
2. Se abre un modal con resumen breve de la cita: especialista, fecha, hora y monto.
3. Muestra cinco motivos de cancelación como opciones claras: cambio de horario, encontré otra opción, problema personal, error al reservar y otro motivo.
4. Permite comentario opcional.
5. Resume la política aplicable y el destino del pago simulado.
6. Botón de riesgo “Cancelar cita” y acción segura “Conservar cita”.
7. Éxito: cita cancelada, estado de reverso y ticket actualizado.

## Reverso

El reverso es una simulación. Diseña estados “No aplica”, “Pendiente” y “Completado”, con fecha y monto cuando corresponda. No simules una transferencia bancaria real ni uses logotipos de entidades financieras.

## Accesibilidad

El botón de riesgo tiene color y texto, no solo color. El modal conserva foco y permite cerrar sin cancelar. En móvil mantiene las acciones visibles sin obligar a desplazarse demasiado.
