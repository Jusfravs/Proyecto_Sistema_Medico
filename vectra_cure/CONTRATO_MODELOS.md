# Contrato de la capa de datos — `models.py`

> **Para el compañero de BD.** Este documento define exactamente qué debe exponer
> `models.py` para que `app.py` funcione. La app **no** contiene lógica de negocio en
> los modelos: toda vive en `logica.py`. Por eso los modelos pueden ser puramente
> estructurales (columnas + relaciones).

## 1. Qué importa `app.py`

```python
from models import db, Usuario, PerfilMedico, Cita, Resena
```

- `db` = instancia de `flask_sqlalchemy.SQLAlchemy()` (sin `init_app`; lo hace `app.py`).
- Las 4 clases heredan de `db.Model`.
- La app llama `db.init_app(app)`, `db.get_or_404(Modelo, id)`, `db.session.get(...)`,
  `db.session.query(...)`, `.filter_by(...)`, `.filter(...)`, `db.session.add/delete/flush/commit/rollback`.

`models.py` es la única capa de datos usada en ejecución. Las pruebas utilizan
estas mismas clases con SQLite en memoria y nunca se conectan a PostgreSQL.

## 2. Esquema SQL de referencia (04_TECHNICAL_ARCHITECTURE.md)

El doc 04 define las tablas en inglés (`users`, `doctor_profiles`, `appointments`,
`reviews`). Este proyecto usa **nombres en español**. Mapeo:

| Doc 04 (tabla / columna) | Clase / atributo en `models.py` |
|---|---|
| `users` | `Usuario` (`__tablename__ = "usuarios"`) |
| `users.full_name` | `Usuario.nombre` |
| `users.email` | `Usuario.email` (unique) |
| `users.phone` | `Usuario.telefono` |
| `users.role` | `Usuario.rol` — `'paciente' | 'medico' | 'admin'` (default `'paciente'`) |
| `users.created_at` | `Usuario.fecha_registro` |
| *(nuevo)* | `Usuario.password_hash` (string 255, nullable) |
| *(nuevo)* | `Usuario.activo` (bool, default `True`) — baja suave |
| `doctor_profiles` | `PerfilMedico` (`"perfiles_medicos"`) |
| `doctor_profiles.user_id` | `PerfilMedico.usuario_id` (FK `usuarios.id`, unique) |
| `doctor_profiles.specialty` | `PerfilMedico.especialidad` |
| `doctor_profiles.license_number` | `PerfilMedico.num_colegiatura` |
| `doctor_profiles.is_verified` | `PerfilMedico.verificado` (default `True`) |
| `doctor_profiles.clinic_name` | `PerfilMedico.nombre_clinica` |
| `doctor_profiles.address` | `PerfilMedico.direccion` |
| `doctor_profiles.latitude` | `PerfilMedico.latitud` (float / Numeric) |
| `doctor_profiles.longitude` | `PerfilMedico.longitud` |
| `doctor_profiles.approx_price` | `PerfilMedico.precio_aprox` (Numeric(10,2)) |
| `doctor_profiles.rating_avg` | `PerfilMedico.rating_promedio` (Numeric(3,2), default 5.0) |
| `doctor_profiles.review_count` | `PerfilMedico.num_resenas` (int, default 0) |
| `doctor_profiles.photo_url` | `PerfilMedico.foto` (string, nullable) |
| `doctor_profiles.gallery_urls` | `PerfilMedico.galeria` (JSON / ARRAY, nullable) |
| `doctor_profiles.opening_hours` | `PerfilMedico.horario_atencion` (default `'09:00 - 18:30'`) |
| *(nuevo)* | `PerfilMedico.activo` (bool, default `True`) — baja suave |
| `appointments` | `Cita` (`"citas"`) |
| `appointments.doctor_id` | `Cita.medico_id` (FK `perfiles_medicos.id`) |
| `appointments.patient_name/email/phone` | `Cita.paciente_nombre / paciente_email / paciente_telefono` |
| `appointments.appointment_date` | `Cita.fecha` (Date) |
| `appointments.appointment_time` | `Cita.hora` — **String `"HH:MM"`** (bloques de 2 h; ver `constantes.BLOQUES_HORARIOS`) |
| `appointments.reason` | `Cita.motivo` (Text, nullable) |
| `appointments.approx_price` | `Cita.precio_aprox` (Numeric(10,2)) |
| `appointments.payment_method` | `Cita.metodo_pago` — `'PAYPAL_MOCK' | 'EFECTIVO_VENTANILLA'` |
| `appointments.payment_status` | `Cita.estado_pago` — `'PAGADO_SIMULADO' | 'PENDIENTE_VENTANILLA' | 'REEMBOLSADO_SIMULADO'` |
| `appointments.status` | `Cita.estado` — `'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA' | 'NO_SHOW'` (default `'CONFIRMADA'`) |
| `appointments.ticket_code` | `Cita.codigo_ticket` (unique, formato `VC-AAAA-NNNN`) |
| *(nuevo)* | `Cita.motivo_cancelacion` (string 255, nullable) |
| `appointments.created_at` | `Cita.fecha_creacion` (DateTime) |
| `reviews` | `Resena` (`"resenas"`) |
| `reviews.doctor_id` | `Resena.medico_id` (FK `perfiles_medicos.id`, ON DELETE CASCADE) |
| `reviews.patient_name` | `Resena.paciente_nombre` |
| `reviews.rating` | `Resena.calificacion` (int, CHECK 1..5) |
| `reviews.comment` | `Resena.comentario` (Text, nullable) |
| `reviews.created_at` | `Resena.fecha_creacion` (DateTime) |

## 3. Relaciones que la app usa

```python
Usuario.perfil_medico      # 1:1  -> PerfilMedico  (uselist=False)
PerfilMedico.usuario       # -> Usuario
PerfilMedico.resenas       # 1:N  -> [Resena]   (orden: fecha_creacion desc)
PerfilMedico.citas         # 1:N  -> [Cita]
Cita.medico                # -> PerfilMedico   (y desde ahí .usuario.nombre, .especialidad,
                           #    .nombre_clinica, .direccion, .num_colegiatura, .verificado)
Resena.medico              # -> PerfilMedico
```

`logica.recalcular_rating(perfil)` recorre `perfil.resenas` y reescribe
`perfil.num_resenas` y `perfil.rating_promedio`; deben ser columnas asignables.

## 4. Reglas que deben cumplirse en la BD

- `Usuario.email` único; `Cita.codigo_ticket` único.
- Baja suave: la app pone `activo = False` en `Usuario` y `PerfilMedico`; nunca los borra.
- `Cita` y `Resena` sí admiten `db.session.delete(...)`.
- `db.get_or_404` debe devolver 404 si el id no existe (comportamiento estándar de Flask-SQLAlchemy 3.x).
- Fechas: `Cita.fecha` es `date`; la app hace `cita.fecha.strftime('%Y-%m-%d')`.
- `Cita.hora` es string `"HH:MM"` (no `time`), porque se compara con
  `constantes.BLOQUES_HORARIOS` y se muestra tal cual.

## 5. Datos semilla

Los define el compañero de BD (pacientes, especialistas por especialidad, citas y
reseñas). Pueden basarse en la encuesta N = 25 (`05_MARKET_SURVEY_FORM.md`):
distribución de método de pago ≈ 88 % digital / 12 % efectivo, reseñas sesgadas a 4–5★.
Debe existir al menos **un usuario con rol `'admin'`** para entrar al panel.

## 6. Instalación

El esquema, la semilla demostrativa y la verificación se ejecutan manualmente
desde pgAdmin 4 siguiendo `database/README.md`.
