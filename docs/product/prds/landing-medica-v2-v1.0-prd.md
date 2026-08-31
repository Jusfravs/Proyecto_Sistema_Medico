# Landing médica V2 — Documento de requisitos

## Contexto

Vectra Cure es una plataforma de geolocalización y agendamiento médico. Su objetivo principal es permitir a pacientes encontrar especialistas cercanos, compararlos y reservar una cita. Como propuesta complementaria, permite a los especialistas publicar su consultorio y ganar visibilidad.

La landing tiene un único propósito: llevar a cada persona a su recorrido correcto sin convertir la portada en un directorio de resultados.

Este documento define la versión de diseño y comportamiento que debe
implementarse en la landing, el acceso, el registro y el directorio. Si entra
en conflicto con decisiones anteriores de
`docs/architecture/04_TECHNICAL_ARCHITECTURE.md` o
`docs/product/06_SITEMAP_AND_USER_FLOWS.md` sobre esos temas, prevalece este documento. Al
implementar, esos documentos deberán actualizarse para reflejar el flujo final.

## Decisiones confirmadas

Las siguientes decisiones cierran las dudas de arquitectura que afectaban el
diseño. Se documentan aquí antes de escribir código.

1. **Mapas:** Vectra Cure no contratará Google Maps ni extraerá contenido de
   Google Maps. El explorador usará Leaflet con datos de OpenStreetMap y un
   proveedor de teselas sustituible mediante configuración. El mapa mostrará
   únicamente coordenadas propias de perfiles médicos, con atribución visible.
2. **Rutas:** la primera versión puede dibujar la ruta entre paciente y
   consultorio mediante un servicio de enrutamiento abierto compatible con
   OpenStreetMap, detrás de un adaptador. La instancia pública elegida se
   usará solo para la demostración académica, con una consulta por acción del
   usuario y sin precarga, scraping ni descarga masiva. El sistema conserva la
   distancia Haversine como alternativa si el servicio no responde.
3. **Disponibilidad:** cada especialista tendrá disponibilidad estructurada por
   día y franja horaria. La reserva no se basará solo en un texto de horario ni
   en un catálogo global de bloques.
4. **Propiedad de citas:** toda cita nueva pertenecerá a un paciente
   autenticado. El código de cita se conserva para identificarla y compartir
   un comprobante, pero no sustituye la autorización del paciente.

Estas decisiones requieren cambios futuros de esquema, modelos, pruebas y
documentación. No se implementan en esta etapa de definición.

## Alcance y límites

Esta versión busca una demostración académica pulida y funcional. Incluye una
landing dinámica, navegación por roles, directorio, reservas y un resumen de
actividad para especialistas. No incluye pagos reales, verificación documental
real, un panel profesional completo, publicidad, mensajería ni extracción de
datos de terceros sin autorización.

## Audiencias y propuesta de valor

| Audiencia | Necesidad | Acción principal |
| :--- | :--- | :--- |
| Paciente | Encontrar atención confiable cerca | Explorar especialistas |
| Especialista | Dar visibilidad a su consultorio | Publicar mi consultorio |

Ambas acciones tendrán la misma jerarquía visual dentro del hero, aunque con tratamientos cromáticos distintos. La plataforma se debe sentir cercana, humana y seria, sin una estética fría ni elitista.

## Dirección visual

### Paleta

| Rol | Color |
| :--- | :--- |
| Tinta médica | `#112530` |
| Azul de orientación | `#276EF1` |
| Bruma clínica | `#EDF6F7` |
| Agua mineral | `#87D7C6` |
| Amanecer suave | `#FFB36B` |

### Tipografía

- Display: Instrument Sans.
- Lectura y formularios: Manrope.
- Datos de ubicación, hora y distancia: tipografía monoespaciada de sistema.

### Firma visual

Un mapa de cuidado abstracto, inspirado en rutas y topografía de Quito, se anima en la portada. El directorio utiliza un mapa real. Las imágenes editoriales de consultorios serán propias, generadas o licenciadas y se marcarán como referenciales mientras no correspondan a perfiles reales.

El hero no muestra un mapa funcional, una lista extensa ni tarjetas de
resultados. Presenta una composición propia de rutas, pines y ondas suaves que
conecta visualmente con el explorador sin sustituirlo.

## Referencias de interacción y decisión de uso

Las siguientes referencias inspiran comportamientos, no se copian como código
ni como diseño final. Vectra Cure conserva su propia identidad visual y se
implementa con Flask, Jinja, CSS y JavaScript ligero. Los componentes de
Skiper UI se publican como referencias con condiciones de atribución en su
versión gratuita; por ello se recrearán comportamientos propios, no se pegará
su código.

| Referencia | Decisión | Adaptación para Vectra Cure |
| :--- | :--- | :--- |
| [Aside / Recent Design](https://recent.design/i/bxucrd4-aside) | Adoptar principio | Hero con tesis clara, demostración visual amplia y bloques con aire. |
| [Card stack scroll](https://skiper-ui.com/v1/skiper16) | Adoptar | Pila de hasta cuatro especialistas recomendados; el scroll revela cada ficha sin giros bruscos. |
| [Expand on hover](https://skiper-ui.com/v1/skiper52) | Adoptar | Especialidades o fotografías de consultorio amplían contexto en escritorio; en móvil se resuelven con toque. |
| [Perspective carousel](https://skiper-ui.com/v1/skiper47) | Adoptar una vez | Carrusel táctil de especialidades o beneficios, nunca una repetición de resultados médicos. |
| [Scroll with fade](https://skiper-ui.com/v1/skiper87) | Adoptar | Desvanecimiento superior e inferior en listas y paneles desplazables. |
| [Text scroll animation](https://skiper-ui.com/v1/skiper31) | Adaptar con sobriedad | Palabras, pines y rutas aparecen durante la narrativa “Cómo funciona”. |
| [Theme toggle](https://skiper-ui.com/v1/skiper26) | Descartar | El cambio de tema no aporta al objetivo actual. |
| [Inverted perspective carousel](https://skiper-ui.com/v1/skiper49) | Descartar | Duplica el carrusel elegido y distrae del contenido médico. |

## Estructura de la landing

1. Hero con mensaje de valor, mapa abstracto animado y dos rutas: explorar o publicar un consultorio.
2. Pila de especialistas recomendados: tarjetas compactas que se revelan gradualmente con el scroll.
3. Narrativa “Cómo funciona”: buscar, comparar, agendar y confirmar, con un diagrama de mapa que evoluciona al entrar en el viewport.
4. Carrusel de especialidades en perspectiva, con desplazamiento táctil en móvil.
5. Bloque de confianza: verificación, reseñas, precios orientativos y ubicación.
6. Llamado final al explorador y al registro de especialistas.

### Contenido de cada bloque

| Bloque | Contenido y acción |
| :--- | :--- |
| Hero | Titular humano, mapa abstracto, `Explorar especialistas` y `Publicar mi consultorio`, ambos visibles y de igual jerarquía. |
| Recomendados | Datos demostrativos de especialistas destacados: foto, nombre, especialidad, calificación y una razón concreta de recomendación. |
| Cómo funciona | Secuencia visual: buscar por especialidad, comparar cercanía y precio, agendar una fecha válida y recibir confirmación. |
| Especialidades | Medicina general, odontología, dermatología, veterinaria y pediatría; cada elemento abre el directorio con su filtro aplicado. |
| Confianza | Verificación, reseñas, precio aproximado y ubicación. Las métricas de demostración se identificarán como datos de la plataforma o datos demo, no como resultados clínicos reales. |
| Cierre | Repite las dos rutas: encontrar atención o publicar un consultorio. |

## Movimiento e interacción

- La ruta del hero se dibuja una sola vez al cargar.
- Las secciones entran con desplazamiento corto, opacidad y ritmo suave.
- La pila de tarjetas responde al scroll; no usa rotaciones agresivas.
- El carrusel responde al arrastre y no avanza rápido automáticamente.
- Los efectos hover tienen alternativa táctil en móvil.
- `prefers-reduced-motion` elimina el movimiento no esencial.
- La landing no usa más de una interacción protagonista por sección.

### Movimiento por pantalla

| Pantalla | Movimiento con propósito |
| :--- | :--- |
| Landing | Dibujo inicial de ruta, revelado de bloques al scroll, pila de tarjetas y carrusel táctil. |
| Directorio | Entrada progresiva de filtros y resultados; expansión vertical de una única ficha a la vez. |
| Inicio de sesión y registro de paciente | Modal con fondo desenfocado, opacidad y desplazamiento corto; foco inicial en el primer campo. |
| Registro de especialista | Progreso visible entre grupos de datos y confirmación clara al finalizar. |
| Reserva, pago y cancelación | Transiciones breves que expliquen el cambio de estado; no se retrasan acciones reales. |
| Panel de especialista | Apertura lateral o popover breve, sin ocupar la pantalla completa. |

La interfaz debe usar `IntersectionObserver`, transiciones CSS y eventos de
puntero o teclado. No se incorpora React, Framer Motion, Swiper, Lenis ni otro
framework de frontend solo para imitar las referencias.

## Directorio y resultados

El directorio permanece separado de la landing. Tras elegir una especialidad o realizar una búsqueda, se muestran los profesionales cercanos dentro del radio seleccionado.

Cada resultado comienza como una tarjeta compacta con foto, nombre y calificación. Al seleccionarla se expande verticalmente y muestra especialidad verificada, área de atención, estrellas, ubicación, días y horarios, precio aproximado y acciones para ver el perfil o agendar. El mapa se construirá con Leaflet, datos OpenStreetMap y un proveedor de teselas configurable. No se contratará Google Maps ni se extraerán datos o fotografías mediante scraping.

El flujo de descubrimiento es el siguiente: la persona elige una especialidad,
indica o autoriza una ubicación y ve resultados ordenados por calificación,
cercanía o precio. El sistema aplica el radio disponible y ofrece ampliarlo si
no hay resultados. La ficha compacta no muestra acciones de reserva hasta que
la persona la expande. El perfil y el agendamiento se mantienen como acciones
posteriores y explícitas.

Las fotos de los perfiles reales provienen de la carga del especialista. Hasta
contar con esos recursos, el sistema puede usar imágenes propias, generadas o
licenciadas con etiqueta de referencia. No se mostrarán fotografías de Google
Maps ni se afirmará que una imagen representa un consultorio verificado si no
proviene del perfil correspondiente.

### Contrato de disponibilidad y localización

- La disponibilidad se almacenará como franjas por perfil y día de la semana:
  día, hora de inicio, hora de fin y estado activo.
- La ficha muestra un resumen legible de esas franjas; el formulario de
  reserva solo ofrece horas compatibles con la fecha elegida.
- La distancia se calcula con coordenadas propias. El permiso de ubicación del
  navegador es opcional: si se rechaza, el explorador usa la referencia de
  Quito y lo explica.
- Los radios de 3, 5, 8 y 10 km son controles funcionales. Al no encontrar
  resultados, el estado vacío propone ampliar el radio antes de eliminar los
  filtros.
- La ruta vial es una ayuda de orientación, no una promesa de tiempo de llegada
  ni una sustitución de un servicio de navegación.

## Acceso y registro

| Caso | Comportamiento |
| :--- | :--- |
| Iniciar sesión | Modal global, con fondo desenfocado, foco contenido y ruta de respaldo sin JavaScript. |
| Registro de paciente | Modal breve; crea la cuenta, inicia sesión y redirige al explorador. |
| Registro de especialista | Página independiente existente; solicita credenciales y datos del consultorio. |
| Registro exitoso de especialista | Crea automáticamente el perfil público, inicia sesión y redirige al mapa con el pin destacado. |

La simulación mantiene la verificación automática. El mensaje debe decir que el perfil fue verificado y ya está visible, no que continúa en revisión.

Después de iniciar sesión de manera normal, un paciente abre el explorador y un
especialista abre el explorador con acceso a su resumen profesional. Tras crear
una cuenta, ambos roles inician sesión sin volver a escribir sus credenciales.
La ruta tradicional de inicio de sesión y registro se mantiene como respaldo
para enlaces directos, errores de formulario y personas con JavaScript
desactivado.

El modal bloquea la interacción de fondo, conserva el foco dentro de la
ventana, se cierra con una acción visible y con `Escape`, y devuelve el foco al
botón que lo abrió. El desenfoque del fondo comunica jerarquía sin reducir el
contraste del formulario.

## Panel compacto para especialista

No se construirá todavía un panel profesional a pantalla completa. El mapa incluirá un panel pequeño, disponible desde la navegación, con tres bloques:

1. **Próximas citas:** hasta tres citas pendientes, con fecha, hora y paciente.
2. **Balance estimado:** total de consultas confirmadas y valor proyectado del periodo actual, diferenciando pagos simulados y pagos pendientes.
3. **Visibilidad del perfil:** insignia de verificación, calificación y acceso a su ficha pública.

El panel usa los datos de `PerfilMedico`, `Cita` y la relación de propiedad de
la cita definida para esta versión. Si no hay citas, muestra un estado vacío que
explique que el perfil ya está disponible para recibir reservas.

El balance es una estimación de demostración, no una liquidación ni una
pasarela financiera. Se calcula a partir de las citas confirmadas y de sus
estados de pago existentes. El panel no expone datos de otros especialistas ni
información administrativa.

## Flujos de llegada

```text
Paciente nuevo → modal de registro → sesión creada → explorador de especialistas

Especialista nuevo → registro completo → perfil público creado y verificado
→ sesión creada → mapa con su pin destacado + panel compacto

Usuario con cuenta → modal de inicio de sesión → explorador según su rol
```

El perfil profesional público se crea durante el registro del especialista. No
se construye todavía una página separada de gestión profesional: el mapa, la
ficha pública y el panel compacto cubren el alcance de esta versión.

## Criterios de aceptación

- [ ] La landing prioriza explicación y rutas de decisión; no presenta el directorio completo ni un mapa funcional.
- [ ] Pacientes y especialistas tienen acciones visibles de igual importancia.
- [ ] El inicio de sesión funciona como modal y conserva una ruta accesible de respaldo.
- [ ] El registro de paciente inicia sesión y abre el directorio.
- [ ] El registro de especialista crea el perfil público, inicia sesión y abre el directorio destacando su ubicación.
- [ ] El panel compacto del especialista muestra citas, balance y visibilidad.
- [ ] Las tarjetas del directorio se expanden antes de mostrar las acciones de perfil y agendamiento.
- [ ] La landing muestra solo una pila de especialistas recomendados y datos demostrativos claramente contextualizados; no duplica el directorio.
- [ ] El hero y el cierre presentan tanto la ruta de paciente como la ruta de especialista.
- [ ] El perfil público del especialista se crea antes de redirigirlo al mapa y su pin queda destacado.
- [ ] El resumen del especialista limita su contenido a sus próximas citas, balance estimado y visibilidad de perfil.
- [ ] No se permiten citas con fecha anterior al día actual, tanto en el campo visual como en la validación del servidor.
- [ ] La disponibilidad se consulta por especialista, día y franja horaria antes de crear una cita.
- [ ] Cada cita nueva queda vinculada al usuario paciente autenticado y solo ese paciente puede verla o cancelarla desde su sesión.
- [ ] El mapa muestra atribución de OpenStreetMap, no descarga teselas de forma masiva y conserva una alternativa cuando falla el enrutamiento.
- [ ] Las animaciones respetan movimiento reducido, teclado y pantallas móviles.
- [ ] En móvil, los efectos dependientes de hover cuentan con una interacción equivalente mediante toque o controles visibles.
- [ ] Las referencias externas se usan como inspiración; no se incorpora código de componentes con dependencias de React o condiciones de atribución.
- [ ] Las pruebas existentes se mantienen en verde y se añaden pruebas para redirecciones y fecha de cita.

## Entregables para diseño e implementación

- Diseño responsive de landing, directorio, modal de acceso, modal de paciente,
  registro de especialista y panel compacto.
- Inventario de estados: carga, vacío, error de formulario, éxito de registro,
  sin citas y movimiento reducido.
- Guion de animaciones con duración, activador y alternativa accesible.
- Recursos visuales propios o con licencia, con texto alternativo y origen
  documentado.
- Plan de cambios de datos para disponibilidad estructurada y propiedad de
  citas: SQL, modelos, migración o recarga de datos demo, documentación,
  verificación y pruebas deben cambiar como una unidad.
- Implementación posterior en los archivos Flask existentes, CSS de la marca y
  JavaScript progresivo.

## Fases de implementación

1. Documentar el contrato de mapas, disponibilidad y propiedad de citas,
   incluido el plan de cambio de esquema.
2. Definir tokens, fuentes, estructura de portada y recursos visuales.
3. Construir la landing y sus animaciones progresivas con CSS y JavaScript
   ligero, sin introducir un framework de frontend.
4. Implementar modales de acceso, registro de paciente y redirecciones con
   inicio de sesión automático.
5. Ajustar el directorio, la tarjeta expandible, el panel compacto, la
   disponibilidad y la regla de fechas; verificar con pruebas y revisión
   responsive.

---

**Versión:** 1.1

**Rondas de aclaración:** 4

**Claridad de requisitos:** 100/100
