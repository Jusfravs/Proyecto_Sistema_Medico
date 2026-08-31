# Stitch prompt — Consultar mi cita

Respeta `DESIGN.md`. Diseña la vista “Mis citas” para un paciente autenticado. El ticket identifica el comprobante, pero la sesión protege el contenido.

## Objetivo

Permitir que el paciente vea de forma inmediata qué cita tiene, dónde será, cuánto costará aproximadamente y qué puede hacer después.

## Composición

- Encabezado tranquilo: “Tus próximas citas”.
- Tarjeta principal de próxima cita: fecha, hora, especialista, especialidad, ubicación, precio aproximado, estado de pago y código de ticket.
- Acciones: “Ver ruta”, “Reagendar” solo si se habilita en el futuro, “Cancelar cita” y “Ver comprobante”.
- Sección de historial con citas anteriores o canceladas, visualmente secundaria.
- Estado sin citas con CTA para volver al explorador.
- Enlace al perfil público del especialista sin quitar el foco de la cita.

## Estados

- Pendiente de pago simulado.
- Confirmada.
- Cancelada con reverso pendiente o completado.
- Sin citas.
- Error de carga.

No diseñes una tabla administrativa. Usa tarjetas de información con jerarquía de tiempo, ubicación y estado.
