# Stitch prompt — Tarjeta de especialista

Respeta `DESIGN.md`. Diseña una tarjeta reutilizable para el explorador, con estado compacto y estado expandido.

## Estado compacto

Muestra:

- Foto de perfil o foto referencial del consultorio.
- “Dra. María López”.
- Especialidad: Dermatología.
- Insignia de perfil verificado.
- Calificación, por ejemplo 4.9 con estrellas discretas.
- Distancia, por ejemplo 1.8 km.
- Señal breve de disponibilidad, por ejemplo “Disponible el jueves”.

La tarjeta completa es seleccionable. No muestra botones de “Agendar” ni “Ver perfil” todavía.

## Estado expandido

Al seleccionar la tarjeta, conserva la cabecera y revela:

- Área o subespecialidad.
- Ubicación del consultorio.
- Días y horario de atención derivados de disponibilidad real.
- Precio aproximado: “Desde $35”.
- Próxima disponibilidad.
- Botón terciario “Ver perfil”.
- Botón principal “Agendar cita”.
- Acción opcional “Ver ruta”.

La expansión es vertical, calmada y no abre otra vista. Solo una ficha queda expandida dentro del panel.

## Estados y accesibilidad

Diseña variante de carga, sin foto, disponible, sin cupos próximos y especialista seleccionado en el mapa. Mantén controles táctiles de 44 px, texto con contraste y una señal visible de foco. No uses insignias que parezcan una verificación gubernamental o médica real si son demostrativas.
