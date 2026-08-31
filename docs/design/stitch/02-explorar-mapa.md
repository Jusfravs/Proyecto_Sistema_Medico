# Stitch prompt — Explorar mapa

Respeta `DESIGN.md`. Diseña la pantalla funcional principal de Vectra Cure: el explorador de especialistas en mapa.

## Objetivo

Permitir que un paciente encuentre especialistas cercanos, cambie filtros, compare resultados y elija una ficha sin sentirse atrapado en una pantalla llena de tarjetas.

## Composición de escritorio

- Barra superior compacta con marca, acceso a inicio, acceso a “Mis citas” cuando hay sesión y avatar.
- Mapa abierto como superficie principal, con marcadores personalizados de Vectra Cure. Incluye atribución OpenStreetMap visible y discreta.
- A la izquierda, un panel de resultados que contiene búsqueda, filtros y tarjetas. Ese panel es el único side drawer principal.
- En el mapa, muestra ubicación del paciente si fue autorizada, radio activo, marcadores agrupados cuando sea necesario y un marcador destacado cuando se selecciona un especialista.
- Añade controles de zoom, centrar ubicación y selector de radio. No copies el diseño de Google Maps.
- La ruta hacia el consultorio aparece solo al seleccionar “Ver ruta”; incluye distancia y un estado alternativo si la ruta no está disponible.

## Composición móvil

- Mapa ocupa la parte superior.
- Resultados aparecen en un bottom sheet arrastrable, con un control visible para abrir filtros.
- El mapa mantiene controles grandes y la atribución visible.
- La tarjeta seleccionada no debe tapar toda la pantalla.

## Resultados

Cada resultado inicia compacto: foto, nombre, especialidad, calificación, distancia y un indicador de disponibilidad. Al seleccionar una tarjeta, se expande verticalmente dentro del panel y revela información adicional y acciones. Solo una tarjeta queda expandida a la vez.

## Estados requeridos

1. Ubicación autorizada.
2. Ubicación rechazada: referencia en Quito con explicación y acción “Usar otra zona”.
3. Carga inicial de mapa y resultados.
4. Mapa no disponible: resultados siguen funcionando y la interfaz lo explica.
5. Ruta no disponible: se conserva distancia aproximada.
6. Sin resultados: enlaza al estado vacío especializado.

## Movimiento

El panel aparece de forma breve; los marcadores entran por grupos moderados; la selección mueve el foco del mapa y expande la ficha. El mapa no debe volar ni hacer zoom extremo.
