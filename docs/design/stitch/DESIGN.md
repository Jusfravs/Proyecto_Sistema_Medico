# DESIGN.md — Sistema de diseño para Stitch

## Producto

Diseña para **Vectra Cure**, una plataforma de geolocalización y agendamiento médico en Quito, Ecuador. Ayuda a pacientes a encontrar especialistas cercanos, comparar opciones y reservar una cita. También permite que especialistas publiquen su consultorio y ganen visibilidad.

La marca se siente humana, tranquila, precisa y profesional. No se siente fría, corporativa, elitista ni infantil. Piensa en una brisa de mar: fluida, clara y serena.

## Audiencias y recorridos

- **Paciente:** descubre especialistas, usa el mapa, compara una ficha, reserva y gestiona su cita.
- **Especialista:** publica su consultorio, queda visible en el mapa y consulta un panel compacto de actividad.

La landing informa; no funciona como directorio. El explorador con mapa es el lugar de búsqueda. La reserva llega después de elegir un especialista.

## Dirección visual

| Rol | Token | Uso |
| --- | --- | --- |
| Tinta médica | `#112530` | Texto principal, fondos oscuros puntuales |
| Azul de orientación | `#276EF1` | Acciones, foco, rutas y selección |
| Bruma clínica | `#EDF6F7` | Fondo principal y superficies suaves |
| Agua mineral | `#87D7C6` | Estados positivos, apoyo y acentos |
| Amanecer suave | `#FFB36B` | Precio, atención y énfasis limitado |

- Display: **Instrument Sans**.
- Texto y formularios: **Manrope**.
- Distancias, horas, coordenadas y datos: monoespaciada de sistema.
- Usa mucho espacio en blanco, bordes amplios, sombras difusas y una cuadrícula ordenada.
- El tema inicial es claro. No diseñes modo oscuro.

## Imagen y contenido

Usa fotografías propias, licenciadas o genéricas de consultorios modernos, atención médica diversa y ciudad de Quito. Si una imagen no pertenece a un consultorio real, trátala visualmente como referencial. No uses logos de hospitales reales, reseñas reales, fotos de Google Maps ni afirmaciones clínicas no verificadas.

Usa datos demostrativos plausibles. Ejemplo: “Dra. María López · Dermatología · 4.9 · 1.8 km · desde $35”. Identifica datos de ejemplo de manera discreta cuando sea necesario.

## Movimiento

El movimiento debe comunicar continuidad, no decorar.

- Animación de entrada: 180–360 ms, opacidad y desplazamiento breve.
- Una interacción protagonista por sección.
- El mapa abstracto del hero dibuja rutas y pines una sola vez.
- Las tarjetas recomendadas se apilan o se revelan con scroll suave.
- Hover en escritorio tiene equivalente por toque en móvil.
- Respeta `prefers-reduced-motion`: entrega una composición completa sin depender del movimiento.
- Evita parallax agresivo, loops rápidos, rotaciones grandes, vidrio excesivo y carruseles automáticos veloces.

## Accesibilidad y responsive

- Contraste alto, foco visible, controles de al menos 44 px y texto legible.
- Todo modal contiene el foco, se cierra con Escape y devuelve el foco al disparador.
- Escritorio: aire, composición editorial, paneles laterales claros.
- Móvil: navegación compacta, bottom sheet cuando sustituya un panel lateral y gestos con controles alternativos visibles.
- No ocultes información esencial solo en hover.

## Restricciones funcionales visibles

- No uses Google Maps ni copies su interfaz. El explorador usa un mapa abierto con atribución OpenStreetMap visible.
- La ubicación del paciente es opcional. Si no la autoriza, usa Quito como referencia y explica ese estado.
- Los radios de búsqueda son 3, 5, 8 y 10 km.
- Una cita no puede usar una fecha pasada.
- La disponibilidad pertenece a cada especialista y depende de día y franja horaria.
- Las citas pertenecen a pacientes autenticados. El ticket es un comprobante, no una llave de acceso.
- El registro de paciente e inicio de sesión usan modal. El registro de especialista es una página completa.
- El profesional ve un resumen pequeño, no un dashboard grande.

## Lenguaje visual a evitar

No diseñes: landing genérica de hospital, gradientes arcoíris, tarjetas infinitas, iconos médicos caricaturescos, interfaces con muchas pastillas, diseños que parezcan Google Maps, efectos de cristal pesado, tablas administrativas dominantes ni botones de “emergencia” si no existe ese servicio.

## Resultado esperado de Stitch

Genera una interfaz de alta fidelidad, lista para revisión UX. Muestra jerarquía, estados, contenido demostrativo, comportamiento y variantes móvil. No generes código de producción.
