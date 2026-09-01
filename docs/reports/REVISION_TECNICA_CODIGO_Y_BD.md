# Revisión técnica de código y base de datos — Vectra Cure

**Fecha de revisión:** 1 de septiembre de 2026
**Alcance:** aplicación Flask en `vectra_cure/`, esquema y utilidades en `database/` y `scripts/`.
**Resultado general:** la aplicación tiene una base funcional y las comprobaciones unitarias actuales pasan, pero no está lista para un despliegue con usuarios reales sin corregir primero los controles de seguridad de las mutaciones, la autorización de cuentas desactivadas, la reserva de profesionales inactivos y la validación previa de migraciones.

## Resumen ejecutivo

Se identificaron **6 hallazgos de prioridad alta**, **15 de prioridad media** y **1 hallazgo de prioridad baja**. Los de mayor impacto permiten efectuar acciones en nombre de otro usuario, mantener acceso después de desactivar una cuenta, agendar con profesionales inactivos y potencialmente dejar la base de datos a medio migrar.

Los controles básicos ejecutados fueron satisfactorios: `unittest` finalizó con **20/20 pruebas correctas** y `compileall` no reportó errores de sintaxis. Esos resultados no cubren, sin embargo, PostgreSQL real, seguridad HTTP, concurrencia de reservas, cargas de archivos, CSRF ni XSS.

## Metodología y limitaciones

La revisión fue estática y de comportamiento controlado: se trazaron rutas Flask, modelos, validadores, plantillas y JavaScript, y se contrastaron con el SQL y el script de migración. Los casos de sesión desactivada, reserva de médico inactivo y hora pasada del día actual fueron reproducidos en una auditoría local; no están automatizados en la suite.

No se leyó el archivo `.env`, no se expusieron secretos, no se instalaron dependencias, no se ejecutaron migraciones ni se modificaron datos de la base. Por ello, los elementos marcados como **riesgo** o **brecha** requieren confirmación en un entorno aislado antes de clasificarlos como defectos explotables. Las referencias `archivo:línea` corresponden a la versión auditada y deben revisarse tras refactorizaciones.

## Priorización

| ID | Severidad | Estado | Hallazgo | Acción inicial |
|---|---|---|---|---|
| SEC-01 | Alta | Confirmado | Mutaciones sin protección CSRF | Incorporar CSRF global y tokens en formularios/AJAX |
| SEC-02 | Alta | Confirmado | XSS DOM persistente en el popup del mapa | Escapar datos y construir el DOM sin concatenar HTML |
| SEC-03 | Alta | Confirmado | Cuenta desactivada conserva sesión y permisos | Revalidar `activo` en cada solicitud autenticada |
| NEG-01 | Alta | Confirmado | Se puede reservar un médico inactivo | Comprobar disponibilidad/estado al crear la cita |
| DB-01 | Alta | Confirmado | Migrador escribe antes de validar el destino | Validar completamente antes de cualquier DDL/DML |
| SEC-04 | Alta | Riesgo | Clave secreta pública por valor de respaldo | Exigir secreto seguro fuera del código |
| NEG-02 | Media | Confirmado | Reseñas ilimitadas y sin cita atendida | Vincular reseña con una única cita completada |
| NEG-03 | Media | Confirmado | Se aceptan horarios que ya pasaron hoy | Validar fecha y hora combinadas contra el reloj |
| NEG-04 | Media | Confirmado | Transiciones/reembolsos inconsistentes | Definir máquina de estados y reglas de reembolso |
| APP-01 | Media | Confirmado | Vista de citas inaccesible para administración | Exponer una vista administrativa con RBAC adecuado |
| VAL-01 | Media | Confirmado | Longitudes de campos no se validan de forma consistente | Centralizar límites en validadores y modelo |
| SEC-05 | Media | Riesgo | Subidas validan extensión y tamaño, pero no contenido | Verificar tipo/contenido y almacenamiento |
| SEC-06 | Media | Brecha | Sin rate limiting ni política de contraseñas | Limitar intentos y reforzar credenciales |
| DB-02 | Media | Confirmado | `--check` no verifica índices ni restricciones | Ampliar las verificaciones del migrador |
| DB-03 | Media | Confirmado | `--fresh` no cumple lo que promete la guía | Corregir semántica o documentación y exigir confirmación |
| DB-04 | Media | Riesgo | Tipos e integridad de datos insuficientes | Mejorar tipos, restricciones y sincronización ORM/SQL |
| SEC-07 | Media | Riesgo | Cookies/headers de seguridad y CSP ausentes | Endurecer configuración HTTP |
| OPS-01 | Media | Riesgo | Se registran datos personales al crear citas | Minimizar y proteger el logging |
| QA-01 | Media | Brecha | Cobertura y automatización insuficientes | Añadir pruebas de seguridad/PostgreSQL y CI |
| OPS-02 | Media | Confirmado | Dependencias sin bloqueo y conflicto de plataforma | Establecer versiones compatibles y lockfile |
| DOC-01 | Media | Confirmado | Documentación de pruebas/Bootstrap desactualizada | Actualizar documentación al comportamiento actual |
| UX-01 | Baja | Riesgo | Tarjetas y modales presentan fricción de teclado | Hacer los controles plenamente accesibles |

## Hallazgos: seguridad y autenticación

### SEC-01 — CSRF ausente en operaciones que cambian estado

- **Severidad / estado:** Alta / Confirmado.
- **Evidencia:** `vectra_cure/app.py:225+`, `334+`, `418+`, `521+`, `555+` y `624+` definen rutas `POST`; los formularios no incluyen token y `vectra_cure/requirements.txt` no incorpora Flask-WTF ni una alternativa CSRF.
- **Escenario:** una persona autenticada visita una página maliciosa que envía un `POST` al origen de Vectra Cure; el navegador adjunta su cookie de sesión y la acción se ejecuta con su identidad.
- **Impacto:** creación/cancelación de citas, cambios de perfil, reseñas u otras operaciones no autorizadas por el usuario afectado.
- **Corrección:** configurar protección CSRF global (por ejemplo, `CSRFProtect`), inicializarla desde la fábrica/configuración Flask, insertar el token en todos los formularios y remitirlo en llamadas AJAX mediante cabecera. Excluir únicamente endpoints técnicamente justificados y autenticados con mecanismo alternativo.
- **Prueba de regresión:** para cada `POST`, verificar que una petición sin token devuelve 400/403 y que una petición legítima con token y sesión válida conserva el comportamiento esperado.

### SEC-02 — XSS DOM persistente en los popups de Leaflet

- **Severidad / estado:** Alta / Confirmado.
- **Evidencia:** `vectra_cure/logica.py:46-50` comprueba presencia pero no sanea el contenido; el registro en `vectra_cure/app.py:230`, `247-272` guarda datos controlados por usuario; `vectra_cure/templates/directorio.html:64` los serializa; `vectra_cure/static/js/mapa.js:12` los concatena como HTML de popup.
- **Escenario:** un profesional registra en un campo mostrado en el mapa una carga como `<img src=x onerror=...>`. Al abrir el popup del directorio, el navegador interpreta la cadena como HTML.
- **Impacto:** ejecución de JavaScript en el origen de la aplicación, robo de sesión si las cookies no son `HttpOnly`, acciones con la cuenta de la víctima y alteración visual de información clínica.
- **Corrección:** no construir HTML mediante concatenación. Crear nodos DOM y asignar `textContent`, o escapar explícitamente todas las interpolaciones antes de `bindPopup`. Mantener validación server-side de longitud y formato; el saneamiento no sustituye al escape de salida.
- **Prueba de regresión:** registrar valores con etiquetas HTML, comillas y payloads de evento; comprobar que se muestran literalmente y que ningún script/atributo se ejecuta en el popup.

### SEC-03 — Desactivar una cuenta no invalida su sesión ni sus permisos

- **Severidad / estado:** Alta / Confirmado.
- **Evidencia:** `vectra_cure/auth.py:20-25`, `40-47` y `vectra_cure/app.py:49-51` cargan/autorizan al usuario de sesión sin revalidar de forma efectiva el estado `activo`. El caso fue reproducido en una auditoría local; no está automatizado en la suite.
- **Escenario:** un administrador desactiva una cuenta comprometida; el atacante ya autenticado conserva su cookie y continúa usando rutas protegidas.
- **Impacto:** la revocación de acceso no es confiable; se mantienen operaciones y privilegios de cuentas suspendidas.
- **Corrección:** en el cargador de usuario y decoradores de autorización, rechazar e invalidar la sesión si `usuario.activo` es falso. Para una revocación inmediata robusta, conservar una versión de sesión o fecha de revocación en BD y compararla con la sesión en cada solicitud.
- **Prueba de regresión:** iniciar sesión, desactivar la cuenta desde otra sesión, solicitar una ruta autenticada y un `POST`; ambos deben redirigir/rechazar y eliminar la sesión local.

### SEC-04 — `SECRET_KEY` posee un valor de respaldo público

- **Severidad / estado:** Alta / Riesgo.
- **Evidencia:** `vectra_cure/config.py:47` aplica un fallback conocido y `.env.example` lo documenta.
- **Escenario:** un despliegue olvida definir la variable de entorno. Cualquiera que conozca el repositorio puede firmar cookies de sesión o CSRF según la configuración Flask.
- **Impacto:** potencial suplantación de sesión y debilitamiento de todas las protecciones que dependen de la firma de Flask.
- **Corrección:** eliminar el valor por defecto; al iniciar fuera de pruebas, fallar de forma explícita si `SECRET_KEY` no existe, tiene baja entropía o coincide con valores de ejemplo. Generar un secreto aleatorio de al menos 32 bytes y gestionarlo mediante el proveedor de secretos del entorno.
- **Prueba de regresión:** comprobar que producción no inicia sin clave y que inicia con una clave segura inyectada; verificar que ninguna clave real aparece en repositorio o logs.

### SEC-05 — Cargas de archivos confiadas a la extensión

- **Severidad / estado:** Media / Riesgo.
- **Evidencia:** `vectra_cure/app.py:95` valida extensiones; `vectra_cure/config.py:56` ya define `MAX_CONTENT_LENGTH` de 5 MB. No hay evidencia de verificación del contenido o MIME ni de almacenamiento aislado.
- **Escenario:** se carga un archivo HTML/SVG o binario malicioso con extensión permitida o con tipo declarado falso; si se sirve desde el mismo origen, puede derivar en XSS, consumo de disco o descarga de contenido peligroso.
- **Impacto:** exposición del servidor, indisponibilidad y posible ejecución de contenido activo en el navegador.
- **Corrección:** inspeccionar firma/MIME con una biblioteca de contenido, decodificar imágenes de manera segura si son el único formato esperado, renombrar con identificadores generados por servidor y servir desde almacenamiento no ejecutable, idealmente en un dominio/origen separado.
- **Prueba de regresión:** rechazar archivos sobredimensionados, con firma MIME distinta, doble extensión y SVG/HTML cuando no estén permitidos; aceptar una imagen válida y recuperarla con nombre no controlado por usuario.

### SEC-06 — Sin límite de intentos de acceso ni política explícita de contraseñas

- **Severidad / estado:** Media / Brecha.
- **Evidencia:** rutas de autenticación en `vectra_cure/app.py:233` y `300`; no se identificó mecanismo de rate limiting ni reglas de fortaleza/credenciales comprometidas.
- **Escenario:** un actor automatiza intentos de contraseña contra cuentas conocidas o registra claves débiles que luego son fáciles de adivinar.
- **Impacto:** mayor probabilidad de toma de cuentas y degradación del servicio.
- **Corrección:** aplicar rate limiting por IP y cuenta (con respuesta uniforme), registrar eventos de forma segura y definir requisitos de longitud, bloqueo de contraseñas comunes/filtradas y hash robusto. No revelar si un correo existe.
- **Prueba de regresión:** simular intentos repetidos y verificar 429/bloqueo temporal; confirmar rechazo de contraseñas débiles y mensajes no enumerables.

### SEC-07 — Configuración HTTP y dependencias externas sin endurecimiento

- **Severidad / estado:** Media / Riesgo.
- **Evidencia:** `vectra_cure/config.py` no muestra `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SAMESITE` ni cabeceras de seguridad/CSP. Las plantillas consumen Leaflet y fuentes de Google externamente, sin integridad de subrecursos visible.
- **Escenario:** en HTTPS una cookie puede quedar menos protegida de lo esperado; una dependencia externa comprometida o una política de contenido ausente amplía el efecto de un XSS.
- **Impacto:** menor defensa en profundidad y más superficie de ataque de terceros.
- **Corrección:** activar cookies `Secure`, `HttpOnly`, `SameSite=Lax` (o la política necesaria); añadir HSTS en producción, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors` y CSP restrictiva compatible. Preferir activos versionados/locales o usar SRI donde proceda.
- **Prueba de regresión:** validar cabeceras y atributos `Set-Cookie` en producción; ejecutar pruebas de interfaz para confirmar que mapa, fuentes y scripts autorizados siguen cargando.

## Hallazgos: lógica Flask y negocio

### NEG-01 — Permite agendar con un médico inactivo

- **Severidad / estado:** Alta / Confirmado.
- **Evidencia:** la selección/creación de citas en `vectra_cure/app.py:361-395` y `436-465` no impide de forma consistente que el profesional esté inactivo. El caso fue reproducido en una auditoría local; no está automatizado en la suite.
- **Escenario:** un administrador inactiva a un profesional y un paciente usa una URL o formulario previamente abierto para reservarlo.
- **Impacto:** citas no atendibles, pagos/reembolsos posteriores y pérdida de confianza.
- **Corrección:** consultar al profesional de nuevo en la transacción de reserva y exigir estado activo, con especialidad/agenda vigente. Deshabilitar también la opción en la UI, pero mantener la regla en servidor.
- **Prueba de regresión:** intentar crear cita con profesional inactivo por URL y por `POST` directo; no debe crearse registro y debe entregarse un mensaje manejable.

### NEG-02 — Reseñas ilimitadas y sin acreditar atención

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `vectra_cure/app.py:555-574` permite el flujo de creación y `vectra_cure/models.py:233-260` no fuerza vínculo único con una cita atendida.
- **Escenario:** un paciente publica múltiples reseñas para el mismo profesional, aunque no haya tenido una cita completada.
- **Impacto:** calificaciones manipulables y resultados del directorio que no representan atención real.
- **Corrección:** asociar la reseña a una cita completada; añadir una restricción única sobre la cita o el par paciente-profesional según la regla de producto, y bloquear reseñas de citas canceladas/pendientes.
- **Prueba de regresión:** una cita completada admite una reseña; una segunda y cualquier reseña sin cita completada se rechazan.

### NEG-03 — Acepta una hora que ya pasó en la fecha actual

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `vectra_cure/logica.py:96-101` valida la fecha sin comparar correctamente la hora actual; el flujo de reserva pasa la hora en `vectra_cure/app.py:379`. El caso fue reproducido en una auditoría local; no está automatizado en la suite.
- **Escenario:** hoy a las 15:00, el usuario reserva para hoy a las 09:00.
- **Impacto:** agenda inválida, atención imposible y procesos administrativos posteriores.
- **Corrección:** convertir fecha y hora a `datetime` con zona horaria de negocio, comparar contra el momento actual y exigir una antelación mínima definida. Usar el reloj inyectable en pruebas.
- **Prueba de regresión:** con reloj fijo, rechazar horas anteriores de hoy y aceptar una hora futura; verificar comportamiento en cambio de día y zona horaria.

### NEG-04 — Transiciones de cita y reembolso sin una regla única

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `vectra_cure/app.py:744-755` cambia estados/reembolso y `vectra_cure/templates/admin/citas.html:32-36` ofrece acciones que no reflejan un flujo único.
- **Escenario:** una cita cancelada, pagada o finalizada recibe una transición incompatible; un reembolso puede marcarse sin comprobar estado, fecha, pago o idempotencia.
- **Impacto:** inconsistencias de agenda y pagos simulados; al integrar pagos reales el riesgo sería financiero.
- **Corrección:** modelar una máquina de estados explícita (por ejemplo, pendiente → confirmada → atendida o cancelada) y una política de reembolso separada, con transiciones permitidas, actor autorizado e idempotency key. Aplicar las reglas en el servicio y reflejarlas en la UI.
- **Prueba de regresión:** tabla de transiciones permitidas/prohibidas; repetir una solicitud de reembolso y confirmar que no duplica efecto.

### APP-01 — Vista de citas inaccesible para administración

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `vectra_cure/templates/admin/citas.html:24` usa `url_for('mi_cita', ...)`, que coincide con la ruta de `vectra_cure/app.py:514-518`; sin embargo, dicha ruta está protegida con `@rol_requerido(C.ROL_PACIENTE)` y no es accesible para la administración.
- **Escenario:** un administrador abre una cita desde la tabla administrativa y es rechazado por la autorización destinada exclusivamente a pacientes.
- **Impacto:** flujo administrativo interrumpido y acoplamiento incorrecto entre la vista administrativa y el control de acceso.
- **Corrección:** crear una vista de detalle administrativa o adaptar una vista existente con RBAC que autorice explícitamente el rol administrador y aplique las reglas de visibilidad correspondientes. Mantener la vista del paciente restringida a su propia cita.
- **Prueba de regresión:** un administrador abre una cita desde la tabla administrativa y obtiene 200; un paciente solo puede abrir su propia cita y recibe rechazo al solicitar una ajena.

### VAL-01 — Validaciones de longitud dispersas e insuficientes

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `vectra_cure/logica.py:49`, `vectra_cure/models.py:138` y `vectra_cure/app.py:536` aplican controles parciales que no se corresponden de forma uniforme con el tamaño de columnas.
- **Escenario:** se envía una cadena válida por presencia/formato pero más larga que la columna; según el motor, falla tarde o se trunca.
- **Impacto:** errores 500, información inconsistente y potenciales problemas de UI/logs.
- **Corrección:** definir límites de dominio únicos, aplicarlos en validadores de formulario/servicio y añadir restricciones/checks de BD cuando corresponda. Devolver errores 4xx claros antes de la escritura.
- **Prueba de regresión:** para cada campo limitado, probar valor máximo aceptado y máximo+1; confirmar respuesta validada y ausencia de escritura parcial.

### OPS-01 — Registro de datos personales durante la creación de cita

- **Severidad / estado:** Media / Riesgo.
- **Evidencia:** `vectra_cure/app.py:471-472` registra información relativa a la creación de citas.
- **Escenario:** los logs se comparten, exportan o retienen más tiempo de lo permitido y contienen identificadores o datos de atención.
- **Impacto:** exposición de PII y posible incumplimiento de políticas de privacidad.
- **Corrección:** registrar solamente identificadores técnicos mínimos, aplicar enmascaramiento, nivel/retención adecuados y controles de acceso a logs. Evitar nombres, correos, motivos de consulta o datos clínicos.
- **Prueba de regresión:** crear una cita en pruebas y comprobar que el log no contiene datos personales ni contenido de formulario.

## Hallazgos: base de datos y migraciones

### DB-01 — El migrador modifica antes de validar por completo el destino

- **Severidad / estado:** Alta / Confirmado.
- **Evidencia:** `scripts/migrar_db.py:85`, `95-103` ejecuta escrituras antes de una verificación que el SQL `database/03_verificar_postgresql.sql:7` plantea como control posterior.
- **Escenario:** una base destino con esquema parcial/incompatible recibe DDL o datos y luego falla la validación.
- **Impacto:** migración a medio aplicar, necesidad de recuperación manual e integridad comprometida.
- **Corrección:** separar preflight de aplicación: conectar y validar versión, tablas, columnas, tipos, índices, restricciones, permisos y espacio antes de abrir transacción de cambios. Ejecutar DDL/DML de forma transaccional cuando PostgreSQL lo permita y emitir un plan/dry-run.
- **Prueba de regresión:** ejecutar contra destino deliberadamente incompatible; el proceso debe terminar con error y demostrar que no hubo cambios. Ejecutar contra destino válido y verificar aplicación atómica.

### DB-02 — `--check` no valida restricciones ni índices

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `scripts/migrar_db.py:47`, `98` comprueba una parte del esquema, sin cobertura completa de restricciones e índices.
- **Escenario:** una base tiene las columnas esperadas, pero carece de una FK, `UNIQUE`, `CHECK` o índice necesario; `--check` informa éxito.
- **Impacto:** falsa confianza previa a producción y degradación de integridad/rendimiento.
- **Corrección:** consultar `information_schema` y catálogos PostgreSQL (`pg_constraint`, `pg_indexes`) y comparar contra un manifiesto versionado del esquema esperado, incluidos tipos/nullability/defaults.
- **Prueba de regresión:** retirar cada tipo de restricción/índice en una BD temporal y comprobar que `--check` falla con diagnóstico específico.

### DB-03 — `--fresh` no realiza el borrado que describe la guía

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `scripts/migrar_db.py:95` no implementa el comportamiento destructivo esperado, mientras `database/GUIA_MIGRACION_CON_CODEX.md:137`, `158` indica que `--fresh` borra/recrea.
- **Escenario:** un operador confía en la guía y ejecuta `--fresh`; el resultado no coincide con la expectativa, dejando datos o esquema previos.
- **Impacto:** restauraciones/migraciones no deterministas y decisiones operativas equivocadas.
- **Corrección:** decidir una semántica única. Recomendación: mantener `--fresh` realmente destructivo solo con confirmación explícita, copia de seguridad y bloqueo de producción; o renombrarlo a un modo no destructivo y corregir toda la guía. Añadir mensajes inequívocos.
- **Prueba de regresión:** en BD de prueba con datos semilla, verificar de manera explícita el efecto documentado y que producción exige salvaguardas.

### DB-04 — Modelo de datos permite divergencias e integridad dependiente de la aplicación

- **Severidad / estado:** Media / Riesgo.
- **Evidencia:** las horas se representan como `CHAR(5)` en SQL; la integridad pago/estado se resuelve principalmente en Flask; las reseñas materializadas pueden desincronizarse; existen diferencias potenciales entre `timestamptz` SQL y `DateTime` ORM; `fecha_actualizacion` no tiene trigger de actualización.
- **Escenario:** una escritura administrativa, script o futuro servicio evita las validaciones Flask y registra hora inválida, estado/pago incompatible o fecha de actualización obsoleta. Un cambio de zona horaria puede interpretarse de modo distinto entre ORM y PostgreSQL.
- **Impacto:** datos de agenda/pago inconsistentes, cálculos de reseña erróneos y auditoría temporal poco fiable.
- **Corrección:** migrar horarios a `TIME` y fechas a timestamps timezone-aware con convención UTC; imponer FKs, `CHECK` y unicidad que representen invariantes de dominio; recalcular agregados o usar vistas/consultas en vez de campos materializados sin mantenimiento; añadir trigger o actualización centralizada y pruebas de compatibilidad ORM/SQL.
- **Prueba de regresión:** intentar inserciones directas inválidas, probar conversión horaria y comprobar que `fecha_actualizacion` cambia tras cada actualización; validar consistencia de promedio/conteo de reseñas.

## Hallazgos: calidad, pruebas y operación

### QA-01 — Cobertura de pruebas y automatización no cubre riesgos principales

- **Severidad / estado:** Media / Brecha.
- **Evidencia:** la suite actual ejecutó **20 pruebas `unittest` con éxito** sobre SQLite en memoria. No se encontraron pruebas para PostgreSQL, CSRF, XSS, concurrencia de reservas, carga de archivos ni cabeceras de seguridad. Ruff no estaba instalado, por lo que no se ejecutó análisis de estilo/lint. No se identificó CI que ejecute los controles.
- **Escenario:** un cambio que afecta SQL específico de PostgreSQL, una carrera de doble reserva o un fallo de autorización llega a `main` sin una barrera automatizada.
- **Impacto:** regresiones de seguridad o integridad detectadas tarde y diferencias entre desarrollo/producción.
- **Corrección:** añadir pirámide de pruebas: unitarias de dominio, integración contra PostgreSQL temporal, cliente Flask de seguridad y E2E mínimo. Configurar CI para entorno limpio con dependencias bloqueadas, `compileall`, linter, tests y reporte de cobertura.
- **Prueba de regresión:** el pipeline debe fallar intencionalmente ante un `POST` sin CSRF, una reserva duplicada/inactiva y una discrepancia de restricción PostgreSQL.

### OPS-02 — Dependencias no reproducibles y conflictos de plataforma

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `pip check` reportó incompatibilidades de plataforma bajo Python **3.14.2** (incluido `greenlet` y dependencias relacionadas); las dependencias tienen rangos amplios y no existe lockfile reproducible.
- **Escenario:** otro equipo o CI instala versiones más recientes/incompatibles, o despliega en una versión Python distinta de la validada.
- **Impacto:** fallos de instalación, comportamiento no reproducible y tiempo de recuperación mayor.
- **Corrección:** declarar la versión Python soportada, fijar o acotar versiones compatibles, generar lockfile mediante herramienta elegida (por ejemplo, `pip-tools` o Poetry) y validar la matriz de Python soportada. No promover Python 3.14 hasta que todas las ruedas/dependencias sean compatibles.
- **Prueba de regresión:** instalar desde cero usando el lockfile en la versión Python objetivo y ejecutar `pip check` sin errores, además de la suite completa.

### DOC-01 — Documentación de pruebas y frontend desactualizada

- **Severidad / estado:** Media / Confirmado.
- **Evidencia:** `README.md`, `FLUJO_DE_TRABAJO.md` y `docs/guides/MANUAL_DE_USO.md` contienen conteos de pruebas y/o referencias a Bootstrap que no reflejan la aplicación auditada.
- **Escenario:** una persona sigue instrucciones antiguas, espera comandos o componentes inexistentes y diagnostica erróneamente el sistema.
- **Impacto:** onboarding más lento, soporte inconsistente y documentación poco confiable.
- **Corrección:** actualizar los documentos desde una fuente de verdad (comandos de prueba, stack y versión), fecharlos y revisarlos en el mismo PR que cambie arquitectura o pruebas.
- **Prueba de regresión:** revisión documental en CI ligera: comprobar que los comandos indicados existen y que el conteo reportado se deriva de la suite o se elimina como dato manual.

### UX-01 — Accesibilidad incompleta en tarjetas y modales

- **Severidad / estado:** Baja / Riesgo.
- **Evidencia:** `vectra_cure/templates/directorio.html:40`, `vectra_cure/static/js/vectra.js:34-38` y `vectra_cure/static/js/agendar-modal.js:60-79` muestran controles interactivos/modales sin evidencia suficiente de activación por teclado, foco inicial, trampa de foco y retorno del foco.
- **Escenario:** una persona usuaria de teclado o lector de pantalla abre una tarjeta/modal y no puede activarlo, recorrerlo o cerrarlo de forma predecible.
- **Impacto:** exclusión de usuarios, incumplimiento de accesibilidad y abandono del flujo de reserva.
- **Corrección:** usar botones/enlaces semánticos, soportar Enter/Espacio/Escape, aplicar roles y atributos ARIA correctos, gestionar foco al abrir/cerrar y probar con navegación sin ratón.
- **Prueba de regresión:** recorrido manual y automatizado de teclado: abrir tarjeta, abrir modal, tabular solo dentro, confirmar/cancelar y recuperar foco en el disparador.

## Hoja de ruta recomendada

1. **Antes de cualquier despliegue:** resolver SEC-01, SEC-02, SEC-03, SEC-04, NEG-01 y DB-01. Añadir pruebas específicas que demuestren cada corrección y validar en PostgreSQL aislado.
2. **Siguiente iteración funcional:** resolver NEG-02 a NEG-04, APP-01, VAL-01 y DB-02 a DB-04; documentar formalmente el ciclo de vida de cita/pago y versionar el esquema.
3. **Endurecimiento y operación:** aplicar SEC-05 a SEC-07, OPS-01, OPS-02 y QA-01; establecer CI, lockfile, configuración segura por entorno y política de logs.
4. **Mantenimiento continuo:** actualizar DOC-01 y UX-01; revisar accesibilidad, dependencias y documentación en cada entrega relevante.

## Controles ejecutados

| Control | Resultado | Observación |
|---|---|---|
| `unittest` | Correcto, 20/20 | Ejecutado sobre SQLite en memoria; no sustituye PostgreSQL real. |
| `compileall` | Correcto | No se detectaron errores de sintaxis Python. |
| `pip check` | Con incompatibilidades | Entorno Python 3.14.2 presenta incompatibilidades de plataforma/dependencias, incluido `greenlet`. |
| Ruff | No ejecutado | No estaba instalado en el entorno auditado. |
| Migración | No ejecutada | Se revisó estáticamente; no se alteró la base ni se aplicó SQL. |

Este informe es un insumo para priorizar correcciones. La severidad refleja impacto y facilidad de abuso observada; no reemplaza una prueba de penetración ni una validación de cumplimiento legal de datos de salud.
