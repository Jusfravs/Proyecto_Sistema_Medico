# Revisión del esquema de base de datos

**Fecha:** 2026-08-29  
**Alcance:** revisión de los scripts de `database/`, los modelos SQLAlchemy, la
configuración, las operaciones CRUD y las pruebas, más una inspección de solo
lectura de la instancia PostgreSQL configurada. Esta revisión no modifica el
esquema ni los datos.

## Resultado

El esquema cubre las cuatro entidades del MVP y protege en la base las reglas
de integridad más importantes. Todas las tablas tienen clave primaria, todas
las relaciones declaradas tienen clave foránea y los campos de dinero usan
`NUMERIC`. Las restricciones de dominio evitan estados y calificaciones no
válidos. La solución de `turno_activo` protege la reserva frente a solicitudes
concurrentes, incluso si la comprobación previa de Flask ocurre al mismo tiempo.

## Controles comprobados

| Área | Estado | Evidencia |
| --- | --- | --- |
| Claves primarias | Correcto | Las cuatro tablas usan `INTEGER ... IDENTITY PRIMARY KEY`. |
| Relaciones | Correcto | Tres FK con políticas `CASCADE` o `RESTRICT` explícitas. |
| Unicidad | Correcto | Correo, usuario del perfil, colegiatura, ticket y turno activo. |
| Valores de dominio | Correcto | `CHECK` para roles, coordenadas, precios, ratings, pagos y estados. |
| Índices de acceso | Correcto | Cubren directorio, consulta de citas, panel por estado y reseñas. |
| Dinero | Correcto | `precio_aprox` usa `NUMERIC(10,2)`. |
| Geolocalización | Correcto | Precisión decimal y límites válidos de latitud/longitud. |
| Datos demostrativos | Correcto | La carga comprueba la base y evita duplicar sus registros conocidos. |
| Migraciones | Pendiente | No existe historial versionado para actualizar bases ya instaladas. |

## Verificación ejecutada

La conexión nueva de la aplicación abrió la base `vectra_cure` y confirmó el
esquema `public` instalado:

| Tabla | Columnas observadas |
| --- | ---: |
| `usuarios` | 9 |
| `perfiles_medicos` | 17 |
| `citas` | 17 |
| `resenas` | 6 |

La inspección encontró las tres claves foráneas, las restricciones `CHECK`, las
restricciones únicas y los cuatro índices explícitos documentados. La suite
`python -m unittest discover -s tests -v` ejecutó 13 pruebas correctamente con
SQLite en memoria.

## Diferencias entre PostgreSQL y SQLAlchemy

`01_schema_postgresql.sql` es la fuente de verdad de producción. Los modelos son
compatibles para el uso actual, pero no generarían un esquema físicamente
idéntico mediante `db.create_all()`:

| Diferencia | SQL PostgreSQL | Modelo SQLAlchemy | Impacto |
| --- | --- | --- | --- |
| Fechas con zona horaria | `TIMESTAMPTZ` | `db.DateTime` sin `timezone=True` | Una creación desde el ORM perdería la semántica explícita de zona horaria. |
| Hora de cita | `CHAR(5)` | `String(5)` | Compatible para lectura/escritura; cambia el tipo físico al crear desde ORM. |
| Calificación | `SMALLINT` | `Integer` | Compatible en valores; usa distinto almacenamiento. |
| Orden de índices temporales | `fecha_creacion DESC` | Índices declarados sin `DESC` | PostgreSQL puede recorrer B-tree en sentido inverso, pero la definición no coincide. |
| Índices implícitos | Solo los definidos por SQL y las restricciones | Varios campos combinan `unique=True` o `index=True` | `create_all()` puede producir nombres o conjuntos de índices distintos. |

Mientras el equipo instale PostgreSQL con el script `01`, estas diferencias no
rompen la aplicación. Sí aumentan el riesgo de deriva si alguien crea tablas con
`db.create_all()` o convierte los modelos en migraciones automáticas.

## Riesgos y mejoras recomendadas

### Prioridad alta

1. **Adoptar migraciones versionadas.** El script `01` solo sirve para una
   instalación limpia. Añadir Alembic/Flask-Migrate o scripts reversibles evita
   cambios manuales imposibles de auditar.
2. **Alinear los modelos con los tipos PostgreSQL.** Declarar fechas con zona
   horaria, `hora` y `calificacion` con tipos equivalentes, y definir los índices
   con la misma forma que el SQL reduce la deriva futura.
3. **Verificar siempre una conexión nueva.** Después de cambiar credenciales o
   el esquema, una sesión ya abierta de pgAdmin no demuestra que Flask pueda
   autenticarse.

### Prioridad media

1. **Automatizar `fecha_actualizacion` en PostgreSQL.** El valor inicial tiene
   `DEFAULT`, pero las actualizaciones directas por SQL no cambian la columna.
   Hoy el ORM la actualiza mediante `onupdate`; un trigger cubriría todos los
   clientes.
2. **Proteger los agregados de reseñas.** `rating_promedio` y `num_resenas`
   dependen de que todas las escrituras pasen por Flask o por la semilla. Un
   trigger, una vista o una tarea de reconciliación evitaría desincronización.
3. **Definir la identidad del paciente.** Las citas y reseñas guardan datos
   libres y no referencian `usuarios`. Esto facilita el uso sin sesión, pero no
   permite demostrar autoría ni limitar una reseña por paciente/cita.
4. **Endurecer dominios que hoy valida Flask.** PostgreSQL no comprueba el
   formato `HH:MM`, el catálogo de especialidades ni que `password_hash` exista
   para cuentas activas.

### Prioridad baja

1. **Documentar la zona horaria operativa.** `TIMESTAMPTZ` almacena instantes,
   pero el equipo debe acordar si muestra las fechas en UTC o en
   `America/Guayaquil`.
2. **Ampliar la verificación.** `03_verificar_postgresql.sql` valida los objetos
   principales; puede incorporar tipos de columna, políticas de FK y la
   definición exacta de `turno_activo`.

## Criterio para futuros cambios

No edites solo `models.py` ni solo `01_schema_postgresql.sql`. Un cambio queda
completo cuando SQL, ORM, documentación, verificación y pruebas describen la
misma estructura. Antes de ejecutar una migración destructiva, pruébala sobre
una copia y prepara una reversión explícita.
