# Base de datos de Vectra Cure

Esta carpeta contiene la definición, los datos demostrativos, la verificación y
la documentación de la base PostgreSQL usada por la aplicación Flask.

## Documentos

| Archivo | Propósito |
| --- | --- |
| [`ESQUEMA_Y_CONTEXTO.md`](ESQUEMA_Y_CONTEXTO.md) | Explica el modelo relacional, las tablas, las relaciones, las restricciones, los índices y las decisiones de diseño. |
| [`REVISION_ESQUEMA.md`](REVISION_ESQUEMA.md) | Registra la revisión del SQL frente a los modelos SQLAlchemy y enumera mejoras pendientes. |

## Scripts y orden de ejecución

| Orden | Archivo | Conexión requerida | Acción |
| --- | --- | --- | --- |
| 0 | `00_create_database_postgresql.sql` | Base de mantenimiento `postgres` | Crea la base `vectra_cure`. Se omite si ya existe. |
| 1 | `01_schema_postgresql.sql` | Base `vectra_cure` | Crea las cinco tablas, claves, restricciones e índices. Se ejecuta una sola vez. |
| 2 | `02_seed_demo_postgresql.sql` | Base `vectra_cure` | Inserta o actualiza los datos demostrativos. Puede repetirse. |
| 3 | `03_verificar_postgresql.sql` | Base `vectra_cure` | Comprueba la base activa, las tablas, restricciones, índices y conteos. |

## Instalación en pgAdmin 4

1. Conéctate a la base de mantenimiento `postgres` y ejecuta
   `00_create_database_postgresql.sql`. Omite este paso si `vectra_cure` existe.
2. Abre una Query Tool cuya conexión indique
   `vectra_cure/postgres@PostgreSQL 18`.
3. Ejecuta una sola vez `01_schema_postgresql.sql`.
4. Ejecuta `02_seed_demo_postgresql.sql` para cargar los datos demostrativos.
5. Ejecuta `03_verificar_postgresql.sql`. Debe listar cinco tablas y no debe
   generar excepciones.
6. Copia `vectra_cure/.env.example` como `vectra_cure/.env`, configura las
   credenciales de PostgreSQL e inicia Flask.

No ejecutes los archivos `01`, `02` o `03` conectado a otra base. No subas
`.env` al repositorio: contiene la contraseña del servidor.

## Fuente de verdad

`01_schema_postgresql.sql` es la fuente de verdad para crear PostgreSQL. El
archivo `vectra_cure/models.py` representa el mismo dominio para SQLAlchemy y
para las pruebas con SQLite. La aplicación no llama `db.create_all()` en
producción; el esquema PostgreSQL se instala manualmente con estos scripts.

Todo cambio estructural debe actualizar, como mínimo:

1. el script o migración SQL correspondiente;
2. `vectra_cure/models.py`;
3. `ESQUEMA_Y_CONTEXTO.md`;
4. `03_verificar_postgresql.sql`;
5. las pruebas afectadas.

## Credenciales demostrativas

Estas cuentas solo pertenecen a la semilla local.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@vectra.demo` | `admin123` |
| Especialista | `medico0@vectra.demo` a `medico5@vectra.demo` | `medico123` |
| Paciente | `paciente0@vectra.demo` a `paciente4@vectra.demo` | `paciente123` |
# Nota de instalación V2

Una instalación nueva ejecuta `01_schema_postgresql.sql`, `02_seed_demo_postgresql.sql`
y `03_verificar_postgresql.sql`. Ahora son cinco tablas: se añade
`disponibilidades_medicas` y cada cita pertenece a un paciente autenticado.

Para una base creada antes de V2 no se repite `01`: ejecutar una sola vez
`04_migracion_v2_postgresql.sql`, repetir la semilla y terminar con la
verificación. La migración se detiene sin modificar la restricción final si una
cita no puede asociarse mediante su correo a una cuenta paciente.
