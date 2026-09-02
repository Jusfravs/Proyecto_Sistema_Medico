# Vectra Cure — App web (Flask)

Plataforma de geolocalización y **agendamiento médico**. App web con **Flask +
plantillas Jinja + CSS propio (`static/css/vectra.css`) + sesiones**, siguiendo
el patrón del proyecto del curso de POO (`tienda_online`). Cubre el **CRUD** de
las 4 entidades del modelo de datos y los flujos de agendamiento, cancelación y
ticket.

> **Base de datos.** La ejecución utiliza `models.py` con PostgreSQL 18. El
> esquema, los datos demostrativos y su documentación viven fuera del repositorio
> en **`Documentacion_PSM/database/`** y se cargan manualmente desde pgAdmin 4.
> SQLite se reserva para las pruebas automatizadas.

## Estructura

| Archivo | Rol |
|---|---|
| `app.py` | Servidor Flask: todas las rutas y el CRUD |
| `auth.py` | Decoradores `login_requerido` / `rol_requerido` |
| `config.py` | Configuración (lee `.env`; URI de BD = variable del compañero) |
| `constantes.py` | Especialidades, métodos de pago, estados, motivos de cancelación, bloques horarios |
| `logica.py` | Reglas de negocio (pago simulado, ticket `.md`, distancia, rating, validación) |
| `templates/` | 18 plantillas Jinja (landing, directorio, ficha, agendar, pago, éxito, consultar/cancelar, registro, login, perfil, panel admin) |
| `static/css/vectra.css` | Design system del doc `02` (tokens, temas claro/oscuro, tipografías) |
| `CONTRATO_MODELOS.md` | Especificación de lo que `models.py` debe exponer |
| `models.py` | Modelos SQLAlchemy compatibles con PostgreSQL y SQLite de pruebas |
| `tests/test_app.py` | 20 pruebas `unittest` (SQLite en memoria, no toca PostgreSQL) |

## Instalación y ejecución

```powershell
cd vectra_cure
python -m venv venv
venv\Scripts\activate                 # (source venv/bin/activate en Linux/Mac)
pip install -r requirements.txt

copy .env.example .env

# En pgAdmin 4, conectado a la base vectra_cure, ejecuta en orden los
# scripts SQL de Documentacion_PSM/database/ (00 → 01 → 02 → 03).

python app.py                         # http://127.0.0.1:5000
```

## Pruebas

```powershell
python -m unittest discover -s tests -v
```

## Credenciales de prueba (datos de demostración)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@vectra.demo` | `admin123` |
| Especialista | `medico0@vectra.demo` … `medico5@vectra.demo` | `medico123` |
| Paciente | `paciente0@vectra.demo` … `paciente4@vectra.demo` | `paciente123` |

## Rutas principales

| Flujo | Ruta |
| --- | --- |
| Landing / ¿cómo funciona? | `GET /` |
| Directorio (filtros ⭐ / 📍 / 💵) | `GET /directorio?especialidad=&orden=` |
| Ficha de especialista + reseñas | `GET /especialista/<id>` |
| Agendar cita (2 pasos) | `GET·POST /agendar/<medico_id>` → `POST /pago/aprobar` |
| Pantalla de éxito + ticket | `GET /cita-exito/<codigo>` · `GET /cita/<codigo>/ticket` |
| Consultar mi cita | `GET·POST /consultar-cita` → `GET /mi-cita/<codigo>` |
| Cancelar cita (5 motivos) | `GET·POST /mi-cita/<codigo>/cancelar` |
| Registro (paciente / especialista) | `GET·POST /registro?tipo=` |
| Login / logout / perfil | `/login` · `/logout` · `/perfil` |
| **Panel admin** (CRUD completo) | `/admin`, `/admin/especialistas`, `/admin/citas`, `/admin/resenas`, `/admin/usuarios` |

## CRUD por entidad

| Entidad | Crear | Leer | Actualizar | Borrar |
| --- | --- | --- | --- | --- |
| `Usuario` | `/registro` | `/perfil`, `/admin/usuarios` | `/perfil/editar` | admin → baja suave |
| `PerfilMedico` | registro médico · `/admin/especialistas/nuevo` | `/directorio`, `/especialista/<id>` | `/admin/especialistas/<id>/editar` | admin → baja suave |
| `Cita` | `/agendar/<id>` | `/consultar-cita`, `/admin/citas` | `/mi-cita/<cod>/cancelar`, admin cambia estado | admin → borrado físico |
| `Resena` | ficha del especialista | ficha + `/admin/resenas` | `/admin/resenas/<id>/editar` | `/admin/resenas/<id>/eliminar` |

## Reglas de negocio simuladas

- **Pago**: PayPal Mock → `PAGADO_SIMULADO`; efectivo → `PENDIENTE_VENTANILLA` (con leyenda de saldo).
- **Ticket `.md`**: recibo estilo caja registradora (doc 03 §4), descargable.
- **Cancelación**: 5 motivos (doc 03 §3.1); reverso simulado si estaba pagado; libera el turno.
- **Turnos**: bloques de 2 h de 08:00 a 20:00; no se permite doble reserva.
- **Rating**: al crear/editar/borrar una reseña se recalcula `rating_promedio` y `num_resenas`.
- **Especialista nuevo**: mensaje "en revisión (2-3 min)" → insignia 🛡️ Verificado.
- **Tasa de plataforma para el paciente**: $0.00.

## Capturas

_(agregar tras ejecutar los scripts PostgreSQL y `python app.py`)_

- [ ] Landing
- [ ] Directorio con filtros
- [ ] Ficha de especialista + reseñas
- [ ] Agendar → pasarela PayPal Mock → éxito + ticket
- [ ] Consultar / cancelar cita (visto verde)
- [ ] Panel admin
