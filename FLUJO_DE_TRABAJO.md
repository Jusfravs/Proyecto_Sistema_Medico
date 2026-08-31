# Cómo trabajamos este proyecto

**Proyecto:** Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico
**Equipo:** Isaac Unapucha · Justin Cedeño
**Repositorio:** https://github.com/Jusfravs/Proyecto_Sistema_Medico
**Materia:** Diseño de Experiencia de Usuario e Interfaces (UX/UI) — PUCE

Este documento explica **cómo está armado el proyecto y cómo nos coordinamos
los dos** para trabajar al mismo tiempo sin pisarnos el trabajo. Léelo antes de
tu primer cambio.

---

## 1. Qué es cada parte

El proyecto tiene tres capas y cada una vive en su carpeta:

| Carpeta | Qué contiene | Responsable principal |
| :--- | :--- | :--- |
| `docs/` | Documentación UX, producto, diseño, arquitectura, informes y planes, organizada por dominio | Los dos |
| `database/` | Scripts SQL de PostgreSQL, esquema y su documentación | **Justin** |
| `vectra_cure/` | Aplicación web Flask: rutas, lógica, plantillas, estilos, pruebas | **Isaac** |
| `scripts/` | Automatizaciones auxiliares, como la creación del formulario de encuesta | Isaac |

**La frontera entre las dos capas es `vectra_cure/models.py`.** La app no define
tablas ni ejecuta `db.create_all()` en producción: consume los modelos que
corresponden al esquema que instala `database/01_schema_postgresql.sql`. El
contrato de esa frontera está escrito en
[`vectra_cure/CONTRATO_MODELOS.md`](vectra_cure/CONTRATO_MODELOS.md).

---

## 2. Stack

| Capa | Tecnología |
| :--- | :--- |
| Lenguaje | Python 3.13 |
| Framework web | Flask 3.1 + Jinja2 |
| ORM | Flask-SQLAlchemy 3.1 / SQLAlchemy 2.0 |
| Driver | **psycopg 3** (`psycopg[binary]`) — ya no se usa `psycopg2` |
| Base de datos | PostgreSQL 18 |
| Estilos | Bootstrap 5 (CDN) + `static/css/vectra.css` (tokens del doc 02) |
| Pruebas | `unittest` sobre SQLite en memoria |

Todo el proyecto es **Python**. No hay Java, Node ni frontend con framework.

---

## 3. Puesta en marcha (una sola vez por máquina)

### 3.0 VS Code — extensiones del proyecto

Trabajamos **todo dentro de VS Code**. Al abrir la carpeta del proyecto, VS Code
detecta el archivo `.vscode/extensions.json` y ofrece instalar las extensiones
del equipo con un solo clic (*"Install All"*). Si no aparece el aviso, ábrelas
con `Ctrl+Shift+X` y busca cada una:

| Extensión | ID | Para qué |
| :--- | :--- | :--- |
| Python | `ms-python.python` | Intérprete, ejecución y panel de pruebas |
| Pylance | `ms-python.vscode-pylance` | Autocompletado y análisis de tipos |
| Python Debugger | `ms-python.debugpy` | Depuración con F5 (lo usa `launch.json`) |
| Better Jinja | `samuelcolvin.jinjahtml` | Resaltado de las plantillas de `templates/` |
| Ruff | `charliermarsh.ruff` | Linter de Python |
| GitLens | `eamodio.gitlens` | Ver quién cambió cada línea |

La configuración compartida ya está en el repositorio y se aplica sola:

| Archivo | Qué define |
| :--- | :--- |
| `.vscode/settings.json` | Intérprete del venv, descubrimiento de pruebas, resaltado Jinja, autofetch de Git |
| `.vscode/launch.json` | Perfiles de F5: *"Flask (app.py)"* y *"Pruebas (unittest)"* |
| `.vscode/extensions.json` | Las extensiones de la tabla de arriba |
| `vectra_cure/ruff.toml` | Reglas del linter |

> **El formateo automático al guardar está desactivado a propósito.** Si se
> activa, reformatea archivos completos y genera conflictos enormes cuando los
> dos trabajamos sobre lo mismo.

**Seleccionar el intérprete** (solo si VS Code no lo toma solo): `Ctrl+Shift+P`
→ *Python: Select Interpreter* → elige el que dice
`.\vectra_cure\venv\Scripts\python.exe`.

### 3.1 Clonar y crear el entorno

```powershell
git clone https://github.com/Jusfravs/Proyecto_Sistema_Medico.git
cd Proyecto_Sistema_Medico\vectra_cure

python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

> Si ya tenías el proyecto con `psycopg2-binary`, desinstálalo y reinstala:
> `pip uninstall -y psycopg2-binary && pip install -r requirements.txt`

### 3.2 Configurar la conexión

```powershell
copy .env.example .env
```

Abre `vectra_cure\.env` y pon **tu** contraseña de PostgreSQL:

```env
SECRET_KEY=vectra-cure-clave-desarrollo-2026
APP_DEBUG=true

DB_DIALECT=postgresql+psycopg
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vectra_cure
```

> ⚠️ **`.env` nunca se sube al repositorio** (está en `.gitignore`). Cada quien
> tiene el suyo con su propia contraseña. Si `.env` falta o le faltan variables,
> la app se detiene con un mensaje claro en vez de arrancar mal configurada.

### 3.3 Cargar la base de datos

Los scripts están en `database/` y se ejecutan **en orden**. Se pueden correr
desde pgAdmin 4 o desde la terminal con `psql`.

**Opción A — línea de comandos** (desde la raíz del proyecto):

```powershell
$env:PGPASSWORD = "tu_contraseña_de_postgres"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

& $psql -U postgres -h localhost -d postgres     -f database\00_create_database_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure  -f database\01_schema_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure  -f database\02_seed_demo_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure  -f database\03_verificar_postgresql.sql
```

**Opción B — pgAdmin 4** (viene incluido con la instalación de PostgreSQL 18):
sigue el instructivo de [`database/README.md`](database/README.md). Abre una
*Query Tool* cuya conexión indique `vectra_cure/postgres@PostgreSQL 18` y
ejecuta los archivos en orden.

> ⚠️ El script `01_schema_postgresql.sql` se ejecuta **una sola vez**. Si ya
> cargaste el esquema y lo vuelves a correr, falla porque las tablas ya existen.
> Los que sí puedes repetir son `02_seed_demo` (está escrito para reejecutarse)
> y `03_verificar`.

El script `03_verificar` debe listar **4 tablas** sin lanzar excepciones:

```
 entidad          | registros
------------------+-----------
 citas            |         8
 perfiles_medicos |         6
 resenas          |         8
 usuarios         |        12
```

### 3.4 Ejecutar

```powershell
cd vectra_cure
python app.py          # http://127.0.0.1:5000
```

O en VS Code: **F5** → *"Vectra Cure — Flask (app.py)"*.

### 3.5 Cuentas de prueba

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@vectra.demo` | `admin123` |
| Especialista | `medico0@vectra.demo` … `medico5@vectra.demo` | `medico123` |
| Paciente | `paciente0@vectra.demo` … `paciente4@vectra.demo` | `paciente123` |

---

## 4. Cómo nos coordinamos en Git

### 4.1 La regla

**Cada quien trabaja en su propia rama. Nadie hace `push` directo a `main`.**

```
main        ← rama estable. Solo cambia por Pull Request aprobado.
 ├── isaac  ← rama de Isaac
 └── justin ← rama de Justin
```

Así los dos podemos trabajar al mismo tiempo: tus cambios no rompen los míos
mientras están en tu rama, y al unirlos revisamos qué entra.

### 4.2 Crear tu rama (una sola vez)

```bash
git checkout main
git pull origin main
git checkout -b justin        # o el nombre que uses
```

### 4.3 El día a día

**Antes de empezar a trabajar** — trae lo que hizo el otro:

```bash
git checkout justin
git fetch origin
git merge origin/main
```

**Mientras trabajas** — guarda avances pequeños y frecuentes:

```bash
git add -A
git commit -m "feat: descripción de lo que hiciste"
```

**Cuando terminas algo** — súbelo a **tu** rama:

```bash
git push -u origin justin
```

Después, en GitHub aparece el botón **"Compare & pull request"**. Ábrelo,
describe qué cambiaste y avísale al otro para que lo revise antes de unir.

### 4.4 Mensajes de commit

Usamos prefijos para que el historial se entienda de un vistazo:

| Prefijo | Para qué |
| :--- | :--- |
| `feat:` | Funcionalidad nueva |
| `fix:` | Corrección de un error |
| `docs:` | Documentación |
| `refactor:` | Reorganizar código sin cambiar comportamiento |
| `test:` | Pruebas |
| `chore:` | Configuración, dependencias, mantenimiento |

Ejemplo: `feat: filtro de especialistas por horario disponible`

### 4.5 Si hay conflicto

Pasa cuando los dos editamos las mismas líneas. Git marca el archivo así:

```
<<<<<<< HEAD
tu versión
=======
la versión del otro
>>>>>>> main
```

Se resuelve **hablando**, no borrando lo del otro: decidan cuál queda (o cómo
se combinan), borren las marcas `<<<<`, `====`, `>>>>`, y luego:

```bash
git add archivo_en_conflicto
git commit
```

---

## 5. Ver el trabajo del otro

**Nos sincronizamos solo con Git, subiendo seguido.** No usamos edición en
tiempo real: cada quien trabaja en su rama y sube avances pequeños y frecuentes
para que el otro los tenga disponibles pronto.

Git es un sistema de *tirar*, no de *empujar*: nada llega solo a la máquina del
otro. Siempre hay que traerlo con `fetch` o `pull`. Eso es una ventaja, no una
limitación — nadie te sobrescribe el archivo que estás editando.

### 5.1 La costumbre: subir seguido

En lugar de guardar todo el trabajo de un día en un solo commit gigante:

```bash
# cada vez que terminas algo que funciona (aunque sea pequeño)
git add -A
git commit -m "feat: descripción corta"
git push
```

Mientras más seguido subas, menos conflictos hay y más rápido ve el otro tu
avance. Un commit por cada cosa que funcione es mejor que uno por día.

### 5.2 Cómo te avisa VS Code

En `.vscode/settings.json` está activado `git.autofetch` cada 120 segundos:

```
El otro hace push
      ↓  (máximo 2 minutos después)
En la barra inferior de VS Code aparece:   ↓1  isaac*
      ↓  (haces clic en esa flecha)
Se descargan sus cambios
```

VS Code **avisa** solo, pero **no aplica** nada automáticamente — y así debe
ser: si Git trajera cambios mientras estás escribiendo, sobrescribiría trabajo o
te dejaría conflictos a medio archivo.

> Existen extensiones que hacen `pull` automático. **No conviene usarlas** con
> dos personas trabajando a la vez: es la forma más rápida de perder trabajo.

### 5.3 Ver qué hizo el otro sin mezclarlo aún

A veces solo quieres **mirar** su avance antes de traerlo a tu rama:

```bash
git fetch origin                          # baja la información, no cambia tus archivos

git log origin/justin --oneline -10       # sus últimos commits
git diff main..origin/justin --stat       # qué archivos tocó y cuánto
git diff main..origin/justin              # el detalle línea por línea
```

Ninguno de esos comandos modifica lo que tienes abierto.

**Desde VS Code**, sin escribir comandos: abre el panel de Control de código
fuente (`Ctrl+Shift+G`) → sección **Branches / Remotes** → despliega la rama del
otro y revisa sus commits. Con **GitLens** instalado también puedes abrir un
archivo y ver, línea por línea, quién la escribió y cuándo.

### 5.4 Traer su trabajo a tu rama

Cuando ya quieres incorporar lo suyo:

```bash
git checkout isaac                # tu rama
git fetch origin
git merge origin/main             # si su trabajo ya se aprobó en main
# o bien, para probar directamente su rama:
git merge origin/justin
```

Si aparece un conflicto, resuélvelo como se explica en la sección 4.5.

### 5.5 Ver la aplicación corriendo

Cada quien la corre en su propia máquina:

```powershell
cd vectra_cure
venv\Scripts\activate
python app.py          # http://127.0.0.1:5000
```

Cada uno tiene su propia base PostgreSQL local con los mismos datos
demostrativos, así que ven lo mismo aunque las bases sean independientes. Si uno
cambia el esquema, el otro debe volver a cargar los scripts de `database/`
(sección 6.1).

---

## 6. Reglas de convivencia del código

### 6.1 Cambios en el modelo de datos

Si se agrega o cambia una columna, hay que actualizar **todo esto junto**, en un
mismo Pull Request:

1. `database/01_schema_postgresql.sql` — la fuente de verdad del esquema
2. `vectra_cure/models.py` — el modelo SQLAlchemy equivalente
3. `database/ESQUEMA_Y_CONTEXTO.md` — la documentación
4. `database/03_verificar_postgresql.sql` — la verificación
5. `vectra_cure/tests/test_app.py` — las pruebas afectadas

Si solo se cambia uno, la app y la base quedan desalineadas y el otro se
encuentra con errores raros.

### 6.2 Qué no se sube nunca

Ya está cubierto por `.gitignore`, pero para tenerlo claro:

- `.env` → contiene contraseñas
- `venv/` → cada quien crea el suyo
- `*.db` → bases locales
- `__pycache__/`, `*.pyc`
- `vectra_cure/static/uploads/*` → imágenes que suban los usuarios

### 6.3 Dónde va cada cosa

| Si vas a… | Toca este archivo |
| :--- | :--- |
| Agregar una ruta o pantalla | `vectra_cure/app.py` + una plantilla en `templates/` |
| Cambiar una regla de negocio (pago, ticket, rating, distancia) | `vectra_cure/logica.py` |
| Cambiar un valor fijo (especialidades, horarios, estados, motivos) | `vectra_cure/constantes.py` |
| Cambiar colores, tipografía o espaciados | `vectra_cure/static/css/vectra.css` |
| Cambiar permisos por rol | `vectra_cure/auth.py` |
| Cambiar el esquema | `database/` (ver 6.1) |

**La lógica de negocio no va en `models.py`.** Los modelos son solo estructura
(columnas y relaciones); el comportamiento vive en `logica.py`. Eso permite que
las dos capas evolucionen sin estorbarse.

---

## 7. Antes de abrir un Pull Request

Corre las pruebas. Son 13 y usan SQLite en memoria, así que **no tocan tu
PostgreSQL**:

```powershell
cd vectra_cure
python -m unittest discover -s tests -v
```

Debe terminar en `OK`. Si algo falla, arréglalo antes de pedir la revisión.

> Una de las pruebas (`test_esquema_faltante_no_expone_el_depurador`) borra las
> tablas a propósito para comprobar que la app responde 503 sin filtrar trazas
> de SQL. Los mensajes de error que imprime en consola son esperados.

También vale la pena revisar a mano el recorrido completo: buscar especialista →
agendar → pagar → descargar ticket → consultar cita → cancelar.

---

## 8. Estado actual del proyecto

Lo que ya está funcionando y verificado contra PostgreSQL 18:

- **CRUD completo** de las 4 entidades (`Usuario`, `PerfilMedico`, `Cita`, `Resena`)
- **Directorio** con filtros por especialidad y orden por calificación / distancia / precio
- **Agendamiento** en 2 pasos con pasarela PayPal Mock simulada y pago en ventanilla
- **Ticket `.md`** descargable con formato de recibo (doc 03 §4)
- **Consulta y cancelación** de cita con los 5 motivos y reverso simulado
- **Registro** de paciente y de especialista (con insignia 🛡️ verificado)
- **Panel de administración** con gestión de especialistas, citas, reseñas y usuarios
- **Control de acceso por roles** (`paciente` / `medico` / `admin`)
- 13 pruebas automatizadas en verde

### Lo que falta / se puede mejorar

- [ ] Capturas de pantalla para el `README.md` (las pide la actividad)
- [ ] Mapa interactivo real (hoy es una representación estática; la distancia sí se calcula con haversine)
- [ ] Galería de fotos del consultorio subida por el especialista
- [ ] Revisar responsive en pantallas de celular
- [ ] Estado vacío del directorio con ampliación de radio (5 / 8 / 10 km)

---

## 9. Resumen para el día a día

```bash
# Empezar
git checkout justin && git fetch origin && git merge origin/main

# ... trabajar ...

# Guardar
git add -A && git commit -m "feat: lo que hiciste"

# Compartir
git push -u origin justin
# → abrir Pull Request en GitHub y avisar al otro
```

Si algo no arranca, revisa en este orden: ¿está activo el `venv`? ¿existe
`.env` con la contraseña? ¿está corriendo el servicio de PostgreSQL? ¿corriste
los scripts de `database/`?
