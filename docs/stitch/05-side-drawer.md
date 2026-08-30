# Stitch prompt — Side drawer de exploración

Respeta `DESIGN.md`. Diseña el panel lateral del explorador. No es un drawer de detalle adicional: es el hogar de búsqueda, filtros y resultados.

## Escritorio

- Ancho confortable, alrededor de una tercera parte de la pantalla.
- Encabezado con texto “Explora especialistas” y un resumen de ubicación.
- Buscador y filtros en la parte alta.
- Lista vertical desplazable de resultados, con fade discreto en bordes para indicar scroll.
- Una tarjeta expandida puede crecer sin perder contexto.
- Control para contraer visualmente el panel sin ocultar la acción para reabrirlo.
- Separación clara entre controles, resumen de resultados y lista.
- El mapa sigue visible a la derecha; el panel nunca ocupa toda la pantalla.

## Móvil

- Convierte el panel en bottom sheet con tres alturas: asomado, medio y expandido.
- Muestra asa de arrastre y botones visibles; no depende solo del gesto.
- Mantiene el buscador accesible y deja un área de mapa visible.

## Comportamiento

El drawer entra con desplazamiento mínimo y se mantiene estable mientras cambian filtros. El scroll de resultados no debe mover el mapa. La selección sincroniza tarjeta y marcador. Incluye estados de carga, sin resultados y error de mapa dentro del mismo lenguaje visual.
