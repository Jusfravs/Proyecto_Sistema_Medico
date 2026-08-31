# Stitch prompt — Registro de especialista

Respeta `DESIGN.md`. Diseña una página completa de registro para especialistas. No la presentes como modal: requiere información profesional y de consultorio.

## Objetivo

Permitir que un profesional publique su consultorio de forma guiada y tranquila. Al finalizar, el perfil se crea, queda visible en la demostración y abre el explorador con su pin destacado.

## Estructura

- Navegación mínima con logo y acción “Ya tengo una cuenta”.
- Encabezado: “Haz visible tu atención donde tus pacientes buscan”.
- Indicador de progreso claro, con grupos de información.
- Grupo 1: datos personales y credenciales profesionales.
- Grupo 2: especialidad, área de atención, precio aproximado y descripción.
- Grupo 3: consultorio, dirección, coordenadas o selección de ubicación, teléfono y fotografía referencial.
- Grupo 4: disponibilidad estructurada por día y franja horaria.
- Vista de resumen antes de enviar.
- Confirmación: “Tu perfil ya está visible” y transición al explorador.

## Diseño de disponibilidad

Usa una tabla o editor amable con días de la semana, interruptor de atención y una o más franjas de hora. Debe ser visualmente claro, no parecer una hoja de cálculo. Incluye un ejemplo con lunes a viernes, 09:00–13:00 y 15:00–18:00.

## Estados

- Campo válido, error de formato, credencial duplicada, ubicación incompleta y envío exitoso.
- Guardado de avance visual solo como propuesta de interfaz; no afirmes que se guardó si la función no existe.
- En móvil, progreso, campos y editor de horarios deben mantenerse fáciles de usar.

No afirmes revisión documental en curso: para esta demostración el perfil termina verificado y visible.
