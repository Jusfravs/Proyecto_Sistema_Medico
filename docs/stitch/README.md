# Paquete de contexto para Google Stitch

Este directorio contiene el contexto de diseño de Vectra Cure preparado para trabajar en Google Stitch. No contiene instrucciones de programación ni sustituye los documentos funcionales del proyecto.

## Cómo usarlo

1. Crea o abre un proyecto en Stitch.
2. Carga o pega primero `DESIGN.md`. Ese archivo define la marca, accesibilidad, tono y reglas comunes.
3. Para cada pantalla, pega el archivo correspondiente como una solicitud nueva. Indica: “respeta DESIGN.md”.
4. Genera primero las pantallas de escritorio y luego pide su variante móvil.
5. Compara cada propuesta con el flujo y conserva solo lo que respete los criterios de este paquete.

Para comprobar transiciones entre pantallas, consulta
`../prds/flujos-producto-v2-v1.0.md`. Ese documento detalla los recorridos,
estados y reglas que Stitch debe respetar.

No pidas a Stitch que copie referencias externas ni que genere código de producción. Solicita prototipos visuales de alta fidelidad, flujos y estados.

## Archivos

| Archivo | Pantalla o componente |
| --- | --- |
| `DESIGN.md` | Sistema visual, comportamiento y restricciones globales |
| `01-home-landing.md` | Home / Landing Page |
| `02-explorar-mapa.md` | Explorador con mapa |
| `03-buscador-y-filtros.md` | Buscador y filtros |
| `04-tarjeta-especialista.md` | Tarjeta compacta y expandida |
| `05-side-drawer.md` | Panel lateral de filtros y resultados |
| `06-modal-agendamiento.md` | Reserva de cita |
| `07-estado-sin-resultados.md` | Estado vacío de exploración |
| `08-consultar-mi-cita.md` | Consulta de cita autenticada |
| `09-cancelacion-y-reverso.md` | Cancelación y reverso simulado |
| `10-registro-especialista.md` | Registro completo para especialistas |
| `11-footer.md` | Footer del producto |

## Regla de fuente de verdad

Si un diseño de Stitch contradice `DESIGN.md`, el diseño no se acepta. Los documentos de producto que explican el alcance completo están en `../prds/`.
