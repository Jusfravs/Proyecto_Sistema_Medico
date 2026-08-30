# Stitch prompt — Estado sin resultados

Respeta `DESIGN.md`. Diseña el estado vacío cuando el explorador no encuentra especialistas con los filtros actuales.

## Objetivo

Ayudar a recuperar la búsqueda sin culpar a la persona ni dejar una pantalla vacía.

## Contenido

- Ilustración abstracta pequeña: un pin, una ruta interrumpida y ondas suaves; no una cara triste.
- Título: “Aún no encontramos especialistas en esta zona”.
- Explicación concreta: indica especialidad, radio activo y referencia de ubicación.
- Acción principal: ampliar radio al siguiente valor disponible.
- Acciones secundarias: cambiar especialidad, usar otra zona y limpiar filtros.
- Si la ubicación fue rechazada, ofrece “Permitir ubicación” sin presionar de forma invasiva.
- Bloque opcional de especialidades populares o recomendaciones fuera del radio, claramente etiquetadas.

## Variantes

1. Sin resultados por radio pequeño.
2. Sin coincidencias por búsqueda de texto.
3. Ubicación no disponible.
4. Error temporal de carga de resultados.

El estado debe funcionar tanto dentro del side drawer de escritorio como dentro del bottom sheet móvil. Mantén la jerarquía de acciones y evita rellenar con tarjetas irrelevantes.
