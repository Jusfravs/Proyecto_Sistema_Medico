# Plan maestro de producto — Vectra Cure

**Estado:** definición aprobada; este documento no autoriza programación.
**Propósito:** concentrar los cambios de experiencia, interfaz, datos y arquitectura que se implementarán después del rediseño de Vectra Cure.

## 1. Principios del producto

Vectra Cure conecta a pacientes con especialistas cercanos y les permite comparar, reservar y gestionar una cita. También ofrece a los especialistas una vitrina pública y una visión compacta de su actividad.

La portada informa y orienta. El explorador resuelve la búsqueda. La reserva convierte una decisión en una cita. El producto debe sentirse humano, claro y serio, con movimiento sobrio y una interfaz que funciona con ratón, teclado y toque.

La referencia de diseño principal es [Landing médica V2](landing-medica-v2-v1.0-prd.md). Sus referencias externas inspiran comportamientos; no se copiará su código ni su identidad visual.

## 2. Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Proveedor de mapas | Leaflet como biblioteca de mapa; datos OpenStreetMap y proveedor de teselas configurable. No se usa Google Maps de pago. |
| Contenido de mapas | Solo coordenadas y perfiles propios. No se hace scraping ni se muestran fotos tomadas de Google Maps. |
| Rutas | Adaptador de enrutamiento abierto para la demostración, limitado a una consulta iniciada por la persona. Si falla, se muestra distancia Haversine y un estado claro. |
| Disponibilidad | Franjas estructuradas por especialista, día y hora; no solo texto libre. |
| Citas | Las nuevas citas pertenecen a un usuario paciente autenticado. El ticket se conserva como comprobante, no como permiso de acceso. |
| Registro de paciente | Modal breve, inicio de sesión automático y redirección al explorador. |
| Registro de especialista | Página completa existente, creación de perfil, inicio automático y llegada al mapa con su pin destacado. |
| Inicio de sesión | Modal global accesible, con ruta completa de respaldo. |
| Panel profesional | Panel compacto con próximas citas, balance estimado y visibilidad del perfil. |
| Tema | Solo tema claro en esta versión. El modo oscuro queda fuera del alcance. |

## 3. Inventario y objetivo por pantalla

| Área | Situación actual | Resultado que se construirá después |
| --- | --- | --- |
| Landing | Portada funcional, pero estática y centrada en búsqueda | Landing narrativa, animada y con rutas equivalentes para pacientes y especialistas. |
| Explorador | Directorio con mapa representado de forma estática | Mapa interactivo, panel lateral, ubicación, radio y resultados. |
| Búsqueda y filtros | Especialidad y orden básicos | Texto, especialidad, cercanía, precio, calificación, ubicación y radio persistentes. |
| Tarjetas de especialistas | Información completa desde el inicio | Ficha compacta que se expande dentro del panel de resultados. |
| Side drawer | No existe | Panel lateral de búsqueda, filtros y resultados; no habrá un segundo drawer de detalle. |
| Perfil público | Ya existe | Se conserva como página detallada desde la acción “Ver perfil”. |
| Agendamiento | Página separada | Modal o panel con alternativa de URL, disponibilidad real y fecha no pasada. |
| Sin resultados | Mensaje básico | Estado que explica el motivo, permite ampliar radio y recuperar filtros. |
| Consultar, cancelar y reversar | Flujos básicos separados | Estados claros, confirmaciones y acceso protegido por cuenta. |
| Registro e inicio de sesión | Páginas completas | Modal para acceso y paciente; página independiente para especialista. |
| Panel del especialista | No existe | Resumen pequeño, no dashboard completo. |
| Footer | Básico | Navegación de apoyo, especialidades, ayuda, políticas y soporte. |

## 4. Contratos de producto antes de desarrollo

### 4.1 Mapa, ubicación y rutas

El explorador usa un mapa Leaflet con marcadores de perfiles médicos y una atribución visible a OpenStreetMap. La URL de teselas nunca se fija en la plantilla: queda en configuración para que el equipo pueda cambiar de proveedor si aumenta el tráfico o cambian sus condiciones.

La geolocalización del navegador es opcional. Con permiso, el mapa calcula cercanía desde la posición indicada. Sin permiso, usa Quito como referencia, lo comunica y permite cambiar la zona. Los radios iniciales son 3, 5, 8 y 10 km.

La ruta vial se solicita solo al elegir un consultorio y nunca se precarga para todos los resultados. La capa de enrutamiento se diseña como adaptador: una demostración puede usar un servicio abierto compatible, pero una versión con tráfico sostenido debe contratar o alojar un proveedor que admita esa carga. La distancia Haversine sigue disponible si no hay ruta.

### 4.2 Disponibilidad estructurada

Se agregará una entidad de disponibilidad asociada a cada perfil médico. Cada franja guarda el día de semana, hora de inicio, hora de fin y estado activo. Un especialista puede tener varias franjas en un día y ninguna en otro.

La información se muestra en tarjetas y perfiles con texto legible. El agendamiento deriva sus horas disponibles de la fecha elegida, la franja correspondiente y las citas activas. La interfaz no inventa horarios que la base no pueda validar.

La tabla propuesta se llama `disponibilidades_medicas`. El diseño técnico debe definir sus claves, restricciones de horas, índice por perfil y día, carga demo y estrategia de migración antes de modificar el esquema.

### 4.3 Propiedad y consulta de citas

Se agregará a `citas` una referencia obligatoria al usuario paciente. Los campos de nombre, correo y teléfono permanecen como fotografía del comprobante emitido en el momento de la reserva.

El paciente consulta, cancela o ve una cita desde su sesión. El código de cita sigue identificando el comprobante, pero no permite por sí solo exponer datos de una persona. Los registros demo existentes deberán asociarse con los pacientes demo correspondientes.

### 4.4 Cambio de esquema como unidad

Cuando se programe, disponibilidad y propiedad de citas se entregan en el mismo Pull Request con estos archivos sincronizados:

1. `database/01_schema_postgresql.sql`.
2. `vectra_cure/models.py`.
3. `database/ESQUEMA_Y_CONTEXTO.md`.
4. `database/03_verificar_postgresql.sql`.
5. `vectra_cure/tests/test_app.py`.
6. Migración documentada o instrucciones de recarga de la base demo.
7. `vectra_cure/CONTRATO_MODELOS.md` si cambia el contrato entre la app y la base.

## 5. Orden de trabajo posterior

### Fase 0 — Cerrar especificaciones técnicas

Definir el proveedor concreto de teselas y la política de uso que aplique, el contrato del adaptador de rutas, la tabla de disponibilidad, la referencia de paciente en citas y la migración de datos demo.

**Referencias:** `FLUJO_DE_TRABAJO.md` §6.1, `database/REVISION_ESQUEMA.md`,
`vectra_cure/CONTRATO_MODELOS.md` y el PRD de landing.

**Verificación:** el diagrama de datos, el SQL, los modelos y la documentación describen las mismas relaciones antes de abrir archivos de aplicación.

**Guardas:** no aplicar migraciones destructivas, no añadir una columna a un solo archivo y no poner claves de proveedores en el repositorio.

### Fase 1 — Fundaciones visuales y shell

Aplicar los tokens de marca, tipografía, navegación, footer, botones, tarjetas, modales, drawer y reglas de movimiento. Crear componentes reutilizables en Flask, Jinja, CSS y JavaScript progresivo.

**Referencias:** `docs/design/02_DESIGN_SYSTEM.md` y el PRD de landing.

**Verificación:** contraste, foco visible, navegación por teclado, móvil y `prefers-reduced-motion`.

**Guardas:** no introducir un framework frontend ni repetir estilos y lógica de modal en cada plantilla.

### Fase 2 — Landing y acceso por roles

Construir la portada informativa, hero dual, mapa abstracto, pila de especialistas, narrativa, carrusel y bloque de confianza. Convertir acceso y registro de paciente en modales; conservar el registro completo de especialistas.

**Referencias:** `docs/product/06_SITEMAP_AND_USER_FLOWS.md`, PRD de landing y
`docs/product/03_USER_FLOW_AND_BOOKING.md`.

**Verificación:** paciente nuevo llega al explorador; especialista nuevo llega al explorador con su pin destacado; las rutas sin JavaScript siguen operativas.

**Guardas:** no declarar que las verificaciones o métricas demo son datos reales de terceros.

### Fase 3 — Explorador y resultados

Implementar mapa, ubicación, filtros, radios, estado vacío, panel lateral y tarjetas expandibles. La tarjeta seleccionada se expande dentro del panel; el perfil detallado continúa en una página pública.

**Referencias:** PRD de landing, `docs/research/01_UI_UX_RESEARCH.md` y
`docs/product/06_SITEMAP_AND_USER_FLOWS.md`.

**Verificación:** filtros combinables, estado reflejado en URL, alternativa sin permiso de ubicación, una sola ficha expandida y manejo de fallo del mapa o de la ruta.

**Guardas:** no raspar mapas, no precargar teselas ni rutas y no esconder la atribución de OpenStreetMap.

### Fase 4 — Reserva y gestión de citas

Conectar el modal de agendamiento a disponibilidad estructurada. Impedir fechas pasadas en cliente y servidor. Rediseñar consulta, confirmación, cancelación, reverso y ticket según la propiedad de cada cita.

**Referencias:** `docs/product/03_USER_FLOW_AND_BOOKING.md`, modelo de datos y
PRD de landing.

**Verificación:** una solicitud directa no crea citas pasadas, fuera de horario o pertenecientes a otra persona; cancelar conserva el historial esperado.

**Guardas:** no confiar solo en el atributo HTML `min` ni usar el ticket como único control de acceso.

### Fase 5 — Visibilidad profesional, cierre y calidad

Crear el panel compacto de especialista y terminar footer, soporte y políticas. Revisar todos los estados de carga, vacío, error y éxito en escritorio y móvil.

**Referencias:** PRD de landing, `docs/product/05_MARKET_SURVEY_FORM.md` y
`FLUJO_DE_TRABAJO.md` §7.

**Verificación:** pruebas automatizadas en verde, revisión manual de los flujos paciente/especialista y auditoría básica de accesibilidad.

**Guardas:** no convertir el panel compacto en un dashboard fuera de alcance ni simular pagos reales.

## 6. Criterios de salida de la etapa de definición

- [x] Dirección visual, navegación y animación aprobadas.
- [x] Separación entre landing, explorador y reserva definida.
- [x] Acceso y redirecciones por rol definidos.
- [x] Estrategia sin Google Maps ni scraping aprobada.
- [x] Disponibilidad estructurada autorizada.
- [x] Propiedad de las citas por paciente autenticado autorizada.
- [ ] Proveedor concreto de teselas y condiciones de despliegue documentados.
- [ ] Contrato SQL final de disponibilidad y migración de datos demo revisados.

## 7. Fuentes técnicas consultadas

- [Leaflet](https://leafletjs.com/): biblioteca abierta para mapas interactivos.
- [Política de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/): atribución obligatoria, uso interactivo moderado y prohibición de scraping o precarga masiva.
- [Documentación de rutas de OSRM](https://project-osrm.org/docs/): motor abierto que admite rutas entre coordenadas; cualquier instancia pública debe respetar sus límites de uso.

---

**Versión:** 1.0
**Última decisión incorporada:** mapas abiertos, disponibilidad estructurada y propiedad autenticada de citas.
