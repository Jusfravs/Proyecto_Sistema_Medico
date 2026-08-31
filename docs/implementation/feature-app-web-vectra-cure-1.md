---
goal: App web Flask (plantillas + sesiones) con CRUD de las 4 entidades de Vectra Cure, estilo curso POO, sin capa de datos
version: 1.0
date_created: 2026-08-29
last_updated: 2026-08-29
owner: Isaac Unapucha, Justin Cedeño (PUCE — Desarrollo de Software)
status: 'Completed'
tags: [feature, app-web, flask, crud, jinja, vectra-cure]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Implementación de la **app web** de Vectra Cure con **Flask + plantillas Jinja + Bootstrap + sesiones**, replicando el patrón del proyecto del curso de POO (`C:/Users/Isaac/Desktop/POO/trabajo en clase POO/tienda_online`): `config.py`, `auth.py`, `app.py`, `templates/`, decoradores `login_requerido`/`rol_requerido`, borrado suave y `flash()`. Cubre el **CRUD** de las 4 entidades del modelo de datos (`Usuario`, `PerfilMedico`, `Cita`, `Resena` — doc 04) y los flujos de agendamiento, pago simulado, ticket `.md`, consulta y cancelación (docs 03 y 06). Sustituye a la API REST JSON del intento anterior. **Sin capa de datos**: el `models.py` (ORM + tablas + semilla en PostgreSQL) lo entrega otro integrante según `CONTRATO_MODELOS.md`; se incluye un stub temporal en SQLite para poder ejecutar.

## 1. Requirements & Constraints

- **REQ-001**: 100 % Python. App web Flask con plantillas Jinja + Bootstrap 5 + sesiones (no API JSON, no Java).
- **REQ-002**: Estructura y convenciones iguales al proyecto del curso: `config.py`, `auth.py`, `app.py`, `templates/`, `requirements.txt`, `.gitignore`.
- **REQ-003**: Nombres de dominio en español: clases `Usuario`, `PerfilMedico`, `Cita`, `Resena`; roles `'paciente' | 'medico' | 'admin'`; decoradores `login_requerido`, `rol_requerido`.
- **REQ-004**: CRUD completo (crear / listar / ver / editar / borrar) de las 4 entidades, accesible desde la UI.
- **REQ-005**: Flujos de los docs 03/06: agendar (2 pasos) → pasarela PayPal Mock → éxito → ticket `.md`; consultar cita por código o teléfono; cancelar con 5 motivos + reverso simulado + visto verde.
- **REQ-006**: Design system del doc 02 (tokens de color, temas claro/oscuro, `Plus Jakarta Sans` + `Inter`, estética Apple Desktop) en `static/css/vectra.css`.
- **REQ-007**: Subida de foto de consultorio (`request.files`, `secure_filename`, `static/uploads/`, imagen por defecto) — Parte 2A de `ActividadPUCE.pdf`.
- **SEC-001**: RBAC por decoradores; rutas de admin y de escritura rechazan ejecución directa sin sesión/rol (redirect + `flash`, sin modificar el recurso).
- **SEC-002**: Contraseñas con hash `werkzeug.security` (`logica.hashear_password` / `verificar_password`); nunca en claro.
- **CON-001**: **No se entrega la capa de datos**: ni `models.py`, ni creación de tablas, ni datos semilla reales. Solo `CONTRATO_MODELOS.md` + stub `models_referencia.py` + `datos_demo.py` (andamiaje SQLite, claramente marcado como no-entregable).
- **CON-002**: Toda la lógica de negocio vive en `logica.py` (funciones puras sobre instancias), de modo que el `models.py` del compañero puede ser puramente estructural.
- **CON-003**: Dependencias iguales al curso: `Flask`, `Flask-SQLAlchemy`, `psycopg2-binary`, `python-dotenv`, `Werkzeug`. Pruebas con `unittest` (stdlib).
- **CON-004**: Borrado suave (`activo=False`) para `Usuario` y `PerfilMedico`; `Cita` y `Resena` admiten borrado físico.
- **GUD-001**: `app.py` importa `from models import ...` con *fallback* automático a `models_referencia` si no existe `models.py`.

## 2. Implementation Steps

### Implementation Phase 1 — Núcleo Python

- GOAL-001: Configuración, constantes de dominio, lógica de negocio, RBAC y el stub de datos.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | `config.py`: lee `.env`; `DATABASE_URL`/`DB_*` → PostgreSQL; fallback SQLite; `UPLOAD_FOLDER`, límite 5 MB. | ✅ | 2026-08-29 |
| TASK-002 | `constantes.py`: ROLES, ESPECIALIDADES (5) + íconos, METODOS_PAGO, ESTADOS_PAGO, ESTADOS_CITA, MOTIVOS_CANCELACION (5), BLOQUES_HORARIOS, radios de búsqueda, tolerancia 15 min. | ✅ | 2026-08-29 |
| TASK-003 | `logica.py`: hash/verificación de password; validadores (`texto_requerido`, `email_valido`, `numero_no_negativo`, `opcion_valida`, `parse_fecha`); `estado_pago_inicial`, `simular_reverso`; `generar_codigo_ticket`, `render_ticket` (recibo doc 03 §4); `calcular_distancia_km` (haversine), `recalcular_rating`, `ordenar_directorio`. | ✅ | 2026-08-29 |
| TASK-004 | `auth.py`: `login_requerido`, `rol_requerido(*roles)` con `@wraps` + `session` + `flash`/`redirect` (adaptado del curso). | ✅ | 2026-08-29 |
| TASK-005 | `models_referencia.py`: stub SQLite con las 4 clases + relaciones (cabecera "NO ES LA ENTREGA"). `datos_demo.py`: carga de andamiaje (1 admin, 6 especialistas, 5 pacientes, 8 citas, reseñas). | ✅ | 2026-08-29 |

### Implementation Phase 2 — Rutas y CRUD (`app.py`)

- GOAL-002: Todas las vistas de la app web.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Público: `/` (landing), `/directorio` (filtros especialidad/orden), `/especialista/<id>` (ficha + reseñas). | ✅ | 2026-08-29 |
| TASK-007 | Auth: `/registro` (switch paciente/especialista; especialista crea `Usuario`+`PerfilMedico`), `/login`, `/logout`. | ✅ | 2026-08-29 |
| TASK-008 | Perfil: `/perfil`, `/perfil/editar` (CRUD Usuario propio). | ✅ | 2026-08-29 |
| TASK-009 | Agendamiento: `GET/POST /agendar/<medico_id>` (valida turno, bloques horarios, no doble reserva); PayPal Mock → `pago.html` → `POST /pago/aprobar` → crea `Cita`; efectivo → crea directo. `/cita-exito/<codigo>`, `/cita/<codigo>/ticket` (descarga `text/markdown`). | ✅ | 2026-08-29 |
| TASK-010 | Consulta/cancelación: `GET/POST /consultar-cita` (por código o teléfono), `/mi-cita/<codigo>`, `GET/POST /mi-cita/<codigo>/cancelar` (5 motivos + reverso simulado). | ✅ | 2026-08-29 |
| TASK-011 | Reseñas: `POST /especialista/<id>/resena` → crea `Resena` + `recalcular_rating`. | ✅ | 2026-08-29 |
| TASK-012 | Panel admin (`@rol_requerido('admin')`): `/admin`; especialistas (listar, `nuevo`, `editar`, `desactivar`, `verificar`); citas (listar, cambiar estado, eliminar); reseñas (listar, editar, eliminar); usuarios (listar, activar/desactivar). | ✅ | 2026-08-29 |
| TASK-013 | Helpers: `_guardar_imagen`, `_codigo_ticket_unico`, `_turno_ocupado`, `_cita_por_codigo`, `context_processor` con `usuario_actual` + constantes; `errorhandler(413)`. | ✅ | 2026-08-29 |

### Implementation Phase 3 — Plantillas y diseño

- GOAL-003: 18 plantillas Jinja + Bootstrap con el design system del doc 02.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | `base.html` (navbar dinámico por rol, `flash` como alerts, footer), `_macros.html` (tarjeta de especialista, estrellas). | ✅ | 2026-08-29 |
| TASK-015 | Público: `index.html` (hero, 5 especialidades, destacados, cómo funciona, stats encuesta), `directorio.html` (chips de filtro + orden + mapa estático + empty state), `especialista.html` (ficha + galería + reseñas + form reseña). | ✅ | 2026-08-29 |
| TASK-016 | Agendamiento: `agendar.html` (2 pasos), `pago.html` (pasarela PayPal Mock simulada), `cita_exito.html` (visto verde + descarga ticket), `consultar_cita.html`, `cita_detalle.html`, `cancelar_cita.html` (5 motivos + spinner + visto verde). | ✅ | 2026-08-29 |
| TASK-017 | Auth: `registro.html` (switch), `login.html`, `perfil.html`. | ✅ | 2026-08-29 |
| TASK-018 | Admin: `panel.html`, `especialistas.html`, `especialista_form.html`, `citas.html`, `resenas.html`, `resena_form.html`, `usuarios.html`. | ✅ | 2026-08-29 |
| TASK-019 | `static/css/vectra.css`: tokens de color, temas claro/oscuro (`prefers-color-scheme` + `[data-theme]`), fuentes Google, componentes (`vc-card`, `vc-chip`, `vc-badge-verificado`, `vc-ticket`, `vc-check`, `vc-map`). `static/img/consultorio-default.svg`. | ✅ | 2026-08-29 |

### Implementation Phase 4 — Contrato, pruebas y documentación

- GOAL-004: Entregar el contrato de datos, la batería de pruebas y el README.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-020 | `CONTRATO_MODELOS.md`: imports que hace `app.py`, mapeo tabla/columna doc 04 → clase/atributo español, relaciones, reglas (unicidad, baja suave, `hora` como string), datos semilla a cargo del compañero. | ✅ | 2026-08-29 |
| TASK-021 | `tests/test_app.py` (`unittest` + SQLite temporal): páginas públicas, registro/login + email duplicado, agendar efectivo (pendiente) + turno ocupado + ticket `.md`, PayPal Mock + cancelación con reverso, reseña recalcula rating + fuera de rango, RBAC (302 sin sesión / como paciente), admin crea especialista. | ✅ | 2026-08-29 |
| TASK-022 | `requirements.txt`, `.env.example`, `.gitignore` (venv/, .env, *.db, uploads), `README.md` (instalación, credenciales, rutas, tabla CRUD, checklist de capturas). | ✅ | 2026-08-29 |
| TASK-023 | Verificación: `venv` + `pip install`; `python datos_demo.py --reset`; `python app.py` levanta; recorrido de todos los GET (200); recorrido de los POST vía `test_client`; `python -m unittest` → 12/12 OK. | ✅ | 2026-08-29 |
| TASK-024 | Eliminar la carpeta `api/` (implementación anterior). | ✅ | 2026-08-29 |

## 3. Alternatives

- **ALT-001**: Mantener la API REST JSON del intento anterior. Descartada por el usuario: la asignatura evalúa app web con plantillas, y se quiere paridad con `tienda_online`.
- **ALT-002**: Entregar también `models.py` real + `init_db.py` + semilla. Fuera de alcance por decisión del usuario: lo hace el compañero de BD. Se entrega el contrato + stub.
- **ALT-003**: Herencia polimórfica de `Usuario` (`Paciente`/`Medico`/`Admin`) como `Producto` del curso. Descartada: el doc 04 modela el rol como columna simple + `perfiles_medicos` 1:1.
- **ALT-004**: Lógica de negocio como métodos en los modelos (estilo `precio_final()`). Descartada: dejaría lógica en el archivo del compañero; se usan funciones puras en `logica.py`.
- **ALT-005**: Mapa real con Google Maps API en el Split View. Descartada: se representa estático; distancia por haversine.

## 4. Dependencies

- **DEP-001**: `Flask>=3.1,<4`
- **DEP-002**: `Flask-SQLAlchemy>=3.1,<4`
- **DEP-003**: `psycopg2-binary>=2.9,<3` (driver PostgreSQL para el `models.py` del compañero)
- **DEP-004**: `python-dotenv>=1.0,<2`
- **DEP-005**: `Werkzeug>=3.1,<4`
- **DEP-006**: Python 3.13
- **DEP-007**: `models.py` del compañero de BD (`CONTRATO_MODELOS.md`) — pendiente de integración.

## 5. Files

- **FILE-001**: `vectra_cure/config.py`
- **FILE-002**: `vectra_cure/constantes.py`
- **FILE-003**: `vectra_cure/logica.py`
- **FILE-004**: `vectra_cure/auth.py`
- **FILE-005**: `vectra_cure/app.py`
- **FILE-006**: `vectra_cure/models_referencia.py`, `vectra_cure/datos_demo.py` (andamiaje temporal)
- **FILE-007**: `vectra_cure/templates/*.html` (12) y `vectra_cure/templates/admin/*.html` (7)
- **FILE-008**: `vectra_cure/static/css/vectra.css`, `vectra_cure/static/img/consultorio-default.svg`
- **FILE-009**: `vectra_cure/CONTRATO_MODELOS.md`
- **FILE-010**: `vectra_cure/tests/test_app.py`
- **FILE-011**: `vectra_cure/requirements.txt`, `.env.example`, `.gitignore`, `README.md`

## 6. Testing

- **TEST-001**: Páginas públicas (`/`, `/directorio`, `/especialista/<id>`, `/consultar-cita`, `/registro`, `/login`) → 200.
- **TEST-002**: `POST /registro` (paciente) crea la cuenta; email duplicado → mensaje "Ya existe una cuenta".
- **TEST-003**: `POST /login` con credenciales válidas → 302; inválidas → mensaje de error.
- **TEST-004**: `POST /agendar/<id>` con efectivo → `Cita` con `estado_pago = PENDIENTE_VENTANILLA`, `codigo_ticket` = `VC-\d{4}-\d{4}`.
- **TEST-005**: `POST /agendar/<id>` en un turno ya reservado → flash "ya está reservado", sin crear cita.
- **TEST-006**: `GET /cita/<codigo>/ticket` → `text/markdown` con "VECTRA CURE"; efectivo incluye leyenda "VENTANILLA".
- **TEST-007**: PayPal Mock → `/pago/aprobar` → `Cita` con `PAGADO_SIMULADO`; `POST .../cancelar` → `estado = CANCELADA` y `estado_pago = REEMBOLSADO_SIMULADO`.
- **TEST-008**: 3 reseñas (5,4,3) → `num_resenas = 3`, `rating_promedio = 4.0`; `calificacion = 9` → mensaje "entre 1 y 5".
- **TEST-009**: `GET /admin` sin sesión → 302 a `/login`; como `paciente` → 302 a `/`.
- **TEST-010**: Admin autenticado: `POST /admin/especialistas/nuevo` → crea `Usuario`+`PerfilMedico`; editar / verificar / desactivar / estado de cita / editar-eliminar reseña → 302 correctos.
- **Resultado**: `python -m unittest discover -s tests` → **12 pruebas OK**. Recorrido manual de GET (todos 200) y de POST vía `test_client` (todos correctos).

## 7. Risks & Assumptions

- **RISK-001**: El `models.py` del compañero podría divergir del contrato (nombres de atributo, `hora` como `time` en vez de string, tipos de `Numeric`). Mitigación: `CONTRATO_MODELOS.md` es explícito y `app.py`/`logica.py` concentran las expectativas.
- **RISK-002**: Verificación hecha contra SQLite (stub); PostgreSQL podría diferir en tipos (`JSON`/`ARRAY`, `Numeric`). Mitigación: tipos portables en el stub; el contrato lo señala.
- **RISK-003**: La pasarela PayPal Mock pasa los datos de la cita por campos ocultos del formulario; si el usuario recarga se puede reintentar. Aceptado (alcance académico "simulado"); `_turno_ocupado` revalida antes de crear.
- **ASSUMPTION-001**: Las 5 especialidades MVP son un conjunto cerrado (docs 04/06).
- **ASSUMPTION-002**: Métodos de pago = `PAYPAL_MOCK` (digital) y `EFECTIVO_VENTANILLA`; las opciones de la Pregunta 9 se agrupan en esas dos.
- **ASSUMPTION-003**: Bloques horarios de 2 h entre 08:00 y 20:00 (doc 03).
- **ASSUMPTION-004**: `datos_demo.py` y `models_referencia.py` se borran al integrar el `models.py` real.

## 8. Related Specifications / Further Reading

- `../research/01_UI_UX_RESEARCH.md`, `../design/02_DESIGN_SYSTEM.md`,
  `../product/03_USER_FLOW_AND_BOOKING.md`,
  `../architecture/04_TECHNICAL_ARCHITECTURE.md`,
  `../product/05_MARKET_SURVEY_FORM.md`,
  `../product/06_SITEMAP_AND_USER_FLOWS.md`.
- `../../vectra_cure/CONTRATO_MODELOS.md` — contrato de la capa de datos.
- Curso POO: `C:/Users/Isaac/Desktop/POO/Cosas que faltaron/INSTRUCCIONES_CREAR_PROYECTO.md`,
  `.../Tutorial_Completo_PasoAPaso_Semana{1,2,3}.md`, `.../ActividadPUCE.pdf`,
  `C:/Users/Isaac/Desktop/POO/trabajo en clase POO/tienda_online/`.
