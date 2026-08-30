# Stitch prompt — Buscador y filtros

Respeta `DESIGN.md`. Diseña el sistema de búsqueda y filtros del explorador de especialistas.

## Objetivo

Dar control sin convertir el explorador en un formulario pesado. La persona debe entender qué se busca, desde dónde y en qué radio.

## Componentes

- Campo principal con icono de búsqueda y placeholder: “Busca por especialista, especialidad o zona”.
- Selector de especialidad: Medicina general, Odontología, Dermatología, Pediatría y Veterinaria.
- Orden: “Más cercanos”, “Mejor calificados” y “Precio aproximado”.
- Selector de radio: 3, 5, 8 y 10 km. Muestra el valor activo sin usar demasiadas pastillas.
- Estado de ubicación: “Cerca de ti” cuando hay permiso; “Quito como referencia” cuando no lo hay, con opción de cambiar.
- Resumen de filtros activos y acción clara “Limpiar filtros”.
- Conteo legible de resultados, por ejemplo “12 especialistas cerca de ti”.
- En móvil, un botón “Filtros” abre un panel o bottom sheet con aplicar, cerrar y limpiar.

## Jerarquía y comportamiento

El buscador domina. Especialidad y orden son controles secundarios de lectura rápida. El radio es explícito porque afecta los resultados. Los filtros activos se reflejan de forma compacta y no deben hacer que el panel salte visualmente.

Usa etiquetas, iconos con texto y un foco visible. Incluye estados de campo vacío, texto sin coincidencias, filtro activo y loading. No escondas filtros relevantes detrás de iconos sin etiqueta.
