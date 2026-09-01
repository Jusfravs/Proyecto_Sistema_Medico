# Guía: migrar tu PostgreSQL local a V2 (con o sin Codex)

Esta guía es para que **cualquier integrante del equipo** deje su base
`vectra_cure` local al día con la versión V2 de la aplicación, sin perder datos.
Incluye una sección final con instrucciones concretas para hacerlo **asistido por
Codex CLI**.

> Si ya te funcionan `/directorio` y el flujo completo de agendar cita, **no
> necesitas hacer nada**. Esta guía solo aplica a bases creadas antes de V2.

---

## 1. ¿Cómo sé si tengo que migrar?

Síntoma típico: al abrir `http://127.0.0.1:5000/directorio` (o justo después de
registrarte como paciente) aparece:

> **El servicio está temporalmente no disponible.**

Eso **no es un problema de CSS**. Es el manejador de errores de base de datos de
Flask (`@app.errorhandler(SQLAlchemyError)` en `vectra_cure/app.py`) que se
dispara porque tu esquema es **V1** y le falta:

- la tabla `disponibilidades_medicas`, y
- la columna `citas.paciente_usuario_id` (con su clave foránea).

La app V2 espera **5 tablas**: `usuarios`, `perfiles_medicos`,
`disponibilidades_medicas`, `citas`, `resenas`.

### Diagnóstico rápido (sin modificar nada)

Desde la raíz del repo, con el entorno virtual activo:

```bash
python scripts/migrar_db.py --check
```

Salida esperada si estás en V1 (mira las casillas sin `x`):

```
Estado actual del esquema:
  [x] usuarios
  [x] perfiles_medicos
  [ ] disponibilidades_medicas
  [x] citas
  [x] resenas
  [ ] citas.paciente_usuario_id
```

Si todas las casillas tienen `[x]`, ya estás en V2 y puedes cerrar esta guía.

---

## 2. Requisitos previos

| Requisito | Cómo comprobarlo |
| --- | --- |
| PostgreSQL 18 corriendo y la base `vectra_cure` creada | Te conectas desde pgAdmin 4 |
| Repo actualizado | `git switch main && git pull` (o la rama que uses) |
| Entorno virtual con dependencias | `vectra_cure/venv` existe; si no: ver §2.1 |
| Archivo `vectra_cure/.env` configurado con tu contraseña de Postgres | `cat vectra_cure/.env` muestra `DATABASE_URL=` o las `DB_*` |

### 2.1. Crear el entorno virtual (si no lo tienes)

```bash
cd vectra_cure
python -m venv venv
./venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# source venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
cd ..
```

### 2.2. Configurar `.env` (si no lo tienes)

```bash
cp vectra_cure/.env.example vectra_cure/.env
```

Edita `vectra_cure/.env` y descomenta **una** de las dos opciones:

```ini
# Opción A (recomendada): una sola línea
DATABASE_URL=postgresql+psycopg://postgres:TU_CLAVE@localhost:5432/vectra_cure

# Opción B: piezas sueltas
DB_DIALECT=postgresql+psycopg
DB_USER=postgres
DB_PASSWORD=TU_CLAVE
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vectra_cure
```

> ⚠️ **`vectra_cure/.env` NUNCA se sube al repositorio** (está en `.gitignore`).
> Contiene la contraseña del servidor. No lo pegues en chats, issues ni prompts.

---

## 3. Migrar — Opción A: el asistente (recomendado)

Un solo comando. Lee `vectra_cure/.env`, así que **no expone la contraseña** y no
hace falta abrir pgAdmin.

```bash
# 1. Diagnóstico (no modifica nada)
python scripts/migrar_db.py --check

# 2. Aplica la migración V1 -> V2 + verificación
python scripts/migrar_db.py
```

Lo que hace internamente `python scripts/migrar_db.py` (modo por defecto):

1. Se conecta a la base de `.env` y muestra su nombre y versión.
2. Si el esquema ya está completo → *"El esquema ya esta en V2. Nada que migrar."*
3. Si falta algo → ejecuta `database/04_migracion_v2_postgresql.sql`.
4. Ejecuta `database/03_verificar_postgresql.sql` y muestra el resumen.

Salida final esperada:

```
-> Ejecutando 04_migracion_v2_postgresql.sql ...
   04_migracion_v2_postgresql.sql aplicado.

-> Ejecutando 03_verificar_postgresql.sql ...
   03_verificar_postgresql.sql aplicado.

Listo. Reinicia el servidor Flask y recarga la pagina.
```

### Modos disponibles

| Comando | Cuándo usarlo |
| --- | --- |
| `python scripts/migrar_db.py --check` | Solo diagnóstico. No modifica nada. |
| `python scripts/migrar_db.py` | Migración V1 → V2 conservando tus datos. |
| `python scripts/migrar_db.py --fresh` | Reinstala **todo** desde cero: `01_schema` + `02_seed_demo` + `03_verificar`. **Borra y recrea** las tablas del esquema. Úsalo solo si no te importan tus datos de prueba. |

---

## 4. Migrar — Opción B: manual en pgAdmin 4

Si prefieres verlo paso a paso o el asistente no puede conectarse:

1. Abre **pgAdmin 4** y conéctate al servidor **PostgreSQL 18**.
2. En el árbol de la izquierda: `Databases` → **`vectra_cure`** (verifica que sea
   esa y no `postgres`).
3. Clic derecho en `vectra_cure` → **Query Tool**.
4. Abre el archivo `database/04_migracion_v2_postgresql.sql` (botón de carpeta) y
   ejecútalo (**F5**). Debe terminar con `COMMIT` y sin errores.
5. Abre `database/03_verificar_postgresql.sql` y ejecútalo (**F5**).
   - En la pestaña *Data Output* deben aparecer **5 filas de tablas**:
     `citas`, `disponibilidades_medicas`, `perfiles_medicos`, `resenas`,
     `usuarios`.
   - No debe lanzar ninguna excepción (`RAISE EXCEPTION`).
6. Reinicia Flask y recarga el navegador con **Ctrl + Shift + R**.

### Reinstalar desde cero (equivalente a `--fresh`)

Solo si quieres empezar limpio y **perder los datos actuales**:

```sql
-- En una Query Tool conectada a vectra_cure
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Luego ejecuta en orden: `01_schema_postgresql.sql` → `02_seed_demo_postgresql.sql`
→ `03_verificar_postgresql.sql`.

---

## 5. Qué cambia exactamente (referencia)

Todo proviene de `database/04_migracion_v2_postgresql.sql`, que es **idempotente**
(se puede correr varias veces sin daño) y **no destructivo**.

| Cambio | Efecto |
| --- | --- |
| `ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_usuario_id INTEGER` | Nueva columna en `citas`. |
| `UPDATE citas ... SET paciente_usuario_id = u.id` | Vincula cada cita existente a la cuenta paciente cuyo correo coincide (`lower(email)`). |
| `RAISE EXCEPTION` si queda alguna cita sin vincular | **Corta la migración sin aplicar cambios** si hay una cita con un `paciente_email` que no corresponde a ninguna cuenta `rol = 'paciente'`. Ver §6. |
| `ALTER COLUMN paciente_usuario_id SET NOT NULL` | La columna pasa a ser obligatoria. |
| `ADD CONSTRAINT fk_citas_paciente_usuario` | Clave foránea `citas.paciente_usuario_id → usuarios.id` (`ON DELETE RESTRICT`). |
| `CREATE INDEX ix_citas_paciente_fecha` | Índice `(paciente_usuario_id, fecha)`. |
| `CREATE TABLE IF NOT EXISTS disponibilidades_medicas` | Tabla nueva: franjas horarias por especialista y día. |
| `CREATE INDEX ix_disponibilidad_perfil_dia_activo` | Índice de la tabla nueva. |
| `INSERT INTO disponibilidades_medicas ... CROSS JOIN (VALUES ...)` | Siembra horario demo para **cada** perfil: Lun–Vie 08:00–18:00, Sáb 09:00–13:00. `ON CONFLICT DO NOTHING`. |

No se modifica ninguna otra tabla, ni se borra ningún dato (salvo que tú corras
`--fresh` o el `DROP SCHEMA` manual).

---

## 6. Problemas frecuentes

### `RAISE EXCEPTION: Hay citas sin paciente_usuario_id`

La migración encontró una o más citas cuyo `paciente_email` no coincide con
ninguna cuenta de paciente. La transacción **se revierte entera** (no queda a
medias).

Diagnóstico — ejecuta en pgAdmin (Query Tool sobre `vectra_cure`):

```sql
SELECT id, codigo_ticket, paciente_email
FROM citas
WHERE lower(paciente_email) NOT IN (
  SELECT lower(email) FROM usuarios WHERE rol = 'paciente'
);
```

Opciones para cada fila que aparezca:

- **Es basura de pruebas** → bórrala:
  `DELETE FROM citas WHERE id = <ID>;`
- **Es una cita real** → crea la cuenta de paciente con ese correo (regístrate en
  la app con ese email) y vuelve a correr la migración.

Después repite `python scripts/migrar_db.py`.

> Nota histórica: en la base de Isaac había 1 cita basura (`VC-2026-1055`,
> `skjddasas@gmail.com`) que hubo que borrar antes de migrar.

### `Faltan variables en vectra_cure/.env`

No configuraste `.env`. Ver §2.2.

### `connection refused` / `password authentication failed`

- PostgreSQL no está corriendo, o
- el host/puerto/usuario/clave de `.env` no coinciden con tu servidor.
  Confírmalos conectándote primero desde pgAdmin.

### Sigo viendo "temporalmente no disponible" después de migrar

1. Reinicia el servidor Flask (Ctrl + C y vuelve a `python app.py`).
2. Recarga con **Ctrl + Shift + R** (caché del navegador).
3. Confirma el esquema: `python scripts/migrar_db.py --check` → todo con `[x]`.

### La página no cambia tras `git pull` (aunque el código sí cambió)

Es caché, no la base de datos:

- Con `APP_DEBUG=false` (por defecto) Flask **no recarga** plantillas
  automáticamente → reinicia el servidor.
- El navegador cachea `vectra.css` → **Ctrl + Shift + R**.
- Para desarrollo, añade `APP_DEBUG=true` a tu `vectra_cure/.env` local (ese
  archivo no se sube, así que no afecta a nadie más).

---

## 7. Verificación final (checklist)

```bash
# 1. Esquema completo
python scripts/migrar_db.py --check          # 5 tablas + citas.paciente_usuario_id, todo [x]

# 2. Pruebas en verde (usan SQLite, no tu Postgres)
cd vectra_cure
./venv/Scripts/python.exe -m unittest discover -s tests   # Windows
cd ..

# 3. La app arranca y el directorio carga
cd vectra_cure && python app.py
#   -> abre http://127.0.0.1:5000/directorio  (sin error 503)
#   -> registra un paciente, agenda una cita, revisa /mis-citas
```

Cuentas demo (solo si corriste `02_seed_demo` o `--fresh`):

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@vectra.demo` | `admin123` |
| Especialista | `medico0@vectra.demo` … `medico5@vectra.demo` | `medico123` |
| Paciente | `paciente0@vectra.demo` … `paciente4@vectra.demo` | `paciente123` |

---

## 8. Hacerlo con ayuda de Codex CLI

[Codex CLI](https://github.com/openai/codex) es el agente de terminal de OpenAI.
Puede correr los comandos de esta guía por ti, leer las salidas y decidir el
siguiente paso. **Tú apruebas cada acción.**

### 8.1. Instalar Codex

```bash
npm install -g @openai/codex
# o:  brew install codex
codex --version
codex login        # inicia sesión con tu cuenta de OpenAI (abre el navegador)
```

### 8.2. Reglas de seguridad para esta tarea

Dile a Codex explícitamente, y verifícalo tú:

- **No leer, imprimir, editar ni commitear `vectra_cure/.env`.** Contiene la
  contraseña de PostgreSQL. Los scripts ya lo leen solos.
- **No hacer `git commit` ni `git push`.** Esta migración es local; no genera
  cambios de código que subir.
- **No usar `--fresh` ni `DROP SCHEMA`** salvo que tú lo pidas: borran datos.
- Trabaja en modo aprobación (`--ask-for-approval` / el modo por defecto), no en
  `--full-auto`, para revisar cada comando SQL antes de que corra.

### 8.3. Arrancar Codex en el repo

```bash
cd "ruta/a/Proyecto Sistema Medico"
codex
```

### 8.4. Prompt inicial (cópialo tal cual)

```
Contexto: este repo es una app Flask (carpeta vectra_cure/) con PostgreSQL
(carpeta database/). Mi base local está en el esquema V1 y la app V2 falla con
"El servicio está temporalmente no disponible" en /directorio.

Sigue la guía database/GUIA_MIGRACION_CON_CODEX.md. Tarea:

1. Lee database/GUIA_MIGRACION_CON_CODEX.md y database/README.md.
2. Comprueba que existe vectra_cure/.env. NO muestres su contenido ni lo edites.
3. Ejecuta:  python scripts/migrar_db.py --check
   y muéstrame la salida.
4. Si faltan tablas o columnas, ejecuta:  python scripts/migrar_db.py
   Enséñame el SQL / la salida antes y después.
5. Si aparece "Hay citas sin paciente_usuario_id", NO fuerces nada: sigue la
   sección 6 de la guía, muéstrame las filas problemáticas y espera mi decisión.
6. Al terminar, corre las pruebas:
   cd vectra_cure && ./venv/Scripts/python.exe -m unittest discover -s tests
7. Resume qué cambió en la base.

Restricciones: no toques vectra_cure/.env, no hagas git commit ni git push, no
uses --fresh ni DROP SCHEMA.
```

### 8.5. Si Codex reporta citas huérfanas

Prompt de seguimiento:

```
Muéstrame el resultado de esta consulta usando el mismo DSN que scripts/migrar_db.py
(sin imprimir la contraseña):

SELECT id, codigo_ticket, paciente_email
FROM citas
WHERE lower(paciente_email) NOT IN (
  SELECT lower(email) FROM usuarios WHERE rol = 'paciente'
);

Para cada fila dime si parece dato de prueba o cita real. No borres nada todavía.
```

Luego, según lo que veas, le indicas a Codex borrar las filas basura
(`DELETE FROM citas WHERE id = ...`) o registrar las cuentas faltantes, y repetir
`python scripts/migrar_db.py`.

### 8.6. Verificación que le puedes pedir a Codex al final

```
Confirma el estado final:
- python scripts/migrar_db.py --check   (todas las casillas en [x])
- arranca la app (cd vectra_cure && python app.py) y dime si /directorio
  responde 200 en vez de 503; luego deténla.
- pégame el resumen de conteos de las 5 tablas.
```

---

## 9. Referencias

- `database/README.md` — instalación completa y orden de scripts.
- `database/ESQUEMA_Y_CONTEXTO.md` — modelo relacional y decisiones de diseño.
- `database/04_migracion_v2_postgresql.sql` — el SQL exacto de la migración.
- `scripts/migrar_db.py` — el asistente.
- `vectra_cure/models.py` — los modelos SQLAlchemy equivalentes.
- `FLUJO_DE_TRABAJO.md` — rama `isaac` + Pull Request para cambios de código.
