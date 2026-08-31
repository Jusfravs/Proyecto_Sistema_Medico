# Sistema de diseño V2 — Vectra Cure

## Intención

Vectra Cure se siente humano, cercano y competente. La interfaz usa aire,
información clara y una animación útil: debe sentirse fluida, no espectacular
por encima de la tarea. La landing inspira confianza; el explorador permite
decidir y reservar.

## Tokens

| Uso | Token | Valor |
| --- | --- | --- |
| Texto y superficie oscura | `ink` | `#112530` |
| Acción y orientación | `blue` | `#276EF1` |
| Fondo de descanso | `mist` | `#EDF6F7` |
| Verificación y apoyo | `mineral` | `#87D7C6` |
| Acento cálido | `sunrise` | `#FFB36B` |
| Borde | `line` | `#D4E3E5` |

Solo existe tema claro en V2. Los contrastes se resuelven con `ink` y
superficies blancas; no hay interruptor de modo oscuro.

## Tipografía y forma

- Display: `Instrument Sans`, pesos 600–700, tracking ligeramente negativo.
- Texto, formularios y navegación: `Manrope`, 400–700.
- Datos breves: Manrope 13 px; si se añade una fuente mono, solo para códigos y
  valores operativos, nunca para texto de lectura.
- Radio: 10 px en campos, 16–22 px en tarjetas y 999 px en acciones principales.
- Sombras: una elevación suave y difusa; las tarjetas se diferencian primero por
  borde y espacio, no por sombra.

## Componentes

- **Landing:** hero con mapa abstracto, carril de especialidades, pila de
  perfiles recomendados, narrativa de tres pasos, confianza y CTA para
  profesionales. No muestra un listado completo ni resultados de búsqueda.
- **Explorador:** escritorio con drawer izquierdo y mapa principal; móvil con
  mapa y resultados debajo. El drawer reúne consulta, filtros, radio y cards.
- **Card de especialista:** estado compacto con nombre, área, rating, distancia
  y disponibilidad; al abrirse muestra verificación, dirección, precio y las
  acciones Ver perfil / Agendar. Solo una card expandida a la vez.
- **Autenticación:** inicio y registro de paciente en modal con fondo suavemente
  desenfocado, Escape y foco contenido. Registro de especialista es página
  completa por su información profesional.
- **Cita:** fecha mínima igual a hoy y validación también en servidor; la cita
  pertenece a la cuenta paciente autenticada.

## Movimiento y accesibilidad

Las entradas por scroll usan desplazamiento breve + opacidad. Hover de cards,
pin y CTA tienen 180–250 ms. Cada hover tiene equivalente táctil/clic y todos
los efectos se desactivan con `prefers-reduced-motion`. No se usa auto-play que
oculte información ni movimiento puramente decorativo.

## Imagen y mapa

Las imágenes son propias, generadas o subidas por perfiles y se identifican
como referenciales cuando corresponda. El mapa usa Leaflet + OpenStreetMap con
atribución visible; rutas abiertas se solicitan bajo demanda y no se hace
scraping ni descarga masiva de imágenes o teselas.
