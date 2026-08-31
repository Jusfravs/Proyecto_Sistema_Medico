# Stitch prompt — Modal de agendamiento

Respeta `DESIGN.md`. Diseña un modal de reserva de cita para un paciente autenticado.

## Objetivo

Transformar una decisión de agenda en una reserva clara, breve y confiable. La persona ya eligió el especialista; no debe repetir la búsqueda.

## Estructura

- Fondo de la pantalla desenfocado de forma suave, no oscurecido en exceso.
- Cabecera con foto pequeña, nombre, especialidad, ubicación y botón visible para cerrar.
- Paso 1: selector de fecha. Bloquea días pasados y comunica “Selecciona una fecha desde hoy”.
- Paso 2: selector de hora. Solo muestra franjas disponibles para la fecha y el especialista.
- Resumen: fecha, hora, precio aproximado y modalidad de pago disponible.
- Campos mínimos de contacto si faltan en el perfil.
- Acción principal: “Continuar a confirmación”.
- Confirmación final con resumen, aviso de política de cancelación y botón “Confirmar cita”.

## Estados

- Sin horarios para el día seleccionado, con fechas cercanas sugeridas.
- Fecha pasada bloqueada.
- Horario tomado mientras la persona confirma.
- Error de conexión conservando elección de fecha/hora.
- Éxito: número de ticket, próximos pasos y acción “Ver mi cita”.

## Comportamiento y accesibilidad

El modal contiene el foco, se cierra con Escape y devuelve el foco al botón de origen. Muestra un indicador de progreso breve, no un flujo largo. En móvil ocupa una hoja vertical cómoda y permite volver a la información del especialista.
